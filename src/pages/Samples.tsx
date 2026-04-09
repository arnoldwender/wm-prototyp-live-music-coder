/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Samples library page — browseable grid of all Dirt-Samples
   with search, engine/category filters, sort controls,
   NowPlaying indicator, and "Try in Editor" links.
   ---------------------------------------------------------- */

import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { FilterPill, SortSelect, NowPlayingIndicator } from '../components/molecules'
import { SiteNav } from '../components/organisms/SiteNav'
import { usePageMeta } from '../lib/usePageMeta'
import { SAMPLE_LIBRARY, SAMPLE_CATEGORIES, BASE_SAMPLE_COUNT, TOTAL_SAMPLE_COUNT } from '../data/sample-library'
import type { SampleEntry } from '../data/sample-library'
import { ENGINE_COLORS } from '../lib/constants'
import { useInlinePlayer } from '../lib/useInlinePlayer'
import { Play, Square } from 'lucide-react'
import type { EngineType } from '../types/engine'

/* ── Category i18n mapping — raw names to translation keys ── */
const CATEGORY_I18N_MAP: Record<string, string> = {
  'Kicks': 'samples.categoryKicks',
  'Snares': 'samples.categorySnares',
  'Hi-Hats': 'samples.categoryHiHats',
  'Cymbals': 'samples.categoryCymbals',
  'Toms': 'samples.categoryToms',
  'Percussion': 'samples.categoryPercussion',
  '808 Kit': 'samples.category808Kit',
  '909 Kit': 'samples.category909Kit',
  'Drum Machines': 'samples.categoryDrumMachines',
  'Bass': 'samples.categoryBass',
  'Synth & Keys': 'samples.categorySynthKeys',
  'Guitar & Strings': 'samples.categoryGuitarStrings',
  'Wind & Brass': 'samples.categoryWindBrass',
  'Vocals & Speech': 'samples.categoryVocalsSpeech',
  'Noise & FX': 'samples.categoryNoiseFX',
  'Nature & Ambient': 'samples.categoryNatureAmbient',
  'Breaks & Loops': 'samples.categoryBreaksLoops',
  'Rave & Hardcore': 'samples.categoryRaveHardcore',
  'World Music': 'samples.categoryWorldMusic',
  'Retro & Games': 'samples.categoryRetroGames',
  'Stabs & Hits': 'samples.categoryStabsHits',
  'Misc': 'samples.categoryMisc',
}

/* ── Engine labels for filter pills — future-proofs multi-engine support ── */
const ENGINE_LABELS: { id: EngineType | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '' },
  { id: 'strudel', label: 'Strudel', icon: '♩' },
  { id: 'tonejs', label: 'Tone.js', icon: '🎹' },
  { id: 'webaudio', label: 'WebAudio', icon: '〰' },
]

/* ── Sort option values ── */
type SortValue = 'name-asc' | 'name-desc' | 'category' | 'variations'

/** Single sample card in the grid */
function SampleCard({
  sample,
  t,
  playingId,
  onPlay,
  translatedCategory,
}: {
  sample: SampleEntry
  t: (key: string) => string
  playingId: string | null
  onPlay: (id: string, code: string) => void
  translatedCategory: string
}) {
  const navigate = useNavigate()

  return (
    <article
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        transition: 'var(--transition-fast)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-strudel)'
        e.currentTarget.style.boxShadow = 'var(--shadow-glow-strudel)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Sample name */}
      <h3
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family-mono)',
          color: 'var(--color-primary)',
          margin: 0,
          marginBottom: 'var(--space-2)',
        }}
      >
        {sample.name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          margin: 0,
          marginBottom: 'var(--space-3)',
          lineHeight: 'var(--line-height-base)',
        }}
      >
        {sample.description}
      </p>

      {/* Meta row: translated category + variation count */}
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
          {translatedCategory}
        </span>
        {!sample.isVariation && sample.variations > 1 && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {sample.variations} {t('samples.variations')}
          </span>
        )}
      </div>

      {/* Tags */}
      {sample.tags.length > 0 && (
        <div className="flex flex-wrap gap-1" style={{ marginBottom: 'var(--space-2)' }}>
          {sample.tags.slice(0, 5).map((tag) => (
            <span key={tag} style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg)',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-sm)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Quick patterns with inline play */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-3)' }}>
        {[
          sample.example,
          `s("${sample.name}*4").gain(0.6)`,
          sample.variations > 1 ? `s("${sample.name}:${Math.floor(sample.variations / 2)}").speed(0.8)` : null,
        ].filter(Boolean).map((code, i) => {
          const patternId = `${sample.name}-${i}`
          const isPlaying = playingId === patternId
          return (
            <div key={i} className="flex items-center gap-1">
              {/* Play/Stop button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPlay(patternId, code!) }}
                aria-label={isPlaying ? 'Stop' : 'Play'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'var(--space-8)',
                  height: 'var(--space-8)',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: isPlaying ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: isPlaying ? 'var(--color-bg)' : 'var(--color-primary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {isPlaying ? <Square size={10} /> : <Play size={10} />}
              </button>
              {/* Code — click to open in editor */}
              <button
                type="button"
                onClick={() =>
                  navigate('/editor', {
                    state: {
                      share: {
                        code: code!,
                        bpm: 120,
                        engine: 'strudel' as const,
                      },
                    },
                  })
                }
                style={{
                  flex: 1,
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-mono)',
                  color: isPlaying ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  border: isPlaying ? '1px solid var(--color-primary)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition-fast)',
                }}
                title={`Open in editor: ${code}`}
              >
                {code}
              </button>
            </div>
          )
        })}
      </div>
    </article>
  )
}

/** Samples library page */
function Samples() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeEngine, setActiveEngine] = useState<EngineType | 'all'>('all')
  const [showVariations, setShowVariations] = useState(false)
  const [sortBy, setSortBy] = useState<SortValue>('name-asc')
  const [playingName, setPlayingName] = useState<string>('')
  const { playingId, play, stop } = useInlinePlayer()

  /* Handle inline play — track the sample name for NowPlayingIndicator */
  const handlePlay = async (id: string, code: string) => {
    if (playingId === id) {
      await stop()
      setPlayingName('')
      return
    }
    /* Extract the sample name from the pattern id (format: "sampleName-index") */
    const sampleName = id.replace(/-\d+$/, '')
    setPlayingName(sampleName)
    await play(id, code, 'strudel')
  }

  /* Stop handler for NowPlayingIndicator */
  const handleStop = async () => {
    await stop()
    setPlayingName('')
  }

  /* Per-page SEO meta tags */
  usePageMeta({
    title: 'Sample Library — Live Music Coder',
    description: 'Browse 218 Dirt-Samples for live coding music. Filter by category, search by name, and load samples directly into the editor.',
    path: '/samples',
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

  /* Sort options for the SortSelect dropdown */
  const sortOptions = useMemo(() => [
    { value: 'name-asc', label: t('samples.sortName') },
    { value: 'name-desc', label: t('samples.sortNameDesc') },
    { value: 'category', label: t('samples.sortCategory') },
    { value: 'variations', label: t('samples.sortVariations') },
  ], [t])

  /* Filtered samples based on search query, engine, and active category */
  const filteredSamples = useMemo(() => {
    const query = search.toLowerCase().trim()
    return SAMPLE_LIBRARY.filter((sample: SampleEntry) => {
      /* Hide variations unless toggled on */
      if (!showVariations && sample.isVariation) return false

      /* Engine filter — currently all samples are Strudel, but future-proofed */
      if (activeEngine !== 'all' && activeEngine !== 'strudel') return false

      /* Category filter */
      if (activeCategory && sample.category !== activeCategory) return false

      /* Search filter — matches name, description, tags, and category */
      if (query) {
        const matchesName = sample.name.toLowerCase().includes(query)
        const matchesDesc = sample.description.toLowerCase().includes(query)
        const matchesTags = sample.tags.some(tag => tag.toLowerCase().includes(query))
        const matchesCat = sample.category.toLowerCase().includes(query)
        return matchesName || matchesDesc || matchesTags || matchesCat
      }

      return true
    })
  }, [search, activeCategory, activeEngine, showVariations])

  /* Sorted results — applies sort after filtering */
  const sorted = useMemo(() => {
    const arr = [...filteredSamples]
    switch (sortBy) {
      case 'name-asc': return arr.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc': return arr.sort((a, b) => b.name.localeCompare(a.name))
      case 'category': return arr.sort((a, b) => a.category.localeCompare(b.category))
      case 'variations': return arr.sort((a, b) => b.variations - a.variations)
      default: return arr
    }
  }, [filteredSamples, sortBy])

  /* Category counts — computed respecting search and engine filters (not category itself) */
  const categoryCounts = useMemo(() => {
    const query = search.toLowerCase().trim()
    const counts: Record<string, number> = {}

    for (const cat of SAMPLE_CATEGORIES) {
      counts[cat] = SAMPLE_LIBRARY.filter((sample: SampleEntry) => {
        /* Respect variations toggle */
        if (!showVariations && sample.isVariation) return false
        /* Respect engine filter */
        if (activeEngine !== 'all' && activeEngine !== 'strudel') return false
        /* Must be this category */
        if (sample.category !== cat) return false
        /* Respect search query */
        if (query) {
          const matchesName = sample.name.toLowerCase().includes(query)
          const matchesDesc = sample.description.toLowerCase().includes(query)
          const matchesTags = sample.tags.some(tag => tag.toLowerCase().includes(query))
          const matchesCat = sample.category.toLowerCase().includes(query)
          return matchesName || matchesDesc || matchesTags || matchesCat
        }
        return true
      }).length
    }
    return counts
  }, [search, activeEngine, showVariations])

  /* Categories that have results for the selected engine */
  const visibleCategories = useMemo(() => {
    return SAMPLE_CATEGORIES.filter(cat => categoryCounts[cat] > 0)
  }, [categoryCounts])

  /* Total sample count (respecting variations toggle) for "N of M" display */
  const totalVisibleCount = useMemo(() => {
    return SAMPLE_LIBRARY.filter((s: SampleEntry) => {
      if (!showVariations && s.isVariation) return false
      return true
    }).length
  }, [showVariations])

  /* Determine whether any filter is active */
  const hasActiveFilters = search !== '' || activeCategory !== null || activeEngine !== 'all' || sortBy !== 'name-asc'

  /* Count how many filters are active (for the badge) */
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (search !== '') count++
    if (activeCategory !== null) count++
    if (activeEngine !== 'all') count++
    if (sortBy !== 'name-asc') count++
    return count
  }, [search, activeCategory, activeEngine, sortBy])

  /* Build the "filtered by" description for the active filter summary */
  const filterDescription = useMemo(() => {
    const parts: string[] = []
    if (search !== '') parts.push(t('samples.filterSearch'))
    if (activeCategory !== null) parts.push(t('samples.filterCategory'))
    if (activeEngine !== 'all') parts.push(t('samples.filterEngine'))
    return parts
  }, [search, activeCategory, activeEngine, t])

  /* Clear all filters to defaults */
  const clearFilters = () => {
    setSearch('')
    setActiveCategory(null)
    setActiveEngine('all')
    setSortBy('name-asc')
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Skip-to-content for a11y */}
      <a
        href="#sample-grid"
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

      {/* --- Page header with title and stats --- */}
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
          {t('samples.title')}
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {BASE_SAMPLE_COUNT} {t('samples.baseSamples')} &middot; {TOTAL_SAMPLE_COUNT} {t('samples.totalEntries')}
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
        {/* 1. Search bar — full width with clear button */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
          <input
            type="search"
            placeholder={t('samples.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('samples.search')}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              paddingRight: search ? 'var(--space-12)' : 'var(--space-4)',
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
          {/* Clear search button — only visible when search has text */}
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={t('samples.clearSearch')}
              style={{
                position: 'absolute',
                right: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'var(--space-8)',
                height: 'var(--space-8)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                borderRadius: 'var(--radius-full)',
                transition: 'var(--transition-fast)',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* 2. Filter row 1 — Engine filter pills */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-muted)',
              marginRight: 'var(--space-2)',
            }}
          >
            {t('samples.engineLabel')}
          </span>
          {ENGINE_LABELS.map((engine) => (
            <FilterPill
              key={engine.id}
              label={engine.label}
              icon={engine.icon || undefined}
              active={activeEngine === engine.id}
              color={engine.id !== 'all' ? ENGINE_COLORS[engine.id as EngineType] : undefined}
              onClick={() => setActiveEngine(activeEngine === engine.id ? 'all' : engine.id)}
            />
          ))}
        </div>

        {/* 3. Filter row 2 — Category pills with count badges */}
        <div
          className="flex flex-wrap"
          style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}
        >
          <FilterPill
            label={t('samples.allCategories')}
            active={activeCategory === null}
            count={sorted.length}
            onClick={() => setActiveCategory(null)}
          />
          {visibleCategories.map((cat) => {
            const translationKey = CATEGORY_I18N_MAP[cat]
            const label = translationKey ? t(translationKey) : cat
            return (
              <FilterPill
                key={cat}
                label={label}
                active={activeCategory === cat}
                count={categoryCounts[cat]}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              />
            )
          })}
        </div>

        {/* 4. Controls row — toggle, result count, sort, clear */}
        <div
          className="flex items-center justify-between flex-wrap"
          style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}
        >
          {/* Left: Show variations toggle + active filter count */}
          <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
            <label
              className="flex items-center"
              style={{
                gap: 'var(--space-2)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showVariations}
                onChange={(e) => setShowVariations(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              {t('samples.showVariations')}
            </label>
            {activeFilterCount > 0 && (
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {activeFilterCount} {activeFilterCount === 1 ? t('samples.activeFilter') : t('samples.activeFilters')}
              </span>
            )}
          </div>

          {/* Center: Result count */}
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {sorted.length} {t('samples.results')}
          </span>

          {/* Right: Sort dropdown + Clear filters button */}
          <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
            <SortSelect
              value={sortBy}
              onChange={(v) => setSortBy(v as SortValue)}
              options={sortOptions}
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-1) var(--space-3)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                ✕ {t('samples.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Active filter summary — only when filters are active */}
        {hasActiveFilters && filterDescription.length > 0 && (
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-1)',
              marginBottom: 0,
            }}
          >
            {t('samples.showing')} {sorted.length} {t('samples.of')} {totalVisibleCount} {t('samples.total')} ({t('samples.filteredBy')}: {filterDescription.join(', ')})
          </p>
        )}
      </section>

      {/* --- Sample card grid --- */}
      <section
        id="sample-grid"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-6) var(--space-12)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {sorted.map((sample, idx) => {
          const translationKey = CATEGORY_I18N_MAP[sample.category]
          const translatedCategory = translationKey ? t(translationKey) : sample.category
          return (
            <SampleCard
              key={`${sample.name}-${idx}`}
              sample={sample}
              t={t}
              playingId={playingId}
              onPlay={handlePlay}
              translatedCategory={translatedCategory}
            />
          )
        })}

        {sorted.length === 0 && (
          <p
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-12)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {t('samples.noResults')}
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
      </footer>

      {/* NowPlaying floating indicator — shows when a sample is playing */}
      <NowPlayingIndicator
        isPlaying={playingId !== null}
        label={playingName}
        engineType={'strudel' as EngineType}
        onStop={handleStop}
      />
    </main>
  )
}

export default Samples
