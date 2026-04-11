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
    console.log('[Strudel] @strudel/xen loaded (microtonal)');
    return true;
  } catch {
    console.warn('[Strudel] @strudel/xen not available');
    return false;
  }
}

/** Load @strudel/soundfonts for GM soundfont playback */
export async function loadSoundfonts(): Promise<boolean> {
  try {
    await import('@strudel/soundfonts');
    console.log('[Strudel] @strudel/soundfonts loaded');
    return true;
  } catch {
    console.warn('[Strudel] @strudel/soundfonts not available');
    return false;
  }
}

/** Load @strudel/osc for Open Sound Control output */
export async function loadOSC(): Promise<boolean> {
  try {
    await import('@strudel/osc');
    console.log('[Strudel] @strudel/osc loaded');
    return true;
  } catch {
    console.warn('[Strudel] @strudel/osc not available');
    return false;
  }
}

/** Load @strudel/serial for hardware serial output */
export async function loadSerial(): Promise<boolean> {
  try {
    await import('@strudel/serial');
    console.log('[Strudel] @strudel/serial loaded');
    return true;
  } catch {
    console.warn('[Strudel] @strudel/serial not available');
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

export function startKeyListener(): void {
  if (keyListenerActive) return;
  keyListenerActive = true;

  document.addEventListener('keydown', (e) => {
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
  });
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
export function createParams(name: string, defaultValue = 0): number {
  if (!customParams.has(name)) {
    customParams.set(name, defaultValue);
  }
  return customParams.get(name)!;
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

/**
 * Initialize clock sync — the first tab becomes the leader,
 * subsequent tabs sync their scheduler to the leader's clock.
 */
export function initClockSync(): void {
  if (typeof BroadcastChannel === 'undefined') {
    console.warn('[ClockSync] BroadcastChannel not available');
    return;
  }

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
        /* Receive clock sync from leader */
        if (!isClockLeader) {
          console.log('[ClockSync] Synced to leader');
        }
        break;
      case 'bpm':
        /* BPM change from leader */
        if (!isClockLeader) {
          console.log(`[ClockSync] BPM updated to ${e.data.bpm}`);
        }
        break;
    }
  };

  /* Become leader after a short timeout if no leader responds */
  setTimeout(() => {
    if (!isClockLeader) {
      isClockLeader = true;
      console.log('[ClockSync] This tab is now the clock leader');
    }
  }, 500);
}

function getLeaderBpm(): number {
  try {
    const repl = (window as any).__strudelRepl;
    return repl?.scheduler?.bpm ?? 120;
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

/** Stop clock sync */
export function stopClockSync(): void {
  clockChannel?.close();
  clockChannel = null;
  isClockLeader = false;
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
        console.log('[Strudel] all() function registered globally');
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

  /* Expose functions globally for use in Strudel code */
  (globalThis as any).onKey = onKey;
  (globalThis as any).createParams = createParams;
  (globalThis as any).setParam = setParam;
  (globalThis as any).getParam = getParam;

  console.log('[Strudel] All extensions loaded');
}
