import { CSSProperties } from 'react';

export interface BaseEdgeProps {
  id?: string;
  path: string;
  label?: string;
  labelX?: number;
  labelY?: number;
  selected?: boolean;
  animated?: boolean;
  style?: CSSProperties;
  interactionWidth?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export function BaseEdge({
  path,
  label,
  labelX,
  labelY,
  selected = false,
  animated = false,
  style,
  interactionWidth = 12,
  onClick,
}: BaseEdgeProps) {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Invisible wider path for easier clicking */}
      <path d={path} fill="none" stroke="transparent" strokeWidth={interactionWidth} pointerEvents="stroke" />
      {/* Visible edge */}
      <path
        d={path}
        fill="none"
        stroke={selected ? '#2563eb' : '#b0bec5'}
        strokeWidth={selected ? 2.5 : 2}
        strokeDasharray={animated ? '5 5' : undefined}
        pointerEvents="none"
        style={style}
      >
        {animated && <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.5s" repeatCount="indefinite" />}
      </path>
      {/* Label */}
      {label && labelX !== undefined && labelY !== undefined && (
        <text x={labelX} y={labelY - 6} textAnchor="middle" fontSize={10} fill="#6b7280" pointerEvents="none">
          {label}
        </text>
      )}
    </g>
  );
}
