/* ----------------------------------------------------------
   ExampleGallery — pre-built starter template demos on
   the landing page. Each card shows an engine color dot
   and links to /editor with the template code in the URL hash.
   ---------------------------------------------------------- */

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { STARTER_TEMPLATES } from '../../data/templates'
import { encodeToUrl } from '../../lib/persistence/url'
import { Button, Icon } from '../atoms'

/** Map engine types to their CSS color token */
const ENGINE_DOT_COLORS: Record<string, string> = {
  strudel: 'var(--color-strudel)',
  tonejs: 'var(--color-tonejs)',
  webaudio: 'var(--color-webaudio)',
  midi: 'var(--color-midi)',
}

/** Pre-built example demos on landing page */
export function ExampleGallery() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  /** Encode template into URL hash and navigate to editor */
  const handleTryExample = (template: (typeof STARTER_TEMPLATES)[0]) => {
    const hash = encodeToUrl({ code: template.code, bpm: 120, engine: template.engine })
    navigate(`/editor#code=${hash}`)
  }

  return (
    <section id="examples" className="px-4 py-16 max-w-4xl mx-auto">
      <motion.h2
        className="text-2xl font-bold text-center mb-8"
        style={{ color: 'var(--color-text)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        {t('landing.examples')}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STARTER_TEMPLATES.map((tmpl, i) => (
          <motion.article
            key={tmpl.id}
            className="p-4 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              transition: 'var(--transition-base)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.3 + i * 0.08 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ENGINE_DOT_COLORS[tmpl.engine] ?? 'var(--color-border)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            <div className="flex items-start gap-3">
              {/* Engine color dot */}
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: ENGINE_DOT_COLORS[tmpl.engine] ?? 'var(--color-text-muted)',
                  marginTop: '6px',
                  flexShrink: 0,
                }}
              />
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {tmpl.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {tmpl.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => handleTryExample(tmpl)}
              aria-label={`${t('landing.examples')} — ${tmpl.name}`}
            >
              <Icon icon={Play} size={16} />
            </Button>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
