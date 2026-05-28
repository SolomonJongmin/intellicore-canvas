import type { Node, Edge, NodeChange, EdgeChange } from '../types';

export function applyNodeChanges(changes: NodeChange[], nodes: Node[]): Node[] {
  let result = [...nodes];
  for (const change of changes) {
    switch (change.type) {
      case 'position':
        result = result.map((n) => n.id === change.id ? { ...n, position: change.position } : n);
        break;
      case 'select':
        result = result.map((n) => n.id === change.id ? { ...n, selected: change.selected } : n);
        break;
      case 'remove':
        result = result.filter((n) => n.id !== change.id);
        break;
      case 'add':
        result.push(change.node);
        break;
      case 'data':
        result = result.map((n) => n.id === change.id ? { ...n, data: { ...n.data, ...change.data } } : n);
        break;
    }
  }
  return result;
}

export function applyEdgeChanges(changes: EdgeChange[], edges: Edge[]): Edge[] {
  let result = [...edges];
  for (const change of changes) {
    switch (change.type) {
      case 'select':
        result = result.map((e) => e.id === change.id ? { ...e, selected: change.selected } : e);
        break;
      case 'remove':
        result = result.filter((e) => e.id !== change.id);
        break;
      case 'add':
        result.push(change.edge);
        break;
    }
  }
  return result;
}
