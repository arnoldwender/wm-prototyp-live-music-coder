# Live Music Coder — Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement each phase plan task-by-task.

**Goal:** Build a browser-based live coding music IDE with code editor, visual node graph, 4 audio engines, visualizer dashboard, and audio-reactive Beatling mascot ecosystem.

**Architecture:** Hybrid approach — Strudel core for pattern evaluation, custom engine orchestrator for multi-engine routing, code editor as source of truth with node graph as derived view. Pure SPA on Vite + React 19 + TypeScript.

**Tech Stack:** React 19, Vite 8, TypeScript, Zustand 5, Tailwind CSS 4, CodeMirror 6, React Flow, @strudel/core, Tone.js, Web Audio API, WebMidi.js, Canvas 2D, i18next, idb, Framer Motion 12

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md`

---

## Phase Dependency Graph

```
Phase 1: Core Foundation
    ↓
Phase 2: Orchestrator & Engines ←──── Phase 3: Code Editor
    ↓                                      ↓
Phase 4: Node Graph (depends on 2 + 3)
    ↓
Phase 5: Visualizer Dashboard (depends on 2)
    ↓
Phase 6: Beatling Ecosystem (depends on 5)
    ↓
Phase 7: Persistence & Sharing (depends on 1 + 2)
    ↓
Phase 8: Landing Page & Onboarding (depends on all)
```

## Phase Summary

| Phase | Plan File | Depends On | Produces |
|-------|-----------|------------|----------|
| 1. Core Foundation | `phase-01-core-foundation.md` | Nothing | Scaffold, tokens, store, layout shell, i18n, routing, test infra |
| 2. Orchestrator & Engines | `phase-02-orchestrator-engines.md` | Phase 1 | AudioContext, engine adapters, orchestrator, cross-engine bridge |
| 3. Code Editor | `phase-03-code-editor.md` | Phase 1 | CodeMirror 6, multi-tab, per-engine syntax, @strudel/codemirror |
| 4. Node Graph & Sync | `phase-04-node-graph-sync.md` | Phase 2, 3 | React Flow, bidirectional code sync, codegen, parser |
| 5. Visualizer Dashboard | `phase-05-visualizers.md` | Phase 2 | Waveform, spectrum, pattern timeline, Canvas 2D renderers |
| 6. Beatling Ecosystem | `phase-06-beatlings.md` | Phase 5 | 6 species, dual-brain, GoL, evolution, collection, renderer |
| 7. Persistence & Sharing | `phase-07-persistence.md` | Phase 1, 2 | IndexedDB autosave, URL sharing, Gist integration, audio recording |
| 8. Landing & Onboarding | `phase-08-landing-onboarding.md` | All | Landing page, first-run tutorial, help panel, starter templates |

## Execution Strategy

- Execute phases sequentially (1 → 2 → 3 → ... → 8)
- Phases 2 and 3 can run in parallel (both depend only on Phase 1)
- Each phase produces working, testable software
- Commit after every task within a phase
- Each phase plan is written just-in-time before execution (avoids stale plans)

## Testing Strategy

- **Vitest** as test runner (integrates with Vite)
- **@testing-library/react** for component tests
- Tests focus on critical logic: orchestrator, engines, persistence, sync
- UI components get basic render tests, not exhaustive interaction tests
- Test files colocated: `src/lib/orchestrator/graph.test.ts` next to `graph.ts`
