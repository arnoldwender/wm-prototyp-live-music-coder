import { VIZ_COLORS } from './colors';

/** Draw a waveform (time-domain) visualization.
 * Data values range from -1 to 1. Rendered as a centered line with fill. */
export function drawWaveform(
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

  /* Center line */
  ctx.strokeStyle = VIZ_COLORS.grid;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  /* Waveform fill */
  const sliceWidth = width / data.length;
  ctx.fillStyle = VIZ_COLORS.waveformFill;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  for (let i = 0; i < data.length; i++) {
    const x = i * sliceWidth;
    const y = (1 - data[i]) * height / 2;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height / 2);
  ctx.closePath();
  ctx.fill();

  /* Waveform line */
  ctx.strokeStyle = VIZ_COLORS.waveform;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = i * sliceWidth;
    const y = (1 - data[i]) * height / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
