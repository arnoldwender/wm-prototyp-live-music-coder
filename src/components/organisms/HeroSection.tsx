/* ----------------------------------------------------------
   HeroSection — landing page hero with animated waveform
   background, gradient headline, app badge, and pulsing CTA.
   Navigates to /editor on button click.
   ---------------------------------------------------------- */

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Icon, WaveformBackground } from '../atoms'

/** Inline keyframes for the CTA pulse glow */
const pulseGlowCSS = `
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px var(--color-primary), 0 0 20px transparent; }
  50%      { box-shadow: 0 0 12px var(--color-primary), 0 0 32px var(--color-strudel-dim); }
}
`

/** Staggered fade-in for child elements */
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const },
})

/** Landing page hero with animated waveform and gradient text */
export function HeroSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section
      className="relative flex flex-col items-center text-center px-4 py-24 overflow-hidden"
      style={{ minHeight: '70vh', justifyContent: 'center' }}
    >
      {/* Animated waveform bars behind the content */}
      <WaveformBackground />

      {/* Gradient glow orb behind headline */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, var(--color-strudel) 0%, var(--color-tonejs) 50%, transparent 70%)',
          opacity: 0.08,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Inject CTA pulse animation */}
      <style>{pulseGlowCSS}</style>

      {/* App name badge */}
      <motion.div {...fadeUp(0)} style={{ position: 'relative', zIndex: 1 }}>
        <span
          style={{
            display: 'inline-block',
            padding: 'var(--space-2) var(--space-8)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            fontFamily: 'var(--font-family-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-10)',
          }}
        >
          Live Music Coder
        </span>
      </motion.div>

      {/* Gradient headline */}
      <motion.h1
        {...fadeUp(0.15)}
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--line-height-tight)',
          marginBottom: 'var(--space-8)',
          background: 'linear-gradient(135deg, var(--color-strudel), var(--color-tonejs))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {t('landing.hero')}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        {...fadeUp(0.3)}
        className="max-w-2xl"
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'var(--font-size-xl)',
          lineHeight: 'var(--line-height-loose)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-14)',
        }}
      >
        {t('landing.subtitle')}
      </motion.p>

      {/* Pulsing CTA button */}
      <motion.div {...fadeUp(0.45)} style={{ position: 'relative', zIndex: 1 }}>
        <Button
          variant="primary"
          onClick={() => navigate('/editor')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-8) var(--space-14)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            borderRadius: 'var(--radius-lg)',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        >
          <Icon icon={Play} size={20} />
          {t('landing.cta')}
        </Button>
      </motion.div>
    </section>
  )
}
