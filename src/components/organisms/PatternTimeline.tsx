import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawTimeline } from '../../lib/visualizers/timeline';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getMasterAnalyser } from '../../lib/audio/context';
import { useAppStore } from '../../lib/store';

/** Pattern timeline — scrolling beat grid with playhead and level indicator */
export function PatternTimeline() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const bpm = useAppStore((s) => s.bpm);

  useEffect(() => {
    try {
      analyzerRef.current = new AudioAnalyzer(getMasterAnalyser());
    } catch { /* init on first play */ }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    let rmsLevel = 0;
    if (!analyzerRef.current) {
      try {
        analyzerRef.current = new AudioAnalyzer(getMasterAnalyser());
      } catch { /* ok */ }
    }
    if (analyzerRef.current) {
      rmsLevel = analyzerRef.current.getRmsLevel();
    }
    drawTimeline(ctx, width, height, bpm, time, rmsLevel);
  }, [bpm]);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
