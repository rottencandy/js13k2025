import { setScene, Scene } from "./scene-manager"
import { createTimer, startTimer, updateTimer } from "./core/timer"

let showingWinAnimation = false
const winAnimationTimer = createTimer(2000, () => {
    showingWinAnimation = false
    setScene(Scene.LevelSelect)
})

export const initWinAnimation = () => {
    showingWinAnimation = false
}

export const startWinAnimation = () => {
    showingWinAnimation = true
    startTimer(winAnimationTimer)
}

export const updateWinAnimation = (deltaTime: number): boolean => {
    if (showingWinAnimation) {
        updateTimer(winAnimationTimer, deltaTime)
        return true
    }
    return false
}

export const renderWinAnimation = (ctx: CanvasRenderingContext2D) => {
    if (showingWinAnimation) {
        ctx.save()
        ctx.fillStyle = "gold"
        ctx.font = "bold 48px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const canvas = ctx.canvas
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        ctx.fillText("COMPLETE!", centerX, centerY)
        ctx.restore()
    }
}

export const isShowingWinAnimation = () => showingWinAnimation
