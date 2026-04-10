/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Punchcard visualizer — grid-based note display showing
   post-transformation pattern data. Lighter than pianoroll,
   shows dots/squares where X=time, Y=pitch, size=velocity.
   ────────────────────────────────────────────────────────── */

import { VIZ_COLORS } from './colors';

/* ── Constants ─────────────────────────────────────────── */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);
const KEYS_WIDTH = 30;
const CYCLES_BACK = 2;
const CYCLES_FORWARD = 1;
const PITCH_PADDING = 2;

/* ── MIDI extraction (same as pianoroll) ──────────────── */

function extractMidi(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const m = val.match(/^([a-g])(s|#|b|f)?(\d)?$/i);
    if (m) {
      const name = m[1].toUpperCase();
      const acc = (m[2] === '#' || m[2] === 's') ? 1 : (m[2] === 'b' || m[2] === 'f') ? -1 : 0;
      const oct = m[3] ? parseInt(m[3]) : 3;
      const idx = NOTE_NAMES.indexOf(name);
      if (idx >= 0) return (oct + 1) * 12 + idx + acc;
    }
  }
  if (val && typeof val === 'object') {
    const v = val as Record<string, unknown>;
    if (typeof v.note === 'number') return v.note;
    if (typeof v.note === 'string') return extractMidi(v.note);
    if (typeof v.n === 'number') return v.n;
    if (typeof v.freq === 'number') return Math.round(12 * Math.log2((v.freq as number) / 440) + 69);
  }
  return -1;
}

function extractVelocity(val: unknown): number {
  if (val && typeof val === 'object') {
    const v = val as Record<string, unknown>;
    if (typeof v.gain === 'number') return Math.min(1, Math.max(0, v.gain));
  }
  return 0.8;
}

/* ── Main draw function ───────────────────────────────── */

export function drawPunchcard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _time: number,
  getRepl: () => any | null,
) {
  /* Background */
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  const repl = getRepl();
  if (!repl?.scheduler || !repl.state?.pattern?.queryArc) {
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Punchcard — play a pattern to see events', width / 2, height / 2);
    return;
  }

  /* Query haps */
  const now = repl.scheduler.now();
  const timeStart = now - CYCLES_BACK;
  const timeEnd = now + CYCLES_FORWARD;
  const timeRange = timeEnd - timeStart;

  let haps: unknown[];
  try {
    haps = repl.state.pattern.queryArc(Math.max(0, timeStart), timeEnd);
  } catch {
    return;
  }

  /* Parse events */
  interface PunchEvent { note: number; time: number; velocity: number }
  const events: PunchEvent[] = [];
  let minNote = 127;
  let maxNote = 0;

  for (const hap of haps as any[]) {
    if (!hap.whole) continue;
    const midi = extractMidi(hap.value);
    if (midi < 0 || midi > 127) continue;
    const vel = extractVelocity(hap.value);
    minNote = Math.min(minNote, midi);
    maxNote = Math.max(maxNote, midi);
    /* Use the onset (begin) as the event time */
    events.push({ note: midi, time: hap.whole.begin, velocity: vel });
  }

  if (events.length === 0) {
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Punchcard — waiting for events...', width / 2, height / 2);
    return;
  }

  /* Auto-range */
  minNote = Math.max(0, minNote - PITCH_PADDING);
  maxNote = Math.min(127, maxNote + PITCH_PADDING);
  if (maxNote - minNote < 12) {
    const mid = Math.round((minNote + maxNote) / 2);
    minNote = Math.max(0, mid - 6);
    maxNote = Math.min(127, mid + 6);
  }
  const noteRange = maxNote - minNote + 1;

  /* Layout */
  const drawWidth = width - KEYS_WIDTH;
  const rowHeight = Math.max(4, (height - 2) / noteRange);

  /* Helpers */
  const noteY = (n: number) => (maxNote - n) * rowHeight;
  const timeX = (t: number) => KEYS_WIDTH + ((t - timeStart) / timeRange) * drawWidth;

  /* Row backgrounds */
  for (let n = minNote; n <= maxNote; n++) {
    const y = noteY(n);
    if (BLACK_KEYS.has(n % 12)) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(KEYS_WIDTH, y, drawWidth, rowHeight);
    }
    if (n % 12 === 0) {
      ctx.strokeStyle = VIZ_COLORS.grid;
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(KEYS_WIDTH, y + rowHeight);
      ctx.lineTo(width, y + rowHeight);
      ctx.stroke();
    }
  }

  /* Beat grid */
  for (let cyc = Math.floor(timeStart); cyc <= Math.ceil(timeEnd); cyc++) {
    const x = timeX(cyc);
    if (x > KEYS_WIDTH && x < width) {
      ctx.strokeStyle = VIZ_COLORS.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      /* Cycle label */
      ctx.fillStyle = VIZ_COLORS.textDim;
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${cyc + 1}`, x, 1);
    }
    /* Quarter subdivisions */
    for (let q = 1; q < 4; q++) {
      const qx = timeX(cyc + q / 4);
      if (qx > KEYS_WIDTH && qx < width) {
        ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
        ctx.lineWidth = 0.2;
        ctx.beginPath();
        ctx.moveTo(qx, 0);
        ctx.lineTo(qx, height);
        ctx.stroke();
      }
    }
  }

  /* Draw dots — size and opacity mapped to velocity */
  const maxDotSize = Math.min(rowHeight * 0.7, 10);

  for (const evt of events) {
    const x = timeX(evt.time);
    const y = noteY(evt.note) + rowHeight / 2;
    const isActive = Math.abs(evt.time - now) < 0.125;
    const size = 2 + evt.velocity * (maxDotSize - 2);
    const alpha = isActive ? 0.95 : 0.3 + evt.velocity * 0.4;

    /* Glow for active events */
    if (isActive) {
      ctx.save();
      ctx.shadowColor = VIZ_COLORS.accentGlow;
      ctx.shadowBlur = 8;
    }

    /* Dot color: purple accent, velocity-mapped opacity */
    ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    if (isActive) ctx.restore();
  }

  /* Playhead */
  const phX = timeX(now);
  ctx.save();
  ctx.shadowColor = VIZ_COLORS.accentGlow;
  ctx.shadowBlur = 6;
  ctx.strokeStyle = VIZ_COLORS.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(phX, 0);
  ctx.lineTo(phX, height);
  ctx.stroke();
  ctx.restore();

  /* Piano key labels */
  ctx.fillStyle = '#111113';
  ctx.fillRect(0, 0, KEYS_WIDTH, height);
  ctx.strokeStyle = VIZ_COLORS.grid;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(KEYS_WIDTH - 0.5, 0);
  ctx.lineTo(KEYS_WIDTH - 0.5, height);
  ctx.stroke();

  for (let n = minNote; n <= maxNote; n++) {
    if (n % 12 === 0) {
      const y = noteY(n) + rowHeight / 2;
      ctx.fillStyle = VIZ_COLORS.textDim;
      ctx.font = `${Math.min(8, rowHeight - 1)}px monospace`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`C${Math.floor(n / 12) - 1}`, KEYS_WIDTH - 3, y);
    }
  }
}
