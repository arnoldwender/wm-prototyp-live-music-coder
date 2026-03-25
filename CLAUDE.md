# Live Music Coder

Live coding music IDE with visual programming, multiple audio engines, and digital creatures.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 8
- **Styling:** Tailwind CSS v4 + CSS custom properties (design tokens)
- **State:** Zustand 5
- **Routing:** React Router 7
- **i18n:** i18next + react-i18next
- **Animation:** Framer Motion 12
- **Icons:** Lucide React
- **Testing:** Vitest + Testing Library
- **Deployment:** Netlify (auto-deploy from GitHub)

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Type-check + production build
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Architecture

### Atomic Design Structure

```
src/
├── components/
│   ├── atoms/        # Button, Input, Icon, Badge, etc.
│   ├── molecules/    # FormField, NavLink, Card, etc.
│   ├── organisms/    # Header, Editor, Graph, Visualizer, etc.
│   └── seo/          # Meta tags, structured data
├── layouts/          # BaseLayout, EditorLayout
├── pages/            # Route pages
├── stores/           # Zustand stores
├── types/            # TypeScript type definitions
├── lib/              # Utilities, constants, helpers
├── styles/
│   ├── global.css    # Global styles + Tailwind import
│   └── tokens/       # Design token CSS files
└── i18n/             # Internationalization config + locales
```

### Audio Engines

- **Strudel** — Pattern-based live coding (purple #a855f7)
- **Tone.js** — Synthesizer and effects (blue #3b82f6)
- **WebAudio** — Raw Web Audio API (green #22c55e)
- **MIDI** — External MIDI device control (orange #f97316)

### Key Patterns

- Design tokens via CSS custom properties (NEVER hardcode colors/spacing)
- Semantic HTML mandatory
- All interactive elements need full state support (hover, focus, disabled, etc.)
- Dark mode only (music production aesthetic)
- Mobile-first responsive design

## Conventions

- Commits: `[Action] Brief description` format
- No co-author tags, no AI branding
- Private GitHub repo
- Auto-deploy to Netlify on push
