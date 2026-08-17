// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, BrowserWindow, session, shell } from 'electron'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import log from 'electron-log'
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

/* --- Debug mode --------------------------------------------------------
   Users can relaunch the packaged app with `open -a "Live Music Coder"
   --args --lmc-debug` (or set LMC_DEBUG=1) to force DevTools open and
   verbose logging. This is the only way to capture renderer errors after
   a black-screen incident in production where DevTools is otherwise
   closed.

   NOTE on flag name: we deliberately namespace as `--lmc-debug` instead
   of `--debug` because Node.js intercepts the bare `--debug` flag (it
   is a deprecated alias for --inspect, DEP0062) and prints a warning to
   stdout before Electron's argv parser even runs, so the flag never
   reaches our code. */
const isDebug =
  process.argv.includes('--lmc-debug') || !!process.env['LMC_DEBUG']

// Route all electron-log output to main.log file (and stdout in debug)
log.transports.file.level = 'info'
log.transports.console.level = isDebug ? 'debug' : 'warn'

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

  /* --- Renderer crash & load failure diagnostics ----------------------
     Without these, a renderer that throws synchronously during module
     evaluation (e.g. a failed lazy chunk under file://) leaves the user
     staring at the BrowserWindow background color with no clue why.
     Logging to electron-log writes to:
       macOS:   ~/Library/Logs/Live Music Coder/main.log
       Windows: %USERPROFILE%\AppData\Roaming\Live Music Coder\logs\main.log
       Linux:   ~/.config/Live Music Coder/logs/main.log */
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

  // --- Load renderer: dev server or production files ---
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // Open DevTools detached in development
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
    // In packaged builds, --debug forces DevTools so users can capture
    // production-only errors (CSP violations, lazy-chunk failures, etc.)
    if (isDebug) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
      log.info('[main] debug mode enabled — DevTools opened')
    }
  }

  return mainWindow
}

/* ── .lmc file association ──────────────────────────────────────────
   package.json declares the association, so double-clicking a .lmc file
   launches the app — and until now nothing handled it, so the file was
   silently dropped and the user got an empty editor. Three OS paths:

     macOS   -> app.on('open-file'), which can fire BEFORE whenReady
     Windows -> the path arrives in process.argv of a NEW process
     Linux   -> same as Windows, plus second-instance when one is running

   requestSingleInstanceLock is what makes the Windows/Linux paths work at
   all: without it, opening a second file spawns a second copy of the app
   instead of handing the path to the running one. */

/** Path captured before the window exists; delivered once the renderer is up. */
let pendingOpenPath: string | null = null

/** Pull the first .lmc argument out of an argv vector. */
function lmcPathFromArgv(argv: string[]): string | null {
  const hit = argv.find((a) => a.toLowerCase().endsWith('.lmc'))
  return hit ?? null
}

/** Hand a project file to the renderer, or hold it until one exists. */
function deliverOpenPath(filePath: string, mainWindow: BrowserWindow | null): void {
  if (!mainWindow || mainWindow.webContents.isLoading()) {
    pendingOpenPath = filePath
    return
  }
  readFile(filePath, 'utf-8')
    .then((json) => mainWindow.webContents.send('file:opened', { json, path: filePath }))
    .catch((err) => log.error(`[open-file] ${filePath}: ${err.message}`))
}

/* macOS delivers this event, and may do so before whenReady resolves. */
app.on('open-file', (event, filePath) => {
  event.preventDefault()
  deliverOpenPath(filePath, BrowserWindow.getAllWindows()[0] ?? null)
})

/* Windows / Linux: a second launch hands its argv to the first instance. */
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
    const filePath = lmcPathFromArgv(argv)
    if (filePath) deliverOpenPath(filePath, win ?? null)
  })
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

  /* --- Navigation guard -------------------------------------------------
     SECURITY (2026-08-16). This app evaluates shared patterns through
     Function() by design, so renderer-executing code must be assumed hostile.
     Without this guard a hostile pattern could set `location.href` and
     navigate the PRELOAD-ATTACHED window to a remote origin — the preload
     re-runs on the new document, handing an attacker the full electronAPI
     surface as a persistent, interactive channel.

     Registered on `web-contents-created` rather than on mainWindow so it also
     covers pop-out windows, which are created with the same preload.

     Note the app uses HashRouter under Electron, so in-app route changes keep
     the same file path and only vary the fragment — those pass the check. */
  const devOrigin = process.env['ELECTRON_RENDERER_URL']
    ? new URL(process.env['ELECTRON_RENDERER_URL']).origin
    : null
  const rendererDir = join(__dirname, '../../dist')

  function isOwnAppUrl(rawUrl: string): boolean {
    let url: URL
    try { url = new URL(rawUrl) } catch { return false }
    if (url.protocol === 'file:') {
      return decodeURIComponent(url.pathname).startsWith(rendererDir)
    }
    return devOrigin !== null && url.origin === devOrigin
  }

  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-navigate', (event, url) => {
      if (isOwnAppUrl(url)) return
      event.preventDefault()
      log.warn(`[security] blocked navigation to ${url}`)
    })
    // Children (pop-outs) inherit the same deny-and-open-externally policy.
    contents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
        void shell.openExternal(url)
      }
      return { action: 'deny' }
    })
  })

  /* --- Permission guard --------------------------------------------------
     SECURITY (2026-08-16). Electron auto-approves every permission request
     unless a handler is installed. Combined with the signed app's microphone
     entitlement, that meant an evaluated pattern could call getUserMedia and
     trigger a TCC prompt attributed to a notarized music application — the
     most plausible prompt a user of this app will ever see.
     Nothing in src/ calls getUserMedia (0 hits); MIDI is the only capability
     the product actually needs, and it is requested with sysex:false. */
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'midi' || permission === 'fullscreen')
  })
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => {
    return permission === 'midi' || permission === 'fullscreen'
  })

  const mainWindow = createWindow()

  /* Flush whatever arrived before the window existed: an argv path from a cold
     launch, or a macOS open-file event that beat whenReady. */
  mainWindow.webContents.once('did-finish-load', () => {
    const queued = pendingOpenPath ?? lmcPathFromArgv(process.argv)
    pendingOpenPath = null
    if (queued) deliverOpenPath(queued, mainWindow)
  })

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
