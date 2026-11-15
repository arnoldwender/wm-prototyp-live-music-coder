# Branding & Art Direction — SIGNAL ROOM

## 1. Art Direction Thesis

**Live Music Coder** uses a bespoke dark-only art direction named **SIGNAL ROOM** (established in commit `3b05be5`, 2026-08-17).

The product is a live-coding musical instrument performed in dark venues, studios, and projected onto walls for hours at a time (`html { color-scheme: dark; }` in [`src/styles/global.css`](../../src/styles/global.css)). Rather than imitating a SaaS dashboard or keeping stock Tailwind framework defaults (which previously paired `#a855f7` violet, cool blue-black zinc grays, and unloaded `Inter`/`JetBrains Mono` declarations), **SIGNAL ROOM** draws from physical studio hardware racks, anodised carbon faceplates, screen-printed panel legends, and P3 amber-phosphor oscilloscopes:

1. **Warm-carbon anodised substrate (`OKLCH H70, C <= 0.010`):** Avoids pure `#000000` (which blooms on DLP projectors and crushes the CodeMirror gutter) and rejects stock blue-gray dark themes.
2. **Sodium-amber primary signal (`#ffa54b`):** Functional under venue projection — highest-luminance hue without chromatic fringing on inexpensive projectors, paired with comfortable low-light long-session reading.
3. **One unified typographic skeleton (`IBM Plex Sans` + `IBM Plex Mono`):** Hardware-engineering grotesk with tall x-height and open apertures that survive distance projection, paired with tracked-out uppercase monospace panel legends.
4. **Tight rack geometry:** Small, crisp panel radii (`2px` / `4px` / `8px`) and two border weights (`--color-border` region seams vs `--color-border-dim` internal groupings).

---

## 2. Brand Naming & Attribution Boundary

- **Product name:** `Live Music Coder` (short PWA name: `LMC` in [`public/manifest.json`](../../public/manifest.json)).
- **Tagline (EN):** `Write Code, Hear Music, Live` (localized in [`src/i18n/locales/en.json`](../../src/i18n/locales/en.json), [`de.json`](../../src/i18n/locales/de.json), [`es.json`](../../src/i18n/locales/es.json)).
- **Publisher attribution rule:** Wender Media attribution lives in the site footer, `/legal` (`Impressum` & `Datenschutzerklärung`), `LICENSING.md`, and SPDX headers — **never** as a `"by Wender Media"` byline attached to the in-app `<Logo />` or social preview card (`public/og-image.svg`). Keeping the live editor chrome free of corporate sub-bylines preserves the feel of a dedicated musical instrument.

---

## 3. Brand Mark System (Responsive Level Meter)

The brand mark is an asymmetric **amber level meter** with zero SVG filters, zero drop shadows, and zero gradients. Because a mark rendered at `16x16` CSS pixels in a browser tab has fundamentally different optical and OS-cropping constraints from a `28px` header mark or an Android maskable launcher icon, the mark is purposefully adapted across **four deterministic vector variants**:

### 3.1 In-App Header & Transport Mark (`src/components/atoms/Logo.tsx`)

Used in `SiteNav` (`size="sm"`) and editor chrome (`size="md"` / `lg`). At `>= 20px` on dark chrome without OS masking, it renders **4 vertical bars** directly on the bar background:

- **Canvas:** `viewBox="0 0 24 24"`, `aria-hidden="true"` (paired with visible `{t('app.name')}` span in `font-weight: 700`, `line-height: 1.2`).
- **Size presets (`SIZE_MAP`):**
  - `sm`: icon `20px`, title `var(--font-size-sm)` (`14px`), gap `var(--space-2)` (`4px`)
  - `md`: icon `28px`, title `var(--font-size-base)` (`16px`), gap `var(--space-3)` (`6px`)
  - `lg`: icon `36px`, title `var(--font-size-lg)` (`18px`), gap `var(--space-3)` (`6px`)
- **Geometry (`WaveformIcon`):**
  - Bar 1: `x="2" y="10" width="4" height="8" rx="2"` — `fill="var(--color-primary-light)"` (`#ffd493`), `opacity={0.6}`
  - Bar 2: `x="8" y="4" width="4" height="16" rx="2"` — `fill="var(--color-primary)"` (`#ffa54b`), `opacity={0.8}`
  - Bar 3: `x="14" y="2" width="4" height="20" rx="2"` — `fill="var(--color-primary)"` (`#ffa54b`), `opacity={1.0}`
  - Bar 4: `x="20" y="7" width="4" height="12" rx="2"` — `fill="var(--color-primary-dim)"` (`#c56c21`), `opacity={0.9}`

### 3.2 Browser Tab Favicon (`public/favicon.svg` + `public/favicon.ico`)

At `16x16` px, 4 bars collapse into `2px` strokes separated by `1px` gaps that visually merge. Following standard responsive-icon reduction, the tab mark reduces to **3 bars** on a solid warm-carbon rounded tile (`#1b1815`) so contrast holds on **both** light and dark browser tab strips:

- **Canvas:** `width="48" height="48" viewBox="0 0 48 48"`
- **Tile:** `<rect width="48" height="48" rx="11" fill="#1b1815"/>` (`--color-bg-alt`)
- **Bars (`width="7.5"`, gap `5.25`, `rx="2.4"` — intentionally less than full capsule `3.75` so `16px` rasterization does not erode bar ends into blobs):**
  - Left bar: `x="7.25" y="17" width="7.5" height="14" rx="2.4" fill="#ffa54b"` (`--color-primary`)
  - Center peak bar: `x="20.25" y="9" width="7.5" height="30" rx="2.4" fill="#ffc476"` (`--color-primary-ink`, `11.29:1` against `#1b1815`)
  - Right bar: `x="33.25" y="14" width="7.5" height="20" rx="2.4" fill="#ffa54b"` (`--color-primary`)
- **Multi-resolution fallback (`public/favicon.ico`):** ICO container packing 32-bit PNG frames at `16x16`, `32x32`, and `48x48` derived from `public/favicon.svg`.

### 3.3 Maskable PWA / App Icon (`public/icon-source.svg` → `icon-192.png`, `icon-512.png`)

`public/manifest.json` declares `purpose: "maskable"` (and `"any"`). Maskable icons are cropped by Android/OS launchers to arbitrary squircles/circles where only the central `0.8 × diameter` safe circle (`r = 19.2` on a `48`-unit canvas, per W3C Web Application Manifest specification `https://www.w3.org/TR/appmanifest/#icon-masks`) is guaranteed visible. In `favicon.svg`, the outer bar corners sit at `r = 19.29`, right on the clip boundary. `public/icon-source.svg` therefore uses dedicated maskable metrics:

- **Canvas:** `width="512" height="512" viewBox="0 0 48 48"`
- **Full-bleed ground (zero corner radius — OS mask supplies shape):** `<rect width="48" height="48" fill="#1b1815"/>`
- **Safe-zone bars (measured max corner distance from `(24, 24)` is `r = 17.40 < 19.2`):**
  - Left bar: `x="9.9" y="17.4" width="7.2" height="13.2" rx="2.5" fill="#ffa54b"`
  - Center peak bar: `x="20.4" y="8.4" width="7.2" height="31.2" rx="2.5" fill="#ffc476"`
  - Right bar: `x="30.9" y="13.8" width="7.2" height="20.4" rx="2.5" fill="#ffa54b"`

### 3.4 Desktop Menu-Bar / System Tray Icon (`electron/tray.ts`)

macOS menu-bar extras require a monochrome alpha-mask template image (`icon.setTemplateImage(true)`) so macOS automatically inverts it across light/dark wallpapers and menu bars:

- **Source:** `TRAY_WAVEFORM_PNG_DATA_URL` in [`electron/tray.ts`](../../electron/tray.ts) — deterministic `32x32` (`@2x` for `16x16pt`) 5-bar monochrome waveform PNG, resized via `rawIcon.resize({ width: 16, height: 16 })` and marked as template image on `darwin`.

---

## 4. Four-Engine Visual Identity Grammar (Never Hue Alone)

Live Music Coder unifies four audio engines (**Strudel**, **Tone.js**, **Web Audio API**, **Web MIDI**). Their visual identity obeys two strict accessibility rules (WCAG 1.4.1 Use of Color + CVD separability):

1. **Color-vision-deficiency safety:** The four accents (`#ffa54b`, `#84baff`, `#71edda`, `#d07ec9`) vary in **both** OKLCH hue and lightness (`L = 0.800 / 0.780 / 0.870 / 0.705`), achieving a worst-case `CIE76 dE = 13.5` across protanopia, deuteranopia, and tritanopia (up from `dE = 1.9` in the pre-Signal-Room palette).
2. **Redundant structural cues:** Engine identity is never communicated by hue alone. Every engine tab, node, badge, or card pairs its accent hue with:
   - a **2px structural rule / indicator** (`border-left` or solid `10x10` legend marker), and
   - an explicit **uppercase monospace text legend** (`STRUDEL`, `TONE.JS`, `WEB AUDIO`, `MIDI`) set in `--font-family-legend` with `--letter-spacing-legend` (`0.05em`) or `--letter-spacing-legend-wide` (`0.1em`).
