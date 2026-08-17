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
import { toggleLayerMute, toggleLayerSolo } from '../../lib/audio/layer-mute';
import { setStrudelCM, syncWidgetsAfterEval } from '../../lib/editor/inline-widgets';
import { Button, Tooltip } from '../atoms';
import { ErrorBar } from '../molecules/ErrorBar';
import SynthPanel from './SynthPanel';
import { safeJsonParse } from '../../lib/persistence/local';
/* Side-effect import — registers window.__lmcPlayNote / __lmcSetOscillator */
import '../../lib/midi/strudel-keys';
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
              attributes: { style: 'background-color: var(--color-strudel-highlight-bg); outline: 1px solid var(--color-strudel-highlight-border); border-radius: var(--radius-sm);' },
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
  /* Ref so the update listener always reads the current value, not a stale closure */
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const togglePlay = useAppStore((s) => s.togglePlay);
  const files = useAppStore((s) => s.files);
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const activeFile = files.find((f) => f.active);

  /* Synth panel — oscillator type lives in the global store so it survives
   * StrudelEditor unmount/remount and can be controlled from elsewhere. */
  const synthOscillator = useAppStore((s) => s.synthOscillator);
  const setSynthOscillator = useAppStore((s) => s.setSynthOscillator);

  /* Synth filter state — subscribed from the store so knob tweaks
   * trigger a side-effect that configures the shared BiquadFilterNode
   * in strudel-keys.ts via window.__lmcSetFilter. */
  const synthFilterType = useAppStore((s) => s.synthFilterType);
  const synthFilterCutoff = useAppStore((s) => s.synthFilterCutoff);
  const synthFilterResonance = useAppStore((s) => s.synthFilterResonance);
  const setSynthFilterType = useAppStore((s) => s.setSynthFilterType);
  const setSynthFilterCutoff = useAppStore((s) => s.setSynthFilterCutoff);
  const setSynthFilterResonance = useAppStore((s) => s.setSynthFilterResonance);

  /* Map UI filter types to Web Audio BiquadFilterType strings */
  useEffect(() => {
    const setFilter = (window as unknown as {
      __lmcSetFilter?: (t: BiquadFilterType, hz: number, q: number) => void;
    }).__lmcSetFilter;
    if (!setFilter) return;
    const biquadType: BiquadFilterType =
      synthFilterType === 'lpf' ? 'lowpass'
        : synthFilterType === 'hpf' ? 'highpass'
        : synthFilterType === 'bpf' ? 'bandpass'
        : 'notch';
    setFilter(biquadType, synthFilterCutoff, synthFilterResonance);
  }, [synthFilterType, synthFilterCutoff, synthFilterResonance]);

  /* Active notes shown on the on-screen keyboard.
   * Updated by lmc-midi-note events dispatched from strudel-keys.ts whenever
   * a physical MIDI key is pressed / released. Auto-cleared after 450ms on
   * note-on so they always release even if note-off never arrives. */
  const [synthActiveNotes, setSynthActiveNotes] = useState<number[]>([]);

  useEffect(() => {
    const handleNote = (e: Event) => {
      const { note, on } = (e as CustomEvent<{ note: number; on: boolean }>).detail;
      setSynthActiveNotes(prev =>
        on ? [...prev.filter(n => n !== note), note] : prev.filter(n => n !== note)
      );
      /* Auto-release after 450ms — matches OscillatorNode decay so the key
       * doesn't stay lit if a note-off message never arrives. */
      if (on) {
        setTimeout(() => {
          setSynthActiveNotes(prev => prev.filter(n => n !== note));
        }, 450);
      }
    };
    window.addEventListener('lmc-midi-note', handleNote);
    return () => window.removeEventListener('lmc-midi-note', handleNote);
  }, []);

  /* Map hardware CC knobs to synth UI controls.
   * MPK mini 3 defaults: K1=CC70, K2=CC71, K3=CC72; mod wheel=CC1.
   * CC 70 / 1 → filter cutoff (log scale Hz), 71 → resonance, 72 → osc type. */
  useEffect(() => {
    const LOG2_MIN = Math.log2(20);
    const LOG2_RANGE = Math.log2(20000) - LOG2_MIN;

    const handleCc = (e: Event) => {
      const { cc, value } = (e as CustomEvent<{ cc: number; value: number }>).detail;
      if (cc === 70 || cc === 1) {
        /* Log-scale map 0-1 → 20-20000 Hz — matches FilterControl's knob scale */
        setSynthFilterCutoff(Math.pow(2, LOG2_MIN + value * LOG2_RANGE));
      } else if (cc === 71) {
        setSynthFilterResonance(value);
      } else if (cc === 72) {
        /* Four quadrants → four waveforms */
        const types = ['sine', 'triangle', 'square', 'sawtooth'] as const;
        setSynthOscillator(types[Math.min(3, Math.floor(value * 4))]);
      }
    };
    window.addEventListener('lmc-midi-cc', handleCc);
    return () => window.removeEventListener('lmc-midi-cc', handleCc);
  }, [setSynthFilterCutoff, setSynthFilterResonance, setSynthOscillator]);

  /* Forward synth panel notes to the shared OscillatorNode trigger. The
   * window.__lmcPlayNote handle is registered by strudel-keys.ts on load. */
  const handleSynthNoteOn = useCallback((note: number, velocity: number) => {
    /* Sync the selected oscillator type before playing — strudel-keys.ts
     * stores it in module state so the call site doesn't need to pass it. */
    const setOsc = (window as unknown as { __lmcSetOscillator?: (t: OscillatorType) => void }).__lmcSetOscillator;
    if (setOsc) setOsc(synthOscillator);
    const play = (window as unknown as { __lmcPlayNote?: (n: number, v: number) => void }).__lmcPlayNote;
    if (play) play(note, velocity);
  }, [synthOscillator]);

  /* No-op note-off — OscillatorNode self-decays in 400ms, no release needed */
  const handleSynthNoteOff = useCallback((_note: number) => { /* noop */ }, []);

  /* Editor settings from Zustand — triggers CM6 rebuild when changed */
  const editorTheme = useAppStore((s) => s.editorTheme);
  const vimMode = useAppStore((s) => s.vimMode);

  /* MIDI keyboard quick-action menu */
  const [midiConnected, setMidiConnected] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string>('');
  const [midiMenuOpen, setMidiMenuOpen] = useState(false);
  const [composeMode, setComposeMode] = useState(false);
  const composeModeRef = useRef(false);
  composeModeRef.current = composeMode;
  /* handleStop is defined below the editor effect that registers the Ctrl+.
     keybinding, so the keymap reaches it through a ref rather than closing over
     a stale value. Assigned right after the callback is created. */
  const handleStopRef = useRef<(() => void) | null>(null);
  const [midiLearning, setMidiLearning] = useState(false);
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
        const name = inputs[0]?.name ?? '';
        setMidiDeviceName(name);

        /* Load the factory CC profile for the connected device.
         *
         * The in-app docs have always said the profile "is loaded
         * automatically", and src/data/midi-devices.ts has carried 19 tested
         * profiles — with no importer anywhere outside its own test. The data
         * and both helpers were finished; only this call was missing.
         *
         * Published on window rather than into React state because Strudel
         * patterns read it from the eval scope, and midimaps is how @strudel/midi
         * expects to receive it. */
        if (!name) return;
        void import('../../data/midi-devices').then(({ detectDeviceProfile, generateStrudelMidimap }) => {
          const profile = detectDeviceProfile(name);
          const midimap = generateStrudelMidimap(profile);
          (globalThis as any).midimaps = { ...(globalThis as any).midimaps, [profile.id]: midimap };
          (globalThis as any).__lmcMidiProfile = profile.id;
          console.log(`[midi] profile "${profile.id}" loaded for "${name}"`, midimap);
        }).catch(() => { /* profile data unavailable — MIDI still works raw */ });
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
    /* Auto-evaluate after loading — viewRef guard prevents fire on unmounted component */
    setTimeout(() => { if (viewRef.current) handleEvaluate(); }, 100);
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
        /* Put superdough on the app's shared AudioContext before the REPL is built.
         * Without this the app runs separate contexts and recording captures silence. */
        await (await import('../../lib/audio/context')).adoptSharedContextForStrudel();
        const repl = await initStrudel({
          afterEval: ({ meta }: { meta?: { widgets?: unknown[]; miniLocations?: unknown[] } }) => {
            const view = viewRef.current;
            if (view && meta) {
              /* Dispatch widgets to CM6 extensions — same as StrudelMirror.afterEval */
              import('../../lib/editor/inline-widgets').then(({ syncWidgetsAfterEval }) => {
                if (!mounted) return; // component unmounted during the dynamic import
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
        window.__strudelRepl = repl;

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
          window.midikeys = customMidikeys;
          window.midin = customMidin;
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

        /* Inline widgets (_pianoroll, _punchcard, _scope, _spiral, _pitchwheel,
         * _spectrum) need NO registration here: @strudel/codemirror registers all
         * six at import time.
         *
         * A previous version called registerWidget() with the NON-underscore
         * names, believing — as its comment said — that registerWidget "adds
         * Pattern.prototype._type = fn (with underscore!)". It does not. It
         * assigns Pattern.prototype[type], the plain name, so instead of adding
         * inline widgets it OVERWROTE the genuine background painters from
         * @strudel/draw, whose signature is a single options object rather than
         * (id, options).
         *
         * The consequence was not subtle: @strudel/codemirror's own _pianoroll
         * calls pat.tag(id).pianoroll({...}), which then hit the overwritten
         * wrapper with the options object in the `id` slot, leaving `haps`
         * undefined and throwing. Five shipped examples use ._pianoroll().
         *
         * See src/lib/widget-registration.test.ts, which also asserts the library
         * still registers the underscore variants — that is what makes leaving
         * this out safe rather than merely less broken. */
        try {
          const strudelCMod = strudelExtRef.current;

          /* Expose sliderWithID and slider globally — the transpiler rewrites
           * slider(0.5, 0, 1) to sliderWithID("slider_42", 0.5, 0, 1) but
           * sliderWithID must be in the global eval scope. */
          if (strudelCMod?.sliderWithID) {
            window.sliderWithID = strudelCMod.sliderWithID as Window['sliderWithID'];
            console.log('[StrudelEditor] sliderWithID registered globally');
          }
          if (strudelCMod?.slider) {
            window.slider = strudelCMod.slider as Window['slider'];
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
      /* Stop gamepad RAF loop on unmount to avoid dangling requestAnimationFrame */
      import('../../lib/input/gamepad').then(({ stopGamepadPolling }) => stopGamepadPolling()).catch(() => {});
      /* A-2: remove keydown listener — prevents duplicate listeners after HMR */
      /* A-3: close BroadcastChannel + cancel leader-election timeout */
      import('../../lib/strudel-extensions').then(({ stopKeyListener, stopClockSync }) => {
        stopKeyListener();
        stopClockSync();
      }).catch(() => {});
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
          /* Live mode: debounced auto-evaluate.
           * Fires when:
           *   a) Live mode + transport is playing (normal live coding)
           *   b) Compose mode + live mode (writing MIDI notes → immediate playback)
           *      The debounce is slightly longer in compose mode so a chord's
           *      notes all land before the eval fires (chord window = 20ms,
           *      eval delay = 300ms → no partial-chord evaluations). */
          const shouldEval =
            liveModeRef.current && replRef.current &&
            (isPlayingRef.current || composeModeRef.current);
          if (shouldEval) {
            if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
            const delay = composeModeRef.current ? 300 : 150;
            evalTimerRef.current = setTimeout(async () => {
              if (!replRef.current) return; // component may have unmounted during debounce
              try {
                await replRef.current.evaluate(code, true);
                resetStrudelTap();
                setEvalError(null);
                const v = viewRef.current;
                if (v) syncWidgetsAfterEval(v, replRef.current);
              } catch (err) {
                setEvalError(err instanceof Error ? err.message : String(err));
              }
            }, delay);
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
        {
          /* Documented in the in-app shortcuts list as "Ctrl+. — stop all audio"
             since before it existed. No binding was ever registered. */
          key: 'Ctrl-.',
          mac: 'Cmd-.',
          run: () => { handleStopRef.current?.(); return true; },
        },
        {
          /* The compose-mode banner tells the user "ESC to exit". Until now only
             clicking the banner worked, so the instruction on screen was wrong. */
          key: 'Escape',
          run: () => {
            if (!composeModeRef.current) return false; /* let CM6 handle it */
            setComposeMode(false);
            return true;
          },
        },
        /* Solo / mute layer N.
         *
         * Ctrl, not Alt. Alt+1..9 was dead on macOS — the primary platform:
         * CodeMirror explicitly refuses the keyCode fallback on mac+Alt, so the
         * real event arrives as key "¡" and the binding never fires. Eighteen
         * shortcuts that could not work. Playwright's synthetic Alt+1 reports a
         * false PASS because it does not reproduce macOS's Option-key character
         * substitution, so any falsifier for this must assert on a real event.
         *
         * These edit the DOCUMENT rather than a Set. The mute that works in this
         * app is textual: processMutedLabels rewrites a leading _$: into a
         * comment, and Strudel returns silence for _-prefixed ids. Editing the
         * text also makes the state visible in the user's own code. */
        ...Array.from({ length: 9 }, (_, i) => ({
          key: `Ctrl-${i + 1}`,
          run: (view: EditorView) => {
            const code = view.state.doc.toString();
            const next = toggleLayerMute(code, i);
            if (next === code) return true; /* no such layer — swallow the key */
            view.dispatch({ changes: { from: 0, to: code.length, insert: next } });
            handleEvaluate();
            return true;
          },
        })),
        ...Array.from({ length: 9 }, (_, i) => ({
          key: `Shift-Ctrl-${i + 1}`,
          run: (view: EditorView) => {
            const code = view.state.doc.toString();
            const next = toggleLayerSolo(code, i);
            if (next === code) return true;
            view.dispatch({ changes: { from: 0, to: code.length, insert: next } });
            handleEvaluate();
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
      {
        const settings = safeJsonParse(localStorage.getItem('lmc-editor-settings') || '{}', {} as Record<string, unknown>);
        if (settings.fontSize && settings.fontSize !== 14) {
          extensions.push(EditorView.theme({
            '.cm-content': { fontSize: `${settings.fontSize}px` },
          }));
        }
        if (settings.wordWrap) {
          extensions.push(EditorView.lineWrapping);
        }
      }

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

      /* Pre-process code: handle _$: muted patterns before evaluation.
       *
       * The document is passed RAW. A previous version deleted every leading
       * `$:` label here, which silently dropped every layer but the last: the
       * transpiler turns `$: pat` into `pat.p('$')` and the REPL stacks those
       * registrations, so without the labels they become bare expressions and
       * only the final one is returned. Run therefore played one layer of a
       * session that defines four, while the debounced live-eval path at :440 —
       * which always passed the raw document — played all of them.
       *
       * Note processMutedLabels below operates on `_$:`, which is a different
       * prefix and still works on the raw text. See src/lib/dollar-label.test.ts. */
      let code = view.state.doc.toString();
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
  handleStopRef.current = handleStop;

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
                  style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
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
                      /* Pass getter — view ref changes on editor rebuild */
                      const enabled = toggleComposeMode(() => viewRef.current);
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
                  style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
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

                {/* Divider before MIDI Learn */}
                <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-1) 0' }} />

                {/* MIDI Learn — map a physical knob to lpf parameter (proof of concept) */}
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-xs rounded hover:opacity-80 cursor-pointer flex items-center gap-2"
                  style={{
                    color: midiLearning ? 'var(--color-warning)' : 'var(--color-text)',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => {
                    if (midiLearning) {
                      import('../../lib/midi/midi-learn').then(({ stopMidiLearn }) => {
                        stopMidiLearn();
                        setMidiLearning(false);
                      });
                    } else {
                      import('../../lib/midi/midi-learn').then(({ startMidiLearn, onMidiLearnChange }) => {
                        /* Subscribe to learn completion — auto-dismiss after mapping */
                        const unsub = onMidiLearnChange((s) => {
                          if (!s.learning) {
                            setMidiLearning(false);
                            unsub();
                          }
                        });
                        startMidiLearn('lpf');
                        setMidiLearning(true);
                      });
                    }
                  }}
                >
                  {midiLearning ? 'Move a knob...' : 'MIDI Learn — Map Knob'}
                </button>
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

      {/* Synth Panel — collapsible MIDI keyboard surface, only when MIDI is connected */}
      <SynthPanel
        midiConnected={midiConnected}
        midiDeviceName={midiDeviceName}
        activeNotes={synthActiveNotes}
        onNoteOn={handleSynthNoteOn}
        onNoteOff={handleSynthNoteOff}
        oscillator={synthOscillator}
        onOscillatorChange={setSynthOscillator}
        filterType={synthFilterType}
        filterCutoff={synthFilterCutoff}
        filterResonance={synthFilterResonance}
        onFilterTypeChange={setSynthFilterType}
        onFilterCutoffChange={setSynthFilterCutoff}
        onFilterResonanceChange={setSynthFilterResonance}
      />

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
