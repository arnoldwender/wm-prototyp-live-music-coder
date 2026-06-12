
# Gemini (Antigravity) Workspace Configuration

**Owner:** Arnold Wender (arnold.wender@gmail.com)
**Project:** wm-prototyp-live-music-coder

This file inherits from the global `GEMINI.md` and provides specific context for this prototype.

## Prototype Context

**Description:** Browser-based live coding music IDE. Write code, hear music instantly.

**Tech Stack:**
@codemirror/autocomplete, @codemirror/commands, @codemirror/lang-javascript, @codemirror/language, @codemirror/search, @codemirror/state, @codemirror/view, @lezer/highlight, @octokit/rest, @replit/codemirror-vim, @strudel/codemirror, @strudel/core, @strudel/draw, @strudel/midi, @strudel/mini, @strudel/osc, @strudel/serial, @strudel/soundfonts, @strudel/tonal, @strudel/transpiler, @strudel/web, @strudel/webaudio, @strudel/xen, @tailwindcss/vite, @xyflow/react, electron-log, electron-updater, framer-motion, i18next, idb, lucide-react, lz-string, react, react-dom, react-i18next, react-router-dom, tailwindcss, tone, webmidi, zustand

## Local Rules (from CLAUDE.md)
# Live Music Coder — Claude Code Instructions

## Project Overview

Browser-based live coding music IDE. Vite 8 + React 19 + TypeScript 5.9 SPA.
Deployed to Netlify at https://live-music-coder.pro. Also ships as an Electron desktop app.

**Dual license:** AGPL-3.0-or-later (combined app / Strudel files) + MIT (original components).
Every source file has an `SPDX-License-Identifier` header — always preserve it.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 + CSS custom properties (design tokens) |
| State | Zustand 5 |
| Code Editor | CodeMirror 6 |
| Audio | Strudel (@strudel/*), Tone.js, Web Audio API, WebMidi.js |
| Visualizers | Canvas 2D + requestAnimationFrame |
| i18n | i18next + react-i18next (DE / EN / ES) |
| Testing | Vitest 4 + Testing Library |
| Desktop | Electron (optional build) |

## Critical: Strudel evalScope

Strudel functions are only accessible inside evaluated code if registered via `evalScope`.
The WRONG approach (`window.X = ...`) often fails in the REPL `Function()` context.
The ONLY correct approach:

```typescript
import { evalScope } from '@strudel/core';
await evalScope(import('@strudel/midi'));
```

`initStrudel()` already pre-registers core, mini, tonal, webaudio. Load all other
packages (`@strudel/midi`, `@strudel/draw`, `@strudel/xen`, etc.) separately via evalScope.

## Audio Chain

```
User code → transpiler → Strudel REPL → superdough → destinationGain → AnalyserNode → speakers
                                                            |
                                                     Visualizers (Canvas 2D)
```

After evaluate, call `resetStrudelTap()` with retries (superdough initializes lazily):
```typescript
resetStrudelTap();
[100, 300, 600, 1000, 2000].forEach(ms => setTimeout(() => resetStrudelTap(), ms));
```

## Atomic Design — Component Hierarchy

```
src/components/
  atoms/      # Indivisible (Button, Toggle, 



## Global Rules

(Inherited from global `/Users/arnold/Development/GEMINI.md`)

# Gemini (Antigravity) Workspace Configuration

**Owner:** Arnold Wender (arnold.wender@gmail.com)  
**Workspace:** `/Users/arnold/Development`

This file is the authoritative source of instructions for Gemini (Antigravity IDE) operating in Arnold's workspace. It synthesizes rules from `CLAUDE.md` and `instructions.md`.

## 1. Reasoner Autonomy Directive — STRICT RULE

**Override:** Execute without asking. If a directive is outlined here or in an authorized specification, **DO NOT ASK FOR PERMIS...
