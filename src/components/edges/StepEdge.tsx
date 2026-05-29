import type { EdgeProps } from '../../types';
import { BaseEdge } from './BaseEdge';
import { getStepPath } from '../../utils/path';

export function StepEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }: EdgeProps) {
  const path = getStepPath({ x: sourceX, y: sourceY }, { x: targetX, y: targetY });
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return <BaseEdge path={path} selected={selected} animated={animated} label={label} labelX={labelX} labelY={labelY} style={style} />;
}

export function SmoothStepEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }: EdgeProps) {
  const path = getSmoothStepPath({ x: sourceX, y: sourceY }, { x: targetX, y: targetY });
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return <BaseEdge path={path} selected={selected} animated={animated} label={label} labelX={labelX} labelY={labelY} style={style} />;
}

function getSmoothStepPath(source: { x: number; y: number }, target: { x: number; y: number }): string {
  const midX = (source.x + target.x) / 2;
  const r = Math.min(8, Math.abs(target.y - source.y) / 2, Math.abs(midX - source.x));

  if (r < 1) return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;

  const dy = target.y > source.y ? 1 : -1;
  const dx1 = midX > source.x ? 1 : -1;
  const dx2 = target.x > midX ? 1 : -1;

  return [
    `M ${source.x} ${source.y}`,
    `L ${midX - r * dx1} ${source.y}`,
    `Q ${midX} ${source.y} ${midX} ${source.y + r * dy}`,
    `L ${midX} ${target.y - r * dy}`,
    `Q ${midX} ${target.y} ${midX + r * dx2} ${target.y}`,
    `L ${target.x} ${target.y}`,
  ].join(' ');
}
