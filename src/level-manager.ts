import { initLevel, renderLevel as renderLevelGrid } from "./level"
import { levelsData, PLAYER_HEAD, PLAYER_BODY } from "./data/level-data"
import { initPlayer, updatePlayer, renderPlayer } from "./player"
import { initState } from "./state"
import { camera } from "./camera"
import { WIDTH, HEIGHT, CELL_SIZE } from "./const"
import { renderWinAnimation } from "./win-animation"
import { updateParticles, renderParticles } from "./particle-system"
import { clearUndoStack } from "./undo-system"

let currentLevel = 0
let currentLevelData = levelsData[0]

export const loadLevel = (levelIndex: number) => {
    currentLevel = levelIndex
    currentLevelData = levelsData[currentLevel]
    initLevel(currentLevelData)
    initState()
    clearUndoStack()

    // Calculate level dimensions
    const levelWidth = currentLevelData[0].length * CELL_SIZE
    const levelHeight = currentLevelData.length * CELL_SIZE

    // Center the camera on the level grid
    camera.x = (levelWidth - WIDTH) / 2
    camera.y = (levelHeight - HEIGHT) / 2

    // Find all player rectangles in level data
    const playerRects: { x: number; y: number; dx: number; dy: number }[] = []

    for (let row = 0; row < currentLevelData.length; row++) {
        for (let col = 0; col < currentLevelData[row].length; col++) {
            if (currentLevelData[row][col] === PLAYER_HEAD) {
                playerRects.unshift({ x: col, y: row, dx: 0, dy: 0 })
            } else if (currentLevelData[row][col] === PLAYER_BODY) {
                playerRects.push({ x: col, y: row, dx: 0, dy: 0 })
            }
        }
    }

    initPlayer(playerRects)
}

export const updateLevel = (deltaTime: number) => {
    updatePlayer(deltaTime)
    updateParticles(deltaTime)
}

export const renderLevel = (ctx: CanvasRenderingContext2D) => {
    renderLevelGrid(ctx)
    renderPlayer(ctx)
    renderParticles(ctx)
    renderWinAnimation(ctx)
}
