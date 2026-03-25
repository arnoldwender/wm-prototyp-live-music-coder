# Phase 1: Core Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the project with Vite + React 19 + TypeScript, set up design tokens, Zustand store, i18n, routing, resizable panel layout, and test infrastructure. After this phase, the app renders an empty IDE shell with working panels, dark mode, and language switching.

**Architecture:** Vite SPA with Atomic Design component hierarchy (atoms/molecules/organisms), Zustand for state, CSS custom properties for design tokens, i18next for DE/EN/ES translations.

**Tech Stack:** React 19, Vite 8, TypeScript, Zustand 5, Tailwind CSS 4, React Router DOM 7, i18next, react-i18next, Framer Motion 12, Lucide React, Vitest, @testing-library/react

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md` (Sections 2, 4, 8, 9, 10)

---

## File Structure (Phase 1)

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx              # Reusable button with variants (primary, secondary, ghost, icon)
│   │   ├── Icon.tsx                # Lucide icon wrapper with size/color tokens
│   │   ├── Toggle.tsx              # On/off toggle for panel visibility
│   │   ├── Badge.tsx               # Engine/status badge component
│   │   ├── Tooltip.tsx             # Hover tooltip with i18n text
│   │   └── index.ts                # Barrel export
│   ├── molecules/
│   │   ├── ToolbarGroup.tsx        # Grouped toolbar buttons with separator
│   │   ├── EngineSelector.tsx      # Dropdown to select default engine
│   │   ├── LanguageSwitcher.tsx    # DE/EN/ES language dropdown
│   │   └── index.ts                # Barrel export
│   └── organisms/
│       ├── TransportBar.tsx        # Play/Stop/Rec/BPM controls (UI only, no audio yet)
│       ├── StatusBar.tsx           # Bottom status: engine, CPU placeholder, console
│       └── index.ts                # Barrel export
├── layouts/
│   └── EditorLayout.tsx            # Resizable 3-zone layout: top (editor+graph), middle (visualizers), bottom (status)
├── pages/
│   ├── Editor.tsx                  # Main IDE page composing EditorLayout
│   └── Landing.tsx                 # Placeholder landing page
├── lib/
│   ├── store.ts                    # Zustand store: layout state, transport state, engine selection, i18n
│   ├── history.ts                  # Undo/redo manager (100-entry cap, action-based)
│   └── constants.ts                # App-wide constants (engine names, default BPM, panel sizes)
├── i18n/
│   ├── index.ts                    # i18next initialization
│   └── locales/
│       ├── de.json                 # German translations
│       ├── en.json                 # English translations
│       └── es.json                 # Spanish translations
├── styles/
│   ├── global.css                  # Tailwind directives + base styles
│   └── tokens/
│       ├── colors.css              # Color tokens (dark zinc/slate, engine accent colors)
│       ├── typography.css          # Font tokens (JetBrains Mono, Inter)
│       ├── spacing.css             # 8px-based spacing scale
│       └── index.css               # Imports all token files
├── types/
│   ├── project.ts                  # Project, ProjectFile, EngineType, PanelLayout types
│   ├── engine.ts                   # EngineBlock, Connection, EngineAdapter interface
│   └── beatling.ts                 # BeatlingState, Species, Stage types (data model only)
├── App.tsx                         # Router setup (Landing, Editor routes)
└── main.tsx                        # Entry point (i18n init, React render)

public/
└── fonts/                          # JetBrains Mono, Inter (self-hosted)

vite.config.ts                      # Vite + React + Tailwind + Vitest config
tsconfig.json                       # TypeScript config
tsconfig.app.json                   # App source TS config
tsconfig.node.json                  # Build tool TS config
netlify.toml                        # Netlify SPA config (redirects)
CLAUDE.md                           # Project-specific AI instructions
```

---

### Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`
- Create: `netlify.toml`, `.gitignore`, `CLAUDE.md`

- [ ] **Step 1: Initialize Vite project**

```bash
cd /Users/arnold/Development/wm-prototyp-live-music-coder
npm create vite@latest . -- --template react-ts
```

Select: React, TypeScript. Accept overwrite prompts for existing files.

- [ ] **Step 2: Install core dependencies**

```bash
npm install react-router-dom@7 zustand@5 i18next react-i18next framer-motion@12 lucide-react @tailwindcss/vite
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/react @types/react-dom
```

- [ ] **Step 4: Configure Vite with Tailwind and Vitest**

Replace `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 5: Create test setup file**

Create `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Create Netlify config**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 7: Create .gitignore**

Append to `.gitignore` (Vite template creates one, extend it):

```
.env*.local
dist/
*.tgz
```

- [ ] **Step 8: Create CLAUDE.md**

Create `CLAUDE.md`:

```markdown
# wm-prototyp-live-music-coder

## Overview
Browser-based live coding music IDE with code editor, visual node graph, 4 audio engines, and Beatling mascot ecosystem.

## Tech Stack
- React 19 + TypeScript + Vite 8
- Zustand 5 (state), Tailwind CSS 4 (styling)
- CodeMirror 6 (editor), React Flow (node graph)
- @strudel/core (patterns), Tone.js (synths), Web Audio API, WebMidi.js
- i18next (DE/EN/ES), Vitest (testing)

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — TypeScript + Vite build
- `npm run test` — Vitest
- `npm run test:watch` — Vitest watch mode

## Architecture
- Code editor is source of truth; node graph is derived view
- Engine orchestrator routes audio to Strudel/Tone.js/WebAudio/MIDI adapters
- All engines share one AudioContext
- Atomic Design: atoms/ → molecules/ → organisms/
- Design tokens via CSS custom properties (NEVER hardcode colors/spacing)

## Conventions
- Colocated tests: `foo.test.ts` next to `foo.ts`
- Barrel exports via `index.ts` per component directory
- i18n keys: `namespace.section.key` format
- This is Vite + React SPA — NOT Next.js. No server components, no "use client".
```

- [ ] **Step 9: Add test script to package.json**

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 10: Verify scaffold works**

```bash
npm run dev
```

Expected: Vite dev server starts, default React page renders at localhost:5173.

- [ ] **Step 11: Run tests to verify test infra**

```bash
npm run test
```

Expected: "No test files found" or similar (no tests yet, but Vitest runs without errors).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "[Init] Scaffold Vite + React 19 + TypeScript project with Tailwind, Zustand, i18n, Vitest"
```

---

### Task 2: Design tokens

**Files:**
- Create: `src/styles/tokens/colors.css`, `src/styles/tokens/typography.css`, `src/styles/tokens/spacing.css`, `src/styles/tokens/index.css`
- Modify: `src/styles/global.css` (replace Vite default)

- [ ] **Step 1: Create color tokens**

Create `src/styles/tokens/colors.css`:

```css
/* Engine accent colors */
:root {
  --color-strudel: #a855f7;
  --color-strudel-dim: #7c3aed;
  --color-tonejs: #3b82f6;
  --color-tonejs-dim: #2563eb;
  --color-webaudio: #22c55e;
  --color-webaudio-dim: #16a34a;
  --color-midi: #f97316;
  --color-midi-dim: #ea580c;

  /* Base palette — dark mode */
  --color-bg: #09090b;
  --color-bg-alt: #18181b;
  --color-bg-elevated: #27272a;
  --color-bg-hover: #3f3f46;
  --color-border: #3f3f46;
  --color-border-dim: #27272a;
  --color-text: #fafafa;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  --color-primary: #a855f7;
  --color-primary-hover: #9333ea;
  --color-error: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
}
```

- [ ] **Step 2: Create typography tokens**

Create `src/styles/tokens/typography.css`:

```css
:root {
  --font-family-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-base: 1.5;
  --line-height-loose: 1.75;
}
```

- [ ] **Step 3: Create spacing tokens**

Create `src/styles/tokens/spacing.css`:

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);

  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 500ms ease;
}
```

- [ ] **Step 4: Create token index**

Create `src/styles/tokens/index.css`:

```css
@import './colors.css';
@import './typography.css';
@import './spacing.css';
```

**Note on Tailwind + CSS tokens:** Components use `style={{ ... }}` with `var(--token)` for dynamic values (colors, spacing) rather than Tailwind arbitrary values like `px-[var(--space-3)]`. Tailwind classes are used for layout (`flex`, `items-center`, `gap-2`) and responsive behavior. This avoids Tailwind's build-time resolution issues with runtime CSS variables. For font-weight ambiguity, always use `style` prop.

- [ ] **Step 5: Create global.css**

Replace `src/styles/global.css` (or `src/index.css` from scaffold):

```css
@import "tailwindcss";
@import './tokens/index.css';

/* Base styles */
html {
  color-scheme: dark;
}

body {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text);
  background-color: var(--color-bg);
  margin: 0;
  overflow: hidden;
  height: 100vh;
}

#root {
  height: 100%;
}

/* Code elements always use mono */
code, pre, .cm-editor {
  font-family: var(--font-family-mono);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-bg-hover);
  border-radius: var(--radius-full);
}
```

- [ ] **Step 6: Update main.tsx to import global.css**

```typescript
import './styles/global.css';
```

Remove any existing Vite default CSS imports.

- [ ] **Step 7: Verify tokens render**

```bash
npm run dev
```

Expected: Dark background (#09090b), light text, no default Vite styling.

- [ ] **Step 8: Commit**

```bash
git add src/styles/
git commit -m "[Style] Add design tokens — colors, typography, spacing, dark mode base"
```

---

### Task 3: TypeScript type definitions

**Files:**
- Create: `src/types/project.ts`, `src/types/engine.ts`, `src/types/beatling.ts`

- [ ] **Step 1: Create engine types**

Create `src/types/engine.ts`:

```typescript
/* Audio engine identifiers */
export type EngineType = 'strudel' | 'tonejs' | 'webaudio' | 'midi';

/* Parameter value — a knob/slider value with metadata */
export interface ParamValue {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
}

/* Port on an engine block for audio connections */
export interface PortDefinition {
  id: string;
  label: string;
  type: 'audio' | 'data' | 'midi';
}

/* A single node in the audio graph */
export interface EngineBlock {
  id: string;
  engine: EngineType;
  type: 'source' | 'effect' | 'output';
  code: string;
  params: Record<string, ParamValue>;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

/* A connection between two engine blocks */
export interface Connection {
  id: string;
  sourceBlockId: string;
  sourcePortId: string;
  targetBlockId: string;
  targetPortId: string;
}

/* Wrapper around a Web Audio node for engine-agnostic handling */
export interface AudioNodeWrapper {
  id: string;
  blockId: string;
  node: AudioNode;
  analyser?: AnalyserNode;
}

/* Common interface all engine adapters implement */
export interface EngineAdapter {
  name: string;
  init(): Promise<void>;
  createNode(block: EngineBlock): AudioNodeWrapper;
  connect(source: AudioNodeWrapper, target: AudioNodeWrapper): void;
  disconnect(source: AudioNodeWrapper, target: AudioNodeWrapper): void;
  start(): void;
  stop(): void;
  dispose(): void;
  getAnalyserNode(): AnalyserNode;
  getAnalyserForBlock(blockId: string): AnalyserNode;
}
```

- [ ] **Step 2: Create project types**

Create `src/types/project.ts`:

```typescript
import type { EngineType, EngineBlock, Connection } from './engine';
import type { BeatlingState, Achievement } from './beatling';

/* Layout configuration for resizable panels */
export interface PanelLayout {
  editorWidth: number;
  graphWidth: number;
  visualizerHeight: number;
  visiblePanels: {
    waveform: boolean;
    spectrum: boolean;
    timeline: boolean;
    beatlings: boolean;
  };
}

/* A single code file in the project */
export interface ProjectFile {
  id: string;
  name: string;
  engine: EngineType;
  code: string;
  active: boolean;
}

/* Full project state — everything that gets saved */
export interface Project {
  id: string;
  name: string;
  version: 1;
  created: number;
  updated: number;
  bpm: number;
  defaultEngine: EngineType;
  files: ProjectFile[];
  graph: {
    nodes: EngineBlock[];
    edges: Connection[];
    viewport: { x: number; y: number; zoom: number };
  };
  layout: PanelLayout;
  ecosystem: {
    creatures: BeatlingState[];
    golGrid: {
      width: number;
      height: number;
      liveCells: [number, number][];
    };
    collection: Achievement[];
  };
}
```

- [ ] **Step 3: Create beatling types**

Create `src/types/beatling.ts`:

```typescript
/* The 6 Beatling species */
export type Species =
  | 'beatling'
  | 'looplet'
  | 'synthling'
  | 'glitchbit'
  | 'wavelet'
  | 'codefly';

/* Evolution stages */
export type Stage = 'egg' | 'baby' | 'adult' | 'elder' | 'ascended';

/* Serializable snapshot of a neural network state */
export interface NeuralSnapshot {
  neurons: {
    id: string;
    activation: number;
    threshold: number;
    type: 'sensory' | 'motor' | 'emotional' | 'cognitive';
  }[];
  synapses: {
    sourceId: string;
    targetId: string;
    weight: number;
  }[];
  phi: number;
}

/* State of a single Beatling creature */
export interface BeatlingState {
  id: string;
  species: Species;
  stage: Stage;
  xp: {
    audio: number;
    complexity: number;
    interaction: number;
  };
  brain: NeuralSnapshot;
  position: { x: number; y: number };
  color: string;
  born: number;
}

/* Unlockable achievements */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number | null;
}
```

- [ ] **Step 4: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/
git commit -m "[Types] Add TypeScript definitions — Project, Engine, Beatling data models"
```

---

### Task 4: i18n setup (DE/EN/ES)

**Files:**
- Create: `src/i18n/index.ts`, `src/i18n/locales/en.json`, `src/i18n/locales/de.json`, `src/i18n/locales/es.json`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create English translations**

Create `src/i18n/locales/en.json`:

```json
{
  "app": {
    "name": "Live Music Coder",
    "tagline": "Code music. See it live."
  },
  "transport": {
    "play": "Play",
    "stop": "Stop",
    "record": "Record",
    "bpm": "BPM"
  },
  "toolbar": {
    "undo": "Undo",
    "redo": "Redo",
    "share": "Share",
    "gist": "Save to Gist",
    "settings": "Settings",
    "language": "Language"
  },
  "engines": {
    "strudel": "Strudel",
    "tonejs": "Tone.js",
    "webaudio": "Web Audio",
    "midi": "MIDI",
    "midiWarning": "Output only — MIDI input (keyboards, controllers) is planned for a future version."
  },
  "panels": {
    "editor": "Code Editor",
    "graph": "Node Graph",
    "waveform": "Waveform",
    "spectrum": "Spectrum",
    "timeline": "Pattern Timeline",
    "beatlings": "Beatling World"
  },
  "status": {
    "engine": "Engine",
    "cpu": "CPU",
    "creatures": "Creatures",
    "ready": "Ready"
  },
  "landing": {
    "hero": "Make music with code",
    "subtitle": "A live coding IDE with visual node graphs, audio visualizers, and creatures that dance to your beats.",
    "cta": "Start Coding"
  }
}
```

- [ ] **Step 2: Create German translations**

Create `src/i18n/locales/de.json`:

```json
{
  "app": {
    "name": "Live Music Coder",
    "tagline": "Musik programmieren. Live erleben."
  },
  "transport": {
    "play": "Abspielen",
    "stop": "Stopp",
    "record": "Aufnehmen",
    "bpm": "BPM"
  },
  "toolbar": {
    "undo": "Rückgängig",
    "redo": "Wiederherstellen",
    "share": "Teilen",
    "gist": "Als Gist speichern",
    "settings": "Einstellungen",
    "language": "Sprache"
  },
  "engines": {
    "strudel": "Strudel",
    "tonejs": "Tone.js",
    "webaudio": "Web Audio",
    "midi": "MIDI",
    "midiWarning": "Nur Ausgabe — MIDI-Eingabe (Keyboards, Controller) ist für eine zukünftige Version geplant."
  },
  "panels": {
    "editor": "Code-Editor",
    "graph": "Knotengraph",
    "waveform": "Wellenform",
    "spectrum": "Spektrum",
    "timeline": "Pattern-Timeline",
    "beatlings": "Beatling-Welt"
  },
  "status": {
    "engine": "Engine",
    "cpu": "CPU",
    "creatures": "Kreaturen",
    "ready": "Bereit"
  },
  "landing": {
    "hero": "Musik mit Code machen",
    "subtitle": "Eine Live-Coding-IDE mit visuellen Knotengraphen, Audio-Visualizern und Kreaturen, die zu deinen Beats tanzen.",
    "cta": "Jetzt loslegen"
  }
}
```

- [ ] **Step 3: Create Spanish translations**

Create `src/i18n/locales/es.json`:

```json
{
  "app": {
    "name": "Live Music Coder",
    "tagline": "Programa música. Vívela en directo."
  },
  "transport": {
    "play": "Reproducir",
    "stop": "Detener",
    "record": "Grabar",
    "bpm": "BPM"
  },
  "toolbar": {
    "undo": "Deshacer",
    "redo": "Rehacer",
    "share": "Compartir",
    "gist": "Guardar en Gist",
    "settings": "Ajustes",
    "language": "Idioma"
  },
  "engines": {
    "strudel": "Strudel",
    "tonejs": "Tone.js",
    "webaudio": "Web Audio",
    "midi": "MIDI",
    "midiWarning": "Solo salida — la entrada MIDI (teclados, controladores) está prevista para una versión futura."
  },
  "panels": {
    "editor": "Editor de código",
    "graph": "Grafo de nodos",
    "waveform": "Forma de onda",
    "spectrum": "Espectro",
    "timeline": "Línea de patrones",
    "beatlings": "Mundo Beatling"
  },
  "status": {
    "engine": "Motor",
    "cpu": "CPU",
    "creatures": "Criaturas",
    "ready": "Listo"
  },
  "landing": {
    "hero": "Haz música con código",
    "subtitle": "Un IDE de live coding con grafos visuales, visualizadores de audio y criaturas que bailan con tus ritmos.",
    "cta": "Empezar a programar"
  }
}
```

- [ ] **Step 4: Create i18n initialization**

Create `src/i18n/index.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import de from './locales/de.json';
import es from './locales/es.json';

/* Detect language: saved preference > browser language > English */
const savedLang = localStorage.getItem('lmc-lang');
const browserLang = navigator.language.startsWith('de')
  ? 'de'
  : navigator.language.startsWith('es')
    ? 'es'
    : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    es: { translation: es },
  },
  lng: savedLang || browserLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

/* Persist language choice on change */
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lmc-lang', lng);
});

export default i18n;
```

- [ ] **Step 5: Import i18n in main.tsx**

Add to `src/main.tsx` before React render:

```typescript
import './i18n';
```

- [ ] **Step 6: Verify i18n loads**

```bash
npm run dev
```

Open browser console, type `i18next.t('app.name')` — expected: "Live Music Coder".

- [ ] **Step 7: Commit**

```bash
git add src/i18n/
git commit -m "[i18n] Add DE/EN/ES translations with auto-detect"
```

---

### Task 5: Zustand store

**Files:**
- Create: `src/lib/store.ts`, `src/lib/constants.ts`
- Create: `src/lib/store.test.ts`

- [ ] **Step 1: Create constants**

Create `src/lib/constants.ts`:

```typescript
import type { EngineType } from '../types/engine';
import type { PanelLayout } from '../types/project';

export const DEFAULT_BPM = 120;
export const MIN_BPM = 20;
export const MAX_BPM = 300;

export const DEFAULT_ENGINE: EngineType = 'strudel';

export const ENGINE_COLORS: Record<EngineType, string> = {
  strudel: 'var(--color-strudel)',
  tonejs: 'var(--color-tonejs)',
  webaudio: 'var(--color-webaudio)',
  midi: 'var(--color-midi)',
};

export const DEFAULT_LAYOUT: PanelLayout = {
  editorWidth: 50,
  graphWidth: 50,
  visualizerHeight: 30,
  visiblePanels: {
    waveform: true,
    spectrum: true,
    timeline: true,
    beatlings: true,
  },
};
```

- [ ] **Step 2: Write failing store test**

Create `src/lib/store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './store';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('has default BPM of 120', () => {
    expect(useAppStore.getState().bpm).toBe(120);
  });

  it('has default engine of strudel', () => {
    expect(useAppStore.getState().defaultEngine).toBe('strudel');
  });

  it('updates BPM', () => {
    useAppStore.getState().setBpm(140);
    expect(useAppStore.getState().bpm).toBe(140);
  });

  it('clamps BPM to valid range', () => {
    useAppStore.getState().setBpm(999);
    expect(useAppStore.getState().bpm).toBe(300);
    useAppStore.getState().setBpm(1);
    expect(useAppStore.getState().bpm).toBe(20);
  });

  it('toggles transport state', () => {
    expect(useAppStore.getState().isPlaying).toBe(false);
    useAppStore.getState().togglePlay();
    expect(useAppStore.getState().isPlaying).toBe(true);
    useAppStore.getState().togglePlay();
    expect(useAppStore.getState().isPlaying).toBe(false);
  });

  it('sets default engine', () => {
    useAppStore.getState().setDefaultEngine('tonejs');
    expect(useAppStore.getState().defaultEngine).toBe('tonejs');
  });

  it('toggles panel visibility', () => {
    expect(useAppStore.getState().layout.visiblePanels.waveform).toBe(true);
    useAppStore.getState().togglePanel('waveform');
    expect(useAppStore.getState().layout.visiblePanels.waveform).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `useAppStore` not found.

- [ ] **Step 4: Write store implementation**

Create `src/lib/store.ts`:

```typescript
import { create } from 'zustand';
import type { EngineType } from '../types/engine';
import type { PanelLayout } from '../types/project';
import {
  DEFAULT_BPM,
  MIN_BPM,
  MAX_BPM,
  DEFAULT_ENGINE,
  DEFAULT_LAYOUT,
} from './constants';

export interface AppState {
  /* Transport */
  isPlaying: boolean;
  isRecording: boolean;
  bpm: number;

  /* Engine */
  defaultEngine: EngineType;

  /* Layout */
  layout: PanelLayout;

  /* Actions */
  togglePlay: () => void;
  stop: () => void;
  toggleRecord: () => void;
  setBpm: (bpm: number) => void;
  setDefaultEngine: (engine: EngineType) => void;
  togglePanel: (panel: keyof PanelLayout['visiblePanels']) => void;
  setEditorWidth: (width: number) => void;
  setVisualizerHeight: (height: number) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  /* Transport */
  isPlaying: false,
  isRecording: false,
  bpm: DEFAULT_BPM,

  /* Engine */
  defaultEngine: DEFAULT_ENGINE,

  /* Layout */
  layout: { ...DEFAULT_LAYOUT },

  /* Actions */
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  stop: () => set({ isPlaying: false, isRecording: false }),
  toggleRecord: () => set((s) => ({ isRecording: !s.isRecording })),
  setBpm: (bpm) => set({ bpm: Math.max(MIN_BPM, Math.min(MAX_BPM, bpm)) }),
  setDefaultEngine: (engine) => set({ defaultEngine: engine }),
  togglePanel: (panel) =>
    set((s) => ({
      layout: {
        ...s.layout,
        visiblePanels: {
          ...s.layout.visiblePanels,
          [panel]: !s.layout.visiblePanels[panel],
        },
      },
    })),
  setEditorWidth: (width) =>
    set((s) => ({
      layout: { ...s.layout, editorWidth: width, graphWidth: 100 - width },
    })),
  setVisualizerHeight: (height) =>
    set((s) => ({ layout: { ...s.layout, visualizerHeight: height } })),
}));
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test
```

Expected: All 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/store.ts src/lib/store.test.ts src/lib/constants.ts
git commit -m "[Core] Add Zustand store with transport, engine, layout state + tests"
```

---

### Task 6: Atom components

**Files:**
- Create: `src/components/atoms/Button.tsx`, `Icon.tsx`, `Toggle.tsx`, `Badge.tsx`, `Tooltip.tsx`, `index.ts`

**Note:** `Slider` and `Knob` atoms from the spec are deferred to Phase 2 (Orchestrator & Engines) where they're needed for audio parameter control.

- [ ] **Step 1: Create Button atom**

Create `src/components/atoms/Button.tsx`:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  active?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white',
  secondary:
    'bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text)]',
  ghost:
    'bg-transparent hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]',
  icon: 'bg-transparent hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] p-[var(--space-2)]',
};

/* Reusable button with variant styling */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', active, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-[var(--space-2)]
        px-[var(--space-3)] py-[var(--space-2)]
        rounded-[var(--radius-md)]
        font-[var(--font-weight-medium)]
        text-[var(--font-size-sm)]
        transition-colors duration-[var(--transition-fast)]
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${variantClasses[variant]}
        ${active ? 'bg-[var(--color-bg-hover)] text-[var(--color-text)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
```

- [ ] **Step 2: Create Icon atom**

Create `src/components/atoms/Icon.tsx`:

```tsx
import type { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

/* Lucide icon wrapper with consistent sizing */
export function Icon({ icon: LucideIcon, size = 18, className = '' }: IconProps) {
  return <LucideIcon size={size} className={className} />;
}
```

- [ ] **Step 3: Create Toggle atom**

Create `src/components/atoms/Toggle.tsx`:

```tsx
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

/* On/off toggle for panel visibility */
export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-[var(--space-2)] cursor-pointer">
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`
          relative w-9 h-5 rounded-[var(--radius-full)]
          transition-colors duration-[var(--transition-fast)]
          ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-hover)]'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4
            rounded-[var(--radius-full)] bg-white
            transition-transform duration-[var(--transition-fast)]
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
      <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
        {label}
      </span>
    </label>
  );
}
```

- [ ] **Step 4: Create Badge atom**

Create `src/components/atoms/Badge.tsx`:

```tsx
interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

/* Small colored badge for engine/status indicators */
export function Badge({ children, color = 'var(--color-primary)', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        px-[var(--space-2)] py-[var(--space-1)]
        rounded-[var(--radius-full)]
        text-[var(--font-size-xs)]
        font-[var(--font-weight-medium)]
        ${className}
      `}
      style={{ backgroundColor: color, color: 'var(--color-text)' }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Create Tooltip atom**

Create `src/components/atoms/Tooltip.tsx`:

```tsx
import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

/* Hover tooltip with i18n-ready text */
export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-[var(--space-2)]
            px-[var(--space-2)] py-[var(--space-1)]
            bg-[var(--color-bg-elevated)] text-[var(--color-text)]
            text-[var(--font-size-xs)] whitespace-nowrap
            rounded-[var(--radius-md)]
            shadow-[var(--shadow-md)]
            z-50 pointer-events-none
          "
        >
          {content}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 6: Create barrel export**

Create `src/components/atoms/index.ts`:

```typescript
export { Button } from './Button';
export { Icon } from './Icon';
export { Toggle } from './Toggle';
export { Badge } from './Badge';
export { Tooltip } from './Tooltip';
```

- [ ] **Step 7: Commit**

```bash
git add src/components/atoms/
git commit -m "[UI] Add atom components — Button, Icon, Toggle, Badge, Tooltip"
```

---

### Task 7: Molecule components

**Files:**
- Create: `src/components/molecules/ToolbarGroup.tsx`, `EngineSelector.tsx`, `LanguageSwitcher.tsx`, `index.ts`

- [ ] **Step 1: Create ToolbarGroup**

Create `src/components/molecules/ToolbarGroup.tsx`:

```tsx
import type { ReactNode } from 'react';

interface ToolbarGroupProps {
  children: ReactNode;
  separator?: boolean;
}

/* Groups toolbar buttons with optional separator */
export function ToolbarGroup({ children, separator = true }: ToolbarGroupProps) {
  return (
    <div className="inline-flex items-center gap-[var(--space-1)]">
      {children}
      {separator && (
        <div className="w-px h-5 bg-[var(--color-border)] mx-[var(--space-2)]" />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create EngineSelector**

Create `src/components/molecules/EngineSelector.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { ENGINE_COLORS } from '../../lib/constants';
import type { EngineType } from '../../types/engine';

const engines: EngineType[] = ['strudel', 'tonejs', 'webaudio', 'midi'];

/* Dropdown to select the default audio engine */
export function EngineSelector() {
  const { t } = useTranslation();
  const defaultEngine = useAppStore((s) => s.defaultEngine);
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine);

  return (
    <select
      value={defaultEngine}
      onChange={(e) => setDefaultEngine(e.target.value as EngineType)}
      aria-label={t('status.engine')}
      className="
        bg-[var(--color-bg-elevated)] text-[var(--color-text)]
        border border-[var(--color-border)]
        rounded-[var(--radius-md)]
        px-[var(--space-2)] py-[var(--space-1)]
        text-[var(--font-size-sm)]
        cursor-pointer
      "
      style={{ borderColor: ENGINE_COLORS[defaultEngine] }}
    >
      {engines.map((engine) => (
        <option key={engine} value={engine}>
          {t(`engines.${engine}`)}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 3: Create LanguageSwitcher**

Create `src/components/molecules/LanguageSwitcher.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '../atoms';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'es', label: 'ES' },
];

/* DE/EN/ES language dropdown */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="inline-flex items-center gap-[var(--space-1)]">
      <Globe size={16} className="text-[var(--color-text-muted)]" />
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant="ghost"
          active={i18n.language === lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className="!px-[var(--space-2)] !py-[var(--space-1)] text-[var(--font-size-xs)]"
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create barrel export**

Create `src/components/molecules/index.ts`:

```typescript
export { ToolbarGroup } from './ToolbarGroup';
export { EngineSelector } from './EngineSelector';
export { LanguageSwitcher } from './LanguageSwitcher';
```

- [ ] **Step 5: Commit**

```bash
git add src/components/molecules/
git commit -m "[UI] Add molecule components — ToolbarGroup, EngineSelector, LanguageSwitcher"
```

---

### Task 8: Organism components (TransportBar + StatusBar)

**Files:**
- Create: `src/components/organisms/TransportBar.tsx`, `StatusBar.tsx`, `index.ts`

- [ ] **Step 1: Create TransportBar**

Create `src/components/organisms/TransportBar.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { Play, Square, Circle, Undo2, Redo2, Share2, Github, Settings } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { Button, Tooltip } from '../atoms';
import { ToolbarGroup, EngineSelector, LanguageSwitcher } from '../molecules';
import { MIN_BPM, MAX_BPM } from '../../lib/constants';

/* Top toolbar with transport controls, undo/redo, sharing, settings */
export function TransportBar() {
  const { t } = useTranslation();
  const isPlaying = useAppStore((s) => s.isPlaying);
  const isRecording = useAppStore((s) => s.isRecording);
  const bpm = useAppStore((s) => s.bpm);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const stop = useAppStore((s) => s.stop);
  const toggleRecord = useAppStore((s) => s.toggleRecord);
  const setBpm = useAppStore((s) => s.setBpm);

  return (
    <header className="
      flex items-center justify-between
      px-[var(--space-4)] py-[var(--space-2)]
      bg-[var(--color-bg-alt)] border-b border-[var(--color-border)]
      shrink-0
    ">
      {/* Left: Transport + BPM */}
      <nav className="flex items-center gap-[var(--space-1)]" aria-label="Transport controls">
        <ToolbarGroup>
          <Tooltip content={t('transport.play')}>
            <Button variant="icon" onClick={togglePlay} active={isPlaying} aria-label={t('transport.play')}>
              <Play size={18} fill={isPlaying ? 'currentColor' : 'none'} />
            </Button>
          </Tooltip>
          <Tooltip content={t('transport.stop')}>
            <Button variant="icon" onClick={stop} aria-label={t('transport.stop')}>
              <Square size={18} />
            </Button>
          </Tooltip>
          <Tooltip content={t('transport.record')}>
            <Button variant="icon" onClick={toggleRecord} active={isRecording} aria-label={t('transport.record')}>
              <Circle size={18} style={{ fill: isRecording ? 'var(--color-error)' : 'none' }} />
            </Button>
          </Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <label className="flex items-center gap-[var(--space-2)] text-[var(--font-size-sm)]">
            <span className="text-[var(--color-text-muted)]">{t('transport.bpm')}</span>
            <input
              type="number"
              value={bpm}
              min={MIN_BPM}
              max={MAX_BPM}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="
                w-14 bg-[var(--color-bg-elevated)] text-[var(--color-text)]
                border border-[var(--color-border)]
                rounded-[var(--radius-md)]
                px-[var(--space-2)] py-[var(--space-1)]
                text-center font-[var(--font-family-mono)]
              "
            />
          </label>
        </ToolbarGroup>

        <ToolbarGroup separator={false}>
          <EngineSelector />
        </ToolbarGroup>
      </nav>

      {/* Right: Actions + Language */}
      <div className="flex items-center gap-[var(--space-1)]">
        <ToolbarGroup>
          <Tooltip content={t('toolbar.undo')}>
            <Button variant="icon" aria-label={t('toolbar.undo')}>
              <Undo2 size={18} />
            </Button>
          </Tooltip>
          <Tooltip content={t('toolbar.redo')}>
            <Button variant="icon" aria-label={t('toolbar.redo')}>
              <Redo2 size={18} />
            </Button>
          </Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip content={t('toolbar.share')}>
            <Button variant="icon" aria-label={t('toolbar.share')}>
              <Share2 size={18} />
            </Button>
          </Tooltip>
          <Tooltip content={t('toolbar.gist')}>
            <Button variant="icon" aria-label={t('toolbar.gist')}>
              <Github size={18} />
            </Button>
          </Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip content={t('toolbar.settings')}>
            <Button variant="icon" aria-label={t('toolbar.settings')}>
              <Settings size={18} />
            </Button>
          </Tooltip>
        </ToolbarGroup>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create StatusBar**

Create `src/components/organisms/StatusBar.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { Badge } from '../atoms';
import { ENGINE_COLORS } from '../../lib/constants';

/* Bottom status bar — engine, CPU, creature count, console */
export function StatusBar() {
  const { t } = useTranslation();
  const defaultEngine = useAppStore((s) => s.defaultEngine);

  return (
    <footer className="
      flex items-center justify-between
      px-[var(--space-4)] py-[var(--space-1)]
      bg-[var(--color-bg-alt)] border-t border-[var(--color-border)]
      text-[var(--font-size-xs)] text-[var(--color-text-muted)]
      shrink-0
    ">
      <div className="flex items-center gap-[var(--space-4)]">
        <span className="flex items-center gap-[var(--space-2)]">
          {t('status.engine')}:
          <Badge color={ENGINE_COLORS[defaultEngine]}>
            {t(`engines.${defaultEngine}`)}
          </Badge>
        </span>
        <span>{t('status.cpu')}: 0%</span>
        <span>{t('status.creatures')}: 0/6</span>
      </div>
      <div className="flex items-center gap-[var(--space-2)]">
        <span className="font-[var(--font-family-mono)]">{t('status.ready')}</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create barrel export**

Create `src/components/organisms/index.ts`:

```typescript
export { TransportBar } from './TransportBar';
export { StatusBar } from './StatusBar';
```

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/
git commit -m "[UI] Add organism components — TransportBar, StatusBar"
```

---

### Task 9: Editor layout with resizable panels

**Files:**
- Create: `src/layouts/EditorLayout.tsx`

- [ ] **Step 1: Create EditorLayout**

Create `src/layouts/EditorLayout.tsx`:

```tsx
import { useCallback, useRef, type ReactNode } from 'react';
import { useAppStore } from '../lib/store';

interface EditorLayoutProps {
  toolbar: ReactNode;
  editor: ReactNode;
  graph: ReactNode;
  visualizers: ReactNode;
  statusBar: ReactNode;
}

/* Main IDE layout with resizable panels: top (editor + graph), bottom (visualizers) */
export function EditorLayout({ toolbar, editor, graph, visualizers, statusBar }: EditorLayoutProps) {
  const layout = useAppStore((s) => s.layout);
  const setEditorWidth = useAppStore((s) => s.setEditorWidth);
  const setVisualizerHeight = useAppStore((s) => s.setVisualizerHeight);

  const containerRef = useRef<HTMLDivElement>(null);

  /* Horizontal drag to resize editor/graph split */
  const handleHorizontalDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const percent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        setEditorWidth(Math.max(20, Math.min(80, percent)));
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [setEditorWidth],
  );

  /* Vertical drag to resize visualizer height */
  const handleVerticalDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const percentFromBottom = ((rect.bottom - moveEvent.clientY) / rect.height) * 100;
        setVisualizerHeight(Math.max(15, Math.min(60, percentFromBottom)));
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [setVisualizerHeight],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {toolbar}

      {/* Main content area */}
      <div ref={containerRef} className="flex flex-col flex-1 min-h-0">
        {/* Top zone: editor + graph */}
        <div
          className="flex min-h-0"
          style={{ height: `${100 - layout.visualizerHeight}%` }}
        >
          {/* Code editor panel */}
          <section
            className="min-w-0 overflow-hidden"
            style={{ width: `${layout.editorWidth}%` }}
            aria-label="Code Editor"
          >
            {editor}
          </section>

          {/* Horizontal resize handle */}
          <div
            className="w-1 bg-[var(--color-border)] hover:bg-[var(--color-primary)] cursor-col-resize shrink-0 transition-colors duration-[var(--transition-fast)]"
            onMouseDown={handleHorizontalDrag}
            role="separator"
            aria-orientation="vertical"
          />

          {/* Node graph panel */}
          <section
            className="min-w-0 overflow-hidden"
            style={{ width: `${layout.graphWidth}%` }}
            aria-label="Node Graph"
          >
            {graph}
          </section>
        </div>

        {/* Vertical resize handle */}
        <div
          className="h-1 bg-[var(--color-border)] hover:bg-[var(--color-primary)] cursor-row-resize shrink-0 transition-colors duration-[var(--transition-fast)]"
          onMouseDown={handleVerticalDrag}
          role="separator"
          aria-orientation="horizontal"
        />

        {/* Bottom zone: visualizers */}
        <section
          className="min-h-0 overflow-hidden"
          style={{ height: `${layout.visualizerHeight}%` }}
          aria-label="Visualizers"
        >
          {visualizers}
        </section>
      </div>

      {/* Status bar */}
      {statusBar}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/
git commit -m "[Layout] Add EditorLayout with resizable panels (drag handles)"
```

---

### Task 10: Pages + Router + App assembly

**Files:**
- Create: `src/pages/Editor.tsx`, `src/pages/Landing.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Create Editor page**

Create `src/pages/Editor.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { EditorLayout } from '../layouts/EditorLayout';
import { TransportBar, StatusBar } from '../components/organisms';

/* Placeholder panels — replaced in later phases */
function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full bg-[var(--color-bg)] text-[var(--color-text-muted)] text-[var(--font-size-sm)]">
      {label}
    </div>
  );
}

/* Main IDE page — composes EditorLayout with all panels */
export function Editor() {
  const { t } = useTranslation();

  return (
    <EditorLayout
      toolbar={<TransportBar />}
      editor={<PlaceholderPanel label={t('panels.editor')} />}
      graph={<PlaceholderPanel label={t('panels.graph')} />}
      visualizers={<PlaceholderPanel label={t('panels.waveform')} />}
      statusBar={<StatusBar />}
    />
  );
}
```

- [ ] **Step 2: Create Landing page**

Create `src/pages/Landing.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '../components/atoms';
import { LanguageSwitcher } from '../components/molecules';

/* Landing page — hero + CTA to editor */
export function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center h-full bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="absolute top-[var(--space-4)] right-[var(--space-4)]">
        <LanguageSwitcher />
      </div>

      <h1 className="text-[var(--font-size-3xl)] font-[var(--font-weight-bold)] mb-[var(--space-4)]">
        {t('landing.hero')}
      </h1>
      <p className="text-[var(--color-text-secondary)] text-[var(--font-size-lg)] max-w-xl text-center mb-[var(--space-8)]">
        {t('landing.subtitle')}
      </p>
      <Button variant="primary" onClick={() => navigate('/editor')} className="text-[var(--font-size-lg)] !px-[var(--space-8)] !py-[var(--space-3)]">
        <Play size={20} />
        {t('landing.cta')}
      </Button>
    </main>
  );
}
```

- [ ] **Step 3: Update App.tsx with router**

Replace `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Editor } from './pages/Editor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Clean up main.tsx**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Clean up Vite scaffold remnants**

Delete files that came with the Vite template and are no longer needed:

```bash
rm -f src/App.css src/index.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 6: Update index.html title**

In `index.html`, change `<title>` to:

```html
<title>Live Music Coder</title>
```

- [ ] **Step 7: Verify the app works end-to-end**

```bash
npm run dev
```

Expected:
1. Landing page renders at `/` with hero text, CTA button, language switcher
2. Click "Start Coding" → navigates to `/editor`
3. Editor page shows: TransportBar (top), resizable panels (middle), StatusBar (bottom)
4. Panels are resizable via drag handles
5. Language switcher changes all text to DE/ES/EN
6. Engine selector dropdown works
7. Play/Stop/Record buttons toggle state

- [ ] **Step 8: Run all tests**

```bash
npm run test
```

Expected: All store tests pass. No other tests yet (UI tests added in later phases).

- [ ] **Step 9: Commit**

```bash
git add src/pages/ src/layouts/ src/App.tsx src/main.tsx index.html
git commit -m "[App] Assemble pages, router, EditorLayout — working IDE shell"
```

---

### Task 11: History (undo/redo) manager

**Files:**
- Create: `src/lib/history.ts`, `src/lib/history.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/history.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { History } from './history';

describe('History', () => {
  let history: History<string>;

  beforeEach(() => {
    history = new History(5);
  });

  it('starts with no undo/redo', () => {
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  it('records and undoes', () => {
    history.push('a');
    history.push('b');
    expect(history.canUndo()).toBe(true);
    expect(history.undo()).toBe('a');
  });

  it('redoes after undo', () => {
    history.push('a');
    history.push('b');
    history.undo();
    expect(history.canRedo()).toBe(true);
    expect(history.redo()).toBe('b');
  });

  it('clears redo stack on new push', () => {
    history.push('a');
    history.push('b');
    history.undo();
    history.push('c');
    expect(history.canRedo()).toBe(false);
  });

  it('respects max size', () => {
    for (let i = 0; i < 10; i++) history.push(String(i));
    let count = 0;
    // maxSize=5 means 5 entries in stack; canUndo needs >1 (base state), so 4 undos
    while (history.canUndo()) { history.undo(); count++; }
    expect(count).toBe(4);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm run test
```

Expected: FAIL — `History` not found.

- [ ] **Step 3: Implement History**

Create `src/lib/history.ts`:

```typescript
/* Generic undo/redo stack with configurable max size */
export class History<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  push(state: T): void {
    this.undoStack.push(state);
    this.redoStack = [];
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
  }

  undo(): T | undefined {
    const current = this.undoStack.pop();
    if (current !== undefined) {
      this.redoStack.push(current);
    }
    return this.undoStack[this.undoStack.length - 1];
  }

  redo(): T | undefined {
    const state = this.redoStack.pop();
    if (state !== undefined) {
      this.undoStack.push(state);
    }
    return state;
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/history.ts src/lib/history.test.ts
git commit -m "[Core] Add History undo/redo manager with tests"
```

---

### Task 12: Final verification + push

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```

Expected: All tests pass (store: 7, history: 5).

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds, output in `dist/`.

- [ ] **Step 4: Create GitHub repo + push**

```bash
cd /Users/arnold/Development/wm-prototyp-live-music-coder
gh repo create arnoldwender/wm-prototyp-live-music-coder --private --source=. --push
```

- [ ] **Step 5: Verify on GitHub**

```bash
gh repo view arnoldwender/wm-prototyp-live-music-coder --web
```

Expected: Repository exists with all commits.

---

## Phase 1 Completion Criteria

After all 12 tasks:
- App renders a dark IDE shell with resizable panels
- TransportBar with Play/Stop/Rec/BPM/Engine controls
- StatusBar with engine badge and placeholder stats
- Landing page with hero + CTA
- Language switching (DE/EN/ES) works throughout
- Design tokens applied consistently (no hardcoded values)
- Zustand store managing layout + transport state
- Undo/redo history manager ready
- TypeScript types defined for entire data model
- Vitest infrastructure with passing tests
- Deployed to GitHub (private repo)

**Next:** Phase 2 — Orchestrator & Engines (`phase-02-orchestrator-engines.md`)
