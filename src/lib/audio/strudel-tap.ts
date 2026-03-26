/* Universal audio tap for visualization — works for ALL engines.
 *
 * Strategy:
 * 1. Strudel: tap superdough's destinationGain (Strudel has its own AudioContext)
 * 2. Fallback: shared context masterAnalyser (Tone.js + WebAudio route through this)
 *
 * Tone.js: setContext(sharedCtx) + Destination.connect(masterAnalyser) in init()
 * WebAudio: evaluates with shared ctx + masterGain already in the chain */

import { getMasterAnalyser } from './context';

let strudelAnalyser: AnalyserNode | null = null;
let strudelConnected = false;

/**
 * Returns an AnalyserNode with live audio data.
 * Tries Strudel superdough first, falls back to shared masterAnalyser.
 */
export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  /* Strategy 1: Strudel's superdough controller (its own AudioContext) */
  try {
    const sd = await import('@strudel/webaudio');
    const ctx = sd.getAudioContext();
    if (ctx && ctx.state !== 'closed') {
      if (!strudelAnalyser || strudelAnalyser.context !== ctx) {
        strudelAnalyser = ctx.createAnalyser();
        strudelAnalyser.fftSize = 2048;
        strudelAnalyser.smoothingTimeConstant = 0.85;
        strudelConnected = false;
      }

      if (!strudelConnected) {
        try {
          const controller = sd.getSuperdoughAudioController();
          const destGain = controller?.output?.destinationGain;
          if (destGain) {
            destGain.connect(strudelAnalyser);
            strudelConnected = true;
            console.log('[AudioTap] Strudel destinationGain connected to analyser');
          }
        } catch (e) {
          console.warn('[AudioTap] Strudel controller not ready:', e);
        }
      }

      if (strudelConnected) return strudelAnalyser;
    }
  } catch { /* Strudel not available */ }

  /* Strategy 2: Shared masterAnalyser — Tone.js and WebAudio both route here */
  try {
    return getMasterAnalyser();
  } catch { /* not ready */ }

  return null;
}

/** Reset connection state — call after evaluate to force reconnect. */
export function resetStrudelTap(): void {
  strudelConnected = false;
  strudelAnalyser = null;
}

export async function getStrudelSampleRate(): Promise<number> {
  try {
    const { getAudioContext } = await import('@strudel/webaudio');
    return getAudioContext()?.sampleRate ?? 44100;
  } catch {
    return 44100;
  }
}
