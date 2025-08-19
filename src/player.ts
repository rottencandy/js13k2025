import { CELL_SIZE } from "./const"
import { keys } from "./core/input"
import { isCollision, isWinBlock, isLoseBlock } from "./level"
import { state } from "./state"
import { camera } from "./camera"
import { setScene, Scene } from "./scene-manager"

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

export const initPlayer = (x: number = 0, y: number = 0) => {
    playerRects = [{ x, y, dx: 0, dy: 0 }]
    undoStack = []
    isMoving = false
    isFalling = false
    moveProgress = 0
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
            for (let i = 0; i < playerRects.length; i++) {
                const rect = playerRects[i]
                rect.x += rect.dx
                rect.y += rect.dy
                rect.dx = 0
                rect.dy = 0
            }

            moveProgress = 0
            isMoving = false

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

            // Check win condition after movement completes
            if (checkWinCondition()) {
                setScene(Scene.Title)
            }

            // Check lose condition after movement completes
            if (checkLoseCondition()) {
                undoLastMove()
            }
        }
    }
}

export const renderPlayer = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < playerRects.length; i++) {
        const rect = playerRects[i]
        ctx.fillStyle =
            i === 0 ? (state.expandMode ? "lightgreen" : "lightblue") : "blue"

        const renderX = rect.x + rect.dx * moveProgress
        const renderY = rect.y + rect.dy * moveProgress

        ctx.fillRect(
            renderX * CELL_SIZE - camera.x,
            renderY * CELL_SIZE - camera.y,
            CELL_SIZE,
            CELL_SIZE,
        )
    }
}

export const checkWinCondition = (): boolean => {
    return playerRects.some((rect) => isWinBlock(rect.x, rect.y))
}

export const checkLoseCondition = (): boolean => {
    return playerRects.some((rect) => isLoseBlock(rect.x, rect.y))
}
