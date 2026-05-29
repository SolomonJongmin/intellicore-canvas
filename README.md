# @intellicore/visual-canvas

플로우 에디터, ERD 다이어그램, 노드 기반 UI를 위한 비주얼 캔버스 엔진.

외부 의존성 없음 (React peer만 필요). TypeScript 우선. 번들 <60KB.

## 설치

```bash
npm install @intellicore/visual-canvas
```

## 빠른 시작

```tsx
import { Canvas, useCanvas } from '@intellicore/visual-canvas';

function MyFlowEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCanvas({
    initialNodes: [
      { id: '1', type: 'default', position: { x: 100, y: 0 }, data: { label: 'Start' }, width: 36, height: 36 },
      { id: '2', type: 'default', position: { x: 100, y: 150 }, data: { label: 'End' }, width: 36, height: 36 },
    ],
    initialEdges: [
      { id: 'e1', source: '1', target: '2' },
    ],
  });

  return (
    <div style={{ width: '100%', height: 500 }}>
      <Canvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
    </div>
  );
}
```

## 주요 기능

### 코어 노드

- 🎨 **커스텀 노드** — React 컴포넌트를 `nodeTypes`로 등록
- 🔷 **도형 노드** — 원, 다이아몬드, 육각형, 삼각형, 평행사변형 (SVG 기반)
- ↔️ **노드 리사이즈** — `<NodeResizer />`, `<NodeResizeControl />`
- 🛠️ **노드 툴바** — 선택 시 `<NodeToolbar />` 표시
- 🔄 **노드 회전** — `<RotateHandle />`로 CSS transform 회전
- ✋ **드래그 핸들** — `.drag-handle` 클래스로 드래그 영역 제한, `.nodrag`로 연결 영역 지정
- 📝 **노드 업데이트** — 불변 변경 배열로 속성 업데이트

### 엣지 & 연결

- 〰️ **커스텀 엣지** — `edgeTypes`로 등록, `<BaseEdge />`로 구현
- 📐 **엣지 타입** — Bezier, Straight, Step, SmoothStep, Orthogonal, Animated
- 🏷️ **엣지 라벨** — `<EdgeLabelRenderer />` 포탈로 HTML 라벨 렌더링
- ✏️ **연결선 커스터마이즈** — `connectionLineComponent` prop
- 🔢 **연결 수 제한** — `isConnectable` (boolean | number | 콜백)
- 🎬 **엣지 애니메이션** — SVG `<animateMotion />`으로 경로 따라 이동
- 🛤️ **엣지 라우팅** — `getOrthogonalPath()`로 직각 경로 자동 계산
- 🎯 **방사형 연결** — 노드 타원 경계에서 연결 (고정 포트 아님)

### 인터랙션

- ➕ **엣지 드롭으로 노드 추가** — `onConnectStart` / `onConnectEnd`
- 🔗 **중간 노드 삭제 시 재연결** — `useInteractions`
- 🖐️ **이지 커넥트** — `useEasyConnect`로 노드 전체를 핸들로 사용
- 🔍 **교차 감지** — `isIntersecting()`, `getIntersectingNodes()`
- 📍 **근접 자동 연결** — 드롭 시 가까운 노드에 자동 연결
- ❌ **엣지 드롭 삭제** — `onReconnectStart` / `onReconnectEnd`
- 📋 **복사 & 붙여넣기** — `useCopyPaste` (Ctrl+C/X/V)
- 📐 **자동 레이아웃** — `useAutoLayout` (TB, BT, LR, RL 방향)

### 캔버스

- 🖱️ 노드 드래그, 줌/팬
- 🔲 라쏘 선택 (빈 공간 드래그)
- ⌨️ 키보드 단축키 (Delete, Ctrl+A, Ctrl+Z/Y)
- 📌 그리드 스냅
- 🗺️ 미니맵
- ↩️ Undo/Redo (`useCanvasHistory`)

## 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `<Canvas />` | 메인 캔버스 |
| `<Handle />` | 연결 핸들 (`isConnectable` 지원) |
| `<NodeResizer />` | 리사이즈 핸들 |
| `<NodeResizeControl />` | 커스텀 리사이즈 컨트롤 |
| `<NodeToolbar />` | 노드 선택 시 툴바 |
| `<RotateHandle />` | 회전 핸들 |
| `<ShapeNode />` | SVG 도형 노드 (6종) |
| `<BaseEdge />` | 커스텀 엣지 베이스 |
| `<EdgeLabelRenderer />` | 엣지 HTML 라벨 포탈 |

## 훅

| 훅 | 설명 |
|----|------|
| `useCanvas` | 기본 상태 관리 (nodes, edges, handlers) |
| `useCanvasHistory` | 상태 관리 + Undo/Redo |
| `useViewport` | 줌/팬 제어 |
| `useInteractions` | 고급 인터랙션 (중간 노드 삭제 재연결, 근접 연결) |
| `useEasyConnect` | 노드 전체를 연결 핸들로 사용 |
| `useCopyPaste` | Ctrl+C/X/V 복사 붙여넣기 |
| `useAutoLayout` | 자동 노드 배치 (계층 레이아웃) |

## 유틸리티

```ts
// 그래프 탐색
getConnectedEdges(node, edges)    // 노드에 연결된 엣지 조회
getIncomers(node, nodes, edges)   // 들어오는 노드 조회
getOutgoers(node, nodes, edges)   // 나가는 노드 조회
isIntersecting(nodeA, nodeB)      // 두 노드 교차 여부
getIntersectingNodes(node, nodes) // 교차하는 노드 목록
getClosestNode(position, nodes, threshold) // 가장 가까운 노드

// 경로 계산
getBezierPath(source, target)
getStraightPath(source, target)
getStepPath(source, target)
getSmartBezierPath(source, target, sourceDir, targetDir)
getOrthogonalPath(source, target, sourceDir, targetDir)

// 변경 적용
applyNodeChanges(changes, nodes)  // 노드 변경 배열 적용
applyEdgeChanges(changes, edges)  // 엣지 변경 배열 적용
```

## 예제 실행

```bash
cd example
npm install
npm run dev
```

예제 목록:
- **Flow Editor** — OutSystems 스타일 플로우 (도형 노드, 드래그&드롭, Undo/Redo)
- **ERD** — 엔티티 관계 다이어그램 (카드 노드, FK 관계선)
- **Shapes** — SVG 도형 팔레트 + 색상 변경 툴바
- **Custom Edges** — 모든 엣지 타입 데모
- **Interactions** — 중간 노드 삭제 재연결, 교차 감지

## 라이선스

UNLICENSED — 비공개 프로젝트. 무단 사용, 복제, 배포 금지.
