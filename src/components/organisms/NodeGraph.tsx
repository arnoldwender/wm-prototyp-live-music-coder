/* ──────────────────────────────────────────────────────────
   NodeGraph — React Flow canvas that visualizes parsed audio
   code as a node graph. Blocks become nodes, connections
   become animated edges. Updates when the active file changes.
   ────────────────────────────────────────────────────────── */

import { useEffect, useCallback, useMemo } from 'react'
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
import type { Connection as RFConnection, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { parseCode } from '../../lib/parser'
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

export default function NodeGraph() {
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

  /* Handle manual edge creation via drag in the canvas */
  const onConnect = useCallback(
    (params: RFConnection) => {
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges],
  )

  /** Color minimap nodes by their engine */
  const miniMapNodeColor = useCallback((node: Node) => {
    const engine = (node.data as Record<string, unknown>)?.engine as string | undefined
    if (engine && engine in ENGINE_COLORS) {
      return ENGINE_COLORS[engine as keyof typeof ENGINE_COLORS]
    }
    return 'var(--color-text-muted)'
  }, [])

  return (
    <div
      className="h-full w-full"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  )
}
