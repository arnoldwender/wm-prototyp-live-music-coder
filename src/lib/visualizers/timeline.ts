import { VIZ_COLORS } from './colors';

/** Draw a pattern timeline — shows beat markers and a scrolling playhead.
 * bpm determines the beat grid spacing. time is the current animation timestamp. */
export function drawTimeline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bpm: number,
  time: number,
  rmsLevel: number,
): void {
  ctx.clearRect(0, 0, width, height);

  /* Background */
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  /* Beat grid */
  const beatMs = 60000 / bpm;
  const beatsVisible = 16;
  const beatWidth = width / beatsVisible;
  const offset = (time % (beatMs * beatsVisible)) / beatMs;

  for (let i = 0; i <= beatsVisible; i++) {
    const x = (i - offset) * beatWidth;
    const isMajor = Math.floor(i + offset) % 4 === 0;

    ctx.strokeStyle = isMajor ? VIZ_COLORS.gridLight : VIZ_COLORS.grid;
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    /* Beat number */
    if (isMajor) {
      ctx.fillStyle = VIZ_COLORS.textDim;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(i + offset) + 1}`, x, 12);
    }
  }

  /* Playhead (center) */
  const playheadX = width * 0.5;
  ctx.strokeStyle = VIZ_COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX, height);
  ctx.stroke();

  /* Level bar at playhead position */
  const barHeight = rmsLevel * height * 0.8;
  ctx.fillStyle = VIZ_COLORS.timelineBar;
  ctx.fillRect(playheadX - 3, height - barHeight, 6, barHeight);

  /* Beat pulse dots */
  const currentBeat = time / beatMs;
  const fractional = currentBeat % 1;
  if (fractional < 0.1) {
    const pulseAlpha = 1 - fractional / 0.1;
    ctx.fillStyle = VIZ_COLORS.timelineBeat;
    ctx.globalAlpha = pulseAlpha;
    ctx.beginPath();
    ctx.arc(playheadX, height / 2, 6 + pulseAlpha * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
