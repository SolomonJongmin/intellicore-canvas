import { DragEvent, useRef, useEffect, useState } from 'react';
import { Canvas, useCanvasHistory, MiniMapInner, Point } from '@intellicore/visual-canvas';
import type { EdgeProps } from '@intellicore/visual-canvas';

// Column row height constants (must match EntityNode rendering)
const HEADER_HEIGHT = 33;
const ROW_HEIGHT = 22;

// Helper: get Y offset for a specific column index within a node
function getColumnY(nodeY: number, colIndex: number): number {
  return nodeY + HEADER_HEIGHT + ROW_HEIGHT * colIndex + ROW_HEIGHT / 2;
}

export default function ErdEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, undo, redo, canUndo, canRedo } = useCanvasHistory({
    initialNodes: [
      { id: 'entity2', type: 'entity', position: { x: 50, y: 30 }, data: { name: 'Entity2', columns: [{ name: 'Id', pk: true }, { name: 'Entity1Id', fk: true }] }, width: 160, height: HEADER_HEIGHT + 2 * ROW_HEIGHT },
      { id: 'order', type: 'entity', position: { x: 380, y: 20 }, data: { name: 'Order', columns: [{ name: 'Id', pk: true }, { name: 'Attribute1' }, { name: 'Qty' }, { name: 'Entity1Id2', fk: true }, { name: 'Entity1Id3', fk: true }] }, width: 180, height: HEADER_HEIGHT + 5 * ROW_HEIGHT },
      { id: 'entity1', type: 'entity', position: { x: 280, y: 250 }, data: { name: 'Entity1', columns: [{ name: 'Id', pk: true }, { name: 'Attribute1' }, { name: 'Entity3Id', fk: true }, { name: 'Entity4Id', fk: true }] }, width: 180, height: HEADER_HEIGHT + 4 * ROW_HEIGHT },
      { id: 'entity3', type: 'entity', position: { x: 30, y: 260 }, data: { name: 'Entity3', columns: [{ name: 'Id', pk: true }, { name: 'Attribute1' }, { name: 'Attribute2' }, { name: 'Attribute3' }] }, width: 170, height: HEADER_HEIGHT + 4 * ROW_HEIGHT },
      { id: 'entity4', type: 'entity', position: { x: 530, y: 280 }, data: { name: 'Entity4', columns: [{ name: 'Id', pk: true }] }, width: 140, height: HEADER_HEIGHT + 1 * ROW_HEIGHT },
    ],
    initialEdges: [
      { id: 'e1', source: 'entity2', target: 'entity1', type: 'crowfoot', data: { sourceColIndex: 1 } },
      { id: 'e2', source: 'order', target: 'entity1', type: 'crowfoot', data: { sourceColIndex: 3 } },
      { id: 'e3', source: 'order', target: 'entity1', type: 'crowfoot', data: { sourceColIndex: 4 } },
      { id: 'e4', source: 'entity1', target: 'entity3', type: 'crowfoot', data: { sourceColIndex: 2 } },
      { id: 'e5', source: 'entity1', target: 'entity4', type: 'crowfoot', data: { sourceColIndex: 3 } },
    ],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleDrop = (_e: DragEvent, position: Point) => {
    const id = `entity-${Date.now()}`;
    onNodesChange([{ type: 'add', node: { id, type: 'entity', position, data: { name: 'NewEntity', columns: [{ name: 'Id', pk: true }] }, width: 160 } }]);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 180, background: '#fff', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, borderRight: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Drag to add</p>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('widget', 'entity')}
          style={{ padding: '8px 10px', background: '#fff', borderRadius: 4, cursor: 'grab', fontSize: 12, color: '#374151', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 6 }}>
          <EntityIcon /> Entity
        </div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('widget', 'static')}
          style={{ padding: '8px 10px', background: '#fff', borderRadius: 4, cursor: 'grab', fontSize: 12, color: '#374151', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 6 }}>
          <EntityIcon /> Static Entity
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 4 }}>
          <button onClick={undo} disabled={!canUndo} style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 4, border: '1px solid #e5e7eb', background: canUndo ? '#fff' : '#f3f4f6', cursor: canUndo ? 'pointer' : 'default' }}>↩ Undo</button>
          <button onClick={redo} disabled={!canRedo} style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 4, border: '1px solid #e5e7eb', background: canRedo ? '#fff' : '#f3f4f6', cursor: canRedo ? 'pointer' : 'default' }}>↪ Redo</button>
        </div>
      </div>
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
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
          fitView
          style={{ background: '#fff' }}
        >
          <MiniMapInner nodes={nodes} edges={edges} viewport={{ x: 0, y: 0, zoom: 1 }} containerWidth={size.w} containerHeight={size.h} />
        </Canvas>
      </div>
    </div>
  );
}

// --- Crow's Foot Edge ---
function CrowFootEdge({ sourceX, sourceY, targetX, targetY, selected }: EdgeProps) {
  const color = selected ? '#2563eb' : '#374151';

  // Bezier curve
  const midX = (sourceX + targetX) / 2;
  const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;

  // Crow's foot "-<" at source (FK row)
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

// --- Entity Node ---
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

// --- Icons ---
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
