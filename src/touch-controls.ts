import { keys } from "./core/input"
import { HEIGHT, WIDTH, WHITE, DDGREEN } from "./const"
import { pointInRect } from "./core/math"
import { currentScene, Scene } from "./scene-manager"

interface Button {
    x: number
    y: number
    key: string
    pressed: boolean
}

const BUTTON_SIZE = 80
const BUTTON_MARGIN = 20
const BUTTON_ALPHA = 0.6

export const uiButtons: Button[] = [
    {
        x: WIDTH - BUTTON_MARGIN - BUTTON_SIZE,
        y: HEIGHT - BUTTON_MARGIN - BUTTON_SIZE,
        key: "↶",
        pressed: false,
    },
    {
        x: WIDTH - BUTTON_MARGIN - BUTTON_SIZE,
        y: HEIGHT - BUTTON_MARGIN - BUTTON_SIZE * 2 - 10,
        key: "R",
        pressed: false,
    },
]
export const touchButtons: Button[] = [
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
]

export const updateTouchControls = () => {
    if (currentScene === Scene.Game) {
        uiButtons.forEach((b) => {
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

        if (keys.hasTouch) {
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
    }
}

export const renderTouchControls = (ctx: CanvasRenderingContext2D) => {
    ctx.font = "24px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    uiButtons.forEach((button) => {
        ctx.beginPath()
        ctx.roundRect(button.x, button.y, BUTTON_SIZE, BUTTON_SIZE, 4)
        ctx.closePath()
        ctx.fillStyle = button.pressed ? WHITE : DDGREEN
        ctx.globalAlpha = button.pressed ? 1 : BUTTON_ALPHA
        ctx.fill()

        ctx.fillStyle = WHITE

        const centerX = button.x + BUTTON_SIZE / 2
        const centerY = button.y + BUTTON_SIZE / 2

        ctx.fillText(button.key, centerX, centerY)
    })

    if (keys.hasTouch) {
        touchButtons.forEach((button) => {
            ctx.beginPath()
            ctx.roundRect(button.x, button.y, BUTTON_SIZE, BUTTON_SIZE, 4)
            ctx.closePath()
            ctx.fillStyle = button.pressed ? WHITE : DDGREEN
            ctx.globalAlpha = button.pressed ? 1 : BUTTON_ALPHA
            ctx.fill()

            ctx.fillStyle = WHITE
            ctx.font = "24px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const centerX = button.x + BUTTON_SIZE / 2
            const centerY = button.y + BUTTON_SIZE / 2

            ctx.fillText(button.key, centerX, centerY)
        })
    }

    ctx.globalAlpha = 1
}
