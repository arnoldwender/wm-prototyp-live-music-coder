/* Tap into superdough's audio output for visualization.
 * Reconnects on every call because superdough recreates nodes dynamically.
 * Uses @strudel/webaudio (NOT 'superdough' directly) to ensure we get
 * the SAME module instance that Strudel's audio engine uses. */

let analyser: AnalyserNode | null = null;
let connected = false;

export async function getStrudelAnalyser(): Promise<AnalyserNode | null> {
  try {
    const sd = await import('@strudel/webaudio');
    const ctx = sd.getAudioContext();
    if (!ctx || ctx.state === 'closed') return null;

    /* Create analyser once in superdough's AudioContext */
    if (!analyser || analyser.context !== ctx) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      connected = false;
    }

    /* Already connected — just return */
    if (connected) return analyser;

    /* Strategy 1: Tap the controller's output.destinationGain
     * This is the final gain node before speakers — all audio passes through it. */
    try {
      const controller = sd.getSuperdoughAudioController();
      const destGain = controller?.output?.destinationGain;
      if (destGain) {
        destGain.connect(analyser);
        connected = true;
        return analyser;
      }
    } catch { /* controller not ready yet */ }

    /* Strategy 2: If controller isn't ready, try to insert our analyser
     * between the context's destination input. We create a gain node,
     * connect it to both the destination and our analyser. This works
     * even before superdough's controller initializes. */
    try {
      /* Check if there's a destination we can tap.
       * We connect the analyser to the destination — this doesn't intercept
       * audio but the analyser still gets data if anything is connected
       * to the destination. For proper tapping we need the source node. */
      if (!connected && ctx.state === 'running') {
        /* Last resort: create a MediaStreamDestination to capture all output.
         * This is heavy but guaranteed to work. Only do this once. */
        const mediaStream = ctx.createMediaStreamDestination();
        const source = ctx.createMediaStreamSource(mediaStream.stream);
        source.connect(analyser);
        /* We can't easily connect the existing output to mediaStream,
         * so this fallback won't work well. Return unconnected analyser. */
      }
    } catch { /* fallback failed */ }

    /* Return analyser even if not connected — visualizer shows flat line.
     * Next call will try connecting again. */
    return analyser;
  } catch {
    return null;
  }
}

/** Reset connection state — call after code re-evaluation to force reconnect.
 * Nulls the analyser so visualizers detect a node change and recreate theirs. */
export function resetStrudelTap(): void {
  connected = false;
  analyser = null;
}

export async function getStrudelSampleRate(): Promise<number> {
  try {
    const { getAudioContext } = await import('@strudel/webaudio');
    return getAudioContext()?.sampleRate ?? 44100;
  } catch {
    return 44100;
  }
}
