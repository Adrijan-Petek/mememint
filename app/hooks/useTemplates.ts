"use client";
import { useState, useEffect } from "react";
import { fetchMemes } from "../utils/memeApi";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  lines?: number;
  styles?: string[];
}

export function useTemplates() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);

  // Load memes on mount
  useEffect(() => {
    const loadMemes = async () => {
      const memes = await fetchMemes();
      setTemplates(memes);
    };
    loadMemes();
  }, []);

  return {
    templates,
    selectedTemplate,
    setSelectedTemplate
  };
}