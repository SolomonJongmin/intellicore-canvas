import type { Node, Edge, Point } from '../types';

export function getConnectedEdges(node: Node, edges: Edge[]): Edge[] {
  return edges.filter((e) => e.source === node.id || e.target === node.id);
}

export function getIncomers(node: Node, nodes: Node[], edges: Edge[]): Node[] {
  const incomingEdges = edges.filter((e) => e.target === node.id);
  return nodes.filter((n) => incomingEdges.some((e) => e.source === n.id));
}

export function getOutgoers(node: Node, nodes: Node[], edges: Edge[]): Node[] {
  const outgoingEdges = edges.filter((e) => e.source === node.id);
  return nodes.filter((n) => outgoingEdges.some((e) => e.target === n.id));
}

export function isIntersecting(nodeA: Node, nodeB: Node): boolean {
  const aW = nodeA.width || 140, aH = nodeA.height || 40;
  const bW = nodeB.width || 140, bH = nodeB.height || 40;
  return !(
    nodeA.position.x + aW < nodeB.position.x ||
    nodeB.position.x + bW < nodeA.position.x ||
    nodeA.position.y + aH < nodeB.position.y ||
    nodeB.position.y + bH < nodeA.position.y
  );
}

export function getIntersectingNodes(node: Node, nodes: Node[]): Node[] {
  return nodes.filter((n) => n.id !== node.id && isIntersecting(node, n));
}

export function getClosestNode(position: Point, nodes: Node[], threshold: number): Node | null {
  let closest: Node | null = null;
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

/** Distance from a point to a line segment (ax,ay)-(bx,by) */
export function pointToSegmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

/**
 * Find the closest edge to a point within a distance threshold.
 * Uses source/target node centers as edge endpoints (line approximation).
 */
export function getEdgeAtPoint(
  point: Point,
  edges: Edge[],
  nodes: Node[],
  threshold: number = 20,
  excludeNodeId?: string,
): Edge | null {
  let closest: Edge | null = null;
  let minDist = threshold;
  for (const edge of edges) {
    // Skip edges connected to the excluded node
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
