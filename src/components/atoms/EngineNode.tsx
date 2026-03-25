/* ──────────────────────────────────────────────────────────
   EngineNode — custom React Flow node for audio engine blocks.
   Displays engine type, block category, and truncated code
   preview with color-coded borders matching the engine.
   ────────────────────────────────────────────────────────── */

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { EngineType } from '../../types/engine'
import { ENGINE_COLORS } from '../../lib/constants'

/** Data shape passed to each EngineNode via React Flow */
export interface EngineNodeData {
  label: string
  engine: EngineType
  blockType: 'source' | 'effect' | 'output'
  code: string
  [key: string]: unknown
}

/** Shared handle style — 10x10px circle with engine color fill */
function handleStyle(engineColor: string) {
  return {
    width: 10,
    height: 10,
    backgroundColor: engineColor,
    border: '2px solid var(--color-bg)',
  }
}

function EngineNode({ data }: NodeProps) {
  const nodeData = data as unknown as EngineNodeData
  const color = ENGINE_COLORS[nodeData.engine]

  /* Truncate code preview to 40 characters max */
  const preview =
    nodeData.code.length > 40
      ? `${nodeData.code.slice(0, 40)}...`
      : nodeData.code

  return (
    <div
      style={{
        border: `2px solid ${color}`,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-bg-elevated)',
        minWidth: 180,
        overflow: 'hidden',
      }}
    >
      {/* Target handle — left side, hidden for source blocks */}
      {nodeData.blockType !== 'source' && (
        <Handle
          type="target"
          position={Position.Left}
          style={handleStyle(color)}
        />
      )}

      {/* Header — colored background with engine name + block type */}
      <header
        style={{
          backgroundColor: color,
          padding: 'var(--space-xs) var(--space-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-sm)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-bg)',
          }}
        >
          {nodeData.engine}
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-bg)',
            opacity: 0.8,
          }}
        >
          {nodeData.blockType}
        </span>
      </header>

      {/* Body — truncated code preview in mono font */}
      <div
        style={{
          padding: 'var(--space-sm)',
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {preview}
      </div>

      {/* Source handle — right side, hidden for output blocks */}
      {nodeData.blockType !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          style={handleStyle(color)}
        />
      )}
    </div>
  )
}

export default memo(EngineNode)
