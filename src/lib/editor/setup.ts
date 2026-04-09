/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   CodeMirror 6 base setup — shared extensions for all
   engine modes. Includes visual chrome, editing helpers,
   keybindings, dark theme, and tab configuration.
   ────────────────────────────────────────────────────────── */

import { keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching, indentOnInput, foldGutter, foldKeymap } from '@codemirror/language';
import { darkTheme, darkHighlight } from './theme';
import type { Extension } from '@codemirror/state';

/** Base CodeMirror extensions shared across all engine modes */
export function getBaseExtensions(): Extension[] {
  return [
    /* Visual chrome */
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    drawSelection(),
    highlightActiveLine(),
    rectangularSelection(),
    crosshairCursor(),
    highlightSelectionMatches(),

    /* Editing helpers */
    history(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    /* autocompletion() is provided by engine-specific completions.ts — omitted here to avoid conflicts */
    foldGutter(),

    /* Keybindings — order matters for priority */
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),

    /* Dark theme + syntax highlighting */
    darkTheme,
    darkHighlight,

    /* 2-space tabs for music code readability */
    EditorState.tabSize.of(2),
  ];
}
