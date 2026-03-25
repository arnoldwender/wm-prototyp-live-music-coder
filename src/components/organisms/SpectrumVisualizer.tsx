import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawSpectrum } from '../../lib/visualizers/spectrum';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getMasterAnalyser } from '../../lib/audio/context';

/** Real-time spectrum analyzer — frequency domain bars */
export function SpectrumVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);

  useEffect(() => {
    try {
      const analyserNode = getMasterAnalyser();
      analyzerRef.current = new AudioAnalyzer(analyserNode);
    } catch { /* init on first play */ }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!analyzerRef.current) {
      try {
        analyzerRef.current = new AudioAnalyzer(getMasterAnalyser());
      } catch { return; }
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
