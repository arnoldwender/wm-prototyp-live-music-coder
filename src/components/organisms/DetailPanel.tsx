/* ──────────────────────────────────────────────────────────
   DetailPanel — collapsible right sidebar with accordion sections.
   Renders SampleBrowser, Reference, Console, Creatures, and Settings
   in expandable sections with localStorage-persisted open/close state.
   Features resize handle (200-400px) and mobile fullscreen overlay.
   ────────────────────────────────────────────────────────── */

import { useState, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { CreaturesSidebar } from './CreaturesSidebar';
import { SampleBrowser, ReferencePanel, ConsolePanel, SettingsPanel } from './SidePanel';

/* ── Accordion section — persists open/close state to localStorage ── */
interface AccordionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ id, title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem(`lmc-detail-${id}`);
    return stored !== null ? stored === 'true' : defaultOpen;
  });

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(`lmc-detail-${id}`, String(next));
  };

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <button
        type="button"
        onClick={toggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--color-text)',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
        <ChevronDown size={12} style={{
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'var(--transition-fast)',
          color: 'var(--color-text-muted)',
        }} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ── DetailPanel — right collapsible sidebar with resize handle ── */
export function DetailPanel() {
  const activeSection = useAppStore((s) => s.activeDetailSection);
  const panelWidth = useAppStore((s) => s.detailPanelWidth);
  const setWidth = useAppStore((s) => s.setDetailPanelWidth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  /* Resize handle drag — constrained to 200-400px range */
  const handleRef = useRef<HTMLDivElement>(null);
  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX;
      setWidth(Math.min(400, Math.max(200, startWidth + delta)));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [panelWidth, setWidth]);

  /* Collapse to 0px when no section active */
  if (!activeSection) return null;

  return (
    <aside
      className="flex shrink-0 h-full"
      style={{
        ...(isMobile
          ? { position: 'fixed' as const, inset: 0, zIndex: 100, backgroundColor: 'var(--color-bg)', width: '100%' }
          : { width: `${panelWidth}px`, backgroundColor: 'var(--color-bg)' }),
      }}
    >
      {/* Resize handle (desktop only) — highlights on hover */}
      {!isMobile && (
        <div
          ref={handleRef}
          onMouseDown={startDrag}
          style={{
            width: '1px',
            backgroundColor: 'var(--color-border)',
            cursor: 'col-resize',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-border)' }}
        />
      )}

      {/* Scrollable accordion content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AccordionSection id="samples" title="Samples" defaultOpen={activeSection === 'samples'}>
          <SampleBrowser />
        </AccordionSection>

        <AccordionSection id="reference" title="Reference" defaultOpen={activeSection === 'reference'}>
          <ReferencePanel />
        </AccordionSection>

        <AccordionSection id="console" title="Console" defaultOpen={activeSection === 'console'}>
          <ConsolePanel />
        </AccordionSection>

        <AccordionSection id="creatures" title="Creatures" defaultOpen={activeSection === 'creatures'}>
          <CreaturesSidebar />
        </AccordionSection>

        <AccordionSection id="settings" title="Settings" defaultOpen={activeSection === 'settings'}>
          <SettingsPanel />
        </AccordionSection>
      </div>
    </aside>
  );
}
