// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, app, Notification } from 'electron'

/**
 * Register app-level IPC handlers.
 * Provides version info, notifications, quit, and update triggers.
 */
export function registerAppHandlers(): void {
  // --- Return app info to renderer ---
  ipcMain.handle('app:info', () => {
    return {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      isElectron: true,
    }
  })

  // --- Show native notification ---
  ipcMain.on('app:notify', (_event, title: string, body: string) => {
    new Notification({ title, body }).show()
  })

  // --- Quit the application ---
  ipcMain.on('app:quit', () => {
    app.quit()
  })

  // --- Trigger manual update check ---
  ipcMain.on('app:check-update', () => {
    app.emit('check-for-updates')
  })
}
