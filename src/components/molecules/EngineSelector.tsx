/* ──────────────────────────────────────────────────────────
   EngineSelector molecule — beginner-friendly engine picker
   with icons, labels, and descriptions instead of raw tech names.
   ────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../lib/store'
import { ENGINE_COLORS } from '../../lib/constants'
import type { EngineType } from '../../types/engine'

/* Engine metadata with icons — beginner-friendly labels */
const ENGINE_META: { id: EngineType; icon: string }[] = [
  { id: 'strudel', icon: '♩' },
  { id: 'tonejs', icon: '🎹' },
  { id: 'webaudio', icon: '〰' },
  { id: 'midi', icon: '🎛' },
]

/** Dropdown engine picker with friendly labels and descriptions */
function EngineSelector() {
  const { t } = useTranslation()
  const defaultEngine = useAppStore((s) => s.defaultEngine)
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine)
  const files = useAppStore((s) => s.files)
  const setFileEngine = useAppStore((s) => s.setFileEngine)

  /* Change engine for both global default and active file */
  const handleEngineChange = (engine: EngineType) => {
    setDefaultEngine(engine)
    const activeFile = files.find((f) => f.active)
    if (activeFile) setFileEngine(activeFile.id, engine)
  }
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const current = ENGINE_META.find((e) => e.id === defaultEngine) ?? ENGINE_META[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button — shows icon + friendly label */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t('status.engine')}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-sm)',
          fontFamily: 'var(--font-family-sans)',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: `2px solid ${ENGINE_COLORS[defaultEngine]}`,
          cursor: 'pointer',
          transition: 'var(--transition-fast)',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 'var(--font-size-base)' }}>{current.icon}</span>
        <span>{t(`engines.${defaultEngine}Label`)}</span>
        <span style={{
          fontSize: '8px',
          opacity: 0.6,
          marginLeft: 'var(--space-1)',
          transition: 'var(--transition-fast)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▼</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label={t('status.engine')}
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-2))',
            left: 0,
            zIndex: 50,
            minWidth: '200px',
            maxWidth: 'calc(100vw - 16px)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {ENGINE_META.map(({ id, icon }) => {
            const isActive = id === defaultEngine
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => { handleEngineChange(id); setOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: isActive ? 'var(--color-bg-hover)' : 'transparent',
                  color: 'var(--color-text)',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? ENGINE_COLORS[id] : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition-fast)',
                  fontFamily: 'var(--font-family-sans)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {/* Icon */}
                <span style={{
                  fontSize: 'var(--font-size-lg)',
                  width: '24px',
                  textAlign: 'center',
                  flexShrink: 0,
                }}>{icon}</span>

                {/* Label + description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: isActive ? ENGINE_COLORS[id] : 'var(--color-text)',
                  }}>
                    {t(`engines.${id}Label`)}
                    <span style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      marginLeft: 'var(--space-2)',
                      fontWeight: 'var(--font-weight-normal)',
                    }}>
                      {t(`engines.${id}`)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    marginTop: '1px',
                  }}>
                    {t(`engines.${id}Desc`)}
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <span style={{ color: ENGINE_COLORS[id], fontSize: 'var(--font-size-sm)' }}>✓</span>
                )}
              </button>
            )
          })}

          {/* MIDI warning at bottom */}
          {defaultEngine === 'midi' && (
            <div style={{
              fontSize: '11px',
              color: 'var(--color-warning)',
              padding: 'var(--space-2) var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'rgba(245, 158, 11, 0.05)',
            }}>
              {t('engines.midiWarning')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EngineSelector
