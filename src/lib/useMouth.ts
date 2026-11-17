import { useEffect, useState } from 'react'

/**
 * Turns the volume of an <audio> element into a mouth level: 0 closed .. 3 wide open.
 * `simulate` fakes talking when there is no audio file yet.
 */
let sharedCtx: AudioContext | null = null
const analysers = new WeakMap<HTMLAudioElement, AnalyserNode>()
function analyserFor(audio: HTMLAudioElement) {
  sharedCtx ??= new AudioContext()
  let a = analysers.get(audio)
  if (!a) {
    a = sharedCtx.createAnalyser()
    a.fftSize = 256
    sharedCtx.createMediaElementSource(audio).connect(a) // can only be done once per element
    a.connect(sharedCtx.destination)
    analysers.set(audio, a)
  }
  void sharedCtx.resume()
  return a
}

export function useMouth(audioRef: React.RefObject<HTMLAudioElement | null>, playing: boolean, simulate: boolean) {
  const [level, setLevel] = useState(0)
  useEffect(() => {
    if (!playing) { setLevel(0); return }
    const audio = audioRef.current
    const analyser = !simulate && audio ? analyserFor(audio) : null
    const data = new Uint8Array(analyser ? analyser.frequencyBinCount : 0)
    // only look at the speech range (up to ~4 kHz) so quiet high frequencies don't dilute the level
    const top = analyser && sharedCtx ? Math.max(4, Math.floor(4000 / (sharedCtx.sampleRate / analyser.fftSize))) : 0
    let raf = 0, smooth = 0, peak = 20, last = -1
    const tick = (t: number) => {
      let v: number
      if (analyser) { analyser.getByteFrequencyData(data); let sum = 0; for (let i = 1; i <= top; i++) sum += data[i]; v = sum / top }
      else v = 18 + Math.abs(Math.sin(t / 110)) * 42 * Math.abs(Math.sin(t / 530)) // simulated talking
      smooth = smooth * 0.55 + v * 0.45
      peak = Math.max(smooth, peak * 0.996, 20) // adapts to how loud the recording is
      const r = smooth / peak
      const l = r < 0.12 ? 0 : r < 0.4 ? 1 : r < 0.7 ? 2 : 3
      if (l !== last) { last = l; setLevel(l) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, simulate, audioRef])
  return level
}
