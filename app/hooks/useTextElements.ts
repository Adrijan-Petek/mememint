"use client";
import { useState, useCallback } from "react";

export interface TextElement {
  id: string;
  text: string;
  style: {
    font: string;
    color: string;
    backgroundColor?: string;
    size: number;
    scale?: number;
    rotation: number;
    bold?: boolean;
    shadow?: boolean;
    border?: boolean;
  };
  position: { x: number; y: number };
  centered?: boolean;
}

export function useTextElements(initialTextElements: TextElement[] = []) {
  const [textElements, setTextElements] = useState<TextElement[]>(initialTextElements);
  const [selectedTextId, setSelectedTextId] = useState<string>(initialTextElements[0]?.id || '');

  const addTextElement = useCallback((text: string = "Your text here", position?: { x: number; y: number }) => {
    const newId = `text-${Date.now()}`;
    const newTextElement: TextElement = {
      id: newId,
      text: text,
      style: {
        font: 'Impact',
        color: '#ffffff',
        backgroundColor: '#00000000',
        size: text.length === 1 ? 72 : 48, // Larger size for emojis
        scale: 1,
        rotation: 0,
        bold: false,
        shadow: false,
        border: false
      },
      position: position || { x: 200, y: 150 }
    };
    setTextElements(prev => [...prev, newTextElement]);
    setSelectedTextId(newId);
  }, []);

  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  const deleteTextElement = useCallback((id: string) => {
    if (textElements.length > 1) {
      setTextElements(prev => prev.filter(el => el.id !== id));
      if (selectedTextId === id) {
        const remaining = textElements.filter(el => el.id !== id);
        setSelectedTextId(remaining[0]?.id || '');
      }
    }
  }, [textElements, selectedTextId]);

  const getSelectedTextElement = useCallback(() => {
    return textElements.find(el => el.id === selectedTextId);
  }, [textElements, selectedTextId]);

  return {
    textElements,
    selectedTextId,
    setSelectedTextId,
    addTextElement,
    updateTextElement,
    deleteTextElement,
    getSelectedTextElement
  };
}