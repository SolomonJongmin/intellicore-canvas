import { useState, useCallback, WheelEvent, MouseEvent, useRef } from 'react';
import type { Viewport, Point } from '../types';

interface UseViewportOptions {
  minZoom?: number;
  maxZoom?: number;
  initialViewport?: Viewport;
}

export function useViewport(options: UseViewportOptions = {}) {
  const { minZoom = 0.1, maxZoom = 4, initialViewport } = options;
  const [viewport, setViewport] = useState<Viewport>(initialViewport || { x: 0, y: 0, zoom: 1 });
  const isPanning = useRef(false);
  const lastMouse = useRef<Point>({ x: 0, y: 0 });

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const el = e.currentTarget as HTMLElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setViewport((v) => {
        const newZoom = Math.min(maxZoom, Math.max(minZoom, v.zoom * delta));
        return {
          x: mx - (mx - v.x) * (newZoom / v.zoom),
          y: my - (my - v.y) * (newZoom / v.zoom),
          zoom: newZoom,
        };
      });
    } else {
      setViewport((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
    }
  }, [minZoom, maxZoom]);

  const handlePanStart = useCallback((e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handlePanMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setViewport((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: (screenX - viewport.x) / viewport.zoom,
      y: (screenY - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  const fitView = useCallback((nodes: { position: Point; width?: number; height?: number }[], padding = 50) => {
    if (nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + (n.width || 140));
      maxY = Math.max(maxY, n.position.y + (n.height || 40));
    }
    const w = maxX - minX + padding * 2;
    const h = maxY - minY + padding * 2;
    // Assume container is 800x600 (will be overridden by actual size)
    const zoom = Math.min(800 / w, 600 / h, 1);
    setViewport({ x: -minX * zoom + padding, y: -minY * zoom + padding, zoom });
  }, []);

  return { viewport, setViewport, handleWheel, handlePanStart, handlePanMove, handlePanEnd, screenToCanvas, fitView };
}
