/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Punchcard visualizer — grid of dots showing post-transformation
   pattern data. Lighter than pianoroll, dot size = velocity.
   ────────────────────────────────────────────────────────── */

import { useCallback } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawPunchcard } from '../../lib/visualizers/punchcard';

function getRepl() {
  return (window as any).__strudelRepl ?? null;
}

export function PunchcardVisualizer() {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      drawPunchcard(ctx, width, height, time, getRepl);
    },
    [],
  );

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
