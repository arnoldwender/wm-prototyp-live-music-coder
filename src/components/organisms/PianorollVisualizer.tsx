/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   DAW-quality piano roll visualizer.
   Renders a scrolling note display inspired by Ableton Live
   and FL Studio: beat grid, piano key sidebar, velocity-colored
   notes with glow, playhead, and velocity lane.
   ────────────────────────────────────────────────────────── */

import { useCallback } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawPianoroll } from '../../lib/visualizers/pianoroll';

/** Get REPL reference from global — set by StrudelEditor on init */
function getRepl() {
  return (window as any).__strudelRepl ?? null;
}

export function PianorollVisualizer() {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      drawPianoroll(ctx, width, height, time, getRepl);
    },
    [],
  );

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
