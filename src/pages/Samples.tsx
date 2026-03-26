/* ----------------------------------------------------------
   Samples library page — browseable grid of all Dirt-Samples
   with search, category filters, and "Try in Editor" links.
   ---------------------------------------------------------- */

import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/atoms'
import { LanguageSwitcher } from '../components/molecules'
import { usePageMeta } from '../lib/usePageMeta'
import { SAMPLE_LIBRARY, SAMPLE_CATEGORIES, BASE_SAMPLE_COUNT, TOTAL_SAMPLE_COUNT } from '../data/sample-library'
import type { SampleEntry } from '../data/sample-library'
import { encodeToUrl } from '../lib/persistence/url'

/** Category filter pill button */
function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 'var(--space-2) var(--space-4)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: active ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
        color: active ? 'var(--color-bg)' : 'var(--color-text-secondary)',
        backgroundColor: active ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
        border: '1px solid',
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

/** Single sample card in the grid */
function SampleCard({ sample, t }: { sample: SampleEntry; t: (key: string) => string }) {
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

      {/* Meta row: category + variation count */}
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
          {sample.category}
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

      {/* Code preview */}
      <code
        style={{
          display: 'block',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          color: 'var(--color-text-secondary)',
          backgroundColor: 'var(--color-bg)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-3)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {sample.example}
      </code>

      {/* Try in Editor button */}
      <button
        onClick={() => navigate(`/editor#code=${encodeToUrl({ code: sample.example, bpm: 120, engine: 'strudel' as const })}`)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
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
        {t('samples.tryInEditor')}
      </button>
    </article>
  )
}

/** Samples library page */
function Samples() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showVariations, setShowVariations] = useState(false)

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

  /* Filtered samples based on search query and active category */
  const filteredSamples = useMemo(() => {
    const query = search.toLowerCase().trim()
    return SAMPLE_LIBRARY.filter((sample: SampleEntry) => {
      /* Hide variations unless toggled on */
      if (!showVariations && sample.isVariation) return false

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
  }, [search, activeCategory, showVariations])

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

      {/* --- Header navbar --- */}
      <nav
        aria-label="Main navigation"
        className="flex items-center justify-between"
        style={{
          height: '64px',
          padding: '0 var(--space-6)',
          backgroundColor: 'var(--color-bg-alt)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          to="/"
          style={{ textDecoration: 'none', color: 'inherit' }}
          aria-label={t('nav.backToHome')}
        >
          <Logo showTagline size="sm" />
        </Link>

        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <LanguageSwitcher />
          <Link
            to="/samples"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
              fontWeight: 'var(--font-weight-bold)',
              textDecoration: 'none',
            }}
          >
            {t('nav.samples')}
          </Link>
          <Link
            to="/examples"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.examples')}
          </Link>
          <Link
            to="/docs"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.docs')}
          </Link>
          <Link
            to="/editor"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-bg)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-bold)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.openEditor')}
          </Link>
        </div>
      </nav>

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
        {/* Search bar */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <input
            type="search"
            placeholder={t('samples.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('samples.search')}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
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
        </div>

        {/* Category pills */}
        <div
          className="flex flex-wrap"
          style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}
        >
          <CategoryPill
            label={t('samples.allCategories')}
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {SAMPLE_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            />
          ))}
        </div>

        {/* Show variations toggle */}
        <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
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
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            ({filteredSamples.length} {t('samples.results')})
          </span>
        </div>
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
        {filteredSamples.map((sample, idx) => (
          <SampleCard key={`${sample.name}-${idx}`} sample={sample} t={t} />
        ))}

        {filteredSamples.length === 0 && (
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

      {/* Footer */}
      <footer
        className="text-center py-12"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <p style={{ fontSize: 'var(--font-size-xs)' }}>
          {t('footer.license')}
        </p>
      </footer>
    </main>
  )
}

export default Samples
