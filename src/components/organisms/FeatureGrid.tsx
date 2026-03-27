/* ──────────────────────────────────────────────────────────
   FeatureGrid — premium feature showcase for the landing page.
   Bento-style grid with accent borders, icons, and stats.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next'
import { Music, GitBranch, Activity, Bug, Share2, Globe, Zap, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

interface Feature {
  icon: typeof Music
  color: string
  titleKey: string
  descKey: string
  stat?: string
  wide?: boolean
}

const features: Feature[] = [
  { icon: Zap,       color: 'var(--color-strudel)',  titleKey: 'landing.features.engines.title',     descKey: 'landing.features.engines.desc', stat: '4 Engines', wide: true },
  { icon: Activity,  color: 'var(--color-webaudio)', titleKey: 'landing.features.visualizers.title', descKey: 'landing.features.visualizers.desc', stat: '5 Panels' },
  { icon: GitBranch, color: 'var(--color-tonejs)',   titleKey: 'landing.features.graph.title',       descKey: 'landing.features.graph.desc' },
  { icon: Bug,       color: 'var(--color-midi)',     titleKey: 'landing.features.beatlings.title',   descKey: 'landing.features.beatlings.desc', stat: '6 Species' },
  { icon: Brain,     color: 'var(--color-primary)',  titleKey: 'landing.features.beatlings.title',   descKey: 'Neural brains with consciousness, emotions, and Hebbian learning' },
  { icon: Share2,    color: 'var(--color-strudel)',  titleKey: 'landing.features.share.title',       descKey: 'landing.features.share.desc' },
  { icon: Globe,     color: 'var(--color-tonejs)',   titleKey: 'landing.features.i18n.title',        descKey: 'landing.features.i18n.desc', stat: 'DE / EN / ES' },
  { icon: Music,     color: 'var(--color-webaudio)', titleKey: 'landing.features.engines.title',     descKey: '218 Dirt-Samples, 150+ curated patterns, full song templates', stat: '218+ Samples', wide: true },
]

export function FeatureGrid() {
  const { t } = useTranslation()

  return (
    <section className="px-4 py-20 max-w-5xl mx-auto">
      {/* Section header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-primary)',
        }}>
          Features
        </span>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginTop: 'var(--space-2)',
        }}>
          Everything you need to code music
        </h2>
      </motion.div>

      {/* Bento grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-3)',
      }}>
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <motion.article
              key={f.titleKey + i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
              style={{
                gridColumn: f.wide ? 'span 2' : 'span 1',
                padding: 'var(--space-5)',
                backgroundColor: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'var(--transition-fast)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = f.color
                e.currentTarget.style.boxShadow = `0 0 20px ${f.color}15`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Accent glow top-left */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '-20px',
                width: '80px',
                height: '80px',
                background: `radial-gradient(circle, ${f.color}15, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Icon + stat row */}
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
                <Icon size={20} style={{ color: f.color }} />
                {f.stat && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-family-mono)',
                    color: f.color,
                    letterSpacing: '0.05em',
                  }}>
                    {f.stat}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: 'var(--space-2)',
                position: 'relative',
                zIndex: 1,
              }}>
                {t(f.titleKey)}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                position: 'relative',
                zIndex: 1,
              }}>
                {f.descKey.startsWith('landing.') ? t(f.descKey) : f.descKey}
              </p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
