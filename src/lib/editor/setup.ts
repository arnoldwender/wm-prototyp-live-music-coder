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
import { getThemeById } from './themes';
import type { EditorTheme } from './themes';
import type { Extension } from '@codemirror/state';

/** Base CodeMirror extensions shared across all engine modes.
 *  Accepts an optional theme ID — when provided, uses the matching
 *  theme from themes.ts instead of the hardcoded purple default. */
export function getBaseExtensions(themeId?: string): Extension[] {
  /* Resolve theme: use themed variant when ID is provided, else legacy default */
  let themeChrome: Extension;
  let themeHighlight: Extension;
  if (themeId) {
    const resolved: EditorTheme = getThemeById(themeId);
    themeChrome = resolved.chrome;
    themeHighlight = resolved.highlight;
  } else {
    themeChrome = darkTheme;
    themeHighlight = darkHighlight;
  }

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

    /* Theme + syntax highlighting — dynamic when themeId provided */
    themeChrome,
    themeHighlight,

    /* 2-space tabs for music code readability */
    EditorState.tabSize.of(2),
  ];
}
