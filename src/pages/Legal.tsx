/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Legal page — Impressum + Datenschutz with tab navigation */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/atoms';
import { LanguageSwitcher } from '../components/molecules';
import { IMPRESSUM_HTML, DATENSCHUTZ_HTML } from '../data/legal';
import { usePageMeta } from '../lib/usePageMeta';

function Legal() {
  const { t } = useTranslation();
  const location = useLocation();
  const [tab, setTab] = useState<'impressum' | 'datenschutz'>(
    location.hash === '#datenschutz' ? 'datenschutz' : 'impressum'
  );

  /* Per-page SEO meta tags */
  usePageMeta({
    title: 'Legal — Live Music Coder',
    description: 'Impressum und Datenschutzerklärung für Live Music Coder.',
    path: '/legal',
  });

  /* Override body overflow for scrolling */
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    };
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header */}
      <nav
        aria-label="Legal page navigation"
        className="flex items-center justify-between"
        style={{ height: '64px', padding: '0 var(--space-6)', backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} aria-label={t('nav.backToHome')}>
          <Logo showTagline size="sm" />
        </Link>
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <LanguageSwitcher />
          <Link to="/editor" style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
            {t('nav.openEditor')}
          </Link>
        </div>
      </nav>

      {/* Tab navigation — ARIA tabs pattern */}
      <div role="tablist" aria-label="Legal sections" className="flex justify-center" style={{ padding: 'var(--space-4)', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
        <button
          role="tab"
          aria-selected={tab === 'impressum'}
          aria-controls="tabpanel-impressum"
          id="tab-impressum"
          onClick={() => setTab('impressum')}
          className="cursor-pointer"
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: tab === 'impressum' ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
            color: tab === 'impressum' ? 'var(--color-bg)' : 'var(--color-text-secondary)',
            border: 'none',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {t('legal.impressum')}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'datenschutz'}
          aria-controls="tabpanel-datenschutz"
          id="tab-datenschutz"
          onClick={() => setTab('datenschutz')}
          className="cursor-pointer"
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: tab === 'datenschutz' ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
            color: tab === 'datenschutz' ? 'var(--color-bg)' : 'var(--color-text-secondary)',
            border: 'none',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {t('legal.datenschutz')}
        </button>
      </div>

      {/* Content — ARIA tabpanel */}
      <article
        role="tabpanel"
        id={`tabpanel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="max-w-3xl mx-auto"
        style={{ padding: 'var(--space-8) var(--space-6)', lineHeight: 'var(--line-height-loose)' }}
        /* SECURITY: Content is static HTML from data/legal.ts — never from user input */
        dangerouslySetInnerHTML={{ __html: tab === 'impressum' ? IMPRESSUM_HTML : DATENSCHUTZ_HTML }}
      />

      {/* Styled legal content */}
      <style>{`
        article h1 { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin: var(--space-6) 0 var(--space-4); color: var(--color-text); }
        article h2 { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); margin: var(--space-6) 0 var(--space-3); color: var(--color-text); }
        article h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-medium); margin: var(--space-4) 0 var(--space-2); color: var(--color-text); }
        article h4 { font-size: var(--font-size-base); font-weight: var(--font-weight-medium); margin: var(--space-3) 0 var(--space-2); color: var(--color-text-secondary); }
        article p { margin: var(--space-2) 0; color: var(--color-text-secondary); }
        article a { color: var(--color-primary); text-decoration: underline; }
        article a:hover { color: var(--color-text); }
      `}</style>

      <footer className="text-center py-8" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
        <p>{t('footer.license')}</p>
        {/* AGPL compliance — source code link required for network services */}
        <p style={{ marginTop: 'var(--space-2)' }}>
          <a
            href="https://github.com/arnoldwender/wm-prototyp-live-music-coder"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
          >
            Source Code (AGPL-3.0)
          </a>
        </p>
      </footer>
    </main>
  );
}

export default Legal;
