<p align="center">
  <img src="public/favicon.svg" alt="Live Music Coder" width="80" height="80">
</p>

<h1 align="center">Live Music Coder</h1>

<p align="center">
  <strong>Write code. Hear music. Instantly.</strong><br>
  A browser-based live coding music IDE with 4 audio engines, visual node graph, and real-time visualizers.
</p>

<p align="center">
  <a href="https://live-music-coder.pro"><strong>Try it live</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#features">Features</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#quick-start">Quick Start</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#architecture">Architecture</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://app.netlify.com/projects/wm-prototyp-live-music-coder/deploys"><img src="https://api.netlify.com/api/v1/badges/a03cf0e5-f018-4d4e-bc11-5c973fb071fc/deploy-status" alt="Netlify Status"></a>
  <img src="https://img.shields.io/badge/react-19-blue?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/typescript-5.9-blue?logo=typescript" alt="TypeScript 5.9">
  <img src="https://img.shields.io/badge/vite-8-purple?logo=vite" alt="Vite 8">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-green" alt="License AGPL-3.0">
  <img src="https://img.shields.io/badge/i18n-DE%20%7C%20EN%20%7C%20ES-orange" alt="i18n DE EN ES">
  <a href="https://github.com/sponsors/arnoldwender"><img src="https://img.shields.io/badge/sponsor-arnoldwender-ea4aaa?logo=github-sponsors" alt="Sponsor"></a>
</p>

---

## Download Desktop App

| Platform | Architecture | Download |
|----------|-------------|----------|
| macOS | Apple Silicon (M1/M2/M3/M4) | [Download .dmg](https://github.com/arnoldwender/wm-prototyp-live-music-coder/releases/latest/download/Live.Music.Coder-1.0.2-arm64.dmg) |
| macOS | Intel | [Download .dmg](https://github.com/arnoldwender/wm-prototyp-live-music-coder/releases/latest/download/Live.Music.Coder-1.0.2.dmg) |
| Windows | x64 | Coming soon |
| Linux | x64 | Coming soon |

Or [try it in your browser](https://live-music-coder.pro) — no download required.

---

## Features

**Code Editor** — CodeMirror 6 with dark theme, multi-tab files, per-engine syntax highlighting, and live evaluation with 500ms debounce.

**Visual Node Graph** — React Flow canvas showing audio routing as draggable, connectable nodes. Auto-derived from code in real time.

**4 Audio Engines**

| Engine | Purpose | Package |
|--------|---------|---------|
| Strudel | Pattern-based live coding (mini-notation) | `@strudel/core` |
| Tone.js | High-level synths, effects, transport | `tone` |
| Web Audio | Low-level audio node programming | Native API |
| MIDI | External hardware output | `webmidi` |

**Real-Time Visualizers** — Waveform, spectrum analyzer, and pattern timeline rendered on Canvas 2D at 60fps with superdough audio tap integration.

**Sample Library** — Browse and preview built-in audio samples by category with inline playback.

**Example Gallery** — Curated code examples per engine with one-click load into the editor.

**Code Sharing** — Share code via compressed URLs (lz-string), save/load GitHub Gists, and record audio sessions as WebM.

**Internationalization** — Full DE / EN / ES support with 419 translation keys.

**Dark Mode** — Music production aesthetic powered by a complete design token system.

---

## Quick Start

```bash
git clone https://github.com/arnoldwender/wm-prototyp-live-music-coder.git
cd wm-prototyp-live-music-coder
npm install
npm run dev
```

Open http://localhost:5173 — click **Start Coding** to open the IDE.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (localhost:5173) |
| `npm run build` | TypeScript + Vite production build |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Type check only |

## Routes

| Path | Page |
|------|------|
| `/` | Landing page with hero, features, and examples |
| `/editor` | Main IDE: code editor, node graph, visualizers |
| `/docs` | Documentation hub |
| `/docs/:id` | Individual doc section |
| `/samples` | Sample library browser |
| `/examples` | Curated code examples per engine |
| `/sessions` | Curated AI-composed pieces — listing |
| `/sessions/:slug` | Individual session piece (code, movements, composer notes) |
| `/legal` | Impressum, Datenschutz |

---

## Architecture

```
Code Editor (source of truth)
    |
    v  500ms debounce
Engine Orchestrator ──> Strudel / Tone.js / WebAudio / MIDI
    |
    v  shared AudioContext
Master Gain ──> Analyser ──> Speakers
    |               |
    v               v
Recorder    Visualizers (Canvas 2D)
```

- **Code editor is the single source of truth** — the node graph is a derived view regenerated from code on every edit
- **Engine orchestrator** manages lazy initialization, code routing, and lifecycle for all 4 engines
- **Shared AudioContext** — all engines output to one master gain node connected to a shared analyser
- **Atomic Design** — components organized as atoms, molecules, and organisms
- **Design tokens** — all styling via CSS custom properties (Canvas 2D uses literal hex from `VIZ_COLORS`)

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| State | Zustand 5 |
| Code Editor | CodeMirror 6 |
| Node Graph | React Flow |
| Audio | Strudel, Tone.js, Web Audio API, WebMidi.js |
| Visualizers | Canvas 2D + requestAnimationFrame |
| i18n | i18next + react-i18next |
| Persistence | IndexedDB (idb), lz-string, Octokit |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Testing | Vitest 4 + Testing Library |
| Deploy | Netlify |

### Project Structure

```
src/
  components/
    atoms/          # Button, Icon, Toggle, Badge, Tooltip, ...
    molecules/      # EngineSelector, FileTabs, ShareDialog, ...
    organisms/      # TransportBar, CodeEditor, NodeGraph, SiteNav, Visualizers, ...
  layouts/          # EditorLayout (resizable 3-zone IDE)
  pages/            # Landing, Editor, Docs, Samples, Examples, Sessions, SessionPiece, Legal
  lib/
    orchestrator/   # Multi-engine management + DAG audio graph
    engines/        # Strudel, Tone.js, WebAudio, MIDI adapters
    audio/          # Shared AudioContext, analyser, recorder
    editor/         # CodeMirror theme, setup, extensions
    parser/         # Code-to-graph extraction (per engine)
    codegen/        # Graph-to-code generation
    visualizers/    # Waveform, spectrum, timeline (Canvas 2D)
    persistence/    # IndexedDB, URL sharing, GitHub Gist
    store.ts        # Zustand global state
    history.ts      # Undo/redo (100-entry cap)
  data/             # Templates, docs, examples, sessions, sample catalog
  i18n/             # DE, EN, ES translations
  styles/tokens/    # colors.css, typography.css, spacing.css
  types/            # TypeScript type definitions
```

---

## Deploy

Hosted on [Netlify](https://www.netlify.com/). Automatic deploys from `main`.

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Contributing

Contributions are welcome. Please note the dual-license structure:

- Contributions to **MIT-licensed files** are accepted under MIT
- Contributions to **AGPL-licensed files** (Strudel integration) are accepted under AGPL-3.0-or-later

See [LICENSING.md](LICENSING.md) for which files fall under which license.

---

## License

This project uses a **dual-license** structure:

- **Combined application**: [AGPL-3.0-or-later](LICENSE-AGPL) (required by [Strudel](https://strudel.cc/) dependency)
- **Original components** (visualizers, engines, orchestrator, UI, persistence): [MIT](LICENSE-MIT)

Every source file contains an `SPDX-License-Identifier` header indicating its license.

See [LICENSING.md](LICENSING.md) for full details on which components are MIT vs AGPL.

**Copyright (c) 2026 [Arnold Wender](https://arnoldwender.com) / [Wender Media](https://www.wendermedia.com)**

---

> If you are a racist, fascist, or have another kind of mental disability that makes you discriminate against other human beings — please don't use my software.
