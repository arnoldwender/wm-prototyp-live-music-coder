# Live Music Coder — Art Direction: "SIGNAL ROOM"

**Repo:** `/Users/arnold/Development/wm-prototyp-live-music-coder`
**Live:** https://live-music-coder.pro · **Date:** 2026-08-16
**Companion to:** [`A11Y-AUDIT-2026-08-16.md`](./A11Y-AUDIT-2026-08-16.md) · [`ARCHITECTURE-2026-08-16.md`](./ARCHITECTURE-2026-08-16.md)

---

## The verdict this answers

> "se ve ai generated, los colores morado."

Correct, and precisely diagnosable. It was not a taste disagreement.

`--color-primary` was `#a855f7`. That is Tailwind `purple-500`, verbatim. `--color-strudel-dim` was `#7c3aed` — `violet-600`. The backgrounds were the `zinc` ramp unmodified (`#09090b`, `#18181b`, `#27272a`, `#3f3f46`). The engine accents were `blue-500`, `green-500`, `orange-500`. The headline was a purple-to-blue clipped gradient. The type stack named JetBrains Mono and Inter and **loaded neither** (see below).

That is the actual tell. Not "purple is ugly" — purple is fine. The tell is an **impeccable token *structure* filled entirely with the framework's stock values**, which is what a codebase looks like when nobody made a decision. Every value was the value you get by not choosing.

So the fix is not a different purple. It is to make a decision and encode it.

---

## The decision

### Name: **Signal Room**

Warm-carbon substrate, sodium-amber signal, instrument-panel typography, tight geometry, colour spent only where it carries meaning.

The reference is not the Hollywood hacker terminal. It is the **lab instrument and the studio rack**: a Tektronix scope, a Doepfer front panel, the screen-printed legend on a road-cased 1U unit. Anodised metal, a single hot indicator colour, dense monospaced readouts, tracked-out uppercase labels, and no decoration that isn't reporting something.

### Why this fits this product and this audience

**The audience is the algorave / TOPLAP scene.** Their visual culture is projected code as performance, phosphor and CRT, zine and rave typography, deliberately raw. "Purple gradient on near-black" is the default SaaS dashboard, and to that room it reads as someone who has never been to a gig. Signal Room reads as gear.

**Amber is a functional choice, not only an aesthetic one.** Three arguments, in descending order of how much they should bind:

1. **Projection.** This app is used in dark rooms, projected. Amber is the highest-luminance hue that survives cheap projectors without chromatic fringing. Saturated blue-violet — the outgoing accent — is the worst case: low luminance and visible fringing on DLP.
2. **Long sessions in low light.** Amber phosphor terminals were sold on exactly this. High-luminance blue-violet in a dark room is the worst case for glare over a multi-hour set.
3. **Hardware vocabulary.** Amber is the "signal present" lamp, the LED ladder on a compressor, the record light. It already means *this is live* to this audience.

**Amber is also nobody's default.** The stock answer for a dark dev tool is purple, indigo or blue. That is precisely why it was the answer here before.

**The brand accent IS the Strudel accent.** Strudel is the default and flagship engine, so `--color-primary` and `--color-strudel` are one value. That is semantically honest and it removes a competing hue from a field that already had eight.

### What is deliberately rejected

| Rejected | Why |
|---|---|
| **Framework-default palettes** (`purple-500`, `zinc`, `indigo-500`) | The root cause. Any value traceable to a Tailwind default is a value nobody chose. |
| **The clipped-gradient headline** | The single most-generated landing-page treatment of 2023-2026. It also *lowered* contrast unpredictably along its own length — the wrong trade for text read off a projector. |
| **Full cyberpunk / Matrix pastiche** (`#00FF00` on `#000`, scanlines, glitch) | Tempting for this scene and *also* a cliché, just a different one. It is a costume, not an identity, and the skill catalogue's own data rates it "accessibility: limited". Offered instead as **two opt-in editor themes** (Sodium, Phosphor) — honouring the tradition without wearing it as the product's face. |
| **Neon synthwave** (pink/cyan bloom) | Glow bleeds under projection; illegible where it matters. |
| **Pill-shaped everything + soft 16px radii** | Stock-dashboard geometry. Radius scale halved to 2 / 4 / 8px. |
| **Colour as decoration** | Every hue in this system has a job. Variables in the editor are plain text on purpose, so that the coloured tokens actually read as signal. |

---

## Before / after, measured

| | Before | After |
|---|---|---|
| `--color-primary` | `#a855f7` (tailwind `purple-500`) | `#ffa54b` — `oklch(0.800 0.150 62)` |
| Substrate | `zinc` ramp, hue 240 (blue-black) | warm carbon, `oklch(H70, C<=0.010)` |
| `--color-text-muted` | `#71717a` — failed on **all four** surfaces (4.12 / 3.67 / 3.08 / 2.16) | `#9e9a95` — passes on all four (**6.97 / 6.32 / 5.59 / 4.81**) |
| Ink on filled badges | `#fafafa` on accent = **2.06-3.79** (fail) | `--color-on-accent` = **6.74-13.76** (pass) |
| Engine accents under CVD | worst-case **dE 1.9** — purple and blue *identical* for deuteranopes (~6% of men) | worst-case **dE 13.5** (7x better) |
| Webfonts actually loaded | **none** | IBM Plex Mono + Sans, self-hosted, 7 files / 148 KB |
| `color-contrast` violations (axe, 14 routes x 2 viewports) | **4 602 nodes / 29 unique pairs** | **0 nodes / 0 pairs** |
| Raw hex in `editor/theme.ts` + `themes.ts` | **131** | **0** |
| Raw `rgba()` in components | 11 | 2 (both the annotated CRT effect) |
| Raw hex in components | 6 (1 true violation) | 3 (all legitimate Canvas fallbacks, now accurate) |
| Raw `letterSpacing` literals | 23, across **6** arbitrary values | 0, on a **3-step** token scale |
| Undeclared tokens referenced with fallbacks | 3 (`--color-info`, `--color-accent`, `--color-primary-light`) | 0 — declared, fallbacks dropped |

### How the palette was built

Every value is generated from **OKLCH** and every pair is **measured**, not estimated. The OKLCH triplet that produced each hex is in the comment beside it in `colors.css`, and the four numbers after each ink/accent token are its measured WCAG ratio against `--color-bg` / `-alt` / `-elevated` / `-hover`. A verification script confirmed all 24 tokens: every hex matches its stated OKLCH, and every stated ratio matches the computed one.

The palette is **AA by construction**. There is no "do not put this colour on that surface" caveat to remember — the previous palette needed one, and the audit's own recommended fix (`#8d8d95`) would still have needed one for `--color-bg-hover`.

### Colour-vision deficiency — the finding that changed the design

The brief required the four engine accents to remain distinguishable without relying on hue alone. Simulating dichromacy (Viénot-Brettel-Mollon) over the *outgoing* palette produced the most damning number in this whole pass:

```
BEFORE (purple / blue / green / orange)
  deutan   min dE  1.9  (strudel/tonejs)   <- effectively the same colour
  tritan   min dE 12.7  (tonejs/webaudio)

AFTER (dark-field-adapted Okabe-Ito, lightness-laddered)
  deutan   min dE 22.0
  tritan   min dE 13.5
```

Strudel and Tone.js — the two most-used engines — were **indistinguishable** for deuteranopes, about 6% of men. Not "hard to tell apart": dE 1.9 is below the just-noticeable threshold.

The new accents are a dark-field adaptation of the **Okabe-Ito colour-universal palette** (Okabe & Ito, 2008) — a published, citable, colour-vision-research palette, which is close to the opposite of a framework default. Crucially they are laddered in **lightness** as well as hue (`L` 0.800 / 0.780 / 0.870 / 0.705), so they stay separable when hue collapses.

Even so: **hue is not the only signal, and the system does not pretend it is.** The weakest remaining pair is Tone.js/WebAudio under tritanopia at dE 13.5. Engine identity is additionally carried by the 2px left rule and the text label. Colour is the second signal, never the only one.

---

## Typography — the pairing decision was "don't pair, unify"

### The finding

`typography.css` declared `'JetBrains Mono'` and `'Inter'`. Nothing loaded either one: no `@font-face`, no `<link>`, no `@fontsource` dependency, nothing in `public/`. Every visitor was silently served the OS fallback — SF Mono / SF Pro on macOS, Consolas / Segoe UI on Windows.

So the shipped typography differed per platform and had never actually been chosen. **Declaring a family is not shipping it.** This was an unexamined default twice over: an unexamined choice that wasn't even in effect.

### The decision

**IBM Plex Mono + IBM Plex Sans**, self-hosted.

JetBrains Mono + Inter is two unrelated skeletons — a humanist mono and a Helvetica-descendant neo-grotesk — that share nothing but popularity. This product's hero surface **is the code**. So the chrome should be a sibling of the code face, not a stranger to it. Plex Sans and Plex Mono come from one superfamily (Bold Monday for IBM, 2017): shared skeleton, shared proportions, shared vertical metrics. Labels sit on the same rhythm as the code they label.

Why Plex over the safe JetBrains Mono default:

- It is an **institutional / engineering** face, not a startup face. The grotesk skeleton with clipped terminals reads as instrument panel and engineering drawing — the studio rack, not the SaaS dashboard.
- Large apertures and a tall x-height **survive projection at distance**, which is functional here.
- Genuinely distinctive letterforms (the italic single-storey `a`, the `g`, the flag on the `l`) — recognisable in a screenshot, legible from the back of a room.

Shipped as `latin` subset woff2, 7 files, 148 KB total, `font-display: swap`, two weights preloaded. **Self-hosted, not Google Fonts** — third-party font requests leak visitor IPs (DSGVO) and add a DNS+TLS round trip to first paint. Licence (SIL OFL 1.1) vendored at `public/fonts/LICENSE-IBM-Plex.txt`; it covers the font files only and has no effect on this project's own licensing.

A third voice comes free: **Plex Mono, uppercase, tracked** is the panel-legend register (`SAMPLES`, `REFERENCE`, `WHAT'S NEW`). That idiom was already native to this codebase in ~10 components as raw `letterSpacing` literals across six arbitrary values — it just had no name. It is now three tokens at the values the code already used, so that consolidation is a pure refactor.

---

## The editor is no longer a separate universe

`editor/theme.ts` (35 raw hex) and `themes.ts` (96 raw hex) defined a second, undocumented palette. Worse, the four themes each had their **own background** — `#09090b` / `#0c0a09` / `#042f2e` / `#020c02` — so choosing "Cyan" put a teal editor inside a graphite application.

Now: `EditorView.theme()` and `HighlightStyle.define()` both accept `var(--…)`, so **every value is a token**. All four themes share one substrate and differ only in the accent role and syntax emphasis. Chrome and highlight are built by two factories, so a theme states its deltas rather than redefining the world.

Syntax roles map onto the product palette:

| role | token | meaning |
|---|---|---|
| keyword | brand amber | control flow — the brand gesture |
| function call | webaudio aqua | "this makes sound" |
| string | success green | sample names, note strings |
| number | hazard yellow | tempo, gain, note values — read fast mid-set |
| definition | tonejs cornflower | |
| property | midi orchid | |
| **variable** | **plain text** | most code is variables; colouring them all is noise |

Verified live: `note` resolves `rgb(113,237,218)` = `--color-webaudio`; `"c3 e3 g3 b3"` = `--color-success`; `800` = `--color-warning`; `.lpf` = `--color-midi`. Every syntax role is a resolved product token, measured >= 4.5:1 on both the editor field **and** the active line.

Theme roster (ids **frozen** — they are persisted in user settings; renaming would silently reset every user's choice through the `getThemeById` fallback):

| id | name | character |
|---|---|---|
| `purple` | **Signal (Default)** | full product palette |
| `amber` | **Sodium** | monochrome amber — the P3 phosphor terminal |
| `cyan` | **Scope** | aqua accent — oscilloscope |
| `green` | **Phosphor** | monochrome green — the P1 terminal |

---

## The mark — favicon, app icons, social preview

### The problem with the old favicon

`public/favicon.svg` was a violet lightning bolt built from **15 stacked `feGaussianBlur` ellipses** in `#863bff` / `#7e14ff` / `#47bfff`.

Two independent failures:

1. **It was the same stock violet as the dead token palette.** Retinting the whole product and leaving the favicon would have reintroduced the exact tell in the one place the brand is *always* on screen — the browser tab. The tab is the highest-frequency brand impression the product has.
2. **It did not survive its own render size.** `stdDeviation` of 4.6-7.7 on a 48px canvas is soft at 512px and mush at 16px, which is the size a favicon is actually drawn at.

### The new mark

A **three-segment level meter**: amber bars of unequal height on a carbon tile. Zero filters, zero gradients, four solid shapes.

- It is the same visual language as the in-app `WaveformIcon`, **reduced from four bars to three**. That is the standard responsive-logo move and it is forced by arithmetic: four bars in a 48u canvas is 2px bars with 1px gaps at 16px, and they merge.
- **Carbon ground rather than transparent**, so it holds on both light and dark browser chrome — on white the tile supplies the contrast, on near-black the amber bars carry it. Verified on both.
- The peak segment is `--color-primary-ink` (`#ffc476`, 10.96:1 on the tile); the flanking segments are `--color-primary`. A brightness step, not a hue step — hue variation muddies at tab size.

### The 16px check actually ran

This was not assumed to scale. A true **16×16 raster** was rendered and inspected on both light and dark chrome, alongside 32px and the masked PWA icon.

It caught a real defect on the first pass: `rx="3.5"` on a 7u-wide bar is a **full capsule**, and at 16px the rounded ends eroded each bar into a blob. Bars were widened to 7.5u and the radius cut to 2.4 — deliberately *not* the capsule radius (3.75). The second render was re-inspected before being accepted.

### Two sources, because the constraints conflict

`manifest.json` declares the PNGs `purpose: "maskable"`, so only the central circle of 80% diameter is guaranteed visible. The favicon is tuned the opposite way — its bars run wide to survive 16px, which puts their corners at **r=19.29**, right on the r=19.2 safe boundary. Android could clip them.

So there are two sources, both committed and both verified by script rather than by eye:

| file | role | measured max corner radius |
|---|---|---|
| `public/favicon.svg` | browser tab, not masked, bars run wide | 19.29 (fine — nothing crops a favicon) |
| `public/icon-source.svg` | PWA/app icon, full bleed, inside safe zone | **17.40 < 19.2** |

`public/icon-192.png` and `public/icon-512.png` are now **generated** from `icon-source.svg` by [`scripts/render-icons.mjs`](../scripts/render-icons.mjs), so they cannot silently drift from the mark again.

### Social preview regenerated (this closes a remainder listed earlier in this doc)

`public/og-image.svg` was rebuilt and `og-image.png` **regenerated** — it carried the violet bolt, the old engine hues, the zinc greys and the byline. The same script renders it, and it renders it **with the real IBM Plex woff2 files loaded**, so the most-shared image of the product is set in the product's typeface rather than in the system font.

Composition after removing the byline: the type block and engine legend were re-centred rather than left with a hole beneath them, and the engine row now lists **all four** engines (the copy says "4 audio engines"; the old row showed three). All three blocks measured at **0.0px offset** from centre — the first attempt was 17px off and was corrected against the measurement, not against an impression.

One trap worth recording: **XML forbids `--` inside a comment**, so token names cannot be written normally in an SVG comment. The first version of these files documented `--color-primary` and friends and was invalid XML. All three SVGs now parse clean, checked with a real parser.

## The byline

`by Wender Media` was removed from the logo.

The `showTagline` prop went with it. It gated the byline and nothing else, so once the string was gone the prop had no branch to control — leaving it would have been a switch that toggles nothing. Removed from the interface, from `SIZE_MAP`, and from all three call sites (`SiteNav`, `Docs`, `Legal`). Attribution still lives in the footer, `/legal` and the repo; it does not need to ride along on the product mark in the editor chrome.

Also removed from `public/og-image.svg`. **`public/llms.txt` was deliberately left alone** — it is being handled separately.

Two Boy-Scout fixes fell out of touching this atom: `WaveformIcon` referenced `--color-primary-dark`, a token **no stylesheet has ever declared** (it was silently falling through its `var()` fallback), now `--color-primary-dim`; and its bar comments still described the bars as "lightest purple" and "darkest accent".

## What a viewer would now say instead of "AI generated"

Before, the honest read was: *"a dark SaaS dashboard with a purple gradient — I have seen this exact page a hundred times."* Centred hero, purple-to-blue clipped headline, glowing purple pill, three feature cards with tri-colour outline icons, system font.

After, the read is: **"this was built by someone who has been in a live room."**

Concretely, what changed the impression:

1. **The headline is now the highest-contrast element on the page** (17.61:1) instead of a decorative wash. It looks like a statement rather than a template slot.
2. **One hot colour, spent deliberately.** Amber appears on the CTA, the live indicator, the waveform, and the code keywords — the things that are *live* — and nowhere else. Restraint is what reads as authored.
3. **Warm carbon instead of blue-black.** Two shades of difference, but it moves the surface from "dark mode UI" to "equipment".
4. **The chrome speaks in panel legends.** Tracked uppercase mono section headers read as screen-printed labels on a rack unit.
5. **The editor and the app are the same object.** Previously the code pane was visibly a different product.
6. **The type is chosen and actually present.** IBM Plex is recognisable; SF Pro fallback is not a choice.

---

## Honest remainders — what this pass did NOT fix

Nothing below was introduced by this work; all of it is pre-existing and out of the scope granted. Recording it so nobody reads "0 contrast violations" as "the app is done".

- **`--radius-full` is still used for ~27 capsule chips and tags.** The token's stated intent is genuine circles only, and `Badge` was moved off it, but the full sweep touches 9 files and is a visual change that was not in scope. `spacing.css` says this in the comment rather than claiming a rule it does not enforce.
- **The mobile footer still collides** — visible as "Str**120 BPM**Lv.1" at 390px. Audit P1-10, a flex layout defect, not a token defect.
- **51 non-contrast axe violation nodes remain**, concentrated on `/editor` (10 rules at mobile). These are the audit's P0-3 / P0-4 / P1-4 through P1-8 — dialog naming, focus restore, landmark duplication, tablist structure. Structural a11y, untouched here.
- **Touch targets.** `--size-touch-min` / `--size-touch-comfortable` are now declared, but **not yet applied** to the 21 controls measuring under 24px (audit P1-9). The tokens exist so that fix is now a one-line change per call site.
- **Structural size tokens are declared but not yet substituted** into the 164 raw `px` literals. `--size-nav`, `--size-activity-bar`, `--width-content-*` are available; the substitution is audit item 13 and is a large mechanical diff.
- **The hero CTA glow is still strong.** It is now token-driven (`--shadow-glow-strudel`), so tuning it is one value — but it remains the most "neon" element left.

## Verification performed

- `npx tsc --noEmit` — clean.
- `npm run test` — **25 files / 158 tests pass**, including `colors.test.ts`, the drift guard that parses `colors.css` and asserts the Canvas `VIZ_COLORS` literals still match.
- `npm run build` — succeeds. Warnings (`eval` in `@strudel/soundfonts`, chunk size, ineffective dynamic import) are pre-existing and unrelated.
- **axe-core 4.12.1 + Playwright**, 14 routes x 2 viewports, same method as the a11y audit, resolved from a sibling repo — nothing installed into this repo. `color-contrast`: **0 nodes**.
- **Render falsifier run before trusting any axe number** — an intermediate sweep reported "0 violations" while a JSX syntax error was preventing the app from mounting. Subsequent runs assert real DOM (`/samples`: 5 543 nodes, 198 cards, 0 page errors) before the result is accepted.
- Screenshots read back at 1440px and 390px on `/`, `/editor`, `/samples`, `/sessions`, `/changelog`.
- Computed-style probe confirming the resolved font families and every syntax-role colour in the live editor.

---

*Proprietary. All Rights Reserved · Arnold Wender · 2026*
