/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Documentation hub — sidebar navigation with 7 content
   sections about live coding music and using the editor.
   ---------------------------------------------------------- */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Logo } from '../components/atoms'
import { LanguageSwitcher } from '../components/molecules'
import { usePageMeta } from '../lib/usePageMeta'
import { docSections } from '../data/docs'
import type { DocBlock } from '../data/docs'

/* --- Render a single documentation content block --- */
function DocBlockRenderer({ block }: { block: DocBlock }) {
  const { t } = useTranslation()

  switch (block.type) {
    case 'heading':
      return (
        <h3
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text)',
            marginTop: 'var(--space-12)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {t(block.contentKey!)}
        </h3>
      )

    case 'text':
      return (
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            lineHeight: 'var(--line-height-loose)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {t(block.contentKey!)}
        </p>
      )

    case 'code':
      return (
        <pre
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-loose)',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
            overflowX: 'auto',
            color: 'var(--color-strudel)',
          }}
        >
          <code>{block.code}</code>
        </pre>
      )

    case 'list':
      return (
        <ul
          style={{
            listStyleType: 'disc',
            paddingLeft: 'var(--space-12)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {block.items!.map((itemKey) => (
            <li
              key={itemKey}
              style={{
                fontSize: 'var(--font-size-base)',
                lineHeight: 'var(--line-height-base)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {t(itemKey)}
            </li>
          ))}
        </ul>
      )

    default:
      return null
  }
}

/** Documentation page with sidebar navigation and content area */
function Docs() {
  const { t } = useTranslation()
  const { sectionId } = useParams<{ sectionId: string }>()
  const navigate = useNavigate()

  /* Default to first section when no sectionId in URL */
  const activeId = sectionId || docSections[0].id
  const activeSection = docSections.find((s) => s.id === activeId) || docSections[0]

  /* Redirect to valid section if sectionId is invalid */
  useEffect(() => {
    if (sectionId && !docSections.find((s) => s.id === sectionId)) {
      navigate('/docs', { replace: true })
    }
  }, [sectionId, navigate])

  /* Per-page SEO meta tags */
  usePageMeta({
    title: 'Documentation — Live Music Coder',
    description: 'Learn how to use Live Music Coder: Strudel patterns, Tone.js synths, Web Audio nodes, MIDI output, and the visual node graph.',
    path: '/docs',
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

  /* Scroll to top when switching sections */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeId])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      {/* Skip-to-content link for accessibility */}
      <a
        href="#doc-content"
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
        {t('docs.skipToContent')}
      </a>

      {/* --- Header navbar --- */}
      <nav
        aria-label={t('docs.navigation')}
        className="flex items-center justify-between"
        style={{
          height: '64px',
          padding: '0 var(--space-6)',
          backgroundColor: 'var(--color-bg-alt)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Left: Logo linked to home */}
        <div className="flex items-center" style={{ gap: 'var(--space-6)' }}>
          <Link
            to="/"
            style={{ textDecoration: 'none', color: 'inherit' }}
            aria-label={t('nav.backToHome')}
          >
            <Logo showTagline size="sm" />
          </Link>

          {/* Back to home text link */}
          <Link
            to="/"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
            aria-label={t('nav.backToHome')}
          >
            &larr; {t('nav.backToHome')}
          </Link>
        </div>

        {/* Right: Language switcher */}
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <LanguageSwitcher />

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

      {/* --- Main layout: sidebar + content --- */}
      <div
        className="flex"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* Sidebar navigation */}
        <aside
          aria-label={t('docs.sidebarLabel')}
          style={{
            width: '260px',
            flexShrink: 0,
            borderRight: '1px solid var(--color-border)',
            padding: 'var(--space-10) var(--space-8)',
            position: 'sticky',
            top: '64px',
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-8)',
            }}
          >
            {t('docs.sidebarTitle')}
          </h2>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {docSections.map((section) => {
              const isActive = section.id === activeId
              return (
                <li key={section.id} style={{ marginBottom: 'var(--space-2)' }}>
                  <Link
                    to={`/docs/${section.id}`}
                    style={{
                      display: 'block',
                      padding: 'var(--space-3) var(--space-4)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      backgroundColor: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {t(section.titleKey)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Content area */}
        <main
          id="doc-content"
          style={{
            flex: 1,
            padding: 'var(--space-14) var(--space-14)',
            maxWidth: '800px',
          }}
        >
          {/* Section title */}
          <h1
            style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-10)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            {t(activeSection.titleKey)}
          </h1>

          {/* Render all content blocks */}
          {activeSection.content.map((block, index) => (
            <DocBlockRenderer key={`${activeSection.id}-${index}`} block={block} />
          ))}

          {/* Bottom navigation between sections */}
          <nav
            aria-label={t('docs.pageNavigation')}
            className="flex justify-between"
            style={{
              marginTop: 'var(--space-16)',
              paddingTop: 'var(--space-10)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {/* Previous section link */}
            {docSections.findIndex((s) => s.id === activeId) > 0 ? (
              <Link
                to={`/docs/${docSections[docSections.findIndex((s) => s.id === activeId) - 1].id}`}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                &larr; {t(docSections[docSections.findIndex((s) => s.id === activeId) - 1].titleKey)}
              </Link>
            ) : (
              <span />
            )}

            {/* Next section link */}
            {docSections.findIndex((s) => s.id === activeId) < docSections.length - 1 ? (
              <Link
                to={`/docs/${docSections[docSections.findIndex((s) => s.id === activeId) + 1].id}`}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                {t(docSections[docSections.findIndex((s) => s.id === activeId) + 1].titleKey)} &rarr;
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </main>
      </div>
    </div>
  )
}

export default Docs
