import { CELL_SIZE } from "./const"
import { drawRect } from "./core/rect"
import { PLATFORM } from "./data/level-data"

export interface RenderableItem {
    x: number
    y: number
}

let renderables: RenderableItem[] = []
let levelLayout: number[][] = []

export const initLevel = (level: number[][]) => {
    renderables = []
    levelLayout = level

    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            if (level[row][col] === PLATFORM) {
                renderables.push({
                    x: col * CELL_SIZE,
                    y: row * CELL_SIZE,
                })
            }
        }
    }
}

export const renderLevel = (ctx: CanvasRenderingContext2D) => {
    for (const item of renderables) {
        drawRect(ctx, item.x, item.y, CELL_SIZE, CELL_SIZE)
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
    return levelLayout[y][x] === PLATFORM
}
