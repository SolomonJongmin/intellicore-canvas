import { useCallback, useRef, MouseEvent } from 'react';
import type { Node, Connection } from '../types';

interface UseEasyConnectOptions {
  onConnect?: (connection: Connection) => void;
}

/**
 * Hook that makes entire nodes act as connection handles.
 * Usage: spread nodeProps onto your custom node wrapper.
 * Requires separate dragHandle class to distinguish drag from connect.
 */
export function useEasyConnect({ onConnect }: UseEasyConnectOptions) {
  const connectingFrom = useRef<string | null>(null);

  const onNodeMouseDown = useCallback((e: MouseEvent, node: Node) => {
    // Only start connection if not on a drag handle
    const target = e.target as HTMLElement;
    if (target.closest('.drag-handle') || target.closest('.nodrag')) return;
    connectingFrom.current = node.id;
  }, []);

  const onNodeMouseUp = useCallback((_e: MouseEvent, node: Node) => {
    if (connectingFrom.current && connectingFrom.current !== node.id) {
      onConnect?.({ source: connectingFrom.current, target: node.id });
    }
    connectingFrom.current = null;
  }, [onConnect]);

  const isConnecting = useCallback(() => connectingFrom.current !== null, []);

  return { onNodeMouseDown, onNodeMouseUp, isConnecting };
}
