/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   LanguageSwitcher molecule — DE/EN/ES toggle buttons
   with Globe icon. Active language is highlighted.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { Button, Icon } from '../atoms'

/** Supported locale codes */
const LANGUAGES = ['de', 'en', 'es'] as const

/** Language switcher with globe icon and locale buttons */
function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1">
      {/* Globe indicator icon */}
      <Icon icon={Globe} size={16} className="opacity-60" />

      {/* Language buttons */}
      {LANGUAGES.map((lang) => (
        <Button
          key={lang}
          variant="ghost"
          active={i18n.language === lang}
          onClick={() => i18n.changeLanguage(lang)}
          aria-label={lang.toUpperCase()}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {lang}
        </Button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
