/* ──────────────────────────────────────────────────────────
   Beatling renderer — Canvas 2D drawing for GoL grid cells
   and creature sprites with species-specific animations.
   Each species has unique movement, eye behavior, mouth
   expression, and body animation that reacts to audio energy.
   ────────────────────────────────────────────────────────── */

import { VIZ_COLORS } from '../visualizers/colors';
import type { GolBrain } from './gol-brain';
import type { Species, Stage } from '../../types/beatling';
import { SPECIES } from './species';
import { getStageSizeMultiplier, getStageGlow } from './evolution';

/** Minimal data needed to render a single creature */
interface CreatureRenderData {
  species: Species;
  stage: Stage;
  x: number;
  y: number;
  energy: number;
  phi?: number;
  isSleeping?: boolean;
}

/** Draw the Beatling ecosystem: GoL grid + creatures */
export function drawBeatlingWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gol: GolBrain | null,
  creatures: CreatureRenderData[],
  time: number,
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  /* Draw GoL grid — semi-transparent purple squares for live cells */
  if (gol) {
    const cellW = width / gol.width;
    const cellH = height / gol.height;
    const grid = gol.getGrid();

    for (let y = 0; y < gol.height; y++) {
      for (let x = 0; x < gol.width; x++) {
        if (grid[y * gol.width + x] === 1) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
          ctx.fillRect(x * cellW, y * cellH, cellW - 0.5, cellH - 0.5);
        }
      }
    }
  }

  /* Draw creatures on top of the GoL grid — scale 0-1 positions to canvas */
  for (const creature of creatures) {
    drawCreature(ctx, { ...creature, x: creature.x * width, y: creature.y * height }, time);
  }
}

/** Draw a single creature with species-specific animations, expressions, and movement */
function drawCreature(
  ctx: CanvasRenderingContext2D,
  creature: CreatureRenderData,
  time: number,
): void {
  const def = SPECIES[creature.species];
  const sizeMul = getStageSizeMultiplier(creature.stage);
  const stageGlow = getStageGlow(creature.stage);
  const phiGlow = (creature.phi ?? 0) * 0.5;
  const glow = Math.min(1, stageGlow + phiGlow);
  const baseSize = 14 * sizeMul;
  const t = time / 1000;
  /* Ensure minimum animation energy so creatures aren't completely still */
  const energy = Math.max(0.3, creature.energy);

  ctx.save();

  /* Sleeping: semi-transparent + floating z */
  if (creature.isSleeping) {
    ctx.globalAlpha = 0.4;
  }

  /* === MOVEMENT — species-specific X and Y animation === */
  let offsetX = 0;
  let offsetY = 0;
  const id = creature.x * 7 + creature.y * 13; /* unique per creature for phase offset */

  switch (def.movementStyle) {
    case 'bounce':
      /* Beatling: rhythmic vertical bounce like dancing to the beat */
      offsetY = Math.abs(Math.sin(t * 5 + id)) * 12 * energy;
      offsetX = Math.sin(t * 2.5 + id) * 4 * energy;
      break;
    case 'orbit':
      /* Looplet: circular orbit — spinning around a center point */
      offsetX = Math.cos(t * 1.8 + id) * 10 * energy;
      offsetY = Math.sin(t * 1.8 + id) * 8 * energy;
      break;
    case 'flow':
      /* Synthling: smooth side-to-side wave — like floating on melody */
      offsetX = Math.sin(t * 1.2 + id) * 15 * energy;
      offsetY = Math.cos(t * 0.8 + id * 0.5) * 5 * energy;
      break;
    case 'glitch':
      /* Glitchbit: random teleport-like jitter */
      offsetX = (Math.sin(Math.floor(t * 8) * 999 + id) * 0.5) * 10 * energy;
      offsetY = (Math.cos(Math.floor(t * 8) * 777 + id) * 0.5) * 10 * energy;
      break;
    case 'wave':
      /* Wavelet: slow deep wave — like floating on bass */
      offsetX = Math.sin(t * 0.6 + id * 0.3) * 12 * energy;
      offsetY = Math.sin(t * 0.4 + id) * 18 * energy;
      break;
    case 'swarm':
      /* Codefly: fast buzzing around — erratic like a fly */
      offsetX = Math.sin(t * 8 + id) * 6 + Math.sin(t * 13 + id * 2) * 3;
      offsetY = Math.cos(t * 7 + id) * 4 + Math.cos(t * 11 + id * 3) * 2;
      break;
  }

  const drawX = creature.x + offsetX;
  const drawY = creature.y + offsetY;

  /* === BODY BREATHING — subtle scale pulse synced to energy === */
  const breathScale = 1 + Math.sin(t * 3 + id) * 0.05 * energy;
  const size = baseSize * breathScale;

  /* Glow effect for evolved creatures */
  if (glow > 0) {
    ctx.shadowColor = def.color;
    ctx.shadowBlur = glow * 25;
  }

  /* === BODY — circle with species color === */
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
  ctx.fill();

  /* Reset shadow for details */
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  /* === EYES — animated with species-specific behavior === */
  const eyeSpacing = size * 0.3;
  const eyeY = drawY - size * 0.1;
  const eyeSize = size * 0.28;
  const pupilSize = eyeSize * 0.5;

  /* Eye whites */
  ctx.fillStyle = VIZ_COLORS.white;
  ctx.beginPath();
  ctx.arc(drawX - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.arc(drawX + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  /* Pupils — look in movement direction with energy-based pupil dilation */
  const lookX = offsetX * 0.08;
  const lookY = offsetY * 0.06;
  const dilatedPupil = pupilSize * (1 + energy * 0.3);

  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.beginPath();
  ctx.arc(drawX - eyeSpacing + lookX, eyeY + lookY, dilatedPupil, 0, Math.PI * 2);
  ctx.arc(drawX + eyeSpacing + lookX, eyeY + lookY, dilatedPupil, 0, Math.PI * 2);
  ctx.fill();

  /* Eye shine — small white dot for liveliness */
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(drawX - eyeSpacing - pupilSize * 0.3, eyeY - pupilSize * 0.3, pupilSize * 0.3, 0, Math.PI * 2);
  ctx.arc(drawX + eyeSpacing - pupilSize * 0.3, eyeY - pupilSize * 0.3, pupilSize * 0.3, 0, Math.PI * 2);
  ctx.fill();

  /* === BLINK — occasional eye close === */
  const blinkCycle = (t * 0.7 + id * 0.1) % 4;
  if (blinkCycle > 3.85) {
    /* Eyelid covers the eye briefly */
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(drawX - eyeSpacing, eyeY, eyeSize + 1, 0, Math.PI * 2);
    ctx.arc(drawX + eyeSpacing, eyeY, eyeSize + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  /* === MOUTH — expression changes with energy and species === */
  const mouthY = drawY + size * 0.35;
  const mouthWidth = size * 0.4;
  ctx.strokeStyle = VIZ_COLORS.bg;
  ctx.lineWidth = Math.max(1.5, size * 0.08);
  ctx.lineCap = 'round';

  if (creature.isSleeping) {
    /* Sleeping: small "o" mouth */
    ctx.beginPath();
    ctx.arc(drawX, mouthY, size * 0.08, 0, Math.PI * 2);
    ctx.stroke();
  } else if (energy > 0.6) {
    /* High energy: big smile — wide open */
    ctx.beginPath();
    ctx.arc(drawX, mouthY - size * 0.1, mouthWidth * 0.7, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    /* Open mouth fill for very high energy */
    if (energy > 0.8) {
      ctx.fillStyle = darkenColor(def.color, 0.4);
      ctx.beginPath();
      ctx.arc(drawX, mouthY - size * 0.05, mouthWidth * 0.5, 0, Math.PI);
      ctx.fill();
    }
  } else if (energy > 0.3) {
    /* Medium energy: gentle smile */
    ctx.beginPath();
    ctx.arc(drawX, mouthY - size * 0.15, mouthWidth * 0.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else {
    /* Low energy: neutral line */
    ctx.beginPath();
    ctx.moveTo(drawX - mouthWidth * 0.3, mouthY);
    ctx.lineTo(drawX + mouthWidth * 0.3, mouthY);
    ctx.stroke();
  }

  /* === SPECIES-SPECIFIC FEATURES === */
  switch (creature.species) {
    case 'beatling':
      /* Musical note floating above when bouncing high */
      if (offsetY > 6) {
        ctx.fillStyle = def.color;
        ctx.globalAlpha = 0.6;
        ctx.font = `${size * 0.5}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('\u266A', drawX + size * 0.7, drawY - size - 4);
        ctx.globalAlpha = 1;
      }
      break;
    case 'looplet':
      /* Orbit trail — fading arc behind the creature */
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(creature.x, creature.y, 10 * energy, t * 1.8 + id, t * 1.8 + id + Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    case 'synthling':
      /* Sine wave antennae */
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const ax = drawX - 6 + i;
        const ay = drawY - size - 4 + Math.sin(t * 4 + i * 0.5) * 3;
        i === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    case 'glitchbit':
      /* Pixelated body edge — scattered squares */
      ctx.fillStyle = def.color;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 4; i++) {
        const px = drawX + Math.sin(t * 12 + i * 99) * size;
        const py = drawY + Math.cos(t * 12 + i * 77) * size;
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;
      break;
    case 'wavelet':
      /* Ripple rings expanding outward */
      const ripple = (t * 2 + id) % 2;
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = Math.max(0, 0.4 - ripple * 0.2);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(drawX, drawY, size + ripple * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    case 'codefly':
      /* Tiny wing flaps */
      const wingAngle = Math.sin(t * 20) * 0.4;
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      /* Left wing */
      ctx.beginPath();
      ctx.ellipse(drawX - size * 0.8, drawY - size * 0.2, size * 0.5, size * 0.2, wingAngle, 0, Math.PI * 2);
      ctx.stroke();
      /* Right wing */
      ctx.beginPath();
      ctx.ellipse(drawX + size * 0.8, drawY - size * 0.2, size * 0.5, size * 0.2, -wingAngle, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
  }

  /* === STAGE INDICATORS === */
  if (creature.stage === 'egg') {
    /* Dashed shell circle */
    ctx.strokeStyle = def.dimColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(drawX, drawY, size + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (creature.stage === 'ascended') {
    /* Pulsing halo */
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + Math.sin(t * 3) * 0.3;
    ctx.beginPath();
    ctx.arc(drawX, drawY, size + 8 + Math.sin(t * 2) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (creature.stage === 'elder') {
    /* Crown-like top mark */
    ctx.fillStyle = def.color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(drawX - 4, drawY - size - 2);
    ctx.lineTo(drawX, drawY - size - 7);
    ctx.lineTo(drawX + 4, drawY - size - 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* Sleeping z indicator */
  if (creature.isSleeping) {
    ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.3;
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = `bold ${size * 0.6}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('z', drawX + size, drawY - size - 6 + Math.sin(t * 1.5) * 4);
    ctx.fillText('z', drawX + size * 1.3, drawY - size - 12 + Math.sin(t * 1.2) * 3);
    ctx.globalAlpha = 1;
  }

  /* Consciousness ring */
  const phi = creature.phi ?? 0;
  if (phi > 0.1 && !creature.isSleeping) {
    ctx.strokeStyle = VIZ_COLORS.white;
    ctx.lineWidth = 1;
    ctx.globalAlpha = phi * 0.3;
    ctx.beginPath();
    ctx.arc(drawX, drawY, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

/** Darken a hex color by a factor (0 = same, 1 = black) */
function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 1 - factor;
  return `rgb(${Math.floor(r * f)}, ${Math.floor(g * f)}, ${Math.floor(b * f)})`;
}
