import { CELL_SIZE } from "./const"
import { camera } from "./camera"
import { rand } from "./core/math"

const MAX_PARTICLES = 100
const PARTICLE_LIFE = 600

// ECS style particle system
const particles = {
    x: new Float32Array(MAX_PARTICLES),
    y: new Float32Array(MAX_PARTICLES),
    vx: new Float32Array(MAX_PARTICLES),
    vy: new Float32Array(MAX_PARTICLES),
    life: new Float32Array(MAX_PARTICLES),
    maxLife: new Float32Array(MAX_PARTICLES),
    alive: new Array(MAX_PARTICLES).fill(false),
}

let particleCount = 0

const getDeadParticleIndex = (): number => {
    for (let i = 0; i < MAX_PARTICLES; i++) {
        if (!particles.alive[i]) {
            return i
        }
    }
    return -1
}

export const emitParticles = (
    worldX: number,
    worldY: number,
    count: number = 32,
) => {
    const centerX = worldX * CELL_SIZE + CELL_SIZE / 2
    const centerY = worldY * CELL_SIZE + CELL_SIZE / 2

    for (let i = 0; i < count; i++) {
        const index = getDeadParticleIndex()
        if (index === -1) continue // No available particles

        const angle = (i / count) * Math.PI * 2
        const speed = rand(0.1, 0.5)

        particles.x[index] = centerX
        particles.y[index] = centerY
        particles.vx[index] = Math.cos(angle) * speed
        particles.vy[index] = Math.sin(angle) * speed
        particles.life[index] = PARTICLE_LIFE
        particles.maxLife[index] = PARTICLE_LIFE
        particles.alive[index] = true

        if (index >= particleCount) {
            particleCount = index + 1
        }
    }
}

export const updateParticles = (deltaTime: number) => {
    for (let i = 0; i < particleCount; i++) {
        if (!particles.alive[i]) continue

        particles.x[i] += particles.vx[i] * deltaTime
        particles.y[i] += particles.vy[i] * deltaTime
        particles.life[i] -= deltaTime

        if (particles.life[i] <= 0) {
            particles.alive[i] = false
        }
    }
}

export const renderParticles = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "black"

    for (let i = 0; i < particleCount; i++) {
        if (!particles.alive[i]) continue

        const alpha = particles.life[i] / particles.maxLife[i]
        const radius = 2 + (1 - alpha) * 3

        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(
            particles.x[i] - camera.x,
            particles.y[i] - camera.y,
            radius,
            0,
            Math.PI * 2,
        )
        ctx.closePath()
        ctx.fill()
    }

    ctx.globalAlpha = 1
}
