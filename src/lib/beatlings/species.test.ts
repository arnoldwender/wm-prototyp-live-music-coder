import { describe, it, expect } from 'vitest';
import { SPECIES, shouldSpawn, type AudioFeatures } from './species';

describe('Species', () => {
  it('defines 6 species', () => {
    expect(Object.keys(SPECIES)).toHaveLength(6);
  });

  it('each species has required fields', () => {
    for (const s of Object.values(SPECIES)) {
      expect(s.name).toBeTruthy();
      expect(s.role).toBeTruthy();
      expect(s.color).toBeTruthy();
      expect(typeof s.spawnCheck).toBe('function');
    }
  });

  it('spawns Beatling on beat detection', () => {
    const features: AudioFeatures = { rms: 0.5, peak: 0.8, hasBeat: true, dominantFreq: 100, complexity: 0.3, isTyping: false, energyTrend: 0, complexityTrend: 0, beatDensity: 0, musicalMomentum: 0 };
    expect(shouldSpawn('beatling', features)).toBe(true);
  });

  it('spawns Wavelet on low frequency', () => {
    const features: AudioFeatures = { rms: 0.4, peak: 0.5, hasBeat: false, dominantFreq: 80, complexity: 0.2, isTyping: false, energyTrend: 0, complexityTrend: 0, beatDensity: 0, musicalMomentum: 0 };
    expect(shouldSpawn('wavelet', features)).toBe(true);
  });

  it('spawns Codefly when typing', () => {
    const features: AudioFeatures = { rms: 0, peak: 0, hasBeat: false, dominantFreq: 0, complexity: 0, isTyping: true, energyTrend: 0, complexityTrend: 0, beatDensity: 0, musicalMomentum: 0 };
    expect(shouldSpawn('codefly', features)).toBe(true);
  });

  it('does not spawn without matching conditions', () => {
    const features: AudioFeatures = { rms: 0, peak: 0, hasBeat: false, dominantFreq: 500, complexity: 0, isTyping: false, energyTrend: 0, complexityTrend: 0, beatDensity: 0, musicalMomentum: 0 };
    expect(shouldSpawn('beatling', features)).toBe(false);
  });
});
