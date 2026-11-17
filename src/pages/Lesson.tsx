/** Lesson page: the video player, transcript, key points, notes and the "Ask AI" chat. */
import { useState, useEffect, useRef } from 'react'
import { api, type LessonData } from '../api'
import type { Go } from '../lib/router'
import { useApi } from '../lib/hooks'
import LessonPlayer from '../components/LessonPlayer'
import { Icon } from '../components/Icon'
import { Load, toast } from '../components/ui'

export function Lesson({ go, id }: { go: Go; id: string }) {
  const q = useApi(() => api.lesson(id), [id])
  return <Load q={q}>{l => <LessonView go={go} lesson={l}/>}</Load>
}
function LessonView({ go, lesson }: { go: Go; lesson: LessonData }) {
  const [sec, setSec] = useState(0), [ratio, setRatio] = useState(0)
  const [tab, setTab] = useState('Script'), [chat, setChat] = useState(false), [note, setNote] = useState(lesson.note), [done, setDone] = useState<number[]>(lesson.completedSections)
  const [msgs, setMsgs] = useState<{ from: 'bot' | 'me'; text: string }[]>([{ from: 'bot', text: 'I can help you explore the concepts in this lesson. Ask me anything about it.' }])
  const [draft, setDraft] = useState(''), [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const s = lesson.sections[sec], n = lesson.sections.length
  useEffect(() => { const f = (e: KeyboardEvent) => e.key === 'Escape' && setChat(false); addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [])
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [msgs, chat])
  const goTo = (i: number) => { setSec(i); setRatio(0) }
  const toggleDone = () => { const on = !done.includes(sec); setDone(d => on ? [...d, sec] : d.filter(x => x !== sec)); api.completeSection(lesson.id, sec, on).catch(() => toast('Couldn’t save your progress')) }
  const send = async (text: string) => {
    const t = text.trim(); if (!t || busy) return
    setMsgs(m => [...m, { from: 'me', text: t }]); setDraft(''); setBusy(true)
    try { const r = await api.ask(lesson.id, t); setMsgs(m => [...m, { from: 'bot', text: r.answer }]) }
    catch { setMsgs(m => [...m, { from: 'bot', text: 'Sorry, I couldn’t answer that right now. Please try again.' }]) }
    finally { setBusy(false) }
  }
  const activeLine = Math.min(s.script.length - 1, Math.floor(ratio * s.script.length))
  const pct = Math.round(done.length / n * 100)
  return <div className="lesson-page">
    <button className="back-link" onClick={() => go('library')}><Icon name="back" size={16}/> My Library / {lesson.title}</button>
    <div className="lesson-heading"><div><span className="eyebrow">SECTION {sec + 1} OF {n}</span><h1>{s.title}</h1><p>Source: {lesson.source}</p></div><div className="completion"><div><i style={{ width: `${pct}%` }}/></div><span>{pct}% complete</span></div></div>
    <div className="player-layout">
      <section>
        <LessonPlayer key={`${lesson.id}-${sec}`} mediaUrl={s.mediaUrl} caption={s.caption} durationSeconds={s.durationSeconds} onProgress={setRatio}/>
        <div className="section-nav"><button className="secondary" aria-label="Previous section" disabled={sec === 0} onClick={() => goTo(sec - 1)}><Icon name="back" size={16}/> Previous section</button><button className="secondary" aria-label="Next section" disabled={sec === n - 1} onClick={() => goTo(sec + 1)}>Next section <Icon name="arrow" size={16}/></button></div>
        <div className="lesson-actions"><button className="ai-ask" onClick={() => setChat(true)}><Icon name="spark"/> <span><strong>Ask AI about this lesson</strong><small>Get an explanation based on this lesson</small></span><Icon name="arrow"/></button><button className="secondary" onClick={() => go('quiz')}>Take Quiz</button><button className="secondary" onClick={() => go('flashcards')}>Flashcards</button></div>
      </section>
      <aside className="tools-panel">
        <div className="tool-tabs" role="tablist">{['Script', 'Key Points', 'Summary', 'Notes'].map(x => <button role="tab" aria-selected={tab === x} className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}</button>)}</div>
        <div className="tool-content">
          {tab === 'Script' && <><span className="eyebrow">LIVE TRANSCRIPT</span>{s.script.map((line, i) => <p key={i} className={i === activeLine ? 'script active' : 'script'}>{line}</p>)}</>}
          {tab === 'Key Points' && <><span className="eyebrow">CORE CONCEPTS</span>{s.keyPoints.map(x => <div className="key-point" key={x}><Icon name="check" size={15}/><p>{x}</p></div>)}</>}
          {tab === 'Summary' && <><span className="eyebrow">SECTION SUMMARY</span>{s.summary.map(x => <div key={x.h}><h3>{x.h}</h3><p>{x.p}</p></div>)}</>}
          {tab === 'Notes' && <><span className="eyebrow">PERSONAL NOTES</span><textarea aria-label="Notes" value={note} onChange={e => setNote(e.target.value)} placeholder="Write a note about this section…"/><button className="primary wide" onClick={() => api.saveNote(lesson.id, note).then(() => toast('Note saved')).catch(() => toast('Couldn’t save your note'))}>Save note</button></>}
        </div>
        <button className={done.includes(sec) ? 'complete-btn done' : 'complete-btn'} onClick={toggleDone}><span><Icon name="check" size={16}/></span> {done.includes(sec) ? 'Section completed' : 'Mark section complete'}</button>
      </aside>
    </div>
    {chat && <div className="modal-wrap" onClick={() => setChat(false)}><div className="chat-panel" role="dialog" aria-label="Lesson assistant" onClick={e => e.stopPropagation()}>
      <div className="chat-head"><div><span className="ai-badge"><Icon name="spark" size={14}/> LESSON ASSISTANT</span><h2>Ask about this lesson</h2></div><button aria-label="Close" onClick={() => setChat(false)}><Icon name="close"/></button></div>
      <div className="chat-body">{msgs.map((m, i) => <div key={i} className={m.from === 'bot' ? 'bot-message' : 'user-message'}>{m.text}</div>)}{busy && <div className="bot-message">Thinking…</div>}
        {msgs.length === 1 && <div className="suggestions">{['How is AI different from machine learning?', 'Give me a real-world example.', 'Explain narrow AI simply.'].map(x => <button key={x} onClick={() => send(x)}>{x}</button>)}</div>}<div ref={end}/></div>
      <form className="chat-input" onSubmit={e => { e.preventDefault(); send(draft) }}><input aria-label="Your question" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Ask a question about this lesson…"/><button aria-label="Send" disabled={busy || !draft.trim()}><Icon name="arrow"/></button></form>
    </div></div>}
  </div>
}
