/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Inline widget integration — bridges @strudel/codemirror's
   widgetPlugin with our StrudelEditor.

   In strudel.cc, StrudelMirror.afterEval does:
     1. Read meta.widgets from transpiler output
     2. Split into sliders (type === 'slider') and block widgets
     3. Call updateSliderWidgets(editor, sliders)
     4. Call updateWidgets(editor, blockWidgets)
     5. Call updateMiniLocations(editor, miniLocations)

   We replicate this by reading repl.state.widgets after evaluate()
   and dispatching to the same CM6 extension functions.
   ────────────────────────────────────────────────────────── */

import type { EditorView } from '@codemirror/view';

/* Cached references to @strudel/codemirror functions */
let _updateSliderWidgets: ((view: EditorView, widgets: unknown[]) => void) | null = null;
let _updateWidgets: ((view: EditorView, widgets: unknown[]) => void) | null = null;
let _updateMiniLocations: ((view: EditorView, locations: unknown[]) => void) | null = null;

/** Cache the @strudel/codemirror module functions */
export function setStrudelCM(mod: Record<string, unknown>): void {
  /* These are the minified export names — we use the full names from the export map */
  _updateSliderWidgets = (mod.updateSliderWidgets as typeof _updateSliderWidgets) ?? null;
  _updateWidgets = (mod.updateWidgets as typeof _updateWidgets) ?? null;
  _updateMiniLocations = (mod.updateMiniLocations as typeof _updateMiniLocations) ?? null;

  if (_updateSliderWidgets) console.log('[InlineWidgets] updateSliderWidgets ready');
  if (_updateWidgets) console.log('[InlineWidgets] updateWidgets ready');
  if (_updateMiniLocations) console.log('[InlineWidgets] updateMiniLocations ready');
}

/**
 * After evaluation, read widget metadata from REPL state and dispatch
 * to CodeMirror's widget extensions. This replicates StrudelMirror.afterEval.
 *
 * @param view - The CM6 EditorView instance
 * @param repl - The Strudel REPL (from initStrudel)
 */
export function syncWidgetsAfterEval(
  view: EditorView,
  repl: { state?: { widgets?: unknown[]; miniLocations?: unknown[] } },
): void {
  const widgets = repl.state?.widgets;
  const miniLocations = repl.state?.miniLocations;

  /* Update sliders — type === 'slider' */
  if (widgets && _updateSliderWidgets) {
    const sliders = (widgets as { type: string }[]).filter((w) => w.type === 'slider');
    if (sliders.length > 0) {
      try {
        _updateSliderWidgets(view, sliders);
      } catch (err) {
        console.warn('[InlineWidgets] Slider update failed:', err);
      }
    }
  }

  /* Update block widgets — ._pianoroll(), ._scope(), ._punchcard(), etc. */
  if (widgets && _updateWidgets) {
    const blocks = (widgets as { type: string }[]).filter((w) => w.type !== 'slider');
    if (blocks.length > 0) {
      try {
        _updateWidgets(view, blocks);
      } catch (err) {
        console.warn('[InlineWidgets] Block widget update failed:', err);
      }
    }
  }

  /* Update mini-notation highlighting locations */
  if (miniLocations && _updateMiniLocations) {
    try {
      _updateMiniLocations(view, miniLocations);
    } catch (err) {
      console.warn('[InlineWidgets] Mini-location update failed:', err);
    }
  }
}
