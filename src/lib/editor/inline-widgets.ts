/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Inline widget integration — bridges @strudel/codemirror's
   widgetPlugin with our StrudelEditor. After each evaluation,
   updates CodeMirror block decorations for ._pianoroll(),
   ._scope(), ._punchcard(), ._spiral(), ._pitchwheel().

   The widgetPlugin from @strudel/codemirror creates <canvas>
   elements INSIDE the CodeMirror editor as block decorations.
   The transpiler detects ._method() calls and records widget
   metadata (type, position, options). After eval, we dispatch
   those widgets to the CM6 StateField via updateWidgets().
   ────────────────────────────────────────────────────────── */

import type { EditorView } from '@codemirror/view';

/** Strudel CM module — dynamically imported */
let strudelCM: {
  updateWidgets?: (view: EditorView, widgets: unknown[]) => void;
  updateSliderWidgets?: (view: EditorView, sliders: unknown[]) => void;
  registerWidget?: (type: string, fn?: unknown) => void;
} | null = null;

/** Cache the module reference */
export function setStrudelCM(mod: unknown): void {
  strudelCM = mod as typeof strudelCM;
}

/**
 * After evaluation, extract widget metadata from the transpiler output
 * and dispatch inline widget decorations to CodeMirror.
 *
 * Called from StrudelEditor after repl.evaluate() succeeds.
 * The transpiler output includes `widgets` array with entries like:
 * { type: 'pianoroll', from: 42, to: 60, options: { fold: 1 } }
 */
export function updateInlineWidgets(
  view: EditorView,
  widgets: unknown[] | undefined,
): void {
  if (!strudelCM?.updateWidgets || !widgets?.length) return;

  try {
    /* Separate sliders from block widgets */
    const sliders = (widgets as any[]).filter((w) => w.type === 'slider');
    const blocks = (widgets as any[]).filter((w) => w.type !== 'slider');

    /* Update slider inline decorations */
    if (sliders.length > 0 && strudelCM.updateSliderWidgets) {
      strudelCM.updateSliderWidgets(view, sliders);
    }

    /* Update block widget decorations (pianoroll, scope, punchcard, etc.) */
    if (blocks.length > 0) {
      strudelCM.updateWidgets(view, blocks);
    }
  } catch (err) {
    console.warn('[InlineWidgets] Failed to update widgets:', err);
  }
}

/**
 * Register custom widget types with the Strudel transpiler.
 * This tells the AST walker to detect ._customViz() calls
 * and include them in the widget metadata.
 */
export function registerCustomWidgets(): void {
  if (!strudelCM?.registerWidget) return;

  /* These are already registered by @strudel/codemirror:
   * pianoroll, punchcard, scope, spiral, pitchwheel, spectrum
   * We only need to register if we add NEW custom widget types. */
}
