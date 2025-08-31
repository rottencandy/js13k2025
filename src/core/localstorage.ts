// random string
const KEY = "ziwhuzdeflciqozuen"

export const getStorageObj = () => {
    const objStr = localStorage.getItem(KEY) as string
    let obj: { completedLevels: number[] } = { completedLevels: [] }
    try {
        obj = JSON.parse(objStr) || {}
        if (obj.completedLevels === undefined) {
            obj.completedLevels = []
        }
    } finally {
        return obj
    }
}

let cache = getStorageObj()

export const setStorageObj = (obj: {}) => {
    localStorage.setItem(KEY, JSON.stringify(obj))
    cache = getStorageObj()
}

export const getCompletedLevels = (): Set<number> => {
    return new Set(cache.completedLevels || [])
}

export const markLevelCompleted = (levelIndex: number) => {
    const completedLevels = cache.completedLevels || []
    if (!completedLevels.includes(levelIndex)) {
        completedLevels.push(levelIndex)
        setStorageObj({ completedLevels })
    }
}

export const isLevelAvailable = (levelIndex: number): boolean => {
    if (levelIndex === 0) return true
    const completedLevels = getCompletedLevels()
    return completedLevels.has(levelIndex - 1)
}
