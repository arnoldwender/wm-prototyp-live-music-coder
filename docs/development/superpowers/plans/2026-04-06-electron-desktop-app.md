# Electron Desktop App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the existing React SPA into an Electron desktop app with native file system, audio export, system tray, pop-out panels, and auto-updates — supporting macOS (.dmg), Windows (.nsis), and Linux (.AppImage).

**Architecture:** Main process handles native OS integration (file dialogs, tray, menu, windows). Preload bridge exposes a typed `electronAPI` to the renderer via `contextBridge`. Renderer (existing React app) detects `window.electronAPI` and conditionally enables native features. Context isolation ON, node integration OFF — user-evaluated code stays sandboxed.

**Tech Stack:** Electron 41, electron-builder, electron-updater, electron-store, @electron-toolkit/utils, @electron-toolkit/preload, concurrently, wait-on.

---

## File Map

### New Files — Electron Main Process

| File | Responsibility |
|------|---------------|
| `electron/main.ts` | App lifecycle, window creation, IPC registration |
| `electron/preload.ts` | contextBridge: expose electronAPI |
| `electron/ipc/file.ts` | File save/open/recent handlers |
| `electron/ipc/audio.ts` | WAV export handler |
| `electron/ipc/window.ts` | Pop-out panel and fullscreen handlers |
| `electron/ipc/app.ts` | App info, notifications, quit |
| `electron/menu.ts` | Native menu bar (File, Edit, View, Help) |
| `electron/tray.ts` | System tray icon + context menu |
| `electron/updater.ts` | GitHub Releases auto-updater |
| `electron/store.ts` | electron-store for preferences (recent files, window bounds) |
| `electron/wav-encoder.ts` | PCM WAV file writer |
| `tsconfig.electron.json` | TypeScript config for electron/ directory |

### New Files — Renderer Integration

| File | Responsibility |
|------|---------------|
| `src/lib/electron.ts` | isElectron detection + typed API wrapper |
| `src/types/electron.d.ts` | Type declarations for window.electronAPI |

### Modified Files

| File | Changes |
|------|---------|
| `package.json` | Add electron deps, scripts, build config, main field |
| `vite.config.ts` | Add base: './' for Electron file:// protocol |
| `tsconfig.json` | Add reference to tsconfig.electron.json |
| `src/components/organisms/TransportBar.tsx` | Add Save/Export buttons when isElectron |
| `.gitignore` | Add dist-electron/, release/, *.dmg, *.exe, *.AppImage |

### Build Assets

| File | Responsibility |
|------|---------------|
| `build/icon.icns` | macOS app icon (generated from favicon.svg) |
| `build/icon.ico` | Windows app icon (generated from favicon.svg) |
| `build/icon.png` | Linux app icon (1024x1024, generated from favicon.svg) |

---

## Task 1: Install Dependencies and Configure Build

**Files:**
- Modify: `package.json`
- Create: `tsconfig.electron.json`
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Install Electron and build tooling**

```bash
npm install --save-dev electron@^41.0.0 electron-builder@^26.0.0 @electron-toolkit/utils@^4.0.0 @electron-toolkit/preload@^3.0.0 concurrently@^9.0.0 wait-on@^9.0.0
npm install electron-store@^10.0.0 electron-updater@^6.0.0
```

- [ ] **Step 2: Add main field and electron scripts to package.json**

Add to the top level of `package.json`:

```json
"main": "dist-electron/main.js",
```

Add to the `"scripts"` section:

```json
"electron:dev": "concurrently -k \"vite\" \"wait-on tcp:5173 && tsc -p tsconfig.electron.json && electron .\"",
"electron:build": "npm run build && tsc -p tsconfig.electron.json && electron-builder",
"electron:build:mac": "npm run build && tsc -p tsconfig.electron.json && electron-builder --mac",
"electron:build:win": "npm run build && tsc -p tsconfig.electron.json && electron-builder --win",
"electron:build:linux": "npm run build && tsc -p tsconfig.electron.json && electron-builder --linux"
```

Add the `"build"` key for electron-builder at the top level of `package.json`:

```json
"build": {
  "appId": "com.wendermedia.live-music-coder",
  "productName": "Live Music Coder",
  "copyright": "Copyright (c) 2026 Arnold Wender / Wender Media",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*"
  ],
  "mac": {
    "target": [{ "target": "dmg", "arch": ["universal"] }],
    "category": "public.app-category.music",
    "icon": "build/icon.icns",
    "darkModeSupport": true,
    "hardenedRuntime": true,
    "gatekeeperAssess": false
  },
  "win": {
    "target": [{ "target": "nsis" }, { "target": "portable" }],
    "icon": "build/icon.ico"
  },
  "linux": {
    "target": [{ "target": "AppImage" }, { "target": "deb" }],
    "icon": "build/icon.png",
    "category": "Audio"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  },
  "fileAssociations": [{
    "ext": "lmc",
    "name": "Live Music Coder Project",
    "description": "Live Music Coder Project File",
    "mimeType": "application/x-live-music-coder"
  }],
  "publish": {
    "provider": "github",
    "owner": "arnoldwender",
    "repo": "wm-prototyp-live-music-coder"
  }
}
```

- [ ] **Step 3: Create tsconfig.electron.json**

Create `tsconfig.electron.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist-electron",
    "rootDir": "electron",
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": false,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["electron/**/*.ts"]
}
```

- [ ] **Step 4: Add electron reference to tsconfig.json**

Modify `tsconfig.json` — add the electron reference:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.electron.json" }
  ]
}
```

- [ ] **Step 5: Ensure vite base is relative for Electron file:// loading**

Read `vite.config.ts`. If there is no `base` property in the `defineConfig`, add it. If there is already `base: './'`, no change needed. The config should include:

```typescript
export default defineConfig({
  base: './',
  // ... rest of existing config
})
```

- [ ] **Step 6: Update .gitignore**

Append to `.gitignore`:

```
# Electron
dist-electron/
release/
*.dmg
*.exe
*.AppImage
*.deb
*.snap
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.electron.json vite.config.ts .gitignore
git commit -m "[Setup] Add Electron dependencies and build configuration"
```

---

## Task 2: Electron Type Declarations and Detection

**Files:**
- Create: `src/types/electron.d.ts`
- Create: `src/lib/electron.ts`

- [ ] **Step 1: Create type declarations for the electronAPI**

Create `src/types/electron.d.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

/** IPC API exposed by Electron preload via contextBridge */
export interface ElectronAPI {
  /* App */
  getAppInfo: () => Promise<{
    version: string
    platform: NodeJS.Platform
    arch: string
    isElectron: true
  }>
  notify: (title: string, body: string) => void
  quit: () => void
  checkForUpdates: () => void

  /* File system */
  saveProject: (json: string) => Promise<{ path: string } | null>
  saveProjectToPath: (json: string, filePath: string) => Promise<{ path: string }>
  openProject: () => Promise<{ json: string; path: string } | null>
  getRecentFiles: () => Promise<{ path: string; name: string; date: string }[]>
  revealInFinder: (filePath: string) => void

  /* Audio export */
  exportWav: (buffer: ArrayBuffer, sampleRate: number, channels: number) => Promise<{ path: string } | null>

  /* Window management */
  popOutPanel: (panelId: string) => void
  setFullscreen: (enabled: boolean) => void
  onFullscreenChanged: (callback: (enabled: boolean) => void) => () => void
  onPopoutClosed: (callback: (panelId: string) => void) => () => void

  /* Menu events */
  onMenuAction: (callback: (action: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
```

- [ ] **Step 2: Create the electron detection + wrapper module**

Create `src/lib/electron.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

/** Whether the app is running inside Electron */
export const isElectron = typeof window !== 'undefined' && !!window.electronAPI

/** Typed access to the Electron API — null when running in browser */
export const electronAPI = isElectron ? window.electronAPI! : null
```

- [ ] **Step 3: Commit**

```bash
git add src/types/electron.d.ts src/lib/electron.ts
git commit -m "[Electron] Add type declarations and detection module"
```

---

## Task 3: Preload Script

**Files:**
- Create: `electron/preload.ts`

- [ ] **Step 1: Create the preload bridge**

Create `electron/preload.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  /* App */
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  notify: (title: string, body: string) => ipcRenderer.send('app:notify', title, body),
  quit: () => ipcRenderer.send('app:quit'),
  checkForUpdates: () => ipcRenderer.send('app:check-update'),

  /* File system */
  saveProject: (json: string) => ipcRenderer.invoke('file:save', json),
  saveProjectToPath: (json: string, filePath: string) => ipcRenderer.invoke('file:save-path', json, filePath),
  openProject: () => ipcRenderer.invoke('file:open'),
  getRecentFiles: () => ipcRenderer.invoke('file:recent'),
  revealInFinder: (filePath: string) => ipcRenderer.send('file:reveal', filePath),

  /* Audio export */
  exportWav: (buffer: ArrayBuffer, sampleRate: number, channels: number) =>
    ipcRenderer.invoke('audio:export-wav', buffer, sampleRate, channels),

  /* Window management */
  popOutPanel: (panelId: string) => ipcRenderer.send('window:popout', panelId),
  setFullscreen: (enabled: boolean) => ipcRenderer.send('window:fullscreen', enabled),

  onFullscreenChanged: (callback: (enabled: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, enabled: boolean) => callback(enabled)
    ipcRenderer.on('window:fullscreen-changed', handler)
    return () => { ipcRenderer.removeListener('window:fullscreen-changed', handler) }
  },

  onPopoutClosed: (callback: (panelId: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, panelId: string) => callback(panelId)
    ipcRenderer.on('window:popout-closed', handler)
    return () => { ipcRenderer.removeListener('window:popout-closed', handler) }
  },

  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string) => callback(action)
    ipcRenderer.on('menu:action', handler)
    return () => { ipcRenderer.removeListener('menu:action', handler) }
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add electron/preload.ts
git commit -m "[Electron] Add preload script with contextBridge API"
```

---

## Task 4: IPC Handlers

**Files:**
- Create: `electron/ipc/file.ts`
- Create: `electron/ipc/audio.ts`
- Create: `electron/ipc/window.ts`
- Create: `electron/ipc/app.ts`
- Create: `electron/wav-encoder.ts`
- Create: `electron/store.ts`

- [ ] **Step 1: Create the electron-store preferences module**

Create `electron/store.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import Store from 'electron-store'

interface RecentFile {
  path: string
  name: string
  date: string
}

interface AppPreferences {
  recentFiles: RecentFile[]
  windowBounds: { x: number; y: number; width: number; height: number } | null
  minimizeToTray: boolean
  lastSavePath: string | null
}

export const appStore = new Store<AppPreferences>({
  defaults: {
    recentFiles: [],
    windowBounds: null,
    minimizeToTray: true,
    lastSavePath: null,
  },
})

/** Add a file to the recent list (max 10, deduped by path) */
export function addRecentFile(path: string, name: string): void {
  const entry: RecentFile = { path, name, date: new Date().toISOString() }
  const current = appStore.get('recentFiles')
  const filtered = current.filter((f) => f.path !== path)
  appStore.set('recentFiles', [entry, ...filtered].slice(0, 10))
}
```

- [ ] **Step 2: Create the WAV encoder**

Create `electron/wav-encoder.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

/** Encode raw PCM float32 samples into a WAV file buffer */
export function encodeWav(
  samples: ArrayBuffer,
  sampleRate: number,
  channels: number,
): Buffer {
  const float32 = new Float32Array(samples)
  const numSamples = float32.length
  const bytesPerSample = 2 /* 16-bit PCM */
  const dataSize = numSamples * bytesPerSample
  const headerSize = 44
  const buffer = Buffer.alloc(headerSize + dataSize)

  /* RIFF header */
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)

  /* fmt chunk */
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) /* chunk size */
  buffer.writeUInt16LE(1, 20) /* PCM format */
  buffer.writeUInt16LE(channels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28) /* byte rate */
  buffer.writeUInt16LE(channels * bytesPerSample, 32) /* block align */
  buffer.writeUInt16LE(16, 34) /* bits per sample */

  /* data chunk */
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  /* Convert float32 [-1, 1] to int16 [-32768, 32767] */
  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]))
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF
    buffer.writeInt16LE(Math.round(int16), offset)
    offset += 2
  }

  return buffer
}
```

- [ ] **Step 3: Create file IPC handlers**

Create `electron/ipc/file.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, dialog, shell, type BrowserWindow } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { appStore, addRecentFile } from '../store'

export function registerFileHandlers(mainWindow: BrowserWindow): void {
  /** Save project — show Save dialog, write .lmc file */
  ipcMain.handle('file:save', async (_event, json: string) => {
    const lastPath = appStore.get('lastSavePath')
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Project',
      defaultPath: lastPath ?? 'project.lmc',
      filters: [{ name: 'Live Music Coder Project', extensions: ['lmc'] }],
    })
    if (result.canceled || !result.filePath) return null

    await writeFile(result.filePath, json, 'utf-8')
    appStore.set('lastSavePath', result.filePath)
    addRecentFile(result.filePath, basename(result.filePath, '.lmc'))
    return { path: result.filePath }
  })

  /** Save to known path — no dialog */
  ipcMain.handle('file:save-path', async (_event, json: string, filePath: string) => {
    await writeFile(filePath, json, 'utf-8')
    addRecentFile(filePath, basename(filePath, '.lmc'))
    return { path: filePath }
  })

  /** Open project — show Open dialog, read .lmc file */
  ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Project',
      filters: [{ name: 'Live Music Coder Project', extensions: ['lmc'] }],
      properties: ['openFile'],
    })
    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    const json = await readFile(filePath, 'utf-8')
    addRecentFile(filePath, basename(filePath, '.lmc'))
    appStore.set('lastSavePath', filePath)
    return { json, path: filePath }
  })

  /** Get recent files list */
  ipcMain.handle('file:recent', () => appStore.get('recentFiles'))

  /** Reveal file in Finder / Explorer */
  ipcMain.on('file:reveal', (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })
}
```

- [ ] **Step 4: Create audio export IPC handler**

Create `electron/ipc/audio.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, dialog, type BrowserWindow } from 'electron'
import { writeFile } from 'node:fs/promises'
import { encodeWav } from '../wav-encoder'

export function registerAudioHandlers(mainWindow: BrowserWindow): void {
  /** Export audio buffer as WAV file */
  ipcMain.handle(
    'audio:export-wav',
    async (_event, buffer: ArrayBuffer, sampleRate: number, channels: number) => {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Audio',
        defaultPath: 'recording.wav',
        filters: [{ name: 'WAV Audio', extensions: ['wav'] }],
      })
      if (result.canceled || !result.filePath) return null

      const wav = encodeWav(buffer, sampleRate, channels)
      await writeFile(result.filePath, wav)

      /* Notify renderer that export is complete */
      mainWindow.webContents.send('app:notify-renderer', 'Export Complete', `Saved to ${result.filePath}`)
      return { path: result.filePath }
    },
  )
}
```

- [ ] **Step 5: Create window management IPC handlers**

Create `electron/ipc/window.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'

/** Track pop-out windows by panel ID */
const popoutWindows = new Map<string, BrowserWindow>()

/** Maximum simultaneous pop-out windows */
const MAX_POPOUTS = 4

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  /** Pop out a panel into its own window */
  ipcMain.on('window:popout', (_event, panelId: string) => {
    /* Limit simultaneous pop-outs */
    if (popoutWindows.size >= MAX_POPOUTS) return

    /* Don't duplicate the same panel */
    if (popoutWindows.has(panelId)) {
      popoutWindows.get(panelId)!.focus()
      return
    }

    const child = new BrowserWindow({
      width: 600,
      height: 400,
      parent: mainWindow,
      title: `Live Music Coder — ${panelId}`,
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    })

    /* Load the same app but with a hash route for the panel */
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      child.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/popout/${panelId}`)
    } else {
      child.loadFile(join(__dirname, '../dist/index.html'), { hash: `/popout/${panelId}` })
    }

    popoutWindows.set(panelId, child)

    child.on('closed', () => {
      popoutWindows.delete(panelId)
      mainWindow.webContents.send('window:popout-closed', panelId)
    })
  })

  /** Toggle fullscreen */
  ipcMain.on('window:fullscreen', (_event, enabled: boolean) => {
    mainWindow.setFullScreen(enabled)
  })

  /** Notify renderer when fullscreen changes (e.g., via OS controls) */
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen-changed', true)
  })
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen-changed', false)
  })
}

/** Close all pop-out windows (called on app quit) */
export function closeAllPopouts(): void {
  for (const win of popoutWindows.values()) {
    if (!win.isDestroyed()) win.close()
  }
  popoutWindows.clear()
}
```

- [ ] **Step 6: Create app IPC handlers**

Create `electron/ipc/app.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, app, Notification } from 'electron'

export function registerAppHandlers(): void {
  /** Return app info to renderer */
  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    isElectron: true as const,
  }))

  /** Show system notification */
  ipcMain.on('app:notify', (_event, title: string, body: string) => {
    new Notification({ title, body }).show()
  })

  /** Quit the app */
  ipcMain.on('app:quit', () => {
    app.quit()
  })

  /** Check for updates (delegated to updater module) */
  ipcMain.on('app:check-update', () => {
    /* Handled by updater.ts — emit event for it to pick up */
    app.emit('check-for-updates')
  })
}
```

- [ ] **Step 7: Commit**

```bash
git add electron/store.ts electron/wav-encoder.ts electron/ipc/
git commit -m "[Electron] Add IPC handlers for file, audio, window, and app"
```

---

## Task 5: Menu Bar

**Files:**
- Create: `electron/menu.ts`

- [ ] **Step 1: Create the native menu bar**

Create `electron/menu.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { Menu, app, type BrowserWindow } from 'electron'

/** Build and set the native application menu */
export function createMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin'

  /** Send a menu action to the renderer */
  const send = (action: string) => {
    mainWindow.webContents.send('menu:action', action)
  }

  const template: Electron.MenuItemConstructorOptions[] = [
    /* macOS app menu */
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' as const },
            { label: 'Check for Updates...', click: () => app.emit('check-for-updates') },
            { type: 'separator' as const },
            { label: 'Settings', accelerator: 'Cmd+,', click: () => send('settings') },
            { type: 'separator' as const },
            { role: 'hide' as const },
            { role: 'hideOthers' as const },
            { role: 'unhide' as const },
            { type: 'separator' as const },
            { role: 'quit' as const },
          ],
        }]
      : []),

    /* File menu */
    {
      label: 'File',
      submenu: [
        { label: 'New Project', accelerator: 'CmdOrCtrl+N', click: () => send('new-project') },
        { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: () => send('open-project') },
        {
          label: 'Open Recent',
          role: 'recentDocuments' as const,
          submenu: [{ label: 'Clear Recent', role: 'clearRecentDocuments' as const }],
        },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('save-project') },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('save-project-as') },
        { type: 'separator' },
        { label: 'Export Audio...', accelerator: 'CmdOrCtrl+E', click: () => send('export-audio') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    /* Edit menu */
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', click: () => send('undo') },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', click: () => send('redo') },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },

    /* View menu */
    {
      label: 'View',
      submenu: [
        { label: 'Fullscreen', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { label: 'Zen Mode', accelerator: 'CmdOrCtrl+Shift+F', click: () => send('zen-mode') },
        { type: 'separator' },
        { label: 'Toggle Graph', accelerator: 'CmdOrCtrl+G', click: () => send('toggle-graph') },
        { label: 'Toggle Visualizers', accelerator: 'CmdOrCtrl+Shift+V', click: () => send('toggle-visualizers') },
        { type: 'separator' },
        { label: 'Pop Out Visualizers', click: () => send('popout-visualizers') },
        { label: 'Pop Out Node Graph', click: () => send('popout-graph') },
        { label: 'Pop Out Docs', click: () => send('popout-docs') },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
      ],
    },

    /* Help menu */
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', accelerator: 'F1', click: () => send('open-docs') },
        { label: 'Keyboard Shortcuts', click: () => send('keyboard-shortcuts') },
        { type: 'separator' },
        {
          label: 'Report Issue...',
          click: () => {
            const { shell } = require('electron')
            shell.openExternal('https://github.com/arnoldwender/wm-prototyp-live-music-coder/issues')
          },
        },
        { type: 'separator' },
        ...(!isMac ? [{ role: 'about' as const }] : []),
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
```

- [ ] **Step 2: Commit**

```bash
git add electron/menu.ts
git commit -m "[Electron] Add native menu bar with File, Edit, View, Help"
```

---

## Task 6: System Tray

**Files:**
- Create: `electron/tray.ts`

- [ ] **Step 1: Create the system tray**

Create `electron/tray.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { Tray, Menu, nativeImage, app, type BrowserWindow } from 'electron'
import { join } from 'node:path'

let tray: Tray | null = null

/** Create the system tray icon and context menu */
export function createTray(mainWindow: BrowserWindow): Tray {
  /* Use the app icon — resize to 16x16 for tray */
  const iconPath = join(__dirname, '../dist/favicon.svg')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })

  tray = new Tray(icon)
  tray.setToolTip('Live Music Coder')

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
      click: () => mainWindow.webContents.send('menu:action', 'toggle-play'),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.exit(0)
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  /* Click tray icon to show/hide window */
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

/** Destroy the tray on app quit */
export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add electron/tray.ts
git commit -m "[Electron] Add system tray with show/hide, play/stop, quit"
```

---

## Task 7: Auto-Updater

**Files:**
- Create: `electron/updater.ts`

- [ ] **Step 1: Create the auto-updater module**

Create `electron/updater.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { autoUpdater } from 'electron-updater'
import { app, dialog, type BrowserWindow } from 'electron'
import log from 'electron-log'

/** Initialize auto-updater with GitHub Releases */
export function initUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.logger = log
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('app:update-available', info.version)
  })

  autoUpdater.on('update-downloaded', (info) => {
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded. Restart to apply?`,
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall()
      })
  })

  autoUpdater.on('error', (err) => {
    log.error('Auto-updater error:', err)
  })

  /* Check on launch (5s delay) and every 4 hours */
  app.whenReady().then(() => {
    setTimeout(() => autoUpdater.checkForUpdates(), 5000)
    setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000)
  })

  /* Manual check from menu */
  app.on('check-for-updates', () => {
    autoUpdater.checkForUpdates()
  })
}
```

- [ ] **Step 2: Install electron-log**

```bash
npm install electron-log@^5.0.0
```

- [ ] **Step 3: Commit**

```bash
git add electron/updater.ts package.json package-lock.json
git commit -m "[Electron] Add auto-updater via GitHub Releases"
```

---

## Task 8: Main Process Entry Point

**Files:**
- Create: `electron/main.ts`

- [ ] **Step 1: Create the main process**

Create `electron/main.ts`:

```typescript
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { app, BrowserWindow, Menu } from 'electron'
import { join } from 'node:path'
import { is, optimizer } from '@electron-toolkit/utils'
import { registerFileHandlers } from './ipc/file'
import { registerAudioHandlers } from './ipc/audio'
import { registerWindowHandlers, closeAllPopouts } from './ipc/window'
import { registerAppHandlers } from './ipc/app'
import { createMenu } from './menu'
import { createTray, destroyTray } from './tray'
import { initUpdater } from './updater'
import { appStore } from './store'

let mainWindow: BrowserWindow | null = null

function createWindow(): BrowserWindow {
  /* Restore saved window bounds or use defaults */
  const savedBounds = appStore.get('windowBounds')

  const win = new BrowserWindow({
    width: savedBounds?.width ?? 1280,
    height: savedBounds?.height ?? 800,
    x: savedBounds?.x,
    y: savedBounds?.y,
    minWidth: 900,
    minHeight: 600,
    title: 'Live Music Coder',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 12, y: 12 },
    backgroundColor: '#09090b',
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  })

  /* Show when ready to prevent visual flash */
  win.on('ready-to-show', () => {
    win.show()
  })

  /* Save window bounds on resize/move */
  const saveBounds = () => {
    if (!win.isMaximized() && !win.isFullScreen()) {
      appStore.set('windowBounds', win.getBounds())
    }
  }
  win.on('resized', saveBounds)
  win.on('moved', saveBounds)

  /* Minimize to tray instead of closing (if enabled) */
  win.on('close', (e) => {
    if (appStore.get('minimizeToTray') && !app.isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  /* Load the app */
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'))
  }

  /* Dev: open DevTools in development */
  if (is.dev) {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  return win
}

/* ── App lifecycle ── */

/* Extend app with isQuitting flag for tray behavior */
declare module 'electron' {
  interface App {
    isQuitting: boolean
  }
}
app.isQuitting = false

app.whenReady().then(() => {
  /* Optimize keyboard shortcuts for Electron windows */
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  /* Create main window */
  mainWindow = createWindow()

  /* Register all IPC handlers */
  registerAppHandlers()
  registerFileHandlers(mainWindow)
  registerAudioHandlers(mainWindow)
  registerWindowHandlers(mainWindow)

  /* Create menu and tray */
  createMenu(mainWindow)
  createTray(mainWindow)

  /* Initialize auto-updater (production only) */
  if (!is.dev) {
    initUpdater(mainWindow)
  }

  /* macOS: re-create window when dock icon clicked */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

/* Quit when all windows closed (except macOS) */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/* Clean up before quit */
app.on('before-quit', () => {
  app.isQuitting = true
  closeAllPopouts()
  destroyTray()
})

/* Strip menu in production on Windows/Linux */
if (process.platform !== 'darwin' && !is.dev) {
  /* Keep menu but remove DevTools item */
  app.on('browser-window-created', (_, win) => {
    win.webContents.on('devtools-opened', () => {
      if (!is.dev) win.webContents.closeDevTools()
    })
  })
}
```

- [ ] **Step 2: Verify the Electron main process compiles**

```bash
npx tsc -p tsconfig.electron.json --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add electron/main.ts
git commit -m "[Electron] Add main process with window, tray, menu, and IPC"
```

---

## Task 9: Generate App Icons

**Files:**
- Create: `build/icon.png`
- Create: `build/icon.icns` (macOS)
- Create: `build/icon.ico` (Windows)

- [ ] **Step 1: Generate icons from the existing favicon**

The project has `public/icon-512.png` (PWA icon). Use it as the source. electron-builder can auto-generate platform icons from a 1024x1024 PNG.

```bash
mkdir -p build
cp public/icon-512.png build/icon.png
```

Note: electron-builder will auto-generate `.icns` and `.ico` from `build/icon.png` during the build process if the platform-specific icons are not present. For production quality, use a tool like `electron-icon-maker` or `png2icons`:

```bash
npx electron-icon-maker --input=public/icon-512.png --output=build
```

If this tool is not available, electron-builder handles it automatically.

- [ ] **Step 2: Commit**

```bash
git add build/
git commit -m "[Electron] Add app icon assets for macOS, Windows, Linux"
```

---

## Task 10: Renderer Integration — Desktop Features in TransportBar

**Files:**
- Modify: `src/components/organisms/TransportBar.tsx`

- [ ] **Step 1: Add Save and Export buttons to TransportBar when running in Electron**

Read `src/components/organisms/TransportBar.tsx`. Find the section after the Share/Gist buttons (Group 3 in the toolbar). Add a conditional block that shows Save and Export buttons when `isElectron` is true.

Add this import at the top of the file:

```typescript
import { isElectron, electronAPI } from '../../lib/electron'
import { Save, Download } from 'lucide-react'
```

Find the toolbar group that contains the Share button. After the GistDialog or LanguageSwitcher (the last item in the toolbar), add:

```tsx
{/* Desktop-only: Save and Export */}
{isElectron && (
  <>
    <GroupDivider />
    <ToolbarGroup>
      <Tooltip content={t('toolbar.save')} shortcut="Ctrl+S">
        <Button variant="ghost" onClick={() => electronAPI?.saveProject(
          JSON.stringify(/* build project from store */)
        )}>
          <Save size={16} />
        </Button>
      </Tooltip>
      <Tooltip content={t('toolbar.exportAudio')} shortcut="Ctrl+E">
        <Button variant="ghost" onClick={() => {
          mainWindow.webContents.send('menu:action', 'export-audio')
        }}>
          <Download size={16} />
        </Button>
      </Tooltip>
    </ToolbarGroup>
  </>
)}
```

Note: The actual save/export logic will be wired through the menu:action handler. For now, the buttons send the same action as the menu items. The exact wiring depends on how the existing store builds a Project object — check `src/lib/persistence/local.ts` for the pattern.

- [ ] **Step 2: Verify the web build still works**

```bash
npm run build
```

Expected: Build succeeds. The `isElectron` check is false in the browser, so the new buttons are tree-shaken or simply not rendered.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/TransportBar.tsx
git commit -m "[Electron] Add Save/Export buttons to TransportBar in desktop mode"
```

---

## Task 11: First Run — Verify Electron Dev Mode

- [ ] **Step 1: Compile the Electron main process**

```bash
npx tsc -p tsconfig.electron.json
```

Expected: `dist-electron/` directory created with `main.js`, `preload.js`, and all IPC handler files.

- [ ] **Step 2: Run in dev mode**

```bash
npm run electron:dev
```

Expected: Vite dev server starts on port 5173, then Electron window opens loading the app. System tray icon appears. Menu bar shows File/Edit/View/Help. Close button minimizes to tray.

- [ ] **Step 3: Test basic functionality**

Manual verification checklist:
- [ ] App window loads with dark theme
- [ ] Landing page renders correctly
- [ ] Navigate to /editor — code editor works
- [ ] Play button starts audio
- [ ] System tray icon shows context menu
- [ ] File > Save shows native Save dialog
- [ ] File > Open shows native Open dialog
- [ ] View > Fullscreen toggles fullscreen
- [ ] Close button minimizes to tray
- [ ] Tray > Quit exits the app

- [ ] **Step 4: Commit any fixes needed**

```bash
git add -A
git commit -m "[Electron] First successful Electron dev run"
```

---

## Task 12: Production Build

- [ ] **Step 1: Build for current platform**

```bash
npm run electron:build
```

Expected: `release/` directory created with platform-specific distributable.

On macOS: `release/Live Music Coder-X.Y.Z-universal.dmg`
On Windows: `release/Live Music Coder Setup X.Y.Z.exe`
On Linux: `release/Live Music Coder-X.Y.Z.AppImage`

- [ ] **Step 2: Test the production build**

Open the built distributable and verify:
- [ ] App launches without dev tools
- [ ] All features work (editor, audio, visualizers)
- [ ] File save/open works
- [ ] Tray icon works
- [ ] Menu bar works
- [ ] Window remembers position on restart

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "[Electron] Production build verified for desktop distribution"
git push
```

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `npm run dev` — web version works unchanged
- [ ] `npm run build` — web build succeeds
- [ ] `npm run test` — all 82 tests pass
- [ ] `npm run electron:dev` — Electron dev mode works
- [ ] `npm run electron:build` — production build succeeds
- [ ] No Electron code is imported into the web build (tree-shaking via `isElectron` check)
- [ ] Context isolation is enforced (DevTools console: `require` and `process` are undefined)
- [ ] `.lmc` file save/load round-trips correctly
- [ ] Audio continues when window is minimized to tray
