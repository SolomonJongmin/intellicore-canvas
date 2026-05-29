import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface EdgeLabelRendererProps {
  children: ReactNode;
}

const CONTAINER_ID = 'ic-edge-label-renderer';

export function EdgeLabelRenderer({ children }: EdgeLabelRendererProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = CONTAINER_ID;
      el.style.position = 'absolute';
      el.style.inset = '0';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '5';
      // Find the canvas pane and append
      const pane = document.querySelector('.ic-canvas-pane');
      if (pane) pane.appendChild(el);
    }
    setContainer(el);
  }, []);

  if (!container) return null;
  return createPortal(children, container);
}
