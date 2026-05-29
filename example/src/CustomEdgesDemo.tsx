import { Canvas, useCanvas, BezierEdge, StraightEdge, StepEdge, SmoothStepEdge, AnimatedEdge, OrthogonalEdge } from '@intellicore/visual-canvas';

const edgeTypes = {
  bezier: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
  animated: AnimatedEdge,
  orthogonal: OrthogonalEdge,
};

export default function CustomEdgesDemo() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCanvas({
    initialNodes: [
      { id: '1', type: 'default', position: { x: 50, y: 50 }, data: { label: 'Bezier' } },
      { id: '2', type: 'default', position: { x: 300, y: 50 }, data: { label: 'Target A' } },
      { id: '3', type: 'default', position: { x: 50, y: 160 }, data: { label: 'Straight' } },
      { id: '4', type: 'default', position: { x: 300, y: 160 }, data: { label: 'Target B' } },
      { id: '5', type: 'default', position: { x: 50, y: 270 }, data: { label: 'Step' } },
      { id: '6', type: 'default', position: { x: 300, y: 270 }, data: { label: 'Target C' } },
      { id: '7', type: 'default', position: { x: 50, y: 380 }, data: { label: 'Animated' } },
      { id: '8', type: 'default', position: { x: 300, y: 380 }, data: { label: 'Target D' } },
      { id: '9', type: 'default', position: { x: 500, y: 120 }, data: { label: 'Orthogonal' } },
      { id: '10', type: 'default', position: { x: 500, y: 320 }, data: { label: 'Target E' } },
    ],
    initialEdges: [
      { id: 'e1', source: '1', target: '2', type: 'bezier', label: 'bezier' },
      { id: 'e2', source: '3', target: '4', type: 'straight', label: 'straight' },
      { id: 'e3', source: '5', target: '6', type: 'step', label: 'step' },
      { id: 'e4', source: '7', target: '8', type: 'animated', data: { duration: 2, markerColor: '#ef4444' } },
      { id: 'e5', source: '9', target: '10', type: 'orthogonal', label: 'orthogonal' },
    ],
  });

  return (
    <div style={{ height: '100%' }}>
      <Canvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        fitView
      />
    </div>
  );
}
