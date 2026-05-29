# Architecture Design

## Current Structure

```
src/
├── Canvas.tsx          # 메인 컴포넌트 (렌더링, 이벤트 처리)
├── types.ts            # 타입 정의
├── index.ts            # Public exports
├── hooks/
│   ├── useCanvas.ts        # 상태 관리
│   ├── useCanvasHistory.ts # Undo/Redo
│   └── useViewport.ts      # 줌/팬
└── utils/
    ├── path.ts         # 엣지 경로 계산
    └── changes.ts      # 노드/엣지 변경 적용
```

## Target Structure

```
src/
├── Canvas.tsx              # 메인 컴포넌트 (슬림화)
├── types.ts               # 타입 정의 (확장)
├── index.ts               # Public exports
├── components/
│   ├── nodes/
│   │   ├── DefaultNode.tsx
│   │   ├── ShapeNode.tsx       # Shapes (SVG 도형)
│   │   ├── NodeResizer.tsx     # 리사이즈 핸들
│   │   ├── NodeResizeControl.tsx
│   │   ├── NodeToolbar.tsx     # 노드 툴바
│   │   └── RotateHandle.tsx    # 회전 핸들
│   ├── edges/
│   │   ├── BaseEdge.tsx        # 엣지 베이스 컴포넌트
│   │   ├── BezierEdge.tsx
│   │   ├── StraightEdge.tsx
│   │   ├── StepEdge.tsx
│   │   ├── SmoothStepEdge.tsx
│   │   └── EdgeLabelRenderer.tsx
│   ├── ConnectionLine.tsx      # 커스텀 연결선
│   └── Handle.tsx              # 연결 핸들 (isConnectable 지원)
├── hooks/
│   ├── useCanvas.ts
│   ├── useCanvasHistory.ts
│   ├── useViewport.ts
│   ├── useConnection.ts       # 연결 로직 분리
│   ├── useNodeDrag.ts         # 드래그 로직 분리
│   └── useIntersection.ts     # 교차 감지
├── utils/
│   ├── path.ts
│   ├── changes.ts
│   ├── graph.ts               # getIncomers, getOutgoers, getConnectedEdges
│   └── intersection.ts        # 교차 계산
└── context/
    └── CanvasContext.tsx       # 내부 상태 공유 (노드/엣지 접근)
```

---

## Type Extensions

```ts
// types.ts 추가 타입

// Node 확장
interface Node<T = Record<string, unknown>> {
  // ... 기존 필드
  dragHandle?: string;          // Drag Handle: CSS 선택자
  rotation?: number;            // Rotatable Node: 회전 각도 (deg)
  resizable?: boolean;          // Node Resizer 활성화
}

// Edge 확장
interface Edge {
  // ... 기존 필드
  type?: string;                // 커스텀 엣지 타입 지원 (string으로 확장)
  reconnectable?: boolean;      // Delete Edge on Drop 지원
}

// Port/Handle 확장
interface Port {
  // ... 기존 필드
  isConnectable?: boolean | number | ((params: ConnectableParams) => boolean);
}

interface ConnectableParams {
  node: Node;
  port: Port;
  connectedEdges: Edge[];
}

// 새 타입
type EdgeTypeMap = Record<string, ComponentType<EdgeProps>>;

interface EdgeProps {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  selected: boolean;
  data?: Record<string, unknown>;
}

interface NodeProps<T = Record<string, unknown>> {
  // ... 기존 필드
  dragHandle?: string;
  isConnectable?: boolean | number | ((params: ConnectableParams) => boolean);
}

// Shape 타입
type ShapeType = 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'triangle' | 'parallelogram';

interface ShapeNodeData {
  type: ShapeType;
  color: string;
  label?: string;
}

// Canvas Props 확장
interface CanvasProps {
  // ... 기존 필드
  edgeTypes?: EdgeTypeMap;
  connectionLineComponent?: ComponentType<ConnectionLineProps>;
  onConnectStart?: (event: MouseEvent, params: { nodeId: string; portId?: string }) => void;
  onConnectEnd?: (event: MouseEvent) => void;
  onNodesDelete?: (nodes: Node[]) => void;
  onEdgesDelete?: (edges: Edge[]) => void;
  onReconnect?: (oldEdge: Edge, newConnection: Connection) => void;
  onReconnectStart?: (event: MouseEvent, edge: Edge) => void;
  onReconnectEnd?: (event: MouseEvent, edge: Edge) => void;
}
```

---

## Component API Design

### NodeResizer

```tsx
<NodeResizer
  minWidth={50}
  maxWidth={500}
  minHeight={30}
  maxHeight={400}
  isVisible={selected}
  lineStyle={{ borderColor: '#2563eb' }}
  handleStyle={{ width: 8, height: 8 }}
  onResize={(event, { width, height }) => void}
/>
```

### NodeResizeControl

```tsx
<NodeResizeControl
  position="bottom-right"
  style={{ background: '#2563eb' }}
  minWidth={50}
  minHeight={30}
>
  <ResizeIcon />
</NodeResizeControl>
```

### NodeToolbar

```tsx
<NodeToolbar
  isVisible={selected}
  position="top"       // top | bottom | left | right
  offset={10}
  align="center"       // start | center | end
>
  <button onClick={...}>Delete</button>
  <button onClick={...}>Edit</button>
</NodeToolbar>
```

### Handle (Connection Limit)

```tsx
<Handle
  type="source"
  position="bottom"
  isConnectable={3}  // max 3 connections
  onConnect={(params) => void}
/>
```

### BaseEdge

```tsx
function CustomEdge({ sourceX, sourceY, targetX, targetY, ...props }: EdgeProps) {
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  return <BaseEdge path={path} {...props} />;
}
```

### EdgeLabelRenderer

```tsx
function CustomEdge(props: EdgeProps) {
  return (
    <>
      <BaseEdge path={...} />
      <EdgeLabelRenderer>
        <div style={{ position: 'absolute', transform: `translate(${x}px, ${y}px)`, pointerEvents: 'all' }}>
          <button>×</button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
```

### ConnectionLine

```tsx
<Canvas
  connectionLineComponent={({ fromX, fromY, toX, toY }) => (
    <path d={`M ${fromX} ${fromY} L ${toX} ${toY}`} stroke="blue" strokeDasharray="5 5" />
  )}
/>
```

### ShapeNode

```tsx
// 사용법
const nodes = [
  { id: '1', type: 'shape', position: { x: 0, y: 0 }, data: { type: 'diamond', color: '#ff0071' } }
];

// 등록
<Canvas nodeTypes={{ shape: ShapeNode }} />
```

---

## Utility Functions

### graph.ts

```ts
// 인접 노드/엣지 조회
function getConnectedEdges(node: Node, edges: Edge[]): Edge[];
function getIncomers(node: Node, nodes: Node[], edges: Edge[]): Node[];
function getOutgoers(node: Node, nodes: Node[], edges: Edge[]): Node[];

// 교차 감지
function isIntersecting(nodeA: Node, nodeB: Node): boolean;
function getIntersectingNodes(node: Node, nodes: Node[]): Node[];

// 근접 감지
function getClosestNode(position: Point, nodes: Node[], threshold: number): Node | null;
```

---

## Event Flow

### Add Node On Edge Drop
```
onConnectStart → 드래그 중 → onConnectEnd (target 없음)
  → 새 노드 생성 (드롭 위치) → 엣지 연결
```

### Delete Middle Node
```
onNodesDelete([nodeB]) → getIncomers(B) → getOutgoers(B)
  → 새 엣지 생성 (incomers → outgoers)
```

### Proximity Connect
```
onNodeDrag → getClosestNode(position, threshold)
  → 점선 미리보기 표시 → onNodeDragStop → 엣지 생성
```

### Delete Edge on Drop
```
onReconnectStart(edge) → 드래그 중 → onReconnectEnd (target 없음)
  → edge 삭제
```

---

## Implementation Plan

### Phase 1: Core Node (7 features)

1. **Canvas 리팩토링** — DefaultNode 분리, CanvasContext 생성
2. **Handle 컴포넌트** — isConnectable, dragHandle 클래스 지원
3. **NodeResizer / NodeResizeControl** — 리사이즈 핸들 + 이벤트
4. **NodeToolbar** — 포지셔닝 + 가시성 제어
5. **RotateHandle** — CSS transform rotation
6. **ShapeNode** — SVG path 기반 도형 렌더링
7. **Drag Handle** — dragHandle 클래스 기반 드래그 제한

### Phase 2: Edge & Connection (6 features)

1. **edgeTypes 지원** — Canvas에 edgeTypes prop 추가
2. **BaseEdge** — 커스텀 엣지 베이스 컴포넌트
3. **EdgeLabelRenderer** — 포탈 기반 HTML 라벨
4. **ConnectionLine** — 커스텀 연결선 컴포넌트
5. **Connection Limit** — isConnectable 로직 구현
6. **Animating Edges** — animateMotion 지원
7. **Edge Routing** — orthogonal 라우팅 알고리즘

### Phase 3: Interactions (6 features)

1. **graph.ts 유틸** — getIncomers, getOutgoers, getConnectedEdges
2. **intersection.ts** — 교차/근접 감지
3. **Add Node On Edge Drop** — onConnectStart/End 핸들러
4. **Delete Middle Node** — onNodesDelete + 재연결 로직
5. **Easy Connect** — 노드 전체 핸들화
6. **Proximity Connect** — 근접 자동 연결
7. **Delete Edge on Drop** — onReconnect 핸들러
