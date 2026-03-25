/* ──────────────────────────────────────────────────────────
   FeatureGrid — 3-column grid of feature highlight cards
   on the landing page. Showcases the 6 main capabilities.
   ────────────────────────────────────────────────────────── */

import { FeatureCard } from '../molecules/FeatureCard';

/** Feature data — 6 key capabilities of Live Music Coder */
const features = [
  { icon: '🎵', title: '4 Audio Engines', description: 'Strudel patterns, Tone.js synths, raw Web Audio, and MIDI output — all in one IDE.' },
  { icon: '🔗', title: 'Visual Node Graph', description: 'See your audio routing as draggable nodes. Code and graph stay in sync.' },
  { icon: '📊', title: 'Live Visualizers', description: 'Waveform, spectrum analyzer, and pattern timeline react to your music in real time.' },
  { icon: '🐾', title: 'Beatling Creatures', description: '6 species of audio-reactive creatures with neural brains and Game of Life evolution.' },
  { icon: '🔄', title: 'Share & Collaborate', description: 'Share via URL, save to GitHub Gist, or record your session as audio.' },
  { icon: '🌍', title: 'DE/EN/ES', description: 'Full interface in German, English, and Spanish with translated autocomplete tooltips.' },
];

/** Feature highlights grid on landing page */
export function FeatureGrid() {
  return (
    <section className="px-4 py-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
        ))}
      </div>
    </section>
  );
}
