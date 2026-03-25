/* ──────────────────────────────────────────────────────────
   i18n configuration — DE/EN/ES with auto-detection
   Priority: localStorage → browser language → English
   ────────────────────────────────────────────────────────── */

/* Suppress i18next promotional console.log about Locize */
const _origLog = console.log
console.log = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('i18next')) return
  _origLog(...args)
}

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
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && ['en', 'de', 'es'].includes(saved)) {
      return saved
    }
  } catch { /* localStorage unavailable (test env, iframe, etc.) */ }

  /* Fall back to browser language (first two chars) */
  try {
    const browserLang = navigator.language.slice(0, 2)
    if (['en', 'de', 'es'].includes(browserLang)) {
      return browserLang
    }
  } catch { /* navigator unavailable */ }

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
    /* Suppress promotional messages in console */
    debug: false,
  })

/* Restore console.log after i18next init */
console.log = _origLog

/* Persist language choice on change */
i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem(STORAGE_KEY, lng) } catch { /* unavailable */ }
})

export default i18n
