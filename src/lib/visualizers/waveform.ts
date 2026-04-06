/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { VIZ_COLORS } from './colors';

/** Draw a professional waveform (time-domain) visualization.
 * Features: gradient fill, glow effect, mirrored display, smooth line.
 * Data values range from -1 to 1. */
export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Float32Array,
): void {
  ctx.clearRect(0, 0, width, height);
  if (data.length === 0) return;

  const centerY = height / 2;

  /* Background with subtle gradient */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, VIZ_COLORS.bg);
  bgGrad.addColorStop(0.5, VIZ_COLORS.bgAlt);
  bgGrad.addColorStop(1, VIZ_COLORS.bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  /* Center line — dashed */
  ctx.strokeStyle = VIZ_COLORS.grid;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  /* Subtle horizontal grid lines at ±0.5 amplitude */
  ctx.strokeStyle = VIZ_COLORS.grid;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.4;
  ctx.setLineDash([2, 8]);
  ctx.beginPath();
  ctx.moveTo(0, centerY - height * 0.25);
  ctx.lineTo(width, centerY - height * 0.25);
  ctx.moveTo(0, centerY + height * 0.25);
  ctx.lineTo(width, centerY + height * 0.25);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  /* Downsample data for smoother rendering */
  const points = Math.min(data.length, Math.floor(width * 1.5));
  const step = data.length / points;

  /* Build path once, reuse for fill + stroke + glow */
  const buildPath = () => {
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    for (let i = 0; i < points; i++) {
      const x = (i / points) * width;
      const idx = Math.floor(i * step);
      const y = centerY - data[idx] * centerY * 0.85;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  };

  /* Gradient fill — upper half */
  const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
  fillGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
  fillGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.08)');
  fillGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.02)');
  fillGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.08)');
  fillGrad.addColorStop(1, 'rgba(168, 85, 247, 0.25)');

  /* Fill area between waveform and center */
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  for (let i = 0; i < points; i++) {
    const x = (i / points) * width;
    const idx = Math.floor(i * step);
    const y = centerY - data[idx] * centerY * 0.85;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, centerY);
  ctx.closePath();
  ctx.fillStyle = fillGrad;
  ctx.fill();

  /* Mirror fill (reflected below center) */
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  for (let i = 0; i < points; i++) {
    const x = (i / points) * width;
    const idx = Math.floor(i * step);
    const y = centerY + data[idx] * centerY * 0.4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, centerY);
  ctx.closePath();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = fillGrad;
  ctx.fill();
  ctx.globalAlpha = 1;

  /* Glow effect — thick blurred stroke behind main line */
  ctx.save();
  ctx.shadowColor = VIZ_COLORS.waveformGlow;
  ctx.shadowBlur = 12;
  buildPath();
  ctx.strokeStyle = VIZ_COLORS.waveformDim;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  /* Main waveform line — gradient stroke */
  const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
  lineGrad.addColorStop(0, VIZ_COLORS.waveformDim);
  lineGrad.addColorStop(0.3, VIZ_COLORS.waveform);
  lineGrad.addColorStop(0.7, VIZ_COLORS.waveformBright);
  lineGrad.addColorStop(1, VIZ_COLORS.waveform);

  buildPath();
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}
