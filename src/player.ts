import { CELL_SIZE } from "./const"
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
import { camera } from "./camera"
import {
    startWinAnimation,
    updateWinAnimation,
    initWinAnimation,
} from "./win-animation"
import { emitParticles } from "./particle-system"
import {
    createTimer,
    startTimer,
    updateTimer,
    isTimerActive,
} from "./core/timer"
import { saveGameState, undoLastMove as undoLastGameMove } from "./undo-system"
import { EASEOUTQUAD, lerp } from "./core/math"

const MOVE_SPEED = 0.005
const FALL_SPEED = 0.008

const FACE_SIZE = 60
const FACE_ROUNDNESS = 5
const EAR_HEIGHT = 10
const EAR_WIDTH = 27
const GROUND_OFFSET = 10

type Rect = {
    // position
    x: number
    y: number
    // direction of next movement
    dx: number
    dy: number
}

let playerRects: Rect[] = [{ x: 0, y: 0, dx: 0, dy: 0 }]

let isMoving = false
let isFalling = false
let moveProgress = 0

const hideTimer = createTimer(300)

export const initPlayer = (rects: Rect[] = [{ x: 0, y: 0, dx: 0, dy: 0 }]) => {
    playerRects = rects.map((rect) => ({ ...rect, dx: 0, dy: 0 }))
    isMoving = false
    isFalling = false
    moveProgress = 0
    initWinAnimation()
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

export const updatePlayer = (deltaTime: number) => {
    // Handle win animation timer
    if (updateWinAnimation(deltaTime)) {
        return
    }

    // Update hide timer
    updateTimer(hideTimer, deltaTime)

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
        const moveAmount = isFalling
            ? FALL_SPEED * deltaTime
            : MOVE_SPEED * deltaTime

        moveProgress += moveAmount

        // Movement complete - update actual positions
        if (moveProgress >= 1) {
            moveProgress = 0
            isMoving = false

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
                startWinAnimation()
            }

            // Check lose condition after movement completes
            if (checkLoseCondition()) {
                // Emit particles for each player rect touching a lose block
                playerRects.forEach((rect) => {
                    if (isLoseBlock(rect.x, rect.y)) {
                        emitParticles(rect.x, rect.y)
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
    // Don't render if hide timer is active
    if (isTimerActive(hideTimer)) {
        return
    }

    // smooth movement if not falling
    const lerpedMove = isFalling
        ? moveProgress
        : lerp(0, 1, EASEOUTQUAD(moveProgress))

    // calculate position
    const firstRect = playerRects[0]
    const firstRenderX =
        (firstRect.x + firstRect.dx * lerpedMove) * CELL_SIZE - camera.x
    const firstRenderY =
        (firstRect.y + firstRect.dy * lerpedMove) * CELL_SIZE - camera.y

    // draw the body as a continuous line path
    ctx.beginPath()
    // offset y pos by 10 to move closer to the ground
    ctx.moveTo(
        firstRenderX + CELL_SIZE / 2,
        firstRenderY + GROUND_OFFSET + CELL_SIZE / 2,
    )
    for (let i = 1; i < playerRects.length; i++) {
        const rect = playerRects[i]
        const renderX =
            (rect.x + rect.dx * lerpedMove) * CELL_SIZE -
            camera.x +
            CELL_SIZE / 2
        const renderY =
            (rect.y + rect.dy * lerpedMove) * CELL_SIZE -
            camera.y +
            GROUND_OFFSET +
            CELL_SIZE / 2

        ctx.lineTo(renderX, renderY)
    }
    ctx.lineWidth = 60
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "black"
    ctx.stroke()
    ctx.closePath()

    const xPos = firstRenderX + CELL_SIZE / 4
    const yPos = firstRenderY + CELL_SIZE / 4

    // center & rotate face
    const centerX = xPos + FACE_SIZE / 2
    const centerY = yPos + FACE_SIZE / 2
    ctx.translate(centerX, centerY)
    ctx.rotate(Math.PI * 0.05)
    ctx.translate(-centerX, -centerY)
    ctx.lineWidth = 10

    ctx.beginPath()
    ctx.roundRect(xPos, yPos, FACE_SIZE, FACE_SIZE, FACE_ROUNDNESS)
    ctx.fillStyle = "black"
    ctx.strokeStyle = "black"
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
    ctx.ellipse(xPos + 15, yPos + 20, 5, 7, 0, 0, Math.PI * 2)
    ctx.ellipse(xPos + 45, yPos + 20, 5, 7, 0, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = "lightyellow"
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

    // eyeballs
    ctx.beginPath()
    ctx.ellipse(xPos + 15 + 1, yPos + 20 + 2, 2, 4, 0, 0, Math.PI * 2)
    ctx.ellipse(xPos + 45 + 1, yPos + 20 + 2, 2, 4, 0, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = "black"
    ctx.fill()

    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

export const checkWinCondition = (): boolean =>
    isWinBlock(playerRects[0].x, playerRects[0].y) && allCollectiblesCollected()

export const checkLoseCondition = (): boolean => {
    return playerRects.some((rect) => isLoseBlock(rect.x, rect.y))
}
