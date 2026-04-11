/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Changelog listing page — /changelog.
   Filter pattern mirrors Sessions page: FilterPill rows,
   SortSelect dropdown, search input, category badges.
   ────────────────────────────────────────────────────────── */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { SiteNav } from '../components/organisms/SiteNav'
import { FilterPill } from '../components/molecules/FilterPill'
import { SortSelect } from '../components/molecules/SortSelect'
import { MarkdownRenderer } from '../components/molecules/MarkdownRenderer'
import { Badge } from '../components/atoms'
import {
  CHANGELOG,
  CHANGELOG_CATEGORIES,
} from '../data/changelog-library'
import type { ChangelogCategory } from '../data/changelog-library'
import { usePageMeta } from '../lib/usePageMeta'
import { useScrollablePage } from '../lib/useScrollablePage'

/* Category colors for badges */
const CATEGORY_COLORS: Record<ChangelogCategory, string> = {
  feature: 'var(--color-success)',
  bugfix: 'var(--color-error)',
  content: 'var(--color-primary)',
  architecture: 'var(--color-warning)',
  community: 'var(--color-accent, var(--color-primary))',
  release: 'var(--color-info, var(--color-success))',
}

type SortKey = 'date-desc' | 'date-asc'

export default function Changelog() {
  const { t } = useTranslation()
  useScrollablePage()

  usePageMeta({
    title: 'Changelog — Live Music Coder',
    description: t('changelog.metaDescription'),
    path: '/changelog',
  })

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ChangelogCategory | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('date-desc')

  /* Filtered entries */
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return CHANGELOG.filter((entry) => {
      if (activeCategory && entry.category !== activeCategory) return false
      if (query) {
        const fields = [entry.title, entry.body, entry.category, entry.version ?? '']
        if (!fields.some((f) => f.toLowerCase().includes(query))) return false
      }
      return true
    })
  }, [search, activeCategory])

  /* Sorted entries */
  const sorted = useMemo(() => {
    const items = [...filtered]
    return sortBy === 'date-asc'
      ? items.sort((a, b) => a.date.localeCompare(b.date))
      : items.sort((a, b) => b.date.localeCompare(a.date))
  }, [filtered, sortBy])

  /* Category counts */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const query = search.toLowerCase().trim()
    for (const entry of CHANGELOG) {
      if (query) {
        const fields = [entry.title, entry.body, entry.category, entry.version ?? '']
        if (!fields.some((f) => f.toLowerCase().includes(query))) continue
      }
      counts[entry.category] = (counts[entry.category] || 0) + 1
    }
    return counts
  }, [search])

  const visibleCategories = useMemo(
    () => CHANGELOG_CATEGORIES.filter((c) => categoryCounts[c] > 0),
    [categoryCounts],
  )

  const activeFilterCount = (search.trim() ? 1 : 0) + (activeCategory ? 1 : 0)

  const clearFilters = () => {
    setSearch('')
    setActiveCategory(null)
    setSortBy('date-desc')
  }

  const sortOptions = [
    { value: 'date-desc', label: t('changelog.sortDateDesc') },
    { value: 'date-asc', label: t('changelog.sortDateAsc') },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <a href="#changelog-list" className="sr-only focus:not-sr-only" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', zIndex: 100, padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-primary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)' }}>
        {t('a11y.skipToContent')}
      </a>

      <SiteNav />

      {/* Hero — matches Sessions golden page pattern */}
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
          {t('changelog.eyebrow')}
        </p>
        <h1
          style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--line-height-tight)',
            margin: '0 0 var(--space-4)',
          }}
        >
          {t('changelog.title')}
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '640px',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          {t('changelog.subtitle')}
        </p>
      </section>

      {/* Filters — sticky on scroll */}
      <section aria-label={t('changelog.filtersAriaLabel')} className="sticky-filters" style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-3) var(--space-6) 0' }}>
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 'var(--space-3)' }}>
          <input
            type="search"
            placeholder={t('changelog.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 200px', minWidth: '200px', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}
          />
          <SortSelect options={sortOptions} value={sortBy} onChange={(v) => setSortBy(v as SortKey)} />
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: 'var(--space-1)' }}>
              <X size={12} /> {t('changelog.clearFilters')}
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('changelog.categoryLabel')}>
          {visibleCategories.map((cat) => (
            <FilterPill
              key={cat}
              label={`${t(`changelog.${cat}`)} (${categoryCounts[cat] || 0})`}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            />
          ))}
        </div>
      </section>

      {/* Results count */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 var(--space-6)', marginBottom: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {sorted.length} {t('changelog.results')}
        </p>
      </div>

      {/* Changelog timeline */}
      <section id="changelog-list" aria-label={t('changelog.listAriaLabel')} style={{ maxWidth: '960px', margin: '0 auto', padding: '0 var(--space-6) var(--space-8)' }}>
        {sorted.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8) 0' }}>
            {t('changelog.noResults')}
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            {sorted.map((entry, i) => (
              <article
                key={`${entry.date}-${i}`}
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {/* Header: date + version + category badge */}
                <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-2)' }}>
                  <time style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                    {entry.date}
                  </time>
                  {entry.version && (
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', fontFamily: 'var(--font-family-mono)' }}>
                      v{entry.version}
                    </span>
                  )}
                  <Badge color={CATEGORY_COLORS[entry.category]}>
                    {t(`changelog.${entry.category}`)}
                  </Badge>
                  {entry.pr && (
                    <a
                      href={`https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/${entry.pr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
                    >
                      #{entry.pr}
                    </a>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>
                  {entry.title}
                </h2>

                {/* Body */}
                <MarkdownRenderer content={entry.body} />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
