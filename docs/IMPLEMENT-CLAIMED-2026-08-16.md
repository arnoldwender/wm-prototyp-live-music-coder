# Live Music Coder — Work order: implement every claimed-but-unimplemented feature

**Directive (Arnold, 2026-08-16):** *"implement all claimed but not implemented"* — the remedy for a false public claim is to **build the feature**, not to delete the sentence. Boy Scout / Goonies / Jedi rules apply throughout.

**Source of truth:** [ARCHITECTURE-2026-08-16.md](ARCHITECTURE-2026-08-16.md) — verified architecture reference with Appendix A (14 adversarially-verified findings, each with evidence and a falsifier command). Every claim below traces to a verdict there.

**Same headline as the sister repo:** this is overwhelmingly missing **wiring**, not missing code. `setupAutosave` is written. `midi-devices.ts` holds 19 tested device profiles. `solo-mute.ts` is complete. `encodeWav` + the `audio:export-wav` IPC channel + the preload method all exist. `getMidiMapping` exists. `electron/menu.ts` sends 18 well-named actions. In nearly every case one end of the wire is finished and the other end was never attached.

---

## Ordering — three prerequisites first

These are not features. They are defects that make *already-shipped* functionality lie. Every claimed feature below sits downstream of at least one.

| # | Prerequisite | What it currently breaks |
|---|---|---|
| **P1** | The `$:` strip corrupts the manual Run path | **The primary user action.** Ctrl+Enter on any multi-layer session plays only the final layer |
| **P2** | Widget re-registration clobbers the real `@strudel/draw` painters | **5 shipped examples throw** at runtime; `.pianoroll()`/`.punchcard()`/`.pitchwheel()` background painters are broken |
| **P3** | Three separate `AudioContext`s | **Recording a Strudel session captures silence** — which makes the recorder, and therefore Export Audio (item L), a lie before it is even wired |

**Jedi rule 4.** P1 and P2 are each a *deletion*. The temptation is to skip them because deleting code feels like it cannot be the answer to "implement the claims". It is: both features are already implemented upstream and this repo is overriding them with something worse.

---

### P1 — Delete the `$:` strip
**Verdict:** `dollar-strip` — CONFIRMED (Appendix A).

`StrudelEditor.tsx:632` and `src/lib/engines/strudel.ts:42` both do `.replace(/^\$\s*:\s*/gm, '')` before eval. `@strudel/transpiler` compiles `$: pat` into `pat.p('$')` (`transpiler.mjs:118-119,464-490`); `Pattern.prototype.p` (`core/repl.mjs:171-182`) rewrites the id to `$0`, `$1`, … and `evaluate` stacks everything in `pPatterns` (`:238-257`). Stripped, they become bare `ExpressionStatement`s and the transpiler's `addReturn` (`:196-205`) returns **only the last one** — verified by parsing both forms with acorn.

So the debounced live path (`:440`, raw doc) plays all layers and the Run path plays one. **Every session in `sessions-library.ts` uses stacked `$:`** (23 occurrences; `BETONSCHLUCHT_CODE` has four), and loading a library or MIDI example calls `handleEvaluate()` at `:215` — so the divergence fires with no keypress at all.

**Implementation:** delete the strip in both files. `processMutedLabels` (`strudel-extensions.ts:248`) must keep working on the raw text — it comments out `_$:`/`_d1:` lines, which is orthogonal.

**Falsifier:** load `BETONSCHLUCHT`, press Ctrl+Enter, assert four layers are audible — i.e. `Object.keys(pPatterns).length === 4` after evaluate. Must be RED before the fix.

**Then fix P1's dependant:** slider widgets write back to the wrong characters when `$:` is present (`slider-widget` offsets computed on stripped text: measured offset 25 vs reported `from: 22`). Removing the strip is the fix; add an offset assertion so it cannot regress.

---

### P2 — Register only the widget types you own
**Verdict:** `widget-clobber` — PARTIALLY_WRONG → mechanism confirmed, scope corrected.

`StrudelEditor.tsx:306-352` calls `registerWidget()` with six **non-underscore** names. `@strudel/codemirror`'s `registerWidget(type, fn)` (`widget.mjs:83-91`) assigns `Pattern.prototype[type]` **only when `fn` is truthy** — so exactly **three** painters are clobbered (`pianoroll`, `punchcard`, `pitchwheel`), not six; `scope`/`spiral`/`spectrum` pass no `fn` and only run `registerWidgetType`.

The genuine painters take a single options object; the wrapper takes `(id, options)`. `_pianoroll` internally calls `pat.tag(id).pianoroll({fold:1, …options, ctx, id})` → the options object lands in the `id` slot → `haps` is undefined → `haps.filter(…)` throws (`pianoroll.mjs:150`). Both packages resolve to the same `Pattern` (`vite.config.ts:22` dedupes `@strudel/core`).

**Implementation:** delete the block. `@strudel/codemirror/widget.mjs:107-137` **already registers all six underscore variants at import time**, so the `_${method}` fallback loop is dead code too. If a custom painter is genuinely wanted later, register it under a name this repo owns — never over a library prototype method.

**Also fix the side effect:** `registerWidgetType` pushes `scope`/`spiral`/`spectrum` into the transpiler's `widgetMethods`, so plain `.scope(…)`/`.spectrum(…)` in user code silently gets a widget-ID string unshifted into arg 0, shifting every option.

**Falsifier:** run the 5 examples that use `._pianoroll()` (`viz-pianoroll`, `viz-combo`, `viz-slider-pianoroll`, `test-pianoroll-inline`, `test-filter-sweep`) and assert no exception. RED before.

---

### P3 — One AudioContext (**blocks L, and makes the recorder true**)
**Verdict:** `recording-silent` — PARTIALLY_WRONG → primary claim survives verbatim, companion claim corrected.

Three contexts exist: the shared one (`src/lib/audio/context.ts:20`), superdough's own, and a third in `src/lib/midi/strudel-keys.ts:45`. **`setAudioContext` is called zero times in `src/`.** Superdough terminates at its own context's destination (`superdough/output.mjs:148`) while `AudioRecorder` taps the shared `masterGain` (`recorder.ts:20-22`) → a Strudel recording is silence.

Correction worth carrying: `setMasterVolume()` (`context.ts:61`) has **zero callers anywhere** — it is dead code, not a partially-working control. Wire it as part of this.

**Implementation:** call superdough's `setAudioContext(getSharedContext())` during init, before the first evaluate, so one context serves everything and `masterGain` becomes a real master bus. Then `strudel-keys.ts:45` should use the shared context too. Verify the four `initStrudel()` call sites (`StrudelEditor.tsx:226`, `engines/strudel.ts:29`, `ExampleGallery.tsx:82`, `useInlinePlayer.ts:47`) all end up on it — that consolidation is also the fix for the doubled-audio defect (§5.7), where pressing Play in `TransportBar` on a Strudel tab builds a *second* REPL and scheduler beside the editor's.

**Falsifier:** record 2 s of a Strudel pattern and assert the WAV is not silent (peak amplitude above a floor). RED before.

**Boy Scout, in scope:** `resetStrudelTap()` (`strudel-tap.ts:77`) nulls the analyser with **no `disconnect()`** (`grep -c disconnect` = 0) and fires 6× per Run (one sync + five `setTimeout`s at `:653-657`), orphaning 1–6 connected analysers each time. You are already in this file.

---

## The claimed features

### A. IndexedDB autosave and project list
**Claimed in:** `llms.txt:27` ("IndexedDB autosave (idb)"), `llms-full.txt:104`; `README.md:197,223` list IndexedDB as the persistence technology.
**Reality:** `openDB`, `getDb`, `saveProject`, `loadProject`, `listProjects`, `deleteProject`, `setupAutosave` — **zero consumers** outside `local.ts`. No autosave, no local project list, and no `localStorage`/`zustand-persist` substitute. (`serializeProject`/`deserializeProject` *are* live via `gist.ts`, so the file is not dead — five exports are used.)

This is the **highest-value item in the repo**, and not because of the claim: §5.25 establishes that the service worker force-reloads every open tab on update (`clients.navigate` on activate). A live-coding session is destroyed mid-set **with nothing to recover from**. Autosave is what makes that survivable.

**Implementation:** call `setupAutosave` on editor mount, debounced against the store; add a project list UI (`listProjects`/`loadProject`/`deleteProject` are ready); restore on load with an explicit prompt rather than silently.

**Required, same edit:** `deserializeProject`'s layout fallback (`local.ts:108-111`) defaults `visiblePanels` to **4** keys while `types/project.ts` and `constants.ts:33-41` define **7** — `tsc` passes only because `parsed` is `any`. Any `.lmc` or gist without a layout yields three `undefined` panel flags. Fix to `layout: parsed.layout ?? DEFAULT_LAYOUT` **before** autosave starts writing records, or you persist the bug.

**Schema discipline:** the store has no version field. Add one now, while there are zero records in the wild, plus an upgrade path in `openDB`. Doing it later means migrating real user projects.

---

### B. Node graph with draggable, connectable nodes
**Claimed in:** `README.md:59`.
**Reality:** true only for `tonejs`/`webaudio`. For `strudel` — **`DEFAULT_ENGINE`** (`constants.ts:17`) — it is a permanent empty state. So the claim is false for the engine the app opens with.

**Implementation:** derive nodes from the Strudel pattern. Two honest options — pick deliberately:
1. **Reflect the evaluated pattern** (`repl.state.pattern`) as a read-only signal-flow view. Truthful, useful, and does not pretend to be an editor.
2. **Bidirectional codegen** for a Strudel subset — matches the README wording but is a large surface with a round-trip problem (see below).

**Blocking defect either way:** the graph round-trip destroys work today. `syncGraphToCode` → `updateFileCode` → the effect at `NodeGraph.tsx:105-115` depends on `activeFile?.code` → `setNodes(blocksToNodes(...))` **regenerates the deterministic grid, wiping every user drag**; `nodesToBlocks` hardcodes `params: {}`; and `Project.graph` is **never populated** (both writers hardcode an empty graph while `NodeGraph` keeps state in component-local `useNodesState`), so node positions are lost on every save. Fix persistence and the regeneration guard first — otherwise option 2 ships a graph that erases itself.

`EngineNode`'s param block (`EngineNode.tsx:129-191`) is also inert: `blocksToNodes` never sets `blockId`/`params` so `hasParams` is always false, and its `CustomEvent('node-param-change')` (`:170`) has no listener despite a comment saying the orchestrator picks it up.

---

### C. Gist visibility toggle
**Claimed in:** `{de,en,es}.json:592` `docs.gistText` — *"Gists are public by default — make them secret if you prefer"*.
**Reality:** the code **always** creates `public: false`, with no toggle.

The shipped documentation describes a control the user does not have, and describes the default backwards. **Implement the toggle** — then the sentence becomes true and users get real choice. Default to secret (safer than what the docs claim), and correct the "public by default" half of the string in all three locales, since that half is about behaviour, not a missing feature.

---

### D. Gist token encryption notice
**Claimed in:** `{de,en,es}.json:641` `gist.rememberWarning` — tells users the token is stored **unencrypted** ("unverschlüsselt" / "sin cifrar").
**Reality:** the code AES-GCM-encrypts it. **The copy understates the protection.**

This one inverts the usual remedy: the code is ahead of the claim. But do not simply promote the copy to "encrypted" — that would overstate it. Appendix A confirms the key is created `extractable: true`, exported raw into `sessionStorage` beside the ciphertext in `localStorage`, so it defends only against an offline dump, not against XSS — in an app that **evaluates untrusted shared code by design**. And the **legacy plaintext key `lmc-gist-token-persist` is still read** (`gist.ts:95-96`) and never wiped.

**Implementation:** (1) wipe the legacy plaintext key on load — a one-line migration that removes a real exposure; (2) harden the key handling (non-extractable where the flow allows); (3) *then* write copy that is accurate about what the protection does and does not cover. Security copy must be neither pessimistic nor flattering.

---

### E. MIDI factory device profiles
**Claimed in:** `docs.midiSetup.*` — a factory CC profile is "loaded automatically".
**Reality:** `src/data/midi-devices.ts` holds **19 tested device profiles** with **no importer outside its own test**.

**Implementation:** match the connected device name on `statechange` and load its CC map. The data is done and tested; this is a lookup plus a store write.

---

### F. `midin(cc, min, max)` and the rest of the documented MIDI API
**Claimed in:** in-app docs — signature `midin(cc, min, max)`, a Learn button inside the MIDI panel, and `Ctrl+.` to stop.
**Reality:** the real signature is `midin(device) → (ccNum) => ref`; Learn lives in the USB quick-action menu; **no `Ctrl+.` binding exists anywhere**.

**Implementation:** add a `midin(cc, min, max)` overload with range mapping (genuinely more useful than the current form — raw 0-127 forces every user to write their own scaling); add the `Ctrl+.` binding; either move the Learn button into the MIDI panel or update that one sentence. In-app docs teach an API — a wrong signature is both a support burden and a claim.

**Required, same area:** MIDI Learn is **write-only** — `getMidiMapping`/`getAllMappings` (`midi-learn.ts:153-160`) have no callers and the UI hardcodes `startMidiLearn('lpf')` (`StrudelEditor.tsx:915`), so you can learn a mapping and never use it. Wire the read side and let the user pick the target parameter.

---

### G. Compose-mode Escape
**Claimed in:** the banner at `StrudelEditor.tsx:981` — "ESC to exit".
**Reality:** no `Escape` handler for compose mode exists; only the click works.

One handler. The banner has been telling users to press a key that does nothing.

---

### H. `.lmc` file association
**Claimed in:** `package.json` `build.fileAssociations` — declared to the OS, so double-clicking a `.lmc` file launches the app and nothing happens.
**Reality:** no `app.on('open-file')` (macOS), no `process.argv` scan (Windows/Linux), no `second-instance` handler, no `requestSingleInstanceLock()`.

**Implementation:** all four. Note `file:open` **is already implemented and exposed in preload** with no renderer caller — the read half of the desktop persistence loop simply was never attached. Two dead recent-file systems exist as well (`file:recent` never called; `menu.ts:76` uses `role:'recentDocuments'` while `app.addRecentDocument()` is never called) — wire one, delete the other.

---

### I. The Electron menu
**Claimed by:** the menu itself — 17 items advertise accelerators.
**Reality:** `electron/menu.ts` and `electron/tray.ts` send **18 distinct `menu:action` strings**; `preload.ts:36` exposes `onMenuAction`; **no renderer file subscribes** (only the type at `src/types/electron.d.ts:19`). So ⌘N ⌘O ⌘S ⌘⇧S ⌘E ⌘, ⌘⇧F ⌘G ⌘⇧V F1 do nothing **while still consuming the accelerator** — `CmdOrCtrl+G` shadows CodeMirror's find-next, which is live via `searchKeymap` (`editor/setup.ts:59`).

*(Correction to an earlier draft: the menu is **not** entirely inert. Fullscreen, all Edit/zoom/devtools roles and Report Issue are handled in the main process and work.)*

**Implementation:** one `onMenuAction` subscriber dispatching all 18 to existing store actions and handlers. Most targets already exist — this is a switch statement. Resolve the ⌘G conflict deliberately (drop it from the menu; CodeMirror already owns it).

---

### J. Pop-out panels
**Reality:** `electron/ipc/window.ts:66,68` loads `#/popout/<panelId>` and `src/App.tsx` has no `/popout/*` route. This never manifests today only because **nothing calls `electronAPI.popOutPanel`** — a latent bug behind a dead trigger. The menu's `popout-*` names (`editor`, `graph`, `visualizers`, `timeline`) barely overlap `ALLOWED_PANELS` (`waveform`, `spectrum`, `timeline`, `pianoroll`, `punchcard`, `spiral`, `pitchwheel`).

**Implementation:** add the `/popout/:panelId` route rendering the panel standalone, reconcile the two name sets into one shared constant, and wire the menu items. Ship it or delete the whole path — a half-built pop-out is worse than none.

---

### K. Solo / mute
**Reality:** `src/lib/audio/solo-mute.ts` is entirely unconsumed (`isMuted`, `isSoloed`, `getSoloMuteState`, `clearSoloMute`, `extractLabels`). Alt+1..9 (`StrudelEditor.tsx:461-480`) mutates a `Set` nothing reads and `console.log`s. The only working mute is the unrelated text pre-processor `processMutedLabels()`.

**Implementation:** wire the real thing — per-layer gain, driven by the label extraction that already exists.

> **The binding itself must change — measured 2026-08-16, a11y audit.** Alt+1…9 is **dead on macOS**, the primary platform: CodeMirror 6 (`index.cjs:9141`) explicitly refuses the keyCode fallback on mac+Alt, and the real event is `key:"¡"` with `defaultPrevented false`. That is 18 shortcuts (Alt and Shift+Alt) that cannot fire at all. So wiring `solo-mute.ts` to the existing handler would produce a feature that still does nothing on the machine most users are on.
>
> **And the obvious test would have hidden it:** Playwright's synthetic `Alt+1` reports a **false pass**, because it does not reproduce macOS's Option-key character substitution. Any falsifier for this item must assert on a real `keydown` event's `key` value (or use `Ctrl`-based bindings), never on a synthetic Alt chord.
>
> Pick a binding that survives macOS — `Ctrl+1…9` or a command palette entry — and verify with the real event, not the synthesised one.

---

### L. Export Audio
**Reality:** `audio:export-wav` IPC + `encodeWav` + the `exportWav` preload method all exist; **no renderer caller**. The menu's `export-audio` action is one of the 18 dead ones.

**Blocked by P3** — until Strudel audio reaches the recorder, Export Audio writes a silent WAV, which is worse than a missing menu item.

**Security, mandatory, from the audit:** `audio:export-wav` validates **nothing**. `sampleRate`/`channels`/`buffer` go straight into `encodeWav`; `Buffer.alloc(44 + n*2)` on a huge `ArrayBuffer` OOMs the **main** process, and a negative or NaN `sampleRate` throws `ERR_OUT_OF_RANGE`. Add `Number.isInteger` checks, range clamps and a byte cap **in the same commit that gives the channel its first caller** — do not ship a reachable path with an unvalidated one.

---

### M. Transport BPM must affect Strudel
**Claimed by:** the transport control's existence, on the **default engine**.
**Reality:** `TransportBar.tsx:152` → `getOrchestrator().setBpm()` → `orchestrator/index.ts:75-82` gates on `if (type === 'tonejs' …)`, so only Tone is reached. `StrudelEngine` has no tempo method. Strudel's tempo is `Cyclist.cps`, reachable via `repl.setCps`/`setCpm` — **never called from `src/`**.

**Implementation:** give `StrudelEngine` a `setBpm` that calls `repl.setCpm(bpm)` (or `setCps(bpm/60/4)` — pick one and document the bars-per-cycle assumption), and drop the `tonejs`-only gate.

**Same area:** `getLeaderBpm()` (`strudel-extensions.ts:211-214`) reads `repl?.scheduler?.bpm`, a field the Cyclist does not define — it defines `cps` — so it always falls back to a hardcoded 120. And the BroadcastChannel "clock sync" (`:158`) only `console.log`s its `sync`/`bpm` cases, while `broadcastBpm` has zero callers. Implement or remove; a sync feature that logs is not a feature.

---

### N. `gamepad(0)`
**Claimed in:** the in-app docs at `SidePanel.tsx:670`.
**Reality:** `src/lib/input/gamepad.ts` exports are never put into the eval scope, so `gamepad(0)` in user code is undefined.

**Implementation:** register via `evalScope` — and note `CLAUDE.md`'s own guidance is contested here: it says `window.X = …` "often fails", yet `midikeys`/`midin`/`sliderWithID` are wired exactly that way and work. Use whichever the surrounding code proves, and correct the guidance.

---

### O. The counts must match reality
| Claimed | Where | Real |
|---|---|---|
| "220+ examples" | `CLAUDE.md` | 219 |
| "65 patterns" | Examples page UI | 219 rendered — **`TOTAL_EXAMPLE_COUNT` bug** |
| "51 sessions" | `CLAUDE.md`, `llms.txt:40` | 49 |
| "7 documentation sections" | `CLAUDE.md` | 14 |
| "196 / 218 Dirt-Samples" | `README.md:87` / `en.json:546` | 196 base, 1745 entries |

**The UI bug first:** `example-library.ts:1086` snapshots `EXAMPLE_LIBRARY.length` **before** ~154 further entries are pushed at `:1104-1289`, so the constant is 65 while the array is 219, and `Examples.tsx:583` renders the constant. Move the `export const` to end-of-file or make it a getter — **that single fix makes the page honest and adds 154 patterns to what users believe they are getting.**

Then either add 2 sessions to reach the claimed 51, or correct the number. Same for the sample counts — decide which figure is the real one (base samples vs total entries) and use it consistently in all three places.

---

### P. Version and changelog integrity
`package.json` is `1.1.0`; the newest entry in `changelog-library.ts` is `1.0.2`, so 1.1.0 sits under `## [Unreleased]` with no release entry. `scripts/sync-changelog.ts` also emits **duplicate version headers** — the grouping loop opens a new group per entry carrying a `version`, and two entries both carry `1.0.2`, so `CHANGELOG.md` has `## [1.0.2]` twice with different dates.

Fix the grouping (group by version key), then write the 1.1.0 entry. A public changelog that skips the shipped version is a claim defect too.

---

## Gates — nothing is "done" until these pass (Jedi 12)

```bash
npx tsc --noEmit      # zero errors — required before every commit
npm run test          # 25 files / 158 tests currently green
npm run lint          # currently RED — see below
npm run build
```

**`npm run lint` is red today** (~45 errors + 10 warnings across ~16 files) and **nothing gates it**: `npm run build` runs neither lint nor tests, and `.github/` has no workflow. One of those errors is a real bug — the missing dep at `StrudelEditor.tsx:548` means the Ctrl+Enter keymap captures a `handleEvaluate` closure whose `isPlaying` never refreshes, so the trailing `if (!isPlaying) togglePlay()` can desync the transport. **You will be editing that exact function for P1.** Fix the dep array while you are there.

**Add CI in this sprint** — `.github/workflows/ci.yml` running `tsc --noEmit && vitest run && eslint .`. Without it the next sprint re-inherits a red tree. Plus the three cheap structural tests the architecture doc identifies: locale key-set parity (currently perfect — lock it in), a route-table test asserting every `NAV_ITEMS`/`BROWSE_ITEMS` target resolves to a non-404 route, and a token-lint over `src/components`.

**Test coverage is structural, not behavioural** — the three engine tests assert only `name` and constructability; there are no tests for `context.ts`, `recorder.ts`, `strudel-tap.ts`, `solo-mute.ts`, `orchestrator/index.ts`, or the IndexedDB/`.lmc` paths. Every item in this work order needs its falsifier, mutation-checked: **run it with the fix reverted and require RED first**.

## Truth-in-advertising ledger

| Claim | Ships in | True when |
|---|---|---|
| IndexedDB autosave | `llms.txt:27`, `llms-full.txt:104` | A |
| Draggable, connectable node graph | `README.md:59` | B |
| Gists secret-or-public by choice | `docs.gistText` ×3 locales | C |
| Token storage described accurately | `gist.rememberWarning` ×3 locales | D |
| Factory CC profile loads automatically | `docs.midiSetup` ×3 locales | E |
| `midin(cc,min,max)`, `Ctrl+.` | in-app docs ×3 locales | F |
| "ESC to exit" compose mode | in-app banner | G |
| `.lmc` files open the app | OS-level, via `package.json` | H |
| Menu accelerators do something | the menu itself | I |
| `gamepad(0)` | in-app docs | N |
| Example/session/doc counts | `CLAUDE.md`, `llms.txt`, UI | O |

Anything unimplemented at sprint close gets its sentence removed the same day — a claim is either true or gone, never pending.

## Deliberately out of scope

- **`AudioGraph`** (`orchestrator/graph.ts`) — a complete DAG with cycle prevention, serialize/deserialize and its own test suite, instantiated at `orchestrator/index.ts:27` and **never populated**; only `clear()` runs and `getGraph()` has no callers. Not claimed publicly anywhere. Either it becomes the real routing layer or it is deleted — a design decision, not a sprint task. `[NEEDS ARNOLD]`
- **OSC / Serial** — `@strudel/osc` and `@strudel/serial` load with no UI. OSC **cannot work on the deployed web app** at all (`netlify.toml` `connect-src` has no `ws:`, so `new WebSocket('ws://localhost:8080')` is CSP-refused) and Serial is almost certainly broken in Electron (no `select-serial-port` handler). Neither is claimed in the README or the example library, so nothing is currently false — but they are loaded dead weight. Decide: ship them properly (bridge process, docs, CSP) or drop the imports.
- **Windows/Linux auto-update** — release `v1.1.0` ships `latest-mac.yml` but no `latest.yml`/`latest-linux.yml` and no `.blockmap`, so non-mac users get 404s every 4 hours. Not a *claim* defect, but it is a shipped-product defect with no code fix — it needs a release process (and Windows signing, absent today). `[NEEDS ARNOLD]`
- **Repo-local skill filenames** — `.claude/skills/{lmc-pro,lmc-synth-ui,strudel-feature-parity}/skill.md` are lowercase. They **do** load today (this Mac's APFS volume is case-insensitive; measured 2026-08-16) but would vanish on a case-sensitive volume. One-line fix, zero risk: `git mv skill.md SKILL.md` in each.
