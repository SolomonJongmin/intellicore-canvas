import { useCallback, useRef } from 'react';
import type { Node, Edge, Connection, Point } from '../types';
import { getConnectedEdges, getIncomers, getOutgoers, getClosestNode, getEdgeAtPoint } from '../utils/graph';

interface UseInteractionsOptions {
  nodes: Node[];
  edges: Edge[];
  setNodes: (fn: (nodes: Node[]) => Node[]) => void;
  setEdges: (fn: (edges: Edge[]) => Edge[]) => void;
}

/**
 * Hook providing advanced interaction handlers:
 * - Add Node On Edge Drop
 * - Delete Middle Node (reconnect)
 * - Proximity Connect
 */
export function useInteractions({ nodes, edges, setNodes, setEdges }: UseInteractionsOptions) {
  const connectStartRef = useRef<{ nodeId: string; portId?: string } | null>(null);

  // --- Add Node On Edge Drop ---
  const onConnectStart = useCallback((_event: any, params: { nodeId: string; portId?: string }) => {
    connectStartRef.current = params;
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent | React.MouseEvent) => {
    if (!connectStartRef.current) return null;
    const startParams = connectStartRef.current;
    connectStartRef.current = null;
    // Return start params so user can create a node at drop position
    return startParams;
  }, []);

  // --- Delete Middle Node (reconnect edges) ---
  const onNodesDelete = useCallback((deletedNodes: Node[]) => {
    for (const deleted of deletedNodes) {
      const incomers = getIncomers(deleted, nodes, edges);
      const outgoers = getOutgoers(deleted, nodes, edges);

      // Create new edges from each incomer to each outgoer
      const newEdges: Edge[] = [];
      for (const incomer of incomers) {
        const incomingEdge = edges.find((e) => e.source === incomer.id && e.target === deleted.id);
        for (const outgoer of outgoers) {
          newEdges.push({
            id: `e-${incomer.id}-${outgoer.id}-${Date.now()}`,
            source: incomer.id,
            target: outgoer.id,
            ...(incomingEdge?.sourcePort && { sourcePort: incomingEdge.sourcePort }),
            ...(incomingEdge?.label && { label: incomingEdge.label }),
            ...(incomingEdge?.style && { style: incomingEdge.style }),
            ...(incomingEdge?.data && { data: incomingEdge.data }),
          });
        }
      }

      if (newEdges.length > 0) {
        setEdges((prev) => {
          // Remove edges connected to deleted node, add new reconnection edges
          const filtered = prev.filter((e) => e.source !== deleted.id && e.target !== deleted.id);
          return [...filtered, ...newEdges];
        });
      }
    }
  }, [nodes, edges, setEdges]);

  // --- Proximity Connect ---
  const getProximityConnection = useCallback((nodeId: string, position: Point, threshold = 100): Node | null => {
    const otherNodes = nodes.filter((n) => n.id !== nodeId);
    return getClosestNode(position, otherNodes, threshold);
  }, [nodes]);

  const connectToProximity = useCallback((sourceId: string, targetId: string) => {
    // Check if edge already exists
    const exists = edges.some(
      (e) => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId)
    );
    if (exists) return;

    setEdges((prev) => [...prev, {
      id: `e-${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId,
    }]);
  }, [edges, setEdges]);

  // --- Insert Node On Edge (drop node onto edge) ---
  const insertNodeOnEdge = useCallback((nodeId: string, position: Point, threshold = 20): boolean => {
    const edge = getEdgeAtPoint(position, edges, nodes, threshold, nodeId);
    if (!edge) return false;

    setEdges((prev) => {
      const filtered = prev.filter((e) => e.id !== edge.id);
      return [
        ...filtered,
        { id: `e-${edge.source}-${nodeId}-${Date.now()}`, source: edge.source, target: nodeId },
        { id: `e-${nodeId}-${edge.target}-${Date.now() + 1}`, source: nodeId, target: edge.target },
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
    connectStartRef,
  };
}
