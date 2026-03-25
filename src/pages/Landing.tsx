/* ──────────────────────────────────────────────────────────
   Landing page — hero section with CTA to enter the editor.
   LanguageSwitcher in top-right, centered hero content.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Button, Icon } from '../components/atoms'
import { LanguageSwitcher } from '../components/molecules'

function Landing() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Top bar with language switcher */}
      <nav className="flex justify-end p-4 shrink-0">
        <LanguageSwitcher />
      </nav>

      {/* Hero section — centered vertically and horizontally */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <h1
          style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {t('landing.hero')}
        </h1>

        <p
          className="max-w-xl"
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-base)',
          }}
        >
          {t('landing.subtitle')}
        </p>

        {/* CTA button with Play icon */}
        <Button
          variant="primary"
          onClick={() => navigate('/editor')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-6) var(--space-12)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            marginTop: 'var(--space-4)',
          }}
        >
          <Icon icon={Play} size={20} />
          {t('landing.cta')}
        </Button>
      </main>
    </div>
  )
}

export default Landing
