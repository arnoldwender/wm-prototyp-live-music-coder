/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   DAW-quality piano roll visualizer with zoom controls,
   timeline panning, velocity drag, and pitch drag.
   ────────────────────────────────────────────────────────── */

import { useCallback, useRef, useState } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawPianoroll } from '../../lib/visualizers/pianoroll';
import type { NoteEvent } from '../../lib/visualizers/pianoroll';

/* MIDI note number → note name + octave (e.g. 60 → "C4") */
const MIDI_NOTE_NAME = (n: number): string =>
  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][n % 12] + String(Math.floor(n / 12) - 1);

function getRepl() {
  return (window as unknown as { __strudelRepl?: unknown }).__strudelRepl ?? null;
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
  const [zoomX, setZoomX] = useState(1);
  const [zoomY, setZoomY] = useState(1);
  const [timeOffset, setTimeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null);
  const [velocityOverrides, setVelocityOverrides] = useState<Map<string, number>>(new Map());
  const [pitchOverrides, setPitchOverrides] = useState<Map<string, number>>(new Map());
  /* Extended event sink — populated each frame with layout data for hit-testing */
  const eventSinkRef = useRef<{
    events: NoteEvent[]; timeStart: number; timeEnd: number; drawW: number; keysWidth: number;
    minNote: number; maxNote: number; noteHeight: number; yOffset: number;
  }>({
    events: [], timeStart: 0, timeEnd: 0, drawW: 0, keysWidth: 52,
    minNote: 0, maxNote: 127, noteHeight: 10, yOffset: 0,
  });
  const velDragRef = useRef<{ key: string; startY: number; startVel: number } | null>(null);
  /* Pitch drag state — tracks which note is being dragged and its original pitch */
  const pitchDragRef = useRef<{ key: string; origNote: number; startY: number } | null>(null);
  const [dragLabel, setDragLabel] = useState<{ text: string; x: number; y: number } | null>(null);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      drawPianoroll(
        ctx, width, height, time,
        getRepl as Parameters<typeof drawPianoroll>[4],
        zoomX, zoomY, timeOffset, velocityOverrides, pitchOverrides, eventSinkRef.current,
      );
    },
    [zoomX, zoomY, timeOffset, velocityOverrides, pitchOverrides],
  );

  /* Hit-test: is clientY inside the velocity lane (bottom 18px)?
     Uses CSS pixel dimensions (getBoundingClientRect) so the threshold
     is correct on HiDPI/Retina screens where canvas.height is scaled. */
  function isInVelLane(canvas: HTMLCanvasElement, clientY: number): boolean {
    const rect = canvas.getBoundingClientRect();
    const y = clientY - rect.top;
    return rect.height > 100 && y > rect.height - 18;
  }

  /* Hit-test: is clientY above the velocity lane (i.e. in the note area)? */
  function isInNoteLane(canvas: HTMLCanvasElement, clientY: number): boolean {
    const rect = canvas.getBoundingClientRect();
    const y = clientY - rect.top;
    return rect.height <= 100 || y <= rect.height - 18;
  }

  /* Find the note event under clientX in the velocity lane */
  function findVelNote(clientX: number, canvas: HTMLCanvasElement): { key: string; vel: number } | null {
    const sink = eventSinkRef.current;
    if (sink.events.length === 0 || sink.drawW === 0) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const timeRange = sink.timeEnd - sink.timeStart;
    const t = sink.timeStart + ((x - sink.keysWidth) / sink.drawW) * timeRange;
    let best: NoteEvent | null = null;
    let bestDist = Infinity;
    for (const evt of sink.events) {
      if (t >= evt.start && t <= evt.end) {
        const dist = Math.abs(t - (evt.start + evt.end) / 2);
        if (dist < bestDist) { best = evt; bestDist = dist; }
      }
    }
    if (!best) return null;
    const key = `${best.note}:${best.start}`;
    const vel = velocityOverrides.get(key) ?? best.velocity;
    return { key, vel };
  }

  /* Hit-test a note bar in the note area using CSS pixels.
     DPR adjustment converts physical canvas noteHeight to CSS pixels. */
  function findNote(clientX: number, clientY: number, canvas: HTMLCanvasElement): { key: string; note: number } | null {
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
      const overrideKey = `${evt.note}:${evt.start}`;
      const drawNote = pitchOverrides.get(overrideKey) ?? evt.note;
      const noteTop = yOffsetCss + (sink.maxNote - drawNote) * noteHeightCss;
      if (t >= evt.start && t <= evt.end && y >= noteTop && y <= noteTop + noteHeightCss) {
        return { key: overrideKey, note: drawNote };
      }
    }
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = e.currentTarget.querySelector('canvas') as HTMLCanvasElement | null;
    if (canvas) {
      if (isInVelLane(canvas, e.clientY)) {
        const hit = findVelNote(e.clientX, canvas);
        if (hit) {
          velDragRef.current = { key: hit.key, startY: e.clientY, startVel: hit.vel };
          setIsDragging(true);
          return;
        }
      } else if (isInNoteLane(canvas, e.clientY)) {
        const hit = findNote(e.clientX, e.clientY, canvas);
        if (hit) {
          /* Audition the note immediately on click via the global play hook */
          (window as unknown as { __lmcPlayNote?: (n: number) => void }).__lmcPlayNote?.(hit.note);
          pitchDragRef.current = { key: hit.key, origNote: hit.note, startY: e.clientY };
          setIsDragging(true);
          return;
        }
      }
    }
    dragRef.current = { startX: e.clientX, startOffset: timeOffset };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    /* Pitch drag — vertical movement maps to semitone steps */
    if (pitchDragRef.current) {
      const dpr = window.devicePixelRatio || 1;
      const noteHeightCss = eventSinkRef.current.noteHeight / dpr;
      if (noteHeightCss <= 1) return;
      const dy = e.clientY - pitchDragRef.current.startY;
      const semitones = Math.round(-dy / noteHeightCss);
      const newNote = Math.max(0, Math.min(127, pitchDragRef.current.origNote + semitones));
      setPitchOverrides((prev) => {
        const next = new Map(prev);
        next.set(pitchDragRef.current!.key, newNote);
        return next;
      });
      setDragLabel({
        text: `${MIDI_NOTE_NAME(pitchDragRef.current.origNote)} → ${MIDI_NOTE_NAME(newNote)}`,
        x: e.clientX,
        y: e.clientY,
      });
      return;
    }
    /* Velocity drag — vertical movement scales velocity */
    if (velDragRef.current) {
      const dy = velDragRef.current.startY - e.clientY;
      const newVel = Math.min(1, Math.max(0.02, velDragRef.current.startVel + dy / 80));
      setVelocityOverrides((prev) => {
        const next = new Map(prev);
        next.set(velDragRef.current!.key, newVel);
        return next;
      });
      return;
    }
    /* Timeline pan — horizontal drag shifts time offset */
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    setTimeOffset(dragRef.current.startOffset + dx * DRAG_SENSITIVITY);
  };

  const handleMouseUp = () => {
    dragRef.current = null;
    velDragRef.current = null;
    pitchDragRef.current = null;
    setDragLabel(null);
    setIsDragging(false);
  };

  return (
    <div
      className="h-full w-full relative"
      style={{
        backgroundColor: 'var(--color-bg)',
        /* ns-resize for pitch/velocity vertical drags; grabbing for timeline pan; grab at rest */
        cursor: isDragging
          ? (pitchDragRef.current || velDragRef.current ? 'ns-resize' : 'grabbing')
          : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CanvasVisualizer draw={draw} ariaLabel="Piano roll — note timeline and pitch display" />

      {/* Floating pitch drag label — shows original → new note name while dragging */}
      {dragLabel && (
        <div style={{
          position: 'fixed',
          left: dragLabel.x + 12,
          top: dragLabel.y - 20,
          pointerEvents: 'none',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          color: 'var(--color-text)',
          background: 'var(--color-overlay-heavy)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}>
          {dragLabel.text}
        </div>
      )}

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
        <button style={btnStyle} title="Zoom in (time)" aria-label="Zoom in time axis"
          onClick={() => setZoomX((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP))}>+T</button>
        <button style={btnStyle} title="Zoom out (time)" aria-label="Zoom out time axis"
          onClick={() => setZoomX((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP))}>−T</button>
        <span aria-hidden="true" style={{ color: 'var(--color-border)', fontSize: 'var(--font-size-xs)' }}>|</span>
        <button style={btnStyle} title="Zoom in (pitch)" aria-label="Zoom in pitch axis"
          onClick={() => setZoomY((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP))}>+P</button>
        <button style={btnStyle} title="Zoom out (pitch)" aria-label="Zoom out pitch axis"
          onClick={() => setZoomY((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP))}>−P</button>
        <span aria-hidden="true" style={{ color: 'var(--color-border)', fontSize: 'var(--font-size-xs)' }}>|</span>
        <button style={btnStyle} title="Reset zoom and pan" aria-label="Reset view and velocity overrides"
          onClick={() => { setZoomX(1); setZoomY(1); setTimeOffset(0); setVelocityOverrides(new Map()); setPitchOverrides(new Map()); }}>↺</button>
      </div>
    </div>
  );
}
