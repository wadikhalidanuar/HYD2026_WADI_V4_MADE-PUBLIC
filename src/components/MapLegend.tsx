import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface MapLegendProps {
  showArcadeLayer: boolean;
  showCanopyLayer: boolean;
  showProposalsLayer: boolean;
  showShadowVectors: boolean;
  showTreeInventoryLayer?: boolean;
  showThermalHeatLayer?: boolean;
  showCoolingOutlets?: boolean;
  onToggleArcade: (val: boolean) => void;
  onToggleCanopy: (val: boolean) => void;
  onToggleProposals: (val: boolean) => void;
  onToggleShadows: (val: boolean) => void;
  onToggleTrees?: (val: boolean) => void;
  onToggleThermal?: (val: boolean) => void;
  onToggleCoolingOutlets?: (val: boolean) => void;
  onOpenManual?: () => void;
  onOpenRewards?: () => void;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  showArcadeLayer,
  showCanopyLayer,
  showProposalsLayer,
  showShadowVectors,
  showTreeInventoryLayer = true,
  showThermalHeatLayer = false,
  showCoolingOutlets = true,
  onToggleArcade,
  onToggleCanopy,
  onToggleProposals,
  onToggleShadows,
  onToggleTrees,
  onToggleThermal,
  onToggleCoolingOutlets,
  onOpenManual,
  onOpenRewards,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Quick preset: Only show the 1 line from A to B
  const isOnlyRoute =
    !showArcadeLayer &&
    !showCanopyLayer &&
    !showShadowVectors &&
    !showProposalsLayer &&
    !showTreeInventoryLayer &&
    !showThermalHeatLayer;

  const handleOnlyRoute = () => {
    onToggleArcade(false);
    onToggleCanopy(false);
    onToggleShadows(false);
    onToggleProposals(false);
    onToggleTrees?.(false);
    onToggleThermal?.(false);
  };

  const handleShowAll = () => {
    onToggleArcade(true);
    onToggleCanopy(true);
    onToggleShadows(true);
    onToggleProposals(true);
    onToggleTrees?.(true);
    onToggleThermal?.(true);
  };

  return (
    <div className="pointer-events-auto">
      {/* Floating Toggle Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/95 hover:bg-slate-800 text-slate-200 rounded-full border border-slate-700 shadow-xl text-xs font-semibold backdrop-blur-md cursor-pointer transition active:scale-95 group"
          title="What do the colors and shapes mean on this map?"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Map Key / Legend</span>
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Expanded Legend Card */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 left-3 right-3 sm:right-auto sm:w-80 bg-slate-900/98 backdrop-blur-lg border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl z-40 max-h-[80vh] overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🗺️</span>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Map Guide & Symbols
                </h3>
                <p className="text-[10px] text-slate-400">
                  What every line and color means in Taichung
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={handleOnlyRoute}
              className={`flex-1 py-1 px-2 rounded-lg border font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                isOnlyRoute
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Route Only (1 Line)</span>
            </button>
            <button
              onClick={handleShowAll}
              className={`flex-1 py-1 px-2 rounded-lg border font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                !isOnlyRoute
                  ? 'bg-purple-900/80 border-purple-500 text-purple-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>All Shade Data</span>
            </button>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 text-xs">
            {/* 1. Color-Coded Route Segments by Shade % */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="font-bold text-slate-200 text-[11px] flex items-center justify-between">
                <span>Color-Coded Route Shade (路徑遮陽即時分級)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">Live Guidance</span>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center gap-2 bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/50">
                  <div className="w-4 h-2 bg-emerald-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-emerald-200">
                    <b>Green (綠色):</b> Very Good Shade (75–100% 深度蔭涼 • 騎樓/樹冠全防護)
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-amber-950/60 p-2 rounded-xl border border-amber-800/50">
                  <div className="w-4 h-2 bg-amber-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <span className="text-amber-200">
                    <b>Yellow / Amber (黃色):</b> Partial Shade (40–74% 建築陰影 • 溫和日照)
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-rose-950/70 p-2 rounded-xl border border-rose-800/60 animate-pulse">
                  <div className="w-4 h-2 border-2 border-dashed border-rose-500 rounded shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  <span className="text-rose-200">
                    <b>Red Dashes (紅色):</b> CRITICAL NO SHADE (0–39% 烈日無遮暴曬 • 極度危險)
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Green Polygon */}
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="mt-1 w-6 h-5 rounded border border-emerald-400 bg-emerald-700/35 flex items-center justify-center text-[10px] shrink-0">
                  🌳
                </div>
                <div>
                  <div className="font-bold text-emerald-300 text-[11px]">
                    Green Polygons (樹冠覆蓋區)
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    <b>Tree Canopy Zones</b>: Taichung's lush greenways & parks (e.g. Calligraphy Greenway, Taichung Park) where dense tree leaves block 75–90% of sunlight and keep you cool.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showCanopyLayer}
                onChange={(e) => onToggleCanopy(e.target.checked)}
                className="mt-1.5 accent-emerald-500 rounded cursor-pointer"
                title="Toggle Green Tree Canopy layer"
              />
            </div>

            {/* 3. Purple Lines */}
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="mt-1 flex items-center justify-center w-6 h-1.5 bg-purple-400 rounded-full shrink-0"></div>
                <div>
                  <div className="font-bold text-purple-300 text-[11px]">
                    Purple Lines (騎樓 / 亭仔腳)
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    <b>Covered Arcades (Qilou)</b>: Taiwan's iconic covered pedestrian walkways under building overhangs offering 95% roof shade.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showArcadeLayer}
                onChange={(e) => onToggleArcade(e.target.checked)}
                className="mt-1.5 accent-purple-500 rounded cursor-pointer"
                title="Toggle Covered Arcades layer"
              />
            </div>

            {/* 4. Street Building Shadows */}
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="mt-1 w-6 h-4 bg-sky-950/80 rounded border border-sky-400/40 shrink-0 flex items-center justify-center text-[9px]">
                  🏢
                </div>
                <div>
                  <div className="font-bold text-sky-300 text-[11px]">
                    Building Shade Corridors (高樓街區陰影)
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    <b>Live Solar Calculations</b>: Building shadows are calculated from live Taichung sun azimuth/altitude and incorporated directly into your safe walking route. No confusing black polygon blocks!
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Colored Proposal Pins */}
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-rose-500 flex items-center justify-center text-xs shrink-0">
                  ☂️
                </div>
                <div>
                  <div className="font-bold text-rose-300 text-[11px]">
                    Pins with Umbrella / Tree (遮陽提議)
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    <b>Community Shade Proposals</b>: Places where walkers noticed zero shade and suggested a pedestrian roof, tree planting, or shade cloth.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showProposalsLayer}
                onChange={(e) => onToggleProposals(e.target.checked)}
                className="mt-1.5 accent-rose-500 rounded cursor-pointer"
                title="Toggle Community Proposals layer"
              />
            </div>

            {/* 6. Urban Tree Inventory Layer (Taichung_XitunBeitun_Tree.csv) */}
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xs shrink-0">
                  🌳
                </div>
                <div>
                  <div className="font-bold text-emerald-300 text-[11px]">
                    Tree Inventory Pins (行道樹普查 60+ 棵)
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    <b>Taichung_XitunBeitun_Tree.csv</b>: Geocoded street trees with canopy diameter, shade area, and CO₂ offset data from the repository survey.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showTreeInventoryLayer}
                onChange={(e) => onToggleTrees?.(e.target.checked)}
                className="mt-1.5 accent-emerald-500 rounded cursor-pointer"
                title="Toggle Tree Inventory layer"
              />
            </div>

            {/* 7. Thermal Heat Island Hotspots (Taichung Xitun Beitun Temp.tif) */}
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 px-1.5 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-[10px] font-bold text-rose-300 flex items-center gap-0.5 shrink-0">
                  🔥 40°C
                </div>
                <div>
                  <div className="font-bold text-rose-300 text-[11px]">
                    Heat Island Traps (熱島地表溫度異常)
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    <b>Taichung Xitun Beitun Temp.tif</b>: Satellite thermal hotspots where surface heat exceeds 38°C. Tap on map to deploy cooling starter kits!
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showThermalHeatLayer}
                onChange={(e) => onToggleThermal?.(e.target.checked)}
                className="mt-1.5 accent-rose-500 rounded cursor-pointer"
                title="Toggle Thermal Heat Island layer"
              />
            </div>

            {/* 7. Participating Cooling Outlets & Partner Perks */}
            <div className="p-2 rounded-xl bg-slate-800/50 border border-amber-500/30 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 w-6 h-6 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-xs shrink-0 shadow-md">
                  🧋
                </div>
                <div>
                  <div className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                    <span>Partner Outlets (合作涼憩店家)</span>
                    <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 text-[9px] rounded-full border border-amber-500/40">
                      🪙 Tokens
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    <b>Cooling Oasis Partners</b>: Chun Shui Tang, Miyahara Ice, Feng Chia Taro Ice, Calligraphy Greenway Cafes offering shade, cold teas, and discounts for walking & reporting.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showCoolingOutlets}
                onChange={(e) => onToggleCoolingOutlets?.(e.target.checked)}
                className="mt-1.5 accent-amber-500 rounded cursor-pointer"
                title="Toggle Partner Outlets layer"
              />
            </div>

            {/* 8. A & B & Walker Marker */}
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mb-0.5">
                  A
                </div>
                <span className="text-slate-300 font-semibold">Start (A)</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center mb-0.5">
                  B
                </div>
                <span className="text-slate-300 font-semibold">Destination (B)</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm mb-0.5">🧛</div>
                <span className="text-slate-300 font-semibold">You (Live GPS)</span>
              </div>
            </div>

            {/* Quick Button to Full Manual */}
            {onOpenManual && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenManual();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-900/80 to-rose-900/80 hover:from-purple-800 hover:to-rose-800 border border-purple-500/40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer mt-1"
              >
                <span>📖</span>
                <span>Open Full User Manual & Icons Guide</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
