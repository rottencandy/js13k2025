import { initLevel, renderLevel as renderLevelGrid } from "./level"
import { levelsData, PLAYER } from "./data/level-data"
import { initPlayer, updatePlayer, renderPlayer } from "./player"
import { initState } from "./state"
import { camera } from "./camera"
import { WIDTH, HEIGHT, CELL_SIZE } from "./const"
import { renderWinAnimation } from "./win-animation"
import { updateParticles, renderParticles } from "./particle-system"

let currentLevel = 0
let currentLevelData = levelsData[0]

export const loadLevel = (levelIndex: number) => {
    currentLevel = levelIndex
    currentLevelData = levelsData[currentLevel]
    initLevel(currentLevelData)
    initState()

    // Calculate level dimensions
    const levelWidth = currentLevelData[0].length * CELL_SIZE
    const levelHeight = currentLevelData.length * CELL_SIZE

    // Center the camera on the level grid
    camera.x = (levelWidth - WIDTH) / 2
    camera.y = (levelHeight - HEIGHT) / 2

    // Find player starting position in level data
    let playerX = 0,
        playerY = 0
    for (let row = 0; row < currentLevelData.length; row++) {
        for (let col = 0; col < currentLevelData[row].length; col++) {
            if (currentLevelData[row][col] === PLAYER) {
                playerX = col
                playerY = row
                break
            }
        }
    }

    initPlayer(playerX, playerY)
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
