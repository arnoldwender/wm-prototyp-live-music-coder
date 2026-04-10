/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   DAW-quality piano roll draw function.
   Renders a scrolling note view inspired by Ableton Live and
   FL Studio: beat grid, piano key sidebar, velocity-colored
   notes, playhead with glow, auto-range pitch fitting.
   ────────────────────────────────────────────────────────── */

import { VIZ_COLORS } from './colors';

/* ── Constants ─────────────────────────────────────────── */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);

/* Piano sidebar width in pixels */
const KEYS_WIDTH = 36;

/* Time window: how many cycles to show (past + future) */
const CYCLES_BACK = 2;
const CYCLES_FORWARD = 1;

/* Note height constraints */
const MIN_NOTE_HEIGHT = 4;
const MAX_NOTE_HEIGHT = 20;

/* Pitch padding above/below the note range */
const PITCH_PADDING = 3;

/* ── Types ─────────────────────────────────────────────── */

interface NoteEvent {
  note: number;
  start: number;
  end: number;
  velocity: number;
}

/* ── Note color — velocity-mapped brightness ──────────── */

/** Warm purple-to-blue palette based on velocity (gain).
 *  Higher velocity = brighter and more saturated. */
function noteColorByVelocity(note: number, velocity: number, isActive: boolean): string {
  /* Hue: slight variation by pitch class for visual interest */
  const hue = 260 + (note % 12) * 3;
  /* Saturation: higher velocity = more saturated */
  const sat = 50 + velocity * 40;
  /* Lightness: active notes glow brighter */
  const light = isActive ? 55 + velocity * 20 : 35 + velocity * 20;
  const alpha = isActive ? 0.95 : 0.7;
  return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
}

/* ── MIDI note extraction from hap values ─────────────── */

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

export function drawPianoroll(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _time: number,
  getRepl: () => { scheduler: { now(): number }; state: { pattern: { queryArc(a: number, b: number): unknown[] } | null } } | null,
) {
  /* ── Background ─────────────────────────────────────── */
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  const repl = getRepl();
  if (!repl?.scheduler || !repl.state?.pattern?.queryArc) {
    /* Empty state hint */
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Piano Roll — play a pattern to see notes', width / 2, height / 2);
    return;
  }

  /* ── Query haps ─────────────────────────────────────── */
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

  /* ── Parse note events ──────────────────────────────── */
  const events: NoteEvent[] = [];
  let minNote = 127;
  let maxNote = 0;

  for (const hap of haps as any[]) {
    if (!hap.whole) continue;
    const midi = extractMidi(hap.value);
    if (midi < 0 || midi > 127) continue;
    const vel = extractVelocity(hap.value);
    minNote = Math.min(minNote, midi);
    maxNote = Math.max(maxNote, midi);
    events.push({
      note: midi,
      start: hap.whole.begin,
      end: hap.whole.end,
      velocity: vel,
    });
  }

  if (events.length === 0) {
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Piano Roll — waiting for notes...', width / 2, height / 2);
    return;
  }

  /* ── Auto-range: fit pitch to active notes ──────────── */
  minNote = Math.max(0, minNote - PITCH_PADDING);
  maxNote = Math.min(127, maxNote + PITCH_PADDING);
  /* Ensure minimum 1-octave visible range */
  if (maxNote - minNote < 12) {
    const mid = Math.round((minNote + maxNote) / 2);
    minNote = Math.max(0, mid - 6);
    maxNote = Math.min(127, mid + 6);
  }
  const noteRange = maxNote - minNote + 1;

  /* ── Layout ─────────────────────────────────────────── */
  const drawWidth = width - KEYS_WIDTH;
  const noteHeight = Math.min(MAX_NOTE_HEIGHT, Math.max(MIN_NOTE_HEIGHT, (height - 2) / noteRange));
  const totalNotesHeight = noteHeight * noteRange;
  /* Vertical offset to center notes if canvas is taller than needed */
  const yOffset = Math.max(0, (height - totalNotesHeight) / 2);

  /* Helper: note index (0 = minNote) → Y position (top of row) */
  const noteY = (n: number) => yOffset + (maxNote - n) * noteHeight;
  /* Helper: time → X position */
  const timeX = (t: number) => KEYS_WIDTH + ((t - timeStart) / timeRange) * drawWidth;

  /* ── Draw note row backgrounds ──────────────────────── */
  for (let n = minNote; n <= maxNote; n++) {
    const y = noteY(n);
    /* Black keys get a slightly darker background */
    if (BLACK_KEYS.has(n % 12)) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(KEYS_WIDTH, y, drawWidth, noteHeight);
    }
    /* C notes: horizontal separator line */
    if (n % 12 === 0) {
      ctx.strokeStyle = VIZ_COLORS.gridLight;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(KEYS_WIDTH, y + noteHeight);
      ctx.lineTo(width, y + noteHeight);
      ctx.stroke();
    }
  }

  /* ── Beat grid (vertical lines) ─────────────────────── */
  const cycleStart = Math.floor(timeStart);
  const cycleEnd = Math.ceil(timeEnd);
  for (let cyc = cycleStart; cyc <= cycleEnd; cyc++) {
    /* Whole cycle lines (bar lines) */
    const x = timeX(cyc);
    if (x > KEYS_WIDTH && x < width) {
      ctx.strokeStyle = VIZ_COLORS.gridLight;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      /* Cycle number label */
      ctx.fillStyle = VIZ_COLORS.textDim;
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${cyc + 1}`, x, 2);
    }
    /* Quarter subdivisions */
    for (let q = 1; q < 4; q++) {
      const qx = timeX(cyc + q / 4);
      if (qx > KEYS_WIDTH && qx < width) {
        ctx.strokeStyle = q === 2 ? VIZ_COLORS.grid : 'rgba(39, 39, 42, 0.5)';
        ctx.lineWidth = q === 2 ? 0.5 : 0.3;
        ctx.beginPath();
        ctx.moveTo(qx, 0);
        ctx.lineTo(qx, height);
        ctx.stroke();
      }
    }
  }

  /* ── Draw note bars ─────────────────────────────────── */
  /* Sort: inactive first, active on top */
  const sorted = events.slice().sort((a, b) => {
    const aActive = a.start <= now && a.end > now;
    const bActive = b.start <= now && b.end > now;
    return (aActive ? 1 : 0) - (bActive ? 1 : 0);
  });

  for (const evt of sorted) {
    const x1 = timeX(evt.start);
    const x2 = timeX(evt.end);
    const y = noteY(evt.note);
    const w = Math.max(3, x2 - x1);
    const h = Math.max(3, noteHeight - 1);
    const isActive = evt.start <= now && evt.end > now;

    /* Active note glow */
    if (isActive) {
      ctx.save();
      ctx.shadowColor = noteColorByVelocity(evt.note, evt.velocity, true);
      ctx.shadowBlur = 12;
    }

    /* Note bar — rounded rectangle */
    const color = noteColorByVelocity(evt.note, evt.velocity, isActive);
    ctx.fillStyle = color;
    const r = Math.min(3, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x1 + r, y);
    ctx.lineTo(x1 + w - r, y);
    ctx.arcTo(x1 + w, y, x1 + w, y + h, r);
    ctx.lineTo(x1 + w, y + h - r);
    ctx.arcTo(x1 + w, y + h, x1, y + h, r);
    ctx.lineTo(x1 + r, y + h);
    ctx.arcTo(x1, y + h, x1, y, r);
    ctx.lineTo(x1, y + r);
    ctx.arcTo(x1, y, x1 + w, y, r);
    ctx.closePath();
    ctx.fill();

    /* Velocity indicator: thin bright line at top of note */
    if (h > 5) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + evt.velocity * 0.3})`;
      ctx.fillRect(x1 + r, y, Math.max(1, w - r * 2), 1);
    }

    /* Note label on wider bars */
    if (w > 28 && h > 8) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = `${Math.min(9, h - 2)}px monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const name = NOTE_NAMES[evt.note % 12] + (Math.floor(evt.note / 12) - 1);
      ctx.fillText(name, x1 + 4, y + h / 2);
    }

    if (isActive) ctx.restore();
  }

  /* ── Playhead ───────────────────────────────────────── */
  const phX = timeX(now);
  ctx.save();
  ctx.shadowColor = VIZ_COLORS.accentGlow;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = VIZ_COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(phX, 0);
  ctx.lineTo(phX, height);
  ctx.stroke();
  /* Playhead triangle at top */
  ctx.fillStyle = VIZ_COLORS.accent;
  ctx.beginPath();
  ctx.moveTo(phX - 5, 0);
  ctx.lineTo(phX + 5, 0);
  ctx.lineTo(phX, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  /* ── Piano keys sidebar ─────────────────────────────── */
  /* Background */
  ctx.fillStyle = '#111113';
  ctx.fillRect(0, 0, KEYS_WIDTH, height);
  /* Separator line */
  ctx.strokeStyle = VIZ_COLORS.gridLight;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(KEYS_WIDTH - 0.5, 0);
  ctx.lineTo(KEYS_WIDTH - 0.5, height);
  ctx.stroke();

  /* Keys */
  const activeNotes = new Set(
    events.filter((e) => e.start <= now && e.end > now).map((e) => e.note),
  );

  for (let n = minNote; n <= maxNote; n++) {
    const y = noteY(n);
    const isBlack = BLACK_KEYS.has(n % 12);
    const isC = n % 12 === 0;
    const isActive = activeNotes.has(n);

    /* Key background */
    if (isActive) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.fillRect(0, y, KEYS_WIDTH - 1, noteHeight);
    } else if (isBlack) {
      ctx.fillStyle = '#0d0d0f';
      ctx.fillRect(0, y, KEYS_WIDTH - 1, noteHeight);
    }

    /* Label for C notes and active notes */
    if (isC || (isActive && noteHeight > 7)) {
      ctx.fillStyle = isActive ? VIZ_COLORS.accent : VIZ_COLORS.textDim;
      ctx.font = `${Math.min(9, noteHeight - 1)}px monospace`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const label = NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 1);
      ctx.fillText(label, KEYS_WIDTH - 5, y + noteHeight / 2);
    }
  }

  /* ── Velocity lane (bottom strip, 16px) ─────────────── */
  const velLaneH = 16;
  if (height > 100) {
    const velY = height - velLaneH;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(KEYS_WIDTH, velY, drawWidth, velLaneH);
    /* Separator */
    ctx.strokeStyle = VIZ_COLORS.grid;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(KEYS_WIDTH, velY);
    ctx.lineTo(width, velY);
    ctx.stroke();

    /* Velocity bars */
    for (const evt of events) {
      const x1 = timeX(evt.start);
      const x2 = timeX(evt.end);
      const w = Math.max(2, x2 - x1);
      const barH = evt.velocity * (velLaneH - 2);
      const isActive = evt.start <= now && evt.end > now;
      ctx.fillStyle = isActive
        ? `rgba(168, 85, 247, ${0.5 + evt.velocity * 0.4})`
        : `rgba(168, 85, 247, ${0.2 + evt.velocity * 0.3})`;
      ctx.fillRect(x1, velY + velLaneH - barH - 1, w, barH);
    }
  }
}
