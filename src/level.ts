import { camera } from "./camera"
import { CELL_SIZE } from "./const"
import { STATIC, WIN, LOSE, COLLECTIBLE } from "./data/level-data"

export interface RenderableItem {
    x: number
    y: number
    type: number
}

let renderables: RenderableItem[] = []
let levelLayout: number[][] = []
let collectibles: { x: number; y: number }[] = []

export const initLevel = (level: number[][]) => {
    renderables = []
    levelLayout = level
    collectibles = []

    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            const cellType = level[row][col]
            if (
                cellType === STATIC ||
                cellType === WIN ||
                cellType === LOSE ||
                cellType === COLLECTIBLE
            ) {
                renderables.push({
                    x: col * CELL_SIZE,
                    y: row * CELL_SIZE,
                    type: cellType,
                })
                if (cellType === COLLECTIBLE) {
                    collectibles.push({ x: col, y: row })
                }
            }
        }
    }
}

export const renderLevel = (ctx: CanvasRenderingContext2D) => {
    for (const item of renderables) {
        ctx.fillStyle =
            item.type === WIN
                ? allCollectiblesCollected()
                    ? "gold"
                    : "gray"
                : item.type === LOSE
                  ? "darkred"
                  : item.type === COLLECTIBLE
                    ? "yellow"
                    : "red"
        ctx.fillRect(item.x - camera.x, item.y - camera.y, CELL_SIZE, CELL_SIZE)
    }
}

export const isCollision = (x: number, y: number): boolean => {
    // bounds check
    if (
        y < 0 ||
        y >= levelLayout.length ||
        x < 0 ||
        x >= levelLayout[0].length
    ) {
        return true
    }
    return levelLayout[y][x] === STATIC
}

export const isWinBlock = (x: number, y: number): boolean => {
    // bounds check
    if (
        y < 0 ||
        y >= levelLayout.length ||
        x < 0 ||
        x >= levelLayout[0].length
    ) {
        return false
    }
    return levelLayout[y][x] === WIN
}

export const isLoseBlock = (x: number, y: number): boolean => {
    // bounds check
    if (
        y < 0 ||
        y >= levelLayout.length ||
        x < 0 ||
        x >= levelLayout[0].length
    ) {
        return false
    }
    return levelLayout[y][x] === LOSE
}

export const isCollectible = (x: number, y: number): boolean => {
    return collectibles.some((c) => c.x === x && c.y === y)
}

export const collectItem = (x: number, y: number) => {
    const index = collectibles.findIndex((c) => c.x === x && c.y === y)
    const renderIndex = renderables.findIndex(
        (c) => c.x === x * CELL_SIZE && c.y === y * CELL_SIZE,
    )
    if (index !== -1) {
        collectibles.splice(index, 1)
    }
    if (renderIndex !== -1) {
        renderables.splice(renderIndex, 1)
    }
}

export const allCollectiblesCollected = (): boolean => {
    return collectibles.length === 0
}

export const getCollectibles = () => {
    return collectibles
}

export const getRenderables = () => {
    return renderables
}

export const restoreGameState = (
    newCollectibles: { x: number; y: number }[],
    newRenderables: { x: number; y: number; type: number }[],
) => {
    collectibles = [...newCollectibles]
    renderables = [...newRenderables]
}
