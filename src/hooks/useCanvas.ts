import { useState, useCallback } from 'react';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '../types';
import { applyNodeChanges, applyEdgeChanges } from '../utils/changes';

interface UseCanvasOptions {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const [nodes, setNodes] = useState<Node[]>(options.initialNodes || []);
  const [edges, setEdges] = useState<Edge[]>(options.initialEdges || []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((prev) => applyEdgeChanges(changes, prev));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge: Edge = {
      id: `e-${Date.now()}`,
      source: connection.source,
      sourcePort: connection.sourcePort,
      target: connection.target,
      targetPort: connection.targetPort,
    };
    setEdges((prev) => [...prev, newEdge]);
  }, []);

  const addNode = useCallback((node: Node) => {
    setNodes((prev) => [...prev, node]);
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
  }, []);

  return { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect, addNode, removeNode };
}
