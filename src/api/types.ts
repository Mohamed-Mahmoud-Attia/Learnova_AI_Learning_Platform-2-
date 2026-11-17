/** Shapes of the data the backend sends back. Keep these in sync with the API agreement document. */
export type Range = 'week' | 'month' | 'all'
export type Point = { d: string; m: number }
export type Rec = { id: string; kind: 'lesson' | 'flashcards'; n: string; tag: string; title: string; desc: string; progress?: number; meta: string }
export type Dashboard = { name: string; date: string; week: Point[]; completed: number; streak: number; best: number; lessonsLeft: number; recs: Rec[] }
export type Doc = { id: string; title: string; subject: string; date: string; progress: number; status: 'ready' | 'pdf'; tone: 'blue' | 'purple' | 'green' | 'orange' }
export type Section = { title: string; caption: string; mediaUrl?: string; durationSeconds?: number; script: string[]; keyPoints: string[]; summary: { h: string; p: string }[] }
export type LessonData = { id: string; title: string; source: string; sections: Section[]; completedSections: number[]; note: string }
export type Question = { q: string; options: string[]; answer: number }
export type QuizResult = { score: number; total: number; seconds: number }
export type Card = { q: string; a: string }
export type ProgressData = { stats: { label: string; value: string; delta: string }[]; week: Point[]; goal: string; weak: { t: string; v: number; tip: string }[]; achievement: { title: string; text: string; badge: string } }
export type Profile = { name: string; email: string; difficulty: string; reminders: boolean; quizResults: boolean; weekly: boolean }
export type LessonOptions = { avatar: boolean; extras: boolean }
export type Notice = { id: string; text: string; time: string }
export type AuthUser = { id: string; name: string; email: string }
export type AuthResult = { token: string; user: AuthUser }
