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
  const templatesRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLElement>(null);
  const baselineViewportHeightRef = useRef<number | null>(null);

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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport ?? null;
    const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? true;

    const isTextInput = (el: Element | null) => {
      if (!el) return false;
      const element = el as HTMLElement;
      const tag = element.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return true;
      return element.isContentEditable;
    };

    const update = () => {
      const height = vv?.height ?? window.innerHeight;
      if (!Number.isFinite(height)) return;
      const roundedHeight = Math.round(height);
      const active = typeof document !== "undefined" ? document.activeElement : null;
      const focusedTextInput = isTextInput(active);

      if (!baselineViewportHeightRef.current || !focusedTextInput) {
        baselineViewportHeightRef.current = roundedHeight;
      }

      const baseline = baselineViewportHeightRef.current ?? roundedHeight;
      setViewportHeight(baseline);

      const heightDiff = baseline - roundedHeight;
      const keyboardLikely = heightDiff > 80;
      setIsKeyboardOpen(isCoarsePointer && focusedTextInput && (keyboardLikely || !vv));
    };

    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.addEventListener("focusin", update);
    const onFocusOut = () => setTimeout(update, 50);
    window.addEventListener("focusout", onFocusOut);

    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("focusin", update);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, []);

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

  const handleInputFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    requestAnimationFrame(() => {
      try {
        target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      } catch {
        // ignore
      }

      const container = controlsRef.current;
      if (!container) return;
      const rect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const delta = rect.bottom - containerRect.bottom + 16;
      if (delta > 0) container.scrollTop += delta;
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
    <div
      className="w-full max-w-[700px] mx-auto mm-card mm-card-strong overflow-hidden flex flex-col min-h-[calc(100svh-10px)] max-h-[calc(100svh-10px)]"
      style={
        viewportHeight
          ? {
              height: `${Math.max(320, viewportHeight - 10)}px`,
              minHeight: `${Math.max(320, viewportHeight - 10)}px`,
              maxHeight: `${Math.max(320, viewportHeight - 10)}px`,
            }
          : undefined
      }
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b" style={{ borderColor: "var(--mm-border)" }}>
        <h1 className="text-lg md:text-xl font-extrabold m-0 text-center">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, var(--mm-text), var(--mm-accent), var(--mm-accent-2))" }}
          >
            Create Meme
          </span>
        </h1>
      </div>

      {/* Preview Section */}
      <section className="p-4 flex flex-col gap-2">
        <div className="flex justify-center items-center rounded-xl p-2 md:min-h-[250px]" style={{ background: "var(--mm-surface)" }}>
          <div className="relative w-full h-full min-h-[220px] md:min-h-[240px]">
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
              <div className="flex flex-col items-center justify-center w-full h-full text-center px-6" style={{ color: "var(--mm-muted)" }}>
                <div className="text-sm font-semibold">Pick a template to start</div>
                <div className="mt-1 text-xs" style={{ color: "var(--mm-faint)" }}>
                  Then add your text and generate.
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedTemplate && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold" style={{ color: "var(--mm-text)" }}>{selectedTemplate.name}</span>
            <span style={{ color: "var(--mm-faint)" }}>
              {selectedTemplate.width}×{selectedTemplate.height}
            </span>
          </div>
        )}
      </section>

      {/* Controls Section */}
      <section
        ref={controlsRef}
        className="flex-1 px-4 pb-6 md:pb-4 flex flex-col gap-4 overflow-y-auto"
      >
        {/* Template Selection */}
        <div className="flex flex-col gap-2">
          <div className="relative flex items-center">
            <button
              type="button"
              className="hidden md:inline-flex absolute left-0 z-10 px-2 py-1 rounded-xl border transition-colors"
              style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)", color: "var(--mm-text)" }}
              onClick={() => scrollTemplates('left')}
              aria-label="Scroll templates left"
            >
              ◀
            </button>

            <div className="flex-1 md:mx-10 overflow-x-auto scrollbar-hide snap-x snap-mandatory" ref={templatesRef}>
              <div className="flex gap-3 pb-2">
                {templates.map((template, index) => (
                  <button
                    type="button"
                    key={`${template.id}-${index}`}
                    className={`relative snap-start flex-shrink-0 w-[96px] h-[76px] md:w-20 md:h-16 rounded-xl border overflow-hidden transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'shadow-lg'
                        : ''
                    }`}
                    style={{
                      borderColor:
                        selectedTemplate?.id === template.id ? "color-mix(in oklab, var(--mm-accent) 60%, var(--mm-border))" : "var(--mm-border)",
                      boxShadow: selectedTemplate?.id === template.id ? "0 14px 38px rgba(0,0,0,0.22)" : undefined,
                    }}
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
              className="hidden md:inline-flex absolute right-0 z-10 px-2 py-1 rounded-xl border transition-colors"
              style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)", color: "var(--mm-text)" }}
              onClick={() => scrollTemplates('right')}
              aria-label="Scroll templates right"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Captions */}
        <div className="grid grid-cols-[1fr_1fr_auto] md:grid-cols-[1fr_1fr_auto] gap-2 items-end">
          {texts.map((text, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1 ${index >= 2 ? "col-span-3" : ""}`}
            >
              <label
                className="text-[9px] leading-none font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--mm-faint)" }}
              >
                {index === 0 ? "Top text" : index === 1 ? "Bottom text" : `Text ${index + 1}`}
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 py-2 rounded-xl border focus:outline-none"
                style={{
                  background: "var(--mm-surface)",
                  borderColor: "var(--mm-border)",
                  color: "var(--mm-text)",
                }}
                placeholder={`Enter ${index === 0 ? "top" : index === 1 ? "bottom" : "text"}…`}
                value={text}
                onChange={event => handleTextChange(index, event.target.value)}
                onFocus={handleInputFocus}
              />
            </div>
          ))}
          <button
            type="button"
            className="mm-control w-10 h-10"
            onClick={() => setShowTools(true)}
            aria-label="Open tools"
            title="Tools"
          >
            ⚙️
          </button>
        </div>

        {/* Tools Modal */}
          {showTools && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-3 md:p-4" onClick={() => setShowTools(false)}>
              <div
                className="mm-card mm-card-strong w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl md:rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: "var(--mm-border)" }}>
                  <h4 className="text-lg font-extrabold m-0" style={{ color: "var(--mm-text)" }}>Meme Settings</h4>
                  <button
                    type="button"
                    className="text-xl leading-none"
                    style={{ color: "var(--mm-muted)" }}
                    onClick={() => setShowTools(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold" style={{ color: "var(--mm-muted)" }}>Font</label>
                    <select
                      className="w-full px-3 py-3 rounded-xl border focus:outline-none"
                      style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)", color: "var(--mm-text)" }}
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
                    <label className="text-sm font-semibold" style={{ color: "var(--mm-muted)" }}>Format</label>
                    <select
                      className="w-full px-3 py-3 rounded-xl border focus:outline-none"
                      style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)", color: "var(--mm-text)" }}
                      value={extension}
                      onChange={event => setExtension(event.target.value as "png" | "jpg" | "gif")}
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="gif">GIF</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold" style={{ color: "var(--mm-muted)" }}>Text Color</label>
                    <input
                      type="color"
                      className="w-full h-12 rounded-xl cursor-pointer border"
                      style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)" }}
                      value={textColor || "#ffffff"}
                      onChange={event => setTextColor(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Desktop Mint Bar */}
        <div className="hidden md:block mt-auto pt-4" style={{ borderColor: "var(--mm-border)" }}>
          <div className="flex justify-between items-center text-sm mb-3" style={{ color: "var(--mm-faint)" }}>
            {selectedTemplate ? (
              <span>
                {selectedTemplate.width}×{selectedTemplate.height} · {extension.toUpperCase()} · Network: Base
              </span>
                ) : null}
              </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-[var(--mm-accent)] to-[var(--mm-accent-2)] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={handleGenerate}
              disabled={loading || waitingForConfirmation || !selectedTemplate}
            >
              {loading ? "Generating..." : waitingForConfirmation ? "Confirming..." : "Generate Meme"}
            </button>
          </div>
        </div>
      </section>

      {/* Mobile action bar (non-sticky) */}
      <div className={`md:hidden px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] border-t ${isKeyboardOpen ? "hidden" : ""}`}>
        <div className="flex items-center justify-between text-[11px] mb-2" style={{ color: "var(--mm-faint)" }}>
          {selectedTemplate ? (
            <span className="truncate pr-3">
              {selectedTemplate.name} · {extension.toUpperCase()}
            </span>
          ) : (
            <span className="truncate pr-3">Select a template</span>
          )}
          <span className="shrink-0">Base</span>
        </div>
        <button
          type="button"
          className="w-full py-3 bg-gradient-to-r from-[var(--mm-accent)] to-[var(--mm-accent-2)] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGenerate}
          disabled={loading || waitingForConfirmation || !selectedTemplate}
        >
          {loading ? "Generating..." : waitingForConfirmation ? "Confirming..." : "Generate Meme"}
        </button>
      </div>

      {/* Share/Download Popup */}
      {showShareDownload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShareDownload(false)}>
          <div
            className="relative mm-card mm-card-strong rounded-2xl shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowShareDownload(false)}
              className="absolute top-3 right-3 text-xl leading-none transition-colors"
              style={{ color: "var(--mm-muted)" }}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="p-4 text-center">
              <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--mm-text)" }}>
                Meme generated
              </h3>
              <p className="mb-4" style={{ color: "var(--mm-muted)" }}>
                Share it or download it to your device.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 px-4 py-2 rounded-xl transition-colors text-white"
                  style={{ background: "color-mix(in oklab, var(--mm-accent) 75%, black)" }}
                >
                  Recast
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 rounded-xl transition-colors text-white"
                  style={{ background: "color-mix(in oklab, var(--mm-accent-2) 75%, black)" }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
