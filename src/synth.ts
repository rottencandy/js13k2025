import { pl_synth_init } from "./core/pl_synth"

// prettier-ignore
const tuneData = [11025,[[[7,0,0,1,147,0,7,0,0,1,255,0,0,50,150,4800,61,2,600,254],[0,1,1,1,1,1,2,2,2,0,2,0,0,0,1,2,2],[[135,0,0,0,135,135,0,0,135,0,0,0,135,135,0,0,135,0,0,0,135,135,0,0,135,0,0,0,135,0,135],[135,0,0,0,135,0,135,135,0,0,135,0,135,0,0,0,135,0,0,135,135,0,135,0,135,0,0,135,135]]],[[8,0,0,0,0,0,8,0,0,0,0,0,60,50,419,4607,130,1,10332,120,4,16,5,108,0,0,5,187],[1,0,1,1,0,0,2,1,2,2,2,1,1,1,0,1,1,0,1],[[0,0,0,135,0,0,0,0,0,0,135,135,0,0,0,0,0,0,0,135,0,0,0,0,0,0,135,135],[150,0,0,0,135,0,150,150,0,0,135,0,150,0,150,0,135,135,0,0,150,0,135,0,150,0,135,135]]],[[8,0,0,1,82,2,8,0,0,0,0,0,255,100,0,9090,232,3,5200,63],[1,1,1,1,0,0,0,1,2,2,2,1,2,2,1,2,2],[[0,0,0,0,0,0,0,135,0,0,0,0,0,0,0,135,0,0,0,0,0,0,0,135,0,0,0,0,0,0,0,135],[0,0,0,0,0,0,0,148,135,135,135,0,0,0,148,0,135,0,0,0,148,0,135,135,135,0,0,0,148,135]]],[[7,0,0,0,43,1,3,1,44,1,145,3,17,0,842,9283,76,2,730,233,2,68,7,155,0,1,9,243],[1,1,1,1,1,1,1,2,1,1,2,1,1,2,2,2,2,1,1],[[141,0,0,0,0,0,0,0,139,0,0,0,0,0,0,138,141,0,0,0,0,0,141,0,139],[141,139,141,139,0,139,141,0,141,0,139,139,0,0,0,138,141,139,138,141,0,0,141,0,139,139]]],[[7,0,0,0,192,2,8,0,0,0,66,1,0,1318,150,0,139,2,5434,108,0,90,1,27,1,1,6,11,3],[0,0,0,0,1,1,2,2,1,1,3,0,0,2,2,3,3],[[148,0,0,139,0,145,0,139,0,145,0,148,0,0,0,0,139,148,0,139,0,145,0,148,143,139,148],[139,0,0,0,139,0,146,0,148,151,0,0,0,0,139,0,146,0,139,148,150,151,0,150,0,148,0,145,0,139,145],[145,145,151,0,148,0,150,0,148,139,150,0,0,0,0,0,145,145,151,0,148,0,150,0,150,138]]]]]

const menuHoverInstrument = [
    7, 0, 0, 1, 197, 0, 15, 0, 0, 0, 0, 0, 0, 226, 842, 0, 158, 0, 0, 0, 0, 0,
    0, 0, 0, 1,
]
const moveInstrument = [
    8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 255, 301, 2934, 4962, 220, 3, 1407, 16,
    2, 0, 1, 27, 0, 1, 2, 51,
]
const invalidInstrument = [
    6, 0, 0, 1, 255, 1, 0, 0, 0, 0, 0, 0, 0, 763, 1551, 1808, 98, 0, 37, 16, 2,
    45, 1, 27, 0, 0, 2,
]
const fallSound = [
    0, 0, 0, 1, 255, 1, 0, 0, 0, 0, 0, 0, 231, 38, 1431, 4701, 98, 0, 37, 16, 2,
    0, 1, 27, 0, 0, 2,
]
const hurtSound = [
    9, 0, 0, 1, 255, 0, 0, 0, 0, 0, 0, 0, 10, 0, 3324, 12404, 131, 0, 37, 16, 2,
    0, 1, 27, 0, 0, 2,
]
const growSound = [
    8, 0, 0, 1, 255, 3, 0, 0, 0, 0, 0, 0, 0, 15017, 301, 194, 102, 0, 12, 16, 2,
    133, 1, 27, 0, 0, 2,
]
const shrinkSound = [
    8, 0, 0, 1, 255, 3, 0, 0, 0, 0, 0, 0, 0, 4, 3532, 10113, 102, 0, 12, 16, 1,
    133, 1, 27, 0, 0, 2,
]
const winSound = [
    6, 0, 0, 0, 255, 3, 9, 0, 0, 0, 66, 0, 5, 62, 22729, 7066, 102, 0, 0, 74, 6,
    140, 8, 107, 1, 0, 12, 118, 1,
]

type PlSynth = ReturnType<typeof pl_synth_init>

let plSynth: PlSynth
let audioContext: AudioContext

let musicBuffer: AudioBuffer
let menuHoverBuffer: AudioBuffer
let menuSelectBuffer: AudioBuffer
let moveBuffer: AudioBuffer
let invalidBuffer: AudioBuffer
let fallBuffer: AudioBuffer
let hurtBuffer: AudioBuffer
let growBuffer: AudioBuffer
let shrinkBuffer: AudioBuffer
let winBuffer: AudioBuffer

let musicSource: AudioBufferSourceNode | undefined
let menuHoverSource: AudioBufferSourceNode | undefined
let menuSelectSource: AudioBufferSourceNode | undefined
let moveSource: AudioBufferSourceNode | undefined
let invalidSource: AudioBufferSourceNode | undefined
let fallSource: AudioBufferSourceNode | undefined
let hurtSource: AudioBufferSourceNode | undefined
let growSource: AudioBufferSourceNode | undefined
let shrinkSource: AudioBufferSourceNode | undefined
let winSource: AudioBufferSourceNode | undefined

export const initSynth = () => {
    audioContext = new AudioContext()

    plSynth = pl_synth_init(audioContext)

    musicBuffer = plSynth.song(tuneData)
    menuHoverBuffer = plSynth.sound(menuHoverInstrument, 142)
    menuSelectBuffer = plSynth.sound(menuHoverInstrument)
    moveBuffer = plSynth.sound(moveInstrument)
    invalidBuffer = plSynth.sound(invalidInstrument)
    fallBuffer = plSynth.sound(fallSound)
    hurtBuffer = plSynth.sound(hurtSound)
    growBuffer = plSynth.sound(growSound)
    shrinkBuffer = plSynth.sound(shrinkSound)
    winBuffer = plSynth.sound(winSound)

    return plSynth
}

const playBufferSource = (
    src: AudioBufferSourceNode | undefined,
    buffer: AudioBuffer,
    loop?: boolean,
) => {
    if (src) {
        src.stop()
        src.disconnect()
    }
    src = audioContext.createBufferSource()
    src.buffer = buffer
    src.connect(audioContext.destination)
    if (loop) {
        src.loop = true
    }
    src.start()
    src.context.state
    src.onended = () => {
        src?.disconnect()
        src = undefined
    }
    return src
}

export const startMusicLoop = () => {
    musicSource = playBufferSource(musicSource, musicBuffer, true)
}

export const stopMusicLoop = () => {
    if (musicSource) {
        musicSource.disconnect()
        musicSource = undefined
    }
}

export const playMenuHoverSound = () => {
    menuHoverSource = playBufferSource(menuHoverSource, menuHoverBuffer)
}

export const playMenuSelectSound = () => {
    menuSelectSource = playBufferSource(menuSelectSource, menuSelectBuffer)
}

export const playMoveSound = () => {
    moveSource = playBufferSource(moveSource, moveBuffer)
}

export const playInvlaidSound = () => {
    invalidSource = playBufferSource(invalidSource, invalidBuffer)
}

export const playFallSound = () => {
    fallSource = playBufferSource(fallSource, fallBuffer)
}

export const playHurtSound = () => {
    hurtSource = playBufferSource(hurtSource, hurtBuffer)
}

export const playGrowSound = () => {
    growSource = playBufferSource(growSource, growBuffer)
}

export const playShrinkSound = () => {
    shrinkSource = playBufferSource(shrinkSource, shrinkBuffer)
}

export const playWinSound = () => {
    winSource = playBufferSource(winSource, winBuffer)
}
