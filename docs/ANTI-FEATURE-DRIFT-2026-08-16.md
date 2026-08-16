# Anti-Feature & Stack-Drift Sweep — Live Music Coder — 2026-08-16

Scope: cargo-cult config and silently-harmful "improvements" — the axis `docs/ARCHITECTURE-2026-08-16.md` did not systematically cover (that document's own scope is correctness/security/lifecycle bugs, including a live-exploit-reproduced Electron renderer-navigation vuln at §5 "Security" — cited below, not re-derived). READ-ONLY — no fixes applied.

Catalog reference: `~/.claude/skills/wm-anti-feature-hunt/SKILL.md`.

---

## Total findings: 9 (2 HIGH / 4 MED / 3 LOW)

---

## PART 1 — Anti-Feature Hunt

### Crawl & Indexing (2 findings)

- `public/robots.txt` — clean: `User-agent: *`, `Allow: /`, correct `Sitemap:` directive, no `Crawl-delay`, no `noindex`, no `/cgi-bin/`. LEAVE-IT.
- **MED — `llms.txt`/`llms-full.txt` split-brain, worse than the icon-gen sibling: NEITHER file ships at all.** Both live only at repo root (`llms.txt` 4,368 B / 18 May, `llms-full.txt` 17,348 B / 13 Apr) — there is **no `public/llms.txt`** (`ls public/ | grep -i llms` → empty). Since Vite/Netlify only serves `public/`, `https://live-music-coder.pro/llms.txt` currently 404s. Confirmed neither file is referenced from `robots.txt`, `index.html`, or `netlify.toml` (`grep -rn llms index.html public/_headers netlify.toml public/robots.txt` → 0 hits). REMOVE-THIS or ADD-THIS depending on intent: if the two root files are meant to be a public AI-crawler surface (their content suggests so — they document autosave claims that are themselves false per arch doc §5's `indexeddb-dead-public-claim` finding), copy the correct one into `public/`; if they're internal scratch docs, delete them from the public-facing narrative (rename out of the `llms*.txt` convention so nobody assumes they're live).
- **MED — SEO metadata promises locales the app does not route.** `index.html` declares `og:locale:alternate content="de_DE"` and `"es_ES"`, and `src/i18n/index.ts` + `src/i18n/locales/{de,en,es}.json` exist — but `<html lang="en">` is hardcoded (`grep -n lang= index.html` → line 2 only) and there is no `hreflang` anywhere in the codebase (`grep -rln hreflang src/` → 0 hits) and no locale-prefixed routing (unlike the icon-gen sibling's `/de/`, `/es/` prefix scheme). Google has no way to discover the DE/ES variants exist; the `og:locale:alternate` tags are unfalsifiable claims to social crawlers with nothing behind them. This is the JSON-LD/meta-tag "claims something the code doesn't back up" pattern from the catalog, on the meta-tag side rather than JSON-LD. ADD-THIS: either wire `hreflang` + locale routing to match the OG claim, or drop `og:locale:alternate` until locale routing exists.

### Security Headers (3 findings)

- `netlify.toml` header block is **clean of every deprecated pattern in the catalog** — no `X-XSS-Protection`, no `Feature-Policy`, no `Expect-CT`, no `Public-Key-Pins`. LEAVE-IT.
- **LEAVE-IT (do not "fix" this) — CSP with `'unsafe-eval'` + `'unsafe-inline'` and no nonce.** The catalog flags this combination as a default anti-pattern, but here it is a **documented, deliberate trade-off with inline justification in the config file itself**: `netlify.toml` carries comments directly above the CSP line — `# unsafe-eval: required by Strudel live-coding engine (new Function / eval) — accepted risk by design` and `# unsafe-inline (style-src): required by Tailwind CSS 4 utility classes + React style={{}} props — no nonce alternative`. This is the opposite of cargo-cult: it's a reasoned, documented exception. A future session should NOT silently strip `unsafe-eval` "for security" without understanding it breaks the entire live-coding product (Strudel compiles user code via `new Function`/`eval` at runtime — this is the actual product, not a bug). If tightening is wanted, scope it to `worker-src`/`script-src-elem` nonces around specific chunks rather than removing the blanket exception.
- **HIGH (cite, don't re-derive) — the CSP's `default-src`/no `navigate-to` gap combines with a documented Electron renderer-navigation exploit.** Fully reproduced live in arch doc §5 Security section (`electron-no-nav-guard`, CONFIRMED): a renderer-initiated `location.href` navigation to a remote origin succeeds because the CSP has no `navigate-to`/`form-action` directive and there is no `will-navigate` handler in `electron/main.ts`, and after navigation the remote origin holds the complete `window.electronAPI` object (unconditionally exposed, no origin check). This is a genuine, exploit-reproduced finding already in the architecture doc — not re-audited here, just flagged as directly relevant to this security-header sweep so it isn't missed when triaging the CSP findings above. Hand off to a security-focused pass if not already tracked as a fix item.
- No security directives are expressed as `<meta http-equiv>` in `index.html` (verified: `grep -n http-equiv index.html` → 0 hits) — correct. LEAVE-IT.
- **MED — packaged Electron build likely ships with no CSP at all**, already fully documented in arch doc §5.19: `electron/main.ts:155-171` injects CSP only via `webRequest.onHeadersReceived`, which does not intercept `file://`, and `index.html` has no `<meta http-equiv="Content-Security-Policy">` fallback. Cite, don't re-fix — arch doc already has the falsifier command.

### Dead / cargo-cult meta tags (1 finding — confirms clean)

- `grep -rniE 'name="keywords"|revisit-after|name="distribution"|name="rating"|X-UA-Compatible'` across `src/`, `index.html`, `public/*.txt` → **0 hits.** No dead meta tags. LEAVE-IT.
- `<meta name="robots" content="index, follow">` is present and correct (explicit, not the default-implied version) — not an anti-feature, just worth noting it's the only file-level indexing signal since there's no per-route `noindex` mechanism visible in `src/lib/usePageMeta.ts` (it only sets title/description/canonical, never touches `<meta name="robots">` per-route). If any route should be non-indexable (e.g. a future `/editor?session=` deep link), there's currently no per-route robots control — ADD-THIS is optional, only relevant if such a route gets built.

### Tailwind v4 traps (1 finding — confirms clean, no duplication here unlike the sibling)

- `src/styles/global.css` imports `tailwindcss` + a **single-source token barrel** `src/styles/tokens/index.css` (which itself imports `colors.css`, `typography.css`, `spacing.css`) — `grep -n "@theme" src/` → **0 hits anywhere in the repo.** Unlike the icon-gen sibling, LMC has **no `@theme inline` block at all**, meaning no dual-declaration risk exists here. LEAVE-IT — this is the cleaner of the two projects on this specific axis; do not "harmonize" it toward icon-gen's pattern, that pattern is the one with the duplication bug.
- `grep -rn "bg-white dark:bg-gray"` and `grep -rln "dark:"` across `src/` → **0 hits total.** No Tailwind opacity-vs-dark-mode corruption, and in fact no `dark:` variant usage at all (consistent with icon-gen's sibling finding that the app is dark-only by design, no theme toggle). LEAVE-IT.

### Canonical / hreflang / JSON-LD (2 findings)

- **`index.html` static JSON-LD (`WebApplication`) exists and is well-formed** — single block, no duplication (unlike icon-gen's double-BreadcrumbList bug). LEAVE-IT.
- Covered above under Crawl & Indexing: the `og:locale:alternate` claim with no backing `hreflang`/routing is the JSON-LD-adjacent SEO-metadata finding for this repo.
- No per-route canonical mechanism beyond `usePageMeta.ts`'s dynamic `<link rel="canonical">` injection — the comment `<!-- Canonical URL handled dynamically per page (SPA) -->` in `index.html` is accurate (verified `usePageMeta.ts` does set `canonical.href` per page and restores `BASE_URL` on unmount). LEAVE-IT — this is a correctly-implemented dynamic-canonical pattern, the opposite of icon-gen's hardcoded-canonical bug; do not "fix" it toward a static approach.

---

## PART 2 — Stack Drift

### Electron & desktop toolchain — the axis that matters most here (Chromium CVEs)

| Package | Installed | Latest in same major | Latest overall (2026-08-16) | Verdict |
|---|---|---|---|---|
| `electron` | **41.2.0** | 41.10.5 | 42.9.0 (released 2026-08-11, [electronjs.org releases](https://www.electronjs.org/docs/latest/tutorial/electron-timelines)) | **HIGH — REMOVE-THIS-DRIFT.** See below. |
| `electron-builder` | 26.15.3 | — | not independently re-verified this sweep; not advisory-flagged | LEAVE-IT unless a future audit flags it |
| `electron-vite` | ^5.0.0 | — | not advisory-flagged | LEAVE-IT |
| `electron-updater` | ^6.8.9 | — | not advisory-flagged | LEAVE-IT |

**The concrete finding:** `npm audit` flags `electron` HIGH via 9 distinct advisories, every single one of them **already fixed within the 41.x line the project is already pinned to**:

- [`GHSA-v3j7-r9gq-3gjw`](https://github.com/advisories/GHSA-v3j7-r9gq-3gjw) HIGH — custom protocol cross-origin reads, fixed <41.4.0
- [`GHSA-h7rp-cf8h-j98x`](https://github.com/advisories/GHSA-h7rp-cf8h-j98x) HIGH — context isolation bypass via `Function.prototype.bind` hijack, fixed <41.2.2
- [`GHSA-9f4c-93c8-jc8g`](https://github.com/advisories/GHSA-9f4c-93c8-jc8g) HIGH — sandboxed iframe bypasses `allow-popups` via OpenURL, fixed <41.10.3
- plus 6 moderate/low advisories (code-sign spoofing, extension cross-session, cache/redirect bugs, contextBridge prototype-setter honor, DevTools shell-open) all fixed by 41.2.1–41.9.1.

**This is the highest-leverage fix in this entire sweep.** `package.json` already carries `"electron": "^41.2.0"` — the caret range permits `41.10.5` today with **zero major-version risk**, but the installed `node_modules/electron` is pinned at the floor of that range (41.2.0, the exact starting version, not the latest satisfying the range) — meaning `npm install` was run once and never refreshed, or the lockfile is pinning the exact patch. Bump the lockfile to `electron@41.10.5` (same major, no breaking-change risk) before considering the `42.x` major jump. Chromium security patches ship every ~6-8 weeks inside Electron's stable line; 41.2.0 is roughly 8 patch releases and several months of Chromium CVE backports behind 41.10.5. This is not a "nice to have" — three of the nine advisories are HIGH-severity sandbox/context-isolation bypasses, which is exactly the attack surface arch doc §5's `electron-no-nav-guard` finding already demonstrates is reachable (renderer → remote origin → full `electronAPI` exposure). An outdated Electron makes that existing, reproduced exploit chain *worse*, not just theoretically riskier.

### Version currency (verified via `npm view <pkg> versions`, 2026-08-16)

| Package | Installed | Latest | Verdict |
|---|---|---|---|
| `vite` | 8.0.16 | 8.2.1 | LOW drift — not in the vulnerable range for the `GHSA-fx2h-pf6j-xcff` dev-server advisory (that affects ≤8.0.15; 8.0.16 is already past it). Routine bump only, not urgent. |
| `typescript` | **~5.9.3** | 6.0.x (shipped March 2026) | MED drift — **pinned with `~` (patch-only), not `^`,** so this repo will never auto-advance to TS 6.0 the way icon-gen's `^6.0.2` did. TS 6.0 flips several defaults on (strict mode, ESM, es2025 target) and is a **breaking** upgrade for some codebases — do not blind-bump; budget a dedicated verification pass (`tsc --noEmit` across the whole repo, plus Electron's separate `tsconfig.electron.tsbuildinfo`) before moving off 5.9.x. Correctly noted in the sweep brief as a known cross-repo pin difference — confirmed real, not a false alarm. |
| `tailwindcss` | 4.2.2 | 4.3.3 | LOW drift, routine. |
| `react` / `react-dom` | 19.2.5 | current 19.x | LEAVE-IT. |

### npm audit — triaged by real exploitability (14 total: 1 low / 4 moderate / 9 high / 0 critical)

Unlike the icon-gen sibling, this app has **two runtime surfaces**: the browser SPA (client-side, same triage logic applies) AND the packaged Electron desktop app (a local process with filesystem/IPC access — a vulnerable dependency here has different blast radius than in a pure static site).

**Runtime-relevant:**
- `electron` HIGH — covered above, the headline finding.
- `react-router` HIGH — same two CVEs as the icon-gen sibling ([`GHSA-chx6-hx7r-mcp5`](https://github.com/advisories/GHSA-chx6-hx7r-mcp5) DoS, [`GHSA-qwww-vcr4-c8h2`](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) RSC CSRF bypass — not applicable, this app also uses the classic component router per arch doc). Bump `react-router-dom` past 7.18.2 anyway, drop-in.
- `undici` HIGH — [`GHSA-4cwx-7wf7-3272`](https://github.com/advisories/GHSA-4cwx-7wf7-3272) cross-user info disclosure via cache-directive parsing. `undici` is Node's/Electron's fetch implementation — relevant if any first-party code makes `fetch()` calls that pass through a shared cache layer (check `connect-src` allow-list in the CSP: `api.github.com`, `raw.githubusercontent.com`, `*.githubusercontent.com`, `freesound.org`). Since this is Electron-bundled Node internals rather than a project-controlled dependency in most cases, verify with `npm ls undici` whether it's pulled in by `electron-updater`/`electron-builder` (build/update tooling) or by first-party fetch code before prioritizing.
- `ws` HIGH — [`GHSA-96hv-2xvq-fx4p`](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) memory-exhaustion DoS via tiny WebSocket fragments. Check `npm ls ws` — arch doc §5.31 confirms `@strudel/osc` opens `new WebSocket('ws://localhost:8080')` in the Electron build (CSP allows `ws:` there); if `ws` the *package* (not the browser WebSocket API) is what's vulnerable, it's most likely a transitive dep of dev/build tooling, not the Strudel OSC bridge itself (that uses the browser-native `WebSocket`). Verify before treating as urgent.
- `nanoid` HIGH — same advisory pattern as icon-gen; check `grep -rn "nanoid(" src/ electron/` for first-party calls with dynamic size args before prioritizing over the tooling-only exposures below.
- `brace-expansion` HIGH — transitive, almost certainly build-tooling (glob patterns in `electron-builder` config resolution or ESLint), not shipped to the packaged app or browser bundle.

**Build-tool-only (very likely, verify with `npm ls <pkg>` if in doubt):**
- `@axe-core/cli` HIGH → `chromedriver` → `extract-zip`, `fast-uri`, `js-yaml`. Same devDependency chain as icon-gen — a11y test tooling, never ships.

**Recommendation:** run `npm audit fix` first (non-`--force`), then hand-bump `electron` to `41.10.5` and `react-router-dom` past `7.18.2` explicitly since those are the two with clear runtime relevance and zero breaking-change risk within their current majors. `undici`/`ws`/`nanoid` need one `npm ls` each to confirm whether they're first-party-reachable or tooling-only before spending more time triaging them.

### Unused / present-but-dead dependencies — supply-chain surface

Already documented in arch doc §5 (`indexeddb-dead-public-claim` Appendix A finding): `idb` is imported by exactly one file (`src/lib/persistence/local.ts`) and **that file's autosave/local-project functions (`openDB`, `getDb`, `saveProject`, `loadProject`, `listProjects`, `deleteProject`, `setupAutosave`) have zero callers outside itself** — only `serializeProject`/`deserializeProject` (used by the Gist share flow) are live. This means `idb` as a dependency is ~85% dead weight for what it's actually used for (two pure serialization helper functions don't need an IndexedDB wrapper library at all). Not flagged as REMOVE-THIS here because the arch doc already frames this as a correctness gap (no real autosave exists, contradicting the public `llms.txt`/`llms-full.txt` claims) rather than a pure-hygiene dependency question — fixing the feature gap and reassessing the dependency should happen together, not as two separate passes.

No other orphan first-party-adjacent packages surfaced in this specific sweep beyond what the architecture doc already tracks.

---

## Summary table

| Category | REMOVE-THIS | ADD-THIS | LEAVE-IT |
|---|---|---|---|
| Crawl & Indexing | — (llms.txt: pick a direction) | hreflang/routing to match `og:locale:alternate`, OR drop the alternate-locale meta claims | robots.txt clean |
| Security Headers | — | — (electron nav-guard is arch doc's item, not a header fix) | CSP unsafe-eval/unsafe-inline (documented, deliberate); no deprecated headers present |
| Meta tags | — | optional per-route robots control (only if non-indexable routes get built) | zero dead tags found |
| Tailwind v4 | — | — | no `@theme` duplication (cleaner than the icon-gen sibling) |
| Canonical/JSON-LD | — | — | dynamic canonical via `usePageMeta.ts` is correctly implemented; single well-formed JSON-LD block |
| Stack drift | **electron 41.2.0 → 41.10.5 (same major, 9 advisories fixed)**, react-router-dom → 7.18.2+ | typescript 5.9.3 → 6.0.x (budget a dedicated pass — breaking), vite → 8.2.1 (routine) | electron-builder/electron-vite/electron-updater (not advisory-flagged this sweep) |

**Mode: READ-ONLY scan. No fixes applied.**
