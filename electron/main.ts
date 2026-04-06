// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { appStore } from './store.js'
import { registerFileHandlers } from './ipc/file.js'
import { registerAudioHandlers } from './ipc/audio.js'
import { registerWindowHandlers, closeAllPopouts } from './ipc/window.js'
import { registerAppHandlers } from './ipc/app.js'
import { createMenu } from './menu.js'
import { createTray, destroyTray } from './tray.js'
import { initUpdater } from './updater.js'

// --- Track whether the app is truly quitting vs minimize-to-tray ---
let isQuitting = false

/**
 * Create the main application window.
 * Restores saved bounds, configures platform-specific chrome,
 * and loads the renderer from dev server or dist files.
 */
function createWindow(): BrowserWindow {
  // Restore saved window bounds or use defaults
  const savedBounds = appStore.get('windowBounds')
  const defaultWidth = 1280
  const defaultHeight = 800

  const mainWindow = new BrowserWindow({
    width: savedBounds?.width ?? defaultWidth,
    height: savedBounds?.height ?? defaultHeight,
    x: savedBounds?.x ?? undefined,
    y: savedBounds?.y ?? undefined,
    minWidth: 900,
    minHeight: 600,
    show: false, // Show on ready-to-show to avoid flash
    backgroundColor: '#09090b',
    // macOS hidden title bar with traffic lights
    ...(process.platform === 'darwin'
      ? {
          titleBarStyle: 'hiddenInset' as const,
          trafficLightPosition: { x: 12, y: 12 },
        }
      : {}),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // --- Show window when ready ---
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // --- Save window bounds on resize/move (skip when maximized/fullscreen) ---
  const saveBounds = (): void => {
    if (!mainWindow.isMaximized() && !mainWindow.isFullScreen()) {
      appStore.set('windowBounds', mainWindow.getBounds())
    }
  }
  mainWindow.on('resize', saveBounds)
  mainWindow.on('move', saveBounds)

  // --- Minimize to tray instead of closing (when enabled) ---
  mainWindow.on('close', (event) => {
    if (!isQuitting && appStore.get('minimizeToTray')) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // --- Load renderer: dev server or production files ---
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // Open DevTools detached in development
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  return mainWindow
}

// --- App initialization ---
app.whenReady().then(() => {
  // Set app user model ID for Windows
  electronApp.setAppUserModelId('com.wendermedia.live-music-coder')

  // Watch for window shortcut optimization (DevTools, reload)
  optimizer.watchWindowShortcuts(undefined as unknown as BrowserWindow)

  const mainWindow = createWindow()

  // Register all IPC handlers
  registerAppHandlers()
  registerFileHandlers(mainWindow)
  registerAudioHandlers(mainWindow)
  registerWindowHandlers(mainWindow)

  // Build application menu
  createMenu(mainWindow)

  // Create system tray
  createTray(mainWindow)

  // Init auto-updater in production only
  if (!is.dev) {
    initUpdater(mainWindow)
  }

  // --- macOS: recreate window when dock icon clicked ---
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })
})

// --- Quit when all windows are closed (except macOS) ---
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// --- Cleanup before quit ---
app.on('before-quit', () => {
  isQuitting = true
  closeAllPopouts()
  destroyTray()
})
