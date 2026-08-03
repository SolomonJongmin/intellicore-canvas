import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { CSSProperties, MouseEvent as MouseEvent$1, ComponentType, ReactNode, DragEvent, WheelEvent } from 'react';

declare function initCanvas(options: {
    licenseKey: string;
}): void;

interface Point {
    x: number;
    y: number;
}
interface Viewport {
    x: number;
    y: number;
    zoom: number;
}
interface ConnectableParams {
    node: Node;
    port: Port;
    connectedEdges: Edge[];
}
interface Port {
    id: string;
    type: 'input' | 'output';
    position: 'top' | 'bottom' | 'left' | 'right';
    offset?: number;
    label?: string;
    maxConnections?: number;
    isConnectable?: boolean | number | ((params: ConnectableParams) => boolean);
}
interface Node<T = Record<string, unknown>> {
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
    zIndex?: number;
    ports?: Port[];
}
type EdgeType = 'bezier' | 'straight' | 'step' | 'smoothstep' | string;
interface Edge {
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
interface Connection {
    source: string;
    sourcePort?: string;
    target: string;
    targetPort?: string;
}
type NodeChange = {
    type: 'position';
    id: string;
    position: Point;
} | {
    type: 'select';
    id: string;
    selected: boolean;
} | {
    type: 'remove';
    id: string;
} | {
    type: 'add';
    node: Node;
} | {
    type: 'data';
    id: string;
    data: Record<string, unknown>;
} | {
    type: 'dimensions';
    id: string;
    width: number;
    height: number;
} | {
    type: 'rotation';
    id: string;
    rotation: number;
};
type EdgeChange = {
    type: 'select';
    id: string;
    selected: boolean;
} | {
    type: 'remove';
    id: string;
} | {
    type: 'add';
    edge: Edge;
};
interface NodeProps<T = Record<string, unknown>> {
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
type NodeTypeMap = Record<string, ComponentType<NodeProps<any>>>;
interface EdgeProps {
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
type EdgeTypeMap = Record<string, ComponentType<EdgeProps>>;
interface ConnectionLineProps {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    fromPosition: 'top' | 'bottom' | 'left' | 'right';
}
type ShapeType = 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'triangle' | 'parallelogram';
interface ShapeNodeData {
    type: ShapeType;
    color: string;
    label?: string;
}
interface CanvasProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange?: (changes: NodeChange[]) => void;
    onEdgesChange?: (changes: EdgeChange[]) => void;
    onConnect?: (connection: Connection) => void;
    isValidConnection?: (connection: Connection) => boolean;
    onConnectStart?: (event: MouseEvent$1, params: {
        nodeId: string;
        portId?: string;
    }) => void;
    onConnectEnd?: (event: MouseEvent$1) => void;
    onNodeClick?: (event: MouseEvent$1, node: Node) => void;
    onNodeDoubleClick?: (event: MouseEvent$1, node: Node) => void;
    onEdgeClick?: (event: MouseEvent$1, edge: Edge) => void;
    onPaneClick?: (event: MouseEvent$1) => void;
    onDrop?: (event: React.DragEvent, position: Point) => void;
    onDragOver?: (event: React.DragEvent) => void;
    onNodesDelete?: (nodes: Node[]) => void;
    onEdgesDelete?: (edges: Edge[]) => void;
    deleteKeyCode?: string | string[] | null;
    onNodeDragStop?: (event: MouseEvent$1, node: Node) => void;
    onReconnect?: (oldEdge: Edge, newConnection: Connection) => void;
    onReconnectStart?: (event: MouseEvent$1, edge: Edge) => void;
    onReconnectEnd?: (event: MouseEvent$1, edge: Edge) => void;
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

declare function Canvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, isValidConnection, onConnectStart, onConnectEnd, onNodeClick, onNodeDoubleClick, onEdgeClick, onPaneClick, onDrop, onDragOver, onNodesDelete, onEdgesDelete, onNodeDragStop, onReconnect, onReconnectStart, onReconnectEnd, nodeTypes, edgeTypes, connectionLineComponent, defaultEdgeType, snapToGrid, gridSize, dropOnEdge, minZoom, maxZoom, fitView: fitViewProp, deleteKeyCode, className, style, children, }: CanvasProps): react_jsx_runtime.JSX.Element;
declare function MiniMapInner({ nodes, edges, viewport, containerWidth, containerHeight, width, height }: {
    nodes: Node[];
    edges: Edge[];
    viewport: {
        x: number;
        y: number;
        zoom: number;
    };
    containerWidth: number;
    containerHeight: number;
    width?: number;
    height?: number;
}): react_jsx_runtime.JSX.Element | null;

interface EntityColumn$1 {
    name: string;
    pk?: boolean;
    fk?: boolean;
}
interface ErdEntity {
    id: string;
    name: string;
    x: number;
    y: number;
    columns: EntityColumn$1[];
}
interface ErdRelation {
    id?: string;
    sourceEntityId: string;
    sourceColumnIndex: number;
    targetEntityId: string;
}
interface ErdCanvasProps {
    entities: ErdEntity[];
    relations: ErdRelation[];
    selectedEntityId?: string | null;
    onEntitySelect?: (id: string | null) => void;
    onEntityMove?: (id: string, x: number, y: number) => void;
    onDrop?: (event: DragEvent, position: Point) => void;
    fitView?: boolean;
    showMiniMap?: boolean;
    style?: CSSProperties;
}
declare function ErdCanvas({ entities, relations, selectedEntityId, onEntitySelect, onEntityMove, onDrop, fitView, showMiniMap, style, }: ErdCanvasProps): react_jsx_runtime.JSX.Element;

interface EntityColumn {
    name: string;
    pk?: boolean;
    fk?: boolean;
}
interface EntityNodeData {
    name: string;
    columns: EntityColumn[];
    onContextMenu?: (event: MouseEvent$1) => void;
}
declare function EntityNode({ id, data, selected }: NodeProps<EntityNodeData>): react_jsx_runtime.JSX.Element;

interface HandleProps {
    type: 'source' | 'target';
    position: 'top' | 'bottom' | 'left' | 'right';
    id?: string;
    isConnectable?: boolean | number | ((params: ConnectableParams) => boolean);
    style?: CSSProperties;
    className?: string;
    onMouseDown?: (e: MouseEvent$1) => void;
}
declare function Handle({ type, position, id, isConnectable, style, className, onMouseDown }: HandleProps): react_jsx_runtime.JSX.Element;
declare function checkConnectable(isConnectable: boolean | number | ((params: ConnectableParams) => boolean) | undefined, node: Node, port: Port, connectedEdges: Edge[]): boolean;

interface NodeResizerProps {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    isVisible?: boolean;
    lineStyle?: CSSProperties;
    handleStyle?: CSSProperties;
    onResize?: (event: MouseEvent$1, params: {
        width: number;
        height: number;
    }) => void;
    onResizeEnd?: (event: MouseEvent$1, params: {
        width: number;
        height: number;
    }) => void;
}
declare function NodeResizer({ minWidth, maxWidth, minHeight, maxHeight, isVisible, lineStyle, handleStyle, onResize, onResizeEnd, }: NodeResizerProps): react_jsx_runtime.JSX.Element | null;
interface NodeResizeControlProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    style?: CSSProperties;
    children?: React.ReactNode;
    onResize?: (event: MouseEvent$1, params: {
        width: number;
        height: number;
    }) => void;
}
declare function NodeResizeControl({ position, minWidth, maxWidth, minHeight, maxHeight, style, children, onResize, }: NodeResizeControlProps): react_jsx_runtime.JSX.Element;

interface NodeToolbarProps {
    isVisible?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    offset?: number;
    align?: 'start' | 'center' | 'end';
    style?: CSSProperties;
    className?: string;
    children: ReactNode;
}
declare function NodeToolbar({ isVisible, position, offset, align, style, className, children, }: NodeToolbarProps): react_jsx_runtime.JSX.Element | null;

interface RotateHandleProps {
    rotation?: number;
    onRotate?: (rotation: number) => void;
    onRotateEnd?: (rotation: number) => void;
    style?: CSSProperties;
}
declare function RotateHandle({ rotation, onRotate, onRotateEnd, style }: RotateHandleProps): react_jsx_runtime.JSX.Element;

declare const SHAPE_SIZE = 80;
declare const shapePaths: Record<ShapeType, (w: number, h: number) => string>;
declare function ShapeNode({ id, data, selected }: NodeProps<ShapeNodeData>): react_jsx_runtime.JSX.Element;

interface DefaultNodeInternalProps extends NodeProps {
    onPortMouseDown?: (e: MouseEvent$1, nodeId: string, portId?: string) => void;
}
declare function DefaultNode({ id, data, selected, onPortMouseDown }: DefaultNodeInternalProps): react_jsx_runtime.JSX.Element;

interface BaseEdgeProps {
    id?: string;
    path: string;
    label?: string;
    labelX?: number;
    labelY?: number;
    selected?: boolean;
    animated?: boolean;
    style?: CSSProperties;
    interactionWidth?: number;
    onClick?: (e: React.MouseEvent) => void;
}
declare function BaseEdge({ path, label, labelX, labelY, selected, animated, style, interactionWidth, onClick, }: BaseEdgeProps): react_jsx_runtime.JSX.Element;

declare function BezierEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, animated, label, style }: EdgeProps): react_jsx_runtime.JSX.Element;

declare function StraightEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }: EdgeProps): react_jsx_runtime.JSX.Element;

declare function StepEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }: EdgeProps): react_jsx_runtime.JSX.Element;
declare function SmoothStepEdge({ sourceX, sourceY, targetX, targetY, selected, animated, label, style }: EdgeProps): react_jsx_runtime.JSX.Element;

declare function AnimatedEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, label, style, data, }: EdgeProps): react_jsx_runtime.JSX.Element;

declare function OrthogonalEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, animated, label, style }: EdgeProps): react_jsx_runtime.JSX.Element;

interface EdgeLabelRendererProps {
    children: ReactNode;
}
declare function EdgeLabelRenderer({ children }: EdgeLabelRendererProps): react.ReactPortal | null;

declare function DefaultConnectionLine({ fromX, fromY, toX, toY }: ConnectionLineProps): react_jsx_runtime.JSX.Element;

interface UseCanvasOptions {
    initialNodes?: Node[];
    initialEdges?: Edge[];
}
declare function useCanvas(options?: UseCanvasOptions): {
    nodes: Node<Record<string, unknown>>[];
    edges: Edge[];
    setNodes: react.Dispatch<react.SetStateAction<Node<Record<string, unknown>>[]>>;
    setEdges: react.Dispatch<react.SetStateAction<Edge[]>>;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    addNode: (node: Node) => void;
    removeNode: (id: string) => void;
};

interface CanvasState {
    nodes: Node[];
    edges: Edge[];
}
interface UseCanvasHistoryOptions {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    maxHistory?: number;
    onStateChange?: (state: CanvasState) => void;
}
declare function useCanvasHistory(options?: UseCanvasHistoryOptions): {
    nodes: Node<Record<string, unknown>>[];
    edges: Edge[];
    setNodes: react.Dispatch<react.SetStateAction<Node<Record<string, unknown>>[]>>;
    setEdges: react.Dispatch<react.SetStateAction<Edge[]>>;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
};

interface UseViewportOptions {
    minZoom?: number;
    maxZoom?: number;
    initialViewport?: Viewport;
}
declare function useViewport(options?: UseViewportOptions): {
    viewport: Viewport;
    setViewport: react.Dispatch<react.SetStateAction<Viewport>>;
    handleWheel: (e: WheelEvent) => void;
    handlePanStart: (e: MouseEvent$1) => void;
    handlePanMove: (e: MouseEvent$1) => void;
    handlePanEnd: () => void;
    screenToCanvas: (screenX: number, screenY: number) => Point;
    fitView: (nodes: {
        position: Point;
        width?: number;
        height?: number;
    }[], padding?: number) => void;
};

interface UseInteractionsOptions {
    nodes: Node[];
    edges: Edge[];
    setNodes: (fn: (nodes: Node[]) => Node[]) => void;
    setEdges: (fn: (edges: Edge[]) => Edge[]) => void;
}
/**
 * Hook providing advanced interaction handlers:
 * - Add Node On Edge Drop
 * - Delete Middle Node (reconnect)
 * - Proximity Connect
 */
declare function useInteractions({ nodes, edges, setNodes, setEdges }: UseInteractionsOptions): {
    onConnectStart: (_event: any, params: {
        nodeId: string;
        portId?: string;
    }) => void;
    onConnectEnd: (event: MouseEvent | React.MouseEvent) => {
        nodeId: string;
        portId?: string;
    } | null;
    onNodesDelete: (deletedNodes: Node[]) => void;
    getProximityConnection: (nodeId: string, position: Point, threshold?: number) => Node | null;
    connectToProximity: (sourceId: string, targetId: string) => void;
    insertNodeOnEdge: (nodeId: string, position: Point, threshold?: number) => boolean;
    connectStartRef: react.MutableRefObject<{
        nodeId: string;
        portId?: string;
    } | null>;
};

interface UseEasyConnectOptions {
    onConnect?: (connection: Connection) => void;
}
/**
 * Hook that makes entire nodes act as connection handles.
 * Usage: spread nodeProps onto your custom node wrapper.
 * Requires separate dragHandle class to distinguish drag from connect.
 */
declare function useEasyConnect({ onConnect }: UseEasyConnectOptions): {
    onNodeMouseDown: (e: MouseEvent$1, node: Node) => void;
    onNodeMouseUp: (_e: MouseEvent$1, node: Node) => void;
    isConnecting: () => boolean;
};

interface UseCopyPasteOptions {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
}
declare function useCopyPaste({ nodes, edges, onNodesChange, onEdgesChange }: UseCopyPasteOptions): {
    copy: () => void;
    cut: () => void;
    paste: () => void;
};

type Direction = 'TB' | 'BT' | 'LR' | 'RL';
interface UseAutoLayoutOptions {
    direction?: Direction;
    nodeWidth?: number;
    nodeHeight?: number;
    horizontalSpacing?: number;
    verticalSpacing?: number;
}
/**
 * Hook for automatically arranging nodes in a tree/hierarchical layout.
 * Uses a layered (Sugiyama-style) approach without external dependencies.
 */
declare function useAutoLayout(options?: UseAutoLayoutOptions): {
    getLayoutedNodes: (nodes: Node[], edges: Edge[]) => NodeChange[];
};

declare function getBezierPath(source: Point, target: Point): string;
declare function getStraightPath(source: Point, target: Point): string;
declare function getStepPath(source: Point, target: Point): string;
declare function getPortPosition(nodePos: Point, nodeWidth: number, nodeHeight: number, portPosition: 'top' | 'bottom' | 'left' | 'right' | 'center', offset?: number): Point;
declare function getSmartBezierPath(source: Point, target: Point, sourceDir: 'top' | 'bottom' | 'left' | 'right', targetDir: 'top' | 'bottom' | 'left' | 'right'): string;

declare function applyNodeChanges(changes: NodeChange[], nodes: Node[]): Node[];
declare function applyEdgeChanges(changes: EdgeChange[], edges: Edge[]): Edge[];

declare function getConnectedEdges(node: Node, edges: Edge[]): Edge[];
declare function getIncomers(node: Node, nodes: Node[], edges: Edge[]): Node[];
declare function getOutgoers(node: Node, nodes: Node[], edges: Edge[]): Node[];
declare function isIntersecting(nodeA: Node, nodeB: Node): boolean;
declare function getIntersectingNodes(node: Node, nodes: Node[]): Node[];
declare function getClosestNode(position: Point, nodes: Node[], threshold: number): Node | null;
/** Distance from a point to a line segment (ax,ay)-(bx,by) */
declare function pointToSegmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number;
/**
 * Find the closest edge to a point within a distance threshold.
 * Uses source/target node centers as edge endpoints (line approximation).
 */
declare function getEdgeAtPoint(point: Point, edges: Edge[], nodes: Node[], threshold?: number, excludeNodeId?: string): Edge | null;

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * Simple orthogonal edge routing that avoids nodes.
 * Returns an SVG path string with right-angle segments.
 */
declare function getOrthogonalPath(source: Point, target: Point, sourceDir: 'top' | 'bottom' | 'left' | 'right', targetDir: 'top' | 'bottom' | 'left' | 'right', obstacles?: Rect[]): string;
/**
 * Convert nodes to obstacle rectangles for routing
 */
declare function nodesToObstacles(nodes: Node[], excludeIds?: string[]): Rect[];

/**
 * Tool binding edge 스타일 상수
 */
declare const TOOL_BINDING_STYLE: {
    readonly stroke: "#f59e0b";
    readonly strokeWidth: 1.5;
    readonly strokeDasharray: "6 3";
};
/**
 * Agent 노드에서 나가는 edge를 분류한다.
 * - 첫 번째 edge = flow (실선)
 * - 두 번째부터 = tool_binding (점선)
 */
declare function classifyAgentEdges(edges: Edge[], nodes: Node[], agentNodeTypes?: string[]): Edge[];
/**
 * Agent 노드의 tool_bindings를 edge 목록에서 추출한다.
 */
declare function getToolBindings(edges: Edge[], agentNodeId: string): string[];

export { AnimatedEdge, BaseEdge, BezierEdge, Canvas, type CanvasProps, type ConnectableParams, type Connection, type ConnectionLineProps, DefaultConnectionLine, DefaultNode, type Edge, type EdgeChange, EdgeLabelRenderer, type EdgeProps, type EdgeType, type EdgeTypeMap, type EntityColumn, EntityNode, type EntityNodeData, ErdCanvas, type ErdCanvasProps, type ErdEntity, type EntityColumn$1 as ErdEntityColumn, type ErdRelation, Handle, MiniMapInner, type Node, type NodeChange, type NodeProps, NodeResizeControl, NodeResizer, NodeToolbar, type NodeTypeMap, OrthogonalEdge, type Point, type Port, RotateHandle, SHAPE_SIZE, ShapeNode, type ShapeNodeData, type ShapeType, SmoothStepEdge, StepEdge, StraightEdge, TOOL_BINDING_STYLE, type Viewport, applyEdgeChanges, applyNodeChanges, checkConnectable, classifyAgentEdges, getBezierPath, getClosestNode, getConnectedEdges, getEdgeAtPoint, getIncomers, getIntersectingNodes, getOrthogonalPath, getOutgoers, getPortPosition, getSmartBezierPath, getStepPath, getStraightPath, getToolBindings, initCanvas, isIntersecting, nodesToObstacles, pointToSegmentDistance, shapePaths, useAutoLayout, useCanvas, useCanvasHistory, useCopyPaste, useEasyConnect, useInteractions, useViewport };
