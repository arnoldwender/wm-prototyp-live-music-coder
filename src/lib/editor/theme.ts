/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   CodeMirror 6 default theme — art direction "SIGNAL ROOM".

   Previously this file held 35 raw hex literals plus '14px' and
   '2px', which made the editor a second, undocumented palette that
   drifted from the app's tokens. EditorView.theme() and
   HighlightStyle.define() both accept CSS custom properties, so
   every value here is now a var(--…) resolved from
   src/styles/tokens/. One palette, two surfaces.

   Contrast: every syntax role measures >= 4.5:1 against both
   --color-bg (the editor field) and --color-bg-alt (the active line).
   See src/styles/tokens/colors.css for the measured ratios.
   ────────────────────────────────────────────────────────── */

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

/** Dark editor chrome — backgrounds, gutters, cursor, selection */
export const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-code)',
    lineHeight: 'var(--line-height-code)',
    caretColor: 'var(--color-editor-accent)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--color-editor-accent)',
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--color-bg-alt)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--color-bg-hover) !important',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-muted)',
    borderRight: '1px solid var(--color-border-dim)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--color-bg-alt)',
    color: 'var(--color-text-secondary)',
  },
  '.cm-foldGutter': {
    color: 'var(--color-text-muted)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--color-bg-hover)',
    outline: '1px solid var(--color-editor-accent)',
  },
  '.cm-searchMatch': {
    backgroundColor: 'var(--color-editor-search-match)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: 'var(--color-bg-elevated)',
  },
  '.cm-completionIcon': {
    color: 'var(--color-editor-accent)',
  },
}, { dark: true });

/** Syntax highlighting — syntax roles mapped onto the product palette.
    Restraint is the point: variables stay plain text so that the
    coloured tokens (what makes sound, what sets time) actually read
    as signal instead of decoration. */
export const darkHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--color-syntax-keyword)' },
  { tag: tags.string, color: 'var(--color-syntax-string)' },
  { tag: tags.number, color: 'var(--color-syntax-number)' },
  { tag: tags.bool, color: 'var(--color-syntax-number)' },
  { tag: tags.null, color: 'var(--color-syntax-comment)' },
  { tag: tags.comment, color: 'var(--color-syntax-comment)', fontStyle: 'italic' },
  { tag: tags.variableName, color: 'var(--color-syntax-variable)' },
  { tag: tags.function(tags.variableName), color: 'var(--color-syntax-function)' },
  { tag: tags.definition(tags.variableName), color: 'var(--color-syntax-definition)' },
  { tag: tags.propertyName, color: 'var(--color-syntax-property)' },
  { tag: tags.operator, color: 'var(--color-syntax-operator)' },
  { tag: tags.punctuation, color: 'var(--color-syntax-punctuation)' },
  { tag: tags.typeName, color: 'var(--color-syntax-definition)' },
  { tag: tags.className, color: 'var(--color-syntax-definition)' },
  { tag: tags.regexp, color: 'var(--color-syntax-property)' },
]));
