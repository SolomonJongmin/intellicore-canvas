import type { EdgeProps } from '../../types';
import { BaseEdge } from './BaseEdge';
import { getStraightPath } from '../../utils/path';

export function StraightEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }: EdgeProps) {
  const path = getStraightPath({ x: sourceX, y: sourceY }, { x: targetX, y: targetY });
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return <BaseEdge path={path} selected={selected} animated={animated} label={label} labelX={labelX} labelY={labelY} style={style} />;
}
