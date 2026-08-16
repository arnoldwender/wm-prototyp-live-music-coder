// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // SECURITY: everything exposed here is reachable from evaluated pattern code —
  // shared links and gists are run through Function() by design, so this surface
  // is a public API for strangers, not an internal one. Expose the minimum, and
  // never expose anything that takes a path or performs an irreversible action
  // without a native dialog in front of it.
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  notify: (title: string, body: string) => ipcRenderer.send('app:notify', title, body),
  checkForUpdates: () => ipcRenderer.send('app:check-update'),

  // `quit` was REMOVED 2026-08-16: it fired app.quit() unconditionally from the
  // renderer with no unsaved-work guard and had zero callers. In a live-performance
  // tool with no autosave, a one-line hostile pattern could end a set and discard it.

  saveProject: (json: string) => ipcRenderer.invoke('file:save', json),
  // `saveProjectToPath` was REMOVED 2026-08-16 — see electron/ipc/file.ts.
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
