// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   i18n configuration — DE/EN/ES with auto-detection.
   English is bundled eagerly (required for synchronous SSR
   prerendering and zero-cost hydration); DE and ES locale
   bundles are lazy-loaded on demand so English visitors do
   not download ~86 KB of unused translation JSON.
   ────────────────────────────────────────────────────────── */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'

/** localStorage key for persisted language preference */
const STORAGE_KEY = 'lmc-lang'

export type SupportedLocale = 'en' | 'de' | 'es'

/* Build-time prerender (src/entry-server.tsx): no window, no visitor. Node has
   its own navigator.language — the build machine's locale — so the server must
   not detect anything: src/main.tsx only hydrates English pages. */
const IS_SERVER = typeof window === 'undefined'

function isSupportedLocale(value: string): value is SupportedLocale {
  return value === 'en' || value === 'de' || value === 'es'
}

/** Detect initial language from localStorage or browser setting */
function detectLanguage(): SupportedLocale {
  if (IS_SERVER) return 'en'

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && isSupportedLocale(saved)) {
      return saved
    }
  } catch { /* localStorage unavailable */ }

  try {
    const browserLang = navigator.language.slice(0, 2)
    if (isSupportedLocale(browserLang)) {
      return browserLang
    }
  } catch { /* navigator unavailable */ }

  return 'en'
}

export const INITIAL_LANGUAGE: SupportedLocale = detectLanguage()

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    debug: false,
    showSupportNotice: false,
  })

/** Dynamically load a non-English locale bundle once before switching to it. */
export async function ensureLocaleLoaded(lng: string): Promise<void> {
  if (lng === 'de' && !i18n.hasResourceBundle('de', 'translation')) {
    const mod = await import('./locales/de.json')
    i18n.addResourceBundle('de', 'translation', mod.default, true, true)
  } else if (lng === 'es' && !i18n.hasResourceBundle('es', 'translation')) {
    const mod = await import('./locales/es.json')
    i18n.addResourceBundle('es', 'translation', mod.default, true, true)
  }
}

/** Load locale bundle if needed and switch active UI language. */
export async function switchLanguage(lng: SupportedLocale): Promise<void> {
  await ensureLocaleLoaded(lng)
  await i18n.changeLanguage(lng)
}

/* Sync <html lang> immediately to the detected language */
if (typeof document !== 'undefined') {
  document.documentElement.lang = INITIAL_LANGUAGE
}

/* Persist language choice and sync document lang attribute on change */
i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem(STORAGE_KEY, lng) } catch { /* unavailable */ }
  if (typeof document !== 'undefined') document.documentElement.lang = lng
})

/**
 * Resolves once the initial detected locale bundle is loaded and active.
 *
 * It never rejects: src/main.tsx mounts the app when this settles, so a locale
 * chunk that fails to load (offline, a deploy that replaced the hashed file)
 * would otherwise leave a German or Spanish visitor with a page that never
 * becomes interactive. The app starts in English instead.
 */
export const readyLanguagePromise: Promise<void> =
  !IS_SERVER && INITIAL_LANGUAGE !== 'en'
    ? switchLanguage(INITIAL_LANGUAGE).catch(() => {
        document.documentElement.lang = 'en'
      })
    : Promise.resolve()

export default i18n
