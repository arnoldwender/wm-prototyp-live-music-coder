// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  notify: (title: string, body: string) => ipcRenderer.send('app:notify', title, body),
  quit: () => ipcRenderer.send('app:quit'),
  checkForUpdates: () => ipcRenderer.send('app:check-update'),

  saveProject: (json: string) => ipcRenderer.invoke('file:save', json),
  saveProjectToPath: (json: string, filePath: string) => ipcRenderer.invoke('file:save-path', json, filePath),
  openProject: () => ipcRenderer.invoke('file:open'),
  getRecentFiles: () => ipcRenderer.invoke('file:recent'),
  revealInFinder: (filePath: string) => ipcRenderer.send('file:reveal', filePath),

  exportWav: (buffer: ArrayBuffer, sampleRate: number, channels: number) =>
    ipcRenderer.invoke('audio:export-wav', buffer, sampleRate, channels),

  popOutPanel: (panelId: string) => ipcRenderer.send('window:popout', panelId),
  setFullscreen: (enabled: boolean) => ipcRenderer.send('window:fullscreen', enabled),

  onFullscreenChanged: (callback: (enabled: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, enabled: boolean) => callback(enabled)
    ipcRenderer.on('window:fullscreen-changed', handler)
    return () => { ipcRenderer.removeListener('window:fullscreen-changed', handler) }
  },

  onPopoutClosed: (callback: (panelId: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, panelId: string) => callback(panelId)
    ipcRenderer.on('window:popout-closed', handler)
    return () => { ipcRenderer.removeListener('window:popout-closed', handler) }
  },

  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string) => callback(action)
    ipcRenderer.on('menu:action', handler)
    return () => { ipcRenderer.removeListener('menu:action', handler) }
  },
})
