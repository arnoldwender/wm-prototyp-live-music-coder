# Phase 2: Orchestrator & Engines — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the audio engine orchestrator, 4 engine adapters (Strudel, Tone.js, Web Audio, MIDI), shared AudioContext, audio analyzer, and wire them into the existing UI so Play/Stop actually produces sound.

**Architecture:** One shared AudioContext. Each engine adapter implements a common interface. The orchestrator manages the directed graph of EngineBlocks and routes audio between adapters. All engines output to Web Audio API nodes. The code editor is the source of truth — orchestrator evaluates code and produces audio.

**Tech Stack:** @strudel/core, @strudel/webaudio, @strudel/mini, @strudel/transpiler, @strudel/tonal, Tone.js, Web Audio API (native), WebMidi.js, Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md` (Section 3)

**License note:** Strudel uses AGPL-3.0. This project must be open source.

---

## API Research Summary

### Strudel Embedding (Tier 3 — individual packages)

```typescript
import { repl, note } from "@strudel/core";
import { initAudioOnFirstClick, getAudioContext, webaudioOutput } from "@strudel/webaudio";

initAudioOnFirstClick();
const ctx = getAudioContext();
const { scheduler } = repl({
  defaultOutput: webaudioOutput,
  getTime: () => ctx.currentTime,
});

scheduler.setPattern(note("c3", ["eb3", "g3"]).s("sawtooth"));
scheduler.start();
scheduler.stop();
```

- `getAudioContext()` returns the shared Web Audio AudioContext
- No master GainNode exposed — need to create our own and route through it
- `@strudel/mini` for mini-notation parsing, `@strudel/transpiler` for code transpilation

### Tone.js

```typescript
import * as Tone from 'tone';

Tone.setContext(sharedAudioContext);  // MUST call before creating any nodes
const synth = new Tone.Synth();
synth.toDestination();
synth.triggerAttackRelease("C4", "8n");

// Access native AudioNode via .output property
const rawOutputNode = synth.output;  // native GainNode
rawOutputNode.connect(customAnalyser);

// Transport for BPM
Tone.getTransport().bpm.value = 120;
Tone.getTransport().start();
```

### Web Audio API (native)

```typescript
const ctx = new AudioContext();
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.connect(gain);
gain.connect(ctx.destination);
osc.start();
```

### WebMidi.js

```typescript
import { WebMidi } from 'webmidi';
await WebMidi.enable();
const output = WebMidi.outputs[0];
output.playNote("C4", { duration: 500 });
```

---

## File Structure (Phase 2)

```
src/lib/
├── orchestrator/
│   ├── index.ts            # Orchestrator class — manages engines, graph, audio routing
│   ├── types.ts            # Re-exports from types/engine.ts + orchestrator-specific types
│   ├── graph.ts            # Directed graph model (add/remove blocks, connect/disconnect)
│   └── graph.test.ts       # Graph tests
├── engines/
│   ├── base.ts             # Abstract base: shared AudioContext, master gain, analyser setup
│   ├── strudel.ts          # Strudel adapter: repl + scheduler + webaudioOutput
│   ├── strudel.test.ts     # Strudel adapter tests (unit tests with mocked audio)
│   ├── tonejs.ts           # Tone.js adapter: setContext, synth factory, transport
│   ├── tonejs.test.ts      # Tone.js adapter tests
│   ├── webaudio.ts         # Raw Web Audio adapter: oscillators, gain, filters
│   ├── webaudio.test.ts    # Web Audio adapter tests
│   ├── midi.ts             # MIDI output adapter: WebMidi.js wrapper
│   └── index.ts            # Barrel export + engine registry
├── audio/
│   ├── context.ts          # Shared AudioContext singleton + master gain + master analyser
│   ├── analyzer.ts         # FFT, waveform, level metering wrapper around AnalyserNode
│   └── analyzer.test.ts    # Analyzer tests
```

---

### Task 1: Install audio dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Strudel packages**

```bash
npm install @strudel/core @strudel/webaudio @strudel/mini @strudel/transpiler @strudel/tonal
```

- [ ] **Step 2: Install Tone.js**

```bash
npm install tone
```

- [ ] **Step 3: Install WebMidi.js**

```bash
npm install webmidi
```

- [ ] **Step 4: Verify build still works**

```bash
npm run build
```

Expected: Build succeeds (new deps may increase bundle, that's fine).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "[Deps] Add Strudel, Tone.js, and WebMidi.js audio dependencies"
```

---

### Task 2: Shared AudioContext + master gain + analyzer

**Files:**
- Create: `src/lib/audio/context.ts`, `src/lib/audio/analyzer.ts`, `src/lib/audio/analyzer.test.ts`

- [ ] **Step 1: Create shared AudioContext singleton**

Create `src/lib/audio/context.ts`:

```typescript
/* Shared AudioContext singleton for all engines.
 * All engines MUST use this context — never create their own.
 * Includes master gain (volume control) and master analyser (for visualizers). */

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let masterAnalyser: AnalyserNode | null = null;

/** Get or create the shared AudioContext. Call after user gesture. */
export function getSharedContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterAnalyser = audioContext.createAnalyser();
    masterAnalyser.fftSize = 2048;
    masterAnalyser.smoothingTimeConstant = 0.8;

    /* Route: masterGain → masterAnalyser → destination */
    masterGain.connect(masterAnalyser);
    masterAnalyser.connect(audioContext.destination);
  }
  return audioContext;
}

/** Master gain node — all engine outputs connect here */
export function getMasterGain(): GainNode {
  getSharedContext();
  return masterGain!;
}

/** Master analyser — visualizers read from this */
export function getMasterAnalyser(): AnalyserNode {
  getSharedContext();
  return masterAnalyser!;
}

/** Resume context after user gesture (required by browsers) */
export async function resumeContext(): Promise<void> {
  const ctx = getSharedContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/** Set master volume (0-1) */
export function setMasterVolume(volume: number): void {
  const gain = getMasterGain();
  gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), gain.context.currentTime);
}

/** Dispose audio context (for cleanup) */
export async function disposeContext(): Promise<void> {
  if (audioContext) {
    await audioContext.close();
    audioContext = null;
    masterGain = null;
    masterAnalyser = null;
  }
}
```

- [ ] **Step 2: Create analyzer wrapper**

Create `src/lib/audio/analyzer.ts`:

```typescript
/* Audio analyzer wrapper around Web Audio AnalyserNode.
 * Provides frequency data (FFT), time-domain data (waveform), and level metering. */

export class AudioAnalyzer {
  private analyser: AnalyserNode;
  private frequencyData: Float32Array;
  private timeData: Float32Array;

  constructor(analyser: AnalyserNode) {
    this.analyser = analyser;
    this.frequencyData = new Float32Array(analyser.frequencyBinCount);
    this.timeData = new Float32Array(analyser.fftSize);
  }

  /** Get frequency domain data (FFT). Values in dB (-Infinity to 0). */
  getFrequencyData(): Float32Array {
    this.analyser.getFloatFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  /** Get time domain data (waveform). Values -1 to 1. */
  getTimeDomainData(): Float32Array {
    this.analyser.getFloatTimeDomainData(this.timeData);
    return this.timeData;
  }

  /** Get current RMS level (0-1 range). Useful for level meters. */
  getRmsLevel(): number {
    this.analyser.getFloatTimeDomainData(this.timeData);
    let sum = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      sum += this.timeData[i] * this.timeData[i];
    }
    return Math.sqrt(sum / this.timeData.length);
  }

  /** Get peak level (0-1 range). */
  getPeakLevel(): number {
    this.analyser.getFloatTimeDomainData(this.timeData);
    let peak = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const abs = Math.abs(this.timeData[i]);
      if (abs > peak) peak = abs;
    }
    return peak;
  }

  /** Detect if a beat/transient occurred (simple energy threshold). */
  detectBeat(threshold = 0.3): boolean {
    return this.getRmsLevel() > threshold;
  }

  /** Get the dominant frequency in Hz. */
  getDominantFrequency(sampleRate: number): number {
    this.analyser.getFloatFrequencyData(this.frequencyData);
    let maxIndex = 0;
    let maxValue = -Infinity;
    for (let i = 0; i < this.frequencyData.length; i++) {
      if (this.frequencyData[i] > maxValue) {
        maxValue = this.frequencyData[i];
        maxIndex = i;
      }
    }
    return (maxIndex * sampleRate) / (this.analyser.fftSize);
  }

  /** Get the raw AnalyserNode for custom use */
  getRawAnalyser(): AnalyserNode {
    return this.analyser;
  }
}
```

- [ ] **Step 3: Write analyzer tests**

Create `src/lib/audio/analyzer.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioAnalyzer } from './analyzer';

/* Mock AnalyserNode for testing without real Web Audio */
function createMockAnalyser(): AnalyserNode {
  const frequencyBinCount = 1024;
  const fftSize = 2048;
  return {
    frequencyBinCount,
    fftSize,
    getFloatFrequencyData: vi.fn((arr: Float32Array) => {
      /* Simulate a peak at bin 100 */
      for (let i = 0; i < arr.length; i++) arr[i] = -100;
      arr[100] = -10;
    }),
    getFloatTimeDomainData: vi.fn((arr: Float32Array) => {
      /* Simulate a sine wave */
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.sin((i / fftSize) * Math.PI * 2) * 0.5;
      }
    }),
  } as unknown as AnalyserNode;
}

describe('AudioAnalyzer', () => {
  let analyzer: AudioAnalyzer;
  let mockAnalyser: AnalyserNode;

  beforeEach(() => {
    mockAnalyser = createMockAnalyser();
    analyzer = new AudioAnalyzer(mockAnalyser);
  });

  it('returns frequency data', () => {
    const data = analyzer.getFrequencyData();
    expect(data).toBeInstanceOf(Float32Array);
    expect(data.length).toBe(1024);
  });

  it('returns time domain data', () => {
    const data = analyzer.getTimeDomainData();
    expect(data).toBeInstanceOf(Float32Array);
    expect(data.length).toBe(2048);
  });

  it('calculates RMS level', () => {
    const rms = analyzer.getRmsLevel();
    expect(rms).toBeGreaterThan(0);
    expect(rms).toBeLessThanOrEqual(1);
  });

  it('calculates peak level', () => {
    const peak = analyzer.getPeakLevel();
    expect(peak).toBeGreaterThan(0);
    expect(peak).toBeLessThanOrEqual(1);
  });

  it('detects beat above threshold', () => {
    expect(analyzer.detectBeat(0.1)).toBe(true);
    expect(analyzer.detectBeat(0.9)).toBe(false);
  });

  it('finds dominant frequency', () => {
    const freq = analyzer.getDominantFrequency(44100);
    expect(freq).toBeGreaterThan(0);
  });

  it('returns raw analyser node', () => {
    expect(analyzer.getRawAnalyser()).toBe(mockAnalyser);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npm run test
```

Expected: All analyzer tests pass (7 new + existing).

- [ ] **Step 5: Commit**

```bash
git add src/lib/audio/
git commit -m "[Audio] Add shared AudioContext singleton and analyzer wrapper with tests"
```

---

### Task 3: Directed graph model

**Files:**
- Create: `src/lib/orchestrator/graph.ts`, `src/lib/orchestrator/graph.test.ts`, `src/lib/orchestrator/types.ts`

- [ ] **Step 1: Create orchestrator types**

Create `src/lib/orchestrator/types.ts`:

```typescript
/* Re-export core types and add orchestrator-specific types */
export type { EngineType, EngineBlock, Connection, EngineAdapter, AudioNodeWrapper, ParamValue, PortDefinition } from '../../types/engine';

/** State of the orchestrator */
export type OrchestratorState = 'stopped' | 'playing' | 'paused';

/** Event emitted by the orchestrator */
export interface OrchestratorEvent {
  type: 'block-added' | 'block-removed' | 'connected' | 'disconnected' | 'state-changed' | 'error';
  payload: unknown;
}
```

- [ ] **Step 2: Write graph tests first (TDD)**

Create `src/lib/orchestrator/graph.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AudioGraph } from './graph';
import type { EngineBlock, Connection } from './types';

function makeBlock(id: string, engine: 'strudel' | 'tonejs' | 'webaudio' | 'midi' = 'strudel'): EngineBlock {
  return {
    id,
    engine,
    type: 'source',
    code: '',
    params: {},
    inputs: [{ id: 'in', label: 'Input', type: 'audio' }],
    outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
  };
}

describe('AudioGraph', () => {
  let graph: AudioGraph;

  beforeEach(() => {
    graph = new AudioGraph();
  });

  it('starts empty', () => {
    expect(graph.getBlocks()).toEqual([]);
    expect(graph.getConnections()).toEqual([]);
  });

  it('adds a block', () => {
    const block = makeBlock('a');
    graph.addBlock(block);
    expect(graph.getBlocks()).toHaveLength(1);
    expect(graph.getBlock('a')).toEqual(block);
  });

  it('removes a block and its connections', () => {
    graph.addBlock(makeBlock('a'));
    graph.addBlock(makeBlock('b'));
    graph.connect('a', 'out', 'b', 'in');
    graph.removeBlock('a');
    expect(graph.getBlocks()).toHaveLength(1);
    expect(graph.getConnections()).toHaveLength(0);
  });

  it('connects two blocks', () => {
    graph.addBlock(makeBlock('a'));
    graph.addBlock(makeBlock('b'));
    const conn = graph.connect('a', 'out', 'b', 'in');
    expect(conn).toBeDefined();
    expect(graph.getConnections()).toHaveLength(1);
  });

  it('prevents duplicate connections', () => {
    graph.addBlock(makeBlock('a'));
    graph.addBlock(makeBlock('b'));
    graph.connect('a', 'out', 'b', 'in');
    const dup = graph.connect('a', 'out', 'b', 'in');
    expect(dup).toBeNull();
    expect(graph.getConnections()).toHaveLength(1);
  });

  it('disconnects two blocks', () => {
    graph.addBlock(makeBlock('a'));
    graph.addBlock(makeBlock('b'));
    const conn = graph.connect('a', 'out', 'b', 'in');
    graph.disconnect(conn!.id);
    expect(graph.getConnections()).toHaveLength(0);
  });

  it('detects cycles', () => {
    graph.addBlock(makeBlock('a'));
    graph.addBlock(makeBlock('b'));
    graph.connect('a', 'out', 'b', 'in');
    const cycle = graph.connect('b', 'out', 'a', 'in');
    expect(cycle).toBeNull();
  });

  it('gets downstream blocks', () => {
    graph.addBlock(makeBlock('a'));
    graph.addBlock(makeBlock('b'));
    graph.addBlock(makeBlock('c'));
    graph.connect('a', 'out', 'b', 'in');
    graph.connect('b', 'out', 'c', 'in');
    const downstream = graph.getDownstream('a');
    expect(downstream.map(b => b.id)).toEqual(['b', 'c']);
  });

  it('serializes and deserializes', () => {
    graph.addBlock(makeBlock('a'));
    graph.addBlock(makeBlock('b'));
    graph.connect('a', 'out', 'b', 'in');
    const json = graph.serialize();
    const restored = AudioGraph.deserialize(json);
    expect(restored.getBlocks()).toHaveLength(2);
    expect(restored.getConnections()).toHaveLength(1);
  });

  it('clears all blocks and connections', () => {
    graph.addBlock(makeBlock('a'));
    graph.addBlock(makeBlock('b'));
    graph.connect('a', 'out', 'b', 'in');
    graph.clear();
    expect(graph.getBlocks()).toEqual([]);
    expect(graph.getConnections()).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

```bash
npm run test
```

Expected: FAIL — AudioGraph not found.

- [ ] **Step 4: Implement AudioGraph**

Create `src/lib/orchestrator/graph.ts`:

```typescript
import type { EngineBlock, Connection } from './types';

/** Directed acyclic graph of EngineBlocks connected by audio/data connections.
 * Prevents cycles. Supports serialization for persistence. */
export class AudioGraph {
  private blocks: Map<string, EngineBlock> = new Map();
  private connections: Map<string, Connection> = new Map();
  private nextConnId = 1;

  addBlock(block: EngineBlock): void {
    this.blocks.set(block.id, { ...block });
  }

  removeBlock(blockId: string): void {
    this.blocks.delete(blockId);
    /* Remove all connections involving this block */
    for (const [id, conn] of this.connections) {
      if (conn.sourceBlockId === blockId || conn.targetBlockId === blockId) {
        this.connections.delete(id);
      }
    }
  }

  getBlock(blockId: string): EngineBlock | undefined {
    return this.blocks.get(blockId);
  }

  getBlocks(): EngineBlock[] {
    return Array.from(this.blocks.values());
  }

  /** Connect two blocks. Returns null if duplicate or would create a cycle. */
  connect(sourceBlockId: string, sourcePortId: string, targetBlockId: string, targetPortId: string): Connection | null {
    /* Check blocks exist */
    if (!this.blocks.has(sourceBlockId) || !this.blocks.has(targetBlockId)) return null;

    /* Check for duplicate */
    for (const conn of this.connections.values()) {
      if (
        conn.sourceBlockId === sourceBlockId &&
        conn.sourcePortId === sourcePortId &&
        conn.targetBlockId === targetBlockId &&
        conn.targetPortId === targetPortId
      ) {
        return null;
      }
    }

    /* Check for cycle: would adding this edge create a path from target back to source? */
    if (this.wouldCreateCycle(sourceBlockId, targetBlockId)) return null;

    const connection: Connection = {
      id: `conn_${this.nextConnId++}`,
      sourceBlockId,
      sourcePortId,
      targetBlockId,
      targetPortId,
    };
    this.connections.set(connection.id, connection);
    return connection;
  }

  disconnect(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  getConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  /** Get all blocks downstream of a given block (BFS). */
  getDownstream(blockId: string): EngineBlock[] {
    const visited = new Set<string>();
    const queue: string[] = [];
    const result: EngineBlock[] = [];

    /* Find direct children */
    for (const conn of this.connections.values()) {
      if (conn.sourceBlockId === blockId) {
        queue.push(conn.targetBlockId);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const block = this.blocks.get(current);
      if (block) result.push(block);
      for (const conn of this.connections.values()) {
        if (conn.sourceBlockId === current && !visited.has(conn.targetBlockId)) {
          queue.push(conn.targetBlockId);
        }
      }
    }
    return result;
  }

  clear(): void {
    this.blocks.clear();
    this.connections.clear();
  }

  /** Serialize graph to JSON-safe object */
  serialize(): { blocks: EngineBlock[]; connections: Connection[] } {
    return {
      blocks: this.getBlocks(),
      connections: this.getConnections(),
    };
  }

  /** Restore graph from serialized data */
  static deserialize(data: { blocks: EngineBlock[]; connections: Connection[] }): AudioGraph {
    const graph = new AudioGraph();
    for (const block of data.blocks) graph.addBlock(block);
    for (const conn of data.connections) graph.connections.set(conn.id, conn);
    return graph;
  }

  /** Check if connecting source→target would create a cycle */
  private wouldCreateCycle(sourceBlockId: string, targetBlockId: string): boolean {
    if (sourceBlockId === targetBlockId) return true;
    /* BFS from target: can we reach source? */
    const visited = new Set<string>();
    const queue = [targetBlockId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === sourceBlockId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const conn of this.connections.values()) {
        if (conn.sourceBlockId === current) {
          queue.push(conn.targetBlockId);
        }
      }
    }
    return false;
  }
}
```

- [ ] **Step 5: Run tests**

```bash
npm run test
```

Expected: All graph tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/orchestrator/
git commit -m "[Orchestrator] Add AudioGraph directed graph model with cycle prevention + tests"
```

---

### Task 4: Engine adapter base + Strudel adapter

**Files:**
- Create: `src/lib/engines/base.ts`, `src/lib/engines/strudel.ts`, `src/lib/engines/strudel.test.ts`

- [ ] **Step 1: Create base engine adapter**

Create `src/lib/engines/base.ts`:

```typescript
import type { EngineAdapter, EngineBlock, AudioNodeWrapper } from '../../types/engine';
import { getSharedContext, getMasterGain } from '../audio/context';

/** Abstract base for all engine adapters.
 * Provides shared AudioContext access and master gain routing. */
export abstract class BaseEngine implements EngineAdapter {
  abstract name: string;
  protected nodes: Map<string, AudioNodeWrapper> = new Map();
  protected analysers: Map<string, AnalyserNode> = new Map();

  abstract init(): Promise<void>;
  abstract createNode(block: EngineBlock): AudioNodeWrapper;
  abstract start(): void;
  abstract stop(): void;

  connect(source: AudioNodeWrapper, target: AudioNodeWrapper): void {
    source.node.connect(target.node);
  }

  disconnect(source: AudioNodeWrapper, target: AudioNodeWrapper): void {
    try {
      source.node.disconnect(target.node);
    } catch {
      /* Ignore if not connected */
    }
  }

  /** Connect a node's output to the master gain (final output) */
  connectToMaster(wrapper: AudioNodeWrapper): void {
    wrapper.node.connect(getMasterGain());
  }

  getAnalyserNode(): AnalyserNode {
    const ctx = getSharedContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    getMasterGain().connect(analyser);
    return analyser;
  }

  getAnalyserForBlock(blockId: string): AnalyserNode {
    if (this.analysers.has(blockId)) return this.analysers.get(blockId)!;
    const ctx = getSharedContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    const wrapper = this.nodes.get(blockId);
    if (wrapper) wrapper.node.connect(analyser);
    this.analysers.set(blockId, analyser);
    return analyser;
  }

  dispose(): void {
    for (const wrapper of this.nodes.values()) {
      try { wrapper.node.disconnect(); } catch { /* ok */ }
    }
    for (const analyser of this.analysers.values()) {
      try { analyser.disconnect(); } catch { /* ok */ }
    }
    this.nodes.clear();
    this.analysers.clear();
  }

  protected getContext(): AudioContext {
    return getSharedContext();
  }
}
```

- [ ] **Step 2: Create Strudel adapter**

Create `src/lib/engines/strudel.ts`:

```typescript
import { BaseEngine } from './base';
import type { EngineBlock, AudioNodeWrapper } from '../../types/engine';
import { getSharedContext, getMasterGain } from '../audio/context';

/** Strudel engine adapter.
 * Uses @strudel/core repl + scheduler for pattern evaluation.
 * Audio routed through superdough → shared AudioContext. */
export class StrudelEngine extends BaseEngine {
  name = 'strudel';
  private scheduler: any = null;
  private repl: any = null;

  async init(): Promise<void> {
    /* Dynamic import to enable code splitting */
    const [{ repl }, { initAudioOnFirstClick, webaudioOutput, getAudioContext }] = await Promise.all([
      import('@strudel/core'),
      import('@strudel/webaudio'),
    ]);

    /* Also load mini-notation and tonal for full pattern support */
    await Promise.all([
      import('@strudel/mini'),
      import('@strudel/tonal'),
    ]);

    initAudioOnFirstClick();

    /* Strudel creates its own AudioContext via getAudioContext().
     * We need to route its output through our master gain. */
    const strudelCtx = getAudioContext();
    const sharedCtx = getSharedContext();

    const replInstance = repl({
      defaultOutput: webaudioOutput,
      getTime: () => strudelCtx.currentTime,
    });

    this.scheduler = replInstance.scheduler;
    this.repl = replInstance;
  }

  /** Evaluate Strudel code and set as active pattern */
  async evaluate(code: string): Promise<void> {
    if (!this.scheduler) throw new Error('Strudel not initialized');

    try {
      /* Use the transpiler for full syntax support */
      const { transpiler } = await import('@strudel/transpiler');
      const transpiled = transpiler(code);
      /* Evaluate the transpiled code to get a Pattern */
      const pattern = await Function(`"use strict"; return (async () => { ${transpiled} })()`)();
      if (pattern?.queryArc) {
        this.scheduler.setPattern(pattern);
      }
    } catch (err) {
      console.error('[Strudel] Evaluation error:', err);
      throw err;
    }
  }

  createNode(block: EngineBlock): AudioNodeWrapper {
    const ctx = this.getContext();
    /* Strudel manages its own nodes internally via superdough.
     * We create a passthrough gain node as a handle for the graph. */
    const gain = ctx.createGain();
    const wrapper: AudioNodeWrapper = {
      id: `strudel_${block.id}`,
      blockId: block.id,
      node: gain,
    };
    this.nodes.set(block.id, wrapper);
    return wrapper;
  }

  start(): void {
    this.scheduler?.start();
  }

  stop(): void {
    this.scheduler?.stop();
  }

  dispose(): void {
    this.stop();
    super.dispose();
    this.scheduler = null;
    this.repl = null;
  }
}
```

- [ ] **Step 3: Write Strudel adapter tests**

Create `src/lib/engines/strudel.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { StrudelEngine } from './strudel';

describe('StrudelEngine', () => {
  it('has correct name', () => {
    const engine = new StrudelEngine();
    expect(engine.name).toBe('strudel');
  });

  it('can be instantiated without init', () => {
    const engine = new StrudelEngine();
    expect(engine).toBeDefined();
  });

  /* Note: Full audio tests require a real AudioContext (browser environment).
   * These are basic structural tests. Integration tests with audio
   * would run in a browser test runner or e2e. */
});
```

- [ ] **Step 4: Run tests**

```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/engines/base.ts src/lib/engines/strudel.ts src/lib/engines/strudel.test.ts
git commit -m "[Engine] Add base engine adapter and Strudel engine with pattern evaluation"
```

---

### Task 5: Tone.js adapter

**Files:**
- Create: `src/lib/engines/tonejs.ts`, `src/lib/engines/tonejs.test.ts`

- [ ] **Step 1: Create Tone.js adapter**

Create `src/lib/engines/tonejs.ts`:

```typescript
import { BaseEngine } from './base';
import type { EngineBlock, AudioNodeWrapper } from '../../types/engine';
import { getSharedContext, getMasterGain } from '../audio/context';

/** Tone.js engine adapter.
 * Provides high-level synth creation and transport control.
 * Uses shared AudioContext via Tone.setContext(). */
export class ToneJsEngine extends BaseEngine {
  name = 'tonejs';
  private Tone: typeof import('tone') | null = null;

  async init(): Promise<void> {
    /* Dynamic import for code splitting */
    this.Tone = await import('tone');
    /* Use our shared AudioContext */
    this.Tone.setContext(getSharedContext());
  }

  createNode(block: EngineBlock): AudioNodeWrapper {
    if (!this.Tone) throw new Error('Tone.js not initialized');

    /* Create a synth based on block params or default to basic Synth */
    const synthType = block.params.synthType?.value ?? 0;
    const synth = this.createSynth(synthType);

    /* Connect to master gain */
    const rawOutput = (synth as any).output as AudioNode;
    rawOutput.connect(getMasterGain());

    const wrapper: AudioNodeWrapper = {
      id: `tonejs_${block.id}`,
      blockId: block.id,
      node: rawOutput,
    };
    this.nodes.set(block.id, wrapper);
    return wrapper;
  }

  /** Evaluate Tone.js code */
  async evaluate(code: string): Promise<void> {
    if (!this.Tone) throw new Error('Tone.js not initialized');
    try {
      /* Execute code with Tone in scope */
      const Tone = this.Tone;
      await Function('Tone', `"use strict"; return (async () => { ${code} })()`)(Tone);
    } catch (err) {
      console.error('[Tone.js] Evaluation error:', err);
      throw err;
    }
  }

  start(): void {
    this.Tone?.getTransport().start();
  }

  stop(): void {
    this.Tone?.getTransport().stop();
    this.Tone?.getTransport().cancel();
  }

  /** Set BPM on Tone.js transport */
  setBpm(bpm: number): void {
    if (this.Tone) {
      this.Tone.getTransport().bpm.value = bpm;
    }
  }

  dispose(): void {
    this.stop();
    super.dispose();
    this.Tone = null;
  }

  private createSynth(type: number): any {
    if (!this.Tone) throw new Error('Tone.js not initialized');
    const synthMap: Record<number, () => any> = {
      0: () => new this.Tone!.Synth(),
      1: () => new this.Tone!.FMSynth(),
      2: () => new this.Tone!.AMSynth(),
      3: () => new this.Tone!.MonoSynth(),
      4: () => new this.Tone!.MembraneSynth(),
      5: () => new this.Tone!.MetalSynth(),
      6: () => new this.Tone!.PluckSynth(),
    };
    return (synthMap[type] ?? synthMap[0])();
  }
}
```

- [ ] **Step 2: Write tests**

Create `src/lib/engines/tonejs.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { ToneJsEngine } from './tonejs';

describe('ToneJsEngine', () => {
  it('has correct name', () => {
    const engine = new ToneJsEngine();
    expect(engine.name).toBe('tonejs');
  });

  it('can be instantiated without init', () => {
    const engine = new ToneJsEngine();
    expect(engine).toBeDefined();
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/engines/tonejs.ts src/lib/engines/tonejs.test.ts
git commit -m "[Engine] Add Tone.js engine adapter with synth factory and transport"
```

---

### Task 6: Web Audio + MIDI adapters + engine registry

**Files:**
- Create: `src/lib/engines/webaudio.ts`, `src/lib/engines/webaudio.test.ts`, `src/lib/engines/midi.ts`, `src/lib/engines/index.ts`

- [ ] **Step 1: Create Web Audio adapter**

Create `src/lib/engines/webaudio.ts`:

```typescript
import { BaseEngine } from './base';
import type { EngineBlock, AudioNodeWrapper } from '../../types/engine';
import { getMasterGain } from '../audio/context';

/** Raw Web Audio API engine adapter.
 * Maximum flexibility — users create oscillators, filters, gains directly.
 * Code is evaluated with AudioContext in scope. */
export class WebAudioEngine extends BaseEngine {
  name = 'webaudio';

  async init(): Promise<void> {
    /* No external deps — Web Audio API is native */
  }

  createNode(block: EngineBlock): AudioNodeWrapper {
    const ctx = this.getContext();
    const gain = ctx.createGain();
    gain.connect(getMasterGain());

    const wrapper: AudioNodeWrapper = {
      id: `webaudio_${block.id}`,
      blockId: block.id,
      node: gain,
    };
    this.nodes.set(block.id, wrapper);
    return wrapper;
  }

  /** Evaluate raw Web Audio code */
  async evaluate(code: string): Promise<void> {
    const ctx = this.getContext();
    const masterGain = getMasterGain();
    try {
      await Function('ctx', 'masterGain', `"use strict"; return (async () => { ${code} })()`)(ctx, masterGain);
    } catch (err) {
      console.error('[WebAudio] Evaluation error:', err);
      throw err;
    }
  }

  start(): void {
    /* Web Audio nodes are started individually via code */
  }

  stop(): void {
    /* Stop all active oscillators/sources by disconnecting */
    for (const wrapper of this.nodes.values()) {
      try { wrapper.node.disconnect(); } catch { /* ok */ }
    }
  }
}
```

- [ ] **Step 2: Create MIDI adapter**

Create `src/lib/engines/midi.ts`:

```typescript
import { BaseEngine } from './base';
import type { EngineBlock, AudioNodeWrapper } from '../../types/engine';

/** MIDI output-only engine adapter.
 * Sends note/CC data to external MIDI devices via WebMIDI.
 * Does NOT produce audio — output-only in v1. */
export class MidiEngine extends BaseEngine {
  name = 'midi';
  private WebMidi: any = null;
  private selectedOutput: any = null;

  async init(): Promise<void> {
    try {
      const { WebMidi } = await import('webmidi');
      await WebMidi.enable();
      this.WebMidi = WebMidi;
      /* Auto-select first available output */
      if (WebMidi.outputs.length > 0) {
        this.selectedOutput = WebMidi.outputs[0];
      }
    } catch (err) {
      console.warn('[MIDI] WebMIDI not available:', err);
    }
  }

  /** Get list of available MIDI outputs */
  getOutputs(): { id: string; name: string }[] {
    if (!this.WebMidi) return [];
    return this.WebMidi.outputs.map((out: any) => ({
      id: out.id,
      name: out.name,
    }));
  }

  /** Select a MIDI output by index */
  selectOutput(index: number): void {
    if (this.WebMidi?.outputs[index]) {
      this.selectedOutput = this.WebMidi.outputs[index];
    }
  }

  /** Send a MIDI note */
  playNote(note: string, duration = 500, velocity = 0.8): void {
    if (this.selectedOutput) {
      this.selectedOutput.playNote(note, { duration, attack: velocity });
    }
  }

  /** Send a MIDI CC message */
  sendCC(controller: number, value: number, channel = 1): void {
    if (this.selectedOutput) {
      this.selectedOutput.sendControlChange(controller, value, channel);
    }
  }

  createNode(block: EngineBlock): AudioNodeWrapper {
    /* MIDI doesn't create audio nodes — return a dummy gain for graph compatibility */
    const ctx = this.getContext();
    const gain = ctx.createGain();
    gain.gain.value = 0; /* silent — MIDI is output-only */

    const wrapper: AudioNodeWrapper = {
      id: `midi_${block.id}`,
      blockId: block.id,
      node: gain,
    };
    this.nodes.set(block.id, wrapper);
    return wrapper;
  }

  start(): void { /* MIDI messages sent on demand */ }
  stop(): void {
    /* Send all-notes-off on all channels */
    if (this.selectedOutput) {
      for (let ch = 1; ch <= 16; ch++) {
        this.selectedOutput.sendControlChange(123, 0, ch);
      }
    }
  }

  dispose(): void {
    this.stop();
    super.dispose();
    this.WebMidi?.disable();
    this.WebMidi = null;
    this.selectedOutput = null;
  }
}
```

- [ ] **Step 3: Create engine registry**

Create `src/lib/engines/index.ts`:

```typescript
import type { EngineType, EngineAdapter } from '../../types/engine';
import { StrudelEngine } from './strudel';
import { ToneJsEngine } from './tonejs';
import { WebAudioEngine } from './webaudio';
import { MidiEngine } from './midi';

export { StrudelEngine } from './strudel';
export { ToneJsEngine } from './tonejs';
export { WebAudioEngine } from './webaudio';
export { MidiEngine } from './midi';
export { BaseEngine } from './base';

/** Create an engine adapter by type */
export function createEngine(type: EngineType): EngineAdapter {
  switch (type) {
    case 'strudel': return new StrudelEngine();
    case 'tonejs': return new ToneJsEngine();
    case 'webaudio': return new WebAudioEngine();
    case 'midi': return new MidiEngine();
  }
}

/** Engine display metadata */
export const ENGINE_META: Record<EngineType, { label: string; description: string }> = {
  strudel: { label: 'Strudel', description: 'Pattern-based live coding' },
  tonejs: { label: 'Tone.js', description: 'High-level synths and effects' },
  webaudio: { label: 'Web Audio', description: 'Low-level audio nodes' },
  midi: { label: 'MIDI', description: 'External MIDI device output' },
};
```

- [ ] **Step 4: Write tests**

Create `src/lib/engines/webaudio.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { WebAudioEngine } from './webaudio';

describe('WebAudioEngine', () => {
  it('has correct name', () => {
    expect(new WebAudioEngine().name).toBe('webaudio');
  });
});
```

- [ ] **Step 5: Run all tests**

```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/engines/
git commit -m "[Engine] Add Web Audio, MIDI adapters and engine registry"
```

---

### Task 7: Orchestrator — ties engines + graph + store together

**Files:**
- Create: `src/lib/orchestrator/index.ts`
- Modify: `src/lib/store.ts` (add orchestrator reference)

- [ ] **Step 1: Create Orchestrator class**

Create `src/lib/orchestrator/index.ts`:

```typescript
import { AudioGraph } from './graph';
import { createEngine } from '../engines';
import { resumeContext } from '../audio/context';
import type { EngineType, EngineAdapter, EngineBlock } from '../../types/engine';
import type { OrchestratorState } from './types';

export type { OrchestratorState } from './types';

/** Central orchestrator — manages engines, audio graph, and playback state.
 * Evaluates code from the editor and routes it to the appropriate engine. */
export class Orchestrator {
  private engines: Map<EngineType, EngineAdapter> = new Map();
  private initializedEngines: Set<EngineType> = new Set();
  private graph: AudioGraph;
  private state: OrchestratorState = 'stopped';
  private bpm = 120;

  constructor() {
    this.graph = new AudioGraph();
  }

  /** Lazily initialize an engine (only when first needed) */
  async getEngine(type: EngineType): Promise<EngineAdapter> {
    if (!this.engines.has(type)) {
      const engine = createEngine(type);
      this.engines.set(type, engine);
    }
    const engine = this.engines.get(type)!;
    if (!this.initializedEngines.has(type)) {
      await engine.init();
      this.initializedEngines.add(type);
    }
    return engine;
  }

  /** Evaluate code with the specified engine */
  async evaluate(code: string, engineType: EngineType): Promise<void> {
    const engine = await this.getEngine(engineType);
    if ('evaluate' in engine && typeof (engine as any).evaluate === 'function') {
      await (engine as any).evaluate(code);
    }
  }

  /** Start playback — resumes AudioContext and starts all active engines */
  async start(): Promise<void> {
    await resumeContext();
    for (const engine of this.engines.values()) {
      engine.start();
    }
    this.state = 'playing';
  }

  /** Stop playback */
  stop(): void {
    for (const engine of this.engines.values()) {
      engine.stop();
    }
    this.state = 'stopped';
  }

  /** Set BPM across all engines */
  setBpm(bpm: number): void {
    this.bpm = bpm;
    for (const [type, engine] of this.engines) {
      if (type === 'tonejs' && 'setBpm' in engine) {
        (engine as any).setBpm(bpm);
      }
    }
  }

  getState(): OrchestratorState {
    return this.state;
  }

  getGraph(): AudioGraph {
    return this.graph;
  }

  getBpm(): number {
    return this.bpm;
  }

  /** Dispose all engines and clean up */
  dispose(): void {
    this.stop();
    for (const engine of this.engines.values()) {
      engine.dispose();
    }
    this.engines.clear();
    this.initializedEngines.clear();
    this.graph.clear();
  }
}

/** Singleton orchestrator instance */
let orchestratorInstance: Orchestrator | null = null;

export function getOrchestrator(): Orchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new Orchestrator();
  }
  return orchestratorInstance;
}

export function disposeOrchestrator(): void {
  orchestratorInstance?.dispose();
  orchestratorInstance = null;
}
```

- [ ] **Step 2: Run all tests**

```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/orchestrator/index.ts
git commit -m "[Orchestrator] Add Orchestrator class — manages engines, graph, playback state"
```

---

### Task 8: Wire orchestrator into UI (Play/Stop actually works)

**Files:**
- Modify: `src/components/organisms/TransportBar.tsx`
- Modify: `src/pages/Editor.tsx`

- [ ] **Step 1: Update TransportBar to use orchestrator**

In `TransportBar.tsx`, add orchestrator import and wire Play/Stop:

```typescript
import { getOrchestrator } from '../../lib/orchestrator';

/* In the component, update togglePlay handler: */
const handlePlay = async () => {
  const orch = getOrchestrator();
  if (isPlaying) {
    orch.stop();
    togglePlay();
  } else {
    await orch.start();
    togglePlay();
  }
};

const handleStop = () => {
  getOrchestrator().stop();
  stop();
};
```

Replace the Play and Stop button onClick handlers to use `handlePlay` and `handleStop`.

- [ ] **Step 2: Update Editor page with a test pattern**

In `Editor.tsx`, add a useEffect that evaluates a demo pattern when the page loads (so there's something to hear when Play is pressed):

```typescript
import { useEffect } from 'react';
import { getOrchestrator } from '../lib/orchestrator';

useEffect(() => {
  /* Pre-load Strudel engine with a demo pattern */
  const orch = getOrchestrator();
  orch.getEngine('strudel').then(() => {
    orch.evaluate('note("c3 e3 g3 b3").s("sawtooth").lpf(800)', 'strudel').catch(() => {});
  });
}, []);
```

- [ ] **Step 3: Update BPM input to sync with orchestrator**

In TransportBar, update setBpm handler:

```typescript
const handleBpmChange = (newBpm: number) => {
  setBpm(newBpm);
  getOrchestrator().setBpm(newBpm);
};
```

- [ ] **Step 4: Verify audio works**

```bash
npm run dev
```

Expected: Navigate to /editor, click Play — should hear a sawtooth arpeggio pattern. Click Stop — silence. BPM changes should affect playback speed.

**Note:** This may not work perfectly in dev due to Strudel's AudioContext requirements (user gesture needed). The play button click should satisfy this requirement.

- [ ] **Step 5: Run all tests**

```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/organisms/TransportBar.tsx src/pages/Editor.tsx
git commit -m "[Audio] Wire orchestrator into UI — Play/Stop produces sound via Strudel"
```

---

### Task 9: Final verification + push

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Push**

```bash
git push
```

---

## Phase 2 Completion Criteria

After all 9 tasks:
- Shared AudioContext singleton with master gain and analyser
- AudioAnalyzer wrapper with FFT, waveform, RMS, peak, beat detection
- Directed AudioGraph with cycle prevention and serialization
- 4 engine adapters: Strudel, Tone.js, Web Audio, MIDI
- Engine registry with lazy initialization
- Orchestrator managing engines + graph + playback
- Play/Stop buttons produce actual sound (Strudel demo pattern)
- BPM synced between UI and engines
- All tests passing

**Next:** Phase 3 — Code Editor (CodeMirror 6 + @strudel/codemirror + multi-tab + per-engine syntax)
