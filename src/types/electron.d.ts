// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

export interface ElectronAPI {
  getAppInfo: () => Promise<{ version: string; platform: NodeJS.Platform; arch: string; isElectron: true }>
  notify: (title: string, body: string) => void
  quit: () => void
  checkForUpdates: () => void
  saveProject: (json: string) => Promise<{ path: string } | null>
  saveProjectToPath: (json: string, filePath: string) => Promise<{ path: string }>
  openProject: () => Promise<{ json: string; path: string } | null>
  getRecentFiles: () => Promise<{ path: string; name: string; date: string }[]>
  revealInFinder: (filePath: string) => void
  exportWav: (buffer: ArrayBuffer, sampleRate: number, channels: number) => Promise<{ path: string } | null>
  popOutPanel: (panelId: string) => void
  setFullscreen: (enabled: boolean) => void
  onFullscreenChanged: (callback: (enabled: boolean) => void) => () => void
  onPopoutClosed: (callback: (panelId: string) => void) => () => void
  onMenuAction: (callback: (action: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
