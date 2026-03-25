/* BeatlingPanel — renders the Beatling ecosystem.
 * Connects to superdough's audio chain (Strudel's audio output)
 * to analyze audio and drive creature behavior. */

import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { BeatlingWorld } from '../../lib/beatlings';
import { AudioAnalyzer } from '../../lib/audio/analyzer';

export function BeatlingPanel() {
  const worldRef = useRef<BeatlingWorld | null>(null);
  const bridgeConnected = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    worldRef.current = new BeatlingWorld(64, 64);
  }, []);

  /* Try to connect to superdough's audio chain */
  const tryConnectBridge = useCallback(async () => {
    if (bridgeConnected.current || !worldRef.current) return;

    try {
      /* Import superdough — it shares the AudioContext with Strudel */
      const { getAudioContext, getCompressor, gainNode } = await import('superdough');
      const ctx = getAudioContext();

      if (!ctx || ctx.state === 'closed') return;

      /* Create our analyser in Strudel's AudioContext */
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      /* Connect to superdough's audio chain.
       * gainNode() is the master gain before destination.
       * getCompressor() is the compressor in the chain.
       * We tap into whichever is available. */
      try {
        const compressor = getCompressor();
        if (compressor) {
          compressor.connect(analyser);
        }
      } catch {
        try {
          const gain = gainNode();
          if (gain) {
            gain.connect(analyser);
          }
        } catch { /* can't tap audio chain */ }
      }

      worldRef.current.setAudioBridge(new AudioAnalyzer(analyser), ctx.sampleRate);
      bridgeConnected.current = true;
      console.log('[BeatlingPanel] Connected to superdough audio chain');
    } catch {
      /* superdough not loaded yet — will retry */
    }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (!worldRef.current) return;

    /* Try connecting on each frame until successful */
    if (!bridgeConnected.current) {
      tryConnectBridge();
    }

    worldRef.current.update(false);
    worldRef.current.draw(ctx, width, height, time);
  }, [tryConnectBridge]);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
