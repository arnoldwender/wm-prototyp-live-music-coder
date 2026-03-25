/* ──────────────────────────────────────────────────────────
   ExampleGallery — pre-built starter template demos on
   the landing page. Each card links to /editor with the
   template code encoded in the URL hash.
   ────────────────────────────────────────────────────────── */

import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { STARTER_TEMPLATES } from '../../data/templates';
import { encodeToUrl } from '../../lib/persistence/url';
import { Button, Icon } from '../atoms';

/** Pre-built example demos on landing page */
export function ExampleGallery() {
  const navigate = useNavigate();

  /** Encode template into URL hash and navigate to editor */
  const handleTryExample = (template: (typeof STARTER_TEMPLATES)[0]) => {
    const hash = encodeToUrl({ code: template.code, bpm: 120, engine: template.engine });
    navigate(`/editor#code=${hash}`);
  };

  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <h2
        className="text-2xl font-bold text-center mb-8"
        style={{ color: 'var(--color-text)' }}
      >
        Try an Example
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STARTER_TEMPLATES.map((t) => (
          <article
            key={t.id}
            className="p-4 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{t.name}</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
            </div>
            <Button variant="ghost" onClick={() => handleTryExample(t)}>
              <Icon icon={Play} size={16} /> Try
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
