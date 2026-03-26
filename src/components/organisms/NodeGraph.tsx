/* ──────────────────────────────────────────────────────────
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
import { generateCode } from '../../lib/codegen'
import { EngineNode } from '../atoms'
import { ENGINE_COLORS } from '../../lib/constants'
import { useAppStore } from '../../lib/store'
import type { EngineBlock, Connection } from '../../types/engine'

/* Node type registry — must be defined OUTSIDE the component
   so React Flow doesn't re-register on every render */
const nodeTypes = { engineNode: EngineNode }

/** Convert parsed engine blocks to React Flow nodes with grid layout */
function blocksToNodes(blocks: EngineBlock[]): Node[] {
  return blocks.map((block, i) => ({
    id: block.id,
    type: 'engineNode',
    position: { x: i * 220, y: 50 + (i % 3) * 120 },
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
    setNodes(blocksToNodes(blocks))
    setEdges(connectionsToEdges(connections))
  }, [activeFile?.code, activeFile?.engine, activeFile?.id, setNodes, setEdges])

  /** Regenerate code from current graph state and push it to the active file */
  const syncGraphToCode = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (!activeFile) return
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

  /* When only 0-1 nodes exist (typical for single Strudel expressions),
     show a helpful info message instead of a lonely node */
  const showEmptyState = nodes.length <= 1

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
              {t('graph.singleNodeTitle')}
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('graph.singleNodeDesc')}
            </p>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
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
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  )
}
