# Color System — SIGNAL ROOM

Canonical implementation: [`src/styles/tokens/colors.css`](../../src/styles/tokens/colors.css)  
Editor themes: [`src/lib/editor/theme.ts`](../../src/lib/editor/theme.ts), [`src/lib/editor/themes.ts`](../../src/lib/editor/themes.ts)  
Canvas 2D mirror: [`src/lib/visualizers/colors.ts`](../../src/lib/visualizers/colors.ts) (enforced by [`colors.test.ts`](../../src/lib/visualizers/colors.test.ts))

## 1. Governing Rules

1. **Dark-only instrument surface (`html { color-scheme: dark; }`):** There is no light theme; the interface is designed for dark studios, clubs, and live projection.
2. **OKLCH perceptual generation:** Every hex token in `colors.css` is generated from an explicit `oklch(L C H)` triplet recorded alongside the token so ramps can be extended without guesswork.
3. **AA contrast by construction across all four surfaces:** Every ink, accent, semantic, and syntax foreground token clears **WCAG 2.x AA (`>= 4.5:1`)** against **all four** background surfaces (`--color-bg`, `--color-bg-alt`, `--color-bg-elevated`, `--color-bg-hover`).
4. **Dark ink on saturated fills (`--color-on-accent`):** White text on saturated bright accents yields `2.06:1–3.79:1` (fail). Using `--color-on-accent` (`var(--color-bg)`, `#0f0c0a`) yields **`6.74:1–13.76:1`** across every filled button, pill, and badge.
5. **Zero raw hex in UI components:** Components and CodeMirror themes consume `var(--color-*)` or `color-mix(in oklab, ...)` exclusively. Only SVGs rendered outside DOM CSS context (`public/*.svg`) and Canvas 2D (`VIZ_COLORS`) hold literal hexes, guarded by unit tests.

---

## 2. Substrate & Border Tokens (Warm Carbon, `OKLCH H70, C <= 0.010`)

| Token | Hex | OKLCH Source | Role |
| --- | --- | --- | --- |
| `--color-bg` | `#0f0c0a` | `oklch(0.158 0.006 70)` | Page background & CodeMirror editor field |
| `--color-bg-alt` | `#1b1815` | `oklch(0.212 0.007 70)` | Panels, navigation bar, sidebars, active code line |
| `--color-bg-elevated` | `#26231f` | `oklch(0.258 0.008 70)` | Cards, modal dialogs, autocomplete tooltips |
| `--color-bg-hover` | `#322e2a` | `oklch(0.305 0.009 70)` | Hover states, active fills, editor text selection |
| `--color-border` | `#3f3a35` | `oklch(0.352 0.010 70)` | Region-separating panel seams (`3.18:1+` structural separation) |
| `--color-border-dim` | `#26231f` | `oklch(0.258 0.008 70)` | Subtle internal grouping dividers & CodeMirror gutter rule |

---

## 3. Foreground Contrast Matrix (Measured WCAG 2.x Ratios)

Ratios below are measured against `#0f0c0a` (`bg`), `#1b1815` (`alt`), `#26231f` (`elevated`), and `#322e2a` (`hover`):

| Category | Token | Hex | OKLCH Source | vs `bg` | vs `alt` | vs `elevated` | vs `hover` | Role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Ink** | `--color-text` | `#f5f3f1` | `oklch(0.965 0.003 70)` | `17.61:1` | `15.97:1` | `14.13:1` | `12.16:1` | Primary body & code variables |
| **Ink** | `--color-text-secondary` | `#b7b4b1` | `oklch(0.772 0.006 70)` | `9.45:1` | `8.57:1` | `7.58:1` | `6.52:1` | Secondary prose, inactive nav, operators |
| **Ink** | `--color-text-muted` | `#9e9a95` | `oklch(0.688 0.008 70)` | `6.97:1` | `6.32:1` | `5.59:1` | `4.81:1` | Captions, line numbers, code comments |
| **Brand** | `--color-primary` | `#ffa54b` | `oklch(0.800 0.150 62)` | `9.97:1` | `9.04:1` | `8.00:1` | `6.88:1` | Primary fills, `:focus-visible` ring, keywords |
| **Brand** | `--color-primary-ink` | `#ffc476` | `oklch(0.870 0.125 68)` | `12.45:1` | `11.29:1` | `9.99:1` | `8.60:1` | High-contrast amber text & icon peak bar |
| **Brand** | `--color-primary-light` | `#ffd493` | `oklch(0.900 0.100 72)` | `14.01:1` | `12.70:1` | `11.24:1` | `9.67:1` | Active/pressed amber highlight |
| **Brand** | `--color-primary-dim` | `#c56c21` | `oklch(0.620 0.140 55)` | `5.14:1` | `4.66:1` | `4.13:1` | `3.55:1` | Decorative borders & glow only (non-text) |
| **Engine** | `--color-strudel` | `#ffa54b` | `oklch(0.800 0.150 62)` | `9.97:1` | `9.04:1` | `8.00:1` | `6.88:1` | Strudel engine identity (sodium amber) |
| **Engine** | `--color-strudel-dim` | `#c56c21` | `oklch(0.620 0.140 55)` | `5.14:1` | `4.66:1` | `4.13:1` | `3.55:1` | Strudel non-text border/glow |
| **Engine** | `--color-tonejs` | `#84baff` | `oklch(0.780 0.115 255)` | `9.70:1` | `8.79:1` | `7.78:1` | `6.70:1` | Tone.js engine identity (cornflower) |
| **Engine** | `--color-tonejs-dim` | `#4e85ca` | `oklch(0.610 0.120 255)` | `5.13:1` | `4.66:1` | `4.12:1` | `3.55:1` | Tone.js non-text border/glow |
| **Engine** | `--color-webaudio` | `#71edda` | `oklch(0.870 0.115 182)` | `13.76:1` | `12.48:1` | `11.04:1` | `9.51:1` | Web Audio engine identity (aqua) |
| **Engine** | `--color-webaudio-dim` | `#25a897` | `oklch(0.660 0.110 182)` | `6.62:1` | `6.00:1` | `5.31:1` | `4.57:1` | Web Audio border/glow |
| **Engine** | `--color-midi` | `#d07ec9` | `oklch(0.705 0.140 330)` | `6.97:1` | `6.32:1` | `5.59:1` | `4.81:1` | Web MIDI engine identity (orchid) |
| **Engine** | `--color-midi-dim` | `#b05baa` | `oklch(0.600 0.150 330)` | `4.57:1` | `4.14:1` | `3.67:1` | `3.16:1` | Web MIDI non-text border/glow |
| **Semantic** | `--color-error` | `#fa6a57` | `oklch(0.700 0.180 30)` | `6.74:1` | `6.11:1` | `5.41:1` | `4.66:1` | Error banners, destructive states (vermillion) |
| **Semantic** | `--color-warning` | `#f3d350` | `oklch(0.870 0.150 95)` | `13.22:1` | `11.99:1` | `10.61:1` | `9.13:1` | Warnings & numeric literals (`33°` off brand H62) |
| **Semantic** | `--color-success` | `#73dc86` | `oklch(0.810 0.155 148)` | `11.43:1` | `10.36:1` | `9.17:1` | `7.89:1` | Active transport / eval flash / string literals |
| **Semantic** | `--color-info` | `#84baff` | `oklch(0.780 0.115 255)` | `9.70:1` | `8.79:1` | `7.78:1` | `6.70:1` | Informational notices (`== --color-tonejs`) |
| **Semantic** | `--color-accent` | `#d07ec9` | `oklch(0.705 0.140 330)` | `6.97:1` | `6.32:1` | `5.59:1` | `4.81:1` | Secondary accent (`== --color-midi`) |

### Filled Accent Surfaces (`--color-on-accent: var(--color-bg)`)

Dark carbon ink (`#0f0c0a`) on solid accent fills measures:
- on `--color-primary` (`#ffa54b`): **`9.97:1`**
- on `--color-error` (`#fa6a57`): **`6.74:1`**
- on `--color-warning` (`#f3d350`): **`13.22:1`**
- on `--color-success` (`#73dc86`): **`11.43:1`**
- on `--color-tonejs` / `--color-info` (`#84baff`): **`9.70:1`**
- on `--color-webaudio` (`#71edda`): **`13.76:1`**
- on `--color-midi` / `--color-accent` (`#d07ec9`): **`6.97:1`**

---

## 4. Overlays, Washes & Strudel Live-Note Decorations

| Token | Value | Purpose |
| --- | --- | --- |
| `--color-backdrop` | `rgba(0, 0, 0, 0.6)` | Modal dialog scrim |
| `--color-overlay` | `rgba(0, 0, 0, 0.6)` | Standard panel overlay |
| `--color-overlay-heavy` | `rgba(0, 0, 0, 0.75)` | High-isolation modal scrim |
| `--color-primary-wash-subtle` | `rgba(255, 165, 75, 0.08)` | Drag-and-drop hover tint |
| `--color-primary-wash` | `rgba(255, 165, 75, 0.15)` | Ambient glow & waveform fill tint |
| `--color-primary-ring` | `rgba(255, 165, 75, 0.25)` | Input ambient ring |
| `--color-primary-wash-strong` | `rgba(255, 165, 75, 0.5)` | Slider thumb & active signal glow |
| `--color-warning-wash` | `rgba(243, 211, 80, 0.06)` | Selected table/list row tint |
| `--color-strudel-highlight-bg` | `rgba(255, 165, 75, 0.25)` | Active sounding note background in CodeMirror |
| `--color-strudel-highlight-border` | `rgba(255, 165, 75, 0.55)` | Active sounding note outline in CodeMirror |
| `--color-editor-search-match` | `rgba(243, 211, 80, 0.28)` | CodeMirror search match background |

---

## 5. CodeMirror 6 Syntax Roles & Selectable Editor Themes

### Default Syntax Mapping (`--color-syntax-*`)

Variables deliberately stay plain `--color-text` (`#f5f3f1`) so chromatic emphasis highlights only sound-producing functions, control flow, strings, and numeric parameters:

- `--color-syntax-keyword`: `var(--color-primary)` (`#ffa54b`, `9.97:1` on `bg` / `9.04:1` on `bg-alt`)
- `--color-syntax-function`: `var(--color-webaudio)` (`#71edda`, `13.76:1` / `12.48:1`)
- `--color-syntax-string`: `var(--color-success)` (`#73dc86`, `11.43:1` / `10.36:1`)
- `--color-syntax-number`: `var(--color-warning)` (`#f3d350`, `13.22:1` / `11.99:1`)
- `--color-syntax-definition`: `var(--color-tonejs)` (`#84baff`, `9.70:1` / `8.79:1`)
- `--color-syntax-property`: `var(--color-midi)` (`#d07ec9`, `6.97:1` / `6.32:1`)
- `--color-syntax-variable`: `var(--color-text)` (`#f5f3f1`, `17.61:1` / `15.97:1`)
- `--color-syntax-operator`: `var(--color-text-secondary)` (`#b7b4b1`, `9.45:1` / `8.57:1`)
- `--color-syntax-comment` & `--color-syntax-punctuation`: `var(--color-text-muted)` (`#9e9a95`, `6.97:1` / `6.32:1`, comments in `italic`)

### Selectable Editor Themes (`src/lib/editor/themes.ts`)

All four themes share the single warm-carbon substrate (`--color-bg` / `--color-bg-alt`) so changing editor accent never breaks the surrounding application chrome. Monochrome themes (`Sodium` and `Phosphor`) compute intermediate steps via `color-mix(in oklab, <accent> <pct>%, var(--color-text | --color-text-muted))`; because both endpoints clear AA (`>= 6.97:1` on `bg`, `>= 6.32:1` on `bg-alt`), every intermediate mix is guaranteed AA by monotonicity.

| Persisted `id` (frozen for backwards compatibility) | Display Name | Caret / Bracket Accent | Syntax Strategy |
| --- | --- | --- | --- |
| `'purple'` | **Signal (Default)** | `var(--color-primary)` | Full multi-hue product syntax tokens |
| `'amber'` | **Sodium** | `var(--color-primary)` | P3 amber-phosphor monochrome (`color-mix` in `oklab` + `--color-warning` numbers) |
| `'cyan'` | **Scope** | `var(--color-webaudio)` | Oscilloscope aqua keywords, cornflower functions, amber definitions, orchid properties |
| `'green'` | **Phosphor** | `var(--color-success)` | P1 green-phosphor monochrome (`color-mix` in `oklab` + `--color-webaudio` definitions) |

---

## 6. Canvas 2D Visualizer Palette (`src/lib/visualizers/colors.ts`)

HTML5 Canvas 2D contexts cannot evaluate `var(--*)` directly. `VIZ_COLORS` mirrors the canonical tokens alongside dedicated OKLCH canvas-only steps:

- **Mirrored tokens (unit-tested in `colors.test.ts`):** `bg` (`#0f0c0a`), `grid` (`#26231f`), `gridLight` (`#3f3a35`), `waveform` / `accent` / `spectrumTop` / `timelineBeat` (`#ffa54b`), `waveformBright` (`#ffc476`), `waveformDim` (`#c56c21`), `spectrum` (`#84baff`), `spectrumPeak` (`#d07ec9`), `timeline` (`#73dc86`), `text` (`#b7b4b1`), `textDim` (`#9e9a95`), `white` (`#f5f3f1`).
- **Canvas-only OKLCH intermediates:**
  - `bgAlt`: `#161311` (`oklch(0.190 0.006 70)` — canvas top gradient)
  - `spectrumBright`: `#a5d4ff` (`oklch(0.860 0.100 255)`)
  - `timelineBright`: `#9aefa6` (`oklch(0.880 0.130 148)`)
  - `textBright`: `#d3d0cd` (`oklch(0.860 0.005 70)`)
  - Piano-roll key bed: `keysBg` `#12100e` (`oklch(0.175 0.006 70)`), `keysBlackKey` `#090806` (`oklch(0.135 0.005 70)`), `keysBlackKeyAlt` `#0d0b09` (`oklch(0.150 0.005 70)`), `keysWhiteKey` `#201e1b` (`oklch(0.235 0.007 70)`).
