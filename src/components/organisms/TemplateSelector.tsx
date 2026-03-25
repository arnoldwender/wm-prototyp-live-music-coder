/* ──────────────────────────────────────────────────────────
   TemplateSelector organism — first-visit modal that lets
   users pick a starter template to populate the editor.
   Sets 'lmc-onboarded' in localStorage to prevent re-show.
   ────────────────────────────────────────────────────────── */

import { STARTER_TEMPLATES, type StarterTemplate } from '../../data/templates'
import { useAppStore } from '../../lib/store'
import { Button } from '../atoms'
import { ENGINE_COLORS } from '../../lib/constants'

interface TemplateSelectorProps {
  onSelect: () => void
}

/** First-visit template picker modal */
export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const updateFileCode = useAppStore((s) => s.updateFileCode)
  const setFileEngine = useAppStore((s) => s.setFileEngine)
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine)
  const files = useAppStore((s) => s.files)

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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
      onKeyDown={(e) => { if (e.key === 'Escape') onSelect() }}
    >
      <div
        className="rounded-lg p-8 max-w-2xl w-full mx-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Choose a starter template
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Pick one to get started. You can always change it later.
        </p>

        {/* Template cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STARTER_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className="p-4 rounded-lg text-left transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Engine color dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: ENGINE_COLORS[t.engine] }}
                />
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {t.name}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t.description}
              </p>
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
          className="mt-4 w-full"
        >
          Skip — use default
        </Button>
      </div>
    </div>
  )
}
