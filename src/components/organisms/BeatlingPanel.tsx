import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { BeatlingWorld } from '../../lib/beatlings';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser, getStrudelSampleRate } from '../../lib/audio/strudel-tap';

export function BeatlingPanel() {
  const worldRef = useRef<BeatlingWorld | null>(null);
  const bridgeConnected = useRef(false);
  const frameCount = useRef(0);

  useEffect(() => {
    worldRef.current = new BeatlingWorld(64, 64);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (!worldRef.current) return;
    frameCount.current++;

    /* Retry connection every 60 frames until bridge is connected */
    if (!bridgeConnected.current && frameCount.current % 60 === 0) {
      getStrudelAnalyser().then(async (node) => {
        if (node && worldRef.current) {
          const sr = await getStrudelSampleRate();
          worldRef.current.setAudioBridge(new AudioAnalyzer(node), sr);
          bridgeConnected.current = true;
        }
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
