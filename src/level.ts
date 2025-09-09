import { cam } from "./camera"
import { CELL_SIZE, DDBLUE, DGREEN, DRED, LORANGE, WHITE } from "./const"
import {
    STATIC1,
    WIN,
    LOSE,
    GROW_ITEM,
    SHRINK_ITEM,
    STATIC3,
    STATIC2,
} from "./data/level-data"
import { SPRITES, SVG_FISH, SVG_SPIRAL } from "./svg"
import {
    createParticleSystem,
    updateParticles,
    renderParticles,
    emitParticles,
} from "./particle-system"

export interface RenderableItem {
    x: number
    y: number
    type: number
}

let renderables: RenderableItem[] = []
let levelLayout: number[][] = []
let growItems: { x: number; y: number }[] = []
let shrinkItems: { x: number; y: number }[] = []
let itemHoverAmount = 0
let winParticles = createParticleSystem(1, 10)
let winBlock: { x: number; y: number } | null = null

export const initLevel = (level: number[][]) => {
    renderables = []
    levelLayout = level
    growItems = []
    shrinkItems = []
    itemHoverAmount = 0
    winBlock = null

    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            const cellType = level[row][col]
            if (
                cellType === STATIC1 ||
                cellType === STATIC2 ||
                cellType === STATIC3 ||
                cellType === WIN ||
                cellType === LOSE ||
                cellType === GROW_ITEM ||
                cellType === SHRINK_ITEM
            ) {
                renderables.push({
                    x: col * CELL_SIZE,
                    y: row * CELL_SIZE,
                    type: cellType,
                })
                if (cellType === GROW_ITEM) {
                    growItems.push({ x: col, y: row })
                } else if (cellType === SHRINK_ITEM) {
                    shrinkItems.push({ x: col, y: row })
                } else if (cellType === WIN) {
                    winBlock = { x: col, y: row }
                }
            }
        }
    }
}

let frameCount = 0
export const updateLevel = (dt: number) => {
    frameCount += 1
    itemHoverAmount += dt * 0.005

    updateParticles(winParticles, dt)

    if (allGrowItemsCollected() && winBlock && frameCount % 20 === 0) {
        emitParticles(winParticles, winBlock.x, winBlock.y, 2)
    }
}

export const renderLevel = (ctx: CanvasRenderingContext2D) => {
    for (const item of renderables) {
        const posX = item.x - cam.x
        const posY = item.y - cam.y
        const type = item.type
        if (type === GROW_ITEM || type === SHRINK_ITEM) {
            const bounce = Math.sin(itemHoverAmount)

            ctx.translate(posX + CELL_SIZE / 4, posY + CELL_SIZE / 4 + bounce)
            ctx.shadowColor = WHITE
            ctx.shadowBlur = 10 * (Math.sin(itemHoverAmount / 2) * 0.5 + 0.5)
            ctx.fillStyle = type === GROW_ITEM ? DGREEN : DRED
            ctx.fill(SVG_FISH)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.shadowBlur = 0
        } else if (type === WIN) {
            if (allGrowItemsCollected()) {
                ctx.strokeStyle = LORANGE
            } else {
                ctx.strokeStyle = DDBLUE
            }
            ctx.lineWidth = 10
            ctx.translate(posX, posY)
            ctx.stroke(SVG_SPIRAL)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
        } else if (type === LOSE) {
            ctx.drawImage(
                SPRITES,
                144 * 3,
                0,
                144,
                144,
                posX,
                posY,
                CELL_SIZE,
                CELL_SIZE,
            )
        } else if (type === STATIC1) {
            ctx.drawImage(
                SPRITES,
                0,
                0,
                144,
                144,
                posX,
                posY,
                CELL_SIZE,
                CELL_SIZE,
            )
        } else if (type === STATIC2) {
            ctx.drawImage(
                SPRITES,
                144 * 1,
                0,
                144,
                144,
                posX,
                posY,
                CELL_SIZE,
                CELL_SIZE,
            )
        } else if (type === STATIC3) {
            ctx.drawImage(
                SPRITES,
                144 * 2,
                0,
                144,
                144,
                posX,
                posY,
                CELL_SIZE,
                CELL_SIZE,
            )
        }
    }

    if (allGrowItemsCollected()) {
        ctx.fillStyle = LORANGE
        ctx.lineWidth = 1
        renderParticles(winParticles, ctx)
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
    const block = levelLayout[y][x]
    return block === STATIC1 || block === STATIC2 || block === STATIC3
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

export const isGrowItem = (x: number, y: number): boolean => {
    return growItems.some((c) => c.x === x && c.y === y)
}

export const isShrinkItem = (x: number, y: number): boolean => {
    return shrinkItems.some((c) => c.x === x && c.y === y)
}

export const collectGrowItem = (x: number, y: number) => {
    const index = growItems.findIndex((c) => c.x === x && c.y === y)
    const renderIndex = renderables.findIndex(
        (c) => c.x === x * CELL_SIZE && c.y === y * CELL_SIZE,
    )
    if (index !== -1) {
        growItems.splice(index, 1)
    }
    if (renderIndex !== -1) {
        renderables.splice(renderIndex, 1)
    }
}

export const collectShrinkItem = (x: number, y: number) => {
    const index = shrinkItems.findIndex((c) => c.x === x && c.y === y)
    const renderIndex = renderables.findIndex(
        (c) => c.x === x * CELL_SIZE && c.y === y * CELL_SIZE,
    )
    if (index !== -1) {
        shrinkItems.splice(index, 1)
    }
    if (renderIndex !== -1) {
        renderables.splice(renderIndex, 1)
    }
}

export const allGrowItemsCollected = (): boolean => {
    return growItems.length === 0
}

export const getGrowItems = () => {
    return growItems
}

export const getShrinkItems = () => {
    return shrinkItems
}

export const getRenderables = () => {
    return renderables
}

export const restoreGameState = (
    newGrowItems: { x: number; y: number }[],
    newRenderables: { x: number; y: number; type: number }[],
    newShrinkItems: { x: number; y: number }[],
) => {
    growItems = [...newGrowItems]
    renderables = [...newRenderables]
    shrinkItems = [...newShrinkItems]
}
