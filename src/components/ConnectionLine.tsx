import type { ConnectionLineProps } from '../types';

export function DefaultConnectionLine({ fromX, fromY, toX, toY }: ConnectionLineProps) {
  const midY = (fromY + toY) / 2;
  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
  return <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="6 3" pointerEvents="none" />;
}
