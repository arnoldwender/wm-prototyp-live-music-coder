/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SettingsPanel — modal overlay for editor preferences:
   theme, font size, vim mode, zen mode. Persists to localStorage.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EDITOR_THEMES } from '../../lib/editor/themes';
import { useAppStore } from '../../lib/store';

/* ── Settings type ────────────────────────────────────── */

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

/* ── Component ────────────────────────────────────────── */

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  /** Called when settings change — parent re-creates editor with new config */
  onSettingsChange?: (settings: EditorSettings) => void;
}

export function SettingsPanel({ open, onClose, onSettingsChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState<EditorSettings>(loadSettings);
  const setEditorTheme = useAppStore((s) => s.setEditorTheme);
  const setVimMode = useAppStore((s) => s.setVimMode);

  /* Persist on change and sync to Zustand store for reactive CM6 reconfiguration */
  useEffect(() => {
    saveSettings(settings);
    setEditorTheme(settings.themeId);
    setVimMode(settings.vimMode);
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange, setEditorTheme, setVimMode]);

  if (!open) return null;

  const update = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        style={{
          width: '420px',
          maxHeight: '80vh',
          backgroundColor: 'var(--color-bg-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg, 12px)',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Sections */}
        <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Theme */}
          <SettingRow label="Theme">
            <select
              value={settings.themeId}
              onChange={(e) => update('themeId', e.target.value)}
              style={selectStyle}
            >
              {EDITOR_THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </SettingRow>

          {/* Font size */}
          <SettingRow label="Font Size">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="range"
                min={10}
                max={22}
                step={1}
                value={settings.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
                style={{ width: '120px' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)', minWidth: '30px' }}>
                {settings.fontSize}px
              </span>
            </div>
          </SettingRow>

          {/* Toggles */}
          <SettingRow label="Line Numbers">
            <Toggle checked={settings.lineNumbers} onChange={(v) => update('lineNumbers', v)} />
          </SettingRow>

          <SettingRow label="Word Wrap">
            <Toggle checked={settings.wordWrap} onChange={(v) => update('wordWrap', v)} />
          </SettingRow>

          <SettingRow label="Vim Mode">
            <Toggle checked={settings.vimMode} onChange={(v) => update('vimMode', v)} />
          </SettingRow>

          <SettingRow label="Zen Mode">
            <Toggle checked={settings.zenMode} onChange={(v) => update('zenMode', v)} />
          </SettingRow>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--color-border)',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          Settings are saved automatically
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────── */

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-bg-hover)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'var(--transition-fast)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '18px' : '2px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          transition: 'var(--transition-fast)',
        }}
      />
    </button>
  );
}

const selectStyle: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: 'var(--font-family-sans)',
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-3)',
  cursor: 'pointer',
  outline: 'none',
};
