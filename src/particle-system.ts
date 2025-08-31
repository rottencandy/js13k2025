import { CELL_SIZE } from "./const"
import { cam } from "./camera"
import { rand } from "./core/math"

const MAX_PARTICLES = 100
const PARTICLE_LIFE = 600

export interface ParticleSystem {
    x: Float32Array
    y: Float32Array
    vx: Float32Array
    vy: Float32Array
    life: Float32Array
    maxLife: Float32Array
    alive: boolean[]
    particleCount: number
    particleSize: number
}

export const createParticleSystem = (particleSize = 30): ParticleSystem => ({
    x: new Float32Array(MAX_PARTICLES),
    y: new Float32Array(MAX_PARTICLES),
    vx: new Float32Array(MAX_PARTICLES),
    vy: new Float32Array(MAX_PARTICLES),
    life: new Float32Array(MAX_PARTICLES),
    maxLife: new Float32Array(MAX_PARTICLES),
    alive: new Array(MAX_PARTICLES).fill(false),
    particleCount: 0,
    particleSize,
})

const getDeadParticleIndex = (system: ParticleSystem): number => {
    for (let i = 0; i < MAX_PARTICLES; i++) {
        if (!system.alive[i]) {
            return i
        }
    }
    return -1
}

export const emitParticles = (
    system: ParticleSystem,
    worldX: number,
    worldY: number,
    count: number = 4,
) => {
    const centerX = worldX * CELL_SIZE + CELL_SIZE / 2
    const centerY = worldY * CELL_SIZE + CELL_SIZE / 2

    for (let i = 0; i < count; i++) {
        const index = getDeadParticleIndex(system)
        if (index === -1) break // No available particles

        const angle = Math.random() * Math.PI * 2
        const speed = rand(0.05, 0.1)

        system.x[index] = centerX
        system.y[index] = centerY
        system.vx[index] = Math.cos(angle) * speed
        system.vy[index] = Math.sin(angle) * speed
        system.life[index] = PARTICLE_LIFE
        system.maxLife[index] = PARTICLE_LIFE
        system.alive[index] = true

        if (index >= system.particleCount) {
            system.particleCount = index + 1
        }
    }
}

export const updateParticles = (system: ParticleSystem, deltaTime: number) => {
    for (let i = 0; i < system.particleCount; i++) {
        if (!system.alive[i]) continue

        system.x[i] += system.vx[i] * deltaTime
        system.y[i] += system.vy[i] * deltaTime
        system.life[i] -= deltaTime

        if (system.life[i] <= 0) {
            system.alive[i] = false
        }
    }
}

export const renderParticles = (
    system: ParticleSystem,
    ctx: CanvasRenderingContext2D,
) => {
    for (let i = 0; i < system.particleCount; i++) {
        if (!system.alive[i]) continue

        const alpha = system.life[i] / system.maxLife[i]
        const radius = system.particleSize + (1 - alpha) * 20

        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(
            system.x[i] - cam.x,
            system.y[i] - cam.y,
            radius,
            0,
            Math.PI * 2,
        )
        ctx.closePath()
        ctx.fill()
    }
    ctx.globalAlpha = 1
}
