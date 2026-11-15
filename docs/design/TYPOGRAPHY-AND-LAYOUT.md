# Typography, Spacing, Layout & Motion — SIGNAL ROOM

Canonical implementation:
- Webfont delivery: [`src/styles/fonts.css`](../../src/styles/fonts.css) + [`public/fonts/`](../../public/fonts/)
- Typography tokens: [`src/styles/tokens/typography.css`](../../src/styles/tokens/typography.css)
- Spacing, structural sizes, radii, shadows & transitions: [`src/styles/tokens/spacing.css`](../../src/styles/tokens/spacing.css)
- Global rules, `prefers-reduced-motion`, `:focus-visible`: [`src/styles/global.css`](../../src/styles/global.css)

---

## 1. Typographic Thesis ("Don't Pair — Unify")

In **Live Music Coder**, the hero surface is the live code editor itself. Rather than pairing two unrelated skeletons (such as a humanist monospace with a neo-grotesk UI sans), **SIGNAL ROOM** uses a single institutional/engineering superfamily designed by Bold Monday for IBM (2017): **IBM Plex Mono** + **IBM Plex Sans**.

- **Shared metrics & proportions:** Labels, transport controls, and documentation prose share the same x-height, open apertures, and clipped terminals as the CodeMirror buffer.
- **Projection legibility:** Tall x-height, generous counters, and unmistakable glyph shapes (single-storey italic `a`, distinct `g`, flagged `l`) remain legible from the back of a dark room under venue projection.
- **Genuine italic monospace:** CodeMirror renders comments in `font-style: italic`; shipping `ibm-plex-mono-latin-400-italic.woff2` avoids browser-synthesised oblique shearing in the monospace character grid.
- **Zero third-party font CDNs (DSGVO / privacy by design):** All 7 `.woff2` files (`140,632` bytes total) are self-hosted in `public/fonts/` from `'self'`. Opening any route makes zero requests to Google Fonts or external font CDNs.
- **Font license:** `SIL Open Font License, Version 1.1` (26 February 2007) — full license text shipped at [`public/fonts/LICENSE-IBM-Plex.txt`](../../public/fonts/LICENSE-IBM-Plex.txt). Applies solely to the font files and permits bundling, self-hosting, and redistribution alongside software under any license.

---

## 2. Self-Hosted `@font-face` Delivery (`src/styles/fonts.css`)

All `@font-face` declarations use `font-display: swap` and the Latin subset range covering English, German (`ä ö ü ß`), and Spanish (`á é í ó ú ñ ¿ ¡`) plus typographic punctuation and arrows:

```text
unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
  U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
  U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
```

| Family | Style | Weight | Served File (`public/fonts/`) | Bytes |
| --- | --- | --- | --- | --- |
| `IBM Plex Mono` | `normal` | `400` | `ibm-plex-mono-latin-400-normal.woff2` | `14,708` |
| `IBM Plex Mono` | `italic` | `400` | `ibm-plex-mono-latin-400-italic.woff2` | `16,448` |
| `IBM Plex Mono` | `normal` | `600` | `ibm-plex-mono-latin-600-normal.woff2` | `15,620` |
| `IBM Plex Sans` | `normal` | `400` | `ibm-plex-sans-latin-400-normal.woff2` | `22,588` |
| `IBM Plex Sans` | `normal` | `500` | `ibm-plex-sans-latin-500-normal.woff2` | `24,184` |
| `IBM Plex Sans` | `normal` | `600` | `ibm-plex-sans-latin-600-normal.woff2` | `24,252` |
| `IBM Plex Sans` | `normal` | `700` | `ibm-plex-sans-latin-700-normal.woff2` | `22,832` |
| **Total** | — | **7 faces** | — | **`140,632` (`~137.3 KiB`)** |

### Font-Family Stack Tokens (`src/styles/tokens/typography.css`)

| Token | Value | Role |
| --- | --- | --- |
| `--font-family-mono` | `'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | CodeMirror editor, `<code>`, `<pre>`, keyboard shortcuts, numeric readouts |
| `--font-family-sans` | `'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif` | Headings, UI controls, documentation, marketing & legal prose |
| `--font-family-body` | `var(--font-family-sans)` | Alias for body prose |
| `--font-family-legend` | `var(--font-family-mono)` | Hardware rack-panel voice (paired with `text-transform: uppercase` + `--letter-spacing-legend*`) |

---

## 3. Type Scale, Weights, Line-Heights & Hardware Tracking

### Size Scale

| Token | Value | Pixel Equivalent (`1rem = 16px`) | Primary Usage |
| --- | --- | --- | --- |
| `--font-size-2xs` | `0.625rem` | `10px` | Status bar indicators, compact metadata tags |
| `--font-size-ui` | `0.6875rem` | `11px` | Compact studio chrome labels |
| `--font-size-xs` | `0.75rem` | `12px` | Badges, auxiliary hints, kbd chips |
| `--font-size-sm` | `0.875rem` | `14px` | Navigation links, buttons, secondary descriptions |
| `--font-size-code` | `0.875rem` | `14px` | CodeMirror 6 editor buffer |
| `--font-size-base` | `1rem` | `16px` | Minimum body prose size (`body`) |
| `--font-size-lg` | `1.125rem` | `18px` | Card titles, large logo preset |
| `--font-size-xl` | `1.25rem` | `20px` | Section subheadings, dialog titles |
| `--font-size-2xl` | `1.5rem` | `24px` | Compact listing-page `<h1>` (`.listing-hero h1`), major section headers |
| `--font-size-3xl` | `2rem` | `32px` | Feature headings |
| `--font-size-4xl` | `clamp(2rem, 4vw, 2.75rem)` | `32px–44px` | Responsive page display `<h1>` (`Blog`, `Changelog`, `Sessions`, `SessionPiece`) |

### Weights, Line-Heights & Letter-Spacing

| Category | Token | Value | Usage |
| --- | --- | --- | --- |
| **Weight** | `--font-weight-normal` | `400` | Body prose, standard code |
| **Weight** | `--font-weight-medium` | `500` | Active nav links, emphasized controls |
| **Weight** | `--font-weight-semibold` | `600` | Subheadings, bold monospace tokens |
| **Weight** | `--font-weight-bold` | `700` | Display headings, primary CTAs, brand title |
| **Leading** | `--line-height-tight` | `1.2` | Headings & single-line UI chrome |
| **Leading** | `--line-height-base` | `1.5` | Body prose (WCAG readability baseline) |
| **Leading** | `--line-height-code` | `1.6` | CodeMirror buffer (prevents bracket/descender collision in mono grid) |
| **Leading** | `--line-height-loose` | `1.75` | Long-form documentation & article reading |
| **Tracking** | `--letter-spacing-tight` | `-0.01em` | Large display headings (`>= 32px` / OG title) |
| **Tracking** | `--letter-spacing-normal` | `0` | Standard prose & code |
| **Tracking** | `--letter-spacing-legend` | `0.05em` | Uppercase monospace micro-labels |
| **Tracking** | `--letter-spacing-legend-wide` | `0.1em` | Uppercase monospace section headers & engine row |
| **Tracking** | `--letter-spacing-legend-alarm` | `0.15em` | Uppercase error/warning banner legend |

---

## 4. Spacing Scale, Structural Sizes & Layout Measures (`src/styles/tokens/spacing.css`)

### Numeric Scale (8px Base Grid + Sub-Steps) & Semantic T-Shirt Aliases

| Token | Value | px | Semantic Alias |
| --- | --- | --- | --- |
| `--space-0` | `0` | `0px` | — |
| `--space-1` | `0.125rem` | `2px` | — |
| `--space-2` | `0.25rem` | `4px` | `--space-xs` |
| `--space-3` | `0.375rem` | `6px` | — |
| `--space-4` | `0.5rem` | `8px` | `--space-sm` |
| `--space-5` | `0.625rem` | `10px` | — |
| `--space-6` | `0.75rem` | `12px` | — |
| `--space-7` | `0.875rem` | `14px` | — |
| `--space-8` | `1rem` | `16px` | `--space-md` |
| `--space-9` | `1.25rem` | `20px` | — |
| `--space-10` | `1.5rem` | `24px` | `--space-lg` |
| `--space-11` | `1.75rem` | `28px` | — |
| `--space-12` | `2rem` | `32px` | `--space-xl` |
| `--space-13` | `2.5rem` | `40px` | — |
| `--space-14` | `3rem` | `48px` | `--space-2xl` |
| `--space-15` | `4rem` | `64px` | — |
| `--space-16` | `5rem` | `80px` | `--space-3xl` |

### Structural Chrome, Touch Floors & Content Widths

| Token / Rule | Value | px | Purpose |
| --- | --- | --- | --- |
| `--size-nav` | `4rem` | `64px` | Top `SiteNav` bar height |
| `--size-activity-bar` | `2.5rem` | `40px` | Left `ActivityBar` icon rail width in `/editor` |
| `html.electron-mac body` | `padding-top: 28px` | `28px` | macOS `hiddenInset` traffic-light & custom `<TitleBar />` drag region |
| `--size-touch-min` / `--size-touch` | `2.75rem` | `44px` | Touch target floor for primary interactive controls (Apple HIG / WCAG 2.5.5 AAA) |
| `--size-touch-comfortable` | `3rem` | `48px` | Comfortable mobile touch target |
| `.cm-editor input[type="range"]` | `64px × 24px` | `24px` height | Inline Strudel `slider()` widget (clears WCAG 2.2 SC 2.5.8 24×24 CSS px target floor) |
| `--width-content-sm` | `60rem` | `960px` | Reading measure for `/docs`, `/blog/:slug`, `/legal` |
| `--width-content-md` | `75rem` | `1200px` | Listing grids (`/samples`, `/examples`, `/sessions`, `/blog`, `/changelog`) |
| `--width-content-lg` | `80rem` | `1280px` | Landing page wide sections |

---

## 5. Radii, Shadows & Motion System

### Tight Hardware Radii

| Token | Value | px | Role |
| --- | --- | --- | --- |
| `--radius-sm` | `0.125rem` | `2px` | Chips, form inputs, tight rack controls |
| `--radius-md` | `0.25rem` | `4px` | Buttons, standard cards |
| `--radius-lg` | `0.5rem` | `8px` | Modal dialogs, floating panels |
| `--radius-full` | `9999px` | pill / circle | True circles (knobs, LEDs, slider thumbs, scrollbar thumbs) plus remaining legacy capsule pills documented in `spacing.css` |

### Shadows & Signal Lamps

| Token | Value | Role |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | Subtle control elevation |
| `--shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.3)` | Card hover elevation (`.card-hover:hover`) |
| `--shadow-lg` | `0 10px 15px rgba(0, 0, 0, 0.3)` | Modal dialogs & floating menus |
| `--shadow-glow-strudel` | `0 0 12px var(--color-primary-wash)` | Ambient amber status glow |
| `--shadow-glow-signal` | `0 0 10px var(--color-primary-wash-strong)` | Active transport / slider hover lamp |
| `--shadow-key` | `0 2px 4px rgba(0, 0, 0, 0.4)` | Virtual keyboard keycap drop shadow |
| `--shadow-key-bevel` | `inset 0 -4px 0 rgba(0, 0, 0, 0.1)` | Virtual keyboard keycap tactile bottom bevel |

### Transitions, Animations & Reduced-Motion Accessibility

- **Duration & easing tokens:**
  - `--transition-fast`: `150ms ease` (buttons, links, focus borders, dropdown entrance)
  - `--transition-base`: `300ms ease` (sticky filter bar blur/shadow)
  - `--transition-slow`: `500ms ease` (`.cm-eval-flash` decay)
  - `--transition-spring`: `300ms cubic-bezier(0.34, 1.56, 0.64, 1)` (`.card-hover` lift)
- **Compositor-friendly presets:**
  - `--animation-hover-scale`: `scale(1.03)`
  - `--animation-card-lift`: `translateY(-2px)`
  - Global `<button>` microinteraction: `:hover:not(:disabled)` `filter: brightness(1.1)`, `:active:not(:disabled)` `transform: scale(0.97)`, `:disabled` `opacity: 0.5`.
- **Keyframes (`src/styles/global.css`):**
  - `compose-pulse`: `2s ease-in-out infinite` opacity `0.6 ↔ 1.0`
  - `menu-enter`: `150ms ease-out` `opacity: 0; translateY(-4px) scale(0.98)` → `opacity: 1; translateY(0) scale(1)`
  - `playing-indicator`: horizontal `background-position` sweep defined in `src/styles/global.css` (`@keyframes playing-indicator`)
- **Mandatory Reduced-Motion Override (WCAG 2.3.3 / BFSG):**
  `src/styles/global.css` enforces a global `@media (prefers-reduced-motion: reduce)` rule across `*, *::before, *::after` setting `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, `transition-duration: 0.01ms !important`, and `scroll-behavior: auto !important`.
- **Keyboard Focus Visibility (WCAG 2.4.7 / 1.4.11 / 2.4.13):**
  Global `:focus-visible` renders `outline: 2px solid var(--color-primary); outline-offset: 2px;` (`6.88:1–9.97:1` contrast across all four dark surfaces, well above the 3:1 non-text contrast requirement, and preserved in `forced-colors` mode as a real CSS `outline`).
