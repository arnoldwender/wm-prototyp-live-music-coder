// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, BrowserWindow, dialog, session, shell } from 'electron'
import { join } from 'node:path'
import { readFile, stat } from 'node:fs/promises'
import log from 'electron-log'
import { appStore } from './store'
import { registerFileHandlers, MAX_PROJECT_BYTES } from './ipc/file'
import { registerAudioHandlers } from './ipc/audio'
import { registerWindowHandlers, closeAllPopouts } from './ipc/window'
import { registerAppHandlers } from './ipc/app'
import { registerGistHandlers } from './ipc/gist'
import { createMenu } from './menu'
import { createTray, destroyTray } from './tray'
import { initUpdater } from './updater'
import { createExternalUrlGate, describeExternalUrl, isOwnAppUrl } from './url-guard'

// --- Track whether the app is truly quitting vs minimize-to-tray ---
let isQuitting = false

const isDebug =
  process.argv.includes('--lmc-debug') || !!process.env['LMC_DEBUG']

// Route all electron-log output to main.log file (and stdout in debug)
log.transports.file.level = 'info'
log.transports.console.level = isDebug ? 'debug' : 'warn'

// Rate-limited external URL gate shared across all webContents
const allowExternalUrl = createExternalUrlGate(3, 5_000)
let externalConfirmOpen = false

function openExternalSafely(rawUrl: string, parentWindow?: BrowserWindow | null): void {
  const safeUrl = allowExternalUrl(rawUrl)
  if (!safeUrl) {
    log.warn(`[security] blocked or rate-limited external URL: ${String(rawUrl).slice(0, 120)}`)
    return
  }
  if (externalConfirmOpen) {
    log.warn(`[security] suppressed overlapping external URL dialog: ${safeUrl.slice(0, 120)}`)
    return
  }

  externalConfirmOpen = true
  const { hostLabel, displayUrl } = describeExternalUrl(safeUrl)
  const options: Electron.MessageBoxOptions = {
    type: 'question',
    buttons: ['Cancel', 'Open in Browser'],
    defaultId: 0,
    cancelId: 0,
    title: 'Open External Link',
    message: `Open ${hostLabel} in your default browser?`,
    detail: `${displayUrl}\n\nConfirm only if you clicked this link yourself.`,
  }

  const prompt =
    parentWindow && !parentWindow.isDestroyed()
      ? dialog.showMessageBox(parentWindow, options)
      : dialog.showMessageBox(options)

  void prompt
    .then(({ response }) => {
      if (response === 1) {
        void shell.openExternal(safeUrl)
      }
    })
    .catch((err: Error) => {
      log.error(`[security] external URL confirmation failed: ${err.message}`)
    })
    .finally(() => {
      externalConfirmOpen = false
    })
}

/**
 * Create the main application window.
 * Restores saved bounds, configures platform-specific chrome,
 * and loads the renderer from dev server or dist files.
 */
function createWindow(): BrowserWindow {
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
    show: false,
    backgroundColor: '#1c1a17',
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  const saveBounds = (): void => {
    if (!mainWindow.isMaximized() && !mainWindow.isFullScreen()) {
      appStore.set('windowBounds', mainWindow.getBounds())
    }
  }
  mainWindow.on('resize', saveBounds)
  mainWindow.on('move', saveBounds)

  // --- Minimize to tray (or hide on macOS Dock) instead of destroying window ---
  mainWindow.on('close', (event) => {
    if (!isQuitting && (process.platform === 'darwin' || appStore.get('minimizeToTray'))) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafely(url, mainWindow)
    return { action: 'deny' }
  })

  mainWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL) => {
      log.error(
        `[renderer] did-fail-load ${errorCode} ${errorDescription} url=${validatedURL}`,
      )
    },
  )
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log.error(`[renderer] render-process-gone reason=${details.reason}`)
  })
  mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    log.error(`[renderer] preload-error path=${preloadPath} error=${error.message}`)
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
    if (isDebug) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
      log.info('[main] debug mode enabled — DevTools opened')
    }
  }

  return mainWindow
}

/** Path captured before the window exists; delivered once the renderer is up. */
let pendingOpenPath: string | null = null

/** Pull the first .lmc argument out of an argv vector. */
function lmcPathFromArgv(argv: string[]): string | null {
  const hit = argv.find((a) => a.toLowerCase().endsWith('.lmc'))
  return hit ?? null
}

/** Hand a bounded .lmc project file to the renderer, or hold it until one exists. */
function deliverOpenPath(filePath: string, mainWindow: BrowserWindow | null): void {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) {
    pendingOpenPath = filePath
    return
  }
  stat(filePath)
    .then((info) => {
      if (!info.isFile() || info.size > MAX_PROJECT_BYTES) {
        throw new Error('Project file exceeds maximum allowed size (5 MB)')
      }
      return readFile(filePath, 'utf-8')
    })
    .then((json) => {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('file:opened', { json, path: filePath })
      }
    })
    .catch((err: Error) => log.error(`[open-file] ${filePath}: ${err.message}`))
}

app.on('open-file', (event, filePath) => {
  event.preventDefault()
  deliverOpenPath(filePath, BrowserWindow.getAllWindows()[0] ?? null)
})

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      if (!win.isVisible()) win.show()
      win.focus()
    }
    const filePath = lmcPathFromArgv(argv)
    if (filePath) deliverOpenPath(filePath, win ?? null)
  })
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.wendermedia.live-music-coder')

  // --- Content Security Policy header (HTTP dev server & subresources) ---
  // Synchronized with netlify.toml and index.html <meta>: no wildcard ws:/https: img-src.
  const devWsAllowance = app.isPackaged ? '' : ' ws://localhost:* ws://127.0.0.1:*'
  const desktopCsp =
    "default-src 'self' file:; " +
    `script-src 'self' file: 'unsafe-eval' blob: data:${app.isPackaged ? '' : " 'unsafe-inline'"}; ` +
    "style-src 'self' file: 'unsafe-inline'; " +
    "img-src 'self' file: data: blob:; " +
    "font-src 'self' file: data:; " +
    "media-src 'self' file: https://live-music-coder.pro blob: data:; " +
    "worker-src 'self' file: blob: data:; " +
    `connect-src 'self' file: https://live-music-coder.pro https://api.github.com https://raw.githubusercontent.com https://*.githubusercontent.com ws://localhost:8080 ws://127.0.0.1:8080${devWsAllowance}; ` +
    "frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [desktopCsp],
      },
    })
  })

  const devOrigin = process.env['ELECTRON_RENDERER_URL']
    ? new URL(process.env['ELECTRON_RENDERER_URL']).origin
    : null
  const rendererDir = join(__dirname, '../../dist')

  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-navigate', (event, url) => {
      if (isOwnAppUrl(url, rendererDir, devOrigin)) return
      event.preventDefault()
      log.warn(`[security] blocked navigation to ${url}`)
    })
    contents.setWindowOpenHandler(({ url }) => {
      openExternalSafely(url, BrowserWindow.fromWebContents(contents))
      return { action: 'deny' }
    })
  })

  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'midi' || permission === 'fullscreen')
  })
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => {
    return permission === 'midi' || permission === 'fullscreen'
  })

  const mainWindow = createWindow()

  mainWindow.webContents.once('did-finish-load', () => {
    const queued = pendingOpenPath ?? lmcPathFromArgv(process.argv)
    pendingOpenPath = null
    if (queued) deliverOpenPath(queued, mainWindow)
  })

  registerAppHandlers()
  registerFileHandlers(mainWindow)
  registerAudioHandlers(mainWindow)
  registerGistHandlers(mainWindow)
  registerWindowHandlers(mainWindow)

  createMenu(mainWindow)
  createTray(mainWindow)

  if (app.isPackaged) {
    initUpdater(mainWindow)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (!mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  isQuitting = true
  closeAllPopouts()
  destroyTray()
})
