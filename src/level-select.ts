import { Scene, setScene } from "./scene-manager"
import { keys } from "./core/input"
import { levelsData } from "./data/level-data"
import { loadLevel } from "./level-manager"
import { pointInRect } from "./core/math"

const GRID_SIZE = 60
const PADDING = 20
const START_X = 50
const START_Y = 150
const COLS = Math.floor((800 - PADDING * 2) / (GRID_SIZE + PADDING))

let selectedLevel = 0

export const updateLevelSelect = () => {
    if (keys.btnp.esc) {
        setScene(Scene.Title)
        return
    }

    // Handle keyboard navigation
    if (keys.btnp.lf) {
        selectedLevel = Math.max(0, selectedLevel - 1)
    }
    if (keys.btnp.rt) {
        selectedLevel = Math.min(levelsData.length - 1, selectedLevel + 1)
    }
    if (keys.btnp.up) {
        selectedLevel = Math.max(0, selectedLevel - COLS)
    }
    if (keys.btnp.dn) {
        selectedLevel = Math.min(levelsData.length - 1, selectedLevel + COLS)
    }

    // Handle level selection with space or enter
    if (keys.btnp.spc) {
        loadLevel(selectedLevel)
        setScene(Scene.Game)
    }

    // Handle level selection with pointer
    if (keys.btn.clk) {
        const levelIndex = getLevelAtPosition(keys.ptr.x, keys.ptr.y)
        if (levelIndex >= 0 && levelIndex < levelsData.length) {
            selectedLevel = levelIndex
            loadLevel(levelIndex)
            setScene(Scene.Game)
        }
    }

    // Update selected level on hover
    const hoveredLevel = getLevelAtPosition(keys.ptr.x, keys.ptr.y)
    if (hoveredLevel >= 0) {
        selectedLevel = hoveredLevel
    }
}

const getLevelAtPosition = (x: number, y: number): number => {
    for (let i = 0; i < levelsData.length; i++) {
        const col = i % COLS
        const row = Math.floor(i / COLS)

        const levelX = START_X + col * (GRID_SIZE + PADDING)
        const levelY = START_Y + row * (GRID_SIZE + PADDING)

        if (pointInRect(x, y, levelX, levelY, GRID_SIZE, GRID_SIZE)) {
            return i
        }
    }

    return -1
}

export const renderLevelSelect = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
) => {
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height)

    // Title
    ctx.fillStyle = "#fff"
    ctx.font = "32px Arial"
    ctx.textAlign = "center"
    ctx.fillText("SELECT LEVEL", width / 2, 80)

    // Level grid
    for (let i = 0; i < levelsData.length; i++) {
        const col = i % COLS
        const row = Math.floor(i / COLS)

        const levelX = START_X + col * (GRID_SIZE + PADDING)
        const levelY = START_Y + row * (GRID_SIZE + PADDING)

        // Check if pointer is hovering
        const isHovered = pointInRect(
            keys.ptr.x,
            keys.ptr.y,
            levelX,
            levelY,
            GRID_SIZE,
            GRID_SIZE,
        )
        const isSelected = i === selectedLevel

        // Level box
        ctx.fillStyle = isHovered || isSelected ? "#444" : "#222"
        ctx.fillRect(levelX, levelY, GRID_SIZE, GRID_SIZE)

        // Level border
        ctx.strokeStyle = "#666"
        ctx.lineWidth = 2
        ctx.strokeRect(levelX, levelY, GRID_SIZE, GRID_SIZE)

        // Level number
        ctx.fillStyle = "#fff"
        ctx.font = "24px Arial"
        ctx.textAlign = "center"
        ctx.fillText(
            (i + 1).toString(),
            levelX + GRID_SIZE / 2,
            levelY + GRID_SIZE / 2 + 8,
        )
    }
}
