// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app } from 'electron'
import { join } from 'node:path'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

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

const DEFAULTS: AppPreferences = {
  recentFiles: [],
  windowBounds: null,
  minimizeToTray: true,
  lastSavePath: null,
}

/** Simple JSON-based preferences store — lazy-initialized after app ready */
class PreferencesStore {
  private data: AppPreferences | null = null
  private filePath: string | null = null

  private init(): void {
    if (this.filePath) return
    const userDataPath = app.getPath('userData')
    mkdirSync(userDataPath, { recursive: true })
    this.filePath = join(userDataPath, 'preferences.json')
    this.data = this.load()
  }

  private load(): AppPreferences {
    try {
      const raw = readFileSync(this.filePath!, 'utf-8')
      return { ...DEFAULTS, ...JSON.parse(raw) }
    } catch {
      return { ...DEFAULTS }
    }
  }

  private save(): void {
    try {
      writeFileSync(this.filePath!, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch { /* ignore write errors */ }
  }

  get<K extends keyof AppPreferences>(key: K): AppPreferences[K] {
    this.init()
    return this.data![key]
  }

  set<K extends keyof AppPreferences>(key: K, value: AppPreferences[K]): void {
    this.init()
    this.data![key] = value
    this.save()
  }
}

// --- Singleton store instance (lazy — safe to import before app.whenReady) ---
export const appStore = new PreferencesStore()

/**
 * Add a file to the recent files list.
 * Deduplicates by path, keeps max 10 entries, most recent first.
 */
export function addRecentFile(filePath: string, name: string): void {
  const recent = appStore.get('recentFiles')
  const filtered = recent.filter((entry: RecentFile) => entry.path !== filePath)
  filtered.unshift({ path: filePath, name, date: new Date().toISOString() })
  appStore.set('recentFiles', filtered.slice(0, 10))
}
