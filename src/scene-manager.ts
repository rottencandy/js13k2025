import { loadLevel, updateLevel, renderLevel } from "./level-manager"
import { updateTitleScreen, renderTitleScreen } from "./title-screen"

export const enum Scene {
    Title,
    Game
}

let currentScene: Scene = Scene.Title

export const getCurrentScene = () => currentScene

export const setScene = (scene: Scene) => {
    currentScene = scene
    
    switch (scene) {
        case Scene.Game:
            loadLevel(0)
            break
    }
}

export const updateScene = (deltaTime: number) => {
    switch (currentScene) {
        case Scene.Title:
            updateTitleScreen()
            break
        case Scene.Game:
            updateLevel(deltaTime)
            break
    }
}

export const renderScene = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    switch (currentScene) {
        case Scene.Title:
            renderTitleScreen(ctx, width, height)
            break
        case Scene.Game:
            renderLevel(ctx)
            break
    }
}