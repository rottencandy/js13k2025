import { HEIGHT, WIDTH } from "./const"
import { resize } from "./core/canvas"
import { loop } from "./core/loop"
import { initInput } from "./core/input"
import { updateScene, renderScene } from "./scene-manager"

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

loop(
    // physics step
    (dt) => {
        checkInput()
        updateScene(dt)
    },
    // render step
    () => {
        ctx.fillStyle = "#4c4c4c"
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        renderScene(ctx, WIDTH, HEIGHT)
    },
)
