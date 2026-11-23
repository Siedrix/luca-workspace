import { readFile, rename, writeFile } from 'fs/promises'
import { join } from 'path'
import { DB_FILENAME, DB_VERSION, type WorkspaceDb } from '../shared/types'

export class WorkspaceDbError extends Error {}

export function dbPath(root: string): string {
  return join(root, DB_FILENAME)
}

function emptyDb(): WorkspaceDb {
  const now = new Date().toISOString()
  return { version: DB_VERSION, createdAt: now, updatedAt: now }
}

function parse(raw: string, file: string): WorkspaceDb {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new WorkspaceDbError(`${file} is not valid JSON. Fix or delete it to continue.`)
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new WorkspaceDbError(`${file} must contain a JSON object.`)
  }
  const version = (data as { version?: unknown }).version
  if (typeof version !== 'number') {
    throw new WorkspaceDbError(`${file} has no "version" field.`)
  }
  if (version > DB_VERSION) {
    throw new WorkspaceDbError(
      `${file} was written by a newer version of the app (v${version}). Update the app to open it.`
    )
  }
  // Older versions: add migrations here, keyed on `version`, before returning.
  return data as WorkspaceDb
}

async function writeAtomic(file: string, db: WorkspaceDb): Promise<void> {
  // Write to a temp file then rename, so a crash never leaves a half-written database.
  const tmp = `${file}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(db, null, 2) + '\n', 'utf8')
  await rename(tmp, file)
}

/**
 * Creates `.workspace.json` in `root` if it doesn't exist, and returns its contents.
 * An existing file is never overwritten; if it's unreadable, this throws instead.
 */
export async function ensureWorkspaceDb(root: string): Promise<WorkspaceDb> {
  const file = dbPath(root)
  try {
    return parse(await readFile(file, 'utf8'), file)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
  const db = emptyDb()
  try {
    // 'wx' fails if another writer created the file in the meantime.
    await writeFile(file, JSON.stringify(db, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' })
    return db
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      return parse(await readFile(file, 'utf8'), file)
    }
    throw err
  }
}

export async function readWorkspaceDb(root: string): Promise<WorkspaceDb> {
  return ensureWorkspaceDb(root)
}

// One write queue per database file so concurrent updates can't overwrite each other.
const queues = new Map<string, Promise<unknown>>()

/**
 * Read-modify-write. `fn` receives a copy of the current data and returns the next data;
 * `updatedAt` is set automatically.
 */
export function updateWorkspaceDb(
  root: string,
  fn: (db: WorkspaceDb) => WorkspaceDb
): Promise<WorkspaceDb> {
  const file = dbPath(root)
  const run = async (): Promise<WorkspaceDb> => {
    const current = await ensureWorkspaceDb(root)
    const next = { ...fn(structuredClone(current)), version: DB_VERSION }
    next.updatedAt = new Date().toISOString()
    await writeAtomic(file, next)
    return next
  }
  const result = (queues.get(file) ?? Promise.resolve()).then(run, run)
  queues.set(
    file,
    result.catch(() => undefined)
  )
  return result
}
