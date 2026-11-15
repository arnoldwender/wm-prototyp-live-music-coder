// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron'

// --- Module-level tray reference for cleanup ---
let tray: Tray | null = null

// Monochrome 32x32 (@2x for 16x16pt) 5-bar waveform icon for menu bar / system tray
const TRAY_WAVEFORM_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAQklEQVR42mNgGAVDHLxGwqMOGP4OwGbZqAPo6qiR5QBKLBuUDiDZUaMOGHXAsHPAaEk4shwwfNsDo23CUQeMApoAABTmxknUfK/nAAAAAElFTkSuQmCC'

/**
 * Create the system tray icon with context menu.
 * Click toggles window visibility. Context menu provides quick actions.
 */
export function createTray(mainWindow: BrowserWindow): Tray {
  const rawIcon = nativeImage.createFromDataURL(TRAY_WAVEFORM_PNG_DATA_URL)
  const icon = rawIcon.resize({ width: 16, height: 16 })
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true)
  }

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
