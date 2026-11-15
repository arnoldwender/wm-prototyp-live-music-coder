# Sample Library

Default percussion, synth, and instrument samples are loaded from a pinned, immutable snapshot of [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) (`c74fc80f8db8038f6a33648ffef5ac00a07ad402`, GPL-3.0, compatible with this application's AGPL-3.0-or-later license).

## Privacy & Supply-Chain Architecture
- **Manifest:** `public/samples/dirt-samples.json` is served directly from first-party static assets (`'self'`).
- **Audio files:** Individual `.wav` variations are fetched lazily on demand through the first-party `/dirt-samples/*` edge proxy (`netlify.toml` in production, `vite.config.ts` in local development), pinned to commit `c74fc80f8db8038f6a33648ffef5ac00a07ad402`.
- **Zero unconsented third-party tracking:** Opening the editor or playing built-in patterns never transmits visitor IP addresses directly to GitHub servers.

## Adding Custom Local Samples
1. Place `.wav` files in subdirectories by category (e.g., `drums/`, `bass/`, `fx/`).
2. Add or update entries in a local `strudel.json` mapping file.
3. Load via `samples('/samples/strudel.json')` in the editor.
