/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   NodeGraph — React Flow canvas that visualizes parsed audio
   code as a node graph. Blocks become nodes, connections
   become animated edges. Updates when the active file changes.
   ────────────────────────────────────────────────────────── */

import { useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react'
import type { Connection as RFConnection, Node, Edge, EdgeChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { parseCode } from '../../lib/parser'
import { layoutGraph } from '../../lib/parser/layout'
import { generateCode } from '../../lib/codegen'
import { EngineNode } from '../atoms'
import { ENGINE_COLORS } from '../../lib/constants'
import { useAppStore } from '../../lib/store'
import type { EngineBlock, Connection, EngineType } from '../../types/engine'

/* Node type registry — must be defined OUTSIDE the component
   so React Flow doesn't re-register on every render */
const nodeTypes = { engineNode: EngineNode }

/* Engines whose codegen round-trips: their blocks are declarations and their
   edges are .connect() calls, so a graph edit can be written back as code.
   Strudel and MIDI are single expressions — generateCode would join the node
   snippets with newlines and destroy the pattern, so their graph is a view. */
const EDITABLE_ENGINES: readonly EngineType[] = ['tonejs', 'webaudio']

/** Convert parsed engine blocks to React Flow nodes, laid out by signal depth */
function blocksToNodes(blocks: EngineBlock[], connections: Connection[]): Node[] {
  const positions = layoutGraph(blocks, connections)

  return blocks.map((block) => ({
    id: block.id,
    type: 'engineNode',
    position: positions.get(block.id) ?? { x: 0, y: 0 },
    data: {
      label: block.code.slice(0, 40),
      engine: block.engine,
      blockType: block.type,
      code: block.code,
    },
  }))
}

/** Convert parsed connections to React Flow animated edges */
function connectionsToEdges(connections: Connection[]): Edge[] {
  return connections.map((conn) => ({
    id: conn.id,
    source: conn.sourceBlockId,
    sourceHandle: conn.sourcePortId,
    target: conn.targetBlockId,
    targetHandle: conn.targetPortId,
    animated: true,
    style: { stroke: 'var(--color-primary)' },
  }))
}

/** Convert React Flow nodes back to EngineBlocks for code generation */
function nodesToBlocks(nodes: Node[]): EngineBlock[] {
  return nodes.map(n => ({
    id: n.id,
    engine: (n.data as Record<string, unknown>).engine as EngineBlock['engine'],
    type: (n.data as Record<string, unknown>).blockType as EngineBlock['type'],
    code: (n.data as Record<string, unknown>).code as string,
    params: {},
    inputs: (n.data as Record<string, unknown>).blockType !== 'source'
      ? [{ id: 'in', label: 'Input', type: 'audio' as const }]
      : [],
    outputs: (n.data as Record<string, unknown>).blockType !== 'output'
      ? [{ id: 'out', label: 'Output', type: 'audio' as const }]
      : [],
  }));
}

/** Convert React Flow edges back to Connection objects for code generation */
function edgesToConnections(edges: Edge[]): Connection[] {
  return edges.map(e => ({
    id: e.id,
    sourceBlockId: e.source,
    sourcePortId: e.sourceHandle ?? 'out',
    targetBlockId: e.target,
    targetPortId: e.targetHandle ?? 'in',
  }));
}

export default function NodeGraph() {
  const { t } = useTranslation()
  const files = useAppStore((s) => s.files)

  /* Find the currently active file */
  const activeFile = useMemo(
    () => files.find((f) => f.active),
    [files],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  /* Re-parse and rebuild graph when the active file code or engine changes */
  useEffect(() => {
    if (!activeFile) {
      setNodes([])
      setEdges([])
      return
    }

    const { blocks, connections } = parseCode(activeFile.code, activeFile.engine)
    setNodes(blocksToNodes(blocks, connections))
    setEdges(connectionsToEdges(connections))
  }, [activeFile?.code, activeFile?.engine, activeFile?.id, setNodes, setEdges])

  /* Whether an edit in the canvas can be written back as code for this engine */
  const graphIsEditable = activeFile
    ? EDITABLE_ENGINES.includes(activeFile.engine)
    : false

  /** Regenerate code from current graph state and push it to the active file */
  const syncGraphToCode = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (!activeFile) return
      /* Never write back for an engine whose codegen cannot rebuild the file —
         it would replace a working pattern with its own node snippets. */
      if (!EDITABLE_ENGINES.includes(activeFile.engine)) return
      const blocks = nodesToBlocks(currentNodes)
      const connections = edgesToConnections(currentEdges)
      const newCode = generateCode(blocks, connections, activeFile.engine)
      useAppStore.getState().updateFileCode(activeFile.id, newCode)
    },
    [activeFile],
  )

  /* Handle manual edge creation via drag in the canvas */
  const onConnect = useCallback(
    (params: RFConnection) => {
      setEdges((eds) => {
        const nextEdges = addEdge(params, eds)
        /* Regenerate code with the newly added edge */
        syncGraphToCode(nodes, nextEdges)
        return nextEdges
      })
    },
    [setEdges, syncGraphToCode, nodes],
  )

  /* Wrap onEdgesChange to detect edge removals and regenerate code */
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes)
      const hasRemovals = changes.some((c) => c.type === 'remove')
      if (hasRemovals) {
        /* Compute surviving edges after removals */
        const removedIds = new Set(
          changes.filter((c) => c.type === 'remove').map((c) => c.id),
        )
        const survivingEdges = edges.filter((e) => !removedIds.has(e.id))
        syncGraphToCode(nodes, survivingEdges)
      }
    },
    [onEdgesChange, edges, nodes, syncGraphToCode],
  )

  /** Color minimap nodes by their engine */
  const miniMapNodeColor = useCallback((node: Node) => {
    const engine = (node.data as Record<string, unknown>)?.engine as string | undefined
    if (engine && engine in ENGINE_COLORS) {
      return ENGINE_COLORS[engine as keyof typeof ENGINE_COLORS]
    }
    return 'var(--color-text-muted)'
  }, [])

  /* Nothing parsed — an empty file, or code with no pattern in it yet */
  const showEmptyState = nodes.length === 0

  return (
    <div
      className="h-full w-full relative"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {showEmptyState && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        >
          <div
            className="text-center max-w-xs p-6 rounded-lg pointer-events-auto"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              {t('graph.emptyTitle')}
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('graph.emptyDesc')}
            </p>
          </div>
        </div>
      )}

      {/* Say so when the canvas is a view, rather than letting a drag that
          silently does nothing read as a broken editor */}
      {!showEmptyState && !graphIsEditable && (
        <div
          className="absolute top-2 right-2 z-10 px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('graph.viewOnly')}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesConnectable={graphIsEditable}
        /* null disables deletion: removing a node from a view-only graph would
           desync it from the code it is derived from */
        deleteKeyCode={graphIsEditable ? undefined : null}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-border-dim)"
        />
        <Controls
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
          }}
        />
        <MiniMap
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
          }}
          nodeColor={miniMapNodeColor}
          /* React Flow MiniMap renders maskColor into SVG, which cannot resolve CSS custom properties — hardcoded rgba is intentional */
          maskColor="var(--color-overlay)"
        />
      </ReactFlow>
    </div>
  )
}
