/** Lesson overview: what the lesson covers, before starting it. */
import { api, type LessonData } from '../api'
import type { Go } from '../lib/router'
import { useApi } from '../lib/hooks'
import { Icon } from '../components/Icon'
import { Load } from '../components/ui'

function OverviewView({ go, lesson }: { go: Go; lesson: LessonData }) {
  return <div className="overview">
    <button className="back-link" onClick={() => go('library')}><Icon name="back" size={16}/> Back to My Library</button>
    <div className="overview-hero">
      <div className="overview-copy"><span className="tag">COMPUTER SCIENCE · AI FUNDAMENTALS</span><h1>{lesson.title}</h1><p>Discover how machines learn, reason, and solve problems through a clear, visual journey designed around your source material.</p><div className="overview-actions"><button className="primary" onClick={()=>go('lesson')}><Icon name="play" size={16}/> Start Lesson</button><button className="secondary" onClick={()=>go('quiz')}>Take Quiz</button></div></div>
      <div className="instructor-frame"><div className="avatar-illustration"><div className="halo"/><div className="head"><span/><i/></div><div className="body"/></div><div className="instructor-label"><span className="live-dot"/><div><strong>Maya</strong><small>Your AI learning guide</small></div><span>AI</span></div></div>
    </div>
    <div className="overview-stats"><div><strong>42 min</strong><span>Estimated duration</span></div><div><strong>{lesson.sections.length}</strong><span>Lesson sections</span></div><div><strong>Intermediate</strong><span>Explanation level</span></div><div><strong>English</strong><span>Language</span></div></div>
    <div className="overview-grid"><section className="card"><span className="eyebrow">WHAT YOU'LL LEARN</span><h2>Learning objectives</h2>{['Define artificial intelligence and its core goals','Distinguish between narrow and general AI','Understand how machine learning enables AI systems','Recognize everyday applications and ethical questions'].map((x,i)=><div className="objective" key={x}><span>{i+1}</span><p>{x}</p></div>)}</section><section className="card"><span className="eyebrow">SOURCE MATERIAL</span><h2>Lesson foundation</h2><div className="source-file"><span className="pdf-icon"><Icon name="file"/></span><div><strong>{lesson.source}</strong><small>24 pages · Uploaded May 24</small></div></div><h3>Key topics</h3><div className="topic-tags"><span>Machine learning</span><span>Neural networks</span><span>AI ethics</span><span>Expert systems</span></div></section></div>
  </div>
}


export function Overview({ go, id }: { go: Go; id: string }) {
  const q = useApi(() => api.lesson(id), [id])
  return <Load q={q}>{l => <OverviewView go={go} lesson={l}/>}</Load>
}
