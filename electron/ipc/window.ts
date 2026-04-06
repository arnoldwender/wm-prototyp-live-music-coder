// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, BrowserWindow, app } from 'electron'
import { join } from 'node:path'

/** Lazy dev check — safe to call after app init */
function isDev(): boolean { return !app.isPackaged }

// --- Track pop-out windows, max 4 ---
const popoutWindows = new Map<string, BrowserWindow>()

// --- Maximum concurrent pop-out windows ---
const MAX_POPOUTS = 4

/**
 * Register window management IPC handlers.
 * Handles pop-out panels and fullscreen toggling.
 */
export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  // --- Pop out a panel into its own window ---
  ipcMain.on('window:popout', (_event, panelId: string) => {
    // Already open — focus it instead
    if (popoutWindows.has(panelId)) {
      popoutWindows.get(panelId)!.focus()
      return
    }

    // Enforce max pop-out limit
    if (popoutWindows.size >= MAX_POPOUTS) return

    const child = new BrowserWindow({
      width: 600,
      height: 500,
      parent: mainWindow,
      title: `Live Music Coder — ${panelId}`,
      backgroundColor: '#09090b',
      webPreferences: {
        preload: join(__dirname, '../preload/preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    })

    // Load the app at the pop-out route
    if (isDev() && process.env['ELECTRON_RENDERER_URL']) {
      child.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/popout/${panelId}`)
    } else {
      child.loadFile(join(__dirname, '../../dist/index.html'), {
        hash: '/popout/' + panelId,
      })
    }

    popoutWindows.set(panelId, child)

    // Notify parent when pop-out closes
    child.on('closed', () => {
      popoutWindows.delete(panelId)
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('window:popout-closed', panelId)
      }
    })
  })

  // --- Toggle fullscreen ---
  ipcMain.on('window:fullscreen', (_event, enabled: boolean) => {
    mainWindow.setFullScreen(enabled)
  })

  // --- Forward fullscreen state changes to renderer ---
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen-changed', true)
  })

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen-changed', false)
  })
}

/**
 * Close all pop-out windows. Called during app shutdown.
 */
export function closeAllPopouts(): void {
  for (const [, win] of popoutWindows) {
    if (!win.isDestroyed()) {
      win.close()
    }
  }
  popoutWindows.clear()
}
