import { useCallback, useRef } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawWaveform } from '../../lib/visualizers/waveform';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser } from '../../lib/audio/strudel-tap';

/** Real-time waveform — reconnects to superdough every 60 frames if no signal */
export function WaveformVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const frameCount = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    frameCount.current++;

    /* Try to (re)connect every 60 frames (~1 second) */
    if (frameCount.current % 60 === 0) {
      getStrudelAnalyser().then((node) => {
        if (node) analyzerRef.current = new AudioAnalyzer(node);
      });
    }

    if (!analyzerRef.current) {
      drawWaveform(ctx, width, height, new Float32Array(2048));
      return;
    }
    drawWaveform(ctx, width, height, analyzerRef.current.getTimeDomainData());
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
