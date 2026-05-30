import type { ConnectionLineProps } from '../types';

export function DefaultConnectionLine({ fromX, fromY, toX, toY }: ConnectionLineProps) {
  const path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
  return <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="6 3" pointerEvents="none" />;
}
