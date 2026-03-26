/* ──────────────────────────────────────────────────────────
   BrainPanel — live dashboard showing neural brain stats for
   all active Beatling creatures. Displays neurons, synapses,
   intelligence, consciousness (Phi), emotional state, firings,
   evolution XP, and sleep state per creature.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next';
import { useAppStore, type CreatureStat } from '../../lib/store';
import { SPECIES } from '../../lib/beatlings/species';
import { XP_THRESHOLDS } from '../../lib/beatlings/evolution';

/** Tiny colored bar for progress visualization */
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{
      width: '100%',
      height: '4px',
      backgroundColor: 'var(--color-bg)',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${pct}%`,
        height: '100%',
        backgroundColor: color,
        borderRadius: 'var(--radius-full)',
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

/** Stat row with label + value */
function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text)' }}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        {sub && <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--space-1)' }}>{sub}</span>}
      </span>
    </div>
  );
}

/** Emoji for emotional state */
function emotionEmoji(state: number): string {
  if (state > 0.5) return '\u{1F60A}'; /* happy */
  if (state > 0.2) return '\u{1F642}'; /* slightly happy */
  if (state < -0.3) return '\u{1F614}'; /* sad */
  if (state < -0.1) return '\u{1F610}'; /* neutral-sad */
  return '\u{1F610}'; /* neutral */
}

/** Next evolution stage and XP needed */
function nextStageInfo(stage: string, xp: number): string {
  switch (stage) {
    case 'egg': return `${Math.max(0, XP_THRESHOLDS.baby - xp).toFixed(0)} XP → Baby`;
    case 'baby': return `${Math.max(0, XP_THRESHOLDS.adult - xp).toFixed(0)} XP → Adult`;
    case 'adult': return `${Math.max(0, XP_THRESHOLDS.elder - xp).toFixed(0)} XP → Elder`;
    case 'elder': return `${Math.max(0, XP_THRESHOLDS.ascended - xp).toFixed(0)} XP → Ascended`;
    case 'ascended': return 'Max stage';
    default: return '';
  }
}

/** Single creature brain card */
function CreatureCard({ creature, isSelected }: { creature: CreatureStat; isSelected: boolean }) {
  const def = SPECIES[creature.species];
  const nextXpThreshold = creature.stage === 'egg' ? XP_THRESHOLDS.baby
    : creature.stage === 'baby' ? XP_THRESHOLDS.adult
    : creature.stage === 'adult' ? XP_THRESHOLDS.elder
    : creature.stage === 'elder' ? XP_THRESHOLDS.ascended
    : 1000;

  return (
    <article
      onClick={() => useAppStore.getState().selectCreature(creature.id)}
      style={{
        backgroundColor: isSelected ? 'var(--color-bg-elevated)' : 'var(--color-bg-alt)',
        border: isSelected ? `1px solid ${def.color}` : '1px solid var(--color-border)',
        borderLeft: `3px solid ${def.color}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
      }}>
      {/* Header: species name + stage + sleep indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: def.color,
            display: 'inline-block',
          }} />
          <span style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
            textTransform: 'capitalize',
          }}>
            {creature.species}
          </span>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-elevated)',
            padding: '0 var(--space-2)',
            borderRadius: 'var(--radius-full)',
            textTransform: 'capitalize',
          }}>
            {creature.stage}
          </span>
        </div>
        <span style={{ fontSize: 'var(--font-size-xs)' }}>
          {creature.isSleeping ? '\u{1F4A4}' : emotionEmoji(creature.emotionalState)}
        </span>
      </div>

      {/* Neural stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1) var(--space-3)' }}>
        <Stat label="Neurons" value={creature.neuronCount} />
        <Stat label="Synapses" value={creature.synapseCount} />
        <Stat label="Firings" value={creature.totalFirings} />
        <Stat label="IQ" value={creature.intelligence} />
      </div>

      {/* Consciousness (Phi) bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Consciousness (\u03A6)
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-family-mono)', color: def.color }}>
            {creature.phi.toFixed(3)}
          </span>
        </div>
        <MiniBar value={creature.phi} max={1} color={def.color} />
      </div>

      {/* Evolution progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Evolution</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {nextStageInfo(creature.stage, creature.xpTotal)}
          </span>
        </div>
        <MiniBar value={creature.xpTotal} max={nextXpThreshold} color='var(--color-success)' />
      </div>
    </article>
  );
}

/** Brain panel — shows neural stats for all active creatures */
export function BrainPanel() {
  const { t } = useTranslation();
  const stats = useAppStore((s) => s.creatureStats);
  const selectedId = useAppStore((s) => s.selectedCreatureId);
  const selected = selectedId ? stats.find((c) => c.id === selectedId) : null;

  if (stats.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-xs)',
        padding: 'var(--space-4)',
        textAlign: 'center',
      }}>
        {t('brain.empty', 'Play music to spawn creatures and see their neural activity')}
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: 'var(--space-2)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      {/* Summary header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 var(--space-1)',
      }}>
        <span style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text)',
        }}>
          {t('brain.title', 'Neural Activity')}
        </span>
        <span style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-family-mono)',
        }}>
          {stats.reduce((s, c) => s + c.neuronCount, 0)} neurons &middot; {stats.reduce((s, c) => s + c.synapseCount, 0)} synapses
        </span>
      </div>

      {/* Selected creature detail — expanded view */}
      {selected && (
        <div style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: `1px solid ${SPECIES[selected.species].color}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-bold)',
              color: SPECIES[selected.species].color,
              textTransform: 'capitalize',
            }}>
              {selected.species} — {t('brain.detail', 'Detail')}
            </span>
            <button
              type="button"
              onClick={() => useAppStore.getState().selectCreature(null)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--font-size-base)' }}
            >
              &times;
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1) var(--space-3)' }}>
            <Stat label={t('brain.neurons', 'Neurons')} value={selected.neuronCount} />
            <Stat label={t('brain.synapses', 'Synapses')} value={selected.synapseCount} />
            <Stat label={t('brain.firings', 'Firings')} value={selected.totalFirings} />
            <Stat label={t('brain.iq', 'IQ')} value={selected.intelligence} />
            <Stat label={t('brain.phi', 'Phi (\u03A6)')} value={selected.phi} />
            <Stat label={t('brain.emotion', 'Emotion')} value={`${emotionEmoji(selected.emotionalState)} ${selected.emotionalState.toFixed(2)}`} />
            <Stat label={t('brain.xp', 'Total XP')} value={selected.xpTotal} />
            <Stat label={t('brain.stage', 'Stage')} value={selected.stage} />
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {t('brain.role', 'Role')}: {SPECIES[selected.species].role}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {nextStageInfo(selected.stage, selected.xpTotal)}
            </span>
          </div>
          {/* Consciousness bar */}
          <MiniBar value={selected.phi} max={1} color={SPECIES[selected.species].color} />
          {/* XP bar */}
          <MiniBar
            value={selected.xpTotal}
            max={selected.stage === 'egg' ? XP_THRESHOLDS.baby : selected.stage === 'baby' ? XP_THRESHOLDS.adult : selected.stage === 'adult' ? XP_THRESHOLDS.elder : XP_THRESHOLDS.ascended}
            color="var(--color-success)"
          />
        </div>
      )}

      {/* Creature cards */}
      {stats.map((creature) => (
        <CreatureCard key={creature.id} creature={creature} isSelected={creature.id === selectedId} />
      ))}
    </div>
  );
}
