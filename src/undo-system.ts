type GameState = {
    playerRects: { x: number; y: number }[]
    collectibles: { x: number; y: number }[]
    renderables: { x: number; y: number; type: number }[]
}

let undoStack: GameState[] = []

export const saveGameState = (
    playerRects: { x: number; y: number }[],
    collectibles: { x: number; y: number }[],
    renderables: { x: number; y: number; type: number }[],
) => {
    const state: GameState = {
        playerRects: playerRects.map((rect) => ({ x: rect.x, y: rect.y })),
        collectibles: [...collectibles],
        renderables: [...renderables],
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
