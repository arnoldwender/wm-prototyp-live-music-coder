/* BeatlingPanel — renders the Beatling ecosystem.
 * Connects to superdough's audio chain via strudel-tap helper
 * to analyze audio and drive creature behavior. */

import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { BeatlingWorld } from '../../lib/beatlings';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser, getStrudelSampleRate } from '../../lib/audio/strudel-tap';

export function BeatlingPanel() {
  const worldRef = useRef<BeatlingWorld | null>(null);
  const bridgeConnected = useRef(false);
  const connectingRef = useRef(false);

  useEffect(() => {
    worldRef.current = new BeatlingWorld(64, 64);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (!worldRef.current) return;

    /* Lazy-connect to superdough's analyser via shared helper */
    if (!bridgeConnected.current && !connectingRef.current) {
      connectingRef.current = true;
      getStrudelAnalyser().then(async (node) => {
        if (node && worldRef.current) {
          const sr = await getStrudelSampleRate();
          worldRef.current.setAudioBridge(new AudioAnalyzer(node), sr);
          bridgeConnected.current = true;
        }
        connectingRef.current = false;
      });
    }

    worldRef.current.update(false);
    worldRef.current.draw(ctx, width, height, time);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
