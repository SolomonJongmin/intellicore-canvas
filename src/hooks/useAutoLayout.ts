import { useCallback } from 'react';
import type { Node, Edge, NodeChange } from '../types';

type Direction = 'TB' | 'BT' | 'LR' | 'RL';

interface UseAutoLayoutOptions {
  direction?: Direction;
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
}

/**
 * Hook for automatically arranging nodes in a tree/hierarchical layout.
 * Uses a layered (Sugiyama-style) approach without external dependencies.
 */
export function useAutoLayout(options: UseAutoLayoutOptions = {}) {
  const {
    direction = 'TB',
    nodeWidth = 140,
    nodeHeight = 40,
    horizontalSpacing = 60,
    verticalSpacing = 80,
  } = options;

  const getLayoutedNodes = useCallback((nodes: Node[], edges: Edge[]): NodeChange[] => {
    if (nodes.length === 0) return [];

    // Build adjacency
    const children = new Map<string, string[]>();
    const parents = new Map<string, string[]>();
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    for (const n of nodes) {
      children.set(n.id, []);
      parents.set(n.id, []);
    }
    for (const e of edges) {
      if (nodeMap.has(e.source) && nodeMap.has(e.target)) {
        children.get(e.source)!.push(e.target);
        parents.get(e.target)!.push(e.source);
      }
    }

    // Find roots (no parents)
    const roots = nodes.filter((n) => parents.get(n.id)!.length === 0);
    if (roots.length === 0) roots.push(nodes[0]); // fallback

    // BFS to assign layers
    const layers = new Map<string, number>();
    const queue: string[] = roots.map((r) => r.id);
    for (const id of queue) layers.set(id, 0);

    let i = 0;
    while (i < queue.length) {
      const id = queue[i++];
      const layer = layers.get(id)!;
      for (const child of children.get(id) || []) {
        if (!layers.has(child)) {
          layers.set(child, layer + 1);
          queue.push(child);
        }
      }
    }

    // Assign unvisited nodes
    for (const n of nodes) {
      if (!layers.has(n.id)) layers.set(n.id, 0);
    }

    // Group by layer
    const layerGroups = new Map<number, string[]>();
    for (const [id, layer] of layers) {
      if (!layerGroups.has(layer)) layerGroups.set(layer, []);
      layerGroups.get(layer)!.push(id);
    }

    // Position nodes
    const isHorizontal = direction === 'LR' || direction === 'RL';
    const isReversed = direction === 'BT' || direction === 'RL';

    const changes: NodeChange[] = [];
    const maxLayer = Math.max(...layerGroups.keys());

    for (const [layer, ids] of layerGroups) {
      const actualLayer = isReversed ? maxLayer - layer : layer;
      const totalWidth = ids.length * (isHorizontal ? nodeHeight : nodeWidth) + (ids.length - 1) * horizontalSpacing;
      const startOffset = -totalWidth / 2;

      ids.forEach((id, idx) => {
        const w = isHorizontal ? nodeHeight : nodeWidth;
        const offset = startOffset + idx * (w + horizontalSpacing) + w / 2;

        const position = isHorizontal
          ? { x: actualLayer * (nodeWidth + verticalSpacing), y: offset }
          : { x: offset, y: actualLayer * (nodeHeight + verticalSpacing) };

        // Center the layout
        position.x += 300;
        position.y += 200;

        changes.push({ type: 'position', id, position });
      });
    }

    return changes;
  }, [direction, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing]);

  return { getLayoutedNodes };
}
