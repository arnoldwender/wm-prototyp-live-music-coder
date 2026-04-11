/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Sessions listing page — `/sessions`.

   Filter pattern matches Examples and Samples pages:
   inline FilterPill rows, SortSelect dropdown, search input,
   dynamic category counts, active filter badge.
   ────────────────────────────────────────────────────────── */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { SiteNav } from '../components/organisms/SiteNav'
import { FilterPill } from '../components/molecules/FilterPill'
import { SortSelect } from '../components/molecules/SortSelect'
import {
  SESSIONS_LIBRARY,
  SESSION_CATEGORIES,
  formatSessionDuration,
} from '../data/sessions-library'
import type { SessionCategory } from '../data/sessions-library'
import { usePageMeta } from '../lib/usePageMeta'
import { useScrollablePage } from '../lib/useScrollablePage'

/* ── BPM range buckets ────────────────────────────────── */

type BpmRange = 'slow' | 'medium' | 'fast' | 'veryfast'

const BPM_RANGES: { key: BpmRange; label: string; min: number; max: number }[] = [
  { key: 'slow', label: '< 80', min: 0, max: 79 },
  { key: 'medium', label: '80–119', min: 80, max: 119 },
  { key: 'fast', label: '120–134', min: 120, max: 134 },
  { key: 'veryfast', label: '135+', min: 135, max: 999 },
]

function bpmInRange(bpm: number, range: BpmRange): boolean {
  const r = BPM_RANGES.find((b) => b.key === range)
  return r ? bpm >= r.min && bpm <= r.max : true
}

/* ── Sort keys ────────────────────────────────────────── */

type SortKey = 'title-asc' | 'title-desc' | 'bpm-asc' | 'bpm-desc' | 'date-desc' | 'date-asc'

/** Sessions listing page — `/sessions` */
export default function Sessions() {
  const { t } = useTranslation()
  useScrollablePage()

  usePageMeta({
    title: 'Sessions — Live Music Coder',
    description: t('sessions.metaDescription'),
    path: '/sessions',
  })

  /* ── Filter state ─────────────────────────────────── */

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<SessionCategory | null>(null)
  const [activeBpm, setActiveBpm] = useState<BpmRange | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('title-asc')

  /* ── Filtered items ───────────────────────────────── */

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim()
    return SESSIONS_LIBRARY.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false
      if (activeBpm && !bpmInRange(s.bpm, activeBpm)) return false
      if (query) {
        const fields = [
          s.title,
          s.subtitle,
          s.shortDescription,
          s.composerNotes,
          s.category,
          s.author.name,
          String(s.bpm),
        ]
        if (!fields.some((f) => f.toLowerCase().includes(query))) return false
      }
      return true
    })
  }, [search, activeCategory, activeBpm])

  /* ── Sorted items ─────────────────────────────────── */

  const sortedItems = useMemo(() => {
    const items = [...filteredItems]
    switch (sortBy) {
      case 'title-asc':
        return items.sort((a, b) => a.title.localeCompare(b.title))
      case 'title-desc':
        return items.sort((a, b) => b.title.localeCompare(a.title))
      case 'bpm-asc':
        return items.sort((a, b) => a.bpm - b.bpm)
      case 'bpm-desc':
        return items.sort((a, b) => b.bpm - a.bpm)
      case 'date-desc':
        return items.sort((a, b) => b.date.localeCompare(a.date))
      case 'date-asc':
        return items.sort((a, b) => a.date.localeCompare(b.date))
      default:
        return items
    }
  }, [filteredItems, sortBy])

  /* ── Category counts (excludes category filter itself) ── */

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const query = search.toLowerCase().trim()
    for (const s of SESSIONS_LIBRARY) {
      if (activeBpm && !bpmInRange(s.bpm, activeBpm)) continue
      if (query) {
        const fields = [s.title, s.subtitle, s.shortDescription, s.composerNotes, s.category, s.author.name, String(s.bpm)]
        if (!fields.some((f) => f.toLowerCase().includes(query))) continue
      }
      counts[s.category] = (counts[s.category] || 0) + 1
    }
    return counts
  }, [search, activeBpm])

  /* ── BPM counts (excludes BPM filter itself) ──────── */

  const bpmCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const query = search.toLowerCase().trim()
    for (const s of SESSIONS_LIBRARY) {
      if (activeCategory && s.category !== activeCategory) continue
      if (query) {
        const fields = [s.title, s.subtitle, s.shortDescription, s.composerNotes, s.category, s.author.name, String(s.bpm)]
        if (!fields.some((f) => f.toLowerCase().includes(query))) continue
      }
      for (const r of BPM_RANGES) {
        if (bpmInRange(s.bpm, r.key)) {
          counts[r.key] = (counts[r.key] || 0) + 1
        }
      }
    }
    return counts
  }, [search, activeCategory])

  const visibleCategories = useMemo(
    () => SESSION_CATEGORIES.filter((c) => categoryCounts[c] > 0),
    [categoryCounts],
  )

  /* ── Active filter count ──────────────────────────── */

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (search.trim()) n++
    if (activeCategory) n++
    if (activeBpm) n++
    return n
  }, [search, activeCategory, activeBpm])

  const clearFilters = () => {
    setSearch('')
    setActiveCategory(null)
    setActiveBpm(null)
    setSortBy('title-asc')
  }

  /* ── Sort options ─────────────────────────────────── */

  const sortOptions = [
    { value: 'title-asc', label: t('sessions.sortTitleAsc') },
    { value: 'title-desc', label: t('sessions.sortTitleDesc') },
    { value: 'bpm-asc', label: t('sessions.sortBpmAsc') },
    { value: 'bpm-desc', label: t('sessions.sortBpmDesc') },
    { value: 'date-desc', label: t('sessions.sortDateDesc') },
    { value: 'date-asc', label: t('sessions.sortDateAsc') },
  ]

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      {/* --- Skip-to-content for a11y --- */}
      <a
        href="#sessions-list"
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

      <SiteNav />

      {/* --- Page header --- */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: 'var(--space-12) var(--space-6) var(--space-8)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 var(--space-3)',
          }}
        >
          {t('sessions.eyebrow')}
        </p>
        <h1
          style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--line-height-tight)',
            margin: '0 0 var(--space-4)',
          }}
        >
          {t('sessions.title')}
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '640px',
            margin: '0 0 var(--space-6)',
            fontStyle: 'italic',
          }}
        >
          {t('sessions.subtitle')}
        </p>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            maxWidth: '640px',
            lineHeight: 'var(--line-height-loose)',
            margin: 0,
          }}
        >
          {t('sessions.description')}
        </p>
      </section>

      {/* --- Filters (sticky on scroll) --- */}
      <section
        className="sticky-filters"
        aria-label={t('sessions.filtersAriaLabel')}
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: 'var(--space-3) var(--space-6) 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="search"
            placeholder={t('sessions.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              paddingRight: search ? 'var(--space-10)' : 'var(--space-4)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-family-sans)',
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
          {search && (
            <button
              type="button"
              aria-label={t('sessions.clearSearch')}
              onClick={() => setSearch('')}
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

        {/* Category pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginRight: 'var(--space-2)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {t('sessions.categoryLabel')}:
          </span>
          <FilterPill
            label={t('sessions.allCategories')}
            active={activeCategory === null}
            count={SESSIONS_LIBRARY.length}
            onClick={() => setActiveCategory(null)}
          />
          {visibleCategories.map((cat) => (
            <FilterPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              count={categoryCounts[cat] || 0}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            />
          ))}
        </div>

        {/* BPM pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginRight: 'var(--space-2)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            BPM:
          </span>
          <FilterPill
            label={t('sessions.allBpm')}
            active={activeBpm === null}
            onClick={() => setActiveBpm(null)}
          />
          {BPM_RANGES.map((r) => (
            <FilterPill
              key={r.key}
              label={r.label}
              active={activeBpm === r.key}
              count={bpmCounts[r.key] || 0}
              onClick={() => setActiveBpm(activeBpm === r.key ? null : r.key)}
            />
          ))}
        </div>

        {/* Controls row: clear | count | sort */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Left: clear button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-sans)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <X size={12} />
                {t('sessions.clearFilters')} ({activeFilterCount})
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
            {sortedItems.length} {t('sessions.results')}
          </span>

          {/* Right: sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {t('sessions.sortBy')}:
            </span>
            <SortSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as SortKey)}
              options={sortOptions}
            />
          </div>
        </div>
      </section>

      {/* --- Piece list --- */}
      <section
        id="sessions-list"
        aria-label={t('sessions.listAriaLabel')}
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 var(--space-6) var(--space-16)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {sortedItems.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-12) 0',
              fontSize: 'var(--font-size-base)',
            }}
          >
            {t('sessions.noResults')}
          </p>
        )}

        {sortedItems.map((piece) => (
          <Link
            key={piece.slug}
            to={`/sessions/${piece.slug}`}
            style={{
              display: 'block',
              backgroundColor: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5) var(--space-6)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'var(--transition-fast)',
            }}
          >
            <article>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <h2
                  style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    margin: 0,
                    lineHeight: 'var(--line-height-tight)',
                    flex: 1,
                  }}
                >
                  {piece.title}
                </h2>
                {/* Category badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px var(--space-3)',
                    fontSize: '10px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {piece.category}
                </span>
              </div>
              <p
                style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  fontStyle: 'italic',
                  margin: '0 0 var(--space-3)',
                }}
              >
                {piece.subtitle}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  alignItems: 'center',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span>{piece.author.name}</span>
                {piece.author.kind === 'ai' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px var(--space-2)',
                      border: '1px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '10px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    {t('sessions.aiGenerated')}
                  </span>
                )}
                <span>·</span>
                <span>{piece.bpm} BPM</span>
                {piece.durationSec > 0 && (
                  <>
                    <span>·</span>
                    <span>{formatSessionDuration(piece.durationSec)}</span>
                  </>
                )}
                {piece.movements && (
                  <>
                    <span>·</span>
                    <span>
                      {piece.movements.length} {t('sessions.movementsLabel')}
                    </span>
                  </>
                )}
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  )
}
