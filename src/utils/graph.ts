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
