import { keys } from "./core/input"
import { HEIGHT, WIDTH, WHITE, CYAN } from "./const"
import { pointInRect } from "./core/math"
import { currentScene, Scene } from "./scene-manager"

interface TouchButton {
    x: number
    y: number
    key: string
    pressed: boolean
}

const BUTTON_SIZE = 80
const BUTTON_MARGIN = 20
const BUTTON_ALPHA = 0.6

export const touchButtons: TouchButton[] = [
    {
        x: BUTTON_MARGIN + BUTTON_SIZE + 10,
        y: HEIGHT - BUTTON_MARGIN - BUTTON_SIZE * 2 - 10,
        key: "▲",
        pressed: false,
    },
    {
        x: BUTTON_MARGIN + BUTTON_SIZE + 10,
        y: HEIGHT - BUTTON_MARGIN - BUTTON_SIZE,
        key: "▼",
        pressed: false,
    },
    {
        x: BUTTON_MARGIN,
        y: HEIGHT - BUTTON_MARGIN - BUTTON_SIZE,
        key: "◀",
        pressed: false,
    },
    {
        x: BUTTON_MARGIN + BUTTON_SIZE * 2 + 20,
        y: HEIGHT - BUTTON_MARGIN - BUTTON_SIZE,
        key: "▶",
        pressed: false,
    },
    {
        x: WIDTH - BUTTON_MARGIN - BUTTON_SIZE,
        y: HEIGHT - BUTTON_MARGIN - BUTTON_SIZE,
        key: "↶",
        pressed: false,
    },
]

export const updateTouchControls = () => {
    if (!keys.hasTouch || currentScene !== Scene.Game) return

    touchButtons.forEach((b) => {
        b.pressed = false
        if (
            keys.btn.clk &&
            pointInRect(
                keys.ptr.x,
                keys.ptr.y,
                b.x,
                b.y,
                BUTTON_SIZE,
                BUTTON_SIZE,
            )
        ) {
            b.pressed = true
        }
    })
}

export const renderTouchControls = (ctx: CanvasRenderingContext2D) => {
    if (!keys.hasTouch) return

    ctx.save()

    touchButtons.forEach((button) => {
        ctx.globalAlpha = button.pressed ? 1 : BUTTON_ALPHA

        ctx.fillStyle = button.pressed ? WHITE : CYAN
        ctx.fillRect(button.x, button.y, BUTTON_SIZE, BUTTON_SIZE)

        ctx.fillStyle = WHITE
        ctx.font = "24px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const centerX = button.x + BUTTON_SIZE / 2
        const centerY = button.y + BUTTON_SIZE / 2

        ctx.fillText(button.key, centerX, centerY)
    })

    ctx.restore()
}
