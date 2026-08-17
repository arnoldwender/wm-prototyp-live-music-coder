/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Editor preferences — shape, defaults and localStorage I/O.

   Kept out of SettingsPanel.tsx so that file exports nothing but
   the component: a module that mixes components with plain
   functions loses React Fast Refresh, and every edit to the
   panel would full-reload the page instead of hot-swapping it.
   ────────────────────────────────────────────────────────── */

export interface EditorSettings {
  themeId: string;
  fontSize: number;
  vimMode: boolean;
  zenMode: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
}

const STORAGE_KEY = 'lmc-editor-settings';

const DEFAULT_SETTINGS: EditorSettings = {
  themeId: 'purple',
  fontSize: 14,
  vimMode: false,
  zenMode: false,
  lineNumbers: true,
  wordWrap: false,
};

/** Load settings from localStorage */
export function loadSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* corrupted storage */ }
  return { ...DEFAULT_SETTINGS };
}

/** Save settings to localStorage */
export function saveSettings(settings: EditorSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
