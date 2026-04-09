/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Landing page — header navbar, hero section, feature grid,
   example gallery, and powered-by footer.
   ---------------------------------------------------------- */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Logo } from '../components/atoms'
import { LanguageSwitcher } from '../components/molecules'
import { HeroSection } from '../components/organisms/HeroSection'
import { FeatureGrid } from '../components/organisms/FeatureGrid'
import { ExampleGallery } from '../components/organisms/ExampleGallery'
import { usePageMeta } from '../lib/usePageMeta'
import { isElectron } from '../lib/platform'

/** Subtle horizontal divider with center fade */
function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)',
      }}
    />
  )
}

/** Small colored dot for the powered-by footer */
function EngineDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: color,
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

  /* Override body overflow for scrolling */
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    };
  }, []);

  return (
    <main
      id="main-content"
      className="min-h-screen"
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
        {/* Left: Logo linked to home */}
        <Link
          to="/"
          style={{ textDecoration: 'none', color: 'inherit' }}
          aria-label={t('nav.backToHome')}
        >
          <Logo showTagline size="sm" />
        </Link>

        {/* Right: Language switcher + Docs link + CTA button */}
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
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.examples')}
          </Link>

          <Link
            to="/sessions"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
              fontStyle: 'italic',
            }}
          >
            {t('nav.sessions')}
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

      {/* Hero with animated waveform, gradient text, and CTA */}
      <section id="hero">
        <HeroSection />
      </section>

      <SectionDivider />

      {/* Feature highlights grid with Lucide icons */}
      <section id="features">
        <FeatureGrid />
      </section>

      <SectionDivider />

      {/* Pre-built example demos */}
      <section id="examples">
        <ExampleGallery />
      </section>

      <SectionDivider />

      {/* Desktop app download section — web only.
          Hidden inside the packaged Electron app because the user is
          already running the desktop build; a "Download .dmg" CTA
          would be confusing there. */}
      {!isElectron && (
      <section
        id="download"
        className="flex flex-col items-center text-center px-4 py-16 max-w-6xl mx-auto"
      >
        <h2 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-3)',
          lineHeight: 'var(--line-height-tight)',
        }}>
          {t('landing.download.title')}
        </h2>
        <p style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-8)',
          maxWidth: '520px',
          lineHeight: 'var(--line-height-base)',
        }}>
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
            minHeight: '48px',
          }}
        >
          {t('landing.download.cta')}
        </a>

        {/* Platform availability */}
        <p style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          marginTop: 'var(--space-4)',
          letterSpacing: '0.02em',
        }}>
          macOS (Apple Silicon + Intel) — Windows &amp; Linux coming soon
        </p>
      </section>
      )}

      {!isElectron && <SectionDivider />}

      {/* Footer with powered-by engines and license */}
      <footer
        className="text-center py-12"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {/* Powered-by line with engine color dots */}
        <p
          className="flex items-center justify-center gap-3 mb-4"
          style={{ fontSize: 'var(--font-size-xs)', letterSpacing: '0.05em' }}
        >
          {t('landing.poweredBy')}
          <EngineDot color="var(--color-strudel)" />
          Strudel
          <EngineDot color="var(--color-tonejs)" />
          Tone.js
          <EngineDot color="var(--color-webaudio)" />
          Web Audio
        </p>

        {/* Legal links + GitHub + License */}
        <p className="flex items-center justify-center gap-3 mb-2" style={{ fontSize: 'var(--font-size-xs)' }}>
          <Link to="/legal" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>{t('legal.impressum')}</Link>
          <span>|</span>
          <Link to="/legal#datenschutz" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>{t('legal.datenschutz')}</Link>
          <span>|</span>
          <a
            href="https://github.com/arnoldwender/wm-prototyp-live-music-coder"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
          >
            GitHub
          </a>
        </p>
        <p style={{ fontSize: 'var(--font-size-xs)' }}>
          {t('footer.license')}
        </p>
      </footer>
    </main>
  )
}

export default Landing
