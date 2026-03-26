/* ──────────────────────────────────────────────────────────
   Beatling renderer — Canvas 2D drawing for GoL grid cells
   and creature sprites with species-specific animations.
   Stage indicators: egg (dashed shell), ascended (pulsing halo).
   Elder/ascended get glow effects via canvas shadow.
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
  energy: number; /* 0-1, drives animation intensity */
  phi?: number; /* 0-1, consciousness level — drives glow intensity */
  isSleeping?: boolean; /* True when dreaming — muted rendering */
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

/** Draw a single creature with species color, eyes, and stage indicators */
function drawCreature(
  ctx: CanvasRenderingContext2D,
  creature: CreatureRenderData,
  time: number,
): void {
  const def = SPECIES[creature.species];
  const sizeMul = getStageSizeMultiplier(creature.stage);
  const stageGlow = getStageGlow(creature.stage);
  /* Phase 2: Consciousness Phi adds extra glow — higher Phi = brighter creature */
  const phiGlow = (creature.phi ?? 0) * 0.5;
  const glow = Math.min(1, stageGlow + phiGlow);
  const baseSize = 12 * sizeMul;

  /* Save context to restore cleanly after drawing (sleeping alpha, glow shadow) */
  ctx.save();

  /* Sleeping creatures render semi-transparent */
  if (creature.isSleeping) {
    ctx.globalAlpha = 0.4;
  }

  /* Animation offset based on movement style */
  let offsetY = 0;
  const t = time / 1000;
  switch (def.movementStyle) {
    case 'bounce':
      offsetY = Math.abs(Math.sin(t * 4 + creature.x)) * 8 * creature.energy;
      break;
    case 'orbit':
      offsetY = Math.sin(t * 2 + creature.x) * 6 * creature.energy;
      break;
    case 'flow':
      offsetY = Math.sin(t * 1.5 + creature.y) * 4 * creature.energy;
      break;
    case 'glitch':
      offsetY = (Math.random() - 0.5) * 6 * creature.energy;
      break;
    case 'wave':
      offsetY = Math.sin(t * 0.8 + creature.x * 0.1) * 10 * creature.energy;
      break;
    case 'swarm':
      offsetY = Math.sin(t * 6 + creature.x * 0.5) * 3;
      break;
  }

  const drawX = creature.x;
  const drawY = creature.y - offsetY;

  /* Glow effect for elder/ascended stages */
  if (glow > 0) {
    ctx.shadowColor = def.color;
    ctx.shadowBlur = glow * 20;
  }

  /* Body — circle with species color */
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.arc(drawX, drawY, baseSize, 0, Math.PI * 2);
  ctx.fill();

  /* Eyes — white circles */
  ctx.fillStyle = VIZ_COLORS.white;
  const eyeOffset = baseSize * 0.3;
  const eyeSize = baseSize * 0.25;
  ctx.beginPath();
  ctx.arc(drawX - eyeOffset, drawY - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
  ctx.arc(drawX + eyeOffset, drawY - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  /* Pupils — dark dots inside eyes */
  ctx.fillStyle = VIZ_COLORS.bg;
  const pupilSize = eyeSize * 0.5;
  ctx.beginPath();
  ctx.arc(drawX - eyeOffset + 1, drawY - eyeOffset * 0.5, pupilSize, 0, Math.PI * 2);
  ctx.arc(drawX + eyeOffset + 1, drawY - eyeOffset * 0.5, pupilSize, 0, Math.PI * 2);
  ctx.fill();

  /* Shadow is cleaned up by ctx.restore() at end of function */

  /* Stage indicator: egg has dashed circle, ascended has pulsing halo */
  if (creature.stage === 'egg') {
    ctx.strokeStyle = def.dimColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(drawX, drawY, baseSize + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (creature.stage === 'ascended') {
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5 + Math.sin(t * 3) * 0.3;
    ctx.beginPath();
    ctx.arc(drawX, drawY, baseSize + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* Sleeping indicator: small "z" floating above the creature */
  if (creature.isSleeping) {
    ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.3;
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = `${baseSize * 0.8}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('z', drawX + baseSize * 0.8, drawY - baseSize - 4 + Math.sin(t * 1.5) * 3);
    ctx.globalAlpha = 1;
  }

  /* Consciousness indicator: subtle inner ring whose opacity = Phi */
  const phi = creature.phi ?? 0;
  if (phi > 0.1) {
    ctx.strokeStyle = VIZ_COLORS.white;
    ctx.lineWidth = 1;
    ctx.globalAlpha = phi * 0.4;
    ctx.beginPath();
    ctx.arc(drawX, drawY, baseSize * 0.6, 0, Math.PI * 2);
    ctx.stroke();
  }

  /* Restore canvas state — cleans up alpha, shadows, etc. */
  ctx.restore();
}
