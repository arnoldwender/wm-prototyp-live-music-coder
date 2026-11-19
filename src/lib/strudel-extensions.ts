/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Strudel extensions loader — loads optional @strudel packages
   (xen, soundfonts, osc, serial) and registers custom functions
   (onKey, createParams, all, clock sync, _$: muting) into the
   Strudel evaluation context.
   ────────────────────────────────────────────────────────── */

/* The scope Strudel's REPL evaluates against. Its `Function()` context resolves
   free identifiers off globalThis, so "registering a helper" means assigning a
   property here. One typed view of that object keeps every registration below
   free of per-assignment casts. */
const evalScopeGlobal = globalThis as unknown as Record<string, unknown>;

/* ── Package loaders ──────────────────────────────────── */

/** Load @strudel/xen for microtonal/xenharmonic support */
export async function loadXen(): Promise<boolean> {
  try {
    await import('@strudel/xen');
    if (import.meta.env.DEV) console.log('[Strudel] @strudel/xen loaded (microtonal)');
    return true;
  } catch {
    if (import.meta.env.DEV) console.warn('[Strudel] @strudel/xen not available');
    return false;
  }
}

/** Load first-party FluidR3_GM SoundFonts (125 GM voices via /soundfonts/*) */
export async function loadSoundfonts(): Promise<boolean> {
  try {
    const { registerFluidSoundfonts } = await import('./audio/fluidSoundfonts');
    await registerFluidSoundfonts();
    if (import.meta.env.DEV) console.log('[Strudel] FluidR3_GM soundfonts registered (125 voices)');
    return true;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[Strudel] FluidR3_GM soundfonts not available:', err);
    return false;
  }
}

/** Load @strudel/osc for Open Sound Control output */
export async function loadOSC(): Promise<boolean> {
  try {
    await import('@strudel/osc');
    if (import.meta.env.DEV) console.log('[Strudel] @strudel/osc loaded');
    return true;
  } catch {
    if (import.meta.env.DEV) console.warn('[Strudel] @strudel/osc not available');
    return false;
  }
}

/** Load @strudel/serial for hardware serial output */
export async function loadSerial(): Promise<boolean> {
  try {
    await import('@strudel/serial');
    if (import.meta.env.DEV) console.log('[Strudel] @strudel/serial loaded');
    return true;
  } catch {
    if (import.meta.env.DEV) console.warn('[Strudel] @strudel/serial not available');
    return false;
  }
}

/* ── onKey() — custom keyboard commands in code ──────── */

/** Registry of key → callback bindings set by user code via onKey() */
const keyBindings = new Map<string, () => void>();

/**
 * Register a keyboard shortcut from within Strudel code.
 * Usage in editor: `onKey('a', () => console.log('pressed a'))`
 */
export function onKey(key: string, callback: () => void): void {
  keyBindings.set(key.toLowerCase(), callback);
}

/** Global key listener — dispatches to registered onKey bindings */
let keyListenerActive = false;
/** Stored reference so the same function can be passed to removeEventListener */
let keyHandler: ((e: KeyboardEvent) => void) | null = null;

export function startKeyListener(): void {
  if (keyListenerActive) return;
  keyListenerActive = true;

  keyHandler = (e: KeyboardEvent) => {
    /* Only fire if not typing in an input/textarea */
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    /* Skip if CodeMirror content is focused (let CM handle it) */
    if (target.classList.contains('cm-content')) return;

    const handler = keyBindings.get(e.key.toLowerCase());
    if (handler) {
      e.preventDefault();
      handler();
    }
  };

  document.addEventListener('keydown', keyHandler);
}

/** Remove the keydown listener and reset state — safe to call multiple times */
export function stopKeyListener(): void {
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
    keyHandler = null;
  }
  keyListenerActive = false;
}

/** Clear all key bindings — called on code re-evaluation */
export function clearKeyBindings(): void {
  keyBindings.clear();
}

/* ── createParams() — custom named control parameters ── */

/** Named parameter store — maps name → value */
const customParams = new Map<string, number>();

/**
 * Create a named parameter accessible from patterns.
 * Usage: `createParams('cutoff', 1000)` then use `param('cutoff')` in patterns.
 */
/* Strudel's ref() primitive, captured when the extensions load.
   ref(accessor) builds a pattern that calls the accessor at QUERY time, which is
   what makes a parameter live. Held in a module variable because createParams is
   synchronous — user code calls it inside an evaluated pattern and cannot await. */
let strudelRef: ((accessor: () => unknown) => unknown) | null = null;

/**
 * Create a named parameter.
 *
 * Returns a Strudel ref, not a number. It used to return
 * `customParams.get(name)` — a plain snapshot taken at evaluation time — so
 * setParam() changed a Map that the already-evaluated pattern never read again.
 * The shipped documentation said "Change them with setParam() or via MIDI CC
 * mapping"; neither did anything until the user re-evaluated.
 *
 * With ref() the accessor runs on every query, so setParam and a MIDI CC land on
 * a running pattern. Falls back to the number when ref is unavailable (extensions
 * not loaded yet), which preserves the old behaviour rather than throwing.
 */
export function createParams(name: string, defaultValue = 0): unknown {
  if (!customParams.has(name)) {
    customParams.set(name, defaultValue);
  }
  if (!strudelRef) return customParams.get(name)!;
  return strudelRef(() => customParams.get(name) ?? defaultValue);
}

/** Names of every parameter created this session, for the MIDI Learn target picker. */
export function listParamNames(): string[] {
  return [...customParams.keys()];
}

/** Read the current value of a named parameter as a plain number. */
export function getParamValue(name: string): number | undefined {
  return customParams.get(name);
}

/** Set a parameter value (called from UI controls or MIDI mapping) */
export function setParam(name: string, value: number): void {
  customParams.set(name, value);
}

/** Get a parameter value */
export function getParam(name: string): number {
  return customParams.get(name) ?? 0;
}

/** Get all parameter names and values */
export function getAllParams(): Map<string, number> {
  return new Map(customParams);
}

/* ── Clock sync — multi-window/tab synchronization ───── */

const CLOCK_CHANNEL_NAME = 'lmc-clock-sync';
const LEADER_ELECTION_MS = 500;
const HEARTBEAT_MS = 2000;
const BARS_PER_CYCLE = 4;

/** BroadcastChannel for clock sync between tabs */
let clockChannel: BroadcastChannel | null = null;
let isClockLeader = false;
/** Pending leader-election timeout — must be cancelled on cleanup */
let leaderTimeout: ReturnType<typeof setTimeout> | null = null;
/** Periodic phase + tempo heartbeat when this tab is leader */
let leaderHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
let pageHideHandler: (() => void) | null = null;
/** Guards against double-initialization across HMR cycles */
let clockSyncInitialized = false;

function epochNowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.timeOrigin === 'number') {
    return performance.timeOrigin + performance.now();
  }
  return Date.now();
}

function getLeaderCps(): number {
  try {
    const cps = window.__strudelRepl?.scheduler?.cps;
    return typeof cps === 'number' && Number.isFinite(cps) && cps > 0 ? cps : 0.5;
  } catch {
    return 0.5;
  }
}

function getLeaderCycle(): number {
  try {
    const now = window.__strudelRepl?.scheduler?.now?.();
    return typeof now === 'number' && Number.isFinite(now) ? now : 0;
  } catch {
    return 0;
  }
}

/**
 * Compute a monotonically non-decreasing `scheduler.lastEnd` that aligns a follower
 * tab's fractional cycle phase to the leader's phase within ~1% of a cycle.
 * Returns `null` when inputs are invalid or phase is already aligned.
 */
export function computePhaseAlignedLastEnd(
  currentLastEnd: number,
  currentCycle: number,
  leaderCycle: number,
  cps: number,
  elapsedMs: number,
): number | null {
  if (
    !Number.isFinite(currentCycle) ||
    !Number.isFinite(leaderCycle) ||
    !Number.isFinite(cps) ||
    cps <= 0 ||
    !Number.isFinite(elapsedMs)
  ) {
    return null;
  }
  const safeElapsedSec = Math.max(0, elapsedMs) / 1000;
  const targetCycle = leaderCycle + safeElapsedSec * cps;
  const diff = (((targetCycle - currentCycle) % 1) + 1) % 1;
  if (diff <= 0.01 || diff >= 0.99) return null;

  const base = Number.isFinite(currentLastEnd)
    ? Math.max(currentLastEnd, currentCycle)
    : currentCycle;
  return base + diff;
}

function buildClockPayload(
  type: 'sync' | 'bpm' | 'transport',
  bpmOverride?: number,
  started?: boolean,
) {
  const bpm =
    typeof bpmOverride === 'number' && Number.isFinite(bpmOverride) && bpmOverride > 0
      ? bpmOverride
      : getLeaderBpm();
  const cps = typeof bpmOverride === 'number' && bpmOverride > 0 ? bpm / (60 * BARS_PER_CYCLE) : getLeaderCps();
  return {
    type,
    bpm,
    cps,
    cycle: getLeaderCycle(),
    sentAtMs: epochNowMs(),
    ...(typeof started === 'boolean' ? { started } : {}),
  };
}

function promoteToLeader(): void {
  if (isClockLeader) return;
  isClockLeader = true;
  if (import.meta.env.DEV) console.log('[ClockSync] This tab is now the clock leader');
  clockChannel?.postMessage(buildClockPayload('sync'));
  if (leaderHeartbeatTimer === null) {
    leaderHeartbeatTimer = setInterval(() => {
      if (isClockLeader && clockChannel) {
        clockChannel.postMessage(buildClockPayload('sync'));
      }
    }, HEARTBEAT_MS);
  }
}

function scheduleElection(delayMs = LEADER_ELECTION_MS): void {
  if (leaderTimeout !== null || isClockLeader) return;
  leaderTimeout = setTimeout(() => {
    leaderTimeout = null;
    promoteToLeader();
  }, delayMs);
}

/**
 * Initialize clock sync — the first tab becomes the leader,
 * subsequent tabs sync tempo, cycle phase, and transport stop to the leader.
 */
export function initClockSync(): void {
  if (typeof BroadcastChannel === 'undefined') {
    if (import.meta.env.DEV) console.warn('[ClockSync] BroadcastChannel not available');
    return;
  }
  /* Prevent duplicate channels on HMR re-run */
  if (clockSyncInitialized) return;
  clockSyncInitialized = true;

  clockChannel = new BroadcastChannel(CLOCK_CHANNEL_NAME);

  /* Announce presence */
  clockChannel.postMessage({ type: 'ping', sentAtMs: epochNowMs() });

  clockChannel.onmessage = (e) => {
    const data = (e.data ?? {}) as Record<string, unknown>;
    switch (data.type) {
      case 'ping':
        /* Another tab appeared — if we're the leader, send tempo + current cycle phase */
        if (isClockLeader) {
          clockChannel?.postMessage(buildClockPayload('sync'));
        }
        break;
      case 'sync':
      case 'bpm':
      case 'transport':
        /* Another leader answered; cancel pending election and follow its clock */
        if (leaderTimeout !== null) {
          clearTimeout(leaderTimeout);
          leaderTimeout = null;
        }
        if (!isClockLeader) {
          applyLeaderBpm(data.bpm);
          if (data.type === 'transport' && data.started === false) {
            try { window.__strudelRepl?.stop?.(); } catch { /* ignore */ }
          } else {
            applyLeaderPhase(data.cycle, data.cps, data.sentAtMs);
          }
        }
        break;
      case 'leader-resign':
        if (!isClockLeader) {
          clockChannel?.postMessage({ type: 'ping', sentAtMs: epochNowMs() });
          scheduleElection(LEADER_ELECTION_MS);
        }
        break;
    }
  };

  if (typeof window !== 'undefined') {
    pageHideHandler = () => {
      if (isClockLeader && clockChannel) {
        try { clockChannel.postMessage({ type: 'leader-resign', sentAtMs: epochNowMs() }); } catch { /* ignore */ }
      }
    };
    window.addEventListener('pagehide', pageHideHandler);
  }

  /* Become leader after a short timeout if no leader responds. */
  scheduleElection(LEADER_ELECTION_MS);
}

/**
 * Set this tab's Strudel tempo from a leader broadcast.
 *
 * Strudel is cycle-based: setcpm(140/4) is 140 bpm in 4/4, so cpm = bpm / 4.
 * BARS_PER_CYCLE is named here for the same reason it is named in
 * src/lib/engines/strudel.ts — it is an assumption, not a constant of nature.
 */
function applyLeaderBpm(bpm: unknown): void {
  if (typeof bpm !== 'number' || !Number.isFinite(bpm) || bpm <= 0) return;
  const cpm = bpm / BARS_PER_CYCLE;
  try {
    const repl = window.__strudelRepl;
    if (typeof repl?.setCpm === 'function') { repl.setCpm(cpm); return; }
    if (typeof repl?.setCps === 'function') repl.setCps(cpm / 60);
  } catch {
    /* No REPL in this tab yet — it will pick up the next broadcast. */
  }
}

function applyLeaderPhase(leaderCycle: unknown, leaderCps: unknown, sentAtMs: unknown): void {
  if (typeof leaderCycle !== 'number' || typeof sentAtMs !== 'number') return;
  try {
    const scheduler = window.__strudelRepl?.scheduler;
    if (!scheduler || typeof scheduler.now !== 'function') return;
    const currentCycle = scheduler.now();
    const cps =
      typeof leaderCps === 'number' && Number.isFinite(leaderCps) && leaderCps > 0
        ? leaderCps
        : typeof scheduler.cps === 'number' && scheduler.cps > 0
          ? scheduler.cps
          : 0.5;
    const currentLastEnd = typeof scheduler.lastEnd === 'number' ? scheduler.lastEnd : currentCycle;
    const nextLastEnd = computePhaseAlignedLastEnd(
      currentLastEnd,
      currentCycle,
      leaderCycle,
      cps,
      epochNowMs() - sentAtMs,
    );
    if (nextLastEnd !== null) {
      scheduler.lastEnd = nextLastEnd;
      scheduler.num_ticks_since_cps_change = 0;
    }
  } catch {
    /* No running scheduler in this tab yet */
  }
}

function getLeaderBpm(): number {
  try {
    const repl = window.__strudelRepl;
    return (repl?.scheduler?.cps != null ? repl.scheduler.cps * 60 * BARS_PER_CYCLE : undefined) ?? 120;
  } catch {
    return 120;
  }
}

/** Broadcast BPM + cycle phase change to other tabs */
export function broadcastBpm(bpm: number): void {
  if (isClockLeader && clockChannel) {
    clockChannel.postMessage(buildClockPayload('bpm', bpm));
  }
}

/** Broadcast play/stop transport transitions from the leader tab to followers */
export function broadcastTransport(started: boolean): void {
  if (isClockLeader && clockChannel) {
    clockChannel.postMessage(buildClockPayload('transport', undefined, started));
  }
}

/** Stop clock sync — resigns leadership, closes channel, cancels timers, resets state */
export function stopClockSync(): void {
  if (leaderTimeout !== null) {
    clearTimeout(leaderTimeout);
    leaderTimeout = null;
  }
  if (leaderHeartbeatTimer !== null) {
    clearInterval(leaderHeartbeatTimer);
    leaderHeartbeatTimer = null;
  }
  if (typeof window !== 'undefined' && pageHideHandler) {
    window.removeEventListener('pagehide', pageHideHandler);
    pageHideHandler = null;
  }
  if (isClockLeader && clockChannel) {
    try { clockChannel.postMessage({ type: 'leader-resign', sentAtMs: epochNowMs() }); } catch { /* ignore */ }
  }
  clockChannel?.close();
  clockChannel = null;
  isClockLeader = false;
  clockSyncInitialized = false;
}

/* ── _$: label muting — mute patterns with _$: prefix ── */

function toSingleQuotedLiteral(rawContent: string): string {
  const unescapedQuotes = rawContent.replace(/\\"/g, '"');
  return `'${unescapedQuotes.replace(/'/g, "\\'")}'`;
}

function readDoubleQuotedAt(src: string, idx: number): { content: string; nextIdx: number } | null {
  if (src[idx] !== '"') return null;
  let i = idx + 1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === '\n' || ch === '\r') return null;
    if (ch === '"') {
      return { content: src.slice(idx + 1, i), nextIdx: i + 1 };
    }
    i++;
  }
  return null;
}

const PURE_JS_FIRST_ARG_HELPERS = new Set(['createParams', 'getParam', 'setParam', 'onKey']);

/**
 * Convert double-quoted JS string arguments inside helper calls that expect
 * raw strings rather than Strudel mini-notation (`samples("https://...")`,
 * `createParams("name", ...)`, `getParam("name")`, `setParam("name", v)`,
 * `onKey("a", fn)`), leaving comments and pattern strings (`note("...")`,
 * `s("...")`) untouched.
 */
export function normalizeStrudelHelperQuotes(code: string): string {
  let out = '';
  let i = 0;

  while (i < code.length) {
    const ch = code[i];

    // Preserve line comments verbatim
    if (ch === '/' && code[i + 1] === '/') {
      const nl = code.indexOf('\n', i);
      const end = nl === -1 ? code.length : nl + 1;
      out += code.slice(i, end);
      i = end;
      continue;
    }

    // Preserve block comments verbatim
    if (ch === '/' && code[i + 1] === '*') {
      const close = code.indexOf('*/', i + 2);
      const end = close === -1 ? code.length : close + 2;
      out += code.slice(i, end);
      i = end;
      continue;
    }

    // Skip string/template literals outside targeted helper call heads
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === quote) {
          j++;
          break;
        }
        j++;
      }
      out += code.slice(i, j);
      i = j;
      continue;
    }

    // Match standalone helper identifier calls (not property accesses like `.samples(`)
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < code.length && /[A-Za-z0-9_]/.test(code[j])) j++;
      const ident = code.slice(i, j);
      const prevChar = i > 0 ? code[i - 1] : '';
      const isCallBoundary = !prevChar || !/[A-Za-z0-9_$.]/.test(prevChar);

      if (isCallBoundary && (ident === 'samples' || PURE_JS_FIRST_ARG_HELPERS.has(ident))) {
        let k = j;
        while (k < code.length && /\s/.test(code[k])) k++;
        if (code[k] === '(') {
          let argStart = k + 1;
          while (argStart < code.length && /\s/.test(code[argStart])) argStart++;
          const first = readDoubleQuotedAt(code, argStart);
          if (first) {
            if (ident === 'samples') {
              if (/[/:]|\.json\b/i.test(first.content)) {
                out += code.slice(i, argStart) + toSingleQuotedLiteral(first.content);
                const afterFirst = first.nextIdx;
                let commaScan = afterFirst;
                while (commaScan < code.length && /\s/.test(code[commaScan])) commaScan++;
                if (code[commaScan] === ',') {
                  let secondStart = commaScan + 1;
                  while (secondStart < code.length && /\s/.test(code[secondStart])) secondStart++;
                  const second = readDoubleQuotedAt(code, secondStart);
                  if (second && /[/:]/.test(second.content)) {
                    out += code.slice(afterFirst, secondStart) + toSingleQuotedLiteral(second.content);
                    i = second.nextIdx;
                    continue;
                  }
                }
                i = afterFirst;
                continue;
              }
            } else {
              out += code.slice(i, argStart) + toSingleQuotedLiteral(first.content);
              i = first.nextIdx;
              continue;
            }
          }
        }
      }

      out += ident;
      i = j;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

/** Pre-process Strudel code consistently across live eval, manual run, and engine calls. */
export function prepareStrudelCode(code: string): string {
  return processMutedLabels(normalizeStrudelHelperQuotes(code));
}

const CSP_NETWORK_ERR_RX = /failed to fetch|networkerror|load failed|content security policy/i;

/** Turn generic fetch/CSP runtime errors into actionable guidance for the IDE ErrorBar. */
export function formatStrudelEvalError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (CSP_NETWORK_ERR_RX.test(message)) {
    return `${message} — External sample hosts are blocked by browser CSP/privacy policy. Use built-in Dirt-Samples, gm_* SoundFonts (e.g. .s("gm_piano")), or drop local audio files into the Samples panel.`;
  }
  return message;
}

/**
 * Process code to handle _$: prefix muting.
 * Lines starting with `_$:` or `_d1:` etc. are commented out
 * before evaluation, effectively muting those patterns.
 *
 * This is a pre-processor that runs before Strudel's transpiler.
 */
export function processMutedLabels(code: string): string {
  return code.replace(/^(\s*)_(\$|d\d+)\s*:/gm, '$1// [muted] $2:');
}

/* ── all() — apply a transform to all active patterns ── */

/**
 * Wraps the all() function — applies a transformation to
 * every currently active pattern.
 *
 * Note: This is already provided by @strudel/core in recent versions.
 * This wrapper ensures it's available even if the version is older.
 */
export function ensureAllFunction(): void {
  try {
    /* Check if `all` is already globally available */
    if (typeof evalScopeGlobal.all === 'function') return;

    /* Try to get it from @strudel/core */
    import('@strudel/core').then((core) => {
      if (typeof core.all === 'function') {
        evalScopeGlobal.all = core.all;
        if (import.meta.env.DEV) console.log('[Strudel] all() function registered globally');
      }
    }).catch(() => {});
  } catch {
    /* Not available */
  }
}

/* ── Master loader — loads everything ────────────────── */

/**
 * Load all optional Strudel extensions.
 * Called from StrudelEditor during initialization.
 */
export async function loadAllExtensions(): Promise<void> {
  /* Load optional packages in parallel */
  await Promise.allSettled([
    loadXen(),
    loadSoundfonts(),
    loadOSC(),
    loadSerial(),
  ]);

  /* Register custom functions */
  startKeyListener();
  ensureAllFunction();
  initClockSync();

  /* gamepad(padIndex) — documented in the in-app API reference
     (SidePanel.tsx) since before anything registered it, so typing gamepad(0)
     in a pattern threw ReferenceError. src/lib/input/gamepad.ts had the readers
     all along; only the eval-scope binding was missing.

     Returns a live accessor rather than a snapshot: a pattern reads it every
     cycle, so frozen numbers would be useless. Polling starts on first use, so
     a user who never touches a gamepad pays no rAF loop. Loaded dynamically to
     match how every other optional extension in this file is wired. */
  try {
    const gp = await import('./input/gamepad');
    evalScopeGlobal.gamepad = (padIndex = 0) => {
      gp.startGamepadPolling();
      return {
        get x() { return gp.getLeftX(padIndex); },
        get y() { return gp.getLeftY(padIndex); },
        get rx() { return gp.getRightX(padIndex); },
        get ry() { return gp.getRightY(padIndex); },
        get l2() { return gp.getLeftTrigger(padIndex); },
        get r2() { return gp.getRightTrigger(padIndex); },
        axis: (i: number) => gp.getAxis(padIndex, i),
        button: (i: number) => gp.getButton(padIndex, i),
      };
    };
  } catch {
    /* Gamepad API unavailable — gamepad() stays undefined, same as before. */
  }

  /* Apply learned MIDI CC mappings to named parameters.
   *
   * midi-learn stored a paramName -> ccNumber map that NOTHING read: getMidiMapping
   * and getAllMappings had no consumers, so a user could complete the Learn flow
   * and the knob still controlled nothing. The shipped docs said parameters are
   * changeable "via MIDI CC mapping"; this is the half that was missing.
   *
   * Listening on the same lmc-midi-cc event the synth panel uses keeps one source
   * of CC truth. Values arrive normalised 0-1; setParam stores them, and because
   * createParams now returns a ref the running pattern picks them up on its next
   * query without re-evaluation. */
  if (typeof window !== 'undefined') {
    window.addEventListener('lmc-midi-cc', (event) => {
      const { cc, value } = (event as CustomEvent<{ cc: number; value: number }>).detail;
      void import('./midi/midi-learn').then(({ getAllMappings }) => {
        for (const [paramName, mappedCc] of Object.entries(getAllMappings())) {
          if (mappedCc === cc) setParam(paramName, value);
        }
      }).catch(() => { /* midi-learn unavailable — CC still reaches the synth panel */ });
    });
  }

  /* Capture ref() so createParams can return a live parameter rather than a
     snapshot. Imported from @strudel/web because that is what the shipped REPL
     resolves; @strudel/core cannot be imported directly here. */
  try {
    const core = await import('@strudel/web') as unknown as {
      ref?: (accessor: () => unknown) => unknown
    };
    if (typeof core.ref === 'function') strudelRef = core.ref;
  } catch {
    /* ref unavailable — createParams keeps returning a number, as before. */
  }

  /* Expose functions globally for use in Strudel code */
  evalScopeGlobal.onKey = onKey;
  evalScopeGlobal.createParams = createParams;
  evalScopeGlobal.setParam = setParam;
  evalScopeGlobal.getParam = getParam;

  if (import.meta.env.DEV) console.log('[Strudel] All extensions loaded');
}
