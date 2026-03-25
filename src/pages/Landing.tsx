/* ──────────────────────────────────────────────────────────
   Landing page — hero section, feature grid, example gallery.
   Scrollable full-page layout with nav and footer.
   ────────────────────────────────────────────────────────── */

import { LanguageSwitcher } from '../components/molecules';
import { HeroSection } from '../components/organisms/HeroSection';
import { FeatureGrid } from '../components/organisms/FeatureGrid';
import { ExampleGallery } from '../components/organisms/ExampleGallery';

/** Landing page — hero + features + examples */
function Landing() {
  return (
    <main
      className="min-h-screen overflow-y-auto"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Top bar with language switcher */}
      <nav className="flex justify-end p-4">
        <LanguageSwitcher />
      </nav>

      {/* Hero with tagline and CTA */}
      <HeroSection />

      {/* Feature highlights grid */}
      <FeatureGrid />

      {/* Pre-built example demos */}
      <ExampleGallery />

      {/* Footer with license notice */}
      <footer
        className="text-center py-8 text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Live Music Coder — Open Source (AGPL-3.0)
      </footer>
    </main>
  );
}

export default Landing;
