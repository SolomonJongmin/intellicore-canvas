import { useCallback, useRef, MouseEvent, CSSProperties } from 'react';

export interface RotateHandleProps {
  rotation?: number;
  onRotate?: (rotation: number) => void;
  onRotateEnd?: (rotation: number) => void;
  style?: CSSProperties;
}

export function RotateHandle({ rotation = 0, onRotate, onRotateEnd, style }: RotateHandleProps) {
  const centerRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const node = (e.target as HTMLElement).closest('.ic-node') as HTMLElement;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

    const handleMove = (ev: globalThis.MouseEvent) => {
      if (!centerRef.current) return;
      const angle = Math.atan2(ev.clientY - centerRef.current.y, ev.clientX - centerRef.current.x);
      const deg = ((angle * 180) / Math.PI + 90 + 360) % 360;
      onRotate?.(Math.round(deg));
    };

    const handleUp = (ev: globalThis.MouseEvent) => {
      if (centerRef.current) {
        const angle = Math.atan2(ev.clientY - centerRef.current.y, ev.clientX - centerRef.current.x);
        const deg = ((angle * 180) / Math.PI + 90 + 360) % 360;
        onRotateEnd?.(Math.round(deg));
      }
      centerRef.current = null;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [onRotate, onRotateEnd]);

  return (
    <div
      className="ic-rotate-handle"
      style={{
        position: 'absolute',
        top: -24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: '#fff',
        border: '2px solid #2563eb',
        cursor: 'grab',
        pointerEvents: 'auto',
        ...style,
      }}
      onMouseDown={handleMouseDown}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" style={{ display: 'block', margin: 'auto' }}>
        <path d="M5 1a4 4 0 013.5 2M8.5 3l.5-2M8.5 3l-2 .5" stroke="#2563eb" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}
