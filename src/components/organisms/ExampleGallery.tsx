/* Example gallery — organized by category (Drums, Bass, Synth, etc.)
 * with engine color dots and click-to-try functionality. */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { STARTER_TEMPLATES, getCategories, getTemplatesByCategory } from '../../data/templates'
import { encodeToUrl } from '../../lib/persistence/url'
import { Icon } from '../atoms'

/* Engine color tokens for the dots */
const ENGINE_DOT_COLORS: Record<string, string> = {
  strudel: 'var(--color-strudel)',
  tonejs: 'var(--color-tonejs)',
  webaudio: 'var(--color-webaudio)',
  midi: 'var(--color-midi)',
}

export function ExampleGallery() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const categories = getCategories()
  const [activeCategory, setActiveCategory] = useState(categories[0])

  const handleTryExample = (template: (typeof STARTER_TEMPLATES)[0]) => {
    const hash = encodeToUrl({ code: template.code, bpm: 120, engine: template.engine })
    navigate(`/editor#code=${hash}`)
  }

  const templates = getTemplatesByCategory(activeCategory)

  return (
    <section id="examples" className="px-4 py-16 max-w-5xl mx-auto">
      <motion.h2
        className="text-2xl font-bold text-center mb-8"
        style={{ color: 'var(--color-text)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {t('landing.examples')}
      </motion.h2>

      {/* Category tabs */}
      <div
        className="flex flex-wrap justify-center gap-2 mb-8"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer"
            style={{
              backgroundColor: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
              color: activeCategory === cat ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${activeCategory === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((tmpl) => (
          <article
            key={tmpl.id}
            className="p-4 rounded-lg flex flex-col gap-2 transition-all cursor-pointer group"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
            onClick={() => handleTryExample(tmpl)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ENGINE_DOT_COLORS[tmpl.engine] ?? 'var(--color-border)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Header: engine dot + name + play button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="shrink-0"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: ENGINE_DOT_COLORS[tmpl.engine] ?? 'var(--color-text-muted)',
                  }}
                />
                <h3 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  {tmpl.name}
                </h3>
              </div>
              <span
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                <Icon icon={Play} size={14} />
              </span>
            </div>

            {/* Description */}
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {tmpl.description}
            </p>

            {/* Code preview */}
            <pre
              className="text-xs leading-relaxed overflow-hidden rounded p-2"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-mono)',
                maxHeight: '60px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {tmpl.code.slice(0, 80)}{tmpl.code.length > 80 ? '...' : ''}
            </pre>
          </article>
        ))}
      </div>
    </section>
  )
}
