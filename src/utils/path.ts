import type { Point } from '../types';

export function getBezierPath(source: Point, target: Point): string {
  const midY = (source.y + target.y) / 2;
  return `M ${source.x} ${source.y} C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${target.y}`;
}

export function getStraightPath(source: Point, target: Point): string {
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

export function getStepPath(source: Point, target: Point): string {
  const midX = (source.x + target.x) / 2;
  return `M ${source.x} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${target.x} ${target.y}`;
}

export function getPortPosition(
  nodePos: Point,
  nodeWidth: number,
  nodeHeight: number,
  portPosition: 'top' | 'bottom' | 'left' | 'right' | 'center',
  offset = 0.5,
): Point {
  switch (portPosition) {
    case 'top': return { x: nodePos.x + nodeWidth * offset, y: nodePos.y };
    case 'bottom': return { x: nodePos.x + nodeWidth * offset, y: nodePos.y + nodeHeight };
    case 'left': return { x: nodePos.x, y: nodePos.y + nodeHeight * offset };
    case 'right': return { x: nodePos.x + nodeWidth, y: nodePos.y + nodeHeight * offset };
    case 'center': return { x: nodePos.x + nodeWidth * 0.5, y: nodePos.y + nodeHeight * 0.5 };
  }
}

export function getSmartBezierPath(
  source: Point,
  target: Point,
  sourceDir: 'top' | 'bottom' | 'left' | 'right',
  targetDir: 'top' | 'bottom' | 'left' | 'right',
): string {
  const dist = Math.sqrt((target.x - source.x) ** 2 + (target.y - source.y) ** 2);
  const offset = Math.max(30, dist * 0.4);

  // 같은 방향(둘 다 top/bottom)이면 타원형으로 — 중간점에서 위/아래로
  if (sourceDir === targetDir && (sourceDir === 'top' || sourceDir === 'bottom')) {
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    const curveOffset = Math.max(40, dist * 0.3);
    const cy = sourceDir === 'top' ? midY - curveOffset : midY + curveOffset;
    return `M ${source.x} ${source.y} Q ${midX} ${cy}, ${target.x} ${target.y}`;
  }

  const sc = getControlPoint(source, sourceDir, offset);
  const tc = getControlPoint(target, targetDir, offset);

  return `M ${source.x} ${source.y} C ${sc.x} ${sc.y}, ${tc.x} ${tc.y}, ${target.x} ${target.y}`;
}

function getControlPoint(point: Point, dir: 'top' | 'bottom' | 'left' | 'right', offset: number): Point {
  switch (dir) {
    case 'top': return { x: point.x, y: point.y - offset };
    case 'bottom': return { x: point.x, y: point.y + offset };
    case 'left': return { x: point.x - offset, y: point.y };
    case 'right': return { x: point.x + offset, y: point.y };
  }
}

/**
 * Draw an elliptical arc between two points.
 * sweep: 0 = arc curves upward, 1 = arc curves downward
 * ry: vertical radius of the ellipse (controls how "tall" the arc is)
 */
export function getEllipticalArcPath(
  source: Point,
  target: Point,
  sweep: 0 | 1 = 0,
  ry = 20,
): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const rx = Math.sqrt(dx * dx + dy * dy) / 2;
  return `M ${source.x} ${source.y} A ${rx} ${ry} 0 0 ${sweep} ${target.x} ${target.y}`;
}
