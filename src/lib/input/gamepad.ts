/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Gamepad API integration — reads analog sticks, buttons,
   and triggers from connected gamepads. Values are exposed
   as reactive getters that can be polled from Strudel patterns.
   ────────────────────────────────────────────────────────── */

/** Gamepad state snapshot — updated every animation frame */
interface GamepadState {
  /** Analog sticks: [leftX, leftY, rightX, rightY] range -1..1 */
  axes: number[];
  /** Button values: 0..1 (analog triggers) or 0/1 (digital) */
  buttons: number[];
  /** Whether gamepad is connected */
  connected: boolean;
}

const gamepads: Map<number, GamepadState> = new Map();
let polling = false;
let rafId: number | null = null;

/** Poll gamepad state every frame */
function poll() {
  const pads = navigator.getGamepads();
  for (let i = 0; i < pads.length; i++) {
    const pad = pads[i];
    if (!pad) continue;
    gamepads.set(i, {
      axes: [...pad.axes],
      buttons: pad.buttons.map((b) => b.value),
      connected: pad.connected,
    });
  }
  if (polling) rafId = requestAnimationFrame(poll);
}

/** Start polling gamepads — call once on init */
export function startGamepadPolling(): void {
  if (polling) return;
  polling = true;
  rafId = requestAnimationFrame(poll);

  /* Listen for connect/disconnect events */
  window.addEventListener('gamepadconnected', (e) => {
    console.log(`[Gamepad] Connected: ${(e as GamepadEvent).gamepad.id}`);
  });
  window.addEventListener('gamepaddisconnected', (e) => {
    const idx = (e as GamepadEvent).gamepad.index;
    gamepads.delete(idx);
    console.log(`[Gamepad] Disconnected: ${(e as GamepadEvent).gamepad.id}`);
  });
}

/** Stop polling */
export function stopGamepadPolling(): void {
  polling = false;
  if (rafId !== null) cancelAnimationFrame(rafId);
}

/** Get a specific axis value (0-based) for gamepad index */
export function getAxis(padIndex: number, axisIndex: number): number {
  return gamepads.get(padIndex)?.axes[axisIndex] ?? 0;
}

/** Get a button value (0-1) for gamepad index */
export function getButton(padIndex: number, buttonIndex: number): number {
  return gamepads.get(padIndex)?.buttons[buttonIndex] ?? 0;
}

/** Get left stick X (-1..1) */
export function getLeftX(padIndex = 0): number { return getAxis(padIndex, 0); }
/** Get left stick Y (-1..1) */
export function getLeftY(padIndex = 0): number { return getAxis(padIndex, 1); }
/** Get right stick X (-1..1) */
export function getRightX(padIndex = 0): number { return getAxis(padIndex, 2); }
/** Get right stick Y (-1..1) */
export function getRightY(padIndex = 0): number { return getAxis(padIndex, 3); }

/** Get left trigger (0..1) — typically button index 6 */
export function getLeftTrigger(padIndex = 0): number { return getButton(padIndex, 6); }
/** Get right trigger (0..1) — typically button index 7 */
export function getRightTrigger(padIndex = 0): number { return getButton(padIndex, 7); }

/** Check if any gamepad is connected */
export function isGamepadConnected(): boolean {
  return [...gamepads.values()].some((g) => g.connected);
}

/** Get all connected gamepad indices */
export function getConnectedGamepads(): number[] {
  return [...gamepads.entries()].filter(([, g]) => g.connected).map(([i]) => i);
}
