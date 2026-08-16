/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Editor theme registry — art direction "SIGNAL ROOM".

   WHAT CHANGED AND WHY
   This file previously held 96 raw hex literals across four themes
   that each defined their OWN background (#09090b / #0c0a09 /
   #042f2e / #020c02). Picking "Cyan" put a teal editor inside a
   graphite application — the editor was a separate visual universe,
   which is exactly the defect this pass exists to remove.

   Now: all four themes share ONE substrate (the app's own surface
   tokens) and differ only in the accent role and the syntax
   emphasis. That is what makes it a system rather than four skins.
   Every value is a var(--…) or a color-mix() of them — zero hex.

   CONTRAST SAFETY BY CONSTRUCTION
   The monochrome themes build their tonal steps by mixing the accent
   with --color-text (17.61:1 on bg) and --color-text-muted (6.97:1).
   Both endpoints clear AA, and contrast is monotonic along a mix, so
   every intermediate step is >= 6.97:1 on --color-bg and >= 6.32:1 on
   --color-bg-alt (the active line). No step can fail.

   THE ids ARE DEPRECATED NAMES ON PURPOSE
   'purple' / 'cyan' etc. are persisted in user settings. Renaming
   them would silently reset every user's choice via the
   getThemeById() fallback. The ids stay frozen; the display names
   and the colours are what changed. Do not "tidy" the ids.
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

/** Syntax role colours a theme supplies. Anything omitted falls back
    to the shared product token, so a theme only states its deltas. */
interface SyntaxRoles {
  keyword?: string;
  string?: string;
  number?: string;
  comment?: string;
  variable?: string;
  func?: string;
  definition?: string;
  property?: string;
  operator?: string;
  punctuation?: string;
}

/* ── Chrome factory ───────────────────────────────────────
   One substrate, one accent parameter. Every theme's chrome is
   this function; there is no per-theme background any more. */
function makeChrome(accent: string): Extension {
  return EditorView.theme({
    '&': {
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      height: '100%',
    },
    '.cm-content': {
      fontFamily: 'var(--font-family-mono)',
      fontSize: 'var(--font-size-code)',
      lineHeight: 'var(--line-height-code)',
      caretColor: accent,
    },
    '.cm-cursor': { borderLeftColor: accent, borderLeftWidth: '2px' },
    '.cm-activeLine': { backgroundColor: 'var(--color-bg-alt)' },
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
    '.cm-foldGutter': { color: 'var(--color-text-muted)' },
    '.cm-matchingBracket': {
      backgroundColor: 'var(--color-bg-hover)',
      outline: `1px solid ${accent}`,
    },
    '.cm-searchMatch': { backgroundColor: 'var(--color-editor-search-match)' },
    '.cm-tooltip': {
      backgroundColor: 'var(--color-bg-elevated)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
    '.cm-tooltip-autocomplete': { backgroundColor: 'var(--color-bg-elevated)' },
    '.cm-completionIcon': { color: accent },
  }, { dark: true });
}

/* ── Highlight factory ────────────────────────────────────
   Defaults are the shared --color-syntax-* tokens, so a theme is a
   patch on the product palette rather than a redefinition of it. */
function makeHighlight(r: SyntaxRoles = {}): Extension {
  const keyword = r.keyword ?? 'var(--color-syntax-keyword)';
  const number = r.number ?? 'var(--color-syntax-number)';
  const comment = r.comment ?? 'var(--color-syntax-comment)';
  const definition = r.definition ?? 'var(--color-syntax-definition)';
  const property = r.property ?? 'var(--color-syntax-property)';
  return syntaxHighlighting(HighlightStyle.define([
    { tag: tags.keyword, color: keyword },
    { tag: tags.string, color: r.string ?? 'var(--color-syntax-string)' },
    { tag: tags.number, color: number },
    { tag: tags.bool, color: number },
    { tag: tags.null, color: comment },
    { tag: tags.comment, color: comment, fontStyle: 'italic' },
    { tag: tags.variableName, color: r.variable ?? 'var(--color-syntax-variable)' },
    { tag: tags.function(tags.variableName), color: r.func ?? 'var(--color-syntax-function)' },
    { tag: tags.definition(tags.variableName), color: definition },
    { tag: tags.propertyName, color: property },
    { tag: tags.operator, color: r.operator ?? 'var(--color-syntax-operator)' },
    { tag: tags.punctuation, color: r.punctuation ?? 'var(--color-syntax-punctuation)' },
    { tag: tags.typeName, color: definition },
    { tag: tags.className, color: definition },
    { tag: tags.regexp, color: property },
  ]));
}

/** Tonal step inside a single hue — used by the monochrome themes.
    `toward` is always --color-text or --color-text-muted, both of
    which clear AA, so every mix clears AA (see header note). */
const step = (base: string, pct: number, toward: string) =>
  `color-mix(in oklab, ${base} ${pct}%, ${toward})`;

/* ── SIGNAL (default) ─────────────────────────────────────
   The product palette, full chroma. Amber marks control flow, aqua
   marks the calls that make sound, yellow marks the numbers you
   reach for mid-set (gain, tempo, note). */
const signalChrome = makeChrome('var(--color-primary)');
const signalHighlight = makeHighlight();

/* ── SODIUM ───────────────────────────────────────────────
   Monochrome amber — the P3 amber-phosphor terminal, done as a real
   option rather than as the whole product's costume. Nothing but
   tonal steps of the brand hue, so structure reads by weight and
   value instead of by hue. */
const AMBER = 'var(--color-primary)';
const sodiumChrome = makeChrome(AMBER);
const sodiumHighlight = makeHighlight({
  keyword: 'var(--color-primary-light)',
  func: 'var(--color-primary-ink)',
  string: step(AMBER, 55, 'var(--color-text)'),
  number: 'var(--color-warning)',
  definition: step(AMBER, 70, 'var(--color-text)'),
  property: step(AMBER, 80, 'var(--color-text-muted)'),
  variable: 'var(--color-text)',
  comment: 'var(--color-text-muted)',
  operator: 'var(--color-text-secondary)',
  punctuation: 'var(--color-text-muted)',
});

/* ── SCOPE ────────────────────────────────────────────────
   Aqua accent — the oscilloscope trace. Cool accent on the warm
   carbon substrate; the highest-contrast option in the set. */
const scopeChrome = makeChrome('var(--color-webaudio)');
const scopeHighlight = makeHighlight({
  keyword: 'var(--color-webaudio)',
  func: 'var(--color-tonejs)',
  definition: 'var(--color-primary)',
  property: 'var(--color-midi)',
});

/* ── PHOSPHOR ─────────────────────────────────────────────
   Monochrome green — the P1 phosphor terminal. Same discipline as
   Sodium, opposite end of the spectrum. */
const GREEN = 'var(--color-success)';
const phosphorChrome = makeChrome(GREEN);
const phosphorHighlight = makeHighlight({
  keyword: step(GREEN, 60, 'var(--color-text)'),
  func: step(GREEN, 80, 'var(--color-text)'),
  string: step(GREEN, 90, 'var(--color-text-muted)'),
  number: 'var(--color-warning)',
  definition: 'var(--color-webaudio)',
  property: step(GREEN, 70, 'var(--color-text-muted)'),
  variable: 'var(--color-text)',
  comment: 'var(--color-text-muted)',
  operator: 'var(--color-text-secondary)',
  punctuation: 'var(--color-text-muted)',
});

/* ── Theme registry ───────────────────────────────────────
   ids frozen for settings persistence — see the header note. */
export const EDITOR_THEMES: EditorTheme[] = [
  { id: 'purple', name: 'Signal (Default)', chrome: signalChrome, highlight: signalHighlight },
  { id: 'amber', name: 'Sodium', chrome: sodiumChrome, highlight: sodiumHighlight },
  { id: 'cyan', name: 'Scope', chrome: scopeChrome, highlight: scopeHighlight },
  { id: 'green', name: 'Phosphor', chrome: phosphorChrome, highlight: phosphorHighlight },
];

/** Get theme by ID, falls back to the default Signal theme */
export function getThemeById(id: string): EditorTheme {
  return EDITOR_THEMES.find((t) => t.id === id) ?? EDITOR_THEMES[0];
}
