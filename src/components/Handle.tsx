import { MouseEvent, CSSProperties } from 'react';
import type { Port, ConnectableParams, Node, Edge } from '../types';

export interface HandleProps {
  type: 'source' | 'target';
  position: 'top' | 'bottom' | 'left' | 'right';
  id?: string;
  isConnectable?: boolean | number | ((params: ConnectableParams) => boolean);
  style?: CSSProperties;
  className?: string;
  onMouseDown?: (e: MouseEvent) => void;
}

const positionStyles: Record<string, CSSProperties> = {
  top: { top: -5, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: -5, left: '50%', transform: 'translateX(-50%)' },
  left: { left: -5, top: '50%', transform: 'translateY(-50%)' },
  right: { right: -5, top: '50%', transform: 'translateY(-50%)' },
};

export function Handle({ type, position, id, isConnectable = true, style, className, onMouseDown }: HandleProps) {
  const connectable = typeof isConnectable === 'boolean' ? isConnectable : true;

  return (
    <div
      data-handleid={id}
      data-handletype={type}
      data-handlepos={position}
      className={`ic-handle ic-handle-${position} ${className || ''}`}
      style={{
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#fff',
        border: '2px solid #b0bec5',
        cursor: connectable ? 'crosshair' : 'default',
        pointerEvents: connectable ? 'auto' : 'none',
        ...positionStyles[position],
        ...style,
      }}
      onMouseDown={connectable ? onMouseDown : undefined}
    />
  );
}

export function checkConnectable(
  isConnectable: boolean | number | ((params: ConnectableParams) => boolean) | undefined,
  node: Node,
  port: Port,
  connectedEdges: Edge[],
): boolean {
  if (isConnectable === undefined || isConnectable === true) return true;
  if (isConnectable === false) return false;
  if (typeof isConnectable === 'number') {
    const count = connectedEdges.filter(
      (e) => e.source === node.id || e.target === node.id
    ).length;
    return count < isConnectable;
  }
  return isConnectable({ node, port, connectedEdges });
}
