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

**Code Editor** — CodeMirror 6 with dark theme, multi-tab files, per-engine syntax highlighting, live evaluation, inline `slider()` widgets, and `._pianoroll()` / `._scope()` visualizers rendered directly in the code.

**Interactive Controls** — `slider(value, min, max, step)` creates draggable inline widgets. `onKey()` binds keyboard shortcuts. `createParams()` creates named parameters controllable via MIDI CC.

**Visual Node Graph** — React Flow canvas showing audio routing as draggable, connectable nodes. Auto-derived from code in real time.

**4 Audio Engines + Extensions**

| Engine | Purpose | Package |
|--------|---------|---------|
| Strudel | Pattern-based live coding (mini-notation) | `@strudel/core` + `web` + `draw` |
| Tone.js | High-level synths, effects, transport | `tone` |
| Web Audio | Low-level audio node programming | Native API |
| MIDI | Keyboard input + CC knobs + output | `@strudel/midi` |
| Extras | Microtonal, soundfonts, OSC, serial | `@strudel/xen`, `soundfonts`, `osc`, `serial` |

**7 Real-Time Visualizers** — All rendered on Canvas 2D at 60fps:

| Visualizer | Description |
|------------|-------------|
| Waveform | Oscilloscope with gradient fill and peak detection |
| Spectrum | Frequency bars with logarithmic distribution |
| Timeline | Beat grid with playhead, level meter, BPM display |
| Piano Roll | DAW-quality (Ableton-style): scrolling notes, velocity colors, piano sidebar, beat grid |
| Punchcard | Dot grid — size/opacity mapped to velocity |
| Spiral | Rotational display — time = angle, age = radius |
| Pitchwheel | 12-tone circle for harmonic analysis |

**43 Curated Sessions** — AI-composed pieces across 10 genres (Trance, Techno, Deep House, Blues, Ambient, Lo-Fi, Dub, Retro, Narrative, Deep Work) with filters, search, sort, and category badges.

**200+ Code Examples** — Including interactive controls (slider, onKey, createParams), visualizer demos, MIDI keyboard input, compose mode, synth oscillators, and test patterns.

**Sample Library** — Browse 218 Dirt-Samples with categories, drag-and-drop import of local audio files (WAV, MP3, OGG, FLAC, AAC, M4A).

**MIDI Keyboard Input** — Play any MIDI controller (MPK mini, Launchkey, Arturia, etc.) through Strudel synths with `midikeys()`. Map CC knobs to parameters with `midin()`. 19 device profiles (MPK mini, Launchkey, Arturia, Novation, Korg, M-Audio, and more) with factory CC mappings. Works with any USB MIDI device.

**MIDI Compose Mode** — Play notes on a connected MIDI keyboard and have them convert to Strudel mini-notation in real time inside the editor. Quantize, auto-insert, and build patterns by playing.

**MIDI Learn** — Map any MIDI CC knob or fader to app parameters with a visual learn workflow. Connect hardware to software controls without editing code.

**Input Devices** — Gamepad API (analog sticks, buttons, triggers), MIDI CC value mapping, keyboard bindings via `onKey()`.

**Audio Recording** — Record button in transport bar, exports as WebM.

**Settings Panel** — 4 editor themes (Purple, Amber, Cyan, Matrix), font size, vim mode, word wrap, zen mode.

**Solo/Mute** — Alt+1..9 to solo patterns, Shift+Alt+1..9 to mute. `_$:` prefix in code mutes patterns.

**Clock Sync** — Multi-tab synchronization via BroadcastChannel (leader election, BPM broadcast).

**Synth Mode** — Virtual on-screen keyboard (2 octaves, QWERTY mapping, velocity from Y position) with oscillator selector (sine/sawtooth/square/triangle), SVG knob controls, and a real-time biquad filter with frequency response curve. Shares the same audio path as the physical MIDI keyboard via `window.__lmcPlayNote`.

**MIDI Panel** — Connected device list, real-time CC activity monitor with value bars, usage hints. Accessible via USB icon in sidebar.

**Code Sharing** — Share via compressed URLs (lz-string), save/load GitHub Gists, download code as .js file.

**Console Panel** — In-editor log output with color-coded levels and timestamps.

**Live Coding** — 150ms debounce in live mode for near-instant feedback. Clear button with confirmation dialog.

**Internationalization** — Full DE / EN / ES support.

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
| `/changelog` | Project changelog |
| `/blog` | Developer blog — listing |
| `/blog/:slug` | Individual blog post |
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
  pages/            # Landing, Editor, Docs, Samples, Examples, Sessions, SessionPiece, Changelog, Blog, BlogPost, Legal
  lib/
    orchestrator/   # Multi-engine management + DAG audio graph
    engines/        # Strudel, Tone.js, WebAudio, MIDI adapters
    audio/          # Shared AudioContext, analyser, recorder
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

## Roadmap

| Status | Feature | Description |
|--------|---------|-------------|
| Done | **MIDI Composition Mode** | Play notes on a connected MIDI keyboard and have them convert to Strudel code in real time inside the editor |
| Done | **MIDI Learn** | Map any MIDI CC knob or fader to app parameters with a visual learn workflow |
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
