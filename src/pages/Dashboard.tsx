/** Dashboard: greeting, quick links, weekly activity chart and recommendations. */
import { useState } from 'react'
import { api, type Range } from '../api'
import type { Go } from '../lib/router'
import { useApi } from '../lib/hooks'
import { Icon } from '../components/Icon'
import { Load, RangeSelect } from '../components/ui'

export function Dashboard({ go }: { go: Go }) {
  const [range, setRange] = useState<Range>('week')
  const q = useApi(() => api.dashboard(range), [range])
  return <Load q={q}>{d => {
    const vals = d.week.map(w => w.m), top = Math.max(...vals), peak = vals.indexOf(top)
    return <>
      <div className="hero-row">
        <div><span className="eyebrow">{d.date.toUpperCase()}</span><h1>Good morning, {d.name}.</h1><p>Small steps, strong mind. What will you learn today?</p></div>
        <button className="primary" onClick={() => go('upload')}><Icon name="plus" size={18}/> Create AI Lesson</button>
      </div>
      <section className="quick-grid">
        <button className="quick-card coral" onClick={() => go('upload')}><span className="quick-icon"><Icon name="upload"/></span><span><strong>Upload a PDF</strong><small>Turn any document into a lesson</small></span><Icon name="arrow"/></button>
        <button className="quick-card mint" onClick={() => go('library')}><span className="quick-icon"><Icon name="book"/></span><span><strong>Open Library</strong><small>Continue where you left off</small></span><Icon name="arrow"/></button>
        <button className="quick-card lilac" onClick={() => go('quiz')}><span className="quick-icon"><Icon name="spark"/></span><span><strong>Quick Quiz</strong><small>Test your AI knowledge</small></span><Icon name="arrow"/></button>
      </section>
      <div className="dashboard-grid">
        <section className="card activity-card">
          <div className="section-head"><div><span className="eyebrow">STUDY RHYTHM</span><h2>Weekly activity</h2></div><RangeSelect value={range} onChange={setRange}/></div>
          <div className="chart">{d.week.map((w, i) => <div className="bar-wrap" key={i}><div className={i === peak ? 'bar peak' : 'bar'} style={{ height: `${(w.m / top) * 100}%` }}><span>{i === peak ? `${w.m}m` : ''}</span></div><small>{w.d}</small></div>)}</div>
        </section>
        <section className="card progress-card">
          <span className="eyebrow light">YOUR LEARNING PROGRESS</span>
          <div className="ring" style={{ background: `conic-gradient(#67d6c3 ${d.completed}%,#34545b 0)` }}><div><strong>{d.completed}%</strong><span>completed</span></div></div>
          <h3>Keep the momentum</h3><p>You’re just {d.lessonsLeft} lessons away from your weekly goal.</p>
          <div className="streak"><span>{d.streak}</span><div><strong>day streak</strong><small>Personal best: {d.best} days</small></div></div>
        </section>
      </div>
      <section className="section">
        <div className="section-head"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Recommended for You</h2></div><button className="text-btn" onClick={() => go('library')}>View library <Icon name="arrow" size={15}/></button></div>
        <div className="recommend-grid">{d.recs.map(r => r.kind === 'lesson'
          ? <button key={r.title} className="recommend-card" onClick={() => go('overview', r.id)}><div className="lesson-art art-one"><span>{r.n}</span><Icon name="spark" size={34}/></div><div><span className="tag">{r.tag}</span><h3>{r.title}</h3><p>{r.desc}</p><div className="mini-progress"><i style={{ width: `${r.progress ?? 0}%` }}/></div><small>{r.meta}</small></div></button>
          : <button key={r.title} className="recommend-card" onClick={() => go('flashcards', r.id)}><div className="lesson-art art-two"><span>{r.n}</span><Icon name="cards" size={34}/></div><div><span className="tag purple-tag">{r.tag}</span><h3>{r.title}</h3><p>{r.desc}</p><div className="card-meta">{r.meta.split('|').map(m => <span key={m}>{m}</span>)}</div></div></button>)}</div>
      </section>
    </>
  }}</Load>
}
