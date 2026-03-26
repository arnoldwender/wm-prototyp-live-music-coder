import { useCallback, useRef, useEffect } from 'react';
import { CanvasVisualizer } from '../atoms/CanvasVisualizer';
import { BeatlingWorld } from '../../lib/beatlings';
import { AudioAnalyzer } from '../../lib/audio/analyzer';
import { getStrudelAnalyser, getStrudelSampleRate } from '../../lib/audio/strudel-tap';
import { useAppStore } from '../../lib/store';

export function BeatlingPanel() {
  const worldRef = useRef<BeatlingWorld | null>(null);
  const frameCount = useRef(0);
  const lastCodeRef = useRef('');
  const lastNodeRef = useRef<AnalyserNode | null>(null);

  /* Track typing: detect code changes in the active file */
  const files = useAppStore((s) => s.files);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const activeCode = files.find((f) => f.active)?.code ?? '';
  const isTypingRef = useRef(false);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  /* Detect code changes as "typing" — stays true for 60 frames after last change */
  const typingCooldown = useRef(0);
  useEffect(() => {
    if (activeCode !== lastCodeRef.current) {
      lastCodeRef.current = activeCode;
      typingCooldown.current = 60;
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

    /* Reconnect audio bridge every 60 frames (~1s) — superdough recreates
     * its audio chain on every evaluate(), so we must keep reconnecting.
     * Only create a new AudioAnalyzer when the AnalyserNode changes. */
    if (frameCount.current % 60 === 0) {
      getStrudelAnalyser().then(async (node) => {
        if (node && worldRef.current && node !== lastNodeRef.current) {
          lastNodeRef.current = node;
          const sr = await getStrudelSampleRate();
          worldRef.current.setAudioBridge(new AudioAnalyzer(node), sr);
        }
      }).catch(() => { /* Audio tap unavailable */ });
    }

    worldRef.current.update(isTypingRef.current, isPlayingRef.current);
    worldRef.current.draw(ctx, width, height, time);

    /* Sync creature stats to store every 30 frames for StatusBar + BrainPanel */
    if (frameCount.current % 30 === 0) {
      const creatures = worldRef.current.getCreatures();
      const store = useAppStore.getState();
      store.setCreatureCount(creatures.length);
      store.setCreatureStats(creatures.map((c: any) => ({
        id: c.id,
        species: c.species,
        stage: c.stage,
        neuronCount: c.brain?.neurons?.size ?? 0,
        synapseCount: c.brain?.synapses?.size ?? 0,
        intelligence: c.brain?.intelligence ?? 0,
        emotionalState: c.brain?.getEmotionalState?.() ?? 0,
        phi: c.phi ?? 0,
        totalFirings: c.brain?.totalFirings ?? 0,
        isSleeping: c.isSleeping ?? false,
        xpTotal: (c.xp?.audio ?? 0) + (c.xp?.complexity ?? 0) + (c.xp?.interaction ?? 0),
      })));
    }
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <CanvasVisualizer draw={draw} />
    </div>
  );
}
