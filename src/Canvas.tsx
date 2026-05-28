import { useRef, useState, useCallback, useEffect, MouseEvent, DragEvent } from 'react';
import type { CanvasProps, Node, Edge, Point, Connection } from './types';
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
  onEdgeClick,
  onPaneClick,
  onDrop,
  onDragOver,
  nodeTypes = {},
  defaultEdgeType = 'bezier',
  snapToGrid = false,
  gridSize = 20,
  minZoom = 0.1,
  maxZoom = 4,
  fitView: fitViewProp = false,
  className,
  style,
  children,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, setViewport, handleWheel, handlePanStart, handlePanMove, handlePanEnd, screenToCanvas } = useViewport({ minZoom, maxZoom });
  const dragNodeId = useRef<string | null>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });
  const didFitView = useRef(false);

  // Lasso selection state
  const [lasso, setLasso] = useState<{ start: Point; end: Point } | null>(null);
  const lassoStart = useRef<Point | null>(null);

  // Drag-to-connect state
  const [connecting, setConnecting] = useState<{ sourceId: string; sourcePort?: string; mouse: Point } | null>(null);

  // fitView on mount
  useEffect(() => {
    if (!fitViewProp || didFitView.current || nodes.length === 0) return;
    didFitView.current = true;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + (n.width || 140));
      maxY = Math.max(maxY, n.position.y + (n.height || 40));
    }
    const pad = 50;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    const zoom = Math.min(rect.width / w, rect.height / h, 1.5);
    setViewport({
      x: (rect.width - w * zoom) / 2 - minX * zoom + pad * zoom,
      y: (rect.height - h * zoom) / 2 - minY * zoom + pad * zoom,
      zoom,
    });
  }, [fitViewProp, nodes, setViewport]);

  // Node drag
  const handleNodeMouseDown = useCallback((e: MouseEvent, node: Node) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    dragNodeId.current = node.id;
    const rect = containerRef.current!.getBoundingClientRect();
    const canvasPos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    dragOffset.current = { x: canvasPos.x - node.position.x, y: canvasPos.y - node.position.y };

    if (e.shiftKey) {
      // Multi-select toggle
      onNodesChange?.([{ type: 'select', id: node.id, selected: !node.selected }]);
    } else if (!node.selected) {
      // Deselect others, select this
      const deselect = nodes.filter((n) => n.selected && n.id !== node.id).map((n) => ({ type: 'select' as const, id: n.id, selected: false }));
      onNodesChange?.([...deselect, { type: 'select', id: node.id, selected: true }]);
    }
    onNodeClick?.(e as any, node);
  }, [screenToCanvas, onNodesChange, onNodeClick, nodes]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handlePanMove(e);

    // Lasso
    if (lassoStart.current) {
      const rect = containerRef.current!.getBoundingClientRect();
      const end = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setLasso({ start: lassoStart.current, end });
      return;
    }

    // Drag-to-connect
    if (connecting) {
      const rect = containerRef.current!.getBoundingClientRect();
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setConnecting({ ...connecting, mouse: pos });
      return;
    }

    // Node drag (supports multi-drag)
    if (!dragNodeId.current) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const canvasPos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    let x = canvasPos.x - dragOffset.current.x;
    let y = canvasPos.y - dragOffset.current.y;
    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    const draggedNode = nodes.find((n) => n.id === dragNodeId.current);
    if (!draggedNode) return;
    const dx = x - draggedNode.position.x;
    const dy = y - draggedNode.position.y;

    // Move all selected nodes together
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length > 1 && draggedNode.selected) {
      onNodesChange?.(selectedNodes.map((n) => ({ type: 'position' as const, id: n.id, position: { x: n.position.x + dx, y: n.position.y + dy } })));
    } else {
      onNodesChange?.([{ type: 'position', id: dragNodeId.current, position: { x, y } }]);
    }
  }, [handlePanMove, screenToCanvas, snapToGrid, gridSize, onNodesChange, nodes, connecting]);

  const handleMouseUp = useCallback(() => {
    // Finish lasso
    if (lassoStart.current && lasso) {
      const minX = Math.min(lasso.start.x, lasso.end.x);
      const maxX = Math.max(lasso.start.x, lasso.end.x);
      const minY = Math.min(lasso.start.y, lasso.end.y);
      const maxY = Math.max(lasso.start.y, lasso.end.y);
      const changes = nodes.map((n) => {
        const inBox = n.position.x >= minX && n.position.x <= maxX && n.position.y >= minY && n.position.y <= maxY;
        return { type: 'select' as const, id: n.id, selected: inBox };
      });
      onNodesChange?.(changes);
      lassoStart.current = null;
      setLasso(null);
      return;
    }

    // Finish connect
    if (connecting) {
      // Find target node under mouse
      const target = nodes.find((n) => {
        const w = n.width || 140;
        const h = n.height || 40;
        return connecting.mouse.x >= n.position.x && connecting.mouse.x <= n.position.x + w &&
               connecting.mouse.y >= n.position.y && connecting.mouse.y <= n.position.y + h &&
               n.id !== connecting.sourceId;
      });
      if (target && onConnect) {
        onConnect({ source: connecting.sourceId, sourcePort: connecting.sourcePort, target: target.id });
      }
      setConnecting(null);
    }

    dragNodeId.current = null;
    handlePanEnd();
  }, [handlePanEnd, lasso, connecting, nodes, onNodesChange, onConnect]);

  const handlePaneMouseDown = useCallback((e: MouseEvent) => {
    handlePanStart(e);
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('ic-canvas-pane')) {
      if (e.button === 0 && !e.altKey) {
        // Start lasso
        const rect = containerRef.current!.getBoundingClientRect();
        const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
        lassoStart.current = pos;
      }
      // Deselect all
      onNodesChange?.(nodes.filter((n) => n.selected).map((n) => ({ type: 'select' as const, id: n.id, selected: false })));
      onEdgesChange?.(edges.filter((ed) => ed.selected).map((ed) => ({ type: 'select' as const, id: ed.id, selected: false })));
      onPaneClick?.(e);
    }
  }, [handlePanStart, screenToCanvas, nodes, edges, onNodesChange, onEdgesChange, onPaneClick]);

  // Edge click
  const handleEdgeClick = useCallback((e: MouseEvent, edgeId: string) => {
    e.stopPropagation();
    onNodesChange?.(nodes.filter((n) => n.selected).map((n) => ({ type: 'select' as const, id: n.id, selected: false })));
    onEdgesChange?.(edges.map((ed) => ({ type: 'select' as const, id: ed.id, selected: ed.id === edgeId })));
    const edge = edges.find((ed) => ed.id === edgeId);
    if (edge) onEdgeClick?.(e as any, edge);
  }, [nodes, edges, onNodesChange, onEdgesChange, onEdgeClick]);

  // Port drag start (for connecting)
  const handlePortMouseDown = useCallback((e: MouseEvent, nodeId: string, portId?: string) => {
    e.stopPropagation();
    const rect = containerRef.current!.getBoundingClientRect();
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    setConnecting({ sourceId: nodeId, sourcePort: portId, mouse: pos });
  }, [screenToCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sn = nodes.filter((n) => n.selected);
        const se = edges.filter((ed) => ed.selected);
        if (sn.length) onNodesChange?.(sn.map((n) => ({ type: 'remove' as const, id: n.id })));
        if (se.length) onEdgesChange?.(se.map((ed) => ({ type: 'remove' as const, id: ed.id })));
      }
      // Ctrl+A select all
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onNodesChange?.(nodes.map((n) => ({ type: 'select' as const, id: n.id, selected: true })));
      }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, onNodesChange, onEdgesChange]);

  // Drop
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

  // Edge path
  function calcEdgePath(edge: Edge): string {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return '';
    const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
    const tw = targetNode.width || 140, th = targetNode.height || 40;
    const source = getPortPosition(sourceNode.position, sw, sh, 'bottom');
    const target = getPortPosition(targetNode.position, tw, th, 'top');
    const type = edge.type || defaultEdgeType;
    switch (type) {
      case 'step': return getStepPath(source, target);
      case 'straight': return getStraightPath(source, target);
      default: return getBezierPath(source, target);
    }
  }

  // Edge label midpoint
  function getEdgeMidpoint(edge: Edge): Point | null {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;
    const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
    const tw = targetNode.width || 140, th = targetNode.height || 40;
    const s = getPortPosition(sourceNode.position, sw, sh, 'bottom');
    const t = getPortPosition(targetNode.position, tw, th, 'top');
    return { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };
  }

  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

  return (
    <div
      ref={containerRef}
      className={`ic-canvas ${className || ''}`}
      tabIndex={0}
      style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', background: '#fafafa', outline: 'none', ...style }}
      onWheel={handleWheel as any}
      onMouseDown={handlePaneMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
    >
      {/* SVG Layer */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <pattern id="ic-grid" width={gridSize * viewport.zoom} height={gridSize * viewport.zoom} patternUnits="userSpaceOnUse" x={viewport.x % (gridSize * viewport.zoom)} y={viewport.y % (gridSize * viewport.zoom)}>
            <circle cx="1" cy="1" r="1" fill="#ddd" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ic-grid)" pointerEvents="none" />
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`} pointerEvents="auto">
          {/* Edges */}
          {edges.map((edge) => (
            <g key={edge.id} onClick={(e) => handleEdgeClick(e as any, edge.id)} style={{ cursor: 'pointer' }}>
              <path d={calcEdgePath(edge)} fill="none" stroke="transparent" strokeWidth={12} pointerEvents="stroke" />
              <path d={calcEdgePath(edge)} fill="none" stroke={edge.selected ? '#2563eb' : '#b0bec5'} strokeWidth={edge.selected ? 2.5 : 2} pointerEvents="none" />
              {/* Edge label */}
              {edge.label && (() => {
                const mid = getEdgeMidpoint(edge);
                if (!mid) return null;
                return (
                  <text x={mid.x} y={mid.y - 6} textAnchor="middle" fontSize={10} fill="#6b7280" pointerEvents="none">
                    {edge.label}
                  </text>
                );
              })()}
            </g>
          ))}
          {/* Connecting line */}
          {connecting && (() => {
            const sourceNode = nodes.find((n) => n.id === connecting.sourceId);
            if (!sourceNode) return null;
            const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
            const start = getPortPosition(sourceNode.position, sw, sh, 'bottom');
            const path = getBezierPath(start, connecting.mouse);
            return <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="6 3" pointerEvents="none" />;
          })()}
          {/* Lasso rect */}
          {lasso && (
            <rect
              x={Math.min(lasso.start.x, lasso.end.x)}
              y={Math.min(lasso.start.y, lasso.end.y)}
              width={Math.abs(lasso.end.x - lasso.start.x)}
              height={Math.abs(lasso.end.y - lasso.start.y)}
              fill="rgba(37,99,235,0.08)"
              stroke="#2563eb"
              strokeWidth={1}
              strokeDasharray="4 2"
              pointerEvents="none"
            />
          )}
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
                : <DefaultNode id={node.id} data={node.data} selected={!!node.selected} ports={node.ports || []} onPortMouseDown={handlePortMouseDown} />
              }
            </div>
          );
        })}
      </div>

      {/* Children (MiniMap, Controls, etc.) */}
      {children}
    </div>
  );
}

function DefaultNode({ id, data, selected, onPortMouseDown }: { id: string; data: Record<string, unknown>; selected: boolean; ports: any[]; onPortMouseDown?: (e: MouseEvent, nodeId: string, portId?: string) => void }) {
  return (
    <div style={{
      padding: '8px 16px',
      borderRadius: 6,
      border: `2px solid ${selected ? '#2563eb' : '#e0e0e0'}`,
      background: '#fff',
      fontSize: 12,
      boxShadow: selected ? '0 4px 12px rgba(37,99,235,0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
      whiteSpace: 'nowrap',
      position: 'relative',
    }}>
      {(data.label as string) || id}
      {/* Bottom port handle */}
      <div
        onMouseDown={(e) => onPortMouseDown?.(e as any, id)}
        style={{
          position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: '#fff', border: '2px solid #b0bec5', cursor: 'crosshair',
        }}
      />
      {/* Top port handle */}
      <div
        style={{
          position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: '#fff', border: '2px solid #b0bec5',
        }}
      />
    </div>
  );
}

// MiniMap component
export function MiniMap({ width = 160, height = 110 }: { width?: number; height?: number }) {
  return null; // Rendered via Canvas children - actual impl below
}

export function MiniMapInner({ nodes, edges, viewport, containerWidth, containerHeight, width = 160, height = 110 }: {
  nodes: Node[]; edges: Edge[]; viewport: { x: number; y: number; zoom: number };
  containerWidth: number; containerHeight: number; width?: number; height?: number;
}) {
  if (nodes.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + (n.width || 140));
    maxY = Math.max(maxY, n.position.y + (n.height || 40));
  }
  const pad = 20;
  const bw = maxX - minX + pad * 2;
  const bh = maxY - minY + pad * 2;
  const scale = Math.min(width / bw, height / bh);

  // Viewport rect in canvas coords
  const vx = (-viewport.x / viewport.zoom);
  const vy = (-viewport.y / viewport.zoom);
  const vw = containerWidth / viewport.zoom;
  const vh = containerHeight / viewport.zoom;

  return (
    <div style={{ position: 'absolute', bottom: 12, right: 12, width, height, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <svg width={width} height={height}>
        {/* Nodes */}
        {nodes.map((n) => (
          <rect
            key={n.id}
            x={(n.position.x - minX + pad) * scale}
            y={(n.position.y - minY + pad) * scale}
            width={(n.width || 140) * scale}
            height={(n.height || 40) * scale}
            fill={n.selected ? '#2563eb' : '#94a3b8'}
            rx={2}
          />
        ))}
        {/* Viewport indicator */}
        <rect
          x={(vx - minX + pad) * scale}
          y={(vy - minY + pad) * scale}
          width={vw * scale}
          height={vh * scale}
          fill="none"
          stroke="#2563eb"
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
    </div>
  );
}
