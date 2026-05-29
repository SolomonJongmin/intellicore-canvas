import type { EdgeProps } from '../../types';
import { getSmartBezierPath } from '../../utils/path';

export interface AnimatedEdgeProps extends EdgeProps {
  /** Animation duration in seconds */
  duration?: number;
  /** Animated element radius */
  radius?: number;
  /** Animated element color */
  markerColor?: string;
}

export function AnimatedEdge({
  sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  selected, label, style,
  data,
}: EdgeProps) {
  const duration = (data?.duration as number) || 2;
  const radius = (data?.radius as number) || 4;
  const markerColor = (data?.markerColor as string) || '#2563eb';

  const path = getSmartBezierPath(
    { x: sourceX, y: sourceY },
    { x: targetX, y: targetY },
    sourcePosition,
    targetPosition,
  );

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={selected ? '#2563eb' : '#b0bec5'}
        strokeWidth={selected ? 2.5 : 2}
        pointerEvents="stroke"
        style={style}
      />
      <circle r={radius} fill={markerColor}>
        <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={path} />
      </circle>
      {label && (
        <text x={(sourceX + targetX) / 2} y={(sourceY + targetY) / 2 - 6} textAnchor="middle" fontSize={10} fill="#6b7280">
          {label}
        </text>
      )}
    </g>
  );
}
