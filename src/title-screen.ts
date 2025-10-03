import { Scene, setScene } from "./scene-manager"
import { keys } from "./core/input"
import {
    BLACK,
    DDBLUE,
    DDGREEN,
    DGREEN,
    GREEN,
    HEIGHT,
    WIDTH,
    YELLOW,
} from "./const"
import { startTransitionAnimation } from "./transition-animation"
import { SVG_LOGO } from "./svg"
import { initSynth, startMusicLoop } from "./synth"

const scrollOffset = { x: 0, y: 0 }
const TILE_SIZE = 80
const TILE_GAP = 90

export const updateScrollingBackdrop = (dt: number) => {
    scrollOffset.x += 0.05 * dt
    scrollOffset.y += 0.03 * dt
}

export const updateTitleScreen = (dt: number) => {
    updateScrollingBackdrop(dt)

    if (keys.btnp.sel || keys.btn.clk) {
        initSynth()
        startMusicLoop()
        startTransitionAnimation(WIDTH / 2, HEIGHT / 2, false, DDBLUE, () => {
            setScene(Scene.LevelSelect)
        })
    }
}

export const renderScrollingBackdrop = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = DDGREEN
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Draw scrolling tiled rectangles backdrop
    const offsetX = scrollOffset.x % (TILE_SIZE + TILE_GAP)
    const offsetY = scrollOffset.y % (TILE_SIZE + TILE_GAP)

    for (
        let x = -offsetX;
        x < WIDTH + TILE_SIZE + TILE_GAP;
        x += TILE_SIZE + TILE_GAP
    ) {
        for (
            let y = -offsetY;
            y < HEIGHT + TILE_SIZE + TILE_GAP;
            y += TILE_SIZE + TILE_GAP
        ) {
            ctx.fillStyle = DGREEN
            ctx.translate(x, y)
            ctx.fill(SVG_LOGO)

            ctx.translate(-15, -15)
            ctx.fillStyle = GREEN
            ctx.fill(SVG_LOGO)

            ctx.setTransform(1, 0, 0, 1, 0, 0)
        }
    }
}

export const renderTitleScreen = (ctx: CanvasRenderingContext2D) => {
    renderScrollingBackdrop(ctx)

    const textX = WIDTH / 2
    const textY = HEIGHT / 2

    ctx.fillStyle = YELLOW
    ctx.beginPath()
    ctx.roundRect(textX - 300, textY - 70, 600, 100, 20)
    ctx.closePath()
    ctx.fill()

    ctx.textAlign = "center"
    ctx.font = "bold 48px Arial"

    ctx.strokeStyle = BLACK
    ctx.fillStyle = DGREEN
    ctx.strokeText("NON-MEWTONIAN CAT", textX, textY)
    ctx.strokeText("NON-MEWTONIAN CAT", textX + 1, textY + 1)
    ctx.fillText("NON-MEWTONIAN CAT", textX + 3, textY + 3)

    ctx.fillStyle = DGREEN
    ctx.font = "bold 24px Arial"
    ctx.fillText("made by saud", textX, textY + 450)
    ctx.fillText("originally for js13kgames 2025", textX, textY + 500)
}
