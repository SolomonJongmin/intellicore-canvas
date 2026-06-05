import { ErdCanvas } from '@intellicore/visual-canvas';
import type { ErdEntity, ErdRelation } from '@intellicore/visual-canvas';
import { useState } from 'react';

const initialEntities: ErdEntity[] = [
  { id: 'entity2', name: 'Entity2', x: 50, y: 30, columns: [{ name: 'Id', pk: true }, { name: 'Entity1Id', fk: true }] },
  { id: 'order', name: 'Order', x: 380, y: 20, columns: [{ name: 'Id', pk: true }, { name: 'Attribute1' }, { name: 'Qty' }, { name: 'Entity1Id2', fk: true }, { name: 'Entity1Id3', fk: true }] },
  { id: 'entity1', name: 'Entity1', x: 280, y: 250, columns: [{ name: 'Id', pk: true }, { name: 'Attribute1' }, { name: 'Entity3Id', fk: true }, { name: 'Entity4Id', fk: true }] },
  { id: 'entity3', name: 'Entity3', x: 30, y: 260, columns: [{ name: 'Id', pk: true }, { name: 'Attribute1' }, { name: 'Attribute2' }, { name: 'Attribute3' }] },
  { id: 'entity4', name: 'Entity4', x: 530, y: 280, columns: [{ name: 'Id', pk: true }] },
];

const initialRelations: ErdRelation[] = [
  { sourceEntityId: 'entity2', sourceColumnIndex: 1, targetEntityId: 'entity1' },
  { sourceEntityId: 'order', sourceColumnIndex: 3, targetEntityId: 'entity1' },
  { sourceEntityId: 'order', sourceColumnIndex: 4, targetEntityId: 'entity1' },
  { sourceEntityId: 'entity1', sourceColumnIndex: 2, targetEntityId: 'entity3' },
  { sourceEntityId: 'entity1', sourceColumnIndex: 3, targetEntityId: 'entity4' },
];

export default function ErdEditor() {
  const [entities, setEntities] = useState(initialEntities);
  const [selected, setSelected] = useState<string | null>(null);

  const handleEntityMove = (id: string, x: number, y: number) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, x, y } : e));
  };

  const handleDrop = (_e: React.DragEvent, position: { x: number; y: number }) => {
    const id = `entity-${Date.now()}`;
    setEntities(prev => [...prev, { id, name: 'NewEntity', x: position.x, y: position.y, columns: [{ name: 'Id', pk: true }] }]);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 180, background: '#fff', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, borderRight: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Drag to add</p>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('widget', 'entity')}
          style={{ padding: '8px 10px', background: '#fff', borderRadius: 4, cursor: 'grab', fontSize: 12, color: '#374151', border: '1px solid #e5e7eb' }}>
          ⊞ Entity
        </div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData('widget', 'static')}
          style={{ padding: '8px 10px', background: '#fff', borderRadius: 4, cursor: 'grab', fontSize: 12, color: '#374151', border: '1px solid #e5e7eb' }}>
          ⊞ Static Entity
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <ErdCanvas
          entities={entities}
          relations={initialRelations}
          selectedEntityId={selected}
          onEntitySelect={setSelected}
          onEntityMove={handleEntityMove}
          onDrop={handleDrop}
        />
      </div>
    </div>
  );
}
