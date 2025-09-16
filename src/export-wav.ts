import { initSynth } from "./synth"
import audioBufferToWav from "audiobuffer-to-wav"
import { base64 } from "rfc4648"

export const generateWav = () => {
    const audioBuffer = initSynth()
    const uri =
        "data:application/octet-stream;base64," +
        base64.stringify(abToWav(audioBuffer))
    downloadData(uri, "export-song.wav")
}

const abToWav = (buf: AudioBuffer) => {
    const wavBuffer = audioBufferToWav(buf)
    return new Uint8Array(wavBuffer)
}

const downloadData = (dataURI: string, fileName: string) => {
    const link = document.createElement("a")
    link.setAttribute("download", fileName)
    link.setAttribute("href", dataURI)
    document.body.appendChild(link)
    link.click()
    setTimeout(function () {
        // Wait 1000ms before removing the link
        // This gives IE11 enough time to process the download (it will fail if the link is removed)
        document.body.removeChild(link)
    }, 1000)
}
