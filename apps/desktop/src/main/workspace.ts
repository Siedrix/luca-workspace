import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import type { DocsFolder, GitRepo, WorkspaceScan } from '../shared/types'

/** Folder name (case-insensitive) treated as the personal notes folder. */
const DOCS_FOLDER = 'docs'

export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

/**
 * Scans the top level of `root`:
 * - `docs` (if present) is returned separately as the personal notes folder, git or not.
 * - Every other non-hidden subfolder containing `.git` is a repo. `.git` may be a
 *   directory (normal clone) or a file (worktree / submodule).
 */
export async function scanWorkspace(root: string): Promise<WorkspaceScan> {
  const entries = await readdir(root, { withFileTypes: true })
  const folders = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'))

  const docsEntry = folders.find((e) => e.name.toLowerCase() === DOCS_FOLDER)
  const docs: DocsFolder | null = docsEntry
    ? { name: docsEntry.name, path: join(root, docsEntry.name) }
    : null

  const repos = await Promise.all(
    folders
      .filter((e) => e !== docsEntry)
      .map(async (entry) => {
        const path = join(root, entry.name)
        return (await exists(join(path, '.git'))) ? { name: entry.name, path } : null
      })
  )

  return {
    docs,
    repos: repos
      .filter((r): r is GitRepo => r !== null)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }
}
