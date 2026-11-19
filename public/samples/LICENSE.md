# Sample & SoundFont Library

Default percussion, synth, and instrument samples are loaded from a pinned, immutable snapshot of [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) (`c74fc80f8db8038f6a33648ffef5ac00a07ad402`, GPL-3.0, compatible with this application's AGPL-3.0-or-later license).

General MIDI instruments (`125` `gm_*` voices) use the [FluidR3_GM](https://github.com/felixroos/webaudiofontdata) soundfont pack (Frank Wen Copyright © 2000–2002, 2008; mono/adaptation Michael Cowgill Copyright © 2014–2016; WebAudioFont JS packaging Srgy Surkv Copyright © 2017 — MIT License), pinned to immutable commit `23ca907d4370a04fd89ca483a92915e4d6159ab9`.

## Privacy & Supply-Chain Architecture
- **Manifest:** `public/samples/dirt-samples.json` is served directly from first-party static assets (`'self'`).
- **Audio & SoundFont files:** Individual `.wav` variations are fetched lazily on demand through `/dirt-samples/*` (pinned to `c74fc80f8db8038f6a33648ffef5ac00a07ad402`) and General MIDI presets through `/soundfonts/*` (pinned to `23ca907d4370a04fd89ca483a92915e4d6159ab9`) via our first-party edge proxy (`netlify.toml` in production, `vite.config.ts` in local development).
- **Zero unconsented third-party tracking:** Opening the editor or playing built-in Dirt-Samples or `gm_*` SoundFonts never transmits visitor IP addresses directly to GitHub servers.

## Adding Custom Local Samples
1. Place `.wav` files in subdirectories by category (e.g., `drums/`, `bass/`, `fx/`).
2. Add or update entries in a local `strudel.json` mapping file.
3. Load via `samples('/samples/strudel.json')` in the editor.
