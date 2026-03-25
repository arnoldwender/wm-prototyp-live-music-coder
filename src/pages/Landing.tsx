/* ----------------------------------------------------------
   Landing page — hero section, feature grid, example gallery.
   Scrollable full-page layout with nav, section dividers,
   and a powered-by footer.
   ---------------------------------------------------------- */

import { useTranslation } from 'react-i18next'
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

  return (
    <main
      className="min-h-screen overflow-y-auto"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Top bar with language switcher */}
      <nav className="flex justify-end p-4">
        <LanguageSwitcher />
      </nav>

      {/* Hero with animated waveform, gradient text, and CTA */}
      <HeroSection />

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
