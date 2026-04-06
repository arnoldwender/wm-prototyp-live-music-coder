/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   EngineNode — custom React Flow node for audio engine blocks.
   Displays engine type, block category, and truncated code
   preview with color-coded borders matching the engine.
   ────────────────────────────────────────────────────────── */

import { memo, useState } from 'react'
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
  blockId?: string
  params?: Record<string, import('../../types/engine').ParamValue>
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

  /* Track whether the parameter editor panel is expanded */
  const [paramsExpanded, setParamsExpanded] = useState(false)

  /* Truncate code preview to 40 characters max */
  const preview =
    nodeData.code.length > 40
      ? `${nodeData.code.slice(0, 40)}...`
      : nodeData.code

  /** Double-click dispatches a custom event to focus the code in the editor */
  const handleDoubleClick = () => {
    window.dispatchEvent(
      new CustomEvent('node-focus', { detail: { code: nodeData.code } }),
    )
  }

  const params = nodeData.params ?? {}
  const paramEntries = Object.entries(params)
  const hasParams = paramEntries.length > 0

  return (
    <div
      onDoubleClick={handleDoubleClick}
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

      {/* Parameter editor — collapsible sliders for block params */}
      {hasParams && (
        <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-xs)' }}>
          <button
            type="button"
            onClick={() => setParamsExpanded(!paramsExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-xs)',
              padding: 0,
              width: '100%',
              textAlign: 'left',
            }}
          >
            {paramsExpanded ? '\u25BC' : '\u25B6'} Params
          </button>
          {paramsExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
              {paramEntries.map(([key, param]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <label
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      minWidth: 40,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {param.label || key}
                  </label>
                  <input
                    type="range"
                    aria-label={param.label || key}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={param.value}
                    onChange={(e) => {
                      /* Dispatch param change event for the orchestrator to pick up */
                      window.dispatchEvent(new CustomEvent('node-param-change', {
                        detail: { blockId: nodeData.blockId, param: key, value: Number(e.target.value) },
                      }));
                    }}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      minWidth: 28,
                      textAlign: 'right',
                    }}
                  >
                    {param.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
