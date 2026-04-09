// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron'

// --- Module-level tray reference for cleanup ---
let tray: Tray | null = null

/**
 * Create the system tray icon with context menu.
 * Click toggles window visibility. Context menu provides quick actions.
 */
export function createTray(mainWindow: BrowserWindow): Tray {
  // Placeholder icon — will be replaced with real icon in Task 9
  const icon = nativeImage.createEmpty()

  tray = new Tray(icon)
  tray.setToolTip('Live Music Coder')

  // --- Build context menu ---
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Play / Stop',
      click: () => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('menu:action', 'toggle-play')
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  // --- Click toggles window visibility ---
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  return tray
}

/**
 * Destroy the tray icon. Called during app shutdown.
 */
export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
