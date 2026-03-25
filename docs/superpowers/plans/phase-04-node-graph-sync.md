# Phase 4: Node Graph & Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a visual node graph using React Flow that displays the audio routing as draggable nodes and wires. Implement bidirectional sync: code is the source of truth, graph is a derived view. Graph interactions emit code mutations back to the editor.

**Architecture:** Code editor is authoritative. A lightweight parser extracts blocks/connections from code → renders as React Flow nodes. When users drag/rewire in the graph, it emits code mutations → code updates → graph re-derives. Both panels are always interactive, no locking.

**Tech Stack:** @xyflow/react (React Flow v12), Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md` (Sections 3, 4)

---

## File Structure (Phase 4)

```
src/
├── lib/
│   ├── parser/
│   │   ├── index.ts            # Code → graph: extracts blocks + connections from code
│   │   └── index.test.ts       # Parser tests
│   ├── codegen/
│   │   ├── index.ts            # Graph → code: generates readable code from graph model
│   │   └── index.test.ts       # Codegen tests
│   └── store.ts                # (modify) Add graph state + sync actions
├── components/
│   ├── atoms/
│   │   └── EngineNode.tsx      # Custom React Flow node with engine color + ports
│   └── organisms/
│       └── NodeGraph.tsx       # React Flow canvas with custom nodes + edge handling
```

---

### Task 1: Install React Flow

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install React Flow v12**

```bash
cd /Users/arnold/Development/wm-prototyp-live-music-coder
npm install @xyflow/react
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "[Deps] Add React Flow (@xyflow/react) for visual node graph"
```

---

### Task 2: Code parser — extracts blocks + connections from code (TDD)

**Files:**
- Create: `src/lib/parser/index.ts`, `src/lib/parser/index.test.ts`

The parser does pattern matching on known code structures to extract EngineBlocks and Connections. It's NOT a full AST — it uses regex and string analysis.

- [ ] **Step 1: Write parser tests first**

Create `src/lib/parser/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseCode } from './index';

describe('parseCode', () => {
  it('returns empty for empty code', () => {
    const result = parseCode('', 'strudel');
    expect(result.blocks).toEqual([]);
    expect(result.connections).toEqual([]);
  });

  it('extracts a Strudel pattern as a source block', () => {
    const code = 'note("c3 e3 g3").s("sawtooth")';
    const result = parseCode(code, 'strudel');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].engine).toBe('strudel');
    expect(result.blocks[0].type).toBe('source');
    expect(result.blocks[0].code).toBe(code);
  });

  it('extracts Tone.js synth creation', () => {
    const code = 'const synth = new Tone.Synth()';
    const result = parseCode(code, 'tonejs');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].engine).toBe('tonejs');
    expect(result.blocks[0].type).toBe('source');
  });

  it('extracts Tone.js effect', () => {
    const code = 'const reverb = new Tone.Reverb(2)';
    const result = parseCode(code, 'tonejs');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe('effect');
  });

  it('extracts Web Audio oscillator', () => {
    const code = 'const osc = ctx.createOscillator()';
    const result = parseCode(code, 'webaudio');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe('source');
  });

  it('extracts Web Audio gain node', () => {
    const code = 'const gain = ctx.createGain()';
    const result = parseCode(code, 'webaudio');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe('effect');
  });

  it('detects .connect() as a connection', () => {
    const code = `const osc = ctx.createOscillator()
const gain = ctx.createGain()
osc.connect(gain)`;
    const result = parseCode(code, 'webaudio');
    expect(result.connections.length).toBe(1);
    expect(result.connections[0].sourceBlockId).toContain('osc');
    expect(result.connections[0].targetBlockId).toContain('gain');
  });

  it('detects Tone.js .chain() as connections', () => {
    const code = `const synth = new Tone.Synth()
const reverb = new Tone.Reverb(2)
synth.chain(reverb, Tone.getDestination())`;
    const result = parseCode(code, 'tonejs');
    expect(result.connections.length).toBeGreaterThanOrEqual(1);
  });

  it('handles multiple blocks in same code', () => {
    const code = `const osc = ctx.createOscillator()
const gain = ctx.createGain()
const filter = ctx.createBiquadFilter()`;
    const result = parseCode(code, 'webaudio');
    expect(result.blocks.length).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

```bash
npm run test
```

- [ ] **Step 3: Implement parser**

Create `src/lib/parser/index.ts`:

```typescript
import type { EngineType, EngineBlock, Connection } from '../../types/engine';

interface ParseResult {
  blocks: EngineBlock[];
  connections: Connection[];
}

/** Parse code to extract audio blocks and connections.
 * Uses pattern matching (regex), NOT a full AST. */
export function parseCode(code: string, engine: EngineType): ParseResult {
  if (!code.trim()) return { blocks: [], connections: [] };

  switch (engine) {
    case 'strudel': return parseStrudel(code);
    case 'tonejs': return parseToneJs(code);
    case 'webaudio': return parseWebAudio(code);
    case 'midi': return parseMidi(code);
  }
}

function parseStrudel(code: string): ParseResult {
  /* Strudel code is typically one pattern expression per file.
   * Treat the entire code as a single source block. */
  const blocks: EngineBlock[] = [{
    id: 'strudel_main',
    engine: 'strudel',
    type: 'source',
    code,
    params: {},
    inputs: [],
    outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
  }];
  return { blocks, connections: [] };
}

/* Tone.js source constructors */
const TONE_SOURCES = /new\s+Tone\.(Synth|FMSynth|AMSynth|MonoSynth|DuoSynth|MembraneSynth|MetalSynth|NoiseSynth|PluckSynth|PolySynth|Sampler|Oscillator|Player)\b/;
/* Tone.js effect constructors */
const TONE_EFFECTS = /new\s+Tone\.(Reverb|Delay|FeedbackDelay|PingPongDelay|Chorus|Phaser|Tremolo|Vibrato|Distortion|BitCrusher|Chebyshev|AutoFilter|AutoPanner|AutoWah|Compressor|EQ3|Filter|Gain|Limiter|MultibandCompressor|Volume)\b/;

function parseToneJs(code: string): ParseResult {
  const blocks: EngineBlock[] = [];
  const connections: Connection[] = [];
  const varMap = new Map<string, string>(); /* varName → blockId */
  const lines = code.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    /* Match: const/let/var name = new Tone.X(...) */
    const varMatch = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=\s*(new\s+Tone\.\w+)/);
    if (varMatch) {
      const [, varName, constructor] = varMatch;
      const isSource = TONE_SOURCES.test(constructor);
      const isEffect = TONE_EFFECTS.test(constructor);
      const blockId = `tonejs_${varName}`;

      blocks.push({
        id: blockId,
        engine: 'tonejs',
        type: isSource ? 'source' : isEffect ? 'effect' : 'effect',
        code: trimmed,
        params: {},
        inputs: isSource ? [] : [{ id: 'in', label: 'Input', type: 'audio' }],
        outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
      });
      varMap.set(varName, blockId);
    }

    /* Match: x.connect(y) */
    const connectMatch = trimmed.match(/(\w+)\.connect\((\w+)\)/);
    if (connectMatch) {
      const [, src, tgt] = connectMatch;
      const srcId = varMap.get(src);
      const tgtId = varMap.get(tgt);
      if (srcId && tgtId) {
        connections.push({
          id: `conn_${srcId}_${tgtId}`,
          sourceBlockId: srcId,
          sourcePortId: 'out',
          targetBlockId: tgtId,
          targetPortId: 'in',
        });
      }
    }

    /* Match: x.chain(y, z, ...) */
    const chainMatch = trimmed.match(/(\w+)\.chain\(([^)]+)\)/);
    if (chainMatch) {
      const [, src, argsStr] = chainMatch;
      const args = argsStr.split(',').map(a => a.trim());
      let prevId = varMap.get(src);
      for (const arg of args) {
        const argId = varMap.get(arg);
        if (prevId && argId) {
          connections.push({
            id: `conn_${prevId}_${argId}`,
            sourceBlockId: prevId,
            sourcePortId: 'out',
            targetBlockId: argId,
            targetPortId: 'in',
          });
        }
        if (argId) prevId = argId;
      }
    }
  }

  return { blocks, connections };
}

/* Web Audio source creators */
const WA_SOURCES = /ctx\.create(Oscillator|BufferSource|ConstantSource|MediaElementSource|MediaStreamSource)\b/;
/* Web Audio effect/processing creators */
const WA_EFFECTS = /ctx\.create(Gain|BiquadFilter|Delay|DynamicsCompressor|WaveShaper|Convolver|StereoPanner|Panner|AnalyserNode?)\b/;

function parseWebAudio(code: string): ParseResult {
  const blocks: EngineBlock[] = [];
  const connections: Connection[] = [];
  const varMap = new Map<string, string>();
  const lines = code.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    /* Match: const/let/var name = ctx.createX() */
    const varMatch = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=\s*(ctx\.create\w+)/);
    if (varMatch) {
      const [, varName, creator] = varMatch;
      const isSource = WA_SOURCES.test(creator);
      const blockId = `webaudio_${varName}`;

      blocks.push({
        id: blockId,
        engine: 'webaudio',
        type: isSource ? 'source' : 'effect',
        code: trimmed,
        params: {},
        inputs: isSource ? [] : [{ id: 'in', label: 'Input', type: 'audio' }],
        outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
      });
      varMap.set(varName, blockId);
    }

    /* Match: x.connect(y) */
    const connectMatch = trimmed.match(/(\w+)\.connect\((\w+)\)/);
    if (connectMatch) {
      const [, src, tgt] = connectMatch;
      const srcId = varMap.get(src);
      const tgtId = varMap.get(tgt);
      if (srcId && tgtId) {
        connections.push({
          id: `conn_${srcId}_${tgtId}`,
          sourceBlockId: srcId,
          sourcePortId: 'out',
          targetBlockId: tgtId,
          targetPortId: 'in',
        });
      }
    }
  }

  return { blocks, connections };
}

function parseMidi(code: string): ParseResult {
  /* MIDI code is imperative — treat as single output block */
  if (!code.trim()) return { blocks: [], connections: [] };
  return {
    blocks: [{
      id: 'midi_main',
      engine: 'midi',
      type: 'output',
      code,
      params: {},
      inputs: [{ id: 'in', label: 'Input', type: 'midi' }],
      outputs: [],
    }],
    connections: [],
  };
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npm run test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/parser/
git commit -m "[Parser] Add code-to-graph parser — extracts blocks and connections from code"
```

---

### Task 3: Code generator — graph back to code (TDD)

**Files:**
- Create: `src/lib/codegen/index.ts`, `src/lib/codegen/index.test.ts`

- [ ] **Step 1: Write codegen tests first**

Create `src/lib/codegen/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateCode } from './index';
import type { EngineBlock, Connection } from '../../types/engine';

describe('generateCode', () => {
  it('returns empty string for no blocks', () => {
    expect(generateCode([], [], 'strudel')).toBe('');
  });

  it('generates Strudel code from a source block', () => {
    const blocks: EngineBlock[] = [{
      id: 'strudel_main',
      engine: 'strudel',
      type: 'source',
      code: 'note("c3 e3 g3").s("sawtooth")',
      params: {},
      inputs: [],
      outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
    }];
    const code = generateCode(blocks, [], 'strudel');
    expect(code).toContain('note("c3 e3 g3")');
  });

  it('generates Web Audio code with connections', () => {
    const blocks: EngineBlock[] = [
      { id: 'webaudio_osc', engine: 'webaudio', type: 'source', code: 'const osc = ctx.createOscillator()', params: {}, inputs: [], outputs: [{ id: 'out', label: 'Output', type: 'audio' }] },
      { id: 'webaudio_gain', engine: 'webaudio', type: 'effect', code: 'const gain = ctx.createGain()', params: {}, inputs: [{ id: 'in', label: 'Input', type: 'audio' }], outputs: [{ id: 'out', label: 'Output', type: 'audio' }] },
    ];
    const connections: Connection[] = [{
      id: 'conn_1', sourceBlockId: 'webaudio_osc', sourcePortId: 'out', targetBlockId: 'webaudio_gain', targetPortId: 'in',
    }];
    const code = generateCode(blocks, connections, 'webaudio');
    expect(code).toContain('createOscillator');
    expect(code).toContain('createGain');
    expect(code).toContain('.connect(');
  });

  it('preserves block code as-is for Tone.js', () => {
    const blocks: EngineBlock[] = [{
      id: 'tonejs_synth',
      engine: 'tonejs',
      type: 'source',
      code: 'const synth = new Tone.Synth()',
      params: {},
      inputs: [],
      outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
    }];
    const code = generateCode(blocks, [], 'tonejs');
    expect(code).toContain('new Tone.Synth()');
  });
});
```

- [ ] **Step 2: Implement codegen**

Create `src/lib/codegen/index.ts`:

```typescript
import type { EngineType, EngineBlock, Connection } from '../../types/engine';

/** Generate readable code from blocks and connections.
 * Each block's .code property is used as-is.
 * Connections are appended as .connect() calls.
 * The generated code should be valid for the target engine. */
export function generateCode(
  blocks: EngineBlock[],
  connections: Connection[],
  engine: EngineType,
): string {
  if (blocks.length === 0) return '';

  switch (engine) {
    case 'strudel': return generateStrudel(blocks);
    case 'tonejs': return generateToneJs(blocks, connections);
    case 'webaudio': return generateWebAudio(blocks, connections);
    case 'midi': return generateMidi(blocks);
  }
}

function generateStrudel(blocks: EngineBlock[]): string {
  /* Strudel: return block code directly (pattern expression) */
  return blocks.map(b => b.code).join('\n');
}

function generateToneJs(blocks: EngineBlock[], connections: Connection[]): string {
  const lines: string[] = [];

  /* Block declarations */
  for (const block of blocks) {
    lines.push(block.code);
  }

  /* Connection statements */
  if (connections.length > 0) {
    lines.push('');
    for (const conn of connections) {
      const srcBlock = blocks.find(b => b.id === conn.sourceBlockId);
      const tgtBlock = blocks.find(b => b.id === conn.targetBlockId);
      if (srcBlock && tgtBlock) {
        /* Extract variable name from code */
        const srcVar = extractVarName(srcBlock.code);
        const tgtVar = extractVarName(tgtBlock.code);
        if (srcVar && tgtVar) {
          lines.push(`${srcVar}.connect(${tgtVar})`);
        }
      }
    }
  }

  return lines.join('\n');
}

function generateWebAudio(blocks: EngineBlock[], connections: Connection[]): string {
  const lines: string[] = [];

  /* Block declarations */
  for (const block of blocks) {
    lines.push(block.code);
  }

  /* Connection statements */
  if (connections.length > 0) {
    lines.push('');
    for (const conn of connections) {
      const srcBlock = blocks.find(b => b.id === conn.sourceBlockId);
      const tgtBlock = blocks.find(b => b.id === conn.targetBlockId);
      if (srcBlock && tgtBlock) {
        const srcVar = extractVarName(srcBlock.code);
        const tgtVar = extractVarName(tgtBlock.code);
        if (srcVar && tgtVar) {
          lines.push(`${srcVar}.connect(${tgtVar})`);
        }
      }
    }
  }

  return lines.join('\n');
}

function generateMidi(blocks: EngineBlock[]): string {
  return blocks.map(b => b.code).join('\n');
}

/** Extract variable name from a declaration like "const foo = ..." */
function extractVarName(code: string): string | null {
  const match = code.match(/(?:const|let|var)\s+(\w+)/);
  return match ? match[1] : null;
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/codegen/
git commit -m "[Codegen] Add graph-to-code generator — produces readable code from blocks"
```

---

### Task 4: Custom React Flow node component

**Files:**
- Create: `src/components/atoms/EngineNode.tsx`
- Modify: `src/components/atoms/index.ts`

- [ ] **Step 1: Create EngineNode**

Create `src/components/atoms/EngineNode.tsx`:

```tsx
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EngineType } from '../../types/engine';
import { ENGINE_COLORS } from '../../lib/constants';

interface EngineNodeData {
  label: string;
  engine: EngineType;
  blockType: 'source' | 'effect' | 'output';
  code: string;
}

/** Custom React Flow node with engine color coding and audio ports */
export const EngineNode = memo(({ data }: NodeProps & { data: EngineNodeData }) => {
  const color = ENGINE_COLORS[data.engine];
  const hasInputs = data.blockType !== 'source';
  const hasOutputs = data.blockType !== 'output';

  return (
    <div
      className="rounded-lg min-w-40 shadow-lg"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: `2px solid ${color}`,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-1.5 rounded-t-md text-xs font-semibold flex items-center gap-2"
        style={{ backgroundColor: color, color: 'white' }}
      >
        <span className="uppercase tracking-wider opacity-70">{data.engine}</span>
        <span>{data.blockType}</span>
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <div
          className="text-sm truncate max-w-48"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)' }}
        >
          {data.label}
        </div>
      </div>

      {/* Input handle (left) */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: color,
            width: 10,
            height: 10,
            border: '2px solid var(--color-bg)',
          }}
        />
      )}

      {/* Output handle (right) */}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: color,
            width: 10,
            height: 10,
            border: '2px solid var(--color-bg)',
          }}
        />
      )}
    </div>
  );
});

EngineNode.displayName = 'EngineNode';
```

- [ ] **Step 2: Add to barrel export**

Add `EngineNode` to `src/components/atoms/index.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/components/atoms/EngineNode.tsx src/components/atoms/index.ts
git commit -m "[UI] Add EngineNode — custom React Flow node with engine color and ports"
```

---

### Task 5: NodeGraph organism

**Files:**
- Create: `src/components/organisms/NodeGraph.tsx`
- Modify: `src/components/organisms/index.ts`

- [ ] **Step 1: Create NodeGraph**

Create `src/components/organisms/NodeGraph.tsx`:

```tsx
import { useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection as RFConnection,
  type Edge,
  type Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '../../lib/store';
import { parseCode } from '../../lib/parser';
import { EngineNode } from '../atoms/EngineNode';
import { ENGINE_COLORS } from '../../lib/constants';

const nodeTypes = { engineNode: EngineNode };

/** Convert parsed blocks to React Flow nodes */
function blocksToNodes(blocks: { id: string; engine: string; type: string; code: string }[]): Node[] {
  return blocks.map((block, i) => ({
    id: block.id,
    type: 'engineNode',
    position: { x: i * 220, y: 50 + (i % 3) * 120 },
    data: {
      label: block.code.slice(0, 40),
      engine: block.engine,
      blockType: block.type,
      code: block.code,
    },
  }));
}

/** Convert parsed connections to React Flow edges */
function connectionsToEdges(connections: { id: string; sourceBlockId: string; targetBlockId: string }[]): Edge[] {
  return connections.map((conn) => ({
    id: conn.id,
    source: conn.sourceBlockId,
    target: conn.targetBlockId,
    animated: true,
    style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
  }));
}

/** Visual node graph derived from the active file's code */
export function NodeGraph() {
  const files = useAppStore((s) => s.files);
  const activeFile = files.find((f) => f.active);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  /* Re-parse code when active file changes */
  useEffect(() => {
    if (!activeFile) return;
    const result = parseCode(activeFile.code, activeFile.engine);
    setNodes(blocksToNodes(result.blocks));
    setEdges(connectionsToEdges(result.connections));
  }, [activeFile?.code, activeFile?.engine, activeFile?.id]);

  const onConnect = useCallback(
    (connection: RFConnection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: 'var(--color-primary)', strokeWidth: 2 } }, eds));
    },
    [setEdges],
  );

  /* MiniMap node color by engine */
  const miniMapNodeColor = useCallback((node: Node) => {
    const engine = node.data?.engine as string;
    return ENGINE_COLORS[engine as keyof typeof ENGINE_COLORS] || 'var(--color-primary)';
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border-dim)" />
        <Controls
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          style={{
            backgroundColor: 'var(--color-bg-alt)',
            border: '1px solid var(--color-border)',
          }}
          maskColor="rgba(0, 0, 0, 0.5)"
        />
      </ReactFlow>
    </div>
  );
}
```

- [ ] **Step 2: Add to barrel export**

Add `NodeGraph` to `src/components/organisms/index.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/NodeGraph.tsx src/components/organisms/index.ts
git commit -m "[Graph] Add NodeGraph organism — React Flow canvas with parsed code visualization"
```

---

### Task 6: Wire NodeGraph into Editor page

**Files:**
- Modify: `src/pages/Editor.tsx`

- [ ] **Step 1: Replace graph placeholder**

In `src/pages/Editor.tsx`:
- Import `NodeGraph` from `../components/organisms`
- Replace the graph PlaceholderPanel with `<NodeGraph />`
- Keep PlaceholderPanel for visualizers only

- [ ] **Step 2: Verify it works**

```bash
npm run dev
```

Expected:
1. Navigate to /editor
2. Left panel: CodeMirror editor with code
3. Right panel: React Flow canvas showing parsed blocks as nodes
4. Edit code → nodes update automatically
5. Add new file tab → graph changes for active file
6. Nodes are draggable, connectable via handles
7. MiniMap in bottom-right corner

- [ ] **Step 3: Run tests + build**

```bash
npm run test && npx tsc --noEmit && npm run build
```

- [ ] **Step 4: Commit and push**

```bash
git add src/pages/Editor.tsx
git commit -m "[App] Wire NodeGraph into Editor — code and graph side by side"
git push
```

---

## Phase 4 Completion Criteria

After all 6 tasks:
- Code parser extracts blocks + connections from Strudel, Tone.js, Web Audio, MIDI code
- Code generator produces readable code from blocks + connections
- Custom EngineNode component with engine colors and audio ports
- React Flow canvas displaying parsed code as visual nodes
- Nodes auto-update when code changes
- Nodes are draggable and connectable
- MiniMap for navigation
- Parser and codegen have full test coverage

**Note on bidirectional sync v1:** In this phase, the graph is read-only from code (code → graph). Graph → code mutations (drag creating code changes) are deferred to a future iteration. The architecture supports it — the codegen is ready — but the UI integration is complex and should be a separate, focused effort.

**Next:** Phase 5 — Visualizer Dashboard (waveform, spectrum, pattern timeline, Canvas 2D)
