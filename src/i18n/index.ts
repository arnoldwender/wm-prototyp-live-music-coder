// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
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
  /* Build-time prerender (src/entry-server.tsx): no window, no visitor —
     always English. Node has a `navigator.language` of its own (the build
     machine's locale), which would make the prerendered language depend on
     where the build ran; src/main.tsx only hydrates English pages. */
  if (typeof window === 'undefined') return 'en'

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
    debug: false,
    /* i18next 25 prints a Locize notice with console.info unless this is false.
       A console.log override used to stand here and never caught it. */
    showSupportNotice: false,
  })

/* The <html lang> of index.html is "en"; match the language the app starts in.
   Until 2026-10-05 it was only updated on a later switch, so a visitor whose
   browser picked German or Spanish got German or Spanish text marked as English. */
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language
}

/* Persist language choice and sync document lang attribute on change */
i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem(STORAGE_KEY, lng) } catch { /* unavailable */ }
  if (typeof document !== 'undefined') document.documentElement.lang = lng
})

export default i18n
