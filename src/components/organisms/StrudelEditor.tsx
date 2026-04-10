// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Strudel editor — integrates @strudel/codemirror for slider widgets,
 * pattern highlighting, and full REPL features alongside custom CM6. */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorView, Decoration, type DecorationSet, keymap } from '@codemirror/view';
import { EditorState, StateField, StateEffect } from '@codemirror/state';
import { useAppStore } from '../../lib/store';
import { getBaseExtensions } from '../../lib/editor/setup';
import { getEngineExtensions } from '../../lib/editor/extensions';
import { resetStrudelTap } from '../../lib/audio/strudel-tap';
import { setStrudelCM, updateInlineWidgets } from '../../lib/editor/inline-widgets';
import { Button, Tooltip } from '../atoms';
import { ErrorBar } from '../molecules/ErrorBar';
import { Play, Square, Loader2, Trash2 } from 'lucide-react';

/* Custom CM6 highlight system — marks code ranges that are currently sounding */
const setHighlights = StateEffect.define<{ from: number; to: number }[]>();

const highlightField = StateField.define<DecorationSet>({
  create() { return Decoration.none; },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setHighlights)) {
        const marks = effect.value
          .filter(({ from, to }) => from >= 0 && to <= tr.newDoc.length && from < to)
          .map(({ from, to }) =>
            Decoration.mark({
              attributes: { style: 'background-color: rgba(168, 85, 247, 0.25); outline: 1px solid rgba(168, 85, 247, 0.5); border-radius: 2px;' },
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
  const strudelExtRef = useRef<any>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const liveModeRef = useRef(true);
  liveModeRef.current = liveMode;
  const evalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        /* Load Dirt-Samples + register synth sounds */
        try {
          /* Init audio on first click if available */
          try {
            const webaudio = await import('@strudel/webaudio');
            if (typeof webaudio.initAudioOnFirstClick === 'function') webaudio.initAudioOnFirstClick();
          } catch { /* not available */ }

          /* Load samples via REPL (preferred — makes them available to patterns) */
          await repl.evaluate(`samples('github:tidalcycles/Dirt-Samples/master')`, false);
          console.log('[StrudelEditor] Samples loaded via REPL');
        } catch (e1) {
          console.warn('[StrudelEditor] REPL samples failed:', e1);
          try {
            const { samples } = await import('@strudel/webaudio');
            await samples('github:tidalcycles/Dirt-Samples/master');
            console.log('[StrudelEditor] Samples loaded via direct import');
          } catch (e2) {
            console.error('[StrudelEditor] Sample loading failed:', e2);
          }
        }

        /* Load Strudel CM6 extensions (sliders, highlighting, widgets) */
        try {
          const strudelCM = await import('@strudel/codemirror');
          strudelExtRef.current = strudelCM;
          setStrudelCM(strudelCM);
        } catch (err) {
          console.warn('[StrudelEditor] @strudel/codemirror extensions not available:', err);
        }

        /* Load @strudel/draw for inline canvas visualizers (._pianoroll, ._scope, etc.) */
        try {
          await import('@strudel/draw');
          console.log('[StrudelEditor] @strudel/draw loaded');
        } catch { /* draw package not available — inline visualizers won't render canvases */ }

        /* Initialize input devices (gamepad polling + MIDI input) */
        try {
          const { startGamepadPolling } = await import('../../lib/input/gamepad');
          startGamepadPolling();
        } catch { /* gamepad not available */ }
        try {
          const { initMidiInput } = await import('../../lib/midi/input');
          await initMidiInput();
        } catch { /* MIDI not available */ }

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
        const code = update.state.doc.toString();
        updateFileCode(activeFile.id, code);
        /* Live mode: debounced auto-evaluate — only if code parses cleanly */
        if (liveModeRef.current && replRef.current && isPlaying) {
          if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
          evalTimerRef.current = setTimeout(async () => {
            try {
              const result = await replRef.current.evaluate(code, true);
              resetStrudelTap();
              setEvalError(null);
              /* Update inline widgets on live eval too */
              const v = viewRef.current;
              if (v && (result?.widgets || replRef.current?.widgets)) {
                updateInlineWidgets(v, result?.widgets ?? replRef.current.widgets);
              }
            } catch (err) {
              setEvalError(err instanceof Error ? err.message : String(err));
            }
          }, 800);
        }
      }
    });

    /* Ctrl+Enter / Cmd+Enter keybinding to evaluate code */
    const evalKeymap = keymap.of([
      {
        key: 'Ctrl-Enter',
        mac: 'Cmd-Enter',
        run: () => { handleEvaluate(); return true; },
      },
      /* Solo/Mute shortcuts — Alt+1..9 to solo, Shift+Alt+1..9 to mute */
      ...Array.from({ length: 9 }, (_, i) => ({
        key: `Alt-${i + 1}`,
        run: () => {
          import('../../lib/audio/solo-mute').then(({ toggleSolo }) => {
            toggleSolo(`d${i + 1}`);
            console.log(`[Solo] Toggle d${i + 1}`);
          });
          return true;
        },
      })),
      ...Array.from({ length: 9 }, (_, i) => ({
        key: `Shift-Alt-${i + 1}`,
        run: () => {
          import('../../lib/audio/solo-mute').then(({ toggleMute }) => {
            toggleMute(`d${i + 1}`);
            console.log(`[Mute] Toggle d${i + 1}`);
          });
          return true;
        },
      })),
    ]);

    /* Build extension list */
    const extensions = [
      ...getBaseExtensions(),
      ...getEngineExtensions(activeFile.engine),
      highlightField,
      updateListener,
      evalKeymap,
    ];

    /* Vim mode — load conditionally from settings */
    try {
      const settings = JSON.parse(localStorage.getItem('lmc-editor-settings') || '{}');
      if (settings.vimMode) {
        import('@replit/codemirror-vim').then(({ vim }) => {
          /* Vim extension needs to be added to the editor — requires recreation.
           * For now, log that it's enabled; full integration needs compartment reconfiguration. */
          console.log('[StrudelEditor] Vim mode enabled');
        }).catch(() => {});
      }
      /* Apply font size from settings */
      if (settings.fontSize && settings.fontSize !== 14) {
        extensions.push(EditorView.theme({
          '.cm-content': { fontSize: `${settings.fontSize}px` },
        }));
      }
      /* Word wrap */
      if (settings.wordWrap) {
        extensions.push(EditorView.lineWrapping);
      }
    } catch { /* settings not available */ }

    /* Add Strudel-specific CM6 extensions if loaded (optional) */
    const strudelCM = strudelExtRef.current;
    if (strudelCM) {
      try {
        /* Slider widget plugin — allows slider(value, min, max, step) in code */
        if (strudelCM.sliderPlugin) extensions.push(strudelCM.sliderPlugin);
        /* Widget plugin — supports other inline widgets (._pianoroll, ._scope, etc.) */
        if (strudelCM.widgetPlugin) extensions.push(strudelCM.widgetPlugin);
        /* Pattern highlighting extension — marks active haps in code */
        if (strudelCM.highlightExtension) extensions.push(strudelCM.highlightExtension);
        /* Flash extension — visual feedback on eval */
        if (strudelCM.flashField) extensions.push(strudelCM.flashField);
      } catch (err) {
        console.warn('[StrudelEditor] Failed to add Strudel CM extensions:', err);
      }
    }

    const state = EditorState.create({
      doc: activeFile.code,
      extensions,
    });

    viewRef.current = new EditorView({ state, parent: editorRef.current });
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    };
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

  /* Highlight loop — queries scheduler for active haps and marks their code positions */
  useEffect(() => {
    if (!isPlaying) {
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
                if (typeof loc.start === 'number' && typeof loc.end === 'number') {
                  ranges.push({ from: loc.start, to: loc.end });
                } else if (loc.start?.line !== undefined) {
                  const doc = view.state.doc;
                  const startLine = Math.min(loc.start.line, doc.lines);
                  const endLine = Math.min(loc.end?.line ?? startLine, doc.lines);
                  const from = doc.line(startLine).from + (loc.start.column ?? 0);
                  const to = doc.line(endLine).from + (loc.end?.column ?? doc.line(endLine).length);
                  ranges.push({ from, to });
                }
              }
            }

            view.dispatch({ effects: setHighlights.of(ranges) });
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

      /* evaluate(code, autoplay=true) — Strudel auto-starts the scheduler */
      const evalResult = await replRef.current.evaluate(code, true);

      /* Update inline widgets (._pianoroll(), ._scope(), slider()) if transpiler
       * returned widget metadata. StrudelMirror's afterEval normally handles this,
       * but since we manage our own CM6 instance, we call it explicitly. */
      if (evalResult?.widgets || replRef.current?.widgets) {
        updateInlineWidgets(view, evalResult?.widgets ?? replRef.current.widgets);
      }

      /* Force visualizer tap to reconnect — superdough recreates audio chain lazily.
       * The controller only initializes AFTER the first note plays, so we retry
       * multiple times with increasing delays to catch it. */
      resetStrudelTap();
      setTimeout(() => resetStrudelTap(), 100);
      setTimeout(() => resetStrudelTap(), 300);
      setTimeout(() => resetStrudelTap(), 600);
      setTimeout(() => resetStrudelTap(), 1000);
      setTimeout(() => resetStrudelTap(), 2000);

      /* Track evaluation for session stats */
      const evalStore = useAppStore.getState();
      evalStore.incrementEval();
      evalStore.trackEngine('strudel');
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

  const handleClear = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: '' } });
    if (activeFile) updateFileCode(activeFile.id, '');
  }, [activeFile, updateFileCode]);

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
        <Tooltip content="Clear code">
          <Button variant="ghost" onClick={handleClear} className="!py-0.5 !px-2 text-xs">
            <Trash2 size={12} />
          </Button>
        </Tooltip>
        {/* Live mode toggle */}
        <label
          className="flex items-center gap-1.5 cursor-pointer select-none"
          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
        >
          <input
            type="checkbox"
            checked={liveMode}
            onChange={(e) => setLiveMode(e.target.checked)}
            className="cursor-pointer"
          />
          {t('editor.liveMode')}
        </label>
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
        <ErrorBar error={evalError} onDismiss={() => setEvalError(null)} />
      )}
    </div>
  );
}
