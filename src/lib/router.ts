import { useState, useEffect } from 'react'

/** The app's pages. The address looks like  #/page/lessonId?q=search  (so the back button and refresh work). */
export type Page = 'login' | 'register' | 'dashboard' | 'upload' | 'library' | 'overview' | 'lesson' | 'quiz' | 'flashcards' | 'progress' | 'settings'
export type Go = (p: Page, id?: string, q?: string) => void
export const PAGES: Page[] = ['login', 'register', 'dashboard', 'upload', 'library', 'overview', 'lesson', 'quiz', 'flashcards', 'progress', 'settings']

function parse() {
  const [path, qs = ''] = location.hash.replace(/^#\/?/, '').split('?')
  const [p, id = '1'] = path.split('/')
  return { page: (PAGES as string[]).includes(p) ? (p as Page) : 'dashboard', id, q: new URLSearchParams(qs).get('q') ?? '' }
}
export function useRoute() {
  const [r, setR] = useState(parse)
  useEffect(() => { const f = () => setR(parse()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  const go: Go = (page, id = r.id, q = '') => { location.hash = `/${page}/${id}${q ? `?q=${encodeURIComponent(q)}` : ''}`; window.scrollTo(0, 0) }
  return { ...r, go }
}
