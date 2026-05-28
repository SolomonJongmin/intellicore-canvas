import { DragEvent, useRef, useEffect, useState } from 'react';
import { Canvas, useCanvasHistory, MiniMapInner, Point } from '@intellicore/visual-canvas';

const WIDGETS = [
  { type: 'input', label: '📥 Input', color: '#e3f2fd' },
  { type: 'process', label: '⚙️ Process', color: '#f3e5f5' },
  { type: 'output', label: '📤 Output', color: '#e8f5e9' },
  { type: 'decision', label: '🔀 Decision', color: '#fff3e0' },
];

export default function FlowEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, undo, redo, canUndo, canRedo } = useCanvasHistory({
    initialNodes: [
      { id: '1', type: 'default', position: { x: 250, y: 40 }, data: { label: '📥 User Request', color: '#e3f2fd' } },
      { id: '2', type: 'default', position: { x: 120, y: 180 }, data: { label: '⚙️ Validate', color: '#f3e5f5' } },
      { id: '3', type: 'default', position: { x: 380, y: 180 }, data: { label: '⚙️ Transform', color: '#f3e5f5' } },
      { id: '4', type: 'default', position: { x: 250, y: 320 }, data: { label: '🔀 Is Valid?', color: '#fff3e0' } },
      { id: '5', type: 'default', position: { x: 250, y: 460 }, data: { label: '📤 Response', color: '#e8f5e9' } },
    ],
    initialEdges: [
      { id: 'e1', source: '1', target: '2', type: 'bezier', label: 'validate' },
      { id: 'e2', source: '1', target: '3', type: 'bezier', label: 'transform' },
      { id: 'e3', source: '2', target: '4', type: 'step' },
      { id: 'e4', source: '3', target: '4', type: 'step' },
      { id: 'e5', source: '4', target: '5', type: 'bezier', label: 'yes' },
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

  // Ctrl+Z/Y
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleDrop = (_e: DragEvent, position: Point) => {
    const data = _e.dataTransfer?.getData('widget');
    if (!data) return;
    const widget = JSON.parse(data);
    onNodesChange([{ type: 'add', node: { id: `n-${Date.now()}`, type: 'default', position, data: { label: widget.label, color: widget.color } } }]);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 180, background: '#f9fafb', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, borderRight: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Drag to canvas</p>
        {WIDGETS.map((w) => (
          <div key={w.type} draggable onDragStart={(e) => e.dataTransfer.setData('widget', JSON.stringify(w))}
            style={{ padding: '8px 10px', background: '#fff', borderRadius: 6, cursor: 'grab', fontSize: 12, color: '#374151', border: '1px solid #e5e7eb' }}>
            {w.label}
          </div>
        ))}
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
          nodeTypes={{ default: FlowNode }}
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

function FlowNode({ id, data, selected }: { id: string; data: any; selected: boolean; ports: any[] }) {
  return (
    <div style={{
      padding: '10px 18px',
      borderRadius: 10,
      border: `2px solid ${selected ? '#2563eb' : '#e5e7eb'}`,
      background: data.color || '#fff',
      fontSize: 13,
      fontWeight: 500,
      boxShadow: selected ? '0 0 0 3px rgba(37,99,235,0.15), 0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
      whiteSpace: 'nowrap',
      color: '#1f2937',
      position: 'relative',
    }}>
      {data.label || id}
      {/* Port handles */}
      <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #94a3b8', cursor: 'crosshair' }} />
      <div style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #94a3b8' }} />
    </div>
  );
}
