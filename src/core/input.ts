export const keys = {
    btn: {
        spc: false,
        esc: false,
        clk: false,
        z: false,
    },
    btnp: {
        up: false,
        lf: false,
        dn: false,
        rt: false,
        spc: false,
        clk: false,
        esc: false,
        z: false,
    },
}

/**
 * Initialize onkey listeners
 */
export const initInput = (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
) => {
    let dirty = false
    let gamepad: Gamepad | undefined = undefined
    const hasTouch = "ontouchstart" in window
    const dirPressed = {
        up: false,
        lf: false,
        dn: false,
        rt: false,
    }
    const lastFrame = {
        up: false,
        lf: false,
        dn: false,
        rt: false,
        spc: false,
        clk: false,
        esc: false,
        z: false,
    }

    const setKeyState =
        (pressed: boolean) =>
        ({ code }: { code: string }) => {
            dirty = true
            switch (code) {
                case "ArrowUp":
                case "KeyW":
                    dirPressed.up = pressed
                    break
                case "ArrowDown":
                case "KeyS":
                    dirPressed.dn = pressed
                    break
                case "ArrowLeft":
                case "KeyA":
                    dirPressed.lf = pressed
                    break
                case "ArrowRight":
                case "KeyD":
                    dirPressed.rt = pressed
                    break
                case "KeyZ":
                    keys.btn.z = pressed
                    break
                case "Escape":
                    keys.btn.esc = pressed
                    break
                case "Space":
                    keys.btn.spc = pressed
                    break
            }
        }

    onkeydown = setKeyState(true)
    onkeyup = setKeyState(false)

    // not using `window` breaks chrome
    window.ongamepadconnected = (e) => {
        // only consider gamepads with analog sticks
        if (e.gamepad.axes.length > 1 && e.gamepad.buttons.length > 0) {
            gamepad = e.gamepad
        }
    }
    window.ongamepaddisconnected = () => {
        gamepad = undefined
    }

    // prevent long touch effect on touch devices
    // only needed if not preventing on other pointer events
    oncontextmenu = (e) => {
        e.preventDefault()
    }

    canvas.onpointerdown = () => (keys.btn.clk = true)
    canvas.onpointerup = () => (keys.btn.clk = false)

    return () => {
        keys.btnp.up = dirPressed.up && !lastFrame.up
        keys.btnp.dn = dirPressed.dn && !lastFrame.dn
        keys.btnp.lf = dirPressed.lf && !lastFrame.lf
        keys.btnp.rt = dirPressed.rt && !lastFrame.rt
        keys.btnp.clk = keys.btn.clk && !lastFrame.clk
        keys.btnp.esc = keys.btn.esc && !lastFrame.esc
        keys.btnp.spc = keys.btn.spc && !lastFrame.spc
        keys.btnp.z = keys.btn.z && !lastFrame.z

        lastFrame.up = dirPressed.up
        lastFrame.dn = dirPressed.dn
        lastFrame.lf = dirPressed.lf
        lastFrame.rt = dirPressed.rt
        lastFrame.clk = keys.btn.clk
        lastFrame.esc = keys.btn.esc
        lastFrame.spc = keys.btn.spc
        lastFrame.z = keys.btn.z
    }
}
