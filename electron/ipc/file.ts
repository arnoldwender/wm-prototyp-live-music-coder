// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { appStore, addRecentFile } from '../store'

/**
 * Gate a renderer-supplied path for `file:reveal`.
 *
 * The renderer is NOT a trust boundary here: this app evaluates shared,
 * user-supplied patterns through `Function()` by design, so any code running in
 * the renderer must be treated as hostile. A directory-prefix allowlist is the
 * wrong shape for that threat model — the previous `$HOME`-wide check accepted
 * `~/.zshrc`, `~/.ssh/authorized_keys` and `~/Library/LaunchAgents/*.plist`.
 *
 * Instead we validate against USER INTENT: a path may only be revealed if the
 * user themselves put it there via the native save/open dialog, i.e. it is
 * already recorded in the recent-files list. Exact string identity against
 * paths we recorded ourselves needs no separator or traversal handling, which
 * also removes the `'/'`-hardcoding that silently disabled the old guard on
 * Windows.
 */
function isUserChosenPath(filePath: string): string | null {
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

  // NOTE: the `file:save-path` handler (dialog-free write to a renderer-supplied
  // path) was REMOVED 2026-08-16. It was an unauthenticated arbitrary-file-write
  // primitive: any evaluated pattern could reach `saveProjectToPath()` and write
  // attacker-controlled bytes to `~/.zshrc`, `~/.ssh/authorized_keys` or
  // `~/Library/LaunchAgents/*.plist`, i.e. code execution from a shared link.
  // It had zero renderer callers — every save goes through the native dialog in
  // `file:save` above, which is user-chosen and therefore safe by construction.
  // Do not reintroduce a dialog-free write path.

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
    // Only reveal a file the user themselves chose through a native dialog.
    // See isUserChosenPath: a directory allowlist is the wrong shape when the
    // renderer runs strangers' code by design.
    const safe = isUserChosenPath(filePath)
    if (!safe) return
    shell.showItemInFolder(safe)
  })
}
