/** Visualizer color constants — derived from design tokens but as literal values
 * because Canvas 2D cannot use CSS custom properties directly. */
export const VIZ_COLORS = {
  bg: '#09090b',
  grid: '#27272a',
  gridLight: '#3f3f46',
  waveform: '#a855f7',
  waveformFill: 'rgba(168, 85, 247, 0.15)',
  spectrum: '#3b82f6',
  spectrumPeak: '#60a5fa',
  spectrumFill: 'rgba(59, 130, 246, 0.3)',
  timeline: '#22c55e',
  timelineBeat: '#a855f7',
  timelineBar: 'rgba(34, 197, 94, 0.4)',
  text: '#a1a1aa',
  textDim: '#71717a',
  accent: '#a855f7',
  white: '#fafafa',
} as const;
