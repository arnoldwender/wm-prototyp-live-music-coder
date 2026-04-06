# Live Music Coder — Electron Desktop App Design

**Date:** 2026-04-06
**Status:** Approved
**Author:** Arnold Wender / Wender Media

## Overview

Wrap the existing React SPA into an enterprise-grade Electron desktop application for macOS, Windows, and Linux. Single codebase serves both web (Netlify) and desktop (Electron) from the same source. The desktop version adds native file system integration, audio export, system tray, pop-out panels, and auto-updates via GitHub Releases.

## Architecture

```
Main Process (Node.js)
  ├── Window management (single + tray + pop-out)
  ├── File system (save/load .lmc projects)
  ├── Audio export (WAV via Web Audio offline rendering)
  ├── Native device dialogs
  ├── System notifications
  ├── Auto-updater (GitHub Releases)
  ├── Menu bar (File, Edit, View, Help)
  └── Tray icon + context menu

Preload Bridge (contextBridge)
  └── electronAPI: save, load, export, notify, dialogs, popout, fullscreen, platform

Renderer Process (existing React app)
  ├── Detects isElectron via window.electronAPI
  ├── Code eval stays sandboxed (no Node.js access)
  ├── Uses IPC for all native features
  └── Falls back to web behavior when no electronAPI
```

## Security Model

- **Context isolation: ON** — renderer has zero Node.js access
- **Node integration: OFF** — prevents user-evaluated code from touching the filesystem
- **Sandbox: ON** — Chromium sandbox enabled for renderer
- **Preload bridge** — only exposes specific IPC wrappers via `contextBridge.exposeInMainWorld`
- **No remote module** — deprecated and dangerous, not used
- **CSP** — same Content-Security-Policy as web version, set via meta tag in index.html

## Window Modes

### Default: Single Window + System Tray
- App launches as a single BrowserWindow (1280x800 default, resizable)
- System tray icon with context menu (Show/Hide, Play/Stop, Quit)
- Close button minimizes to tray (configurable in settings)
- Audio continues playing when minimized to tray
- Quit via tray context menu, Cmd+Q (macOS), or Alt+F4 (Windows)

### Fullscreen Mode
- Toggle via View menu, F11 key, or toolbar button
- Uses `BrowserWindow.setFullScreen()` for true fullscreen
- Escape exits fullscreen

### Pop-out Panels
- Visualizers, node graph, and docs can detach into child BrowserWindows
- Triggered via View menu or context menu on panel header
- Child windows track parent — closed when parent closes
- Child windows communicate back to parent via IPC for state sync
- Maximum 4 pop-out windows simultaneously

## Native Features (IPC Channels)

### File System

| Channel | Direction | Payload | Description |
|---------|-----------|---------|-------------|
| `file:save` | renderer → main | `{ project: Project }` | Show Save dialog, write `.lmc` JSON to disk |
| `file:save-path` | renderer → main | `{ project: Project, path: string }` | Save to known path (no dialog) |
| `file:open` | renderer → main | none | Show Open dialog, read `.lmc` file, return Project |
| `file:recent` | renderer → main | none | Return list of recent files (last 10) |
| `file:recent-add` | main → store | `{ path: string, name: string }` | Add to recent files list |
| `file:reveal` | renderer → main | `{ path: string }` | Open file location in Finder/Explorer |

- `.lmc` file format: same JSON structure as IndexedDB `Project` type
- File association: register `.lmc` extension with the app on install
- Drag-and-drop: accept `.lmc` files dropped on the app window
- Recent files: stored in `electron-store` (JSON in app data directory)

### Audio Export

| Channel | Direction | Payload | Description |
|---------|-----------|---------|-------------|
| `audio:export-wav` | renderer → main | `{ buffer: ArrayBuffer, sampleRate: number, channels: number }` | Write WAV file to disk via Save dialog |
| `audio:export-progress` | main → renderer | `{ percent: number }` | Export progress updates |

- WAV encoding done in main process (write PCM header + raw samples)
- No ffmpeg dependency — WAV is lossless and simple to encode natively

### Window Management

| Channel | Direction | Payload | Description |
|---------|-----------|---------|-------------|
| `window:popout` | renderer → main | `{ panelId: string, bounds: Rect }` | Detach panel to new window |
| `window:popout-close` | main → renderer | `{ panelId: string }` | Notify renderer panel was closed |
| `window:fullscreen` | renderer → main | `{ enabled: boolean }` | Toggle fullscreen |
| `window:fullscreen-changed` | main → renderer | `{ enabled: boolean }` | Fullscreen state changed |

### App

| Channel | Direction | Payload | Description |
|---------|-----------|---------|-------------|
| `app:info` | renderer → main | none | Return `{ version, platform, arch, isElectron: true }` |
| `app:notify` | renderer → main | `{ title: string, body: string }` | Show system notification |
| `app:check-update` | renderer → main | none | Check for updates manually |
| `app:update-available` | main → renderer | `{ version: string }` | Notify new version available |
| `app:quit` | renderer → main | none | Quit the application |

## File Structure

```
electron/
├── main.ts              # Entry: app lifecycle, window creation, IPC registration
├── preload.ts           # contextBridge: expose electronAPI to renderer
├── ipc/
│   ├── file.ts          # File save/open/recent handlers
│   ├── audio.ts         # WAV export handler
│   ├── window.ts        # Pop-out and fullscreen handlers
│   └── app.ts           # App info, notifications, quit
├── menu.ts              # Native menu bar definition
├── tray.ts              # System tray icon and context menu
├── updater.ts           # electron-updater integration (GitHub Releases)
├── store.ts             # electron-store for app preferences (recent files, window bounds)
└── wav-encoder.ts       # PCM WAV file writer
tsconfig.electron.json   # TypeScript config for electron/ directory
```

### Renderer-Side Integration (minimal changes to existing app)

```
src/
├── lib/
│   └── electron.ts      # isElectron detection + typed API wrapper
├── components/
│   └── organisms/
│       └── TransportBar.tsx  # Add native menu keyboard shortcut hints
└── types/
    └── electron.d.ts    # Type declarations for window.electronAPI
```

## Menu Bar

### macOS

```
Live Music Coder
├── About Live Music Coder
├── Check for Updates...
├── ─────────
├── Settings         (Cmd+,)
├── ─────────
├── Hide             (Cmd+H)
├── Hide Others      (Cmd+Opt+H)
├── Show All
├── ─────────
└── Quit             (Cmd+Q)

File
├── New Project      (Cmd+N)
├── Open...          (Cmd+O)
├── Open Recent      →
├── ─────────
├── Save             (Cmd+S)
├── Save As...       (Cmd+Shift+S)
├── ─────────
├── Export Audio...   (Cmd+E)
├── ─────────
└── Close Window     (Cmd+W)

Edit
├── Undo             (Cmd+Z)
├── Redo             (Cmd+Shift+Z)
├── ─────────
├── Cut              (Cmd+X)
├── Copy             (Cmd+C)
├── Paste            (Cmd+V)
├── Select All       (Cmd+A)

View
├── Fullscreen       (F11)
├── Zen Mode         (Cmd+Shift+F)
├── ─────────
├── Toggle Graph     (Cmd+G)
├── Toggle Visualizers (Cmd+Shift+V)
├── ─────────
├── Pop Out Visualizers
├── Pop Out Node Graph
├── Pop Out Docs
├── ─────────
├── Zoom In          (Cmd+=)
├── Zoom Out         (Cmd+-)
├── Reset Zoom       (Cmd+0)

Help
├── Documentation    (F1)
├── Keyboard Shortcuts
├── ─────────
├── Report Issue...
├── ─────────
└── About
```

### Windows/Linux
Same structure with Ctrl instead of Cmd. No app-name menu (standard Windows convention).

## Build Configuration

### electron-builder config (package.json)

```json
{
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
      "target": [
        { "target": "dmg", "arch": ["universal"] }
      ],
      "category": "public.app-category.music",
      "icon": "build/icon.icns",
      "darkModeSupport": true,
      "hardenedRuntime": true,
      "gatekeeperAssess": false
    },
    "win": {
      "target": [
        { "target": "nsis" },
        { "target": "portable" }
      ],
      "icon": "build/icon.ico"
    },
    "linux": {
      "target": [
        { "target": "AppImage" },
        { "target": "deb" }
      ],
      "icon": "build/icon.png",
      "category": "Audio"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "dmg": {
      "title": "Live Music Coder",
      "contents": [
        { "x": 130, "y": 220 },
        { "x": 410, "y": 220, "type": "link", "path": "/Applications" }
      ]
    },
    "fileAssociations": [
      {
        "ext": "lmc",
        "name": "Live Music Coder Project",
        "description": "Live Music Coder Project File",
        "mimeType": "application/x-live-music-coder"
      }
    ],
    "publish": {
      "provider": "github",
      "owner": "arnoldwender",
      "repo": "wm-prototyp-live-music-coder"
    }
  }
}
```

### TypeScript Config (tsconfig.electron.json)

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
    "skipLibCheck": true
  },
  "include": ["electron/**/*.ts"]
}
```

### NPM Scripts

```json
{
  "electron:dev": "concurrently -k \"vite\" \"wait-on tcp:5173 && tsc -p tsconfig.electron.json && electron .\"",
  "electron:build": "npm run build && tsc -p tsconfig.electron.json && electron-builder",
  "electron:build:mac": "npm run build && tsc -p tsconfig.electron.json && electron-builder --mac",
  "electron:build:win": "npm run build && tsc -p tsconfig.electron.json && electron-builder --win",
  "electron:build:linux": "npm run build && tsc -p tsconfig.electron.json && electron-builder --linux"
}
```

## Auto-Updater

- Uses `electron-updater` package with GitHub Releases as provider
- Checks for updates on app launch (after 5s delay) and every 4 hours
- Shows notification when update is available: "New version X.Y.Z available. Restart to update?"
- Downloads update in background, applies on next restart
- Manual check available via Help > Check for Updates

## Dependencies to Add

### Production
- `electron-store` — persistent app preferences (recent files, window bounds, tray behavior)
- `electron-updater` — auto-updates from GitHub Releases

### Development
- `electron` — Electron runtime
- `electron-builder` — packaging and distribution
- `@electron-toolkit/preload` — typed preload utilities
- `@electron-toolkit/utils` — common Electron utilities (is.dev, optimizer)
- `concurrently` — run Vite + Electron in parallel for dev
- `wait-on` — wait for Vite dev server before launching Electron

## Renderer Integration Pattern

The existing React app detects Electron and conditionally enables native features:

```typescript
// src/lib/electron.ts
export const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

export const electronAPI = isElectron ? window.electronAPI : null;
```

Components that offer native features check `isElectron`:
- TransportBar: show "Save" / "Export" buttons when in Electron
- GistDialog: still works (network access allowed by CSP)
- Settings panel: show desktop-specific settings (tray behavior, update check)

Web version is completely unaffected — no Electron code is imported into the web build.

## Testing Strategy

- Existing 82 Vitest tests continue to pass (renderer-only, no Electron dependency)
- Manual testing matrix for Electron:
  - macOS: window modes, tray, file save/load, audio export, menu, auto-update
  - Windows: same + NSIS installer, file association, portable exe
  - Linux: same + AppImage launch, deb install

## What Does NOT Change

- The entire React application, all components, pages, layouts
- Zustand store, audio engines, visualizers, parser, codegen
- Web build pipeline (`npm run build` → Netlify)
- IndexedDB persistence (still works in Electron)
- URL sharing, Gist integration
- i18n, design tokens, styles
- All existing tests
- AGPL-3.0 / MIT dual-license structure
