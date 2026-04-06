# Live Music Coder

[![Netlify Status](https://api.netlify.com/api/v1/badges/a03cf0e5-f018-4d4e-bc11-5c973fb071fc/deploy-status)](https://app.netlify.com/projects/wm-prototyp-live-music-coder/deploys)

A browser-based live coding music IDE. Write code, hear music instantly. Features a visual node graph, 4 audio engines, real-time visualizers, and instant code sharing.

**Live:** <https://live-music-coder.pro>

## Features

- **Code Editor** — CodeMirror 6 with dark theme, multi-tab files, per-engine syntax highlighting, live evaluation (500ms debounce)
- **Node Graph** — React Flow canvas showing audio routing as draggable nodes, auto-derived from code
- **4 Audio Engines** — Strudel (pattern-based), Tone.js (synths/effects), Web Audio API (raw), MIDI (output)
- **Visualizers** — Waveform, spectrum analyzer, pattern timeline — all Canvas 2D at 60fps, superdough audio tap for Strudel integration
- **Sample Library** — Browse and preview built-in audio samples by category
- **Example Gallery** — Curated code examples per engine with one-click load into editor
- **Documentation** — In-app docs with engine guides, API reference, and tutorials
- **Code Sharing** — URL compression, GitHub Gist save/load, audio recording (WebM)
- **Legal Pages** — Impressum, Datenschutz
- **Persistence** — IndexedDB autosave, URL sharing (lz-string), GitHub Gist save/load
- **i18n** — German, English, Spanish
- **Dark Mode** — Music production aesthetic with design tokens

## Quick Start

```bash
npm install
npm run dev
```

Open <http://localhost:5173> — landing page with examples. Click "Start Coding" to open the IDE.

## Routes

| Path | Page |
| ---- | ---- |
| `/` | Landing page (hero, features, examples) |
| `/editor` | Main IDE (code editor, node graph, visualizers) |
| `/docs` | Documentation hub |
| `/docs/:id` | Individual doc section |
| `/samples` | Sample library browser |
| `/examples` | Curated code examples per engine |
| `/legal` | Impressum, Datenschutz |

## Tech Stack

React 19, TypeScript 5.9, Vite 8, Tailwind CSS 4, Zustand 5, CodeMirror 6, React Flow, Strudel, Tone.js, Web Audio API, WebMidi.js, Canvas 2D, i18next, Framer Motion 12, Vitest.

## Scripts

```bash
npm run dev        # Dev server (localhost:5173)
npm run build      # TypeScript + Vite production build
npm run test       # Vitest
npm run test:watch # Watch mode
npm run lint       # ESLint
npm run preview    # Preview production build
```

## Deploy

Hosted on Netlify. Manual deploy:

```bash
npm run build
netlify deploy --prod --dir=dist
```

## Architecture

- **Code editor is source of truth** — node graph is a derived view
- **Engine orchestrator** routes code to Strudel/Tone.js/WebAudio/MIDI adapters
- **Shared AudioContext** — all engines output to one master gain + analyser
- **Atomic Design** — atoms, molecules, organisms hierarchy
- **Design tokens** via CSS custom properties (Canvas 2D uses literal hex from `VIZ_COLORS`)

## License

This project uses a **dual-license** structure. See [LICENSING.md](LICENSING.md) for full details.

- **Combined application**: [AGPL-3.0-or-later](LICENSE-AGPL) (required by Strudel dependency)
- **Original components** (visualizers, engines, orchestrator, UI, persistence): [MIT](LICENSE-MIT)

Copyright (c) 2026 Arnold Wender / Wender Media

Files marked with `SPDX-License-Identifier: MIT` may be extracted and used independently under MIT terms.
