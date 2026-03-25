/* ──────────────────────────────────────────────────────────
   TutorialOverlay organism — first-run modal with 4 steps
   highlighting different areas of the IDE. Persists
   completion state to localStorage so it only shows once.
   ────────────────────────────────────────────────────────── */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Code2, Play, BarChart3, HelpCircle, ChevronRight, X } from 'lucide-react'
import { Button } from '../atoms'

/** localStorage key for tutorial completion */
const TUTORIAL_DONE_KEY = 'lmc-tutorial-done'

interface TutorialOverlayProps {
  onComplete: () => void
}

/** Tutorial step configuration — each highlights a different IDE area */
const STEP_ICONS = [Code2, Play, BarChart3, HelpCircle] as const

/** 4-step first-run tutorial overlay */
export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)

  /** Mark tutorial as done and close */
  const handleDone = useCallback(() => {
    localStorage.setItem(TUTORIAL_DONE_KEY, 'true')
    onComplete()
  }, [onComplete])

  /** Advance to next step or finish */
  const handleNext = useCallback(() => {
    if (step < 3) {
      setStep((s) => s + 1)
    } else {
      handleDone()
    }
  }, [step, handleDone])

  /** Skip the entire tutorial */
  const handleSkip = useCallback(() => {
    handleDone()
  }, [handleDone])

  const StepIcon = STEP_ICONS[step]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
      role="dialog"
      aria-modal="true"
      aria-label={t('tutorial.step1.title')}
    >
      {/* Modal card */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          maxWidth: '420px',
          width: '90%',
          position: 'relative',
        }}
      >
        {/* Skip button — top right */}
        <button
          type="button"
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: 'var(--space-sm)',
            right: 'var(--space-sm)',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: 'var(--space-xs)',
          }}
          aria-label={t('tutorial.skip')}
        >
          <X size={18} />
        </button>

        {/* Step icon */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-bg)',
            margin: '0 auto',
            marginBottom: 'var(--space-md)',
          }}
        >
          <StepIcon size={24} />
        </div>

        {/* Step indicator: 1/4, 2/4, etc. */}
        <div
          className="text-center"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          {step + 1} / 4
        </div>

        {/* Step title */}
        <h2
          className="text-center"
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          {t(`tutorial.step${step + 1}.title`)}
        </h2>

        {/* Step description */}
        <p
          className="text-center"
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-base)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          {t(`tutorial.step${step + 1}.desc`)}
        </p>

        {/* Step progress dots */}
        <div
          className="flex items-center justify-center"
          style={{ gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: i === step ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'var(--transition-fast)',
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              padding: 'var(--space-xs) var(--space-sm)',
            }}
          >
            {t('tutorial.skip')}
          </button>

          <Button
            variant="primary"
            onClick={handleNext}
          >
            {step < 3 ? (
              <span className="flex items-center" style={{ gap: 'var(--space-xs)' }}>
                {t('tutorial.next')}
                <ChevronRight size={16} />
              </span>
            ) : (
              t('tutorial.done')
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
