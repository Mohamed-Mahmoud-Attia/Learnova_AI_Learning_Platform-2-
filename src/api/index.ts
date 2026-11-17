/**
 * Every backend call lives in this folder, nowhere else.
 *   types.ts   what the backend sends back
 *   client.ts  base URL, login session, the `req` helper
 *   index.ts   (this file) one function per endpoint, with the route in a comment
 *   mock.ts    sample data used until VITE_API_URL is set
 *
 * When the backend is ready: copy `.env.example` to `.env`, set VITE_API_URL=https://your-api.com,
 * restart `npm run dev`, then compare each endpoint comment below with the real routes.
 */
import { BASE, post, put, req, session, wait } from './client'
import {
  DOCS, CARDS, NOTICES, QUESTIONS, askMock, dashboardMock, lessonMock, mockAuth, mockUser,
  profileMock, progressMock, sample, submitQuizMock,
} from './mock'
import type {
  AuthResult, AuthUser, Card, Dashboard, Doc, LessonData, LessonOptions, Notice, Profile, ProgressData, Question, QuizResult, Range,
} from './types'

export { session }
export type * from './types'

export const api = {
  /* ----- account ----- */

  /** POST /auth/register  { name, email, password } -> { token, user }   (409 = email already used) */
  register: async (name: string, email: string, password: string): Promise<AuthUser> => {
    if (!BASE && email.toLowerCase() === 'taken@mail.com') { await wait(); throw new Error('This email is already registered.') } // sample mode only
    const r = await req<AuthResult>('/auth/register', sample(() => mockAuth(email, name)), post({ name, email, password }))
    session.set(r.token); return r.user
  },
  /** POST /auth/login  { email, password } -> { token, user }   (401 = wrong email or password) */
  login: async (email: string, password: string): Promise<AuthUser> => {
    if (!BASE && password.length < 6) { await wait(); throw new Error('Wrong email or password.') } // sample mode only
    const r = await req<AuthResult>('/auth/login', sample(() => mockAuth(email)), post({ email, password }))
    session.set(r.token); return r.user
  },
  /** GET /auth/me -> { id, name, email }   (not used yet: handy for checking the token when the app opens) */
  me: () => req<AuthUser>('/auth/me', sample(() => ({ id: 'u1', ...(mockUser() ?? { name: 'Alex Kim', email: 'alex@mail.com' }) }))),
  /** POST /auth/logout */
  logout: () => req<void>('/auth/logout', undefined, { method: 'POST' }),
  /** GET /profile */
  profile: () => req<Profile>('/profile', sample(profileMock)),
  /** PUT /profile */
  saveProfile: (p: Profile) => req<Profile>('/profile', p, put(p)),
  /** GET /notifications */
  notifications: () => req<Notice[]>('/notifications', NOTICES),

  /* ----- dashboard, library, progress ----- */

  /** GET /dashboard?range=week|month|all */
  dashboard: (range: Range = 'week') => req<Dashboard>(`/dashboard?range=${range}`, sample(() => dashboardMock(range))),
  /** GET /documents */
  documents: () => req<Doc[]>('/documents', DOCS),
  /** DELETE /documents/:id */
  deleteDocument: (id: string) => req<void>(`/documents/${id}`, undefined, { method: 'DELETE' }),
  /** GET /progress?range=week|month|all */
  progress: (range: Range = 'week') => req<ProgressData>(`/progress?range=${range}`, sample(progressMock)),

  /* ----- creating a lesson from a PDF ----- */

  /**
   * POST /lessons  (multipart: file + options)  -> { id }
   * GET  /lessons/:id/status -> { progress: 0-100 }   (polled every 1.5 s until 100)
   * Calls onProgress(0-100) while the backend works and resolves with the new lesson id.
   */
  createLesson: async (file: File, options: LessonOptions, onProgress: (p: number) => void, signal?: AbortSignal): Promise<string> => {
    if (!BASE) { // sample mode: fake progress
      for (let p = 0; p <= 100; p += 2) { if (signal?.aborted) throw new Error('cancelled'); onProgress(p); await wait(90) }
      return '1'
    }
    const form = new FormData(); form.append('file', file); form.append('options', JSON.stringify(options))
    const { id } = await req<{ id: string }>('/lessons', { id: '' }, { method: 'POST', body: form, signal })
    for (;;) {
      if (signal?.aborted) throw new Error('cancelled')
      const { progress } = await req<{ progress: number }>(`/lessons/${id}/status`, { progress: 100 })
      onProgress(progress)
      if (progress >= 100) return id
      await wait(1500)
    }
  },

  /* ----- one lesson ----- */

  /** GET /lessons/:id */
  lesson: (id: string) => req<LessonData>(`/lessons/${id}`, sample(() => lessonMock(id))),
  /** POST /lessons/:id/sections/:index/complete  { done } */
  completeSection: (id: string, index: number, done: boolean) => req<void>(`/lessons/${id}/sections/${index}/complete`, undefined, post({ done })),
  /** PUT /lessons/:id/note  { note } */
  saveNote: (id: string, note: string) => req<void>(`/lessons/${id}/note`, undefined, put({ note })),
  /** POST /lessons/:id/ask  { question } -> { answer } */
  ask: (id: string, question: string) => req<{ answer: string }>(`/lessons/${id}/ask`, askMock(question), post({ question })),
  /** GET /lessons/:id/quiz */
  quiz: (id: string) => req<Question[]>(`/lessons/${id}/quiz`, QUESTIONS),
  /** POST /lessons/:id/quiz/submit  { answers, seconds } -> { score, total, seconds } */
  submitQuiz: (id: string, answers: number[], seconds: number) => req<QuizResult>(`/lessons/${id}/quiz/submit`, sample(() => submitQuizMock(answers, seconds)), post({ answers, seconds })),
  /** GET /lessons/:id/flashcards */
  flashcards: (id: string) => req<Card[]>(`/lessons/${id}/flashcards`, CARDS),
  /** POST /lessons/:id/flashcards/review  { index, known } */
  reviewCard: (id: string, index: number, known: boolean) => req<void>(`/lessons/${id}/flashcards/review`, undefined, post({ index, known })),
}
