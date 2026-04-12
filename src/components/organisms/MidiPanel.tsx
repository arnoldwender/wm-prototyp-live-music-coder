/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MidiPanel — shows connected MIDI devices, input activity,
   and CC value monitoring. Lives in the DetailPanel sidebar.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { Usb } from 'lucide-react';
import {
  getMidiInputNames,
  initMidiInput,
  onCCChange,
  onDeviceListChange,
} from '../../lib/midi/input';

/* Max unique CC rows shown before evicting the oldest-seen CC */
const MAX_CC_ROWS = 16;

/* Human-readable names for well-known MIDI CC numbers */
const CC_NAMES: Record<number, string> = {
  0:  'Bank Select',
  1:  'Mod Wheel',
  7:  'Volume',
  10: 'Pan',
  11: 'Expression',
  64: 'Sustain',
  70: 'Cutoff (K1)',
  71: 'Resonance (K2)',
  72: 'Env Attack (K3)',
  73: 'Env Release (K4)',
  74: 'Cutoff 2 (K5)',
  75: 'Decay (K6)',
  76: 'Vibrato Rate (K7)',
  77: 'Vibrato Depth (K8)',
};

export function MidiPanel() {
  const [devices, setDevices] = useState<string[]>([]);
  const [available, setAvailable] = useState(false);

  /* Per-CC live value store — cc number → normalized value (0-1).
     Map insertion order tracks first-seen order for eviction. */
  const [ccMap, setCcMap] = useState<Map<number, number>>(new Map());

  /* Init MIDI and subscribe to device connect/disconnect events */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await initMidiInput();
      if (!mounted) return;
      setAvailable(ok);
      setDevices(getMidiInputNames());
    })();

    const unsub = onDeviceListChange((names) => {
      if (mounted) setDevices(names);
    });

    return () => { mounted = false; unsub(); };
  }, []);

  /* Subscribe to CC changes — update the per-CC map in place.
     Channel is ignored — we monitor all channels regardless of source. */
  useEffect(() => {
    const unsub = onCCChange((_channel, cc, value) => {
      setCcMap((prev) => {
        const next = new Map(prev);

        if (!next.has(cc) && next.size >= MAX_CC_ROWS) {
          /* Evict oldest entry — Map iterates in insertion order */
          const firstKey = next.keys().next().value as number;
          next.delete(firstKey);
        }

        next.set(cc, value);
        return next;
      });
    });
    return unsub;
  }, []);

  /* Clear button handler — resets the CC map to empty */
  const handleClear = useCallback(() => {
    setCcMap(new Map());
  }, []);

  return (
    <div style={{ padding: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-family-mono)' }}>
      {/* Status */}
      <div
        className="flex items-center gap-2"
        style={{ marginBottom: 'var(--space-3)', color: available ? 'var(--color-success)' : 'var(--color-text-muted)' }}
      >
        <Usb size={12} />
        <span>{available ? 'MIDI Active' : 'MIDI Not Available'}</span>
      </div>

      {/* Connected Devices */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
          Devices ({devices.length})
        </div>
        {devices.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', padding: 'var(--space-2) 0' }}>
            No MIDI devices connected. Plug in a controller and it will appear here.
          </div>
        ) : (
          /* Key by device name — names are unique per Web MIDI spec */
          devices.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2"
              style={{
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-1)',
                color: 'var(--color-text)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
              {name}
            </div>
          ))
        )}
      </div>

      {/* CC Activity Grid — one row per unique CC seen, updated in place */}
      <div>
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 'var(--space-1)' }}
        >
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
            CC Activity
          </span>
          {/* Clear button — resets grid to empty state */}
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-xs)',
              padding: 'var(--space-1) var(--space-2)',
              lineHeight: 1.4,
            }}
          >
            Clear CC
          </button>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-1)',
            /* Gap-based rows — no per-row border-bottom orphan */
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          {ccMap.size === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', padding: 'var(--space-2)', textAlign: 'center' }}>
              Move a knob or slider on your MIDI controller...
            </div>
          ) : (
            /* Render one row per unique CC in insertion order */
            [...ccMap.entries()].map(([cc, value]) => {
              /* value is 0-1 (normalized in input.ts), convert for display */
              const displayValue = Math.round(value * 127);
              const barWidth = `${value * 100}%`;
              const ccName = CC_NAMES[cc] ?? '—';

              return (
                <div
                  key={cc}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    padding: 'var(--space-1) var(--space-2)',
                  }}
                >
                  {/* CC number + name label */}
                  <div style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', minWidth: 'var(--space-16)' }}>
                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>CC {cc}</span>
                    {' '}
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{ccName}</span>
                  </div>

                  {/* Value bar — width represents 0-127 as percentage of track */}
                  <div
                    role="progressbar"
                    aria-valuenow={displayValue}
                    aria-valuemin={0}
                    aria-valuemax={127}
                    aria-label={`CC ${cc} ${ccName} — ${displayValue}`}
                    style={{
                      height: 'var(--space-2)',
                      backgroundColor: 'var(--color-bg-hover)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: barWidth,
                        height: '100%',
                        backgroundColor: 'var(--color-primary)',
                        opacity: 0.7,
                        /* Smooth bar update — fast transition matches MIDI message rate */
                        transition: 'width var(--transition-fast)',
                      }}
                    />
                  </div>

                  {/* Numeric value 0-127 */}
                  <span
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      minWidth: 'var(--space-10)',
                      textAlign: 'right',
                    }}
                  >
                    {displayValue}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Usage hint */}
      <div style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', lineHeight: '1.4' }}>
        Use in code: <code style={{ color: 'var(--color-primary)' }}>midin("Device")</code> for MIDI input patterns.
        CC values auto-map to <code style={{ color: 'var(--color-primary)' }}>getCCValue(ch, cc)</code>.
      </div>
    </div>
  );
}
