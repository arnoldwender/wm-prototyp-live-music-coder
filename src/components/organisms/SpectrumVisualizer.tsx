import { useCallback, useRef } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawSpectrum } from '../../lib/visualizers/spectrum';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser } from '../../lib/audio/strudel-tap';

/** Real-time spectrum analyzer — taps into superdough's audio chain */
export function SpectrumVisualizer() {
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
      drawSpectrum(ctx, width, height, new Float32Array(1024));
      return;
    }
    if (!analyzerRef.current) {
      drawSpectrum(ctx, width, height, new Float32Array(1024));
      return;
    }
    const data = analyzerRef.current.getFrequencyData();
    drawSpectrum(ctx, width, height, data);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
