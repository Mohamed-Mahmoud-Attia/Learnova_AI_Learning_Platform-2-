/** Who is logged in: the login check and sign out. */
import { useState, useEffect } from 'react'
import { api, session } from '../api'

export const signOut = () => api.logout().catch(() => { /* even if the server call fails, log out locally */ }).finally(() => session.set(null))
export function useAuthed() {
  const [authed, setAuthed] = useState(!!session.token)
  useEffect(() => {
    const f = () => setAuthed(!!session.token)
    addEventListener('auth', f); addEventListener('storage', f) // 'storage' = logged out/in from another tab
    return () => { removeEventListener('auth', f); removeEventListener('storage', f) }
  }, [])
  return authed
}
