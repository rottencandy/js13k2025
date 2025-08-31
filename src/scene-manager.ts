import { loadLevel, updateLevel, renderLevel } from "./level-manager"
import { updateTitleScreen, renderTitleScreen } from "./title-screen"
import {
    updateLevelSelect,
    renderLevelSelect,
    initLevelSelect,
} from "./level-select"
import {
    renderTransitionAnimation,
    updateTransitionAnimation,
} from "./transition-animation"

export const enum Scene {
    Title,
    LevelSelect,
    Game,
}

let currentScene: Scene = Scene.Title

export const getCurrentScene = () => currentScene

export const setScene = (scene: Scene) => {
    currentScene = scene

    switch (scene) {
        case Scene.LevelSelect:
            initLevelSelect()
            break
        case Scene.Game:
            loadLevel(0)
            break
    }
}

export const updateScene = (dt: number) => {
    updateTransitionAnimation(dt)
    switch (currentScene) {
        case Scene.Title:
            updateTitleScreen(dt)
            break
        case Scene.LevelSelect:
            updateLevelSelect()
            break
        case Scene.Game:
            updateLevel(dt)
            break
    }
}

export const renderScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
) => {
    switch (currentScene) {
        case Scene.Title:
            renderTitleScreen(ctx, width, height)
            break
        case Scene.LevelSelect:
            renderLevelSelect(ctx, width, height)
            break
        case Scene.Game:
            renderLevel(ctx)
            break
    }
    renderTransitionAnimation(ctx)
}
