/**
 * Sample data, used only while VITE_API_URL is empty (no backend yet).
 * Once the backend is connected you can delete this file and the `sample(...)` calls in index.ts.
 */
import { BASE } from './client'
import type { AuthResult, Card, Dashboard, Doc, LessonData, Notice, Point, Profile, ProgressData, Question, QuizResult, Range, Section } from './types'

/** Runs `f` only in sample-data mode; returns undefined when a real backend is configured. */
export const sample = <T,>(f: () => T): T => (BASE ? (undefined as T) : f())

/* ---------- the "logged-in" sample user (remembered so the UI shows the name you registered with) ---------- */
export const mockUser = (): { name: string; email: string } | null => { try { return JSON.parse(localStorage.getItem('mock_user') ?? 'null') } catch { return null } }
export const mockAuth = (email: string, name?: string): AuthResult => {
  const old = mockUser()
  const user = { name: name ?? (old?.email === email ? old.name : email.split('@')[0].replace(/^./, c => c.toUpperCase())), email }
  localStorage.setItem('mock_user', JSON.stringify(user))
  return { token: 'sample-token', user: { id: 'u1', ...user } }
}

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const points = (labels: string[], minutes: number[]): Point[] => minutes.map((m, i) => ({ d: labels[i], m }))

export const DOCS: Doc[] = [
  { id: '1', title: 'Introduction to Artificial Intelligence', subject: 'Computer Science', date: 'May 24, 2025', progress: 68, status: 'ready', tone: 'blue' },
  { id: '2', title: 'Data Structures and Algorithms', subject: 'Programming', date: 'May 21, 2025', progress: 42, status: 'ready', tone: 'purple' },
  { id: '3', title: 'Database Management Systems', subject: 'Databases', date: 'May 18, 2025', progress: 100, status: 'ready', tone: 'green' },
  { id: '4', title: 'Computer Networks', subject: 'Networking', date: 'May 12, 2025', progress: 0, status: 'pdf', tone: 'orange' },
]

export const SECTIONS: Section[] = [
  { title: 'What is Artificial Intelligence?', mediaUrl: '/demo-lesson.wav', durationSeconds: 12, caption: 'AI is the science of building systems that can perform tasks we associate with human intelligence.',
    script: ['Artificial Intelligence, or AI, is the field of computer science focused on creating systems that can perform tasks we typically associate with human intelligence.', 'These tasks include understanding language, recognizing patterns, solving problems, and making decisions.', 'Most of the AI we encounter today is narrow AI: technology designed to perform one specific task exceptionally well.', 'Machine learning gives these systems the ability to discover useful patterns in data.'],
    keyPoints: ['AI simulates aspects of human intelligence', 'Narrow AI specializes in a defined task', 'Machine learning identifies patterns in data', 'Responsible AI considers fairness and transparency'],
    summary: [{ h: 'A practical definition', p: 'Artificial intelligence describes computer systems capable of tasks that usually need human cognition.' }, { h: 'AI in everyday life', p: 'Recommendation engines, voice assistants, image recognition, and navigation are all examples of narrow AI.' }] },
  { title: 'Machine learning basics', mediaUrl: '/demo-lesson.wav', durationSeconds: 12, caption: 'Machine learning lets computers improve from data instead of following fixed rules.',
    script: ['Machine learning is a way of teaching computers by showing them examples.', 'Instead of writing every rule by hand, we let the system find the patterns itself.', 'The more good data a model sees, the better its predictions usually become.'],
    keyPoints: ['Models learn from examples', 'Training data quality matters', 'Predictions improve with more data'],
    summary: [{ h: 'Learning from data', p: 'A model adjusts itself to reduce mistakes on the examples it has seen.' }] },
  { title: 'Neural networks', mediaUrl: '/demo-lesson.wav', durationSeconds: 12, caption: 'Neural networks are layered models inspired by how neurons pass signals.',
    script: ['A neural network is made of layers of simple connected units.', 'Each unit takes inputs, applies a weight, and passes a signal forward.', 'Stacking many layers lets the network learn complex patterns.'],
    keyPoints: ['Layers of connected units', 'Weights are learned during training', 'Deeper networks learn richer patterns'],
    summary: [{ h: 'Layers and weights', p: 'Training adjusts the weights so the output gets closer to the correct answer.' }] },
]

export const QUESTIONS: Question[] = [
  { q: 'What is the main goal of Artificial Intelligence?', options: ['To make computers perform tasks that normally require human intelligence.', 'To increase the physical size of computers.', 'To replace all computer networks.', 'To store files without processing them.'], answer: 0 },
  { q: 'Which description best matches narrow AI?', options: ['A system conscious of its own existence.', 'A system designed for a specific task.', 'A machine that can solve every human problem.', 'A computer without training data.'], answer: 1 },
  { q: 'What enables many AI systems to improve from experience?', options: ['Larger monitors', 'Manual file storage', 'Machine learning', 'Network cables'], answer: 2 },
]

export const CARDS: Card[] = [
  { q: 'What is Artificial Intelligence?', a: 'The science of creating systems that perform tasks usually requiring human intelligence.' },
  { q: 'What is narrow AI?', a: 'AI designed and trained to complete one specific task, such as image recognition.' },
  { q: 'What is machine learning?', a: 'A method that enables computers to find patterns and improve through data.' },
  { q: 'What is a neural network?', a: 'A layered computing model inspired by how neurons process information.' },
]

const PROFILE_DEFAULT: Profile = { name: 'Alex Kim', email: 'alex.kim@university.edu', difficulty: 'Adaptive', reminders: true, quizResults: true, weekly: true }

export const profileMock = (): Profile => ({ ...PROFILE_DEFAULT, ...(mockUser() ?? {}) })

export const dashboardMock = (range: Range): Dashboard => ({
  name: (mockUser()?.name ?? 'Alex').split(' ')[0], date: 'Monday, May 26', completed: 68, streak: 7, best: 12, lessonsLeft: 2,
  week: points(LETTERS, range === 'week' ? [38, 62, 45, 82, 58, 28, 68] : [50, 55, 60, 70, 65, 48, 72]),
  recs: [
    { id: '1', kind: 'lesson', n: '01', tag: 'AI FUNDAMENTALS', title: 'What makes a machine intelligent?', desc: 'Continue your introduction to artificial intelligence.', progress: 68, meta: '12 min left' },
    { id: '1', kind: 'flashcards', n: '12', tag: 'FLASHCARD SET', title: 'Core AI terminology', desc: 'Review essential concepts from your recent lesson.', meta: '24 cards|8 mastered' },
  ],
})

export const lessonMock = (id: string): LessonData => ({
  id, title: 'Introduction to Artificial Intelligence', source: 'Introduction to Artificial Intelligence.pdf', sections: SECTIONS, completedSections: [],
  note: 'Remember to review the difference between narrow AI and general AI before the quiz.',
})

export const askMock = (question: string) => ({ answer: `Good question. Based on this lesson: “${question}” relates to how AI systems learn patterns from data and apply them to specific tasks.` })

export const submitQuizMock = (answers: number[], seconds: number): QuizResult =>
  ({ score: answers.filter((a, i) => a === QUESTIONS[i]?.answer).length, total: QUESTIONS.length, seconds })

export const progressMock = (): ProgressData => ({
  stats: [{ label: 'Total Study Time', value: '4h 38m', delta: '+18%' }, { label: 'Lessons Completed', value: '6', delta: '+2' }, { label: 'Quizzes Taken', value: '4', delta: '+1' }, { label: 'Average Score', value: '86%', delta: '+4%' }],
  week: points(DAYS, [38, 62, 45, 82, 58, 28, 68]), goal: '5h',
  weak: [{ t: 'Neural Networks', v: 62, tip: 'Review activation functions and hidden layers.' }, { t: 'AI Ethics', v: 71, tip: 'Focus on bias, fairness, and model transparency.' }],
  achievement: { title: 'Seven days of curiosity', text: 'You studied every day this week. That’s your longest streak this month.', badge: '7 day streak' },
})

export const NOTICES: Notice[] = [
  { id: '1', text: 'Your lesson “Computer Networks” is ready.', time: '2h ago' },
  { id: '2', text: 'You are 2 lessons away from your weekly goal.', time: 'Yesterday' },
]
