/* ──────────────────────────────────────────────────────────
   i18n configuration — DE/EN/ES with auto-detection
   Priority: localStorage → browser language → English
   ────────────────────────────────────────────────────────── */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import de from './locales/de.json'
import es from './locales/es.json'

/** localStorage key for persisted language preference */
const STORAGE_KEY = 'lmc-lang'

/** Detect initial language from localStorage or browser setting */
function detectLanguage(): string {
  /* Check saved preference first */
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && ['en', 'de', 'es'].includes(saved)) {
    return saved
  }

  /* Fall back to browser language (first two chars) */
  const browserLang = navigator.language.slice(0, 2)
  if (['en', 'de', 'es'].includes(browserLang)) {
    return browserLang
  }

  /* Default to English */
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      es: { translation: es },
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      /* React already escapes output */
      escapeValue: false,
    },
  })

/* Persist language choice on change */
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
})

export default i18n
