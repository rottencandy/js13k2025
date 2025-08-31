import { Scene, setScene } from "./scene-manager"
import { keys } from "./core/input"
import { levelsData } from "./data/level-data"
import { loadLevel } from "./level-manager"
import { pointInRect, lerp } from "./core/math"
import { startTransitionAnimation } from "./transition-animation"
import {
    DDGREEN,
    HEIGHT,
    WIDTH,
    BLACK,
    GREEN,
    LGREEN,
    DBLUE,
    WHITE,
    BLUE,
    DDBLUE,
} from "./const"
import { getCompletedLevels, isLevelAvailable } from "./core/localstorage"

const GRID_SIZE = 60
const PADDING = 20
const START_X = 50
const START_Y = 150
const COLS = Math.floor((800 - PADDING * 2) / (GRID_SIZE + PADDING))

let selectedLevel = 0
const levelScales: number[] = []

export const initLevelSelect = () => {
    // Initialize scales for all levels
    for (let i = 0; i < levelsData.length; i++) {
        levelScales[i] = 1
    }
    startTransitionAnimation(WIDTH / 2, HEIGHT / 2, true, DDBLUE)
}

const startLevel = (levelIndex: number) => {
    selectedLevel = levelIndex
    startTransitionAnimation(WIDTH / 2, HEIGHT / 2, false, DDBLUE, () => {
        loadLevel(levelIndex)
        setScene(Scene.Game)
    })
}

export const updateLevelSelect = () => {
    if (keys.btnp.esc) {
        setScene(Scene.Title)
        return
    }

    // Handle keyboard navigation
    if (keys.btnp.lf) {
        let newLevel = selectedLevel - 1
        while (newLevel >= 0 && !isLevelAvailable(newLevel)) {
            newLevel--
        }
        if (newLevel >= 0) selectedLevel = newLevel
    }
    if (keys.btnp.rt) {
        let newLevel = selectedLevel + 1
        while (newLevel < levelsData.length && !isLevelAvailable(newLevel)) {
            newLevel++
        }
        if (newLevel < levelsData.length) selectedLevel = newLevel
    }
    if (keys.btnp.up) {
        let newLevel = selectedLevel - COLS
        while (newLevel >= 0 && !isLevelAvailable(newLevel)) {
            newLevel -= COLS
        }
        if (newLevel >= 0) selectedLevel = newLevel
    }
    if (keys.btnp.dn) {
        let newLevel = selectedLevel + COLS
        while (newLevel < levelsData.length && !isLevelAvailable(newLevel)) {
            newLevel += COLS
        }
        if (newLevel < levelsData.length) selectedLevel = newLevel
    }

    // Handle level selection with space or enter
    if (keys.btnp.spc && isLevelAvailable(selectedLevel)) {
        startLevel(selectedLevel)
    }

    // Handle level selection with pointer
    if (keys.btn.clk) {
        const levelIndex = getLevelAtPosition(keys.ptr.x, keys.ptr.y)
        if (
            levelIndex >= 0 &&
            levelIndex < levelsData.length &&
            isLevelAvailable(levelIndex)
        ) {
            startLevel(levelIndex)
        }
    }

    // Update selected level on hover
    const hoveredLevel = getLevelAtPosition(keys.ptr.x, keys.ptr.y)
    if (hoveredLevel >= 0 && isLevelAvailable(hoveredLevel)) {
        selectedLevel = hoveredLevel
    }

    // Update scale targets and interpolate for all levels
    for (let i = 0; i < levelsData.length; i++) {
        const isThisLevelActive = i === selectedLevel && isLevelAvailable(i)
        const targetScale = isThisLevelActive ? 1.1 : 1
        levelScales[i] = lerp(levelScales[i], targetScale, 0.15)
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
    ctx.fillStyle = DDGREEN
    ctx.fillRect(0, 0, width, height)

    // Level grid
    const completedLevels = getCompletedLevels()
    for (let i = 0; i < levelsData.length; i++) {
        const col = i % COLS
        const row = Math.floor(i / COLS)

        const levelX = START_X + col * (GRID_SIZE + PADDING)
        const levelY = START_Y + row * (GRID_SIZE + PADDING)

        const isCompleted = completedLevels.has(i)
        const isAvailable = isLevelAvailable(i)

        // Level box with smooth size change on hover
        const scaledSize = GRID_SIZE * levelScales[i]
        const scaledX = levelX - (scaledSize - GRID_SIZE) / 2
        const scaledY = levelY - (scaledSize - GRID_SIZE) / 2

        ctx.fillStyle = !isAvailable ? BLACK : isCompleted ? GREEN : BLUE
        ctx.beginPath()
        ctx.roundRect(scaledX, scaledY, scaledSize, scaledSize, 8)
        ctx.closePath()
        ctx.fill()

        // Level border
        ctx.strokeStyle = !isAvailable ? DBLUE : isCompleted ? LGREEN : DBLUE
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(scaledX, scaledY, scaledSize, scaledSize, 8)
        ctx.closePath()
        ctx.stroke()

        // Level number
        ctx.fillStyle = !isAvailable ? DBLUE : WHITE
        ctx.font = "24px Arial"
        ctx.textAlign = "center"
        ctx.fillText(
            (i + 1).toString(),
            scaledX + scaledSize / 2,
            scaledY + scaledSize / 2 + 8,
        )

        // Checkmark for completed levels
        if (isCompleted) {
            ctx.fillStyle = WHITE
            ctx.font = "16px Arial"
            ctx.fillText("✓", scaledX + scaledSize - 10, scaledY + 15)
        }

        // Lock icon for unavailable levels
        if (!isAvailable) {
            ctx.fillStyle = DBLUE
            ctx.font = "20px Arial"
            ctx.fillText(
                "🔒",
                scaledX + scaledSize / 2,
                scaledY + scaledSize / 2 - 5,
            )
        }
    }
}
