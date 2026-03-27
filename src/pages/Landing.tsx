/* ----------------------------------------------------------
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
    description: 'Browser-based live coding music IDE. Write code, hear music instantly. 4 audio engines, visual node graph, real-time visualizers, and audio-reactive Beatling creatures.',
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

      {/* Stats bar — social proof */}
      <section style={{ padding: 'var(--space-12) var(--space-4)', maxWidth: '800px', margin: '0 auto' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '4', label: 'Audio Engines' },
            { value: '218+', label: 'Samples' },
            { value: '150+', label: 'Patterns' },
            { value: '6', label: 'Creature Species' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Feature highlights — bento grid */}
      <section id="features">
        <FeatureGrid />
      </section>

      <SectionDivider />

      {/* Example gallery */}
      <section id="examples">
        <ExampleGallery />
      </section>

      <SectionDivider />

      {/* Bottom CTA */}
      <section className="text-center" style={{ padding: 'var(--space-16) var(--space-4)' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
          Ready to make music?
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)', maxWidth: '400px', margin: '0 auto var(--space-8)' }}>
          No install, no signup. Open the editor and start coding.
        </p>
        <Link
          to="/editor"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-10)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-bg)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 700,
            borderRadius: 'var(--radius-lg)',
            textDecoration: 'none',
            transition: 'var(--transition-fast)',
          }}
        >
          {t('landing.cta')}
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-8) var(--space-4)', color: 'var(--color-text-muted)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Engines */}
          <div className="flex items-center gap-3" style={{ fontSize: '11px' }}>
            <EngineDot color="var(--color-strudel)" /> Strudel
            <EngineDot color="var(--color-tonejs)" /> Tone.js
            <EngineDot color="var(--color-webaudio)" /> Web Audio
            <EngineDot color="var(--color-midi)" /> MIDI
          </div>

          {/* Links */}
          <div className="flex items-center gap-4" style={{ fontSize: '11px' }}>
            <Link to="/legal" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>{t('legal.impressum')}</Link>
            <Link to="/legal#datenschutz" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>{t('legal.datenschutz')}</Link>
          </div>
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)' }}>
          {t('footer.license')}
        </p>
      </footer>
    </main>
  )
}

export default Landing
