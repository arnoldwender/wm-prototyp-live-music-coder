/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MidiPanel — shows connected MIDI devices, input activity,
   and CC value monitoring. Lives in the DetailPanel sidebar.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react';
import { Usb } from 'lucide-react';
import {
  getMidiInputNames,
  initMidiInput,
  onCCChange,
  onDeviceListChange,
} from '../../lib/midi/input';

interface CCEntry {
  channel: number;
  cc: number;
  value: number;
  timestamp: number;
}

export function MidiPanel() {
  const [devices, setDevices] = useState<string[]>([]);
  const [available, setAvailable] = useState(false);
  const [recentCC, setRecentCC] = useState<CCEntry[]>([]);
  const maxEntries = 20;
  const scrollRef = useRef<HTMLDivElement>(null);

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

  /* Subscribe to CC changes */
  useEffect(() => {
    const unsub = onCCChange((channel, cc, value) => {
      setRecentCC((prev) => {
        const next = [...prev, { channel, cc, value, timestamp: Date.now() }];
        return next.slice(-maxEntries);
      });
    });
    return unsub;
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [recentCC.length]);

  return (
    <div style={{ padding: 'var(--space-2)', fontSize: '11px', fontFamily: 'var(--font-family-mono)' }}>
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
          devices.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '2px',
                color: 'var(--color-text)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
              {name}
            </div>
          ))
        )}
      </div>

      {/* CC Activity Monitor */}
      <div>
        <div style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
          CC Activity
        </div>
        <div
          ref={scrollRef}
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-1)',
          }}
        >
          {recentCC.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', padding: 'var(--space-2)', textAlign: 'center' }}>
              Move a knob or slider on your MIDI controller...
            </div>
          ) : (
            recentCC.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
                style={{
                  padding: '1px var(--space-2)',
                  borderBottom: '1px solid rgba(39, 39, 42, 0.3)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>CH{entry.channel} CC{entry.cc}</span>
                {/* Visual bar for CC value */}
                <div className="flex items-center gap-1" style={{ width: '80px' }}>
                  <div
                    style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: 'var(--color-bg-hover)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${entry.value * 100}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-primary)',
                        /* MIDI velocity meter — width transition is intentional
                           for progress bar fill. 50ms matches MIDI message rate. */
                        transition: 'width 50ms linear',
                      }}
                    />
                  </div>
                  <span style={{ minWidth: '28px', textAlign: 'right', fontSize: '10px' }}>
                    {Math.round(entry.value * 127)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Usage hint */}
      <div style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: '10px', lineHeight: '1.4' }}>
        Use in code: <code style={{ color: 'var(--color-primary)' }}>midin("Device")</code> for MIDI input patterns.
        CC values auto-map to <code style={{ color: 'var(--color-primary)' }}>getCCValue(ch, cc)</code>.
      </div>
    </div>
  );
}
