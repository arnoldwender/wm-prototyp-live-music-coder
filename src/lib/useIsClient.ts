// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   useIsClient — false while the build prerenders a page
   (scripts/prerender.mjs) and while the browser hydrates that
   HTML, true right after: React reads getServerSnapshot in both
   of those passes and re-renders once hydration is done.

   Lets a component keep browser-only output out of the
   prerendered HTML (the IDE on /editor, the entrance animations,
   the Legal tab picked from the URL hash) without a setState in
   an effect, which react-hooks/set-state-in-effect rejects.
   ────────────────────────────────────────────────────────── */

import { useSyncExternalStore } from 'react'

/* The value never changes after mount, so there is nothing to subscribe to */
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
