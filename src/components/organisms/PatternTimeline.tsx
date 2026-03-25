import { useCallback, useRef } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawTimeline } from '../../lib/visualizers/timeline';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser } from '../../lib/audio/strudel-tap';
import { useAppStore } from '../../lib/store';

/** Pattern timeline — scrolling beat grid with playhead and level indicator */
export function PatternTimeline() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const connectingRef = useRef(false);
  const bpm = useAppStore((s) => s.bpm);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    let rmsLevel = 0;
    /* Lazy-connect to superdough's analyser on each frame until successful */
    if (!analyzerRef.current && !connectingRef.current) {
      connectingRef.current = true;
      getStrudelAnalyser().then((node) => {
        if (node) analyzerRef.current = new AudioAnalyzer(node);
        connectingRef.current = false;
      });
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
