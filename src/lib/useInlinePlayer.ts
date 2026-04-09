// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media
/* eslint-disable @typescript-eslint/no-explicit-any */
/* ──────────────────────────────────────────────────────────
   useInlinePlayer — shared hook for playing audio patterns
   inline (without navigating to the editor). Works for all
   3 engines: Strudel, Tone.js, WebAudio.
   ────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { EngineType } from '../types/engine';

export function useInlinePlayer() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const replRef = useRef<any>(null);

  const stopAll = useCallback(async () => {
    try { replRef.current?.stop() } catch { /* ok */ }
    try {
      const Tone = await import('tone');
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    } catch { /* ok */ }
    try {
      const { getSharedContext, getMasterGain, getMasterAnalyser } = await import('./audio/context');
      const mg = getMasterGain();
      const an = getMasterAnalyser();
      mg.disconnect();
      mg.connect(an);
      an.connect(getSharedContext().destination);
    } catch { /* ok */ }
    setPlayingId(null);
  }, []);

  /* Stop on unmount */
  useEffect(() => {
    return () => { stopAll() };
  }, [stopAll]);

  const play = useCallback(async (id: string, code: string, engine: EngineType) => {
    /* Stop previous */
    await stopAll();

    try {
      if (engine === 'strudel') {
        if (!replRef.current) {
          const { initStrudel } = await import('@strudel/web');
          replRef.current = await initStrudel();
          try {
            await replRef.current.evaluate(`samples('github:tidalcycles/Dirt-Samples/master')`, false);
          } catch { /* ok */ }
        }
        try {
          const { getAudioContext } = await import('@strudel/webaudio');
          const ctx = getAudioContext();
          if (ctx?.state === 'suspended') await ctx.resume();
        } catch { /* ok */ }
        await replRef.current.evaluate(code, true);

      } else if (engine === 'tonejs') {
        const Tone = await import('tone');
        const toneCtx = Tone.getContext().rawContext as AudioContext;
        if (toneCtx?.state === 'suspended') await (toneCtx as AudioContext).resume();
        await Function('Tone', `"use strict"; return (async () => { ${code} })()`)(Tone);

      } else if (engine === 'webaudio') {
        const { getSharedContext, getMasterGain, resumeContext } = await import('./audio/context');
        await resumeContext();
        const ctx = getSharedContext();
        const mg = getMasterGain();
        const ctxProxy = new Proxy(ctx, {
          get(target: any, prop: string) {
            if (prop === 'destination') return mg;
            const val = target[prop];
            return typeof val === 'function' ? val.bind(target) : val;
          }
        });
        /* Strip user's new AudioContext() and pass masterGain as alias for ctx.destination */
        const patchedCode = code
          .replace(/(?:const|let|var)\s+ctx\s*=\s*new\s+AudioContext\s*\([^)]*\)\s*;?/g, '')
          .replace(/new\s+AudioContext\s*\([^)]*\)/g, 'ctx');
        await Function('ctx', 'masterGain', `"use strict"; return (async () => { ${patchedCode} })()`)(ctxProxy, mg);
      }

      setPlayingId(id);
    } catch (err) {
      console.error('[InlinePlayer] Play failed:', err);
      setPlayingId(null);
    }
  }, [stopAll]);

  return { playingId, play, stop: stopAll };
}
