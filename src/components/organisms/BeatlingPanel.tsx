import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { BeatlingWorld } from '../../lib/beatlings';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser, getStrudelSampleRate } from '../../lib/audio/strudel-tap';
import { useAppStore } from '../../lib/store';

export function BeatlingPanel() {
  const worldRef = useRef<BeatlingWorld | null>(null);
  const bridgeConnected = useRef(false);
  const frameCount = useRef(0);
  const lastCodeRef = useRef('');

  /* Track typing: detect code changes in the active file */
  const files = useAppStore((s) => s.files);
  const activeCode = files.find((f) => f.active)?.code ?? '';
  const isTypingRef = useRef(false);

  /* Detect code changes as "typing" — stays true for 60 frames after last change */
  const typingCooldown = useRef(0);
  useEffect(() => {
    if (activeCode !== lastCodeRef.current) {
      lastCodeRef.current = activeCode;
      typingCooldown.current = 60; /* ~1 second of "typing" after each change */
      isTypingRef.current = true;
    }
  }, [activeCode]);

  useEffect(() => {
    worldRef.current = new BeatlingWorld(64, 64);
    return () => { worldRef.current?.dispose?.(); };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (!worldRef.current) return;
    frameCount.current++;

    /* Decay typing cooldown */
    if (typingCooldown.current > 0) {
      typingCooldown.current--;
      if (typingCooldown.current === 0) isTypingRef.current = false;
    }

    /* Try to connect audio bridge every 0.5s until successful */
    if (!bridgeConnected.current && frameCount.current % 30 === 0) {
      getStrudelAnalyser().then(async (node) => {
        if (node && worldRef.current) {
          const sr = await getStrudelSampleRate();
          worldRef.current.setAudioBridge(new AudioAnalyzer(node), sr);
          bridgeConnected.current = true;
        }
      }).catch(() => { /* Audio tap unavailable — ignore */ });
    }

    worldRef.current.update(isTypingRef.current);
    worldRef.current.draw(ctx, width, height, time);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
