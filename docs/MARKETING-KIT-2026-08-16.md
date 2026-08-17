# Live Music Coder — Go-to-Market Kit

**Product:** Live Music Coder — https://live-music-coder.pro
**Repo:** `wm-prototyp-live-music-coder` (public, non-fork, AGPL-3.0-or-later + MIT dual)
**Prepared:** 2026-08-16
**Status:** DRAFTS ONLY — nothing published, nothing queued. Reddit stays manual.

**Claim gate sources (mandatory, both read in full):**
- [`ARCHITECTURE-2026-08-16.md`](ARCHITECTURE-2026-08-16.md) — verified architecture reference; Appendix A = 14 adversarially-verified findings (8 confirmed · 6 partially wrong · 0 refuted)
- [`IMPLEMENT-CLAIMED-2026-08-16.md`](IMPLEMENT-CLAIMED-2026-08-16.md) — work order of publicly-claimed-but-unimplemented features

Everything in this kit traces to one of those two documents or to a falsifier run against the repo on 2026-08-16 (commands shown inline). **No claim in this kit is unverified.** Where a number could not be confirmed, it is absent — not estimated.

---

## 0. The headline recommendation

> **Do not market yet. Run a scoped fix sprint first, then launch in three gates.**
> The wedge this product actually wins on — *curated, annotated sessions as the on-ramp to Strudel* — is precisely the feature that is broken today. And the desktop download, which would be the primary conversion event, ships a live-reproduced remote takeover chain.

Reasoning in full at [§10 Launch timing](#10-launch-timing--the-three-gates). The short version:

| | Finding | Why it blocks marketing specifically |
|---|---|---|
| **1** | Pressing Run on any multi-layer session plays **only the final layer** (P1, `dollar-strip` CONFIRMED) | **All 49 sessions use stacked `$:`** (23 occurrences). Loading a session calls `handleEvaluate()` automatically — the defect fires **with no keypress at all**. The pitch is "hear a finished piece in one click"; the click delivers one layer of it. |
| **2** | 5 shipped examples throw at runtime (P2, `widget-clobber`) | Traffic sent to `/examples` hits exceptions. |
| **3** | Desktop app: no `will-navigate` guard (`electron-no-nav-guard` CONFIRMED, **exploit reproduced live**). The companion `$HOME` write primitive **has since been fixed in the working tree — but is uncommitted and unreleased** | Promoting "share patterns by link" *and* "download the desktop app" together amplifies the exact attack path. **The shipped `v1.1.0` dmg contains none of the fixes.** Duty-of-care blocker on the desktop CTA, not a polish item. See §10 Gate 2 for the precise current state. |
| **4** | Zero analytics of any kind ship today | Launching now means spending the one-time attention burst and **learning nothing** from it. |

The fix sprint is small. P1 and P2 are each a *deletion*. Gate 1 is days, not weeks.

**And one sequencing point that is free:** the upstream relationship should be established **before** the fix sprint finishes, not after. The three assets that can ship today (§10) — the "Built on Strudel" post, the German mini-notation glossary, and a Discord message asking for a sanity check on attribution — cost nothing, depend on no working demo, and determine how every later post is received. External verification surfaced that Strudel has explicit downstream norms (naming, hosting, integration paths) which **Live Music Coder already satisfies** — see §1.4. That is worth saying out loud, early, in the community's own venues.

---

## 1. Claim gate — what may and may not be said

This table governs every asset in this kit. It is not advisory.

### 1.1 FORBIDDEN — do not market, do not imply, do not screenshot

| Claim | Status | Where it currently leaks |
|---|---|---|
| **IndexedDB autosave / "your work is saved"** | No consumer for `setupAutosave`; no `localStorage` substitute | `README.md:197,223` (persistence table), `LICENSING.md` |
| **Node graph with "draggable, connectable nodes"** | True only for `tonejs`/`webaudio`. For `strudel` — the **default engine** — it is a permanent empty state | `README.md:59` |
| **Audio recording / "export your set"** | Recording a Strudel session **captures silence** (three separate `AudioContext`s; `setAudioContext` called zero times) | `README.md:97` |
| **Clock sync / multi-tab BPM broadcast** | The `sync`/`bpm` cases only `console.log`; `broadcastBpm` has zero callers | `README.md:103` |
| **Solo/Mute via Alt+1..9** | `solo-mute.ts` entirely unconsumed; the keybind mutates a `Set` nothing reads | `README.md:101` |
| **MIDI Learn ("map any CC to any parameter")** | Write-only — `getMidiMapping`/`getAllMappings` have no callers; UI hardcodes `startMidiLearn('lpf')` | `README.md`, in-app docs ×3 locales |
| **"19 device profiles load automatically"** | 19 tested profiles exist in `midi-devices.ts` with **no importer** outside its own test | in-app `docs.midiSetup` ×3 locales |
| **Windows / Linux desktop app** | **Never released.** `v1.1.0` ships 4 macOS assets only (2 dmg, 2 zip, `latest-mac.yml`). No `latest.yml`, no `latest-linux.yml`, no `.blockmap` | `package.json build` declares the targets; README correctly says "Coming soon" |
| **"Cross-platform desktop app"** | Same as above — macOS only, today | brief framing; **must not propagate** |
| **`midin(cc, min, max)` / `Ctrl+.` / `gamepad(0)` / "ESC to exit"** | Wrong signature; no binding exists; not in eval scope; no handler | in-app docs + banner |
| **`.lmc` files open the app** | Declared to the OS, not implemented — double-click does nothing | `package.json build.fileAssociations` |
| **Menu accelerators (⌘N ⌘O ⌘S ⌘E …)** | 18 `menu:action` strings sent, **no renderer subscriber** — and the accelerator is consumed before the web layer sees it | the menu itself |
| **In-code `._pianoroll()` / `.pianoroll()` painters** | Clobbered — `haps` undefined → throws | `README.md:55` "visualizers rendered directly in the code" |
| **Any count except the verified ones below** | See §1.3 | 5 different session counts are in the wild |

> **Rule:** a feature on this list may be *built* and then marketed. It may never be marketed and then built. Anything still unimplemented at sprint close gets its sentence removed the same day.

### 1.2 MARKETABLE — verified true on 2026-08-16

| Claim | Verification |
|---|---|
| Free, browser-based, no install, no account | Site returns `200`; editor requires no auth |
| **219 code examples** | `grep -c "^  {" src/data/example-library.ts` → 219 |
| **49 curated sessions across 15 genres** | 49 `slug:` entries; `SESSION_CATEGORIES` = 15 |
| Sessions are **German-authored by design**, with composer notes + movement breakdowns | `sessions-library.ts` type docs: *"display language is German"* |
| Sessions are **AI-composed, disclosed per piece** with model ID | `// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender`; `aiGenerated: "KI-komponiert"` |
| **14 documentation sections** | `grep -c "^  {" src/data/docs.ts` → 14 |
| **5 blog posts** + changelog | `blog-library.ts` → 5 |
| **Trilingual UI — DE / EN / ES** | 3 complete locale files; key-set parity currently perfect |
| **4 audio engines** (Strudel, Tone.js, Web Audio, MIDI) | engine adapters present and tested for constructability |
| **7 visualizer panels** (waveform, spectrum, timeline, pianoroll, punchcard, spiral, pitchwheel) | React panel components render from the analyser tap — independent of the clobbered `Pattern.prototype` painters |
| MIDI **input**: `midikeys()`, live CC grid, hot-plug detection, compose mode | `strudel-keys.ts`, `MidiPanel.tsx` |
| Virtual keyboard / synth mode (2 octaves, oscillator select, biquad filter + response curve) | `VirtualKeyboard.tsx`, `FilterCurve.tsx` |
| Inline `slider()` widgets, `onKey()`, `createParams()` | live in the CodeMirror layer |
| Share via **compressed URL** (lz-string) and **GitHub Gist** | `url.ts`, `gist.ts` |
| Download pattern as `.js` | `StrudelEditor.tsx:712-716` |
| Sample browser — **196 base Dirt-Samples**, drag-and-drop local import | measured: 196 base / 1745 entries — *use the 196 figure consistently* |
| 4 editor themes, vim mode, zen mode, font size | `SettingsPanel` |
| **macOS desktop app, signed + notarized** (Apple Silicon + Intel) | `hardenedRuntime: true`, `notarize: true`; 4 assets on `v1.1.0` — **gated behind Gate 2, see §10** |
| **AGPL-3.0-or-later** (combined app) + MIT (original modules), SPDX header per file | `LICENSE`, `LICENSING.md` |

### 1.3 The count problem — fix before any launch

The same asset is advertised with **five different session counts** across public surfaces. For a technical audience that will check, this is a credibility leak, not a typo.

| Surface | Says | Truth |
|---|---|---|
| `README.md:83` | 51 sessions | **49** |
| `README.md:85` | 220+ examples | **219** |
| **Examples page UI** | **65 patterns** | **219** — `TOTAL_EXAMPLE_COUNT` snapshots `.length` *before* ~154 further entries are pushed |
| in-app docs `sessionsText` ×3 locales | 43 sessions, 10 genres | **49**, **15** |
| **GitHub repo description** | "43 sessions, 190+ examples" | **49**, **219** |
| Blog post title (public) | "Launching 43 AI-Composed Sessions" | historical — acceptable as a dated post |
| `public/llms.txt` | 219 / 49 / 14 | ✅ **already correct** |

Also: `README.md:83` lists **"Deep House"**, which is not a category. The real 15th is **"Electronic."**

> **The understatement is the bigger loss.** The Examples page tells every visitor the library holds 65 patterns while rendering 219. One line moved to end-of-file adds 154 patterns to what users believe they are getting. It is the single highest-leverage marketing fix in the repo and it is not a marketing task.

**Falsifier:**
```bash
grep -c "^  {" src/data/example-library.ts   # 219
grep -c "slug: '" src/data/sessions-library.ts # 49
grep -c "^  {" src/data/docs.ts               # 14
```

### 1.4 The upstream relationship — three verified constraints, one of them a surprise

Live Music Coder is a **downstream work built on Strudel**, and the combined application is AGPL-3.0-or-later *because* of that dependency (`LICENSING.md` states this explicitly). External verification on 2026-08-17 surfaced three upstream facts that govern this kit — and the good news is that the product already complies with two of them.

**(a) ✅ The naming constraint — already satisfied.**
Strudel's official FAQ states verbatim:
> *"Please don't use 'strudel' in the name of your project (e.g. strudel2000, foo-strudel), so people don't assume it's official strudel project."*
> — [strudel.cc/learn/faq/](https://strudel.cc/learn/faq/), accessed 2026-08-17

**"Live Music Coder" complies.** This is not a lucky accident to be quiet about — it is a *positioning asset*. Say so. **Corollary for every asset in this kit:** copy must never imply officialness or endorsement. "Built on Strudel" ✅ · "The Strudel IDE" ❌ · "Strudel Pro" ❌ · "Official-anything" ❌.

**(b) ✅ The integration path is upstream-sanctioned.**
Strudel's Technical Manual names the lower-friction integration routes that avoid full-derivative status: iframe embed, `@strudel/embed`, `@strudel/repl`, `@strudel/web`, **or npm packages via a bundler**. LMC consumes `@strudel/*` npm packages through Vite — **a sanctioned path**. ([strudel.cc/technical-manual/project-start/](https://strudel.cc/technical-manual/project-start/))

And LMC went further than required: it licensed the combined application AGPL-3.0-or-later voluntarily rather than arguing the derivative boundary. That is the community-respecting posture and it should be stated plainly. **§13 network-use:** users must be offered the Corresponding Source — this ships today via the landing footer's GitHub link. **Never remove or bury that link**, on any page or campaign.

**(c) ⚠️ The surprise — Strudel left GitHub, deliberately, and asks people not to fork it back.**

> The GitHub repo `tidalcycles/strudel` was **archived read-only on 2025-06-19**. Canonical development moved to **`codeberg.org/uzu/strudel`**. The README states: *"we have moved from Microsoft's Github platform to Codeberg for ethical reasons"* and adds: ***"Please don't fork the project back to github."***
> — [codeberg.org/uzu/strudel](https://codeberg.org/uzu/strudel), accessed 2026-08-17

**Read this precisely, and do not overstate it.** LMC does **not** host a copy of Strudel's source on GitHub — it consumes published npm packages. The literal request ("don't fork the project back to github") is therefore **not violated**. But the *values* behind it are live, they are held by exactly the community whose goodwill this launch depends on, and a downstream project that shows up on GitHub-only optics is starting a conversation on the back foot.

**What this changes in practice:**

| Do | Don't |
|---|---|
| Link **strudel.cc** and **codeberg.org/uzu/strudel** when crediting upstream — never the archived GitHub mirror | Link `github.com/tidalcycles/strudel` (archived, read-only, and reads as not having checked) |
| Acknowledge the move if the topic arises, without performing agreement you don't hold | Lecture the community about hosting choices, or make it a marketing angle |
| Consider a **Codeberg mirror of LMC** as a genuine goodwill signal | Move the primary repo without thinking it through — CI, releases, Dependabot and auto-update all point at GitHub |

> ⚠️ **[NEEDS ARNOLD] — Codeberg mirror: yes / no?**
> A read-only Codeberg mirror of `wm-prototyp-live-music-coder`, linked from the README, costs little and signals that the upstream's stated values were noticed. Migrating primary hosting is a much larger call (auto-update feeds, releases, Dependabot, the WM fleet convention that all repos live on GitHub). Recommendation: **mirror, don't migrate** — but it is Arnold's decision either way.

**Current attribution state, and the cheapest fix in the entire kit:** the landing page renders *"Powered by · Strudel · Tone.js · Web Audio"* (`Landing.tsx:193`) — but **Strudel is plain text, not a link**. Make it a hyperlink to `https://strudel.cc` and add one sentence naming the relationship. Minutes of work, and it is the first thing a knowledgeable visitor checks.

**Legally required vs. courtesy — be clear which is which.** AGPL requires notice preservation, change tracking, AGPL licensing of the derivative, and the §13 source offer. It does **not** legally require a "Powered by Strudel" badge. That credit is a *community norm* — which in a scene this size matters more than the legal minimum, not less.

> ⚠️ **[NEEDS ARNOLD] — GitHub does not recognise the licence.**
> `gh repo view` returns `licenseInfo: {"key":"other","name":"Other"}`. GitHub scores `LICENSE` by *similarity to the SPDX template*; this repo's `LICENSE` is a short notice + copyright line, with the full text in `LICENSE-AGPL`. Result: **no AGPL-3.0 badge, no machine-readable classification** — on a repo whose entire positioning is "deliberately open source." Same trap that hit `angelical-harness` (documented in the global `CLAUDE.md`).
> Fix: put the **verbatim, unmodified AGPL-3.0 text** in `LICENSE`, move the copyright notice to `README`/`LICENSING.md`. Arnold's call — it touches licensing files.

### 1.5 EU AI Act Art. 50

The 49 sessions are **AI-composed**. This is already disclosed correctly in-product (footer `aiDisclosure`, per-session `aiGenerated` badge, model ID in source comments) — genuinely good compliance and a *positioning asset* (see Pillar 3).

**Therefore:** any demo video, audio clip, social asset, or Product Hunt gallery item that features a Session carries a visible **"KI-generiert / AI-generated"** label. That includes YouTube's synthetic-content disclosure toggle. No exceptions — the sessions are the wedge, so nearly every asset will need it.

Original screen recordings of the *interface* need no label. Music generated by a Session does.

---

## 2. Positioning (Dunford message house)

### 2.1 Competitive alternatives — what the target uses if this doesn't exist

All licences, versions and activity below verified 2026-08-17 against primary sources (repo READMEs, LICENSE files, official docs). **Nothing in this table is dormant** — the honest read is that this is a small but healthy ecosystem, not a field of abandoned projects waiting to be replaced.

| Alternative | Status 2026 (verified) | Licence | Platform | Where it wins | Where it leaves people behind |
|---|---|---|---|---|---|
| **strudel.cc** | Active. Latest tagged release found: `@strudel/core@1.2.4` (2025-09-10). **Moved GitHub → Codeberg 2025-06-19.** Codeberg: 1.1k stars / 327 forks | **AGPL-3.0-or-later** | Browser | Canonical; free; zero-install; where the language is developed; MIDI + OSC I/O; **now has `.wav` export** | English-language surface; blank-REPL start; no annotated repertoire |
| **TidalCycles** | Active. v1.10.0 (2025-06-08); also on Codeberg | **GPL-3.0** (*not* AGPL) | Desktop only | The original and most expressive pattern language; the scene's centre of gravity | Haskell + SuperCollider install; hostile first hour |
| **Sonic Pi** | Very active. **v5 shipped mid-August 2026** — "a complete overhaul": friendlier errors, Ableton Link, MIDI clock sync, gamepad support. Next-gen rewrite "Tau5" in progress | MIT app / GPLv3 bundled components / CC0 samples | Desktop (incl. Raspberry Pi) | **The education benchmark.** Friendliest on-ramp in the field, huge school adoption | Desktop install; its own language, not Tidal patterns |
| **SuperCollider** | Active. v3.14.1 (2025-11-23) | GPL-3.0-or-later | Desktop | Unmatched synthesis/DSP depth; the substrate much of the scene sits on | Steepest curve of all; not an on-ramp |
| **Gibber** | **Momentum uncertain** — creator active 2026-05, but no recent major release confirmed | MIT | Browser | Audio **and** ray-marched visuals in one browser tool | Smaller ecosystem; not Tidal-lineage |
| **Hydra** | Active. Repo updated 2026-04-25; ~2.6k stars | **AGPL** (same copyleft family) | Browser | The de facto standard for live-coded **visuals** | Complementary — commonly paired *with* Strudel, not competing |
| **Orca** | Active. Maintained by Hundred Rabbits; JS/C/Norns ports | MIT | Desktop + browser + Norns | Extreme generative sequencing in a spatial grid | Not a synth or pattern language — sequences *other* tools |
| **Mainstream DAW** | — | proprietary | Desktop | Everything else | Not live coding; no code as instrument |
| **Do nothing** | — | — | — | — | **The real competitor.** Most people who get curious never get past the first blank editor. |

> **The honest read: "do nothing" and "strudel.cc" are the only two alternatives that matter for this product.** Sonic Pi is the one to watch — v5 just landed and it owns the education position by right. LMC does not compete with it on approachability in English; it competes on *being in German* and on *Tidal-lineage patterns*, which Sonic Pi is not.

**Two competitive facts that force honesty in the copy:**

1. **Strudel now ships `.wav` export.** Confirmed present on the live FAQ (a WIP PR tracked it; a March 2026 source predates it). So "record and export your set" is **not** a differentiator — and per §1.1 it does not work in LMC anyway. Removed from the appendix as a positioning claim.
2. **Strudel has MIDI and OSC I/O.** "MIDI support" is therefore not a differentiator. Only **compose mode** (play hardware → mini-notation appears in the editor) is distinctive, and only that may be framed as such.

### 2.2 Unique attributes — what only this has, verified

Ranked by (true today) × (genuinely not available upstream). This list was **cut down** after external verification — three candidates were removed because Strudel already has them.

1. **A complete trilingual surface — DE / EN / ES.** Interface, 14 documentation sections, and the session library. The live-coding world is overwhelmingly English-language, and German-speaking beginners have no alternative to point at. **This is the strongest differentiator and the one nothing else in §2.1 serves.**
2. **49 finished, annotated pieces across 15 genres** — composer notes, movement breakdowns, BPM, duration. Not snippets: *repertoire*, German-authored by design. Strudel has a workshop and examples; it does not have annotated pieces.
3. **Four engines in one editor** — drop from Strudel patterns to Tone.js to the raw Web Audio API in the same window. Strudel is Strudel (with a SuperDirt backend option); the descent through abstraction layers is LMC's.
4. **MIDI compose mode** — play notes on hardware, watch mini-notation appear in the editor. *(MIDI I/O by itself is **not** a differentiator — Strudel has it.)*
5. **A signed, notarized macOS application** — Strudel is browser-only. *(Gate 2 — see §10.)*

**Explicitly NOT unique — never claim as differentiators:**

| Not a differentiator | Because |
|---|---|
| The pattern language / mini-notation | Strudel's, from TidalCycles |
| pianoroll · punchcard · spiral · pitchwheel · scope · spectrum | Painter concepts come from `@strudel/draw` — upstream |
| MIDI and OSC I/O | Strudel has both |
| Audio recording / `.wav` export | **Strudel ships this now** — and LMC's is silent (§1.1) |
| Sample loading, Dirt-Samples, custom sample import | Tidal's sample bank; Strudel supports custom loading |
| "Runs in the browser, no install" | Strudel's core promise, not LMC's |
| "Extensive documentation" | Strudel's docs are extensive. **The differentiator is that LMC's are trilingual**, not that they exist |

> ⚠️ **Verify before publishing the trilingual claim in comparative form.** It is safe to state *"Live Music Coder's interface and documentation are available in German, English and Spanish"* — that is verified in-repo. It is **not** yet verified that strudel.cc offers no localisation at all, so do not write *"the only live-coding environment in German."* State your own fact; don't assert the competitor's absence.

### 2.3 Value — attribute → value, concretely

| Attribute | Value it enables |
|---|---|
| Trilingual surface | A German speaker learns live coding **in German**, instead of translating a REPL and a doc site while also learning a new mental model |
| 49 annotated pieces | You start from **a finished piece you can hear and read**, then take it apart — instead of an empty editor and a cursor |
| Four engines, one editor | You can follow curiosity **downward** — pattern → synth → raw audio node — without abandoning the tool you just learned |
| MIDI input + compose mode | Your existing controller becomes the input method; **you play the idea, the code appears** |
| macOS app | Live coding on a stage without a browser tab, an address bar, or a tab-close shortcut in reach |

### 2.4 Who cares most

**Primary — the bounced beginner, German-speaking.**
Curious about live coding after seeing an algorave clip. Opened strudel.cc, hit an English REPL and a blank editor, closed the tab. Has a laptop, maybe a MIDI controller, and no Haskell.

**Secondary — the music educator (DE / AT / CH).**
Needs worked, annotated, legally-clean material for a workshop or a classroom. Needs it in German. Needs to be able to hand students a URL, not an install guide.

**Tertiary — the producer with hardware.**
Already makes music in a DAW. Wants to try algorithmic patterns without giving up the controller or learning a desktop toolchain.

**Explicitly NOT the target:** the working algorave performer. They already use Tidal or Strudel directly, they have opinions about both, and they are not the people this serves. They are, however, the people whose *respect* determines whether the project is taken seriously — which is why §1.4 matters more than any headline in this kit.

### 2.5 Market frame

> **Not "a better Strudel." The guided way *into* Strudel.**

The category is **learning environment + repertoire library**, not *IDE* and not *DAW*. Framed as an IDE, LMC invites a feature comparison against strudel.cc that it does not need and would partly lose. Framed as the on-ramp, it is first in a category nobody else is serving — and the framing is *true*, which is the only reason to use it.

### 2.6 The message house

**Positioning statement**

> For German-, English- and Spanish-speaking musicians and developers who are curious about live coding but bounce off a blank English REPL, **Live Music Coder** is a free, browser-based learning environment built on the Strudel engine. Unlike strudel.cc — the upstream project it runs on and credits — it starts you inside 49 finished, annotated pieces and 219 worked examples, in your own language. Open source under AGPL-3.0.

**Three pillars** — every asset in this kit traces to exactly one.

| # | Pillar | One-line claim | Proof (verified) |
|---|---|---|---|
| **P1** | **Start from music, not a blank page** | You hear a finished piece first, then take it apart. | 49 sessions · 15 genres · composer notes + movements · 219 examples playable inline |
| **P2** | **Live coding in your language** | The whole surface — interface, docs, repertoire — in DE, EN and ES. | 3 complete locales · 14 doc sections · German-authored sessions |
| **P3** | **Open, credited, and honest about what it is** | Built on Strudel, says so, AGPL, source one click from the footer. | AGPL-3.0-or-later · public repo · per-file SPDX · AI-composition disclosed per piece |

P3 is not filler. In a FOSS-aligned scene, *how* a downstream project talks about its upstream **is** the product's reputation. It is also the pillar that costs nothing to be excellent at.

---

## 3. Messaging

### 3.1 The one-sentence pitch (pain + resolution)

> **You've wanted to try live coding for a year, and every time you open the editor it's blank and it's in English. This one opens with 49 finished pieces you can hear, read, and pull apart — in German, English or Spanish.**

This sentence governs the `<title>`, the meta description, the H1, the first paragraph, and the Product Hunt tagline. If a piece of copy contradicts it, the copy is wrong.

### 3.2 Taglines (5)

Ranked. All UWG-safe: no superlative, no Alleinstellungsbehauptung, no unverifiable number.

| # | EN | Chars | Note |
|---|---|---|---|
| **1** | **Start with music, not a blank page** | 35 | The pillar, stated as a promise. **Recommended.** |
| 2 | 49 finished pieces. Then make your own. | 39 | Specific, verified number, clear sequence |
| 3 | Live coding, in your language | 29 | Leads with P2 — best for DE/ES markets |
| 4 | Read the music. Then change it. | 31 | Names the actual learning loop |
| 5 | Free live coding, built on Strudel | 34 | Attribution-forward — best for FOSS venues |

**DE** — the shipped app uses **`du`** (`landing.hero`: "Programmiere **deine** Musik live"). Stay with `du`; mixing forms is a bug.

| # | DE | Chars |
|---|---|---|
| **1** | **Fang mit Musik an, nicht mit einer leeren Datei** | 47 |
| 2 | 49 fertige Stücke. Dann dein eigenes. | 37 |
| 3 | Live Coding — auf Deutsch | 25 |
| 4 | Musik lesen. Dann verändern. | 28 |
| 5 | Freies Live Coding, auf Strudel gebaut | 38 |

### 3.3 Hero — DE / EN (character counts in parentheses)

**DE**
```
H1        : Fang mit Musik an, nicht mit einer leeren Datei        (47)
Subhead   : Live Coding im Browser — 49 fertige Stücke mit
            Kommentaren, 219 Beispiele und 14 Doku-Kapitel.
            Auf Deutsch. Ohne Installation, ohne Konto.            (139)
CTA prim. : Session anhören                                        (16)
CTA sek.  : Editor öffnen                                          (14)
Trust     : Kostenlos · Open Source (AGPL-3.0) · auf Strudel gebaut · DE/EN/ES
```

**EN**
```
H1        : Start with music, not a blank page                     (35)
Subhead   : Live coding in the browser — 49 annotated pieces,
            219 worked examples, 14 documentation chapters.
            No install, no account.                                (124)
CTA prim. : Hear a session                                         (14)
CTA sek.  : Open the editor                                        (16)
Trust     : Free · Open source (AGPL-3.0) · built on Strudel · DE/EN/ES
```

**ES**
```
H1        : Empieza con música, no con un archivo vacío            (41)
Subhead   : Live coding en el navegador — 49 piezas comentadas,
            219 ejemplos y 14 capítulos de documentación.
            Sin instalación, sin cuenta.                           (134)
CTA prim. : Escuchar una sesión                                    (21)
CTA sek.  : Abrir el editor                                        (16)
Trust     : Gratis · Código abierto (AGPL-3.0) · construido sobre Strudel · DE/EN/ES
```

> **Note the CTA change.** The shipped CTA is "Jetzt loslegen / Start Coding" — which sends a beginner to a blank editor, the exact failure the positioning exists to fix. **"Session anhören / Hear a session"** routes to the wedge. This is a one-string change per locale with a larger expected effect than any campaign in this kit.
>
> ⚠️ Blocked by Gate 1: sending traffic to a session today plays one layer of it.

**UWG scan on the above:** no superlative ("beste", "einzige"), no comparison to a named competitor, no guarantee, no statistic without a source, no price (nothing to disclose under PAngV — the product is free and has no payment path at all). Numbers used (49, 219, 14, 3 locales) are all verified in §1.2. ✅

### 3.4 Objection handling

**"Why not just use strudel.cc?" — THE question. Answer honestly or the kit is worthless.**

> **Use strudel.cc.** Seriously — it is the upstream project, it is excellent, and Live Music Coder runs on it. If you read English comfortably and you are happy starting from an empty editor, strudel.cc is the shorter path and it is where the language itself is developed. Go there.
>
> Live Music Coder exists for the cases strudel.cc does not cover:
>
> - **You want it in German or Spanish.** Interface, documentation and repertoire — not a machine-translated wrapper.
> - **A blank editor stops you.** 49 finished pieces with composer notes, and 219 examples you can play before you write anything.
> - **You want to go below the pattern layer.** Tone.js and raw Web Audio API live in the same editor, one tab away.
> - **You want it as a macOS app.** *(after Gate 2)*
>
> Same engine underneath. Different door in.

**DE:**
> **Nimm strudel.cc.** Wirklich — es ist das Upstream-Projekt, es ist hervorragend, und Live Music Coder läuft darauf. Wenn du gut Englisch liest und mit einer leeren Datei anfangen magst, ist strudel.cc der direktere Weg — und dort wird die Sprache selbst entwickelt.
>
> Live Music Coder ist für die Fälle da, die strudel.cc nicht abdeckt: du willst es **auf Deutsch**; eine leere Datei bremst dich aus und du fängst lieber bei **49 fertigen Stücken** an; du willst unter die Pattern-Ebene, zu Tone.js und Web Audio, ohne das Werkzeug zu wechseln.
>
> Gleiche Engine darunter. Andere Tür hinein.

**Other objections:**

| Objection | Answer |
|---|---|
| *"Isn't this just a fork/reskin of Strudel?"* | No — and the distinction matters. It is **not a fork**: it consumes published `@strudel/*` npm packages through a bundler, which is one of the integration paths Strudel's own Technical Manual sanctions. Strudel is the **engine** (pattern language, scheduler, sample loading, draw painters); Live Music Coder is the **environment around it** (trilingual surface, repertoire, multi-engine editor, MIDI input layer, desktop packaging). The engine is credited, linked, and the combined work is AGPL-licensed accordingly. |
| *"Strudel moved to Codeberg for ethical reasons — why is this on GitHub?"* | Fair question, and the honest answer is that it predates the move and the WM repo fleet lives on GitHub. Live Music Coder does not host a copy of Strudel's source anywhere, so the upstream's request not to fork it back to GitHub is not at issue. A read-only Codeberg mirror is under consideration. **Do not answer this defensively, and do not pretend to a conviction you don't hold** — "you're right that it's inconsistent, here's the actual reason" is the only version of this answer that survives contact. |
| *"Is this an official Strudel project?"* | **No.** Strudel's FAQ asks downstream projects not to put "strudel" in their names precisely so nobody assumes officialness — Live Music Coder is named accordingly and claims no endorsement. It is an independent project that runs on Strudel. |
| *"AI-composed sessions? So it's slop."* | Every session is labelled, with the composing model named in the source. They are a **teaching corpus**, not a claim of artistry — they exist so you have something structured to take apart. Judge them by whether they teach; a bad one is a bug report. |
| *"AGPL is viral, I can't use this."* | For **using** the app: nothing is required of you. For **hosting a modified copy**: you must offer your users the source. The original modules that don't touch Strudel are separately MIT — see `LICENSING.md`, per-file SPDX headers are authoritative. |
| *"Why should I trust a solo project?"* | Public repo, AGPL, per-file licence headers, a published changelog, an architecture document that lists its own defects, and no fabricated numbers anywhere. Verify all of it before you install anything. |
| *"Does it work on my phone?"* | Poorly, and that is documented. Below 768px the ActivityBar, node graph and detail panel are hidden — mobile is the editor plus a visualizer strip. Use a laptop. |
| *"Is there a Windows version?"* | Not yet. Only macOS ships today. Do not promise a date. |

---

## 4. Channel plan

The audience is niche, technical, community-driven and strongly FOSS-aligned. **Reach is not the constraint — credibility is.** A single respectful post in the right Matrix/Discord room is worth more than a thousand impressions on LinkedIn.

Ranked by expected value. Padding removed — three channels are explicitly recommended *against*.

> **Two corrections to the brief's channel list, both verified 2026-08-17:**
> - **`lines.community` does not resolve.** The monome forum is **`llllllll.co`**.
> - The scene's actual centre of gravity is **not** Reddit and **not** lines. It is the **TidalCycles/Strudel Discourse forum (`uzu.lurk.org`)** plus **two Discord servers**. Neither appeared in the brief.

### Tier 1 — where this actually lives

**1. YouTube — the single highest-leverage channel. Yes, genuinely.**

Live coding is *constitutively* audiovisual: the artefact is a screen with code on it making sound. Every other channel is a pointer to a video. Uniquely here, the demo **is** the documentation **is** the marketing **is** the tutorial — one recording serves all four.

- Format: screen recording, no talking head, real-time editing visible, audio front and centre.
- Two lanes: **(a)** 45–90s vertical clips of a single session or trick (Shorts — also feeds Instagram Reels and TikTok with zero extra production); **(b)** 8–15min "take this piece apart" long-form, which is the actual moat and what educators link.
- Mandatory: EU AI Act Art. 50 label + YouTube's synthetic-content disclosure on anything featuring a Session's audio.
- Blocked by Gate 1 — a recording of a session playing one layer is a permanent public artefact of the bug.

**2. The TidalCycles / Strudel Discourse forum — `uzu.lurk.org`. The real hub.**
Tagline: *"learning and sharing patterns with Tidal, Strudel and friends."* TidalCycles category alone carries 1,136 topics; the Strudel category has 65. Also hosts a structured TidalCycles course and a "What if?" feature-ideas category. **This is where the people who would actually use and contribute to LMC already are** — more than Reddit, more than lines, more than any social platform.
⚠️ The same content family appears on aliased domains (`club.tidalcycles.org`, `doc.patternclub.org`, `strudel.patternclub.org`). **Disambiguate the canonical URL before citing it in any public copy.**

**3. Discord — two servers, both active.**
"Tidal, Strudel and friends" (**~3,117 members**, has a dedicated `#strudel` channel) and "Tidal, Strudel and other uzulangs" (**~11,084 members**). Member counts are from invite-page figures gathered 2026-08-17 — approximate; re-check at launch, and **never cite them in public copy**.
This is the highest-signal feedback available anywhere, from the people most qualified to give it. **Go here during the fix sprint, not after.** *"I built a teaching layer on Strudel, here are three things I got wrong — what else?"* is a far better first message than a launch announcement.

**4. Mastodon — including the scene's own instance.**
The live-coding scene sits on the fediverse rather than X, and it has a **dedicated instance: `social.toplap.org`**. Relevant hashtags `#livecoding`, `#algorave`. Post short clips **with alt text**, engage in replies, never cross-post mechanically.

**5. TOPLAP — the closest thing to an official cross-tool body.**
`toplap.org` now redirects to `blog.toplap.org`; the community forum is `forum.toplap.org` (Discourse, sustained but moderate volume — the Introductions category alone has ~122 replies). Founded 2004; the manifesto — *"Obscurantism is dangerous. Show us your screens."* — is still the foundational document.
**Participate before promoting.** And note how well that manifesto line fits a project that publishes its own architecture audit: *showing your screens* is exactly what content piece 10 (§5) does.

**6. GitHub — and, per §1.4(c), consider a Codeberg mirror.**
For an AGPL project the repo *is* a channel: README, topics, releases, good-first-issues (§8). But the upstream deliberately left GitHub, so a linked Codeberg mirror is a low-cost goodwill signal. `[NEEDS ARNOLD]`

### Tier 2 — worth doing once, well

**7. Hacker News (Show HN).**
Precedent is real: **Hackaday ran "Live Coding Techno With Strudel" on 2025-10-16**, so the hacker/maker press already finds this space legible. HN's own Show HN rules fit LMC unusually well — verified verbatim at [news.ycombinator.com/showhn.html](https://news.ycombinator.com/showhn.html) (2026-08-17):
- *"Show HN is for something you've made that other people can play with."* ✅ browser REPL, instantly playable
- *"Please make it easy for users to try your thing out, ideally without barriers such as signups or emails."* ✅ **LMC requires no account at all** — a structural advantage
- *"The project should be non-trivial."* ✅
- *"The project must be something you've worked on personally and which you're around to discuss."* → **block out the day.** Post-and-leave fails here.
- *"The community is comfortable with work that's at an early stage."* → so the known-gaps disclosure in post #6 is an asset, not a liability.

One shot. **After Gate 1 minimum, ideally after Gate 3** — a Show HN where the flagship session plays one layer converts curiosity into a top comment about the bug.

**8. `llllllll.co` — the monome/lines forum** *(the brief's "lines.community" does not resolve)*.
Discourse forum started by Brian Crabtree, migrated from the old monome.org community. Thoughtful and high quality; there is a long-running "Live coding" thread (observed past reply #167), so the topic is genuinely welcome — but the forum's identity is general music-tech and monome hardware, not live coding. **One well-written post about the pedagogy/trilingual angle. Not a product announcement.**

**9. /r/livecoding.**
Small but exactly on-target. **Manual only, per WM rules — never queued, never automated.**
⚠️ Subscriber count and the exact self-promotion rule text **could not be verified** (Reddit blocked automated fetching). **Read the sidebar rules in a browser before posting, follow them literally, and never cite a subscriber number anywhere.**

**10. Algorave events — regional, and there is one in ~4 weeks.**
Algorave is an event *scene*, not a central organisation — approach region by region. Confirmed 2026 dates found: **Barcelona** (Hangar / *viu* festival, 2026-04-17, past), **Geneva** (Mapping Festival, 2026-05-14, past), **London — Southbank Centre, 2026-09-12** (upcoming), plus recurring Netherlands Coding Live meetups in Eindhoven.
Attending or supporting beats announcing. This is relationship territory, not a distribution channel.

**11. ICLC 2027 — a real, dated opportunity with a live call.**
The **10th International Conference on Live Coding: 9–13 March 2027, Antwerp** (Royal Conservatoire + De Singel). **The call for submissions is open now** at `iclc.toplap.org/2027/`.
This is the highest-credibility venue available to the project, and the fit is specific: a paper or workshop on **non-English-language pedagogy in live coding** — a genuinely under-researched angle that LMC has actual material to support (trilingual docs, 49 annotated pieces, a German learner path). Diarise the deadline. `[NEEDS ARNOLD]` — worth submitting?

**12. German-language venues — the underserved wedge, and nobody else is serving it.**
Where P2 stops being a feature bullet and becomes an advantage: German music-tech communities, Musikinformatik / Medieninformatik departments, Musikhochschule electronic-music courses, and school informatics teachers looking for a creative-coding unit. **Highest conversion potential per contact in the entire plan**, because there is genuinely nothing else to point them at.
Note the competitive nuance from §2.1: **Sonic Pi owns the education position in English** and just shipped v5. LMC does not beat it on approachability — it beats it on *being in German* and on *Tidal-lineage patterns*. Pitch that, not "better for teaching."

### Tier 3 — recommended AGAINST (stated, with reasons)

| Channel | Why not |
|---|---|
| **/r/edmproduction** | Wrong audience. It is a *production* subreddit — DAWs, mixing, mastering. Live coding reads as off-topic novelty, and its self-promotion rules are strict. Predictable outcome: removal or a cold reception. Skip. |
| **X / Twitter** | The live-coding scene left. Posting costs little, but it will not be where anything happens; do not build a cadence around it. |
| **Instagram / LinkedIn carousels with comment→DM funnels** | The comment→DM lead-magnet mechanic is a proven *growth* engine (see §6) — and it is actively counterproductive here. To a FOSS audience it reads as marketing extraction of a community gift. Carousels themselves are fine as a **secondary repackaging** of video; the DM funnel is not. |
| **Paid ads of any kind** | An AGPL project with no payment path has nothing to recoup ad spend with. Growth here comes from contribution and word of mouth. |

---

## 5. Content plan — the next 10 pieces

**The argument, first:** for a live-coding tool, **screen-recorded performances and tutorials outrank blog posts, and it is not close.**

1. **The product is inaudible in text.** A blog post about a pattern language must *describe* what a reader could simply hear in four seconds. Video collapses the explanation.
2. **The proof and the pitch are the same artefact.** A recording of a session being taken apart simultaneously demonstrates the tool, teaches the language, and proves the claim. No blog post does three jobs.
3. **It matches how the scene already works.** Algorave is a performance culture with a strong recorded-set tradition. Video is the native artefact; text is the footnote.
4. **Distribution economics.** One 90-second screen capture becomes a Short, a Reel, a TikTok, a Mastodon post, a README GIF, a PH gallery item and a docs embed. One blog post becomes a blog post.
5. **The counter-case, honestly:** text still wins for **AEO** — AI answer engines cite prose, not video. So the plan is video-first with a text companion, not video-only.

**Therefore: 6 of 10 are video, 3 are text-for-citation, 1 is a structural fix.**

| # | Piece | Format | Pillar | Gate | Why |
|---|---|---|---|---|---|
| **1** | **Sitemap + per-route metadata fix** | structural | P1/P2 | — | **Do this first.** `sitemap.xml` lists **6 of 14 routes**: `/sessions`, `/blog`, `/changelog` and *every* detail route are missing — that is ~68 URLs of unique German prose invisible to crawlers and answer engines. `usePageMeta` also leaves `og:*` at homepage values, so every shared session link shows the wrong card. Highest ROI item in this section and it is not content work. |
| **2** | *"Ein Stück auseinandernehmen"* — take one session apart, layer by layer | 10–14 min video, DE (EN subtitles) | P1+P2 | G1 | The flagship. Demonstrates the wedge, teaches Strudel, and is the piece educators will link. Art. 50 label required. |
| 3 | "60 seconds, one session" × 6 | 6 × ≤60s vertical | P1 | G1 | Shorts/Reels/TikTok/Mastodon from one capture session. Six genres, six moods. Art. 50 label. |
| 4 | **"Play it, don't type it"** — MIDI compose mode | 3–4 min video | P1 | G1 | Hardware in, mini-notation out. Visually striking, genuinely differentiating, and no competitor demo looks like this. |
| 5 | **"Von null zu einem Beat in 5 Minuten"** — absolute beginner, German | 5 min video + text transcript | P2 | G1 | The German-language on-ramp, which is the whole wedge. Transcript doubles as the AEO asset. |
| 6 | **"Built on Strudel: what we changed and what we didn't"** | blog post, EN | P3 | now | **Publishable before Gate 1, and should be published first of everything.** Frames the upstream relationship on your own terms: not a fork, consumes the npm packages via a sanctioned integration path, no "strudel" in the name per the upstream FAQ, AGPL because Strudel is AGPL, source link in the footer. Address the **Codeberg move** honestly rather than waiting to be asked (§1.4c). This is the post that earns the right to post anywhere else. |
| 7 | **"Live coding auf Deutsch — Glossar der Mini-Notation"** | reference page, DE | P2 | now | Pure AEO play: a German-language glossary of Strudel mini-notation. Nothing comparable exists. Structured, citable, and it ranks for queries nobody is answering. |
| 8 | "Four engines, one editor" — pattern → Tone.js → Web Audio | 6–8 min video | P1 | G1 | The descent from abstraction; the technical audience's favourite piece. |
| 9 | **Session-of-the-week** — one annotated piece, recurring | short video + post | P1 | G1 | Turns 49 sessions into ~a year of cadence with near-zero marginal cost. The single best sustainable-rhythm decision available. |
| 10 | **"What broke and how we fixed it"** — the fix sprint, publicly | blog post, EN | P3 | after G1 | The architecture doc lists the product's own defects. Publishing the fix story converts an embarrassment into the strongest possible credibility signal for a FOSS audience — and it is *true*, which is why it works. |

**AEO note (pieces 6, 7, 10):** `robots.txt` already allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot and Bingbot, and `llms.txt` is present and **already carries the correct counts**. The infrastructure is in place; the gap is that the content worth citing (`/sessions`, `/blog`, `/docs/:id`) is not in the sitemap. Fix #1 unlocks the rest.

---

## 6. Social

**Format doctrine:** the native format here is **audio/video**. A carousel that cannot be heard is describing a product whose entire value is sound. Carousels are therefore a **secondary repackaging** for LinkedIn/Instagram reach — never the primary asset.

**Every asset featuring Session audio carries a visible `KI-generiert / AI-generated` label (EU AI Act Art. 50).** Screen recordings of the interface alone do not.

### 6.1 Three carousel concepts

Each is 10–12 slides, hook slide first, one idea per slide.

---

**Carousel A — "15 Genres, 49 Stücke, 0 Installation"** *(Pillar 1 · Specific-Number hook)*

| Slide | Content |
|---|---|
| 1 · Hook | **"49 fertige Musikstücke, die du lesen kannst wie Text."** Dark editor screenshot, code visible, one line highlighted. |
| 2 | The problem: *"Live Coding klingt spannend. Dann öffnest du den Editor und er ist leer."* |
| 3–10 | One genre per slide — Techno, Ambient, Dub Techno, Flamenco, Drum & Bass, Jazz, Lo-Fi, Breakbeat. Each: genre name, session title, a 4-line code excerpt, BPM. |
| 11 | Myth teardown: *"Man muss programmieren können." — Nein. Man muss ein Stück verändern können. Das ist der Einstieg."* |
| 12 · CTA | *"Alle 49 Sessions anhören — live-music-coder.pro/sessions"* — **link, no DM funnel.** |

**Shot list:** 8 editor screenshots at 1:1, dark theme, consistent font size, one session loaded per shot, pianoroll panel visible in the lower third. Capture at 2× on a Retina display, export at 1080×1080.

---

**Carousel B — "Auf Strudel gebaut. Und wir sagen es."** *(Pillar 3 · Counterintuitive hook)*

The credibility piece. Publishing this *before* any promotional content is what makes the promotional content survivable in a FOSS scene.

| Slide | Content |
|---|---|
| 1 · Hook | **"Wir haben die Engine nicht gebaut. Und schreiben es auf jede Seite."** |
| 2 | What Strudel is, who maintains it, link. |
| 3 | What LMC adds: trilingual surface · repertoire · 4 engines · MIDI input · macOS app. |
| 4 | What LMC did **not** build: pattern language, scheduler, mini-notation, the draw painters. |
| 5 | Why AGPL, in one sentence: *"Wir bauen auf AGPL-Code — also ist das Ergebnis AGPL. Kein Trick, keine Lizenz-Gymnastik."* |
| 6 | Per-file SPDX headers — screenshot of an actual file header. |
| 7 | The source is one click from the footer. Screenshot of the footer. |
| 8 | The AI disclosure: sessions are AI-composed and say so, with the model named. |
| 9 | *"Prüf es nach"* — repo link, licence link, architecture doc link. |
| 10 · CTA | *"Code lesen: github.com/arnoldwender/wm-prototyp-live-music-coder"* |

**Shot list:** real screenshots only — file header with SPDX, footer with GitHub link, `LICENSING.md` table, a session's AI badge. Zero stock, zero illustration.

---

**Carousel C — "Dein MIDI-Keyboard schreibt den Code"** *(Pillar 1 · Pattern-Interrupt hook)*

| Slide | Content |
|---|---|
| 1 · Hook | **"Du spielst. Der Code schreibt sich."** Still frame: hands on a controller, editor mid-insert. |
| 2 | The problem: mini-notation is a syntax you don't have yet. |
| 3 | Compose mode: play → notation appears. |
| 4–6 | Three frames of the same phrase: played → quantised → inserted. |
| 7 | `midikeys()` — the controller as a Strudel instrument. |
| 8 | Live CC grid — knobs mapped to values, 0–127 readout. |
| 9 | Works with any USB MIDI device — no driver, no config. |
| 10 · CTA | *"Controller anschließen, Editor öffnen: live-music-coder.pro/editor"* |

**Shot list:** ⚠️ **This carousel needs a real hardware capture** — overhead shot of a controller plus a synchronized screen capture. Requires Arnold's own hardware and own photography. No stock images (WM image policy). Do not ship this one with mockups.

### 6.2 Ten post drafts

Platform, pillar, and gate marked. All are drafts — **nothing queued, nothing published.**

| # | Platform | Pillar | Gate | Draft |
|---|---|---|---|---|
| 1 | Mastodon (incl. `social.toplap.org`) | P3 | now | *"I built a trilingual teaching layer on top of Strudel — 49 annotated pieces, docs in DE/EN/ES, four engines in one editor. Not a fork: it consumes the npm packages. AGPL, source one click from the footer, and no 'strudel' in the name per the upstream FAQ. Feedback from people who actually live-code very welcome — especially the critical kind."* + link. **Alt text mandatory.** `#livecoding` |
| 2 | Mastodon | P1 | G1 | 45s screen capture, one Dub Techno session. *"One file. Four layers. Every line editable while it plays."* `#livecoding #algorave #strudel` · **AI-generated audio label.** |
| 3 | YouTube (Short) | P1 | G1 | Vertical, 50s. Cold open on sound within 1s — no intro card. Text overlay only. |
| 4 | Mastodon | P2 | now | *"Live-Coding-Doku auf Deutsch: 14 Kapitel, von Mini-Notation bis MIDI-Setup. Weil 'lern erst mal Englisch' keine gute Antwort auf 'ich will Musik programmieren' ist."* |
| 5 | LinkedIn (DE) | P2 | G1 | Educator angle: trilingual, browser-based, no install, AGPL, worked material. Ends with a question to teachers, not a CTA. |
| 6 | Hacker News | P1+P3 | G3 | **Show HN: Live Music Coder – browser live-coding IDE built on Strudel, with 49 annotated pieces.** First comment: what it is, what it runs on, what is *not* my work, what is unfinished. **Lead with the upstream credit and the known gaps** — HN's own guidelines say early-stage work is welcome, and the community punishes concealment far harder than immaturity. No signup barrier is a structural advantage here; say so. **Be present all day to reply.** |
| **7** | **`uzu.lurk.org` (Strudel category)** | **P2+P3** | **G1** | **The single highest-value post in this table.** *"Ich habe eine deutschsprachige Lernumgebung auf Strudel gebaut"* / EN equivalent. Frame as a report to peers, not an announcement: what it is, that it consumes the npm packages rather than forking, what the 49 annotated pieces are for, that they are AI-composed, and a direct request for correction. **Ask whether the attribution and framing are acceptable to them.** |
| **8** | **Discord** (`#strudel`, both servers) | **P3** | **during the fix sprint** | Not a launch post — a *question*. *"Downstream user here. I hit something in `registerWidget` that clobbers `Pattern.prototype.pianoroll` — here's the falsifier. Is this known? Also: I've built a trilingual teaching layer on Strudel and I'd like a sanity check on how I'm crediting it."* **This post is the relationship.** Everything else in the plan is easier if it goes well. |
| 9 | Mastodon | P3 | after G1 | *"Ran an adversarial audit against my own app: 14 claims, 8 confirmed defects, 0 refuted. Multi-layer playback was broken on the primary path. Here's the fix and the falsifier."* — the single most credibility-generating post available. |
| 10 | GitHub Release notes | P3 | G1 | Treat release notes as a channel. Name the fixes, credit contributors, link the falsifiers, state honestly that Windows/Linux are not yet built. |

---

## 7. Conversion

### 7.1 What conversion even means here

There is **no payment path at all** — no Stripe, no pricing page, no tiers, nothing to buy. PAngV does not apply because no price is ever shown. So "conversion" must be defined against what the project actually wants, which is **a user who returns and a community that contributes.**

Ranked by how strongly each signals real value:

| # | Event | Why it counts | Instrument as |
|---|---|---|---|
| **1** | **Return session ≥ 2nd day** | The only event that separates curiosity from use. **The north star.** | client event, coarse-grained |
| **2** | **A pattern the user wrote themselves is evaluated** (not a loaded example) | The moment they stop consuming and start making | client event, no content captured |
| 3 | **Gist created / share URL generated** | Intent to keep or show — the strongest single-session signal | client event |
| 4 | **Desktop download** | Highest-commitment act available | **server-side: GitHub release asset download counts** — consent-independent, already collected |
| 5 | **Session opened in editor** | The wedge working as designed | client event, with session slug |
| 6 | **Example run** | Shallow but high-volume; the funnel's top | client event, sampled |
| 7 | **GitHub star / fork / issue / PR** | The real currency for an AGPL project | server-side, GitHub API |

**Current baseline, measured 2026-08-16 — the honest starting line:**
```
GitHub stars ........ 1
Forks ............... 0
Watchers ............ 0
Open/closed issues .. 0
v1.1.0 downloads .... 2  (1 arm64 dmg + 1 intel dmg — almost certainly self-tests)
```
This is a cold start. Any growth claim made later must be measured against these numbers, and these numbers must never be dressed up.

### 7.2 The blockers — both are real and both are disqualifying today

**Blocker 1 — there is no analytics of any kind.**
```bash
grep -rniE "plausible|umami|google-analytics|gtag|matomo|fathom|posthog|mixpanel|segment" src/ public/ index.html netlify.toml   # zero hits
```
Not "insufficient analytics" — *none*. Every event in the table above is currently unmeasurable. Launching before this is spending the one-time attention burst to learn nothing.

**Blocker 2 — the service worker force-reloads every open tab, which corrupts any session-based metric.**
`sw.js` calls `skipWaiting()` on install and `clients.forEach(c => c.navigate(c.url))` on activate. Every open tab reloads, unprompted, the moment a new SW is fetched. Consequences:
- **Session-based metrics are structurally unreliable** — one deploy inflates session counts and truncates durations across every live user simultaneously. "Returning session" (the north star) is exactly the metric it corrupts.
- Worse than the metric: **it destroys a live-coding session mid-set, and there is no autosave to recover from.** That is a product defect that marketing would be actively amplifying.

Related: `cache.addAll(APP_SHELL)` is all-or-nothing (one 404 → install rejects → the PWA silently never activates), `public/_headers` has **no rule for `/sw.js`**, and `dist/sw.js` is produced only by the npm `postbuild` hook — so a hand-run `vite build` or `npm run electron:build` deploys a `dist/` with no `sw.js` while the previously-registered SW keeps serving its old cache.

### 7.3 Recommended instrumentation

Minimal, DSGVO-clean, and matched to a project with no revenue:

1. **Plausible or Umami, self-hosted or EU-hosted** — cookieless, no consent banner required under the usual reading, no personal data. A cookie banner on a free creative tool costs more conversion than the data is worth.
2. **Custom events, content-free:** `session_opened{slug}`, `example_run{id}`, `user_pattern_evaluated`, `share_created{type}`, `gist_created`, `midi_device_connected`, `locale_switched`. **Never capture pattern source** — the editor content is the user's work.
3. **Anchor the funnel on consent-independent server-side numbers:** GitHub release asset download counts, stars, forks, issues, PRs. These are already collected, need no banner, and cannot be blocked.
4. **Fix the SW before trusting any session metric.** Replace the unconditional `clients.navigate` with a "new version available — reload?" prompt. This is on the fix list anyway (§10 Gate 3) for product reasons.
5. **Treat all client-side rates as relative, never absolute.** Consent-gated analytics never sees the whole funnel, and people who block analytics are not a random sample of a technical audience — they are systematically *more* of it. Use the numbers to compare variants, never to state "we convert at X%."

---

## 8. Open-source growth

AGPL projects grow through **contribution**, not campaigns. The repo is the product's front door for the people who matter most.

### 8.1 README repositioning

The README currently opens with a feature inventory. For an AGPL project competing for attention against its own upstream, the first screen must answer three questions in order: *what is it · what is it built on · why would I use it instead of the upstream.*

Concretely:

1. **Add an upstream paragraph immediately under the tagline**, before Features: what Strudel is, that this runs on it (via npm packages — not a fork), links to **strudel.cc and codeberg.org/uzu/strudel**, why AGPL follows, and that the name deliberately avoids "strudel" per the upstream FAQ. Currently **none of this appears anywhere in the README** — the word "Strudel" shows up first as a row in an engine table. For a downstream project, that is the single biggest positioning miss in the repo.
2. **Correct every count** (§1.3) — and update the **GitHub repo description**, which still says "43 sessions, 190+ examples." That string appears in search, in topic listings, and in every social preview of the repo.
3. **Remove the six forbidden feature claims** (§1.1) or move them under a clearly-labelled *"In progress"* heading. A technical visitor who tests "draggable, connectable nodes" on the default engine and finds an empty state will not test a second claim.
4. **Fix "Windows/Linux: Coming soon"** — either build them or say "not planned yet." "Coming soon" for three months reads as abandoned.
5. **Add a 10-second animated demo** near the top — a GIF or a video link. For an audio product, the README's job is to get someone to *hear it* as fast as possible.
6. **Resolve the licence-detection problem** (§1.4) so the AGPL-3.0 badge renders.

### 8.2 Good-first-issues — there are currently zero issues of any kind

This is the most concrete growth lever available and it costs one afternoon. From the architecture document's own findings, these are genuinely well-scoped, genuinely useful, and require no deep context:

| Candidate issue | Source | Why it's a good first issue |
|---|---|---|
| Move `TOTAL_EXAMPLE_COUNT` to end-of-file (or make it a getter) | §5.5 | One line, visible user-facing effect, trivially verifiable |
| `layout: parsed.layout ?? DEFAULT_LAYOUT` in `local.ts:108-111` | §5.43 | One line, fixes a real bug, has an obvious test |
| Set `document.documentElement.lang` after i18n init | §5.37 | One line, fixes a WCAG 3.1.1 failure |
| Add `Escape` handler for compose mode | Work order G | Self-contained; the banner already promises it |
| Fix autocomplete double-dot (`matchBefore` vs `apply`) | §5.6 | Small, well-specified, immediately noticeable |
| Locale key-set parity test | §5.32 | Currently perfect — a test that locks in a good state |
| Add `.github/workflows/ci.yml` (`tsc && vitest && eslint`) | §5.32 | High value, zero product risk |
| Replace `ConsolePanel.tsx:22` raw hex with `var(--color-warning)` | §5.41 | Ideal first contribution |
| Add missing routes to `sitemap.xml` | §5.36 | Mechanical, high SEO value |

`.github/CONTRIBUTING.md` already exists and is genuinely good — it is specific, it explains *why* changes get accepted, and it includes the line *"Nothing invented: no benchmark, citation, or capability claim that cannot be checked from the repository itself."* That sentence is a positioning asset. **Quote it in the README.**

> ⚠️ **Prerequisite: `npm run lint` is red** (~45 errors + 10 warnings across ~16 files) **and nothing gates it** — `npm run build` runs neither lint nor tests, and there is no CI workflow. Inviting contributors into a repo whose checks fail on a clean checkout wastes their goodwill on your mess. **Fix lint and add CI before publishing a single good-first-issue.**

### 8.3 Engaging the Strudel upstream constructively

The correct sequence, and it is not the intuitive one:

1. **Contribute upstream first — and there is a ready-made, genuinely valuable contribution sitting in this repo's own audit.**
   The architecture document established that `@strudel/codemirror`'s `registerWidget(type, fn)` silently overwrites `Pattern.prototype[type]` whenever `fn` is truthy — which is how three real `@strudel/draw` painters (`pianoroll`, `punchcard`, `pitchwheel`) got clobbered here, with a reproducible `haps is undefined` throw. That is a **genuine upstream footgun discovered the hard way by a downstream consumer**, complete with a falsifier. Reporting it is a gift, and it is the ideal introduction.
   ⚠️ **File it on Codeberg (`codeberg.org/uzu/strudel`), not the archived GitHub mirror.** Filing on a read-only archive is the specific mistake that signals you didn't look.
2. **Then introduce the project, framed as downstream.** *"I built a trilingual teaching layer on Strudel"* — never *"a Strudel alternative."* Ask whether the framing and the attribution are acceptable **to them**. Strudel's FAQ even invites this: it says to check in via the community Discord about project status. Nobody objects to being asked.
3. **Offer the content, not the code.** The 49 annotated sessions and the German documentation may be worth more to the Strudel ecosystem than any patch — Strudel has a workshop but not a trilingual one. Offer them, with AI-composition disclosed up front.
4. **Never route Strudel's users to LMC.** Do not post LMC links as answers in Strudel's own support channels on Discord or `uzu.lurk.org`. It converts goodwill into resentment faster than anything else available, and it is the single most likely way to get this project quietly blacklisted.
5. **Keep the compliance story visibly clean.** Attribution, source link, per-file SPDX, no "strudel" in the name, sanctioned integration path. It is already close to correct — finish §1.4 and it becomes a reason to be trusted rather than a thing to be checked.

---

## 9. Product Hunt — go / no-go

**Verdict: GO — but not first, and not until Gate 3.**

**Why go at all — and the criteria are primary-sourced, not folklore.**
Product Hunt's own [Featuring Guidelines](https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines) (updated 2026-03-10) score launches on **Usefulness · Novelty · High Craft · Creativity**, and state explicitly that a launch need not excel at all four — spiking on one or two is enough. **A live-coding music IDE is a craft-and-creativity product**, which is precisely the axis that rubric rewards; it does not have to win on utility. It is also a free, one-day distribution burst, and the sister product (`wm-prototyp-icon-generator`) already established the launch playbook inside WM.

LMC is also **not** on PH's exclusion list (waitlists, directories, templates, courses, podcasts, reports, events, books, generic commerce, non-functional Kickstarters, most hardware, vaporware). It is a functional, reachable product. ✅

⚠️ **Anti-manipulation rules, quoted:** *"Mass messaging users, asking for upvotes, using bots, incentivizing upvotes, and any other form of artificially increasing activity on your contribution is not acceptable."* Self-promotion in comments is removed. **No upvote asks in any Discord, forum or Mastodon post — that would burn both the PH launch and the community goodwill in one move.**

**Why not now, and why not first:**

1. **The live-coding community is not on Product Hunt.** PH is a mainstream-tech audience. The people who would become *contributors* — the currency for an AGPL project — are on Mastodon, in Discord/Matrix rooms and on GitHub. Launching on PH first optimises for the audience that matters least.
2. **You get one launch.** Realistically PH rewards a product once. Spending it while multi-layer playback is broken and 5 examples throw converts your one shot into a comment thread about bugs.
3. **Nothing would be measured.** No analytics (§7.2). A PH burst is the single most information-rich day a product gets; arriving without instrumentation wastes it irreversibly.
4. **The burst lands on the weakest surface.** PH sends one-shot visitors who try the thing once. That path today: a session that plays one layer, a service worker that may reload the tab mid-session, and no autosave. Those are exactly the Gate 1 and Gate 3 items.
5. **Sequencing compounds.** Community launch → real feedback → fixes → *then* PH means the PH launch has a better product, real testimonials, and possibly upstream acknowledgement. The reverse order has none of that.

**If go, then:** after Gate 3, on a Tuesday–Thursday. Tags: **Music · Developer Tools · Open Source**. Gallery: 5 assets at 1270×760 plus a 60–90s screen recording **with audio** — for this product the video is not optional, it is the entire pitch. First comment leads with the Strudel credit and the AGPL licence. Art. 50 label on any Session audio. Self-hunting is reported to perform comparably to being hunted now, but that is **secondary-sourced only** — see below.

> ⚠️ **Re-verify before submitting.** PH's two official Help Center articles contain the featuring criteria and the community rules quoted above, but **neither states launch-timing/timezone rules or hunter-system mechanics.** Everything commonly repeated about "12:01 AM PST", vote velocity and hunter advantage is **third-party blog material, not PH policy**, and the sister product's doc (`PH-LAUNCH-2026-05-04.md`) was verified against a 2026-05 snapshot. Run `wm-product-hunt-launch` and re-verify at launch time. Do not hard-code a submit time from this document.

---

## 10. Launch timing — the three gates

**Recommendation: market after the fix sprint, in three gates, not in one launch.**

The reasoning is not "the product has bugs" — every product has bugs. It is that **the specific broken things are the specific things this kit would promote**, and the audience is the one most likely to notice.

### Gate 1 — before *any* promotion (days, not weeks)

| Fix | Source | Marketing consequence if skipped |
|---|---|---|
| Delete the `$:` strip (both sites) | P1 · `dollar-strip` CONFIRMED | Every session — the entire wedge — plays one layer. Fires automatically on load. |
| Delete the widget re-registration block | P2 · `widget-clobber` | 5 examples throw for anyone browsing `/examples` |
| Move `TOTAL_EXAMPLE_COUNT` to end-of-file | §5.5 | The Examples page understates itself by 154 patterns |
| Correct all counts + GitHub repo description | §1.3 | Five different session counts in public |
| Remove or gate the 6 forbidden README claims | §1.1 | Testable false claims in the project's front door |
| Fix lint + add CI | §5.32 | Cannot credibly invite contributors |
| Add missing routes to `sitemap.xml` | §5.36 | ~68 URLs of unique content invisible |

**Unlocks:** web-only soft launch — Mastodon, Discord/Matrix, TOPLAP conversation, /r/livecoding (manual), German educator outreach, content pieces 2–5 and 8–9.

### Gate 2 — before promoting the desktop download

> **Status update — measured in the working tree on 2026-08-17, after this kit was drafted.**
> Part of Gate 2 **has already been fixed**, uncommitted. Credit where due, and correction where due:

| Fix | Source | State |
|---|---|---|
| Remove the `$HOME`-wide write primitive | §5.21 · `home-write-primitive` CONFIRMED | ✅ **DONE** — `resolveAllowedPath` replaced by `isUserChosenPath`, which validates against *user intent* (paths the user chose via a native dialog, tracked in recent-files) instead of a directory prefix. Also removes the hardcoded `'/'` that silently disabled the guard on Windows. Better shape than the fix originally proposed. |
| Remove `saveProjectToPath` from preload | §5.23 | ✅ **DONE** — deleted outright, not just guarded |
| Remove `quit` from preload | §5.23 | ✅ **DONE** — it fired `app.quit()` unconditionally from the renderer with no unsaved-work guard |
| **Add `will-navigate` / `will-redirect` guard** | §5.20 · `electron-no-nav-guard` CONFIRMED — **exploit reproduced live** | ❌ **STILL OPEN** — `grep -rn "will-navigate" electron/` → **0 hits** |
| **Add `session.setPermissionRequestHandler`** | §5.20 | ❌ **STILL OPEN** — 0 hits; mic and MIDI-sysex still auto-granted |
| **Validate `audio:export-wav` inputs** | §5.22 | ❌ **STILL OPEN** — no `Number.isInteger`, no range clamp, no byte cap |
| Audit the remaining unused preload methods | §5.23 | ◐ partial |

**What this changes for marketing: less than it looks, for one reason.**

The removal of `saveProjectToPath` is significant — it deletes the *payload* end of the exploit chain. But **the navigation guard is the highest-severity item and it is still absent**, so a shared pattern can still navigate the preload-attached window to a remote origin that then owns whatever `electronAPI` surface remains.

And decisively: **all of this is uncommitted and unreleased.** The `v1.1.0` dmg a user can download from GitHub *right now* contains none of these fixes. Until a new release ships, **every word of the desktop-download gate stands unchanged.**

**Remaining to close Gate 2:** `will-navigate` + `setPermissionRequestHandler` + `export-wav` validation → commit → **cut a new release** → then promote downloads.

**Why this gates marketing rather than just engineering:** the confirmed chain is *load a shared pattern → `location.href` to a remote origin → that origin owns the full `electronAPI` → write `~/.zshrc` → shell code execution*. Two of the things this kit would promote most loudly — **"share your patterns by link"** and **"download the desktop app"** — are the two ends of that chain. Promoting them together is the marketing act that makes the vulnerability reachable at scale.

Also fix before promoting downloads: Windows `resolveAllowedPath` returns `null` for every usable path (hardcoded `'/'`), so desktop save is **broken on Windows** even once Windows binaries exist.

**Unlocks:** desktop download CTA, macOS-specific content, "no browser tab on stage" angle.

### Gate 3 — before Product Hunt / Hacker News / any burst

| Fix | Source | Why a burst needs it |
|---|---|---|
| One `AudioContext` (`setAudioContext(getSharedContext())`) | P3 · `recording-silent` | Makes recording real; fixes doubled audio |
| Replace SW force-reload with a prompt | §5.25 · `pwa-force-reload` CONFIRMED | A deploy currently reloads every visitor's tab mid-session |
| IndexedDB autosave (`setupAutosave` + project list) | Work order A | Nothing to recover from when a session is lost |
| Analytics + custom events | §7.3 | Otherwise the burst teaches you nothing |
| `AnalyserNode` disconnect in `resetStrudelTap()` | §5.13 | Leak on every evaluate |

**Unlocks:** Show HN, Product Hunt, paid-attention-equivalent bursts, content piece 10.

### What can ship *today*, before any gate

Five things, all Pillar 3, all text, none dependent on a working demo:

- **Post draft 8 — the Discord message.** Report the `registerWidget` / `Pattern.prototype` footgun upstream (on **Codeberg**, not the archived GitHub mirror), and ask for a sanity check on how LMC credits Strudel. **Do this first of everything.** It is the cheapest possible act and it sets the tone for every later post.
- **Content piece 6** — *"Built on Strudel: what we changed and what we didn't."* Earns the right to post anywhere else.
- **Content piece 7** — the German mini-notation glossary. Pure AEO, no demo required.
- **Content piece 1** — the sitemap and per-route metadata fix. Structural, invisible, and it makes every later piece findable.
- **Post drafts 1 and 4** on Mastodon (incl. `social.toplap.org`) — introduction and the German-docs angle, framed as *"feedback welcome, especially the critical kind"* rather than as a launch.

Doing these first is not a consolation prize. It is the correct order: **establish the upstream relationship and the German-language wedge before asking anyone to try the product.** The fix sprint runs in parallel; by the time Gate 1 closes, the community already knows who you are and that you credited them properly.

Also open now and not gated on anything: the **ICLC 2027 call for submissions** (§4, Tier 2 #11). `[NEEDS ARNOLD]`

---

## 11. Appendix — "unlocks when shipped"

Marketing angles that become available **only** when the corresponding work-order item lands. Nothing here may be used before then.

| Work-order item | Unlocks | Strength |
|---|---|---|
| **A — IndexedDB autosave + project list** | *"Your set survives a crash, a reload and a deploy."* Directly answers the loudest objection a performer has about a browser tool. | **Strongest single unlock in the list** — it converts the browser from a liability into a non-issue |
| **B — Node graph for Strudel** (option 1: read-only signal-flow view) | *"See the signal flow of the pattern you just wrote."* Makes the README claim true and gives the visual differentiator real substance | High — it is also the most screenshot-able feature |
| **E — MIDI factory profiles auto-load** | *"Plug in an MPK mini. The knobs are already mapped."* 19 tested profiles already exist | High — a genuine "it just works" moment, and a strong 15-second video |
| **F — `midin(cc, min, max)` + MIDI Learn read side** | *"Map any knob to any parameter, no code."* | High — completes Carousel C |
| **K — Solo/mute wired to real per-layer gain** | *"Mute a layer mid-set with Alt+3."* Core live-performance affordance | High for the performer segment |
| **L — Export Audio** (blocked by P3) | *"Record the set, export the WAV."* | **Downgraded to LOW as a positioning claim.** Verified 2026-08-17: **Strudel now ships `.wav` export itself**, so this is parity, not differentiation. Still worth building (it is a real gap for users) — just never lead with it, and never before P3, or it exports silence |
| **M — Transport BPM affects Strudel** | *"One tempo control for all four engines."* | Medium — currently a no-op on the default engine |
| **H + I — `.lmc` association + menu actions** | *"Double-click a `.lmc` file. ⌘S saves."* Desktop app feels native rather than wrapped | Medium — quiet, but its absence is what makes the desktop build feel like a website in a frame |
| **Windows + Linux builds** | *"Available on macOS, Windows and Linux."* Roughly triples the addressable desktop audience | **High — and it is the single biggest gap between the brief's framing and reality** |
| **J — Pop-out panels** | *"Visualizers on the second screen."* Real performance feature | Medium — ship it or delete it; half-built is worse than absent |

---

## 12. Gaps, cuts and open questions

### Claims cut from this kit (would have strengthened it; all false today)
IndexedDB autosave · draggable/connectable node graph on the default engine · audio recording/export · clock sync · solo-mute · MIDI Learn · auto-loading device profiles · Windows/Linux desktop builds · "cross-platform desktop app" · `.lmc` file association · menu accelerators · in-code `._pianoroll()` · every count except those in §1.2.

### Corrections to the brief (three)

1. **"Ships … Windows nsis/portable, Linux AppImage/deb."** Those targets are **declared in `package.json` but have never been released.** `v1.1.0` ships four macOS assets and `latest-mac.yml` only. The README is correct ("Coming soon"); the brief was not. **The honest desktop claim is macOS-only.**
2. **"lines.community"** does not resolve. The monome forum is **`llllllll.co`**.
3. **The named channel list omitted the scene's two actual hubs** — the TidalCycles/Strudel Discourse forum (`uzu.lurk.org`, 1,136 Tidal topics + 65 Strudel topics) and the two Discord servers (~3.1k and ~11k members). It also included **/r/edmproduction**, which is a production subreddit and the wrong audience (recommended against, §4 Tier 3).

### Upstream facts discovered during verification that change the plan

- **Strudel left GitHub for Codeberg on 2025-06-19, explicitly for ethical reasons**, and its README asks people not to fork it back to GitHub. LMC does not fork it — but the values are live in the community this launch depends on. See §1.4(c) and the `[NEEDS ARNOLD]` mirror decision.
- **Strudel's FAQ forbids "strudel" in downstream project names.** *"Live Music Coder" already complies* — a positioning asset, not just an absence of a problem.
- **LMC's integration route (npm packages via a bundler) is explicitly sanctioned** by Strudel's own Technical Manual.
- **Strudel now has `.wav` export and MIDI/OSC I/O** — three would-be differentiators removed from §2.2.
- **Sonic Pi v5 shipped mid-August 2026**, a major overhaul. It owns the education position in English; do not pitch against it there.
- **ICLC 2027 (Antwerp, 9–13 March 2027) has an open call for submissions** — the highest-credibility venue available, and a genuine fit for the non-English-pedagogy angle.

### Verified baseline (never dress these up)
Stars 1 · forks 0 · watchers 0 · issues 0 · desktop downloads 2 · analytics none · CI none.

### Working-tree state at time of writing (not mine — pre-existing, uncommitted)
`git status` shows uncommitted modifications to `electron/ipc/file.ts`, `electron/preload.ts`, `src/types/electron.d.ts`, `public/robots.txt`, and an `llms.txt` relocation into `public/`. **Part of Gate 2 is already fixed there** (see §10 Gate 2 for the exact split of done vs. still-open). Two consequences:
1. **Nothing is released.** The `v1.1.0` assets on GitHub predate all of it, so every gate in §10 still binds until a new release is cut.
2. **This kit was drafted against the committed tree and then corrected against the working tree.** If further work lands before launch, re-run the §1.1 forbidden-claims check rather than trusting this document's snapshot.

### `[NEEDS ARNOLD]`
1. **`LICENSE` file structure** (§1.4) — GitHub reports `Other`, so the repo shows no AGPL-3.0 badge. Fix requires replacing `LICENSE` with the verbatim AGPL text. Licensing decision — Arnold's call.
2. **Windows/Linux release process** — no CI, no Windows signing config, no `latest.yml`. Cannot be code-fixed in a sprint; it needs a release pipeline and a signing certificate.
3. **`AudioGraph`** (`orchestrator/graph.ts`) — complete, tested, instantiated, never populated. Ship it as the real routing layer or delete it. Design decision, not a sprint task.
4. **OSC / Serial** — loaded dead weight. OSC cannot work on the deployed web app at all (`netlify.toml` `connect-src` has no `ws:`). Ship properly or drop the imports.
5. **Hardware photography for Carousel C** — needs Arnold's own controller and own photos. No stock (WM image policy).
6. **Codeberg mirror — yes or no?** (§1.4c). Recommendation: mirror read-only, do not migrate.
7. **ICLC 2027 submission** — worth writing up the non-English-pedagogy angle? The call is open now (§4, Tier 2 #11).

### Verify again before anything ships publicly

External verification ran 2026-08-17 against primary sources. Six items came back **unresolved** and must not be asserted until checked:

| Unverified | Why it matters | How to close it |
|---|---|---|
| **r/livecoding subscriber count + exact self-promotion rules** | Reddit blocked automated fetching | Open the sidebar in a browser. **Never cite a number.** |
| **Strudel's current top-of-tree version** | Latest found is `@strudel/core@1.2.4` (2025-09-10) — ~11 months stale relative to today | Check `codeberg.org/uzu/strudel/releases` before any version-specific claim |
| **Whether strudel.cc offers any localisation** | The trilingual wedge's comparative form depends on it | Check the site. Until then, state LMC's own fact only (§2.2) |
| **Discord member counts (~3,117 / ~11,084)** | Search-synthesised from invite pages, not re-fetched | Re-check at launch. **Never cite publicly.** |
| **PH launch timing / hunter mechanics** | Absent from both official Help Center articles; all common advice is third-party | `wm-product-hunt-launch` at launch time |
| **Whether ICLC had a 2026 edition** | Only ICLC 2027 confirmed; absence of evidence ≠ evidence of absence | `iclc.toplap.org` |

Also worth a disambiguation pass: the community Discourse appears under several aliased domains (`uzu.lurk.org`, `club.tidalcycles.org`, `doc.patternclub.org`, `strudel.patternclub.org`). Settle the canonical one before printing it anywhere.

**Name-collision note:** "Strudel" is also used by an unrelated scientific-data project (`strudel-science/strudel-kit`) and an unrelated Hutton Institute bioinformatics tool. Irrelevant to naming (LMC uses no "strudel"), but relevant to SEO/AEO if any copy targets the term.

---

## 13. Gate compliance

| Gate | Status |
|---|---|
| **Claim verification (UWG §5/§5a)** | ✅ Every claim traces to §1.2 or a falsifier command. 13 claim families cut. Zero fabricated statistics. |
| **PAngV** | ✅ N/A — no price exists anywhere in the product or the kit. |
| **Legal-DE / Legal-Page-Locality** | ✅ `live-music-coder.pro` serves its own Impressum + Datenschutz at `/legal` on its own domain. No campaign page may redirect them. ⚠️ Known defect: `Legal.tsx` reads `location.hash` only at mount, so `/legal#datenschutz` does not switch tabs when already on `/legal`. |
| **EU AI Act Art. 50** | ✅ In-product disclosure ships. Kit requires a visible label on every asset featuring Session audio + YouTube synthetic-content disclosure. |
| **Brand voice** | ✅ Used verbatim where WM is the sender; never modified. Product copy is `du`-form, matching the shipped app. |
| **Image policy** | ✅ Zero external stock. All assets are owned screenshots/recordings or existing project files (`og-image.png`, `favicon.svg`, `icon-512.png`). Carousel C flagged as needing original hardware photography. |
| **Infrastructure isolation** | ✅ No shared channels or cross-project resources proposed. |
| **Nothing published** | ✅ Drafts only. Nothing queued to Buffer. Reddit manual. |
| **No `src/` edits** | ✅ This kit is the only file written. |
