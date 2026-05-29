import { useCallback, useRef, useEffect } from 'react';
import type { Node, Edge, NodeChange, EdgeChange } from '../types';

interface UseCopyPasteOptions {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
}

const PASTE_OFFSET = 50;

export function useCopyPaste({ nodes, edges, onNodesChange, onEdgesChange }: UseCopyPasteOptions) {
  const clipboard = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);

  const copy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = edges.filter(
      (e) => e.selected || (selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target))
    );
    clipboard.current = { nodes: selectedNodes, edges: selectedEdges };
  }, [nodes, edges]);

  const cut = useCallback(() => {
    copy();
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);
    if (selectedNodes.length) onNodesChange(selectedNodes.map((n) => ({ type: 'remove', id: n.id })));
    if (selectedEdges.length) onEdgesChange(selectedEdges.map((e) => ({ type: 'remove', id: e.id })));
  }, [copy, nodes, edges, onNodesChange, onEdgesChange]);

  const paste = useCallback(() => {
    if (!clipboard.current || clipboard.current.nodes.length === 0) return;

    const idMap = new Map<string, string>();
    const now = Date.now();

    // Deselect current
    onNodesChange(nodes.filter((n) => n.selected).map((n) => ({ type: 'select', id: n.id, selected: false })));

    // Clone nodes with new IDs and offset
    const newNodes: Node[] = clipboard.current.nodes.map((n, i) => {
      const newId = `${n.id}-copy-${now}-${i}`;
      idMap.set(n.id, newId);
      return { ...n, id: newId, position: { x: n.position.x + PASTE_OFFSET, y: n.position.y + PASTE_OFFSET }, selected: true };
    });

    // Clone edges with remapped IDs
    const newEdges: Edge[] = clipboard.current.edges
      .filter((e) => idMap.has(e.source) && idMap.has(e.target))
      .map((e, i) => ({
        ...e,
        id: `${e.id}-copy-${now}-${i}`,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        selected: false,
      }));

    onNodesChange(newNodes.map((n) => ({ type: 'add', node: n })));
    if (newEdges.length) onEdgesChange(newEdges.map((e) => ({ type: 'add', edge: e })));
  }, [nodes, onNodesChange, onEdgesChange]);

  // Keyboard bindings
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'c': copy(); break;
        case 'x': cut(); break;
        case 'v': e.preventDefault(); paste(); break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [copy, cut, paste]);

  return { copy, cut, paste };
}
