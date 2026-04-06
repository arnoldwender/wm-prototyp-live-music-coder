/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   TabButton atom — single file tab with engine color indicator,
   truncated file name, and hover-visible close button.
   Used in the FileTabs molecule for multi-file editor tabs.
   ────────────────────────────────────────────────────────── */

import { X } from 'lucide-react';
import type { EngineType } from '../../types/engine';
import { ENGINE_COLORS } from '../../lib/constants';

interface TabButtonProps {
  name: string;
  engine: EngineType;
  active: boolean;
  onClick: () => void;
  onClose: () => void;
  closable: boolean;
}

/** Single file tab button with engine color indicator and close button */
export function TabButton({ name, engine, active, onClick, onClose, closable }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1 px-3 py-1 text-sm border-b-2 transition-colors cursor-pointer"
      style={{
        borderBottomColor: active ? ENGINE_COLORS[engine] : 'transparent',
        color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
        backgroundColor: active ? 'var(--color-bg-elevated)' : 'transparent',
      }}
      aria-selected={active}
      role="tab"
    >
      {/* Engine color dot */}
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: ENGINE_COLORS[engine] }}
      />
      <span className="truncate max-w-24">{name}</span>
      {closable && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Close ${name}`}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClose(); } }}
          className="opacity-0 group-hover:opacity-100 ml-1 rounded hover:bg-[var(--color-bg-hover)] transition-opacity inline-flex items-center justify-center"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <X size={12} />
        </span>
      )}
    </button>
  );
}
