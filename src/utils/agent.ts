import type { Edge, Node } from '../types';

/**
 * Tool binding edge 스타일 상수
 */
export const TOOL_BINDING_STYLE = {
  stroke: '#f59e0b',
  strokeWidth: 1.5,
  strokeDasharray: '6 3',
} as const;

/**
 * Agent 노드에서 나가는 edge를 분류한다.
 * - 첫 번째 edge = flow (실선)
 * - 두 번째부터 = tool_binding (점선)
 */
export function classifyAgentEdges(
  edges: Edge[],
  nodes: Node[],
  agentNodeTypes: string[] = ['agent'],
): Edge[] {
  const agentIds = new Set(
    nodes.filter((n) => agentNodeTypes.includes(n.type)).map((n) => n.id),
  );

  // agent 노드별 outgoing edge를 순서대로 수집
  const agentOutEdges = new Map<string, Edge[]>();
  for (const edge of edges) {
    if (agentIds.has(edge.source)) {
      const list = agentOutEdges.get(edge.source) || [];
      list.push(edge);
      agentOutEdges.set(edge.source, list);
    }
  }

  return edges.map((edge) => {
    if (!agentIds.has(edge.source)) return edge;

    const outList = agentOutEdges.get(edge.source) || [];
    const idx = outList.indexOf(edge);

    if (idx === 0) {
      // 첫 번째 = flow (기본 스타일)
      return { ...edge, data: { ...edge.data, edgeType: 'flow' } };
    }

    // 두 번째~ = tool_binding (점선 주황)
    return {
      ...edge,
      style: { ...edge.style, ...TOOL_BINDING_STYLE },
      data: { ...edge.data, edgeType: 'tool_binding' },
    };
  });
}

/**
 * Agent 노드의 tool_bindings를 edge 목록에서 추출한다.
 */
export function getToolBindings(edges: Edge[], agentNodeId: string): string[] {
  return edges
    .filter((e) => e.source === agentNodeId && e.data?.edgeType === 'tool_binding')
    .map((e) => e.target);
}
