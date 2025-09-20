import {
    touchButtons,
    uiButtons,
    updateTouchControls,
} from "src/touch-controls"

export const keys = {
    hasTouch: false,
    ptr: { x: 0, y: 0 },
    ptrDown: { x: 0, y: 0 },
    btn: {
        up: false,
        lf: false,
        dn: false,
        rt: false,

        clk: false,
        sel: false,
        undo: false,
        reset: false,
    },
    btnp: {
        up: false,
        lf: false,
        dn: false,
        rt: false,

        sel: false,
        clk: false,
        undo: false,
        reset: false,
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
    const keyboardPressed = {
        up: false,
        lf: false,
        dn: false,
        rt: false,

        clk: false,
        sel: false,
        undo: false,
        reset: false,
    }
    const lastFrame = {
        up: false,
        lf: false,
        dn: false,
        rt: false,

        clk: false,
        sel: false,
        undo: false,
        reset: false,
    }

    const setKeyState =
        (pressed: boolean) =>
        ({ code }: { code: string }) => {
            switch (code) {
                case "ArrowUp":
                case "KeyW":
                    keyboardPressed.up = pressed
                    break
                case "ArrowDown":
                case "KeyS":
                    keyboardPressed.dn = pressed
                    break
                case "ArrowLeft":
                case "KeyA":
                    keyboardPressed.lf = pressed
                    break
                case "ArrowRight":
                case "KeyD":
                    keyboardPressed.rt = pressed
                    break
                case "KeyZ":
                    keyboardPressed.undo = pressed
                    break
                case "KeyR":
                    keyboardPressed.reset = pressed
                    break
                case "Space":
                case "Enter":
                    keyboardPressed.sel = pressed
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
        if (keys.btn.clk) {
            keys.ptrDown = {
                x: keys.ptr.x,
                y: keys.ptr.y,
            }
        }

        // first check keyboard buttons
        keys.btn.up = keyboardPressed.up
        keys.btn.dn = keyboardPressed.dn
        keys.btn.lf = keyboardPressed.lf
        keys.btn.rt = keyboardPressed.rt

        keys.btn.sel = keyboardPressed.sel
        keys.btn.undo = keyboardPressed.undo
        keys.btn.reset = keyboardPressed.reset

        // then check touch buttons
        updateTouchControls()
        keys.btn.up ||= touchButtons[0].pressed
        keys.btn.dn ||= touchButtons[1].pressed
        keys.btn.lf ||= touchButtons[2].pressed
        keys.btn.rt ||= touchButtons[3].pressed

        keys.btn.undo ||= uiButtons[0].pressed
        keys.btn.reset ||= uiButtons[1].pressed

        // then check gamepad buttons
        if (gamepad) {
            // standard layout https://w3c.github.io/gamepad/#remapping
            keys.btn.up ||= gamepad.buttons[12]?.pressed
            keys.btn.dn ||= gamepad.buttons[13]?.pressed
            keys.btn.lf ||= gamepad.buttons[14]?.pressed
            keys.btn.rt ||= gamepad.buttons[15]?.pressed

            keys.btn.sel ||= gamepad.buttons[0]?.pressed
            keys.btn.undo ||= gamepad.buttons[1]?.pressed
            keys.btn.reset ||= gamepad.buttons[2]?.pressed
        }

        // finally check if buttons are heldd
        keys.btnp.clk = keys.btn.clk && !lastFrame.clk
        keys.btnp.up = keys.btn.up && !lastFrame.up
        keys.btnp.dn = keys.btn.dn && !lastFrame.dn
        keys.btnp.lf = keys.btn.lf && !lastFrame.lf
        keys.btnp.rt = keys.btn.rt && !lastFrame.rt

        keys.btnp.sel = keys.btn.sel && !lastFrame.sel
        keys.btnp.undo = keys.btn.undo && !lastFrame.undo
        keys.btnp.reset = keys.btn.reset && !lastFrame.reset

        // save state for next frame
        lastFrame.clk = keys.btn.clk
        lastFrame.up = keys.btn.up
        lastFrame.dn = keys.btn.dn
        lastFrame.lf = keys.btn.lf
        lastFrame.rt = keys.btn.rt

        lastFrame.sel = keys.btn.sel
        lastFrame.undo = keys.btn.undo
        lastFrame.reset = keys.btn.reset
    }
}
