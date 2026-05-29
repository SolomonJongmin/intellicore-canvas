import { ComponentType, CSSProperties, ReactNode, MouseEvent } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface ConnectableParams {
  node: Node;
  port: Port;
  connectedEdges: Edge[];
}

export interface Port {
  id: string;
  type: 'input' | 'output';
  position: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  label?: string;
  maxConnections?: number;
  isConnectable?: boolean | number | ((params: ConnectableParams) => boolean);
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
  dragHandle?: string;
  rotation?: number;
  resizable?: boolean;
  ports?: Port[];
}

export type EdgeType = 'bezier' | 'straight' | 'step' | 'smoothstep' | string;

export interface Edge {
  id: string;
  source: string;
  sourcePort?: string;
  target: string;
  targetPort?: string;
  type?: EdgeType;
  label?: string;
  animated?: boolean;
  selected?: boolean;
  reconnectable?: boolean;
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
  | { type: 'data'; id: string; data: Record<string, unknown> }
  | { type: 'dimensions'; id: string; width: number; height: number }
  | { type: 'rotation'; id: string; rotation: number };

export type EdgeChange =
  | { type: 'select'; id: string; selected: boolean }
  | { type: 'remove'; id: string }
  | { type: 'add'; edge: Edge };

export interface NodeProps<T = Record<string, unknown>> {
  id: string;
  data: T;
  selected: boolean;
  ports: Port[];
  width?: number;
  height?: number;
  rotation?: number;
  dragHandle?: string;
  isConnectable?: boolean | number | ((params: ConnectableParams) => boolean);
}

export type NodeTypeMap = Record<string, ComponentType<NodeProps<any>>>;

export interface EdgeProps {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: 'top' | 'bottom' | 'left' | 'right';
  targetPosition: 'top' | 'bottom' | 'left' | 'right';
  selected: boolean;
  animated?: boolean;
  label?: string;
  style?: CSSProperties;
  data?: Record<string, unknown>;
}

export type EdgeTypeMap = Record<string, ComponentType<EdgeProps>>;

export interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition: 'top' | 'bottom' | 'left' | 'right';
}

export type ShapeType = 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'triangle' | 'parallelogram';

export interface ShapeNodeData {
  type: ShapeType;
  color: string;
  label?: string;
}

export interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onConnectStart?: (event: MouseEvent, params: { nodeId: string; portId?: string }) => void;
  onConnectEnd?: (event: MouseEvent) => void;
  onNodeClick?: (event: MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: MouseEvent, node: Node) => void;
  onEdgeClick?: (event: MouseEvent, edge: Edge) => void;
  onPaneClick?: (event: MouseEvent) => void;
  onDrop?: (event: React.DragEvent, position: Point) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onNodesDelete?: (nodes: Node[]) => void;
  onEdgesDelete?: (edges: Edge[]) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  onReconnect?: (oldEdge: Edge, newConnection: Connection) => void;
  onReconnectStart?: (event: MouseEvent, edge: Edge) => void;
  onReconnectEnd?: (event: MouseEvent, edge: Edge) => void;
  nodeTypes?: NodeTypeMap;
  edgeTypes?: EdgeTypeMap;
  connectionLineComponent?: ComponentType<ConnectionLineProps>;
  defaultEdgeType?: EdgeType;
  snapToGrid?: boolean;
  gridSize?: number;
  dropOnEdge?: boolean | number;
  minZoom?: number;
  maxZoom?: number;
  fitView?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
