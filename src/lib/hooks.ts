/** Data-loading hook used by every page that talks to the API. */
import { useState, useEffect } from 'react'

export type Q<T> = { data?: T; error?: string; loading: boolean; retry: () => void }
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []): Q<T> {
  const [s, set] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    let live = true
    set(x => ({ ...x, loading: true, error: undefined }))
    fn().then(data => live && set({ data, loading: false })).catch((e: Error) => live && set(x => ({ ...x, loading: false, error: e.message })))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n])
  return { ...s, retry: () => setN(x => x + 1) }
}
