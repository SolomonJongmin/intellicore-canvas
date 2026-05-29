import { MouseEvent } from 'react';
import type { NodeProps } from '../../types';

interface DefaultNodeInternalProps extends NodeProps {
  onPortMouseDown?: (e: MouseEvent, nodeId: string, portId?: string) => void;
}

export function DefaultNode({ id, data, selected, onPortMouseDown }: DefaultNodeInternalProps) {
  return (
    <div style={{
      padding: '8px 16px',
      borderRadius: 6,
      border: `2px solid ${selected ? '#2563eb' : '#e0e0e0'}`,
      background: '#fff',
      fontSize: 12,
      boxShadow: selected ? '0 4px 12px rgba(37,99,235,0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
      whiteSpace: 'nowrap',
      position: 'relative',
    }}>
      {(data.label as string) || id}
      {/* Bottom port handle */}
      <div
        onMouseDown={(e) => onPortMouseDown?.(e as any, id)}
        style={{
          position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: '#fff', border: '2px solid #b0bec5', cursor: 'crosshair',
        }}
      />
      {/* Top port handle */}
      <div
        style={{
          position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: '#fff', border: '2px solid #b0bec5',
        }}
      />
    </div>
  );
}
