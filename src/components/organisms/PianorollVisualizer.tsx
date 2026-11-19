/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Read-only DAW piano roll visualizer with zoom controls,
   timeline panning, and click-to-audition notes.
   ────────────────────────────────────────────────────────── */

import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawPianoroll } from '../../lib/visualizers/pianoroll';
import type { NoteEvent } from '../../lib/visualizers/pianoroll';

function getRepl() {
  return window.__strudelRepl ?? null;
}

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
/** Cycles shifted per pixel of horizontal drag */
const DRAG_SENSITIVITY = 0.004;

export function PianorollVisualizer() {
  const { t } = useTranslation();
  const [zoomX, setZoomX] = useState(1);
  const [zoomY, setZoomY] = useState(1);
  const [timeOffset, setTimeOffset] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null);
  /* Extended event sink — populated each frame with layout data for hit-testing */
  const eventSinkRef = useRef<{
    events: NoteEvent[]; timeStart: number; timeEnd: number; drawW: number; keysWidth: number;
    minNote: number; maxNote: number; noteHeight: number; yOffset: number;
  }>({
    events: [], timeStart: 0, timeEnd: 0, drawW: 0, keysWidth: 52,
    minNote: 0, maxNote: 127, noteHeight: 10, yOffset: 0,
  });

  /* draw is only recreated when zoom/pan state changes */
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      drawPianoroll(
        ctx, width, height, time,
        getRepl,
        zoomX, zoomY, timeOffset,
        eventSinkRef.current,
      );
    },
    [zoomX, zoomY, timeOffset],
  );

  /* Hit-test: is clientY above the velocity lane (i.e. in the note area)? */
  function isInNoteLane(canvas: HTMLCanvasElement, clientY: number): boolean {
    const rect = canvas.getBoundingClientRect();
    const y = clientY - rect.top;
    return rect.height <= 100 || y <= rect.height - 18;
  }

  /* Hit-test a note bar in the note area using CSS pixels.
     DPR adjustment converts physical canvas noteHeight to CSS pixels. */
  function findNote(clientX: number, clientY: number, canvas: HTMLCanvasElement): { note: number } | null {
    const sink = eventSinkRef.current;
    if (sink.events.length === 0 || sink.drawW === 0) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const noteHeightCss = sink.noteHeight / dpr;
    const yOffsetCss = sink.yOffset / dpr;
    if (noteHeightCss <= 1) return null;
    const timeRange = sink.timeEnd - sink.timeStart;
    const t = sink.timeStart + ((x - sink.keysWidth) / sink.drawW) * timeRange;

    for (const evt of sink.events) {
      const noteTop = yOffsetCss + (sink.maxNote - evt.note) * noteHeightCss;
      if (t >= evt.start && t <= evt.end && y >= noteTop && y <= noteTop + noteHeightCss) {
        return { note: evt.note };
      }
    }
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = e.currentTarget.querySelector('canvas') as HTMLCanvasElement | null;
    if (canvas && isInNoteLane(canvas, e.clientY)) {
      const hit = findNote(e.clientX, e.clientY, canvas);
      if (hit) {
        /* Audition the clicked note immediately without mutating the pattern */
        window.__lmcPlayNote?.(hit.note);
        return;
      }
    }
    dragRef.current = { startX: e.clientX, startOffset: timeOffset };
    setIsPanning(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    setTimeOffset(dragRef.current.startOffset + dx * DRAG_SENSITIVITY);
  };

  const handleMouseUp = () => {
    dragRef.current = null;
    setIsPanning(false);
  };

  return (
    <div
      className="h-full w-full relative"
      style={{
        backgroundColor: 'var(--color-bg)',
        cursor: isPanning ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CanvasVisualizer draw={draw} ariaLabel="Piano roll — note timeline and pitch display" />

      {/* Pan offset indicator — visible when user has panned away from live view */}
      {Math.abs(timeOffset) > 0.05 && (
        <div style={{
          position: 'absolute',
          bottom: 'var(--space-6)',
          right: 'var(--space-2)',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          color: 'var(--color-primary)',
          background: 'var(--color-overlay)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {timeOffset > 0 ? `−${timeOffset.toFixed(1)}c` : `+${Math.abs(timeOffset).toFixed(1)}c`}
        </div>
      )}

      {/* Zoom controls — top-right overlay */}
      <div
        role="group"
        aria-label="Piano roll zoom controls"
        style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)', zIndex: 10 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button style={btnStyle} title={t('pianoroll.zoomInTime')} aria-label={t('pianoroll.zoomInTime')}
          onClick={() => setZoomX((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP))}>+T</button>
        <button style={btnStyle} title={t('pianoroll.zoomOutTime')} aria-label={t('pianoroll.zoomOutTime')}
          onClick={() => setZoomX((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP))}>−T</button>
        <span aria-hidden="true" style={{ color: 'var(--color-border)', fontSize: 'var(--font-size-xs)' }}>|</span>
        <button style={btnStyle} title={t('pianoroll.zoomInPitch')} aria-label={t('pianoroll.zoomInPitch')}
          onClick={() => setZoomY((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP))}>+P</button>
        <button style={btnStyle} title={t('pianoroll.zoomOutPitch')} aria-label={t('pianoroll.zoomOutPitch')}
          onClick={() => setZoomY((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP))}>−P</button>
        <span aria-hidden="true" style={{ color: 'var(--color-border)', fontSize: 'var(--font-size-xs)' }}>|</span>
        <button style={btnStyle} title={t('pianoroll.resetView')} aria-label={t('pianoroll.resetView')}
          onClick={() => { setZoomX(1); setZoomY(1); setTimeOffset(0); }}>↺</button>
      </div>
    </div>
  );
}
