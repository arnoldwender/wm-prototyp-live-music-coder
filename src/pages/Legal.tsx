/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Legal page — Impressum (/legal) + Datenschutzerklärung
   (/datenschutz and /legal#datenschutz) with accessible
   ARIA tablist, roving tabindex, lang="de" content part,
   and proper landmark separation. */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SiteNav } from '../components/organisms/SiteNav';
import { SiteFooter } from '../components/organisms/SiteFooter';
import { IMPRESSUM_HTML, DATENSCHUTZ_HTML } from '../data/legal';
import { usePageMeta } from '../lib/usePageMeta';
import { useScrollablePage } from '../lib/useScrollablePage';
import { useIsClient } from '../lib/useIsClient';

type LegalTab = 'impressum' | 'datenschutz';

function Legal() {
  const { t } = useTranslation();
  const location = useLocation();
  const isClient = useIsClient();
  const impressumBtnRef = useRef<HTMLButtonElement>(null);
  const datenschutzBtnRef = useRef<HTMLButtonElement>(null);

  const isDatenschutzRoute = location.pathname === '/datenschutz';

  /* Keyed to pathname+hash so navigating between /legal and /datenschutz
     automatically switches tabs without needing a setState-in-effect, while
     preserving identical SSR + hydration output on both routes. */
  const routeKey = `${location.pathname}${isClient ? location.hash : ''}`;
  const [picked, setPicked] = useState<{ key: string; tab: LegalTab } | null>(null);

  const defaultTab: LegalTab = isDatenschutzRoute
    ? 'datenschutz'
    : isClient && location.hash === '#datenschutz'
      ? 'datenschutz'
      : 'impressum';

  const tab: LegalTab = picked && picked.key === routeKey ? picked.tab : defaultTab;

  const selectTab = (next: LegalTab, focus = false) => {
    setPicked({ key: routeKey, tab: next });
    if (focus) {
      const target = next === 'impressum' ? impressumBtnRef.current : datenschutzBtnRef.current;
      target?.focus();
    }
  };

  /* Per-page SEO meta tags — distinct canonical & title for /legal vs /datenschutz */
  usePageMeta(
    isDatenschutzRoute
      ? {
          title: 'Datenschutzerklärung — Live Music Coder',
          description: 'Datenschutzerklärung (DSGVO / TDDDG) für Live Music Coder.',
          path: '/datenschutz',
        }
      : {
          title: 'Legal — Live Music Coder',
          description: 'Impressum und Datenschutzerklärung für Live Music Coder.',
          path: '/legal',
        },
  );

  /* Override body overflow for scrolling (shared hook) */
  useScrollablePage();

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      selectTab(tab === 'impressum' ? 'datenschutz' : 'impressum', true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectTab('impressum', true);
    } else if (e.key === 'End') {
      e.preventDefault();
      selectTab('datenschutz', true);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* --- Skip-to-content for a11y --- */}
      <a
        href="#legal-content"
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 'var(--space-2)',
          left: 'var(--space-2)',
          zIndex: 100,
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-accent)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {t('a11y.skipToContent')}
      </a>

      <SiteNav />

      <main id="legal-main" className="flex-1">
        {/* Tab navigation — ARIA tabs pattern with roving tabindex */}
        <div
          role="tablist"
          aria-label={t('legal.sectionsAriaLabel')}
          onKeyDown={handleTabKeyDown}
          className="flex flex-wrap justify-center"
          style={{
            padding: 'var(--space-4)',
            gap: 'var(--space-2)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            ref={impressumBtnRef}
            type="button"
            role="tab"
            aria-selected={tab === 'impressum'}
            aria-controls="legal-content"
            id="tab-impressum"
            tabIndex={tab === 'impressum' ? 0 : -1}
            onClick={() => selectTab('impressum')}
            className="cursor-pointer"
            style={{
              minHeight: 'var(--size-touch)',
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
            ref={datenschutzBtnRef}
            type="button"
            role="tab"
            aria-selected={tab === 'datenschutz'}
            aria-controls="legal-content"
            id="tab-datenschutz"
            tabIndex={tab === 'datenschutz' ? 0 : -1}
            onClick={() => selectTab('datenschutz')}
            className="cursor-pointer"
            style={{
              minHeight: 'var(--size-touch)',
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

        {/* Content — ARIA tabpanel with lang="de" (WCAG 3.1.2 Language of Parts) */}
        <article
          id="legal-content"
          tabIndex={-1}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          lang="de"
          className="max-w-3xl mx-auto legal-prose"
          style={{
            padding: 'var(--space-8) var(--space-6)',
            lineHeight: 'var(--line-height-loose)',
          }}
          /* SECURITY: Content is static HTML from data/legal.ts — never from user input */
          dangerouslySetInnerHTML={{ __html: tab === 'impressum' ? IMPRESSUM_HTML : DATENSCHUTZ_HTML }}
        />

        {/* Styled legal content */}
        <style>{`
          .legal-prose h1 { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin: var(--space-6) 0 var(--space-4); color: var(--color-text); }
          .legal-prose h2 { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); margin: var(--space-6) 0 var(--space-3); color: var(--color-text); }
          .legal-prose h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-medium); margin: var(--space-4) 0 var(--space-2); color: var(--color-text); }
          .legal-prose h4 { font-size: var(--font-size-base); font-weight: var(--font-weight-medium); margin: var(--space-3) 0 var(--space-2); color: var(--color-text-secondary); }
          .legal-prose p { margin: var(--space-2) 0; color: var(--color-text-secondary); overflow-wrap: anywhere; }
          .legal-prose ul { margin: var(--space-2) 0; padding-left: var(--space-8); list-style: disc; color: var(--color-text-secondary); }
          .legal-prose li { margin: var(--space-1) 0; }
          .legal-prose a { color: var(--color-primary); text-decoration: underline; overflow-wrap: anywhere; }
          .legal-prose a:hover { color: var(--color-text); }
        `}</style>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Legal;
