import { DragEvent, useRef, useEffect, useState } from 'react';
import { Canvas, useCanvasHistory, MiniMapInner, Point } from '@intellicore/visual-canvas';

export default function ErdEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, undo, redo, canUndo, canRedo } = useCanvasHistory({
    initialNodes: [
      { id: 'users', type: 'table', position: { x: 80, y: 60 }, data: { name: 'users', columns: ['id: PK, int', 'email: varchar(255)', 'name: varchar(100)', 'created_at: timestamp'] }, width: 200, height: 120 },
      { id: 'posts', type: 'table', position: { x: 380, y: 60 }, data: { name: 'posts', columns: ['id: PK, int', 'user_id: FK → users.id', 'title: varchar(200)', 'body: text', 'published: boolean'] }, width: 200, height: 140 },
      { id: 'comments', type: 'table', position: { x: 380, y: 320 }, data: { name: 'comments', columns: ['id: PK, int', 'post_id: FK → posts.id', 'user_id: FK → users.id', 'content: text'] }, width: 200, height: 120 },
      { id: 'tags', type: 'table', position: { x: 80, y: 320 }, data: { name: 'tags', columns: ['id: PK, int', 'name: varchar(50)'] }, width: 200, height: 80 },
      { id: 'post_tags', type: 'table', position: { x: 220, y: 500 }, data: { name: 'post_tags', columns: ['post_id: FK → posts.id', 'tag_id: FK → tags.id'] }, width: 200, height: 80 },
    ],
    initialEdges: [
      { id: 'e1', source: 'users', target: 'posts', type: 'step', label: '1:N' },
      { id: 'e2', source: 'posts', target: 'comments', type: 'step', label: '1:N' },
      { id: 'e3', source: 'users', target: 'comments', type: 'step', label: '1:N' },
      { id: 'e4', source: 'posts', target: 'post_tags', type: 'step', label: 'N:M' },
      { id: 'e5', source: 'tags', target: 'post_tags', type: 'step', label: 'N:M' },
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
    const id = `tbl-${Date.now()}`;
    onNodesChange([{ type: 'add', node: { id, type: 'table', position, data: { name: 'new_table', columns: ['id: PK, int'] }, width: 200, height: 60 } }]);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 180, background: '#f9fafb', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, borderRight: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Drag to add table</p>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('widget', 'table')}
          style={{ padding: '8px 10px', background: '#fff', borderRadius: 6, cursor: 'grab', fontSize: 12, color: '#374151', border: '1px solid #e5e7eb' }}>
          🗄️ Table
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af' }}>
          <p style={{ margin: '3px 0' }}>• Shift+Click: multi-select</p>
          <p style={{ margin: '3px 0' }}>• Drag empty: lasso select</p>
          <p style={{ margin: '3px 0' }}>• Ctrl+Z/Y: undo/redo</p>
          <p style={{ margin: '3px 0' }}>• Ctrl+A: select all</p>
          <p style={{ margin: '3px 0' }}>• Delete: remove</p>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 4 }}>
          <button onClick={undo} disabled={!canUndo} style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 4, border: '1px solid #e5e7eb', background: canUndo ? '#fff' : '#f3f4f6', cursor: canUndo ? 'pointer' : 'default', color: '#374151' }}>↩ Undo</button>
          <button onClick={redo} disabled={!canRedo} style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 4, border: '1px solid #e5e7eb', background: canRedo ? '#fff' : '#f3f4f6', cursor: canRedo ? 'pointer' : 'default', color: '#374151' }}>↪ Redo</button>
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
          nodeTypes={{ table: TableNode }}
          defaultEdgeType="step"
          snapToGrid
          gridSize={20}
          fitView
          style={{ background: '#fafafa' }}
        >
          <MiniMapInner nodes={nodes} edges={edges} viewport={{ x: 0, y: 0, zoom: 1 }} containerWidth={size.w} containerHeight={size.h} />
        </Canvas>
      </div>
    </div>
  );
}

function TableNode({ id, data, selected }: { id: string; data: any; selected: boolean; ports: any[] }) {
  return (
    <div style={{
      minWidth: 200,
      borderRadius: 8,
      border: `2px solid ${selected ? '#2563eb' : '#e5e7eb'}`,
      background: '#fff',
      boxShadow: selected ? '0 0 0 3px rgba(37,99,235,0.15), 0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      fontSize: 12,
      color: '#374151',
    }}>
      <div style={{ padding: '8px 12px', background: '#f3f4f6', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>
        🗄️ {data.name || id}
      </div>
      <div style={{ padding: '6px 0' }}>
        {(data.columns || []).map((col: string, i: number) => (
          <div key={i} style={{ padding: '4px 12px', fontSize: 11, color: col.includes('PK') ? '#d97706' : col.includes('FK') ? '#2563eb' : '#6b7280', fontFamily: 'monospace' }}>
            {col}
          </div>
        ))}
      </div>
    </div>
  );
}
