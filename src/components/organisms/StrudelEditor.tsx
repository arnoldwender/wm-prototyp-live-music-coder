/* eslint-disable @typescript-eslint/no-explicit-any */
/* Strudel editor — integrates @strudel/codemirror for slider widgets,
 * pattern highlighting, and full REPL features alongside custom CM6. */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { useAppStore } from '../../lib/store';
import { getBaseExtensions } from '../../lib/editor/setup';
import { getEngineExtensions } from '../../lib/editor/extensions';
import { resetStrudelTap } from '../../lib/audio/strudel-tap';
import { Button, Tooltip } from '../atoms';
import { Play, Square, Loader2 } from 'lucide-react';

export function StrudelEditor() {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const replRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const strudelExtRef = useRef<any>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const files = useAppStore((s) => s.files);
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const activeFile = files.find((f) => f.active);

  /* Initialize Strudel REPL + load @strudel/codemirror extensions */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        /* Load Strudel REPL */
        const { initStrudel } = await import('@strudel/web');
        const repl = await initStrudel();
        if (!mounted) return;
        replRef.current = repl;
        /* Expose REPL globally for pianoroll and other visualizers */
        (window as any).__strudelRepl = repl;

        /* Load Dirt-Samples — try multiple approaches */
        try {
          await repl.evaluate(`samples('github:tidalcycles/Dirt-Samples/master')`, false);
          console.log('[StrudelEditor] Samples loaded via REPL evaluate');
        } catch (e1) {
          console.warn('[StrudelEditor] REPL samples failed, trying direct import:', e1);
          try {
            const { samples } = await import('@strudel/webaudio');
            await samples('github:tidalcycles/Dirt-Samples/master');
            console.log('[StrudelEditor] Samples loaded via direct import');
          } catch (e2) {
            console.error('[StrudelEditor] All sample loading methods failed:', e2);
          }
        }

        /* Load Strudel CM6 extensions (sliders, highlighting, widgets) */
        try {
          const strudelCM = await import('@strudel/codemirror');
          strudelExtRef.current = strudelCM;
        } catch (err) {
          console.warn('[StrudelEditor] @strudel/codemirror extensions not available:', err);
        }

        setReady(true);
        console.log('[StrudelEditor] Ready');
      } catch (err) {
        console.error('[StrudelEditor] Init failed:', err);
        setEvalError(`Init failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
    return () => {
      mounted = false;
      replRef.current?.stop();
    };
  }, []);

  /* Create CM6 editor with Strudel extensions */
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;
    viewRef.current?.destroy();

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        updateFileCode(activeFile.id, update.state.doc.toString());
      }
    });

    /* Ctrl+Enter / Cmd+Enter keybinding to evaluate code */
    const evalKeymap = keymap.of([{
      key: 'Ctrl-Enter',
      mac: 'Cmd-Enter',
      run: () => {
        handleEvaluate();
        return true;
      },
    }]);

    /* Build extension list — add Strudel slider/highlight/widget plugins when available */
    const extensions = [
      ...getBaseExtensions(),
      ...getEngineExtensions(activeFile.engine),
      updateListener,
      evalKeymap,
    ];

    /* Add Strudel-specific CM6 extensions if loaded */
    const strudelCM = strudelExtRef.current;
    if (strudelCM) {
      try {
        /* Slider widget plugin — allows slider(value, min, max, step) in code */
        if (strudelCM.sliderPlugin) extensions.push(strudelCM.sliderPlugin);
        /* Widget plugin — supports other inline widgets */
        if (strudelCM.widgetPlugin) extensions.push(strudelCM.widgetPlugin);
        /* Pattern highlighting extension — marks active haps in code */
        if (strudelCM.highlightExtension) extensions.push(strudelCM.highlightExtension);
      } catch (err) {
        console.warn('[StrudelEditor] Failed to add Strudel CM extensions:', err);
      }
    }

    const state = EditorState.create({
      doc: activeFile.code,
      extensions,
    });

    viewRef.current = new EditorView({ state, parent: editorRef.current });
    return () => { viewRef.current?.destroy(); viewRef.current = null; };
  }, [activeFile?.id, activeFile?.engine, ready]);

  /* Sync external store code changes into CM6 */
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !activeFile) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== activeFile.code) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: activeFile.code },
      });
    }
  }, [activeFile?.code]);

  /* Highlight + slider update loop — uses Strudel's native highlighting when available */
  useEffect(() => {
    if (!isPlaying) {
      /* Clear highlights when stopped */
      const view = viewRef.current;
      const strudelCM = strudelExtRef.current;
      if (view && strudelCM?.setMiniLocations) {
        try { strudelCM.setMiniLocations(view, []); } catch { /* ignore */ }
      }
      return;
    }

    let running = true;
    const tick = () => {
      if (!running) return;
      const view = viewRef.current;
      const repl = replRef.current;
      const strudelCM = strudelExtRef.current;

      if (view && repl?.scheduler) {
        try {
          /* Update Strudel's native mini-notation highlighting */
          if (strudelCM?.updateMiniLocations && repl.state?.miniLocations) {
            strudelCM.updateMiniLocations(view, repl.scheduler.now(), repl.state.miniLocations);
          }

          /* Update slider widget values from the REPL state */
          if (strudelCM?.updateSliderWidgets && strudelCM?.sliderValues) {
            strudelCM.updateSliderWidgets(view, strudelCM.sliderValues);
          }

          /* Update other inline widgets */
          if (strudelCM?.updateWidgets) {
            strudelCM.updateWidgets(view);
          }
        } catch { /* ignore during pattern transitions */ }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const handleEvaluate = useCallback(async () => {
    if (!replRef.current) { setEvalError('Not ready'); return; }
    const view = viewRef.current;
    if (!view) return;

    setEvaluating(true);
    setEvalError(null);
    try {
      /* Resume AudioContext — Web Audio requires a user gesture before playback */
      try {
        const { getAudioContext } = await import('@strudel/webaudio');
        const ctx = getAudioContext();
        if (ctx?.state === 'suspended') await ctx.resume();
      } catch { /* AudioContext resume failed — Strudel will handle it */ }

      const code = view.state.doc.toString().replace(/^\$\s*:\s*/gm, '');
      if (!code.trim()) { setEvaluating(false); return; }

      /* evaluate(code, autoplay=true) — Strudel auto-starts the scheduler */
      console.log('[StrudelEditor] Evaluating code...', code.slice(0, 80));
      await replRef.current.evaluate(code, true);
      console.log('[StrudelEditor] Evaluate success, scheduler active');

      /* Force visualizer tap to reconnect — superdough recreates audio chain on evaluate */
      resetStrudelTap();
      setTimeout(() => resetStrudelTap(), 200);
      setTimeout(() => resetStrudelTap(), 500);

      /* Track evaluation for session stats + unlock achievements */
      const evalStore = useAppStore.getState();
      evalStore.incrementEval();
      evalStore.unlockAchievement('first_play');
      evalStore.trackEngine('strudel');
      if (code.split('\n').filter((l: string) => l.trim()).length >= 5) {
        evalStore.unlockAchievement('complex_pattern');
      }
      if (Date.now() - evalStore.sessionStats.startTime < 5000) {
        evalStore.unlockAchievement('speed_demon');
      }
      if (!isPlaying) {
        togglePlay();
      }
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : String(err));
    } finally {
      setEvaluating(false);
    }
  }, [isPlaying, togglePlay]);

  const handleStop = useCallback(() => {
    try {
      replRef.current?.stop();
    } catch { /* stop may fail if not started */ }
    if (isPlaying) {
      togglePlay();
    }
  }, [isPlaying, togglePlay]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex items-center gap-2 shrink-0" style={{ padding: 'var(--space-1) var(--space-3)', backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
        <Tooltip content="Evaluate & play (Ctrl+Enter)">
          <Button variant="ghost" onClick={handleEvaluate} disabled={!ready || evaluating} className="!py-0.5 !px-2 text-xs">
            {evaluating ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            {evaluating ? t('editor.evaluating') : t('editor.run')}
          </Button>
        </Tooltip>
        <Tooltip content="Stop playback">
          <Button variant="ghost" onClick={handleStop} className="!py-0.5 !px-2 text-xs">
            <Square size={12} /> {t('editor.stop')}
          </Button>
        </Tooltip>
        {isPlaying && (
          <span className="flex items-center gap-1" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontFamily: 'var(--font-family-mono)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }} />
            {t('editor.playing')}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ready ? 'var(--color-success)' : 'var(--color-warning)' }} />
          {ready ? t('editor.ready') : t('editor.loading')}
        </span>
      </div>

      {isPlaying && (
        <div className="shrink-0" style={{ height: '3px', background: 'linear-gradient(90deg, var(--color-success), var(--color-primary), var(--color-success))', backgroundSize: '200% 100%', animation: 'playing-indicator 1.5s ease-in-out infinite' }} role="status" aria-label={t('editor.playing')} />
      )}

      <div ref={editorRef} className="flex-1 min-h-0 overflow-hidden" />

      {evalError && (
        <div role="alert" aria-live="assertive" className="flex items-center shrink-0" style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-bg)', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-family-mono)', padding: 'var(--space-2) var(--space-4)', gap: 'var(--space-3)' }}>
          <span className="flex-1 truncate">{evalError}</span>
          <button type="button" onClick={() => setEvalError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'var(--font-size-base)' }}>&times;</button>
        </div>
      )}
    </div>
  );
}
