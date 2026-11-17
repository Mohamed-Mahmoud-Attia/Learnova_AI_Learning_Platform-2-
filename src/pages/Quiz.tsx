/** Quiz: questions, answers and the final score. */
import { useState, useRef } from 'react'
import { api, type Question, type QuizResult } from '../api'
import type { Go } from '../lib/router'
import { mmss } from '../lib/format'
import { useApi } from '../lib/hooks'
import { Icon } from '../components/Icon'
import { Load, toast } from '../components/ui'

export function Quiz({ go, id }: { go: Go; id: string }) {
  const q = useApi(() => api.quiz(id), [id])
  if (!q.data) return <div className="quiz-wrap"><Load q={q}>{() => null}</Load></div>
  return <QuizRun go={go} id={id} questions={q.data}/>
}
function QuizRun({ go, id, questions }: { go: Go; id: string; questions: Question[] }) {
  const [started, setStarted] = useState(false), [index, setIndex] = useState(0), [answers, setAnswers] = useState<number[]>([])
  const [flagged, setFlagged] = useState<number[]>([]), [result, setResult] = useState<QuizResult | null>(null), [busy, setBusy] = useState(false)
  const t0 = useRef(Date.now())
  const begin = () => { setStarted(true); setResult(null); setAnswers([]); setFlagged([]); setIndex(0); t0.current = Date.now() }
  const submit = async () => {
    setBusy(true)
    try { setResult(await api.submitQuiz(id, answers, Math.round((Date.now() - t0.current) / 1000))) }
    catch { toast('Couldn’t submit your quiz. Please try again.') }
    finally { setBusy(false) }
  }
  if (result) {
    const pct = Math.round(result.score / result.total * 100)
    return <div className="quiz-wrap result"><span className="eyebrow">QUIZ COMPLETE</span><div className="score-ring" style={{ background: `conic-gradient(var(--teal) ${pct}%,#dfebe8 0)` }}><strong>{pct}%</strong><span>Your score</span></div><h1>{result.score === result.total ? 'Excellent work, Alex.' : 'A strong first attempt.'}</h1><p>You answered {result.score} of {result.total} questions correctly in {mmss(result.seconds)}.</p><div className="result-stats"><div><strong>{result.score}</strong><span>Correct</span></div><div><strong>{result.total - result.score}</strong><span>To review</span></div><div><strong>{mmss(result.seconds)}</strong><span>Time taken</span></div></div><div className="result-actions"><button className="primary" onClick={begin}>Retry Quiz</button><button className="secondary" onClick={() => go('lesson')}>Return to Lesson</button></div></div>
  }
  if (!started) return <div className="quiz-intro">
    <button className="back-link" onClick={() => go('overview')}><Icon name="back" size={16}/> Lesson overview</button><div className="quiz-symbol"><Icon name="spark" size={34}/></div><span className="eyebrow">KNOWLEDGE CHECK</span><h1>Artificial Intelligence Fundamentals</h1><p>Check your understanding of the key concepts from this lesson. You’ll see feedback after submitting.</p><div className="quiz-meta"><div><strong>{questions.length}</strong><span>Questions</span></div><div><strong>5 min</strong><span>Estimated</span></div><div><strong>Medium</strong><span>Difficulty</span></div></div><button className="primary" onClick={begin}>Start Quiz <Icon name="arrow" size={16}/></button>
  </div>
  const q = questions[index], selected = answers[index], last = index === questions.length - 1
  const choose = (n: number) => setAnswers(a => { const next = [...a]; next[index] = n; return next })
  const flag = () => setFlagged(f => f.includes(index) ? f.filter(x => x !== index) : [...f, index])
  return <div className="quiz-taking">
    <div className="quiz-top"><button className="brand small" onClick={() => go('dashboard')}><span className="brand-mark"><Icon name="spark" size={16}/></span><span>learnova<span>.ai</span></span></button><span className="quiz-title">AI Fundamentals Quiz</span><button className="icon-btn" aria-label="Exit quiz" onClick={() => go('overview')}><Icon name="close"/></button></div>
    <div className="quiz-progress"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }}/></div>
    <main><div className="question-count">QUESTION {index + 1} OF {questions.length}<button className={flagged.includes(index) ? 'flag on' : 'flag'} onClick={flag}>{flagged.includes(index) ? 'Flagged' : 'Flag question'}</button></div><h1>{q.q}</h1>
      <div className="answer-list">{q.options.map((o, i) => <button key={o} className={selected === i ? 'selected' : ''} aria-pressed={selected === i} onClick={() => choose(i)}><span>{String.fromCharCode(65 + i)}</span><p>{o}</p>{selected === i && <Icon name="check"/>}</button>)}</div>
      <div className="quiz-nav"><button className="secondary" disabled={index === 0} onClick={() => setIndex(i => i - 1)}><Icon name="back" size={16}/> Previous</button>{!last ? <button className="primary" disabled={selected === undefined} onClick={() => setIndex(i => i + 1)}>Next question <Icon name="arrow" size={16}/></button> : <button className="primary" disabled={selected === undefined || busy} onClick={submit}>{busy ? 'Submitting…' : 'Submit Quiz'}</button>}</div></main>
  </div>
}
