import { BrowserWindow, dialog, ipcMain } from 'electron'
import { ensureWorkspaceDb, readWorkspaceDb } from './db'
import { loadSettings, saveSettings } from './settings'
import { isDirectory, scanWorkspace } from './workspace'

export function registerIpcHandlers(): void {
  ipcMain.handle('settings:get', () => loadSettings())

  ipcMain.handle('workspace:pick-folder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      title: 'Choose your work folder',
      buttonLabel: 'Use this folder',
      properties: ['openDirectory', 'createDirectory']
    }
    const result = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })

  ipcMain.handle('settings:set-workspace', async (_event, path: unknown) => {
    if (typeof path !== 'string' || !(await isDirectory(path))) {
      throw new Error('The selected work folder does not exist.')
    }
    // Create the database first, so a folder we can't write to is never saved as the workspace.
    try {
      await ensureWorkspaceDb(path)
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code
      if (code === 'EACCES' || code === 'EPERM' || code === 'EROFS') {
        throw new Error(
          "The app can't write to this folder. Choose a folder you have write access to.",
          { cause: err }
        )
      }
      throw err
    }
    return saveSettings({ workspacePath: path })
  })

  ipcMain.handle('workspace:scan', async (_event, path: unknown) => {
    if (typeof path !== 'string' || !(await isDirectory(path))) {
      throw new Error('The work folder does not exist.')
    }
    return scanWorkspace(path)
  })

  ipcMain.handle('db:read', async () => {
    const { workspacePath } = await loadSettings()
    if (!workspacePath) throw new Error('No work folder has been chosen yet.')
    return readWorkspaceDb(workspacePath)
  })
}
