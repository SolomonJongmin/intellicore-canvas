import { DragEvent, useRef, useEffect, useState } from 'react';
import { Canvas, useCanvasHistory, MiniMapInner, Point } from '@intellicore/visual-canvas';

export default function ErdEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, undo, redo, canUndo, canRedo } = useCanvasHistory({
    initialNodes: [
      { id: 'entity1', type: 'entity', position: { x: 80, y: 200 }, data: { name: 'Entity1', columns: [{ name: 'Id', pk: true }] }, width: 160 },
      { id: 'entity2', type: 'entity', position: { x: 300, y: 60 }, data: { name: 'Entity2', columns: [{ name: 'Id', pk: true }, { name: 'OpportunityId', fk: true }] }, width: 180 },
      { id: 'entity3', type: 'entity', position: { x: 550, y: 60 }, data: { name: 'Entity3', columns: [{ name: 'Id', pk: true }] }, width: 140 },
      { id: 'opportunity', type: 'entity', position: { x: 380, y: 200 }, data: { name: 'Opportunity', columns: [{ name: 'Id', pk: true }, { name: 'Name' }, { name: 'Attribute1' }, { name: 'Attribute2' }, { name: 'Attribute3' }, { name: 'Entity1Id', fk: true }] }, width: 200 },
    ],
    initialEdges: [
      { id: 'e1', source: 'entity2', target: 'opportunity', type: 'bezier' },
      { id: 'e2', source: 'opportunity', target: 'entity1', type: 'bezier' },
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
          defaultEdgeType="bezier"
          fitView
          style={{ background: '#fff' }}
        >
          <MiniMapInner nodes={nodes} edges={edges} viewport={{ x: 0, y: 0, zoom: 1 }} containerWidth={size.w} containerHeight={size.h} />
        </Canvas>
      </div>
    </div>
  );
}

// --- Entity Node (OutSystems ERD style) ---
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
      {/* Header */}
      <div style={{ padding: '8px 10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #e5e7eb' }}>
        <EntityIcon />
        {data.name || id}
      </div>
      {/* Columns */}
      <div style={{ padding: '4px 0' }}>
        {columns.map((col, i) => (
          <div key={i} style={{ padding: '3px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
            <ColumnIcon fk={col.fk} />
            <span style={{ fontWeight: col.pk ? 600 : 400 }}>{col.name}</span>
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
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      {[0, 4, 8].map((y) => [0, 4, 8].map((x) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.5" fill={fk ? '#8b5cf6' : '#1a73e8'} opacity={0.7} />
      )))}
    </svg>
  );
}
