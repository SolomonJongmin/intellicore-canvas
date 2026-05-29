import { DragEvent } from 'react';
import { Canvas, useCanvas, ShapeNode, NodeToolbar, NodeResizer, RotateHandle, Point, ShapeType } from '@intellicore/visual-canvas';

const SHAPES: { type: ShapeType; label: string; color: string }[] = [
  { type: 'circle', label: 'Circle', color: '#3b82f6' },
  { type: 'diamond', label: 'Diamond', color: '#ef4444' },
  { type: 'hexagon', label: 'Hexagon', color: '#8b5cf6' },
  { type: 'triangle', label: 'Triangle', color: '#f59e0b' },
  { type: 'parallelogram', label: 'Parallelogram', color: '#10b981' },
  { type: 'rectangle', label: 'Rectangle', color: '#6366f1' },
];

const COLORS = ['#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];

export default function ShapesDemo() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCanvas({
    initialNodes: [
      { id: '1', type: 'shape', position: { x: 100, y: 100 }, data: { type: 'diamond', color: '#ef4444', label: 'Start' } },
      { id: '2', type: 'shape', position: { x: 300, y: 100 }, data: { type: 'hexagon', color: '#8b5cf6', label: 'Process' } },
      { id: '3', type: 'shape', position: { x: 200, y: 280 }, data: { type: 'circle', color: '#3b82f6', label: 'End' } },
    ],
    initialEdges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
    ],
  });

  const selectedNode = nodes.find((n) => n.selected);

  const handleDrop = (_e: DragEvent, position: Point) => {
    const data = _e.dataTransfer?.getData('shape');
    if (!data) return;
    const shape = JSON.parse(data);
    onNodesChange([{ type: 'add', node: { id: `s-${Date.now()}`, type: 'shape', position, data: shape } }]);
  };

  const changeColor = (color: string) => {
    if (!selectedNode) return;
    onNodesChange([{ type: 'data', id: selectedNode.id, data: { color } }]);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <div style={{ width: 160, background: '#f9fafb', padding: 12, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Drag shapes</p>
        {SHAPES.map((s) => (
          <div
            key={s.type}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('shape', JSON.stringify(s))}
            style={{ padding: '8px 10px', background: '#fff', borderRadius: 6, cursor: 'grab', fontSize: 12, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{ width: 12, height: 12, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            {s.label}
          </div>
        ))}
      </div>
      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={handleDrop as any}
          onDragOver={(e: any) => e.preventDefault()}
          nodeTypes={{ shape: ShapeNodeWithToolbar }}
          fitView
        />
        {/* Color toolbar */}
        {selectedNode && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: '#fff', borderRadius: 8, padding: '8px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', gap: 4 }}>
            {COLORS.map((c) => (
              <div key={c} onClick={() => changeColor(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 0 0 1px #e5e7eb' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShapeNodeWithToolbar(props: any) {
  return (
    <div style={{ position: 'relative' }}>
      <ShapeNode {...props} />
      <NodeToolbar isVisible={props.selected} position="top" offset={8}>
        <span style={{ fontSize: 10, color: '#6b7280' }}>{props.data.type}</span>
      </NodeToolbar>
    </div>
  );
}
