/* Legal page — Impressum + Datenschutz with tab navigation */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/atoms';
import { LanguageSwitcher } from '../components/molecules';
import { IMPRESSUM_HTML, DATENSCHUTZ_HTML } from '../data/legal';

function Legal() {
  const { t } = useTranslation();
  const location = useLocation();
  const [tab, setTab] = useState<'impressum' | 'datenschutz'>(
    location.hash === '#datenschutz' ? 'datenschutz' : 'impressum'
  );

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
        className="flex items-center justify-between"
        style={{ height: '64px', padding: '0 var(--space-6)', backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Logo showTagline size="sm" />
        </Link>
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <LanguageSwitcher />
          <Link to="/editor" style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
            {t('nav.openEditor')}
          </Link>
        </div>
      </nav>

      {/* Tab navigation */}
      <div className="flex justify-center" style={{ padding: 'var(--space-4)', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
        <button
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
          Impressum
        </button>
        <button
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

      {/* Content */}
      <article
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
        Live Music Coder — Open Source (AGPL-3.0)
      </footer>
    </main>
  );
}

export default Legal;
