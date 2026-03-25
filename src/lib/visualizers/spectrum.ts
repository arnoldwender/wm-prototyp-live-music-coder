import { VIZ_COLORS } from './colors';

/** Draw a spectrum (frequency domain) visualization.
 * Data values are in dB (typically -100 to 0). Rendered as vertical bars. */
export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Float32Array,
): void {
  ctx.clearRect(0, 0, width, height);
  if (data.length === 0) return;

  /* Background */
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  /* Number of bars — reduce to ~64 bars max for visual clarity */
  const barCount = Math.min(64, data.length);
  const binSize = Math.floor(data.length / barCount);
  const barWidth = (width / barCount) * 0.8;
  const gap = (width / barCount) * 0.2;

  for (let i = 0; i < barCount; i++) {
    /* Average the bins for this bar */
    let sum = 0;
    for (let j = 0; j < binSize; j++) {
      sum += data[i * binSize + j];
    }
    const avg = sum / binSize;

    /* Normalize from dB (-100 to 0) to 0-1 */
    const normalized = Math.max(0, (avg + 100) / 100);
    const barHeight = normalized * height * 0.9;

    const x = i * (barWidth + gap) + gap / 2;
    const y = height - barHeight;

    /* Bar gradient: blue at bottom, lighter at top */
    ctx.fillStyle = VIZ_COLORS.spectrum;
    ctx.globalAlpha = 0.3 + normalized * 0.7;
    ctx.fillRect(x, y, barWidth, barHeight);

    /* Peak cap */
    ctx.fillStyle = VIZ_COLORS.spectrumPeak;
    ctx.globalAlpha = 1;
    ctx.fillRect(x, y, barWidth, 2);
  }

  ctx.globalAlpha = 1;
}
