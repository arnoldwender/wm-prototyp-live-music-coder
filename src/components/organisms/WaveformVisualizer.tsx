import { useCallback, useRef } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawWaveform } from '../../lib/visualizers/waveform';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser } from '../../lib/audio/strudel-tap';

export function WaveformVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const lastNodeRef = useRef<AnalyserNode | null>(null);
  const frameCount = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    frameCount.current++;

    /* Reconnect every 15 frames (~250ms) — aggressive reconnection for reliability */
    if (frameCount.current % 15 === 0 || frameCount.current <= 3) {
      getStrudelAnalyser().then((node) => {
        if (node && node !== lastNodeRef.current) {
          lastNodeRef.current = node;
          analyzerRef.current = new AudioAnalyzer(node);
        }
      }).catch(() => {});
    }

    if (analyzerRef.current) {
      drawWaveform(ctx, width, height, analyzerRef.current.getTimeDomainData());
    } else {
      drawWaveform(ctx, width, height, new Float32Array(2048));
    }
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
