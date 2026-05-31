"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AnimatedEdge: () => AnimatedEdge,
  BaseEdge: () => BaseEdge,
  BezierEdge: () => BezierEdge,
  Canvas: () => Canvas,
  DefaultConnectionLine: () => DefaultConnectionLine,
  DefaultNode: () => DefaultNode2,
  EdgeLabelRenderer: () => EdgeLabelRenderer,
  Handle: () => Handle,
  MiniMapInner: () => MiniMapInner,
  NodeResizeControl: () => NodeResizeControl,
  NodeResizer: () => NodeResizer,
  NodeToolbar: () => NodeToolbar,
  OrthogonalEdge: () => OrthogonalEdge,
  RotateHandle: () => RotateHandle,
  SHAPE_SIZE: () => SHAPE_SIZE,
  ShapeNode: () => ShapeNode,
  SmoothStepEdge: () => SmoothStepEdge,
  StepEdge: () => StepEdge,
  StraightEdge: () => StraightEdge,
  applyEdgeChanges: () => applyEdgeChanges,
  applyNodeChanges: () => applyNodeChanges,
  checkConnectable: () => checkConnectable,
  getBezierPath: () => getBezierPath,
  getClosestNode: () => getClosestNode,
  getConnectedEdges: () => getConnectedEdges,
  getEdgeAtPoint: () => getEdgeAtPoint,
  getIncomers: () => getIncomers,
  getIntersectingNodes: () => getIntersectingNodes,
  getOrthogonalPath: () => getOrthogonalPath,
  getOutgoers: () => getOutgoers,
  getPortPosition: () => getPortPosition,
  getSmartBezierPath: () => getSmartBezierPath,
  getStepPath: () => getStepPath,
  getStraightPath: () => getStraightPath,
  initCanvas: () => initCanvas,
  isIntersecting: () => isIntersecting,
  nodesToObstacles: () => nodesToObstacles,
  pointToSegmentDistance: () => pointToSegmentDistance,
  shapePaths: () => shapePaths,
  useAutoLayout: () => useAutoLayout,
  useCanvas: () => useCanvas,
  useCanvasHistory: () => useCanvasHistory,
  useCopyPaste: () => useCopyPaste,
  useEasyConnect: () => useEasyConnect,
  useInteractions: () => useInteractions,
  useViewport: () => useViewport
});
module.exports = __toCommonJS(index_exports);

// src/license.ts
var VALID_KEYS = /* @__PURE__ */ new Set([
  "IC-2026-JMCHOI-CANVAS-PRO"
]);
var licensed = false;
function initCanvas(options) {
  if (VALID_KEYS.has(options.licenseKey)) {
    licensed = true;
  } else {
    console.warn("[IntelliCore Canvas] Invalid license key. Get a valid key at https://intellicore.dev");
  }
}
function isLicensed() {
  return licensed;
}

// src/Canvas.tsx
var import_react3 = require("react");

// src/hooks/useViewport.ts
var import_react = require("react");
function useViewport(options = {}) {
  const { minZoom = 0.1, maxZoom = 4, initialViewport } = options;
  const [viewport, setViewport] = (0, import_react.useState)(initialViewport || { x: 0, y: 0, zoom: 1 });
  const isPanning = (0, import_react.useRef)(false);
  const lastMouse = (0, import_react.useRef)({ x: 0, y: 0 });
  const handleWheel = (0, import_react.useCallback)((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const el = e.currentTarget;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setViewport((v) => {
        const newZoom = Math.min(maxZoom, Math.max(minZoom, v.zoom * delta));
        return {
          x: mx - (mx - v.x) * (newZoom / v.zoom),
          y: my - (my - v.y) * (newZoom / v.zoom),
          zoom: newZoom
        };
      });
    } else {
      setViewport((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
    }
  }, [minZoom, maxZoom]);
  const handlePanStart = (0, import_react.useCallback)((e) => {
    if (e.button === 1 || e.button === 0 && e.altKey) {
      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, []);
  const handlePanMove = (0, import_react.useCallback)((e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setViewport((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);
  const handlePanEnd = (0, import_react.useCallback)(() => {
    isPanning.current = false;
  }, []);
  const screenToCanvas = (0, import_react.useCallback)((screenX, screenY) => {
    return {
      x: (screenX - viewport.x) / viewport.zoom,
      y: (screenY - viewport.y) / viewport.zoom
    };
  }, [viewport]);
  const fitView = (0, import_react.useCallback)((nodes, padding = 50) => {
    if (nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + (n.width || 140));
      maxY = Math.max(maxY, n.position.y + (n.height || 40));
    }
    const w = maxX - minX + padding * 2;
    const h = maxY - minY + padding * 2;
    const zoom = Math.min(800 / w, 600 / h, 1);
    setViewport({ x: -minX * zoom + padding, y: -minY * zoom + padding, zoom });
  }, []);
  return { viewport, setViewport, handleWheel, handlePanStart, handlePanMove, handlePanEnd, screenToCanvas, fitView };
}

// src/hooks/useCopyPaste.ts
var import_react2 = require("react");
var PASTE_OFFSET = 50;
function useCopyPaste({ nodes, edges, onNodesChange, onEdgesChange }) {
  const clipboard = (0, import_react2.useRef)(null);
  const copy = (0, import_react2.useCallback)(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = edges.filter(
      (e) => e.selected || selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );
    clipboard.current = { nodes: selectedNodes, edges: selectedEdges };
  }, [nodes, edges]);
  const cut = (0, import_react2.useCallback)(() => {
    copy();
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);
    if (selectedNodes.length) onNodesChange(selectedNodes.map((n) => ({ type: "remove", id: n.id })));
    if (selectedEdges.length) onEdgesChange(selectedEdges.map((e) => ({ type: "remove", id: e.id })));
  }, [copy, nodes, edges, onNodesChange, onEdgesChange]);
  const paste = (0, import_react2.useCallback)(() => {
    if (!clipboard.current || clipboard.current.nodes.length === 0) return;
    const idMap = /* @__PURE__ */ new Map();
    const now = Date.now();
    onNodesChange(nodes.filter((n) => n.selected).map((n) => ({ type: "select", id: n.id, selected: false })));
    const newNodes = clipboard.current.nodes.map((n, i) => {
      const newId = `${n.id}-copy-${now}-${i}`;
      idMap.set(n.id, newId);
      return { ...n, id: newId, position: { x: n.position.x + PASTE_OFFSET, y: n.position.y + PASTE_OFFSET }, selected: true };
    });
    const newEdges = clipboard.current.edges.filter((e) => idMap.has(e.source) && idMap.has(e.target)).map((e, i) => ({
      ...e,
      id: `${e.id}-copy-${now}-${i}`,
      source: idMap.get(e.source),
      target: idMap.get(e.target),
      selected: false
    }));
    onNodesChange(newNodes.map((n) => ({ type: "add", node: n })));
    if (newEdges.length) onEdgesChange(newEdges.map((e) => ({ type: "add", edge: e })));
  }, [nodes, onNodesChange, onEdgesChange]);
  (0, import_react2.useEffect)(() => {
    const handler = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "c":
          copy();
          break;
        case "x":
          cut();
          break;
        case "v":
          e.preventDefault();
          paste();
          break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [copy, cut, paste]);
  return { copy, cut, paste };
}

// src/utils/path.ts
function getBezierPath(source, target) {
  const midY = (source.y + target.y) / 2;
  return `M ${source.x} ${source.y} C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${target.y}`;
}
function getStraightPath(source, target) {
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}
function getStepPath(source, target) {
  const midX = (source.x + target.x) / 2;
  return `M ${source.x} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${target.x} ${target.y}`;
}
function getPortPosition(nodePos, nodeWidth, nodeHeight, portPosition, offset = 0.5) {
  switch (portPosition) {
    case "top":
      return { x: nodePos.x + nodeWidth * offset, y: nodePos.y };
    case "bottom":
      return { x: nodePos.x + nodeWidth * offset, y: nodePos.y + nodeHeight };
    case "left":
      return { x: nodePos.x, y: nodePos.y + nodeHeight * offset };
    case "right":
      return { x: nodePos.x + nodeWidth, y: nodePos.y + nodeHeight * offset };
  }
}
function getSmartBezierPath(source, target, sourceDir, targetDir) {
  const dist = Math.sqrt((target.x - source.x) ** 2 + (target.y - source.y) ** 2);
  const offset = Math.max(30, dist * 0.4);
  const sc = getControlPoint(source, sourceDir, offset);
  const tc = getControlPoint(target, targetDir, offset);
  return `M ${source.x} ${source.y} C ${sc.x} ${sc.y}, ${tc.x} ${tc.y}, ${target.x} ${target.y}`;
}
function getControlPoint(point, dir, offset) {
  switch (dir) {
    case "top":
      return { x: point.x, y: point.y - offset };
    case "bottom":
      return { x: point.x, y: point.y + offset };
    case "left":
      return { x: point.x - offset, y: point.y };
    case "right":
      return { x: point.x + offset, y: point.y };
  }
}

// src/utils/graph.ts
function getConnectedEdges(node, edges) {
  return edges.filter((e) => e.source === node.id || e.target === node.id);
}
function getIncomers(node, nodes, edges) {
  const incomingEdges = edges.filter((e) => e.target === node.id);
  return nodes.filter((n) => incomingEdges.some((e) => e.source === n.id));
}
function getOutgoers(node, nodes, edges) {
  const outgoingEdges = edges.filter((e) => e.source === node.id);
  return nodes.filter((n) => outgoingEdges.some((e) => e.target === n.id));
}
function isIntersecting(nodeA, nodeB) {
  const aW = nodeA.width || 140, aH = nodeA.height || 40;
  const bW = nodeB.width || 140, bH = nodeB.height || 40;
  return !(nodeA.position.x + aW < nodeB.position.x || nodeB.position.x + bW < nodeA.position.x || nodeA.position.y + aH < nodeB.position.y || nodeB.position.y + bH < nodeA.position.y);
}
function getIntersectingNodes(node, nodes) {
  return nodes.filter((n) => n.id !== node.id && isIntersecting(node, n));
}
function getClosestNode(position, nodes, threshold) {
  let closest = null;
  let minDist = threshold;
  for (const n of nodes) {
    const cx = n.position.x + (n.width || 140) / 2;
    const cy = n.position.y + (n.height || 40) / 2;
    const dist = Math.sqrt((position.x - cx) ** 2 + (position.y - cy) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closest = n;
    }
  }
  return closest;
}
function pointToSegmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}
function getEdgeAtPoint(point, edges, nodes, threshold = 20, excludeNodeId) {
  let closest = null;
  let minDist = threshold;
  for (const edge of edges) {
    if (excludeNodeId && (edge.source === excludeNodeId || edge.target === excludeNodeId)) continue;
    const sn = nodes.find((n) => n.id === edge.source);
    const tn = nodes.find((n) => n.id === edge.target);
    if (!sn || !tn) continue;
    const sx = sn.position.x + (sn.width || 140) / 2;
    const sy = sn.position.y + (sn.height || 40) / 2;
    const tx = tn.position.x + (tn.width || 140) / 2;
    const ty = tn.position.y + (tn.height || 40) / 2;
    const dist = pointToSegmentDistance(point.x, point.y, sx, sy, tx, ty);
    if (dist < minDist) {
      minDist = dist;
      closest = edge;
    }
  }
  return closest;
}

// src/components/ConnectionLine.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function DefaultConnectionLine({ fromX, fromY, toX, toY }) {
  const path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: path, fill: "none", stroke: "#2563eb", strokeWidth: 2, strokeDasharray: "6 3", pointerEvents: "none" });
}

// src/Canvas.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var zoomBtnStyle = {
  width: 28,
  height: 28,
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#374151",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
};
function Canvas({
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
  defaultEdgeType = "bezier",
  snapToGrid = false,
  gridSize = 20,
  dropOnEdge = false,
  minZoom = 0.1,
  maxZoom = 4,
  fitView: fitViewProp = false,
  className,
  style,
  children
}) {
  const containerRef = (0, import_react3.useRef)(null);
  const { viewport, setViewport, handleWheel, handlePanStart, handlePanMove, handlePanEnd, screenToCanvas } = useViewport({ minZoom, maxZoom });
  useCopyPaste({ nodes, edges, onNodesChange, onEdgesChange });
  const dragNodeId = (0, import_react3.useRef)(null);
  const dragOffset = (0, import_react3.useRef)({ x: 0, y: 0 });
  const didFitView = (0, import_react3.useRef)(false);
  const [lasso, setLasso] = (0, import_react3.useState)(null);
  const lassoStart = (0, import_react3.useRef)(null);
  const [connecting, setConnecting] = (0, import_react3.useState)(null);
  const [reconnecting, setReconnecting] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
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
      zoom
    });
  }, [fitViewProp, nodes, setViewport]);
  const isDragHandle = (0, import_react3.useCallback)((target, node) => {
    if (!node.dragHandle) return true;
    return target.closest(node.dragHandle) !== null;
  }, []);
  const isNoDrag = (0, import_react3.useCallback)((target) => {
    return target.closest(".nodrag") !== null;
  }, []);
  const handleNodeMouseDown = (0, import_react3.useCallback)((e, node) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const target = e.target;
    if (isNoDrag(target)) {
      if (!containerRef.current) return;
      const rect2 = containerRef.current.getBoundingClientRect();
      const pos = screenToCanvas(e.clientX - rect2.left, e.clientY - rect2.top);
      setConnecting({ sourceId: node.id, sourcePort: void 0, mouse: pos });
      onConnectStart?.(e, { nodeId: node.id });
      if (!node.selected) {
        const deselect = nodes.filter((n) => n.selected && n.id !== node.id).map((n) => ({ type: "select", id: n.id, selected: false }));
        onNodesChange?.([...deselect, { type: "select", id: node.id, selected: true }]);
      }
      return;
    }
    if (!isDragHandle(target, node)) return;
    dragNodeId.current = node.id;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const canvasPos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    dragOffset.current = { x: canvasPos.x - node.position.x, y: canvasPos.y - node.position.y };
    if (e.shiftKey) {
      onNodesChange?.([{ type: "select", id: node.id, selected: !node.selected }]);
    } else if (!node.selected) {
      const deselect = nodes.filter((n) => n.selected && n.id !== node.id).map((n) => ({ type: "select", id: n.id, selected: false }));
      onNodesChange?.([...deselect, { type: "select", id: node.id, selected: true }]);
    }
    onNodeClick?.(e, node);
  }, [screenToCanvas, onNodesChange, onNodeClick, onConnectStart, nodes, isDragHandle, isNoDrag]);
  const handleMouseMove = (0, import_react3.useCallback)((e) => {
    handlePanMove(e);
    if (!containerRef.current) return;
    if (lassoStart.current) {
      const rect2 = containerRef.current.getBoundingClientRect();
      const end = screenToCanvas(e.clientX - rect2.left, e.clientY - rect2.top);
      setLasso({ start: lassoStart.current, end });
      return;
    }
    if (connecting) {
      const rect2 = containerRef.current.getBoundingClientRect();
      const pos = screenToCanvas(e.clientX - rect2.left, e.clientY - rect2.top);
      setConnecting({ ...connecting, mouse: pos });
      return;
    }
    if (reconnecting) {
      const rect2 = containerRef.current.getBoundingClientRect();
      const pos = screenToCanvas(e.clientX - rect2.left, e.clientY - rect2.top);
      setReconnecting({ ...reconnecting, mouse: pos });
      return;
    }
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
      onNodesChange?.(selectedNodes.map((n) => ({ type: "position", id: n.id, position: { x: n.position.x + dx, y: n.position.y + dy } })));
    } else {
      onNodesChange?.([{ type: "position", id: dragNodeId.current, position: { x, y } }]);
    }
  }, [handlePanMove, screenToCanvas, snapToGrid, gridSize, onNodesChange, nodes, connecting, reconnecting]);
  const handleMouseUp = (0, import_react3.useCallback)((e) => {
    if (lassoStart.current && lasso) {
      const minX = Math.min(lasso.start.x, lasso.end.x);
      const maxX = Math.max(lasso.start.x, lasso.end.x);
      const minY = Math.min(lasso.start.y, lasso.end.y);
      const maxY = Math.max(lasso.start.y, lasso.end.y);
      const changes = nodes.map((n) => {
        const inBox = n.position.x >= minX && n.position.x <= maxX && n.position.y >= minY && n.position.y <= maxY;
        return { type: "select", id: n.id, selected: inBox };
      });
      onNodesChange?.(changes);
      lassoStart.current = null;
      setLasso(null);
      return;
    }
    if (connecting) {
      const target = nodes.find((n) => {
        const w = n.width || 140;
        const h = n.height || 40;
        return connecting.mouse.x >= n.position.x && connecting.mouse.x <= n.position.x + w && connecting.mouse.y >= n.position.y && connecting.mouse.y <= n.position.y + h && n.id !== connecting.sourceId;
      });
      if (target && onConnect) {
        const targetEl = document.querySelector(`[data-id="${target.id}"]`);
        let targetPort;
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
              targetPort = h.dataset.handleid;
            }
          });
        }
        onConnect({ source: connecting.sourceId, sourcePort: connecting.sourcePort, target: target.id, targetPort });
      }
      onConnectEnd?.(e);
      setConnecting(null);
      return;
    }
    if (reconnecting) {
      const target = nodes.find((n) => {
        const w = n.width || 140;
        const h = n.height || 40;
        return reconnecting.mouse.x >= n.position.x && reconnecting.mouse.x <= n.position.x + w && reconnecting.mouse.y >= n.position.y && reconnecting.mouse.y <= n.position.y + h && n.id !== reconnecting.edge.source;
      });
      if (target) {
        onReconnect?.(reconnecting.edge, { source: reconnecting.edge.source, target: target.id });
      } else {
        onEdgesChange?.([{ type: "remove", id: reconnecting.edge.id }]);
      }
      onReconnectEnd?.(e, reconnecting.edge);
      setReconnecting(null);
      return;
    }
    if (dragNodeId.current) {
      const draggedNode = nodes.find((n) => n.id === dragNodeId.current);
      if (draggedNode) {
        if (dropOnEdge) {
          const threshold = typeof dropOnEdge === "number" ? dropOnEdge : 20;
          const center = {
            x: draggedNode.position.x + (draggedNode.width || 140) / 2,
            y: draggedNode.position.y + (draggedNode.height || 40) / 2
          };
          const edge = getEdgeAtPoint(center, edges, nodes, threshold, draggedNode.id);
          if (edge) {
            onEdgesChange?.([
              { type: "remove", id: edge.id },
              { type: "add", edge: { id: `e-${edge.source}-${draggedNode.id}-${Date.now()}`, source: edge.source, target: draggedNode.id } },
              { type: "add", edge: { id: `e-${draggedNode.id}-${edge.target}-${Date.now() + 1}`, source: draggedNode.id, target: edge.target } }
            ]);
          }
        }
        onNodeDragStop?.(e, draggedNode);
      }
    }
    dragNodeId.current = null;
    handlePanEnd();
  }, [handlePanEnd, lasso, connecting, reconnecting, nodes, edges, onNodesChange, onConnect, onConnectEnd, onEdgesChange, onReconnect, onReconnectEnd, onNodeDragStop, dropOnEdge]);
  const handlePaneMouseDown = (0, import_react3.useCallback)((e) => {
    handlePanStart(e);
    const target = e.target;
    const isPane = target === e.currentTarget || target.classList.contains("ic-canvas-pane") || target.closest(".ic-canvas-pane") === target;
    if (isPane) {
      if (e.button === 0 && !e.altKey) {
        const rect = containerRef.current.getBoundingClientRect();
        const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
        lassoStart.current = pos;
      }
      onNodesChange?.(nodes.filter((n) => n.selected).map((n) => ({ type: "select", id: n.id, selected: false })));
      onEdgesChange?.(edges.filter((ed) => ed.selected).map((ed) => ({ type: "select", id: ed.id, selected: false })));
      onPaneClick?.(e);
    }
  }, [handlePanStart, screenToCanvas, nodes, edges, onNodesChange, onEdgesChange, onPaneClick]);
  const handleEdgeClick = (0, import_react3.useCallback)((e, edgeId) => {
    e.stopPropagation();
    onNodesChange?.(nodes.filter((n) => n.selected).map((n) => ({ type: "select", id: n.id, selected: false })));
    onEdgesChange?.(edges.map((ed) => ({ type: "select", id: ed.id, selected: ed.id === edgeId })));
    const edge = edges.find((ed) => ed.id === edgeId);
    if (edge) onEdgeClick?.(e, edge);
  }, [nodes, edges, onNodesChange, onEdgesChange, onEdgeClick]);
  const handleEdgeReconnectStart = (0, import_react3.useCallback)((e, edge) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    setReconnecting({ edge, mouse: pos });
    onReconnectStart?.(e, edge);
  }, [screenToCanvas, onReconnectStart]);
  const handlePortMouseDown = (0, import_react3.useCallback)((e, nodeId, portId) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    setConnecting({ sourceId: nodeId, sourcePort: portId, mouse: pos });
    onConnectStart?.(e, { nodeId, portId });
  }, [screenToCanvas, onConnectStart]);
  (0, import_react3.useEffect)(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const sn = nodes.filter((n) => n.selected);
        const se = edges.filter((ed) => ed.selected);
        if (sn.length) {
          onNodesDelete?.(sn);
          onNodesChange?.(sn.map((n) => ({ type: "remove", id: n.id })));
        }
        if (se.length) {
          onEdgesDelete?.(se);
          onEdgesChange?.(se.map((ed) => ({ type: "remove", id: ed.id })));
        }
      }
      if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onNodesChange?.(nodes.map((n) => ({ type: "select", id: n.id, selected: true })));
      }
    };
    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges, onNodesChange, onEdgesChange, onNodesDelete, onEdgesDelete]);
  const handleCanvasDrop = (0, import_react3.useCallback)((e) => {
    e.preventDefault();
    if (!onDrop) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    onDrop(e, pos);
  }, [onDrop, screenToCanvas]);
  const handleCanvasDragOver = (0, import_react3.useCallback)((e) => {
    e.preventDefault();
    onDragOver?.(e);
  }, [onDragOver]);
  function calcEdgePath(edge) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return { path: "", sourcePos: "bottom", targetPos: "top", sx: 0, sy: 0, tx: 0, ty: 0 };
    const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
    const tw = targetNode.width || 140, th = targetNode.height || 40;
    const sCx = sourceNode.position.x + sw / 2;
    const sCy = sourceNode.position.y + sh / 2;
    const tCx = targetNode.position.x + tw / 2;
    const tCy = targetNode.position.y + th / 2;
    const source = getBorderPoint(sCx, sCy, sw, sh, tCx, tCy);
    const target = getBorderPoint(tCx, tCy, tw, th, sCx, sCy);
    const dx = tCx - sCx;
    const dy = tCy - sCy;
    let sourceDir;
    let targetDir;
    const portToDir = (port) => {
      if (!port) return null;
      if (port.includes("right")) return "right";
      if (port.includes("left")) return "left";
      if (port.includes("top")) return "top";
      if (port.includes("bottom")) return "bottom";
      return null;
    };
    const forcedSourceDir = portToDir(edge.sourcePort);
    const forcedTargetDir = portToDir(edge.targetPort);
    if (forcedSourceDir) {
      sourceDir = forcedSourceDir;
    } else if (Math.abs(dy) > Math.abs(dx)) {
      sourceDir = dy > 0 ? "bottom" : "top";
    } else {
      sourceDir = dx > 0 ? "right" : "left";
    }
    if (forcedTargetDir) {
      targetDir = forcedTargetDir;
    } else if (Math.abs(dy) > Math.abs(dx)) {
      targetDir = dy > 0 ? "top" : "bottom";
    } else {
      targetDir = dx > 0 ? "left" : "right";
    }
    const type = edge.type || defaultEdgeType;
    let path;
    switch (type) {
      case "step":
        path = getStepPath(source, target);
        break;
      case "straight":
        path = getStraightPath(source, target);
        break;
      default:
        path = getSmartBezierPath(source, target, sourceDir, targetDir);
        break;
    }
    return { path, sourcePos: sourceDir, targetPos: targetDir, sx: source.x, sy: source.y, tx: target.x, ty: target.y };
  }
  function getBorderPoint(cx, cy, w, h, targetX, targetY) {
    const dx = targetX - cx;
    const dy = targetY - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy + h / 2 };
    const angle = Math.atan2(dy, dx);
    const rx = w / 2;
    const ry = h / 2;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    return { x, y };
  }
  function renderEdge(edge) {
    const { path, sourcePos, targetPos, sx, sy, tx, ty } = calcEdgePath(edge);
    const CustomEdge = edgeTypes[edge.type || ""];
    if (CustomEdge) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { onClick: (e) => handleEdgeClick(e, edge.id), style: { cursor: "pointer" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        CustomEdge,
        {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceX: sx,
          sourceY: sy,
          targetX: tx,
          targetY: ty,
          sourcePosition: sourcePos,
          targetPosition: targetPos,
          selected: !!edge.selected,
          animated: edge.animated,
          label: edge.label,
          style: edge.style,
          data: edge.data
        }
      ) }, edge.id);
    }
    const mid = { x: (sx + tx) / 2, y: (sy + ty) / 2 };
    const angle = Math.atan2(ty - sy, tx - sx);
    const labelOffsetX = -Math.sin(angle) * 14;
    const labelOffsetY = Math.cos(angle) * 14;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { style: { cursor: "pointer" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: path, fill: "none", stroke: "transparent", strokeWidth: 12, pointerEvents: "stroke", onClick: (e) => handleEdgeClick(e, edge.id) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "path",
        {
          d: path,
          fill: "none",
          stroke: edge.selected ? "#2563eb" : "#b0b8c4",
          strokeWidth: edge.selected ? 1.5 : 1,
          strokeDasharray: edge.animated ? "5 5" : void 0,
          markerEnd: edge.selected ? "url(#ic-arrow-selected)" : "url(#ic-arrow)",
          pointerEvents: "none",
          children: edge.animated && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("animate", { attributeName: "stroke-dashoffset", from: "10", to: "0", dur: "0.5s", repeatCount: "indefinite" })
        }
      ),
      edge.label && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "text",
        {
          x: mid.x + labelOffsetX,
          y: mid.y + labelOffsetY,
          textAnchor: "middle",
          dominantBaseline: "middle",
          fontSize: 11,
          fill: "#6b7280",
          pointerEvents: "none",
          children: edge.label
        }
      ),
      edge.reconnectable !== false && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "circle",
        {
          cx: tx,
          cy: ty,
          r: 5,
          fill: "transparent",
          pointerEvents: "auto",
          style: { cursor: "grab" },
          onMouseDown: (e) => handleEdgeReconnectStart(e, edge)
        }
      )
    ] }, edge.id);
  }
  const ConnectionLineComponent = connectionLineComponent || DefaultConnectionLine;
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      ref: containerRef,
      className: `ic-canvas ${className || ""}`,
      tabIndex: 0,
      style: { position: "relative", overflow: "hidden", width: "100%", height: "100%", background: "#fafafa", outline: "none", userSelect: "none", ...style },
      onWheel: handleWheel,
      onMouseDown: handlePaneMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onDrop: handleCanvasDrop,
      onDragOver: handleCanvasDragOver,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("defs", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pattern", { id: "ic-grid", width: gridSize * viewport.zoom, height: gridSize * viewport.zoom, patternUnits: "userSpaceOnUse", x: viewport.x % (gridSize * viewport.zoom), y: viewport.y % (gridSize * viewport.zoom), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "1", cy: "1", r: "1", fill: "#ddd" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("marker", { id: "ic-arrow", viewBox: "0 0 10 10", refX: "10", refY: "5", markerWidth: "4", markerHeight: "4", orient: "auto-start-reverse", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#b0b8c4" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("marker", { id: "ic-arrow-selected", viewBox: "0 0 10 10", refX: "10", refY: "5", markerWidth: "4", markerHeight: "4", orient: "auto-start-reverse", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#2563eb" }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { width: "100%", height: "100%", fill: "url(#ic-grid)", pointerEvents: "none" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`, pointerEvents: "auto", children: [
            edges.map(renderEdge),
            connecting && (() => {
              const sourceNode = nodes.find((n) => n.id === connecting.sourceId);
              if (!sourceNode) return null;
              const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
              const start = getPortPosition(sourceNode.position, sw, sh, "bottom");
              return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ConnectionLineComponent, { fromX: start.x, fromY: start.y, toX: connecting.mouse.x, toY: connecting.mouse.y, fromPosition: "bottom" });
            })(),
            reconnecting && (() => {
              const sourceNode = nodes.find((n) => n.id === reconnecting.edge.source);
              if (!sourceNode) return null;
              const sw = sourceNode.width || 140, sh = sourceNode.height || 40;
              const start = getPortPosition(sourceNode.position, sw, sh, "bottom");
              return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ConnectionLineComponent, { fromX: start.x, fromY: start.y, toX: reconnecting.mouse.x, toY: reconnecting.mouse.y, fromPosition: "bottom" });
            })(),
            lasso && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "rect",
              {
                x: Math.min(lasso.start.x, lasso.end.x),
                y: Math.min(lasso.start.y, lasso.end.y),
                width: Math.abs(lasso.end.x - lasso.start.x),
                height: Math.abs(lasso.end.y - lasso.start.y),
                fill: "rgba(37,99,235,0.08)",
                stroke: "#2563eb",
                strokeWidth: 1,
                strokeDasharray: "4 2",
                pointerEvents: "none"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ic-canvas-pane", style: { position: "absolute", inset: 0, transform, transformOrigin: "0 0", pointerEvents: "none" }, children: nodes.map((node) => {
          const NodeComponent = nodeTypes[node.type];
          const rotation = node.rotation || 0;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "div",
            {
              className: `ic-node ${node.selected ? "ic-node-selected" : ""}`,
              style: {
                position: "absolute",
                left: node.position.x,
                top: node.position.y,
                width: node.width,
                height: node.height,
                cursor: "grab",
                transform: rotation ? `rotate(${rotation}deg)` : void 0,
                transformOrigin: "center center",
                pointerEvents: "auto"
              },
              onMouseDown: (e) => handleNodeMouseDown(e, node),
              onDoubleClick: (e) => onNodeDoubleClick?.(e, node),
              children: NodeComponent ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(NodeComponent, { id: node.id, data: node.data, selected: !!node.selected, ports: node.ports || [], width: node.width, height: node.height, rotation: node.rotation, dragHandle: node.dragHandle }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(DefaultNode, { id: node.id, data: node.data, selected: !!node.selected, ports: node.ports || [], onPortMouseDown: handlePortMouseDown })
            },
            node.id
          );
        }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { position: "absolute", bottom: 12, left: 12, display: "flex", flexDirection: "column", gap: 4, zIndex: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => setViewport((v) => ({ ...v, zoom: Math.min(maxZoom, v.zoom * 1.2) })), style: zoomBtnStyle, title: "Zoom In", children: "+" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => setViewport((v) => ({ ...v, zoom: Math.max(minZoom, v.zoom / 1.2) })), style: zoomBtnStyle, title: "Zoom Out", children: "\u2212" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => {
            const el = containerRef.current;
            if (!el || nodes.length === 0) return;
            const rect = el.getBoundingClientRect();
            let mnX = Infinity, mnY = Infinity, mxX = -Infinity, mxY = -Infinity;
            for (const n of nodes) {
              mnX = Math.min(mnX, n.position.x);
              mnY = Math.min(mnY, n.position.y);
              mxX = Math.max(mxX, n.position.x + (n.width || 140));
              mxY = Math.max(mxY, n.position.y + (n.height || 40));
            }
            const pad = 50, w = mxX - mnX + pad * 2, h = mxY - mnY + pad * 2;
            const z = Math.min(rect.width / w, rect.height / h, 1.5);
            setViewport({ x: (rect.width - w * z) / 2 - mnX * z + pad * z, y: (rect.height - h * z) / 2 - mnY * z + pad * z, zoom: z });
          }, style: zoomBtnStyle, title: "Fit View", children: "\u22A1" })
        ] }),
        children,
        !isLicensed() && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "rgba(0,0,0,0.25)", pointerEvents: "none", userSelect: "none" }, children: "IntelliCore Canvas \u2014 Unlicensed" })
      ]
    }
  );
}
function DefaultNode({ id, data, selected, onPortMouseDown }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: {
    padding: "8px 16px",
    borderRadius: 6,
    border: `2px solid ${selected ? "#2563eb" : "#e0e0e0"}`,
    background: "#fff",
    fontSize: 12,
    boxShadow: selected ? "0 4px 12px rgba(37,99,235,0.15)" : "0 2px 6px rgba(0,0,0,0.06)",
    whiteSpace: "nowrap",
    position: "relative"
  }, children: [
    data.label || id,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        onMouseDown: (e) => onPortMouseDown?.(e, id),
        style: {
          position: "absolute",
          bottom: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#fff",
          border: "2px solid #b0bec5",
          cursor: "crosshair"
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          top: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#fff",
          border: "2px solid #b0bec5"
        }
      }
    )
  ] });
}
function MiniMapInner({ nodes, edges, viewport, containerWidth, containerHeight, width = 160, height = 110 }) {
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
  const vx = -viewport.x / viewport.zoom;
  const vy = -viewport.y / viewport.zoom;
  const vw = containerWidth / viewport.zoom;
  const vh = containerHeight / viewport.zoom;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { position: "absolute", bottom: 12, right: 12, width, height, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width, height, children: [
    nodes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "rect",
      {
        x: (n.position.x - minX + pad) * scale,
        y: (n.position.y - minY + pad) * scale,
        width: (n.width || 140) * scale,
        height: (n.height || 40) * scale,
        fill: n.selected ? "#2563eb" : "#94a3b8",
        rx: 2
      },
      n.id
    )),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "rect",
      {
        x: (vx - minX + pad) * scale,
        y: (vy - minY + pad) * scale,
        width: vw * scale,
        height: vh * scale,
        fill: "none",
        stroke: "#2563eb",
        strokeWidth: 1.5,
        rx: 2
      }
    )
  ] }) });
}

// src/components/Handle.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var positionStyles = {
  top: { top: -5, left: "50%", transform: "translateX(-50%)" },
  bottom: { bottom: -5, left: "50%", transform: "translateX(-50%)" },
  left: { left: -5, top: "50%", transform: "translateY(-50%)" },
  right: { right: -5, top: "50%", transform: "translateY(-50%)" }
};
function Handle({ type, position, id, isConnectable = true, style, className, onMouseDown }) {
  const connectable = typeof isConnectable === "boolean" ? isConnectable : true;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "div",
    {
      "data-handleid": id,
      "data-handletype": type,
      "data-handlepos": position,
      className: `ic-handle ic-handle-${position} ${className || ""}`,
      style: {
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#fff",
        border: "2px solid #b0bec5",
        cursor: connectable ? "crosshair" : "default",
        pointerEvents: connectable ? "auto" : "none",
        ...positionStyles[position],
        ...style
      },
      onMouseDown: connectable ? onMouseDown : void 0
    }
  );
}
function checkConnectable(isConnectable, node, port, connectedEdges) {
  if (isConnectable === void 0 || isConnectable === true) return true;
  if (isConnectable === false) return false;
  if (typeof isConnectable === "number") {
    const count = connectedEdges.filter(
      (e) => e.source === node.id || e.target === node.id
    ).length;
    return count < isConnectable;
  }
  return isConnectable({ node, port, connectedEdges });
}

// src/components/nodes/NodeResizer.tsx
var import_react4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var handlePositions = ["top-left", "top-right", "bottom-left", "bottom-right"];
function NodeResizer({
  minWidth = 10,
  maxWidth = Infinity,
  minHeight = 10,
  maxHeight = Infinity,
  isVisible = true,
  lineStyle,
  handleStyle,
  onResize,
  onResizeEnd
}) {
  if (!isVisible) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ic-node-resizer", style: { position: "absolute", inset: -4, pointerEvents: "none" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { position: "absolute", inset: 0, border: "1px solid #2563eb", borderRadius: 4, ...lineStyle } }),
    handlePositions.map((pos) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      ResizeHandle,
      {
        position: pos,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        style: handleStyle,
        onResize,
        onResizeEnd
      },
      pos
    ))
  ] });
}
function ResizeHandle({
  position,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  style,
  onResize,
  onResizeEnd
}) {
  const startRef = (0, import_react4.useRef)(null);
  const posStyle = {
    position: "absolute",
    width: 8,
    height: 8,
    background: "#fff",
    border: "1.5px solid #2563eb",
    borderRadius: 2,
    pointerEvents: "auto",
    ...position.includes("top") ? { top: -4 } : { bottom: -4 },
    ...position.includes("left") ? { left: -4 } : { right: -4 },
    cursor: position === "top-left" || position === "bottom-right" ? "nwse-resize" : "nesw-resize",
    ...style
  };
  const handleMouseDown = (0, import_react4.useCallback)((e) => {
    e.stopPropagation();
    e.preventDefault();
    const parent = e.target.closest(".ic-node");
    if (!parent) return;
    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    startRef.current = { x: e.clientX, y: e.clientY, w, h };
    const handleMove = (ev) => {
      if (!startRef.current) return;
      const dx = (position.includes("right") ? 1 : -1) * (ev.clientX - startRef.current.x);
      const dy = (position.includes("bottom") ? 1 : -1) * (ev.clientY - startRef.current.y);
      const newW = Math.min(maxWidth, Math.max(minWidth, startRef.current.w + dx));
      const newH = Math.min(maxHeight, Math.max(minHeight, startRef.current.h + dy));
      onResize?.(ev, { width: newW, height: newH });
    };
    const handleUp = (ev) => {
      if (startRef.current) {
        const dx = (position.includes("right") ? 1 : -1) * (ev.clientX - startRef.current.x);
        const dy = (position.includes("bottom") ? 1 : -1) * (ev.clientY - startRef.current.y);
        const newW = Math.min(maxWidth, Math.max(minWidth, startRef.current.w + dx));
        const newH = Math.min(maxHeight, Math.max(minHeight, startRef.current.h + dy));
        onResizeEnd?.(ev, { width: newW, height: newH });
      }
      startRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [position, minWidth, maxWidth, minHeight, maxHeight, onResize, onResizeEnd]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: posStyle, onMouseDown: handleMouseDown });
}
function NodeResizeControl({
  position = "bottom-right",
  minWidth = 10,
  maxWidth = Infinity,
  minHeight = 10,
  maxHeight = Infinity,
  style,
  children,
  onResize
}) {
  const startRef = (0, import_react4.useRef)(null);
  const handleMouseDown = (0, import_react4.useCallback)((e) => {
    e.stopPropagation();
    e.preventDefault();
    const parent = e.target.closest(".ic-node");
    if (!parent) return;
    startRef.current = { x: e.clientX, y: e.clientY, w: parent.offsetWidth, h: parent.offsetHeight };
    const handleMove = (ev) => {
      if (!startRef.current) return;
      const dx = (position.includes("right") ? 1 : -1) * (ev.clientX - startRef.current.x);
      const dy = (position.includes("bottom") ? 1 : -1) * (ev.clientY - startRef.current.y);
      const newW = Math.min(maxWidth, Math.max(minWidth, startRef.current.w + dx));
      const newH = Math.min(maxHeight, Math.max(minHeight, startRef.current.h + dy));
      onResize?.(ev, { width: newW, height: newH });
    };
    const handleUp = () => {
      startRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [position, minWidth, maxWidth, minHeight, maxHeight, onResize]);
  const posStyle = {
    position: "absolute",
    cursor: position === "top-left" || position === "bottom-right" ? "nwse-resize" : "nesw-resize",
    ...position.includes("top") ? { top: 0 } : { bottom: 0 },
    ...position.includes("left") ? { left: 0 } : { right: 0 },
    ...style
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "ic-resize-control", style: posStyle, onMouseDown: handleMouseDown, children: children || /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DefaultResizeIcon, {}) });
}
function DefaultResizeIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { width: "12", height: "12", viewBox: "0 0 12 12", style: { display: "block" }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M11 1L1 11M11 5L5 11M11 9L9 11", stroke: "#6b7280", strokeWidth: "1.5", fill: "none" }) });
}

// src/components/nodes/NodeToolbar.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function NodeToolbar({
  isVisible = true,
  position = "top",
  offset = 10,
  align = "center",
  style,
  className,
  children
}) {
  if (!isVisible) return null;
  const posStyle = getPositionStyle(position, offset, align);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "div",
    {
      className: `ic-node-toolbar ${className || ""}`,
      style: {
        position: "absolute",
        display: "flex",
        gap: 4,
        padding: "4px 6px",
        background: "#fff",
        borderRadius: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        border: "1px solid #e5e7eb",
        zIndex: 10,
        pointerEvents: "auto",
        ...posStyle,
        ...style
      },
      children
    }
  );
}
function getPositionStyle(position, offset, align) {
  const alignStyle = align === "center" ? { left: "50%", transform: "translateX(-50%)" } : align === "start" ? { left: 0 } : { right: 0 };
  switch (position) {
    case "top":
      return { bottom: `calc(100% + ${offset}px)`, ...alignStyle };
    case "bottom":
      return { top: `calc(100% + ${offset}px)`, ...alignStyle };
    case "left":
      return { right: `calc(100% + ${offset}px)`, top: "50%", transform: "translateY(-50%)" };
    case "right":
      return { left: `calc(100% + ${offset}px)`, top: "50%", transform: "translateY(-50%)" };
    default:
      return { bottom: `calc(100% + ${offset}px)`, ...alignStyle };
  }
}

// src/components/nodes/RotateHandle.tsx
var import_react5 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function RotateHandle({ rotation = 0, onRotate, onRotateEnd, style }) {
  const centerRef = (0, import_react5.useRef)(null);
  const handleMouseDown = (0, import_react5.useCallback)((e) => {
    e.stopPropagation();
    e.preventDefault();
    const node = e.target.closest(".ic-node");
    if (!node) return;
    const rect = node.getBoundingClientRect();
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const handleMove = (ev) => {
      if (!centerRef.current) return;
      const angle = Math.atan2(ev.clientY - centerRef.current.y, ev.clientX - centerRef.current.x);
      const deg = (angle * 180 / Math.PI + 90 + 360) % 360;
      onRotate?.(Math.round(deg));
    };
    const handleUp = (ev) => {
      if (centerRef.current) {
        const angle = Math.atan2(ev.clientY - centerRef.current.y, ev.clientX - centerRef.current.x);
        const deg = (angle * 180 / Math.PI + 90 + 360) % 360;
        onRotateEnd?.(Math.round(deg));
      }
      centerRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [onRotate, onRotateEnd]);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "div",
    {
      className: "ic-rotate-handle",
      style: {
        position: "absolute",
        top: -24,
        left: "50%",
        transform: "translateX(-50%)",
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "#fff",
        border: "2px solid #2563eb",
        cursor: "grab",
        pointerEvents: "auto",
        ...style
      },
      onMouseDown: handleMouseDown,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { width: "10", height: "10", viewBox: "0 0 10 10", style: { display: "block", margin: "auto" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M5 1a4 4 0 013.5 2M8.5 3l.5-2M8.5 3l-2 .5", stroke: "#2563eb", strokeWidth: "1", fill: "none" }) })
    }
  );
}

// src/components/nodes/ShapeNode.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var SHAPE_SIZE = 80;
var shapePaths = {
  rectangle: (w, h) => `M0,0 L${w},0 L${w},${h} L0,${h} Z`,
  circle: (w, h) => {
    const rx = w / 2, ry = h / 2;
    return `M${rx},0 A${rx},${ry} 0 1,1 ${rx},${h} A${rx},${ry} 0 1,1 ${rx},0`;
  },
  diamond: (w, h) => `M${w / 2},0 L${w},${h / 2} L${w / 2},${h} L0,${h / 2} Z`,
  hexagon: (w, h) => {
    const q = w / 4;
    return `M${q},0 L${w - q},0 L${w},${h / 2} L${w - q},${h} L${q},${h} L0,${h / 2} Z`;
  },
  triangle: (w, h) => `M${w / 2},0 L${w},${h} L0,${h} Z`,
  parallelogram: (w, h) => {
    const s = w * 0.2;
    return `M${s},0 L${w},0 L${w - s},${h} L0,${h} Z`;
  }
};
function ShapeNode({ id, data, selected }) {
  const { type = "rectangle", color = "#6b7280", label } = data;
  const w = SHAPE_SIZE, h = SHAPE_SIZE;
  const pathFn = shapePaths[type] || shapePaths.rectangle;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { position: "relative", width: w, height: h }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("svg", { width: w, height: h, style: { display: "block" }, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "path",
      {
        d: pathFn(w, h),
        fill: color,
        stroke: selected ? "#2563eb" : color,
        strokeWidth: selected ? 2.5 : 1.5,
        opacity: 0.85
      }
    ) }),
    label && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      color: "#fff",
      fontWeight: 500,
      pointerEvents: "none",
      textShadow: "0 1px 2px rgba(0,0,0,0.3)"
    }, children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Handle, { type: "target", position: "top" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Handle, { type: "source", position: "bottom" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Handle, { type: "target", position: "left" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Handle, { type: "source", position: "right" })
  ] });
}

// src/components/nodes/DefaultNode.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function DefaultNode2({ id, data, selected, onPortMouseDown }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: {
    padding: "8px 16px",
    borderRadius: 6,
    border: `2px solid ${selected ? "#2563eb" : "#e0e0e0"}`,
    background: "#fff",
    fontSize: 12,
    boxShadow: selected ? "0 4px 12px rgba(37,99,235,0.15)" : "0 2px 6px rgba(0,0,0,0.06)",
    whiteSpace: "nowrap",
    position: "relative"
  }, children: [
    data.label || id,
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "div",
      {
        onMouseDown: (e) => onPortMouseDown?.(e, id),
        style: {
          position: "absolute",
          bottom: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#fff",
          border: "2px solid #b0bec5",
          cursor: "crosshair"
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          top: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#fff",
          border: "2px solid #b0bec5"
        }
      }
    )
  ] });
}

// src/components/edges/BaseEdge.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
function BaseEdge({
  path,
  label,
  labelX,
  labelY,
  selected = false,
  animated = false,
  style,
  interactionWidth = 12,
  onClick
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("g", { onClick, style: { cursor: "pointer" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: path, fill: "none", stroke: "transparent", strokeWidth: interactionWidth, pointerEvents: "stroke" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "path",
      {
        d: path,
        fill: "none",
        stroke: selected ? "#2563eb" : "#b0bec5",
        strokeWidth: selected ? 2.5 : 2,
        strokeDasharray: animated ? "5 5" : void 0,
        pointerEvents: "none",
        style,
        children: animated && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("animate", { attributeName: "stroke-dashoffset", from: "10", to: "0", dur: "0.5s", repeatCount: "indefinite" })
      }
    ),
    label && labelX !== void 0 && labelY !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", { x: labelX, y: labelY - 6, textAnchor: "middle", fontSize: 10, fill: "#6b7280", pointerEvents: "none", children: label })
  ] });
}

// src/components/edges/BezierEdge.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
function BezierEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, animated, label, style }) {
  const path = getSmartBezierPath(
    { x: sourceX, y: sourceY },
    { x: targetX, y: targetY },
    sourcePosition,
    targetPosition
  );
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(BaseEdge, { path, selected, animated, label, labelX, labelY, style });
}

// src/components/edges/StraightEdge.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
function StraightEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }) {
  const path = getStraightPath({ x: sourceX, y: sourceY }, { x: targetX, y: targetY });
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(BaseEdge, { path, selected, animated, label, labelX, labelY, style });
}

// src/components/edges/StepEdge.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
function StepEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }) {
  const path = getStepPath({ x: sourceX, y: sourceY }, { x: targetX, y: targetY });
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(BaseEdge, { path, selected, animated, label, labelX, labelY, style });
}
function SmoothStepEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }) {
  const path = getSmoothStepPath({ x: sourceX, y: sourceY }, { x: targetX, y: targetY });
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(BaseEdge, { path, selected, animated, label, labelX, labelY, style });
}
function getSmoothStepPath(source, target) {
  const midX = (source.x + target.x) / 2;
  const r = Math.min(8, Math.abs(target.y - source.y) / 2, Math.abs(midX - source.x));
  if (r < 1) return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  const dy = target.y > source.y ? 1 : -1;
  const dx1 = midX > source.x ? 1 : -1;
  const dx2 = target.x > midX ? 1 : -1;
  return [
    `M ${source.x} ${source.y}`,
    `L ${midX - r * dx1} ${source.y}`,
    `Q ${midX} ${source.y} ${midX} ${source.y + r * dy}`,
    `L ${midX} ${target.y - r * dy}`,
    `Q ${midX} ${target.y} ${midX + r * dx2} ${target.y}`,
    `L ${target.x} ${target.y}`
  ].join(" ");
}

// src/components/edges/AnimatedEdge.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function AnimatedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  label,
  style,
  data
}) {
  const duration = data?.duration || 2;
  const radius = data?.radius || 4;
  const markerColor = data?.markerColor || "#2563eb";
  const path = getSmartBezierPath(
    { x: sourceX, y: sourceY },
    { x: targetX, y: targetY },
    sourcePosition,
    targetPosition
  );
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      "path",
      {
        d: path,
        fill: "none",
        stroke: selected ? "#2563eb" : "#b0bec5",
        strokeWidth: selected ? 2.5 : 2,
        pointerEvents: "stroke",
        style
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", { r: radius, fill: markerColor, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("animateMotion", { dur: `${duration}s`, repeatCount: "indefinite", path }) }),
    label && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 - 6, textAnchor: "middle", fontSize: 10, fill: "#6b7280", children: label })
  ] });
}

// src/utils/routing.ts
var PADDING = 20;
function getOrthogonalPath(source, target, sourceDir, targetDir, obstacles = []) {
  const points = [source];
  const s1 = stepOut(source, sourceDir, PADDING);
  points.push(s1);
  const t1 = stepOut(target, targetDir, PADDING);
  if (sourceDir === "bottom" || sourceDir === "top") {
    if (targetDir === "left" || targetDir === "right") {
      points.push({ x: s1.x, y: t1.y });
    } else {
      const midY = (s1.y + t1.y) / 2;
      points.push({ x: s1.x, y: midY });
      points.push({ x: t1.x, y: midY });
    }
  } else {
    if (targetDir === "top" || targetDir === "bottom") {
      points.push({ x: t1.x, y: s1.y });
    } else {
      const midX = (s1.x + t1.x) / 2;
      points.push({ x: midX, y: s1.y });
      points.push({ x: midX, y: t1.y });
    }
  }
  points.push(t1);
  points.push(target);
  return points.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");
}
function stepOut(point, dir, distance) {
  switch (dir) {
    case "top":
      return { x: point.x, y: point.y - distance };
    case "bottom":
      return { x: point.x, y: point.y + distance };
    case "left":
      return { x: point.x - distance, y: point.y };
    case "right":
      return { x: point.x + distance, y: point.y };
  }
}
function nodesToObstacles(nodes, excludeIds = []) {
  return nodes.filter((n) => !excludeIds.includes(n.id)).map((n) => ({
    x: n.position.x - PADDING / 2,
    y: n.position.y - PADDING / 2,
    width: (n.width || 140) + PADDING,
    height: (n.height || 40) + PADDING
  }));
}

// src/components/edges/OrthogonalEdge.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function OrthogonalEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, animated, label, style }) {
  const path = getOrthogonalPath(
    { x: sourceX, y: sourceY },
    { x: targetX, y: targetY },
    sourcePosition,
    targetPosition
  );
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(BaseEdge, { path, selected, animated, label, labelX, labelY, style });
}

// src/components/edges/EdgeLabelRenderer.tsx
var import_react6 = require("react");
var import_react_dom = require("react-dom");
var CONTAINER_ID = "ic-edge-label-renderer";
function EdgeLabelRenderer({ children }) {
  const [container, setContainer] = (0, import_react6.useState)(null);
  (0, import_react6.useEffect)(() => {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = CONTAINER_ID;
      el.style.position = "absolute";
      el.style.inset = "0";
      el.style.pointerEvents = "none";
      el.style.zIndex = "5";
      const pane = document.querySelector(".ic-canvas-pane");
      if (pane) pane.appendChild(el);
    }
    setContainer(el);
  }, []);
  if (!container) return null;
  return (0, import_react_dom.createPortal)(children, container);
}

// src/hooks/useCanvas.ts
var import_react7 = require("react");

// src/utils/changes.ts
function applyNodeChanges(changes, nodes) {
  let result = [...nodes];
  for (const change of changes) {
    switch (change.type) {
      case "position":
        result = result.map((n) => n.id === change.id ? { ...n, position: change.position } : n);
        break;
      case "select":
        result = result.map((n) => n.id === change.id ? { ...n, selected: change.selected } : n);
        break;
      case "remove":
        result = result.filter((n) => n.id !== change.id);
        break;
      case "add":
        result.push(change.node);
        break;
      case "data":
        result = result.map((n) => n.id === change.id ? { ...n, data: { ...n.data, ...change.data } } : n);
        break;
      case "dimensions":
        result = result.map((n) => n.id === change.id ? { ...n, width: change.width, height: change.height } : n);
        break;
      case "rotation":
        result = result.map((n) => n.id === change.id ? { ...n, rotation: change.rotation } : n);
        break;
    }
  }
  return result;
}
function applyEdgeChanges(changes, edges) {
  let result = [...edges];
  for (const change of changes) {
    switch (change.type) {
      case "select":
        result = result.map((e) => e.id === change.id ? { ...e, selected: change.selected } : e);
        break;
      case "remove":
        result = result.filter((e) => e.id !== change.id);
        break;
      case "add":
        result.push(change.edge);
        break;
    }
  }
  return result;
}

// src/hooks/useCanvas.ts
function useCanvas(options = {}) {
  const [nodes, setNodes] = (0, import_react7.useState)(options.initialNodes || []);
  const [edges, setEdges] = (0, import_react7.useState)(options.initialEdges || []);
  const onNodesChange = (0, import_react7.useCallback)((changes) => {
    setNodes((prev) => applyNodeChanges(changes, prev));
  }, []);
  const onEdgesChange = (0, import_react7.useCallback)((changes) => {
    setEdges((prev) => applyEdgeChanges(changes, prev));
  }, []);
  const onConnect = (0, import_react7.useCallback)((connection) => {
    const newEdge = {
      id: `e-${Date.now()}`,
      source: connection.source,
      sourcePort: connection.sourcePort,
      target: connection.target,
      targetPort: connection.targetPort
    };
    setEdges((prev) => [...prev, newEdge]);
  }, []);
  const addNode = (0, import_react7.useCallback)((node) => {
    setNodes((prev) => [...prev, node]);
  }, []);
  const removeNode = (0, import_react7.useCallback)((id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
  }, []);
  return { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect, addNode, removeNode };
}

// src/hooks/useCanvasHistory.ts
var import_react8 = require("react");
function useCanvasHistory(options = {}) {
  const { initialNodes = [], initialEdges = [], maxHistory = 50, onStateChange } = options;
  const [nodes, setNodes] = (0, import_react8.useState)(initialNodes);
  const [edges, setEdges] = (0, import_react8.useState)(initialEdges);
  const past = (0, import_react8.useRef)([]);
  const future = (0, import_react8.useRef)([]);
  const skipRecord = (0, import_react8.useRef)(false);
  const record = (0, import_react8.useCallback)((prevNodes, prevEdges) => {
    if (skipRecord.current) {
      skipRecord.current = false;
      return;
    }
    past.current = [...past.current.slice(-(maxHistory - 1)), { nodes: prevNodes, edges: prevEdges }];
    future.current = [];
  }, [maxHistory]);
  const onNodesChange = (0, import_react8.useCallback)((changes) => {
    setNodes((prev) => {
      const dominated = changes.some((c) => c.type === "position" || c.type === "remove" || c.type === "add");
      if (dominated) record(prev, edges);
      const next = applyNodeChanges(changes, prev);
      if (dominated && onStateChange) onStateChange({ nodes: next, edges });
      return next;
    });
  }, [edges, record, onStateChange]);
  const onEdgesChange = (0, import_react8.useCallback)((changes) => {
    setEdges((prev) => {
      const dominated = changes.some((c) => c.type === "remove" || c.type === "add");
      if (dominated) record(nodes, prev);
      const next = applyEdgeChanges(changes, prev);
      if (dominated && onStateChange) onStateChange({ nodes, edges: next });
      return next;
    });
  }, [nodes, record, onStateChange]);
  const onConnect = (0, import_react8.useCallback)((connection) => {
    setEdges((prev) => {
      record(nodes, prev);
      const next = [...prev, { id: `e-${Date.now()}`, source: connection.source, sourcePort: connection.sourcePort, target: connection.target, targetPort: connection.targetPort }];
      if (onStateChange) onStateChange({ nodes, edges: next });
      return next;
    });
  }, [nodes, record, onStateChange]);
  const undo = (0, import_react8.useCallback)(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push({ nodes, edges });
    skipRecord.current = true;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    if (onStateChange) onStateChange(prev);
  }, [nodes, edges, onStateChange]);
  const redo = (0, import_react8.useCallback)(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push({ nodes, edges });
    skipRecord.current = true;
    setNodes(next.nodes);
    setEdges(next.edges);
    if (onStateChange) onStateChange(next);
  }, [nodes, edges, onStateChange]);
  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0
  };
}

// src/hooks/useInteractions.ts
var import_react9 = require("react");
function useInteractions({ nodes, edges, setNodes, setEdges }) {
  const connectStartRef = (0, import_react9.useRef)(null);
  const onConnectStart = (0, import_react9.useCallback)((_event, params) => {
    connectStartRef.current = params;
  }, []);
  const onConnectEnd = (0, import_react9.useCallback)((event) => {
    if (!connectStartRef.current) return null;
    const startParams = connectStartRef.current;
    connectStartRef.current = null;
    return startParams;
  }, []);
  const onNodesDelete = (0, import_react9.useCallback)((deletedNodes) => {
    for (const deleted of deletedNodes) {
      const incomers = getIncomers(deleted, nodes, edges);
      const outgoers = getOutgoers(deleted, nodes, edges);
      const newEdges = [];
      for (const incomer of incomers) {
        for (const outgoer of outgoers) {
          newEdges.push({
            id: `e-${incomer.id}-${outgoer.id}-${Date.now()}`,
            source: incomer.id,
            target: outgoer.id
          });
        }
      }
      if (newEdges.length > 0) {
        setEdges((prev) => {
          const filtered = prev.filter((e) => e.source !== deleted.id && e.target !== deleted.id);
          return [...filtered, ...newEdges];
        });
      }
    }
  }, [nodes, edges, setEdges]);
  const getProximityConnection = (0, import_react9.useCallback)((nodeId, position, threshold = 100) => {
    const otherNodes = nodes.filter((n) => n.id !== nodeId);
    return getClosestNode(position, otherNodes, threshold);
  }, [nodes]);
  const connectToProximity = (0, import_react9.useCallback)((sourceId, targetId) => {
    const exists = edges.some(
      (e) => e.source === sourceId && e.target === targetId || e.source === targetId && e.target === sourceId
    );
    if (exists) return;
    setEdges((prev) => [...prev, {
      id: `e-${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId
    }]);
  }, [edges, setEdges]);
  const insertNodeOnEdge = (0, import_react9.useCallback)((nodeId, position, threshold = 20) => {
    const edge = getEdgeAtPoint(position, edges, nodes, threshold, nodeId);
    if (!edge) return false;
    setEdges((prev) => {
      const filtered = prev.filter((e) => e.id !== edge.id);
      return [
        ...filtered,
        { id: `e-${edge.source}-${nodeId}-${Date.now()}`, source: edge.source, target: nodeId },
        { id: `e-${nodeId}-${edge.target}-${Date.now() + 1}`, source: nodeId, target: edge.target }
      ];
    });
    return true;
  }, [nodes, edges, setEdges]);
  return {
    onConnectStart,
    onConnectEnd,
    onNodesDelete,
    getProximityConnection,
    connectToProximity,
    insertNodeOnEdge,
    connectStartRef
  };
}

// src/hooks/useEasyConnect.ts
var import_react10 = require("react");
function useEasyConnect({ onConnect }) {
  const connectingFrom = (0, import_react10.useRef)(null);
  const onNodeMouseDown = (0, import_react10.useCallback)((e, node) => {
    const target = e.target;
    if (target.closest(".drag-handle") || target.closest(".nodrag")) return;
    connectingFrom.current = node.id;
  }, []);
  const onNodeMouseUp = (0, import_react10.useCallback)((_e, node) => {
    if (connectingFrom.current && connectingFrom.current !== node.id) {
      onConnect?.({ source: connectingFrom.current, target: node.id });
    }
    connectingFrom.current = null;
  }, [onConnect]);
  const isConnecting = (0, import_react10.useCallback)(() => connectingFrom.current !== null, []);
  return { onNodeMouseDown, onNodeMouseUp, isConnecting };
}

// src/hooks/useAutoLayout.ts
var import_react11 = require("react");
function useAutoLayout(options = {}) {
  const {
    direction = "TB",
    nodeWidth = 140,
    nodeHeight = 40,
    horizontalSpacing = 60,
    verticalSpacing = 80
  } = options;
  const getLayoutedNodes = (0, import_react11.useCallback)((nodes, edges) => {
    if (nodes.length === 0) return [];
    const children = /* @__PURE__ */ new Map();
    const parents = /* @__PURE__ */ new Map();
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    for (const n of nodes) {
      children.set(n.id, []);
      parents.set(n.id, []);
    }
    for (const e of edges) {
      if (nodeMap.has(e.source) && nodeMap.has(e.target)) {
        children.get(e.source).push(e.target);
        parents.get(e.target).push(e.source);
      }
    }
    const roots = nodes.filter((n) => parents.get(n.id).length === 0);
    if (roots.length === 0) roots.push(nodes[0]);
    const layers = /* @__PURE__ */ new Map();
    const queue = roots.map((r) => r.id);
    for (const id of queue) layers.set(id, 0);
    let i = 0;
    while (i < queue.length) {
      const id = queue[i++];
      const layer = layers.get(id);
      for (const child of children.get(id) || []) {
        if (!layers.has(child)) {
          layers.set(child, layer + 1);
          queue.push(child);
        }
      }
    }
    for (const n of nodes) {
      if (!layers.has(n.id)) layers.set(n.id, 0);
    }
    const layerGroups = /* @__PURE__ */ new Map();
    for (const [id, layer] of layers) {
      if (!layerGroups.has(layer)) layerGroups.set(layer, []);
      layerGroups.get(layer).push(id);
    }
    const isHorizontal = direction === "LR" || direction === "RL";
    const isReversed = direction === "BT" || direction === "RL";
    const changes = [];
    const maxLayer = Math.max(...layerGroups.keys());
    for (const [layer, ids] of layerGroups) {
      const actualLayer = isReversed ? maxLayer - layer : layer;
      const totalWidth = ids.length * (isHorizontal ? nodeHeight : nodeWidth) + (ids.length - 1) * horizontalSpacing;
      const startOffset = -totalWidth / 2;
      ids.forEach((id, idx) => {
        const w = isHorizontal ? nodeHeight : nodeWidth;
        const offset = startOffset + idx * (w + horizontalSpacing) + w / 2;
        const position = isHorizontal ? { x: actualLayer * (nodeWidth + verticalSpacing), y: offset } : { x: offset, y: actualLayer * (nodeHeight + verticalSpacing) };
        position.x += 300;
        position.y += 200;
        changes.push({ type: "position", id, position });
      });
    }
    return changes;
  }, [direction, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing]);
  return { getLayoutedNodes };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnimatedEdge,
  BaseEdge,
  BezierEdge,
  Canvas,
  DefaultConnectionLine,
  DefaultNode,
  EdgeLabelRenderer,
  Handle,
  MiniMapInner,
  NodeResizeControl,
  NodeResizer,
  NodeToolbar,
  OrthogonalEdge,
  RotateHandle,
  SHAPE_SIZE,
  ShapeNode,
  SmoothStepEdge,
  StepEdge,
  StraightEdge,
  applyEdgeChanges,
  applyNodeChanges,
  checkConnectable,
  getBezierPath,
  getClosestNode,
  getConnectedEdges,
  getEdgeAtPoint,
  getIncomers,
  getIntersectingNodes,
  getOrthogonalPath,
  getOutgoers,
  getPortPosition,
  getSmartBezierPath,
  getStepPath,
  getStraightPath,
  initCanvas,
  isIntersecting,
  nodesToObstacles,
  pointToSegmentDistance,
  shapePaths,
  useAutoLayout,
  useCanvas,
  useCanvasHistory,
  useCopyPaste,
  useEasyConnect,
  useInteractions,
  useViewport
});
//# sourceMappingURL=index.js.map