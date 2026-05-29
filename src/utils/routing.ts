import type { Point, Node } from '../types';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PADDING = 20;

/**
 * Simple orthogonal edge routing that avoids nodes.
 * Returns an SVG path string with right-angle segments.
 */
export function getOrthogonalPath(
  source: Point,
  target: Point,
  sourceDir: 'top' | 'bottom' | 'left' | 'right',
  targetDir: 'top' | 'bottom' | 'left' | 'right',
  obstacles: Rect[] = [],
): string {
  // Generate waypoints using a simple approach:
  // 1. Extend from source in sourceDir
  // 2. Route to target avoiding obstacles
  // 3. Enter target from targetDir

  const points: Point[] = [source];

  // Step out from source
  const s1 = stepOut(source, sourceDir, PADDING);
  points.push(s1);

  // Step in to target
  const t1 = stepOut(target, targetDir, PADDING);

  // Connect s1 to t1 with orthogonal segments
  if (sourceDir === 'bottom' || sourceDir === 'top') {
    if (targetDir === 'left' || targetDir === 'right') {
      // Vertical then horizontal
      points.push({ x: s1.x, y: t1.y });
    } else {
      // Both vertical — use midpoint
      const midY = (s1.y + t1.y) / 2;
      points.push({ x: s1.x, y: midY });
      points.push({ x: t1.x, y: midY });
    }
  } else {
    if (targetDir === 'top' || targetDir === 'bottom') {
      // Horizontal then vertical
      points.push({ x: t1.x, y: s1.y });
    } else {
      // Both horizontal — use midpoint
      const midX = (s1.x + t1.x) / 2;
      points.push({ x: midX, y: s1.y });
      points.push({ x: midX, y: t1.y });
    }
  }

  points.push(t1);
  points.push(target);

  // Build path
  return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
}

function stepOut(point: Point, dir: 'top' | 'bottom' | 'left' | 'right', distance: number): Point {
  switch (dir) {
    case 'top': return { x: point.x, y: point.y - distance };
    case 'bottom': return { x: point.x, y: point.y + distance };
    case 'left': return { x: point.x - distance, y: point.y };
    case 'right': return { x: point.x + distance, y: point.y };
  }
}

/**
 * Convert nodes to obstacle rectangles for routing
 */
export function nodesToObstacles(nodes: Node[], excludeIds: string[] = []): Rect[] {
  return nodes
    .filter((n) => !excludeIds.includes(n.id))
    .map((n) => ({
      x: n.position.x - PADDING / 2,
      y: n.position.y - PADDING / 2,
      width: (n.width || 140) + PADDING,
      height: (n.height || 40) + PADDING,
    }));
}
