/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Pitchwheel visualizer — octave-based circular frequency
   display. Each pitch class gets a fixed position on the
   circle (like a clock). Active notes light up their segment.
   ────────────────────────────────────────────────────────── */

import { VIZ_COLORS } from './colors';
import { useAppStore as appStore } from '../store';
import { extractMidi, extractVelocity } from './midi-utils';
import type { VisualizerRepl, VisualizerHap } from './repl-source';

/* 12-tone labels for the harmonic circle (sibling visualizers keep their own). */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function drawPitchwheel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  getRepl: () => VisualizerRepl | null,
) {
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(cx, cy) - 20;
  const innerR = outerR * 0.4;

  /* Draw the 12 pitch class segments — like a clock */
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const nextAngle = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;

    /* Segment arc */
    ctx.strokeStyle = VIZ_COLORS.grid;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.stroke();

    /* Note label at outer edge */
    const labelAngle = (angle + nextAngle) / 2;
    const labelR = outerR + 12;
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      NOTE_NAMES[i],
      cx + Math.cos(labelAngle) * labelR,
      cy + Math.sin(labelAngle) * labelR,
    );
  }

  /* Inner and outer circles */
  ctx.strokeStyle = VIZ_COLORS.gridLight;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.stroke();

  /* Query active notes */
  const repl = getRepl();
  if (!repl?.scheduler || !repl.state?.pattern?.queryArc) {
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pitchwheel', cx, cy);
    return;
  }

  const now = repl.scheduler.now();
  let haps: unknown[];
  try {
    haps = repl.state.pattern.queryArc(Math.max(0, now - 0.25), now + 0.125);
  } catch { return; }

  /* Collect active pitch classes with max velocity */
  const activePC: Map<number, { velocity: number; octaves: number[] }> = new Map();

  for (const hap of haps as VisualizerHap[]) {
    if (!hap.whole) continue;
    const midi = extractMidi(hap.value);
    if (midi < 0 || midi > 127) continue;
    if (hap.whole.begin > now || hap.whole.end <= now) continue;

    const vel = extractVelocity(hap.value);
    const pc = midi % 12;
    const oct = Math.floor(midi / 12) - 1;

    const existing = activePC.get(pc);
    if (existing) {
      existing.velocity = Math.max(existing.velocity, vel);
      if (!existing.octaves.includes(oct)) existing.octaves.push(oct);
    } else {
      activePC.set(pc, { velocity: vel, octaves: [oct] });
    }
  }

  /* Beat-sync pulse: active segments expand ±3% of outerR at beat rate.
   * Only active when isPlaying — stays static when paused. */
  const { bpm, isPlaying } = appStore.getState();
  const beatCycle = (time / 1000) * bpm / 60;
  /* Raised cosine peaks at 1.0 on the beat, smooth decay between beats */
  const beatPulse = isPlaying
    ? Math.max(0, Math.cos(beatCycle * Math.PI * 2)) ** 2
    : 0;
  /* Expand outer radius by up to 3% on the beat */
  const pulsedOuterR = outerR * (1 + beatPulse * 0.03);

  /* Light up active segments */
  for (const [pc, data] of activePC) {
    const startAngle = (pc / 12) * Math.PI * 2 - Math.PI / 2;
    const endAngle = ((pc + 1) / 12) * Math.PI * 2 - Math.PI / 2;

    /* Filled arc segment — uses pulsedOuterR so active notes "breathe" */
    const hue = 260 + pc * 8;
    ctx.save();
    ctx.shadowColor = `hsla(${hue}, 70%, 60%, 0.6)`;
    ctx.shadowBlur = 12 + beatPulse * 6; /* glow intensifies on the beat */

    ctx.fillStyle = `hsla(${hue}, 60%, 55%, ${0.3 + data.velocity * 0.5})`;
    ctx.beginPath();
    ctx.arc(cx, cy, pulsedOuterR, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    /* Octave dots inside the segment */
    const midAngle = (startAngle + endAngle) / 2;
    for (const oct of data.octaves) {
      /* Map octave to radius: lower octaves near center, higher at edge */
      const octR = innerR + ((oct + 1) / 10) * (outerR - innerR);
      const dotX = cx + Math.cos(midAngle) * octR;
      const dotY = cy + Math.sin(midAngle) * octR;

      ctx.fillStyle = `hsla(${hue}, 70%, 70%, 0.9)`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* Center label: note count */
  ctx.fillStyle = VIZ_COLORS.text;
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${activePC.size}`, cx, cy);
}
