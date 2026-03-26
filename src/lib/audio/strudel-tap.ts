/* Universal audio tap for visualization — works for ALL engines.
 *
 * Strategy priority:
 * 1. Strudel: tap superdough's destinationGain (Strudel's own AudioContext)
 * 2. Tone.js: tap Tone's destination via its own AudioContext
 * 3. Shared context: tap masterAnalyser (WebAudio engine routes through here)
 *
 * Never caches a "miss" — retries Strudel/Tone connection every call. */

import { getMasterAnalyser } from './context';

let strudelAnalyser: AnalyserNode | null = null;
let strudelConnected = false;

let toneAnalyser: AnalyserNode | null = null;
let toneConnected = false;

/**
 * Returns an AnalyserNode with live audio data for visualization.
 */
export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  /* Strategy 1: Strudel superdough controller */
  try {
    const sd = await import('@strudel/webaudio');
    const ctx = sd.getAudioContext();
    if (ctx && ctx.state === 'running') {
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

      if (strudelConnected) return strudelAnalyser;
    }
  } catch { /* Strudel not available */ }

  /* Strategy 2: Tone.js — tap into Tone's own AudioContext destination */
  try {
    const Tone = await import('tone');
    const toneCtx = Tone.getContext().rawContext as AudioContext;
    if (toneCtx && toneCtx.state === 'running') {
      if (!toneAnalyser || toneAnalyser.context !== toneCtx) {
        toneAnalyser = toneCtx.createAnalyser();
        toneAnalyser.fftSize = 2048;
        toneAnalyser.smoothingTimeConstant = 0.85;
        toneConnected = false;
      }

      if (!toneConnected) {
        try {
          /* Tap Tone's master output — Tone.getDestination() returns the master output node */
          const dest = Tone.getDestination();
          const rawOutput = (dest as any).output || (dest as any)._gainNode;
          if (rawOutput && rawOutput.connect) {
            rawOutput.connect(toneAnalyser);
            toneConnected = true;
          } else {
            /* Fallback: connect via the raw context destination's input */
            const masterGain = toneCtx.createGain();
            masterGain.connect(toneCtx.destination);
            masterGain.connect(toneAnalyser);
            /* Can't easily intercept existing connections, but the analyser
             * will at least be in the right context for future connections */
          }
        } catch { /* Tone destination not ready */ }
      }

      if (toneConnected) return toneAnalyser;
    }
  } catch { /* Tone.js not loaded — that's fine */ }

  /* Strategy 3: Shared context masterAnalyser — WebAudio engine routes here */
  try {
    return getMasterAnalyser();
  } catch { /* shared context not ready */ }

  return null;
}

/** Reset all connection states — call after code re-evaluation. */
export function resetStrudelTap(): void {
  strudelConnected = false;
  strudelAnalyser = null;
  toneConnected = false;
  toneAnalyser = null;
}

export async function getStrudelSampleRate(): Promise<number> {
  try {
    const { getAudioContext } = await import('@strudel/webaudio');
    return getAudioContext()?.sampleRate ?? 44100;
  } catch {
    return 44100;
  }
}
