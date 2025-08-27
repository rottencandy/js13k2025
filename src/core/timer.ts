type Timer = {
    duration: number
    elapsed: number
    isActive: boolean
    onComplete?: () => void
}

export const createTimer = (
    duration: number,
    onComplete?: () => void,
): Timer => ({
    duration,
    elapsed: 0,
    isActive: false,
    onComplete,
})

export const startTimer = (timer: Timer) => {
    timer.isActive = true
    timer.elapsed = 0
}

export const updateTimer = (timer: Timer, deltaTime: number): boolean => {
    if (!timer.isActive) return false

    timer.elapsed += deltaTime

    if (timer.elapsed >= timer.duration) {
        timer.isActive = false
        timer.onComplete?.()
        return true
    }

    return false
}

export const isTimerActive = (timer: Timer): boolean => timer.isActive

export const getTimerProgress = (timer: Timer): number =>
    timer.duration > 0 ? Math.min(timer.elapsed / timer.duration, 1) : 1
