# Editor UX Overhaul — "VS Code for Music"

**Date:** 2026-03-27
**Status:** Design approved
**Scope:** Editor layout, toolbar, visualizers, sidebar, typography, status bar

## Goal

Transform the editor from a functional prototype into a premium-feeling music IDE. Inspired by VS Code's density and organization + Strudel's music-specific UX.

## Problem Statement

The editor works but feels amateur:
- Too many panels fighting for space (6 visualizers in one row)
- Toolbar has 12+ controls with no grouping
- Side panel feels disconnected from the workflow
- Typography and spacing are inconsistent
- Creatures/brain panels compete with audio visualizers for space

## Design

### 1. Layout System

Three-column layout: Activity Bar | Main Content | Detail Panel.

```
┌──────────────────────────────────────────────┐
│ Toolbar: [Transport] | [Edit] | [Share]      │
├──┬───────────────────────────┬───────────────┤
│  │ Code Editor               │ ▾ Samples     │
│♩ │                           │ ▾ Reference   │
│📖│───────────────────────────│ ▾ Console     │
│🎛│ Waveform │ Spectrum │ ... │ ▾ Creatures   │
│⚙ │                           │ ▾ Neural      │
├──┴───────────────────────────┴───────────────┤
│ Status Bar                                   │
└──────────────────────────────────────────────┘
```

**Activity Bar (left, 40px fixed):**
- 5 icon buttons stacked vertically: Samples, Reference, Console, Settings, Creatures
- Active icon gets left accent border (2px, engine color)
- Click toggles corresponding section in Detail Panel
- If panel closed, opens and scrolls to section. If section already focused, collapses panel.

**Main Content (center, flex):**
- Splits vertically: Code Editor (top, flex) | Visualizer Zone (bottom, resizable 15-40%)
- Horizontal resize handle between editor and visualizers
- Double-click handle to reset to default (30%)

**Detail Panel (right, 280px default):**
- Resizable 200-400px via drag handle
- Collapses to 0px when no activity bar icon selected
- Slides in/out with 200ms ease transition
- On mobile (<768px): fullscreen overlay

**Resize handles:**
- Vertical: main content ↔ detail panel
- Horizontal: code editor ↔ visualizer zone
- Min/max constraints enforced
- Smooth drag, cursor change on hover

**Zen Mode:**
- Hides toolbar, activity bar, detail panel, visualizers, status bar
- Only code editor remains, full screen
- Toggle via Settings or keyboard shortcut (Cmd+Shift+Z)

### 2. Toolbar

Height: 40px (reduced from 48px). Three workflow groups separated by 1px vertical dividers at 50% opacity.

**Group 1 — Transport:**
- Play/Stop button
- BPM input (with subtle background box)
- Engine selector (dropdown with icons/labels)

**Group 2 — Edit:**
- Undo button
- Redo button
- Graph toggle button

**Group 3 — Share:**
- Share button
- Gist export button
- Collection/achievements button
- Language switcher

**Removed from toolbar:**
- Record button (rarely used, confusing for beginners)
- Settings button (moved to activity bar)
- Side panel toggle (replaced by activity bar)
- Help panel button (merged into Reference section in sidebar)

**Visual treatment:**
- Active buttons: subtle background highlight (`var(--color-bg-hover)`)
- Engine selector border reflects active engine color
- Mobile (<768px): Groups 2+3 collapse into overflow menu

### 3. Visualizer Zone

Audio-only visualizers. Creatures and brain moved to sidebar.

**Available panels:** Waveform | Spectrum | Timeline | Pianoroll

**Toggle bar:**
- Segmented pill control (not individual buttons)
- Active panels filled, inactive outlined
- Max 3 active at once — clicking a 4th deactivates the leftmost
- Labels hidden on mobile, icons only

**Default state:** Waveform + Spectrum (2 panels, 50/50 split)

**Sizing:**
- Equal width split between active panels (no individual resize)
- Zone height resizable via drag handle (15-40%)
- Min zone height: 100px

**Visual polish:**
- 1px border between panels
- Subtle gradient top edge per panel matching visualizer accent color
- Seamless background between toggle bar and panels

### 4. Detail Panel Sections

5 collapsible accordion sections. Each has: icon + label + chevron header. Multiple can be open simultaneously.

**1. Samples**
Engine-aware browser. Strudel shows Dirt-Samples, Tone.js shows synth types, WebAudio shows oscillators/nodes. Search + category accordion. Click to insert engine-correct code.

**2. Reference**
Searchable API docs grouped by: Sounds, Pattern, Effects, Controls, Tonal, Mini-Notation, Sample Manipulation.

**3. Console**
Intercepted console output with timestamps. Color-coded log/warn/error. Clear button.

**4. Creatures**
Live creature cards replacing the old BeatlingPanel. Each card: species icon, name, stage, XP bar, emotion emoji. Click to expand: neural stats (neurons, synapses, firings, IQ), consciousness (phi bar), evolution progress. Replaces BeatlingPanel + BrainPanel.

**5. Settings**
Audio device selector, font size slider, keybinding mode (Default/Vim/Emacs/VS Code), zen mode toggle, highlight events toggle, line numbers toggle, line wrap toggle.

**State persistence:** Section open/closed state saved to localStorage.

### 5. Typography & Spacing

Strict hierarchy — no ad-hoc sizes.

| Element | Size | Weight | Font | Color |
|---------|------|--------|------|-------|
| Section headings | 13px | semibold | sans | `--color-text` |
| Labels | 11px | medium | sans | `--color-text-muted` |
| Values / data | 11px | bold | mono | `--color-text` |
| Code | 13px | normal | mono | `--color-text` |
| Small meta | 10px | normal | mono | `--color-text-muted` |

**Spacing rules:**
- 8px gap between grouped items
- 16px gap between groups
- Toolbar padding: 0 12px
- Min touch target: 32px
- No raw px values in components — only spacing tokens

### 6. Status Bar

Height: 24px (reduced from 28px). Three zones, single line, never wraps.

**Left:** Engine badge — colored dot + short name (no "Engine:" label)

**Center:** BPM display (read-only mirror) + status indicator (Ready/Playing with colored dot)

**Right:** XP bar with level number — compact

**Removed:**
- File count (visible in tabs already)
- Creature count (moved to sidebar Creatures header)
- Streak counter (shown as session start toast only)

## Migration Notes

### Components to create:
- `ActivityBar.tsx` — new atom, icon strip left sidebar
- `DetailPanel.tsx` — new organism, replaces current SidePanel
- `CreaturesSidebar.tsx` — new organism, replaces BeatlingPanel + BrainPanel in visualizer zone
- `VisualizerTogglePills.tsx` — new molecule, segmented control replacing current toggle buttons

### Components to modify:
- `EditorLayout.tsx` — 3-column layout with activity bar + detail panel
- `TransportBar.tsx` — 3 workflow groups, remove Record/Settings/Help/SidePanel buttons
- `VisualizerDashboard.tsx` — remove beatlings/brain panels, max 3 active, segmented toggle
- `StatusBar.tsx` — 3-zone redesign, remove file count/streak/creature count
- `VisualizerToggle.tsx` — replace with segmented pill control

### Components to remove:
- BeatlingPanel from visualizer zone (functionality moves to CreaturesSidebar)
- BrainPanel from visualizer zone (functionality merges into CreaturesSidebar)
- Current SidePanel (replaced by ActivityBar + DetailPanel)

### Store changes:
- Remove `showSidePanel` / `toggleSidePanel`
- Add `activeDetailSection: string | null` for activity bar state
- Add `detailPanelWidth: number` for resizable panel
- Update `visiblePanels` to remove `beatlings` and `brain` keys
- Add section open/closed state persistence

## Out of Scope

- Landing page redesign (separate spec)
- Tutorial/onboarding system (separate spec)
- New features: drag & drop, collaboration, recording, export (separate specs)
- Color palette changes (current dark theme is fine)
- New visualizer types
