import { useCallback, useRef, MouseEvent, CSSProperties } from 'react';

export interface NodeResizerProps {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  isVisible?: boolean;
  lineStyle?: CSSProperties;
  handleStyle?: CSSProperties;
  onResize?: (event: MouseEvent, params: { width: number; height: number }) => void;
  onResizeEnd?: (event: MouseEvent, params: { width: number; height: number }) => void;
}

const handlePositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export function NodeResizer({
  minWidth = 10,
  maxWidth = Infinity,
  minHeight = 10,
  maxHeight = Infinity,
  isVisible = true,
  lineStyle,
  handleStyle,
  onResize,
  onResizeEnd,
}: NodeResizerProps) {
  if (!isVisible) return null;

  return (
    <div className="ic-node-resizer" style={{ position: 'absolute', inset: -4, pointerEvents: 'none' }}>
      {/* Border lines */}
      <div style={{ position: 'absolute', inset: 0, border: '1px solid #2563eb', borderRadius: 4, ...lineStyle }} />
      {/* Corner handles */}
      {handlePositions.map((pos) => (
        <ResizeHandle
          key={pos}
          position={pos}
          minWidth={minWidth}
          maxWidth={maxWidth}
          minHeight={minHeight}
          maxHeight={maxHeight}
          style={handleStyle}
          onResize={onResize}
          onResizeEnd={onResizeEnd}
        />
      ))}
    </div>
  );
}

function ResizeHandle({
  position,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  style,
  onResize,
  onResizeEnd,
}: {
  position: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  style?: CSSProperties;
  onResize?: NodeResizerProps['onResize'];
  onResizeEnd?: NodeResizerProps['onResizeEnd'];
}) {
  const startRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const posStyle: CSSProperties = {
    position: 'absolute',
    width: 8,
    height: 8,
    background: '#fff',
    border: '1.5px solid #2563eb',
    borderRadius: 2,
    pointerEvents: 'auto',
    ...(position.includes('top') ? { top: -4 } : { bottom: -4 }),
    ...(position.includes('left') ? { left: -4 } : { right: -4 }),
    cursor: position === 'top-left' || position === 'bottom-right' ? 'nwse-resize' : 'nesw-resize',
    ...style,
  };

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const parent = (e.target as HTMLElement).closest('.ic-node') as HTMLElement;
    if (!parent) return;
    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    startRef.current = { x: e.clientX, y: e.clientY, w, h };

    const handleMove = (ev: globalThis.MouseEvent) => {
      if (!startRef.current) return;
      const dx = (position.includes('right') ? 1 : -1) * (ev.clientX - startRef.current.x);
      const dy = (position.includes('bottom') ? 1 : -1) * (ev.clientY - startRef.current.y);
      const newW = Math.min(maxWidth, Math.max(minWidth, startRef.current.w + dx));
      const newH = Math.min(maxHeight, Math.max(minHeight, startRef.current.h + dy));
      onResize?.(ev as any, { width: newW, height: newH });
    };

    const handleUp = (ev: globalThis.MouseEvent) => {
      if (startRef.current) {
        const dx = (position.includes('right') ? 1 : -1) * (ev.clientX - startRef.current.x);
        const dy = (position.includes('bottom') ? 1 : -1) * (ev.clientY - startRef.current.y);
        const newW = Math.min(maxWidth, Math.max(minWidth, startRef.current.w + dx));
        const newH = Math.min(maxHeight, Math.max(minHeight, startRef.current.h + dy));
        onResizeEnd?.(ev as any, { width: newW, height: newH });
      }
      startRef.current = null;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [position, minWidth, maxWidth, minHeight, maxHeight, onResize, onResizeEnd]);

  return <div style={posStyle} onMouseDown={handleMouseDown} />;
}

// Custom resize control for advanced UI
export interface NodeResizeControlProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  style?: CSSProperties;
  children?: React.ReactNode;
  onResize?: (event: MouseEvent, params: { width: number; height: number }) => void;
}

export function NodeResizeControl({
  position = 'bottom-right',
  minWidth = 10,
  maxWidth = Infinity,
  minHeight = 10,
  maxHeight = Infinity,
  style,
  children,
  onResize,
}: NodeResizeControlProps) {
  const startRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const parent = (e.target as HTMLElement).closest('.ic-node') as HTMLElement;
    if (!parent) return;
    startRef.current = { x: e.clientX, y: e.clientY, w: parent.offsetWidth, h: parent.offsetHeight };

    const handleMove = (ev: globalThis.MouseEvent) => {
      if (!startRef.current) return;
      const dx = (position.includes('right') ? 1 : -1) * (ev.clientX - startRef.current.x);
      const dy = (position.includes('bottom') ? 1 : -1) * (ev.clientY - startRef.current.y);
      const newW = Math.min(maxWidth, Math.max(minWidth, startRef.current.w + dx));
      const newH = Math.min(maxHeight, Math.max(minHeight, startRef.current.h + dy));
      onResize?.(ev as any, { width: newW, height: newH });
    };

    const handleUp = () => {
      startRef.current = null;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [position, minWidth, maxWidth, minHeight, maxHeight, onResize]);

  const posStyle: CSSProperties = {
    position: 'absolute',
    cursor: position === 'top-left' || position === 'bottom-right' ? 'nwse-resize' : 'nesw-resize',
    ...(position.includes('top') ? { top: 0 } : { bottom: 0 }),
    ...(position.includes('left') ? { left: 0 } : { right: 0 }),
    ...style,
  };

  return (
    <div className="ic-resize-control" style={posStyle} onMouseDown={handleMouseDown}>
      {children || <DefaultResizeIcon />}
    </div>
  );
}

function DefaultResizeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'block' }}>
      <path d="M11 1L1 11M11 5L5 11M11 9L9 11" stroke="#6b7280" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
