import { BLACK, CELL_SIZE, DDBLUE, HEIGHT, WHITE, WIDTH } from "./const"
import { keys } from "./core/input"
import {
    isCollision,
    isWinBlock,
    isLoseBlock,
    isGrowItem,
    isShrinkItem,
    collectGrowItem,
    collectShrinkItem,
    allGrowItemsCollected,
    getGrowItems,
    getShrinkItems,
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
import { getCurrentLevel, loadLevel } from "./level-manager"
import { setLastCompletedLevel } from "./level-select"
import {
    playFallSound,
    playGrowSound,
    playHurtSound,
    playInvlaidSound,
    playMoveSound,
    playShrinkSound,
    playWinSound,
} from "./synth"

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
let isBlocked = false
let invertTail = false
let moveProgress = 0
let blockedProgress = 0
let blinkProgress = 1
let breathTime = 0
let tailMoveTime = 0
let tailMoveSpeed = tailSpeedTimer.duration
let particles: ParticleSystem
let blockedDirection = { x: 0, y: 0 }

export const initPlayer = (rects: Rect[] = [{ x: 0, y: 0, dx: 0, dy: 0 }]) => {
    playerRects = rects.map((rect) => ({ ...rect, dx: 0, dy: 0 }))
    isMoving = false
    isFalling = false
    isBlocked = false
    moveProgress = 0
    blockedProgress = 0
    blinkProgress = 1
    breathTime = 0
    tailMoveTime = 0
    particles = createParticleSystem()
    startTimer(blinkTimer)
    startTimer(tailSpeedTimer)
    startTransitionAnimation(WIDTH / 2, HEIGHT / 2, true, DDBLUE)
}

const playerAtPos = (x: number, y: number) => {
    return playerRects.some((r) => r.x === x && r.y === y)
}

const savePlayerState = () => {
    const playerState = playerRects.map((rect) => ({
        x: rect.x,
        y: rect.y,
    }))
    saveGameState(
        playerState,
        getRenderables(),
        getGrowItems(),
        getShrinkItems(),
    )
}

const undoLastMove = () => {
    const state = undoLastGameMove()
    if (state) {
        playerRects = state.playerRects.map((rect) => ({
            ...rect,
            dx: 0,
            dy: 0,
        }))
        restoreGameState(state.growItems, state.renderables, state.shrinkItems)
    }
}

const resetLevel = () => {
    startTransitionAnimation(WIDTH / 2, HEIGHT / 2, false, DDBLUE, () => {
        loadLevel(getCurrentLevel())
    })
}

const handleExpand = (dirX: number, dirY: number) => {
    const head = playerRects[0]
    playerRects.unshift({ x: head.x, y: head.y, dx: dirX, dy: dirY })
    playGrowSound()
    isMoving = true
}

const handleShrink = (dirX: number, dirY: number) => {
    // If player only has one segment, treat as lose condition
    if (playerRects.length <= 1) {
        handleLoseCondition()
        return
    }
    playShrinkSound()
    // Remove the tail segment
    playerRects.pop()
    handleMove(dirX, dirY)
}

const handleLoseCondition = () => {
    // Emit particles for each player rect touching a lose block
    playerRects.forEach((rect) => {
        if (isLoseBlock(rect.x, rect.y)) {
            emitParticles(particles, rect.x, rect.y)
        }
    })
    playHurtSound()
    // Start hide timer, then undo after timer completes
    hideTimer.onComplete = () => undoLastMove()
    startTimer(hideTimer)
}

const handleMove = (dirX: number, dirY: number) => {
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
        savePlayerState()
        if (isGrowItem(newRectX, newRectY)) {
            collectGrowItem(newRectX, newRectY)
            emitParticles(particles, newRectX, newRectY)
            handleExpand(dirX, dirY)
        } else if (isShrinkItem(newRectX, newRectY)) {
            collectShrinkItem(newRectX, newRectY)
            emitParticles(particles, newRectX, newRectY)
            handleShrink(dirX, dirY)
        } else {
            handleMove(dirX, dirY)
            playMoveSound()
        }
    } else {
        // show blocked animation when player cannot move
        isBlocked = true
        blockedProgress = 0
        blockedDirection = { x: dirX, y: dirY }
        playInvlaidSound()
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
    updateTimer(hideTimer, dt)
    // Don't update further if hide timer is active
    if (isTimerActive(hideTimer)) {
        return
    }
    breathTime += dt / BREATH_SPEED
    tailMoveTime += dt / tailMoveSpeed
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

    // Update blocked animation
    if (isBlocked) {
        blockedProgress += dt * 0.01
        if (blockedProgress >= 1) {
            isBlocked = false
            blockedProgress = 0
        }
    }

    const isAnimating = isMoving || isFalling

    // Only allow movement if not currently moving, falling, or blocked
    if (!isAnimating) {
        if (keys.btnp.up) {
            handleDirectionInput(0, -1)
        } else if (keys.btnp.dn) {
            handleDirectionInput(0, +1)
        } else if (keys.btnp.lf) {
            handleDirectionInput(-1, 0)
        } else if (keys.btnp.rt) {
            handleDirectionInput(+1, 0)
        } else if (keys.btnp.undo) {
            undoLastMove()
        } else if (keys.btnp.reset) {
            resetLevel()
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
                    !isGrowItem(rect.x, rect.y + 1) &&
                    !isShrinkItem(rect.x, rect.y + 1),
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
                if (isFalling) {
                    playFallSound()
                    isFalling = false
                }
            }

            // Check win condition after movement completes
            if (checkWinCondition()) {
                const currentLevelIndex = getCurrentLevel()
                playWinSound()
                markLevelCompleted(currentLevelIndex)
                setLastCompletedLevel(currentLevelIndex)
                const head = playerRects[0]
                startTransitionAnimation(
                    head.x * CELL_SIZE - cam.x + CELL_SIZE / 2,
                    head.y * CELL_SIZE - cam.y + CELL_SIZE / 2,
                    false,
                    DDBLUE,
                    () => {
                        setScene(Scene.LevelSelect)
                    },
                )
            }

            // Check lose condition after movement completes
            if (checkLoseCondition()) {
                handleLoseCondition()
            }
        }
    }
}

export const renderPlayer = (ctx: CanvasRenderingContext2D) => {
    // Render particles
    ctx.fillStyle = BLACK
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

    // blocked animation offset
    const blockedOffset = isBlocked ? THERENBACK(blockedProgress) * 10 : 0
    const blockedX = blockedOffset * blockedDirection.x
    const blockedY = blockedOffset * blockedDirection.y

    /** groud offset */
    const groundOff = GROUND_OFFSET + breathAmount * 2 + bouncedMove

    // calculate position
    const firstRenderX =
        (head.x + head.dx * lerpedMove) * CELL_SIZE - cam.x + blockedX
    const firstRenderY =
        (head.y + head.dy * lerpedMove) * CELL_SIZE - cam.y + blockedY

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
            (rect.x + rect.dx * lerpedMove) * CELL_SIZE -
            cam.x +
            CELL_SIZE / 2 +
            blockedX
        const renderY =
            (rect.y + rect.dy * lerpedMove) * CELL_SIZE -
            cam.y +
            groundOff +
            CELL_SIZE / 2 +
            blockedY

        ctx.lineTo(renderX, renderY)
    }
    ctx.lineWidth = 60 - breathAmount * 4 - bouncedMove * 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = BLACK
    ctx.stroke()
    ctx.closePath()

    // tail
    const tailX =
        (tail.x + tail.dx * lerpedMove) * CELL_SIZE -
        cam.x +
        (invertTail ? 60 : 30) +
        blockedX
    const tailY =
        40 +
        groundOff +
        (tail.y + tail.dy * lerpedMove) * CELL_SIZE -
        cam.y +
        blockedY
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
    ctx.fillStyle = BLACK
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
    ctx.fillStyle = BLACK
    ctx.fill()

    // nose
    ctx.beginPath()
    ctx.arc(xPos + 30, yPos + 30, 3, 0, Math.PI * 2)
    ctx.moveTo(xPos + 30, yPos + 30)
    ctx.lineTo(xPos + 30, yPos + 40)
    ctx.closePath()
    ctx.fillStyle = WHITE
    ctx.strokeStyle = WHITE
    ctx.lineWidth = 1
    ctx.fill()
    ctx.stroke()

    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

export const checkWinCondition = (): boolean =>
    isWinBlock(playerRects[0].x, playerRects[0].y) && allGrowItemsCollected()

export const checkLoseCondition = (): boolean => {
    return playerRects.some((rect) => isLoseBlock(rect.x, rect.y))
}
