"use client";

import { useEffect, useMemo, useState, useRef, useCallback, startTransition } from "react";
import Image from "next/image";
import { useMemeGeneration } from "../hooks/useMemeGeneration";
import { useTemplates } from "../hooks/useTemplates";
import { useMinting } from "../hooks/useMinting";
import { shareToImgbb, downloadMeme } from "../utils/memeSharing";
import { useAccount } from 'wagmi';

interface MemeGeneratorProps {
  onShowAdminDashboard: () => void;
}

const sanitizeSegment = (text: string) => {
  if (!text) return "_";
  return text
    .replace(/_/g, "__")
    .replace(/-/g, "--")
    .replace(/\s+/g, "_")
    .replace(/\?/g, "~q")
    .replace(/%/g, "~p")
    .replace(/#/g, "~h")
    .replace(/\//g, "~s");
};

const buildPreviewUrl = (
  templateId: string,
  texts: string[],
  extension: "png" | "jpg" | "gif",
  font: string,
  textColor: string
) => {
  const segments = (texts.length ? texts : ["", ""]).map(sanitizeSegment);
  const path = segments.join("/");
  const params = new URLSearchParams();
  if (font) params.set("font", font);
  if (textColor) params.set("color", textColor);
  const query = params.toString();
  return `https://api.memegen.link/images/${templateId}/${path}.${extension}${
    query ? `?${query}` : ""
  }`;
};

export default function MemeGenerator({ onShowAdminDashboard: _ }: MemeGeneratorProps) {
  const [_isMobile, setIsMobile] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollTemplates = (direction: 'left' | 'right') => {
    if (templatesRef.current) {
      const scrollAmount = 200;
      const currentScroll = templatesRef.current.scrollLeft;
      const newScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      templatesRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const {
    generatedMeme,
    permanentMemeUrl,
    loading,
    waitingForConfirmation,
    generate,
    resetGeneration
  } = useMemeGeneration();

  const { templates, selectedTemplate, setSelectedTemplate } = useTemplates();

  const { address } = useAccount();
  const lastSavedRef = useRef<string | null>(null);
  const prevConfirmedRef = useRef(false);

  const { startMinting, resetMinting, isTransactionConfirmed } = useMinting();

  const [texts, setTexts] = useState<string[]>(["", ""]);
  const [font, setFont] = useState("impact");
  const [textColor, setTextColor] = useState("");
  const [extension, setExtension] = useState<"png" | "jpg" | "gif">("png");
  const [showTools, setShowTools] = useState(false);
  const [showShareDownload, setShowShareDownload] = useState(false);

  useEffect(() => {
    if (!selectedTemplate) return;
    const lines = Math.max(selectedTemplate.lines ?? 2, 1);
    setTexts(prev => Array.from({ length: lines }, (_, index) => prev[index] ?? ""));
  }, [selectedTemplate]);

  useEffect(() => {
    if (isTransactionConfirmed && !prevConfirmedRef.current) {
      setShowShareDownload(true);

      // Attempt to save the generated meme once to the DB
      (async () => {
        try {
          const urlToSave = permanentMemeUrl || generatedMeme;
          if (!urlToSave || !address) return;

          // avoid duplicate saves for same URL
          if (lastSavedRef.current === urlToSave) return;
          lastSavedRef.current = urlToSave;

          const title = `${selectedTemplate?.name || 'Meme'}${texts && texts.length ? ' - ' + texts.join(' | ') : ''}`;

          await fetch('/api/memes/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: address.toLowerCase(), imageUrl: urlToSave, title })
          });
        } catch (err) {
          console.error('Failed to save generated meme:', err);
        }
      })();
    }
    prevConfirmedRef.current = isTransactionConfirmed;
  }, [isTransactionConfirmed, permanentMemeUrl, generatedMeme, address, selectedTemplate, texts]);

  // Debounced preview tick prevents recomputing a new URL on every keystroke
  const [previewTick, setPreviewTick] = useState<number>(Date.now());
  useEffect(() => {
    // wait a short time after the last change before updating cache-buster
    const id = setTimeout(() => setPreviewTick(Date.now()), 250);
    return () => clearTimeout(id);
  }, [selectedTemplate?.id, texts, extension, font, textColor]);

  const previewUrl = useMemo(() => {
    if (!selectedTemplate) return null;
    const baseUrl = buildPreviewUrl(selectedTemplate.id, texts, extension, font, textColor);
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}t=${previewTick}`;
  }, [selectedTemplate, texts, extension, font, textColor, previewTick]);

  const handleTextChange = useCallback((index: number, value: string) => {
    // mark this update as non-urgent to avoid blocking rendering (helps INP)
    startTransition(() => {
      setTexts(prev => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    });
  }, []);

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    setShowShareDownload(false);
    // reset saved flag for this generation
    lastSavedRef.current = null;
    generate(selectedTemplate, texts, startMinting, {
      font,
      textColor,
      extension
    });
  };

  const handleShare = () => {
    if (permanentMemeUrl) {
      shareToImgbb(permanentMemeUrl);
    }
  };

  const handleDownload = () => {
    if (generatedMeme) {
      downloadMeme(generatedMeme);
    }
  };

  const selectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setSelectedTemplate(template);
    resetMinting();
    resetGeneration();
    setShowShareDownload(false);
  };

  const displayImageUrl = generatedMeme ?? (texts.some(t => t.trim()) ? previewUrl : selectedTemplate?.url) ?? null;

  return (
    <div className="w-full max-w-[700px] mx-auto bg-[rgba(18,18,18,0.95)] border border-blue-400/20 rounded-xl backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[calc(100vh-10px)] max-h-[calc(100vh-10px)]">
      {/* Header */}
      <div className="p-4 pb-0 border-b border-blue-400/10">
        <h1 className="text-xl font-bold bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent m-0 text-center">MemeMint – Create Meme</h1>
      </div>

      {/* Preview Section */}
      <section className="p-4 flex flex-col gap-2">
        <div className="flex justify-center items-center bg-white/2 rounded-lg p-2 min-h-[250px]">
          <div className="relative w-full h-full min-h-[200px]">
            {displayImageUrl ? (
              <Image
                src={displayImageUrl}
                alt={selectedTemplate?.name || "Meme preview"}
                fill
                style={{
                  objectFit: "contain"
                }}
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <span>Select a template to start</span>
              </div>
            )}
          </div>
        </div>

        {selectedTemplate && (
          <div className="flex justify-between items-center text-sm text-gray-300">
            <span className="font-medium">{selectedTemplate.name}</span>
            <span className="text-gray-400">
              {selectedTemplate.width}×{selectedTemplate.height}
            </span>
          </div>
        )}
      </section>

      {/* Controls Section */}
      <section className="flex-1 px-4 pb-4 flex flex-col gap-4 overflow-y-auto">
        {/* Template Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Template</label>

          <div className="relative flex items-center">
            <button
              type="button"
              className="absolute left-0 z-10 bg-gray-800/80 hover:bg-gray-700/80 text-white px-2 py-1 rounded border border-gray-600/50 hover:border-gray-500/50 transition-colors"
              onClick={() => scrollTemplates('left')}
              aria-label="Scroll templates left"
            >
              ◀
            </button>

            <div className="flex-1 mx-8 overflow-x-auto scrollbar-hide" ref={templatesRef}>
              <div className="flex gap-2 pb-2">
                {templates.map((template, index) => (
                  <button
                    type="button"
                    key={`${template.id}-${index}`}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-400 shadow-lg shadow-blue-400/20'
                        : 'border-gray-600/50 hover:border-gray-500/50'
                    }`}
                    onClick={() => selectTemplate(template.id)}
                  >
                    <div className="w-full h-full relative">
                      <Image
                        src={template.url}
                        alt={template.name}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                      {template.name.length > 12 ? `${template.name.substring(0, 12)}...` : template.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="absolute right-0 z-10 bg-gray-800/80 hover:bg-gray-700/80 text-white px-2 py-1 rounded border border-gray-600/50 hover:border-gray-500/50 transition-colors"
              onClick={() => scrollTemplates('right')}
              aria-label="Scroll templates right"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Captions */}
        <div className="flex items-end gap-2">
          {texts.map((text, index) => (
            <div key={index} className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {index === 0 ? "Top text" : "Bottom text"}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-800/80 border border-blue-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/25"
                placeholder={`Enter ${index === 0 ? "top" : "bottom"} text`}
                value={text}
                onChange={event => handleTextChange(index, event.target.value)}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <div className="h-[18px]"></div> {/* Spacer to align with label height */}
            <button
              type="button"
              className="px-3 py-2 bg-gray-700/80 hover:bg-gray-600/80 text-white rounded-lg border border-gray-600/50 hover:border-gray-500/50 transition-colors text-sm font-medium h-[42px] flex items-center justify-center"
              onClick={() => setShowTools(!showTools)}
            >
              ⚙️ Tools
            </button>
          </div>
        </div>

        {/* Tools Modal */}
          {showTools && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTools(false)}>
              <div className="bg-gray-900/95 border border-blue-400/20 rounded-xl backdrop-blur-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-blue-400/10">
                  <h4 className="text-lg font-bold text-white m-0">Meme Settings</h4>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white text-xl leading-none"
                    onClick={() => setShowTools(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Font</label>
                    <select
                      className="w-full px-3 py-2 bg-gray-800/80 border border-blue-400/20 rounded-lg text-white focus:outline-none focus:border-blue-400/50"
                      value={font}
                      onChange={event => setFont(event.target.value)}
                    >
                      <option value="impact">Impact</option>
                      <option value="anton">Anton</option>
                      <option value="arial">Arial</option>
                      <option value="comic-sans">Comic Sans</option>
                      <option value="times">Times</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Format</label>
                    <select
                      className="w-full px-3 py-2 bg-gray-800/80 border border-blue-400/20 rounded-lg text-white focus:outline-none focus:border-blue-400/50"
                      value={extension}
                      onChange={event => setExtension(event.target.value as "png" | "jpg" | "gif")}
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="gif">GIF</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Text Color</label>
                    <input
                      type="color"
                      className="w-full h-10 bg-gray-800/80 border border-blue-400/20 rounded-lg cursor-pointer"
                      value={textColor || "#ffffff"}
                      onChange={event => setTextColor(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Mint Bar */}
        <div className="mt-auto pt-4 border-t border-blue-400/10">
          <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
            {selectedTemplate ? (
              <span>
                {selectedTemplate.width}×{selectedTemplate.height} · {extension.toUpperCase()} · Network: Base
              </span>
            ) : (
              <span>Select a template to begin</span>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={handleGenerate}
              disabled={loading || waitingForConfirmation}
            >
              {loading ? "Generating..." : waitingForConfirmation ? "Confirming..." : "Generate Meme"}
            </button>
          </div>
        </div>
      </section>

      {/* Share/Download Popup */}
      {showShareDownload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShareDownload(false)}>
          <div className="relative bg-gray-900/95 border border-blue-400/20 rounded-xl backdrop-blur-xl shadow-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowShareDownload(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl leading-none transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="p-4 text-center">
              <h3 className="text-lg font-bold text-white mb-2">🎉 Meme Generated!</h3>
              <p className="text-gray-300 mb-4">Your meme has been successfully generated. You can now share or download it.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  🔄 Recast
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}