/* Universal audio tap for visualization.
 * Strategy: try Strudel's superdough controller first, then fall back
 * to the shared AudioContext's master analyser. Works for ALL engines. */

import { getMasterAnalyser } from './context';

let strudelAnalyser: AnalyserNode | null = null;
let strudelConnected = false;

/**
 * Returns an AnalyserNode that receives audio data for visualization.
 * Tries Strudel's superdough tap first (for Strudel engine), then falls
 * back to the shared context's master analyser (for Tone.js / WebAudio).
 */
export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  /* Strategy 1: Strudel's superdough controller */
  try {
    const sd = await import('@strudel/webaudio');
    const ctx = sd.getAudioContext();
    if (ctx && ctx.state !== 'closed') {
      /* Create analyser in superdough's AudioContext */
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
            return strudelAnalyser;
          }
        } catch { /* controller not ready */ }
      } else {
        return strudelAnalyser;
      }
    }
  } catch { /* Strudel not available */ }

  /* Strategy 2: Shared context master analyser — works for Tone.js / WebAudio.
   * The chain is masterGain → masterAnalyser → destination, so any audio
   * routed through getMasterGain() is already captured here. */
  try {
    const master = getMasterAnalyser();
    if (master) return master;
  } catch { /* shared context not ready */ }

  return null;
}

/** Reset Strudel connection state — call after code re-evaluation.
 * Nulls the strudel analyser so it reconnects on next frame. */
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
