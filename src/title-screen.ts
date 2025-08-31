import { Scene, setScene } from "./scene-manager"
import { keys } from "./core/input"
import { DDBLUE, DDGREEN, DGREEN, GREEN, HEIGHT, WIDTH, YELLOW } from "./const"
import { startTransitionAnimation } from "./transition-animation"

const scrollOffset = { x: 0, y: 0 }
const TILE_SIZE = 120
const TILE_GAP = 70

export const updateTitleScreen = () => {
    scrollOffset.x += 0.5
    scrollOffset.y += 0.3

    if (keys.btnp.spc || keys.btn.clk) {
        startTransitionAnimation(WIDTH / 2, HEIGHT / 2, false, DDBLUE, () => {
            setScene(Scene.LevelSelect)
        })
    }
}

export const renderTitleScreen = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
) => {
    ctx.fillStyle = DDGREEN
    ctx.fillRect(0, 0, width, height)

    // Draw scrolling tiled rectangles backdrop
    const offsetX = scrollOffset.x % (TILE_SIZE + TILE_GAP)
    const offsetY = scrollOffset.y % (TILE_SIZE + TILE_GAP)

    for (
        let x = -offsetX;
        x < width + TILE_SIZE + TILE_GAP;
        x += TILE_SIZE + TILE_GAP
    ) {
        for (
            let y = -offsetY;
            y < height + TILE_SIZE + TILE_GAP;
            y += TILE_SIZE + TILE_GAP
        ) {
            ctx.fillStyle = DGREEN
            ctx.fillRect(x + 20, y + 20, TILE_SIZE, TILE_SIZE)
            ctx.fillStyle = GREEN
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        }
    }

    const textX = width / 2
    const textY = height / 2

    ctx.fillStyle = YELLOW
    ctx.beginPath()
    ctx.roundRect(textX - 200, textY - 70, 400, 100, 20)
    ctx.closePath()
    ctx.fill()

    ctx.textAlign = "center"
    ctx.font = "48px Arial"

    ctx.fillStyle = DGREEN
    ctx.fillText("UNTITLED", textX, textY)
}
