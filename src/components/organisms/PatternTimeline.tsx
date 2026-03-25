import { useCallback, useRef } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawTimeline } from '../../lib/visualizers/timeline';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser } from '../../lib/audio/strudel-tap';
import { useAppStore } from '../../lib/store';

export function PatternTimeline() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const frameCount = useRef(0);
  const bpm = useAppStore((s) => s.bpm);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    frameCount.current++;
    if (frameCount.current % 60 === 0) {
      getStrudelAnalyser().then((node) => {
        if (node) analyzerRef.current = new AudioAnalyzer(node);
      });
    }
    const rmsLevel = analyzerRef.current?.getRmsLevel() ?? 0;
    drawTimeline(ctx, width, height, bpm, time, rmsLevel);
  }, [bpm]);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
