import { HEIGHT, WIDTH } from "./const"
import { resize } from "./core/canvas"
import { loop } from "./core/loop"

const canvas = document.getElementById("c") as HTMLCanvasElement
const offscreenCanvas = document.createElement("canvas")

;(async () => {
    // display note if device is in portrait
    if (innerWidth < innerHeight) {
        alert("for best experience use landscape mode")
    }
    ;(onresize = () => {
        resize(offscreenCanvas, WIDTH, HEIGHT)
        resize(canvas, WIDTH * 4, HEIGHT * 4)
    })()
    console.log("hello")

    loop(
        (dt) => {
        },
        () => {
        },
    )
})()
