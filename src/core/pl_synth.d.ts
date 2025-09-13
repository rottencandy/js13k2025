export function pl_synth_init(ctx: AudioContext): {
    sound: (instrument: any, note?: number, rowLen?: number) => AudioBuffer
    song: (songData: any) => AudioBuffer
}
