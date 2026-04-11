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
import { setStrudelCM, syncWidgetsAfterEval } from '../../lib/editor/inline-widgets';
import { Button, Tooltip } from '../atoms';
import { ErrorBar } from '../molecules/ErrorBar';
import { Play, Square, Loader2, RotateCcw, Download, Piano, ChevronDown, PenLine, Volume2 } from 'lucide-react';

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

  /* Editor settings from Zustand — triggers CM6 rebuild when changed */
  const editorTheme = useAppStore((s) => s.editorTheme);
  const vimMode = useAppStore((s) => s.vimMode);

  /* MIDI keyboard quick-action menu */
  const [midiConnected, setMidiConnected] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string>('');
  const [midiMenuOpen, setMidiMenuOpen] = useState(false);
  const [composeMode, setComposeMode] = useState(false);
  const midiMenuRef = useRef<HTMLDivElement>(null);

  /* Detect MIDI devices */
  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;
    let mounted = true;
    navigator.requestMIDIAccess({ sysex: false }).then((midi) => {
      if (!mounted) return;
      const checkDevices = () => {
        const inputs = [...midi.inputs.values()];
        setMidiConnected(inputs.length > 0);
        setMidiDeviceName(inputs[0]?.name ?? '');
      };
      checkDevices();
      midi.onstatechange = checkDevices;
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  /* Close MIDI menu on outside click */
  useEffect(() => {
    if (!midiMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (midiMenuRef.current && !midiMenuRef.current.contains(e.target as Node)) {
        setMidiMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [midiMenuOpen]);

  /* MIDI quick-action: load code into editor and evaluate */
  const loadMidiCode = useCallback((code: string) => {
    const view = viewRef.current;
    if (!view || !activeFile) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
    updateFileCode(activeFile.id, code);
    setMidiMenuOpen(false);
    /* Auto-evaluate after loading */
    setTimeout(() => handleEvaluate(), 100);
  }, [activeFile, updateFileCode]);

  /* Initialize Strudel REPL + load @strudel/codemirror extensions */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        /* Load Strudel REPL with afterEval hook for inline widgets.
         * afterEval receives { code, pattern, meta } where meta contains
         * widgets and miniLocations from the transpiler. */
        const { initStrudel } = await import('@strudel/web');
        const repl = await initStrudel({
          afterEval: ({ meta }: { meta?: { widgets?: unknown[]; miniLocations?: unknown[] } }) => {
            const view = viewRef.current;
            if (view && meta) {
              /* Dispatch widgets to CM6 extensions — same as StrudelMirror.afterEval */
              import('../../lib/editor/inline-widgets').then(({ syncWidgetsAfterEval }) => {
                /* Write meta into repl.state so syncWidgetsAfterEval can read it */
                if (replRef.current?.state) {
                  replRef.current.state.widgets = meta.widgets ?? [];
                  replRef.current.state.miniLocations = meta.miniLocations ?? [];
                }
                syncWidgetsAfterEval(view, replRef.current);
              });
            }
          },
        });
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

        /* Load @strudel/midi via evalScope for .midi() output + CC functions,
         * then REPLACE midikeys/midin with our custom implementations.
         *
         * WHY: Vite creates two @strudel/core module instances in dev mode.
         * @strudel/midi's midikeys checks getIsStarted() from instance B
         * (always false), silently dropping ALL MIDI note events.
         * Our custom midikeys uses the raw Web MIDI API (proven to work)
         * and constructs Patterns from @strudel/web (same instance as REPL). */
        try {
          const { evalScope } = await import('@strudel/web') as any;
          await evalScope(import('@strudel/midi'));
          console.log('[StrudelEditor] @strudel/midi loaded (CC, .midi() output)');
        } catch (e) {
          console.warn('[StrudelEditor] @strudel/midi load failed:', e);
        }

        /* Register our custom midikeys/midin that bypass the double-instance bug */
        try {
          const { customMidikeys, customMidin } = await import('../../lib/midi/strudel-keys');
          (globalThis as any).midikeys = customMidikeys;
          (globalThis as any).midin = customMidin;
          console.log('[StrudelEditor] Custom midikeys/midin registered (raw MIDI API)');
        } catch (e) {
          console.warn('[StrudelEditor] Custom MIDI registration failed:', e);
        }

        /* Load Strudel CM6 extensions (sliders, highlighting, widgets) */
        try {
          const strudelCM = await import('@strudel/codemirror');
          strudelExtRef.current = strudelCM;
          setStrudelCM(strudelCM);
        } catch (err) {
          console.warn('[StrudelEditor] @strudel/codemirror extensions not available:', err);
        }

        /* Load @strudel/draw and register inline widget methods on Pattern.prototype.
         * @strudel/draw exports pianoroll/punchcard/spiral/pitchwheel as background
         * painters (Pattern.prototype.pianoroll). The _underscore versions (_pianoroll)
         * are inline CM6 widgets — they need registerWidget from @strudel/codemirror. */
        try {
          const draw = await import('@strudel/draw');
          const strudelCMod = strudelExtRef.current;
          if (strudelCMod?.registerWidget && draw) {
            /* Register inline widget methods with their draw functions.
             * registerWidget(type, fn) does TWO things:
             * 1. Tells the transpiler to detect ._type() calls
             * 2. Adds Pattern.prototype._type = fn (with underscore!)
             * We pass the __pianoroll etc. functions from @strudel/draw. */
            const drawFns: Record<string, unknown> = {
              pianoroll: (draw as any).__pianoroll ?? (draw as any).drawPianoroll,
              punchcard: (draw as any).getPunchcardPainter,
              pitchwheel: (draw as any).pitchwheel,
            };
            for (const [type, fn] of Object.entries(drawFns)) {
              try {
                if (fn) strudelCMod.registerWidget(type, fn);
                else strudelCMod.registerWidget(type);
              } catch { /* already registered */ }
            }
            /* Also register types without draw functions (transpiler-only) */
            for (const type of ['scope', 'spiral', 'spectrum']) {
              try { strudelCMod.registerWidget(type); } catch {}
            }

            /* Fallback: if _pianoroll still not on Pattern.prototype,
             * alias from the non-underscore version that @strudel/draw adds */
            try {
              const core = await import('@strudel/web') as any;
              const proto = core.Pattern?.prototype;
              for (const method of ['pianoroll', 'punchcard', 'scope', 'spiral', 'pitchwheel', 'spectrum']) {
                if (proto[method] && !proto[`_${method}`]) {
                  proto[`_${method}`] = proto[method];
                }
              }
              console.log('[StrudelEditor] Inline widget methods registered + aliased');
            } catch {
              console.log('[StrudelEditor] Widget types registered (transpiler only)');
            }
          }

          /* Expose sliderWithID and slider globally — the transpiler rewrites
           * slider(0.5, 0, 1) to sliderWithID("slider_42", 0.5, 0, 1) but
           * sliderWithID must be in the global eval scope. */
          if (strudelCMod?.sliderWithID) {
            (globalThis as any).sliderWithID = strudelCMod.sliderWithID;
            console.log('[StrudelEditor] sliderWithID registered globally');
          }
          if (strudelCMod?.slider) {
            (globalThis as any).slider = strudelCMod.slider;
          }
        } catch (err) {
          console.warn('[StrudelEditor] @strudel/draw load failed:', err);
        }

        /* @strudel/midi already loaded via REPL above */

        /* Load ALL optional Strudel extensions (xen, soundfonts, osc, serial,
         * onKey, createParams, clock sync, all() global transforms) */
        try {
          const { loadAllExtensions } = await import('../../lib/strudel-extensions');
          await loadAllExtensions();
        } catch (err) {
          console.warn('[StrudelEditor] Extensions load failed:', err);
        }

        /* Initialize input devices (gamepad polling + MIDI input) */
        try {
          const { startGamepadPolling } = await import('../../lib/input/gamepad');
          startGamepadPolling();
        } catch { /* gamepad not available */ }
        /* Our own initMidiInput is DISABLED — @strudel/midi handles MIDI access.
         * Running both causes port conflicts. The MIDI panel still shows devices
         * via @strudel/midi's WebMidi instance. */

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

  /* Create CM6 editor with Strudel extensions.
   * Uses an async IIFE so the vim() dynamic import resolves before
   * the editor is instantiated. The `mounted` guard prevents stale
   * creation when the effect is cleaned up during the await. */
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;
    viewRef.current?.destroy();
    viewRef.current = null;
    let mounted = true;

    (async () => {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const code = update.state.doc.toString();
          updateFileCode(activeFile.id, code);
          /* Live mode: debounced auto-evaluate — only if code parses cleanly */
          if (liveModeRef.current && replRef.current && isPlaying) {
            if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
            evalTimerRef.current = setTimeout(async () => {
              try {
                await replRef.current.evaluate(code, true);
                resetStrudelTap();
                setEvalError(null);
                const v = viewRef.current;
                if (v) syncWidgetsAfterEval(v, replRef.current);
              } catch (err) {
                setEvalError(err instanceof Error ? err.message : String(err));
              }
            }, 150);
          }
        }
      });

      /* Ctrl+Enter / Cmd+Enter keybinding to evaluate code */
      const evalKeymapExt = keymap.of([
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

      /* Build extension list — theme ID from Zustand store drives CM6 theme */
      const extensions = [
        ...getBaseExtensions(editorTheme),
        ...getEngineExtensions(activeFile.engine),
        highlightField,
        updateListener,
        evalKeymapExt,
      ];

      /* Vim mode — driven by Zustand store, loaded via dynamic import.
       * Vite caches the module after the first load so subsequent
       * rebuilds resolve instantly. */
      if (vimMode) {
        try {
          const vimModule = await import('@replit/codemirror-vim');
          if (vimModule.vim) {
            extensions.push(vimModule.vim());
            console.log('[StrudelEditor] Vim mode enabled');
          }
        } catch { /* @replit/codemirror-vim not available */ }
      }

      /* Apply font size and word wrap from localStorage (non-reactive settings) */
      try {
        const settings = JSON.parse(localStorage.getItem('lmc-editor-settings') || '{}');
        if (settings.fontSize && settings.fontSize !== 14) {
          extensions.push(EditorView.theme({
            '.cm-content': { fontSize: `${settings.fontSize}px` },
          }));
        }
        if (settings.wordWrap) {
          extensions.push(EditorView.lineWrapping);
        }
      } catch { /* settings not available */ }

      /* Add Strudel-specific CM6 extensions if loaded (optional) */
      const strudelCM = strudelExtRef.current;
      if (strudelCM) {
        try {
          if (strudelCM.sliderPlugin) extensions.push(strudelCM.sliderPlugin);
          if (strudelCM.widgetPlugin) extensions.push(strudelCM.widgetPlugin);
          if (strudelCM.highlightExtension) extensions.push(strudelCM.highlightExtension);
          if (strudelCM.flashField) extensions.push(strudelCM.flashField);
        } catch (err) {
          console.warn('[StrudelEditor] Failed to add Strudel CM extensions:', err);
        }
      }

      /* Guard: bail if effect was cleaned up while awaiting vim import */
      if (!mounted || !editorRef.current) return;

      const state = EditorState.create({
        doc: activeFile.code,
        extensions,
      });

      viewRef.current = new EditorView({ state, parent: editorRef.current });
    })();

    return () => {
      mounted = false;
      viewRef.current?.destroy();
      viewRef.current = null;
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    };
  }, [activeFile?.id, activeFile?.engine, ready, editorTheme, vimMode]);

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

      /* Pre-process code: handle _$: muted patterns before evaluation */
      let code = view.state.doc.toString().replace(/^\$\s*:\s*/gm, '');
      try {
        const { processMutedLabels, clearKeyBindings } = await import('../../lib/strudel-extensions');
        code = processMutedLabels(code);
        clearKeyBindings(); /* Reset onKey bindings before re-eval */
      } catch { /* extensions not loaded */ }
      if (!code.trim()) { setEvaluating(false); return; }

      /* evaluate(code, autoplay=true) — Strudel auto-starts the scheduler */
      await replRef.current.evaluate(code, true);

      /* Sync inline widgets from REPL state to CM6 editor.
       * After evaluate(), repl.state.widgets contains slider and block widget
       * metadata extracted by the transpiler. We dispatch these to the CM6
       * sliderPlugin and widgetPlugin extensions (same as StrudelMirror.afterEval). */
      syncWidgetsAfterEval(view, replRef.current);

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

  /* Double-click to clear: first click arms, second click within 2s clears */
  const clearArmedRef = useRef(false);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClear = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const code = view.state.doc.toString();
    if (!code.trim()) return;

    if (!clearArmedRef.current) {
      /* First click: arm the clear */
      clearArmedRef.current = true;
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => { clearArmedRef.current = false; }, 2000);
      return;
    }

    /* Second click: actually clear */
    clearArmedRef.current = false;
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: '' } });
    if (activeFile) updateFileCode(activeFile.id, '');
  }, [activeFile, updateFileCode]);

  const handleDownload = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const code = view.state.doc.toString();
    if (!code.trim()) return;
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeFile?.name || 'pattern'}.js`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeFile]);

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
        <Tooltip content="Download code as file">
          <Button variant="ghost" onClick={handleDownload} className="!py-0.5 !px-2 text-xs">
            <Download size={12} />
          </Button>
        </Tooltip>
        <Tooltip content={clearArmedRef.current ? 'Click again to clear' : 'Clear code (click twice)'}>
          <Button variant="ghost" onClick={handleClear} className="!py-0.5 !px-2 text-xs">
            <RotateCcw size={12} style={clearArmedRef.current ? { color: 'var(--color-error)' } : undefined} />
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
        {/* MIDI keyboard quick-action button */}
        {midiConnected && (
          <div className="relative" ref={midiMenuRef}>
            <Tooltip content={`MIDI: ${midiDeviceName || 'Connected'}`}>
              <Button
                variant="ghost"
                onClick={() => setMidiMenuOpen(!midiMenuOpen)}
                className="!py-0.5 !px-2 text-xs"
                style={{ color: 'var(--color-success)' }}
              >
                <Piano size={12} />
                <ChevronDown size={8} />
              </Button>
            </Tooltip>
            {midiMenuOpen && (
              <div
                className="absolute top-full left-0 z-50 mt-1 min-w-[220px] rounded-md shadow-lg"
                style={{
                  backgroundColor: 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-1)',
                }}
              >
                {/* Device info header */}
                <div
                  className="px-3 py-1.5"
                  style={{ fontSize: '10px', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
                >
                  <Piano size={10} className="inline mr-1" style={{ color: 'var(--color-success)' }} />
                  {midiDeviceName}
                </div>

                {/* Quick actions */}
                <button
                  className="w-full text-left px-3 py-1.5 text-xs rounded hover:opacity-80 cursor-pointer"
                  style={{ color: 'var(--color-text)', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => loadMidiCode(`// MIDI Keyboard — Sine\nconst kb = await midikeys(0)\n$: kb().s("sine").room(0.3)`)}
                >
                  Test Keyboard — Sine
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 text-xs rounded hover:opacity-80 cursor-pointer"
                  style={{ color: 'var(--color-text)', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => loadMidiCode(`// MIDI Keyboard — Sawtooth with filter\nconst kb = await midikeys(0)\n$: kb().s("sawtooth").lpf(2000).gain(0.4).room(0.3)`)}
                >
                  Test Keyboard — Sawtooth
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 text-xs rounded hover:opacity-80 cursor-pointer"
                  style={{ color: 'var(--color-text)', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => loadMidiCode(`// Full MIDI Setup — Keys + Knobs + Drums\nconst kb = await midikeys(0)\nconst cc = await midin(0)\n\n$: kb().s("sawtooth")\n  .lpf(cc(70).range(400, 4000))\n  .room(cc(74).range(0, 0.8))\n  .gain(0.4)\n\n$: s("bd ~ hh sd bd hh [sd hh] hh")\n  .gain(0.5)`)}
                >
                  Full Setup — Keys + Knobs + Drums
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 text-xs rounded hover:opacity-80 cursor-pointer"
                  style={{ color: 'var(--color-text)', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => loadMidiCode(`// MIDI CC Knobs — Control filter and reverb\nconst cc = await midin(0)\n\nnote("c3 e3 g3 c4")\n  .s("sawtooth")\n  .lpf(cc(70).range(200, 5000))\n  .room(cc(74).range(0, 0.9))\n  .gain(0.4)`)}
                >
                  CC Knobs — Filter + Reverb
                </button>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-1) 0' }} />

                {/* Compose Mode toggle — writes MIDI notes as code */}
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-xs rounded hover:opacity-80 cursor-pointer flex items-center gap-2"
                  style={{
                    color: composeMode ? 'var(--color-success)' : 'var(--color-text)',
                    backgroundColor: composeMode ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!composeMode) e.currentTarget.style.backgroundColor = 'var(--color-border)'; }}
                  onMouseLeave={(e) => { if (!composeMode) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  onClick={() => {
                    import('../../lib/midi/compose-mode').then(({ toggleComposeMode }) => {
                      const enabled = toggleComposeMode(viewRef.current);
                      setComposeMode(enabled);
                      setMidiMenuOpen(false);
                    });
                  }}
                >
                  <PenLine size={11} />
                  {composeMode ? 'Compose Mode ON' : 'Compose Mode — Write Notes'}
                </button>

                {/* Divider before Sound Browser */}
                <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-1) 0' }} />

                {/* Sound Browser — audition Strudel sounds via MIDI keyboard */}
                <div
                  className="px-3 py-1"
                  style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Volume2 size={10} />
                  Sound Browser
                </div>
                <div className="grid grid-cols-2 gap-0.5 px-1 pb-1">
                  {(['sine', 'sawtooth', 'square', 'triangle', 'superpiano', 'supersaw', 'metal', 'piano'] as const).map((sound) => (
                    <button
                      type="button"
                      key={sound}
                      className="text-left px-2 py-1 text-xs rounded hover:opacity-80 cursor-pointer truncate"
                      style={{ color: 'var(--color-text)', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => loadMidiCode(`const kb = await midikeys(0)\n$: kb().s("${sound}").room(0.3)`)}
                    >
                      {sound}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <span className="ml-auto flex items-center gap-1" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ready ? 'var(--color-success)' : 'var(--color-warning)' }} />
          {ready ? t('editor.ready') : t('editor.loading')}
        </span>
      </div>

      {isPlaying && (
        <div className="shrink-0" style={{ height: '3px', background: 'linear-gradient(90deg, var(--color-success), var(--color-primary), var(--color-success))', backgroundSize: '200% 100%', animation: 'playing-indicator 1.5s ease-in-out infinite' }} role="status" aria-label={t('editor.playing')} />
      )}

      {/* Compose Mode indicator — visible when MIDI notes write to editor */}
      {composeMode && (
        <div
          className="shrink-0 flex items-center gap-2"
          style={{
            padding: '2px var(--space-3)',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 15%, var(--color-bg))',
            borderBottom: '1px solid var(--color-success)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-success)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          <PenLine size={10} />
          <span>COMPOSE MODE — Play keys to write notes</span>
          <button
            type="button"
            onClick={() => {
              import('../../lib/midi/compose-mode').then(({ disableComposeMode }) => {
                disableComposeMode();
                setComposeMode(false);
              });
            }}
            className="ml-auto cursor-pointer"
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}
          >
            ESC to exit
          </button>
        </div>
      )}

      <div ref={editorRef} className="flex-1 min-h-0 overflow-hidden" />

      {evalError && (
        <ErrorBar error={evalError} onDismiss={() => setEvalError(null)} />
      )}
    </div>
  );
}
