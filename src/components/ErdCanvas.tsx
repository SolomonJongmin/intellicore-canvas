import { DragEvent, useRef, useEffect, useState, useMemo, CSSProperties } from 'react';
import { Canvas, MiniMapInner } from '../Canvas';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import type { EdgeProps, Node, Point } from '../types';

// Column row height constants (must match EntityNode rendering)
const HEADER_HEIGHT = 33;
const ROW_HEIGHT = 22;

// --- Public API Types ---

export interface EntityColumn {
  name: string;
  pk?: boolean;
  fk?: boolean;
}

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
  onDrop?: (event: DragEvent, position: Point) => void;
  fitView?: boolean;
  showMiniMap?: boolean;
  style?: CSSProperties;
}

// --- Component ---

export function ErdCanvas({
  entities,
  relations,
  selectedEntityId,
  onEntitySelect,
  onEntityMove,
  onDrop,
  fitView = true,
  showMiniMap = true,
  style,
}: ErdCanvasProps) {
  const initialNodes: Node<any>[] = useMemo(() =>
    entities.map(ent => ({
      id: ent.id,
      type: 'entity',
      position: { x: ent.x, y: ent.y },
      data: { name: ent.name, columns: ent.columns },
      width: 170,
      height: HEADER_HEIGHT + ent.columns.length * ROW_HEIGHT,
    })),
  [entities]);

  const initialEdges = useMemo(() =>
    relations.map((rel, i) => ({
      id: rel.id || `rel-${i}`,
      source: rel.sourceEntityId,
      target: rel.targetEntityId,
      type: 'crowfoot',
      data: { sourceColIndex: rel.sourceColumnIndex },
    })),
  [relations]);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, undo, redo, canUndo, canRedo } = useCanvasHistory({ initialNodes, initialEdges });

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

  // Undo/Redo keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleDrop = (e: DragEvent, position: Point) => {
    if (onDrop) {
      onDrop(e, position);
    } else {
      const id = `entity-${Date.now()}`;
      onNodesChange([{ type: 'add', node: { id, type: 'entity', position, data: { name: 'NewEntity', columns: [{ name: 'Id', pk: true }] }, width: 160 } }]);
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', ...style }}>
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
      >
        {showMiniMap && (
          <MiniMapInner nodes={nodes} edges={edges} viewport={{ x: 0, y: 0, zoom: 1 }} containerWidth={size.w} containerHeight={size.h} />
        )}
      </Canvas>
    </div>
  );
}

// --- Crow's Foot Edge (from example) ---
function CrowFootEdge({ sourceX, sourceY, targetX, targetY, selected }: EdgeProps) {
  const color = selected ? '#2563eb' : '#374151';

  const midX = (sourceX + targetX) / 2;
  const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;

  const len = 30;
  const dir = targetX >= sourceX ? 1 : -1;
  const tipX = sourceX + dir * 8;
  const a1X = tipX - dir * len;
  const a1Y = sourceY - 18;
  const a2X = tipX - dir * len;
  const a2Y = sourceY + 18;

  return (
    <g>
      <path d={path} fill="none" stroke="transparent" strokeWidth={12} pointerEvents="stroke" />
      <path d={path} fill="none" stroke={color} strokeWidth={selected ? 2.5 : 1.5} />
      <line x1={tipX} y1={sourceY} x2={a1X} y2={a1Y} stroke={color} strokeWidth={1.5} />
      <line x1={tipX} y1={sourceY} x2={a2X} y2={a2Y} stroke={color} strokeWidth={1.5} />
    </g>
  );
}

// --- Entity Node (from example) ---
function EntityNode({ id, data, selected }: { id: string; data: any; selected: boolean; ports: any[] }) {
  const columns: { name: string; pk?: boolean; fk?: boolean }[] = data.columns || [];
  return (
    <div style={{
      minWidth: 140,
      border: `1.5px solid ${selected ? '#1a73e8' : '#d1d5db'}`,
      borderRadius: 4,
      background: '#fff',
      boxShadow: selected ? '0 0 0 2px rgba(26,115,232,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
      fontSize: 13,
      color: '#1f2937',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '8px 10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, height: HEADER_HEIGHT, boxSizing: 'border-box', borderBottom: '1px solid #e5e7eb' }}>
        <EntityIcon />
        {data.name || id}
      </div>
      <div style={{ padding: '4px 0' }}>
        {columns.map((col, i) => (
          <div key={i} style={{ padding: '3px 10px', height: ROW_HEIGHT, boxSizing: 'border-box', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ColumnIcon fk={col.fk} />
            <span style={{ fontWeight: col.pk ? 600 : 400, color: col.fk ? '#c0392b' : '#374151' }}>{col.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Icons (from example) ---
function EntityIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      {[0, 4, 8].map((y) => [0, 4, 8].map((x) => (
        <rect key={`${x}-${y}`} x={x + 1} y={y + 1} width="3" height="3" rx="0.5" fill="#1a73e8" />
      )))}
    </svg>
  );
}

function ColumnIcon({ fk }: { fk?: boolean }) {
  if (fk) {
    const colors = ['#e74c3c', '#27ae60', '#2980b9', '#e74c3c', '#27ae60', '#2980b9', '#e74c3c', '#27ae60', '#2980b9'];
    return (
      <svg width="12" height="12" viewBox="0 0 12 12">
        {[0, 4, 8].map((y, yi) => [0, 4, 8].map((x, xi) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.5" fill={colors[yi * 3 + xi]} opacity={0.8} />
        )))}
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      {[0, 4, 8].map((y) => [0, 4, 8].map((x) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.5" fill="#1a73e8" opacity={0.7} />
      )))}
    </svg>
  );
}
