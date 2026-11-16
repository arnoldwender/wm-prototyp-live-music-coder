/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SettingsPanel — modal overlay for editor preferences:
   theme, font size, vim mode, zen mode. Persists to localStorage.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { EDITOR_THEMES } from '../../lib/editor/themes';
import { useAppStore } from '../../lib/store';
import { loadSettings, saveSettings, type EditorSettings } from '../../lib/editor/settings';
import { FOCUSABLE_SELECTOR } from '../../lib/focusable'

/* ── Component ────────────────────────────────────────── */

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  /** Called when settings change — parent re-creates editor with new config */
  onSettingsChange?: (settings: EditorSettings) => void;
}

export function SettingsPanel({ open, onClose, onSettingsChange }: SettingsPanelProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<EditorSettings>(loadSettings);
  const setEditorTheme = useAppStore((s) => s.setEditorTheme);
  const setVimMode = useAppStore((s) => s.setVimMode);
  const backdropRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /* Persist on change and sync to Zustand store for reactive CM6 reconfiguration */
  useEffect(() => {
    saveSettings(settings);
    setEditorTheme(settings.themeId);
    setVimMode(settings.vimMode);
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange, setEditorTheme, setVimMode]);

  /* Focus trap entry + focus restoration on close */
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const container = backdropRef.current;
    if (container) {
      const focusable = container.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );
      if (focusable.length > 0) focusable[0].focus();
    }
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const container = backdropRef.current;
    if (!container) return;
    const focusable = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [onClose]);

  if (!open) return null;

  const update = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  return (
    /* Backdrop */
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-backdrop)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        style={{
          width: 'calc(100% - var(--space-8))',
          maxWidth: '420px',
          maxHeight: '80vh',
          backgroundColor: 'var(--color-bg-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
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
          <h2 id="settings-dialog-title" style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            {t('settingsModal.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('settingsModal.close')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'var(--space-11)',
              height: 'var(--space-11)',
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
          <SettingRow label={t('settingsModal.theme')}>
            <select
              aria-label={t('settingsModal.theme')}
              value={settings.themeId}
              onChange={(e) => update('themeId', e.target.value)}
              style={selectStyle}
            >
              {EDITOR_THEMES.map((th) => (
                <option key={th.id} value={th.id}>{th.name}</option>
              ))}
            </select>
          </SettingRow>

          {/* Font size */}
          <SettingRow label={t('settingsModal.fontSize')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="range"
                min={10}
                max={22}
                step={1}
                value={settings.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
                aria-label={t('settingsModal.fontSize')}
                style={{ width: '120px' }}
              />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)', minWidth: 'var(--space-12)' }}>
                {settings.fontSize}px
              </span>
            </div>
          </SettingRow>

          {/* Toggles */}
          <SettingRow label={t('settingsModal.lineNumbers')}>
            <Toggle aria-label={t('settingsModal.lineNumbers')} checked={settings.lineNumbers} onChange={(v) => update('lineNumbers', v)} />
          </SettingRow>

          <SettingRow label={t('settingsModal.wordWrap')}>
            <Toggle aria-label={t('settingsModal.wordWrap')} checked={settings.wordWrap} onChange={(v) => update('wordWrap', v)} />
          </SettingRow>

          <SettingRow label={t('settingsModal.vimMode')}>
            <Toggle aria-label={t('settingsModal.vimMode')} checked={settings.vimMode} onChange={(v) => update('vimMode', v)} />
          </SettingRow>

          <SettingRow label={t('settingsModal.zenMode')}>
            <Toggle aria-label={t('settingsModal.zenMode')} checked={settings.zenMode} onChange={(v) => update('zenMode', v)} />
          </SettingRow>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-ui)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          {t('editor.settingsSavedAutomatically')}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────── */

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, 'aria-label': ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; 'aria-label'?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      style={{
        width: 'var(--space-13)',
        height: 'var(--space-10)',
        borderRadius: 'var(--radius-full)',
        border: 'none',
        backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-bg-hover)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'var(--transition-fast)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 'var(--space-2)',
          left: checked ? 'var(--space-9)' : 'var(--space-2)',
          width: 'var(--space-8)',
          height: 'var(--space-8)',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-text)',
          transition: 'var(--transition-fast)',
        }}
      />
    </button>
  );
}

const selectStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  fontFamily: 'var(--font-family-sans)',
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-3)',
  minHeight: 'var(--space-11)',
  cursor: 'pointer',
};
