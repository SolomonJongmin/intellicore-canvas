import { ComponentType, CSSProperties, ReactNode } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Port {
  id: string;
  type: 'input' | 'output';
  position: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  label?: string;
  maxConnections?: number;
}

export interface Node<T = Record<string, unknown>> {
  id: string;
  type: string;
  position: Point;
  data: T;
  width?: number;
  height?: number;
  selected?: boolean;
  draggable?: boolean;
  ports?: Port[];
}

export interface Edge {
  id: string;
  source: string;
  sourcePort?: string;
  target: string;
  targetPort?: string;
  type?: 'bezier' | 'straight' | 'step';
  label?: string;
  animated?: boolean;
  style?: CSSProperties;
  data?: Record<string, unknown>;
}

export interface Connection {
  source: string;
  sourcePort?: string;
  target: string;
  targetPort?: string;
}

export type NodeChange =
  | { type: 'position'; id: string; position: Point }
  | { type: 'select'; id: string; selected: boolean }
  | { type: 'remove'; id: string }
  | { type: 'add'; node: Node }
  | { type: 'data'; id: string; data: Record<string, unknown> };

export type EdgeChange =
  | { type: 'select'; id: string; selected: boolean }
  | { type: 'remove'; id: string }
  | { type: 'add'; edge: Edge };

export interface NodeProps<T = Record<string, unknown>> {
  id: string;
  data: T;
  selected: boolean;
  ports: Port[];
}

export type NodeTypeMap = Record<string, ComponentType<NodeProps<any>>>;

export interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick?: (event: React.MouseEvent) => void;
  onDrop?: (event: React.DragEvent, position: Point) => void;
  onDragOver?: (event: React.DragEvent) => void;
  nodeTypes?: NodeTypeMap;
  defaultEdgeType?: 'bezier' | 'straight' | 'step';
  snapToGrid?: boolean;
  gridSize?: number;
  minZoom?: number;
  maxZoom?: number;
  fitView?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
