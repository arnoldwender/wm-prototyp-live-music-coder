// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { appStore, addRecentFile } from '../store'

/** Hard upper bound (5 MiB) on .lmc project JSON read/written through IPC. */
export const MAX_PROJECT_BYTES = 5 * 1024 * 1024

/**
 * Gate a renderer-supplied path for `file:reveal`.
 *
 * The renderer is NOT a trust boundary here: this app evaluates shared,
 * user-supplied patterns through `Function()` by design, so any code running in
 * the renderer must be treated as hostile. A path may only be revealed if the
 * user themselves put it there via the native save/open dialog.
 */
function isUserChosenPath(filePath: unknown): string | null {
  if (typeof filePath !== 'string' || filePath.length === 0) return null
  const resolved = resolve(filePath)
  const known = new Set<string>()
  for (const entry of appStore.get('recentFiles') ?? []) {
    if (entry?.path) known.add(resolve(entry.path))
  }
  const last = appStore.get('lastSavePath')
  if (last) known.add(resolve(last))
  return known.has(resolved) ? resolved : null
}

/**
 * Register all file-related IPC handlers.
 * Handles save, open, recent files, and reveal-in-folder.
 */
export function registerFileHandlers(mainWindow: BrowserWindow): void {
  // --- Save project: show dialog, write JSON, track recent ---
  ipcMain.handle('file:save', async (_event, json: unknown) => {
    if (typeof json !== 'string' || Buffer.byteLength(json, 'utf-8') > MAX_PROJECT_BYTES) {
      throw new Error('Invalid or oversized project payload')
    }

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

  // --- Open project: show dialog, verify size, read file, track recent ---
  ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Project',
      filters: [{ name: 'Live Music Coder Project', extensions: ['lmc'] }],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    const info = await stat(filePath)
    if (!info.isFile() || info.size > MAX_PROJECT_BYTES) {
      throw new Error('Project file exceeds maximum allowed size (5 MB)')
    }

    const json = await readFile(filePath, 'utf-8')
    addRecentFile(filePath, basename(filePath))

    return { json, path: filePath }
  })

  // --- Get recent files list ---
  ipcMain.handle('file:recent', () => {
    return appStore.get('recentFiles')
  })

  // --- Reveal file in system file manager ---
  ipcMain.on('file:reveal', (_event, filePath: unknown) => {
    const safe = isUserChosenPath(filePath)
    if (!safe) return
    shell.showItemInFolder(safe)
  })
}
