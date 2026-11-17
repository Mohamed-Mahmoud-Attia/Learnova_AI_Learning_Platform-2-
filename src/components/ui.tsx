/** Small shared UI pieces: toast messages, the loading/error wrapper, the range select and the toggle. */
import { useState, useEffect } from 'react'
import type { Range } from '../api'
import type { Q } from '../lib/hooks'

export const toast = (text: string) => window.dispatchEvent(new CustomEvent('toast', { detail: text }))
export function Toasts() {
  const [list, setList] = useState<string[]>([])
  useEffect(() => {
    const f = (e: Event) => { setList(x => [...x, (e as CustomEvent<string>).detail]); setTimeout(() => setList(x => x.slice(1)), 2800) }
    addEventListener('toast', f); return () => removeEventListener('toast', f)
  }, [])
  return <div className="toasts" role="status" aria-live="polite">{list.map((m, i) => <div className="toast" key={i}>{m}</div>)}</div>
}

export function Load<T>({ q, children }: { q: Q<T>; children: (d: T) => React.ReactNode }) {
  if (q.data !== undefined) return <>{children(q.data)}</>
  if (q.error) return <div className="state card"><p>Couldn’t load this page. {q.error}</p><button className="secondary" onClick={q.retry}>Try again</button></div>
  return <div className="state card" role="status"><span className="spinner"/>Loading…</div>
}

const RANGES: [Range, string][] = [['week', 'This week'], ['month', 'This month'], ['all', 'All time']]
export const RangeSelect = ({ value, onChange }: { value: Range; onChange: (r: Range) => void }) =>
  <select className="select-pill" aria-label="Time range" value={value} onChange={e => onChange(e.target.value as Range)}>{RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) =>
  <input type="checkbox" aria-label={label} checked={checked} onChange={e => onChange(e.target.checked)}/>
