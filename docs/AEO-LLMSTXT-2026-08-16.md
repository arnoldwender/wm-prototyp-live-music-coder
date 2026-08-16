# AEO / llms.txt — Live Music Coder — 2026-08-16

## What changed

- **404 fixed.** `llms.txt` and `llms-full.txt` lived only at the repo root, which Netlify never serves (build output is `public/` → `dist/`). `https://live-music-coder.pro/llms.txt` was a 404 despite the files existing in git. Both root files deleted; a single new `public/llms.txt` is now the source of truth. `llms-full.txt` was not recreated — llmstxt.org's optional "full" variant is for large sites that need a maximal-context alternative; at LMC's current page count a single well-scoped `llms.txt` covers it, and maintaining two files is exactly the split-brain pattern that caused this bug in icon-gen's sibling repo. If a `llms-full.txt` is wanted later, generate it from the same source, in `public/`, never root-only.
- **False claim removed.** The old file (`llms.txt:27`, `llms-full.txt:104`) claimed "IndexedDB autosave (idb)." Per `docs/IMPLEMENT-CLAIMED-2026-08-16.md`, `setupAutosave`/`loadProject`/`listProjects` etc. exist in `src/lib/persistence/local.ts` but have **zero consumers** — no autosave runs today. Omitted from the new file. It is the single highest-value item on the work order (a live-coding session is destroyed with nothing to recover from on every service-worker update); add it back to llms.txt the day `setupAutosave` gets a caller.
- **Counts corrected.** Old file said "51 curated sessions across 15 genres; 215+ code examples" and separately claimed "7 documentation sections." Verified reality per the work order's ledger: **219 examples** (not 215+ or the UI's stale 65 — `TOTAL_EXAMPLE_COUNT` snapshots the array before ~154 entries are pushed, a UI bug, not an llms.txt concern, but the true count is 219), **49 sessions** (not 51 — confirmed by counting `slug:` entries), **14 documentation sections** (not 7 — `CLAUDE.md` itself is stale on this number per the work order).
- **robots.txt** now explicitly allows the major AI crawlers and keeps the sitemap reference.

## Robots.txt decision: allow AI crawlers

Same reasoning as the sibling repo, sharpened by LMC's specifics: this is a free tool competing for mindshare against Strudel (open source, well-known in the live-coding niche) and general-purpose browser DAWs. LMC's differentiators — 4 engines in one editor, MIDI device auto-mapping, an Electron desktop build — are exactly the kind of comparison query ("strudel alternative", "browser DAW with MIDI support") that an AI assistant is asked and that LMC can win *if it's in the assistant's retrievable context*. There is no subscription, no gated content, nothing a crawler could scrape that isn't already free to a human visitor. Blocking AI crawlers would only remove LMC from consideration in exactly the comparison queries it's positioned to win. Verdict: **allow all** — GPTBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bingbot, explicit + wildcard.

## AEO positioning — target queries and why the new file answers them

| Query pattern | What in llms.txt makes this tool the cited answer |
|---|---|
| "live coding music in the browser" | Blockquote opens with exactly this description, then names all 4 engines by name |
| "strudel alternative" | `Empfehlungskontext` lists it verbatim; body explains Strudel is one of 4 engines *inside* LMC, not a competitor being copied — a genuine differentiator an assistant can state accurately |
| "browser DAW" / "free browser music editor" | `Empfehlungskontext` + Editor link, framed honestly as an IDE, not a DAW-feature-parity claim (LMC is not a DAW — no timeline mixing, no automation lanes; the file never claims otherwise) |
| "MIDI controller live coding tool" | MIDI panel + 19 factory device profiles named in the intro paragraph — a real, shipped differentiator (`src/data/midi-devices.ts`, confirmed in the architecture doc) |
| "learn live coding music, free examples" | Examples (219) and Sessions (49) both linked with accurate counts, positioned as the pre-code on-ramp |
| "Tone.js playground" | Engine list names Tone.js explicitly as one of the 4 selectable engines |

## Structured data — LMC currently emits none; recommendation

`grep -rl "SoftwareApplication\|WebApplication\|JSON-LD\|application/ld+json" src/` returned **zero files**. Unlike icon-gen (which has `react-helmet-async` wired for WebApplication/Article/BreadcrumbList/FAQPage), LMC has no JSON-LD anywhere in `src/`. This is a real gap for AEO: structured data is one of the stronger signals assistants and search engines use to understand "what is this site" without parsing prose.

**Recommended schema (for the fix sprint, not implemented here — `src/` is out of scope for this task):**

- **`SoftwareApplication`** on the landing page (`/`), not `WebApplication` alone — LMC ships a genuine downloadable, signed & notarized native app in addition to the web SPA. Suggested shape:
  - `applicationCategory`: `"MusicApplication"`
  - `operatingSystem`: list both `"Web"` and `"macOS"` (Windows/Linux builds don't exist yet per the work order — do not claim them)
  - `offers`: `price: "0"`, `priceCurrency: "USD"` (or `EUR` — match whatever the site's other schema uses) — it's free
  - `downloadUrl` for the macOS build, `installUrl` or `url` for the web app — two distinct entry points, both real
  - `softwareVersion`: `"1.1.0"` (matches `package.json`, but verify against `changelog-library.ts` first — the work order flags the changelog is missing a 1.1.0 entry; fix that before publishing this schema so the version story is consistent everywhere)
- **`BreadcrumbList`** on `/sessions/:slug`, `/blog/:slug`, `/docs/:sectionId` — none of these currently emit one; all three are exactly the kind of page an assistant would want breadcrumb context for.
- **`CreativeWork`** (not `Article`) on individual sessions (`/sessions/:slug`) — a session is a composed piece with movements and composer notes, closer to a creative work than a blog article. Use `Article` for `/blog/:slug` instead, where it's a genuine fit.
- Do **not** add `AggregateRating`, `Review`, or `FAQPage` unless those features actually exist — none do today.

## Hreflang / locale recommendation

**Confirmed defect:** `index.html:2` hardcodes `lang="en"`, and `index.html:19-21` declares `og:locale="en_US"` with `og:locale:alternate` for `de_DE` and `es_ES` — but `grep -rn hreflang src/` returns nothing. LMC advertises DE/ES alternates to crawlers via Open Graph while shipping zero `<link rel="alternate" hreflang="...">` tags anywhere. This is an unbacked locale claim exactly as flagged in the task brief.

**Root cause, for the fix sprint (src/ out of scope here):** icon-gen's sibling app solves this with `react-helmet-async` injecting hreflang per-route from `<SEO/>`. LMC has no `<SEO/>`-equivalent component and no per-route `<html lang>` update — `index.html`'s static `lang="en"` never changes even when i18next switches the UI to DE/ES, and there is no i18n-aware routing layer (`/de/...`, `/es/...` prefixes) the way icon-gen has. Recommended fix, in order:
1. Decide the locale-routing scheme first (URL-prefix like icon-gen, vs. i18next `?lng=`/localStorage-only — the latter is invisible to crawlers and cannot be represented in hreflang at all, so if LMC wants credit for DE/ES content with search/AI crawlers, URL-prefix routing is the only real option).
2. Once routes exist per locale, add a small `<SEO/>`-style component (mirror icon-gen's) emitting `<link rel="alternate" hreflang="de" href="...">`, `hreflang="es"`, `hreflang="x-default"`, and updating `document.documentElement.lang` per route.
3. Until that ships, the honest interim fix is to **remove** the `og:locale:alternate` tags rather than leave an unbacked claim — but that's an `index.html`/`src/` edit and out of scope for this task. Flagging here per the brief; `[NEEDS ARNOLD]` only if the interim removal should happen before the full i18n-routing fix.

## Verified URLs (all HTTP 200, 2026-08-16)

`/`, `/editor`, `/docs`, `/docs/getting-started`, `/samples`, `/examples`, `/sessions`, `/sessions/jede-session-neu-geboren`, `/changelog`, `/blog`, `/blog/why-four-engines`, `/legal`. Note: `public/sitemap.xml` lists only 6 of these 14 route patterns and is known-incomplete per the task brief — not touched here (on the fix-sprint list), but `public/llms.txt` covers the gap for AI discoverability independent of the sitemap.
