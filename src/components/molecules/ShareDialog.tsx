/* ──────────────────────────────────────────────────────────
   ShareDialog molecule — modal overlay to share the active
   file's code via a compressed URL. Copy-to-clipboard with
   visual checkmark feedback.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, X } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { generateShareUrl } from '../../lib/persistence/url'
import { Button } from '../atoms'

interface ShareDialogProps {
  onClose: () => void
}

/** Dialog for sharing the current code via compressed URL */
export function ShareDialog({ onClose }: ShareDialogProps) {
  const { t } = useTranslation()
  const files = useAppStore((s) => s.files)
  const bpm = useAppStore((s) => s.bpm)
  const activeFile = files.find((f) => f.active)
  const [copied, setCopied] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  /* Generate share URL from active file state */
  const shareUrl = activeFile
    ? generateShareUrl({ code: activeFile.code, bpm, engine: activeFile.engine })
    : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      /* Unlock first_share achievement when URL is successfully copied */
      useAppStore.getState().unlockAchievement('first_share')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* Clipboard API may fail in insecure contexts or denied permissions */
      setCopied(false)
    }
  }

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
    if (e.key === 'Escape') { onClose(); return }
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
  }, [onClose])

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
        className="rounded-lg max-w-lg w-full mx-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text)',
            }}
          >
            {t('toolbar.share')}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        {/* Readonly share URL input */}
        <input
          readOnly
          value={shareUrl}
          aria-label="Share URL"
          className="w-full rounded"
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-sm)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
          onFocus={(e) => e.target.select()}
        />

        {/* Copy button with checkmark feedback */}
        <Button variant="primary" onClick={handleCopy} className="w-full flex items-center justify-center gap-2">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? t('share.copied') : t('share.copyUrl')}</span>
        </Button>
      </div>
    </div>
  )
}
