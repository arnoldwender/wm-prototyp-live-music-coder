import { VIZ_COLORS } from './colors';

/* Peak hold state — persists across frames for smooth decay */
let peakHolds: number[] = [];
let peakDecay: number[] = [];

/** Draw a professional spectrum (frequency domain) visualization.
 * Features: gradient bars, rounded caps, glow, peak hold indicators,
 * frequency labels, and smooth transitions.
 * Data values are in dB (typically -100 to 0). */
export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Float32Array,
): void {
  ctx.clearRect(0, 0, width, height);
  if (data.length === 0) return;

  /* Background with subtle gradient */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, VIZ_COLORS.bg);
  bgGrad.addColorStop(1, VIZ_COLORS.bgAlt);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  /* Determine bar count based on available width */
  const barCount = Math.min(64, Math.max(24, Math.floor(width / 8)));
  const totalBarSpace = width - 8;
  const barWidth = Math.max(2, (totalBarSpace / barCount) * 0.75);
  const gap = (totalBarSpace / barCount) * 0.25;
  const startX = 4;

  /* Initialize peak hold arrays */
  if (peakHolds.length !== barCount) {
    peakHolds = new Array(barCount).fill(0);
    peakDecay = new Array(barCount).fill(0);
  }

  /* Frequency labels at bottom */
  const freqLabels = [
    { bin: 0, label: '60' },
    { bin: Math.floor(barCount * 0.15), label: '250' },
    { bin: Math.floor(barCount * 0.35), label: '1k' },
    { bin: Math.floor(barCount * 0.55), label: '4k' },
    { bin: Math.floor(barCount * 0.75), label: '8k' },
    { bin: Math.floor(barCount * 0.95), label: '16k' },
  ];

  /* Draw frequency labels */
  ctx.font = '9px monospace';
  ctx.fillStyle = VIZ_COLORS.textDim;
  ctx.textAlign = 'center';
  for (const { bin, label } of freqLabels) {
    const x = startX + bin * (barWidth + gap) + barWidth / 2;
    ctx.fillText(label, x, height - 2);
  }

  /* Usable height (leave room for labels) */
  const drawHeight = height - 16;

  for (let i = 0; i < barCount; i++) {
    /* Average bins for this bar — use logarithmic distribution for
     * more resolution in lower frequencies (where humans are more sensitive) */
    let sum = 0;
    let count = 0;
    const startBin = Math.floor((i / barCount) * data.length * 0.5);
    const endBin = Math.floor(((i + 1) / barCount) * data.length * 0.5);
    for (let j = startBin; j < endBin && j < data.length; j++) {
      sum += data[j];
      count++;
    }
    const avg = count > 0 ? sum / count : -100;

    /* Normalize from dB (-100 to 0) → 0-1 */
    const normalized = Math.max(0, Math.min(1, (avg + 100) / 100));
    const barHeight = Math.max(1, normalized * drawHeight * 0.9);

    const x = startX + i * (barWidth + gap);
    const y = drawHeight - barHeight;

    /* Update peak hold — slow decay */
    if (normalized > peakHolds[i]) {
      peakHolds[i] = normalized;
      peakDecay[i] = 0;
    } else {
      peakDecay[i] += 0.02;
      peakHolds[i] = Math.max(0, peakHolds[i] - peakDecay[i] * 0.01);
    }

    /* Bar gradient: blue at bottom → purple at top */
    const barGrad = ctx.createLinearGradient(x, drawHeight, x, y);
    barGrad.addColorStop(0, VIZ_COLORS.spectrum);
    barGrad.addColorStop(0.5, VIZ_COLORS.spectrumBright);
    barGrad.addColorStop(1, VIZ_COLORS.spectrumTop);

    /* Glow behind bar */
    if (normalized > 0.3) {
      ctx.save();
      ctx.shadowColor = VIZ_COLORS.spectrumGlow;
      ctx.shadowBlur = 8 + normalized * 8;
      ctx.fillStyle = barGrad;
      ctx.globalAlpha = 0.3;
      drawRoundedBar(ctx, x, y, barWidth, barHeight, Math.min(barWidth / 2, 3));
      ctx.fill();
      ctx.restore();
    }

    /* Main bar with rounded top */
    ctx.fillStyle = barGrad;
    ctx.globalAlpha = 0.4 + normalized * 0.6;
    drawRoundedBar(ctx, x, y, barWidth, barHeight, Math.min(barWidth / 2, 3));
    ctx.fill();

    /* Peak hold indicator — glowing line */
    const peakY = drawHeight - peakHolds[i] * drawHeight * 0.9;
    if (peakHolds[i] > 0.02) {
      ctx.fillStyle = VIZ_COLORS.spectrumPeak;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x, peakY, barWidth, 2);
    }

    ctx.globalAlpha = 1;
  }
}

/** Draw a rectangle with rounded top corners */
function drawRoundedBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  r = Math.min(r, h / 2);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}
