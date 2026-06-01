import { useRef, useState, useCallback, useEffect, MouseEvent, DragEvent, ComponentType } from 'react';
import type { CanvasProps, Node, Edge, Point, Connection, ConnectionLineProps } from './types';
import { useViewport } from './hooks/useViewport';
import { useCopyPaste } from './hooks/useCopyPaste';
import { getBezierPath, getStraightPath, getStepPath, getPortPosition, getSmartBezierPath, getEllipticalArcPath } from './utils/path';
import { getEdgeAtPoint } from './utils/graph';
import { DefaultConnectionLine } from './components/ConnectionLine';
import { isLicensed } from './license';

const zoomBtnStyle: React.CSSProperties = {
  width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6,
  background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 500,
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  onPaneClick,
  onDrop,
  onDragOver,
  onNodesDelete,
  onEdgesDelete,
  onNodeDragStop,
  onReconnect,
  onReconnectStart,
  onReconnectEnd,
  nodeTypes = {},
  edgeTypes = {},
  connectionLineComponent,
  defaultEdgeType = 'bezier',
  snapToGrid = false,
  gridSize = 20,
  dropOnEdge = false,
  minZoom = 0.1,
  maxZoom = 4,
  fitView: fitViewProp = false,
  className,
  style,
  children,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, setViewport, handleWheel, handlePanStart, handlePanMove, handlePanEnd, screenToCanvas } = useViewport({ minZoom, maxZoom });
  useCopyPaste({ nodes, edges, onNodesChange: onNodesChange!, onEdgesChange: onEdgesChange! });
  const dragNodeId = useRef<string | null>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });
  const didFitView = useRef(false);

  // Lasso selection state
  const [lasso, setLasso] = useState<{ start: Point; end: Point } | null>(null);
  const lassoStart = useRef<Point | null>(null);
  const lassoOrigin = useRef<{ x: number; y: number } | null>(null);

  // Drag-to-connect state
  const [connecting, setConnecting] = useState<{ sourceId: string; sourcePort?: string; mouse: Point } | null>(null);

  // Edge reconnect state
  const [reconnecting, setReconnecting] = useState<{ edge: Edge; mouse: Point } | null>(null);

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

  // Check if element matches dragHandle selector
  const isDragHandle = useCallback((target: HTMLElement, node: Node): boolean => {
    if (!node.dragHandle) return true; // No restriction
    return target.closest(node.dragHandle) !== null;
  }, []);

  // Check if element has nodrag class
  const isNoDrag = useCallback((target: HTMLElement): boolean => {
    return target.closest('.nodrag') !== null;
  }, []);

  // Node drag
  const handleNodeMouseDown = useCallback((e: MouseEvent, node: Node) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;

    // Check nodrag — start connection instead
    if (isNoDrag(target)) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setConnecting({ sourceId: node.id, sourcePort: undefined, mouse: pos });
      onConnectStart?.(e as any, { nodeId: node.id });
      // Select the node
      if (!node.selected) {
        const deselect = nodes.filter((n) => n.selected && n.id !== node.id).map((n) => ({ type: 'select' as const, id: n.id, selected: false }));
        onNodesChange?.([...deselect, { type: 'select', id: node.id, selected: true }]);
      }
      return;
    }
    // Check dragHandle
    if (!isDragHandle(target, node)) return;

    dragNodeId.current = node.id;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const canvasPos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    dragOffset.current = { x: canvasPos.x - node.position.x, y: canvasPos.y - node.position.y };

    if (e.shiftKey) {
      onNodesChange?.([{ type: 'select', id: node.id, selected: !node.selected }]);
    } else if (!node.selected) {
      const deselect = nodes.filter((n) => n.selected && n.id !== node.id).map((n) => ({ type: 'select' as const, id: n.id, selected: false }));
      onNodesChange?.([...deselect, { type: 'select', id: node.id, selected: true }]);
    }
    onNodeClick?.(e as any, node);
  }, [screenToCanvas, onNodesChange, onNodeClick, onConnectStart, nodes, isDragHandle, isNoDrag]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handlePanMove(e);
    if (!containerRef.current) return;

    // Lasso — start only after 5px drag threshold
    if (lassoOrigin.current && !lassoStart.current) {
      const dx = e.clientX - lassoOrigin.current.x;
      const dy = e.clientY - lassoOrigin.current.y;
      if (dx * dx + dy * dy >= 25) {
        const rect = containerRef.current.getBoundingClientRect();
        lassoStart.current = screenToCanvas(lassoOrigin.current.x - rect.left, lassoOrigin.current.y - rect.top);
      }
    }
    if (lassoStart.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const end = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setLasso({ start: lassoStart.current, end });
      return;
    }

    // Drag-to-connect
    if (connecting) {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setConnecting({ ...connecting, mouse: pos });
      return;
    }

    // Edge reconnect
    if (reconnecting) {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setReconnecting({ ...reconnecting, mouse: pos });
      return;
    }

    // Node drag
    if (!dragNodeId.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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

    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length > 1 && draggedNode.selected) {
      onNodesChange?.(selectedNodes.map((n) => ({ type: 'position' as const, id: n.id, position: { x: n.position.x + dx, y: n.position.y + dy } })));
    } else {
      onNodesChange?.([{ type: 'position', id: dragNodeId.current, position: { x, y } }]);
    }
  }, [handlePanMove, screenToCanvas, snapToGrid, gridSize, onNodesChange, nodes, connecting, reconnecting]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
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
      lassoOrigin.current = null;
      setLasso(null);
      return;
    }

    // Finish connect
    if (connecting) {
      const target = nodes.find((n) => {
        const w = n.width || 140;
        const h = n.height || 40;
        return connecting.mouse.x >= n.position.x && connecting.mouse.x <= n.position.x + w &&
               connecting.mouse.y >= n.position.y && connecting.mouse.y <= n.position.y + h &&
               n.id !== connecting.sourceId;
      });
      if (target && onConnect) {
        // 마우스 위치에서 가장 가까운 target handle 찾기
        const targetEl = document.querySelector(`[data-id="${target.id}"]`);
        let targetPort: string | undefined;
        if (targetEl) {
          const handles = targetEl.querySelectorAll('[data-handletype="target"]');
          let minDist = Infinity;
          handles.forEach((h) => {
            const rect = h.getBoundingClientRect();
            const hx = rect.left + rect.width / 2;
            const hy = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - hx, e.clientY - hy);
            if (dist < minDist) {
              minDist = dist;
              targetPort = (h as HTMLElement).dataset.handleid;
            }
          });
        }
        onConnect({ source: connecting.sourceId, sourcePort: connecting.sourcePort, target: target.id, targetPort });
      }
      onConnectEnd?.(e as any);
      setConnecting(null);
      return;
    }

    // Finish edge reconnect
    if (reconnecting) {
      const target = nodes.find((n) => {
        const w = n.width || 140;
        const h = n.height || 40;
        return reconnecting.mouse.x >= n.position.x && reconnecting.mouse.x <= n.position.x + w &&
               reconnecting.mouse.y >= n.position.y && reconnecting.mouse.y <= n.position.y + h &&
               n.id !== reconnecting.edge.source;
      });
      if (target) {
        onReconnect?.(reconnecting.edge, { source: reconnecting.edge.source, target: target.id });
      } else {
        // Dropped on pane — delete edge
        onEdgesChange?.([{ type: 'remove', id: reconnecting.edge.id }]);
      }
      onReconnectEnd?.(e as any, reconnecting.edge);
      setReconnecting(null);
      return;
    }

    // Fire onNodeDragStop if a node was being dragged
    if (dragNodeId.current) {
      const draggedNode = nodes.find((n) => n.id === dragNodeId.current);
      if (draggedNode) {
        // Drop on edge: auto-insert node into edge
        if (dropOnEdge) {
          const threshold = typeof dropOnEdge === 'number' ? dropOnEdge : 20;
          const center: Point = {
            x: draggedNode.position.x + (draggedNode.width || 140) / 2,
            y: draggedNode.position.y + (draggedNode.height || 40) / 2,
          };
          const edge = getEdgeAtPoint(center, edges, nodes, threshold, draggedNode.id);
          if (edge) {
            onEdgesChange?.([
              { type: 'remove', id: edge.id },
              { type: 'add', edge: { id: `e-${edge.source}-${draggedNode.id}-${Date.now()}`, source: edge.source, target: draggedNode.id } },
              { type: 'add', edge: { id: `e-${draggedNode.id}-${edge.target}-${Date.now() + 1}`, source: draggedNode.id, target: edge.target } },
            ]);
          }
        }
        onNodeDragStop?.(e as any, draggedNode);
      }
    }

    dragNodeId.current = null;
    lassoOrigin.current = null;
    lassoStart.current = null;
    handlePanEnd();
  }, [handlePanEnd, lasso, connecting, reconnecting, nodes, edges, onNodesChange, onConnect, onConnectEnd, onEdgesChange, onReconnect, onReconnectEnd, onNodeDragStop, dropOnEdge]);

  const handlePaneMouseDown = useCallback((e: MouseEvent) => {
    handlePanStart(e);
    const target = e.target as HTMLElement;
    const isPane = target === e.currentTarget || target.classList.contains('ic-canvas-pane') || target.closest('.ic-canvas-pane') === target;
    if (isPane) {
      if (e.button === 0 && !e.altKey) {
        lassoOrigin.current = { x: e.clientX, y: e.clientY };
      }
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

  // Edge reconnect start (double-click or drag edge endpoint)
  const handleEdgeReconnectStart = useCallback((e: MouseEvent, edge: Edge) => {
    e.stopPropagation();
    const rect = containerRef.current!.getBoundingClientRect();
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    setReconnecting({ edge, mouse: pos });
    onReconnectStart?.(e as any, edge);
  }, [screenToCanvas, onReconnectStart]);

  // Port drag start (for connecting)
  const handlePortMouseDown = useCallback((e: MouseEvent, nodeId: string, portId?: string) => {
    e.stopPropagation();
    const rect = containerRef.current!.getBoundingClientRect();
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    setConnecting({ sourceId: nodeId, sourcePort: portId, mouse: pos });
    onConnectStart?.(e as any, { nodeId, portId });
  }, [screenToCanvas, onConnectStart]);

  // Keyboard shortcuts
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sn = nodes.filter((n) => n.selected);
        const se = edges.filter((ed) => ed.selected);
        if (sn.length) {
          onNodesDelete?.(sn);
          onNodesChange?.(sn.map((n) => ({ type: 'remove' as const, id: n.id })));
        }
        if (se.length) {
          onEdgesDelete?.(se);
          onEdgesChange?.(se.map((ed) => ({ type: 'remove' as const, id: ed.id })));
        }
      }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onNodesChange?.(nodes.map((n) => ({ type: 'select' as const, id: n.id, selected: true })));
      }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, onNodesChange, onEdgesChange, onNodesDelete, onEdgesDelete]);

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

  // Edge path calculation - radial border intersection
  function calcEdgePath(edge: Edge): { path: string; sourcePos: string; targetPos: string; sx: number; sy: number; tx: number; ty: number; labelX?: number; labelY?: number } {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return { path: '', sourcePos: 'bottom', targetPos: 'top', sx: 0, sy: 0, tx: 0, ty: 0 };
    const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
    const tw = targetNode.width || 140, th = targetNode.height || 40;

    // Node centers
    const sCx = sourceNode.position.x + sw / 2;
    const sCy = sourceNode.position.y + sh / 2;
    const tCx = targetNode.position.x + tw / 2;
    const tCy = targetNode.position.y + th / 2;

    // Calculate border intersection points (radial)
    const source = getBorderPoint(sCx, sCy, sw, sh, tCx, tCy);
    const target = getBorderPoint(tCx, tCy, tw, th, sCx, sCy);

    // Determine direction for smart bezier
    const dx = tCx - sCx;
    const dy = tCy - sCy;
    let sourceDir: 'top' | 'bottom' | 'left' | 'right';
    let targetDir: 'top' | 'bottom' | 'left' | 'right';

    // If port specifies position, use it
    const portToDir = (port?: string): 'top' | 'bottom' | 'left' | 'right' | null => {
      if (!port) return null;
      if (port.includes('right')) return 'right';
      if (port.includes('left')) return 'left';
      if (port.includes('top')) return 'top';
      if (port.includes('bottom')) return 'bottom';
      return null;
    };
    const forcedSourceDir = portToDir(edge.sourcePort);
    const forcedTargetDir = portToDir(edge.targetPort);

    if (forcedSourceDir) { sourceDir = forcedSourceDir; }
    else if (Math.abs(dy) > Math.abs(dx)) { sourceDir = dy > 0 ? 'bottom' : 'top'; }
    else { sourceDir = dx > 0 ? 'right' : 'left'; }

    if (forcedTargetDir) { targetDir = forcedTargetDir; }
    else if (Math.abs(dy) > Math.abs(dx)) { targetDir = dy > 0 ? 'top' : 'bottom'; }
    else { targetDir = dx > 0 ? 'left' : 'right'; }

    const type = edge.type || defaultEdgeType;
    let path: string;

    if (type === 'arc') {
      // Cycle = upper arc, return = lower arc
      const isCycle = edge.label === 'Cycle';
      // Sweep direction depends on whether source is left or right of target
      const leftToRight = source.x < target.x;
      // For left-to-right: sweep=0 is upper arc, sweep=1 is lower arc
      // For right-to-left: it's reversed
      let sweep: 0 | 1;
      if (isCycle) {
        sweep = leftToRight ? 0 : 1;
      } else {
        sweep = leftToRight ? 1 : 0;
      }
      // Perpendicular offset to separate the two arcs
      const sep = 5;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;
      const sign = isCycle ? 1 : -1;
      const s: Point = { x: source.x + nx * sign * sep, y: source.y + ny * sign * sep };
      const t: Point = { x: target.x + nx * sign * sep, y: target.y + ny * sign * sep };
      path = getEllipticalArcPath(s, t, sweep);
      return { path, sourcePos: sourceDir, targetPos: targetDir, sx: s.x, sy: s.y, tx: t.x, ty: t.y };
    }

    switch (type) {
      case 'step': path = getStepPath(source, target); break;
      case 'straight': path = getStraightPath(source, target); break;
      default: path = getSmartBezierPath(source, target, sourceDir, targetDir); break;
    }

    // If there are multiple edges between the same two nodes, curve them slightly
    const pairKey = [edge.source, edge.target].sort().join('-');
    const pairEdges = edges.filter((e) => [e.source, e.target].sort().join('-') === pairKey);
    if (pairEdges.length > 1) {
      const idx = pairEdges.indexOf(edge);
      const isForward = edge.source < edge.target;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;
      const offset = 35 * ((isForward ? idx % 2 : (idx + 1) % 2) === 0 ? 1 : -1);
      const sep = nx * (offset > 0 ? 2 : -2);
      const sepY = ny * (offset > 0 ? 2 : -2);
      const s = { x: source.x + sep, y: source.y + sepY };
      const t = { x: target.x + sep, y: target.y + sepY };
      const mx = (s.x + t.x) / 2 + nx * offset;
      const my = (s.y + t.y) / 2 + ny * offset;
      path = `M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`;
      // Label at quadratic bezier midpoint (t=0.5): (s + 2*control + t) / 4
      const lx = (s.x + 2 * mx + t.x) / 4;
      const ly = (s.y + 2 * my + t.y) / 4;
      return { path, sourcePos: sourceDir, targetPos: targetDir, sx: s.x, sy: s.y, tx: t.x, ty: t.y, labelX: lx, labelY: ly };
    }

    return { path, sourcePos: sourceDir, targetPos: targetDir, sx: source.x, sy: source.y, tx: target.x, ty: target.y };
  }

  // Calculate the point on the node border (elliptical) in the direction of a target point
  function getBorderPoint(cx: number, cy: number, w: number, h: number, targetX: number, targetY: number): Point {
    const dx = targetX - cx;
    const dy = targetY - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy + h / 2 };

    const angle = Math.atan2(dy, dx);
    // Use ellipse formula: point on ellipse at angle
    const rx = w / 2;
    const ry = h / 2;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    return { x, y };
  }

  // Render edge (custom or default)
  function renderEdge(edge: Edge) {
    const { path, sourcePos, targetPos, sx, sy, tx, ty, labelX, labelY } = calcEdgePath(edge);
    const CustomEdge = edgeTypes[edge.type || ''];

    if (CustomEdge) {
      return (
        <g key={edge.id} onClick={(e) => handleEdgeClick(e as any, edge.id)} style={{ cursor: 'pointer' }}>
          <CustomEdge
            id={edge.id}
            source={edge.source}
            target={edge.target}
            sourceX={sx}
            sourceY={sy}
            targetX={tx}
            targetY={ty}
            sourcePosition={sourcePos as any}
            targetPosition={targetPos as any}
            selected={!!edge.selected}
            animated={edge.animated}
            label={edge.label}
            style={edge.style}
            data={edge.data}
          />
        </g>
      );
    }

    // Default edge rendering
    const mid = { x: labelX ?? (sx + tx) / 2, y: labelY ?? (sy + ty) / 2 };
    // Label offset perpendicular to edge direction
    const angle = Math.atan2(ty - sy, tx - sx);
    const labelOffsetX = -Math.sin(angle) * 14;
    const labelOffsetY = Math.cos(angle) * 14;

    return (
      <g key={edge.id} style={{ cursor: 'pointer' }}>
        <path d={path} fill="none" stroke="transparent" strokeWidth={12} pointerEvents="stroke" onClick={(e) => handleEdgeClick(e as any, edge.id)} />
        <path
          d={path}
          fill="none"
          stroke={edge.selected ? '#2563eb' : '#b0b8c4'}
          strokeWidth={edge.selected ? 1.5 : 1}
          strokeDasharray={edge.animated ? '5 5' : undefined}
          markerEnd={edge.selected ? 'url(#ic-arrow-selected)' : 'url(#ic-arrow)'}
          pointerEvents="none"
        >
          {edge.animated && <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.5s" repeatCount="indefinite" />}
        </path>
        {edge.label && (
          <text
            x={mid.x + labelOffsetX}
            y={mid.y + labelOffsetY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="#6b7280"
            pointerEvents="none"
          >
            {edge.label}
          </text>
        )}
        {/* Reconnect handle at target end */}
        {edge.reconnectable !== false && (
          <circle
            cx={tx}
            cy={ty}
            r={5}
            fill="transparent"
            pointerEvents="auto"
            style={{ cursor: 'grab' }}
            onMouseDown={(e) => handleEdgeReconnectStart(e as any, edge)}
          />
        )}
      </g>
    );
  }

  const ConnectionLineComponent = connectionLineComponent || DefaultConnectionLine;
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

  return (
    <div
      ref={containerRef}
      className={`ic-canvas ${className || ''}`}
      tabIndex={0}
      style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', background: '#fafafa', outline: 'none', userSelect: 'none', ...style }}
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
          <marker id="ic-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#b0b8c4" />
          </marker>
          <marker id="ic-arrow-selected" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#ic-grid)" pointerEvents="none" />
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`} pointerEvents="auto">
          {/* Edges */}
          {edges.map(renderEdge)}
          {/* Connecting line */}
          {connecting && (() => {
            const sourceNode = nodes.find((n) => n.id === connecting.sourceId);
            if (!sourceNode) return null;
            const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
            const start = getPortPosition(sourceNode.position, sw, sh, 'bottom');
            return <ConnectionLineComponent fromX={start.x} fromY={start.y} toX={connecting.mouse.x} toY={connecting.mouse.y} fromPosition="bottom" />;
          })()}
          {/* Reconnecting line */}
          {reconnecting && (() => {
            const sourceNode = nodes.find((n) => n.id === reconnecting.edge.source);
            if (!sourceNode) return null;
            const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
            const start = getPortPosition(sourceNode.position, sw, sh, 'bottom');
            return <ConnectionLineComponent fromX={start.x} fromY={start.y} toX={reconnecting.mouse.x} toY={reconnecting.mouse.y} fromPosition="bottom" />;
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
      <div className="ic-canvas-pane" style={{ position: 'absolute', inset: 0, transform, transformOrigin: '0 0', pointerEvents: 'none' }}>
        {nodes.map((node) => {
          const NodeComponent = nodeTypes[node.type];
          const rotation = node.rotation || 0;
          return (
            <div
              key={node.id}
              className={`ic-node ${node.selected ? 'ic-node-selected' : ''}`}
              style={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y,
                width: node.width,
                height: node.height,
                cursor: 'grab',
                transform: rotation ? `rotate(${rotation}deg)` : undefined,
                transformOrigin: 'center center',
                pointerEvents: 'auto',
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onDoubleClick={(e) => onNodeDoubleClick?.(e, node)}
            >
              {NodeComponent
                ? <NodeComponent id={node.id} data={node.data} selected={!!node.selected} ports={node.ports || []} width={node.width} height={node.height} rotation={node.rotation} dragHandle={node.dragHandle} />
                : <DefaultNode id={node.id} data={node.data} selected={!!node.selected} ports={node.ports || []} onPortMouseDown={handlePortMouseDown} />
              }
            </div>
          );
        })}
      </div>

      {/* Zoom Controls */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
        <button onClick={() => setViewport((v) => ({ ...v, zoom: Math.min(maxZoom, v.zoom * 1.2) }))} style={zoomBtnStyle} title="Zoom In">+</button>
        <button onClick={() => setViewport((v) => ({ ...v, zoom: Math.max(minZoom, v.zoom / 1.2) }))} style={zoomBtnStyle} title="Zoom Out">−</button>
        <button onClick={() => {
          const el = containerRef.current;
          if (!el || nodes.length === 0) return;
          const rect = el.getBoundingClientRect();
          let mnX = Infinity, mnY = Infinity, mxX = -Infinity, mxY = -Infinity;
          for (const n of nodes) { mnX = Math.min(mnX, n.position.x); mnY = Math.min(mnY, n.position.y); mxX = Math.max(mxX, n.position.x + (n.width || 140)); mxY = Math.max(mxY, n.position.y + (n.height || 40)); }
          const pad = 50, w = mxX - mnX + pad * 2, h = mxY - mnY + pad * 2;
          const z = Math.min(rect.width / w, rect.height / h, 1.5);
          setViewport({ x: (rect.width - w * z) / 2 - mnX * z + pad * z, y: (rect.height - h * z) / 2 - mnY * z + pad * z, zoom: z });
        }} style={zoomBtnStyle} title="Fit View">⊡</button>
      </div>

      {/* Children (MiniMap, Controls, etc.) */}
      {children}

      {/* License watermark */}
      {!isLicensed() && (
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'rgba(0,0,0,0.25)', pointerEvents: 'none', userSelect: 'none' }}>
          IntelliCore Canvas — Unlicensed
        </div>
      )}
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
      <div
        onMouseDown={(e) => onPortMouseDown?.(e as any, id)}
        style={{
          position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: '#fff', border: '2px solid #b0bec5', cursor: 'crosshair',
        }}
      />
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

  const vx = (-viewport.x / viewport.zoom);
  const vy = (-viewport.y / viewport.zoom);
  const vw = containerWidth / viewport.zoom;
  const vh = containerHeight / viewport.zoom;

  return (
    <div style={{ position: 'absolute', bottom: 12, right: 12, width, height, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <svg width={width} height={height}>
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
