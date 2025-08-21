import { Scene, setScene } from "./scene-manager"
import { keys } from "./core/input"

export const updateTitleScreen = () => {
    if (keys.btnp.spc || keys.btn.clk) {
        setScene(Scene.LevelSelect)
    }
}

export const renderTitleScreen = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
) => {
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = "#fff"
    ctx.font = "48px Arial"
    ctx.textAlign = "center"
    ctx.fillText("UNTITLED GAME", width / 2, height / 2)
}
