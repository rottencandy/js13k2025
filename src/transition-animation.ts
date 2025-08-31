import { createTimer, startTimer, updateTimer } from "./core/timer"
import { EASEOUTQUAD } from "./core/math"
import { WIDTH } from "./const"

let showingWinAnimation = false
let zoomX = 0
let zoomY = 0
let isInverted = false
let fill = "#fff"
let onComplete: (() => void) | undefined
const timer = createTimer(900)

export const startTransitionAnimation = (
    x: number,
    y: number,
    inverted: boolean,
    color: string,
    onEnd?: () => void,
) => {
    showingWinAnimation = true
    zoomX = x
    zoomY = y
    isInverted = inverted
    fill = color
    startTimer(timer)
    onComplete = onEnd
}

export const updateTransitionAnimation = (deltaTime: number) => {
    if (showingWinAnimation) {
        if (updateTimer(timer, deltaTime)) {
            showingWinAnimation = false
            onComplete?.()
        }
    }
}

export const isTransitioning = () => {
    return showingWinAnimation
}

export const renderTransitionAnimation = (ctx: CanvasRenderingContext2D) => {
    if (showingWinAnimation) {
        const canvas = ctx.canvas
        const progress = EASEOUTQUAD(timer.elapsed / timer.duration)
        const radius = WIDTH * (isInverted ? progress : 1 - progress)

        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, canvas.width, canvas.height)
        ctx.arc(zoomX, zoomY, radius, 0, Math.PI * 2, true)
        ctx.clip()

        ctx.fillStyle = fill
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
    }
}
