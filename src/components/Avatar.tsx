import { useEffect, useState } from 'react'

/** The instructor drawing (SVG). `level` is the mouth opening, 0 closed .. 3 wide open. Edit the shapes to change how it looks. */
export function Avatar({ level, playing }: { level: number; playing: boolean }) {
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    const t = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 130) }, 2800 + Math.random() * 3000)
    return () => clearInterval(t)
  }, [])
  const open = [0, 4, 8, 12][level]
  return (
    <svg viewBox="0 0 210 300" className={playing ? 'avatar-svg talking' : 'avatar-svg'} role="img" aria-label="AI instructor">
      <path d="M6 300c0-62 40-98 99-98s99 36 99 98z" fill="#f1f4f2" />
      <rect x="88" y="160" width="34" height="50" rx="12" fill="#c98a62" />
      <path d="M84 206l21 30 21-30-10-8h-22z" fill="#fff" />
      <path d="M99 224h12l6 70h-24z" fill="#1f8a84" />
      <g className="avatar-head">
        <ellipse cx="53" cy="112" rx="7" ry="12" fill="#d19367" />
        <ellipse cx="157" cy="112" rx="7" ry="12" fill="#d19367" />
        <ellipse cx="105" cy="108" rx="52" ry="62" fill="#e0a077" />
        <path d="M52 98C46 50 80 30 105 30S164 50 158 98C150 74 132 62 105 62S60 74 52 98Z" fill="#1d2429" />
        <path d="M72 88q10-6 20-1M118 87q10-5 20 1" stroke="#1d2429" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="82" cy="104" rx="6" ry={blink ? 0.8 : 6.5} fill="#1d2429" />
        <ellipse cx="128" cy="104" rx="6" ry={blink ? 0.8 : 6.5} fill="#1d2429" />
        <path d="M105 112q-6 16 0 20" stroke="#c98a62" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="74" cy="128" r="8" fill="#e58f7a" opacity=".35" />
        <circle cx="136" cy="128" r="8" fill="#e58f7a" opacity=".35" />
        {level === 0
          ? <path className="mouth" d="M90 142q15 9 30 0" stroke="#8a3d3d" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          : <g className="mouth"><ellipse cx="105" cy={142 + open / 3} rx={11 + level * 1.5} ry={open / 2 + 1.5} fill="#6e2a2f" /><ellipse cx="105" cy={142 + open / 2} rx={7 + level} ry={Math.max(1, open / 5)} fill="#c8656b" /></g>}
      </g>
    </svg>
  )
}
