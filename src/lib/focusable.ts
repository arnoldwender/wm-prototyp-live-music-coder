/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   What a dialog's focus trap may land on.

   Disabled controls are excluded on purpose. A trap wraps Tab when focus sits
   on the LAST focusable element; if that element is a disabled button, focus
   can never be there, the wrap never fires, and Tab walks out of the dialog
   into the page behind it — after which the dialog's own Escape handler no
   longer hears the key. The Gist dialog shipped that way: its last two
   buttons are disabled until a token or a Gist URL is typed. */

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')
