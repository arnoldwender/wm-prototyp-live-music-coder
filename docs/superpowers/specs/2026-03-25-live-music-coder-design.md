# Live Music Coder — Design Specification

**Project:** `wm-prototyp-live-music-coder`
**Date:** 2026-03-25
**Status:** Approved

---

## 1. Overview

A polished, browser-based live coding music IDE that combines a code editor with a visual node graph (bidirectional sync). Supports multiple audio engines (Strudel, Tone.js, raw Web Audio API, MIDI output). Features a full visual dashboard with audio visualizers and an audio-reactive mascot ecosystem called Beatlings. Accessible to beginners, powerful for expert live coders.

**Target audience:** Broad — beginners learning music coding through experts performing Algorave sets.

**Deployment:** Netlify (static SPA)
**Domain:** TBD (following `wm-prototyp-*` convention)

---

## 2. Architecture

### Approach: Hybrid (Strudel core + custom orchestration layer)

- Use `@strudel/core` for pattern evaluation (battle-tested pattern math)
- Build a custom **engine orchestrator** that routes patterns to Strudel, Tone.js, or raw Web Audio based on user choice
- Build the node graph as a **visual abstraction over the orchestrator** — nodes represent engine blocks, code generates/reads from the same orchestrator state
- Bidirectional sync lives in the orchestrator layer, not tangled with any single engine

### Project Structure

```
wm-prototyp-live-music-coder/
├── src/
│   ├── components/
│   │   ├── atoms/              # Button, Icon, Slider, Knob, Toggle, Badge, Tooltip
│   │   ├── molecules/          # ToolbarGroup, NodePort, MiniVisualizer, TabBar, EngineSelector
│   │   └── organisms/          # CodeEditor, NodeGraph, TransportBar, VisualizerPanel,
│   │                           # SignalFlowDiagram, PatternTimeline, MixerPanel, GistDialog,
│   │                           # BeatlingPanel, CollectionPanel
│   ├── layouts/                # EditorLayout (configurable panel arrangement)
│   ├── pages/                  # Editor, Landing, Docs/Help
│   ├── lib/
│   │   ├── store.ts            # Zustand — global app state
│   │   ├── history.ts          # Undo/redo (code + node changes, 100-entry cap)
│   │   ├── orchestrator/       # THE CORE
│   │   │   ├── index.ts        # Engine orchestrator — routes patterns to engines
│   │   │   ├── types.ts        # Shared types: EngineBlock, Connection, Parameter
│   │   │   ├── graph.ts        # Directed graph model (nodes + edges)
│   │   │   └── sync.ts         # Bidirectional sync: code <-> graph <-> audio
│   │   ├── engines/
│   │   │   ├── strudel.ts      # @strudel/core + @strudel/webaudio adapter
│   │   │   ├── tonejs.ts       # Tone.js adapter
│   │   │   ├── webaudio.ts     # Raw Web Audio API adapter
│   │   │   └── midi.ts         # WebMIDI output adapter
│   │   ├── codegen/            # Node graph -> code generation (per engine templates)
│   │   ├── parser/             # Code -> node graph parsing (pattern matching, not full AST)
│   │   ├── persistence/
│   │   │   ├── local.ts        # IndexedDB autosave (every 10s + on change)
│   │   │   ├── url.ts          # URL hash encode/decode (lz-string compression)
│   │   │   └── gist.ts         # GitHub Gist API integration (octokit)
│   │   ├── audio/
│   │   │   ├── analyzer.ts     # FFT, waveform, level metering via AnalyserNode
│   │   │   └── recorder.ts     # Record output to WAV/MP3
│   │   └── beatlings/          # Mascot ecosystem (see §5)
│   │       ├── species.ts      # 6 species definitions + spawn triggers
│   │       ├── evolution.ts    # XP system, stage transitions, mutations
│   │       ├── collection.ts   # Achievement tracking, gallery data
│   │       ├── brain/          # Copied + adapted from wm-lifegame
│   │       │   ├── neuron.ts
│   │       │   ├── synapse.ts
│   │       │   └── neural-network.ts
│   │       ├── gol-brain.ts    # Conway's Game of Life grid with audio-reactive injection
│   │       ├── audio-bridge.ts # Connects audio analyzer to both brains
│   │       └── renderer.ts     # Canvas 2D: GoL grid + creatures + neural overlay
│   ├── i18n/                   # DE/EN/ES translations
│   ├── styles/
│   │   ├── global.css
│   │   └── tokens/             # Design tokens (colors, spacing, typography)
│   ├── types/                  # TypeScript definitions
│   ├── workers/                # Web Workers (audio analysis, pattern eval, GoL, neural)
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── samples/                # Default sample library (kicks, snares, hats, etc.)
├── docs/
│   └── superpowers/specs/      # This spec
├── package.json
├── vite.config.ts
├── tsconfig.json
├── netlify.toml
└── CLAUDE.md
```

---

## 3. The Orchestrator & Engine System

### EngineBlock

The fundamental unit of the audio graph. Represents a node in both the code and the visual node graph.

```typescript
interface EngineBlock {
  id: string
  engine: 'strudel' | 'tonejs' | 'webaudio' | 'midi'
  type: 'source' | 'effect' | 'output'
  code: string
  params: Record<string, ParamValue>
  inputs: PortDefinition[]
  outputs: PortDefinition[]
}
```

### Engine Adapter Interface

All engines implement this common interface. The orchestrator is engine-agnostic.

```typescript
interface EngineAdapter {
  name: string
  init(): Promise<void>
  createNode(block: EngineBlock): AudioNodeWrapper
  connect(source: AudioNodeWrapper, target: AudioNodeWrapper): void
  disconnect(source: AudioNodeWrapper, target: AudioNodeWrapper): void
  start(): void
  stop(): void
  dispose(): void
  getAnalyserNode(): AnalyserNode
}
```

### Bidirectional Sync

```
Code Editor  ──user types──>  Orchestrator  ──push changes──>  Node Graph
Code Editor  <──push code───  Orchestrator  <──user drags───   Node Graph
```

- **Code -> Graph:** Lightweight parser extracts block declarations, connections, and parameters from code. Pattern matching on known structures (Strudel patterns, Tone.js constructors, Web Audio node creation). Not a full AST.
- **Graph -> Code:** Code generator produces readable, formatted code from graph model. Each engine adapter has its own codegen template.
- **Conflict resolution:** Last-write-wins. No simultaneous editing of both views.

### Audio Routing

All engines ultimately output to Web Audio API (Strudel uses it under the hood). This enables:
- One shared `AudioContext`
- One master output node (with gain/compressor)
- Visualizers can tap into the audio graph at any point
- Cross-engine connections (Strudel pattern -> Tone.js effect -> Web Audio output)

---

## 4. UI Layout

### Main Workspace

```
┌──────────────────────────────────────────────────────────────┐
│  Toolbar  [Play] [Stop] [Rec] [BPM: 120] [Engine]           │
│  [Undo] [Redo] [Share] [Gist] [Settings] [Lang]             │
├────────────────────────────────┬─────────────────────────────┤
│                                │                             │
│       CODE EDITOR              │       NODE GRAPH            │
│    (CodeMirror 6)              │      (React Flow)           │
│                                │                             │
│  Tabs: [drums.js] [melody] +  │  Draggable engine blocks    │
│  Per-engine syntax/complete    │  Color-coded by engine      │
│  Hot reload on next cycle      │  Double-click -> edit code  │
│                                │                             │
├────────────────────────────────┴─────────────────────────────┤
│                   VISUALIZER DASHBOARD                        │
│  [Waveform] [Spectrum] [Pattern Timeline] [Beatling World]   │
│  Each panel toggleable, Beatling expandable to full-width    │
├──────────────────────────────────────────────────────────────┤
│  Status: Engine | CPU | Creatures | Console | Collection     │
└──────────────────────────────────────────────────────────────┘
```

### Panel Behavior

- All panels resizable via drag handles
- Code editor + Node graph can swap or go full-width
- Visualizer panels individually toggleable
- Beatling panel expandable to full-width (immersive mode)
- Mobile: stacked layout, node graph in slide-out drawer
- Keyboard shortcuts to cycle panel focus

### Code Editor

- CodeMirror 6 (lighter than Monaco, better mobile support)
- Multi-tab files that play simultaneously (drums + bass + melody = full track)
- Per-engine syntax highlighting + autocomplete
- Live error indicators with audio-safe error handling (bad code does not crash audio)
- Line-level hot reload — edit a line, hear the change on next cycle

### Node Graph

- React Flow
- Node types: Source (oscillator, sample), Effect (filter, delay), Output (speaker, MIDI)
- Color-coded: Strudel=purple, Tone.js=blue, Web Audio=green, MIDI=orange
- Double-click node opens its code in editor (bidirectional link)
- Minimap in corner for complex graphs

---

## 5. Beatling Ecosystem

### Concept

An audio-reactive mascot ecosystem living in a switchable visualizer panel. Six pixel-art creature species with a dual-brain system: neural network (adapted from wm-lifegame) + Conway's Game of Life cellular automaton. Creatures spawn based on musical activity, evolve over time, and are collectible.

### 6 Species

| Species | Role | Spawns When | Visual Style |
|---|---|---|---|
| **Beatling** | Rhythm/percussion | Drums, kicks, snares active | Chunky, bouncy, pulses on beat |
| **Looplet** | Pattern loops | Repeating patterns (>4 cycles) | Circular motion, trails, orbits |
| **Synthling** | Melodic synths | Synth oscillators playing | Fluid, color-shifting, ethereal |
| **Glitchbit** | Noise/distortion | Effects heavy, bitcrush, distortion | Pixelated, glitchy, fragmented |
| **Wavelet** | Bass/sub frequencies | Low-frequency content (<200Hz) | Wavy, liquid, slow undulations |
| **Codefly** | Code activity | User typing/editing code | Firefly glow, swarm behavior |

### Dual-Brain System

#### Neural Network (from wm-lifegame)

Copied and adapted from:
- `src/brain/neuron.ts` — neuron model (activation, threshold, decay)
- `src/brain/synapse.ts` — Hebbian learning + STDP
- `src/brain/neural-network.ts` — network growth, pruning (capped at ~40 neurons for performance)
- `src/creature/soul.ts` — stripped to: neural update, consciousness Phi, behavior modulation

**Important:** Code is COPIED into this project, not imported. wm-lifegame is not modified.

#### Conway's Game of Life Grid

New code. A GoL grid that receives audio-reactive cell injections:

| Audio Feature | GoL Effect |
|---|---|
| Beat/kick | Inject live cells in pulse pattern |
| Low frequency | Spawn glider patterns |
| High frequency | Spawn oscillator patterns |
| Volume | More cells per tick |
| Silence | Natural decay toward stillness |
| Tempo (BPM) | GoL tick rate syncs to BPM |

### Audio -> Brain Mapping

| Audio Feature | Neural Effect | Behavioral Effect |
|---|---|---|
| Beat detection | Motor neurons fire | Creature jumps/dances |
| Frequency bands | Different neuron clusters activate | Movement patterns change |
| Volume/amplitude | Overall activation rate increases | More energetic behavior |
| Musical complexity | Consciousness Phi rises | More expressive, nuanced behavior |
| Silence | Neurons calm | Creature sleeps/dreams |

### Evolution System

Each creature accumulates XP from three sources:
- **Audio XP** — sustained music (volume x time)
- **Complexity XP** — musical complexity accelerates growth
- **Interaction XP** — cross-species proximity triggers evolution

**Stages:** Egg -> Baby -> Adult -> Elder -> Ascended

Visual mutations at each stage (color, size, glow, appendages). Ascended creatures dissolve into the GoL grid — they become part of the cellular automaton.

### Collection System

- Creatures persist across sessions (IndexedDB, separate store from projects)
- Collection panel: gallery of all discovered species + evolution stages
- Achievement triggers: "First Beatling", "Full Ecosystem" (all 6 active), "Ascended One", "Silence Master" (creature dreams 60s)
- Export: share collection as badge/image

### Inter-Species Interactions

| Interaction | Effect |
|---|---|
| Beatling + Looplet | Looplet orbits Beatling in rhythm |
| Synthling + Wavelet | Colors blend, harmonic resonance glow |
| Glitchbit + anyone | Nearby creatures glitch momentarily |
| Codefly swarm | Illuminate creature closest to active code |
| All 6 present | GoL enters "harmony mode" — emergent large-scale patterns |

### Visual Layers (Canvas 2D)

1. **GoL grid** — background, cells colored by frequency band mapping
2. **Beatling creatures** — pixel art, animated, center of panel
3. **Neural overlay** — optional, glowing neuron/synapse connections around creatures

---

## 6. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React 19 + TypeScript | Matches icon generator |
| Bundler | Vite 8 | Fast HMR, same stack |
| Styling | Tailwind CSS 4 | Consistent with workspace |
| State | Zustand 5 | Proven in icon generator |
| Code Editor | CodeMirror 6 | Lighter than Monaco, mobile-friendly |
| Node Graph | React Flow | Most mature React node-based UI lib |
| Audio: Patterns | @strudel/core + @strudel/webaudio | Real Strudel engine |
| Audio: Synths | Tone.js | Best high-level Web Audio wrapper |
| Audio: Low-level | Web Audio API (native) | Raw browser API |
| Audio: MIDI | WebMidi.js | Clean WebMIDI wrapper |
| Visualizers | Canvas 2D | Same as Thronglets, performant |
| Audio analysis | Web Audio AnalyserNode | Native FFT |
| Routing | React Router DOM 7 | Matches icon generator |
| i18n | i18next + react-i18next | DE/EN/ES, matches stack |
| Persistence | idb (IndexedDB wrapper) | Lightweight, Promise-based |
| URL sharing | lz-string | Compress code into URL hash |
| Gist API | octokit/rest | Official GitHub API client |
| Animation | Framer Motion 12 | UI transitions |
| Icons | Lucide React | Consistent with stack |
| Recording | lamejs + MediaRecorder | MP3/WAV export |

### Not Needed

- No backend/server — pure SPA
- No auth system — Gist uses user-provided GitHub PAT
- No database — IndexedDB only
- No SSR/Next.js — Vite SPA on Netlify

### Performance Strategy

- **Web Workers** for: Strudel pattern eval, GoL grid computation, neural network updates, FFT analysis
- **requestAnimationFrame** for: all Canvas 2D rendering
- **AudioWorklet** for: custom audio processing (Web Audio engine)
- **Lazy loading** for: Tone.js, node graph panel, Gist integration
- **Code splitting** by engine — load only what's used

---

## 7. Data Model

### Project

```typescript
interface Project {
  id: string
  name: string
  version: 1
  created: number
  updated: number
  bpm: number
  activeEngine: 'strudel' | 'tonejs' | 'webaudio' | 'midi'
  files: ProjectFile[]
  graph: {
    nodes: EngineBlock[]
    edges: Connection[]
    viewport: { x: number, y: number, zoom: number }
  }
  layout: PanelLayout
  ecosystem: {
    creatures: BeatlingState[]
    golGrid: boolean[][]
    collection: Achievement[]
  }
}

interface ProjectFile {
  id: string
  name: string
  engine: EngineType
  code: string
  active: boolean
}

interface BeatlingState {
  id: string
  species: 'beatling' | 'looplet' | 'synthling' | 'glitchbit' | 'wavelet' | 'codefly'
  stage: 'egg' | 'baby' | 'adult' | 'elder' | 'ascended'
  xp: { audio: number, complexity: number, interaction: number }
  brain: NeuralSnapshot
  position: { x: number, y: number }
  color: string
  born: number
}
```

### Persistence Layers

| Layer | Storage | Trigger | Data |
|---|---|---|---|
| Autosave | IndexedDB | Every 10s + on change | Full project state |
| Undo/Redo | In-memory (Zustand) | Every action | Diff snapshots, 100-entry cap |
| URL share | URL hash | User clicks Share | Code + BPM + engine (compressed) |
| Gist save | GitHub Gist API | User clicks Save to Gist | Full project JSON |
| Gist load | GitHub Gist API | User pastes Gist URL/ID | Full project JSON |
| Collection | IndexedDB (separate) | On evolution/achievement | Global across all projects |
| Audio export | File download | User stops recording | WAV or MP3 |

### URL Sharing

```
https://live-music-coder.com/#code=eNpTKs8vyklR...
```

Encodes code files + BPM + engine selection only. No ecosystem or graph state.

### Gist Integration

- No OAuth app — user provides GitHub Personal Access Token (localStorage, only sent to GitHub API)
- Save: creates Gist with `project.json` + individual code files as separate Gist files
- Load: fetch Gist by URL or ID, parse project JSON
- Update: overwrite existing Gist

---

## 8. Design Aesthetic

- **Dark mode** primary (dashboard/IDE aesthetic)
- **Design tokens** via CSS custom properties (per CLAUDE.md rules)
- **Color palette:** Dark zinc/slate base, purple accent (Strudel), blue (Tone.js), green (Web Audio), orange (MIDI)
- **Typography:** Monospace for code (JetBrains Mono or Fira Code), sans-serif for UI (Inter or Geist Sans)
- **Atomic Design:** atoms/molecules/organisms hierarchy
- **Semantic HTML** throughout
- **Accessibility:** WCAG AA contrast, keyboard navigation, screen reader support for non-visual elements

---

## 9. i18n Strategy

Three languages from the start: DE/EN/ES (matching icon generator and workspace convention).

Scope:
- All UI labels, tooltips, status messages
- Landing page content
- Help/documentation pages
- Achievement names and descriptions
- Error messages

NOT translated:
- Code syntax (English only — `note()`, `s()`, etc.)
- Engine-specific terminology (common across all languages)
- Sample names

---

## 10. Scope Boundaries

### In scope (v1)

- Code editor with multi-tab, per-engine syntax
- Node graph with bidirectional code sync
- 4 engine adapters (Strudel, Tone.js, Web Audio, MIDI)
- Visualizer dashboard (waveform, spectrum, pattern timeline, Beatling ecosystem)
- 6 Beatling species with dual-brain, evolution, collection
- IndexedDB autosave + URL sharing + Gist save/load
- Audio recording (WAV/MP3)
- i18n DE/EN/ES
- Dark mode
- Responsive (desktop primary, mobile-friendly)
- Netlify deployment

### Out of scope (future)

- Collaborative real-time editing
- User accounts / cloud backend
- Plugin/extension system for community engines
- Video recording of sessions
- Integration with DAWs beyond MIDI
- AI-assisted music generation
- Social features (sharing, likes, comments)
