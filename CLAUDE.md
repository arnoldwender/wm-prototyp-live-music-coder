# wm-prototyp-live-music-coder

Browser-based and desktop live coding music IDE with code editor, visual node graph, 4 audio engines, real-time visualizers, and instant code sharing. Ships as both a Netlify-hosted SPA and an Electron desktop app (macOS, Windows, Linux).

**Live:** <https://live-music-coder.pro>
**Repo:** <https://github.com/arnoldwender/wm-prototyp-live-music-coder>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 + CSS custom properties (design tokens) |
| State | Zustand 5 |
| Code Editor | CodeMirror 6 + @strudel/codemirror |
| Node Graph | React Flow (@xyflow/react) |
| Audio: Patterns | @strudel/core + @strudel/webaudio + @strudel/mini + @strudel/transpiler + @strudel/tonal |
| Audio: Synths | Tone.js 15 |
| Audio: Low-level | Web Audio API (native) |
| Audio: MIDI | WebMidi.js 3 |
| Visualizers | Canvas 2D + requestAnimationFrame |
| Routing | React Router DOM 7 |
| i18n | i18next + react-i18next (DE/EN/ES) |
| Persistence | idb (IndexedDB), lz-string (URL), @octokit/rest (Gist) |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Testing | Vitest 4 + @testing-library/react |
| Desktop | Electron 33 via electron-vite 5 + electron-builder |
| Code Signing | Developer ID Application + notarization via electron-builder-notarize (credentials via env vars) |
| Deployment | Netlify (SPA, static) + GitHub Releases (desktop) |

## Commands

```bash
# Web
npm run dev                # Vite dev server (localhost:5173)
npm run build              # tsc -b + vite build → dist/
npm run test               # Vitest (82 tests, 16 files)
npm run test:watch         # Vitest watch mode
npm run lint               # ESLint
npm run preview            # Preview production build
npx tsc --noEmit           # Type check only

# Electron desktop app
npm run electron:dev       # electron-vite dev (hot-reload)
npm run electron:build     # Build for current platform
npm run electron:build:mac # Build .dmg for macOS
npm run electron:build:win # Build installer for Windows
npm run electron:build:linux # Build AppImage for Linux
```

## Architecture

### Code Editor = Source of Truth

The code editor is always authoritative. The node graph is a derived view regenerated from code after every edit (500ms debounce). Graph interactions emit code mutations back to the editor.

### Engine Orchestrator

One shared `AudioContext`. Each engine adapter implements a common `EngineAdapter` interface. The `Orchestrator` class manages lazy engine initialization, code evaluation routing, and playback state.

### Project Structure

```text
electron/
├── main.ts              # Electron main process (BrowserWindow, app lifecycle)
├── preload.ts           # contextBridge: exposes electronAPI to renderer
├── menu.ts              # Native application menu (File, Edit, View, Help)
├── tray.ts              # System tray icon and controls
├── store.ts             # electron-store for persistent settings
├── updater.ts           # electron-updater for auto-updates
├── wav-encoder.ts       # WAV file export (native file save dialog)
└── ipc/
    ├── app.ts           # IPC: app:info, app:notify, app:quit, app:check-update
    ├── audio.ts         # IPC: audio:export-wav
    ├── file.ts          # IPC: file:save, file:open, file:recent, file:reveal
    └── window.ts        # IPC: window:popout, window:fullscreen

electron.vite.config.ts  # electron-vite config (main, preload, renderer)
out/                      # electron-vite build output (gitignored)
release/                  # electron-builder output — .dmg, .exe, .AppImage (gitignored)

src/
├── components/
│   ├── atoms/           # ActivityBarButton, Badge, Button, CanvasVisualizer, EngineNode, ErrorBoundary, Icon, Logo, NotFound, TabButton, Toggle, Tooltip, WaveformBackground (13)
│   ├── molecules/       # AchievementToast, EngineSelector, ErrorBar, FeatureCard, FileTabs, FilterPill, HelpPanel, LanguageSwitcher, NowPlayingIndicator, ShareDialog, SortSelect, ToolbarGroup, VisualizerPills, VisualizerToggle (14)
│   └── organisms/       # ActivityBar, CodeEditor, DetailPanel, ExampleGallery, FeatureGrid, GistDialog, HeroSection, NodeGraph, PatternTimeline, PianorollVisualizer, SidePanel, SpectrumVisualizer, StatusBar, StrudelEditor, TemplateSelector, TransportBar, TutorialOverlay, VisualizerDashboard, WaveformVisualizer (19)
├── layouts/
│   └── EditorLayout.tsx # Resizable 3-zone: top (editor+graph), middle (visualizers), bottom (status)
├── pages/
│   ├── Landing.tsx      # Hero + features + examples
│   ├── Editor.tsx       # Main IDE: CodeEditor + NodeGraph + VisualizerDashboard
│   ├── Docs.tsx         # Documentation hub (/docs, /docs/:sectionId)
│   ├── Samples.tsx      # Sample library browser (/samples)
│   ├── Examples.tsx     # Curated code examples per engine (/examples)
│   └── Legal.tsx        # Impressum, Datenschutz (/legal)
├── lib/
│   ├── store.ts         # Zustand: transport, engine, layout, file management
│   ├── history.ts       # Undo/redo (100-entry cap)
│   ├── constants.ts     # Default BPM, engine colors, layout defaults
│   ├── orchestrator/    # Engine orchestrator + AudioGraph (DAG with cycle prevention)
│   ├── engines/         # Strudel, Tone.js, WebAudio, MIDI adapters + registry
│   ├── editor/          # CM6 theme, setup, extensions, debounced evaluator
│   ├── parser/          # Code → graph extraction (regex-based, per engine)
│   ├── codegen/         # Graph → code generation (per engine templates)
│   ├── audio/           # Shared AudioContext, AudioAnalyzer, AudioRecorder, strudel-tap
│   ├── persistence/     # IndexedDB, URL sharing (lz-string), GitHub Gist (octokit)
│   ├── visualizers/     # Waveform, spectrum, timeline drawing (Canvas 2D)
│   └── useMediaQuery.ts # Responsive media query hook
├── data/
│   ├── templates.ts     # Starter code templates per engine
│   ├── docs.ts          # Documentation content
│   ├── sample-library.ts # Audio sample catalog by category
│   ├── example-library.ts # Curated code examples per engine
│   └── legal.ts         # Legal page content (Impressum, Datenschutz)
├── i18n/
│   └── locales/         # de.json, en.json, es.json
├── styles/
│   ├── global.css       # Tailwind + base dark theme
│   └── tokens/          # colors.css, typography.css, spacing.css
├── types/
│   ├── engine.ts        # EngineType, EngineBlock, Connection, EngineAdapter
│   ├── project.ts       # Project, ProjectFile, PanelLayout
│   └── strudel.d.ts     # Type declarations for superdough and @strudel/* modules
├── App.tsx              # Router: 7 routes (/, /editor, /docs, /docs/:id, /samples, /examples, /legal)
└── main.tsx             # Entry: i18n init, global CSS, React render
```

### Atomic Design Hierarchy

- **Atoms** import NOTHING from other components
- **Molecules** import ONLY atoms
- **Organisms** import molecules and atoms
- **Layouts** compose organisms
- **Pages** use layouts

### Audio Engines

| Engine | Color | Package | Purpose |
|--------|-------|---------|---------|
| Strudel | Purple #a855f7 | @strudel/core | Pattern-based live coding |
| Tone.js | Blue #3b82f6 | tone | High-level synths and effects |
| Web Audio | Green #22c55e | Native API | Low-level audio nodes |
| MIDI | Orange #f97316 | webmidi | External device output (output-only in v1) |

## Key Rules

- **Design tokens:** NEVER hardcode colors, spacing, shadows, or transitions — always use `var(--token)` or VIZ_COLORS for Canvas 2D
- **Semantic HTML:** mandatory for all components
- **Accessibility:** WCAG AA contrast, keyboard navigation, aria labels, focus states
- **Dark mode only:** music production aesthetic
- **This is Vite + React SPA** — NOT Next.js. No server components, no "use client"
- **Canvas 2D cannot use CSS variables** — use literal hex values from `src/lib/visualizers/colors.ts`
- **Colocated tests:** `foo.test.ts` next to `foo.ts`
- **Barrel exports:** `index.ts` per component directory

## Conventions

- Commits: `[Action] Brief description` — NO co-author tags, NO AI branding
- Git author: Arnold Wender <arnold.wender@gmail.com>
- Deploy: Netlify (manual via `npm run build && netlify deploy --prod --dir=dist`)

## License

Dual-licensed. See [LICENSING.md](LICENSING.md) for details.

- **Combined application:** AGPL-3.0-or-later (required by @strudel/* dependency)
- **Original components:** MIT (files marked with `SPDX-License-Identifier: MIT`)

Copyright (c) 2026 Arnold Wender / Wender Media
