import { MouseEvent } from 'react';
import { NodeProps } from '../../types';

export interface EntityColumn {
  name: string;
  pk?: boolean;
  fk?: boolean;
}

export interface EntityNodeData {
  name: string;
  columns: EntityColumn[];
  onContextMenu?: (event: MouseEvent) => void;
}

function EntityIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      {[0, 4, 8].map((y) => [0, 4, 8].map((x) => (
        <rect key={`${x}-${y}`} x={x + 1} y={y + 1} width="3" height="3" rx="0.5" fill="#1a73e8" />
      )))}
    </svg>
  );
}

function ColumnIcon({ fk }: { fk?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      {[0, 4, 8].map((y) => [0, 4, 8].map((x) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.5" fill={fk ? '#8b6914' : '#1a73e8'} opacity={0.7} />
      )))}
    </svg>
  );
}

export function EntityNode({ id, data, selected }: NodeProps<EntityNodeData>) {
  const columns = data.columns || [];

  return (
    <div
      onContextMenu={data.onContextMenu}
      style={{
        minWidth: 140,
        border: `2px solid ${selected ? '#1a73e8' : '#d1d5db'}`,
        borderRadius: 4,
        background: '#fff',
        fontSize: 13,
        color: '#1f2937',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '8px 10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #e5e7eb' }}>
        <EntityIcon />
        {data.name || id}
      </div>
      <div style={{ padding: '4px 0' }}>
        {columns.map((col, i) => (
          <div key={i} style={{ padding: '3px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
            <ColumnIcon fk={col.fk} />
            <span style={{ fontWeight: col.pk ? 600 : 400 }}>{col.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
