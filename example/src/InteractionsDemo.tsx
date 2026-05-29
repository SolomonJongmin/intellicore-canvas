import { useState, useCallback } from 'react';
import { Canvas, useCanvas, useInteractions, Point, getIntersectingNodes } from '@intellicore/visual-canvas';

export default function InteractionsDemo() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect } = useCanvas({
    initialNodes: [
      { id: '1', type: 'default', position: { x: 100, y: 50 }, data: { label: 'A' } },
      { id: '2', type: 'default', position: { x: 100, y: 180 }, data: { label: 'B (delete me)' } },
      { id: '3', type: 'default', position: { x: 100, y: 310 }, data: { label: 'C' } },
      { id: '4', type: 'default', position: { x: 350, y: 120 }, data: { label: 'Drag near →' } },
      { id: '5', type: 'default', position: { x: 550, y: 120 }, data: { label: '← Target' } },
    ],
    initialEdges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
    ],
  });

  const { onConnectStart, onConnectEnd, onNodesDelete } = useInteractions({ nodes, edges, setNodes, setEdges });
  const [intersecting, setIntersecting] = useState<string[]>([]);

  // Add Node On Edge Drop
  const handleConnectEnd = useCallback((event: any) => {
    const params = onConnectEnd(event);
    if (params) {
      // No target found — create new node at drop position
      // In real usage, you'd get position from the event
    }
  }, [onConnectEnd]);

  // Track intersections for visual feedback
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    // Check intersections after position changes
    const posChange = changes.find((c: any) => c.type === 'position');
    if (posChange) {
      const node = nodes.find((n) => n.id === posChange.id);
      if (node) {
        const updated = { ...node, position: posChange.position };
        const hits = getIntersectingNodes(updated, nodes);
        setIntersecting(hits.map((n) => n.id));
      }
    }
  }, [onNodesChange, nodes]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px', background: '#fffbeb', borderBottom: '1px solid #fde68a', fontSize: 12, color: '#92400e' }}>
        💡 Delete node B to see reconnection (A→C). Drag nodes to see intersection highlights. Drop connection on empty space for Add Node On Edge Drop.
      </div>
      <div style={{ flex: 1 }}>
        <Canvas
          nodes={nodes.map((n) => ({
            ...n,
            data: { ...n.data, highlighted: intersecting.includes(n.id) },
          }))}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={handleConnectEnd}
          onNodesDelete={onNodesDelete}
          nodeTypes={{ default: InteractionNode }}
          fitView
        />
      </div>
    </div>
  );
}

function InteractionNode({ id, data, selected }: { id: string; data: any; selected: boolean; ports: any[] }) {
  const highlighted = data.highlighted;
  return (
    <div style={{
      padding: '10px 18px',
      borderRadius: 8,
      border: `2px solid ${highlighted ? '#f59e0b' : selected ? '#2563eb' : '#e5e7eb'}`,
      background: highlighted ? '#fef3c7' : '#fff',
      fontSize: 13,
      fontWeight: 500,
      boxShadow: highlighted ? '0 0 0 3px rgba(245,158,11,0.2)' : selected ? '0 0 0 3px rgba(37,99,235,0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
      position: 'relative',
      transition: 'all 0.15s',
    }}>
      {data.label || id}
      <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #94a3b8', cursor: 'crosshair' }} />
      <div style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #94a3b8' }} />
    </div>
  );
}
