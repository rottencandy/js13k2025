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
    DPURPLE,
} from "./const"
import { getCompletedLevels, isLevelAvailable } from "./core/localstorage"
import {
    createParticleSystem,
    updateParticles,
    renderParticles,
    ParticleSystem,
    emitUIParticles,
} from "./particle-system"
import { cam } from "./camera"
import {
    playMenuHoverSound,
    playMenuSelectSound,
    startMusicLoop,
    stopMusicLoop,
} from "./synth"
import {
    renderScrollingBackdrop,
    updateScrollingBackdrop,
} from "./title-screen"

const GRID_SIZE = 80
const PADDING = 50
const START_X = 120
const START_Y = 150
const COLS = Math.floor((800 - PADDING * 2) / (GRID_SIZE + PADDING))
const PARTICLE_COUNT = 32
const PARTICLE_SIZE = 16

let selectedLevel = 0
const levelScales: number[] = []
let celebrationParticles: ParticleSystem
let lastCompletedLevel = -1

export const initLevelSelect = () => {
    // Initialize scales for all levels
    for (let i = 0; i < levelsData.length; i++) {
        levelScales[i] = 1
    }
    // Initialize particle system for celebrations
    celebrationParticles = createParticleSystem(PARTICLE_SIZE, PARTICLE_COUNT)
    // reset camera
    cam.x = 0
    cam.y = 0

    startTransitionAnimation(WIDTH / 2, HEIGHT / 2, true, DDBLUE, () => {
        // Emit celebration particles for the last completed level
        if (lastCompletedLevel >= 0) {
            const col = lastCompletedLevel % COLS
            const row = Math.floor(lastCompletedLevel / COLS)
            const levelX = START_X + col * (GRID_SIZE + PADDING) + GRID_SIZE / 2
            const levelY = START_Y + row * (GRID_SIZE + PADDING) + GRID_SIZE / 2
            emitUIParticles(
                celebrationParticles,
                levelX,
                levelY,
                PARTICLE_COUNT,
            )
            lastCompletedLevel = -1 // Reset after emitting
        }
    })
}

export const setLastCompletedLevel = (levelIndex: number) => {
    stopMusicLoop()
    lastCompletedLevel = levelIndex
}

const startLevel = (levelIndex: number) => {
    selectedLevel = levelIndex
    startTransitionAnimation(WIDTH / 2, HEIGHT / 2, false, DDBLUE, () => {
        loadLevel(levelIndex)
        setScene(Scene.Game)
        startMusicLoop()
    })
}

const setHoveredLevel = (level: number) => {
    if (selectedLevel !== level) {
        selectedLevel = level
        playMenuHoverSound()
    }
}

export const updateLevelSelect = (dt: number) => {
    updateScrollingBackdrop(dt)
    // Update celebration particles
    updateParticles(celebrationParticles, dt)

    // Handle keyboard navigation
    if (keys.btnp.lf) {
        let newLevel = selectedLevel - 1
        while (newLevel >= 0 && !isLevelAvailable(newLevel)) {
            newLevel--
        }
        if (newLevel >= 0) setHoveredLevel(newLevel)
    }
    if (keys.btnp.rt) {
        let newLevel = selectedLevel + 1
        while (newLevel < levelsData.length && !isLevelAvailable(newLevel)) {
            newLevel++
        }
        if (newLevel < levelsData.length) setHoveredLevel(newLevel)
    }
    if (keys.btnp.up) {
        let newLevel = selectedLevel - COLS
        while (newLevel >= 0 && !isLevelAvailable(newLevel)) {
            newLevel -= COLS
        }
        if (newLevel >= 0) setHoveredLevel(newLevel)
    }
    if (keys.btnp.dn) {
        let newLevel = selectedLevel + COLS
        while (newLevel < levelsData.length && !isLevelAvailable(newLevel)) {
            newLevel += COLS
        }
        if (newLevel < levelsData.length) setHoveredLevel(newLevel)
    }

    // Handle level selection with space or enter
    if (keys.btnp.sel && isLevelAvailable(selectedLevel)) {
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
            playMenuSelectSound()
        }
    }

    // Update selected level on hover
    const hoveredLevel = getLevelAtPosition(keys.ptr.x, keys.ptr.y)
    if (hoveredLevel >= 0 && isLevelAvailable(hoveredLevel)) {
        setHoveredLevel(hoveredLevel)
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

export const renderLevelSelect = (ctx: CanvasRenderingContext2D) => {
    renderScrollingBackdrop(ctx)

    ctx.roundRect(80, 100, WIDTH - 130, HEIGHT - 200, 25)
    ctx.fillStyle = DPURPLE
    ctx.fill()

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

    // Render celebration particles
    ctx.fillStyle = GREEN
    renderParticles(celebrationParticles, ctx)
}
