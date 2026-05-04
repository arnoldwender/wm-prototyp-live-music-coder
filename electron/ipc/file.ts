// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, dialog, shell, BrowserWindow, app } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { appStore, addRecentFile } from '../store'

/**
 * Validate that a renderer-supplied path resolves within an allowed root.
 * Accepts paths inside Documents or the user home directory (broad but bounded).
 * Returns the resolved absolute path on success, or null if the path escapes.
 */
function resolveAllowedPath(filePath: string): string | null {
  const resolved = resolve(filePath)
  const docsDir = app.getPath('documents')
  const homeDir = app.getPath('home')
  if (resolved.startsWith(docsDir + '/') || resolved === docsDir ||
      resolved.startsWith(homeDir + '/') || resolved === homeDir) {
    return resolved
  }
  return null
}

/**
 * Register all file-related IPC handlers.
 * Handles save, open, recent files, and reveal-in-folder.
 */
export function registerFileHandlers(mainWindow: BrowserWindow): void {
  // --- Save project: show dialog, write JSON, track recent ---
  ipcMain.handle('file:save', async (_event, json: string) => {
    const lastPath = appStore.get('lastSavePath')
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Project',
      defaultPath: lastPath ?? 'untitled.lmc',
      filters: [{ name: 'Live Music Coder Project', extensions: ['lmc'] }],
    })

    if (result.canceled || !result.filePath) return null

    await writeFile(result.filePath, json, 'utf-8')
    appStore.set('lastSavePath', result.filePath)
    addRecentFile(result.filePath, basename(result.filePath))

    return { path: result.filePath }
  })

  // --- Save to known path without dialog ---
  ipcMain.handle('file:save-path', async (_event, json: string, filePath: string) => {
    // F-1 fix: validate the renderer-supplied path stays within allowed dirs
    const safe = resolveAllowedPath(filePath)
    if (!safe) return { error: 'Path outside allowed directories' }

    await writeFile(safe, json, 'utf-8')
    appStore.set('lastSavePath', safe)
    addRecentFile(safe, basename(safe))

    return { path: safe }
  })

  // --- Open project: show dialog, read file, track recent ---
  ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Project',
      filters: [{ name: 'Live Music Coder Project', extensions: ['lmc'] }],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    const json = await readFile(filePath, 'utf-8')
    addRecentFile(filePath, basename(filePath))

    return { json, path: filePath }
  })

  // --- Get recent files list ---
  ipcMain.handle('file:recent', () => {
    return appStore.get('recentFiles')
  })

  // --- Reveal file in system file manager ---
  ipcMain.on('file:reveal', (_event, filePath: string) => {
    // F-1 fix: same path validation as file:save-path to prevent arbitrary reveal
    const safe = resolveAllowedPath(filePath)
    if (!safe) return
    shell.showItemInFolder(safe)
  })
}
