/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   AudioAnalyzer — convenience wrapper around AnalyserNode
   for frequency data, time domain, RMS/peak levels,
   beat detection, and dominant frequency extraction.
   ────────────────────────────────────────────────────────── */

export class AudioAnalyzer {
  private analyser: AnalyserNode
  private freqBuffer: Float32Array<ArrayBuffer>
  private timeBuffer: Float32Array<ArrayBuffer>

  constructor(analyser: AnalyserNode) {
    this.analyser = analyser
    /* Pre-allocate typed arrays matching the FFT bin count */
    this.freqBuffer = new Float32Array(analyser.frequencyBinCount) as Float32Array<ArrayBuffer>
    this.timeBuffer = new Float32Array(analyser.frequencyBinCount) as Float32Array<ArrayBuffer>
  }

  /** Returns frequency-domain data in decibels */
  getFrequencyData(): Float32Array {
    this.analyser.getFloatFrequencyData(this.freqBuffer)
    return this.freqBuffer
  }

  /** Returns time-domain waveform data (-1 to 1) */
  getTimeDomainData(): Float32Array {
    this.analyser.getFloatTimeDomainData(this.timeBuffer)
    return this.timeBuffer
  }

  /**
   * Root Mean Square level (0-1).
   * Measures perceived loudness of the current audio frame.
   */
  getRmsLevel(): number {
    const data = this.getTimeDomainData()
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i]
    }
    return Math.sqrt(sum / data.length)
  }

  /**
   * Peak level (0-1).
   * Maximum absolute sample value in the current frame.
   */
  getPeakLevel(): number {
    const data = this.getTimeDomainData()
    let peak = 0
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i])
      if (abs > peak) {
        peak = abs
      }
    }
    return peak
  }

  /**
   * Simple beat detection — returns true when RMS
   * exceeds the given threshold (default 0.3).
   */
  detectBeat(threshold = 0.3): boolean {
    return this.getRmsLevel() > threshold
  }

  /**
   * Finds the dominant frequency in Hz by locating the
   * FFT bin with the highest magnitude.
   */
  getDominantFrequency(sampleRate: number): number {
    const data = this.getFrequencyData()
    let maxValue = -Infinity
    let maxIndex = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i] > maxValue) {
        maxValue = data[i]
        maxIndex = i
      }
    }
    /* Convert bin index to frequency: bin * sampleRate / fftSize */
    return (maxIndex * sampleRate) / this.analyser.fftSize
  }

  /** Returns the raw AnalyserNode for direct Web Audio use */
  getRawAnalyser(): AnalyserNode {
    return this.analyser
  }
}
