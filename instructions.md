# Development Instructions

## Setup

```bash
git clone https://github.com/arnoldwender/wm-prototyp-live-music-coder.git
cd wm-prototyp-live-music-coder
npm install
npm run dev
```

## Development Workflow

1. Make changes in `src/`
2. Dev server hot-reloads automatically
3. Run `npm run test` to verify
4. Run `npx tsc --noEmit` to type-check
5. Commit: `git commit -m "[Action] Brief description"`
6. Deploy: `npm run build && netlify deploy --prod --dir=dist`

## Adding a New Component

Follow Atomic Design hierarchy:

- **Atom** (basic element): `src/components/atoms/MyAtom.tsx` — imports nothing from other components
- **Molecule** (group of atoms): `src/components/molecules/MyMolecule.tsx` — imports only atoms
- **Organism** (complex section): `src/components/organisms/MyOrganism.tsx` — imports molecules and atoms

Add to the corresponding `index.ts` barrel export.

## Adding a New Audio Engine

1. Create adapter in `src/lib/engines/myengine.ts` extending `BaseEngine`
2. Implement: `init()`, `createNode()`, `evaluate()`, `start()`, `stop()`
3. Register in `src/lib/engines/index.ts` → `createEngine()` switch + `ENGINE_META`
4. Add engine type to `src/types/engine.ts` → `EngineType` union
5. Add parser support in `src/lib/parser/index.ts`
6. Add codegen support in `src/lib/codegen/index.ts`
7. Add color to `src/styles/tokens/colors.css` and `src/lib/constants.ts`
8. Add i18n keys in all 3 locale files

## Adding a New Beatling Species

1. Add species name to `src/types/beatling.ts` → `Species` type
2. Define in `src/lib/beatlings/species.ts` → `SPECIES` record (name, role, color, spawnCheck, movementStyle)
3. Add movement animation in `src/lib/beatlings/renderer.ts` → `drawCreature()` switch
4. Add first-spawn achievement in `src/lib/beatlings/collection.ts`
5. Add i18n label if needed

## Adding a New Visualizer

1. Create drawing function in `src/lib/visualizers/myvis.ts` (pure function: ctx, width, height, data → void)
2. Create organism in `src/components/organisms/MyVisualizer.tsx` using `CanvasVisualizer` atom
3. Add to `VisualizerDashboard.tsx` in the active panels array
4. Add toggle key to `PanelLayout.visiblePanels` in `src/types/project.ts`
5. Add toggle button in `VisualizerToggle.tsx`
6. Add i18n key in `panels.*`

## Design Token Rules

- All colors, spacing, typography, shadows, transitions, and border-radius must use CSS custom properties
- Tokens defined in `src/styles/tokens/`
- Canvas 2D cannot use CSS variables — use `VIZ_COLORS` from `src/lib/visualizers/colors.ts`
- Exception: `0`, `none`, `inherit`, `currentColor`, `transparent`, percentage values

## Testing

- Framework: Vitest + @testing-library/react
- Colocated: `foo.test.ts` next to `foo.ts`
- Mock AnalyserNode for audio tests (no real AudioContext in jsdom)
- Store tests: reset state in `beforeEach` with `useAppStore.setState(useAppStore.getInitialState())`

## i18n

- 3 languages: DE, EN, ES
- Translation files: `src/i18n/locales/{de,en,es}.json`
- Key format: `namespace.section.key` (e.g., `transport.play`)
- Code syntax stays English; autocomplete tooltips should be translated
- Language persisted in localStorage key `lmc-lang`

## Deployment

- Platform: Netlify
- Build: `npm run build` → `dist/`
- SPA redirect configured in `netlify.toml`
- Manual deploy: `netlify deploy --prod --dir=dist`
- Site ID: `a03cf0e5-f018-4d4e-bc11-5c973fb071fc`
