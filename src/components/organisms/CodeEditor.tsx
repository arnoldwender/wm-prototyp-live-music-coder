/* ──────────────────────────────────────────────────────────
   CodeEditor organism — CodeMirror 6 editor with multi-tab
   file support and live code evaluation. Creates a new CM6
   EditorView per active file, with per-engine syntax
   highlighting. Code changes are debounce-evaluated through
   the orchestrator when playback is active.
   ────────────────────────────────────────────────────────── */

import { useEffect, useRef, useCallback, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorState, EditorSelection } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { useAppStore } from '../../lib/store';
import { getOrchestrator } from '../../lib/orchestrator';
import { getBaseExtensions } from '../../lib/editor/setup';
import { getEngineExtensions } from '../../lib/editor/extensions';
import { createEvaluator } from '../../lib/editor/evaluate';
import { FileTabs } from '../molecules/FileTabs';
import { Play } from 'lucide-react';
import { Button, Tooltip } from '../atoms';

/* Lazy-load StrudelEditor for code splitting */
const StrudelEditor = lazy(() =>
  import('./StrudelEditor').then((m) => ({ default: m.StrudelEditor }))
);

/** Main code editor — uses StrudelEditor for Strudel tabs, generic CM6 for others */
export function CodeEditor() {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const evaluatorRef = useRef<ReturnType<typeof createEvaluator> | null>(null);

  /* Error state — shows the last evaluation error below the editor */
  const [evalError, setEvalError] = useState<string | null>(null);
  /* Auto-update: when on, code evaluates on every change while playing */
  const [autoUpdate, setAutoUpdate] = useState(true);

  const files = useAppStore((s) => s.files);
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const activeFile = files.find((f) => f.active);

  /* Refs to avoid stale closures in CM6 updateListener */
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const autoUpdateRef = useRef(autoUpdate);
  autoUpdateRef.current = autoUpdate;

  /** Manually evaluate the current code — works regardless of play state */
  const handleManualEvaluate = useCallback(async () => {
    if (!activeFile) return;
    const orch = getOrchestrator();
    try {
      setEvalError(null);
      await orch.evaluate(activeFile.code, activeFile.engine);
      /* Track evaluation for session stats */
      useAppStore.getState().incrementEval();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[CodeEditor] Manual eval error:', msg);
      setEvalError(msg);
    }
  }, [activeFile?.id, activeFile?.code, activeFile?.engine]);

  /** Set up evaluator for live code changes */
  const setupEvaluator = useCallback(() => {
    if (!activeFile) return;
    evaluatorRef.current?.cancel();
    const orch = getOrchestrator();
    evaluatorRef.current = createEvaluator(
      (code) => orch.evaluate(code, activeFile.engine),
      500,
      (err) => {
        console.error('[CodeEditor] Eval error:', err.message);
        setEvalError(err.message);
      },
      () => setEvalError(null),
    );
  }, [activeFile?.id, activeFile?.engine]);

  /** Create or recreate the CM6 editor when active file changes */
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    /* Destroy previous editor */
    viewRef.current?.destroy();

    /* Create update listener — syncs code to store and triggers auto-evaluation */
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const code = update.state.doc.toString();
        updateFileCode(activeFile.id, code);
        /* Auto-evaluate when playing AND autoUpdate is on — use refs to avoid stale closures */
        if (isPlayingRef.current && autoUpdateRef.current) {
          evaluatorRef.current?.evaluate(code);
        }
      }
    });

    /* Ctrl+Enter keybinding to manually evaluate code */
    const evalKeymap = keymap.of([{
      key: 'Ctrl-Enter',
      mac: 'Cmd-Enter',
      run: () => {
        handleManualEvaluate();
        return true;
      },
    }]);

    /* Create new editor state with base + engine-specific extensions */
    const state = EditorState.create({
      doc: activeFile.code,
      extensions: [
        ...getBaseExtensions(),
        ...getEngineExtensions(activeFile.engine),
        updateListener,
        evalKeymap,
      ],
    });

    /* Create new editor view attached to the container */
    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    setupEvaluator();

    return () => {
      evaluatorRef.current?.cancel();
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [activeFile?.id, activeFile?.engine]);

  /* Sync playing state with evaluator */
  useEffect(() => {
    setupEvaluator();
  }, [setupEvaluator]);

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

  /* Listen for 'node-focus' custom events from EngineNode double-click.
   * Searches for the code string in the editor and selects it. */
  useEffect(() => {
    const handleNodeFocus = (e: Event) => {
      const view = viewRef.current
      if (!view) return

      const { code } = (e as CustomEvent<{ code: string }>).detail
      if (!code) return

      const doc = view.state.doc.toString()
      const index = doc.indexOf(code)
      if (index === -1) return

      /* Select the matching code range and scroll it into view */
      view.dispatch({
        selection: EditorSelection.single(index, index + code.length),
        scrollIntoView: true,
      })
      view.focus()
    }

    window.addEventListener('node-focus', handleNodeFocus)
    return () => window.removeEventListener('node-focus', handleNodeFocus)
  }, []);

  /* For Strudel engine, use the dedicated StrudelEditor with live highlighting */
  if (activeFile?.engine === 'strudel') {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
        <FileTabs />
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            Loading Strudel editor...
          </div>
        }>
          <StrudelEditor />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <FileTabs />

      {/* Editor toolbar: Evaluate button + Auto-update toggle */}
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
            onClick={handleManualEvaluate}
            className="!py-0.5 !px-2 text-xs"
          >
            <Play size={12} />
            {t('editor.run')}
          </Button>
        </Tooltip>

        <label
          className="flex items-center gap-1.5 cursor-pointer select-none"
          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
        >
          <input
            type="checkbox"
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
            className="cursor-pointer"
          />
          {t('editor.liveMode')}
        </label>

        {/* Platform-aware keyboard shortcut hint */}
        <span
          className="ml-auto"
          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}
        >
          {navigator.platform?.includes('Mac') ? '\u2318\u21B5 to run' : 'Ctrl+Enter to run'}
        </span>
      </div>

      <div ref={editorRef} className="flex-1 min-h-0 overflow-hidden" />

      {/* Evaluation error bar — visible feedback when code fails to parse/run */}
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
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
