import { CELL_SIZE, DDGREEN, HEIGHT, WIDTH } from "./const"
import { keys } from "./core/input"
import {
    isCollision,
    isWinBlock,
    isLoseBlock,
    isCollectible,
    collectItem,
    allCollectiblesCollected,
    getCollectibles,
    getRenderables,
    restoreGameState,
} from "./level"
import { cam } from "./camera"
import {
    startTransitionAnimation,
    isTransitioning,
} from "./transition-animation"
import {
    emitParticles,
    createParticleSystem,
    updateParticles,
    renderParticles,
    ParticleSystem,
} from "./particle-system"
import {
    createTimer,
    startTimer,
    updateTimer,
    isTimerActive,
    resetTimer,
} from "./core/timer"
import { saveGameState, undoLastMove as undoLastGameMove } from "./undo-system"
import { EASEOUTQUAD, THERENBACK, lerp, randInt } from "./core/math"
import { Scene, setScene } from "./scene-manager"
import { markLevelCompleted } from "./core/localstorage"
import { getCurrentLevel } from "./level-manager"

const MOVE_SPEED = 0.005
const FALL_SPEED = 0.008
const GROUND_OFFSET = 20

const FACE_SIZE = 60
const FACE_ROUNDNESS = 5

const EAR_HEIGHT = 10
const EAR_WIDTH = 27

const BREATH_SPEED = 3000

const TAIL_SIZE = 30
const TAIL_CURVE_AMOUNT = 10

type Rect = {
    // position
    x: number
    y: number
    // direction of next movement
    dx: number
    dy: number
}

let playerRects: Rect[] = [{ x: 0, y: 0, dx: 0, dy: 0 }]

const hideTimer = createTimer(900)
const blinkTimer = createTimer(2000)
const tailSpeedTimer = createTimer(4000)

let isMoving = false
let isFalling = false
let invertTail = false
let moveProgress = 0
let blinkProgress = 1
let breathTime = 0
let tailMoveTime = 0
let tailMoveSpeed = tailSpeedTimer.duration
let particles: ParticleSystem

export const initPlayer = (rects: Rect[] = [{ x: 0, y: 0, dx: 0, dy: 0 }]) => {
    playerRects = rects.map((rect) => ({ ...rect, dx: 0, dy: 0 }))
    isMoving = false
    isFalling = false
    moveProgress = 0
    blinkProgress = 1
    breathTime = 0
    tailMoveTime = 0
    particles = createParticleSystem()
    startTimer(blinkTimer)
    startTimer(tailSpeedTimer)
    startTransitionAnimation(WIDTH / 2, HEIGHT / 2, true, DDGREEN)
}

const playerAtPos = (x: number, y: number) => {
    return playerRects.some((r) => r.x === x && r.y === y)
}

const savePlayerState = () => {
    const playerState = playerRects.map((rect) => ({
        x: rect.x,
        y: rect.y,
    }))
    saveGameState(playerState, getCollectibles(), getRenderables())
}

const undoLastMove = () => {
    const state = undoLastGameMove()
    if (state) {
        playerRects = state.playerRects.map((rect) => ({
            ...rect,
            dx: 0,
            dy: 0,
        }))
        restoreGameState(state.collectibles, state.renderables)
    }
}

const handleExpand = (dirX: number, dirY: number) => {
    const head = playerRects[0]
    savePlayerState()
    playerRects.unshift({ x: head.x, y: head.y, dx: dirX, dy: dirY })
    isMoving = true
}

const handleMove = (dirX: number, dirY: number) => {
    savePlayerState()
    isMoving = true
    moveProgress = 0
    // store directions for all rects
    playerRects[0].dx = dirX
    playerRects[0].dy = dirY
    for (let i = 1; i < playerRects.length; i++) {
        const rect = playerRects[i]
        const prevRect = playerRects[i - 1]
        rect.dx = prevRect.x - rect.x
        rect.dy = prevRect.y - rect.y
    }
}

const handleDirectionInput = (dirX: number, dirY: number) => {
    const head = playerRects[0]
    const newRectX = head.x + dirX
    const newRectY = head.y + dirY
    // only allow if there is nothing colliding at target position
    if (!isCollision(newRectX, newRectY) && !playerAtPos(newRectX, newRectY)) {
        if (isCollectible(newRectX, newRectY)) {
            collectItem(newRectX, newRectY)
            handleExpand(dirX, dirY)
        } else {
            handleMove(dirX, dirY)
        }
    }
}

export const updatePlayer = (dt: number) => {
    // Don't update further when scene is transitioning
    if (isTransitioning()) {
        return
    }

    // Update particles
    updateParticles(particles, dt)

    // Update timers
    breathTime += dt / BREATH_SPEED
    tailMoveTime += dt / tailMoveSpeed
    updateTimer(hideTimer, dt)
    if (updateTimer(blinkTimer, dt)) {
        resetTimer(blinkTimer, randInt(500, 7000))
        blinkProgress = 0
    }
    if (blinkProgress < 1) {
        blinkProgress += dt * 0.01
    } else {
        blinkProgress = 1
    }
    if (updateTimer(tailSpeedTimer, dt)) {
        resetTimer(tailSpeedTimer, randInt(200, 5000))
        tailMoveSpeed = tailSpeedTimer.duration
    }

    const isAnimating = isMoving || isFalling

    // Only allow movement if not currently moving or falling
    if (!isAnimating) {
        if (keys.btnp.up) {
            handleDirectionInput(0, -1)
        } else if (keys.btnp.dn) {
            handleDirectionInput(0, +1)
        } else if (keys.btnp.lf) {
            handleDirectionInput(-1, 0)
        } else if (keys.btnp.rt) {
            handleDirectionInput(+1, 0)
        } else if (keys.btnp.z) {
            undoLastMove()
        }
    }

    // Update movement interpolation (only in move mode when moving all rects)
    if (isAnimating) {
        const moveAmount = isFalling ? FALL_SPEED * dt : MOVE_SPEED * dt

        moveProgress += moveAmount

        // Movement complete - update actual positions
        if (moveProgress >= 1) {
            moveProgress = 0
            isMoving = false

            const tail = playerRects[playerRects.length - 1]
            invertTail = tail.dx < 0

            for (let i = 0; i < playerRects.length; i++) {
                const rect = playerRects[i]
                rect.x += rect.dx
                rect.y += rect.dy
                rect.dx = 0
                rect.dy = 0
            }

            // Check if player should be falling
            const shouldFall = playerRects.every(
                (rect) =>
                    !isCollision(rect.x, rect.y + 1) &&
                    !isCollectible(rect.x, rect.y + 1),
            )
            if (shouldFall) {
                playerRects.forEach((r) => (r.dy = 1))
                isFalling = true
                isMoving = true
            } else {
                // if previously falling, emit dust particles where player touches ground
                //if (isFalling) {
                //    playerRects.forEach((r) => {
                //        if (isCollision(r.x, r.y + 1)) {
                //            emitParticles(r.x, r.y + 1, 8)
                //        }
                //    })
                //}
                isFalling = false
            }

            // Check win condition after movement completes
            if (checkWinCondition()) {
                markLevelCompleted(getCurrentLevel())
                const head = playerRects[0]
                startTransitionAnimation(
                    head.x * CELL_SIZE - cam.x + CELL_SIZE / 2,
                    head.y * CELL_SIZE - cam.y + CELL_SIZE / 2,
                    false,
                    DDGREEN,
                    () => {
                        setScene(Scene.LevelSelect)
                    },
                )
            }

            // Check lose condition after movement completes
            if (checkLoseCondition()) {
                // Emit particles for each player rect touching a lose block
                playerRects.forEach((rect) => {
                    if (isLoseBlock(rect.x, rect.y)) {
                        emitParticles(particles, rect.x, rect.y)
                    }
                })
                // Start hide timer, then undo after timer completes
                hideTimer.onComplete = () => undoLastMove()
                startTimer(hideTimer)
            }
        }
    }
}

export const renderPlayer = (ctx: CanvasRenderingContext2D) => {
    // Render particles
    ctx.fillStyle = "black"
    renderParticles(particles, ctx)

    // Don't render player if hide timer is active
    if (isTimerActive(hideTimer)) {
        return
    }

    const head = playerRects[0]
    const tail = playerRects[playerRects.length - 1]
    // smooth movement if not falling
    const lerpedMove = isFalling
        ? moveProgress
        : lerp(0, 1, EASEOUTQUAD(moveProgress))
    const bouncedMove = THERENBACK(lerpedMove) * head.dx
    const breathAmount = THERENBACK(breathTime % 1)
    /** groud offset */
    const groundOff = GROUND_OFFSET + breathAmount * 2 + bouncedMove

    // calculate position
    const firstRenderX = (head.x + head.dx * lerpedMove) * CELL_SIZE - cam.x
    const firstRenderY = (head.y + head.dy * lerpedMove) * CELL_SIZE - cam.y

    // draw the body as a continuous line path
    ctx.beginPath()
    // offset y pos to move closer to the ground
    ctx.moveTo(
        firstRenderX + CELL_SIZE / 2,
        firstRenderY + groundOff + CELL_SIZE / 2,
    )
    for (let i = 1; i < playerRects.length; i++) {
        const rect = playerRects[i]
        const renderX =
            (rect.x + rect.dx * lerpedMove) * CELL_SIZE - cam.x + CELL_SIZE / 2
        const renderY =
            (rect.y + rect.dy * lerpedMove) * CELL_SIZE -
            cam.y +
            groundOff +
            CELL_SIZE / 2

        ctx.lineTo(renderX, renderY)
    }
    ctx.lineWidth = 60 - breathAmount * 4 - bouncedMove * 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "black"
    ctx.stroke()
    ctx.closePath()

    // tail
    const tailX =
        (tail.x + tail.dx * lerpedMove) * CELL_SIZE -
        cam.x +
        (invertTail ? 60 : 30)
    const tailY =
        40 + groundOff + (tail.y + tail.dy * lerpedMove) * CELL_SIZE - cam.y
    const tailTime = tailMoveTime % 1
    const tailAngleX = invertTail
        ? tailX + tailTime * TAIL_SIZE
        : tailX - tailTime * TAIL_SIZE
    const tailOffsetY = Math.sin(tailMoveTime * Math.PI) * TAIL_CURVE_AMOUNT
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.bezierCurveTo(
        tailAngleX,
        tailY + tailOffsetY,
        tailAngleX,
        tailY - tailOffsetY,
        invertTail ? tailX + TAIL_SIZE : tailX - TAIL_SIZE,
        tailY,
    )
    ctx.stroke()
    ctx.closePath()

    const xPos = firstRenderX + CELL_SIZE / 4
    const yPos = firstRenderY + GROUND_OFFSET / 2 + CELL_SIZE / 4

    // rotate face in the center
    const centerX = xPos + FACE_SIZE / 2
    const centerY = yPos + FACE_SIZE / 2
    ctx.translate(centerX, centerY)
    ctx.rotate(Math.PI * 0.05 * bouncedMove)
    ctx.translate(-centerX, -centerY)
    ctx.lineWidth = 10

    ctx.beginPath()
    ctx.roundRect(xPos, yPos, FACE_SIZE, FACE_SIZE, FACE_ROUNDNESS)
    ctx.fillStyle = "black"
    ctx.fill()

    //// left ear
    ctx.moveTo(xPos, yPos + 5)
    ctx.lineTo(xPos, yPos - EAR_HEIGHT)
    ctx.lineTo(xPos + EAR_WIDTH, yPos + 5)
    // right ear
    ctx.moveTo(xPos + FACE_SIZE, yPos + 5)
    ctx.lineTo(xPos + FACE_SIZE, yPos - EAR_HEIGHT)
    ctx.lineTo(xPos + (FACE_SIZE - EAR_WIDTH), yPos + 5)

    ctx.closePath()
    ctx.stroke()

    // eyes
    ctx.beginPath()
    ctx.ellipse(xPos + 15, yPos + 20, 5, 7 * blinkProgress, 0, 0, Math.PI * 2)
    ctx.ellipse(xPos + 45, yPos + 20, 5, 7 * blinkProgress, 0, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = "lightyellow"
    ctx.fill()

    // eyeballs
    ctx.beginPath()
    ctx.ellipse(xPos + 15 + 1, yPos + 20 + 2, 2, 4, 0, 0, Math.PI * 2)
    ctx.ellipse(xPos + 45 + 1, yPos + 20 + 2, 2, 4, 0, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = "black"
    ctx.fill()

    // nose
    ctx.beginPath()
    ctx.arc(xPos + 30, yPos + 30, 3, 0, Math.PI * 2)
    ctx.moveTo(xPos + 30, yPos + 30)
    ctx.lineTo(xPos + 30, yPos + 40)
    ctx.closePath()
    ctx.fillStyle = "white"
    ctx.strokeStyle = "white"
    ctx.lineWidth = 1
    ctx.fill()
    ctx.stroke()

    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

export const checkWinCondition = (): boolean =>
    isWinBlock(playerRects[0].x, playerRects[0].y) && allCollectiblesCollected()

export const checkLoseCondition = (): boolean => {
    return playerRects.some((rect) => isLoseBlock(rect.x, rect.y))
}
