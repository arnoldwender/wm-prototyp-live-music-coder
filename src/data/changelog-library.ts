/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Changelog library — structured release history derived from
   real git commits and pull requests.  Each entry maps to a
   meaningful milestone in the project timeline.

   Content language is English (matching the README).
   ────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */

/** High-level category for a changelog entry. */
export type ChangelogCategory =
  | 'feature'
  | 'bugfix'
  | 'content'
  | 'architecture'
  | 'community'
  | 'release'

/** Ordered list of categories for UI display. */
export const CHANGELOG_CATEGORIES: ChangelogCategory[] = [
  'release',
  'feature',
  'content',
  'bugfix',
  'architecture',
  'community',
]

/** A single changelog entry. */
export interface ChangelogEntry {
  /** Semver tag this entry belongs to, if applicable. */
  version?: string
  /** ISO calendar date (YYYY-MM-DD). */
  date: string
  /** Short headline for the entry. */
  title: string
  /** Entry category. */
  category: ChangelogCategory
  /** Markdown body with details. */
  body: string
  /** GitHub PR number, if the change went through a PR. */
  pr?: number
}

/* ══════════════════════════════════════════════════════════
   Changelog entries — newest first
   ══════════════════════════════════════════════════════════ */

export const CHANGELOG: ChangelogEntry[] = [

  /* ── Synth UI: Phase 1 + Phase 2 ────────────────────── */

  {
    date: '2026-04-12',
    title: 'Synth UI Phase 2 — Knob, FilterCurve, FilterControl',
    category: 'feature',
    body: [
      'Added three new components: a Knob atom (SVG 270° arc, pointer-drag coarse,',
      'Shift+drag fine, double-click reset), a FilterCurve atom (Canvas frequency',
      'response 20Hz–20kHz log scale, colors from CSS design tokens), and a',
      'FilterControl molecule (cutoff + resonance knobs, LP/HP/BP/Notch type',
      'buttons, live curve). Audio path: a BiquadFilterNode is inserted per-note',
      'in playOscillatorNote via setLmcFilter (window.__lmcSetFilter). Zustand',
      'stores synthFilterType, synthFilterCutoff, synthFilterResonance.',
      '19 new tests across 3 test files.',
    ].join('\n'),
    pr: 46,
  },
  {
    date: '2026-04-12',
    title: 'Synth UI Phase 1 — VirtualKeyboard, OscillatorSelector, SynthPanel',
    category: 'feature',
    body: [
      'Added an on-screen virtual keyboard and synth controls panel.',
      'VirtualKeyboard atom: 2-octave piano, QWERTY key mapping (a/w/s/e/d…),',
      'velocity from Y-position. OscillatorSelector molecule: 4 waveform radio',
      'buttons (sine/saw/square/triangle). SynthPanel organism: collapsible panel',
      'shown when a MIDI device is connected. WaveformIcon atom: SVG path icons',
      'for waveform types. Physical MIDI keyboard and VirtualKeyboard share the',
      'same playOscillatorNote path via window.__lmcPlayNote.',
      '15 new tests across 4 test files.',
    ].join('\n'),
    pr: 45,
  },

  /* ── v1.0.2 sprint: MIDI keyboard + Strudel parity ───── */

  {
    version: '1.0.2',
    date: '2026-04-11',
    title: 'MIDI keyboard input via @strudel/midi CDN',
    category: 'feature',
    body: [
      'Added full MIDI keyboard support through `@strudel/midi` loaded via CDN.',
      'The `midin()` and `midikeys()` functions are now available in the REPL scope.',
      'Getting there required 6 PRs (#39-#44): the core challenge was that bare',
      'module specifiers cannot resolve inside the eval sandbox, so the final',
      'solution loads the package through `REPL.evaluate()` which places the',
      'symbols in the correct Strudel scope.',
    ].join('\n'),
    pr: 43,
  },
  {
    date: '2026-04-11',
    title: 'Full Strudel feature parity',
    category: 'feature',
    body: [
      'Complete Strudel parity: slider with `sliderWithID` exposed globally,',
      'inline visualizer widgets (`_pianoroll`, `_scope`), xen/microtonal,',
      'soundfonts, OSC, serial, `onKey`, `createParams`, clock sync for',
      'multi-tab jam sessions, `_$:` muting syntax, and all `all()` transforms.',
    ].join('\n'),
    pr: 27,
  },
  {
    date: '2026-04-11',
    title: '190+ code examples across all engines',
    category: 'content',
    body: [
      'The example library now contains over 190 patterns: 7 MIDI input,',
      '9 synth sound design, 13 test patterns (slider, pianoroll, scope,',
      'samples, layers, filter, trance, blues, ambient, chiptune, euclidean),',
      'plus the original collection covering Strudel, Tone.js, Web Audio,',
      'and MIDI output.',
    ].join('\n'),
    pr: 34,
  },
  {
    date: '2026-04-11',
    title: 'DAW-quality piano roll rewrite',
    category: 'feature',
    body: [
      'Rewrote the piano roll from scratch to match DAW standards.',
      'Scrolling timeline, velocity-mapped colors, note labels,',
      'zoom controls, and a dark theme that integrates with the',
      'editor color scheme via `var(--color-*)` tokens.',
    ].join('\n'),
    pr: 17,
  },
  {
    date: '2026-04-10',
    title: '7 visualizers: punchcard, spiral, pitchwheel added',
    category: 'feature',
    body: [
      'The visualizer dashboard now has 7 Canvas 2D renderers:',
      'waveform, spectrum, timeline (shipped in v1.0.0), plus new',
      'punchcard (PR #18), spiral and pitchwheel (PR #21).',
      'All draw at 60fps using `requestAnimationFrame` and share',
      'a single `AnalyserNode` tap.',
    ].join('\n'),
    pr: 21,
  },
  {
    date: '2026-04-10',
    title: 'Settings panel with 4 themes, vim mode, zen mode',
    category: 'feature',
    body: [
      'New settings panel with 4 editor themes, configurable font size,',
      'vim keybindings toggle, zen mode (distraction-free fullscreen),',
      'and persistent preference storage via `localStorage`.',
    ].join('\n'),
    pr: 22,
  },
  {
    date: '2026-04-10',
    title: 'Console panel, sample import, gamepad API',
    category: 'feature',
    body: [
      'Added three new modules: a console panel for `console.log` output',
      'from evaluated code, a drag-and-drop sample import zone for custom',
      'audio files, and Gamepad API bindings for hardware controller input.',
    ].join('\n'),
    pr: 20,
  },
  {
    date: '2026-04-11',
    title: 'Solo/mute keyboard shortcuts',
    category: 'feature',
    body: [
      'Solo and mute shortcuts wired into the editor.',
      'Uses the Strudel `_$:` muting syntax under the hood.',
      'Part of the full wiring sprint that also connected',
      '`@strudel/draw`, font size, word wrap, and flash field.',
    ].join('\n'),
    pr: 25,
  },
  {
    date: '2026-04-11',
    title: 'Clock sync for multi-tab jam sessions',
    category: 'feature',
    body: [
      'Strudel `createParams` and clock sync allow multiple browser',
      'tabs to lock to the same tempo. This is the foundation for',
      'collaborative live coding sessions across windows.',
    ].join('\n'),
    pr: 27,
  },
  {
    date: '2026-04-11',
    title: 'CSP fix for AudioWorklet and inline widgets',
    category: 'bugfix',
    body: [
      'Fixed Content Security Policy to allow `data:` URIs required by',
      'the Strudel AudioWorklet. Also wired inline widget methods',
      '(`pianoroll`, `scope`, `slider`) onto `Pattern.prototype` so',
      'they resolve correctly in the eval sandbox.',
    ].join('\n'),
    pr: 30,
  },
  {
    date: '2026-04-11',
    title: 'Live mode 150ms, download code, MIDI CC monitor',
    category: 'feature',
    body: [
      'Live evaluation debounce reduced to 150ms for near-instant',
      'feedback. Added code download as `.strudel` file and a MIDI',
      'panel showing real-time CC values from connected controllers.',
    ].join('\n'),
    pr: 31,
  },

  /* ── 43 curated sessions ─────────────────────────────── */

  {
    date: '2026-04-10',
    title: '43 curated sessions across 10 genres',
    category: 'content',
    body: [
      'Built a library of 43 AI-composed live coding sessions spanning',
      '10 genre categories: Ambient, Blues, Deep Work, Dub, Electronic,',
      'Lo-Fi, Narrative, Retro, Techno, and Trance. Each session has',
      'composer notes, movement breakdowns, BPM, and duration metadata.',
      'Sessions are filterable by genre, searchable, and sortable.',
    ].join('\n'),
    pr: 16,
  },

  /* ── v1.0.2 release ──────────────────────────────────── */

  {
    version: '1.0.2',
    date: '2026-04-09',
    title: 'v1.0.2 — Sessions, i18n, Electron UX fixes',
    category: 'release',
    body: [
      'Sessions collection with curated AI-composed live coding pieces.',
      'i18n translations for Sessions pages (DE/EN/ES). Shared SiteNav',
      'extraction. Editor handoff via router state instead of URL hash.',
      'Electron UX: hide Download CTA in desktop app, fix window chrome',
      'and updater ASI crash, fix black screen (allow-jit entitlement).',
    ].join('\n'),
  },
  {
    date: '2026-04-09',
    title: 'i18n: Sessions pages translated to DE/EN/ES',
    category: 'feature',
    body: [
      'All hardcoded strings in the Sessions listing and detail pages',
      'are now pulled from the i18n namespace `sessions.*`, with full',
      'German, English, and Spanish translations.',
    ].join('\n'),
  },
  {
    date: '2026-04-09',
    title: 'Editor handoff fix — router state replaces URL hash',
    category: 'bugfix',
    body: [
      'HashRouter was clobbering the code fragment when navigating from',
      'Sessions to the Editor. Switched to passing code via React Router',
      'state object, which survives the route transition cleanly.',
    ].join('\n'),
  },

  /* ── v1.0.1 release ──────────────────────────────────── */

  {
    version: '1.0.1',
    date: '2026-04-09',
    title: 'v1.0.1 — Electron 41, security hardening',
    category: 'release',
    body: [
      'Upgraded Electron 33 to 41 (fixes 17 CVEs). Fixed 11 production',
      'bugs: router, CSP, entitlements, updater, and design token issues.',
      'Added Apple code signing and notarization configuration.',
      'Fixed Vite path traversal vulnerabilities via npm audit fix.',
    ].join('\n'),
  },
  {
    date: '2026-04-09',
    title: 'Electron 33 to 41 upgrade — 17 CVEs fixed',
    category: 'bugfix',
    body: [
      'Security upgrade from Electron 33 to 41, resolving 17 known',
      'CVEs. Personal identity scrubbed from code signing config.',
    ].join('\n'),
  },

  /* ── v1.0.0 initial release ──────────────────────────── */

  {
    version: '1.0.0',
    date: '2026-04-09',
    title: 'v1.0.0 — Initial public release',
    category: 'release',
    body: [
      'First public release of Live Music Coder: a browser-based and',
      'desktop live coding music IDE.',
      '',
      'Core features shipped in v1.0.0:',
      '- 4 audio engines: Strudel, Tone.js, Web Audio API, MIDI',
      '- CodeMirror 6 editor with multi-tab support and live evaluation',
      '- Visual node graph (React Flow) for block-based composition',
      '- 3 real-time Canvas 2D visualizers (waveform, spectrum, timeline)',
      '- Audio recording with WebM export',
      '- Code sharing via URL compression and GitHub Gist integration',
      '- i18n support for German, English, and Spanish',
      '- Electron desktop app for macOS (arm64 + x64) with auto-update',
      '- Zustand state management with undo/redo history',
      '- Design tokens and dark mode base via CSS custom properties',
    ].join('\n'),
  },
]

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

/**
 * Look up all changelog entries that belong to a given semver version.
 * Returns an empty array if no entries match.
 */
export function getChangelogByVersion(version: string): ChangelogEntry[] {
  return CHANGELOG.filter((entry) => entry.version === version)
}
