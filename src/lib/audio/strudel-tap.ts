/* Tap into superdough's audio output for visualization.
 * Reconnects on every call because superdough recreates nodes dynamically.
 * The analyser is created once but reconnected to the latest audio chain. */

let analyser: AnalyserNode | null = null;

export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  try {
    const sd = await import('superdough');
    const ctx = sd.getAudioContext();
    if (!ctx || ctx.state === 'closed') return null;

    /* Create analyser once in superdough's AudioContext */
    if (!analyser || analyser.context !== ctx) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
    }

    /* Reconnect EVERY call — superdough recreates its audio chain dynamically.
     * Web Audio silently ignores duplicate connections, so this is safe. */
    try {
      const controller = sd.getSuperdoughAudioController();
      if (controller?.destinationGain) {
        controller.destinationGain.connect(analyser);
        return analyser;
      }
    } catch { /* controller not ready */ }

    try {
      const comp = sd.getCompressor();
      if (comp) { comp.connect(analyser); return analyser; }
    } catch { /* no compressor */ }

    try {
      const gain = sd.gainNode();
      if (gain) { gain.connect(analyser); return analyser; }
    } catch { /* no gain */ }

    /* Return analyser even if not connected — visualizer will show flat line
     * instead of crashing. Next call will try connecting again. */
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
