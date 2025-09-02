import { touchButtons, updateTouchControls } from "src/touch-controls"

export const keys = {
    hasTouch: false,
    ptr: { x: 0, y: 0 },
    ptrDown: { x: 0, y: 0 },
    btn: {
        sel: false,
        clk: false,
        undo: false,
    },
    btnp: {
        up: false,
        lf: false,
        dn: false,
        rt: false,
        sel: false,
        clk: false,
        undo: false,
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
    let gamepad: Gamepad | undefined = undefined
    keys.hasTouch = "ontouchstart" in window
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
        sel: false,
        clk: false,
        undo: false,
    }

    const setKeyState =
        (pressed: boolean) =>
        ({ code }: { code: string }) => {
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
                    keys.btn.undo = pressed
                    break
                case "Space":
                case "Enter":
                    keys.btn.sel = pressed
                    break
            }
        }

    onkeydown = setKeyState(true)
    onkeyup = setKeyState(false)

    // not using `window` breaks chrome
    window.ongamepadconnected = (e) => {
        gamepad = e.gamepad
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
    canvas.onpointermove = (e) => {
        const ratio = Math.min(innerWidth / width, innerHeight / height)
        keys.ptr.x = e.offsetX / ratio
        keys.ptr.y = e.offsetY / ratio
    }

    if (keys.hasTouch) {
        canvas.ontouchstart =
            canvas.ontouchmove =
            canvas.ontouchend =
            canvas.ontouchcancel =
                (e) => {
                    e.preventDefault()
                    if (keys.btn.clk) {
                        const offset = canvas.getBoundingClientRect()
                        const touch = e.touches[0]
                        const ratio = Math.min(
                            innerWidth / width,
                            innerHeight / height,
                        )
                        keys.ptr.x = (touch.clientX - offset.left) / ratio
                        keys.ptr.y = (touch.clientY - offset.top) / ratio
                    }
                }
    }

    return () => {
        if (keys.hasTouch) {
            updateTouchControls()
            dirPressed.up = touchButtons[0].pressed
            dirPressed.dn = touchButtons[1].pressed
            dirPressed.lf = touchButtons[2].pressed
            dirPressed.rt = touchButtons[3].pressed
            keys.btn.undo = touchButtons[4].pressed
        }

        if (keys.btn.clk) {
            keys.ptrDown = {
                x: keys.ptr.x,
                y: keys.ptr.y,
            }
        }

        if (gamepad) {
            // standard layout https://w3c.github.io/gamepad/#remapping
            keys.btn.sel = gamepad.buttons[0]?.pressed
            keys.btn.undo = gamepad.buttons[1]?.pressed
            dirPressed.up = gamepad.buttons[12]?.pressed
            dirPressed.dn = gamepad.buttons[13]?.pressed
            dirPressed.lf = gamepad.buttons[14]?.pressed
            dirPressed.rt = gamepad.buttons[15]?.pressed
        }

        keys.btnp.up = dirPressed.up && !lastFrame.up
        keys.btnp.dn = dirPressed.dn && !lastFrame.dn
        keys.btnp.lf = dirPressed.lf && !lastFrame.lf
        keys.btnp.rt = dirPressed.rt && !lastFrame.rt
        keys.btnp.clk = keys.btn.clk && !lastFrame.clk
        keys.btnp.sel = keys.btn.sel && !lastFrame.sel
        keys.btnp.undo = keys.btn.undo && !lastFrame.undo

        lastFrame.up = dirPressed.up
        lastFrame.dn = dirPressed.dn
        lastFrame.lf = dirPressed.lf
        lastFrame.rt = dirPressed.rt
        lastFrame.clk = keys.btn.clk
        lastFrame.sel = keys.btn.sel
        lastFrame.undo = keys.btn.undo
    }
}
