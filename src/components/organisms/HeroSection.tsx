/* ──────────────────────────────────────────────────────────
   HeroSection — landing page hero with tagline and CTA.
   Navigates to /editor on button click.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button, Icon } from '../atoms';

/** Landing page hero with tagline and CTA */
export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center text-center px-4 py-20">
      <h1
        className="text-5xl font-bold mb-6 leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        {t('landing.hero')}
      </h1>
      <p
        className="text-xl max-w-2xl mb-10 leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {t('landing.subtitle')}
      </p>
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
        }}
      >
        <Icon icon={Play} size={20} />
        {t('landing.cta')}
      </Button>
    </section>
  );
}
