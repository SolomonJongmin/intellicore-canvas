# Feature Requirements

## Overview

`@intellicore/visual-canvas`에 추가할 19가지 기능 요구사항 정의.

---

## Category 1: Core Node Features

### 1. Custom Nodes

React 컴포넌트를 `nodeTypes`에 전달하여 커스텀 노드를 생성한다.

- 표준 React 컴포넌트로 구현
- 기본 노드 동작을 확장/커스터마이즈하는 props 제공
- `nodeTypes` 맵을 통해 등록

```tsx
const nodeTypes = { custom: MyCustomNode };
<Canvas nodeTypes={nodeTypes} />
```

### 2. Shapes

중앙화된 Shape 컴포넌트로 플로우차트 도형(circle, diamond, hexagon 등)을 렌더링한다.

- 단일 노드 타입(`type: 'shape'`)으로 다양한 도형 지원
- `data.type`으로 도형 종류, `data.color`로 색상 제어
- SVG path 기반 렌더링
- 사이드바 컴포넌트 (도형 드래그 추가)
- 커스텀 미니맵 노드
- 노드 툴바로 색상 변경

```ts
{ type: 'shape', data: { type: 'diamond', color: '#ff0071' } }
```

### 3. Node Resizer

노드 리사이즈 UI를 제공한다.

- `<NodeResizer />` — 기본 리사이즈 핸들
- `<NodeResizeControl />` — 커스텀 리사이즈 UI 구현용
- 최소/최대 크기 제한 지원

### 4. Node Toolbar

노드 선택 시 툴바를 표시한다.

- `<NodeToolbar />` 컴포넌트
- 노드 선택/호버 시 자동 표시
- 위치 설정 가능 (top, bottom, left, right)

### 5. Rotatable Node

CSS transform을 사용하여 노드를 회전한다.

- 회전 핸들 UI
- `data.rotation` 속성으로 각도 저장
- CSS `transform: rotate()` 적용

### 6. Drag Handle

노드의 특정 영역만 드래그 가능하도록 제한한다.

- `dragHandle` 클래스로 드래그 영역 지정
- `nodrag` 클래스로 드래그 방지 영역 설정
- 커스텀 노드 내부에서 활용

### 7. Updating Nodes

노드/엣지 속성을 동적으로 업데이트한다.

- 새 nodes/edges 배열 전달로 업데이트
- 불변성 유지 (새 배열 생성)
- 부분 업데이트 헬퍼 함수 제공

---

## Category 2: Edge & Connection Features

### 8. Custom Edges

커스텀 엣지를 구현한다.

- 4가지 기본 엣지 타입: bezier, straight, step, smoothstep
- `edgeTypes` 맵으로 커스텀 엣지 등록
- `<BaseEdge />` 헬퍼 컴포넌트
- 구현 예시: 버튼 포함 엣지, 양방향 엣지, 셀프 커넥팅 엣지

### 9. Connection Line

핸들에서 드래그 시 표시되는 연결선을 커스터마이즈한다.

- React 컴포넌트로 커스텀 연결선 구현
- 유효한 핸들에 스냅 기능
- `connectionLineComponent` prop으로 전달

### 10. Connection Limit

핸들의 연결 수를 제한한다.

- `isConnectable` prop 지원:
  - `boolean` — 연결 가능/불가
  - `number` — 최대 연결 수
  - `(params) => boolean` — 콜백 함수

### 11. Edge Label Renderer

SVG 밖에서 엣지 라벨을 HTML로 렌더링한다.

- `<EdgeLabelRenderer />` 포탈 컴포넌트
- 엣지 라벨을 div로 렌더링
- 마우스 인터랙션: `pointer-events: all` 설정

### 12. Animating Edges

엣지에 애니메이션을 적용한다.

- 기본 엣지 애니메이션 (CSS)
- SVG `<animateMotion />` 활용한 고급 애니메이션
- 엣지 경로를 따라 요소 이동

### 13. Edge Routing

자동 엣지 라우팅을 구현한다.

- 노드를 피해가는 경로 자동 계산
- 커스텀 라우팅 알고리즘 지원
- orthogonal 라우팅 (직각 경로)

---

## Category 3: Interaction Features

### 14. Add Node On Edge Drop

연결선을 빈 캔버스에 드롭하면 새 노드를 생성한다.

- `onConnectStart` — 연결 시작 감지
- `onConnectEnd` — 연결 종료 감지 (타겟 없을 때)
- 드롭 위치에 새 노드 생성 + 엣지 연결

### 15. Delete Middle Node

중간 노드 삭제 시 양쪽 노드를 자동 재연결한다.

- `onNodesDelete` 콜백
- `getConnectedEdges(node)` — 연결된 엣지 조회
- `getIncomers(node)` / `getOutgoers(node)` — 인접 노드 조회
- a→b→c에서 b 삭제 시 a→c로 재연결

### 16. Easy Connect

노드 전체를 연결 핸들로 사용한다.

- 노드 영역 어디서든 연결 시작 가능
- 별도 drag handle 정의 필요 (드래그와 연결 구분)

### 17. Intersections

노드 드래그 시 다른 노드와의 교차를 감지한다.

- `isIntersecting(nodeA, nodeB)` 헬퍼
- `getIntersectingNodes(node)` — 교차 노드 목록
- 시각적 피드백 (하이라이트, 색상 변경)

### 18. Proximity Connect

노드를 다른 노드 근처에 드롭하면 자동으로 엣지를 생성한다.

- 근접 거리 임계값 설정
- 드래그 중 점선으로 연결 미리보기
- 드롭 시 자동 엣지 생성

### 19. Delete Edge on Drop

기존 엣지를 드래그하여 빈 캔버스에 드롭하면 삭제한다.

- `onReconnectStart` — 재연결 시작
- `onReconnect` — 재연결 완료
- `onReconnectEnd` — 재연결 종료 (타겟 없으면 삭제)

---

## Implementation Priority

| Phase | Features | Rationale |
|-------|----------|-----------|
| 1 | Custom Nodes, Shapes, Node Resizer, Node Toolbar, Rotatable Node, Drag Handle, Updating Nodes | 코어 노드 시스템 — 다른 기능의 기반 |
| 2 | Custom Edges, Connection Line, Connection Limit, Edge Label Renderer, Animating Edges, Edge Routing | 엣지/연결 시스템 — 노드 기능에 의존 |
| 3 | Add Node On Edge Drop, Delete Middle Node, Easy Connect, Intersections, Proximity Connect, Delete Edge on Drop | 고급 인터랙션 — 노드+엣지 기능에 의존 |
