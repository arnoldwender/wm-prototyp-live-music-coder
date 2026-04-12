/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   DAW-quality piano roll visualizer with zoom controls.
   ────────────────────────────────────────────────────────── */

import { useCallback, useState } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawPianoroll } from '../../lib/visualizers/pianoroll';

/** Get REPL reference from global — set by StrudelEditor on init */
function getRepl() {
  return (window as unknown as { __strudelRepl?: unknown }).__strudelRepl ?? null;
}

/** Shared button style for zoom controls overlay */
const btnStyle: React.CSSProperties = {
  background: 'var(--color-bg-alt)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-muted)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--font-size-xs)',
  fontFamily: 'var(--font-family-mono)',
  padding: 'var(--space-1) var(--space-2)',
  cursor: 'pointer',
  lineHeight: '1.4',
  userSelect: 'none',
};

const ZOOM_STEP = 1.4;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 6;

export function PianorollVisualizer() {
  const [zoomX, setZoomX] = useState(1);
  const [zoomY, setZoomY] = useState(1);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      drawPianoroll(
        ctx, width, height, time,
        getRepl as Parameters<typeof drawPianoroll>[4],
        zoomX, zoomY,
      );
    },
    [zoomX, zoomY],
  );

  return (
    <div className="h-full w-full relative" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} ariaLabel="Piano roll — note timeline and pitch display" />

      {/* Zoom controls — top-right overlay */}
      <div
        role="group"
        aria-label="Piano roll zoom controls"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          zIndex: 10,
        }}
      >
        {/* Time zoom */}
        <button
          style={btnStyle}
          title="Zoom in (time)"
          aria-label="Zoom in time axis"
          onClick={() => setZoomX((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP))}
        >+T</button>
        <button
          style={btnStyle}
          title="Zoom out (time)"
          aria-label="Zoom out time axis"
          onClick={() => setZoomX((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP))}
        >−T</button>

        {/* Separator */}
        <span aria-hidden="true" style={{ color: 'var(--color-border)', fontSize: 'var(--font-size-xs)' }}>|</span>

        {/* Pitch zoom */}
        <button
          style={btnStyle}
          title="Zoom in (pitch)"
          aria-label="Zoom in pitch axis"
          onClick={() => setZoomY((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP))}
        >+P</button>
        <button
          style={btnStyle}
          title="Zoom out (pitch)"
          aria-label="Zoom out pitch axis"
          onClick={() => setZoomY((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP))}
        >−P</button>

        {/* Reset */}
        <button
          style={btnStyle}
          title="Reset zoom"
          aria-label="Reset zoom to default"
          onClick={() => { setZoomX(1); setZoomY(1); }}
        >↺</button>
      </div>
    </div>
  );
}
