export interface AppSettings {
  /** Absolute path to the folder the app works in, or null before onboarding. */
  workspacePath: string | null
}

export interface GitRepo {
  name: string
  path: string
}

/** The local `docs` folder for personal notes in the root of the work folder. Not a git repo. */
export interface DocsFolder {
  name: string
  path: string
}

export interface WorkspaceScan {
  /** The `docs` folder, if the work folder has one. Never included in `repos`. */
  docs: DocsFolder | null
  repos: GitRepo[]
}

/** Name of the database file created in the root of the work folder. */
export const DB_FILENAME = '.workspace.json'
/** Bump when the shape of WorkspaceDb changes, and add a migration in main/db.ts. */
export const DB_VERSION = 1

/**
 * Contents of `.workspace.json`. Add new top-level collections here as features need them,
 * e.g. `repos: Record<string, RepoRecord>`.
 */
export interface WorkspaceDb {
  version: number
  createdAt: string
  updatedAt: string
}

export interface AppApi {
  getSettings: () => Promise<AppSettings>
  /** Opens the native folder picker. Resolves to the chosen path, or null if cancelled. */
  pickFolder: () => Promise<string | null>
  /** Validates the workspace folder, creates its `.workspace.json` if missing, and saves it. */
  setWorkspacePath: (path: string) => Promise<AppSettings>
  /** Finds the `docs` folder and the direct subfolders of `path` that contain a `.git` entry. */
  scanWorkspace: (path: string) => Promise<WorkspaceScan>
  /** Reads `.workspace.json` from the saved work folder, creating it if missing. */
  readWorkspaceDb: () => Promise<WorkspaceDb>
}
