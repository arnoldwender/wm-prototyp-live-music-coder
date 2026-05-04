/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Spiral visualizer — notes displayed on a rotating spiral.
   Time maps to angle, pitch maps to radius. Active notes
   glow at the spiral's edge.
   ────────────────────────────────────────────────────────── */

import { VIZ_COLORS } from './colors';
import { useAppStore as appStore } from '../store';
import { extractMidi, extractVelocity } from './midi-utils';

export function drawSpiral(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  getRepl: () => unknown,
) {
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repl = getRepl() as any;
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

  /* Beat-sync rotation: phase advances at BPM rate using wall-clock time.
   * Only active when playing so the display stays stable when paused. */
  const { bpm, isPlaying } = appStore.getState();
  const beatPhase = isPlaying
    ? ((time / 1000) * bpm / 60) * Math.PI * 2
    : 0;
  /* Scale down to a subtle rotation — 1/32 of a full cycle per beat */
  const rotationOffset = (beatPhase / 32) % (Math.PI * 2);

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

    /* Time → angle: one full rotation per cycle.
     * rotationOffset adds a subtle BPM-sync drift when playing. */
    const timeDelta = now - hap.whole.begin;
    const angle = (hap.whole.begin % 1) * Math.PI * 2 - Math.PI / 2 + rotationOffset;

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

  /* Playhead indicator — line from center to edge at current position,
   * rotationOffset keeps it aligned with the note dots. */
  const phAngle = (now % 1) * Math.PI * 2 - Math.PI / 2 + rotationOffset;
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
