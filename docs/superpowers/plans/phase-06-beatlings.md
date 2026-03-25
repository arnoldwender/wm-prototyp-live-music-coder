# Phase 6: Beatling Ecosystem — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Beatling mascot ecosystem — 6 audio-reactive pixel-art creature species with dual-brain (neural network + Conway's Game of Life). Creatures spawn based on musical activity, evolve, interact, and are collectible.

**Architecture:** Brain code copied from wm-lifegame (neuron, synapse, neural-network) with adaptations. Consciousness and dreams heavily simplified for performance (~40 neuron cap). A new GoL brain layer drives emergent visual patterns. Audio bridge connects the master analyser to both brains. Canvas 2D renderer draws GoL grid + creatures + neural overlay. Species spawn/despawn based on real-time audio feature analysis.

**Source code:** Brain files copied from `/Users/arnold/Development/wm-lifegame/src/brain/` — NOT imported, NOT modifying the original.

**Tech Stack:** Canvas 2D, requestAnimationFrame, Web Audio AnalyserNode, Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md` (Section 5)

---

## Adaptation Strategy

### What we copy as-is (with import path fixes)
- `neuron.ts` (162 LOC) — zero deps
- `synapse.ts` (113 LOC) — zero deps

### What we copy and simplify
- `neural-network.ts` (414 LOC) → cap at 40 neurons, remove growth beyond that
- `consciousness.ts` (592 LOC) → strip to Phi calculation only, remove i18n, remove narrative/qualia/attractor
- `dreams.ts` (326 LOC) → strip to basic sleep/consolidation, remove golden-ratio complexity

### What we write new
- `beatling-soul.ts` — lightweight orchestrator (replaces soul.ts, no Creature/World coupling)
- `gol-brain.ts` — Conway's Game of Life with audio-reactive cell injection
- `species.ts` — 6 species definitions + spawn triggers
- `evolution.ts` — XP system + stage transitions
- `collection.ts` — achievements + persistence
- `audio-bridge.ts` — connects AudioAnalyzer to both brains
- `renderer.ts` — Canvas 2D: GoL grid + creatures + neural overlay

---

## File Structure (Phase 6)

```
src/lib/beatlings/
├── brain/
│   ├── neuron.ts           # Copied from wm-lifegame, import paths fixed
│   ├── synapse.ts          # Copied from wm-lifegame, import paths fixed
│   ├── neural-network.ts   # Copied + simplified (40 neuron cap)
│   ├── consciousness.ts    # Stripped: Phi calc only, no i18n/narratives
│   └── dreams.ts           # Stripped: basic sleep/consolidation only
├── gol-brain.ts            # Conway's GoL grid (128x128 max) with audio injection
├── gol-brain.test.ts       # GoL tests
├── beatling-soul.ts        # Lightweight brain orchestrator per creature
├── species.ts              # 6 species definitions + spawn logic
├── species.test.ts         # Species tests
├── evolution.ts            # XP accumulation + stage transitions
├── evolution.test.ts       # Evolution tests
├── collection.ts           # Achievements tracking
├── audio-bridge.ts         # Audio → brain mapping
├── renderer.ts             # Canvas 2D: GoL + creatures + neural overlay
└── index.ts                # Barrel export + BeatlingWorld manager

src/components/organisms/
└── BeatlingPanel.tsx        # Organism: Canvas + BeatlingWorld lifecycle
```

---

### Task 1: Copy and adapt brain files from wm-lifegame

**Files:**
- Create: `src/lib/beatlings/brain/neuron.ts`, `synapse.ts`, `neural-network.ts`, `consciousness.ts`, `dreams.ts`

- [ ] **Step 1: Copy neuron.ts**

Copy `/Users/arnold/Development/wm-lifegame/src/brain/neuron.ts` to `src/lib/beatlings/brain/neuron.ts`. Fix: remove `.js` from any import extensions (Vite handles this). No other changes needed.

- [ ] **Step 2: Copy synapse.ts**

Copy `/Users/arnold/Development/wm-lifegame/src/brain/synapse.ts` to `src/lib/beatlings/brain/synapse.ts`. Same fix.

- [ ] **Step 3: Copy and simplify neural-network.ts**

Copy `/Users/arnold/Development/wm-lifegame/src/brain/neural-network.ts`. Adaptations:
- Fix import paths (remove `.js` extensions)
- Change `MAX_NEURONS` from 120 to 40
- Remove or cap any growth logic beyond 40 neurons

- [ ] **Step 4: Strip consciousness.ts**

Copy `/Users/arnold/Development/wm-lifegame/src/brain/consciousness.ts`. Heavy adaptations:
- Remove `import { t } from '../i18n/i18n'` entirely
- Keep ONLY: `calculatePhi()` method (entropy × integration × temporal coherence)
- Keep: `update()` that calls calculatePhi and stores result
- Keep: `phi` getter, `serialize()`, `deserialize()`
- Remove: narrative generation, qualia synthesis, strange attractor, thought fragments
- Replace any `t()` calls with empty string or hardcoded English fallbacks
- Simplify to under 150 lines

- [ ] **Step 5: Strip dreams.ts**

Copy `/Users/arnold/Development/wm-lifegame/src/brain/dreams.ts`. Adaptations:
- Keep: `shouldSleep()`, `processDream()` (slow-wave consolidation only), `accumulatePressure()`
- Remove: REM creativity, golden-ratio modulation, dream emotion tracking
- Simplify to under 100 lines

- [ ] **Step 6: Verify files compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/beatlings/brain/
git commit -m "[Beatlings] Copy and adapt brain files from wm-lifegame (neuron, synapse, network, consciousness, dreams)"
```

---

### Task 2: Conway's Game of Life brain (TDD)

**Files:**
- Create: `src/lib/beatlings/gol-brain.ts`, `src/lib/beatlings/gol-brain.test.ts`

- [ ] **Step 1: Write GoL tests first**

Create `src/lib/beatlings/gol-brain.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GolBrain } from './gol-brain';

describe('GolBrain', () => {
  let gol: GolBrain;

  beforeEach(() => {
    gol = new GolBrain(16, 16);
  });

  it('starts empty', () => {
    expect(gol.getLiveCellCount()).toBe(0);
  });

  it('sets and gets cells', () => {
    gol.setCell(5, 5, true);
    expect(gol.getCell(5, 5)).toBe(true);
    expect(gol.getLiveCellCount()).toBe(1);
  });

  it('applies Game of Life rules — still life (block)', () => {
    gol.setCell(5, 5, true);
    gol.setCell(5, 6, true);
    gol.setCell(6, 5, true);
    gol.setCell(6, 6, true);
    gol.step();
    expect(gol.getCell(5, 5)).toBe(true);
    expect(gol.getLiveCellCount()).toBe(4);
  });

  it('applies Game of Life rules — blinker oscillates', () => {
    gol.setCell(7, 6, true);
    gol.setCell(7, 7, true);
    gol.setCell(7, 8, true);
    gol.step();
    expect(gol.getCell(6, 7)).toBe(true);
    expect(gol.getCell(7, 7)).toBe(true);
    expect(gol.getCell(8, 7)).toBe(true);
  });

  it('injects cells at position', () => {
    gol.injectPulse(8, 8, 3);
    expect(gol.getLiveCellCount()).toBeGreaterThan(0);
  });

  it('injects glider pattern', () => {
    gol.injectGlider(4, 4);
    expect(gol.getLiveCellCount()).toBe(5);
  });

  it('respects max dimension cap', () => {
    const big = new GolBrain(200, 200);
    expect(big.width).toBeLessThanOrEqual(128);
    expect(big.height).toBeLessThanOrEqual(128);
  });

  it('serializes and deserializes', () => {
    gol.setCell(3, 3, true);
    gol.setCell(7, 9, true);
    const data = gol.serialize();
    const restored = GolBrain.deserialize(data);
    expect(restored.getCell(3, 3)).toBe(true);
    expect(restored.getCell(7, 9)).toBe(true);
    expect(restored.getLiveCellCount()).toBe(2);
  });

  it('clears all cells', () => {
    gol.setCell(1, 1, true);
    gol.setCell(2, 2, true);
    gol.clear();
    expect(gol.getLiveCellCount()).toBe(0);
  });
});
```

- [ ] **Step 2: Implement GolBrain**

Create `src/lib/beatlings/gol-brain.ts`:

```typescript
const MAX_DIMENSION = 128;

/** Conway's Game of Life grid with audio-reactive cell injection.
 * Capped at 128x128 to prevent unbounded growth. */
export class GolBrain {
  readonly width: number;
  readonly height: number;
  private grid: Uint8Array;
  private buffer: Uint8Array;

  constructor(width: number, height: number) {
    this.width = Math.min(width, MAX_DIMENSION);
    this.height = Math.min(height, MAX_DIMENSION);
    const size = this.width * this.height;
    this.grid = new Uint8Array(size);
    this.buffer = new Uint8Array(size);
  }

  private idx(x: number, y: number): number {
    return ((y % this.height + this.height) % this.height) * this.width +
           ((x % this.width + this.width) % this.width);
  }

  getCell(x: number, y: number): boolean {
    return this.grid[this.idx(x, y)] === 1;
  }

  setCell(x: number, y: number, alive: boolean): void {
    this.grid[this.idx(x, y)] = alive ? 1 : 0;
  }

  getLiveCellCount(): number {
    let count = 0;
    for (let i = 0; i < this.grid.length; i++) {
      count += this.grid[i];
    }
    return count;
  }

  /** Advance one generation using standard GoL rules (B3/S23) */
  step(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const neighbors = this.countNeighbors(x, y);
        const alive = this.grid[this.idx(x, y)] === 1;
        /* Born with 3 neighbors, survives with 2 or 3 */
        this.buffer[this.idx(x, y)] = (alive ? (neighbors === 2 || neighbors === 3) : neighbors === 3) ? 1 : 0;
      }
    }
    [this.grid, this.buffer] = [this.buffer, this.grid];
  }

  private countNeighbors(x: number, y: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        count += this.grid[this.idx(x + dx, y + dy)];
      }
    }
    return count;
  }

  /** Inject a burst of cells (pulse pattern) */
  injectPulse(cx: number, cy: number, radius: number): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius && Math.random() > 0.4) {
          this.setCell(cx + dx, cy + dy, true);
        }
      }
    }
  }

  /** Inject a glider at position */
  injectGlider(x: number, y: number): void {
    const pattern = [[0,0],[1,0],[2,0],[2,1],[1,2]];
    for (const [dx, dy] of pattern) this.setCell(x + dx, y + dy, true);
  }

  /** Inject an oscillator (blinker) at position */
  injectOscillator(x: number, y: number): void {
    this.setCell(x, y, true);
    this.setCell(x + 1, y, true);
    this.setCell(x + 2, y, true);
  }

  /** Get the grid as a flat array for rendering */
  getGrid(): Uint8Array {
    return this.grid;
  }

  clear(): void {
    this.grid.fill(0);
  }

  serialize(): { width: number; height: number; liveCells: [number, number][] } {
    const liveCells: [number, number][] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[this.idx(x, y)] === 1) liveCells.push([x, y]);
      }
    }
    return { width: this.width, height: this.height, liveCells };
  }

  static deserialize(data: { width: number; height: number; liveCells: [number, number][] }): GolBrain {
    const gol = new GolBrain(data.width, data.height);
    for (const [x, y] of data.liveCells) gol.setCell(x, y, true);
    return gol;
  }
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/beatlings/gol-brain.ts src/lib/beatlings/gol-brain.test.ts
git commit -m "[Beatlings] Add Conway's Game of Life brain with audio injection patterns + tests"
```

---

### Task 3: Species definitions + spawn logic (TDD)

**Files:**
- Create: `src/lib/beatlings/species.ts`, `src/lib/beatlings/species.test.ts`

- [ ] **Step 1: Write species tests**

Create `src/lib/beatlings/species.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { SPECIES, shouldSpawn, type AudioFeatures } from './species';

describe('Species', () => {
  it('defines 6 species', () => {
    expect(Object.keys(SPECIES)).toHaveLength(6);
  });

  it('each species has required fields', () => {
    for (const s of Object.values(SPECIES)) {
      expect(s.name).toBeTruthy();
      expect(s.role).toBeTruthy();
      expect(s.color).toBeTruthy();
      expect(typeof s.spawnCheck).toBe('function');
    }
  });

  it('spawns Beatling on beat detection', () => {
    const features: AudioFeatures = { rms: 0.5, peak: 0.8, hasBeat: true, dominantFreq: 100, complexity: 0.3, isTyping: false };
    expect(shouldSpawn('beatling', features)).toBe(true);
  });

  it('spawns Wavelet on low frequency', () => {
    const features: AudioFeatures = { rms: 0.4, peak: 0.5, hasBeat: false, dominantFreq: 80, complexity: 0.2, isTyping: false };
    expect(shouldSpawn('wavelet', features)).toBe(true);
  });

  it('spawns Codefly when typing', () => {
    const features: AudioFeatures = { rms: 0, peak: 0, hasBeat: false, dominantFreq: 0, complexity: 0, isTyping: true };
    expect(shouldSpawn('codefly', features)).toBe(true);
  });

  it('does not spawn without matching conditions', () => {
    const features: AudioFeatures = { rms: 0, peak: 0, hasBeat: false, dominantFreq: 500, complexity: 0, isTyping: false };
    expect(shouldSpawn('beatling', features)).toBe(false);
  });
});
```

- [ ] **Step 2: Implement species definitions**

Create `src/lib/beatlings/species.ts`:

```typescript
import type { Species } from '../../types/beatling';

export interface AudioFeatures {
  rms: number;
  peak: number;
  hasBeat: boolean;
  dominantFreq: number;
  complexity: number;
  isTyping: boolean;
}

export interface SpeciesDefinition {
  name: Species;
  role: string;
  color: string;
  dimColor: string;
  spawnCheck: (features: AudioFeatures) => boolean;
  movementStyle: 'bounce' | 'orbit' | 'flow' | 'glitch' | 'wave' | 'swarm';
}

export const SPECIES: Record<Species, SpeciesDefinition> = {
  beatling: {
    name: 'beatling',
    role: 'Rhythm/percussion',
    color: '#f97316',
    dimColor: '#ea580c',
    spawnCheck: (f) => f.hasBeat && f.rms > 0.2,
    movementStyle: 'bounce',
  },
  looplet: {
    name: 'looplet',
    role: 'Pattern loops',
    color: '#a855f7',
    dimColor: '#9333ea',
    spawnCheck: (f) => f.complexity > 0.4 && f.rms > 0.1,
    movementStyle: 'orbit',
  },
  synthling: {
    name: 'synthling',
    role: 'Melodic synths',
    color: '#3b82f6',
    dimColor: '#2563eb',
    spawnCheck: (f) => f.dominantFreq > 300 && f.rms > 0.15,
    movementStyle: 'flow',
  },
  glitchbit: {
    name: 'glitchbit',
    role: 'Noise/distortion',
    color: '#ef4444',
    dimColor: '#dc2626',
    spawnCheck: (f) => f.peak > 0.7 && f.rms > 0.3,
    movementStyle: 'glitch',
  },
  wavelet: {
    name: 'wavelet',
    role: 'Bass/sub frequencies',
    color: '#22c55e',
    dimColor: '#16a34a',
    spawnCheck: (f) => f.dominantFreq < 200 && f.rms > 0.15,
    movementStyle: 'wave',
  },
  codefly: {
    name: 'codefly',
    role: 'Code activity',
    color: '#fbbf24',
    dimColor: '#f59e0b',
    spawnCheck: (f) => f.isTyping,
    movementStyle: 'swarm',
  },
};

export function shouldSpawn(species: Species, features: AudioFeatures): boolean {
  return SPECIES[species].spawnCheck(features);
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/beatlings/species.ts src/lib/beatlings/species.test.ts
git commit -m "[Beatlings] Add 6 species definitions with audio-based spawn triggers + tests"
```

---

### Task 4: Evolution system (TDD)

**Files:**
- Create: `src/lib/beatlings/evolution.ts`, `src/lib/beatlings/evolution.test.ts`

- [ ] **Step 1: Write evolution tests**

Create `src/lib/beatlings/evolution.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { addXp, getStage, XP_THRESHOLDS, type BeatlingXp } from './evolution';

describe('Evolution', () => {
  it('starts at egg stage with zero XP', () => {
    const xp: BeatlingXp = { audio: 0, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('egg');
  });

  it('evolves to baby at threshold', () => {
    const xp: BeatlingXp = { audio: XP_THRESHOLDS.baby, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('baby');
  });

  it('evolves to adult', () => {
    const xp: BeatlingXp = { audio: XP_THRESHOLDS.adult, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('adult');
  });

  it('evolves to elder', () => {
    const xp: BeatlingXp = { audio: XP_THRESHOLDS.elder, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('elder');
  });

  it('evolves to ascended', () => {
    const xp: BeatlingXp = { audio: XP_THRESHOLDS.ascended, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('ascended');
  });

  it('adds XP correctly', () => {
    const xp: BeatlingXp = { audio: 0, complexity: 0, interaction: 0 };
    const updated = addXp(xp, 'audio', 10);
    expect(updated.audio).toBe(10);
    expect(updated.complexity).toBe(0);
  });

  it('total XP considers all sources', () => {
    const xp: BeatlingXp = { audio: 30, complexity: 30, interaction: 30 };
    expect(getStage(xp)).toBe('baby');
  });
});
```

- [ ] **Step 2: Implement evolution system**

Create `src/lib/beatlings/evolution.ts`:

```typescript
import type { Stage } from '../../types/beatling';

export interface BeatlingXp {
  audio: number;
  complexity: number;
  interaction: number;
}

export const XP_THRESHOLDS = {
  baby: 50,
  adult: 200,
  elder: 500,
  ascended: 1000,
} as const;

export function getTotalXp(xp: BeatlingXp): number {
  return xp.audio + xp.complexity + xp.interaction;
}

export function getStage(xp: BeatlingXp): Stage {
  const total = getTotalXp(xp);
  if (total >= XP_THRESHOLDS.ascended) return 'ascended';
  if (total >= XP_THRESHOLDS.elder) return 'elder';
  if (total >= XP_THRESHOLDS.adult) return 'adult';
  if (total >= XP_THRESHOLDS.baby) return 'baby';
  return 'egg';
}

export function addXp(xp: BeatlingXp, type: keyof BeatlingXp, amount: number): BeatlingXp {
  return { ...xp, [type]: xp[type] + amount };
}

/** Get a size multiplier based on stage */
export function getStageSizeMultiplier(stage: Stage): number {
  switch (stage) {
    case 'egg': return 0.5;
    case 'baby': return 0.7;
    case 'adult': return 1.0;
    case 'elder': return 1.2;
    case 'ascended': return 1.5;
  }
}

/** Get glow intensity based on stage */
export function getStageGlow(stage: Stage): number {
  switch (stage) {
    case 'egg': return 0;
    case 'baby': return 0.1;
    case 'adult': return 0.3;
    case 'elder': return 0.5;
    case 'ascended': return 1.0;
  }
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/beatlings/evolution.ts src/lib/beatlings/evolution.test.ts
git commit -m "[Beatlings] Add evolution system — XP accumulation and stage transitions + tests"
```

---

### Task 5: Collection (achievements) + audio bridge

**Files:**
- Create: `src/lib/beatlings/collection.ts`, `src/lib/beatlings/audio-bridge.ts`

- [ ] **Step 1: Create collection system**

Create `src/lib/beatlings/collection.ts`:

```typescript
import type { Achievement } from '../../types/beatling';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_beatling', name: 'First Beat', description: 'Your first Beatling was born', unlockedAt: null },
  { id: 'first_looplet', name: 'Loop Master', description: 'A Looplet appeared', unlockedAt: null },
  { id: 'first_synthling', name: 'Synth Wave', description: 'A Synthling emerged', unlockedAt: null },
  { id: 'first_glitchbit', name: 'Glitch Mode', description: 'A Glitchbit materialized', unlockedAt: null },
  { id: 'first_wavelet', name: 'Bass Drop', description: 'A Wavelet surfaced', unlockedAt: null },
  { id: 'first_codefly', name: 'Code Light', description: 'A Codefly appeared', unlockedAt: null },
  { id: 'full_ecosystem', name: 'Full Ecosystem', description: 'All 6 species active at once', unlockedAt: null },
  { id: 'ascended_one', name: 'Ascended One', description: 'A creature reached Ascended stage', unlockedAt: null },
  { id: 'silence_master', name: 'Silence Master', description: 'A creature dreamed for 60 seconds', unlockedAt: null },
];

export function checkAchievement(achievements: Achievement[], id: string): Achievement[] {
  return achievements.map((a) =>
    a.id === id && a.unlockedAt === null
      ? { ...a, unlockedAt: Date.now() }
      : a,
  );
}

export function isUnlocked(achievements: Achievement[], id: string): boolean {
  return achievements.some((a) => a.id === id && a.unlockedAt !== null);
}
```

- [ ] **Step 2: Create audio bridge**

Create `src/lib/beatlings/audio-bridge.ts`:

```typescript
import { AudioAnalyzer } from '../audio/analyzer';
import type { AudioFeatures } from './species';

/** Bridge between the audio analyser and the Beatling brain systems.
 * Extracts audio features each frame and converts to brain-friendly format. */
export class AudioBridge {
  private analyzer: AudioAnalyzer;
  private sampleRate: number;
  private prevRms = 0;
  private beatCooldown = 0;

  constructor(analyzer: AudioAnalyzer, sampleRate: number) {
    this.analyzer = analyzer;
    this.sampleRate = sampleRate;
  }

  /** Extract current audio features for species spawn checks and brain stimulation */
  getFeatures(isTyping: boolean): AudioFeatures {
    const rms = this.analyzer.getRmsLevel();
    const peak = this.analyzer.getPeakLevel();
    const dominantFreq = this.analyzer.getDominantFrequency(this.sampleRate);

    /* Simple beat detection: RMS spike above threshold */
    let hasBeat = false;
    if (this.beatCooldown <= 0 && rms > 0.25 && rms > this.prevRms * 1.5) {
      hasBeat = true;
      this.beatCooldown = 10; /* frames cooldown */
    }
    if (this.beatCooldown > 0) this.beatCooldown--;
    this.prevRms = rms;

    /* Complexity: ratio of active frequency bins above threshold */
    const freqData = this.analyzer.getFrequencyData();
    let activeBins = 0;
    for (let i = 0; i < freqData.length; i++) {
      if (freqData[i] > -60) activeBins++;
    }
    const complexity = activeBins / freqData.length;

    return { rms, peak, hasBeat, dominantFreq, complexity, isTyping };
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/beatlings/collection.ts src/lib/beatlings/audio-bridge.ts
git commit -m "[Beatlings] Add collection achievements and audio bridge"
```

---

### Task 6: BeatlingWorld manager + renderer

**Files:**
- Create: `src/lib/beatlings/renderer.ts`, `src/lib/beatlings/index.ts`

- [ ] **Step 1: Create renderer**

Create `src/lib/beatlings/renderer.ts`:

```typescript
import { VIZ_COLORS } from '../visualizers/colors';
import type { GolBrain } from './gol-brain';
import type { Species, Stage } from '../../types/beatling';
import { SPECIES } from './species';
import { getStageSizeMultiplier, getStageGlow } from './evolution';

interface CreatureRenderData {
  species: Species;
  stage: Stage;
  x: number;
  y: number;
  energy: number; /* 0-1, drives animation intensity */
}

/** Draw the Beatling ecosystem: GoL grid + creatures + neural overlay */
export function drawBeatlingWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gol: GolBrain | null,
  creatures: CreatureRenderData[],
  time: number,
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  /* Draw GoL grid */
  if (gol) {
    const cellW = width / gol.width;
    const cellH = height / gol.height;
    const grid = gol.getGrid();

    for (let y = 0; y < gol.height; y++) {
      for (let x = 0; x < gol.width; x++) {
        if (grid[y * gol.width + x] === 1) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
          ctx.fillRect(x * cellW, y * cellH, cellW - 0.5, cellH - 0.5);
        }
      }
    }
  }

  /* Draw creatures */
  for (const creature of creatures) {
    drawCreature(ctx, creature, time);
  }
}

function drawCreature(
  ctx: CanvasRenderingContext2D,
  creature: CreatureRenderData,
  time: number,
): void {
  const def = SPECIES[creature.species];
  const sizeMul = getStageSizeMultiplier(creature.stage);
  const glow = getStageGlow(creature.stage);
  const baseSize = 12 * sizeMul;

  /* Animation offset based on movement style */
  let offsetY = 0;
  const t = time / 1000;
  switch (def.movementStyle) {
    case 'bounce':
      offsetY = Math.abs(Math.sin(t * 4 + creature.x)) * 8 * creature.energy;
      break;
    case 'orbit':
      offsetY = Math.sin(t * 2 + creature.x) * 6 * creature.energy;
      break;
    case 'flow':
      offsetY = Math.sin(t * 1.5 + creature.y) * 4 * creature.energy;
      break;
    case 'glitch':
      offsetY = (Math.random() - 0.5) * 6 * creature.energy;
      break;
    case 'wave':
      offsetY = Math.sin(t * 0.8 + creature.x * 0.1) * 10 * creature.energy;
      break;
    case 'swarm':
      offsetY = Math.sin(t * 6 + creature.x * 0.5) * 3;
      break;
  }

  const drawX = creature.x;
  const drawY = creature.y - offsetY;

  /* Glow effect */
  if (glow > 0) {
    ctx.shadowColor = def.color;
    ctx.shadowBlur = glow * 20;
  }

  /* Body (pixel-art style: rounded rect) */
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.arc(drawX, drawY, baseSize, 0, Math.PI * 2);
  ctx.fill();

  /* Eyes */
  ctx.fillStyle = VIZ_COLORS.white;
  const eyeOffset = baseSize * 0.3;
  const eyeSize = baseSize * 0.25;
  ctx.beginPath();
  ctx.arc(drawX - eyeOffset, drawY - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
  ctx.arc(drawX + eyeOffset, drawY - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  /* Pupils */
  ctx.fillStyle = VIZ_COLORS.bg;
  const pupilSize = eyeSize * 0.5;
  ctx.beginPath();
  ctx.arc(drawX - eyeOffset + 1, drawY - eyeOffset * 0.5, pupilSize, 0, Math.PI * 2);
  ctx.arc(drawX + eyeOffset + 1, drawY - eyeOffset * 0.5, pupilSize, 0, Math.PI * 2);
  ctx.fill();

  /* Reset shadow */
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  /* Stage indicator (egg has shell, ascended has halo) */
  if (creature.stage === 'egg') {
    ctx.strokeStyle = def.dimColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(drawX, drawY, baseSize + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (creature.stage === 'ascended') {
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5 + Math.sin(t * 3) * 0.3;
    ctx.beginPath();
    ctx.arc(drawX, drawY, baseSize + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
```

- [ ] **Step 2: Create BeatlingWorld manager**

Create `src/lib/beatlings/index.ts`:

```typescript
import { GolBrain } from './gol-brain';
import { AudioBridge } from './audio-bridge';
import { SPECIES, shouldSpawn, type AudioFeatures } from './species';
import { addXp, getStage, type BeatlingXp } from './evolution';
import { ACHIEVEMENTS, checkAchievement, isUnlocked } from './collection';
import { drawBeatlingWorld } from './renderer';
import { AudioAnalyzer } from '../audio/analyzer';
import type { Species, Stage, Achievement } from '../../types/beatling';

export { GolBrain } from './gol-brain';
export { SPECIES, shouldSpawn } from './species';
export { addXp, getStage, XP_THRESHOLDS } from './evolution';
export { ACHIEVEMENTS, checkAchievement, isUnlocked } from './collection';
export { AudioBridge } from './audio-bridge';
export { drawBeatlingWorld } from './renderer';

interface Creature {
  id: string;
  species: Species;
  stage: Stage;
  xp: BeatlingXp;
  x: number;
  y: number;
  energy: number;
  born: number;
}

/** Manages the Beatling ecosystem — spawning, updating, rendering */
export class BeatlingWorld {
  private creatures: Creature[] = [];
  private gol: GolBrain;
  private bridge: AudioBridge | null = null;
  private achievements: Achievement[] = [...ACHIEVEMENTS];
  private golTickCounter = 0;
  private spawnCooldowns: Map<Species, number> = new Map();

  constructor(golWidth = 64, golHeight = 64) {
    this.gol = new GolBrain(golWidth, golHeight);
  }

  setAudioBridge(analyzer: AudioAnalyzer, sampleRate: number): void {
    this.bridge = new AudioBridge(analyzer, sampleRate);
  }

  /** Update the ecosystem one frame */
  update(isTyping: boolean): void {
    const features = this.bridge?.getFeatures(isTyping) ?? {
      rms: 0, peak: 0, hasBeat: false, dominantFreq: 0, complexity: 0, isTyping,
    };

    /* Update GoL (every 3 frames for performance) */
    this.golTickCounter++;
    if (this.golTickCounter % 3 === 0) {
      this.injectAudioIntoGol(features);
      this.gol.step();
    }

    /* Try spawn new creatures */
    this.trySpawn(features);

    /* Update existing creatures */
    for (const creature of this.creatures) {
      creature.energy = features.rms;
      /* Accumulate XP */
      if (features.rms > 0.1) {
        creature.xp = addXp(creature.xp, 'audio', features.rms * 0.1);
      }
      if (features.complexity > 0.3) {
        creature.xp = addXp(creature.xp, 'complexity', features.complexity * 0.05);
      }
      creature.stage = getStage(creature.xp);
    }

    /* Check achievements */
    this.checkAchievements();

    /* Despawn creatures in silence (after 10s of no audio) */
    if (features.rms < 0.01 && !features.isTyping) {
      this.creatures = this.creatures.filter((c) => {
        const alive = Date.now() - c.born < 10000 || c.stage !== 'egg';
        return alive;
      });
    }
  }

  /** Render the world to a canvas */
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
    const renderData = this.creatures.map((c) => ({
      species: c.species,
      stage: c.stage,
      x: c.x,
      y: c.y,
      energy: c.energy,
    }));
    drawBeatlingWorld(ctx, width, height, this.gol, renderData, time);
  }

  getCreatures(): Creature[] { return this.creatures; }
  getAchievements(): Achievement[] { return this.achievements; }
  getGol(): GolBrain { return this.gol; }

  private trySpawn(features: AudioFeatures): void {
    const allSpecies: Species[] = ['beatling', 'looplet', 'synthling', 'glitchbit', 'wavelet', 'codefly'];
    for (const species of allSpecies) {
      const cooldown = this.spawnCooldowns.get(species) ?? 0;
      if (cooldown > 0) {
        this.spawnCooldowns.set(species, cooldown - 1);
        continue;
      }
      /* Max 2 of each species */
      const count = this.creatures.filter((c) => c.species === species).length;
      if (count >= 2) continue;

      if (shouldSpawn(species, features)) {
        this.creatures.push({
          id: `${species}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          species,
          stage: 'egg',
          xp: { audio: 0, complexity: 0, interaction: 0 },
          x: 50 + Math.random() * 300,
          y: 50 + Math.random() * 150,
          energy: features.rms,
          born: Date.now(),
        });
        this.spawnCooldowns.set(species, 120); /* ~2 second cooldown at 60fps */
      }
    }
  }

  private injectAudioIntoGol(features: AudioFeatures): void {
    const cx = Math.floor(this.gol.width / 2);
    const cy = Math.floor(this.gol.height / 2);

    if (features.hasBeat) {
      this.gol.injectPulse(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20, 3);
    }
    if (features.dominantFreq < 200 && features.rms > 0.15) {
      this.gol.injectGlider(Math.random() * this.gol.width, Math.random() * this.gol.height);
    }
    if (features.dominantFreq > 500 && features.rms > 0.15) {
      this.gol.injectOscillator(Math.random() * this.gol.width, Math.random() * this.gol.height);
    }
    /* Volume drives general cell injection */
    if (features.rms > 0.3) {
      const count = Math.floor(features.rms * 5);
      for (let i = 0; i < count; i++) {
        this.gol.setCell(
          Math.floor(Math.random() * this.gol.width),
          Math.floor(Math.random() * this.gol.height),
          true,
        );
      }
    }
  }

  private checkAchievements(): void {
    const speciesPresent = new Set(this.creatures.map((c) => c.species));

    /* First-species achievements */
    for (const species of speciesPresent) {
      const achievementId = `first_${species}`;
      if (!isUnlocked(this.achievements, achievementId)) {
        this.achievements = checkAchievement(this.achievements, achievementId);
      }
    }

    /* Full ecosystem */
    if (speciesPresent.size === 6 && !isUnlocked(this.achievements, 'full_ecosystem')) {
      this.achievements = checkAchievement(this.achievements, 'full_ecosystem');
    }

    /* Ascended */
    if (this.creatures.some((c) => c.stage === 'ascended') && !isUnlocked(this.achievements, 'ascended_one')) {
      this.achievements = checkAchievement(this.achievements, 'ascended_one');
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/beatlings/renderer.ts src/lib/beatlings/index.ts
git commit -m "[Beatlings] Add BeatlingWorld manager with renderer, spawning, GoL audio injection"
```

---

### Task 7: BeatlingPanel organism + wire into dashboard

**Files:**
- Create: `src/components/organisms/BeatlingPanel.tsx`
- Modify: `src/components/organisms/VisualizerDashboard.tsx`, `src/components/organisms/index.ts`

- [ ] **Step 1: Create BeatlingPanel**

Create `src/components/organisms/BeatlingPanel.tsx`:

```tsx
import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { BeatlingWorld } from '../../lib/beatlings';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getMasterAnalyser, getSharedContext } from '../../lib/audio/context';

/** The Beatling ecosystem visualizer panel */
export function BeatlingPanel() {
  const worldRef = useRef<BeatlingWorld | null>(null);

  useEffect(() => {
    worldRef.current = new BeatlingWorld(64, 64);
    try {
      const analyser = getMasterAnalyser();
      const ctx = getSharedContext();
      worldRef.current.setAudioBridge(new AudioAnalyzer(analyser), ctx.sampleRate);
    } catch { /* AudioContext not yet created */ }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (!worldRef.current) return;

    /* Try to set up audio bridge if not yet done */
    try {
      const analyser = getMasterAnalyser();
      const audioCtx = getSharedContext();
      worldRef.current.setAudioBridge(new AudioAnalyzer(analyser), audioCtx.sampleRate);
    } catch { /* ok */ }

    worldRef.current.update(false);
    worldRef.current.draw(ctx, width, height, time);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
```

- [ ] **Step 2: Wire into VisualizerDashboard**

In `src/components/organisms/VisualizerDashboard.tsx`:
- Import `BeatlingPanel`
- Replace the beatlings placeholder with `<BeatlingPanel />`

- [ ] **Step 3: Update barrel export**

Add `BeatlingPanel` to `src/components/organisms/index.ts`.

- [ ] **Step 4: Run tests + build**

```bash
npm run test && npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Commit and push**

```bash
git add src/components/organisms/BeatlingPanel.tsx src/components/organisms/VisualizerDashboard.tsx src/components/organisms/index.ts
git commit -m "[Beatlings] Add BeatlingPanel organism and wire into visualizer dashboard"
git push
```

---

## Phase 6 Completion Criteria

After all 7 tasks:
- Brain files copied and adapted from wm-lifegame (neuron, synapse, neural-network, consciousness, dreams)
- Conway's Game of Life brain (128x128 cap) with audio-reactive injection (pulse, glider, oscillator)
- 6 species with audio-based spawn triggers
- Evolution system: XP → stage transitions (egg → baby → adult → elder → ascended)
- Collection system with 9 achievements
- Audio bridge extracting features (RMS, peak, beat, frequency, complexity)
- Canvas 2D renderer: GoL grid + animated creatures with species-specific movement
- BeatlingWorld manager orchestrating spawn/update/draw cycle
- Wired into visualizer dashboard as toggleable panel

**Next:** Phase 7 — Persistence & Sharing (IndexedDB autosave, URL sharing, Gist integration, audio recording)
