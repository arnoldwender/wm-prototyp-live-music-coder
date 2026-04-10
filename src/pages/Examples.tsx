/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Examples library page — browseable grid of curated patterns
   for Strudel, Tone.js, and Web Audio with engine-aware
   category filters, difficulty pills, search, sort, and
   inline playback with NowPlayingIndicator.
   ---------------------------------------------------------- */

import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { FilterPill, SortSelect, NowPlayingIndicator } from '../components/molecules'
import { SiteNav } from '../components/organisms/SiteNav'
import { EXAMPLE_LIBRARY, EXAMPLE_CATEGORIES, TOTAL_EXAMPLE_COUNT } from '../data/example-library'
import type { ExampleEntry } from '../data/example-library'
import { ENGINE_COLORS } from '../lib/constants'
import { usePageMeta } from '../lib/usePageMeta'
import { useInlinePlayer } from '../lib/useInlinePlayer'
import { Play, Square, X } from 'lucide-react'
import type { EngineType } from '../types/engine'

/* ── Static maps ─────────────────────────────────────────── */

/** Difficulty badge color map */
const DIFFICULTY_COLORS: Record<ExampleEntry['difficulty'], string> = {
  beginner: 'var(--color-success)',
  intermediate: 'var(--color-warning)',
  advanced: 'var(--color-error)',
}

/** Engine-to-category mapping — only show relevant categories per engine */
const ENGINE_CATEGORY_MAP: Record<string, string[]> = {
  strudel: ['Beginner', 'Drums', 'Bass', 'Melody', 'Ambient', 'Cinematic', 'World', 'Experimental'],
  tonejs: ['Tone.js Synths', 'Tone.js Effects', 'Tone.js Sequencing', 'Tone.js Routing', 'Tone.js Advanced'],
  webaudio: ['Web Audio Basics', 'Web Audio Filters', 'Web Audio Effects', 'Web Audio Routing', 'Web Audio Synthesis'],
}

/** Category display name to i18n key mapping */
const CATEGORY_I18N_MAP: Record<string, string> = {
  'Beginner': 'examples.categoryBeginner',
  'Drums': 'examples.categoryDrums',
  'Bass': 'examples.categoryBass',
  'Melody': 'examples.categoryMelody',
  'Ambient': 'examples.categoryAmbient',
  'Cinematic': 'examples.categoryCinematic',
  'World': 'examples.categoryWorld',
  'Experimental': 'examples.categoryExperimental',
  'Tone.js Synths': 'examples.categoryTjSynths',
  'Tone.js Effects': 'examples.categoryTjEffects',
  'Tone.js Sequencing': 'examples.categoryTjSequencing',
  'Tone.js Routing': 'examples.categoryTjRouting',
  'Tone.js Advanced': 'examples.categoryTjAdvanced',
  'Web Audio Basics': 'examples.categoryWaBasics',
  'Web Audio Filters': 'examples.categoryWaFilters',
  'Web Audio Effects': 'examples.categoryWaEffects',
  'Web Audio Routing': 'examples.categoryWaRouting',
  'Web Audio Synthesis': 'examples.categoryWaSynthesis',
}

/** Engine labels for filter pills — id, label, color */
const ENGINE_LABELS: { id: EngineType; label: string }[] = [
  { id: 'strudel', label: 'Strudel' },
  { id: 'tonejs', label: 'Tone.js' },
  { id: 'webaudio', label: 'WebAudio' },
]

/** Sort option identifiers */
type SortKey = 'name-asc' | 'name-desc' | 'category' | 'difficulty'

/* ── Helpers ──────────────────────────────────────────────── */

/** Extract sample/sound names from code for tag display */
function extractSounds(code: string): string[] {
  const sounds = new Set<string>()
  /* Match s("name"), sound("name"), .s("name") */
  const sMatches = code.matchAll(/(?:^|\.)s(?:ound)?\s*\(\s*["']([^"']+)["']/g)
  for (const m of sMatches) m[1].split(/\s+/).forEach(s => sounds.add(s.replace(/[*/?<>[\](),:]+.*/, '')))
  /* Match note("...").s("name") */
  const noteS = code.matchAll(/\.s\s*\(\s*["']([^"']+)["']/g)
  for (const m of noteS) sounds.add(m[1])
  /* Match Tone.js synth types */
  const toneTypes = code.matchAll(/new\s+Tone\.(\w*Synth)/g)
  for (const m of toneTypes) sounds.add(m[1])
  /* Match oscillator types */
  const oscTypes = code.matchAll(/type\s*[=:]\s*["'](sine|square|sawtooth|triangle|custom)["']/g)
  for (const m of oscTypes) sounds.add(m[1])
  return Array.from(sounds).filter(s => s.length > 0 && s.length < 20).slice(0, 8)
}

/* ── ExampleCard ─────────────────────────────────────────── */

/** Single example pattern card with play/edit actions */
function ExampleCard({
  example,
  t,
  playingId,
  onPlay,
}: {
  example: ExampleEntry
  t: (key: string) => string
  playingId: string | null
  onPlay: (id: string, code: string, engine: EngineType) => void
}) {
  const navigate = useNavigate()
  const sounds = useMemo(() => extractSounds(example.code), [example.code])
  const isPlaying = playingId === example.id

  /* Translated category display name */
  const categoryLabel = CATEGORY_I18N_MAP[example.category]
    ? t(CATEGORY_I18N_MAP[example.category])
    : example.category

  return (
    <article
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        transition: 'var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = ENGINE_COLORS[example.engine]
        e.currentTarget.style.boxShadow = `0 0 12px ${ENGINE_COLORS[example.engine]}22`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top row: name + engine dot */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
        <h3
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          {example.name}
        </h3>
        {/* Engine color dot + label */}
        <span
          className="flex items-center gap-1"
          aria-label={`Engine: ${example.engine}`}
          style={{ fontSize: '10px', color: 'var(--color-text-muted)', flexShrink: 0 }}
        >
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: ENGINE_COLORS[example.engine],
          }} />
          {example.engine === 'strudel' ? 'Strudel' : example.engine === 'tonejs' ? 'Tone.js' : 'WebAudio'}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          margin: 0,
          marginBottom: 'var(--space-3)',
          lineHeight: 'var(--line-height-base)',
          flex: 1,
        }}
      >
        {example.description}
      </p>

      {/* Meta row: translated category + difficulty badge */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 'var(--space-3)' }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-elevated)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {categoryLabel}
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: DIFFICULTY_COLORS[example.difficulty],
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {t(`examples.${example.difficulty}`)}
        </span>
      </div>

      {/* Sounds used in this pattern */}
      {sounds.length > 0 && (
        <div className="flex flex-wrap gap-1" style={{ marginBottom: 'var(--space-3)' }}>
          {sounds.map((s) => (
            <span
              key={s}
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-family-mono)',
                color: ENGINE_COLORS[example.engine],
                backgroundColor: 'var(--color-bg)',
                padding: '1px var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${ENGINE_COLORS[example.engine]}33`,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Code preview — first 3 lines */}
      <pre
        style={{
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          color: 'var(--color-text-secondary)',
          backgroundColor: 'var(--color-bg)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-3)',
          overflow: 'hidden',
          maxHeight: '72px',
          lineHeight: 'var(--line-height-base)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {example.code.split('\n').slice(0, 3).join('\n')}
        {example.code.split('\n').length > 3 ? '\n...' : ''}
      </pre>

      {/* Play + Edit buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPlay(example.id, example.code, example.engine); }}
          aria-label={isPlaying ? 'Stop' : 'Play'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            backgroundColor: isPlaying ? ENGINE_COLORS[example.engine] : 'var(--color-bg)',
            color: isPlaying ? 'var(--color-bg)' : ENGINE_COLORS[example.engine],
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
        >
          {isPlaying ? <Square size={12} /> : <Play size={12} />}
        </button>
        <button
          type="button"
          onClick={() =>
            navigate('/editor', {
              state: {
                share: {
                  code: example.code,
                  bpm: 120,
                  engine: example.engine,
                },
              },
            })
          }
          style={{
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-bg)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
        >
          {t('examples.tryInEditor')}
        </button>
      </div>
    </article>
  )
}

/* ── Examples page ───────────────────────────────────────── */

/** Examples library page */
function Examples() {
  const { t } = useTranslation()

  /* Filter state */
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeDifficulty, setActiveDifficulty] = useState<ExampleEntry['difficulty'] | null>(null)
  const [activeEngine, setActiveEngine] = useState<EngineType | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('name-asc')

  /* Inline player */
  const { playingId, play, stop } = useInlinePlayer()

  /* NowPlaying state — track name/engine of currently playing example */
  const [playingName, setPlayingName] = useState('')
  const [playingEngine, setPlayingEngine] = useState<EngineType>('strudel')

  /** Play handler — stores name/engine for NowPlayingIndicator */
  const handlePlay = async (id: string, code: string, engine: EngineType) => {
    if (playingId === id) {
      await stop()
      return
    }
    /* Find the example name for the indicator */
    const example = EXAMPLE_LIBRARY.find((e) => e.id === id)
    if (example) {
      setPlayingName(example.name)
      setPlayingEngine(example.engine as EngineType)
    }
    await play(id, code, engine)
  }

  /* Per-page SEO meta tags */
  usePageMeta({
    title: 'Code Examples — Live Music Coder',
    description: '165+ curated live coding patterns for Strudel, Tone.js, and Web Audio. Browse by category and difficulty, then load directly into the editor.',
    path: '/examples',
  })

  /* Override body overflow for scrolling */
  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    return () => {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    }
  }, [])

  /* ── Engine change resets invalid categories ────────── */
  const handleEngineChange = (engine: EngineType | null) => {
    setActiveEngine(engine)
    /* Reset category if it doesn't exist for the new engine */
    if (engine && activeCategory) {
      const validCats = ENGINE_CATEGORY_MAP[engine] || []
      if (!validCats.includes(activeCategory)) {
        setActiveCategory(null)
      }
    }
  }

  /* ── Visible categories depend on selected engine ──── */
  const visibleCategories = useMemo(() => {
    if (!activeEngine) return EXAMPLE_CATEGORIES
    return ENGINE_CATEGORY_MAP[activeEngine] || EXAMPLE_CATEGORIES
  }, [activeEngine])

  /* ── Filtered examples — includes ALL state deps ───── */
  const filteredExamples = useMemo(() => {
    const query = search.toLowerCase().trim()
    return EXAMPLE_LIBRARY.filter((example: ExampleEntry) => {
      /* Engine filter */
      if (activeEngine && example.engine !== activeEngine) return false

      /* Category filter */
      if (activeCategory && example.category !== activeCategory) return false

      /* Difficulty filter */
      if (activeDifficulty && example.difficulty !== activeDifficulty) return false

      /* Search filter */
      if (query) {
        const matchesName = example.name.toLowerCase().includes(query)
        const matchesDesc = example.description.toLowerCase().includes(query)
        const matchesTags = example.tags.some(tag => tag.toLowerCase().includes(query))
        const matchesCat = example.category.toLowerCase().includes(query)
        const matchesCode = example.code.toLowerCase().includes(query)
        return matchesName || matchesDesc || matchesTags || matchesCat || matchesCode
      }

      return true
    })
  }, [search, activeCategory, activeDifficulty, activeEngine])

  /* ── Sorted examples ───────────────────────────────── */
  const sortedExamples = useMemo(() => {
    const arr = [...filteredExamples]
    switch (sortBy) {
      case 'name-asc': return arr.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc': return arr.sort((a, b) => b.name.localeCompare(a.name))
      case 'category': return arr.sort((a, b) => a.category.localeCompare(b.category))
      case 'difficulty': {
        const order = { beginner: 0, intermediate: 1, advanced: 2 }
        return arr.sort((a, b) => order[a.difficulty] - order[b.difficulty])
      }
      default: return arr
    }
  }, [filteredExamples, sortBy])

  /* ── Category counts — respects engine + difficulty + search, NOT category ── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const query = search.toLowerCase().trim()

    for (const example of EXAMPLE_LIBRARY) {
      /* Engine filter */
      if (activeEngine && example.engine !== activeEngine) continue

      /* Difficulty filter */
      if (activeDifficulty && example.difficulty !== activeDifficulty) continue

      /* Search filter */
      if (query) {
        const matchesName = example.name.toLowerCase().includes(query)
        const matchesDesc = example.description.toLowerCase().includes(query)
        const matchesTags = example.tags.some(tag => tag.toLowerCase().includes(query))
        const matchesCat = example.category.toLowerCase().includes(query)
        const matchesCode = example.code.toLowerCase().includes(query)
        if (!(matchesName || matchesDesc || matchesTags || matchesCat || matchesCode)) continue
      }

      counts[example.category] = (counts[example.category] || 0) + 1
    }

    return counts
  }, [search, activeDifficulty, activeEngine])

  /* ── Active filter count — for "Clear filters" badge ─ */
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (search.trim()) count++
    if (activeEngine) count++
    if (activeCategory) count++
    if (activeDifficulty) count++
    return count
  }, [search, activeEngine, activeCategory, activeDifficulty])

  /** Reset all filters to defaults */
  const clearFilters = () => {
    setSearch('')
    setActiveEngine(null)
    setActiveCategory(null)
    setActiveDifficulty(null)
    setSortBy('name-asc')
  }

  /* Sort options with translated labels */
  const sortOptions = useMemo(() => [
    { value: 'name-asc', label: t('examples.sortName') },
    { value: 'name-desc', label: t('examples.sortNameDesc') },
    { value: 'category', label: t('examples.sortCategory') },
    { value: 'difficulty', label: t('examples.sortDifficulty') },
  ], [t])

  const difficulties: ExampleEntry['difficulty'][] = ['beginner', 'intermediate', 'advanced']

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Skip-to-content for a11y */}
      <a
        href="#example-grid"
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 'var(--space-2)',
          left: 'var(--space-2)',
          zIndex: 100,
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {t('a11y.skipToContent')}
      </a>

      {/* Shared top nav (single source of truth in SiteNav) */}
      <SiteNav />

      {/* --- Page header --- */}
      <header
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--space-12) var(--space-6) var(--space-6)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-3)',
          }}
        >
          {t('examples.title')}
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {TOTAL_EXAMPLE_COUNT} {t('examples.patterns')}
        </p>
      </header>

      {/* --- Search and filter controls --- */}
      <section
        id="filters"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-6) var(--space-6)',
        }}
      >
        {/* Row 1: Search bar with clear button */}
        <div style={{ marginBottom: 'var(--space-4)', position: 'relative' }}>
          <input
            type="search"
            placeholder={t('examples.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('examples.search')}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              paddingRight: search ? 'var(--space-10)' : 'var(--space-4)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              transition: 'var(--transition-fast)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
          {/* Clear X button — only visible when search has text */}
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Row 2: Engine filter pills with colored dots */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginRight: 'var(--space-2)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {t('examples.engine')}:
          </span>
          <FilterPill
            label={t('examples.allEngines')}
            active={activeEngine === null}
            onClick={() => handleEngineChange(null)}
          />
          {ENGINE_LABELS.map(({ id, label }) => (
            <FilterPill
              key={id}
              label={label}
              color={ENGINE_COLORS[id]}
              active={activeEngine === id}
              onClick={() => handleEngineChange(activeEngine === id ? null : id)}
            />
          ))}
        </div>

        {/* Row 3: Category pills with count badges — engine-aware */}
        <div
          className="flex flex-wrap"
          style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}
        >
          <FilterPill
            label={t('examples.allCategories')}
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {visibleCategories.map((cat) => (
            <FilterPill
              key={cat}
              label={CATEGORY_I18N_MAP[cat] ? t(CATEGORY_I18N_MAP[cat]) : cat}
              active={activeCategory === cat}
              count={categoryCounts[cat] || 0}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            />
          ))}
        </div>

        {/* Row 4: Difficulty pills with colored dots */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginRight: 'var(--space-2)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {t('examples.difficulty')}:
          </span>
          <FilterPill
            label={t('examples.allLevels')}
            active={activeDifficulty === null}
            onClick={() => setActiveDifficulty(null)}
          />
          {difficulties.map((diff) => (
            <FilterPill
              key={diff}
              label={t(`examples.${diff}`)}
              color={DIFFICULTY_COLORS[diff]}
              active={activeDifficulty === diff}
              onClick={() => setActiveDifficulty(activeDifficulty === diff ? null : diff)}
            />
          ))}
        </div>

        {/* Row 5: Controls — active filters + clear | result count | sort */}
        <div
          className="flex items-center justify-between flex-wrap"
          style={{
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Left: active filter count + clear */}
          <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-1) var(--space-3)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <X size={12} />
                {t('examples.clearFilters')} ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Center: result count */}
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {sortedExamples.length} {t('examples.results')}
          </span>

          {/* Right: sort dropdown */}
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {t('examples.sortBy')}:
            </span>
            <SortSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as SortKey)}
              options={sortOptions}
            />
          </div>
        </div>
      </section>

      {/* --- Example card grid --- */}
      <section
        id="example-grid"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-6) var(--space-12)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {sortedExamples.map((example) => (
          <ExampleCard key={example.id} example={example} t={t} playingId={playingId} onPlay={handlePlay} />
        ))}

        {sortedExamples.length === 0 && (
          <p
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-12)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {t('examples.noResults')}
          </p>
        )}
      </section>

      {/* Footer with legal links — TMG requires Impressum reachable from every page */}
      <footer
        className="text-center py-12"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <p style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-2)' }}>
          {t('footer.license')}
        </p>
        <p style={{ fontSize: 'var(--font-size-xs)' }}>
          <Link to="/legal" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Impressum</Link>
          {' | '}
          <Link to="/legal#datenschutz" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Datenschutz</Link>
        </p>
        <p className="flex items-center justify-center gap-2 mt-3" style={{ fontSize: 'var(--font-size-xs)' }}>
          <a href="https://arnoldwender.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Arnold Wender</a>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <a href="https://wendermedia.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Wender Media</a>
        </p>
      </footer>

      {/* NowPlayingIndicator — floating bottom-right */}
      <NowPlayingIndicator
        isPlaying={playingId !== null}
        label={playingName}
        engineType={playingEngine}
        onStop={stop}
      />
    </main>
  )
}

export default Examples
