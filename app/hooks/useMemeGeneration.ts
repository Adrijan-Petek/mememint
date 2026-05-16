"use client";
import { useState } from "react";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  lines?: number;
}

interface GenerateOptions {
  font?: string;
  textColor?: string;
  extension?: 'png' | 'jpg' | 'gif';
  style?: string;
}

const sanitizeTexts = (texts: string[]) =>
  texts.map(text => text?.trim() || "");

export function useMemeGeneration() {
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [permanentMemeUrl, setPermanentMemeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  const generate = async (
    selectedTemplate: MemeTemplate | null,
    texts: string[],
    onMintTrigger: () => void,
    options?: GenerateOptions
  ) => {
    if (!selectedTemplate) return;

    setGeneratedMeme(null);
    setPermanentMemeUrl(null);
    setWaitingForConfirmation(false);
    setLoading(true);

    try {
      const requestBody = {
        templateId: selectedTemplate.id,
        texts: sanitizeTexts(texts),
        font: options?.font,
        textColor: options?.textColor,
        extension: options?.extension ?? 'png',
        style: options?.style
      };

      console.log('Sending to generate API:', requestBody);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to generate meme');
      }

      const memeUrl = data.data?.url as string | undefined;

      if (!memeUrl) {
        throw new Error('Memegen response missing URL');
      }

      setGeneratedMeme(memeUrl);
      
      // Upload to ImgBB for permanent hosting
      console.log('📤 Uploading meme to ImgBB for permanent storage...');
      try {
        // Fetch the meme image from Memegen
        const imageResponse = await fetch(memeUrl);
        const imageBlob = await imageResponse.blob();
        
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageBlob);
        });
        const imageData = await base64Promise;
        
        // Upload to ImgBB via our API
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageData,
            fileName: `mememint-${selectedTemplate.id}-${Date.now()}`
          })
        });
        
        const uploadData = await uploadResponse.json();
        
        if (uploadData.success && uploadData.shareUrl) {
          console.log('✅ Meme uploaded to ImgBB:', uploadData.shareUrl);
          setPermanentMemeUrl(uploadData.shareUrl);
        } else {
          console.warn('⚠️ ImgBB upload failed, using Memegen URL:', uploadData.error);
          setPermanentMemeUrl(memeUrl);
        }
      } catch (uploadError) {
        console.warn('⚠️ ImgBB upload error, using Memegen URL:', uploadError);
        setPermanentMemeUrl(memeUrl);
      }
      
      setWaitingForConfirmation(true);
      onMintTrigger();
    } catch (error) {
      console.error('Error generating meme:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate meme: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetGeneration = () => {
    setGeneratedMeme(null);
    setPermanentMemeUrl(null);
    setLoading(false);
    setWaitingForConfirmation(false);
  };

  return {
    generatedMeme,
    permanentMemeUrl,
    loading,
    waitingForConfirmation,
    setWaitingForConfirmation,
    generate,
    resetGeneration
  };
}