import { initLevel, renderLevel as renderLevelGrid } from "./level"
import { levelData, PLAYER } from "./data/level-data"
import { initPlayer, updatePlayer, renderPlayer } from "./player"
import { initState } from "./state"
import { camera } from "./camera"
import { WIDTH, HEIGHT, CELL_SIZE } from "./const"

let currentLevel = 0

export const loadLevel = (levelIndex: number) => {
    currentLevel = levelIndex
    initLevel(levelData)
    initState()
    
    // Calculate level dimensions
    const levelWidth = levelData[0].length * CELL_SIZE
    const levelHeight = levelData.length * CELL_SIZE
    
    // Center the camera on the level grid
    camera.x = (levelWidth - WIDTH) / 2
    camera.y = (levelHeight - HEIGHT) / 2
    
    // Find player starting position in level data
    let playerX = 0, playerY = 0
    for (let row = 0; row < levelData.length; row++) {
        for (let col = 0; col < levelData[row].length; col++) {
            if (levelData[row][col] === PLAYER) {
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
}

export const renderLevel = (ctx: CanvasRenderingContext2D) => {
    renderLevelGrid(ctx)
    renderPlayer(ctx)
}
