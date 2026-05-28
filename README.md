# @intellicore/visual-canvas

Visual canvas engine for flow editors, ERD diagrams, and node-based UIs.

Zero dependencies (React peer only). TypeScript-first. <50KB bundle.

## Install

```bash
npm install @intellicore/visual-canvas
```

## Quick Start

```tsx
import { Canvas, useCanvas } from '@intellicore/visual-canvas';

function MyFlowEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCanvas({
    initialNodes: [
      { id: '1', type: 'default', position: { x: 100, y: 0 }, data: { label: 'Start' } },
      { id: '2', type: 'default', position: { x: 100, y: 150 }, data: { label: 'End' } },
    ],
    initialEdges: [
      { id: 'e1', source: '1', target: '2' },
    ],
  });

  return (
    <div style={{ width: '100%', height: 500 }}>
      <Canvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
    </div>
  );
}
```

## Features

- 🖱️ Drag nodes, zoom/pan canvas
- 🔗 Bezier / Step / Straight edge types
- 📌 Port-based connections
- 🎨 Custom node renderers
- 📐 Snap to grid
- 🗺️ MiniMap & Controls (coming soon)
- 📊 ERD preset with crow's foot notation (coming soon)

## License

MIT
