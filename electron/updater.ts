// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, dialog, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// --- Check interval: every 4 hours ---
const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000

// --- Initial check delay: 5 seconds after launch ---
const INITIAL_DELAY_MS = 5000

/**
 * Initialize the auto-updater with electron-updater.
 * Checks on launch (after 5s delay) and every 4 hours.
 * Shows a dialog when an update is downloaded.
 */
export function initUpdater(mainWindow: BrowserWindow): void {
  // Configure logging
  autoUpdater.logger = log

  // Auto-download and install on quit
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  // --- Update available: notify renderer ---
  autoUpdater.on('update-available', (info) => {
    log.info(`Update available: ${info.version}`)
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app:update-available', info.version)
    }
  })

  // --- Update downloaded: prompt user to restart ---
  autoUpdater.on('update-downloaded', (info) => {
    log.info(`Update downloaded: ${info.version}`)
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded. Restart now to install?`,
        buttons: ['Restart', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })

  // --- Error handling ---
  autoUpdater.on('error', (error) => {
    log.error('Auto-updater error:', error)
  })

  // --- Check on launch with delay ---
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Initial update check failed:', err)
    })
  }, INITIAL_DELAY_MS)

  // --- Periodic check every 4 hours ---
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const _interval = setInterval(() => {
    void autoUpdater.checkForUpdates().catch((err: Error) => {
      log.error('Periodic update check failed:', err)
    })
  }, CHECK_INTERVAL_MS) as unknown

  // --- Manual check trigger from menu/IPC ---
  // Custom event name requires type assertion
  (app as NodeJS.EventEmitter).on('check-for-updates', () => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Manual update check failed:', err)
    })
  })
}
