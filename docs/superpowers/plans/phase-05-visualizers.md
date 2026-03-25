# Phase 5: Visualizer Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the visualizer dashboard with 3 Canvas 2D visualizers (waveform, spectrum analyzer, pattern timeline) that react to live audio. Each visualizer is toggleable. The 4th panel (Beatling ecosystem) is deferred to Phase 6.

**Architecture:** Each visualizer is a Canvas 2D component that reads from the shared AudioAnalyzer (created in Phase 2). Uses requestAnimationFrame for smooth 60fps rendering. Visualizers tap into the master AnalyserNode. Toggle visibility via Zustand store's `layout.visiblePanels`.

**Tech Stack:** Canvas 2D API, requestAnimationFrame, AudioAnalyzer (from Phase 2), Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md` (Sections 4, 5)

---

## File Structure (Phase 5)

```
src/
├── components/
│   ├── atoms/
│   │   └── CanvasVisualizer.tsx    # Reusable canvas wrapper with resize handling + animation loop
│   ├── molecules/
│   │   └── VisualizerToggle.tsx    # Toggle buttons for each visualizer panel
│   └── organisms/
│       ├── WaveformVisualizer.tsx  # Time-domain waveform display
│       ├── SpectrumVisualizer.tsx  # FFT frequency spectrum bars
│       ├── PatternTimeline.tsx     # Pattern event timeline (shows when events fire)
│       └── VisualizerDashboard.tsx # Composes all visualizers + toggle bar
├── lib/
│   └── visualizers/
│       ├── waveform.ts             # Waveform drawing logic (pure function)
│       ├── spectrum.ts             # Spectrum drawing logic (pure function)
│       ├── timeline.ts             # Timeline drawing logic (pure function)
│       ├── colors.ts               # Visualizer color constants derived from tokens
│       └── waveform.test.ts        # Waveform drawing tests
```

---

### Task 1: Visualizer colors + CanvasVisualizer atom

**Files:**
- Create: `src/lib/visualizers/colors.ts`, `src/components/atoms/CanvasVisualizer.tsx`
- Modify: `src/components/atoms/index.ts`

- [ ] **Step 1: Create visualizer color constants**

Create `src/lib/visualizers/colors.ts`:

```typescript
/** Visualizer color constants — derived from design tokens but as literal values
 * because Canvas 2D cannot use CSS custom properties directly. */
export const VIZ_COLORS = {
  bg: '#09090b',
  grid: '#27272a',
  gridLight: '#3f3f46',
  waveform: '#a855f7',
  waveformFill: 'rgba(168, 85, 247, 0.15)',
  spectrum: '#3b82f6',
  spectrumPeak: '#60a5fa',
  spectrumFill: 'rgba(59, 130, 246, 0.3)',
  timeline: '#22c55e',
  timelineBeat: '#a855f7',
  timelineBar: 'rgba(34, 197, 94, 0.4)',
  text: '#a1a1aa',
  textDim: '#71717a',
  accent: '#a855f7',
  white: '#fafafa',
} as const;
```

- [ ] **Step 2: Create CanvasVisualizer atom**

Create `src/components/atoms/CanvasVisualizer.tsx`:

```tsx
import { useRef, useEffect, useCallback } from 'react';

interface CanvasVisualizerProps {
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => void;
  className?: string;
}

/** Reusable canvas component with auto-resize and animation loop.
 * The draw function is called every frame via requestAnimationFrame. */
export function CanvasVisualizer({ draw, className = '' }: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    const parent = canvasRef.current?.parentElement;
    if (parent) observer.observe(parent);

    const animate = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      draw(ctx, width, height, time);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [draw, resizeCanvas]);

  return <canvas ref={canvasRef} className={`block ${className}`} />;
}
```

- [ ] **Step 3: Add to barrel export**

Add `CanvasVisualizer` to `src/components/atoms/index.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/visualizers/colors.ts src/components/atoms/CanvasVisualizer.tsx src/components/atoms/index.ts
git commit -m "[Viz] Add CanvasVisualizer atom with resize handling and animation loop"
```

---

### Task 2: Waveform drawing logic + visualizer

**Files:**
- Create: `src/lib/visualizers/waveform.ts`, `src/lib/visualizers/waveform.test.ts`, `src/components/organisms/WaveformVisualizer.tsx`

- [ ] **Step 1: Write waveform drawing tests**

Create `src/lib/visualizers/waveform.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { drawWaveform } from './waveform';

function createMockCtx(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    setLineDash: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('drawWaveform', () => {
  it('clears the canvas', () => {
    const ctx = createMockCtx();
    const data = new Float32Array(128).fill(0);
    drawWaveform(ctx, 400, 200, data);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 400, 200);
  });

  it('draws a path for waveform data', () => {
    const ctx = createMockCtx();
    const data = new Float32Array(128);
    for (let i = 0; i < 128; i++) data[i] = Math.sin(i / 10);
    drawWaveform(ctx, 400, 200, data);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('handles empty data gracefully', () => {
    const ctx = createMockCtx();
    const data = new Float32Array(0);
    expect(() => drawWaveform(ctx, 400, 200, data)).not.toThrow();
  });
});
```

- [ ] **Step 2: Implement waveform drawing**

Create `src/lib/visualizers/waveform.ts`:

```typescript
import { VIZ_COLORS } from './colors';

/** Draw a waveform (time-domain) visualization.
 * Data values range from -1 to 1. Rendered as a centered line with fill. */
export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Float32Array,
): void {
  ctx.clearRect(0, 0, width, height);
  if (data.length === 0) return;

  /* Background */
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  /* Center line */
  ctx.strokeStyle = VIZ_COLORS.grid;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  /* Waveform fill */
  const sliceWidth = width / data.length;
  ctx.fillStyle = VIZ_COLORS.waveformFill;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  for (let i = 0; i < data.length; i++) {
    const x = i * sliceWidth;
    const y = (1 - data[i]) * height / 2;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height / 2);
  ctx.closePath();
  ctx.fill();

  /* Waveform line */
  ctx.strokeStyle = VIZ_COLORS.waveform;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = i * sliceWidth;
    const y = (1 - data[i]) * height / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
```

- [ ] **Step 3: Create WaveformVisualizer organism**

Create `src/components/organisms/WaveformVisualizer.tsx`:

```tsx
import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawWaveform } from '../../lib/visualizers/waveform';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getMasterAnalyser } from '../../lib/audio/context';

/** Real-time waveform display — reads from master analyser */
export function WaveformVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);

  useEffect(() => {
    try {
      const analyserNode = getMasterAnalyser();
      analyzerRef.current = new AudioAnalyzer(analyserNode);
    } catch {
      /* AudioContext not yet created — will init on first play */
    }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!analyzerRef.current) {
      try {
        const analyserNode = getMasterAnalyser();
        analyzerRef.current = new AudioAnalyzer(analyserNode);
      } catch {
        return;
      }
    }
    const data = analyzerRef.current.getTimeDomainData();
    drawWaveform(ctx, width, height, data);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/visualizers/waveform.ts src/lib/visualizers/waveform.test.ts src/components/organisms/WaveformVisualizer.tsx
git commit -m "[Viz] Add waveform visualizer with Canvas 2D drawing + tests"
```

---

### Task 3: Spectrum analyzer drawing + visualizer

**Files:**
- Create: `src/lib/visualizers/spectrum.ts`, `src/components/organisms/SpectrumVisualizer.tsx`

- [ ] **Step 1: Implement spectrum drawing**

Create `src/lib/visualizers/spectrum.ts`:

```typescript
import { VIZ_COLORS } from './colors';

/** Draw a spectrum (frequency domain) visualization.
 * Data values are in dB (typically -100 to 0). Rendered as vertical bars. */
export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Float32Array,
): void {
  ctx.clearRect(0, 0, width, height);
  if (data.length === 0) return;

  /* Background */
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  /* Number of bars — reduce to ~64 bars max for visual clarity */
  const barCount = Math.min(64, data.length);
  const binSize = Math.floor(data.length / barCount);
  const barWidth = (width / barCount) * 0.8;
  const gap = (width / barCount) * 0.2;

  for (let i = 0; i < barCount; i++) {
    /* Average the bins for this bar */
    let sum = 0;
    for (let j = 0; j < binSize; j++) {
      sum += data[i * binSize + j];
    }
    const avg = sum / binSize;

    /* Normalize from dB (-100 to 0) to 0-1 */
    const normalized = Math.max(0, (avg + 100) / 100);
    const barHeight = normalized * height * 0.9;

    const x = i * (barWidth + gap) + gap / 2;
    const y = height - barHeight;

    /* Bar gradient: blue at bottom, lighter at top */
    ctx.fillStyle = VIZ_COLORS.spectrum;
    ctx.globalAlpha = 0.3 + normalized * 0.7;
    ctx.fillRect(x, y, barWidth, barHeight);

    /* Peak cap */
    ctx.fillStyle = VIZ_COLORS.spectrumPeak;
    ctx.globalAlpha = 1;
    ctx.fillRect(x, y, barWidth, 2);
  }

  ctx.globalAlpha = 1;
}
```

- [ ] **Step 2: Create SpectrumVisualizer organism**

Create `src/components/organisms/SpectrumVisualizer.tsx`:

```tsx
import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawSpectrum } from '../../lib/visualizers/spectrum';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getMasterAnalyser } from '../../lib/audio/context';

/** Real-time spectrum analyzer — frequency domain bars */
export function SpectrumVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);

  useEffect(() => {
    try {
      const analyserNode = getMasterAnalyser();
      analyzerRef.current = new AudioAnalyzer(analyserNode);
    } catch { /* init on first play */ }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!analyzerRef.current) {
      try {
        analyzerRef.current = new AudioAnalyzer(getMasterAnalyser());
      } catch { return; }
    }
    const data = analyzerRef.current.getFrequencyData();
    drawSpectrum(ctx, width, height, data);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/visualizers/spectrum.ts src/components/organisms/SpectrumVisualizer.tsx
git commit -m "[Viz] Add spectrum analyzer visualizer with frequency bars"
```

---

### Task 4: Pattern timeline drawing + visualizer

**Files:**
- Create: `src/lib/visualizers/timeline.ts`, `src/components/organisms/PatternTimeline.tsx`

- [ ] **Step 1: Implement timeline drawing**

Create `src/lib/visualizers/timeline.ts`:

```typescript
import { VIZ_COLORS } from './colors';

/** Draw a pattern timeline — shows beat markers and a scrolling playhead.
 * bpm determines the beat grid spacing. time is the current animation timestamp. */
export function drawTimeline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bpm: number,
  time: number,
  rmsLevel: number,
): void {
  ctx.clearRect(0, 0, width, height);

  /* Background */
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  /* Beat grid */
  const beatMs = 60000 / bpm;
  const beatsVisible = 16;
  const beatWidth = width / beatsVisible;
  const offset = (time % (beatMs * beatsVisible)) / beatMs;

  for (let i = 0; i <= beatsVisible; i++) {
    const x = (i - offset) * beatWidth;
    const isMajor = Math.floor(i + offset) % 4 === 0;

    ctx.strokeStyle = isMajor ? VIZ_COLORS.gridLight : VIZ_COLORS.grid;
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    /* Beat number */
    if (isMajor) {
      ctx.fillStyle = VIZ_COLORS.textDim;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(i + offset) + 1}`, x, 12);
    }
  }

  /* Playhead (center) */
  const playheadX = width * 0.5;
  ctx.strokeStyle = VIZ_COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX, height);
  ctx.stroke();

  /* Level bar at playhead position */
  const barHeight = rmsLevel * height * 0.8;
  ctx.fillStyle = VIZ_COLORS.timelineBar;
  ctx.fillRect(playheadX - 3, height - barHeight, 6, barHeight);

  /* Beat pulse dots */
  const currentBeat = time / beatMs;
  const fractional = currentBeat % 1;
  if (fractional < 0.1) {
    const pulseAlpha = 1 - fractional / 0.1;
    ctx.fillStyle = VIZ_COLORS.timelineBeat;
    ctx.globalAlpha = pulseAlpha;
    ctx.beginPath();
    ctx.arc(playheadX, height / 2, 6 + pulseAlpha * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
```

- [ ] **Step 2: Create PatternTimeline organism**

Create `src/components/organisms/PatternTimeline.tsx`:

```tsx
import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawTimeline } from '../../lib/visualizers/timeline';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getMasterAnalyser } from '../../lib/audio/context';
import { useAppStore } from '../../lib/store';

/** Pattern timeline — scrolling beat grid with playhead and level indicator */
export function PatternTimeline() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const bpm = useAppStore((s) => s.bpm);

  useEffect(() => {
    try {
      analyzerRef.current = new AudioAnalyzer(getMasterAnalyser());
    } catch { /* init on first play */ }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    let rmsLevel = 0;
    if (!analyzerRef.current) {
      try {
        analyzerRef.current = new AudioAnalyzer(getMasterAnalyser());
      } catch { /* ok */ }
    }
    if (analyzerRef.current) {
      rmsLevel = analyzerRef.current.getRmsLevel();
    }
    drawTimeline(ctx, width, height, bpm, time, rmsLevel);
  }, [bpm]);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/visualizers/timeline.ts src/components/organisms/PatternTimeline.tsx
git commit -m "[Viz] Add pattern timeline with beat grid, playhead, and level indicator"
```

---

### Task 5: VisualizerToggle + VisualizerDashboard

**Files:**
- Create: `src/components/molecules/VisualizerToggle.tsx`, `src/components/organisms/VisualizerDashboard.tsx`
- Modify: `src/components/molecules/index.ts`, `src/components/organisms/index.ts`

- [ ] **Step 1: Create VisualizerToggle**

Create `src/components/molecules/VisualizerToggle.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { Button } from '../atoms';
import type { PanelLayout } from '../../types/project';

const panels: { key: keyof PanelLayout['visiblePanels']; icon: string }[] = [
  { key: 'waveform', icon: '〜' },
  { key: 'spectrum', icon: '▊' },
  { key: 'timeline', icon: '◆' },
  { key: 'beatlings', icon: '♫' },
];

/** Toggle buttons for each visualizer panel */
export function VisualizerToggle() {
  const { t } = useTranslation();
  const visiblePanels = useAppStore((s) => s.layout.visiblePanels);
  const togglePanel = useAppStore((s) => s.togglePanel);

  return (
    <nav
      className="flex items-center gap-1 px-2 py-1 shrink-0"
      style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}
      aria-label="Visualizer panels"
    >
      {panels.map(({ key, icon }) => (
        <Button
          key={key}
          variant="ghost"
          active={visiblePanels[key]}
          onClick={() => togglePanel(key)}
          aria-pressed={visiblePanels[key]}
          className="!px-2 !py-0.5 text-xs"
        >
          <span className="mr-1">{icon}</span>
          {t(`panels.${key}`)}
        </Button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Create VisualizerDashboard**

Create `src/components/organisms/VisualizerDashboard.tsx`:

```tsx
import { useAppStore } from '../../lib/store';
import { VisualizerToggle } from '../molecules/VisualizerToggle';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import { PatternTimeline } from './PatternTimeline';

/** Composes all visualizer panels with toggle controls */
export function VisualizerDashboard() {
  const visiblePanels = useAppStore((s) => s.layout.visiblePanels);

  const activePanels = [
    visiblePanels.waveform && { key: 'waveform', component: <WaveformVisualizer /> },
    visiblePanels.spectrum && { key: 'spectrum', component: <SpectrumVisualizer /> },
    visiblePanels.timeline && { key: 'timeline', component: <PatternTimeline /> },
    visiblePanels.beatlings && {
      key: 'beatlings',
      component: (
        <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Beatling World — Phase 6
        </div>
      ),
    },
  ].filter(Boolean) as { key: string; component: JSX.Element }[];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <VisualizerToggle />
      <div className="flex flex-1 min-h-0 gap-px" style={{ backgroundColor: 'var(--color-border)' }}>
        {activePanels.length === 0 ? (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            No visualizers active
          </div>
        ) : (
          activePanels.map(({ key, component }) => (
            <div key={key} className="flex-1 min-w-0" style={{ backgroundColor: 'var(--color-bg)' }}>
              {component}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update barrel exports**

Add `VisualizerToggle` to `src/components/molecules/index.ts`.
Add `WaveformVisualizer`, `SpectrumVisualizer`, `PatternTimeline`, `VisualizerDashboard` to `src/components/organisms/index.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/components/molecules/VisualizerToggle.tsx src/components/molecules/index.ts src/components/organisms/WaveformVisualizer.tsx src/components/organisms/SpectrumVisualizer.tsx src/components/organisms/PatternTimeline.tsx src/components/organisms/VisualizerDashboard.tsx src/components/organisms/index.ts
git commit -m "[Viz] Add VisualizerDashboard with waveform, spectrum, timeline + toggle"
```

---

### Task 6: Wire VisualizerDashboard into Editor page

**Files:**
- Modify: `src/pages/Editor.tsx`

- [ ] **Step 1: Replace visualizer placeholder**

In `src/pages/Editor.tsx`:
- Import `VisualizerDashboard` from organisms
- Replace the visualizer PlaceholderPanel with `<VisualizerDashboard />`
- Remove the PlaceholderPanel component entirely if no longer used

- [ ] **Step 2: Verify it works**

```bash
npm run dev
```

Expected:
1. Navigate to /editor
2. Bottom panel shows 3 visualizers side by side (waveform, spectrum, timeline)
3. Click Play — visualizers react to audio in real time
4. Toggle buttons show/hide individual visualizers
5. Beatling panel shows placeholder
6. Panels resize with drag handle

- [ ] **Step 3: Run tests + build**

```bash
npm run test && npx tsc --noEmit && npm run build
```

- [ ] **Step 4: Commit and push**

```bash
git add src/pages/Editor.tsx
git commit -m "[App] Wire VisualizerDashboard into Editor — live audio visualizers"
git push
```

---

## Phase 5 Completion Criteria

After all 6 tasks:
- CanvasVisualizer reusable atom with DPR-aware resize + animation loop
- Waveform visualizer (time-domain, purple line + fill)
- Spectrum analyzer (frequency bars, blue gradient)
- Pattern timeline (beat grid, scrolling playhead, level indicator)
- Toggle buttons for each visualizer panel
- VisualizerDashboard composing all panels
- Visualizers react to live audio from master analyser
- Beatling panel placeholder ready for Phase 6

**Next:** Phase 6 — Beatling Ecosystem (6 species, dual-brain, GoL, evolution, collection)
