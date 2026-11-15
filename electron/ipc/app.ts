// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, app, Notification } from 'electron'

const MAX_NOTIFY_TITLE = 80
const MAX_NOTIFY_BODY = 240
const MIN_NOTIFY_INTERVAL_MS = 1_500

let lastNotifyAt = 0

/**
 * Register app-level IPC handlers.
 * Provides version info, rate-limited notifications, and update triggers.
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

  // --- Show native notification (type-checked, bounded, rate-limited) ---
  ipcMain.on('app:notify', (_event, title: unknown, body: unknown) => {
    if (typeof title !== 'string' || typeof body !== 'string') return
    const now = Date.now()
    if (now - lastNotifyAt < MIN_NOTIFY_INTERVAL_MS) return
    lastNotifyAt = now

    const safeTitle = title.trim().slice(0, MAX_NOTIFY_TITLE)
    const safeBody = body.trim().slice(0, MAX_NOTIFY_BODY)
    if (!safeTitle) return
    if (Notification.isSupported()) {
      new Notification({ title: safeTitle, body: safeBody }).show()
    }
  })

  // --- Trigger manual update check ---
  ipcMain.on('app:check-update', () => {
    app.emit('check-for-updates')
  })
}
