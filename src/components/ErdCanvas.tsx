import { useRef, useEffect, useState, useMemo, useCallback, CSSProperties } from 'react';
import { Canvas } from '../Canvas';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { EntityNode } from './nodes/EntityNode';
import type { EdgeProps, Node, Point } from '../types';
import type { EntityColumn } from './nodes/EntityNode';

const HEADER_HEIGHT = 33;
const ROW_HEIGHT = 22;

// --- Public API Types ---

export interface ErdEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: EntityColumn[];
}

export interface ErdRelation {
  id?: string;
  sourceEntityId: string;
  sourceColumnIndex: number;
  targetEntityId: string;
}

export interface ErdCanvasProps {
  entities: ErdEntity[];
  relations: ErdRelation[];
  selectedEntityId?: string | null;
  onEntitySelect?: (id: string | null) => void;
  onEntityMove?: (id: string, x: number, y: number) => void;
  onEntityContextMenu?: (id: string, event: React.MouseEvent) => void;
  onCanvasContextMenu?: (event: React.MouseEvent, position: Point) => void;
  onDrop?: (event: React.DragEvent, position: Point) => void;
  fitView?: boolean;
  style?: CSSProperties;
}

// --- Component ---

export function ErdCanvas({
  entities,
  relations,
  selectedEntityId,
  onEntitySelect,
  onEntityMove,
  onEntityContextMenu,
  onCanvasContextMenu,
  onDrop,
  fitView = true,
  style,
}: ErdCanvasProps) {
  const initialNodes: Node<any>[] = useMemo(() =>
    entities.map(ent => ({
      id: ent.id,
      type: 'entity',
      position: { x: ent.x, y: ent.y },
      data: {
        name: ent.name,
        columns: ent.columns,
        onContextMenu: onEntityContextMenu
          ? (e: React.MouseEvent) => onEntityContextMenu(ent.id, e)
          : undefined,
      },
      width: 170,
      height: HEADER_HEIGHT + ent.columns.length * ROW_HEIGHT + 8,
      ports: buildPorts(ent.columns),
    })),
  [entities, onEntityContextMenu]);

  const initialEdges = useMemo(() =>
    relations.map((rel, i) => ({
      id: rel.id || `rel-${i}`,
      source: rel.sourceEntityId,
      sourcePort: `fk-${rel.sourceColumnIndex}`,
      target: rel.targetEntityId,
      targetPort: 'target',
      type: 'crowfoot',
    })),
  [relations]);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCanvasHistory({ initialNodes, initialEdges });

  // Sync position changes back
  const prevPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  useEffect(() => {
    if (!onEntityMove) return;
    for (const node of nodes) {
      const prev = prevPositions.current.get(node.id);
      if (prev && (Math.abs(prev.x - node.position.x) > 1 || Math.abs(prev.y - node.position.y) > 1)) {
        onEntityMove(node.id, node.position.x, node.position.y);
      }
      prevPositions.current.set(node.id, { ...node.position });
    }
  }, [nodes, onEntityMove]);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent, position: Point) => {
    onDrop?.(e, position);
  }, [onDrop]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (onCanvasContextMenu && !(e.target as HTMLElement).closest('[data-entity-node]')) {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        onCanvasContextMenu(e, { x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }
  }, [onCanvasContextMenu]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', ...style }}
      onContextMenu={handleContextMenu}
    >
      <Canvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={handleDrop as any}
        onDragOver={(e: any) => e.preventDefault()}
        nodeTypes={{ entity: EntityNode }}
        edgeTypes={{ crowfoot: CrowFootEdge }}
        defaultEdgeType="crowfoot"
        fitView={fitView}
        style={{ background: '#fff' }}
      />
    </div>
  );
}

// --- Helpers ---

function buildPorts(columns: EntityColumn[]) {
  const ports: { id: string; type: 'input' | 'output'; position: 'left' | 'right'; offset: number }[] = [
    { id: 'target', type: 'input', position: 'left', offset: HEADER_HEIGHT / 2 },
  ];
  columns.forEach((col, i) => {
    if (col.fk) {
      ports.push({ id: `fk-${i}`, type: 'output', position: 'right', offset: HEADER_HEIGHT + ROW_HEIGHT * i + ROW_HEIGHT / 2 });
    }
  });
  return ports;
}

// --- Crow's Foot Edge ---

function CrowFootEdge({ sourceX, sourceY, targetX, targetY, selected }: EdgeProps) {
  const color = selected ? '#2563eb' : '#374151';
  const midX = (sourceX + targetX) / 2;
  const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
  const dir = targetX >= sourceX ? 1 : -1;
  const tipX = sourceX + dir * 8;
  const len = 30;

  return (
    <g>
      <path d={path} fill="none" stroke="transparent" strokeWidth={12} pointerEvents="stroke" />
      <path d={path} fill="none" stroke={color} strokeWidth={selected ? 2.5 : 1.5} />
      <line x1={tipX} y1={sourceY} x2={tipX - dir * len} y2={sourceY - 18} stroke={color} strokeWidth={1.5} />
      <line x1={tipX} y1={sourceY} x2={tipX - dir * len} y2={sourceY + 18} stroke={color} strokeWidth={1.5} />
    </g>
  );
}
