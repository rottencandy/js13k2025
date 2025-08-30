export type Vec2 = Float32Array
export type Mat3 = Float32Array

/** Try to use this operator directly */
export const floor = (x: number) => ~~x

export const rad = (a: number) => (a * Math.PI) / 180

export const rand = (a = 0, b = 1) => b + (a - b) * Math.random()

export const randInt = (a: number, b: number) => Math.round(rand(a, b))

export const clamp = (value: number, min: number, max: number) =>
    value < min ? min : value > max ? max : value

/**
 * Distance b/w 2 vectors
 */
export const distance = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1
    const dy = y2 - y1
    return Math.sqrt(dx * dx + dy * dy)
}

// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
export const aabb = (
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number,
) => x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2

export const pointInRect = (
    px: number,
    py: number,
    x: number,
    y: number,
    w: number,
    h: number,
) => px > x && py > y && px < x + w && py < y + h

export const ccCollision = (
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number,
) => distance(x1, y1, x2, y2) < r1 + r2

export const cpCollision = (
    cx: number,
    cy: number,
    r: number,
    px: number,
    py: number,
) => distance(cx, cy, px, py) < r

/**
 * Linearly interpolate between two values.
 * `weight` should be between 0 & 1, but may be larger for extrapolation
 */
export const lerp = (from: number, to: number, weight: number) =>
    from + (to - from) * weight

/** Pick a random element from given array and return it */
export const pickRandom = <T extends unknown>(arr: T[]) => {
    const i = randInt(0, arr.length - 1)
    return arr[i]
}

/** Remove a random element from given array and return it */
export const extractRandom = <T extends unknown>(arr: T[]) => {
    const i = randInt(0, arr.length - 1)
    const [ele] = arr.splice(i, 1)
    return ele
}

// Vec2 creation
export const vec2Create = (x = 0, y = 0): Vec2 => new Float32Array([x, y])

// Mat3 creation
export const mat3Create = (): Mat3 => new Float32Array(9)

// Vec2 operations (in-place)
export const vec2Set = (out: Vec2, x: number, y: number) => {
    out[0] = x
    out[1] = y
}

export const vec2Add = (out: Vec2, a: Vec2, b: Vec2) => {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
}

export const vec2Sub = (out: Vec2, a: Vec2, b: Vec2) => {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
}

export const vec2Scale = (out: Vec2, a: Vec2, scale: number) => {
    out[0] = a[0] * scale
    out[1] = a[1] * scale
}

export const vec2Dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1]

export const vec2Length = (a: Vec2) => Math.sqrt(a[0] * a[0] + a[1] * a[1])

export const vec2Normalize = (out: Vec2, a: Vec2) => {
    const len = vec2Length(a)
    if (len > 0) {
        out[0] = a[0] / len
        out[1] = a[1] / len
    }
}

export const vec2Transform = (out: Vec2, a: Vec2, m: Mat3) => {
    const x = a[0]
    const y = a[1]
    out[0] = m[0] * x + m[3] * y + m[6]
    out[1] = m[1] * x + m[4] * y + m[7]
}

// Mat3 operations (in-place)
export const mat3Identity = (out: Mat3) => {
    out[0] = 1; out[1] = 0; out[2] = 0
    out[3] = 0; out[4] = 1; out[5] = 0
    out[6] = 0; out[7] = 0; out[8] = 1
}

export const mat3Translate = (out: Mat3, a: Mat3, v: Vec2) => {
    const a00 = a[0], a01 = a[1], a02 = a[2]
    const a10 = a[3], a11 = a[4], a12 = a[5]
    const a20 = a[6], a21 = a[7], a22 = a[8]
    const x = v[0], y = v[1]

    out[0] = a00; out[1] = a01; out[2] = a02
    out[3] = a10; out[4] = a11; out[5] = a12
    out[6] = x * a00 + y * a10 + a20
    out[7] = x * a01 + y * a11 + a21
    out[8] = x * a02 + y * a12 + a22
}

export const mat3Scale = (out: Mat3, a: Mat3, v: Vec2) => {
    const x = v[0], y = v[1]

    out[0] = x * a[0]; out[1] = x * a[1]; out[2] = x * a[2]
    out[3] = y * a[3]; out[4] = y * a[4]; out[5] = y * a[5]
    out[6] = a[6]; out[7] = a[7]; out[8] = a[8]
}

export const mat3Rotate = (out: Mat3, a: Mat3, rad: number) => {
    const a00 = a[0], a01 = a[1], a02 = a[2]
    const a10 = a[3], a11 = a[4], a12 = a[5]
    const a20 = a[6], a21 = a[7], a22 = a[8]

    const s = Math.sin(rad)
    const c = Math.cos(rad)

    out[0] = c * a00 + s * a10
    out[1] = c * a01 + s * a11
    out[2] = c * a02 + s * a12
    out[3] = c * a10 - s * a00
    out[4] = c * a11 - s * a01
    out[5] = c * a12 - s * a02
    out[6] = a20; out[7] = a21; out[8] = a22
}

export const mat3Multiply = (out: Mat3, a: Mat3, b: Mat3) => {
    const a00 = a[0], a01 = a[1], a02 = a[2]
    const a10 = a[3], a11 = a[4], a12 = a[5]
    const a20 = a[6], a21 = a[7], a22 = a[8]

    const b00 = b[0], b01 = b[1], b02 = b[2]
    const b10 = b[3], b11 = b[4], b12 = b[5]
    const b20 = b[6], b21 = b[7], b22 = b[8]

    out[0] = b00 * a00 + b01 * a10 + b02 * a20
    out[1] = b00 * a01 + b01 * a11 + b02 * a21
    out[2] = b00 * a02 + b01 * a12 + b02 * a22
    out[3] = b10 * a00 + b11 * a10 + b12 * a20
    out[4] = b10 * a01 + b11 * a11 + b12 * a21
    out[5] = b10 * a02 + b11 * a12 + b12 * a22
    out[6] = b20 * a00 + b21 * a10 + b22 * a20
    out[7] = b20 * a01 + b21 * a11 + b22 * a21
    out[8] = b20 * a02 + b21 * a12 + b22 * a22
}

// interpolation functions

export const LINEAR = (t: number) => t
export const EASEOUTQUAD = (t: number) => t * (2 - t)
export const THERENBACK = (t: number) => 1 - Math.abs(t * 2 - 1)
export const EASEOUTQUINT = (t: number) => 1 + --t * t * t * t * t
export const EASEINQUINT = (t: number) => t * t * t * t * t
export const EASEINOUTCUBIC = (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
// elastic bounce effect at the beginning
export const EASEINELASTIC = (t: number) =>
    (0.04 - 0.04 / t) * Math.sin(25 * t) + 1
// elastic bounce effect at the end
export const EASEOUTELASTIC = (t: number) =>
    ((0.04 * t) / --t) * Math.sin(25 * t)
// elastic bounce effect at the beginning and end
export const EASEINOUTELASTIC = (t: number) =>
    (t -= 0.5) < 0
        ? (0.02 + 0.01 / t) * Math.sin(50 * t)
        : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1
