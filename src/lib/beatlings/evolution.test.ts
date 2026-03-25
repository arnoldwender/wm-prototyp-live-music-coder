import { describe, it, expect } from 'vitest';
import { addXp, getStage, XP_THRESHOLDS, type BeatlingXp } from './evolution';

describe('Evolution', () => {
  it('starts at egg stage with zero XP', () => {
    const xp: BeatlingXp = { audio: 0, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('egg');
  });

  it('evolves to baby at threshold', () => {
    const xp: BeatlingXp = { audio: XP_THRESHOLDS.baby, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('baby');
  });

  it('evolves to adult', () => {
    const xp: BeatlingXp = { audio: XP_THRESHOLDS.adult, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('adult');
  });

  it('evolves to elder', () => {
    const xp: BeatlingXp = { audio: XP_THRESHOLDS.elder, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('elder');
  });

  it('evolves to ascended', () => {
    const xp: BeatlingXp = { audio: XP_THRESHOLDS.ascended, complexity: 0, interaction: 0 };
    expect(getStage(xp)).toBe('ascended');
  });

  it('adds XP correctly', () => {
    const xp: BeatlingXp = { audio: 0, complexity: 0, interaction: 0 };
    const updated = addXp(xp, 'audio', 10);
    expect(updated.audio).toBe(10);
    expect(updated.complexity).toBe(0);
  });

  it('total XP considers all sources', () => {
    const xp: BeatlingXp = { audio: 30, complexity: 30, interaction: 30 };
    expect(getStage(xp)).toBe('baby');
  });
});
