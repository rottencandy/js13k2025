import { Scene, setScene } from "./scene-manager"
import { keys } from "./core/input"

export const updateTitleScreen = () => {
    if (keys.btnp.spc) {
        setScene(Scene.Game)
    }
}

export const renderTitleScreen = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height)
}