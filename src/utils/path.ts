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
  portPosition: 'top' | 'bottom' | 'left' | 'right',
  offset = 0.5,
): Point {
  switch (portPosition) {
    case 'top': return { x: nodePos.x + nodeWidth * offset, y: nodePos.y };
    case 'bottom': return { x: nodePos.x + nodeWidth * offset, y: nodePos.y + nodeHeight };
    case 'left': return { x: nodePos.x, y: nodePos.y + nodeHeight * offset };
    case 'right': return { x: nodePos.x + nodeWidth, y: nodePos.y + nodeHeight * offset };
  }
}
