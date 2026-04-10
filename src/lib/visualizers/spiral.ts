/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Spiral visualizer — notes displayed on a rotating spiral.
   Time maps to angle, pitch maps to radius. Active notes
   glow at the spiral's edge.
   ────────────────────────────────────────────────────────── */

import { VIZ_COLORS } from './colors';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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

export function drawSpiral(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _time: number,
  getRepl: () => any | null,
) {
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  const repl = getRepl();
  if (!repl?.scheduler || !repl.state?.pattern?.queryArc) {
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Spiral — play a pattern to see notes', width / 2, height / 2);
    return;
  }

  const now = repl.scheduler.now();
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(cx, cy) - 10;

  /* Query 4 cycles of history */
  let haps: any[];
  try {
    haps = repl.state.pattern.queryArc(Math.max(0, now - 4), now + 0.5);
  } catch { return; }

  /* Draw spiral guide lines — one full turn per cycle */
  ctx.strokeStyle = VIZ_COLORS.grid;
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    const r = maxRadius * (1 - i / 4);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  /* Draw center dot */
  ctx.fillStyle = VIZ_COLORS.gridLight;
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();

  /* Plot notes on spiral */
  for (const hap of haps) {
    if (!hap.whole) continue;
    const midi = extractMidi(hap.value);
    if (midi < 0 || midi > 127) continue;
    const vel = extractVelocity(hap.value);
    const isActive = hap.whole.begin <= now && hap.whole.end > now;

    /* Time → angle: one full rotation per cycle */
    const timeDelta = now - hap.whole.begin;
    const angle = (hap.whole.begin % 1) * Math.PI * 2 - Math.PI / 2;

    /* Age → radius: newer events at edge, older toward center */
    const age = Math.min(4, timeDelta);
    const radius = maxRadius * (1 - age / 4.5);

    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    /* Dot size based on velocity */
    const dotSize = 3 + vel * 5;

    /* Color: pitch class hue, velocity brightness */
    const hue = 260 + (midi % 12) * 8;
    const alpha = isActive ? 0.95 : 0.2 + vel * 0.3;

    if (isActive) {
      ctx.save();
      ctx.shadowColor = `hsla(${hue}, 70%, 60%, 0.7)`;
      ctx.shadowBlur = 14;
    }

    ctx.fillStyle = `hsla(${hue}, 60%, ${isActive ? 65 : 45}%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
    ctx.fill();

    if (isActive) ctx.restore();
  }

  /* Playhead indicator — line from center to edge at current position */
  const phAngle = (now % 1) * Math.PI * 2 - Math.PI / 2;
  ctx.save();
  ctx.strokeStyle = VIZ_COLORS.accent;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = VIZ_COLORS.accentGlow;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(phAngle) * maxRadius, cy + Math.sin(phAngle) * maxRadius);
  ctx.stroke();
  ctx.restore();
}
