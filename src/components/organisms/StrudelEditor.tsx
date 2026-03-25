/* Strudel editor — uses initStrudel() for reliable audio + normal CodeMirror.
 * StrudelMirror was unreliable (dual REPL conflict), so we use our own CM6
 * editor paired with the @strudel/web REPL for evaluation. */

import { useEffect, useRef, useCallback, useState } from 'react';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useAppStore } from '../../lib/store';
import { getBaseExtensions } from '../../lib/editor/setup';
import { getEngineExtensions } from '../../lib/editor/extensions';
import { Button, Tooltip } from '../atoms';
import { Play, Square, Loader2 } from 'lucide-react';

/** Strudel editor with initStrudel() for reliable audio playback */
export function StrudelEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const replRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const highlightExtRef = useRef<Extension[]>([]);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [playing, setPlaying] = useState(false);

  const files = useAppStore((s) => s.files);
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const activeFile = files.find((f) => f.active);

  /* Initialize Strudel REPL on mount */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        console.log('[StrudelEditor] Loading Strudel...');
        const { initStrudel } = await import('@strudel/web');
        const repl = await initStrudel();

        if (!mounted) return;

        replRef.current = repl;

        /* Load Dirt-Samples by evaluating a samples() call through the REPL.
         * This ensures samples are registered in the correct context. */
        try {
          await repl.evaluate(`samples('github:tidalcycles/Dirt-Samples/master')`, false);
          console.log('[StrudelEditor] Dirt-Samples registered via REPL');
        } catch (err) {
          console.warn('[StrudelEditor] Dirt-Samples via REPL failed, trying direct:', err);
          /* Fallback: try direct superdough call */
          try {
            const { samples } = await import('superdough');
            await samples('github:tidalcycles/Dirt-Samples/master');
            console.log('[StrudelEditor] Dirt-Samples loaded via superdough');
          } catch (err2) {
            console.warn('[StrudelEditor] Dirt-Samples failed entirely:', err2);
          }
        }

        /* Load highlight extension for per-character pattern highlighting */
        try {
          const strudelCM = await import('@strudel/codemirror');
          highlightExtRef.current = strudelCM.highlightExtension;
          console.log('[StrudelEditor] Highlight extension loaded');
        } catch (err) {
          console.warn('[StrudelEditor] Highlight extension unavailable:', err);
        }

        setReady(true);
        console.log('[StrudelEditor] Ready — REPL + samples loaded');
      } catch (err) {
        console.error('[StrudelEditor] Init failed:', err);
        setEvalError(`Init failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();

    return () => { mounted = false; };
  }, []);

  /* Create CodeMirror editor when ready + active file changes */
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    /* Destroy previous editor */
    viewRef.current?.destroy();

    /* Update listener — sync code to store */
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const code = update.state.doc.toString();
        updateFileCode(activeFile.id, code);
      }
    });

    const state = EditorState.create({
      doc: activeFile.code,
      extensions: [
        ...getBaseExtensions(),
        ...getEngineExtensions(activeFile.engine),
        /* Per-character highlight decorations for active pattern haps */
        ...highlightExtRef.current,
        updateListener,
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [activeFile?.id, activeFile?.engine]);

  /* Evaluate current code via the Strudel REPL */
  const handleEvaluate = useCallback(async () => {
    if (!replRef.current) {
      setEvalError('Strudel not ready yet — wait for initialization');
      return;
    }

    const view = viewRef.current;
    if (!view) return;

    setEvaluating(true);
    setEvalError(null);

    try {
      const code = view.state.doc.toString();
      const cleanCode = code.replace(/^\$\s*:\s*/gm, '');
      if (!cleanCode.trim()) {
        setEvaluating(false);
        return;
      }

      /* Evaluate through the REPL — handles transpilation + pattern scheduling */
      await replRef.current.evaluate(cleanCode);

      /* Start playback if not already */
      if (!playing) {
        replRef.current.start();
        setPlaying(true);
        useAppStore.getState().togglePlay();
      }

      console.log('[StrudelEditor] Pattern evaluated successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[StrudelEditor] Eval error:', msg);
      setEvalError(msg);
    } finally {
      setEvaluating(false);
    }
  }, [playing]);

  /* Stop playback */
  const handleStop = useCallback(() => {
    replRef.current?.stop();
    if (playing) {
      setPlaying(false);
      if (useAppStore.getState().isPlaying) {
        useAppStore.getState().togglePlay();
      }
    }
  }, [playing]);

  /* Per-character highlight loop — polls scheduler for active haps and
   * dispatches mini-locations to the CM6 editor so currently-sounding
   * code fragments light up, like strudel.cc does. */
  useEffect(() => {
    if (!playing) {
      /* Clear highlights when playback stops */
      if (viewRef.current && highlightExtRef.current.length > 0) {
        import('@strudel/codemirror').then(({ updateMiniLocations }) => {
          if (viewRef.current) updateMiniLocations(viewRef.current, []);
        }).catch(() => { /* ignore */ });
      }
      return;
    }

    let running = true;

    const highlightLoop = async () => {
      const { updateMiniLocations, highlightMiniLocations } = await import('@strudel/codemirror');

      const tick = () => {
        if (!running) return;

        const view = viewRef.current;
        const repl = replRef.current;
        if (!view || !repl) {
          animFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        try {
          const state = repl.state;
          const scheduler = repl.scheduler;

          /* Step 1: Send mini-locations (code positions) to the editor.
           * These are set after evaluate() and define WHERE highlights can appear. */
          if (state?.miniLocations?.length > 0) {
            updateMiniLocations(view, state.miniLocations);
          }

          /* Step 2: Send active haps to the editor.
           * This tells the highlight system WHICH locations are sounding RIGHT NOW.
           * Without this, locations are registered but never visually marked. */
          if (scheduler && state?.pattern) {
            const now = scheduler.now();
            const haps = state.pattern.queryArc(now, now + 0.1);
            const activeHaps = haps.filter((h: any) => h.hasOnset?.() || h.whole);
            if (activeHaps.length > 0) {
              highlightMiniLocations(view, now, activeHaps);
            }
          }
        } catch {
          /* Ignore errors during highlight — pattern may be mid-update */
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    };

    highlightLoop();

    return () => {
      running = false;
      if (animFrameRef.current != null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [playing]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 shrink-0"
        style={{
          padding: 'var(--space-1) var(--space-3)',
          backgroundColor: 'var(--color-bg-alt)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Tooltip content="Evaluate & play pattern (Ctrl+Enter)">
          <Button
            variant="ghost"
            onClick={handleEvaluate}
            disabled={!ready || evaluating}
            className="!py-0.5 !px-2 text-xs"
          >
            {evaluating ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            {evaluating ? 'Evaluating...' : 'Run'}
          </Button>
        </Tooltip>

        <Tooltip content="Stop playback">
          <Button
            variant="ghost"
            onClick={handleStop}
            className="!py-0.5 !px-2 text-xs"
          >
            <Square size={12} />
            Stop
          </Button>
        </Tooltip>

        {playing && (
          <span
            className="flex items-center gap-1"
            style={{ fontSize: '10px', color: 'var(--color-success)', fontFamily: 'var(--font-family-mono)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }} />
            Playing
          </span>
        )}

        <span
          className="ml-auto flex items-center gap-1"
          style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: ready ? 'var(--color-success)' : 'var(--color-warning)' }}
          />
          {ready ? 'Ready' : 'Loading Strudel...'}
        </span>
      </div>

      {/* Playing indicator bar — pulses green when a pattern is active */}
      {playing && (
        <div
          className="shrink-0"
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, var(--color-success), var(--color-primary), var(--color-success))',
            backgroundSize: '200% 100%',
            animation: 'playing-indicator 1.5s ease-in-out infinite',
          }}
          role="status"
          aria-label="Pattern playing"
        />
      )}

      {/* CodeMirror editor container */}
      <div ref={editorRef} className="flex-1 min-h-0 overflow-hidden" />

      {/* Error bar */}
      {evalError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center shrink-0"
          style={{
            backgroundColor: 'var(--color-error)',
            color: 'white',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-mono)',
            padding: 'var(--space-2) var(--space-4)',
            gap: 'var(--space-3)',
          }}
        >
          <span className="flex-1 truncate">{evalError}</span>
          <button
            type="button"
            onClick={() => setEvalError(null)}
            aria-label="Dismiss error"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
