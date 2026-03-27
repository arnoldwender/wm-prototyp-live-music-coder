/* ──────────────────────────────────────────────────────────
   CreaturesSidebar — creature cards for the detail panel.
   Throttled to update every 2 seconds to prevent layout thrashing.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react';
import { useAppStore, type CreatureStat } from '../../lib/store';
import { SPECIES } from '../../lib/beatlings/species';

export function CreaturesSidebar() {
  const selectedId = useAppStore((s) => s.selectedCreatureId);
  const selectCreature = useAppStore((s) => s.selectCreature);

  /* Throttled creature stats — only update every 2 seconds */
  const [stats, setStats] = useState<CreatureStat[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    /* Initial read */
    setStats(useAppStore.getState().creatureStats);

    /* Poll every 2 seconds instead of subscribing to every store change */
    timerRef.current = setInterval(() => {
      setStats(useAppStore.getState().creatureStats);
    }, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (stats.length === 0) {
    return (
      <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '11px', textAlign: 'center' }}>
        Play music to spawn creatures
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 'var(--space-2)' }}>
      {stats.map((c) => {
        const spec = SPECIES[c.species as keyof typeof SPECIES];
        const isSelected = selectedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCreature(isSelected ? null : c.id)}
            aria-pressed={isSelected}
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
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: spec?.color || 'var(--color-primary)',
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)' }}>
                {spec?.name || c.species}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {c.stage} · {Math.floor(c.xpTotal)} XP
              </div>
            </div>
          </button>
        );
      })}

      {selectedId && (() => {
        const c = stats.find((s) => s.id === selectedId);
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
