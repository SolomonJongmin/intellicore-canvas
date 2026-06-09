// License
export { initCanvas } from './license';

// Components
export { Canvas, MiniMapInner } from './Canvas';
export { ErdCanvas } from './components/ErdCanvas';
export { EntityNode } from './components/nodes/EntityNode';
export { Handle, checkConnectable } from './components/Handle';
export { NodeResizer, NodeResizeControl } from './components/nodes/NodeResizer';
export { NodeToolbar } from './components/nodes/NodeToolbar';
export { RotateHandle } from './components/nodes/RotateHandle';
export { ShapeNode, shapePaths, SHAPE_SIZE } from './components/nodes/ShapeNode';
export { DefaultNode } from './components/nodes/DefaultNode';
export { BaseEdge } from './components/edges/BaseEdge';
export { BezierEdge } from './components/edges/BezierEdge';
export { StraightEdge } from './components/edges/StraightEdge';
export { StepEdge, SmoothStepEdge } from './components/edges/StepEdge';
export { AnimatedEdge } from './components/edges/AnimatedEdge';
export { OrthogonalEdge } from './components/edges/OrthogonalEdge';
export { EdgeLabelRenderer } from './components/edges/EdgeLabelRenderer';
export { DefaultConnectionLine } from './components/ConnectionLine';

// Hooks
export { useCanvas } from './hooks/useCanvas';
export { useCanvasHistory } from './hooks/useCanvasHistory';
export { useViewport } from './hooks/useViewport';
export { useInteractions } from './hooks/useInteractions';
export { useEasyConnect } from './hooks/useEasyConnect';
export { useCopyPaste } from './hooks/useCopyPaste';
export { useAutoLayout } from './hooks/useAutoLayout';

// Utilities
export { getBezierPath, getStraightPath, getStepPath, getPortPosition, getSmartBezierPath } from './utils/path';
export { applyNodeChanges, applyEdgeChanges } from './utils/changes';
export { getConnectedEdges, getIncomers, getOutgoers, isIntersecting, getIntersectingNodes, getClosestNode, pointToSegmentDistance, getEdgeAtPoint } from './utils/graph';
export { getOrthogonalPath, nodesToObstacles } from './utils/routing';
export { classifyAgentEdges, getToolBindings, TOOL_BINDING_STYLE } from './utils/agent';

// Types
export type {
  Node,
  Edge,
  Port,
  Point,
  Viewport,
  Connection,
  NodeChange,
  EdgeChange,
  NodeProps,
  NodeTypeMap,
  EdgeProps,
  EdgeTypeMap,
  EdgeType,
  ConnectionLineProps,
  ConnectableParams,
  ShapeType,
  ShapeNodeData,
  CanvasProps,
} from './types';

export type { ErdEntity, ErdRelation, ErdCanvasProps, EntityColumn as ErdEntityColumn } from './components/ErdCanvas';
export type { EntityColumn, EntityNodeData } from './components/nodes/EntityNode';
