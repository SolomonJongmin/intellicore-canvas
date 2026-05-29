import type { NodeProps, ShapeNodeData, ShapeType } from '../../types';
import { Handle } from '../Handle';

const SHAPE_SIZE = 80;

const shapePaths: Record<ShapeType, (w: number, h: number) => string> = {
  rectangle: (w, h) => `M0,0 L${w},0 L${w},${h} L0,${h} Z`,
  circle: (w, h) => {
    const rx = w / 2, ry = h / 2;
    return `M${rx},0 A${rx},${ry} 0 1,1 ${rx},${h} A${rx},${ry} 0 1,1 ${rx},0`;
  },
  diamond: (w, h) => `M${w / 2},0 L${w},${h / 2} L${w / 2},${h} L0,${h / 2} Z`,
  hexagon: (w, h) => {
    const q = w / 4;
    return `M${q},0 L${w - q},0 L${w},${h / 2} L${w - q},${h} L${q},${h} L0,${h / 2} Z`;
  },
  triangle: (w, h) => `M${w / 2},0 L${w},${h} L0,${h} Z`,
  parallelogram: (w, h) => {
    const s = w * 0.2;
    return `M${s},0 L${w},0 L${w - s},${h} L0,${h} Z`;
  },
};

export function ShapeNode({ id, data, selected }: NodeProps<ShapeNodeData>) {
  const { type = 'rectangle', color = '#6b7280', label } = data;
  const w = SHAPE_SIZE, h = SHAPE_SIZE;
  const pathFn = shapePaths[type] || shapePaths.rectangle;

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <svg width={w} height={h} style={{ display: 'block' }}>
        <path
          d={pathFn(w, h)}
          fill={color}
          stroke={selected ? '#2563eb' : color}
          strokeWidth={selected ? 2.5 : 1.5}
          opacity={0.85}
        />
      </svg>
      {label && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#fff', fontWeight: 500, pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}>
          {label}
        </div>
      )}
      <Handle type="target" position="top" />
      <Handle type="source" position="bottom" />
      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </div>
  );
}

// Export shape paths for minimap usage
export { shapePaths, SHAPE_SIZE };
