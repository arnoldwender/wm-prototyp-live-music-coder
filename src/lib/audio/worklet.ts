/* ──────────────────────────────────────────────────────────
   AudioWorklet placeholder — infrastructure for custom audio
   processing. In v1, standard Web Audio nodes are used. This
   file provides the foundation for adding custom AudioWorklet
   processors in future versions (e.g., grain synthesis,
   spectral effects, custom analyzers).
   ────────────────────────────────────────────────────────── */

/** Register a custom AudioWorklet processor module with the context.
 * The processorUrl should point to a JS file exporting a class
 * that extends AudioWorkletProcessor. */
export async function registerWorklet(
  context: AudioContext,
  name: string,
  processorUrl: string,
): Promise<void> {
  try {
    await context.audioWorklet.addModule(processorUrl);
    console.log(`[AudioWorklet] Registered processor: ${name}`);
  } catch (err) {
    console.warn(`[AudioWorklet] Failed to register ${name}:`, err);
  }
}

/** Check if AudioWorklet is supported in the current browser.
 * Falls back gracefully — callers should use ScriptProcessorNode
 * as a polyfill when this returns false. */
export function isWorkletSupported(): boolean {
  return typeof AudioWorkletNode !== 'undefined';
}
