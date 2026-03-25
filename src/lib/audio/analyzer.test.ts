/* ──────────────────────────────────────────────────────────
   Tests for AudioAnalyzer — uses a mock AnalyserNode with
   controlled frequency and time-domain data.
   ────────────────────────────────────────────────────────── */

import { describe, it, expect, vi } from 'vitest'
import { AudioAnalyzer } from './analyzer'

/** FFT size used by the mock analyser */
const FFT_SIZE = 2048
const BIN_COUNT = FFT_SIZE / 2
const SAMPLE_RATE = 44100

/** Peak bin for frequency test — bin 100 will be the loudest */
const PEAK_BIN = 100

/** Creates a mock AnalyserNode with deterministic data */
function createMockAnalyser() {
  return {
    fftSize: FFT_SIZE,
    frequencyBinCount: BIN_COUNT,
    smoothingTimeConstant: 0.8,

    /* Fill with -100 dB everywhere except bin PEAK_BIN at 0 dB */
    getFloatFrequencyData: vi.fn((buffer: Float32Array) => {
      buffer.fill(-100)
      buffer[PEAK_BIN] = 0
    }),

    /* Fill with a sine-like wave at amplitude 0.5 */
    getFloatTimeDomainData: vi.fn((buffer: Float32Array) => {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = 0.5 * Math.sin((2 * Math.PI * i) / buffer.length)
      }
    }),
  } as unknown as AnalyserNode
}

describe('AudioAnalyzer', () => {
  it('returns frequency data as Float32Array with correct length', () => {
    const analyzer = new AudioAnalyzer(createMockAnalyser())
    const data = analyzer.getFrequencyData()

    expect(data).toBeInstanceOf(Float32Array)
    expect(data.length).toBe(BIN_COUNT)
  })

  it('returns time domain data as Float32Array', () => {
    const analyzer = new AudioAnalyzer(createMockAnalyser())
    const data = analyzer.getTimeDomainData()

    expect(data).toBeInstanceOf(Float32Array)
    expect(data.length).toBe(BIN_COUNT)
  })

  it('calculates RMS level between 0 and 1', () => {
    const analyzer = new AudioAnalyzer(createMockAnalyser())
    const rms = analyzer.getRmsLevel()

    expect(rms).toBeGreaterThan(0)
    expect(rms).toBeLessThanOrEqual(1)
    /* For a sine wave of amplitude 0.5, RMS ≈ 0.5 / sqrt(2) ≈ 0.354 */
    expect(rms).toBeCloseTo(0.5 / Math.SQRT2, 1)
  })

  it('calculates peak level between 0 and 1', () => {
    const analyzer = new AudioAnalyzer(createMockAnalyser())
    const peak = analyzer.getPeakLevel()

    expect(peak).toBeGreaterThan(0)
    expect(peak).toBeLessThanOrEqual(1)
    /* Peak of sine(x) * 0.5 → ~0.5 */
    expect(peak).toBeCloseTo(0.5, 1)
  })

  it('detects beat when RMS exceeds threshold', () => {
    const analyzer = new AudioAnalyzer(createMockAnalyser())

    /* RMS ≈ 0.354, so threshold 0.2 should trigger */
    expect(analyzer.detectBeat(0.2)).toBe(true)
    /* Threshold 0.9 should not trigger */
    expect(analyzer.detectBeat(0.9)).toBe(false)
  })

  it('finds dominant frequency from peak FFT bin', () => {
    const analyzer = new AudioAnalyzer(createMockAnalyser())
    const freq = analyzer.getDominantFrequency(SAMPLE_RATE)

    /* Expected: bin 100 * 44100 / 2048 ≈ 2153 Hz */
    const expected = (PEAK_BIN * SAMPLE_RATE) / FFT_SIZE
    expect(freq).toBeCloseTo(expected, 0)
    expect(freq).toBeGreaterThan(0)
  })

  it('returns the raw AnalyserNode', () => {
    const mock = createMockAnalyser()
    const analyzer = new AudioAnalyzer(mock)

    expect(analyzer.getRawAnalyser()).toBe(mock)
  })
})
