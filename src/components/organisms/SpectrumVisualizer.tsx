/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { useCallback, useRef } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { drawSpectrum } from '../../lib/visualizers/spectrum';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser } from '../../lib/audio/strudel-tap';

/* Module-level constant — avoids a Float32Array allocation + fill every RAF
   frame when no analyser is connected yet. */
const EMPTY_SPECTRUM = new Float32Array(1024).fill(-100);

export function SpectrumVisualizer() {
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const lastNodeRef = useRef<AnalyserNode | null>(null);
  const frameCount = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    frameCount.current++;

    /* Reconnect every 15 frames — aggressive for reliability */
    if (frameCount.current % 15 === 0 || frameCount.current <= 3) {
      getStrudelAnalyser().then((node) => {
        if (node && node !== lastNodeRef.current) {
          lastNodeRef.current = node;
          analyzerRef.current = new AudioAnalyzer(node);
        }
      }).catch(() => {});
    }

    if (analyzerRef.current) {
      drawSpectrum(ctx, width, height, analyzerRef.current.getFrequencyData());
    } else {
      drawSpectrum(ctx, width, height, EMPTY_SPECTRUM);
    }
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
