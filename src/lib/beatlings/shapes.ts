/* ──────────────────────────────────────────────────────────
   Species body shapes — each creature has a unique silhouette
   drawn with bezier curves, not generic circles.
   Shape language: circles=friendly, triangles=dynamic,
   ovals=flowing, angular=chaotic, wide=grounded.
   ────────────────────────────────────────────────────────── */

import type { Species } from '../../types/beatling';

/** Build a species-specific body path centered at (x, y) with given size.
 * All shapes use bezier curves for organic, living silhouettes.
 * The `wobble` parameter (0-1) adds audio-reactive deformation.
 * IMPORTANT: This only builds the path — caller must call ctx.fill() or ctx.stroke(). */
export function drawSpeciesBody(
  ctx: CanvasRenderingContext2D,
  species: Species,
  x: number,
  y: number,
  size: number,
  time: number,
  wobble: number,
): void {
  switch (species) {
    case 'beatling': drawBeatlingBody(ctx, x, y, size, time, wobble); break;
    case 'looplet': drawLoopletBody(ctx, x, y, size, time, wobble); break;
    case 'synthling': drawSynthlingBody(ctx, x, y, size, time, wobble); break;
    case 'glitchbit': drawGlitchbitBody(ctx, x, y, size, time, wobble); break;
    case 'wavelet': drawWaveletBody(ctx, x, y, size, time, wobble); break;
    case 'codefly': drawCodeflyBody(ctx, x, y, size, time, wobble); break;
  }
}

/** Beatling: Round bouncy blob — circle shape (friendly, cheerful).
 * Squashes on beats, stretches on bounce peaks. 6-point bezier blob. */
function drawBeatlingBody(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number, w: number) {
  ctx.beginPath();
  const points = 8;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    /* Each point wobbles independently for an organic living feel */
    const r = size + Math.sin(t * 4 + i * 1.7) * size * 0.06 * w;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    /* Smooth curve through control point */
    const cpAngle = ((i - 0.5) / points) * Math.PI * 2 - Math.PI / 2;
    const cpR = size * 1.25 + Math.sin(t * 3 + i * 2.3) * size * 0.04 * w;
    const cpx = x + Math.cos(cpAngle) * cpR;
    const cpy = y + Math.sin(cpAngle) * cpR;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.quadraticCurveTo(cpx, cpy, px, py);
  }
  ctx.closePath();
}

/** Looplet: Horizontal oval — flowing, hypnotic, loop-like.
 * Wider than tall with slight rotation wobble. */
function drawLoopletBody(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number, w: number) {
  ctx.beginPath();
  const scaleX = 1.3 + Math.sin(t * 1.5) * 0.05 * w;
  const scaleY = 0.8 + Math.cos(t * 1.5) * 0.05 * w;
  const points = 8;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const rx = size * scaleX + Math.sin(t * 2 + i * 1.5) * size * 0.04 * w;
    const ry = size * scaleY + Math.cos(t * 2 + i * 2.1) * size * 0.03 * w;
    const px = x + Math.cos(angle) * rx;
    const py = y + Math.sin(angle) * ry;
    const cpAngle = ((i - 0.5) / points) * Math.PI * 2;
    const cpx = x + Math.cos(cpAngle) * rx * 1.15;
    const cpy = y + Math.sin(cpAngle) * ry * 1.15;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.quadraticCurveTo(cpx, cpy, px, py);
  }
  ctx.closePath();
}

/** Synthling: Teardrop shape — elegant, taller than wide, pointed top.
 * Like a raindrop or musical note shape. */
function drawSynthlingBody(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number, w: number) {
  const sway = Math.sin(t * 1.5) * size * 0.06 * w;
  ctx.beginPath();
  /* Start at the pointed top */
  ctx.moveTo(x + sway, y - size * 1.2);
  /* Right curve down to widest point */
  ctx.bezierCurveTo(
    x + size * 0.6 + sway * 0.5, y - size * 0.5,
    x + size * 0.9 + Math.sin(t * 2) * size * 0.05 * w, y + size * 0.3,
    x + size * 0.5, y + size * 0.8
  );
  /* Bottom curve */
  ctx.quadraticCurveTo(x, y + size * 1.1, x - size * 0.5, y + size * 0.8);
  /* Left curve back up to top */
  ctx.bezierCurveTo(
    x - size * 0.9 - Math.sin(t * 2) * size * 0.05 * w, y + size * 0.3,
    x - size * 0.6 + sway * 0.5, y - size * 0.5,
    x + sway, y - size * 1.2
  );
  ctx.closePath();
}

/** Glitchbit: Angular polygon — sharp, chaotic, irregular.
 * 5-7 jittering vertices that never stay still. */
function drawGlitchbitBody(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number, w: number) {
  ctx.beginPath();
  const vertices = 6;
  for (let i = 0; i < vertices; i++) {
    const angle = (i / vertices) * Math.PI * 2 - Math.PI / 2;
    /* Jittering radius — different per vertex, changes rapidly */
    const jitter = Math.sin(Math.floor(t * 10) * (i * 137 + 53)) * size * 0.2 * w;
    const r = size * (0.8 + (i % 2) * 0.4) + jitter;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py); /* Sharp lines, not curves — angular feel */
  }
  ctx.closePath();
}

/** Wavelet: Wide flat oval — grounded, heavy, bass-like.
 * Undulates along the top edge like a wave. */
function drawWaveletBody(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number, w: number) {
  ctx.beginPath();
  const wideR = size * 1.4;
  const tallR = size * 0.7;
  const points = 12;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    /* Top half undulates like a wave, bottom is stable */
    const isTop = Math.sin(angle) < 0;
    const wave = isTop ? Math.sin(t * 1.5 + i * 0.8) * size * 0.1 * w : 0;
    const px = x + Math.cos(angle) * wideR;
    const py = y + Math.sin(angle) * tallR + wave;
    const cpAngle = ((i - 0.5) / points) * Math.PI * 2;
    const cpx = x + Math.cos(cpAngle) * wideR * 1.1;
    const cpy = y + Math.sin(cpAngle) * tallR * 1.1 + wave * 0.5;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.quadraticCurveTo(cpx, cpy, px, py);
  }
  ctx.closePath();
}

/** Codefly: Small rounded triangle — tiny, pointed, insect-like.
 * Wider at bottom, pointed at top, with a slight forward lean. */
function drawCodeflyBody(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number, w: number) {
  const lean = Math.sin(t * 6) * size * 0.08 * w;
  ctx.beginPath();
  /* Top point */
  ctx.moveTo(x + lean, y - size * 0.9);
  /* Right curve to bottom-right */
  ctx.quadraticCurveTo(
    x + size * 0.7 + lean * 0.5, y - size * 0.2,
    x + size * 0.6, y + size * 0.7
  );
  /* Rounded bottom */
  ctx.quadraticCurveTo(x, y + size * 0.9, x - size * 0.6, y + size * 0.7);
  /* Left curve back to top */
  ctx.quadraticCurveTo(
    x - size * 0.7 + lean * 0.5, y - size * 0.2,
    x + lean, y - size * 0.9
  );
  ctx.closePath();
}
