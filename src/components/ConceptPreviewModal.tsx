import React, { useState, useRef, useCallback } from 'react';
import {
  ConceptPreviewScene,
  SPONSORED_STARTER_KITS,
  CONCEPT_PREVIEW_SCENES,
  STARTER_KIT_AFTER_IMAGES,
} from '../assets/starterKits';
import {
  Sparkles,
  ThumbsUp,
  MapPin,
  Thermometer,
  Shield,
  Sun,
  X,
  Share2,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ConceptPreviewModalProps {
  scene?: ConceptPreviewScene | null;
  proposalId?: string;
  onClose: () => void;
  onVote?: (id: string) => void;
  onDeployKit?: (kitId: string) => void;
}

export const ConceptPreviewModal: React.FC<ConceptPreviewModalProps> = ({
  scene: propScene,
  proposalId,
  onClose,
  onVote,
  onDeployKit,
}) => {
  // Resolve scene
  const scene: ConceptPreviewScene =
    propScene ||
    (proposalId && CONCEPT_PREVIEW_SCENES[proposalId]) ||
    CONCEPT_PREVIEW_SCENES['prop-1'];

  const starterKit = SPONSORED_STARTER_KITS[scene.starterKitId] || SPONSORED_STARTER_KITS.vertical_green;

  // Comparison slider position (percentage 0 to 100)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voteCount, setVoteCount] = useState<number>(scene.upvotes || 48);

  const containerRef = useRef<HTMLDivElement>(null);

  // Update slider position from clientX
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleVote = () => {
    if (hasVoted) return;
    setHasVoted(true);
    setVoteCount((prev) => prev + 1);
    onVote?.(scene.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in select-none"
      onPointerUp={handlePointerUp}
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border border-slate-700/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 text-white max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer z-20"
          title="Close AI Concept Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header from Image 2 */}
        <div className="mb-4 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Urban Shade Concept Preview</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            AI previews show residents what their street could become, and they vote
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-semibold text-white">{scene.streetName}</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{scene.streetNameZh}</span>
          </div>
        </div>

        {/* =========================================================================
            Interactive BEFORE vs AFTER Concept Comparison Slider (Matching Image 2)
           ========================================================================= */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 mb-3">
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] cursor-ew-resize overflow-hidden touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          >
            {/* 1. AFTER Image Layer (Full base) */}
            <img
              src={scene.afterVisualSvg || STARTER_KIT_AFTER_IMAGES[scene.starterKitId] || `/starter_kits/${scene.starterKitId}.jpg`}
              alt={`AFTER - Concept Preview of Shaded ${starterKit.title}`}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* 2. BEFORE Image Layer (Clipped to sliderPos width) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={scene.beforeVisualSvg || '/starter_kits/before_sun.jpg'}
                alt="BEFORE - Harsh Sunlit Taiwanese Street Heat Trap"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* 3. Badges (Matching Image 2 exactly) */}
            {/* BEFORE Badge on Top Left */}
            <div className="absolute top-3 left-3 pointer-events-none">
              <span className="px-3 py-1 bg-[#0b3323] text-white text-xs sm:text-sm font-black tracking-wider uppercase rounded-md shadow-lg border border-emerald-500/40">
                BEFORE
              </span>
            </div>

            {/* AFTER · CONCEPT PREVIEW Badge on Top Right */}
            <div className="absolute top-3 right-3 pointer-events-none">
              <span className="px-3 py-1 bg-[#d97706] text-white text-xs sm:text-sm font-black tracking-wider uppercase rounded-md shadow-lg border border-amber-300/40">
                AFTER · CONCEPT PREVIEW
              </span>
            </div>

            {/* 4. Draggable Divider Line & Circular Dot Handle (Matching Image 2) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none z-10"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Center White Dot Handle */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-2xl border-2 border-slate-900 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Bottom Floating Hint */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-medium pointer-events-none shadow-md">
              Drag left/right to compare Before &amp; After
            </div>
          </div>
        </div>

        {/* Quick Slider Presets */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Quick View:</span>
            <button
              onClick={() => setSliderPos(100)}
              className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                sliderPos === 100
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              Before Sun
            </button>
            <button
              onClick={() => setSliderPos(50)}
              className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                sliderPos === 50
                  ? 'bg-purple-950 border-purple-500 text-purple-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              50 / 50 Split
            </button>
            <button
              onClick={() => setSliderPos(0)}
              className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                sliderPos === 0
                  ? 'bg-amber-950 border-amber-500 text-amber-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              After Concept
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Revealed: {Math.round(sliderPos)}% Before / {Math.round(100 - sliderPos)}% After
          </div>
        </div>

        {/* Official Disclaimer Caption from Image 2 */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 mb-4 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">
              Votes on previews flag priority streets for kits.
            </span>{' '}
            Each image is labelled a concept preview and kept separate from calculated shade estimates.
          </div>
        </div>

        {/* Microclimate Impact Metrics */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {/* Metric 1: Surface Temp */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>Surface Heat</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm line-through text-rose-400 font-mono">
                {scene.beforeTemp}°C
              </span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span className="text-base sm:text-lg font-black text-emerald-300 font-mono">
                {scene.afterTemp}°C
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              -{(scene.beforeTemp - scene.afterTemp).toFixed(1)}°C Cooler
            </div>
          </div>

          {/* Metric 2: Pedestrian Shade Ratio */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Shade Ratio</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm line-through text-slate-400 font-mono">
                {scene.beforeShade}%
              </span>
              <ArrowRight className="w-3 h-3 text-purple-400" />
              <span className="text-base sm:text-lg font-black text-purple-300 font-mono">
                {scene.afterShade}%
              </span>
            </div>
            <div className="text-[10px] text-purple-400 font-semibold mt-0.5">
              +{scene.afterShade - scene.beforeShade}% Continuous Cover
            </div>
          </div>

          {/* Metric 3: UV Radiation */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Solar UV Index</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm line-through text-amber-400 font-mono">
                {scene.uvIndexBefore}
              </span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span className="text-base sm:text-lg font-black text-emerald-300 font-mono">
                {scene.uvIndexAfter}
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              Extreme ➔ Safe Low
            </div>
          </div>
        </div>

        {/* Starter Kit Specification Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-purple-950/40 border border-emerald-500/30 mb-5 flex items-start gap-3">
          <img
            src={starterKit.imageUrl}
            alt={starterKit.title}
            className="w-16 h-16 rounded-xl object-cover border border-emerald-500/40 shrink-0 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate">
                {starterKit.title} ({starterKit.titleZh})
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-500/40 shrink-0">
                {starterKit.coolingImpact}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              {starterKit.description}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
              <span>🤝 {starterKit.partnerType}</span>
              <span>•</span>
              <span className="text-slate-300 font-medium">💰 {starterKit.estimatedCost}</span>
            </div>
          </div>
        </div>

        {/* Voting & Action Controls */}
        <div className="flex items-center gap-3">
          {/* Primary Vote Button */}
          <button
            onClick={handleVote}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-xl ${
              hasVoted
                ? 'bg-emerald-600 text-white shadow-emerald-950/60'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60'
            }`}
          >
            {hasVoted ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Voted! Priority Flagged ({voteCount} Votes)</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-5 h-5 text-amber-200" />
                <span>Vote to Prioritize this Kit ({voteCount} Votes)</span>
              </>
            )}
          </button>

          {/* Close / Return */}
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700"
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
};
