/**
 * The small HTTP layer: base URL, login session, and the `req` helper every API call goes through.
 * Set VITE_API_URL in `.env` to switch from sample data to the real backend.
 */
export const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')

export const wait = (ms = 350) => new Promise<void>(resolve => setTimeout(resolve, ms))

/* ---------- login session (the token lives in localStorage) ---------- */
const TOKEN_KEY = 'token' // if the backend uses cookies instead of a token, see the note inside req()
export const session = {
  get token() { return localStorage.getItem(TOKEN_KEY) },
  set(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY)
    window.dispatchEvent(new Event('auth')) // the app listens to this and redirects to /login or /dashboard
  },
}

/**
 * Sends one request. With no VITE_API_URL it just returns `sample` after a short delay,
 * so the whole UI works without a backend.
 */
export async function req<T>(path: string, sample: T, init?: RequestInit): Promise<T> {
  if (!BASE) { await wait(); return sample }
  const res = await fetch(BASE + path, {
    ...init,
    // credentials: 'include',  // <- uncomment if the backend uses cookies instead of a Bearer token
    headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}) },
  })
  if (res.status === 401 && !path.startsWith('/auth/')) { // token expired or invalid
    session.set(null)
    window.dispatchEvent(new CustomEvent('toast', { detail: 'Your session expired. Please sign in again.' }))
    throw new Error('Session expired')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => null) as { message?: string } | null // backend errors look like { "message": "..." }
    throw new Error(err?.message || `Request failed (${res.status})`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const post = (data: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(data) })
export const put = (data: unknown): RequestInit => ({ method: 'PUT', body: JSON.stringify(data) })
