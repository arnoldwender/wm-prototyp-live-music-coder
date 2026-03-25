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

  /* Override body overflow:hidden from global.css — landing page needs to scroll */
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
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Skip-to-content link for accessibility */}
      <a
        href="#hero"
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
        {/* Left: Logo linked to home */}
        <Link
          to="/"
          style={{ textDecoration: 'none', color: 'inherit' }}
          aria-label={t('nav.backToHome')}
        >
          <Logo showTagline size="sm" />
        </Link>

        {/* Right: Language switcher + CTA button */}
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

      {/* Hero with animated waveform, gradient text, and CTA */}
      <section id="hero">
        <HeroSection />
      </section>

      <SectionDivider />

      {/* Feature highlights grid with Lucide icons */}
      <FeatureGrid />

      <SectionDivider />

      {/* Pre-built example demos */}
      <ExampleGallery />

      <SectionDivider />

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

        {/* License notice */}
        <p style={{ fontSize: 'var(--font-size-xs)' }}>
          Live Music Coder — Open Source (AGPL-3.0)
        </p>
      </footer>
    </main>
  )
}

export default Landing
