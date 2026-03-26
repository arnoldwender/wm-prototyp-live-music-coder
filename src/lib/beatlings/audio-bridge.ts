/* ──────────────────────────────────────────────────────────
   Audio bridge — connects AudioAnalyzer to the Beatling
   brain systems. Extracts audio features per frame including
   temporal evolution metrics that track how the music changes
   over time (energy trend, complexity growth, beat density).
   ────────────────────────────────────────────────────────── */

import { AudioAnalyzer } from '../audio/analyzer';
import type { AudioFeatures } from './species';

/* Ring buffer size for temporal tracking (~2 seconds at 60fps) */
const HISTORY_SIZE = 120;

/** Bridge between the audio analyser and the Beatling brain systems.
 * Tracks audio history to compute evolution/trend metrics. */
export class AudioBridge {
  private analyzer: AudioAnalyzer;
  private sampleRate: number;
  private prevRms = 0;
  private beatCooldown = 0;

  /* History buffers for temporal analysis */
  private rmsHistory: number[] = [];
  private complexityHistory: number[] = [];
  private beatHistory: boolean[] = [];

  constructor(analyzer: AudioAnalyzer, sampleRate: number) {
    this.analyzer = analyzer;
    this.sampleRate = sampleRate;
  }

  /** Extract current audio features including temporal evolution metrics */
  getFeatures(isTyping: boolean): AudioFeatures {
    const rms = this.analyzer.getRmsLevel();
    const peak = this.analyzer.getPeakLevel();
    const dominantFreq = this.analyzer.getDominantFrequency(this.sampleRate);

    /* Beat detection: RMS spike above 0.25 and 1.5x previous, with 10-frame cooldown */
    let hasBeat = false;
    if (this.beatCooldown <= 0 && rms > 0.25 && rms > this.prevRms * 1.5) {
      hasBeat = true;
      this.beatCooldown = 10;
    }
    if (this.beatCooldown > 0) this.beatCooldown--;
    this.prevRms = rms;

    /* Complexity: ratio of FFT bins above -60dB threshold */
    const freqData = this.analyzer.getFrequencyData();
    let activeBins = 0;
    for (let i = 0; i < freqData.length; i++) {
      if (freqData[i] > -60) activeBins++;
    }
    const complexity = activeBins / freqData.length;

    /* Push to history buffers */
    this.rmsHistory.push(rms);
    this.complexityHistory.push(complexity);
    this.beatHistory.push(hasBeat);
    if (this.rmsHistory.length > HISTORY_SIZE) this.rmsHistory.shift();
    if (this.complexityHistory.length > HISTORY_SIZE) this.complexityHistory.shift();
    if (this.beatHistory.length > HISTORY_SIZE) this.beatHistory.shift();

    /* Compute temporal evolution metrics */
    const energyTrend = this.computeTrend(this.rmsHistory);
    const complexityTrend = this.computeTrend(this.complexityHistory);
    const beatDensity = this.beatHistory.filter(Boolean).length / Math.max(1, this.beatHistory.length);
    const musicalMomentum = Math.max(0, Math.min(1,
      (Math.max(0, energyTrend) + Math.max(0, complexityTrend)) / 2 + beatDensity * 0.3
    ));

    return {
      rms, peak, hasBeat, dominantFreq, complexity, isTyping,
      energyTrend, complexityTrend, beatDensity, musicalMomentum,
    };
  }

  /** Compute trend of a value buffer: compare recent half to older half.
   * Returns -1 (declining) to +1 (growing). 0 = stable. */
  private computeTrend(buffer: number[]): number {
    if (buffer.length < 20) return 0;
    const mid = Math.floor(buffer.length / 2);
    const oldAvg = buffer.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
    const newAvg = buffer.slice(mid).reduce((s, v) => s + v, 0) / (buffer.length - mid);
    /* Normalize: difference relative to max observed value */
    const maxVal = Math.max(0.01, ...buffer);
    return Math.max(-1, Math.min(1, (newAvg - oldAvg) / maxVal));
  }
}
