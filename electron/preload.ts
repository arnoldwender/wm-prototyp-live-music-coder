// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // SECURITY: everything exposed here is reachable from evaluated pattern code —
  // shared links and gists are run through Function() by design, so this surface
  // is a public API for strangers, not an internal one. Expose the minimum, and
  // never expose anything that takes a path, returns a secret, or performs an
  // irreversible action without a native dialog in front of it.
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  notify: (title: string, body: string) => ipcRenderer.send('app:notify', title, body),
  checkForUpdates: () => ipcRenderer.send('app:check-update'),

  saveProject: (json: string) => ipcRenderer.invoke('file:save', json),
  openProject: () => ipcRenderer.invoke('file:open'),
  getRecentFiles: () => ipcRenderer.invoke('file:recent'),
  revealInFinder: (filePath: string) => ipcRenderer.send('file:reveal', filePath),

  exportWav: (buffer: ArrayBuffer, sampleRate: number, channels: number) =>
    ipcRenderer.invoke('audio:export-wav', buffer, sampleRate, channels),

  // GitHub Gist integration — PAT stays encrypted in the main process via safeStorage
  // and never crosses contextBridge back into the renderer.
  hasGistToken: () => ipcRenderer.invoke('gist:has-token'),
  setGistToken: (token: string) => ipcRenderer.invoke('gist:set-token', token),
  clearGistToken: () => ipcRenderer.invoke('gist:clear-token'),
  saveGist: (payload: {
    files: Record<string, { content: string }>
    description: string
    gistId?: string
    isPublic: boolean
  }) => ipcRenderer.invoke('gist:save', payload),

  setFullscreen: (enabled: boolean) => ipcRenderer.send('window:fullscreen', enabled),

  onFullscreenChanged: (callback: (enabled: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, enabled: boolean) => callback(enabled)
    ipcRenderer.on('window:fullscreen-changed', handler)
    return () => { ipcRenderer.removeListener('window:fullscreen-changed', handler) }
  },

  /* Fired when the OS hands us a .lmc file — double-click, "Open With", or a
     path on the command line. Receive-only: the renderer cannot ask for a file
     this way, so there is no path for it to supply. */
  onFileOpened: (callback: (payload: { json: string; path: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { json: string; path: string }) =>
      callback(payload)
    ipcRenderer.on('file:opened', handler)
    return () => { ipcRenderer.removeListener('file:opened', handler) }
  },

  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string) => callback(action)
    ipcRenderer.on('menu:action', handler)
    return () => { ipcRenderer.removeListener('menu:action', handler) }
  },
})
