/* Tap into superdough's audio chain to get an AnalyserNode.
 * Strudel uses its own AudioContext via superdough — our shared context is separate.
 * This module bridges the gap by creating an analyser in superdough's context. */

let cachedAnalyser: AnalyserNode | null = null;
let cachedCtx: AudioContext | null = null;

/** Get an AnalyserNode connected to superdough's audio output.
 * Returns null if superdough isn't loaded yet. */
export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  if (cachedAnalyser && cachedCtx?.state !== 'closed') return cachedAnalyser;

  try {
    const { getAudioContext, getCompressor, gainNode } = await import('superdough');
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'closed') return null;

    cachedCtx = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    /* Connect to superdough's compressor or gain node */
    try {
      const comp = getCompressor();
      if (comp) { comp.connect(analyser); cachedAnalyser = analyser; return analyser; }
    } catch { /* no compressor */ }

    try {
      const gain = gainNode();
      if (gain) { gain.connect(analyser); cachedAnalyser = analyser; return analyser; }
    } catch { /* no gain */ }

    /* Fallback: connect to destination (won't get audio but at least won't crash) */
    cachedAnalyser = analyser;
    return analyser;
  } catch {
    return null;
  }
}

/** Get superdough's AudioContext sample rate */
export async function getStrudelSampleRate(): Promise<number> {
  try {
    const { getAudioContext } = await import('superdough');
    return getAudioContext()?.sampleRate ?? 44100;
  } catch {
    return 44100;
  }
}
