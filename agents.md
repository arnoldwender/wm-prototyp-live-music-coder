# agents.md — AI Agent Instructions

## Project

**wm-prototyp-live-music-coder** — Browser-based live coding music IDE with code editor, visual node graph, 4 audio engines, visualizers, and Beatling mascot ecosystem. 122 source files, 104 tests, 8 routes.

**Live:** <https://live-music-coder.pro>

## What This Project Does

Users write code in the browser to create music in real time. The app supports 4 audio engines (Strudel patterns, Tone.js synths, raw Web Audio API, MIDI output). A visual node graph shows the audio routing. Canvas 2D visualizers (waveform, spectrum, timeline) react to the audio via superdough audio tap. Audio-reactive creatures called Beatlings spawn and evolve based on what the user plays. Additional pages provide a sample library, curated code examples, documentation, and legal pages.

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 8
- Zustand 5 (state), Tailwind CSS 4 (styling), CodeMirror 6 (editor), React Flow (node graph)
- @strudel/core (patterns), Tone.js (synths), Web Audio API, WebMidi.js
- Canvas 2D (visualizers + Beatlings), i18next (DE/EN/ES)
- idb (IndexedDB), lz-string (URL sharing), @octokit/rest (Gist)
- Vitest (104 tests, 19 files), Netlify (deployment)

## Key Architecture Decisions

1. **Code editor is source of truth** — the node graph is derived from code, not the other way around
2. **Engine orchestrator** — single shared AudioContext, engine adapters behind a common interface
3. **Atomic Design** — atoms import nothing, molecules import atoms, organisms import molecules
4. **Design tokens** — CSS custom properties for all colors/spacing/typography (Canvas 2D uses literal hex from VIZ_COLORS)
5. **Beatling brains** — adapted from wm-lifegame (neuron, synapse, neural-network), capped at 40 neurons per creature

## File Organization

- `src/components/{atoms,molecules,organisms}/` — UI components
- `src/lib/orchestrator/` — engine routing + AudioGraph (DAG)
- `src/lib/engines/` — Strudel, Tone.js, WebAudio, MIDI adapters
- `src/lib/editor/` — CodeMirror setup, theme, evaluator
- `src/lib/parser/` — code-to-graph extraction
- `src/lib/codegen/` — graph-to-code generation
- `src/lib/audio/` — shared AudioContext, analyzer, recorder
- `src/lib/beatlings/` — mascot ecosystem (brain, GoL, species, evolution, renderer)
- `src/lib/persistence/` — IndexedDB, URL sharing, Gist
- `src/lib/visualizers/` — Canvas 2D drawing functions
- `src/data/` — templates, docs, sample-library, example-library, legal content
- `src/pages/` — Landing, Editor, Docs, Samples, Examples, Legal
- `src/types/strudel.d.ts` — superdough and @strudel/* type declarations
- `src/workers/` — Web Worker for Beatling brain computation

## Routes (8)

- `/` → Landing page
- `/editor` → Main IDE
- `/docs` → Documentation hub
- `/docs/:sectionId` → Individual doc section
- `/samples` → Sample library browser
- `/examples` → Curated code examples
- `/legal` → Impressum, Datenschutz, Lizenzen

## Rules

- NEVER hardcode colors or spacing — use design tokens
- NEVER modify files in wm-lifegame — brain code was copied, not linked
- This is Vite + React SPA — NOT Next.js
- Dark mode only
- Commits: `[Action] Brief description` — no co-author tags
- AGPL-3.0 license (due to Strudel dependency)
