// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/* Universal audio tap for visualization — works for ALL engines.
 *
 * Priority: Strudel superdough (if connected) > shared masterAnalyser.
 * Once Strudel connects, always returns it (Strudel audio is bursty —
 * signal detection between beats would cause flickering). */

import { getMasterAnalyser } from './context';

let strudelAnalyser: AnalyserNode | null = null;
let strudelConnected = false;

/**
 * Returns an AnalyserNode with live audio data.
 * Strudel tap if connected, otherwise shared masterAnalyser.
 */
export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  /* Try Strudel's superdough controller */
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

      /* Once connected, always return Strudel analyser — don't check signal
       * (audio is bursty between beats, signal check causes flickering) */
      if (strudelConnected) return strudelAnalyser;
    }
  } catch { /* Strudel not available */ }

  /* Fallback: shared masterAnalyser (Tone.js + WebAudio route here) */
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
