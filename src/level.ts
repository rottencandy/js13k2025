import { cam } from "./camera"
import { CELL_SIZE, DDBLUE, DGREEN, LORANGE, WHITE } from "./const"
import {
    STATIC1,
    WIN,
    LOSE,
    COLLECTIBLE,
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
let collectibles: { x: number; y: number }[] = []
let collectibleBounce = 0
let winParticles = createParticleSystem(1, 10)
let winBlock: { x: number; y: number } | null = null

export const initLevel = (level: number[][]) => {
    renderables = []
    levelLayout = level
    collectibles = []
    collectibleBounce = 0
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
                cellType === COLLECTIBLE
            ) {
                renderables.push({
                    x: col * CELL_SIZE,
                    y: row * CELL_SIZE,
                    type: cellType,
                })
                if (cellType === COLLECTIBLE) {
                    collectibles.push({ x: col, y: row })
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
    collectibleBounce += dt * 0.005

    updateParticles(winParticles, dt)

    if (allCollectiblesCollected() && winBlock && frameCount % 20 === 0) {
        emitParticles(winParticles, winBlock.x, winBlock.y, 2)
    }
}

export const renderLevel = (ctx: CanvasRenderingContext2D) => {
    for (const item of renderables) {
        const posX = item.x - cam.x
        const posY = item.y - cam.y
        const type = item.type
        if (type === COLLECTIBLE) {
            const bounce = Math.sin(collectibleBounce)

            ctx.translate(posX + CELL_SIZE / 4, posY + CELL_SIZE / 4 + bounce)
            ctx.shadowColor = WHITE
            ctx.shadowBlur = 10 * (Math.sin(collectibleBounce / 2) * 0.5 + 0.5)
            ctx.fillStyle = DGREEN
            ctx.fill(SVG_FISH)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.shadowBlur = 0
        } else if (type === WIN) {
            if (allCollectiblesCollected()) {
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

    if (allCollectiblesCollected()) {
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
