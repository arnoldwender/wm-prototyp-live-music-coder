# Design System, Branding & Asset Archive — Live Music Coder

Art direction: **SIGNAL ROOM** (dark-field studio instrument surface, introduced in commit `3b05be5`).

This directory is the canonical design, branding, color, typography, layout, and asset-recipe archive for **Live Music Coder** (`https://live-music-coder.pro`). Every value documented here is mechanically transcribed from — and machine-checked against — the live implementation files in `src/`, `public/`, `electron/`, and `scripts/`.

## Archive Index

| Document | Contents | Primary Source of Truth in Code |
| --- | --- | --- |
| [`BRANDING.md`](BRANDING.md) | **SIGNAL ROOM** art direction, brand voice, attribution boundary, level-meter mark geometry across all 4 surfaces (in-app, browser tab, maskable PWA, macOS tray), and non-color 4-engine identity grammar | [`src/components/atoms/Logo.tsx`](../../src/components/atoms/Logo.tsx), [`public/favicon.svg`](../../public/favicon.svg), [`public/icon-source.svg`](../../public/icon-source.svg), [`electron/tray.ts`](../../electron/tray.ts) |
| [`COLORS.md`](COLORS.md) | Perceptually uniform OKLCH warm-carbon substrate (`H70`, `C <= 0.010`), warm ink hierarchy, Okabe-Ito dark-field 4-engine accents (`CIE76 dE 13.5`), semantic state, measured WCAG 2.x contrast matrix across all 4 surfaces, CodeMirror 6 syntax & 4 editor themes (`Signal`, `Sodium`, `Scope`, `Phosphor`), and Canvas 2D `VIZ_COLORS` | [`src/styles/tokens/colors.css`](../../src/styles/tokens/colors.css), [`src/lib/editor/theme.ts`](../../src/lib/editor/theme.ts), [`src/lib/editor/themes.ts`](../../src/lib/editor/themes.ts), [`src/lib/visualizers/colors.ts`](../../src/lib/visualizers/colors.ts) |
| [`TYPOGRAPHY-AND-LAYOUT.md`](TYPOGRAPHY-AND-LAYOUT.md) | Unified **IBM Plex Mono + IBM Plex Sans** superfamily (`SIL OFL 1.1`), self-hosted `.woff2` subsetting (`font-display: swap`), modular scale, hardware rack-legend tracking, 8px spacing scale, structural chrome dimensions, touch-target floors, tight hardware radii, shadows, and compositor-only motion (`prefers-reduced-motion`) | [`src/styles/fonts.css`](../../src/styles/fonts.css), [`src/styles/tokens/typography.css`](../../src/styles/tokens/typography.css), [`src/styles/tokens/spacing.css`](../../src/styles/tokens/spacing.css), [`src/styles/global.css`](../../src/styles/global.css) |
| [`IMAGE-RECIPES-AND-ASSETS.md`](IMAGE-RECIPES-AND-ASSETS.md) | Complete visual, font, and audio asset inventory (with dimensions, byte sizes, licenses, ARIA/`alt` rules, and SHA-256 digests), deterministic vector-to-raster Playwright recipes (`scripts/render-icons.mjs`), zero-AI-image / Art. 50 EU AI Act verification (`scripts/verify-ai-labels.mjs`), and legacy asset audit | [`scripts/render-icons.mjs`](../../scripts/render-icons.mjs), [`scripts/verify-ai-labels.mjs`](../../scripts/verify-ai-labels.mjs), [`public/og-image.svg`](../../public/og-image.svg), [`public/manifest.json`](../../public/manifest.json), [`public/samples/LICENSE.md`](../../public/samples/LICENSE.md) |

## Automated Design & Asset Gates

| Gate | Command | What It Verifies |
| --- | --- | --- |
| CSS token completeness | `npm test -- src/styles/tokens.test.ts` | Fails if any `var(--*)` referenced in `src/**/*.{css,ts,tsx}` (outside `src/data/`) lacks a definition in `src/styles/` |
| Canvas 2D ↔ CSS token sync | `npm test -- src/lib/visualizers/colors.test.ts` | Parses `src/styles/tokens/colors.css` and asserts literal hex parity in `VIZ_COLORS` (`bg`, `waveform`, `text`, `grid`) |
| Deterministic icon & OG rasterization | `node scripts/render-icons.mjs` | Re-renders `public/icon-192.png`, `public/icon-512.png`, and `public/og-image.png` (with self-hosted IBM Plex `.woff2` loaded) from SVG sources |
| Zero unclassified images & AI session disclosure | `npm run build && npm run verify:ai-labels` | Confirms 0 unclassified `<img>` / CSS raster backgrounds across all 78 prerendered routes, and verifies trilingual `AI-composed` / `KI-komponiert` / `Compuesta por IA` labels on all 49 AI-composed Strudel code sessions |

## Related Research Archives

- [`../research/2026-11-15-eu-cra-en301549/FACTS.md`](../research/2026-11-15-eu-cra-en301549/FACTS.md) — Primary-source verification of **EN 301 549 V4.1.1 / WCAG 2.2 AA** harmonisation status and **EU Cyber Resilience Act (Regulation (EU) 2024/2847) Article 14 / Recitals 18–19** open-source scope.
