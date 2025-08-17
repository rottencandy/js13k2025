import { HEIGHT, WIDTH } from "./const"
import { resize } from "./core/canvas"
import { initLevel, renderLevel } from "./level"
import { loop } from "./core/loop"
import { levelData } from "./data/level-data"
import { initPlayer, updatePlayer, renderPlayer } from "./player"
import { initInput } from "./core/input"
import { initState } from "./state"

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

// Initialize game components
initLevel(levelData)
initState()
initPlayer()

loop(
    // physics step
    (dt) => {
        checkInput()
        updatePlayer(dt)
    },
    // render step
    () => {
        ctx.fillStyle = "#1a1a1a"
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        renderLevel(ctx)
        renderPlayer(ctx)
    },
)
