/* ----------------------------------------------------------
   FeatureGrid — 3-column grid of feature highlight cards
   on the landing page. Uses Lucide icons and i18n translations.
   ---------------------------------------------------------- */

import { useTranslation } from 'react-i18next'
import { Music, GitBranch, Activity, Bug, Share2, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { Icon } from '../atoms'
import { FeatureCard } from '../molecules/FeatureCard'

/** Feature definition with Lucide icon, accent color, and i18n key */
interface FeatureDef {
  iconComponent: typeof Music
  accentColor: string
  titleKey: string
  descKey: string
}

/** 6 key capabilities — icons mapped to engine accent colors */
const features: FeatureDef[] = [
  { iconComponent: Music,     accentColor: 'var(--color-strudel)',  titleKey: 'landing.features.engines.title',     descKey: 'landing.features.engines.desc' },
  { iconComponent: GitBranch, accentColor: 'var(--color-tonejs)',   titleKey: 'landing.features.graph.title',       descKey: 'landing.features.graph.desc' },
  { iconComponent: Activity,  accentColor: 'var(--color-webaudio)', titleKey: 'landing.features.visualizers.title', descKey: 'landing.features.visualizers.desc' },
  { iconComponent: Bug,       accentColor: 'var(--color-midi)',     titleKey: 'landing.features.beatlings.title',   descKey: 'landing.features.beatlings.desc' },
  { iconComponent: Share2,    accentColor: 'var(--color-strudel)',  titleKey: 'landing.features.share.title',       descKey: 'landing.features.share.desc' },
  { iconComponent: Globe,     accentColor: 'var(--color-tonejs)',   titleKey: 'landing.features.i18n.title',        descKey: 'landing.features.i18n.desc' },
]

/** Feature highlights grid on landing page */
export function FeatureGrid() {
  const { t } = useTranslation()

  return (
    <section id="features" className="px-4 py-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.titleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
          >
            <FeatureCard
              icon={<Icon icon={f.iconComponent} size={24} />}
              accentColor={f.accentColor}
              title={t(f.titleKey)}
              description={t(f.descKey)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
