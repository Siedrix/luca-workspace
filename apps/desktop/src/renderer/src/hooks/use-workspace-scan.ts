import { useEffect, useState } from 'react'
import { ipcErrorMessage } from '@/lib/errors'
import type { WorkspaceScan } from '../../../shared/types'

interface ScanState extends WorkspaceScan {
  loading: boolean
  error: string | null
}

interface Result {
  key: string
  scan: WorkspaceScan
  error: string | null
}

const EMPTY: WorkspaceScan = { docs: null, repos: [] }

/** Scans `path` for the docs folder and git repos. Re-runs when `path` or `reloadKey` changes. */
export function useWorkspaceScan(path: string | null, reloadKey = 0): ScanState {
  const key = `${reloadKey}:${path}`
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    if (!path) return
    let cancelled = false
    window.api
      .scanWorkspace(path)
      .then((scan) => !cancelled && setResult({ key, scan, error: null }))
      .catch((err) => !cancelled && setResult({ key, scan: EMPTY, error: ipcErrorMessage(err) }))
    return () => {
      cancelled = true
    }
  }, [path, key])

  if (!path) return { ...EMPTY, loading: false, error: null }
  // Results from a previous path/reload are stale until the new request lands.
  const fresh = result?.key === key ? result : null
  return { ...(fresh?.scan ?? EMPTY), loading: !fresh, error: fresh?.error ?? null }
}
