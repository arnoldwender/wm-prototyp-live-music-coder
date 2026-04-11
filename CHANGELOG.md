# Changelog

All notable changes to [Live Music Coder](https://live-music-coder.pro) are documented here.

This file is auto-generated from `src/data/changelog-library.ts` — do not edit manually.
Run `npx tsx scripts/sync-changelog.ts` to regenerate.

The format follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.2] - 2026-04-11

### Added

- **MIDI keyboard input via @strudel/midi CDN** ([#43](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/43)) — Added full MIDI keyboard support through `@strudel/midi` loaded via CDN.
- **Full Strudel feature parity** ([#27](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/27)) — Complete Strudel parity: slider with `sliderWithID` exposed globally,
- **DAW-quality piano roll rewrite** ([#17](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/17)) — Rewrote the piano roll from scratch to match DAW standards.
- **Solo/mute keyboard shortcuts** ([#25](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/25)) — Solo and mute shortcuts wired into the editor.
- **Clock sync for multi-tab jam sessions** ([#27](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/27)) — Strudel `createParams` and clock sync allow multiple browser
- **Live mode 150ms, download code, MIDI CC monitor** ([#31](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/31)) — Live evaluation debounce reduced to 150ms for near-instant
- **7 visualizers: punchcard, spiral, pitchwheel added** ([#21](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/21)) — The visualizer dashboard now has 7 Canvas 2D renderers:
- **Settings panel with 4 themes, vim mode, zen mode** ([#22](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/22)) — New settings panel with 4 editor themes, configurable font size,
- **Console panel, sample import, gamepad API** ([#20](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/20)) — Added three new modules: a console panel for `console.log` output

### Content

- **190+ code examples across all engines** ([#34](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/34)) — The example library now contains over 190 patterns: 7 MIDI input,
- **43 curated sessions across 10 genres** ([#16](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/16)) — Built a library of 43 AI-composed live coding sessions spanning

### Fixed

- **CSP fix for AudioWorklet and inline widgets** ([#30](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/30)) — Fixed Content Security Policy to allow `data:` URIs required by

## [1.0.2] - 2026-04-09

### Release

- **v1.0.2 — Sessions, i18n, Electron UX fixes** — Sessions collection with curated AI-composed live coding pieces.

### Added

- **i18n: Sessions pages translated to DE/EN/ES** — All hardcoded strings in the Sessions listing and detail pages

### Fixed

- **Editor handoff fix — router state replaces URL hash** — HashRouter was clobbering the code fragment when navigating from

## [1.0.1] - 2026-04-09

### Release

- **v1.0.1 — Electron 41, security hardening** — Upgraded Electron 33 to 41 (fixes 17 CVEs). Fixed 11 production

### Fixed

- **Electron 33 to 41 upgrade — 17 CVEs fixed** — Security upgrade from Electron 33 to 41, resolving 17 known

## [1.0.0] - 2026-04-09

### Release

- **v1.0.0 — Initial public release** — First public release of Live Music Coder: a browser-based and

---

Copyright (c) 2026 [Arnold Wender](https://arnoldwender.com) / [Wender Media](https://www.wendermedia.com)
