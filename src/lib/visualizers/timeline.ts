import { VIZ_COLORS } from './colors';

/** Draw a professional pattern timeline — beat grid, glowing playhead,
 * level meter, and beat pulse indicators.
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

  /* Background with subtle gradient */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, VIZ_COLORS.bg);
  bgGrad.addColorStop(0.5, VIZ_COLORS.bgAlt);
  bgGrad.addColorStop(1, VIZ_COLORS.bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  /* Beat grid */
  const beatMs = 60000 / bpm;
  const beatsVisible = 16;
  const beatWidth = width / beatsVisible;
  const offset = (time % (beatMs * beatsVisible)) / beatMs;

  for (let i = 0; i <= beatsVisible + 1; i++) {
    const x = (i - offset) * beatWidth;
    const beatNum = Math.floor(i + offset);
    const isMajor = beatNum % 4 === 0;
    const isBar = beatNum % 16 === 0;

    /* Grid line */
    ctx.strokeStyle = isBar ? VIZ_COLORS.gridLight : isMajor ? VIZ_COLORS.grid : VIZ_COLORS.grid;
    ctx.lineWidth = isBar ? 2 : isMajor ? 1.5 : 0.5;
    ctx.globalAlpha = isBar ? 0.8 : isMajor ? 0.6 : 0.2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.globalAlpha = 1;

    /* Beat number labels for major beats */
    if (isMajor && x > 10 && x < width - 10) {
      ctx.fillStyle = isBar ? VIZ_COLORS.textBright : VIZ_COLORS.textDim;
      ctx.font = isBar ? 'bold 10px monospace' : '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${beatNum + 1}`, x, 11);
    }
  }

  /* BPM label in top-right */
  ctx.fillStyle = VIZ_COLORS.textDim;
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${bpm} BPM`, width - 6, 11);

  /* Level meter — gradient bar at playhead */
  const playheadX = width * 0.5;
  const barHeight = Math.max(0, rmsLevel) * height * 0.85;
  if (barHeight > 1) {
    const levelGrad = ctx.createLinearGradient(0, height, 0, height - barHeight);
    levelGrad.addColorStop(0, 'rgba(34, 197, 94, 0.5)');
    levelGrad.addColorStop(0.6, 'rgba(34, 197, 94, 0.2)');
    levelGrad.addColorStop(1, 'rgba(168, 85, 247, 0.3)');
    ctx.fillStyle = levelGrad;
    ctx.fillRect(playheadX - 12, height - barHeight, 24, barHeight);
  }

  /* Playhead — glowing vertical line */
  ctx.save();
  ctx.shadowColor = VIZ_COLORS.accentGlow;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = VIZ_COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX, height);
  ctx.stroke();
  ctx.restore();

  /* Playhead triangle marker at top */
  ctx.fillStyle = VIZ_COLORS.accent;
  ctx.beginPath();
  ctx.moveTo(playheadX - 4, 0);
  ctx.lineTo(playheadX + 4, 0);
  ctx.lineTo(playheadX, 6);
  ctx.closePath();
  ctx.fill();

  /* Beat pulse — expanding circle on downbeat */
  const currentBeat = time / beatMs;
  const fractional = currentBeat % 1;
  if (fractional < 0.15) {
    const progress = fractional / 0.15;
    const alpha = 1 - progress;
    const radius = 4 + progress * 12;

    ctx.save();
    ctx.shadowColor = VIZ_COLORS.accentGlow;
    ctx.shadowBlur = 8;
    ctx.fillStyle = VIZ_COLORS.timelineBeat;
    ctx.globalAlpha = alpha * 0.7;
    ctx.beginPath();
    ctx.arc(playheadX, height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* Inner bright dot */
    ctx.fillStyle = VIZ_COLORS.waveformBright;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(playheadX, height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* Horizontal level trace — shows recent RMS history as a line */
  if (rmsLevel > 0.01) {
    const traceY = height - 6;
    const traceWidth = rmsLevel * width * 0.4;
    const traceGrad = ctx.createLinearGradient(playheadX - traceWidth, traceY, playheadX + traceWidth, traceY);
    traceGrad.addColorStop(0, 'transparent');
    traceGrad.addColorStop(0.3, VIZ_COLORS.timelineGlow);
    traceGrad.addColorStop(0.5, VIZ_COLORS.timeline);
    traceGrad.addColorStop(0.7, VIZ_COLORS.timelineGlow);
    traceGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = traceGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX - traceWidth, traceY);
    ctx.lineTo(playheadX + traceWidth, traceY);
    ctx.stroke();
  }
}
