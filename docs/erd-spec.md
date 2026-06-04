# OutSystems ERD 스타일 연결선 스펙

## 개요

OutSystems Service Studio의 ERD(Entity Relationship Diagram) 연결선 스타일을 구현한다.

## 노드 (Entity)

```
┌─────────────────┐
│ ⊞ Entity Name   │  ← 헤더 (33px)
├─────────────────┤
│ ⊞ Id            │  ← PK 행 (22px, 볼드)
│ ⊞ Attribute1    │  ← 일반 행 (22px, 파랑 아이콘)
│ ⊟ Entity1Id     │  ← FK 행 (22px, 멀티컬러 아이콘, 빨강 텍스트)
└─────────────────┘
```

- PK 아이콘: 파랑 3x3 그리드
- FK 아이콘: 빨강/초록/파랑 혼합 3x3 그리드
- FK 텍스트: 빨강(#c0392b)

## 연결선 규칙

### 방향

```
[Order.Entity1Id] ──────> [Entity1]
     (source)               (target)
      FK 행                 참조 엔티티
```

- **source** = FK가 있는 엔티티의 해당 FK 행
- **target** = 참조되는 엔티티 (노드 전체)

### 출발점 (Source)

- FK **행의 가장자리**에서 출발
- target이 오른쪽에 있으면 → 행의 **우측 끝**
- target이 왼쪽에 있으면 → 행의 **좌측 끝**
- target이 위/아래에 있으면 → 행의 **하단 또는 상단 중앙**
- Y 좌표: `nodeY + HEADER(33) + colIndex * ROW(22) + ROW/2`
- X 좌표: `nodeX + nodeWidth` (우측) 또는 `nodeX` (좌측)

### 도착점 (Target)

- 참조 엔티티의 **border 중앙**
- source가 오른쪽에 있으면 → **우측 중앙**
- source가 왼쪽에 있으면 → **좌측 중앙**
- source가 위/아래에 있으면 → **상단/하단 중앙**

### 화살촉

- FK 행 쪽(source)에만 `>` 화살촉 표시
- target 쪽에는 마커 없음
- 화살촉 방향: 선이 나가는 방향

### 곡선

- Bezier 커브 사용
- 수평 연결: `M sx sy C midX sy, midX ty, tx ty`
- 수직 연결: `M sx sy C sx midY, tx midY, tx ty`

## 예제 데이터

```
Entity2.Entity1Id  ──>  Entity1
Order.Entity1Id2   ──>  Entity1
Order.Entity1Id3   ──>  Entity1
Entity1.Entity3Id  ──>  Entity3
Entity1.Entity4Id  ──>  Entity4
```

## 동적 동작

1. **노드 드래그 시**: source/target 모두 따라감
2. **출발점 Y 고정**: 항상 FK 행 위치에 붙음
3. **출발점 X 동적**: target 위치에 따라 좌/우 전환
4. **도착점 동적**: source 위치에 따라 border 교차점 자동 계산

## 구현 방식

Canvas가 `sourceX, sourceY, targetX, targetY`를 전달하는 방식의 한계:
- `sourceX/Y`는 radial border point로 계산됨 → FK 행 위치가 아님
- 해결: **Canvas 내부(calcEdgePath)**에서 edge.data의 sourceColIndex를 읽어 sourceY를 FK 행 위치로 override

### 필요한 수정

1. `Canvas.tsx`의 `calcEdgePath`에서 `edge.data.sourceColIndex`가 있으면:
   - sourceY = nodeY + HEADER + colIndex * ROW + ROW/2
   - sourceX = target 방향에 따라 nodeX 또는 nodeX + width
2. 커스텀 엣지(`CrowFootEdge`)는 전달받은 좌표를 그대로 사용
3. 화살촉만 source 쪽에 그림
