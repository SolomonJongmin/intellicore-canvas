import { CSSProperties, ReactNode } from 'react';

export interface NodeToolbarProps {
  isVisible?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  align?: 'start' | 'center' | 'end';
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
}

export function NodeToolbar({
  isVisible = true,
  position = 'top',
  offset = 10,
  align = 'center',
  style,
  className,
  children,
}: NodeToolbarProps) {
  if (!isVisible) return null;

  const posStyle = getPositionStyle(position, offset, align);

  return (
    <div
      className={`ic-node-toolbar ${className || ''}`}
      style={{
        position: 'absolute',
        display: 'flex',
        gap: 4,
        padding: '4px 6px',
        background: '#fff',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        border: '1px solid #e5e7eb',
        zIndex: 10,
        pointerEvents: 'auto',
        ...posStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function getPositionStyle(position: string, offset: number, align: string): CSSProperties {
  const alignStyle: CSSProperties =
    align === 'center' ? { left: '50%', transform: 'translateX(-50%)' } :
    align === 'start' ? { left: 0 } : { right: 0 };

  switch (position) {
    case 'top':
      return { bottom: `calc(100% + ${offset}px)`, ...alignStyle };
    case 'bottom':
      return { top: `calc(100% + ${offset}px)`, ...alignStyle };
    case 'left':
      return { right: `calc(100% + ${offset}px)`, top: '50%', transform: 'translateY(-50%)' };
    case 'right':
      return { left: `calc(100% + ${offset}px)`, top: '50%', transform: 'translateY(-50%)' };
    default:
      return { bottom: `calc(100% + ${offset}px)`, ...alignStyle };
  }
}
