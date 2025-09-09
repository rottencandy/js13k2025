type GameState = {
    playerRects: { x: number; y: number }[]
    renderables: { x: number; y: number; type: number }[]
    growItems: { x: number; y: number }[]
    shrinkItems: { x: number; y: number }[]
}

let undoStack: GameState[] = []

export const saveGameState = (
    playerRects: { x: number; y: number }[],
    renderables: { x: number; y: number; type: number }[],
    growItems: { x: number; y: number }[],
    shrinkItems: { x: number; y: number }[],
) => {
    const state: GameState = {
        playerRects: playerRects.map((rect) => ({ x: rect.x, y: rect.y })),
        growItems: [...growItems],
        renderables: [...renderables],
        shrinkItems: [...shrinkItems],
    }
    undoStack.push(state)
}

export const undoLastMove = (): GameState | null => {
    if (undoStack.length > 0) {
        return undoStack.pop()!
    }
    return null
}

export const clearUndoStack = () => {
    undoStack = []
}
