/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   TemplateSelector organism — first-visit modal that lets
   users pick a starter template to populate the editor.
   Sets 'lmc-onboarded' in localStorage to prevent re-show.
   ────────────────────────────────────────────────────────── */

import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { STARTER_TEMPLATES, type StarterTemplate } from '../../data/templates'
import { useAppStore } from '../../lib/store'
import { Button } from '../atoms'
import { ENGINE_COLORS } from '../../lib/constants'

interface TemplateSelectorProps {
  onSelect: () => void
}

/** First-visit template picker modal */
export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const { t } = useTranslation()
  const updateFileCode = useAppStore((s) => s.updateFileCode)
  const setFileEngine = useAppStore((s) => s.setFileEngine)
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine)
  const files = useAppStore((s) => s.files)
  const backdropRef = useRef<HTMLDivElement>(null)

  /* Focus trap — focus first focusable element on mount */
  useEffect(() => {
    const container = backdropRef.current
    if (!container) return
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) focusable[0].focus()
  }, [])

  /* Focus trap — keep Tab cycling within the dialog */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onSelect(); return }
    if (e.key !== 'Tab') return
    const container = backdropRef.current
    if (!container) return
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [onSelect])

  /** Apply template code AND engine to the active file */
  const handleSelect = (template: StarterTemplate) => {
    const activeFile = files.find((f) => f.active)
    if (activeFile) {
      updateFileCode(activeFile.id, template.code)
      setFileEngine(activeFile.id, template.engine)
    }
    /* Also update the global default engine to match the template */
    setDefaultEngine(template.engine)
    localStorage.setItem('lmc-onboarded', 'true')
    onSelect()
  }

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="rounded-lg max-w-md w-full mx-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-6)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          {t('templates.title')}
        </h2>
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {t('templates.subtitle')}
        </p>

        {/* Show only first 6 curated templates — not all 21 */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
          {STARTER_TEMPLATES.slice(0, 6).map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelect(tmpl)}
              className="rounded-md text-left cursor-pointer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ENGINE_COLORS[tmpl.engine] }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: ENGINE_COLORS[tmpl.engine] }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text)' }}>
                  {tmpl.name}
                </div>
                <div style={{ fontSize: 'var(--font-size-ui)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tmpl.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Skip button */}
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.setItem('lmc-onboarded', 'true')
            onSelect()
          }}
          className="mt-3 w-full"
        >
          {t('templates.skip')}
        </Button>
      </div>
    </div>
  )
}
