// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import {
  app,
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions,
  shell,
} from 'electron'

// --- GitHub issues URL for bug reports ---
const ISSUES_URL = 'https://github.com/arnoldwender/wm-prototyp-live-music-coder/issues'

/**
 * Helper: send a menu action to the renderer process.
 */
function sendAction(mainWindow: BrowserWindow, action: string): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send('menu:action', action)
  }
}

/**
 * Build and set the application menu.
 * All custom actions are forwarded to the renderer via 'menu:action' IPC.
 */
export function createMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin'

  const template: MenuItemConstructorOptions[] = [
    // --- macOS app menu ---
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const, label: 'About Live Music Coder' },
              {
                label: 'Check for Updates...',
                click: () => sendAction(mainWindow, 'check-updates'),
              },
              { type: 'separator' as const },
              {
                label: 'Settings',
                accelerator: 'Cmd+,',
                click: () => sendAction(mainWindow, 'open-settings'),
              },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          } as MenuItemConstructorOptions,
        ]
      : []),

    // --- File menu ---
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendAction(mainWindow, 'new-project'),
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendAction(mainWindow, 'open-project'),
        },
        {
          label: 'Open Recent',
          role: 'recentDocuments' as MenuItemConstructorOptions['role'],
          submenu: [
            {
              label: 'Clear Recent',
              role: 'clearRecentDocuments' as MenuItemConstructorOptions['role'],
            },
          ],
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendAction(mainWindow, 'save-project'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendAction(mainWindow, 'save-project-as'),
        },
        { type: 'separator' },
        {
          label: 'Export Audio...',
          accelerator: 'CmdOrCtrl+E',
          click: () => sendAction(mainWindow, 'export-audio'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    // --- Edit menu (standard roles) ---
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },

    // --- View menu ---
    {
      label: 'View',
      submenu: [
        {
          label: 'Fullscreen',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen())
          },
        },
        {
          label: 'Zen Mode',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => sendAction(mainWindow, 'toggle-zen'),
        },
        { type: 'separator' },
        {
          label: 'Toggle Graph',
          accelerator: 'CmdOrCtrl+G',
          click: () => sendAction(mainWindow, 'toggle-graph'),
        },
        {
          label: 'Toggle Visualizers',
          accelerator: 'CmdOrCtrl+Shift+V',
          click: () => sendAction(mainWindow, 'toggle-visualizers'),
        },
        {
          label: 'Pop Out',
          submenu: [
            {
              label: 'Code Editor',
              click: () => sendAction(mainWindow, 'popout-editor'),
            },
            {
              label: 'Node Graph',
              click: () => sendAction(mainWindow, 'popout-graph'),
            },
            {
              label: 'Visualizers',
              click: () => sendAction(mainWindow, 'popout-visualizers'),
            },
            {
              label: 'Timeline',
              click: () => sendAction(mainWindow, 'popout-timeline'),
            },
          ],
        },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
      ],
    },

    // --- Help menu ---
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          accelerator: 'F1',
          click: () => sendAction(mainWindow, 'open-docs'),
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => sendAction(mainWindow, 'open-shortcuts'),
        },
        { type: 'separator' },
        {
          label: 'Report Issue...',
          click: () => {
            void shell.openExternal(ISSUES_URL)
          },
        },
        { type: 'separator' },
        {
          label: 'About Live Music Coder',
          click: () => sendAction(mainWindow, 'open-about'),
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
