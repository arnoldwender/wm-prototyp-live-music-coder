/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   ActivityBarButton — icon button for the left activity bar.
 * Shows left accent border when active, hover highlight always. */
import type { LucideIcon } from 'lucide-react';

interface ActivityBarButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

export function ActivityBarButton({ icon: Icon, label, active, onClick }: ActivityBarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        border: 'none',
        backgroundColor: 'transparent',
        color: active ? 'var(--color-text)' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--color-text)';
        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--color-text-secondary)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Active indicator — left accent border */}
      {active && (
        <span style={{
          position: 'absolute',
          left: 0,
          top: '20%',
          bottom: '20%',
          width: '2px',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '0 1px 1px 0',
        }} />
      )}
      <Icon size={20} />
    </button>
  );
}
