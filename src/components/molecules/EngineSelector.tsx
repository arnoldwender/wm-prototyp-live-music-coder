/* ──────────────────────────────────────────────────────────
   EngineSelector molecule — dropdown for choosing the
   default audio engine. Border color reflects the selected
   engine's accent color.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../lib/store'
import { ENGINE_COLORS } from '../../lib/constants'
import type { EngineType } from '../../types/engine'

/** All available engine options */
const ENGINE_OPTIONS: EngineType[] = ['strudel', 'tonejs', 'webaudio', 'midi']

/** Dropdown select for switching the default audio engine */
function EngineSelector() {
  const { t } = useTranslation()
  const defaultEngine = useAppStore((s) => s.defaultEngine)
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine)

  return (
    <select
      value={defaultEngine}
      onChange={(e) => setDefaultEngine(e.target.value as EngineType)}
      aria-label={t('status.engine')}
      className="focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        color: 'var(--color-text)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-sans)',
        padding: 'var(--space-2) var(--space-6)',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${ENGINE_COLORS[defaultEngine]}`,
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
      }}
    >
      {ENGINE_OPTIONS.map((engine) => (
        <option key={engine} value={engine}>
          {t(`engines.${engine}`)}
        </option>
      ))}
    </select>
  )
}

export default EngineSelector
