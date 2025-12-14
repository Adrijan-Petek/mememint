"use client";
import { useState, useCallback } from "react";
import { TextElement } from "./useTextElements";

export function useMemeInteractions(
  textElements: TextElement[],
  updateTextElement: (id: string, updates: Partial<TextElement>) => void
) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState<{ x: number; y: number } | null>(null);
  const [initialElementState, setInitialElementState] = useState<TextElement | null>(null);
  const [containerMetrics, setContainerMetrics] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const handleMouseDown = useCallback((id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const element = textElements.find(el => el.id === id);
    if (!element) return;

    const containerEl = (e.target as HTMLElement).closest('[data-image-container]') as HTMLElement | null;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    setContainerMetrics({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });

    // If element is centered, convert its position to container-relative pixel coordinates
    let currentElement: TextElement = { ...element };
    if (element.centered) {
      // Canonical canvas dimensions are 600x450
      const centerX = 300;
      const centerY = 225;
      currentElement = {
        ...element,
        centered: false,
        position: { x: centerX, y: centerY }
      };
      updateTextElement(id, { centered: false, position: { x: centerX, y: centerY } });
    }

    // Store complete element state with all style properties
    setInitialElementState(currentElement);
    setDragging(id);

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setInitialMousePos({ x: clientX, y: clientY });

    // Check if clicking on resize handle
    const target = e.target as HTMLElement;
    if (target.className && target.className.includes && target.className.includes('resizeHandle')) {
      setResizing(id);
    } else if (target.className && target.className.includes && target.className.includes('rotateHandle')) {
      setRotating(true);
    }
  }, [textElements, updateTextElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !initialMousePos || !initialElementState) return;

    e.preventDefault();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

  if (!containerMetrics) return;

  const scaleX = 600 / containerMetrics.width; // Container is 600px wide
  const scaleY = 450 / containerMetrics.height; // Container is 450px tall

    // Convert screen pixel deltas to container-relative deltas
    const deltaX = (clientX - initialMousePos.x) * scaleX;
    const deltaY = (clientY - initialMousePos.y) * scaleY;

    if (resizing) {
      // Handle resizing - use scale to maintain text shape and aspect ratio
      const scaleFactor = 1 + (deltaX * 0.005); // More gradual scaling
      const newScale = Math.max(0.3, Math.min(5, (initialElementState.style.scale || 1) * scaleFactor));
      updateTextElement(resizing, {
        style: { ...initialElementState.style, scale: newScale }
      });
    } else if (rotating) {
      // Handle rotating
  const centerX = containerMetrics.left + (initialElementState.position.x / 600) * containerMetrics.width;
  const centerY = containerMetrics.top + (initialElementState.position.y / 450) * containerMetrics.height;
  const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      updateTextElement(dragging, {
        style: { ...initialElementState.style, rotation: angle }
      });
    } else {
      // Handle dragging with container-relative coordinates
      const newX = Math.max(0, Math.min(600, initialElementState.position.x + deltaX));
      const newY = Math.max(0, Math.min(450, initialElementState.position.y + deltaY));
      updateTextElement(dragging, {
        position: { x: newX, y: newY },
        // Explicitly preserve ALL style properties
        style: { ...initialElementState.style }
      });
    }
  }, [containerMetrics, dragging, initialMousePos, initialElementState, resizing, rotating, updateTextElement]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
    setRotating(false);
    setInitialMousePos(null);
    setInitialElementState(null);
  setContainerMetrics(null);
  }, []);

  return {
    dragging,
    resizing,
    rotating,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}