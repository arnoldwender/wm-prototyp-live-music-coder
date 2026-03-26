/* Universal audio tap for visualization — works for ALL engines.
 *
 * Returns whichever analyser has ACTUAL audio data:
 * - Strudel: superdough's destinationGain analyser (when Strudel is playing)
 * - Tone.js / WebAudio: shared context masterAnalyser (always has their audio)
 *
 * Key insight: Strudel's analyser connects successfully but only has data
 * when Strudel is playing. When other engines play, we must use masterAnalyser. */

import { getMasterAnalyser } from './context';

let strudelAnalyser: AnalyserNode | null = null;
let strudelConnected = false;

/* Reusable buffer for signal detection */
let checkBuffer: Float32Array | null = null;

/** Check if an analyser has actual audio signal (not silence) */
function hasSignal(analyser: AnalyserNode): boolean {
  if (!checkBuffer || checkBuffer.length !== analyser.frequencyBinCount) {
    checkBuffer = new Float32Array(analyser.frequencyBinCount);
  }
  analyser.getFloatTimeDomainData(checkBuffer);
  /* Check if any sample exceeds the noise floor */
  for (let i = 0; i < checkBuffer.length; i += 16) {
    if (Math.abs(checkBuffer[i]) > 0.001) return true;
  }
  return false;
}

/**
 * Returns an AnalyserNode with live audio data.
 * Checks both Strudel and shared analysers, returns whichever has signal.
 */
export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  /* Keep Strudel tap connected (even if not currently active) */
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
          }
        } catch { /* controller not ready */ }
      }

      /* Return Strudel analyser ONLY if it has actual audio data */
      if (strudelConnected && hasSignal(strudelAnalyser)) {
        return strudelAnalyser;
      }
    }
  } catch { /* Strudel not available */ }

  /* Shared masterAnalyser — Tone.js and WebAudio route here */
  try {
    return getMasterAnalyser();
  } catch { /* not ready */ }

  return null;
}

/** Reset connection state — call after evaluate. */
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
