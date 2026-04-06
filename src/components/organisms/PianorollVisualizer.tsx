/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Pianoroll visualizer — uses @strudel/draw's native pianoroll
   to render a scrolling musical score view of active patterns.
   Falls back to a custom canvas implementation if @strudel/draw
   is not available.
   ────────────────────────────────────────────────────────── */

import { useEffect, useRef, useCallback } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { VIZ_COLORS } from '../../lib/visualizers/colors';

/* Note name lookup */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Color for a MIDI note — maps pitch to hue for visual variety */
function noteColor(note: number, alpha = 1): string {
  const hue = (note * 7) % 360;
  return `hsla(${hue}, 70%, 60%, ${alpha})`;
}

export function PianorollVisualizer() {
  const replRef = useRef<any>(null);
  const hapsRef = useRef<any[]>([]);
  const frameRef = useRef(0);

  /* Get REPL reference from Strudel */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { getAudioContext } = await import('@strudel/webaudio');
        if (mounted && getAudioContext()) {
          /* Store a reference so draw can access scheduler */
        }
      } catch { /* webaudio not ready */ }
    })();
    return () => { mounted = false; };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, _time: number) => {
    frameRef.current++;

    /* Try to query current pattern haps every 5 frames */
    if (frameRef.current % 5 === 0) {
      try {
        /* Access the global strudel REPL via window — initStrudel stores it */
        const repl = (window as any).__strudelRepl;
        if (!repl && !replRef.current) {
          /* Try to find the REPL from strudel's global state */
          import('@strudel/web').then((mod: any) => {
            if (mod.repl) replRef.current = mod.repl;
          }).catch(() => {});
        }

        const r = replRef.current || (window as any).__strudelRepl;
        if (r?.scheduler && r.state?.pattern?.queryArc) {
          const now = r.scheduler.now();
          /* Query a wider window for pianoroll display (2 cycles back, 1 forward) */
          const haps = r.state.pattern.queryArc(Math.max(0, now - 2), now + 1);
          hapsRef.current = haps;
        }
      } catch { /* pattern query failed */ }
    }

    /* Background */
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, VIZ_COLORS.bg);
    bgGrad.addColorStop(1, VIZ_COLORS.bgAlt);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const haps = hapsRef.current;
    if (!haps || haps.length === 0) {
      /* Empty state — show hint */
      ctx.fillStyle = VIZ_COLORS.textDim;
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('♩ Pianoroll — play a pattern to see notes', width / 2, height / 2);
      return;
    }

    /* Determine note range from current haps */
    let minNote = 127;
    let maxNote = 0;
    const noteEvents: { note: number; start: number; end: number; velocity: number }[] = [];

    for (const hap of haps) {
      if (!hap.whole) continue;
      const val = hap.value;
      let midiNote = 60;

      /* Extract MIDI note from various Strudel value formats */
      if (typeof val === 'number') midiNote = val;
      else if (typeof val === 'string') {
        /* Parse note names like "c3", "d#4" */
        const match = val.match(/^([a-g])(#|b)?(\d)?$/i);
        if (match) {
          const name = match[1].toUpperCase();
          const sharp = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
          const octave = match[3] ? parseInt(match[3]) : 3;
          const idx = NOTE_NAMES.indexOf(name);
          if (idx >= 0) midiNote = (octave + 1) * 12 + idx + sharp;
        }
      } else if (val && typeof val === 'object') {
        if ('note' in val && typeof val.note === 'number') midiNote = val.note;
        else if ('n' in val && typeof val.n === 'number') midiNote = val.n;
        else if ('freq' in val && typeof val.freq === 'number') {
          midiNote = Math.round(12 * Math.log2(val.freq / 440) + 69);
        }
      }

      if (midiNote < 0 || midiNote > 127) continue;
      minNote = Math.min(minNote, midiNote);
      maxNote = Math.max(maxNote, midiNote);

      const velocity = (val && typeof val === 'object' && 'gain' in val) ? val.gain : 0.8;
      noteEvents.push({
        note: midiNote,
        start: hap.whole.begin,
        end: hap.whole.end,
        velocity: typeof velocity === 'number' ? velocity : 0.8,
      });
    }

    if (noteEvents.length === 0) return;

    /* Add padding to note range */
    minNote = Math.max(0, minNote - 2);
    maxNote = Math.min(127, maxNote + 2);
    const noteRange = Math.max(maxNote - minNote + 1, 12);

    /* Time window: 3 cycles visible */
    let now = 0;
    try {
      const r = replRef.current || (window as any).__strudelRepl;
      if (r?.scheduler) now = r.scheduler.now();
    } catch { /* fallback */ }

    const timeStart = now - 2;
    const timeEnd = now + 1;
    const timeRange = timeEnd - timeStart;

    /* Piano key labels on left */
    const labelWidth = 28;
    const drawWidth = width - labelWidth;
    const noteHeight = Math.max(2, (height - 4) / noteRange);

    /* Draw horizontal grid lines (note rows) */
    for (let n = minNote; n <= maxNote; n++) {
      const y = height - ((n - minNote + 0.5) / noteRange) * height;
      const isBlack = [1, 3, 6, 8, 10].includes(n % 12);

      /* Subtle alternating background */
      if (isBlack) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(labelWidth, y - noteHeight / 2, drawWidth, noteHeight);
      }

      /* C notes get a brighter line */
      if (n % 12 === 0) {
        ctx.strokeStyle = VIZ_COLORS.gridLight;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(labelWidth, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        /* Label: C + octave number */
        ctx.fillStyle = VIZ_COLORS.textDim;
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`C${Math.floor(n / 12) - 1}`, labelWidth - 3, y + 3);
      }
    }

    /* Playhead line */
    const playheadX = labelWidth + ((now - timeStart) / timeRange) * drawWidth;
    ctx.save();
    ctx.shadowColor = VIZ_COLORS.accentGlow;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = VIZ_COLORS.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
    ctx.restore();

    /* Draw note rectangles */
    for (const evt of noteEvents) {
      const x1 = labelWidth + ((evt.start - timeStart) / timeRange) * drawWidth;
      const x2 = labelWidth + ((evt.end - timeStart) / timeRange) * drawWidth;
      const y = height - ((evt.note - minNote + 0.5) / noteRange) * height;
      const w = Math.max(2, x2 - x1);
      const h = Math.max(2, noteHeight * 0.8);

      /* Is this note currently sounding? */
      const isActive = evt.start <= now && evt.end > now;
      const alpha = isActive ? 0.9 : 0.5;

      /* Glow for active notes */
      if (isActive) {
        ctx.save();
        ctx.shadowColor = noteColor(evt.note, 0.6);
        ctx.shadowBlur = 10;
        ctx.fillStyle = noteColor(evt.note, alpha);
        drawRoundedRect(ctx, x1, y - h / 2, w, h, 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = noteColor(evt.note, alpha);
        drawRoundedRect(ctx, x1, y - h / 2, w, h, 2);
        ctx.fill();
      }

      /* Note label on wider bars */
      if (w > 20) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        const noteName = NOTE_NAMES[evt.note % 12] + (Math.floor(evt.note / 12) - 1);
        ctx.fillText(noteName, x1 + 3, y + 3);
      }
    }

    /* Time markers */
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    for (let cyc = Math.floor(timeStart); cyc <= Math.ceil(timeEnd); cyc++) {
      const x = labelWidth + ((cyc - timeStart) / timeRange) * drawWidth;
      if (x > labelWidth && x < width - 10) {
        ctx.fillText(`${cyc + 1}`, x, 10);
        ctx.strokeStyle = VIZ_COLORS.grid;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 14);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}

/** Draw a rectangle with small rounded corners */
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.lineTo(x + w, y + h);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.lineTo(x, y + h);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
