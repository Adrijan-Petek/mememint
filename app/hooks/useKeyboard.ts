"use client";
import { useEffect } from "react";

interface UseKeyboardOptions {
  onDelete?: (selectedId: string | null) => void;
  selectedId?: string | null;
  isEditing?: boolean;
}

export function useKeyboard({ onDelete, selectedId, isEditing }: UseKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId && !isEditing && onDelete) {
        onDelete(selectedId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, isEditing, onDelete]);
}