import { HEIGHT, WIDTH } from "./const"
import { resize } from "./core/canvas"
import { loop } from "./core/loop"
import { initInput } from "./core/input"
import { loadLevel, updateLevel, renderLevel } from "./level-manager"

const canvas = document.getElementById("c") as HTMLCanvasElement

const ctx = canvas.getContext("2d")!

// display note if device is in portrait
if (innerWidth < innerHeight) {
    alert("for best experience use landscape mode")
}

;(onresize = () => {
    resize(canvas, WIDTH, HEIGHT)
})()

// Initialize core components
const checkInput = initInput(canvas, WIDTH, HEIGHT)

// Load initial level
loadLevel(0)

loop(
    // physics step
    (dt) => {
        checkInput()
        updateLevel(dt)
    },
    // render step
    () => {
        ctx.fillStyle = "#1a1a1a"
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        renderLevel(ctx)
    },
)
