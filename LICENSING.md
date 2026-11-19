# Licensing

Live Music Coder is a multi-license project. The combined application is distributed under **AGPL-3.0-or-later** due to its dependency on the [Strudel](https://strudel.cc/) live coding library.

## License Structure

### Combined Application — AGPL-3.0-or-later

When distributed or served as a network service, the complete application (all files working together) is governed by the **GNU Affero General Public License v3.0 or later**. See [LICENSE-AGPL](LICENSE-AGPL) for the full text.

This is required because the application integrates `@strudel/*` packages, which are licensed under AGPL-3.0-or-later.

### Original Components — MIT

The following components are **original work by Arnold Wender** and are independently licensed under the **MIT License**. They contain no code from AGPL-licensed dependencies and can function independently. See [LICENSE-MIT](LICENSE-MIT) for the full text.

Files marked with `SPDX-License-Identifier: MIT` may be extracted and used under MIT terms.

**MIT-licensed modules:**

| Module | Path | Description |
|--------|------|-------------|
| Desktop Shell | `electron/` | Electron main process, preload, IPC handlers, encrypted `safeStorage` Gist store, updater, URL guard, WAV encoder, tray, menu |
| Audio Architecture | `src/lib/audio/context.ts`, `analyzer.ts`, `recorder.ts`, `sample-import.ts` | Shared AudioContext, beat detection, recording, local sample import |
| Engine Orchestrator | `src/lib/orchestrator/` | Multi-engine management, DAG audio graph |
| Engine Adapters | `src/lib/engines/base.ts`, `tonejs.ts`, `webaudio.ts`, `midi.ts` | Tone.js, WebAudio, MIDI adapters |
| Parser/Codegen | `src/lib/parser/`, `src/lib/codegen/` | Code-to-graph and graph-to-code |
| Audio Visualizers (non-Strudel) | `src/lib/visualizers/waveform.ts`, `spectrum.ts`, `timeline.ts`, `colors.ts`, `midi-utils.ts` | Canvas 2D waveform, spectrum, timeline, color palette, MIDI utilities |
| Local & URL Persistence | `src/lib/persistence/local.ts`, `graph-layout.ts`, `url.ts` | IndexedDB storage, node graph coordinates, and `lz-string` URL sharing |
| State Management | `src/lib/store.ts`, `src/lib/history.ts` | Zustand store, undo/redo |
| UI Components (non-Strudel) | `src/components/atoms/`, `src/components/molecules/`, `src/components/organisms/` *(except Strudel-coupled organisms listed below)* | Reusable React UI components |
| Layouts | `src/layouts/` | Editor layout |
| Pages | `src/pages/` | Landing, Editor, EditorPage, Docs, Samples, Examples, Sessions, SessionPiece, Changelog, Blog, BlogPost, Legal |
| Data (non-Strudel) | `src/data/` *(except `sessions-library.ts`)* | Templates, docs, examples, sample catalog, MIDI device profiles, blog posts, changelog |
| Types | `src/types/engine.ts`, `src/types/project.ts`, `src/types/global.d.ts`, `src/types/electron.d.ts` | TypeScript type definitions |
| i18n | `src/i18n/` | Translations and lazy locale loader (DE/EN/ES) |
| Styles | `src/styles/` | Design tokens and global CSS |

### AGPL-only Files (Strudel Integration)

These files integrate with `@strudel/*` packages or Strudel pattern/REPL structures and carry `SPDX-License-Identifier: AGPL-3.0-or-later`:

| File | Purpose |
|------|---------|
| `src/lib/engines/strudel.ts` | Strudel engine adapter |
| `src/lib/strudel-extensions.ts` | Lazy registration of Strudel extension packages |
| `src/lib/audio/strudel-tap.ts` | Strudel audio analysis bridge |
| `src/lib/audio/defaultSamples.ts` | First-party Dirt-Samples loader for Strudel |
| `src/lib/audio/fluidSoundfonts.ts` | First-party `FluidR3_GM` (MIT) SoundFont registry & loader for Strudel |
| `src/lib/audio/solo-mute.ts`, `layer-mute.ts` | Strudel `$:` layer solo/mute helpers |
| `src/lib/midi/strudel-keys.ts` | Strudel MIDI keyboard (`midikeys` / `midin`) integration |
| `src/lib/editor/extensions.ts`, `inline-widgets.ts` | Strudel CodeMirror extensions and inline widgets |
| `src/lib/visualizers/repl-source.ts`, `pianoroll.ts`, `punchcard.ts`, `spiral.ts`, `pitchwheel.ts` | Strudel REPL hap-driven Canvas 2D visualizers |
| `src/components/organisms/StrudelEditor.tsx` | Strudel-specific CodeMirror UI |
| `src/components/organisms/PianorollVisualizer.tsx`, `PunchcardVisualizer.tsx`, `SpiralVisualizer.tsx`, `PitchwheelVisualizer.tsx` | Strudel pattern visualizer organisms |
| `src/components/organisms/ExampleGallery.tsx`, `SidePanel.tsx` | Inline Strudel pattern/sample auditioning |
| `src/lib/persistence/gist.ts`, `autosave.ts` | Gist & session autosave helpers coupled to editor state |
| `src/lib/useInlinePlayer.ts`, `useMenuActions.ts` | Inline audio preview and menu evaluation hooks |
| `src/data/sessions-library.ts` | Curated Strudel sessions library |
| `src/types/strudel.d.ts` | Strudel type declarations |

## Copyright

Copyright (c) 2026 [Arnold Wender](https://arnoldwender.com) / [Wender Media](https://www.wendermedia.com)

All original source code in this repository is the intellectual property of Arnold Wender. The MIT license on individual files permits free use, modification, and distribution of those files independently, with attribution.

## How to Use

- **Using the full application**: AGPL-3.0-or-later applies. Source code must be made available.
- **Extracting MIT-licensed files**: If you extract only files marked `SPDX-License-Identifier: MIT` (which have no `@strudel/*` imports), you may use them under MIT terms.
- **Contributing**: Contributions to MIT-licensed files are accepted under MIT. Contributions to AGPL files are accepted under AGPL-3.0-or-later.

## SPDX License Identifiers

Every source file contains an SPDX license identifier in its header comment:

```
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
```

or

```
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media
```

These identifiers are authoritative for per-file licensing.
