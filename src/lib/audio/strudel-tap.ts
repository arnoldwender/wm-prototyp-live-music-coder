/* Tap into superdough's master output via getSuperdoughAudioController().
 * The controller's destinationGain is the LAST node before ctx.destination —
 * connecting an analyser here captures ALL audio output from Strudel. */

let analyser: AnalyserNode | null = null;
let connected = false;

export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  /* Already connected and working */
  if (analyser && connected) return analyser;

  try {
    const sd = await import('superdough');
    const ctx = sd.getAudioContext();
    if (!ctx || ctx.state === 'closed' || ctx.state === 'suspended') return null;

    /* Create analyser once */
    if (!analyser) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
    }

    /* Connect to the master destinationGain — the node right before ctx.destination.
     * getSuperdoughAudioController() returns the audio controller instance. */
    try {
      const controller = sd.getSuperdoughAudioController();
      if (controller?.destinationGain) {
        controller.destinationGain.connect(analyser);
        connected = true;
        console.log('[strudel-tap] Connected to destinationGain');
        return analyser;
      }
    } catch { /* controller not available yet */ }

    /* Fallback: try compressor */
    try {
      const comp = sd.getCompressor();
      if (comp) { comp.connect(analyser); connected = true; return analyser; }
    } catch {}

    /* Fallback: try gainNode */
    try {
      const gain = sd.gainNode();
      if (gain) { gain.connect(analyser); connected = true; return analyser; }
    } catch {}

    return analyser;
  } catch {
    return null;
  }
}

export async function getStrudelSampleRate(): Promise<number> {
  try {
    const { getAudioContext } = await import('superdough');
    return getAudioContext()?.sampleRate ?? 44100;
  } catch {
    return 44100;
  }
}

export function resetStrudelTap(): void {
  connected = false;
}
