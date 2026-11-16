# Image Recipes, Fonts & Media Asset Inventory

## 1. Zero-Stock, Zero-AI-Image Architecture

**Live Music Coder** renders **zero raster photographs, zero stock images, and zero AI-generated images**:

1. **Deterministic vector-first graphics:** Every shipped visual mark (`favicon.svg`, `favicon.ico`, `icon-source.svg`, `icon-192.png`, `icon-512.png`, `og-image.svg`, `og-image.png`, inline `Logo.tsx`, and `electron/tray.ts`) is authored as pure mathematical SVG/pixel geometry using the **SIGNAL ROOM** design tokens and self-hosted IBM Plex `.woff2` fonts.
2. **Automated build gate (`scripts/verify-ai-labels.mjs`):** Runs headless Chromium across all 78 prerendered sitemap routes and fails if any route renders an unclassified `<img>` or non-SVG CSS `background-image`.
3. **EU AI Act Art. 50 disclosure boundary:** What is AI-assisted in this repository are the **49 musical Strudel live-coding sessions** in [`src/data/sessions-library.ts`](../../src/data/sessions-library.ts) (code patterns, not images). Every session card on `/sessions` and every `/sessions/:slug` detail page renders a visible localized disclosure badge (`AI-composed` / `KI-komponiert` / `Compuesta por IA`), and the site footer accurately discloses the AI-composed sessions without claiming AI images (`verify-ai-labels.mjs` steps 1, 2, and 4).

---

## 2. Complete Asset Inventory (with SHA-256 Digests)

All SHA-256 digests and byte counts are measured directly against the repository files on `main`.

### 2.1 Visual Marks, Icons & Open Graph Previews

| ID | Path | Kind & Dimensions | Bytes | SHA-256 | Origin & Recipe | License | ARIA / `alt` | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `V01` | `public/favicon.svg` | Vector SVG (`48×48` viewBox) | `2,179` | `e38a48635ef9db1887e3ce73ab987e2b0029b193f108aaa8d84a360bf6dccdb1` | Hand-coded 3-bar Signal Room level meter on `#1b1815` tile (`rx="11"`) | MIT (`SPDX` repo original) | `role="img" aria-label="Live Music Coder"` | **Active** (`<link rel="icon" type="image/svg+xml">`) |
| `V02` | `public/favicon.ico` | Multi-frame ICO (`16×16`, `32×32`, `48×48` 32-bit PNGs) | `3,177` | `4b340e47ecc28eb2975987901f53283634db5e853c1dab5943b9d7619904cec4` | Rasterized from `public/favicon.svg` at 16/32/48 px (commit `554471b`) | MIT (repo original) | Browser chrome icon (`/favicon.ico` crawler fallback) | **Active** |
| `V03` | `public/icon-source.svg` | Vector SVG (`512×512`, `viewBox="0 0 48 48"`) | `1,462` | `b656f191b5ac1b324562f4c1efa0a9ff8f264d4195f0e7cfa17b9ec087ac1a55` | Hand-coded maskable 3-bar level meter on full-bleed `#1b1815` (`r_max = 17.40 < 19.2` safe circle) | MIT (repo original) | `role="img" aria-label="Live Music Coder"` | **Master source** (not linked directly in HTML) |
| `V04` | `public/icon-192.png` | Raster PNG (`192×192`) | `2,007` | `0312e726727b56f02c193afb0d0702c322b02bccc6e14f6b67eab74566080f24` | Derived from `public/icon-source.svg` via `node scripts/render-icons.mjs` | MIT (repo original) | PWA manifest (`any` + `maskable`) & `apple-touch-icon` | **Active** (precached in SW) |
| `V05` | `public/icon-512.png` | Raster PNG (`512×512`) | `5,618` | `196b8644020db11a5ef7500252516eb67b4381de8bb59d05d2c8f5864f536502` | Derived from `public/icon-source.svg` via `node scripts/render-icons.mjs` | MIT (repo original) | PWA manifest (`any` + `maskable`) | **Active** (precached in SW) |
| `V06` | `public/og-image.svg` | Vector SVG (`1200×630`) | `6,013` | `a277d26de44ffe6314a455ef29a66ffd1fcc8117c36ea624139cb19ff6b8f6e4` | Hand-coded Signal Room social card (40px grid, 26-bar meter band, 2.4× mark, IBM Plex text, 4-engine legend) | MIT (repo original) | Master source for `og-image.png` | **Master source** |
| `V07` | `public/og-image.png` | Raster PNG (`1200×630`) | `36,251` | `c4e4ea39e167fc1f2b82adb39d26f151472c62392fc063f2030c01751fbf2a7b` | Derived from `public/og-image.svg` + `public/fonts/*.woff2` via `node scripts/render-icons.mjs` | MIT (repo original) | `<meta property="og:image">` & `twitter:image` (`og:image:alt` in `index.html`) | **Active** |
| `V08` | `src/components/atoms/Logo.tsx` | Inline React SVG (`24×24` viewBox) | — | Tracked in git | 4-bar amber `WaveformIcon` (`sm` 20px / `md` 28px / `lg` 36px) | MIT (`SPDX-License-Identifier: MIT`) | `aria-hidden="true"` paired with `{t('app.name')}` text | **Active** |
| `V09` | `electron/tray.ts` | Inline base64 PNG (`32×32` `@2x` → `16×16pt`) | `164` (b64) | Tracked in git | Monochrome 5-bar waveform template icon (`setTemplateImage(true)` on macOS) | MIT (`SPDX-License-Identifier: MIT`) | `tray.setToolTip('Live Music Coder')` | **Active** (Electron desktop) |
| `V10` | `lucide-react` (`package.json`) | Inline SVG React components | — | Lockfile-pinned | Open-source UI icon set for transport/editor toolbar glyphs | ISC (Lucide) | `aria-hidden="true"` inside labelled `<button>` / `aria-label` | **Active** |
| `V11` | `build/icon.png` | Raster PNG (`1024×1024`, transparent ground) | `20,368` | `fdbc9314f4b41849c688d7e37fb048bf3ef7cbf81438f91b86a63400fc17dc5e` | Derived from `public/icon-source.svg` via `node scripts/render-icons.mjs`: the mark on an `824×824` tile with `185px` corners and `100px` of clear space (macOS app-icon grid) | MIT (repo original) | Dock / Finder icon of the packaged app | **Active** (desktop bundle icon since `v1.3.3`; replaced the `v1.0.0` lightning bolt) |

### 2.2 Legacy / Unreferenced Visual Files (Disclosed Audit State)

Visual inspection of every binary/SVG file in `public/` and `build/` identified one pre-Signal-Room artifact retained on disk (the second, the `v1.0.0` desktop icon `build/icon.png`, was regenerated for `v1.3.3` and is `V11` above):

| ID | Path | Kind & Dimensions | Bytes | SHA-256 | Inspected Content & Status | Planned Follow-Up |
| --- | --- | --- | --- | --- | --- | --- |
| `L02` | `public/icons.svg` | Vector SVG sprite (`6` `<symbol>` defs) | `5,031` | `b45fa506195cfcdef406ba9f0c77b36ddc1a7c224040926ec70abc2fdea7b93a` | **Orphaned Vite starter sprite:** Contains `bluesky-icon`, `discord-icon`, `documentation-icon`, `github-icon`, `social-icon`, `x-icon` with `#aa3bff` strokes. Zero references anywhere in `index.html`, `src/`, or `electron/`. | Safe to remove in a future housekeeping pass. |

### 2.3 Self-Hosted Webfont Assets (`public/fonts/`)

| ID | Path | Weight / Style | Bytes | SHA-256 | License |
| --- | --- | --- | --- | --- | --- |
| `F00` | `public/fonts/LICENSE-IBM-Plex.txt` | License text | `5,299` | `23b0a9d0c6d3f140a0b77e483c5cfa6bba574325ef5cb189ed9f2fec4884533f` | `SIL Open Font License 1.1` (Copyright 2017 IBM Corp.) |
| `F01` | `public/fonts/ibm-plex-mono-latin-400-normal.woff2` | `400 normal` | `14,708` | `08949f728dc52d528e69b1667d15c89a5686a4ee9a296ff90983985f99c380f7` | `SIL OFL 1.1` |
| `F02` | `public/fonts/ibm-plex-mono-latin-400-italic.woff2` | `400 italic` | `16,448` | `0840095faae86403735a8c04014b72cb29e7923646b222b360b7e8252932e4e3` | `SIL OFL 1.1` |
| `F03` | `public/fonts/ibm-plex-mono-latin-600-normal.woff2` | `600 normal` | `15,620` | `0d1f0b8d0722224e32e9f28261bdc86c79115be73444ae5eceb73976a1bcdf83` | `SIL OFL 1.1` |
| `F04` | `public/fonts/ibm-plex-sans-latin-400-normal.woff2` | `400 normal` | `22,588` | `3b646991d30055a93a4ecc499713d4347953a74a947ecab435ab72070cbdab0e` | `SIL OFL 1.1` |
| `F05` | `public/fonts/ibm-plex-sans-latin-500-normal.woff2` | `500 normal` | `24,184` | `0717336fb31fcdcde4b8deb3675bb4a0f7f6d484864afcd6751ac29975962203` | `SIL OFL 1.1` |
| `F06` | `public/fonts/ibm-plex-sans-latin-600-normal.woff2` | `600 normal` | `24,252` | `8960851d691c054ed38e259bdcf1a6190d157b4203ed5bb32c632a863fb8ec2f` | `SIL OFL 1.1` |
| `F07` | `public/fonts/ibm-plex-sans-latin-700-normal.woff2` | `700 normal` | `22,832` | `42e7b0c143c19df9d99fd896e76b48f846edf0902d200bc29796b34d12c33aa7` | `SIL OFL 1.1` |

### 2.4 Audio Sample Manifest & First-Party Proxy (`public/samples/`)

| ID | Path | Kind | Bytes | SHA-256 | Provenance & License |
| --- | --- | --- | --- | --- | --- |
| `S01` | `public/samples/dirt-samples.json` | Sample bank JSON manifest (`_base: "/dirt-samples/"`) | `47,585` | `9d6c34a5244a6debe97f3afeaef2cd8dd7223f8f66e8a07b37e7622aed34db43` | Derived from `tidalcycles/Dirt-Samples` pinned commit `c74fc80f8db8038f6a33648ffef5ac00a07ad402`; `.wav` audio files proxied lazily on demand through first-party `/dirt-samples/*` (`GPL-3.0`, compatible with combined `AGPL-3.0-or-later`; documented in [`public/samples/LICENSE.md`](../../public/samples/LICENSE.md)). |

---

## 3. Exact Reproduction Recipes

### Recipe 1 — Regenerating `icon-192.png`, `icon-512.png`, `build/icon.png`, and `og-image.png`

Script: [`scripts/render-icons.mjs`](../../scripts/render-icons.mjs)

```bash
# Uses @playwright/test / playwright Chromium installed in node_modules:
PLAYWRIGHT_PATH=@playwright/test node scripts/render-icons.mjs
```

How `scripts/render-icons.mjs` guarantees pixel-accurate, deterministic output:
1. **Maskable PWA icons (`192×192` and `512×512`):**
   - Reads `public/icon-source.svg`.
   - Opens a headless Chromium context with `viewport: { width: size, height: size }, deviceScaleFactor: 1`.
   - Injects `<body style="margin:0">` with `width="${size}" height="${size}"` so the `#1b1815` ground bleeds edge-to-edge (`omitBackground: false`).
   - Saves `public/icon-192.png` and `public/icon-512.png`.
2. **Desktop bundle icon (`build/icon.png`, `1024×1024`):**
   - Same `public/icon-source.svg`, rendered at `824×824` inside a `div` with `border-radius: 185px; overflow: hidden` and a `100px` margin on a `1024×1024` viewport.
   - `omitBackground: true` keeps the ground outside the tile transparent. macOS does not mask app icons, so the full-bleed square of the PWA icons would show hard corners in the Dock.
   - `electron-builder` picks the file up by convention and writes the `.icns`.
3. **Open Graph / Social Preview (`1200×630`):**
   - Reads `public/og-image.svg`.
   - Injects local `file://` `@font-face` rules pointing directly at `public/fonts/ibm-plex-sans-latin-400-normal.woff2`, `ibm-plex-sans-latin-700-normal.woff2`, and `public/fonts/ibm-plex-mono-latin-400-normal.woff2`.
   - Awaits `document.fonts.ready` + `300ms` settle so the card never renders in fallback system fonts.
   - Composition layers inside `public/og-image.svg` (`1200×630`):
     - Ground: `<rect width="1200" height="630" fill="#0f0c0a"/>`
     - Engineering grid: `40×40` `userSpaceOnUse` `<pattern>` stroked in `#1b1815` (`stroke-width="0.5"`)
     - Ambient signal bloom: concentric `#ffa54b` ellipses at `(600, 238)` (`rx="300" ry="170" opacity="0.06"` and `rx="160" ry="95" opacity="0.08"`)
     - Decorative 26-bar level-meter band at `translate(340, 150)` (`opacity="0.28"`), predominantly `#ffa54b` with `#84baff`, `#71edda`, and `#d07ec9` accents
     - Center mark: `public/favicon.svg` geometry at `translate(542, 190) scale(2.4)` (`115.2×115.2` px)
     - Title: `"Live Music Coder"` at `(600, 392)` in `IBM Plex Sans 700`, `54px`, `#f5f3f1`, `letter-spacing="-0.01em"`
     - Subtitle: `"Write Code, Hear Music, Live"` at `(600, 438)` in `IBM Plex Sans 400`, `22px`, `#b7b4b1`
     - Engine legend row at `translate(361, 528)` in `IBM Plex Mono 400`, `15px`, `letter-spacing="0.1em"`, `#9e9a95`, pairing `10×10` (`rx="2"`) color chips with `STRUDEL` (`#ffa54b`), `TONE.JS` (`#84baff`), `WEB AUDIO` (`#71edda`), and `MIDI` (`#d07ec9`)
     - Bottom signal rail: `<rect x="0" y="622" width="1200" height="8" fill="#ffa54b" opacity="0.55"/>`

### Recipe 2 — Verifying Maskable Safe-Zone Geometry (`r < 19.2`)

For any `rect(x, y, w, h)` on the `48×48` canvas centered at `(24, 24)`, the maximum Euclidean distance from `(24, 24)` to the outer bounding-box corners must remain strictly inside the W3C Maskable `0.4 × width` safe circle (`r_safe = 0.4 * 48 = 19.2`, per `https://www.w3.org/TR/appmanifest/#icon-masks`):

- Left bar (`x=9.9, y=17.4, w=7.2, h=13.2`): farthest corner `(9.9, 17.4)` → $\sqrt{(24 - 9.9)^2 + (24 - 17.4)^2} = \sqrt{198.81 + 43.56} = 15.57 < 19.2$
- Center bar (`x=20.4, y=8.4, w=7.2, h=31.2`): farthest corners `(20.4, 8.4)` / `(27.6, 39.6)` → $\sqrt{(3.6)^2 + (15.6)^2} = \sqrt{12.96 + 243.36} = 16.01 < 19.2$
- Right bar (`x=30.9, y=13.8, w=7.2, h=20.4`): farthest corners `(38.1, 13.8)` / `(38.1, 34.2)` → $\sqrt{(14.1)^2 + (10.2)^2} = \sqrt{198.81 + 104.04} = \mathbf{17.40 < 19.2}$
