import { DragEvent, useRef, useEffect, useState } from 'react';
import { Canvas, useCanvasHistory, MiniMapInner, Point, NodeProps } from '@intellicore/visual-canvas';

const WIDGETS = [
  { type: 'start', label: 'Start', icon: '▶', color: '#34a853' },
  { type: 'server-action', label: 'Run Server Action', icon: '●', color: '#e67e22' },
  { type: 'aggregate', label: 'Aggregate', icon: '⊞', color: '#1a73e8' },
  { type: 'sql', label: 'SQL', icon: 'SQL', color: '#0d9488' },
  { type: 'if', label: 'If', icon: '◆', color: '#1a73e8' },
  { type: 'switch', label: 'Switch', icon: '⬡', color: '#1a73e8' },
  { type: 'for-each', label: 'For Each', icon: '↻', color: '#1a73e8' },
  { type: 'assign', label: 'Assign', icon: '═', color: '#1a73e8' },
  { type: 'end', label: 'End', icon: '■', color: '#34a853' },
  { type: 'exception', label: 'Exception Handler', icon: '!', color: '#ea4335' },
  { type: 'raise', label: 'Raise Exception', icon: '⚠', color: '#ea4335' },
  { type: 'comment', label: 'Comment', icon: '💬', color: '#f9ab00' },
];

export default function FlowEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, undo, redo, canUndo, canRedo } = useCanvasHistory({
    initialNodes: [
      { id: '1', type: 'flow', position: { x: 250, y: 40 }, data: { shape: 'start', label: 'Start' }, width: 36, height: 36 },
      { id: '2', type: 'flow', position: { x: 200, y: 180 }, data: { shape: 'if', label: 'True?' }, width: 36, height: 36 },
      { id: '3', type: 'flow', position: { x: 420, y: 180 }, data: { shape: 'assign', label: 'Assign' }, width: 36, height: 36 },
      { id: '4', type: 'flow', position: { x: 340, y: 320 }, data: { shape: 'end', label: 'End' }, width: 36, height: 36 },
      { id: '5', type: 'flow', position: { x: 200, y: 380 }, data: { shape: 'end', label: 'End' }, width: 36, height: 36 },
    ],
    initialEdges: [
      { id: 'e1', source: '1', target: '2', type: 'straight' },
      { id: 'e2', source: '2', target: '3', type: 'straight', label: 'True' },
      { id: 'e3', source: '2', target: '5', type: 'straight', label: 'False' },
      { id: 'e4', source: '3', target: '4', type: 'straight' },
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
    const data = _e.dataTransfer?.getData('widget');
    if (!data) return;
    const widget = JSON.parse(data);
    onNodesChange([{ type: 'add', node: { id: `n-${Date.now()}`, type: 'flow', position, data: { shape: widget.type, label: widget.label }, width: 36, height: 36 } }]);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar - widget palette */}
      <div style={{ width: 190, background: '#fff', padding: '12px 8px', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {WIDGETS.map((w) => (
            <div
              key={w.type}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('widget', JSON.stringify(w))}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', cursor: 'grab', borderRadius: 6, fontSize: 11, color: '#374151', textAlign: 'center' }}
            >
              <FlowIcon shape={w.type} color={w.color} size={32} />
              <span>{w.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 4, padding: '0 4px' }}>
          <button onClick={undo} disabled={!canUndo} style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 4, border: '1px solid #e5e7eb', background: canUndo ? '#fff' : '#f3f4f6', cursor: canUndo ? 'pointer' : 'default' }}>↩ Undo</button>
          <button onClick={redo} disabled={!canRedo} style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 4, border: '1px solid #e5e7eb', background: canRedo ? '#fff' : '#f3f4f6', cursor: canRedo ? 'pointer' : 'default' }}>↪ Redo</button>
        </div>
      </div>
      {/* Canvas */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={handleDrop as any}
          onDragOver={(e: any) => e.preventDefault()}
          nodeTypes={{ flow: FlowNodeComponent }}
          defaultEdgeType="straight"
          dropOnEdge={20}
          snapToGrid
          gridSize={20}
          fitView
          style={{ background: '#fff' }}
        >
          <MiniMapInner nodes={nodes} edges={edges} viewport={{ x: 0, y: 0, zoom: 1 }} containerWidth={size.w} containerHeight={size.h} />
        </Canvas>
      </div>
    </div>
  );
}

// --- Flow Node Component ---
function FlowNodeComponent({ id, data, selected }: NodeProps<any>) {
  const shape = data.shape || 'start';
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, height: 36 }}>
      {/* Label above */}
      {data.label && (
        <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 500, color: '#1f2937' }}>
          {data.label}
        </div>
      )}
      {/* Shape (drag area) */}
      <div className="drag-handle" style={{ position: 'relative', cursor: 'grab', zIndex: 2 }}>
        <FlowIcon shape={shape} size={36} selected={selected} />
        {/* Selection handles */}
        {selected && (
          <>
            <div style={{ ...handleStyle, top: -4, left: -4 }} />
            <div style={{ ...handleStyle, top: -4, right: -4 }} />
            <div style={{ ...handleStyle, bottom: -4, left: -4 }} />
            <div style={{ ...handleStyle, bottom: -4, right: -4 }} />
          </>
        )}
      </div>
      {/* Connection ring (outer area for starting connections) */}
      <div
        className="nodrag"
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50%',
          cursor: 'crosshair',
          zIndex: 1,
        }}
      />
    </div>
  );
}

const handleStyle: React.CSSProperties = {
  position: 'absolute',
  width: 7,
  height: 7,
  background: '#fff',
  border: '1.5px solid #1a73e8',
};

// --- Flow Icon (SVG shapes) ---
function FlowIcon({ shape, color, size = 32, selected }: { shape: string; color?: string; size?: number; selected?: boolean }) {
  const s = size;
  const stroke = selected ? '#1a73e8' : 'none';
  const strokeWidth = selected ? 2 : 0;

  switch (shape) {
    case 'start':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill={color || '#34a853'} stroke={stroke} strokeWidth={strokeWidth} />
          <polygon points="20,16 34,24 20,32" fill="#fff" />
        </svg>
      );
    case 'end':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke={color || '#34a853'} strokeWidth="3" />
          <rect x="16" y="16" width="16" height="16" rx="2" fill={color || '#34a853'} />
        </svg>
      );
    case 'if':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <polygon points="24,4 44,24 24,44 4,24" fill={color || '#1a73e8'} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'switch':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill={color || '#1a73e8'} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="24" cy="24" r="8" fill="#fff" opacity="0.4" />
        </svg>
      );
    case 'assign':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill={color || '#1a73e8'} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="14" y="21" width="20" height="3" rx="1" fill="#fff" />
          <rect x="14" y="26" width="20" height="3" rx="1" fill="#fff" />
        </svg>
      );
    case 'for-each':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke={color || '#1a73e8'} strokeWidth="2.5" />
          <path d="M18 16 A10 10 0 1 1 16 28" fill="none" stroke={color || '#1a73e8'} strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="14,24 18,30 20,25" fill={color || '#1a73e8'} />
        </svg>
      );
    case 'aggregate':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <rect x="8" y="8" width="32" height="32" rx="4" fill={color || '#1a73e8'} stroke={stroke} strokeWidth={strokeWidth} />
          {[14, 20, 26, 32].map((y) => (
            <g key={y}>{[14, 20, 26, 32].map((x) => <rect key={x} x={x} y={y} width="4" height="4" fill="#fff" opacity="0.7" />)}</g>
          ))}
        </svg>
      );
    case 'sql':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <rect x="8" y="8" width="32" height="32" rx="4" fill={color || '#0d9488'} stroke={stroke} strokeWidth={strokeWidth} />
          <text x="24" y="29" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">SQL</text>
        </svg>
      );
    case 'server-action':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill={color || '#e67e22'} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'exception':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill={color || '#ea4335'} stroke={stroke} strokeWidth={strokeWidth} />
          <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fff">!</text>
        </svg>
      );
    case 'raise':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <polygon points="24,6 44,40 4,40" fill="none" stroke={color || '#ea4335'} strokeWidth="3" />
          <text x="24" y="35" textAnchor="middle" fontSize="16" fontWeight="bold" fill={color || '#ea4335'}>!</text>
        </svg>
      );
    case 'comment':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <rect x="8" y="10" width="32" height="24" rx="4" fill={color || '#f9ab00'} stroke={stroke} strokeWidth={strokeWidth} />
          <polygon points="16,34 20,34 18,40" fill={color || '#f9ab00'} />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill={color || '#6b7280'} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
  }
}
