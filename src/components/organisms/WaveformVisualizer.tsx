import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawWaveform } from '../../lib/visualizers/waveform';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getMasterAnalyser } from '../../lib/audio/context';

/** Real-time waveform display — reads from master analyser */
export function WaveformVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);

  useEffect(() => {
    try {
      const analyserNode = getMasterAnalyser();
      analyzerRef.current = new AudioAnalyzer(analyserNode);
    } catch {
      /* AudioContext not yet created — will init on first play */
    }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!analyzerRef.current) {
      try {
        const analyserNode = getMasterAnalyser();
        analyzerRef.current = new AudioAnalyzer(analyserNode);
      } catch {
        return;
      }
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
