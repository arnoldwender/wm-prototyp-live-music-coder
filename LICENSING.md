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
| Audio Architecture | `src/lib/audio/context.ts`, `analyzer.ts`, `recorder.ts`, `worklet.ts` | Shared AudioContext, beat detection, recording |
| Engine Orchestrator | `src/lib/orchestrator/` | Multi-engine management, DAG audio graph |
| Engine Adapters | `src/lib/engines/base.ts`, `tonejs.ts`, `webaudio.ts`, `midi.ts` | Tone.js, WebAudio, MIDI adapters |
| Parser/Codegen | `src/lib/parser/`, `src/lib/codegen/` | Code-to-graph and graph-to-code |
| Visualizers | `src/lib/visualizers/` | Canvas 2D waveform, spectrum, timeline |
| Persistence | `src/lib/persistence/` | IndexedDB, URL sharing, GitHub Gist |
| State Management | `src/lib/store.ts`, `src/lib/history.ts` | Zustand store, undo/redo |
| UI Components | `src/components/` | All React components (atoms, molecules, organisms) |
| Layouts | `src/layouts/` | Editor layout |
| Pages | `src/pages/` | Landing, Editor, Docs, Samples, Examples, Legal |
| Data | `src/data/` | Templates, docs, examples, sample catalog |
| Types | `src/types/engine.ts`, `src/types/project.ts` | TypeScript type definitions |
| i18n | `src/i18n/` | Translations (DE/EN/ES) |
| Styles | `src/styles/` | Design tokens and global CSS |
| Workers | `src/workers/` | Web Workers |

### AGPL-only Files (Strudel Integration)

These files import from `@strudel/*` packages and are licensed under AGPL-3.0-or-later:

| File | Purpose |
|------|---------|
| `src/lib/engines/strudel.ts` | Strudel engine adapter |
| `src/lib/audio/strudel-tap.ts` | Strudel audio analysis bridge |
| `src/lib/editor/extensions.ts` | Strudel CodeMirror extensions |
| `src/components/organisms/StrudelEditor.tsx` | Strudel-specific UI |
| `src/types/strudel.d.ts` | Strudel type declarations |

## Copyright

Copyright (c) 2026 Arnold Wender / Wender Media

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
