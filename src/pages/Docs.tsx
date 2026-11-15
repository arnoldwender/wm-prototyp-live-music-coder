/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Documentation hub — sidebar navigation with 7 content
   sections about live coding music and using the editor.
   ---------------------------------------------------------- */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ContentSidebar, SidebarSection } from '../components/molecules'
import { SiteNav } from '../components/organisms/SiteNav'
import { SiteFooter } from '../components/organisms/SiteFooter'
import { usePageMeta } from '../lib/usePageMeta'
import { useScrollablePage } from '../lib/useScrollablePage'
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

  /* Per-page SEO meta tags — distinct canonical & title per section */
  usePageMeta({
    title: sectionId
      ? `${t(activeSection.titleKey)} — Documentation — Live Music Coder`
      : 'Documentation — Live Music Coder',
    description:
      sectionId && activeSection.content[0]?.contentKey
        ? t(activeSection.content[0].contentKey)
        : 'Learn how to use Live Music Coder: Strudel patterns, Tone.js synths, Web Audio nodes, MIDI output, and the visual node graph.',
    path: sectionId ? `/docs/${activeSection.id}` : '/docs',
  })

  /* Override body overflow for scrolling (shared hook) */
  useScrollablePage()

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
          color: 'var(--color-on-accent)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {t('a11y.skipToContent')}
      </a>

      {/* Shared top nav (single source of truth in SiteNav) */}
      <SiteNav />

      {/* --- Main layout: sidebar + content --- */}
      <div
        className="flex flex-1"
        style={{
          maxWidth: 'var(--width-content-md)',
          width: '100%',
          margin: '0 auto',
          minHeight: 'calc(100vh - var(--size-nav))',
        }}
      >
        {/* Sidebar — shared ContentSidebar with doc section links as children */}
        <ContentSidebar>
          <SidebarSection title={t('docs.sidebarTitle')}>
            {docSections.map((section) => {
              const isActive = section.id === activeId
              return (
                <li key={section.id} style={{ marginBottom: 'var(--space-1)' }}>
                  <Link
                    to={`/docs/${section.id}`}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      display: 'block',
                      padding: 'var(--space-2) var(--space-3)',
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
          </SidebarSection>
        </ContentSidebar>

        {/* Content area */}
        <main
          id="doc-content"
          tabIndex={-1}
          className="flex-1 px-6 py-8 md:p-12"
          style={{
            maxWidth: 'var(--width-content-sm)',
            minWidth: 0,
          }}
        >
          {/* Mobile section selector (sidebar is hidden below lg) */}
          <div className="lg:hidden" style={{ marginBottom: 'var(--space-6)' }}>
            <select
              aria-label={t('docs.sidebarLabel')}
              value={activeSection.id}
              onChange={(e) => navigate(`/docs/${e.target.value}`)}
              style={{
                width: '100%',
                minHeight: 'var(--size-touch)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-sans)',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {docSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {t(section.titleKey)}
                </option>
              ))}
            </select>
          </div>
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

      <SiteFooter />
    </div>
  )
}

export default Docs
