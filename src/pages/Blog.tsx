/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Blog listing page — /blog.
   Developer blog with tag filters, search, and sort.
   ────────────────────────────────────────────────────────── */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { SiteNav } from '../components/organisms/SiteNav'
import { FilterPill } from '../components/molecules/FilterPill'
import { SortSelect } from '../components/molecules/SortSelect'
import { Badge } from '../components/atoms'
import { BLOG_POSTS, BLOG_TAGS } from '../data/blog-library'
import type { BlogTag } from '../data/blog-library'
import { usePageMeta } from '../lib/usePageMeta'
import { useScrollablePage } from '../lib/useScrollablePage'

type SortKey = 'date-desc' | 'date-asc'

export default function Blog() {
  const { t } = useTranslation()
  useScrollablePage()

  usePageMeta({
    title: 'Blog — Live Music Coder',
    description: t('blog.metaDescription'),
    path: '/blog',
  })

  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<BlogTag | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('date-desc')

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return BLOG_POSTS.filter((post) => {
      if (activeTag && !post.tags.includes(activeTag)) return false
      if (query) {
        const fields = [post.title, post.summary, post.author.name, ...post.tags]
        if (!fields.some((f) => f.toLowerCase().includes(query))) return false
      }
      return true
    })
  }, [search, activeTag])

  const sorted = useMemo(() => {
    const items = [...filtered]
    return sortBy === 'date-asc'
      ? items.sort((a, b) => a.date.localeCompare(b.date))
      : items.sort((a, b) => b.date.localeCompare(a.date))
  }, [filtered, sortBy])

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const query = search.toLowerCase().trim()
    for (const post of BLOG_POSTS) {
      if (query) {
        const fields = [post.title, post.summary, post.author.name, ...post.tags]
        if (!fields.some((f) => f.toLowerCase().includes(query))) continue
      }
      for (const tag of post.tags) {
        counts[tag] = (counts[tag] || 0) + 1
      }
    }
    return counts
  }, [search])

  const visibleTags = useMemo(
    () => BLOG_TAGS.filter((tag) => tagCounts[tag] > 0),
    [tagCounts],
  )

  const activeFilterCount = (search.trim() ? 1 : 0) + (activeTag ? 1 : 0)

  const clearFilters = () => {
    setSearch('')
    setActiveTag(null)
    setSortBy('date-desc')
  }

  const sortOptions = [
    { value: 'date-desc', label: t('blog.sortDateDesc') },
    { value: 'date-asc', label: t('blog.sortDateAsc') },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <a href="#blog-list" className="sr-only focus:not-sr-only" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', zIndex: 100, padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-primary)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>
        Skip to blog posts
      </a>

      <SiteNav />

      {/* Hero */}
      <header className="text-center" style={{ padding: 'var(--space-8) var(--space-6) var(--space-4)' }}>
        <p style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
          {t('blog.eyebrow')}
        </p>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          {t('blog.title')}
        </h1>
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          {t('blog.subtitle')}
        </p>
      </header>

      {/* Filters */}
      <section aria-label={t('blog.filtersAriaLabel')} style={{ maxWidth: '900px', margin: '0 auto', padding: '0 var(--space-6) var(--space-4)' }}>
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 'var(--space-3)' }}>
          <input
            type="search"
            placeholder={t('blog.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 200px', minWidth: '200px', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}
          />
          <SortSelect options={sortOptions} value={sortBy} onChange={(v) => setSortBy(v as SortKey)} />
          {activeFilterCount > 0 && (
            <button type="button" onClick={clearFilters} className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: 'var(--space-1)' }}>
              <X size={12} /> {t('blog.clearFilters')}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('blog.tagLabel')}>
          {visibleTags.map((tag) => (
            <FilterPill
              key={tag}
              label={`${t(`blog.${tag}`)} (${tagCounts[tag] || 0})`}
              active={activeTag === tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            />
          ))}
        </div>
      </section>

      {/* Results */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 var(--space-6)', marginBottom: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {sorted.length} {t('blog.results')}
        </p>
      </div>

      {/* Post cards */}
      <section id="blog-list" aria-label={t('blog.listAriaLabel')} style={{ maxWidth: '900px', margin: '0 auto', padding: '0 var(--space-6) var(--space-8)' }}>
        {sorted.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8) 0' }}>
            {t('blog.noResults')}
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            {sorted.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block"
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-2)' }}>
                  <time style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                    {post.date}
                  </time>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {t('blog.readingTime', { min: post.readingTimeMin })}
                  </span>
                  {post.tags.map((tag) => (
                    <Badge key={tag}>
                      {t(`blog.${tag}`)}
                    </Badge>
                  ))}
                </div>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {post.summary}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
