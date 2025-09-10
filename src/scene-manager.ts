import { updateLevel, renderLevel } from "./level-manager"
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

export let currentScene: Scene = Scene.Title

export const setScene = (scene: Scene) => {
    currentScene = scene

    switch (scene) {
        case Scene.LevelSelect:
            initLevelSelect()
            break
        case Scene.Game:
            break
    }
}

export const updateScene = (dt: number) => {
    updateTransitionAnimation(dt)
    switch (currentScene) {
        case Scene.Title:
            updateTitleScreen()
            break
        case Scene.LevelSelect:
            updateLevelSelect(dt)
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
