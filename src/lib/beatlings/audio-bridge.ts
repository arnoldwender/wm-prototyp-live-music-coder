/* ──────────────────────────────────────────────────────────
   Audio bridge — connects AudioAnalyzer to the Beatling
   brain systems. Extracts audio features per frame for
   species spawn checks and brain stimulation.
   ────────────────────────────────────────────────────────── */

import { AudioAnalyzer } from '../audio/analyzer';
import type { AudioFeatures } from './species';

/** Bridge between the audio analyser and the Beatling brain systems.
 * Extracts audio features each frame and converts to brain-friendly format. */
export class AudioBridge {
  private analyzer: AudioAnalyzer;
  private sampleRate: number;
  private prevRms = 0;
  private beatCooldown = 0;

  constructor(analyzer: AudioAnalyzer, sampleRate: number) {
    this.analyzer = analyzer;
    this.sampleRate = sampleRate;
  }

  /** Extract current audio features for species spawn checks and brain stimulation */
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

    return { rms, peak, hasBeat, dominantFreq, complexity, isTyping };
  }
}
