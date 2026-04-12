/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   DAW-quality piano roll — Ableton / FL Studio aesthetics.

   Features:
   • Real piano key sidebar — white/black key shapes with overlap
   • Scrolling timeline following playhead (2 cycles back, 1 ahead)
   • Beat grid with bar / half / quarter / 8th / 16th subdivisions
   • Velocity-mapped note colors (dim blue → vivid purple → pink)
   • Active note glow + pulse
   • Playhead with triangle and glow
   • Velocity lane (bottom strip)
   • Horizontal (time) + vertical (pitch) zoom via zoomX / zoomY
   ────────────────────────────────────────────────────────── */

import { VIZ_COLORS } from './colors';

/* ── Constants ─────────────────────────────────────────── */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Which semitones in an octave are black keys */
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);

/** Piano key sidebar width — wider to fit proper key aesthetics */
const KEYS_WIDTH = 52;

/** Black key width as fraction of sidebar width */
const BLACK_KEY_W = 0.62;

/** Default time window: cycles visible before and after playhead */
const BASE_CYCLES_BACK = 2;
const BASE_CYCLES_FORWARD = 1;

/** Note height clamp */
const MIN_NOTE_HEIGHT = 3;
const MAX_NOTE_HEIGHT = 28;

/** Pitch rows above/below active note range */
const PITCH_PADDING = 4;

/** Velocity lane height at the bottom */
const VEL_LANE_H = 18;

/* ── Types ─────────────────────────────────────────────── */

interface NoteEvent {
  note: number;
  start: number;
  end: number;
  velocity: number;
}

/* ── Color helpers ──────────────────────────────────────── */

/** Velocity-mapped note color.
 *  dim blue-purple (low) → vivid purple (mid) → bright pink (high) */
function noteColor(velocity: number, isActive: boolean): string {
  /* Map velocity to a hue range: 240° (blue) → 290° (purple) → 320° (pink) */
  const hue = 240 + velocity * 80;
  const sat = 45 + velocity * 45;
  const light = isActive ? 45 + velocity * 30 : 28 + velocity * 24;
  const alpha = isActive ? 0.95 : 0.65 + velocity * 0.2;
  return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
}

/** Glow color for active notes */
function noteGlow(velocity: number): string {
  const hue = 270 + velocity * 50;
  return `hsla(${hue}, 80%, 60%, 0.5)`;
}

/* ── MIDI note extraction ───────────────────────────────── */

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
  return 0.75;
}

/* ── Piano key sidebar ──────────────────────────────────── */

/** Draw the piano key sidebar.
 *  Renders white/black key shapes in proportion to the note grid rows.
 *  Black keys are narrower rectangles overlapping into the white key rows
 *  above and below them — matching the visual language of a real keyboard. */
function drawKeysSidebar(
  ctx: CanvasRenderingContext2D,
  height: number,
  minNote: number,
  maxNote: number,
  noteHeight: number,
  yOffset: number,
  activeNotes: Set<number>,
) {
  /* Sidebar background */
  ctx.fillStyle = '#0d0d10';
  ctx.fillRect(0, 0, KEYS_WIDTH, height);

  /* First pass: draw white key backgrounds (full-width rows) */
  for (let n = minNote; n <= maxNote; n++) {
    const y = yOffset + (maxNote - n) * noteHeight;
    const isBlack = BLACK_KEYS.has(n % 12);
    const isActive = activeNotes.has(n);

    if (!isBlack) {
      /* White key background */
      ctx.fillStyle = isActive
        ? 'rgba(168, 85, 247, 0.35)'
        : '#1c1c22';
      ctx.fillRect(0, y, KEYS_WIDTH - 1, noteHeight);
      /* Bottom border for white key separation */
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, y + noteHeight - 0.5, KEYS_WIDTH - 1, 1);
    }
  }

  /* Second pass: draw black keys on top (narrower, darker) */
  for (let n = minNote; n <= maxNote; n++) {
    const y = yOffset + (maxNote - n) * noteHeight;
    const isBlack = BLACK_KEYS.has(n % 12);
    const isActive = activeNotes.has(n);

    if (isBlack) {
      const bw = Math.round(KEYS_WIDTH * BLACK_KEY_W);
      ctx.fillStyle = isActive
        ? 'rgba(168, 85, 247, 0.5)'
        : '#0a0a0d';
      ctx.fillRect(0, y, bw, noteHeight);
      /* Right-edge gradient effect */
      const grad = ctx.createLinearGradient(bw - 6, 0, bw, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(255,255,255,0.06)');
      ctx.fillStyle = grad;
      ctx.fillRect(bw - 6, y, 6, noteHeight);
    }
  }

  /* Third pass: note labels */
  for (let n = minNote; n <= maxNote; n++) {
    const y = yOffset + (maxNote - n) * noteHeight;
    const isBlack = BLACK_KEYS.has(n % 12);
    const isC = n % 12 === 0;
    const isActive = activeNotes.has(n);

    if ((isC || isActive) && noteHeight >= 7) {
      const xPos = isBlack ? Math.round(KEYS_WIDTH * BLACK_KEY_W) - 3 : KEYS_WIDTH - 5;
      ctx.fillStyle = isActive
        ? VIZ_COLORS.accent
        : isC ? VIZ_COLORS.textDim : 'transparent';
      if (isC || isActive) {
        ctx.font = `${Math.min(9, noteHeight - 2)}px monospace`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const label = NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 1);
        ctx.fillText(label, xPos, y + noteHeight / 2);
      }
    }
  }

  /* Sidebar right border */
  ctx.strokeStyle = VIZ_COLORS.gridLight;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(KEYS_WIDTH - 0.5, 0);
  ctx.lineTo(KEYS_WIDTH - 0.5, height);
  ctx.stroke();
}

/* ── Beat grid ──────────────────────────────────────────── */

/** Draw vertical beat grid lines with progressive subdivision:
 *  bar → half → quarter → 8th → 16th (each finer tier is dimmer). */
function drawBeatGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeStart: number,
  timeEnd: number,
  timeX: (t: number) => number,
  zoomX: number,
) {
  const cycleStart = Math.floor(timeStart);
  const cycleEnd = Math.ceil(timeEnd);

  /* Determine how many subdivisions to show based on zoom level.
   * More zoom → finer grid lines become visible. */
  const maxDiv = zoomX >= 3 ? 16 : zoomX >= 1.5 ? 8 : zoomX >= 0.75 ? 4 : 2;

  for (let cyc = cycleStart; cyc <= cycleEnd; cyc++) {
    for (let sub = 0; sub < 16; sub++) {
      if (sub % (16 / Math.min(maxDiv, 16)) !== 0) continue;

      const t = cyc + sub / 16;
      const x = timeX(t);
      if (x <= KEYS_WIDTH || x >= width) continue;

      const isBar = sub === 0;
      const isHalf = sub === 8;
      const isQuarter = sub % 4 === 0;
      const isEighth = sub % 2 === 0;

      if (isBar) {
        ctx.strokeStyle = VIZ_COLORS.gridLight;
        ctx.lineWidth = 0.8;
        /* Bar number label */
        ctx.fillStyle = VIZ_COLORS.textDim;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${cyc + 1}`, x, 3);
      } else if (isHalf) {
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.7)';
        ctx.lineWidth = 0.6;
      } else if (isQuarter) {
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.5)';
        ctx.lineWidth = 0.5;
      } else if (isEighth) {
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.3)';
        ctx.lineWidth = 0.4;
      } else {
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.15)';
        ctx.lineWidth = 0.3;
      }

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }
}

/* ── Note row backgrounds ───────────────────────────────── */

function drawNoteRowBackgrounds(
  ctx: CanvasRenderingContext2D,
  width: number,
  minNote: number,
  maxNote: number,
  noteHeight: number,
  yOffset: number,
) {
  for (let n = minNote; n <= maxNote; n++) {
    const y = yOffset + (maxNote - n) * noteHeight;
    const isBlack = BLACK_KEYS.has(n % 12);

    if (isBlack) {
      /* Black key rows: slightly darker background */
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(KEYS_WIDTH, y, width - KEYS_WIDTH, noteHeight);
    }
    /* C note separator line */
    if (n % 12 === 0) {
      ctx.strokeStyle = 'rgba(63, 63, 70, 0.35)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(KEYS_WIDTH, y + noteHeight);
      ctx.lineTo(width, y + noteHeight);
      ctx.stroke();
    }
  }
}

/* ── Note bars ──────────────────────────────────────────── */

function drawNoteBar(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y: number,
  w: number,
  h: number,
  velocity: number,
  isActive: boolean,
) {
  const color = noteColor(velocity, isActive);
  const r = Math.min(3, h / 2, w / 2);

  if (isActive) {
    ctx.save();
    ctx.shadowColor = noteGlow(velocity);
    ctx.shadowBlur = 14;
  }

  /* Note fill — rounded rect */
  ctx.fillStyle = color;
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

  /* Top highlight line — shimmer effect */
  if (h > 4) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.12 + velocity * 0.18})`;
    ctx.fillRect(x1 + r, y, Math.max(1, w - r * 2), 1);
  }

  if (isActive) ctx.restore();
}

/* ── Main draw function ───────────────────────────────── */

export function drawPianoroll(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _time: number,
  getRepl: () => {
    scheduler: { now(): number };
    state: { pattern: { queryArc(a: number, b: number): unknown[] } | null };
  } | null,
  zoomX = 1,
  zoomY = 1,
  timeOffset = 0,
) {
  /* ── Background ─────────────────────────────────────── */
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  const repl = getRepl();
  if (!repl?.scheduler || !repl.state?.pattern?.queryArc) {
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Piano Roll — play a pattern to see notes', width / 2, height / 2);
    return;
  }

  /* ── Query haps ─────────────────────────────────────── */
  const now = repl.scheduler.now();

  /* zoomX shrinks the time window — higher zoom = fewer cycles visible */
  const cyclesBack = BASE_CYCLES_BACK / zoomX;
  const cyclesForward = BASE_CYCLES_FORWARD / zoomX;
  const timeStart = now - cyclesBack - timeOffset;
  const timeEnd   = now + cyclesForward - timeOffset;
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

  for (const hap of haps as Record<string, unknown>[]) {
    if (!hap.whole) continue;
    const midi = extractMidi(hap.value);
    if (midi < 0 || midi > 127) continue;
    const whole = hap.whole as { begin: number; end: number };
    events.push({
      note: midi,
      start: whole.begin,
      end: whole.end,
      velocity: extractVelocity(hap.value),
    });
    minNote = Math.min(minNote, midi);
    maxNote = Math.max(maxNote, midi);
  }

  if (events.length === 0) {
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Piano Roll — waiting for notes…', width / 2, height / 2);
    return;
  }

  /* ── Auto-range: fit visible pitch window ───────────── */
  minNote = Math.max(0, minNote - PITCH_PADDING);
  maxNote = Math.min(127, maxNote + PITCH_PADDING);
  /* Enforce minimum 1-octave window */
  if (maxNote - minNote < 12) {
    const mid = Math.round((minNote + maxNote) / 2);
    minNote = Math.max(0, mid - 6);
    maxNote = Math.min(127, mid + 6);
  }
  const noteRange = maxNote - minNote + 1;

  /* ── Layout ─────────────────────────────────────────── */
  const velLane = height > 100 ? VEL_LANE_H : 0;
  const drawH = height - velLane;
  const drawW = width - KEYS_WIDTH;

  /* zoomY scales note height — higher zoom = taller rows, fewer pitches visible */
  const baseNoteH = Math.min(MAX_NOTE_HEIGHT, Math.max(MIN_NOTE_HEIGHT, drawH / noteRange));
  const noteHeight = Math.min(MAX_NOTE_HEIGHT, Math.max(MIN_NOTE_HEIGHT, baseNoteH * zoomY));

  const totalH = noteHeight * noteRange;
  /* Center vertically if canvas is taller than the note area */
  const yOffset = Math.max(0, (drawH - totalH) / 2);

  /* Coordinate helpers */
  const noteY = (n: number) => yOffset + (maxNote - n) * noteHeight;
  const timeX = (t: number) => KEYS_WIDTH + ((t - timeStart) / timeRange) * drawW;

  /* ── Note row backgrounds ───────────────────────────── */
  drawNoteRowBackgrounds(ctx, width, minNote, maxNote, noteHeight, yOffset);

  /* ── Beat grid ──────────────────────────────────────── */
  drawBeatGrid(ctx, width, drawH, timeStart, timeEnd, timeX, zoomX);

  /* ── Note bars — inactive first, active on top ──────── */
  const activeNotes = new Set(
    events.filter((e) => e.start <= now && e.end > now).map((e) => e.note),
  );

  const sorted = events.slice().sort((a, b) => {
    const aA = a.start <= now && a.end > now ? 1 : 0;
    const bA = b.start <= now && b.end > now ? 1 : 0;
    return aA - bA;
  });

  for (const evt of sorted) {
    const x1 = timeX(evt.start);
    const x2 = timeX(evt.end);
    const y = noteY(evt.note);
    const w = Math.max(3, x2 - x1);
    const h = Math.max(2, noteHeight - 1);
    const isActive = evt.start <= now && evt.end > now;

    /* Skip notes completely outside the draw area */
    if (x1 > width || x2 < KEYS_WIDTH) continue;

    drawNoteBar(ctx, x1, y, w, h, evt.velocity, isActive);

    /* Note name label on wide bars */
    if (w > 28 && h > 9) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = `${Math.min(9, h - 3)}px monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(NOTE_NAMES[evt.note % 12] + (Math.floor(evt.note / 12) - 1), x1 + 4, y + h / 2);
    }
  }

  /* ── Playhead ───────────────────────────────────────── */
  const phX = timeX(now);
  ctx.save();
  ctx.shadowColor = VIZ_COLORS.accentGlow;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = VIZ_COLORS.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(phX, 0);
  ctx.lineTo(phX, drawH);
  ctx.stroke();
  /* Triangle at top */
  ctx.fillStyle = VIZ_COLORS.accent;
  ctx.beginPath();
  ctx.moveTo(phX - 5, 0);
  ctx.lineTo(phX + 5, 0);
  ctx.lineTo(phX, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  /* ── Piano keys sidebar ─────────────────────────────── */
  drawKeysSidebar(ctx, drawH, minNote, maxNote, noteHeight, yOffset, activeNotes);

  /* ── Velocity lane ──────────────────────────────────── */
  if (velLane > 0) {
    const velY = height - velLane;

    /* Lane background */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(KEYS_WIDTH, velY, drawW, velLane);

    /* Separator line */
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
      const barH = Math.max(2, evt.velocity * (velLane - 3));
      const isActive = evt.start <= now && evt.end > now;
      const hue = 270 + evt.velocity * 50;
      const alpha = isActive ? 0.55 + evt.velocity * 0.4 : 0.25 + evt.velocity * 0.3;
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
      ctx.fillRect(x1, velY + velLane - barH - 1, w, barH);
    }
  }
}
