/* Strudel-specific editor using StrudelMirror from @strudel/codemirror.
 * Provides live pattern highlighting — code lights up in sync with audio.
 * Used instead of the generic CodeMirror setup when engine is 'strudel'. */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Button, Tooltip } from '../atoms';
import { Play, Square, Loader2 } from 'lucide-react';

/** Strudel editor with live pattern highlighting via StrudelMirror */
export function StrudelEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<any>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const files = useAppStore((s) => s.files);
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const activeFile = files.find((f) => f.active);

  /* Initialize StrudelMirror on mount */
  useEffect(() => {
    if (!containerRef.current || mirrorRef.current) return;

    let mounted = true;

    (async () => {
      try {
        /* Dynamic import for code splitting */
        const [{ StrudelMirror }, { initStrudel }] = await Promise.all([
          import('@strudel/codemirror'),
          import('@strudel/web'),
        ]);

        if (!mounted || !containerRef.current) return;

        /* prebake loads synths + registers functions. We also explicitly
         * load the Dirt-Samples from GitHub CDN for drum sounds. */
        const prebakePromise = initStrudel();

        const mirror = new StrudelMirror({
          root: containerRef.current,
          initialCode: activeFile?.code ?? '',
          prebake: async () => {
            await prebakePromise;
            /* Load default drum/instrument samples from Strudel CDN */
            try {
              const { samples } = await import('superdough');
              await samples('github:tidalcycles/Dirt-Samples/master');
              console.log('[StrudelEditor] Dirt-Samples loaded from CDN');
            } catch (err) {
              console.warn('[StrudelEditor] Failed to load Dirt-Samples:', err);
            }
          },
          drawTime: [0, 0],
          bgFill: false,
        });

        mirrorRef.current = mirror;

        /* Wait for full init including sample loading */
        await prebakePromise;
        try {
          const { samples } = await import('superdough');
          await samples('github:tidalcycles/Dirt-Samples/master');
        } catch { /* already loaded in prebake or failed */ }

        /* Listen for code changes in the StrudelMirror editor */
        const checkCode = () => {
          if (!mirrorRef.current?.editor) return;
          const code = mirrorRef.current.editor.state.doc.toString();
          const file = useAppStore.getState().files.find((f: any) => f.active);
          if (file && code !== file.code) {
            updateFileCode(file.id, code);
          }
        };

        /* Poll for code changes (StrudelMirror doesn't expose an onChange) */
        const interval = setInterval(checkCode, 500);

        setReady(true);
        console.log('[StrudelEditor] StrudelMirror ready — samples loaded');

        return () => {
          clearInterval(interval);
        };
      } catch (err) {
        console.error('[StrudelEditor] Init failed:', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* Sync code from store to editor when file changes externally */
  useEffect(() => {
    if (!mirrorRef.current?.editor || !activeFile) return;
    const editorCode = mirrorRef.current.editor.state.doc.toString();
    if (editorCode !== activeFile.code) {
      mirrorRef.current.editor.dispatch({
        changes: {
          from: 0,
          to: mirrorRef.current.editor.state.doc.length,
          insert: activeFile.code,
        },
      });
    }
  }, [activeFile?.id]);

  /* Handle evaluate — shows loading state during evaluation */
  const handleEvaluate = useCallback(async () => {
    if (!mirrorRef.current?.repl) return;
    setEvaluating(true);
    try {
      setEvalError(null);
      /* Get current code from the editor */
      const code = mirrorRef.current.editor.state.doc.toString();
      const cleanCode = code.replace(/^\$\s*:\s*/gm, '');
      if (!cleanCode.trim()) return;

      await mirrorRef.current.repl.evaluate(cleanCode);

      /* Start playback if not already playing */
      if (!useAppStore.getState().isPlaying) {
        mirrorRef.current.repl.start();
        togglePlay();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setEvalError(msg);
    } finally {
      setEvaluating(false);
    }
  }, [togglePlay]);

  /* Handle stop */
  const handleStop = useCallback(() => {
    mirrorRef.current?.repl?.stop();
    if (useAppStore.getState().isPlaying) {
      togglePlay();
    }
  }, [togglePlay]);

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
        <Tooltip content="Evaluate & play pattern">
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

        <span
          className="ml-auto flex items-center gap-1"
          style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: ready ? 'var(--color-success)' : 'var(--color-warning)' }}
          />
          {ready ? 'Ready' : 'Initializing...'}
        </span>
      </div>

      {/* StrudelMirror container — the editor lives here */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)' }}
      />

      {/* Error bar */}
      {evalError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center shrink-0"
          style={{
            backgroundColor: 'var(--color-error)',
            color: 'var(--color-bg)',
            fontSize: 'var(--font-size-xs)',
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
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
