import { HEIGHT, WIDTH } from "./const"
import { resize } from "./core/canvas"
import { createRenderables, renderGrid } from "./core/grid"
import { loop } from "./core/loop"
import { gridData } from "./data/grid-data"

const canvas = document.getElementById("c") as HTMLCanvasElement

const ctx = canvas.getContext("2d")!

// display note if device is in portrait
if (innerWidth < innerHeight) {
    alert("for best experience use landscape mode")
}

;(onresize = () => {
    resize(canvas, WIDTH, HEIGHT)
})()

// Grid configuration
const CELL_SIZE = 100

// Create renderable items array once
const renderables = createRenderables(gridData, CELL_SIZE)

loop(
    // physics step
    (dt) => {},
    // render step
    () => {
        ctx.fillStyle = "#1a1a1a"
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        renderGrid(ctx, renderables, CELL_SIZE)
    },
)
