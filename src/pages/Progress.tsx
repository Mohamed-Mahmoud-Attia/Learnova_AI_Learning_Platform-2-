/** Progress: study stats, activity chart, weak topics and achievements. */
import { useState } from 'react'
import { api, type Range } from '../api'
import { useApi } from '../lib/hooks'
import { Icon } from '../components/Icon'
import { Load, RangeSelect } from '../components/ui'

export function Progress() {
  const [range, setRange] = useState<Range>('week')
  const q = useApi(() => api.progress(range), [range])
  return <><div className="hero-row"><div><span className="eyebrow">YOUR STATS</span><h1>Your Learning Progress</h1><p>A clear view of your habits, milestones, and next opportunities.</p></div><RangeSelect value={range} onChange={setRange}/></div>
    <Load q={q}>{p => { const top = Math.max(...p.week.map(w => w.m)); return <>
      <div className="stat-grid">{p.stats.map(s => <div className="stat-card card" key={s.label}><span>{s.label}</span><strong>{s.value}</strong><small>{s.delta} {range === 'week' ? 'this week' : range === 'month' ? 'this month' : 'overall'}</small></div>)}</div>
      <div className="dashboard-grid"><section className="card activity-card"><div className="section-head"><div><span className="eyebrow">LEARNING RHYTHM</span><h2>Study activity</h2></div><span>Goal: {p.goal}</span></div><div className="chart tall">{p.week.map((w, i) => <div className="bar-wrap" key={i}><div className={w.m === top ? 'bar peak' : 'bar'} style={{ height: `${(w.m / top) * 100}%` }}/><small>{w.d}</small></div>)}</div></section>
        <section className="card areas"><span className="eyebrow">PERSONALIZED INSIGHTS</span><h2>Areas to Improve</h2>{p.weak.map(w => <div key={w.t} className="area"><div><span>{w.t}</span><strong>{w.v}%</strong></div><div className="mini-progress"><i style={{ width: `${w.v}%` }}/></div><p>{w.tip}</p></div>)}</section></div>
      <section className="card achievement"><div className="achievement-icon"><Icon name="spark" size={28}/></div><div><span className="eyebrow">LATEST ACHIEVEMENT</span><h2>{p.achievement.title}</h2><p>{p.achievement.text}</p></div><strong>{p.achievement.badge}</strong></section></> }}</Load></>
}
