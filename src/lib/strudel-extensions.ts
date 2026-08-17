/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Strudel extensions loader — loads optional @strudel packages
   (xen, soundfonts, osc, serial) and registers custom functions
   (onKey, createParams, all, clock sync, _$: muting) into the
   Strudel evaluation context.
   ────────────────────────────────────────────────────────── */

/* ── Package loaders ──────────────────────────────────── */

/** Load @strudel/xen for microtonal/xenharmonic support */
export async function loadXen(): Promise<boolean> {
  try {
    await import('@strudel/xen');
    import.meta.env.DEV && console.log('[Strudel] @strudel/xen loaded (microtonal)');
    return true;
  } catch {
    import.meta.env.DEV && console.warn('[Strudel] @strudel/xen not available');
    return false;
  }
}

/** Load @strudel/soundfonts for GM soundfont playback */
export async function loadSoundfonts(): Promise<boolean> {
  try {
    await import('@strudel/soundfonts');
    import.meta.env.DEV && console.log('[Strudel] @strudel/soundfonts loaded');
    return true;
  } catch {
    import.meta.env.DEV && console.warn('[Strudel] @strudel/soundfonts not available');
    return false;
  }
}

/** Load @strudel/osc for Open Sound Control output */
export async function loadOSC(): Promise<boolean> {
  try {
    await import('@strudel/osc');
    import.meta.env.DEV && console.log('[Strudel] @strudel/osc loaded');
    return true;
  } catch {
    import.meta.env.DEV && console.warn('[Strudel] @strudel/osc not available');
    return false;
  }
}

/** Load @strudel/serial for hardware serial output */
export async function loadSerial(): Promise<boolean> {
  try {
    await import('@strudel/serial');
    import.meta.env.DEV && console.log('[Strudel] @strudel/serial loaded');
    return true;
  } catch {
    import.meta.env.DEV && console.warn('[Strudel] @strudel/serial not available');
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

/** BroadcastChannel for clock sync between tabs */
let clockChannel: BroadcastChannel | null = null;
let isClockLeader = false;
/** Pending leader-election timeout — must be cancelled on cleanup */
let leaderTimeout: ReturnType<typeof setTimeout> | null = null;
/** Guards against double-initialization across HMR cycles */
let clockSyncInitialized = false;

/**
 * Initialize clock sync — the first tab becomes the leader,
 * subsequent tabs sync their scheduler to the leader's clock.
 */
export function initClockSync(): void {
  if (typeof BroadcastChannel === 'undefined') {
    import.meta.env.DEV && console.warn('[ClockSync] BroadcastChannel not available');
    return;
  }
  /* Prevent duplicate channels on HMR re-run */
  if (clockSyncInitialized) return;
  clockSyncInitialized = true;

  clockChannel = new BroadcastChannel('lmc-clock-sync');

  /* Announce presence */
  clockChannel.postMessage({ type: 'ping', timestamp: Date.now() });

  clockChannel.onmessage = (e) => {
    const { type } = e.data;
    switch (type) {
      case 'ping':
        /* Another tab appeared — if we're the leader, respond */
        if (isClockLeader) {
          clockChannel?.postMessage({
            type: 'sync',
            timestamp: Date.now(),
            bpm: getLeaderBpm(),
          });
        }
        break;
      case 'sync':
      case 'bpm':
        /* Adopt the leader's tempo. Both cases used to only log, so the feature
           elected a leader and then ignored it — README called that "BPM
           broadcast". Followers now set their own scheduler. */
        if (!isClockLeader) applyLeaderBpm(e.data.bpm);
        break;
    }
  };

  /* Become leader after a short timeout if no leader responds.
   * Store ID so stopClockSync() can cancel it before it fires. */
  leaderTimeout = setTimeout(() => {
    leaderTimeout = null;
    if (!isClockLeader) {
      isClockLeader = true;
      import.meta.env.DEV && console.log('[ClockSync] This tab is now the clock leader');
    }
  }, 500);
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
  const BARS_PER_CYCLE = 4;
  const cpm = bpm / BARS_PER_CYCLE;
  try {
    const repl = window.__strudelRepl;
    if (typeof repl?.setCpm === 'function') { repl.setCpm(cpm); return; }
    if (typeof repl?.setCps === 'function') repl.setCps(cpm / 60);
  } catch {
    /* No REPL in this tab yet — it will pick up the next broadcast. */
  }
}

function getLeaderBpm(): number {
  try {
    const repl = window.__strudelRepl;
    return (repl?.scheduler?.cps != null ? repl.scheduler.cps * 60 * 4 : undefined) ?? 120;
  } catch {
    return 120;
  }
}

/** Broadcast BPM change to other tabs */
export function broadcastBpm(bpm: number): void {
  if (isClockLeader && clockChannel) {
    clockChannel.postMessage({ type: 'bpm', bpm, timestamp: Date.now() });
  }
}

/** Stop clock sync — closes the channel, cancels pending leader election, resets all state */
export function stopClockSync(): void {
  if (leaderTimeout !== null) {
    clearTimeout(leaderTimeout);
    leaderTimeout = null;
  }
  clockChannel?.close();
  clockChannel = null;
  isClockLeader = false;
  clockSyncInitialized = false;
}

/* ── _$: label muting — mute patterns with _$: prefix ── */

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
    if (typeof (globalThis as any).all === 'function') return;

    /* Try to get it from @strudel/core */
    import('@strudel/core').then((core: any) => {
      if (typeof core.all === 'function') {
        (globalThis as any).all = core.all;
        import.meta.env.DEV && console.log('[Strudel] all() function registered globally');
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
    (globalThis as unknown as Record<string, unknown>).gamepad = (padIndex = 0) => {
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
  (globalThis as any).onKey = onKey;
  (globalThis as any).createParams = createParams;
  (globalThis as any).setParam = setParam;
  (globalThis as any).getParam = getParam;

  import.meta.env.DEV && console.log('[Strudel] All extensions loaded');
}
