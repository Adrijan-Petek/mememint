"use client";
import { useState, useRef, useCallback } from "react";

export function useDrawing() {
  const [drawingPaths, setDrawingPaths] = useState<Array<{ x: number; y: number }[]>>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(5);
  const [brushColor, setBrushColor] = useState<string>('#ffffff');
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

  const clearDrawing = useCallback(() => {
    setDrawingPaths([]);
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setDrawingPaths(prev => [...prev, [{ x, y }]]);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    e.preventDefault();

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setDrawingPaths(prev => {
      const newPaths = [...prev];
      const currentPath = newPaths[newPaths.length - 1];
      if (currentPath) {
        currentPath.push({ x, y });
      }
      return newPaths;
    });

    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const currentPath = drawingPaths[drawingPaths.length - 1];
      if (currentPath && currentPath.length > 1) {
        const lastPoint = currentPath[currentPath.length - 2];
        const currentPoint = currentPath[currentPath.length - 1];

        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      }
    }
  }, [isDrawing, brushColor, brushSize, drawingPaths]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  return {
    drawingPaths,
    isDrawing,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    drawingCanvasRef,
    clearDrawing,
    startDrawing,
    draw,
    stopDrawing
  };
}