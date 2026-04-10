/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media */

import { useCallback } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawPitchwheel } from '../../lib/visualizers/pitchwheel';

function getRepl() { return (window as any).__strudelRepl ?? null; }

export function PitchwheelVisualizer() {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      drawPitchwheel(ctx, w, h, t, getRepl);
    }, [],
  );
  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
