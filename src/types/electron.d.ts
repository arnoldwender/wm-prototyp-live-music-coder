// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

export interface ElectronAPI {
  getAppInfo: () => Promise<{ version: string; platform: NodeJS.Platform; arch: string; isElectron: true }>
  notify: (title: string, body: string) => void
  checkForUpdates: () => void
  saveProject: (json: string) => Promise<{ path: string } | null>
  openProject: () => Promise<{ json: string; path: string } | null>
  getRecentFiles: () => Promise<{ path: string; name: string; date: string }[]>
  revealInFinder: (filePath: string) => void
  exportWav: (buffer: ArrayBuffer, sampleRate: number, channels: number) => Promise<{ path: string } | null>
  hasGistToken: () => Promise<boolean>
  importGistTokenFromClipboard: () => Promise<{
    ok: boolean
    reason?: 'empty' | 'invalid' | 'cancelled' | 'unavailable'
  }>
  clearGistToken: () => Promise<void>
  saveGist: (payload: {
    files: Record<string, { content: string }>
    description: string
    gistId?: string
    isPublic: boolean
  }) => Promise<{ id: string; url: string }>
  setFullscreen: (enabled: boolean) => void
  onFullscreenChanged: (callback: (enabled: boolean) => void) => () => void
  onFileOpened: (callback: (payload: { json: string; path: string }) => void) => () => void
  onMenuAction: (callback: (action: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
