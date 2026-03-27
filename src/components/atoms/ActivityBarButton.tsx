// src/components/atoms/ActivityBarButton.tsx
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
        height: '36px',
        border: 'none',
        backgroundColor: 'transparent',
        color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'var(--transition-fast)',
      }}
    >
      {/* Active indicator — left accent border */}
      {active && (
        <span style={{
          position: 'absolute',
          left: 0,
          top: '25%',
          bottom: '25%',
          width: '2px',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '0 1px 1px 0',
        }} />
      )}
      <Icon size={18} />
    </button>
  );
}
