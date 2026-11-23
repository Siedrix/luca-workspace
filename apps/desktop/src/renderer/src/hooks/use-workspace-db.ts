import { useEffect, useState } from 'react'
import { ipcErrorMessage } from '@/lib/errors'
import type { WorkspaceDb } from '../../../shared/types'

interface Result {
  key: string
  db: WorkspaceDb | null
  error: string | null
}

/** Reads `.workspace.json` for the saved work folder. Re-reads when `path` or `reloadKey` changes. */
export function useWorkspaceDb(
  path: string,
  reloadKey = 0
): { db: WorkspaceDb | null; loading: boolean; error: string | null } {
  const key = `${reloadKey}:${path}`
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    let cancelled = false
    window.api
      .readWorkspaceDb()
      .then((db) => !cancelled && setResult({ key, db, error: null }))
      .catch((err) => !cancelled && setResult({ key, db: null, error: ipcErrorMessage(err) }))
    return () => {
      cancelled = true
    }
  }, [key])

  const fresh = result?.key === key ? result : null
  return { db: fresh?.db ?? null, loading: !fresh, error: fresh?.error ?? null }
}
