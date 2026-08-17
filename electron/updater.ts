// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, dialog, shell, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

import { classifyUpdateError, isTerminal, shouldNotify, failureMessage } from './update-failure'

// --- Where a user is sent when the app cannot update itself ---
const RELEASES_URL =
  'https://github.com/arnoldwender/wm-prototyp-live-music-coder/releases/latest'

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

  /* The version we last told the user was ready. On macOS electron-updater
     emits update-downloaded BEFORE Squirrel.Mac has validated the bundle, so
     by the time a validation error arrives the user has already been promised
     an update — and clicking Restart did nothing. Remembering the version lets
     the error dialog name it instead of appearing out of nowhere. */
  let offeredVersion: string | null = null

  /* One interruption per session. A failing update check repeats every four
     hours, and a dialog on each one would be its own bug. */
  let failureReported = false

  // --- Update downloaded: prompt user to restart ---
  autoUpdater.on('update-downloaded', (info) => {
    log.info(`Update downloaded: ${info.version}`)
    offeredVersion = info.version
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

    const kind = classifyUpdateError(error?.message ?? String(error))

    /* A stranded signature can never install. Leaving this armed would retry
       the impossible install on every quit, forever, without ever saying so. */
    if (isTerminal(kind)) {
      autoUpdater.autoInstallOnAppQuit = false
      autoUpdater.autoDownload = false
    }

    /* An unrecognised error only interrupts once the app has already promised an
       update. Measured on a real 1.2.0 -> 1.3.0 run: Squirrel failed to stage
       with a message in the SYSTEM language, after the "restart now?" prompt had
       been shown. Keying the dialog on the category alone left that silent —
       which is the exact failure this handler exists to end. */
    if (!shouldNotify(kind, offeredVersion !== null)) return

    const message = failureMessage(kind, offeredVersion)
    if (!message || failureReported || mainWindow.isDestroyed()) return
    failureReported = true

    dialog
      .showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Update Failed',
        message,
        buttons: ['Open Downloads', 'Close'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) void shell.openExternal(RELEASES_URL)
      })
  })

  // --- Check on launch with delay ---
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Initial update check failed:', err)
    })
  }, INITIAL_DELAY_MS)

  // --- Periodic check every 4 hours.
  // Result is intentionally discarded — process lifetime keeps the
  // interval alive, so there is nothing to clear. The explicit
  // leading semicolon on the next statement is REQUIRED: without
  // it ASI parses `setInterval(...)\n(app).on(...)` as a single
  // expression calling the timer return value as a function, which
  // blows up at runtime as `setInterval(...) is not a function`. */
  setInterval(() => {
    void autoUpdater.checkForUpdates().catch((err: Error) => {
      log.error('Periodic update check failed:', err)
    })
  }, CHECK_INTERVAL_MS)

  // --- Manual check trigger from menu/IPC ---
  // Custom event name requires type assertion
  ;(app as NodeJS.EventEmitter).on('check-for-updates', () => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Manual update check failed:', err)
    })
  })
}
