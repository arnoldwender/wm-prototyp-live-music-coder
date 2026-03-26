/* eslint-disable @typescript-eslint/no-explicit-any */
/* Strudel editor — uses initStrudel() for audio + custom CM6 highlighting.
 * Implements its own pattern highlighting without StrudelMirror dependency. */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorState, StateField, StateEffect } from '@codemirror/state';
import { EditorView, Decoration, type DecorationSet, keymap } from '@codemirror/view';
import { useAppStore } from '../../lib/store';
import { getBaseExtensions } from '../../lib/editor/setup';
import { getEngineExtensions } from '../../lib/editor/extensions';
import { Button, Tooltip } from '../atoms';
import { Play, Square, Loader2 } from 'lucide-react';


/* Custom CM6 highlight system — marks code ranges that are currently sounding */
const setHighlights = StateEffect.define<{ from: number; to: number }[]>();

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setHighlights)) {
        const marks = effect.value
          .filter(({ from, to }) => from >= 0 && to <= tr.newDoc.length && from < to)
          .map(({ from, to }) =>
            Decoration.mark({
              attributes: { style: 'background-color: var(--color-strudel-highlight-bg, rgba(168, 85, 247, 0.25)); outline: 1px solid var(--color-strudel-highlight-border, rgba(168, 85, 247, 0.5)); border-radius: 2px;' },
            }).range(from, to)
          );
        decorations = Decoration.set(marks, true);
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function StrudelEditor() {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const replRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  /* Use store's isPlaying as single source of truth — avoids drift with TransportBar */
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);

  const files = useAppStore((s) => s.files);
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const activeFile = files.find((f) => f.active);

  /* Initialize Strudel REPL */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { initStrudel } = await import('@strudel/web');
        const repl = await initStrudel();
        if (!mounted) return;
        replRef.current = repl;

        try {
          await repl.evaluate(`samples('github:tidalcycles/Dirt-Samples/master')`, false);
        } catch {
          try {
            const { samples } = await import('@strudel/webaudio');
            await samples('github:tidalcycles/Dirt-Samples/master');
          } catch { /* samples failed */ }
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
      /* Stop Strudel audio when component unmounts (e.g. leaving editor) */
      replRef.current?.stop();
    };
  }, []);

  /* Create CM6 editor */
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

    const state = EditorState.create({
      doc: activeFile.code,
      extensions: [
        ...getBaseExtensions(),
        ...getEngineExtensions(activeFile.engine),
        highlightField,
        updateListener,
        evalKeymap,
      ],
    });

    viewRef.current = new EditorView({ state, parent: editorRef.current });
    return () => { viewRef.current?.destroy(); viewRef.current = null; };
  }, [activeFile?.id, activeFile?.engine]);

  /* Sync external store code changes into CM6 — handles URL-loaded code
   * from Samples/Examples pages where updateFileCode runs before the view
   * is created, or when code is set from outside the editor */
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

  /* Highlight loop — queries scheduler for active haps and marks their code positions */
  useEffect(() => {
    if (!isPlaying) {
      /* Clear highlights when stopped */
      if (viewRef.current) {
        viewRef.current.dispatch({ effects: setHighlights.of([]) });
      }
      return;
    }

    let running = true;
    const tick = () => {
      if (!running) return;
      const view = viewRef.current;
      const repl = replRef.current;

      if (view && repl?.scheduler) {
        try {
          const now = repl.scheduler.now();
          const pattern = repl.state?.pattern;
          if (pattern?.queryArc) {
            const haps = pattern.queryArc(now, now + 0.125);
            const ranges: { from: number; to: number }[] = [];

            for (const hap of haps) {
              if (!hap.context?.locations) continue;
              for (const loc of hap.context.locations) {
                /* loc has start/end as character offsets in the source code */
                if (typeof loc.start === 'number' && typeof loc.end === 'number') {
                  ranges.push({ from: loc.start, to: loc.end });
                }
                /* Some locations use {line, column} format */
                else if (loc.start?.line !== undefined) {
                  /* Convert line:col to absolute offset */
                  const doc = view.state.doc;
                  const startLine = Math.min(loc.start.line, doc.lines);
                  const endLine = Math.min(loc.end?.line ?? startLine, doc.lines);
                  const from = doc.line(startLine).from + (loc.start.column ?? 0);
                  const to = doc.line(endLine).from + (loc.end?.column ?? doc.line(endLine).length);
                  ranges.push({ from, to });
                }
              }
            }

            if (ranges.length > 0) {
              view.dispatch({ effects: setHighlights.of(ranges) });
            } else {
              view.dispatch({ effects: setHighlights.of([]) });
            }
          }
        } catch { /* ignore during pattern update */ }
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
      await replRef.current.evaluate(code);
      /* Track evaluation for session stats */
      useAppStore.getState().incrementEval();
      if (!isPlaying) {
        replRef.current.start();
        togglePlay();
      }
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : String(err));
    } finally {
      setEvaluating(false);
    }
  }, [isPlaying, togglePlay]);

  const handleStop = useCallback(() => {
    replRef.current?.stop();
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
