/* ──────────────────────────────────────────────────────────
   DetailPanel — collapsible right sidebar with accordion sections.
   Auto-opens the section matching the activity bar selection.
   Features resize handle (200-400px) and mobile fullscreen overlay.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { CreaturesSidebar } from './CreaturesSidebar';
import { SampleBrowser, ReferencePanel, ConsolePanel, SettingsPanel } from './SidePanel';

/* ── Accordion section ── */
interface AccordionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  forceOpen?: boolean;
}

function AccordionSection({ id: _id, title, children, forceOpen }: AccordionProps) {
  const [open, setOpen] = useState(forceOpen ?? false);

  /* Auto-open when activity bar selects this section */
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const toggle = () => setOpen(!open);

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open ? "true" : "false"}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: open ? 'var(--color-bg-alt)' : 'transparent',
          border: 'none',
          color: 'var(--color-text)',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'var(--transition-fast)',
        }}
      >
        <span className="flex items-center gap-2">
          <ChevronDown size={10} style={{
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'var(--transition-fast)',
            color: 'var(--color-text-muted)',
          }} />
          {title}
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ── DetailPanel ── */
export function DetailPanel() {
  const activeSection = useAppStore((s) => s.activeDetailSection);
  const setActiveSection = useAppStore((s) => s.setActiveDetailSection);
  const panelWidth = useAppStore((s) => s.detailPanelWidth);
  const setWidth = useAppStore((s) => s.setDetailPanelWidth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Scroll to active section when it changes */
  useEffect(() => {
    if (!activeSection || !scrollRef.current) return;
    const target = scrollRef.current.querySelector(`[data-section="${activeSection}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeSection]);

  /* Resize handle */
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

  if (!activeSection) return null;

  const sections = [
    { id: 'samples', title: 'Samples', content: <SampleBrowser /> },
    { id: 'reference', title: 'Reference', content: <ReferencePanel /> },
    { id: 'console', title: 'Console', content: <ConsolePanel /> },
    { id: 'creatures', title: 'Creatures', content: <CreaturesSidebar /> },
    { id: 'settings', title: 'Settings', content: <SettingsPanel /> },
  ];

  return (
    <aside
      className="flex shrink-0 h-full"
      style={{
        ...(isMobile
          ? { position: 'fixed' as const, inset: 0, zIndex: 100, backgroundColor: 'var(--color-bg)', width: '100%' }
          : { width: `${panelWidth}px`, backgroundColor: 'var(--color-bg)' }),
      }}
    >
      {/* Resize handle (desktop) */}
      {!isMobile && (
        <div
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

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile close button */}
        {isMobile && (
          <div className="flex items-center justify-between shrink-0" style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {sections.find(s => s.id === activeSection)?.title}
            </span>
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              aria-label="Close panel"
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Scrollable accordion */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          {sections.map(({ id, title, content }) => (
            <div key={id} data-section={id}>
              <AccordionSection id={id} title={title} forceOpen={activeSection === id}>
                {content}
              </AccordionSection>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
