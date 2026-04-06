// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import Store from 'electron-store'

// --- Recent file entry ---
interface RecentFile {
  path: string
  name: string
  date: string
}

// --- Window bounds ---
interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

// --- App preferences schema ---
export interface AppPreferences {
  recentFiles: RecentFile[]
  windowBounds: WindowBounds | null
  minimizeToTray: boolean
  lastSavePath: string | null
}

// --- Electron store instance with defaults ---
export const appStore = new Store<AppPreferences>({
  name: 'preferences',
  defaults: {
    recentFiles: [],
    windowBounds: null,
    minimizeToTray: true,
    lastSavePath: null,
  },
})

/**
 * Add a file to the recent files list.
 * Deduplicates by path, keeps max 10 entries, most recent first.
 */
export function addRecentFile(filePath: string, name: string): void {
  const recent = appStore.get('recentFiles')

  // Remove existing entry with same path
  const filtered = recent.filter((entry) => entry.path !== filePath)

  // Prepend new entry
  filtered.unshift({
    path: filePath,
    name,
    date: new Date().toISOString(),
  })

  // Keep max 10
  appStore.set('recentFiles', filtered.slice(0, 10))
}
