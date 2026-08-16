## Verdict: **BLOCK** — shipped copy asserts capabilities the code does not implement, across every public surface and all three locales

I did **not** create `docs/CLAIM-AUDIT-2026-08-16.md` — my harness forbids writing report/analysis `.md` files; the full audit is below and is the deliverable. If you want it persisted, that content goes to `/Users/arnold/Development/wm-prototyp-live-music-coder/docs/CLAIM-AUDIT-2026-08-16.md` verbatim. Read-only respected: zero edits to source or copy.

**Locale parity note:** `de.json`, `en.json`, `es.json` are byte-parallel — every cited line number is identical in all three files. Every false claim therefore ships ×3.

---

## Risk tally

| Class | Count | Notes |
|---|---|---|
| **SECURITY-RELEVANT false** | 2 claim-strings ×3 locales = 6 | both in `gist.*`; opposite directions of error |
| **FALSE feature claims** | 22 clusters | ~70 instances across locales + README + llms + JSON-LD + changelog |
| **FALSE numbers** | 9 | incl. two published files disagreeing on the app's own version |
| **PARTIAL / materially incomplete** | 6 | |
| **Third-party mark / comparison** | 1 | "Ableton-style" — new finding, not in ARCHITECTURE doc |
| Superlatives (`beste`/`Nr. 1`/`garantiert`) | **0** | clean |
| Missing AI disclosure | **0** | `footer.aiDisclosure` + `sessions.aiGenerated` present ×3; no `"Kein KI-Content"` claim anywhere — compliant |
| PAngV | **N/A** | free product, JSON-LD `price: "0"`, no B2C sale; GitHub-Sponsors link is a donation, not a Ware/Dienstleistung |
| §132a StGB / HWG | **N/A** | no protected titles, no health claims |
| Impressum / Datenschutz | **PASS** | `/legal` on own domain, `src/data/legal.ts` carries full §5 DDG set incl. DSA-Kontaktstelle, USt-ID, LfD Sachsen-Anhalt |

---

## 1 · SECURITY-RELEVANT false claims (distinct harm category)

These are separated because a user decides *what to put in a gist* and *whether to tick remember-me* based on them.

| # | Claim (verbatim, all 3 locales) | File:line | Code truth | Direction |
|---|---|---|---|---|
| **S1** | EN `"Stores token in browser storage (unencrypted)"` · DE `"Token wird unverschlüsselt im Browser gespeichert"` · ES `"El token se guarda sin cifrar en el navegador"` | `{de,en,es}.json:641`, rendered `GistDialog.tsx:250` + as `aria-label` at `:244`, shown **only when `remember=true`** | `gist.ts:105-112` — `remember=true` is the **AES-GCM-encrypted** branch (`encryptPAT` → `localStorage[lmc-gist-token-enc]`). The *unencrypted* path is `remember=false` → `sessionStorage.setItem(TOKEN_KEY_SESSION, token)` at `gist.ts:115`. **The warning is attached to the wrong branch.** | **UNDERSTATES** |
| **S2** | EN `"Gists are public by default — make them secret if you prefer."` · DE `"Gists sind standardmäßig öffentlich — bei Bedarf als geheim markieren."` · ES `"Los Gists son públicos por defecto — márcalos como secretos si prefieres."` | `{de,en,es}.json:592` | `gist.ts:166` `public: false` — hardcoded, **single** `gists.create` call site, no toggle, no prop. Every gist is secret. | **MISSTATES** |

### The trap in S1 — do not "fix" it by writing "encrypted"

`gist.ts:34` generates the AES key with `extractable = true`, `:35` exports it raw, `:36` base64s it into **`sessionStorage` on the same origin as the ciphertext**. The ARCHITECTURE appendix (`gist-pat-xss`, CONFIRMED P1) reproduced recovery at runtime: `RECOVERED PAT = ghp_REALPAT` using four lines of same-origin script. And this origin runs attacker-supplied code **by design** — `CodeEditor.tsx:122-125` `new Function(code)` on code that can arrive from a `#code=` share link (`url.ts:52` → `Editor.tsx:16`).

So against the *actual* threat model the "unencrypted" wording is **closer to true than "encrypted" would be**. Flipping the string to `"verschlüsselt"` converts an understatement into an **overstatement of a security control** — the far worse UWG direction and the far worse user-harm direction. Correct remedy is precision, not inversion (§6 below).

Also live and un-flagged in copy: `gist.ts:20` `PAT_PLAIN_KEY` (legacy plaintext) is **read and returned** at `:95-96` and never wiped on the read path — a legacy plaintext PAT survives indefinitely for any user who never re-saves or clears (`GistDialog.tsx:47-53` only reads).

---

## 2 · FALSE product-feature claims — code contradicts, no substitute exists

| # | Claim (verbatim) | Where it ships | Implementing code — or the grep that returns nothing | Verdict |
|---|---|---|---|---|
| **F1** | `"record your session as audio"` ×2 on the homepage; `"● Record — captures audio output as a WebM file"`; JSON-LD `"Audio recording and export"` | `{de,en,es}.json:86` (`codeshare.desc`) + `:90` (`share.desc`) + `:538` (`transportRecord`); `index.html:63` featureList; `README.md:97`; `llms.txt:30`; `llms-full.txt:107` | `recorder.ts:20-22` taps **only** `getMasterGain()`. Superdough terminates at its own context: `superdoughoutput.mjs:148 this.destinationGain.connect(audioContext.destination)`. `grep -rn "setAudioContext" src/` → **0**. `DEFAULT_ENGINE='strudel'` (`constants.ts:17`). ⇒ **a recording of a default-engine session is silence.** | **FALSE** |
| **F2** | `"See your audio routing as draggable nodes. Code and graph stay in sync."` / `"draggable, connectable nodes. Auto-derived from code in real time"` / JSON-LD `"Visual node graph with bidirectional code sync"` | `{de,en,es}.json:78`; `README.md:59`; `index.html:60` | `NodeGraph.tsx:168-198` renders the permanent empty state (`graph.singleNodeTitle/Desc`) for Strudel. True only for `tonejs`/`webaudio`. | **FALSE for the default engine** |
| **F3** | `"Alt+1…9 — solo pattern $d1 through $d9 (all others muted)"` · `"Shift+Alt+1…9 — toggle mute"` · `"Labels let you solo and mute individual layers with keyboard shortcuts"` | `{de,en,es}.json:580,581,582,584`; `README.md:101`; CHANGELOG `Solo/mute keyboard shortcuts` | `StrudelEditor.tsx:462-479` binds the keys → `toggleSolo/toggleMute` mutate a module-local `Set`/`let` in `solo-mute.ts`. `grep -rn "isMuted\|isSoloed\|getSoloMuteState" src/ \| grep -v solo-mute.ts` → **empty**. No document mutation, no re-eval. **Both shortcut families are no-ops that only `console.log`.** | **FALSE** |
| **F4** | `"MIDI Learn maps any CC knob or fader to an app parameter… click the parameter you want to control…"` / `"Connect hardware to software controls without editing code"` | `{de,en,es}.json:570`; `README.md:93` + roadmap `:250`; `llms.txt:23`; `llms-full.txt:57` | `StrudelEditor.tsx:915` `startMidiLearn('lpf')` — target **hardcoded**, no parameter picker; the button's own comment at `:890` says *"proof of concept"*. `grep -rn "getMidiMapping\|getAllMappings" src/ \| grep -v midi-learn.ts` → **empty** ⇒ the stored mapping controls nothing. Also it lives in the **USB quick-action menu**, not the MIDI panel as documented. | **FALSE (3 of 4 clauses)** |
| **F5** | `"auto-detected with 19 device profiles"` · `"Factory CC profile loaded automatically (CC 1 = mod wheel, CC 7 = volume, K1–K8 on CC 70–77)"` · `"Auto-detected by device name on connection"` | `{de,en,es}.json:184,559,560`; `README.md:89,251`; `llms.txt:23`; `llms-full.txt:59` | `grep -rn "midi-devices\|MIDI_DEVICES\|detectDeviceProfile\|getDeviceProfileById\|generateStrudelMidimap" src/ electron/ \| grep -v src/data/midi-devices` → **empty**. The whole 19-profile database (501 lines) has **zero consumers**; no importer exists. | **FALSE** |
| **F6** | `"midin(cc, min, max) reads a MIDI CC value (0–127) and maps it to a range"` | `{de,en,es}.json:566` | Real signature `strudel-keys.ts:328` `customMidin(device: number\|string = 0): Promise<(ccNum?: number) => ref>`. Documented call **throws or misbinds**; the app's own examples use `await midin(0)` then `cc(70).range(...)` (`StrudelEditor.tsx:820`). | **FALSE (teaches a wrong signature)** |
| **F7** | `"Ctrl+. — stop all audio"` · `"Keyboard: Ctrl+Enter to evaluate, Ctrl+. to stop"` | `{de,en,es}.json:489, 536` | No `Ctrl-.`/`Cmd-.`/`Period` binding anywhere in `lib/editor/`, `StrudelEditor.tsx`, `TransportBar.tsx`, `pages/Editor.tsx`. | **FALSE** |
| **F8** | `"Tabs are saved in your browser and restored on reload."` | `{de,en,es}.json:542` | `store.ts` has **no** `persist` middleware. Complete set of literal `localStorage.setItem` keys in `src/`: `lmc-onboarded`, `lmc-saved-gists`, `lmc-streak` (+ dynamic `lmc-editor-settings`, `lmc-midi-learn`, gist keys). **No file/tab persistence exists.** | **FALSE** |
| **F9** | `"IndexedDB autosave (idb)"` / `"IndexedDB autosave via idb library"` | `llms.txt:27`; `llms-full.txt:104` | `setupAutosave` (`local.ts:116`) has **zero callers**; `saveProject`/`listProjects` likewise. `grep -rn "autosave" src/` → 4 hits, all inside `local.ts`. Tree-shaken out of the production bundle. | **FALSE** |
| **F10** | `"BPM — set the global tempo. Strudel patterns are cycle-based; BPM controls how fast cycles play."` | `{de,en,es}.json:537` | `orchestrator/index.ts:75-82` gates the forward on `type === 'tonejs'`. `StrudelEngine` exposes no tempo method. `repl.setCps`/`setCpm` are never called from `src/`. **BPM is a silent no-op for the default engine.** | **FALSE** |
| **F11** | `"Line Numbers — show/hide"` | `{de,en,es}.json:529` | `setup.ts:38` calls `lineNumbers()` **unconditionally**. `SettingsPanel.tsx:176` writes `lmc-editor-settings.lineNumbers`; nothing reads it. No hide. | **FALSE** |
| **F12** | `"Change them with setParam() or via MIDI CC mapping"` | `{de,en,es}.json:500`; `README.md:57`; shipped code sample `docs.ts:210-212`; shipped example `example-library.ts:1219` | `createParams` (`strudel-extensions.ts:122`) returns a **plain number snapshot**, so `setParam` cannot alter an already-evaluated pattern. `grep -rn "setParam" src/ \| grep -v strudel-extensions` → only the two doc-strings. **No MIDI layer ever calls `setParam`.** | **FALSE (both halves)** |
| **F13** | `"Native file save/load, system tray, audio export, and auto-updates"` | `{de,en,es}.json:99`; `llms.txt:17,31`; `llms-full.txt:108` | save ✅ (`TransportBar.tsx:367`) · tray ✅ (`electron/tray.ts`) · auto-update ✅ (`electron/updater.ts`, `latest-mac.yml` published) · **load ❌** `openProject` has zero renderer callers · **audio export ❌** the ⌘E toolbar button at `TransportBar.tsx:374` fires `electronAPI?.notify('Export', 'Use the recording feature first, then export.')` — there is no "then export"; `exportWav` is never called. **2 of 4 headline download reasons are false.** | **FALSE ×2** |
| **F14** | `.lmc` file association registered with the OS | `package.json:82-89` `fileAssociations` | No `app.on('open-file')`, no `second-instance`, no `requestSingleInstanceLock`; sole `process.argv` use is a `--lmc-debug` flag (`electron/main.ts:32`). Double-clicking a `.lmc` file does nothing. | **FALSE** |
| **F15** | `gamepad(0)` — `"Gamepad analog stick values"` in the in-app API reference | `SidePanel.tsx:670` | `lib/input/gamepad.ts` exports `getAxis/getButton/getLeftX/…`; **no global named `gamepad` is ever registered** (`grep -rn "\.gamepad\s*=" src/` → empty). Typing it → `ReferenceError`. | **FALSE** |
| **F16** | `"Clock Sync — Multi-tab synchronization… (leader election, BPM broadcast)"` / `"allow multiple browser tabs to lock to the same tempo"` | `README.md:103`; CHANGELOG `Clock sync for multi-tab jam sessions` | `strudel-extensions.ts:186-197` — the `sync` and `bpm` cases **only `console.log`**; no scheduler is set. `broadcastBpm` (`:221`) has **zero callers**. `getLeaderBpm()` (`:211`) reads `repl.scheduler.bpm`, a field the Cyclist does not define (it has `cps`) ⇒ always returns the hardcoded `120`. Leader election is real; **synchronisation is not**. | **FALSE** |
| **F17** | `"Quantize, auto-insert…"` / `"Supports quantization and auto-insert"` | `README.md:91`; `llms-full.txt:55` | `enableComposeMode(view, _options?)` ignores its options (underscore-prefixed); `compose-mode.ts:226` `export function setQuantize(_q){ /* reserved */ }` with zero callers. | **FALSE** |
| **F18** | `"Add ._pianoroll(), ._scope(), or ._punchcard()…"` + the shipped code sample `note("c4 e4 g4 c5")._pianoroll()` | `{de,en,es}.json:505`; **executable sample** `docs.ts:229`; `README.md:55`; CHANGELOG `"Full Strudel feature parity"` | `StrudelEditor.tsx:306-352` `registerWidget()` clobbers `Pattern.prototype.pianoroll/.punchcard/.pitchwheel`; `@strudel/codemirror`'s own `_pianoroll` then calls the clobbered wrapper with an options object as `id` → `haps.filter(...)` throws (`pianoroll.mjs:150`). Affects 5 shipped examples + this doc sample. | **FALSE (documented API throws)** |
| **F19** | `"Engine orchestrator with shared AudioContext routes to 4 engine adapters"` / `"One shared AudioContext"` / `"all engines output to one master gain node"` | `llms.txt:14`; `llms-full.txt:32`; `README.md:179-180` | **Three** AudioContexts: `audio/context.ts:20`, superdough's own, `midi/strudel-keys.ts:45`. The default engine bypasses the orchestrator entirely (`StrudelEditor.tsx` owns its own REPL). | **FALSE** |
| **F20** | `"The following device has been fully tested. All features — midikeys(), midin(), MIDI Compose Mode, MIDI Learn, and the Synth panel — are confirmed working"` | `{de,en,es}.json:558` (+ `:559`) | Contradicted by F4 (MIDI Learn is a hardcoded-`lpf` proof of concept whose mapping nothing reads) and F5 (the "automatically loaded" factory profile has no importer). | **FALSE — and this is a *Test-/Prüfaussage*, see §4** |
| **F21** | CHANGELOG: `"Added code download as .strudel file"` | `changelog-library.ts` → `CHANGELOG.md:29` | `StrudelEditor.tsx:716` `a.download = \`${...}.js\``. README `:109` and the UI say `.js`. | **FALSE** |
| **F22** | CHANGELOG title: `"MIDI keyboard input via @strudel/midi CDN"` | `changelog-library.ts` → `CHANGELOG.md:21` | `grep -rn "cdn\|unpkg\|jsdelivr\|esm.sh" src/ index.html` → **empty**. Loaded from the bundle via `evalScope(import('@strudel/midi'))` (`StrudelEditor.tsx:281`) — the entry's own body contradicts its title. | **FALSE** |

---

## 3 · FALSE numbers (measured empirically, not read off comments)

Probe: `esbuild --bundle` of the real modules + `node`, plus `vitest run`.

| # | Published | Real | Where |
|---|---|---|---|
| **N1** | `"browse 218 Dirt-Samples"` | **196** base / **1745** entries (`BASE_SAMPLE_COUNT`, `TOTAL_SAMPLE_COUNT`) — and `Samples.tsx:494` renders the correct 196/1745 **on the same site** | `{de,en,es}.json:546` (README `:87` is correct at 196) |
| **N2** | `"43 curated AI-composed pieces across 10 genres"` | **49** pieces, **15** categories | `{de,en,es}.json:596` |
| **N3** | `"51 Curated Sessions"` | **49** | `README.md:83`, `llms.txt:40`, `llms-full.txt:19`, `CLAUDE.md` |
| **N4** | `"220+"` / `"215+"` code examples | **219** in `EXAMPLE_LIBRARY`; the UI header advertises **65** (`Examples.tsx:583` reads `TOTAL_EXAMPLE_COUNT`, snapshotted at `example-library.ts:1086` before 154 later `.push()`es) — **65 and 219 render on the same page** (`:775`) | `README.md:85`, `llms.txt:40`, `llms-full.txt:18` |
| **N5** | `Test files: 24 · Tests: 154 · Routes: 12 · Blog posts: 7 · Components: 62 (…18 molecules)` | **25 · 158 · 13 named routes · 5 · 63 (19 molecules)** | `llms-full.txt:13-22`; `llms.txt:38` |
| **N6** | `**Version:** 1.0.3` | `package.json` = **1.1.0**; `llms.txt:58` says 1.1.0 — **the two published LLM files disagree about the product's own version** | `llms-full.txt:7` |
| **N7** | `"500ms debounce"` | **150 ms** (`StrudelEditor.tsx:437`); the same repo says 150 ms at `README.md:113` | `README.md:168`, `llms-full.txt:28` |
| **N8** | `"19 other device profiles are included"` | 19 profiles **total**, of which 1 is the MPK mini MK3 ⇒ **18** others (and 1 is `generic-keyboard`) | `{de,en,es}.json:560` |
| **N9** | `"macOS: .dmg (universal + arm64)"` | `package.json` mac targets = `arm64` + `x64`, **no universal** | `llms-full.txt:163` |

---

## 4 · CHANGELOG accuracy (raised bar: versioned, auto-updating desktop distribution)

**Structural:**
- `package.json` = **1.1.0**; newest version in `changelog-library.ts` = **1.0.2**. Versions present: 1.0.0, 1.0.1, 1.0.2 only.
- GitHub Releases (verified via `gh release list`): **v1.0.0, v1.0.1, v1.0.2, v1.0.3, v1.1.0**. ⇒ **two shipped public releases have no changelog entry**, and **v1.1.0 is titled "Security hardening, a11y, type safety"**. Both DMG assets exist and are live, so users are downloading a build whose changes are undocumented.
- `CHANGELOG.md:17` `## [1.0.2] - 2026-04-11` **and** `:40` `## [1.0.2] - 2026-04-09` — duplicate header, caused by `scripts/sync-changelog.ts` opening a new group on every entry carrying a `version` while two entries carry `1.0.2` (`changelog-library.ts:165`, `:559`). Fix: group by version key.
- Synth UI Phase 1 + 2 sit under `## [Unreleased]` although they shipped in the v1.1.0 build (2026-05-04).
- `CHANGELOG.md:3` asserts **`"All notable changes to Live Music Coder are documented here."`** — with 1.0.3 and 1.1.0 absent, that header is itself a false statement of completeness. This is the single §5a-shaped line in the file.

**Entries claiming features that did not ship (already tabled above):** F3 (`Solo/mute keyboard shortcuts` — additionally claims *"Uses the Strudel `_$:` muting syntax under the hood"*, which is specifically false: the shortcuts never touch the document, while `_$:` muting genuinely works via Strudel's own `Pattern.prototype.p` returning `silence` for `_`-prefixed ids, `repl.mjs:172`), F16 (`Clock sync`), F21 (`.strudel`), F22 (`CDN`), F18 (`Full Strudel feature parity` listing `_pianoroll` as delivered).

**Bitter irony worth logging:** the entry `"CSP fix for AudioWorklet and inline widgets"` documents as a *fix* — *"Also wired inline widget methods (pianoroll, scope, slider) onto Pattern.prototype"* — the exact change that clobbers the real painters and makes `._pianoroll()` throw (F18).

---

## 5 · DE-market UWG exposure — concrete

**Does UWG apply to a free, AGPL app?** Yes. `§2 Abs. 1 Nr. 2 UWG` defines *geschäftliche Handlung* by objective connection to promoting sales/one's own undertaking — not by a price. The nexus here is explicit and documented: the Impressum names **"Arnold Wender / Werbeagentur Wender Media, Franckestraße 3a, 06110 Halle, USt-ID DE-253389445"**, `index.html` JSON-LD names `author: Organization "Wender Media", url https://wendermedia.com`, and `README.md:27` carries a **GitHub Sponsors** solicitation. This is an agency portfolio/lead asset, not a private hobby page. PAngV stays out (no Entgelt).

**Ranked exposure:**

1. **`docs.midiSetup.verifiedText` + `verifiedMpk` (`:558/:559`) — highest.** This is a **Test-/Prüfaussage** (`§5 Abs. 1 S. 2 Nr. 1 und Nr. 3 UWG`) naming a **specific third-party hardware product** (Akai MPK mini 3) and asserting *"vollständig getestet … bestätigt funktionsfähig"* for an enumerated feature list — one of which (MIDI Learn) provably does not function, and one of which (auto-loaded factory CC profile) has no code path at all. German case law puts the **Darlegungs- und Beweislast for advertising with test results squarely on the advertiser** (st. Rspr. BGH). A test claim you cannot substantiate is the most reliably abmahnbare shape in this repo. It is also the claim most likely to be surfaced by an LLM answering *"does Live Music Coder work with my MPK mini?"*.
2. **`landing.download.subtitle` (`:99`) — the download decision.** A four-item capability list gating a 137 MB download where **two items are false** (`load`, `audio export`). This is textbook `§5 Abs. 1 S. 2 Nr. 1 UWG` (*wesentliche Merkmale … Zwecktauglichkeit, Verwendungsmöglichkeit*). The **distribution angle sharpens it**: for a website, a wrong feature blurb costs a click; for a signed, notarised, auto-updating desktop binary with an OS-registered `.lmc` association (F14) and a semver changelog, the copy is **product documentation**, and the user has installed something on the strength of it.
3. **F1 recording — the widest blast radius.** Present twice on the homepage in all three languages (6 rendered instances), in the in-app docs, in the README, in *both* llms files, and — critically — in `index.html` **JSON-LD `featureList`**, which Google and every LLM crawler ingest as a machine-readable fact. Per your own JSON-LD rule, that is the hidden vector: the false claim propagates to answer engines and is then quoted back at users.
4. **`CHANGELOG.md:3` + two missing releases** — `§5a Abs. 1 UWG` (Vorenthalten wesentlicher Informationen). For an auto-updating distributed binary, the changelog is the security-update record. Omitting a release titled *"Security hardening"* while the file's own header promises completeness is the one item here I would not defend.
5. **New: `"DAW-quality (Ableton-style)"` / `"DAW-Qualität … (Ableton-Stil)"`** — `{de,en,es}.json:511`, `README.md:78`. This is the only named-competitor comparison in the shipped copy, and it names a **German rights-holder** (Ableton AG, Berlin). Territory: `§6 UWG` (vergleichende Werbung — requires objective, verifiable comparison of essential features) plus `§14 Abs. 2 Nr. 3 MarkenG` (Ausnutzung der Wertschätzung einer bekannten Marke). `"DAW-quality"` is additionally an unsubstantiated quality claim. Not flagged in the ARCHITECTURE doc. **MED, but it is the only claim with an identifiable, motivated, German Aktivlegitimierter.**

**Realistic Abmahnrisiko: LOW–MODERATE.** The niche is tiny and there is no obvious German Mitbewerber with a monetary interest in live-coding IDEs — except via item 5. Standing under `§8 Abs. 3 UWG` would most plausibly come from a qualifizierte Einrichtung or the Wettbewerbszentrale rather than a competitor. Note `§13 Abs. 4 UWG` does **not** shield here: its Aufwendungsersatz carve-out covers Informations-/Kennzeichnungspflichten im elektronischen Geschäftsverkehr and DSGVO — **not** `§5` Irreführung. `§13a Abs. 2` caps the Vertragsstrafe for a first-time offender under 100 employees. Order-of-magnitude if it lands: **€500–3.000** Abmahnkosten plus a strafbewehrte Unterlassungserklärung whose repeat trigger is the real cost, because the same string ships in three locales and five files — one careless re-introduction is a repeat violation.

**Non-legal but larger in expectation:** every item above is an LLM-hallucination amplifier. `llms.txt` and `llms-full.txt` exist precisely to be ingested, and they currently publish *"IndexedDB autosave"*, *"19 device profiles auto-detected"*, *"MIDI learn (CC-to-parameter mapping)"* and two mutually contradictory version numbers.

---

## 6 · Remedies — exact removal edit + implementation cost

Format: `key` → replacement DE / EN / ES. All edits are three-file, same line number.

### Security (do these first)

**S1 · `gist.rememberWarning` `{de,en,es}.json:641`** — do **not** write "encrypted".
- DE → `"Token bleibt im Browser gespeichert. Auf diesem Gerät durch Skripte auslesbar — nur Token mit Gist-Scope verwenden."`
- EN → `"Token stays in browser storage. Readable by scripts on this device — use a gist-scoped token only."`
- ES → `"El token permanece en el navegador. Legible por scripts en este dispositivo — usa solo un token con alcance gist."`
- *Cost to make the original wording true instead:* non-extractable key + a WebCrypto-wrapped key that never round-trips through `sessionStorage`, ~4 h — but it still would not survive same-origin `new Function()` execution, so **the honest fix is the string, not the crypto**. Real hardening = move the PAT out of the browser (device-flow + backend proxy), 2–3 days.

**S2 · `docs.gistText` `{de,en,es}.json:592`** — replace the final sentence:
- DE → `"Alle Gists werden als geheime Gists angelegt (nicht über die Gist-Suche auffindbar, aber für jeden mit dem Link abrufbar). Eine Umschaltung auf öffentlich gibt es derzeit nicht."`
- EN → `"All gists are created as secret gists (not discoverable via gist search, but readable by anyone with the link). There is currently no public/secret toggle."`
- ES → `"Todos los gists se crean como gists secretos (no aparecen en la búsqueda de gists, pero cualquiera con el enlace puede leerlos). Actualmente no hay conmutador público/secreto."`
- *Cost to implement the claim:* a checkbox in `GistDialog.tsx` threaded to `gist.ts:166` `public: <state>` — **~30 min.** Cheapest true-up in the whole audit.

### Feature claims — removal edits

| Claim | Removal edit (DE / EN / ES, one line each) | Cost to implement instead |
|---|---|---|
| **F1** recording | `:86` drop `" oder deine Session als Audio aufnehmen"` / `", or record your session as audio"` / `" o graba tu sesión como audio"`; `:90` same; `:538` append `" (Hinweis: erfasst derzeit Tone.js- und Web-Audio-Ausgabe; Strudel-Patterns laufen über einen eigenen Audio-Kontext.)"` + EN/ES equivalents; delete `"Audio recording and export"` from `index.html:63`; `README.md:97`; `llms.txt:30`; `llms-full.txt:107` | Pass `{ audioContext: getSharedContext() }` into all four `initStrudel()` call sites (`StrudelEditor.tsx:227`, `ExampleGallery.tsx:83`, `useInlinePlayer.ts:48`, `engines/strudel.ts:29`) **or** call `setAudioContext()` once. **~1 day** incl. regression on the tap/visualizers |
| **F2** node graph | `:78` → DE `"Tone.js- und Web-Audio-Patches als verschiebbare Knoten. Der Graph wird aus dem Code abgeleitet."` / EN `"Tone.js and Web Audio patches as draggable nodes. The graph is derived from your code."` / ES `"Parches de Tone.js y Web Audio como nodos arrastrables. El grafo se deriva del código."`; same qualifier on `README.md:59` + `index.html:60` | Strudel pattern→graph parser: **3–5 days**, and arguably wrong-shaped (a Strudel pattern is one expression) |
| **F3** solo/mute | delete `:581` + `:582` entirely, drop the trailing sentence of `:584` and the `":"` from `:580`; `README.md:101` keep only `` `_$:` prefix in code mutes patterns `` (**that half is genuinely true** — `repl.mjs:172`); mark the CHANGELOG entry corrected | Make Alt+N insert/remove the `_` prefix on the matching label in the document and re-eval — **~4 h**, and it reuses the mechanism that already works |
| **F4** MIDI Learn | `:570` → DE `"MIDI Learn (Vorschau): Über das USB-Menü 'MIDI Learn' starten und einen Regler bewegen — die CC-Nummer wird dem Parameter 'lpf' zugeordnet und gespeichert. Die Zuordnung wird derzeit noch nicht auf Patterns angewendet."` + EN/ES; `README.md:93` + roadmap `:250` move `Done` → `In progress`; strike from `llms.txt:23`, `llms-full.txt:57` | Parameter picker + read `getMidiMapping()` in the eval path: **1–2 days** |
| **F5** device profiles | `:184` → `"…automatisch erkannt (Standard-USB-MIDI)."`; `:559` drop `"Factory-CC-Profil wird automatisch geladen"`, keep the CC list as *documentation of the hardware's factory layout*; `:560` → `"18 weitere Geräteprofile sind im Repository hinterlegt, werden aber noch nicht automatisch angewendet."`; `README.md:89,251`, `llms.txt:23`, `llms-full.txt:59` | Call `detectDeviceProfile(port.name)` on connect → `generateStrudelMidimap()`: the data and both functions already exist. **~3 h — best value/effort ratio in the audit** |
| **F6** midin | `:566` → `"midin(gerät) liefert eine Funktion cc(nr), die den CC-Wert (0–127) als Referenz zurückgibt. Bereich mit .range(min, max) abbilden."` + EN/ES; matches the app's own examples | 0 (doc-only) |
| **F7** Ctrl+. | delete `:489`; strip `", Ctrl+. zum Stoppen"` from `:536` | `keymap.of([{ key: 'Ctrl-.', mac: 'Cmd-.', run: stop }])` — **~20 min** |
| **F8** tabs | `:542` drop the final sentence in all three | Persist `files[]` — `setupAutosave` + `saveProject` already exist and are dead; wiring them is **~2 h** and kills F9 at the same time |
| **F9** autosave | delete `llms.txt:27`; delete `llms-full.txt:104` | see F8 |
| **F10** BPM | `:537` → DE `"BPM — Tempo für die Tone.js-Engine. Strudel-Patterns sind zyklusbasiert; das Tempo dort mit setcps() bzw. .cpm() im Code setzen."` + EN/ES | Route `setBpm` → `repl.setCpm(bpm)` for the strudel engine: **~1 h** |
| **F11** line numbers | `:529` → `"Zeilennummern"` / `"Line Numbers"` / `"Números de línea"` | Make `lineNumbers()` conditional + add `lineNumbers` to the editor effect deps: **~1 h** |
| **F12** createParams | `:500` → DE `"Benannte Parameter mit createParams(name, standard) anlegen und mit getParam(name) lesen. setParam() wirkt erst bei der nächsten Auswertung."` + EN/ES; fix `docs.ts:210-212` + `example-library.ts:1219` comments; `README.md:57` drop `"controllable via MIDI CC"` | Return a Strudel `ref` instead of a number so `setParam` is live, + bind MIDI-Learn mappings to it: **~1 day** (this is also the natural home for F4) |
| **F13** desktop | `:99` → DE `"Natives Speichern, System-Tray und Auto-Updates. Die gleiche Live-Coding-Power, offline."` / EN `"Native file save, system tray, and auto-updates. Same live coding power, offline."` / ES `"Guardado nativo, bandeja del sistema y actualizaciones automáticas. El mismo poder de live coding, sin conexión."`; `llms.txt:17,31` and `llms-full.txt:108` → `"native file save"` | Open: subscribe `onMenuAction` + an Open button → `openProject` — **~2 h.** Export: wire the recorder blob → `exportWav` — **~3 h** (blocked on F1: nothing to export while Strudel is silent) |
| **F14** `.lmc` | remove `fileAssociations` from `package.json:82-89` until implemented | `app.on('open-file')` + `second-instance` + `requestSingleInstanceLock` + argv scan: **~3 h** |
| **F15** gamepad | delete the `gamepad(0)` row at `SidePanel.tsx:670` | `(globalThis as any).gamepad = (i) => ({ x: getLeftX(i), y: getLeftY(i) })` next to the other globals at `strudel-extensions.ts:299-302` — **~30 min** |
| **F16** clock sync | `README.md:103` → `"Clock Sync (Vorschau) — Leader-Election über BroadcastChannel; Tempo-Übernahme noch nicht implementiert."`; correct the CHANGELOG entry | Fix `getLeaderBpm()` to read `repl.scheduler.cps`, call `broadcastBpm` from `TransportBar`, apply `setCps` on receipt: **~4 h** |
| **F17** quantize | `README.md:91` and `llms-full.txt:55` drop `"Quantize"` / `"Supports quantization"` | Implement `setQuantize` + snap in the note→notation path: **~4 h** |
| **F18** `_pianoroll` | keep the docs text but note the ordering bug; **or** fix the code — this one is cheaper to fix than to document | Delete the `registerWidget` block `StrudelEditor.tsx:306-352` and register only underscore types. **~30 min, unblocks 5 shipped examples + this doc sample.** Already #1 on the ARCHITECTURE doc's cheapest-work list |
| **F19** architecture | `llms.txt:14` → `"Engine orchestrator for Tone.js / Web Audio / MIDI on a shared AudioContext; the Strudel engine runs its own REPL and audio context"`; same for `llms-full.txt:32`, `README.md:179-180` | see F1 |
| **F20** test claim | `:558` → DE `"Folgendes Gerät wurde im Praxiseinsatz verwendet — midikeys(), midin(), Compose Mode und das Synth-Panel funktionieren damit:"` + EN/ES. **Remove `"vollständig getestet"`, `"Alle Funktionen"`, `"bestätigt funktionsfähig"`, and MIDI Learn from the list.** | Only substantiable by an actual documented test matrix. Do not re-assert without one |
| **F21/F22** | correct the two entries in `changelog-library.ts` (`.strudel` → `.js`; drop `CDN` from the title) and regenerate `CHANGELOG.md` | 0 |
| **Ableton** | `{de,en,es}.json:511` → `"Piano Roll — scrollende Noten mit Velocity-Farben"` / `"Piano Roll — scrolling notes with velocity colours"` / `"Piano Roll — notas con desplazamiento y colores por velocity"`; `README.md:78` drop `"DAW-quality (Ableton-style)"` | n/a — remove, do not substantiate |

### Numbers — make them computed, not typed

`{de,en,es}.json:546` → interpolate `{{count}}` and feed `BASE_SAMPLE_COUNT`; `:596` → feed `SESSIONS_LIBRARY.length` + `SESSION_CATEGORIES.length` (and drop `"Deep House"`, which is a session *subtitle*, not one of the 15 categories). `README.md:83,85`, `llms.txt:38,40`, `llms-full.txt:7,13-22,163`, `CLAUDE.md` → regenerate from the probe rather than hand-editing. **Move `TOTAL_EXAMPLE_COUNT` to end-of-file in `example-library.ts`** (one line, kills N4's 65-vs-219 split-brain). Reconcile `llms-full.txt:7` to `1.1.0`.

### Partials worth a sentence, not a rewrite

`landing.features.i18n.desc:94` `"Vollständige Oberfläche"` / `"Full interface"` — the Settings modal (`SettingsPanel.tsx`: "Settings", "Theme", "Font Size", "Line Numbers", "Word Wrap", "Vim Mode", "Zen Mode") and the SidePanel settings tab ("Zen Mode (hide UI, focus on code)", "Highlight active events in code", "Display line numbers", "Enable line wrapping", "Flash on evaluation") are hardcoded English. Either translate (~2 h, ~15 keys) or soften to `"Oberfläche in Deutsch, Englisch und Spanisch"`. · Font size / word wrap apply only on editor re-creation (deps `[activeFile?.id, activeFile?.engine, ready, editorTheme, vimMode]` — `fontSize` absent). · `"4 audio engines"` is defensible (`MidiEngine` is real) but the MIDI engine produces no audio; the caveat exists at `engines.midiWarning:46` and should be mirrored into `index.html` featureList. · `"All draw at 60fps … share a single AnalyserNode tap"` — RAF-driven, but the analyser is polled every 15 frames and there are **two** analysers (`context.ts:26`, `strudel-tap.ts:29`). · `docs.gettingStarted.tip:405` promises the pattern timeline "at the bottom", but `DEFAULT_LAYOUT.visiblePanels.timeline = false` (`constants.ts:40`).

---

## What I could not falsify — kept out of the findings deliberately

`_$:` muting is **real** in both eval paths (Strudel's own `Pattern.prototype.p` returns `silence` for `_`-prefixed ids, `node_modules/@strudel/core/repl.mjs:172`) — I initially suspected a live-mode/manual-eval divergence and it does not exist; only the *Alt+N shortcuts* are dead. `mouseX`/`mouseY` in the API reference are **real** (`@strudel/core/signal.mjs:185-187` exports both camelCase aliases). Download-as-`.js`, URL sharing via lz-string, the 2-second armed Clear button, 150 ms live debounce, Ctrl+Z / Ctrl+Shift+Z / Ctrl+F / Ctrl+Shift+[, 4 editor themes, zen mode, vim mode, the 7 visualizer panels, the drag-and-drop sample formats, both README download links (`gh release view` confirms both DMGs are uploaded on `v1.1.0`), and the entire `/legal` set — all **verified true**.