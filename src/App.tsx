/** The app root: picks the page from the address and sends logged-out visitors to the login page. */
import { useEffect } from 'react'
import { useAuthed } from './lib/auth'
import { useRoute } from './lib/router'
import { AppShell } from './components/AppShell'
import { Dashboard } from './pages/Dashboard'
import { Flashcards } from './pages/Flashcards'
import { Lesson } from './pages/Lesson'
import { Library } from './pages/Library'
import { Login, Register } from './pages/Auth'
import { Overview } from './pages/Overview'
import { Progress } from './pages/Progress'
import { Quiz } from './pages/Quiz'
import { Settings } from './pages/Settings'
import { Toasts } from './components/ui'
import { Upload } from './pages/Upload'

export default function App() {
  const { page, id, q, go } = useRoute()
  const authed = useAuthed()
  const isAuthPage = page === 'login' || page === 'register'
  useEffect(() => {
    if (!authed && !isAuthPage) go('login')      // not logged in -> login page
    if (authed && isAuthPage) go('dashboard')    // already logged in -> dashboard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, page])
  if (!authed && !isAuthPage) return <Toasts/>
  const content = page === 'login' ? <Login go={go}/> : page === 'register' ? <Register go={go}/>
    : page === 'dashboard' ? <Dashboard go={go}/> : page === 'upload' ? <Upload go={go}/> : page === 'library' ? <Library go={go} q0={q}/>
    : page === 'overview' ? <Overview key={id} go={go} id={id}/> : page === 'lesson' ? <Lesson key={id} go={go} id={id}/> : page === 'quiz' ? <Quiz key={id} go={go} id={id}/>
    : page === 'flashcards' ? <Flashcards key={id} go={go} id={id}/> : page === 'progress' ? <Progress/> : <Settings/>
  return <><Toasts/>{page === 'quiz' || isAuthPage ? content : <AppShell page={page} go={go}>{content}</AppShell>}</>
}
