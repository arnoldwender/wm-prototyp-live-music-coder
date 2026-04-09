/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Platform detection helpers.

   `electronAPI` is only exposed by electron/preload.ts in the
   packaged desktop app, never in the web build or dev server.
   The Mac check uses the deprecated `navigator.platform` because
   it's still the most reliable cross-Electron-version signal for
   the current OS inside the renderer. All values are computed
   once at module load time — they never change within a session.
   ────────────────────────────────────────────────────────── */

/** True when running inside the packaged Electron desktop app. */
export const isElectron =
  typeof window !== 'undefined' && !!window.electronAPI

/** True when the underlying OS is macOS. */
export const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform)

/** True when the packaged app is running on macOS — the combo that
 *  needs a custom draggable title-bar strip because electron/main.ts
 *  uses `titleBarStyle: 'hiddenInset'`. */
export const isElectronMac = isElectron && isMac

/** Height of the custom title-bar drag strip, in pixels. Matches
 *  the vertical room required by macOS traffic lights plus a small
 *  margin. Exposed as a constant so `TitleBar` and global CSS stay
 *  in sync. */
export const TITLEBAR_HEIGHT = 28
