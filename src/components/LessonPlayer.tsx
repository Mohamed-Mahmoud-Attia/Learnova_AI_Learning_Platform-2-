import { useEffect, useMemo, useRef, useState } from 'react'
import { mmss } from '../lib/format'
import { useMouth } from '../lib/useMouth'
import { Avatar } from './Avatar'
import { toast } from './ui'

/**
 * The lesson video area: a real <audio> element + an animated avatar whose mouth follows the voice.
 * - With `mediaUrl`  -> plays the real audio, the mouth moves with its volume (Web Audio API).
 * - Without it       -> falls back to a timer and a simulated mouth, so the page still works.
 * NOTE: if `mediaUrl` is on another domain, the backend must allow CORS for that file
 * (otherwise the browser can't read the audio levels and the mouth won't move).
 */
type Props = {
  mediaUrl?: string
  caption: string
  durationSeconds?: number
  onProgress?: (ratio: number) => void // 0..1, used to highlight the transcript
}

const Play = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
const Pause = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>

export default function LessonPlayer({ mediaUrl, caption, durationSeconds = 315, onProgress }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [failed, setFailed] = useState(false)
  const real = !!mediaUrl && !failed
  const [playing, setPlaying] = useState(false), [time, setTime] = useState(0), [speed, setSpeed] = useState(1), [duration, setDuration] = useState(durationSeconds)
  const level = useMouth(audioRef, playing, !real)
  const wave = useMemo(() => Array.from({ length: 44 }, (_, i) => 8 + Math.sin(i * 0.8) * 7 + Math.random() * 6), [])

  useEffect(() => { onProgress?.(duration ? Math.min(1, time / duration) : 0) }, [time, duration]) // eslint-disable-line react-hooks/exhaustive-deps
  // no audio yet -> a plain timer keeps the player usable
  useEffect(() => {
    if (real || !playing) return
    const t = setInterval(() => setTime(x => (x + speed >= duration ? 0 : x + speed)), 1000)
    return () => clearInterval(t)
  }, [real, playing, speed, duration])
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed }, [speed, real])

  const toggle = () => {
    const a = audioRef.current
    if (real && a) { if (a.paused) a.play().catch(() => toast('Couldn’t play the audio')); else a.pause() }
    else setPlaying(p => !p)
  }
  const seek = (v: number) => { setTime(v); if (real && audioRef.current) audioRef.current.currentTime = v }

  return (
    <div className="video-player">
      {real && <audio ref={audioRef} src={mediaUrl} crossOrigin="anonymous" preload="metadata"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setDuration(d) }}
        onError={() => { setFailed(true); setPlaying(false); toast('Couldn’t load the lesson audio') }} />}
      <div className="player-accent" /><span className="ai-label"><i /> AI INSTRUCTOR</span>
      <div className="video-avatar"><div className="halo" /><Avatar level={level} playing={playing} /></div>
      <div className="wave" aria-hidden="true">{wave.map((h, i) => <i key={i} style={{ height: `${playing ? 3 + (h - 3) * (0.25 + level * 0.3) : 3}px` }} />)}</div>
      <div className="caption">“{caption}”</div>
      <div className="controls">
        <button aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>{playing ? <Pause /> : <Play />}</button>
        <span>{mmss(time)}</span>
        <input type="range" aria-label="Seek" min="0" max={Math.max(1, Math.floor(duration))} value={Math.floor(time)} onChange={e => seek(+e.target.value)} />
        <span>{mmss(duration)}</span>
        <select aria-label="Playback speed" value={speed} onChange={e => setSpeed(+e.target.value)}>{[0.75, 1, 1.25, 1.5, 2].map(v => <option key={v} value={v}>{v}x</option>)}</select>
      </div>
    </div>
  )
}
