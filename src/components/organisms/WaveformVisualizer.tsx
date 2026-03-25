import { useCallback, useRef } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawWaveform } from '../../lib/visualizers/waveform';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser } from '../../lib/audio/strudel-tap';

/** Real-time waveform display — taps into superdough's audio chain */
export function WaveformVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const connectingRef = useRef(false);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    /* Lazy-connect to superdough's analyser on each frame until successful */
    if (!analyzerRef.current && !connectingRef.current) {
      connectingRef.current = true;
      getStrudelAnalyser().then((node) => {
        if (node) analyzerRef.current = new AudioAnalyzer(node);
        connectingRef.current = false;
      });
      drawWaveform(ctx, width, height, new Float32Array(2048));
      return;
    }
    if (!analyzerRef.current) {
      drawWaveform(ctx, width, height, new Float32Array(2048));
      return;
    }
    const data = analyzerRef.current.getTimeDomainData();
    drawWaveform(ctx, width, height, data);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
