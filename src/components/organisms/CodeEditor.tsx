/* ──────────────────────────────────────────────────────────
   CodeEditor organism — CodeMirror 6 editor with multi-tab
   file support and live code evaluation. Creates a new CM6
   EditorView per active file, with per-engine syntax
   highlighting. Code changes are debounce-evaluated through
   the orchestrator when playback is active.
   ────────────────────────────────────────────────────────── */

import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useAppStore } from '../../lib/store';
import { getOrchestrator } from '../../lib/orchestrator';
import { getBaseExtensions } from '../../lib/editor/setup';
import { getEngineExtensions } from '../../lib/editor/extensions';
import { createEvaluator } from '../../lib/editor/evaluate';
import { FileTabs } from '../molecules/FileTabs';

/** Main code editor — CodeMirror 6 with multi-tab support and live evaluation */
export function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const evaluatorRef = useRef<ReturnType<typeof createEvaluator> | null>(null);

  const files = useAppStore((s) => s.files);
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const activeFile = files.find((f) => f.active);

  /** Set up evaluator for live code changes */
  const setupEvaluator = useCallback(() => {
    if (!activeFile) return;
    evaluatorRef.current?.cancel();
    const orch = getOrchestrator();
    evaluatorRef.current = createEvaluator(
      (code) => orch.evaluate(code, activeFile.engine),
      500,
      (err) => console.error('[CodeEditor] Eval error:', err.message),
      () => {},
    );
  }, [activeFile?.id, activeFile?.engine]);

  /** Create or recreate the CM6 editor when active file changes */
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    /* Destroy previous editor */
    viewRef.current?.destroy();

    /* Create update listener — syncs code to store and triggers evaluation */
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const code = update.state.doc.toString();
        updateFileCode(activeFile.id, code);
        /* Auto-evaluate when playing */
        if (isPlaying) {
          evaluatorRef.current?.evaluate(code);
        }
      }
    });

    /* Create new editor state with base + engine-specific extensions */
    const state = EditorState.create({
      doc: activeFile.code,
      extensions: [
        ...getBaseExtensions(),
        ...getEngineExtensions(activeFile.engine),
        updateListener,
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

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <FileTabs />
      <div ref={editorRef} className="flex-1 min-h-0 overflow-hidden" />
    </div>
  );
}
