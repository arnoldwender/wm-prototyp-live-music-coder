// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, BrowserWindow } from 'electron'

/**
 * Register window management IPC handlers.
 *
 * NOTE: `window:popout` was removed because `/popout/:panelId` has no route in
 * `src/App.tsx` (rendered `<NotFound />`) and had zero callers in `src/`.
 */
export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  // --- Toggle fullscreen ---
  ipcMain.on('window:fullscreen', (_event, enabled: unknown) => {
    if (typeof enabled !== 'boolean') return
    mainWindow.setFullScreen(enabled)
  })

  // --- Forward fullscreen state changes to renderer ---
  mainWindow.on('enter-full-screen', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window:fullscreen-changed', true)
    }
  })

  mainWindow.on('leave-full-screen', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window:fullscreen-changed', false)
    }
  })
}

/** Retained as a no-op hook for shutdown symmetry in main.ts. */
export function closeAllPopouts(): void {
  // No pop-out windows are created.
}
