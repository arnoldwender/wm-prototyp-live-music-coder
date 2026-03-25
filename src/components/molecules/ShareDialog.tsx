/* ──────────────────────────────────────────────────────────
   ShareDialog molecule — modal overlay to share the active
   file's code via a compressed URL. Copy-to-clipboard with
   visual checkmark feedback.
   ────────────────────────────────────────────────────────── */

import { useState } from 'react'
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

  /* Generate share URL from active file state */
  const shareUrl = activeFile
    ? generateShareUrl({ code: activeFile.code, bpm, engine: activeFile.engine })
    : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
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
          <span>{copied ? 'Copied!' : 'Copy URL'}</span>
        </Button>
      </div>
    </div>
  )
}
