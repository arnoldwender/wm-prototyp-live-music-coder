/* Tap into superdough's audio chain for visualization.
 * Reconnects every call to handle superdough's dynamic node creation. */

let analyserNode: AnalyserNode | null = null;
let lastConnectAttempt = 0;

/** Get an AnalyserNode that receives superdough's audio output.
 * Retries connection every 500ms if not connected. */
export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  const now = Date.now();

  /* Don't spam connection attempts — wait 500ms between tries */
  if (analyserNode && now - lastConnectAttempt < 500) return analyserNode;
  lastConnectAttempt = now;

  try {
    const superdough = await import('superdough');
    const ctx = superdough.getAudioContext();
    if (!ctx || ctx.state === 'closed' || ctx.state === 'suspended') return null;

    /* Create analyser if we don't have one yet */
    if (!analyserNode) {
      analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.85;
    }

    /* Try to connect to the audio chain every time — superdough
     * creates nodes lazily, so they may not exist on first call.
     * Reconnecting is safe (Web Audio ignores duplicate connections). */
    let connected = false;

    try {
      const comp = superdough.getCompressor();
      if (comp) {
        comp.connect(analyserNode);
        connected = true;
      }
    } catch { /* compressor not available */ }

    if (!connected) {
      try {
        const gain = superdough.gainNode();
        if (gain) {
          gain.connect(analyserNode);
          connected = true;
        }
      } catch { /* gain not available */ }
    }

    return analyserNode;
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

/** Force reconnection on next call */
export function resetStrudelTap(): void {
  lastConnectAttempt = 0;
}
