/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Shared AudioContext singleton — single master context for
   the entire app with gain control and FFT analysis.
   Routing: masterGain → masterAnalyser → destination
   ────────────────────────────────────────────────────────── */

/** Master audio state — lazily initialized on first call */
let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let masterAnalyser: AnalyserNode | null = null

/**
 * Returns the shared AudioContext, creating it on first call.
 * Also wires up masterGain → masterAnalyser → destination.
 */
export function getSharedContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()

    /* Master gain — volume control before analysis */
    masterGain = audioContext.createGain()

    /* Master analyser — FFT for visualizations */
    masterAnalyser = audioContext.createAnalyser()
    masterAnalyser.fftSize = 2048
    masterAnalyser.smoothingTimeConstant = 0.8

    /* Signal chain: gain → analyser → speakers */
    masterGain.connect(masterAnalyser)
    masterAnalyser.connect(audioContext.destination)
  }
  return audioContext
}

/** Returns the master GainNode (creates context if needed) */
export function getMasterGain(): GainNode {
  getSharedContext()
  return masterGain!
}

/** Returns the master AnalyserNode (creates context if needed) */
export function getMasterAnalyser(): AnalyserNode {
  getSharedContext()
  return masterAnalyser!
}

/**
 * Resumes a suspended AudioContext — required by browsers
 * after user gesture before audio can play.
 */
export async function resumeContext(): Promise<void> {
  const ctx = getSharedContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

/**
 * Points Strudel/superdough at the shared AudioContext.
 *
 * MUST be called before any initStrudel(). Until 2026-08-17 nothing ever called
 * superdough's setAudioContext, so the app ran THREE contexts: this one, the one
 * superdough created for itself, and a third in src/lib/midi/strudel-keys.ts.
 * Consequences, all real: recording a Strudel session captured silence, because
 * AudioRecorder taps this context while Strudel played into another one; and
 * setMasterVolume could never reach Strudel.
 *
 * webaudioRepl resolves its context as `options.audioContext ?? getAudioContext()`,
 * so setting it first is enough — no patching required.
 *
 * Note this unifies the CONTEXT, not the bus: superdough still terminates at
 * `audioContext.destination` (superdoughoutput.mjs:148), bypassing masterGain.
 * That is why the recorder taps its output node separately rather than assuming
 * one master bus — see getStrudelOutputNode() in ./strudel-tap.
 */
export async function adoptSharedContextForStrudel(): Promise<void> {
  const ctx = getSharedContext()
  try {
    const { setAudioContext, getAudioContext } = await import('@strudel/webaudio')
    if (getAudioContext() !== ctx) setAudioContext(ctx)
  } catch {
    /* @strudel/webaudio unavailable — the non-Strudel engines still work. */
  }
}

/** Sets master volume (0 = silent, 1 = full) */
export function setMasterVolume(volume: number): void {
  const gain = getMasterGain()
  const clamped = Math.max(0, Math.min(1, volume))
  gain.gain.setValueAtTime(clamped, gain.context.currentTime)
}

/** Closes the AudioContext and releases all resources */
export async function disposeContext(): Promise<void> {
  if (audioContext) {
    await audioContext.close()
  }
  audioContext = null
  masterGain = null
  masterAnalyser = null
}
