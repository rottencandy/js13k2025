import {
    GL_ARRAY_BUFFER,
    GL_FLOAT,
    GL_STATIC_DRAW,
    GL_TRIANGLES,
} from "./gl-constants"
import { createShaderProgram } from "./webgl"
import { cam } from "../camera"
import { RED } from "src/const"

let shaderProgram: WebGLProgram
let vao: WebGLVertexArrayObject
let positionUniformLocation: WebGLUniformLocation
let sizeUniformLocation: WebGLUniformLocation
let resolutionUniformLocation: WebGLUniformLocation

export const initRectRenderer = (gl: WebGL2RenderingContext) => {
    const vertexShaderSource = `#version 300 es
in vec2 a_position;
uniform vec2 u_position;
uniform vec2 u_size;
uniform vec2 u_resolution;

void main() {
    vec2 pixelPos = a_position * u_size + u_position;
    vec2 clipSpace = ((pixelPos / u_resolution) * 2.0) - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);
}`

    const fragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 outColor;

void main() {
    outColor = vec4(1.0, 0.0, 0.0, 1.0);
}`

    shaderProgram = createShaderProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource,
    )
    positionUniformLocation = gl.getUniformLocation(
        shaderProgram,
        "u_position",
    )!
    sizeUniformLocation = gl.getUniformLocation(shaderProgram, "u_size")!
    resolutionUniformLocation = gl.getUniformLocation(
        shaderProgram,
        "u_resolution",
    )!

    // Create unit rectangle vertices (0,0 to 1,1) with counter-clockwise winding
    const vertices = new Float32Array([
        // top-left
        0, 0,
        // bottom-left
        0, 1,
        // top-right
        1, 0,
        // top-right
        1, 0,
        // bottom-left
        0, 1,
        // bottom-right
        1, 1,
    ])

    // Create vertex array object
    vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)

    // Create and setup vertex buffer
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(GL_ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(GL_ARRAY_BUFFER, vertices, GL_STATIC_DRAW)

    const positionAttributeLocation = gl.getAttribLocation(
        shaderProgram,
        "a_position",
    )
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, GL_FLOAT, false, 0, 0)
}

export const drawRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
) => {
    ctx.fillStyle = RED
    ctx.fillRect(x - cam.x, y - cam.y, width, height)
}

export const drawRectGL = (
    gl: WebGL2RenderingContext,
    x: number,
    y: number,
    width: number,
    height: number,
) => {
    gl.useProgram(shaderProgram)
    gl.bindVertexArray(vao)

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)
    gl.uniform2f(positionUniformLocation, x, y)
    gl.uniform2f(sizeUniformLocation, width, height)

    gl.drawArrays(GL_TRIANGLES, 0, 6)
}
