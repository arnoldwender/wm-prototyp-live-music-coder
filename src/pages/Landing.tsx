/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Landing page — header navbar, hero section, feature grid,
   example gallery, desktop download CTA, and shared footer.
   ---------------------------------------------------------- */

import { useTranslation } from 'react-i18next'
import { HeroSection } from '../components/organisms/HeroSection'
import { FeatureGrid } from '../components/organisms/FeatureGrid'
import { ExampleGallery } from '../components/organisms/ExampleGallery'
import { SiteNav } from '../components/organisms/SiteNav'
import { SiteFooter } from '../components/organisms/SiteFooter'
import { usePageMeta } from '../lib/usePageMeta'
import { useScrollablePage } from '../lib/useScrollablePage'
import { isElectron } from '../lib/platform'

/** Subtle horizontal divider with center fade */
function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        maxWidth: 'var(--width-content-sm)',
        margin: '0 auto',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)',
      }}
    />
  )
}

/** Landing page — hero + features + examples */
function Landing() {
  const { t } = useTranslation()

  /* Per-page SEO meta tags */
  usePageMeta({
    title: 'Live Music Coder — Browser-Based Live Coding Music IDE',
    description: 'Browser-based live coding music IDE. Write code, hear music instantly. 4 audio engines, visual node graph, real-time visualizers, and instant code sharing.',
    path: '/',
  })

  /* Override body overflow for scrolling (shared hook) */
  useScrollablePage()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Skip-to-content link for accessibility */}
      <a
        href="#main-content"
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

      {/* --- Shared top navbar (single source of truth) --- */}
      <SiteNav />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* Hero with animated waveform, gradient text, and CTA */}
        <section id="hero">
          <HeroSection />
        </section>

        {/* In Electron: show ONLY hero + footer (slim splash screen).
            On the web: show full marketing page with features, examples, download. */}
        {!isElectron && (
          <>
            <SectionDivider />

            {/* Feature highlights grid with Lucide icons */}
            <FeatureGrid />

            <SectionDivider />

            {/* Pre-built example demos */}
            <ExampleGallery />

            <SectionDivider />

            {/* Desktop app download section — web only */}
            <section
              id="download"
              className="flex flex-col items-center text-center px-4 py-16 max-w-6xl mx-auto"
            >
              <h2
                style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-3)',
                  lineHeight: 'var(--line-height-tight)',
                }}
              >
                {t('landing.download.title')}
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-8)',
                  maxWidth: '520px',
                  lineHeight: 'var(--line-height-base)',
                }}
              >
                {t('landing.download.subtitle')}
              </p>

              {/* CTA button */}
              <a
                href="https://github.com/arnoldwender/wm-prototyp-live-music-coder/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-4) var(--space-8)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'var(--transition-fast)',
                  minHeight: 'var(--size-touch-comfortable)',
                }}
              >
                {t('landing.download.cta')}
              </a>

              {/* Platform availability */}
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  marginTop: 'var(--space-4)',
                  letterSpacing: 'var(--letter-spacing-normal)',
                }}
              >
                {t('landing.download.platforms')}
              </p>
            </section>
          </>
        )}
      </main>

      <SiteFooter showPoweredBy />
    </div>
  )
}

export default Landing
