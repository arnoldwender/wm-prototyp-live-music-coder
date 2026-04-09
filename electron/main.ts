// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, BrowserWindow, session, shell } from 'electron'
import { join } from 'node:path'
import { appStore } from './store'
import { registerFileHandlers } from './ipc/file'
import { registerAudioHandlers } from './ipc/audio'
import { registerWindowHandlers, closeAllPopouts } from './ipc/window'
import { registerAppHandlers } from './ipc/app'
import { createMenu } from './menu'
import { createTray, destroyTray } from './tray'
import { initUpdater } from './updater'

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
      preload: join(__dirname, '../preload/preload.cjs'),
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

  // --- External links: open in default browser instead of hijacking window ---
  // See .wm-electron-audit.md P3.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // --- Load renderer: dev server or production files ---
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // Open DevTools detached in development
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }

  return mainWindow
}

// --- App initialization ---
app.whenReady().then(() => {
  // Set app user model ID for Windows
  app.setAppUserModelId('com.wendermedia.live-music-coder')

  // --- Content Security Policy header ---
  // Strudel evaluates user patterns via new Function → needs 'unsafe-eval'.
  // 'unsafe-inline' for Tailwind runtime and inline styles in components.
  // connect-src covers GitHub API (Gist sharing) and localhost dev server.
  // See .wm-electron-audit.md C1.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file:; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob: https:; " +
            "font-src 'self' data:; " +
            "media-src 'self' blob: data:; " +
            "worker-src 'self' blob:; " +
            "connect-src 'self' https://api.github.com https://*.strudel.cc ws: wss:;",
        ],
      },
    })
  })

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
  if (app.isPackaged) {
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
