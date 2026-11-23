import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AppApi } from '../shared/types'

const api: AppApi = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  pickFolder: () => ipcRenderer.invoke('workspace:pick-folder'),
  setWorkspacePath: (path) => ipcRenderer.invoke('settings:set-workspace', path),
  scanWorkspace: (path) => ipcRenderer.invoke('workspace:scan', path),
  readWorkspaceDb: () => ipcRenderer.invoke('db:read')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
