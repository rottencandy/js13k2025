import { WIDTH, HEIGHT, LBLUE, BLUE, WHITE } from "./const"
import { rand } from "./core/math"

const CLOUD_SEED = 42
let seedValue = CLOUD_SEED

const random = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280
    return seedValue / 233280
}

const clouds: Array<{
    x: number
    baseY: number
    size: number
    speed: number
    phase: number
    alpha: number
    bubbles: Array<{
        relativeX: number
        relativeY: number
        size: number
    }>
}> = []

const initClouds = () => {
    seedValue = CLOUD_SEED
    clouds.length = 0

    const cloudCount = 8
    for (let i = 0; i < cloudCount; i++) {
        const size = 20 + random() * 30
        const bubbleCount = 5 + Math.floor(random() * 3)
        const bubbles = []

        for (let j = 0; j < bubbleCount; j++) {
            bubbles.push({
                relativeX: (random() - 0.5) * 1.5,
                relativeY: (random() - 0.5) * 0.8,
                size: 0.3 + random() * 0.4,
            })
        }

        clouds.push({
            x: random() * (WIDTH + 200) - 100,
            baseY: random() * HEIGHT * 0.6,
            size,
            speed: 10 + random() * 20,
            phase: rand(0, Math.PI * 2),
            alpha: rand(0.1, 0.7),
            bubbles,
        })
    }
}

export const initBackground = () => {
    initClouds()
}

export const updateBackground = (dt: number) => {
    for (const cloud of clouds) {
        cloud.x += cloud.speed * dt
        if (cloud.x > WIDTH + 100) {
            cloud.x = -100
        }
    }
}

const drawCloud = (
    ctx: CanvasRenderingContext2D,
    cloud: (typeof clouds)[0],
    x: number,
    y: number,
) => {
    ctx.beginPath()

    for (const bubble of cloud.bubbles) {
        const bubbleX = x + bubble.relativeX * cloud.size
        const bubbleY = y + bubble.relativeY * cloud.size
        const bubbleSize = cloud.size * bubble.size

        ctx.moveTo(bubbleX + bubbleSize, bubbleY)
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2)
    }

    ctx.fillStyle = WHITE
    ctx.globalAlpha = cloud.alpha
    ctx.fill()
    ctx.globalAlpha = 1
}

export const renderBackground = (
    ctx: CanvasRenderingContext2D,
    time: number = 0,
) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT)
    gradient.addColorStop(0, LBLUE)
    gradient.addColorStop(1, BLUE)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    for (const cloud of clouds) {
        const y = cloud.baseY + Math.sin(time * 0.5 + cloud.phase) * 3
        drawCloud(ctx, cloud, cloud.x, y)
    }
}
