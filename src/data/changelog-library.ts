/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Changelog library — structured release history derived from
   real git commits and pull requests.  Each entry maps to a
   meaningful milestone in the project timeline.

   Content language is English (matching the README).
   DE/ES translations live in each entry's optional `i18n` field
   so the /changelog page renders in the user's selected locale.
   ────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */

/** High-level category for a changelog entry. */
export type ChangelogCategory =
  | 'feature'
  | 'bugfix'
  | 'content'
  | 'architecture'
  | 'community'
  | 'release'

/** Ordered list of categories for UI display. */
export const CHANGELOG_CATEGORIES: ChangelogCategory[] = [
  'release',
  'feature',
  'content',
  'bugfix',
  'architecture',
  'community',
]

/** Per-locale override for title + body of a changelog entry. */
export interface ChangelogEntryLocale {
  title: string
  body: string
}

/** A single changelog entry. */
export interface ChangelogEntry {
  /** Semver tag this entry belongs to, if applicable. */
  version?: string
  /** ISO calendar date (YYYY-MM-DD). */
  date: string
  /** Short headline for the entry (English). */
  title: string
  /** Entry category. */
  category: ChangelogCategory
  /** Markdown body with details (English). */
  body: string
  /** GitHub PR number, if the change went through a PR. */
  pr?: number
  /** Optional DE/ES translations — falls back to English if absent. */
  i18n?: {
    de?: ChangelogEntryLocale
    es?: ChangelogEntryLocale
  }
}

/* ══════════════════════════════════════════════════════════
   Changelog entries — newest first
   ══════════════════════════════════════════════════════════ */

export const CHANGELOG: ChangelogEntry[] = [

  /* ── Synth UI: Phase 1 + Phase 2 ────────────────────── */

  {
    date: '2026-04-12',
    title: 'Synth UI Phase 2 — Knob, FilterCurve, FilterControl',
    category: 'feature',
    body: [
      'Added three new components: a Knob atom (SVG 270° arc, pointer-drag coarse,',
      'Shift+drag fine, double-click reset), a FilterCurve atom (Canvas frequency',
      'response 20Hz–20kHz log scale, colors from CSS design tokens), and a',
      'FilterControl molecule (cutoff + resonance knobs, LP/HP/BP/Notch type',
      'buttons, live curve). Audio path: a BiquadFilterNode is inserted per-note',
      'in playOscillatorNote via setLmcFilter (window.__lmcSetFilter). Zustand',
      'stores synthFilterType, synthFilterCutoff, synthFilterResonance.',
      '19 new tests across 3 test files.',
    ].join('\n'),
    pr: 46,
    i18n: {
      de: {
        title: 'Synth UI Phase 2 — Knob, FilterCurve, FilterControl',
        body: [
          'Drei neue Komponenten: ein Knob-Atom (SVG-270°-Bogen, Zeiger-Drag grob,',
          'Shift+Drag fein, Doppelklick-Reset), ein FilterCurve-Atom (Canvas-Frequenzgang',
          '20Hz–20kHz logarithmisch, Farben aus CSS-Design-Tokens) und ein FilterControl-Molekül',
          '(Cutoff + Resonanz-Knobs, LP/HP/BP/Notch-Typbuttons, Live-Kurve).',
          'Audiokette: Pro Note wird ein BiquadFilterNode in playOscillatorNote',
          'über setLmcFilter (window.__lmcSetFilter) eingefügt. Zustand speichert',
          'synthFilterType, synthFilterCutoff, synthFilterResonance.',
          '19 neue Tests in 3 Testdateien.',
        ].join('\n'),
      },
      es: {
        title: 'Synth UI Fase 2 — Knob, FilterCurve, FilterControl',
        body: [
          'Tres nuevos componentes: átomo Knob (arco SVG 270°, arrastre grueso,',
          'Shift+arrastre fino, doble clic para reset), átomo FilterCurve (Canvas de',
          'respuesta en frecuencia 20Hz–20kHz escala logarítmica, colores de tokens CSS)',
          'y molécula FilterControl (knobs de cutoff + resonancia, botones LP/HP/BP/Notch,',
          'curva en vivo). Ruta de audio: se inserta un BiquadFilterNode por nota en',
          'playOscillatorNote vía setLmcFilter (window.__lmcSetFilter). Zustand almacena',
          'synthFilterType, synthFilterCutoff, synthFilterResonance.',
          '19 nuevos tests en 3 archivos.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-12',
    title: 'Synth UI Phase 1 — VirtualKeyboard, OscillatorSelector, SynthPanel',
    category: 'feature',
    body: [
      'Added an on-screen virtual keyboard and synth controls panel.',
      'VirtualKeyboard atom: 2-octave piano, QWERTY key mapping (a/w/s/e/d…),',
      'velocity from Y-position. OscillatorSelector molecule: 4 waveform radio',
      'buttons (sine/saw/square/triangle). SynthPanel organism: collapsible panel',
      'shown when a MIDI device is connected. WaveformIcon atom: SVG path icons',
      'for waveform types. Physical MIDI keyboard and VirtualKeyboard share the',
      'same playOscillatorNote path via window.__lmcPlayNote.',
      '15 new tests across 4 test files.',
    ].join('\n'),
    pr: 45,
    i18n: {
      de: {
        title: 'Synth UI Phase 1 — VirtualKeyboard, OscillatorSelector, SynthPanel',
        body: [
          'Bildschirm-Klaviatur und Synthsteuerungsbereich hinzugefügt.',
          'VirtualKeyboard-Atom: 2-Oktaven-Klavier, QWERTY-Tastaturbelegung (a/w/s/e/d…),',
          'Anschlagstärke aus der Y-Position. OscillatorSelector-Molekül: 4 Wellenform-',
          'Radiobuttons (Sinus/Sägezahn/Rechteck/Dreieck). SynthPanel-Organismus:',
          'einklappbares Panel, das bei verbundenem MIDI-Gerät erscheint.',
          'WaveformIcon-Atom: SVG-Pfad-Icons für Wellenformen.',
          'Physische MIDI-Tastatur und VirtualKeyboard teilen denselben',
          'playOscillatorNote-Pfad via window.__lmcPlayNote.',
          '15 neue Tests in 4 Testdateien.',
        ].join('\n'),
      },
      es: {
        title: 'Synth UI Fase 1 — VirtualKeyboard, OscillatorSelector, SynthPanel',
        body: [
          'Teclado virtual en pantalla y panel de controles de síntesis.',
          'Átomo VirtualKeyboard: piano de 2 octavas, mapeo QWERTY (a/w/s/e/d…),',
          'velocidad por posición Y. Molécula OscillatorSelector: 4 botones de tipo',
          'de onda (seno/sierra/cuadrada/triángulo). Organismo SynthPanel: panel',
          'plegable que aparece al conectar un dispositivo MIDI.',
          'Átomo WaveformIcon: iconos SVG para los tipos de onda.',
          'El teclado MIDI físico y el VirtualKeyboard comparten el mismo camino',
          'playOscillatorNote vía window.__lmcPlayNote.',
          '15 nuevos tests en 4 archivos.',
        ].join('\n'),
      },
    },
  },

  /* ── v1.0.2 sprint: MIDI keyboard + Strudel parity ───── */

  {
    version: '1.0.2',
    date: '2026-04-11',
    title: 'MIDI keyboard input via @strudel/midi CDN',
    category: 'feature',
    body: [
      'Added full MIDI keyboard support through `@strudel/midi` loaded via CDN.',
      'The `midin()` and `midikeys()` functions are now available in the REPL scope.',
      'Getting there required 6 PRs (#39-#44): the core challenge was that bare',
      'module specifiers cannot resolve inside the eval sandbox, so the final',
      'solution loads the package through `REPL.evaluate()` which places the',
      'symbols in the correct Strudel scope.',
    ].join('\n'),
    pr: 43,
    i18n: {
      de: {
        title: 'MIDI-Keyboard-Eingabe via @strudel/midi CDN',
        body: [
          'Vollständige MIDI-Keyboard-Unterstützung über per CDN geladenes `@strudel/midi`.',
          'Die Funktionen `midin()` und `midikeys()` stehen jetzt im REPL-Scope zur Verfügung.',
          'Der Weg dorthin erforderte 6 PRs (#39–#44): Die Kernherausforderung war,',
          'dass nackte Modulspezifizierer im Eval-Sandbox nicht auflösen können.',
          'Die finale Lösung lädt das Paket über `REPL.evaluate()`, was die Symbole',
          'in den richtigen Strudel-Scope platziert.',
        ].join('\n'),
      },
      es: {
        title: 'Entrada de teclado MIDI vía CDN @strudel/midi',
        body: [
          'Soporte completo de teclado MIDI a través de `@strudel/midi` cargado vía CDN.',
          'Las funciones `midin()` y `midikeys()` están ahora disponibles en el ámbito REPL.',
          'El camino requirió 6 PRs (#39–#44): el reto principal fue que los módulos',
          'bare no se resuelven dentro del sandbox eval. La solución final carga el',
          'paquete a través de `REPL.evaluate()` que coloca los símbolos en el ámbito',
          'Strudel correcto.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-11',
    title: 'Full Strudel feature parity',
    category: 'feature',
    body: [
      'Complete Strudel parity: slider with `sliderWithID` exposed globally,',
      'inline visualizer widgets (`_pianoroll`, `_scope`), xen/microtonal,',
      'soundfonts, OSC, serial, `onKey`, `createParams`, clock sync for',
      'multi-tab jam sessions, `_$:` muting syntax, and all `all()` transforms.',
    ].join('\n'),
    pr: 27,
    i18n: {
      de: {
        title: 'Vollständige Strudel-Funktionsparität',
        body: [
          'Komplette Strudel-Parität: Slider mit global verfügbarem `sliderWithID`,',
          'Inline-Visualizer-Widgets (`_pianoroll`, `_scope`), Xen/Mikrotonalik,',
          'Soundfonts, OSC, Seriell, `onKey`, `createParams`, Takt-Sync für',
          'Multi-Tab-Jamsessions, `_$:`-Stummschaltungssyntax und alle `all()`-Transformationen.',
        ].join('\n'),
      },
      es: {
        title: 'Paridad completa de funciones con Strudel',
        body: [
          'Paridad completa con Strudel: slider con `sliderWithID` expuesto globalmente,',
          'widgets de visualizador en línea (`_pianoroll`, `_scope`), xen/microtonal,',
          'soundfonts, OSC, serial, `onKey`, `createParams`, sincronización de reloj',
          'para sesiones multipestaña, sintaxis de silenciamiento `_$:` y todas',
          'las transformaciones `all()`.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-11',
    title: '190+ code examples across all engines',
    category: 'content',
    body: [
      'The example library now contains over 190 patterns: 7 MIDI input,',
      '9 synth sound design, 13 test patterns (slider, pianoroll, scope,',
      'samples, layers, filter, trance, blues, ambient, chiptune, euclidean),',
      'plus the original collection covering Strudel, Tone.js, Web Audio,',
      'and MIDI output.',
    ].join('\n'),
    pr: 34,
    i18n: {
      de: {
        title: 'Über 190 Code-Beispiele für alle Engines',
        body: [
          'Die Beispielbibliothek enthält jetzt über 190 Muster: 7 MIDI-Eingabe,',
          '9 Synthklang-Design, 13 Testmuster (Slider, Pianoroll, Scope, Samples,',
          'Schichten, Filter, Trance, Blues, Ambient, Chiptune, Euklid),',
          'plus die ursprüngliche Sammlung für Strudel, Tone.js, Web Audio',
          'und MIDI-Ausgabe.',
        ].join('\n'),
      },
      es: {
        title: 'Más de 190 ejemplos de código para todos los motores',
        body: [
          'La biblioteca de ejemplos ahora contiene más de 190 patrones: 7 de entrada MIDI,',
          '9 de diseño de sonido sintetizado, 13 patrones de prueba (slider, pianoroll,',
          'scope, samples, capas, filtro, trance, blues, ambient, chiptune, euclidean),',
          'más la colección original de Strudel, Tone.js, Web Audio y salida MIDI.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-11',
    title: 'DAW-quality piano roll rewrite',
    category: 'feature',
    body: [
      'Rewrote the piano roll from scratch to match DAW standards.',
      'Scrolling timeline, velocity-mapped colors, note labels,',
      'zoom controls, and a dark theme that integrates with the',
      'editor color scheme via `var(--color-*)` tokens.',
    ].join('\n'),
    pr: 17,
    i18n: {
      de: {
        title: 'DAW-qualitative Piano-Roll-Neuentwicklung',
        body: [
          'Das Piano-Roll von Grund auf neu geschrieben für DAW-Standard.',
          'Scrollende Timeline, geschwindigkeitsmappierte Farben, Notenbeschriftungen,',
          'Zoom-Steuerung und ein dunkles Design, das über `var(--color-*)`-Tokens',
          'in das Editor-Farbschema integriert ist.',
        ].join('\n'),
      },
      es: {
        title: 'Reescritura del piano roll con calidad DAW',
        body: [
          'El piano roll fue reescrito desde cero para cumplir estándares DAW.',
          'Timeline con desplazamiento, colores mapeados por velocidad, etiquetas',
          'de notas, controles de zoom y un tema oscuro integrado con el esquema',
          'de color del editor via tokens `var(--color-*)`.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-10',
    title: '7 visualizers: punchcard, spiral, pitchwheel added',
    category: 'feature',
    body: [
      'The visualizer dashboard now has 7 Canvas 2D renderers:',
      'waveform, spectrum, timeline (shipped in v1.0.0), plus new',
      'punchcard (PR #18), spiral and pitchwheel (PR #21).',
      'All draw at 60fps using `requestAnimationFrame` and share',
      'a single `AnalyserNode` tap.',
    ].join('\n'),
    pr: 21,
    i18n: {
      de: {
        title: '7 Visualizer: Punchcard, Spiral, Pitchwheel hinzugefügt',
        body: [
          'Das Visualizer-Dashboard hat jetzt 7 Canvas-2D-Renderer:',
          'Waveform, Spectrum, Timeline (in v1.0.0 geliefert), plus neues',
          'Punchcard (PR #18), Spiral und Pitchwheel (PR #21).',
          'Alle zeichnen mit 60fps via `requestAnimationFrame` und teilen',
          'einen einzigen `AnalyserNode`-Tap.',
        ].join('\n'),
      },
      es: {
        title: '7 visualizadores: Punchcard, Spiral, Pitchwheel añadidos',
        body: [
          'El panel de visualizadores ahora tiene 7 renderizadores Canvas 2D:',
          'waveform, spectrum, timeline (incluidos en v1.0.0), más los nuevos',
          'punchcard (PR #18), spiral y pitchwheel (PR #21).',
          'Todos dibujan a 60fps con `requestAnimationFrame` y comparten',
          'un único tap `AnalyserNode`.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-10',
    title: 'Settings panel with 4 themes, vim mode, zen mode',
    category: 'feature',
    body: [
      'New settings panel with 4 editor themes, configurable font size,',
      'vim keybindings toggle, zen mode (distraction-free fullscreen),',
      'and persistent preference storage via `localStorage`.',
    ].join('\n'),
    pr: 22,
    i18n: {
      de: {
        title: 'Einstellungsbereich mit 4 Themes, Vim-Modus, Zen-Modus',
        body: [
          'Neuer Einstellungsbereich mit 4 Editor-Themes, konfigurierbarer Schriftgröße,',
          'Vim-Tastaturkürzeln, Zen-Modus (ablenkungsfreier Vollbildmodus) und',
          'dauerhafter Präferenzspeicherung via `localStorage`.',
        ].join('\n'),
      },
      es: {
        title: 'Panel de ajustes con 4 temas, modo Vim, modo Zen',
        body: [
          'Nuevo panel de ajustes con 4 temas de editor, tamaño de fuente configurable,',
          'atajos de teclado Vim, modo Zen (pantalla completa sin distracciones) y',
          'almacenamiento persistente de preferencias vía `localStorage`.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-10',
    title: 'Console panel, sample import, gamepad API',
    category: 'feature',
    body: [
      'Added three new modules: a console panel for `console.log` output',
      'from evaluated code, a drag-and-drop sample import zone for custom',
      'audio files, and Gamepad API bindings for hardware controller input.',
    ].join('\n'),
    pr: 20,
    i18n: {
      de: {
        title: 'Konsolenbereich, Sample-Import, Gamepad-API',
        body: [
          'Drei neue Module hinzugefügt: ein Konsolenbereich für `console.log`-Ausgaben',
          'aus ausgewertetem Code, eine Drag-and-Drop-Sample-Importzone für eigene',
          'Audiodateien und Gamepad-API-Bindungen für Hardware-Controller-Eingaben.',
        ].join('\n'),
      },
      es: {
        title: 'Panel de consola, importación de samples, API Gamepad',
        body: [
          'Tres nuevos módulos: un panel de consola para la salida `console.log`',
          'del código evaluado, una zona de importación de samples por arrastrar',
          'y soltar para archivos de audio personalizados y enlaces a la API Gamepad',
          'para entrada de controladores de hardware.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-11',
    title: 'Solo/mute keyboard shortcuts',
    category: 'feature',
    body: [
      'Solo and mute shortcuts wired into the editor.',
      'Uses the Strudel `_$:` muting syntax under the hood.',
      'Part of the full wiring sprint that also connected',
      '`@strudel/draw`, font size, word wrap, and flash field.',
    ].join('\n'),
    pr: 25,
    i18n: {
      de: {
        title: 'Solo/Stummschalten-Tastaturkürzel',
        body: [
          'Solo- und Stummschalten-Kürzel im Editor verknüpft.',
          'Verwendet intern die Strudel-`_$:`-Stummschaltungssyntax.',
          'Teil des vollständigen Verdrahtungssprints, der auch `@strudel/draw`,',
          'Schriftgröße, Zeilenumbruch und Flash-Feld verbunden hat.',
        ].join('\n'),
      },
      es: {
        title: 'Atajos de teclado para solo y silencio',
        body: [
          'Atajos de solo y silenciamiento integrados en el editor.',
          'Usa la sintaxis de silenciamiento `_$:` de Strudel internamente.',
          'Parte del sprint de conexión completa que también integró `@strudel/draw`,',
          'tamaño de fuente, ajuste de línea y campo flash.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-11',
    title: 'Clock sync for multi-tab jam sessions',
    category: 'feature',
    body: [
      'Strudel `createParams` and clock sync allow multiple browser',
      'tabs to lock to the same tempo. This is the foundation for',
      'collaborative live coding sessions across windows.',
    ].join('\n'),
    pr: 27,
    i18n: {
      de: {
        title: 'Taktsync für Multi-Tab-Jamsessions',
        body: [
          'Strudel `createParams` und Taktsync ermöglichen es mehreren Browser-Tabs,',
          'sich auf dasselbe Tempo einzustellen. Das ist die Grundlage für',
          'kollaborative Live-Coding-Sessions über mehrere Fenster.',
        ].join('\n'),
      },
      es: {
        title: 'Sincronización de reloj para sesiones en múltiples pestañas',
        body: [
          'Strudel `createParams` y la sincronización de reloj permiten que múltiples',
          'pestañas del navegador se bloqueen en el mismo tempo. Esta es la base',
          'para sesiones de live coding colaborativas entre ventanas.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-11',
    title: 'CSP fix for AudioWorklet and inline widgets',
    category: 'bugfix',
    body: [
      'Fixed Content Security Policy to allow `data:` URIs required by',
      'the Strudel AudioWorklet. Also wired inline widget methods',
      '(`pianoroll`, `scope`, `slider`) onto `Pattern.prototype` so',
      'they resolve correctly in the eval sandbox.',
    ].join('\n'),
    pr: 30,
    i18n: {
      de: {
        title: 'CSP-Fix für AudioWorklet und Inline-Widgets',
        body: [
          'Content Security Policy korrigiert, um `data:`-URIs für das Strudel-AudioWorklet',
          'zu erlauben. Außerdem wurden Inline-Widget-Methoden (`pianoroll`, `scope`, `slider`)',
          'auf `Pattern.prototype` verdrahtet, damit sie im Eval-Sandbox korrekt auflösen.',
        ].join('\n'),
      },
      es: {
        title: 'Corrección de CSP para AudioWorklet y widgets en línea',
        body: [
          'Corregida la Content Security Policy para permitir URIs `data:` requeridos',
          'por el AudioWorklet de Strudel. También se conectaron los métodos de widget',
          'en línea (`pianoroll`, `scope`, `slider`) a `Pattern.prototype` para que',
          'se resuelvan correctamente en el sandbox de evaluación.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-11',
    title: 'Live mode 150ms, download code, MIDI CC monitor',
    category: 'feature',
    body: [
      'Live evaluation debounce reduced to 150ms for near-instant',
      'feedback. Added code download as `.strudel` file and a MIDI',
      'panel showing real-time CC values from connected controllers.',
    ].join('\n'),
    pr: 31,
    i18n: {
      de: {
        title: 'Live-Modus 150ms, Code-Download, MIDI-CC-Monitor',
        body: [
          'Live-Auswertungs-Debounce auf 150ms reduziert für nahezu sofortiges Feedback.',
          'Code-Download als `.strudel`-Datei hinzugefügt und ein MIDI-Panel,',
          'das Echtzeit-CC-Werte von angeschlossenen Controllern anzeigt.',
        ].join('\n'),
      },
      es: {
        title: 'Modo en vivo 150ms, descarga de código, monitor MIDI CC',
        body: [
          'Debounce de evaluación en vivo reducido a 150ms para retroalimentación',
          'casi instantánea. Descarga de código como archivo `.strudel` y panel MIDI',
          'que muestra valores CC en tiempo real de los controladores conectados.',
        ].join('\n'),
      },
    },
  },

  /* ── 43 curated sessions ─────────────────────────────── */

  {
    date: '2026-04-10',
    title: '43 curated sessions across 10 genres',
    category: 'content',
    body: [
      'Built a library of 43 AI-composed live coding sessions spanning',
      '10 genre categories: Ambient, Blues, Deep Work, Dub, Electronic,',
      'Lo-Fi, Narrative, Retro, Techno, and Trance. Each session has',
      'composer notes, movement breakdowns, BPM, and duration metadata.',
      'Sessions are filterable by genre, searchable, and sortable.',
    ].join('\n'),
    pr: 16,
    i18n: {
      de: {
        title: '43 kuratierte Sessions in 10 Genres',
        body: [
          'Eine Bibliothek mit 43 KI-komponierten Live-Coding-Sessions in 10 Genre-',
          'Kategorien erstellt: Ambient, Blues, Deep Work, Dub, Electronic, Lo-Fi,',
          'Narrative, Retro, Techno und Trance. Jede Session hat Komponistennotizen,',
          'Abschnittsgliederungen, BPM und Dauermetadaten.',
          'Sessions sind nach Genre filterbar, durchsuchbar und sortierbar.',
        ].join('\n'),
      },
      es: {
        title: '43 sesiones seleccionadas en 10 géneros',
        body: [
          'Biblioteca de 43 sesiones de live coding compuestas por IA en 10 categorías:',
          'Ambient, Blues, Deep Work, Dub, Electronic, Lo-Fi, Narrative, Retro, Techno',
          'y Trance. Cada sesión incluye notas del compositor, desglose de movimientos,',
          'BPM y metadatos de duración.',
          'Las sesiones son filtrables por género, buscables y ordenables.',
        ].join('\n'),
      },
    },
  },

  /* ── v1.0.2 release ──────────────────────────────────── */

  {
    version: '1.0.2',
    date: '2026-04-09',
    title: 'v1.0.2 — Sessions, i18n, Electron UX fixes',
    category: 'release',
    body: [
      'Sessions collection with curated AI-composed live coding pieces.',
      'i18n translations for Sessions pages (DE/EN/ES). Shared SiteNav',
      'extraction. Editor handoff via router state instead of URL hash.',
      'Electron UX: hide Download CTA in desktop app, fix window chrome',
      'and updater ASI crash, fix black screen (allow-jit entitlement).',
    ].join('\n'),
    i18n: {
      de: {
        title: 'v1.0.2 — Sessions, i18n, Electron UX-Fixes',
        body: [
          'Sessions-Sammlung mit kuratierten KI-komponierten Live-Coding-Stücken.',
          'i18n-Übersetzungen für Sessions-Seiten (DE/EN/ES). Gemeinsame SiteNav-',
          'Extraktion. Editor-Übergabe via Router-Status statt URL-Hash.',
          'Electron-UX: Download-CTA in Desktop-App ausblenden, Fensterchrom und',
          'Updater-ASI-Absturz beheben, Schwarzen Bildschirm beheben (allow-jit).',
        ].join('\n'),
      },
      es: {
        title: 'v1.0.2 — Sesiones, i18n, correcciones de UX en Electron',
        body: [
          'Colección de sesiones con piezas de live coding compuestas por IA.',
          'Traducciones i18n para páginas de Sesiones (DE/EN/ES). Extracción',
          'de SiteNav compartida. Transferencia al editor vía estado del router',
          'en lugar de hash URL. Electron UX: ocultar CTA de descarga en app',
          'de escritorio, corregir cromo de ventana, bloqueo ASI del actualizador',
          'y pantalla negra (permiso allow-jit).',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-09',
    title: 'i18n: Sessions pages translated to DE/EN/ES',
    category: 'feature',
    body: [
      'All hardcoded strings in the Sessions listing and detail pages',
      'are now pulled from the i18n namespace `sessions.*`, with full',
      'German, English, and Spanish translations.',
    ].join('\n'),
    i18n: {
      de: {
        title: 'i18n: Sessions-Seiten auf DE/EN/ES übersetzt',
        body: [
          'Alle hartkodierten Zeichenketten in den Sessions-Liste- und -Detail-Seiten',
          'werden jetzt aus dem i18n-Namespace `sessions.*` geladen,',
          'mit vollständigen deutschen, englischen und spanischen Übersetzungen.',
        ].join('\n'),
      },
      es: {
        title: 'i18n: páginas de Sesiones traducidas a DE/EN/ES',
        body: [
          'Todas las cadenas codificadas en las páginas de listado y detalle de Sesiones',
          'ahora se extraen del namespace i18n `sessions.*`, con traducciones completas',
          'al alemán, inglés y español.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-09',
    title: 'Editor handoff fix — router state replaces URL hash',
    category: 'bugfix',
    body: [
      'HashRouter was clobbering the code fragment when navigating from',
      'Sessions to the Editor. Switched to passing code via React Router',
      'state object, which survives the route transition cleanly.',
    ].join('\n'),
    i18n: {
      de: {
        title: 'Editor-Übergabe-Fix — Router-Status ersetzt URL-Hash',
        body: [
          'HashRouter hat das Code-Fragment beim Navigieren von Sessions zum Editor',
          'überschrieben. Umgestellt auf Code-Übergabe via React-Router-Status-Objekt,',
          'das den Routenwechsel sauber übersteht.',
        ].join('\n'),
      },
      es: {
        title: 'Corrección de transferencia al editor — estado del router reemplaza hash URL',
        body: [
          'HashRouter sobreescribía el fragmento de código al navegar de Sesiones al Editor.',
          'Se cambió a pasar el código vía objeto de estado de React Router,',
          'que sobrevive limpiamente la transición de ruta.',
        ].join('\n'),
      },
    },
  },

  /* ── v1.0.1 release ──────────────────────────────────── */

  {
    version: '1.0.1',
    date: '2026-04-09',
    title: 'v1.0.1 — Electron 41, security hardening',
    category: 'release',
    body: [
      'Upgraded Electron 33 to 41 (fixes 17 CVEs). Fixed 11 production',
      'bugs: router, CSP, entitlements, updater, and design token issues.',
      'Added Apple code signing and notarization configuration.',
      'Fixed Vite path traversal vulnerabilities via npm audit fix.',
    ].join('\n'),
    i18n: {
      de: {
        title: 'v1.0.1 — Electron 41, Sicherheitshärtung',
        body: [
          'Electron 33 auf 41 aktualisiert (behebt 17 CVEs). 11 Produktionsfehler behoben:',
          'Router, CSP, Berechtigungen, Updater und Design-Token-Probleme.',
          'Apple-Code-Signierung und Notarisierungskonfiguration hinzugefügt.',
          'Vite-Pfad-Traversal-Schwachstellen via npm audit fix behoben.',
        ].join('\n'),
      },
      es: {
        title: 'v1.0.1 — Electron 41, refuerzo de seguridad',
        body: [
          'Actualización de Electron 33 a 41 (corrige 17 CVEs). 11 errores de producción',
          'corregidos: router, CSP, permisos, actualizador y problemas de tokens de diseño.',
          'Configuración de firma de código y notarización de Apple añadida.',
          'Vulnerabilidades de path traversal de Vite corregidas vía npm audit fix.',
        ].join('\n'),
      },
    },
  },
  {
    date: '2026-04-09',
    title: 'Electron 33 to 41 upgrade — 17 CVEs fixed',
    category: 'bugfix',
    body: [
      'Security upgrade from Electron 33 to 41, resolving 17 known',
      'CVEs. Personal identity scrubbed from code signing config.',
    ].join('\n'),
    i18n: {
      de: {
        title: 'Electron-Upgrade von 33 auf 41 — 17 CVEs behoben',
        body: [
          'Sicherheits-Upgrade von Electron 33 auf 41, das 17 bekannte CVEs behebt.',
          'Persönliche Identität aus der Code-Signing-Konfiguration entfernt.',
        ].join('\n'),
      },
      es: {
        title: 'Actualización Electron 33 a 41 — 17 CVEs corregidos',
        body: [
          'Actualización de seguridad de Electron 33 a 41, resolviendo 17 CVEs conocidos.',
          'Identidad personal eliminada de la configuración de firma de código.',
        ].join('\n'),
      },
    },
  },

  /* ── v1.0.0 initial release ──────────────────────────── */

  {
    version: '1.0.0',
    date: '2026-04-09',
    title: 'v1.0.0 — Initial public release',
    category: 'release',
    body: [
      'First public release of Live Music Coder: a browser-based and',
      'desktop live coding music IDE.',
      '',
      'Core features shipped in v1.0.0:',
      '- 4 audio engines: Strudel, Tone.js, Web Audio API, MIDI',
      '- CodeMirror 6 editor with multi-tab support and live evaluation',
      '- Visual node graph (React Flow) for block-based composition',
      '- 3 real-time Canvas 2D visualizers (waveform, spectrum, timeline)',
      '- Audio recording with WebM export',
      '- Code sharing via URL compression and GitHub Gist integration',
      '- i18n support for German, English, and Spanish',
      '- Electron desktop app for macOS (arm64 + x64) with auto-update',
      '- Zustand state management with undo/redo history',
      '- Design tokens and dark mode base via CSS custom properties',
    ].join('\n'),
    i18n: {
      de: {
        title: 'v1.0.0 — Erste öffentliche Veröffentlichung',
        body: [
          'Erste öffentliche Veröffentlichung von Live Music Coder: eine browser-',
          'und desktop-basierte Live-Coding-Musik-IDE.',
          '',
          'Kernfunktionen in v1.0.0:',
          '- 4 Audio-Engines: Strudel, Tone.js, Web Audio API, MIDI',
          '- CodeMirror-6-Editor mit Multi-Tab-Unterstützung und Live-Auswertung',
          '- Visueller Knotengraph (React Flow) für blockbasierte Komposition',
          '- 3 Echtzeit-Canvas-2D-Visualizer (Waveform, Spectrum, Timeline)',
          '- Audioaufnahme mit WebM-Export',
          '- Code-Sharing via URL-Komprimierung und GitHub-Gist-Integration',
          '- i18n-Unterstützung für Deutsch, Englisch und Spanisch',
          '- Electron-Desktop-App für macOS (arm64 + x64) mit automatischer Aktualisierung',
          '- Zustand-Statusverwaltung mit Rückgängig/Wiederholen-Verlauf',
          '- Design-Tokens und Dunkelmodus-Basis via CSS-benutzerdefinierte Eigenschaften',
        ].join('\n'),
      },
      es: {
        title: 'v1.0.0 — Primera versión pública',
        body: [
          'Primera versión pública de Live Music Coder: un IDE de música live coding',
          'basado en navegador y escritorio.',
          '',
          'Funciones principales en v1.0.0:',
          '- 4 motores de audio: Strudel, Tone.js, Web Audio API, MIDI',
          '- Editor CodeMirror 6 con soporte multipestaña y evaluación en vivo',
          '- Grafo de nodos visual (React Flow) para composición basada en bloques',
          '- 3 visualizadores Canvas 2D en tiempo real (waveform, spectrum, timeline)',
          '- Grabación de audio con exportación WebM',
          '- Compartir código vía compresión de URL e integración con GitHub Gist',
          '- Soporte i18n para alemán, inglés y español',
          '- App de escritorio Electron para macOS (arm64 + x64) con actualización automática',
          '- Gestión de estado Zustand con historial de deshacer/rehacer',
          '- Tokens de diseño y base de modo oscuro via propiedades personalizadas CSS',
        ].join('\n'),
      },
    },
  },
]

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

/**
 * Look up all changelog entries that belong to a given semver version.
 * Returns an empty array if no entries match.
 */
export function getChangelogByVersion(version: string): ChangelogEntry[] {
  return CHANGELOG.filter((entry) => entry.version === version)
}

/**
 * Return the locale-aware title and body for a changelog entry.
 * Falls back to English if the locale has no translation.
 */
export function getEntryLocale(
  entry: ChangelogEntry,
  locale: string,
): { title: string; body: string } {
  const lang = locale.split('-')[0] as 'de' | 'es'
  const override = entry.i18n?.[lang]
  return override ?? { title: entry.title, body: entry.body }
}
