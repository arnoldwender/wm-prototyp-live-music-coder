/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   useScrollablePage — opts the current page out of the global
   `body { overflow: hidden; height: 100vh }` rule that keeps
   the editor locked to the viewport.

   Most pages (Landing, Samples, Examples, Sessions, Docs,
   Legal) are long-form scrollable layouts and need normal
   page-level scrolling. They call this hook on mount so the
   body can overflow again; unmount restores the locked state
   so the Editor route stays full-bleed when the user navigates
   back to it.

   Implemented as a hook (not a shared layout component) so the
   existing page shells — which each inline their own <nav> —
   don't need a restructure.
   ────────────────────────────────────────────────────────── */

import { useEffect } from 'react'

export function useScrollablePage(): void {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevHeight = document.body.style.height
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.height = prevHeight
    }
  }, [])
}
