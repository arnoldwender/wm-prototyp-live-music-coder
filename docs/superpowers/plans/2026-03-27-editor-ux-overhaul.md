# Editor UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the editor into a premium "VS Code for Music" layout with activity bar, collapsible detail panel, reorganized toolbar, and streamlined visualizer zone.

**Architecture:** 3-column layout (ActivityBar 40px | MainContent flex | DetailPanel 280px collapsible). Toolbar split into 3 workflow groups. Visualizers limited to audio-only (max 3). Creatures/brain moved to sidebar accordion sections.

**Tech Stack:** React 19, Zustand 5, CSS custom properties, existing atomic design system

---

## File Map

### New files:
- `src/components/atoms/ActivityBarButton.tsx` — single icon button for activity bar
- `src/components/organisms/ActivityBar.tsx` — left icon strip (40px)
- `src/components/organisms/DetailPanel.tsx` — right collapsible panel with accordion sections
- `src/components/organisms/CreaturesSidebar.tsx` — creatures + neural activity for detail panel
- `src/components/molecules/VisualizerPills.tsx` — segmented toggle replacing VisualizerToggle

### Modified files:
- `src/layouts/EditorLayout.tsx` — 3-column layout
- `src/components/organisms/TransportBar.tsx` — 3 workflow groups, remove buttons
- `src/components/organisms/VisualizerDashboard.tsx` — audio-only, max 3, new toggle
- `src/components/organisms/StatusBar.tsx` — 3-zone redesign
- `src/lib/store.ts` — new state for activity bar, detail panel, remove old sidebar state
- `src/types/project.ts` — update PanelLayout type (remove beatlings/brain from visiblePanels)
- `src/lib/constants.ts` — update DEFAULT_LAYOUT
- `src/components/organisms/index.ts` — update barrel exports
- `src/components/molecules/index.ts` — update barrel exports
- `src/pages/Editor.tsx` — remove old SidePanel, wire new layout

### Files to delete after migration:
- `src/components/organisms/SidePanel.tsx` — replaced by ActivityBar + DetailPanel
- `src/components/molecules/VisualizerToggle.tsx` — replaced by VisualizerPills
- `src/components/organisms/BeatlingPanel.tsx` — functionality moves to CreaturesSidebar (keep file, remove from visualizer zone)
- `src/components/organisms/BrainPanel.tsx` — functionality merges into CreaturesSidebar (keep file, remove from visualizer zone)

---

## Task 1: Update Store + Types

**Files:**
- Modify: `src/types/project.ts`
- Modify: `src/lib/store.ts`
- Modify: `src/lib/constants.ts`
- Modify: `src/lib/persistence/local.test.ts`

- [ ] **Step 1: Update PanelLayout type**

```typescript
// src/types/project.ts — update visiblePanels
export interface PanelLayout {
  editorWidth: number
  graphWidth: number
  visualizerHeight: number
  showGraph: boolean
  visiblePanels: {
    waveform: boolean
    spectrum: boolean
    timeline: boolean
    pianoroll: boolean
  }
}
```

Remove `beatlings` and `brain` from `visiblePanels`.

- [ ] **Step 2: Update store — replace sidebar state with detail panel state**

In `src/lib/store.ts`, remove:
```typescript
showSidePanel: boolean
toggleSidePanel: () => void
```

Add:
```typescript
activeDetailSection: string | null  // 'samples' | 'reference' | 'console' | 'creatures' | 'settings' | null
detailPanelWidth: number
setActiveDetailSection: (section: string | null) => void
setDetailPanelWidth: (width: number) => void
toggleDetailSection: (section: string) => void  // toggle: if same section clicked, close panel
```

Default values:
```typescript
activeDetailSection: null,
detailPanelWidth: 280,
```

`toggleDetailSection` logic:
```typescript
toggleDetailSection: (section) => set((s) => ({
  activeDetailSection: s.activeDetailSection === section ? null : section,
})),
```

- [ ] **Step 3: Update DEFAULT_LAYOUT in constants.ts**

```typescript
export const DEFAULT_LAYOUT: PanelLayout = {
  editorWidth: 100,
  graphWidth: 0,
  visualizerHeight: 30,
  showGraph: false,
  visiblePanels: {
    waveform: true,
    spectrum: true,
    timeline: false,
    pianoroll: false,
  },
}
```

Default: 2 visualizers (waveform + spectrum).

- [ ] **Step 4: Update persistence test**

In `src/lib/persistence/local.test.ts`, update the visiblePanels mock to match new type (remove beatlings/brain, keep pianoroll).

- [ ] **Step 5: Run type check and tests**

Run: `npx tsc --noEmit && npm run test`
Expected: Compilation errors in components still referencing old state — that's expected, we fix those in later tasks.

- [ ] **Step 6: Commit**

```bash
git add src/types/project.ts src/lib/store.ts src/lib/constants.ts src/lib/persistence/local.test.ts
git commit -m "[Refactor] Store + types: detail panel state, remove beatlings/brain from visualizer panels"
```

---

## Task 2: ActivityBarButton Atom

**Files:**
- Create: `src/components/atoms/ActivityBarButton.tsx`
- Modify: `src/components/atoms/index.ts`

- [ ] **Step 1: Create ActivityBarButton component**

```tsx
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
```

- [ ] **Step 2: Add to barrel export**

Add to `src/components/atoms/index.ts`:
```typescript
export { ActivityBarButton } from './ActivityBarButton'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/atoms/ActivityBarButton.tsx src/components/atoms/index.ts
git commit -m "[UI] ActivityBarButton atom — icon button with left accent indicator"
```

---

## Task 3: ActivityBar Organism

**Files:**
- Create: `src/components/organisms/ActivityBar.tsx`
- Modify: `src/components/organisms/index.ts`

- [ ] **Step 1: Create ActivityBar component**

```tsx
// src/components/organisms/ActivityBar.tsx
import { Music, BookOpen, Terminal, Settings, Bug } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { ActivityBarButton } from '../atoms';

const SECTIONS = [
  { id: 'samples', icon: Music, label: 'Samples' },
  { id: 'reference', icon: BookOpen, label: 'Reference' },
  { id: 'console', icon: Terminal, label: 'Console' },
  { id: 'creatures', icon: Bug, label: 'Creatures' },
  { id: 'settings', icon: Settings, label: 'Settings' },
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
```

- [ ] **Step 2: Add to barrel export**

Add to `src/components/organisms/index.ts`:
```typescript
export { ActivityBar } from './ActivityBar'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/ActivityBar.tsx src/components/organisms/index.ts
git commit -m "[UI] ActivityBar organism — left sidebar with 5 section toggles"
```

---

## Task 4: CreaturesSidebar Organism

**Files:**
- Create: `src/components/organisms/CreaturesSidebar.tsx`
- Modify: `src/components/organisms/index.ts`

- [ ] **Step 1: Create CreaturesSidebar component**

This component renders inside the detail panel accordion. It shows live creature cards with expandable neural stats. It reuses state from `useAppStore` (creatureStats, selectedCreatureId) which BeatlingPanel already syncs.

```tsx
// src/components/organisms/CreaturesSidebar.tsx
import { useAppStore } from '../../lib/store';
import { SPECIES } from '../../lib/beatlings/species';

export function CreaturesSidebar() {
  const creatureStats = useAppStore((s) => s.creatureStats);
  const selectedId = useAppStore((s) => s.selectedCreatureId);
  const selectCreature = useAppStore((s) => s.selectCreature);

  if (creatureStats.length === 0) {
    return (
      <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '11px', textAlign: 'center' }}>
        Play music to spawn creatures
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 'var(--space-2)' }}>
      {creatureStats.map((c) => {
        const spec = SPECIES[c.species as keyof typeof SPECIES];
        const isSelected = selectedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCreature(isSelected ? null : c.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2)',
              backgroundColor: isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg)',
              border: '1px solid',
              borderColor: isSelected ? (spec?.color || 'var(--color-border)') : 'var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'var(--transition-fast)',
            }}
          >
            {/* Species dot */}
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: spec?.color || 'var(--color-primary)',
              flexShrink: 0,
            }} />
            {/* Name + stage */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)' }}>
                {spec?.name || c.species}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {c.stage} · {c.emotion || 'neutral'}
              </div>
            </div>
            {/* XP */}
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
              {Math.floor(c.xp || 0)} XP
            </span>
          </button>
        );
      })}

      {/* Selected creature detail */}
      {selectedId && (() => {
        const c = creatureStats.find((s) => s.id === selectedId);
        if (!c) return null;
        return (
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '10px',
            fontFamily: 'var(--font-family-mono)',
            color: 'var(--color-text-muted)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-1)',
          }}>
            <span>Neurons: <strong style={{ color: 'var(--color-text)' }}>{c.neurons ?? 0}</strong></span>
            <span>Synapses: <strong style={{ color: 'var(--color-text)' }}>{c.synapses ?? 0}</strong></span>
            <span>Firings: <strong style={{ color: 'var(--color-text)' }}>{c.firings ?? 0}</strong></span>
            <span>IQ: <strong style={{ color: 'var(--color-text)' }}>{c.iq ?? 0}</strong></span>
            <span style={{ gridColumn: '1 / -1' }}>
              Phi: <strong style={{ color: 'var(--color-primary)' }}>{(c.phi ?? 0).toFixed(2)}</strong>
            </span>
          </div>
        );
      })()}
    </div>
  );
}
```

- [ ] **Step 2: Add to barrel export**

```typescript
export { CreaturesSidebar } from './CreaturesSidebar'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/CreaturesSidebar.tsx src/components/organisms/index.ts
git commit -m "[UI] CreaturesSidebar — creature cards with expandable neural stats for detail panel"
```

---

## Task 5: DetailPanel Organism

**Files:**
- Create: `src/components/organisms/DetailPanel.tsx`
- Modify: `src/components/organisms/index.ts`

- [ ] **Step 1: Create DetailPanel component**

Reuses content from old SidePanel (SampleBrowser, ReferencePanel, ConsolePanel, SettingsPanel) but in an accordion layout. Import the section components from a shared location or inline them.

```tsx
// src/components/organisms/DetailPanel.tsx
import { useState, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { CreaturesSidebar } from './CreaturesSidebar';

/* Import section components extracted from old SidePanel */
/* These will be extracted into separate files in Task 6 */

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

export function DetailPanel() {
  const activeSection = useAppStore((s) => s.activeDetailSection);
  const panelWidth = useAppStore((s) => s.detailPanelWidth);
  const setWidth = useAppStore((s) => s.setDetailPanelWidth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  /* Resize handle drag */
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
      {/* Resize handle (desktop only) */}
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AccordionSection id="samples" title="Samples" defaultOpen={activeSection === 'samples'}>
          {/* SampleBrowser content — extracted in Task 6 */}
          <div style={{ padding: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '11px' }}>
            Sample browser (migrated in Task 6)
          </div>
        </AccordionSection>

        <AccordionSection id="reference" title="Reference" defaultOpen={activeSection === 'reference'}>
          <div style={{ padding: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '11px' }}>
            Reference panel (migrated in Task 6)
          </div>
        </AccordionSection>

        <AccordionSection id="console" title="Console" defaultOpen={activeSection === 'console'}>
          <div style={{ padding: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '11px' }}>
            Console panel (migrated in Task 6)
          </div>
        </AccordionSection>

        <AccordionSection id="creatures" title="Creatures" defaultOpen={activeSection === 'creatures'}>
          <CreaturesSidebar />
        </AccordionSection>

        <AccordionSection id="settings" title="Settings" defaultOpen={activeSection === 'settings'}>
          <div style={{ padding: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '11px' }}>
            Settings panel (migrated in Task 6)
          </div>
        </AccordionSection>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Add to barrel export**

```typescript
export { DetailPanel } from './DetailPanel'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/DetailPanel.tsx src/components/organisms/index.ts
git commit -m "[UI] DetailPanel — collapsible right sidebar with accordion sections"
```

---

## Task 6: Migrate SidePanel Content to DetailPanel

**Files:**
- Modify: `src/components/organisms/DetailPanel.tsx` — import real section content
- Modify: `src/components/organisms/SidePanel.tsx` — extract SampleBrowser, ReferencePanel, ConsolePanel, SettingsPanel as exports

- [ ] **Step 1: Export section components from SidePanel**

Add `export` keyword to `SampleBrowser`, `ReferencePanel`, `ConsolePanel`, `SettingsPanel` functions in SidePanel.tsx. These are currently private functions — make them named exports.

- [ ] **Step 2: Import sections into DetailPanel**

Replace placeholder divs in DetailPanel.tsx AccordionSections with the real components:
```tsx
import { SampleBrowser, ReferencePanel, ConsolePanel, SettingsPanel } from './SidePanel';
```

Wire them into the accordion:
```tsx
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
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS (section components are now shared)

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/DetailPanel.tsx src/components/organisms/SidePanel.tsx
git commit -m "[Refactor] Migrate SidePanel sections into DetailPanel accordion"
```

---

## Task 7: VisualizerPills Molecule

**Files:**
- Create: `src/components/molecules/VisualizerPills.tsx`
- Modify: `src/components/molecules/index.ts`

- [ ] **Step 1: Create segmented pill toggle**

```tsx
// src/components/molecules/VisualizerPills.tsx
import { Activity, BarChart3, Clock, Piano } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import type { PanelLayout } from '../../types/project';

const PANELS: { key: keyof PanelLayout['visiblePanels']; Icon: LucideIcon }[] = [
  { key: 'waveform', Icon: Activity },
  { key: 'spectrum', Icon: BarChart3 },
  { key: 'timeline', Icon: Clock },
  { key: 'pianoroll', Icon: Piano },
];

const MAX_ACTIVE = 3;

export function VisualizerPills() {
  const { t } = useTranslation();
  const visiblePanels = useAppStore((s) => s.layout.visiblePanels);
  const togglePanel = useAppStore((s) => s.togglePanel);

  const activeCount = Object.values(visiblePanels).filter(Boolean).length;

  const handleToggle = (key: keyof PanelLayout['visiblePanels']) => {
    if (!visiblePanels[key] && activeCount >= MAX_ACTIVE) {
      /* Deactivate leftmost active panel to make room */
      const firstActive = PANELS.find((p) => visiblePanels[p.key]);
      if (firstActive) togglePanel(firstActive.key);
    }
    togglePanel(key);
  };

  return (
    <div
      className="flex items-center shrink-0"
      style={{
        padding: 'var(--space-1) var(--space-3)',
        gap: '1px',
        backgroundColor: 'var(--color-bg-alt)',
        borderBottom: '1px solid var(--color-border)',
      }}
      role="group"
      aria-label="Visualizer panels"
    >
      {PANELS.map(({ key, Icon }) => {
        const active = visiblePanels[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleToggle(key)}
            aria-pressed={active}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-3)',
              fontSize: '10px',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
              backgroundColor: active ? 'var(--color-bg-elevated)' : 'transparent',
              border: '1px solid',
              borderColor: active ? 'var(--color-border)' : 'transparent',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={12} />
            {t(`panels.${key}`)}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Add to barrel export**

```typescript
export { VisualizerPills } from './VisualizerPills'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/molecules/VisualizerPills.tsx src/components/molecules/index.ts
git commit -m "[UI] VisualizerPills — segmented toggle with max 3 active panels"
```

---

## Task 8: Update VisualizerDashboard

**Files:**
- Modify: `src/components/organisms/VisualizerDashboard.tsx`

- [ ] **Step 1: Remove beatlings/brain, use VisualizerPills, audio-only panels**

```tsx
// src/components/organisms/VisualizerDashboard.tsx
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { VisualizerPills } from '../molecules/VisualizerPills';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import { PatternTimeline } from './PatternTimeline';
import { PianorollVisualizer } from './PianorollVisualizer';

export function VisualizerDashboard() {
  const { t } = useTranslation();
  const visiblePanels = useAppStore((s) => s.layout.visiblePanels);

  const activePanels = [
    visiblePanels.waveform && { key: 'waveform', component: <WaveformVisualizer /> },
    visiblePanels.spectrum && { key: 'spectrum', component: <SpectrumVisualizer /> },
    visiblePanels.timeline && { key: 'timeline', component: <PatternTimeline /> },
    visiblePanels.pianoroll && { key: 'pianoroll', component: <PianorollVisualizer /> },
  ].filter(Boolean) as { key: string; component: ReactNode }[];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <VisualizerPills />
      <div className="flex flex-1 min-h-0 gap-px" style={{ backgroundColor: 'var(--color-border)' }}>
        {activePanels.length === 0 ? (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', fontSize: '11px' }}
          >
            {t('panels.noVisualizers')}
          </div>
        ) : (
          activePanels.map(({ key, component }) => (
            <div key={key} className="flex-1 min-w-0" style={{ backgroundColor: 'var(--color-bg)' }}>
              {component}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/organisms/VisualizerDashboard.tsx
git commit -m "[UI] VisualizerDashboard — audio-only panels, remove beatlings/brain"
```

---

## Task 9: Toolbar Redesign

**Files:**
- Modify: `src/components/organisms/TransportBar.tsx`

- [ ] **Step 1: Reorganize into 3 workflow groups**

Restructure the toolbar JSX into:

**Group 1 — Transport:** Play/Stop, BPM input (with background box), Engine selector

**Group 2 — Edit:** Undo, Redo, Graph toggle

**Group 3 — Share:** Share, Gist, Collection, Language switcher

Remove: Record button, Settings button, Side panel toggle button, Help panel button.

Add visual group separators:
```tsx
function GroupDivider() {
  return <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)', opacity: 0.5, margin: '0 var(--space-2)' }} />;
}
```

Reduce toolbar height to 40px:
```tsx
style={{ height: '40px', padding: '0 var(--space-3)' }}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/TransportBar.tsx
git commit -m "[UI] Toolbar: 3 workflow groups, remove Record/Settings/Help, 40px height"
```

---

## Task 10: StatusBar Redesign

**Files:**
- Modify: `src/components/organisms/StatusBar.tsx`

- [ ] **Step 1: Implement 3-zone status bar**

Left: Engine badge (colored dot + name)
Center: BPM + status indicator (Ready/Playing dot)
Right: XP bar with level

Remove: file count, creature count, streak counter.

Height: 24px. No wrapping.

```tsx
// Simplified StatusBar structure
<footer style={{ height: '24px', padding: '0 var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  {/* Left: engine */}
  <div className="flex items-center gap-2">
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ENGINE_COLORS[engine] }} />
    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{engine}</span>
  </div>
  {/* Center: BPM + status */}
  <div className="flex items-center gap-2">
    <span style={{ fontSize: '10px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text)' }}>{bpm} BPM</span>
    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isPlaying ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
  </div>
  {/* Right: XP */}
  <XpBar />
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/organisms/StatusBar.tsx
git commit -m "[UI] StatusBar: 3-zone layout (engine | BPM+status | XP), 24px height"
```

---

## Task 11: EditorLayout 3-Column

**Files:**
- Modify: `src/layouts/EditorLayout.tsx`
- Modify: `src/pages/Editor.tsx`

- [ ] **Step 1: Rewrite EditorLayout with 3-column structure**

```
ActivityBar (40px) | MainContent (flex: editor + visualizers) | DetailPanel (collapsible)
```

Remove old `sidePanel` prop. Add `activityBar` and `detailPanel` props.

Layout structure:
```tsx
<div className="flex flex-col h-full">
  {!zenMode && <header style={{ height: '40px' }}>{toolbar}</header>}
  <div className="flex-1 flex min-h-0">
    {!zenMode && activityBar}
    <div ref={mainRef} className="flex-1 flex flex-col min-h-0">
      {/* editor zone */}
      {/* resize handle */}
      {/* visualizer zone */}
    </div>
    {!zenMode && detailPanel}
  </div>
  {!zenMode && <footer style={{ height: '24px' }}>{statusBar}</footer>}
</div>
```

- [ ] **Step 2: Update Editor.tsx to use new layout**

```tsx
<EditorLayout
  toolbar={<TransportBar />}
  activityBar={<ActivityBar />}
  editor={<CodeEditor />}
  graph={<NodeGraph />}
  visualizers={<VisualizerDashboard />}
  detailPanel={<DetailPanel />}
  statusBar={<StatusBar />}
/>
```

Remove old `SidePanel` import and usage.

- [ ] **Step 3: Run type check and tests**

Run: `npx tsc --noEmit && npm run test`

- [ ] **Step 4: Commit**

```bash
git add src/layouts/EditorLayout.tsx src/pages/Editor.tsx
git commit -m "[UI] EditorLayout: 3-column (ActivityBar | Main | DetailPanel)"
```

---

## Task 12: Cleanup and Final Polish

**Files:**
- Modify: `src/components/organisms/index.ts` — remove old exports
- Modify: `src/components/molecules/index.ts` — remove old VisualizerToggle export
- Delete or deprecate: `src/components/molecules/VisualizerToggle.tsx`

- [ ] **Step 1: Update barrel exports**

Remove from organisms/index.ts:
- `BrainPanel` export (keep file, just remove from barrel — CreaturesSidebar replaces its role)

Remove from molecules/index.ts:
- `VisualizerToggle` export (replaced by VisualizerPills)

- [ ] **Step 2: Full build and test**

Run: `npm run build && npm run test`
Expected: PASS — zero type errors, all tests pass, production build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "[Cleanup] Remove old exports, finalize VS Code for Music layout"
git push
```

---

## Task 13: Typography Pass

**Files:**
- All organism and molecule components — audit font sizes, weights, spacing

- [ ] **Step 1: Audit and fix typography**

Check every component against the spec:
- Headings: 13px semibold sans
- Labels: 11px medium sans, muted color
- Values: 11px bold mono
- Code: 13px normal mono
- Min touch target: 32px
- Gaps: 8px grouped, 16px between groups

Fix any violations found. This is a sweep across all modified components.

- [ ] **Step 2: Build and test**

Run: `npm run build && npm run test`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "[Polish] Typography pass — consistent sizing, spacing, hierarchy across all components"
git push
```
