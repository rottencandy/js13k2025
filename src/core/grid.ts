import { drawRect } from "./rect"

export interface RenderableItem {
    x: number
    y: number
}

export const createRenderables = (
    grid: number[][],
    cellSize: number,
): RenderableItem[] => {
    const renderables: RenderableItem[] = []

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === 1) {
                renderables.push({
                    x: col * cellSize,
                    y: row * cellSize,
                })
            }
        }
    }

    return renderables
}

export const renderGrid = (
    ctx: CanvasRenderingContext2D,
    renderables: RenderableItem[],
    cellSize: number,
) => {
    for (const item of renderables) {
        drawRect(ctx, item.x, item.y, cellSize, cellSize)
    }
}
