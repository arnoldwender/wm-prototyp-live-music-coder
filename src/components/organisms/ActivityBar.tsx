// src/components/organisms/ActivityBar.tsx
import { Music, BookOpen, Terminal, Settings, Bug } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { ActivityBarButton } from '../atoms';

const SECTIONS = [
  { id: 'samples', icon: Music, label: 'Samples' },
  { id: 'reference', icon: BookOpen, label: 'Reference' },
  { id: 'creatures', icon: Bug, label: 'Creatures' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'console', icon: Terminal, label: 'Console' },
] as const;

export function ActivityBar() {
  const activeSection = useAppStore((s) => s.activeDetailSection);
  const toggleSection = useAppStore((s) => s.toggleDetailSection);

  return (
    <nav
      aria-label="Activity bar"
      className="flex flex-col items-center shrink-0"
      style={{
        width: '40px',
        backgroundColor: 'var(--color-bg-alt)',
        borderRight: '1px solid var(--color-border)',
        paddingTop: 'var(--space-2)',
      }}
    >
      {SECTIONS.map(({ id, icon, label }) => (
        <ActivityBarButton
          key={id}
          icon={icon}
          label={label}
          active={activeSection === id}
          onClick={() => toggleSection(id)}
        />
      ))}
    </nav>
  );
}
