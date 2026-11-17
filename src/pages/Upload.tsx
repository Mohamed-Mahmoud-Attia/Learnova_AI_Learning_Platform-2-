/** Create Lesson: choose a PDF, set the options, and watch the generation progress. */
import { useState, useEffect, useRef } from 'react'
import { api, type LessonOptions } from '../api'
import type { Go } from '../lib/router'
import { Icon } from '../components/Icon'
import { Toggle } from '../components/ui'

const STEPS = ['Uploading PDF', 'Extracting Text', 'Analyzing Content', 'Generating Lesson Script', 'Preparing Voice and Avatar', 'Creating Learning Materials']
export function Upload({ go }: { go: Go }) {
  const [file, setFile] = useState<File | null>(null)
  const [opts, setOpts] = useState<LessonOptions>({ avatar: true, extras: true })
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [newId, setNewId] = useState('')
  const [err, setErr] = useState('')
  const [over, setOver] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const abort = useRef<AbortController | null>(null)
  useEffect(() => () => { abort.current?.abort() }, []) // cancel an in-flight upload when leaving the page
  const set = <K extends keyof LessonOptions>(k: K, v: LessonOptions[K]) => setOpts(o => ({ ...o, [k]: v }))
  const pick = (f?: File | null) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) return setErr('Please choose a PDF file.')
    if (f.size > 25 * 1024 * 1024) return setErr('This file is larger than 25 MB.')
    setErr(''); setFile(f)
  }
  const start = async () => {
    if (!file) return
    const ac = new AbortController(); abort.current = ac
    setProcessing(true); setProgress(0); setNewId(''); setErr('')
    try { setNewId(await api.createLesson(file, opts, setProgress, ac.signal)) }
    catch (e) { if (!ac.signal.aborted) { setErr((e as Error).message || 'Something went wrong. Please try again.'); setProcessing(false) } }
  }
  const cancel = () => { abort.current?.abort(); setProcessing(false) }
  const done = progress >= 100 && !!newId
  const current = Math.min(5, Math.floor(progress / 17))
  if (processing) return <div className="process-page">
    <button className="back-link" onClick={cancel}><Icon name="back" size={16}/> Back to configuration</button>
    <div className="process-card">
      <div className="ai-orbit"><div className="orbit one"/><div className="orbit two"/><span><Icon name={done ? 'check' : 'spark'} size={34}/></span></div>
      <span className="eyebrow">{done ? 'LESSON READY' : 'AI LESSON STUDIO'}</span>
      <h1>{done ? 'Your lesson is ready to explore.' : 'Transforming your PDF'}</h1>
      <p>{done ? 'We created a complete learning experience from your document.' : `${STEPS[current]}…`}</p>
      <div className="big-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progress}%` }}/></div>
      <div className="progress-label"><strong>{progress}% complete</strong><span>{done ? 'Complete' : 'This can take a minute'}</span></div>
      <div className="step-list">{STEPS.map((s, i) => <div className={i < current || done ? 'done' : i === current ? 'current' : ''} key={s}><span>{i < current || done ? <Icon name="check" size={14}/> : i + 1}</span><p>{s}</p>{i === current && !done && <small>In progress</small>}</div>)}</div>
      {done ? <button className="primary wide" onClick={() => go('overview', newId)}>View Lesson Overview <Icon name="arrow" size={17}/></button> : <button className="tertiary" onClick={cancel}>Cancel generation</button>}
    </div>
  </div>
  return <div className="narrow-page">
    <button className="back-link" onClick={() => go('dashboard')}><Icon name="back" size={16}/> Dashboard</button>
    <div className="page-title"><span className="eyebrow">AI LESSON STUDIO</span><h1>Create a New AI Lesson</h1><p>Upload your study material and shape a lesson around the way you learn best.</p></div>
    <div className="upload-layout">
      <div>
        <input ref={input} hidden type="file" accept=".pdf,application/pdf" onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }}/>
        {!file ? <button className={over ? 'dropzone over' : 'dropzone'} onClick={() => input.current?.click()} onDragOver={e => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]) }}><span className="upload-circle"><Icon name="upload" size={28}/></span><h3>Drop your PDF here or <u>browse files</u></h3><p>PDF format only · Maximum 25 MB</p></button>
          : <div className="selected-file"><span className="pdf-icon"><Icon name="file" size={25}/></span><div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} MB · PDF document</small></div><button onClick={() => setFile(null)} aria-label="Remove file"><Icon name="close" size={18}/></button></div>}
        {err && <p className="err" role="alert">{err}</p>}
        <div className="config card">
          <div className="section-head"><div><span className="eyebrow">OPTIONAL</span><h2>Shape your lesson</h2></div><span className="ai-badge"><Icon name="spark" size={14}/> AI-assisted</span></div>
          <div className="toggle-row"><div><strong>Include AI Avatar</strong><small>A friendly instructor will guide your lesson</small></div><Toggle label="Include AI Avatar" checked={opts.avatar} onChange={v => set('avatar', v)}/></div>
          <div className="toggle-row"><div><strong>Quiz and Flashcards</strong><small>Generate study materials automatically</small></div><Toggle label="Quiz and Flashcards" checked={opts.extras} onChange={v => set('extras', v)}/></div>
        </div>
      </div>
      <aside className="side-summary"><span className="eyebrow">WHAT YOU'LL GET</span>{['A narrated video lesson', 'Clear section summaries', 'Personalized knowledge check', 'A ready-to-study flashcard deck'].map((x, i) => <div key={x}><span>{String(i + 1).padStart(2, '0')}</span><p>{x}</p></div>)}<button className="primary wide" disabled={!file} onClick={start}><Icon name="spark" size={17}/> Generate AI Lesson</button>{!file && <small>Select a PDF to continue</small>}</aside>
    </div>
  </div>
}
