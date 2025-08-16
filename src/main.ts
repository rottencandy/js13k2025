import { HEIGHT, WIDTH } from "./const"
import { resize } from "./core/canvas"
import {
    GL_BLEND,
    GL_COLOR_BUFFER_BIT,
    GL_CULL_FACE,
    GL_DEPTH_BUFFER_BIT,
    GL_DEPTH_TEST,
    GL_LEQUAL,
    GL_ONE_MINUS_SRC_ALPHA,
    GL_SRC_ALPHA,
} from "./core/gl-constants"
import { createRenderables, renderGrid } from "./core/grid"
import { loop } from "./core/loop"
import { initRectRenderer } from "./core/rect"
import { gridData } from "./data/grid-data"

const canvas = document.getElementById("c") as HTMLCanvasElement

const gl = canvas.getContext("webgl2")!
gl.enable(GL_CULL_FACE)
gl.enable(GL_DEPTH_TEST)
gl.enable(GL_BLEND)
gl.depthFunc(GL_LEQUAL)
gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
// For pre-multiplied alpha textures
//gl.blendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
gl.clearDepth(1)

// display note if device is in portrait
if (innerWidth < innerHeight) {
    alert("for best experience use landscape mode")
}

;(onresize = () => {
    resize(canvas, WIDTH, HEIGHT)
    gl.viewport(0, 0, WIDTH, HEIGHT)
})()

initRectRenderer(gl)

// Grid configuration
const CELL_SIZE = 100

// Create renderable items array once
const renderables = createRenderables(gridData, CELL_SIZE)

loop(
    // physics step
    (dt) => {},
    // render step
    () => {
        gl.clearColor(0.1, 0.1, 0.1, 0.1)
        gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)

        renderGrid(gl, renderables, CELL_SIZE)
    },
)
