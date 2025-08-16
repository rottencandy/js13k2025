export const initWebGL2Context = (
    canvas: HTMLCanvasElement,
): WebGL2RenderingContext => {
    const gl = canvas.getContext("webgl2")

    if (!gl) {
        throw new Error("WebGL2 is not supported")
    }

    return gl
}

export const createShaderProgram = (
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
): WebGLProgram => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(`Vertex shader compilation failed: ${gl.getShaderInfoLog(vertexShader)}`)
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(`Fragment shader compilation failed: ${gl.getShaderInfoLog(fragmentShader)}`)
    }

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Shader program linking failed: ${gl.getProgramInfoLog(program)}`)
    }

    return program
}
