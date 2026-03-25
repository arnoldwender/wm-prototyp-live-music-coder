/* ──────────────────────────────────────────────────────────
   FeatureCard — feature highlight card for the landing page.
   Displays an icon, title, and description in an elevated card.
   ────────────────────────────────────────────────────────── */

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

/** Feature highlight card for landing page */
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article
      className="p-6 rounded-lg"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {description}
      </p>
    </article>
  );
}
