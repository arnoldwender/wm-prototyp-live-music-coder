import { useCallback, useRef } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawSpectrum } from '../../lib/visualizers/spectrum';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser } from '../../lib/audio/strudel-tap';

export function SpectrumVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const lastNodeRef = useRef<AnalyserNode | null>(null);
  const frameCount = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    frameCount.current++;
    if (frameCount.current % 30 === 0) {
      getStrudelAnalyser().then((node) => {
        /* Only create a new AudioAnalyzer when the underlying node changes */
        if (node && node !== lastNodeRef.current) {
          lastNodeRef.current = node;
          analyzerRef.current = new AudioAnalyzer(node);
        }
      }).catch(() => { /* Audio tap unavailable — ignore */ });
    }
    if (analyzerRef.current) {
      drawSpectrum(ctx, width, height, analyzerRef.current.getFrequencyData());
    } else {
      /* Silence = -100 dB (Float32Array defaults to 0 which is max amplitude) */
      drawSpectrum(ctx, width, height, new Float32Array(1024).fill(-100));
    }
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
