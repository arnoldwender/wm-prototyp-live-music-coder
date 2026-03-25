# Phase 8: Landing Page & Onboarding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the landing page with hero section, feature highlights, example gallery, and starter templates. Add first-run tutorial overlay, inline help panel, and URL hash loading for shared projects. This is the final phase — after this, the app is complete for v1.

**Architecture:** Landing page as a standalone route. Starter templates as pre-built code snippets per engine. First-run tutorial as a dismissable overlay with 4 steps. Help panel as a slide-out with cheat sheets. URL hash decoded on editor mount to load shared code.

**Tech Stack:** React, Framer Motion (animations), i18next, Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md` (Section 8)

---

## File Structure (Phase 8)

```
src/
├── data/
│   └── templates.ts              # Starter code templates per engine
├── components/
│   ├── molecules/
│   │   ├── FeatureCard.tsx       # Feature highlight card for landing page
│   │   └── HelpPanel.tsx         # Slide-out help with cheat sheet + shortcuts
│   └── organisms/
│       ├── HeroSection.tsx       # Landing hero with tagline + CTA
│       ├── FeatureGrid.tsx       # Feature highlights grid
│       ├── ExampleGallery.tsx    # Pre-built shareable demo links
│       ├── TemplateSelector.tsx  # First-visit template picker modal
│       └── TutorialOverlay.tsx   # First-run guided overlay (4 steps)
├── pages/
│   ├── Landing.tsx               # (modify) Full landing page
│   └── Editor.tsx                # (modify) URL hash loading + first-run check
```

---

### Task 1: Starter templates data

**Files:**
- Create: `src/data/templates.ts`

- [ ] **Step 1: Create templates**

Create `src/data/templates.ts`:

```typescript
import type { EngineType } from '../types/engine';

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  engine: EngineType;
  code: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'strudel-drums',
    name: 'Strudel Drum Pattern',
    description: 'A classic drum pattern with kick, snare, and hi-hats',
    engine: 'strudel',
    code: `s("bd sd [~ bd] sd").bank("RolandTR808")
.speed("<1 1.5 1 0.5>")
.sometimes(x => x.delay(.5))`,
  },
  {
    id: 'strudel-melody',
    name: 'Strudel Melody',
    description: 'A melodic pattern with sawtooth synth',
    engine: 'strudel',
    code: `note("<c3 e3 g3 b3>(3,8)")
.s("sawtooth")
.lpf(800)
.delay(.25)
.room(.5)`,
  },
  {
    id: 'tonejs-synth',
    name: 'Tone.js Synth',
    description: 'A simple synth with reverb',
    engine: 'tonejs',
    code: `const synth = new Tone.PolySynth(Tone.Synth)
const reverb = new Tone.Reverb(2)
synth.chain(reverb, Tone.getDestination())

const loop = new Tone.Loop((time) => {
  synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", time)
}, "4n")
loop.start(0)`,
  },
  {
    id: 'webaudio-osc',
    name: 'Web Audio Oscillator',
    description: 'Raw oscillator with gain control',
    engine: 'webaudio',
    code: `const osc = ctx.createOscillator()
const gain = ctx.createGain()
osc.type = 'sawtooth'
osc.frequency.value = 220
gain.gain.value = 0.3
osc.connect(gain)
gain.connect(masterGain)
osc.start()`,
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/templates.ts
git commit -m "[Data] Add starter code templates for Strudel, Tone.js, and Web Audio"
```

---

### Task 2: Landing page components (Hero + Features + Gallery)

**Files:**
- Create: `src/components/molecules/FeatureCard.tsx`
- Create: `src/components/organisms/HeroSection.tsx`, `FeatureGrid.tsx`, `ExampleGallery.tsx`
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Create FeatureCard**

Create `src/components/molecules/FeatureCard.tsx`:

```tsx
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

/** Feature highlight card for landing page */
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article
      className="p-6 rounded-lg"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {description}
      </p>
    </article>
  );
}
```

- [ ] **Step 2: Create HeroSection**

Create `src/components/organisms/HeroSection.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '../atoms';

/** Landing page hero with tagline and CTA */
export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center text-center px-4 py-20">
      <h1
        className="text-5xl font-bold mb-6 leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        {t('landing.hero')}
      </h1>
      <p
        className="text-xl max-w-2xl mb-10 leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {t('landing.subtitle')}
      </p>
      <Button
        variant="primary"
        onClick={() => navigate('/editor')}
        className="text-lg !px-8 !py-3"
      >
        <Play size={20} />
        {t('landing.cta')}
      </Button>
    </section>
  );
}
```

- [ ] **Step 3: Create FeatureGrid**

Create `src/components/organisms/FeatureGrid.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { FeatureCard } from '../molecules/FeatureCard';

/** Feature highlights grid on landing page */
export function FeatureGrid() {
  const { t } = useTranslation();

  const features = [
    { icon: '🎵', title: '4 Audio Engines', description: 'Strudel patterns, Tone.js synths, raw Web Audio, and MIDI output — all in one IDE.' },
    { icon: '🔗', title: 'Visual Node Graph', description: 'See your audio routing as draggable nodes. Code and graph stay in sync.' },
    { icon: '📊', title: 'Live Visualizers', description: 'Waveform, spectrum analyzer, and pattern timeline react to your music in real time.' },
    { icon: '🐾', title: 'Beatling Creatures', description: '6 species of audio-reactive creatures with neural brains and Game of Life evolution.' },
    { icon: '🔗', title: 'Share & Collaborate', description: 'Share via URL, save to GitHub Gist, or record your session as audio.' },
    { icon: '🌍', title: 'DE/EN/ES', description: 'Full interface in German, English, and Spanish with translated autocomplete tooltips.' },
  ];

  return (
    <section className="px-4 py-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create ExampleGallery**

Create `src/components/organisms/ExampleGallery.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { STARTER_TEMPLATES } from '../../data/templates';
import { encodeToUrl } from '../../lib/persistence/url';
import { Button } from '../atoms';
import { Play } from 'lucide-react';

/** Pre-built example demos on landing page */
export function ExampleGallery() {
  const navigate = useNavigate();

  const handleTryExample = (template: typeof STARTER_TEMPLATES[0]) => {
    const hash = encodeToUrl({ code: template.code, bpm: 120, engine: template.engine });
    navigate(`/editor#code=${hash}`);
  };

  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <h2
        className="text-2xl font-bold text-center mb-8"
        style={{ color: 'var(--color-text)' }}
      >
        Try an Example
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STARTER_TEMPLATES.map((t) => (
          <article
            key={t.id}
            className="p-4 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{t.name}</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
            </div>
            <Button variant="ghost" onClick={() => handleTryExample(t)}>
              <Play size={16} /> Try
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Update Landing page**

Replace `src/pages/Landing.tsx` to compose all sections:

```tsx
import { LanguageSwitcher } from '../components/molecules';
import { HeroSection } from '../components/organisms/HeroSection';
import { FeatureGrid } from '../components/organisms/FeatureGrid';
import { ExampleGallery } from '../components/organisms/ExampleGallery';

/** Landing page — hero + features + examples */
export function Landing() {
  return (
    <main
      className="min-h-screen overflow-y-auto"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <nav className="flex justify-end p-4">
        <LanguageSwitcher />
      </nav>
      <HeroSection />
      <FeatureGrid />
      <ExampleGallery />
      <footer
        className="text-center py-8 text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Live Music Coder — Open Source (AGPL-3.0)
      </footer>
    </main>
  );
}
```

- [ ] **Step 6: Update barrel exports**

Add FeatureCard to molecules/index.ts.
Add HeroSection, FeatureGrid, ExampleGallery to organisms/index.ts.

- [ ] **Step 7: Commit**

```bash
git add src/components/ src/pages/Landing.tsx src/data/
git commit -m "[Landing] Add hero section, feature grid, and example gallery"
```

---

### Task 3: Template selector + URL hash loading on Editor

**Files:**
- Create: `src/components/organisms/TemplateSelector.tsx`
- Modify: `src/pages/Editor.tsx`

- [ ] **Step 1: Create TemplateSelector**

Create `src/components/organisms/TemplateSelector.tsx`:

```tsx
import { STARTER_TEMPLATES, type StarterTemplate } from '../../data/templates';
import { useAppStore } from '../../lib/store';
import { Button } from '../atoms';
import { Play } from 'lucide-react';
import { ENGINE_COLORS } from '../../lib/constants';

interface TemplateSelectorProps {
  onSelect: () => void;
}

/** First-visit template picker modal */
export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const files = useAppStore((s) => s.files);

  const handleSelect = (template: StarterTemplate) => {
    const activeFile = files.find((f) => f.active);
    if (activeFile) {
      updateFileCode(activeFile.id, template.code);
    }
    localStorage.setItem('lmc-onboarded', 'true');
    onSelect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div
        className="rounded-lg p-8 max-w-2xl w-full mx-4"
        style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Choose a starter template
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Pick one to get started. You can always change it later.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STARTER_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className="p-4 rounded-lg text-left transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: ENGINE_COLORS[t.engine] }}
                />
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{t.name}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={() => { localStorage.setItem('lmc-onboarded', 'true'); onSelect(); }}
          className="mt-4 w-full"
        >
          Skip — use default
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modify Editor page for URL hash loading + first-run**

Modify `src/pages/Editor.tsx`:
- Import readShareFromUrl from persistence/url
- Import TemplateSelector
- Add state: showTemplateSelector
- On mount useEffect:
  - Check URL hash: if readShareFromUrl() returns data → update active file code + bpm + engine
  - Else check localStorage 'lmc-onboarded': if not set → show template selector
- Render TemplateSelector conditionally

- [ ] **Step 3: Add to barrel exports**

Add TemplateSelector to organisms/index.ts.

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/TemplateSelector.tsx src/components/organisms/index.ts src/pages/Editor.tsx
git commit -m "[Onboarding] Add template selector and URL hash loading on editor mount"
```

---

### Task 4: Help panel

**Files:**
- Create: `src/components/molecules/HelpPanel.tsx`
- Modify: `src/components/organisms/TransportBar.tsx`
- Modify: `src/components/molecules/index.ts`

- [ ] **Step 1: Create HelpPanel**

Create `src/components/molecules/HelpPanel.tsx`:

```tsx
import { Button } from '../atoms';
import { X } from 'lucide-react';

interface HelpPanelProps {
  onClose: () => void;
}

/** Slide-out help panel with cheat sheet and keyboard shortcuts */
export function HelpPanel({ onClose }: HelpPanelProps) {
  return (
    <aside
      className="fixed right-0 top-0 bottom-0 w-80 z-40 overflow-y-auto shadow-lg"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderLeft: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Help</h2>
        <Button variant="ghost" onClick={onClose} aria-label="Close help"><X size={18} /></Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Mini-notation cheat sheet */}
        <section>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Strudel Mini-Notation</h3>
          <div className="space-y-1 text-xs" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-secondary)' }}>
            <div><span style={{ color: 'var(--color-primary)' }}>space</span> — sequence events</div>
            <div><span style={{ color: 'var(--color-primary)' }}>[  ]</span> — subdivide / group</div>
            <div><span style={{ color: 'var(--color-primary)' }}>&lt; &gt;</span> — one per cycle</div>
            <div><span style={{ color: 'var(--color-primary)' }}>~</span> — rest / silence</div>
            <div><span style={{ color: 'var(--color-primary)' }}>,</span> — play together (chord)</div>
            <div><span style={{ color: 'var(--color-primary)' }}>*N</span> — speed up N times</div>
            <div><span style={{ color: 'var(--color-primary)' }}>/N</span> — slow down N times</div>
            <div><span style={{ color: 'var(--color-primary)' }}>(k,n)</span> — Euclidean rhythm</div>
            <div><span style={{ color: 'var(--color-primary)' }}>?</span> — random removal (50%)</div>
          </div>
        </section>

        {/* Common functions */}
        <section>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Common Functions</h3>
          <div className="space-y-1 text-xs" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-secondary)' }}>
            <div><span style={{ color: 'var(--color-primary)' }}>note()</span> — set pitch</div>
            <div><span style={{ color: 'var(--color-primary)' }}>s()</span> — set sound/sample</div>
            <div><span style={{ color: 'var(--color-primary)' }}>lpf()</span> — low-pass filter</div>
            <div><span style={{ color: 'var(--color-primary)' }}>delay()</span> — delay effect</div>
            <div><span style={{ color: 'var(--color-primary)' }}>room()</span> — reverb amount</div>
            <div><span style={{ color: 'var(--color-primary)' }}>gain()</span> — volume</div>
            <div><span style={{ color: 'var(--color-primary)' }}>speed()</span> — playback speed</div>
            <div><span style={{ color: 'var(--color-primary)' }}>stack()</span> — layer patterns</div>
          </div>
        </section>

        {/* Keyboard shortcuts */}
        <section>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Keyboard Shortcuts</h3>
          <div className="space-y-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex justify-between"><span>Undo</span><kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Z</kbd></div>
            <div className="flex justify-between"><span>Redo</span><kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Shift+Z</kbd></div>
            <div className="flex justify-between"><span>Search</span><kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+F</kbd></div>
            <div className="flex justify-between"><span>Fold</span><kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Shift+[</kbd></div>
          </div>
        </section>

        {/* Engine info */}
        <section>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Engines</h3>
          <div className="space-y-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <div><span style={{ color: '#a855f7' }}>Strudel</span> — Pattern-based live coding (strudel.cc)</div>
            <div><span style={{ color: '#3b82f6' }}>Tone.js</span> — High-level synths and effects</div>
            <div><span style={{ color: '#22c55e' }}>Web Audio</span> — Low-level native API</div>
            <div><span style={{ color: '#f97316' }}>MIDI</span> — External device output (output only)</div>
          </div>
        </section>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Wire help button in TransportBar**

In TransportBar: add `showHelp` state, Settings button toggles it, render HelpPanel conditionally.

- [ ] **Step 3: Update barrel exports**

Add HelpPanel to molecules/index.ts.

- [ ] **Step 4: Run tests + build**

```bash
npm run test && npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Commit and push**

```bash
git add src/components/ src/pages/
git commit -m "[Help] Add help panel with cheat sheet, shortcuts, and engine info"
git push
```

---

## Phase 8 Completion Criteria

After all 4 tasks:
- Starter templates for Strudel, Tone.js, Web Audio
- Landing page with hero, feature grid, example gallery
- Template selector on first visit (stored in localStorage)
- URL hash loading for shared projects
- Help panel with mini-notation cheat sheet, common functions, keyboard shortcuts, engine info
- Help button wired in toolbar

**The app is now feature-complete for v1.**
