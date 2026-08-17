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
    /* Skip suspended contexts — autoplay policy may create a sleeping context
     * before the user interacts. Connecting on a suspended context locks in a
     * silent tap; wait until audio is actually running. */
    if (ctx && ctx.state === 'running') {
      if (!strudelAnalyser || strudelAnalyser.context !== ctx) {
        strudelAnalyser = ctx.createAnalyser();
        strudelAnalyser.fftSize = 2048;
        strudelAnalyser.smoothingTimeConstant = 0.85;
        strudelConnected = false;
      }

      if (!strudelConnected) {
        try {
          /* Try multiple paths to find the audio output node.
           * Superdough's controller only initializes AFTER the first note
           * plays, so destinationGain may not exist immediately. */
          const controller = sd.getSuperdoughAudioController();

          /* Path 1: controller.output.destinationGain (standard) */
          let tapNode = controller?.output?.destinationGain;

          /* Path 2: controller.destinationGain (some versions) */
          if (!tapNode) tapNode = (controller as any)?.destinationGain;

          /* Path 3: controller.master or controller.out */
          if (!tapNode) tapNode = (controller as any)?.master ?? (controller as any)?.out;

          /* NOTE: No Path 4. AudioDestinationNode is a terminal sink — connecting
           * FROM it to a GainNode produces no audio flow and silently locks
           * strudelConnected=true, breaking all visualizers. */

          if (tapNode && strudelAnalyser) {
            tapNode.connect(strudelAnalyser);
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

/**
 * Returns superdough's output node, or null if it has not initialised yet.
 *
 * superdough terminates at `audioContext.destination` rather than at the app's
 * masterGain, so anything that needs Strudel's signal — the recorder, an export
 * — has to tap this node directly. The controller only exists after the first
 * note plays, hence the null return rather than a throw.
 *
 * The three lookup paths mirror getStrudelAnalyser above: superdough has moved
 * this node between releases. There is deliberately no fallback to
 * `ctx.destination`: an AudioDestinationNode is a terminal sink, so connecting
 * FROM it yields no signal while looking like success.
 */
export async function getStrudelOutputNode(): Promise<AudioNode | null> {
  try {
    const sd = await import('@strudel/webaudio');
    const controller = sd.getSuperdoughAudioController();
    const node =
      controller?.output?.destinationGain ??
      (controller as unknown as { destinationGain?: AudioNode })?.destinationGain ??
      (controller as unknown as { master?: AudioNode; out?: AudioNode })?.master ??
      (controller as unknown as { out?: AudioNode })?.out;
    return (node as AudioNode | undefined) ?? null;
  } catch {
    return null;
  }
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
