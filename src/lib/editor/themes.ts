/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Editor theme definitions — multiple dark themes for the
   Settings panel theme selector. Each theme provides both
   chrome (EditorView.theme) and syntax highlighting.
   ────────────────────────────────────────────────────────── */

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

export interface EditorTheme {
  id: string;
  name: string;
  chrome: Extension;
  highlight: Extension;
}

/* ── Purple (default) ─────────────────────────────────── */

const purpleChrome = EditorView.theme({
  '&': { backgroundColor: '#09090b', color: '#fafafa', height: '100%' },
  '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace", fontSize: '14px', lineHeight: '1.6', caretColor: '#a855f7' },
  '.cm-cursor': { borderLeftColor: '#a855f7', borderLeftWidth: '2px' },
  '.cm-activeLine': { backgroundColor: '#18181b' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: '#3f3f46 !important' },
  '.cm-gutters': { backgroundColor: '#09090b', color: '#71717a', borderRight: '1px solid #27272a' },
  '.cm-activeLineGutter': { backgroundColor: '#18181b', color: '#a1a1aa' },
  '.cm-matchingBracket': { backgroundColor: '#3f3f46', outline: '1px solid #a855f7' },
  '.cm-tooltip': { backgroundColor: '#27272a', color: '#fafafa', border: '1px solid #3f3f46' },
  '.cm-tooltip-autocomplete': { backgroundColor: '#27272a' },
  '.cm-completionIcon': { color: '#a855f7' },
}, { dark: true });

const purpleHighlight = syntaxHighlighting(HighlightStyle.define([
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
]));

/* ── Amber ────────────────────────────────────────────── */

const amberChrome = EditorView.theme({
  '&': { backgroundColor: '#0c0a09', color: '#fafaf9', height: '100%' },
  '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace", fontSize: '14px', lineHeight: '1.6', caretColor: '#f59e0b' },
  '.cm-cursor': { borderLeftColor: '#f59e0b', borderLeftWidth: '2px' },
  '.cm-activeLine': { backgroundColor: '#1c1917' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: '#44403c !important' },
  '.cm-gutters': { backgroundColor: '#0c0a09', color: '#78716c', borderRight: '1px solid #292524' },
  '.cm-activeLineGutter': { backgroundColor: '#1c1917', color: '#a8a29e' },
  '.cm-matchingBracket': { backgroundColor: '#44403c', outline: '1px solid #f59e0b' },
  '.cm-tooltip': { backgroundColor: '#292524', color: '#fafaf9', border: '1px solid #44403c' },
  '.cm-tooltip-autocomplete': { backgroundColor: '#292524' },
  '.cm-completionIcon': { color: '#f59e0b' },
}, { dark: true });

const amberHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: '#fbbf24' },
  { tag: tags.string, color: '#a3e635' },
  { tag: tags.number, color: '#fb923c' },
  { tag: tags.bool, color: '#fb923c' },
  { tag: tags.null, color: '#78716c' },
  { tag: tags.comment, color: '#78716c', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#93c5fd' },
  { tag: tags.function(tags.variableName), color: '#fde68a' },
  { tag: tags.definition(tags.variableName), color: '#5eead4' },
  { tag: tags.propertyName, color: '#fca5a5' },
  { tag: tags.operator, color: '#a8a29e' },
  { tag: tags.punctuation, color: '#78716c' },
  { tag: tags.typeName, color: '#5eead4' },
]));

/* ── Cyan ─────────────────────────────────────────────── */

const cyanChrome = EditorView.theme({
  '&': { backgroundColor: '#042f2e', color: '#f0fdfa', height: '100%' },
  '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace", fontSize: '14px', lineHeight: '1.6', caretColor: '#22d3ee' },
  '.cm-cursor': { borderLeftColor: '#22d3ee', borderLeftWidth: '2px' },
  '.cm-activeLine': { backgroundColor: '#083344' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: '#164e63 !important' },
  '.cm-gutters': { backgroundColor: '#042f2e', color: '#5eead4', borderRight: '1px solid #134e4a' },
  '.cm-activeLineGutter': { backgroundColor: '#083344', color: '#99f6e4' },
  '.cm-matchingBracket': { backgroundColor: '#164e63', outline: '1px solid #22d3ee' },
  '.cm-tooltip': { backgroundColor: '#134e4a', color: '#f0fdfa', border: '1px solid #164e63' },
  '.cm-tooltip-autocomplete': { backgroundColor: '#134e4a' },
  '.cm-completionIcon': { color: '#22d3ee' },
}, { dark: true });

const cyanHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: '#67e8f9' },
  { tag: tags.string, color: '#86efac' },
  { tag: tags.number, color: '#fde68a' },
  { tag: tags.bool, color: '#fde68a' },
  { tag: tags.null, color: '#5eead4' },
  { tag: tags.comment, color: '#5eead4', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#a5f3fc' },
  { tag: tags.function(tags.variableName), color: '#99f6e4' },
  { tag: tags.definition(tags.variableName), color: '#fbcfe8' },
  { tag: tags.propertyName, color: '#fca5a5' },
  { tag: tags.operator, color: '#99f6e4' },
  { tag: tags.punctuation, color: '#5eead4' },
  { tag: tags.typeName, color: '#fbcfe8' },
]));

/* ── Green (Matrix) ───────────────────────────────────── */

const greenChrome = EditorView.theme({
  '&': { backgroundColor: '#020c02', color: '#d1fae5', height: '100%' },
  '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace", fontSize: '14px', lineHeight: '1.6', caretColor: '#22c55e' },
  '.cm-cursor': { borderLeftColor: '#22c55e', borderLeftWidth: '2px' },
  '.cm-activeLine': { backgroundColor: '#052e16' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: '#14532d !important' },
  '.cm-gutters': { backgroundColor: '#020c02', color: '#4ade80', borderRight: '1px solid #14532d' },
  '.cm-activeLineGutter': { backgroundColor: '#052e16', color: '#86efac' },
  '.cm-matchingBracket': { backgroundColor: '#14532d', outline: '1px solid #22c55e' },
  '.cm-tooltip': { backgroundColor: '#14532d', color: '#d1fae5', border: '1px solid #166534' },
  '.cm-tooltip-autocomplete': { backgroundColor: '#14532d' },
  '.cm-completionIcon': { color: '#22c55e' },
}, { dark: true });

const greenHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: '#4ade80' },
  { tag: tags.string, color: '#a3e635' },
  { tag: tags.number, color: '#fbbf24' },
  { tag: tags.bool, color: '#fbbf24' },
  { tag: tags.null, color: '#4ade80' },
  { tag: tags.comment, color: '#166534', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#86efac' },
  { tag: tags.function(tags.variableName), color: '#bbf7d0' },
  { tag: tags.definition(tags.variableName), color: '#67e8f9' },
  { tag: tags.propertyName, color: '#fca5a5' },
  { tag: tags.operator, color: '#86efac' },
  { tag: tags.punctuation, color: '#4ade80' },
  { tag: tags.typeName, color: '#67e8f9' },
]));

/* ── Theme registry ───────────────────────────────────── */

export const EDITOR_THEMES: EditorTheme[] = [
  { id: 'purple', name: 'Purple (Default)', chrome: purpleChrome, highlight: purpleHighlight },
  { id: 'amber', name: 'Amber', chrome: amberChrome, highlight: amberHighlight },
  { id: 'cyan', name: 'Cyan', chrome: cyanChrome, highlight: cyanHighlight },
  { id: 'green', name: 'Matrix', chrome: greenChrome, highlight: greenHighlight },
];

/** Get theme by ID, falls back to purple */
export function getThemeById(id: string): EditorTheme {
  return EDITOR_THEMES.find((t) => t.id === id) ?? EDITOR_THEMES[0];
}
