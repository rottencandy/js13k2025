import { CELL_SIZE } from "./const"
import { keys } from "./core/input"
import {
    isCollision,
    isWinBlock,
    isLoseBlock,
    isCollectible,
    collectItem,
    allCollectiblesCollected,
} from "./level"
import { state } from "./state"
import { camera } from "./camera"
import {
    startWinAnimation,
    updateWinAnimation,
    initWinAnimation,
} from "./win-animation"
import { emitParticles } from "./particle-system"
import { createTimer, startTimer, updateTimer, isTimerActive } from "./core/timer"

const MOVE_SPEED = 0.005
const FALL_SPEED = 0.008

type Rect = {
    // position
    x: number
    y: number
    // direction of next movement
    dx: number
    dy: number
}

let playerRects: Rect[] = [{ x: 0, y: 0, dx: 0, dy: 0 }]
let undoStack: Rect[][] = []

let isMoving = false
let isFalling = false
let moveProgress = 0

const hideTimer = createTimer(300)

export const initPlayer = (x: number = 0, y: number = 0) => {
    playerRects = [{ x, y, dx: 0, dy: 0 }]
    undoStack = []
    isMoving = false
    isFalling = false
    moveProgress = 0
    initWinAnimation()
}

const playerAtPos = (x: number, y: number) => {
    return playerRects.some((r) => r.x === x && r.y === y)
}

const savePlayerState = () => {
    const state = playerRects.map((rect) => ({
        x: rect.x,
        y: rect.y,
        dx: 0,
        dy: 0,
    }))
    undoStack.push(state)
}

const undoLastMove = () => {
    state.expandMode = false
    if (undoStack.length > 0) {
        playerRects = undoStack.pop()!
    }
}

const handleExpand = (dirX: number, dirY: number) => {
    const head = playerRects[0]
    const newRectX = head.x + dirX
    const newRectY = head.y + dirY
    savePlayerState()
    playerRects.unshift({ x: newRectX, y: newRectY, dx: 0, dy: 0 })
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
        if (state.expandMode) {
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
        } else if (keys.btnp.spc) {
            state.expandMode = !state.expandMode
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
                (rect) => !isCollision(rect.x, rect.y + 1),
            )
            if (shouldFall) {
                playerRects.forEach((r) => (r.dy = 1))
                isFalling = true
                isMoving = true
            } else {
                isFalling = false
            }

            // Check for collectibles
            playerRects.forEach((rect) => {
                if (isCollectible(rect.x, rect.y)) {
                    collectItem(rect.x, rect.y)
                }
            })

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

    ctx.strokeStyle = state.expandMode ? "lightgreen" : "lightblue"
    ctx.fillStyle = ctx.strokeStyle

    ctx.lineWidth = CELL_SIZE - 10
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()

    const firstRect = playerRects[0]
    const firstRenderX =
        (firstRect.x + firstRect.dx * moveProgress) * CELL_SIZE -
        camera.x +
        CELL_SIZE / 2
    const firstRenderY =
        (firstRect.y + firstRect.dy * moveProgress) * CELL_SIZE -
        camera.y +
        CELL_SIZE / 2

    // draw first rect as a circle
    ctx.arc(firstRenderX, firstRenderY, 4, 0, Math.PI * 2)
    ctx.fill()

    // draw the rest as a continuous line path
    ctx.moveTo(firstRenderX, firstRenderY)
    for (let i = 1; i < playerRects.length; i++) {
        const rect = playerRects[i]
        const renderX =
            (rect.x + rect.dx * moveProgress) * CELL_SIZE -
            camera.x +
            CELL_SIZE / 2
        const renderY =
            (rect.y + rect.dy * moveProgress) * CELL_SIZE -
            camera.y +
            CELL_SIZE / 2

        ctx.lineTo(renderX, renderY)
    }

    ctx.stroke()
}

export const checkWinCondition = (): boolean => {
    return (
        playerRects.some((rect) => isWinBlock(rect.x, rect.y)) &&
        allCollectiblesCollected()
    )
}

export const checkLoseCondition = (): boolean => {
    return playerRects.some((rect) => isLoseBlock(rect.x, rect.y))
}
