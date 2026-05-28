import { useRef, useCallback, MouseEvent, DragEvent } from 'react';
import type { CanvasProps, Node, Point } from './types';
import { useViewport } from './hooks/useViewport';
import { getBezierPath, getStraightPath, getStepPath, getPortPosition } from './utils/path';

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeDoubleClick,
  onPaneClick,
  onDrop,
  onDragOver,
  nodeTypes = {},
  defaultEdgeType = 'bezier',
  snapToGrid = false,
  gridSize = 20,
  minZoom = 0.1,
  maxZoom = 4,
  className,
  style,
  children,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, handleWheel, handlePanStart, handlePanMove, handlePanEnd, screenToCanvas } = useViewport({ minZoom, maxZoom });
  const dragNodeId = useRef<string | null>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });

  const handleNodeMouseDown = useCallback((e: MouseEvent, node: Node) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    dragNodeId.current = node.id;
    const rect = containerRef.current!.getBoundingClientRect();
    const canvasPos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    dragOffset.current = { x: canvasPos.x - node.position.x, y: canvasPos.y - node.position.y };

    // Select
    onNodesChange?.([{ type: 'select', id: node.id, selected: true }]);
    onNodeClick?.(e as any, node);
  }, [screenToCanvas, onNodesChange, onNodeClick]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handlePanMove(e);
    if (!dragNodeId.current) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const canvasPos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    let x = canvasPos.x - dragOffset.current.x;
    let y = canvasPos.y - dragOffset.current.y;
    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    onNodesChange?.([{ type: 'position', id: dragNodeId.current, position: { x, y } }]);
  }, [handlePanMove, screenToCanvas, snapToGrid, gridSize, onNodesChange]);

  const handleMouseUp = useCallback(() => {
    dragNodeId.current = null;
    handlePanEnd();
  }, [handlePanEnd]);

  const handlePaneClick = useCallback((e: MouseEvent) => {
    // Deselect all
    onNodesChange?.(nodes.filter((n) => n.selected).map((n) => ({ type: 'select' as const, id: n.id, selected: false })));
    onPaneClick?.(e);
  }, [nodes, onNodesChange, onPaneClick]);

  const handleCanvasDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!onDrop) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    onDrop(e as any, pos);
  }, [onDrop, screenToCanvas]);

  const handleCanvasDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    onDragOver?.(e as any);
  }, [onDragOver]);

  // Edge path calculation
  function getEdgePath(edge: typeof edges[0]): string {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return '';

    const sw = sourceNode.width || 140;
    const sh = sourceNode.height || 40;
    const tw = targetNode.width || 140;
    const th = targetNode.height || 40;

    const source = getPortPosition(sourceNode.position, sw, sh, 'bottom');
    const target = getPortPosition(targetNode.position, tw, th, 'top');

    const type = edge.type || defaultEdgeType;
    switch (type) {
      case 'step': return getStepPath(source, target);
      case 'straight': return getStraightPath(source, target);
      default: return getBezierPath(source, target);
    }
  }

  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

  return (
    <div
      ref={containerRef}
      className={`ic-canvas ${className || ''}`}
      style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', background: '#fafafa', ...style }}
      onWheel={handleWheel as any}
      onMouseDown={(e) => { handlePanStart(e); if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('ic-canvas-pane')) handlePaneClick(e); }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
    >
      {/* SVG Layer - Edges + Grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <pattern id="ic-grid" width={gridSize * viewport.zoom} height={gridSize * viewport.zoom} patternUnits="userSpaceOnUse" x={viewport.x % (gridSize * viewport.zoom)} y={viewport.y % (gridSize * viewport.zoom)}>
            <circle cx="1" cy="1" r="1" fill="#ddd" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ic-grid)" />
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          {edges.map((edge) => (
            <path key={edge.id} d={getEdgePath(edge)} fill="none" stroke="#b0bec5" strokeWidth={2} />
          ))}
        </g>
      </svg>

      {/* HTML Layer - Nodes */}
      <div className="ic-canvas-pane" style={{ position: 'absolute', inset: 0, transform, transformOrigin: '0 0' }}>
        {nodes.map((node) => {
          const NodeComponent = nodeTypes[node.type];
          return (
            <div
              key={node.id}
              className={`ic-node ${node.selected ? 'ic-node-selected' : ''}`}
              style={{ position: 'absolute', left: node.position.x, top: node.position.y, cursor: 'grab' }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onDoubleClick={(e) => onNodeDoubleClick?.(e, node)}
            >
              {NodeComponent
                ? <NodeComponent id={node.id} data={node.data} selected={!!node.selected} ports={node.ports || []} />
                : <DefaultNode id={node.id} data={node.data} selected={!!node.selected} ports={node.ports || []} />
              }
            </div>
          );
        })}
      </div>

      {/* Controls / MiniMap */}
      {children}
    </div>
  );
}

function DefaultNode({ id, data, selected }: { id: string; data: Record<string, unknown>; selected: boolean; ports: any[] }) {
  return (
    <div style={{
      padding: '8px 16px',
      borderRadius: 6,
      border: `2px solid ${selected ? '#1a73e8' : '#e0e0e0'}`,
      background: '#fff',
      fontSize: 12,
      boxShadow: selected ? '0 4px 12px rgba(26,115,232,0.2)' : '0 2px 6px rgba(0,0,0,0.06)',
      whiteSpace: 'nowrap',
    }}>
      {(data.label as string) || id}
    </div>
  );
}
