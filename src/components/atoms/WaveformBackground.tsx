/* ----------------------------------------------------------
   WaveformBackground — pure CSS animated waveform bars.
   Renders behind the hero section to convey a "music" identity.
   Uses staggered keyframe delays on 40 vertical bars.
   ---------------------------------------------------------- */

/** Number of waveform bars to render */
const BAR_COUNT = 40

/** Inline keyframes injected once via <style> */
const keyframesCSS = `
@keyframes waveform-bar {
  0%, 100% { transform: scaleY(0.15); }
  50%      { transform: scaleY(1); }
}
`

/** Animated CSS waveform background for the hero section */
export function WaveformBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.12,
      }}
    >
      {/* Inject keyframes once */}
      <style>{keyframesCSS}</style>

      {Array.from({ length: BAR_COUNT }, (_, i) => {
        /* Stagger animation delay so bars oscillate in a wave pattern */
        const delay = (i * 0.08) % 2
        /* Vary height so the waveform looks organic */
        const maxHeight = 40 + Math.sin(i * 0.5) * 30

        return (
          <div
            key={i}
            style={{
              width: '3px',
              height: `${maxHeight}%`,
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              transformOrigin: 'center',
              animation: `waveform-bar 1.8s ease-in-out ${delay}s infinite`,
            }}
          />
        )
      })}
    </div>
  )
}
