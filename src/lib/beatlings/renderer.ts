/* ──────────────────────────────────────────────────────────
   Beatling renderer — Canvas 2D drawing for GoL grid, creature
   sprites, neural network visualization, synapse connections,
   and species-specific animations driven by brain state.
   ────────────────────────────────────────────────────────── */

import { VIZ_COLORS } from '../visualizers/colors';
import type { GolBrain } from './gol-brain';
import type { Species, Stage } from '../../types/beatling';
import { SPECIES } from './species';
import { getStageSizeMultiplier, getStageGlow } from './evolution';
import { drawSpeciesBody } from './shapes';

/** Data passed from BeatlingWorld to the renderer per creature */
interface CreatureRenderData {
  species: Species;
  stage: Stage;
  x: number;
  y: number;
  energy: number;
  phi?: number;
  isSleeping?: boolean;
  /* Brain metrics */
  neuronCount?: number;
  synapseCount?: number;
  intelligence?: number;
  emotionalState?: number;
  totalFirings?: number;
  motorOutput?: { toward: number; away: number; eat: number };
}

/** Draw the full Beatling ecosystem */
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

  /* GoL grid */
  if (gol) {
    const cellW = width / gol.width;
    const cellH = height / gol.height;
    const grid = gol.getGrid();
    for (let y = 0; y < gol.height; y++) {
      for (let x = 0; x < gol.width; x++) {
        if (grid[y * gol.width + x] === 1) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
          ctx.fillRect(x * cellW, y * cellH, cellW - 0.5, cellH - 0.5);
        }
      }
    }
  }

  /* Draw synapse connections between nearby creatures (neural network visualization) */
  drawSynapseNetwork(ctx, creatures, width, height, time);

  /* Draw each creature */
  for (const creature of creatures) {
    drawCreature(ctx, { ...creature, x: creature.x * width, y: creature.y * height }, time, width, height);
  }
}

/** Draw pulsing connection lines between creatures — represents neural network links.
 * Line brightness = combined intelligence, pulse speed = firing rate. */
function drawSynapseNetwork(
  ctx: CanvasRenderingContext2D,
  creatures: CreatureRenderData[],
  width: number,
  height: number,
  time: number,
): void {
  if (creatures.length < 2) return;
  const t = time / 1000;

  for (let i = 0; i < creatures.length; i++) {
    for (let j = i + 1; j < creatures.length; j++) {
      const a = creatures[i];
      const b = creatures[j];
      const ax = a.x * width, ay = a.y * height;
      const bx = b.x * width, by = b.y * height;
      const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);

      /* Only connect creatures within range */
      if (dist > 200) continue;

      /* Connection strength = combined synapse count and intelligence */
      const synStrength = ((a.synapseCount ?? 0) + (b.synapseCount ?? 0)) / 40;
      const intStrength = ((a.intelligence ?? 0) + (b.intelligence ?? 0)) / 100;
      const strength = Math.min(1, (synStrength + intStrength) * 0.5);
      if (strength < 0.05) continue;

      /* Pulsing animation — speed driven by firing rate */
      const firingRate = ((a.totalFirings ?? 0) + (b.totalFirings ?? 0)) * 0.001;
      const pulse = 0.3 + Math.sin(t * (2 + firingRate) + i * 3 + j * 7) * 0.3;

      /* Draw connection line */
      ctx.strokeStyle = `rgba(168, 85, 247, ${strength * pulse * 0.4})`;
      ctx.lineWidth = 1 + strength;
      ctx.setLineDash([4, 4 + (1 - strength) * 8]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);

      /* Curved connection line through midpoint with neural-inspired bend */
      const mx = (ax + bx) / 2 + Math.sin(t + i) * 10 * strength;
      const my = (ay + by) / 2 + Math.cos(t + j) * 10 * strength;
      ctx.quadraticCurveTo(mx, my, bx, by);
      ctx.stroke();
      ctx.setLineDash([]);

      /* Signal pulse traveling along the connection */
      if (strength > 0.2) {
        const pulsePos = (t * 0.5 + i * 0.3) % 1;
        const px = ax + (bx - ax) * pulsePos;
        const py = ay + (by - ay) * pulsePos;
        ctx.fillStyle = `rgba(168, 85, 247, ${strength * 0.6})`;
        ctx.beginPath();
        ctx.arc(px, py, 2 + strength * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/** Draw a single creature with full neural-driven visualization */
function drawCreature(
  ctx: CanvasRenderingContext2D,
  creature: CreatureRenderData,
  time: number,
  canvasW: number,
  canvasH: number,
): void {
  const def = SPECIES[creature.species];
  const sizeMul = getStageSizeMultiplier(creature.stage);
  const stageGlow = getStageGlow(creature.stage);
  const phiGlow = (creature.phi ?? 0) * 0.5;
  const glow = Math.min(1, stageGlow + phiGlow);
  const baseSize = 14 * sizeMul;
  const t = time / 1000;
  const energy = Math.max(0.3, creature.energy);
  const intelligence = creature.intelligence ?? 0;
  const emotionalState = creature.emotionalState ?? 0;
  const neuronCount = creature.neuronCount ?? 0;

  ctx.save();

  if (creature.isSleeping) ctx.globalAlpha = 0.35;

  /* === MOVEMENT === */
  let offsetX = 0;
  let offsetY = 0;
  const id = creature.x * 7 + creature.y * 13;
  /* Motor output influences movement — neural brain drives behavior */
  const motor = creature.motorOutput ?? { toward: 0, away: 0, eat: 0 };
  const motorBoost = 1 + (Math.abs(motor.toward) + Math.abs(motor.away)) * 2;

  switch (def.movementStyle) {
    case 'bounce':
      offsetY = Math.abs(Math.sin(t * 5 + id)) * 12 * energy * motorBoost;
      offsetX = Math.sin(t * 2.5 + id) * 4 * energy;
      break;
    case 'orbit':
      offsetX = Math.cos(t * 1.8 + id) * 10 * energy * motorBoost;
      offsetY = Math.sin(t * 1.8 + id) * 8 * energy;
      break;
    case 'flow':
      offsetX = Math.sin(t * 1.2 + id) * 15 * energy;
      offsetY = Math.cos(t * 0.8 + id * 0.5) * 5 * energy * motorBoost;
      break;
    case 'glitch':
      offsetX = Math.sin(Math.floor(t * 8) * 999 + id) * 10 * energy;
      offsetY = Math.cos(Math.floor(t * 8) * 777 + id) * 10 * energy;
      break;
    case 'wave':
      offsetX = Math.sin(t * 0.6 + id * 0.3) * 12 * energy;
      offsetY = Math.sin(t * 0.4 + id) * 18 * energy * motorBoost;
      break;
    case 'swarm':
      offsetX = Math.sin(t * 8 + id) * 6 + Math.sin(t * 13 + id * 2) * 3;
      offsetY = Math.cos(t * 7 + id) * 4 + Math.cos(t * 11 + id * 3) * 2;
      break;
  }

  const drawX = creature.x + offsetX;
  const drawY = creature.y + offsetY;
  const breathScale = 1 + Math.sin(t * 3 + id) * 0.05 * energy;
  const size = baseSize * breathScale;

  /* === NEURON HALO — ring of tiny dots around the creature representing neurons === */
  if (neuronCount > 0 && !creature.isSleeping) {
    const haloRadius = size + 6 + intelligence * 0.3;
    for (let n = 0; n < Math.min(neuronCount, 20); n++) {
      const angle = (n / Math.min(neuronCount, 20)) * Math.PI * 2 + t * 0.5;
      const nx = drawX + Math.cos(angle) * haloRadius;
      const ny = drawY + Math.sin(angle) * haloRadius;
      /* Neuron dots pulse based on firing activity */
      const firing = Math.sin(t * 4 + n * 2) > 0.7;
      ctx.fillStyle = firing ? VIZ_COLORS.white : def.dimColor;
      ctx.globalAlpha = firing ? 0.8 : 0.25;
      ctx.beginPath();
      ctx.arc(nx, ny, firing ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = creature.isSleeping ? 0.35 : 1;
  }

  /* === GLOW — driven by stage + consciousness Phi === */
  if (glow > 0) {
    ctx.shadowColor = def.color;
    ctx.shadowBlur = glow * 25;
  }

  /* === BODY — unique bezier shape per species === */
  /* Emotional state tints the body — positive = brighter, negative = darker */
  const emotionTint = Math.max(-0.3, Math.min(0.3, emotionalState * 0.5));
  ctx.fillStyle = emotionTint > 0.05
    ? lightenColor(def.color, emotionTint)
    : emotionTint < -0.05
      ? darkenColor(def.color, -emotionTint)
      : def.color;
  drawSpeciesBody(ctx, creature.species, drawX, drawY, size, t, energy);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  /* === INTELLIGENCE RING — grows with brain development === */
  if (intelligence > 3 && !creature.isSleeping) {
    const intRingSize = size + 3 + Math.min(intelligence * 0.2, 8);
    ctx.strokeStyle = def.color;
    ctx.globalAlpha = Math.min(0.5, intelligence * 0.02);
    ctx.lineWidth = 1;
    ctx.beginPath();
    /* Partial ring — fills up as intelligence grows (max at ~50) */
    const arcLength = Math.min(Math.PI * 2, intelligence * 0.1);
    ctx.arc(drawX, drawY, intRingSize, -Math.PI / 2, -Math.PI / 2 + arcLength);
    ctx.stroke();
    ctx.globalAlpha = creature.isSleeping ? 0.35 : 1;
  }

  /* === EYES === */
  const eyeSpacing = size * 0.3;
  /* Synthling has teardrop shape — shift eyes down into the body area */
  const eyeYOffset = creature.species === 'synthling' ? size * 0.15 : -size * 0.1;
  const eyeY = drawY + eyeYOffset;
  const eyeSize = size * 0.28;
  const pupilSize = eyeSize * 0.5;

  ctx.fillStyle = VIZ_COLORS.white;
  ctx.beginPath();
  ctx.arc(drawX - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.arc(drawX + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  /* Pupils track movement + emotional state shifts gaze */
  const lookX = offsetX * 0.08 + emotionalState * 2;
  const lookY = offsetY * 0.06;
  const dilatedPupil = pupilSize * (1 + energy * 0.3);

  ctx.fillStyle = VIZ_COLORS.bg;
  ctx.beginPath();
  ctx.arc(drawX - eyeSpacing + lookX, eyeY + lookY, dilatedPupil, 0, Math.PI * 2);
  ctx.arc(drawX + eyeSpacing + lookX, eyeY + lookY, dilatedPupil, 0, Math.PI * 2);
  ctx.fill();

  /* Eye shine */
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(drawX - eyeSpacing - pupilSize * 0.3, eyeY - pupilSize * 0.3, pupilSize * 0.3, 0, Math.PI * 2);
  ctx.arc(drawX + eyeSpacing - pupilSize * 0.3, eyeY - pupilSize * 0.3, pupilSize * 0.3, 0, Math.PI * 2);
  ctx.fill();

  /* Blink — eyelids cover eyes briefly */
  const blinkCycle = (t * 0.7 + id * 0.1) % 4;
  if (blinkCycle > 3.85) {
    ctx.fillStyle = emotionTint > 0.05 ? lightenColor(def.color, emotionTint) : def.color;
    ctx.beginPath();
    ctx.arc(drawX - eyeSpacing, eyeY, eyeSize + 1.5, 0, Math.PI * 2);
    ctx.arc(drawX + eyeSpacing, eyeY, eyeSize + 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /* === MOUTH — driven by emotional state and energy === */
  const mouthY = drawY + (creature.species === 'synthling' ? size * 0.5 : size * 0.35);
  const mouthW = size * 0.4;
  ctx.strokeStyle = VIZ_COLORS.bg;
  ctx.lineWidth = Math.max(1.5, size * 0.08);
  ctx.lineCap = 'round';

  if (creature.isSleeping) {
    ctx.beginPath();
    ctx.arc(drawX, mouthY, size * 0.08, 0, Math.PI * 2);
    ctx.stroke();
  } else if (emotionalState > 0.3 || energy > 0.6) {
    /* Happy/excited — wide smile, open if very excited */
    ctx.beginPath();
    ctx.arc(drawX, mouthY - size * 0.1, mouthW * 0.7, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    if (emotionalState > 0.5 || energy > 0.8) {
      ctx.fillStyle = darkenColor(def.color, 0.4);
      ctx.beginPath();
      ctx.arc(drawX, mouthY - size * 0.05, mouthW * 0.5, 0, Math.PI);
      ctx.fill();
    }
  } else if (emotionalState < -0.2) {
    /* Negative emotion — slight frown */
    ctx.beginPath();
    ctx.arc(drawX, mouthY + size * 0.15, mouthW * 0.4, 1.15 * Math.PI, 1.85 * Math.PI);
    ctx.stroke();
  } else {
    /* Neutral — gentle smile */
    ctx.beginPath();
    ctx.arc(drawX, mouthY - size * 0.15, mouthW * 0.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  /* === SPECIES-SPECIFIC FEATURES === */
  drawSpeciesFeature(ctx, creature, def, drawX, drawY, size, offsetX, offsetY, t, energy, id);

  /* === STAGE INDICATORS === */
  if (creature.stage === 'egg') {
    /* Egg: dashed outline matching the species body shape */
    ctx.strokeStyle = def.dimColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    drawSpeciesBody(ctx, creature.species, drawX, drawY, size + 5, t, 0.1);
    ctx.stroke();
    /* Don't fill — the egg shell is just the outline */
    ctx.setLineDash([]);
  } else if (creature.stage === 'elder') {
    ctx.fillStyle = def.color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(drawX - 5, drawY - size - 2);
    ctx.lineTo(drawX - 2, drawY - size - 8);
    ctx.lineTo(drawX, drawY - size - 4);
    ctx.lineTo(drawX + 2, drawY - size - 8);
    ctx.lineTo(drawX + 5, drawY - size - 2);
    ctx.fill();
    ctx.globalAlpha = creature.isSleeping ? 0.35 : 1;
  } else if (creature.stage === 'ascended') {
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + Math.sin(t * 3) * 0.3;
    ctx.beginPath();
    ctx.arc(drawX, drawY, size + 8 + Math.sin(t * 2) * 3, 0, Math.PI * 2);
    ctx.stroke();
    /* Second halo for ascended */
    ctx.globalAlpha = 0.2 + Math.sin(t * 2 + 1) * 0.15;
    ctx.beginPath();
    ctx.arc(drawX, drawY, size + 14 + Math.sin(t * 1.5) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = creature.isSleeping ? 0.35 : 1;
  }

  /* Sleeping z's */
  if (creature.isSleeping) {
    ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.3;
    ctx.fillStyle = VIZ_COLORS.textDim;
    ctx.font = `bold ${size * 0.5}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('z', drawX + size, drawY - size - 6 + Math.sin(t * 1.5) * 4);
    ctx.fillText('z', drawX + size * 1.3, drawY - size - 12 + Math.sin(t * 1.2) * 3);
  }

  /* Consciousness Phi ring */
  const phi = creature.phi ?? 0;
  if (phi > 0.1 && !creature.isSleeping) {
    ctx.strokeStyle = VIZ_COLORS.white;
    ctx.lineWidth = 1;
    ctx.globalAlpha = phi * 0.3;
    ctx.beginPath();
    ctx.arc(drawX, drawY, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  /* === EVOLUTION PROGRESS BAR — tiny bar below creature showing XP to next stage === */
  if (creature.stage !== 'ascended' && !creature.isSleeping) {
    const barW = size * 1.2;
    const barH = 2;
    const barX = drawX - barW / 2;
    const barY = drawY + size + 6;
    /* Background */
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    /* Fill — energy as proxy for XP progress visual */
    ctx.fillStyle = def.color;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(barX, barY, barW * Math.min(1, energy), barH);
    ctx.globalAlpha = creature.isSleeping ? 0.35 : 1;
  }

  ctx.restore();
}

/** Draw species-specific visual features */
function drawSpeciesFeature(
  ctx: CanvasRenderingContext2D,
  creature: CreatureRenderData,
  def: { color: string; movementStyle: string },
  drawX: number,
  drawY: number,
  size: number,
  offsetX: number,
  offsetY: number,
  t: number,
  energy: number,
  id: number,
): void {
  switch (creature.species) {
    case 'beatling': {
      /* Musical notes float up when bouncing */
      if (Math.abs(offsetY) > 4) {
        ctx.fillStyle = def.color;
        ctx.globalAlpha = 0.6;
        ctx.font = `${size * 0.5}px serif`;
        ctx.textAlign = 'center';
        const noteY = drawY - size - 4 + Math.sin(t * 3) * 3;
        ctx.fillText('\u266A', drawX + size * 0.7, noteY);
        if (energy > 0.5) ctx.fillText('\u266B', drawX - size * 0.6, noteY - 4);
        ctx.globalAlpha = 1;
      }
      break;
    }
    case 'looplet': {
      /* Orbit trail */
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(creature.x, creature.y, 12 * energy, t * 1.8 + id, t * 1.8 + id + Math.PI * 1.2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case 'synthling': {
      /* Sine wave antenna — length grows with intelligence */
      const antennaLen = 10 + Math.min((creature.intelligence ?? 0) * 0.3, 8);
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < antennaLen; i++) {
        const ax = drawX - antennaLen / 2 + i;
        const ay = drawY - size - 4 + Math.sin(t * 4 + i * 0.5) * 3 * energy;
        i === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case 'glitchbit': {
      /* Pixel scatter — more pixels = more synapses */
      const pixelCount = 3 + Math.min((creature.synapseCount ?? 0) * 0.2, 6);
      ctx.fillStyle = def.color;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < pixelCount; i++) {
        const px = drawX + Math.sin(t * 12 + i * 99) * size * 1.2;
        const py = drawY + Math.cos(t * 12 + i * 77) * size * 1.2;
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'wavelet': {
      /* Expanding ripple rings */
      const ripple = (t * 2 + id) % 2;
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = Math.max(0, 0.35 - ripple * 0.17);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(drawX, drawY, size + ripple * 12, 0, Math.PI * 2);
      ctx.stroke();
      /* Second ripple offset */
      const ripple2 = (t * 2 + id + 1) % 2;
      ctx.globalAlpha = Math.max(0, 0.2 - ripple2 * 0.1);
      ctx.beginPath();
      ctx.arc(drawX, drawY, size + ripple2 * 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case 'codefly': {
      /* Flapping wings */
      const wingAngle = Math.sin(t * 20) * 0.5;
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(drawX - size * 0.9, drawY - size * 0.15, size * 0.5, size * 0.2, wingAngle, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(drawX + size * 0.9, drawY - size * 0.15, size * 0.5, size * 0.2, -wingAngle, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
  }
}

/** Darken a hex color */
function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 1 - factor;
  return `rgb(${Math.floor(r * f)}, ${Math.floor(g * f)}, ${Math.floor(b * f)})`;
}

/** Lighten a hex color */
function lightenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))}, ${Math.min(255, Math.floor(g + (255 - g) * factor))}, ${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
}
