/* ──────────────────────────────────────────────────────────
   CreaturesSidebar — creature cards with expandable neural stats
   for the detail panel. Shows live creature list from the
   Beatling ecosystem with species dot, name, stage, XP,
   and neural network stats when selected.
   ────────────────────────────────────────────────────────── */

import { useAppStore } from '../../lib/store';
import { SPECIES } from '../../lib/beatlings/species';

export function CreaturesSidebar() {
  const creatureStats = useAppStore((s) => s.creatureStats);
  const selectedId = useAppStore((s) => s.selectedCreatureId);
  const selectCreature = useAppStore((s) => s.selectCreature);

  /* Empty state — prompt user to play music */
  if (creatureStats.length === 0) {
    return (
      <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '11px', textAlign: 'center' }}>
        Play music to spawn creatures
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 'var(--space-2)' }}>
      {creatureStats.map((c) => {
        const spec = SPECIES[c.species as keyof typeof SPECIES];
        const isSelected = selectedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCreature(isSelected ? null : c.id)}
            aria-pressed={isSelected}
            aria-label={`${spec?.name || c.species} — ${c.stage}, ${Math.floor(c.xpTotal)} XP`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2)',
              backgroundColor: isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg)',
              border: '1px solid',
              borderColor: isSelected ? (spec?.color || 'var(--color-border)') : 'var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'var(--transition-fast)',
            }}
          >
            {/* Species dot — colored indicator per creature type */}
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: spec?.color || 'var(--color-primary)',
              flexShrink: 0,
            }} />
            {/* Name + stage */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)' }}>
                {spec?.name || c.species}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {c.stage} · {c.emotionalState > 0.5 ? 'excited' : c.emotionalState > 0.2 ? 'calm' : 'neutral'}
              </div>
            </div>
            {/* XP counter */}
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
              {Math.floor(c.xpTotal)} XP
            </span>
          </button>
        );
      })}

      {/* Selected creature detail — expandable neural stats grid */}
      {selectedId && (() => {
        const c = creatureStats.find((s) => s.id === selectedId);
        if (!c) return null;
        return (
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontFamily: 'var(--font-family-mono)',
            color: 'var(--color-text-muted)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-1)',
          }}>
            <span>Neurons: <strong style={{ color: 'var(--color-text)' }}>{c.neuronCount}</strong></span>
            <span>Synapses: <strong style={{ color: 'var(--color-text)' }}>{c.synapseCount}</strong></span>
            <span>Firings: <strong style={{ color: 'var(--color-text)' }}>{c.totalFirings}</strong></span>
            <span>IQ: <strong style={{ color: 'var(--color-text)' }}>{c.intelligence}</strong></span>
            <span style={{ gridColumn: '1 / -1' }}>
              Phi: <strong style={{ color: 'var(--color-primary)' }}>{c.phi.toFixed(2)}</strong>
            </span>
          </div>
        );
      })()}
    </div>
  );
}
