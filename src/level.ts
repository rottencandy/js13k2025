import { camera } from "./camera"
import { CELL_SIZE } from "./const"
import { STATIC, WIN, LOSE } from "./data/level-data"

export interface RenderableItem {
    x: number
    y: number
    type: number
}

let renderables: RenderableItem[] = []
let levelLayout: number[][] = []

export const initLevel = (level: number[][]) => {
    renderables = []
    levelLayout = level

    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            const cellType = level[row][col]
            if (cellType === STATIC || cellType === WIN || cellType === LOSE) {
                renderables.push({
                    x: col * CELL_SIZE,
                    y: row * CELL_SIZE,
                    type: cellType,
                })
            }
        }
    }
}

export const renderLevel = (ctx: CanvasRenderingContext2D) => {
    for (const item of renderables) {
        ctx.fillStyle = item.type === WIN ? "gold" : item.type === LOSE ? "darkred" : "red"
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
