# agents.md — AI Agent Instructions

## Project

**wm-prototyp-live-music-coder** — Browser-based and Electron desktop live coding music IDE with code editor, visual node graph, 4 audio engines, and real-time visualizers. 105 source files, 82 tests (16 files), 7 routes.

**Live:** <https://live-music-coder.pro>

## What This Project Does

Users write code in the browser (or desktop app) to create music in real time. The app supports 4 audio engines (Strudel patterns, Tone.js synths, raw Web Audio API, MIDI output). A visual node graph shows the audio routing. Canvas 2D visualizers (waveform, spectrum, timeline, pianoroll) react to the audio via superdough audio tap. Additional pages provide a sample library, curated code examples, documentation, and legal pages. An Electron wrapper adds native file save/open, WAV export, system tray, auto-updates, and pop-out panels.

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 8
- Zustand 5 (state), Tailwind CSS 4 (styling), CodeMirror 6 (editor), React Flow (node graph)
- @strudel/core (patterns), Tone.js (synths), Web Audio API, WebMidi.js
- Canvas 2D (visualizers), i18next (DE/EN/ES)
- idb (IndexedDB), lz-string (URL sharing), @octokit/rest (Gist)
- Electron 33 via electron-vite 5 + electron-builder (desktop)
- Vitest (82 tests, 16 files), Netlify (web deployment)

## Key Architecture Decisions

1. **Code editor is source of truth** — the node graph is derived from code, not the other way around
2. **Engine orchestrator** — single shared AudioContext, engine adapters behind a common interface
3. **Atomic Design** — atoms import nothing, molecules import atoms, organisms import molecules
4. **Design tokens** — CSS custom properties for all colors/spacing/typography (Canvas 2D uses literal hex from VIZ_COLORS)
5. **Electron via electron-vite** — same React SPA serves both web and desktop; preload bridge exposes IPC channels

## File Organization

- `src/components/{atoms,molecules,organisms}/` — 46 UI components (13 atoms, 14 molecules, 19 organisms)
- `src/lib/orchestrator/` — engine routing + AudioGraph (DAG)
- `src/lib/engines/` — Strudel, Tone.js, WebAudio, MIDI adapters
- `src/lib/editor/` — CodeMirror setup, theme, evaluator
- `src/lib/parser/` — code-to-graph extraction
- `src/lib/codegen/` — graph-to-code generation
- `src/lib/audio/` — shared AudioContext, analyzer, recorder
- `src/lib/persistence/` — IndexedDB, URL sharing, Gist
- `src/lib/visualizers/` — Canvas 2D drawing functions
- `src/data/` — templates, docs, sample-library, example-library, legal content
- `src/pages/` — Landing, Editor, Docs, Samples, Examples, Legal
- `src/types/strudel.d.ts` — superdough and @strudel/* type declarations
- `electron/` — main process, preload, menu, tray, updater, WAV encoder, IPC handlers
- `electron.vite.config.ts` — electron-vite build config (main, preload, renderer)

## Routes (7)

- `/` — Landing page
- `/editor` — Main IDE
- `/docs` — Documentation hub
- `/docs/:sectionId` — Individual doc section
- `/samples` — Sample library browser
- `/examples` — Curated code examples
- `/legal` — Impressum, Datenschutz, Lizenzen

## Electron IPC Channels

- `app:info`, `app:notify`, `app:quit`, `app:check-update`
- `file:save`, `file:save-path`, `file:open`, `file:recent`, `file:reveal`
- `audio:export-wav`
- `window:popout`, `window:fullscreen`, `window:fullscreen-changed`, `window:popout-closed`
- `menu:action`

## Rules

- NEVER hardcode colors or spacing — use design tokens
- This is Vite + React SPA — NOT Next.js
- Dark mode only
- Commits: `[Action] Brief description` — no co-author tags
- AGPL-3.0-or-later license (combined app, due to Strudel dependency); MIT for original components
