/* ──────────────────────────────────────────────────────────
   BeatlingPanel — organism that renders the Beatling
   ecosystem inside a CanvasVisualizer. Lazily connects
   the audio bridge when AudioContext becomes available.
   ────────────────────────────────────────────────────────── */

import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { BeatlingWorld } from '../../lib/beatlings';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getMasterAnalyser, getSharedContext } from '../../lib/audio/context';

/** The Beatling ecosystem visualizer panel */
export function BeatlingPanel() {
  const worldRef = useRef<BeatlingWorld | null>(null);

  /* Create the world once and try to connect audio bridge */
  useEffect(() => {
    worldRef.current = new BeatlingWorld(64, 64);
    try {
      const analyser = getMasterAnalyser();
      const ctx = getSharedContext();
      worldRef.current.setAudioBridge(new AudioAnalyzer(analyser), ctx.sampleRate);
    } catch { /* AudioContext not yet created — will retry in draw */ }
  }, []);

  /* Draw callback — runs every animation frame via CanvasVisualizer */
  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (!worldRef.current) return;

    /* Try to set up audio bridge if not yet connected */
    try {
      const analyser = getMasterAnalyser();
      const audioCtx = getSharedContext();
      worldRef.current.setAudioBridge(new AudioAnalyzer(analyser), audioCtx.sampleRate);
    } catch { /* AudioContext not ready yet */ }

    worldRef.current.update(false);
    worldRef.current.draw(ctx, width, height, time);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
