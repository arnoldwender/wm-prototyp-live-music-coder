<p align="center">
  <img src="public/favicon.svg" alt="Live Music Coder" width="80" height="80">
</p>

<h1 align="center">Live Music Coder</h1>

<p align="center">
  <strong>Write code. Hear music. Instantly.</strong><br>
  A browser-based and native macOS live coding music IDE with 4 audio engines, visual node graph, and real-time visualizers.
</p>

| | |
| --- | --- |
| **Status** | Live (`v1.3.3`, web + signed/notarized macOS `arm64` & `x64`, measured 2026-11-16) |
| **Domain** | https://live-music-coder.pro |
| **Stack** | React 19 · TypeScript 5.9 (`strict`) · Vite 8 · Tailwind CSS 4 · Electron 43 |
| **Hosting & CI** | Netlify Edge (auto-deploy on `main`) · GitHub Actions (`.github/workflows/ci.yml`) · GitHub Releases (desktop) |
| **Languages** | EN (default / SSR canonical) · DE · ES |
| **Local port** | `5173` |
| **Gate** | `npx tsc -b && npx tsc --noEmit -p tsconfig.node.json && npm run lint && npm test && npm run build && npm run verify:hydration && npm run verify:ai-labels` |

> **Before touching anything:** `npx tsc --noEmit` compiles zero files because the root `tsconfig.json` uses solution-style project references (`files: []`); run `npx tsc -b` for `src/` and `npx tsc --noEmit -p tsconfig.node.json` for `electron/`.

<p align="center">
  <a href="https://live-music-coder.pro"><strong>Try it live</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#features">Features</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#quick-start">Quick Start</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#architecture">Architecture</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://app.netlify.com/projects/wm-prototyp-live-music-coder/deploys"><img src="https://api.netlify.com/api/v1/badges/a03cf0e5-f018-4d4e-bc11-5c973fb071fc/deploy-status" alt="Netlify Status"></a>
  <a href="https://github.com/sponsors/arnoldwender"><img src="https://img.shields.io/badge/sponsor-arnoldwender-ea4aaa?logo=github-sponsors" alt="Sponsor"></a>
</p>

---

## Download Desktop App

| Platform | Architecture | Download |
|----------|-------------|----------|
| macOS | Apple Silicon (M1/M2/M3/M4, signed & notarized `v1.3.3`) | [Latest release](https://github.com/arnoldwender/wm-prototyp-live-music-coder/releases/latest) |
| macOS | Intel (`x64`, signed & notarized `v1.3.3`) | [Latest release](https://github.com/arnoldwender/wm-prototyp-live-music-coder/releases/latest) |
| Windows | x64 | Coming soon |
| Linux | x64 | Coming soon |

Or [try it in your browser](https://live-music-coder.pro) — no download required.

---

## Features

**Code Editor** — CodeMirror 6 with dark theme, multi-tab files, per-engine syntax highlighting, live evaluation, inline `slider()` widgets, and `._pianoroll()` / `._scope()` visualizers rendered directly in the code.

**Interactive Controls** — `slider(value, min, max, step)` creates draggable inline widgets. `onKey()` binds keyboard shortcuts. `createParams()` creates named parameters controllable via MIDI CC.

**Visual Node Graph** — React Flow canvas auto-derived from your code in real time, laid out in columns by signal depth so every edge points forward. All four engines draw a graph. For Tone.js and Web Audio it is editable: nodes are declarations, edges are `.connect()` calls, and a change in the canvas is written back as code. For Strudel it is a view of the pattern itself — one lane per `$:` voice, one node per chained call, `stack()` drawn as the mixer it is — and edits stay in the editor, because a Strudel file is one expression and cannot be reassembled from node snippets. Node positions are not persisted yet.

**4 Audio Engines + Extensions**

| Engine | Purpose | Package |
|--------|---------|---------|
| Strudel | Pattern-based live coding (mini-notation) | `@strudel/core` + `web` + `draw` |
| Tone.js | High-level synths, effects, transport | `tone` |
| Web Audio | Low-level audio node programming | Native API |
| MIDI | Keyboard input + CC knobs + output | `@strudel/midi` |
| Extras | Microtonal, OSC, serial | `@strudel/xen`, `osc`, `serial` |

**7 Real-Time Visualizers** — All rendered on Canvas 2D at 60fps:

| Visualizer | Description |
|------------|-------------|
| Waveform | Oscilloscope with gradient fill and peak detection |
| Spectrum | Frequency bars with logarithmic distribution |
| Timeline | Beat grid with playhead, level meter, BPM display |
| Piano Roll | DAW-quality (Ableton-style): scrolling notes, velocity colors, piano sidebar, beat grid, timeline pan, velocity drag, click-to-audition, pitch drag |
| Punchcard | Dot grid — size/opacity mapped to velocity |
| Spiral | Rotational display — time = angle, age = radius |
| Pitchwheel | 12-tone circle for harmonic analysis |

**49 Curated Sessions** *(measured 2026-11-15)* — AI-composed pieces across 15 genres (Trance, Techno, Dub Techno, Deep House, Blues, Jazz, Ambient, Lo-Fi, Dub, Retro, Narrative, Deep Work, Drum & Bass, Flamenco, Breakbeat) with filters, search, sort, and category badges.

**219 Code Examples** *(measured 2026-11-15)* — Including interactive controls (`slider`, `onKey`, `createParams`), visualizer demos, MIDI keyboard input, compose mode, synth oscillators, advanced patterns (euclidean, polymetric, FM), and synthesis techniques.

**Sample Library** — Browse 196 Dirt-Samples *(measured 2026-11-15)* served via a pinned first-party manifest (`/samples/dirt-samples.json`) and `/dirt-samples/*` edge proxy (no unconsented third-party network calls), plus drag-and-drop import of local audio files (WAV, MP3, OGG, FLAC, AAC, M4A).

**MIDI Keyboard Input** — Play any MIDI controller (MPK mini, Launchkey, Arturia, etc.) through Strudel synths with `midikeys()`. Map CC knobs to parameters with `midin()`. 19 device profiles *(measured 2026-11-15)* (MPK mini, Launchkey, Arturia, Novation, Korg, M-Audio, and more) with factory CC mappings. Works with any USB MIDI device.

**MIDI Compose Mode** — Play notes on a connected MIDI keyboard and have them convert to Strudel mini-notation in real time inside the editor. Quantize, auto-insert, and build patterns by playing.

**MIDI Learn** — Start Learn from the USB menu, pick which named parameter to map, and move a knob. The CC is captured and applied to a *running* pattern from then on: `createParams()` returns a live reference, so the value changes without re-evaluating. `midin()` remains available for mapping CCs directly in code.

**Input Devices** — Gamepad API (analog sticks, buttons, triggers), MIDI CC value mapping, keyboard bindings via `onKey()`.

**Audio Recording** — Record button in transport bar, exports as WebM (and native WAV save dialog in the desktop app).

**Settings Panel** — 4 editor themes (Signal, Sodium, Scope, Phosphor), font size, vim mode, word wrap, zen mode.

**Solo/Mute** — Ctrl+1..9 to solo a layer, Shift+Ctrl+1..9 to mute one. Both toggle the `_` prefix in your code, which is the mechanism Strudel itself honours (`_$:` returns silence), so the state stays visible in the source.

**Clock Sync (preview)** — Leader election across tabs via BroadcastChannel. Tempo adoption is not implemented yet: the leader is chosen, but followers do not yet lock to its clock.

**Synth Mode** — Virtual on-screen keyboard (2 octaves, QWERTY mapping, velocity from Y position) with oscillator selector (sine/sawtooth/square/triangle), SVG knob controls, and a real-time biquad filter with frequency response curve. Shares the same audio path as the physical MIDI keyboard via `window.__lmcPlayNote`.

**MIDI Panel** — Connected device list with hot-plug detection, live CC grid (one row per CC with name map, value bar, 0–127 readout), clear button, usage hints. Accessible via USB icon in sidebar.

**Code Sharing** — Share via compressed URLs (`lz-string`, with explicit confirmation prompt before evaluating external code), save/load GitHub Gists (ephemeral in-memory PAT on web; encrypted OS Keychain via `safeStorage` + confirmation dialog on desktop), or download code as a `.js` file.

**Console Panel** — In-editor log output with color-coded levels and timestamps.

**Live Coding** — 150ms debounce in live mode for near-instant feedback. Clear button with confirmation dialog.

**Internationalization** — Full DE / EN / ES support (`en` bundled synchronously for SSR hydration; `de` and `es` lazy-loaded on demand).

**Dark Mode ("Signal Room")** — Studio instrument aesthetic powered by OKLCH design tokens, Okabe-Ito CVD-safe engine accents, self-hosted IBM Plex typography, and deterministic SVG-to-raster icon recipes (documented in [`docs/design/README.md`](docs/design/README.md)).

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
| `npm run dev` | Vite dev server (`localhost:5173`) |
| `npm run generate:sitemap` | Regenerates `public/sitemap.xml` (78 routes, measured 2026-11-15) from `SESSIONS_LIBRARY`, `BLOG_POSTS`, and `docSections` |
| `npm run build` | Runs `prebuild` (`scripts/verify-llms-txt.mjs`), `tsc -b`, client Vite build, SSR Vite build, `scripts/prerender.mjs` (all 78 sitemap routes + `dist/404.html`), and `postbuild` (`scripts/inject-sw-version.mjs`) |
| `npm run verify:hydration` | Loads every prerendered route in Chromium and fails on hydration mismatches or console/page errors (`--url <origin>` checks a live deployment) |
| `npm run verify:ai-labels` | Verifies in Chromium that all 49 AI-composed sessions display EU AI Act Art. 50 labels in EN/DE/ES and no route renders unclassified images |
| `npm run sync:changelog` | Regenerates `CHANGELOG.md` from `src/data/changelog-library.ts` |
| `bash scripts/mutate-prerender.sh` | Breaks each prerender mechanism on purpose and checks that its test catches it (needs a clean tree) |
| `npm run test` | Run all unit/integration tests (Vitest 5) |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint (`--max-warnings=0`) |
| `npm run preview` | Preview production build |
| `npx tsc -b` | Type check `src/`. **Not** `--noEmit`: the root tsconfig is solution-style (`files: []` + references) |
| `npx tsc --noEmit -p tsconfig.node.json` | Type check `electron/` and Node configs |
| `npm run electron:dev` | Launch Electron desktop app in development mode |
| `npm run electron:build:mac` | Build, sign, and notarize macOS `.app` (`arm64` + `x64`), `.dmg`, and `-mac.zip` (`afterPack` burns Electron V1 fuses) |
| `npm run finalize:yml` | Rewrites `release/latest-mac.yml` with GitHub-normalized dotted asset names and post-staple SHA-512 hashes |
| `npm run verify:release` | Verifies `/releases/latest` on GitHub against `release/latest-mac.yml` and local SHA-512 / byte sizes |

## Routes

| Path | Page |
|------|------|
| `/` | Landing page with hero, features, and examples (`/landing` redirects `301 -> /`) |
| `/editor` | Main IDE: code editor, node graph, visualizers |
| `/docs` | Documentation hub |
| `/docs/:id` | Individual doc section (14 prerendered routes) |
| `/samples` | Sample library browser |
| `/examples` | Curated code examples per engine |
| `/sessions` | Curated AI-composed pieces — listing |
| `/sessions/:slug` | Individual session piece (49 prerendered routes: code, movements, composer notes) |
| `/changelog` | Project changelog |
| `/blog` | Developer blog — listing |
| `/blog/:slug` | Individual blog post (6 prerendered routes) |
| `/legal` | Impressum & Datenschutz (`/datenschutz` is the privacy tab as its own page; `/impressum` redirects `301 -> /legal`) |
| `*` | Prerendered `404.html` (`NotFound` view, served with HTTP status `404`) |

---

## Architecture

```
Code Editor (source of truth)
    |
    v  150ms debounce (live mode)
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
| i18n | i18next + react-i18next (EN eager, DE/ES lazy-loaded) |
| Persistence | IndexedDB (`idb`) session autosave + crash recovery, `lz-string` share links, Octokit Gists |
| Desktop | Electron 43 (`electron-vite` + `electron-builder`, hardened runtime + `@electron/fuses`) |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Testing | Vitest 5 + Testing Library + Playwright |
| CI & Deploy | GitHub Actions (`.github/workflows/ci.yml`) + Netlify Edge |

### Project Structure

```
electron/           # Native desktop shell (main, preload, IPC handlers, safeStorage Gist store, updater, tray)
src/
  components/
    atoms/          # Button, Icon, Toggle, Badge, Tooltip, NotFound, ErrorBoundary, ...
    molecules/      # EngineSelector, FileTabs, ShareDialog, AchievementToast, ...
    organisms/      # TransportBar, CodeEditor, NodeGraph, SiteNav, Visualizers, ...
  layouts/          # EditorLayout (resizable 3-zone IDE)
  pages/            # Landing, Editor, EditorPage, Docs, Samples, Examples, Sessions, SessionPiece, Changelog, Blog, BlogPost, Legal
  lib/
    orchestrator/   # Multi-engine management + DAG audio graph
    engines/        # Strudel, Tone.js, WebAudio, MIDI adapters
    audio/          # Shared AudioContext, analyser, recorder, first-party defaultSamples
    editor/         # CodeMirror theme, setup, extensions, inline-widgets, 4 themes
    input/          # Gamepad API polling
    midi/           # MIDI input, compose mode, MIDI learn, strudel-keys, device profiles
    parser/         # Code-to-graph extraction (per engine)
    codegen/        # Graph-to-code generation
    visualizers/    # Waveform, spectrum, timeline, pianoroll, punchcard, spiral, pitchwheel
    persistence/    # IndexedDB, URL sharing, GitHub Gist
    store.ts        # Zustand global state
    history.ts      # Undo/redo (100-entry cap)
  data/             # Templates, docs, examples, sessions, sample catalog, midi-devices, blog, changelog
  i18n/             # DE, EN, ES translations + lazy locale loader
  styles/tokens/    # colors.css, typography.css, spacing.css
  types/            # TypeScript type definitions
docs/
  design/           # Signal Room branding, OKLCH color matrix, IBM Plex typography & asset recipes
  research/         # Dated primary-source regulatory & technical verification archives
scripts/            # Prerender, sitemap generator, hydration & AI-label gates, Electron fuse & release scripts
```

---

## Deploy & Known Gotchas

Hosted on [Netlify](https://www.netlify.com/), which builds `main` on every push with `npm run build` (Node 22, see `netlify.toml`), gated by GitHub Actions CI (`.github/workflows/ci.yml`). The build runs `scripts/verify-llms-txt.mjs` first, so a `public/llms.txt` that links a page missing from `public/sitemap.xml` stops the deploy.

Every route in `public/sitemap.xml` (78 routes, generated by `npm run generate:sitemap`) is prerendered into its own static HTML file — `/` as `dist/index.html`, `/docs` as `dist/docs.html`, `/sessions/<slug>` as `dist/sessions/<slug>.html`, `/blog/<slug>` as `dist/blog/<slug>.html`, `/docs/<id>` as `dist/docs/<id>.html` — with its own `<title>`, meta description, Open Graph tags, canonical URL, and single `<h1>`. Unknown paths are served `dist/404.html` with a genuine HTTP `404` status (no Soft-404 SPA fallback). Built-in Dirt-Samples audio files are proxied first-party under `/dirt-samples/*` pinned to upstream commit `c74fc80f8db8038f6a33648ffef5ac00a07ad402`.

**Known gotchas:**
- **Generated files:** `public/sitemap.xml` (`npm run generate:sitemap`) and `CHANGELOG.md` (`npm run sync:changelog`) are generated from `src/data/*` — update the data files and re-run the generator instead of hand-editing the output.
- **Strudel string quotes:** Strudel's transpiler rewrites double-quoted strings (`"..."`) into mini-notation `m("...")`; non-pattern URLs passed inside evaluated Strudel code (such as `samples('/samples/dirt-samples.json', '/dirt-samples/')`) must use single quotes (`'...'`).
- **Desktop builds overwrite `dist/`:** `electron-vite build` writes an unprerendered HashRouter bundle into `dist/`; always re-run `npm run build` if deploying or inspecting web output after a desktop build.

---

## Roadmap

| Status | Feature | Description |
|--------|---------|-------------|
| Done | **MIDI Composition Mode** | Play notes on a connected MIDI keyboard and have them convert to Strudel code in real time inside the editor |
| Done | **MIDI Learn** | Pick a parameter, move a knob, and the CC drives it live |
| Done | **19 MIDI Device Profiles** | Factory CC mappings for MPK mini, Launchkey, Arturia, Novation, Korg, M-Audio, and more |
| Done | **Developer Blog + Changelog** | In-app blog and changelog pages with Markdown rendering |
| Planned | **Strudel Sound Library Browser** | Browse and audition all Strudel sounds (Dirt-Samples, synths, soundfonts) directly from the MIDI keyboard |
| Ongoing | **Democratizing Music Production** | Making algorave/live coding accessible to everyone — professional features delivered as open source, built on years of community contributions |

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
