/* ──────────────────────────────────────────────────────────
   StatusBar organism — bottom bar showing engine status,
   CPU usage, creature count, and ready state.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../lib/store'
import { ENGINE_COLORS } from '../../lib/constants'
import { Badge } from '../atoms'

/** Bottom status bar with runtime information */
function StatusBar() {
  const { t } = useTranslation()
  const defaultEngine = useAppStore((s) => s.defaultEngine)
  const fileCount = useAppStore((s) => s.files.length)

  return (
    <footer
      className="flex items-center justify-between shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-2) var(--space-6)',
        height: '28px',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-muted)',
      }}
    >
      {/* Left: engine badge */}
      <div className="flex items-center gap-3">
        <span>{t('status.engine')}:</span>
        <Badge color={ENGINE_COLORS[defaultEngine]}>
          {t(`engines.${defaultEngine}`)}
        </Badge>
      </div>

      {/* Right: file count, creatures, status */}
      <div className="flex items-center gap-4">
        {/* File count from store */}
        <span>
          {t('status.files')}: {fileCount}
        </span>

        {/* Creature count placeholder */}
        <span>
          {t('status.creatures')}: 0/6
        </span>

        {/* Ready indicator */}
        <span
          style={{ color: 'var(--color-success)' }}
        >
          {t('status.ready')}
        </span>
      </div>
    </footer>
  )
}

export default StatusBar
