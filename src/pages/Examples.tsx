/* ----------------------------------------------------------
   Examples library page — browseable grid of curated Strudel
   patterns with search, category/difficulty filters, and
   "Try in Editor" links.
   ---------------------------------------------------------- */

import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/atoms'
import { LanguageSwitcher } from '../components/molecules'
import { EXAMPLE_LIBRARY, EXAMPLE_CATEGORIES, TOTAL_EXAMPLE_COUNT } from '../data/example-library'
import type { ExampleEntry } from '../data/example-library'
import { encodeToUrl } from '../lib/persistence/url'

/** Difficulty badge color map */
const DIFFICULTY_COLORS: Record<ExampleEntry['difficulty'], string> = {
  beginner: 'var(--color-success)',
  intermediate: 'var(--color-warning)',
  advanced: 'var(--color-error)',
}

/** Category filter pill */
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

/** Single example pattern card */
function ExampleCard({ example, t }: { example: ExampleEntry; t: (key: string) => string }) {
  const navigate = useNavigate()

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
        e.currentTarget.style.borderColor = 'var(--color-strudel)'
        e.currentTarget.style.boxShadow = '0 0 12px rgba(168, 85, 247, 0.15)'
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
        {/* Engine color dot — always Strudel purple */}
        <span
          aria-label={`Engine: ${example.engine}`}
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-strudel)',
            flexShrink: 0,
          }}
        />
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

      {/* Meta row: category + difficulty badge */}
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
          {example.category}
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

      {/* Try button */}
      <button
        onClick={() => navigate(`/editor#code=${encodeToUrl({ code: example.code, bpm: 120, engine: example.engine })}`)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
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
    </article>
  )
}

/** Examples library page */
function Examples() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeDifficulty, setActiveDifficulty] = useState<ExampleEntry['difficulty'] | null>(null)

  /* Override body overflow — this page needs to scroll */
  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    return () => {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    }
  }, [])

  /* Filtered examples based on search, category, and difficulty */
  const filteredExamples = useMemo(() => {
    const query = search.toLowerCase().trim()
    return EXAMPLE_LIBRARY.filter((example: ExampleEntry) => {
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
  }, [search, activeCategory, activeDifficulty])

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
        Skip to content
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
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.samples')}
          </Link>
          <Link
            to="/examples"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
              fontWeight: 'var(--font-weight-bold)',
              textDecoration: 'none',
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
            placeholder={t('examples.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('examples.search')}
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
            label={t('examples.allCategories')}
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {EXAMPLE_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            />
          ))}
        </div>

        {/* Difficulty pills */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}
        >
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginRight: 'var(--space-2)' }}>
            {t('examples.difficulty')}:
          </span>
          <CategoryPill
            label={t('examples.allLevels')}
            active={activeDifficulty === null}
            onClick={() => setActiveDifficulty(null)}
          />
          {difficulties.map((diff) => (
            <CategoryPill
              key={diff}
              label={t(`examples.${diff}`)}
              active={activeDifficulty === diff}
              onClick={() => setActiveDifficulty(activeDifficulty === diff ? null : diff)}
            />
          ))}
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginLeft: 'var(--space-2)',
            }}
          >
            ({filteredExamples.length} {t('examples.results')})
          </span>
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
        {filteredExamples.map((example) => (
          <ExampleCard key={example.id} example={example} t={t} />
        ))}

        {filteredExamples.length === 0 && (
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

      {/* Footer */}
      <footer
        className="text-center py-12"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <p style={{ fontSize: 'var(--font-size-xs)' }}>
          Live Music Coder — Open Source (AGPL-3.0)
        </p>
      </footer>
    </main>
  )
}

export default Examples
