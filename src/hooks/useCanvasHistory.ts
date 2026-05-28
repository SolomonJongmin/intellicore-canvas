import { useState, useCallback, useRef } from 'react';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '../types';
import { applyNodeChanges, applyEdgeChanges } from '../utils/changes';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
}

interface UseCanvasHistoryOptions {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  maxHistory?: number;
  onStateChange?: (state: CanvasState) => void;
}

export function useCanvasHistory(options: UseCanvasHistoryOptions = {}) {
  const { initialNodes = [], initialEdges = [], maxHistory = 50, onStateChange } = options;
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const past = useRef<CanvasState[]>([]);
  const future = useRef<CanvasState[]>([]);
  const skipRecord = useRef(false);

  const record = useCallback((prevNodes: Node[], prevEdges: Edge[]) => {
    if (skipRecord.current) { skipRecord.current = false; return; }
    past.current = [...past.current.slice(-(maxHistory - 1)), { nodes: prevNodes, edges: prevEdges }];
    future.current = [];
  }, [maxHistory]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((prev) => {
      // Only record for meaningful changes (position, remove, add)
      const dominated = changes.some((c) => c.type === 'position' || c.type === 'remove' || c.type === 'add');
      if (dominated) record(prev, edges);
      const next = applyNodeChanges(changes, prev);
      if (dominated && onStateChange) onStateChange({ nodes: next, edges });
      return next;
    });
  }, [edges, record, onStateChange]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((prev) => {
      const dominated = changes.some((c) => c.type === 'remove' || c.type === 'add');
      if (dominated) record(nodes, prev);
      const next = applyEdgeChanges(changes, prev);
      if (dominated && onStateChange) onStateChange({ nodes, edges: next });
      return next;
    });
  }, [nodes, record, onStateChange]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((prev) => {
      record(nodes, prev);
      const next = [...prev, { id: `e-${Date.now()}`, source: connection.source, sourcePort: connection.sourcePort, target: connection.target, targetPort: connection.targetPort }];
      if (onStateChange) onStateChange({ nodes, edges: next });
      return next;
    });
  }, [nodes, record, onStateChange]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push({ nodes, edges });
    skipRecord.current = true;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    if (onStateChange) onStateChange(prev);
  }, [nodes, edges, onStateChange]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push({ nodes, edges });
    skipRecord.current = true;
    setNodes(next.nodes);
    setEdges(next.edges);
    if (onStateChange) onStateChange(next);
  }, [nodes, edges, onStateChange]);

  return {
    nodes, edges, setNodes, setEdges,
    onNodesChange, onEdgesChange, onConnect,
    undo, redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
