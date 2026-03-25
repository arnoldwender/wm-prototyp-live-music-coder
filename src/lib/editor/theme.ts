/* ──────────────────────────────────────────────────────────
   CodeMirror 6 dark theme — matches our design tokens.
   Background zinc-950, purple accents for caret/brackets,
   syntax colors tuned for music coding readability.
   ────────────────────────────────────────────────────────── */

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

/** Dark editor chrome — backgrounds, gutters, cursor, selection */
export const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#09090b',
    color: '#fafafa',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    fontSize: '14px',
    lineHeight: '1.6',
    caretColor: '#a855f7',
  },
  '.cm-cursor': {
    borderLeftColor: '#a855f7',
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: '#18181b',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: '#3f3f46 !important',
  },
  '.cm-gutters': {
    backgroundColor: '#09090b',
    color: '#71717a',
    borderRight: '1px solid #27272a',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#18181b',
    color: '#a1a1aa',
  },
  '.cm-foldGutter': {
    color: '#71717a',
  },
  '.cm-matchingBracket': {
    backgroundColor: '#3f3f46',
    outline: '1px solid #a855f7',
  },
  '.cm-searchMatch': {
    backgroundColor: '#854d0e44',
  },
  '.cm-tooltip': {
    backgroundColor: '#27272a',
    color: '#fafafa',
    border: '1px solid #3f3f46',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#27272a',
  },
  '.cm-completionIcon': {
    color: '#a855f7',
  },
}, { dark: true });

/** Syntax highlighting — purple keywords, green strings, yellow numbers */
export const darkHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: '#c084fc' },
  { tag: tags.string, color: '#86efac' },
  { tag: tags.number, color: '#fbbf24' },
  { tag: tags.bool, color: '#fbbf24' },
  { tag: tags.null, color: '#71717a' },
  { tag: tags.comment, color: '#71717a', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#93c5fd' },
  { tag: tags.function(tags.variableName), color: '#c4b5fd' },
  { tag: tags.definition(tags.variableName), color: '#67e8f9' },
  { tag: tags.propertyName, color: '#fca5a5' },
  { tag: tags.operator, color: '#a1a1aa' },
  { tag: tags.punctuation, color: '#71717a' },
  { tag: tags.typeName, color: '#67e8f9' },
  { tag: tags.className, color: '#67e8f9' },
  { tag: tags.regexp, color: '#fca5a5' },
]));
