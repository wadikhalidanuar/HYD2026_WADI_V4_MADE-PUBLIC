import React from 'react';
import { SolarPosition, VampireGear, WeatherData } from '../types';
import { Shield, Sun, Umbrella, AlertTriangle, Sparkles, Heart, BookOpen, Coins } from 'lucide-react';

interface VampireHudProps {
  hp: number;
  maxHp: number;
  isSizzling: boolean;
  currentShadeRatio: number;
  weather: WeatherData | null;
  solarPosition: SolarPosition;
  gear: VampireGear;
  coolingTokens?: number;
  onToggleGear: (item: keyof VampireGear) => void;
  onOpenDemographics: () => void;
  onOpenManual?: () => void;
  onOpenCover?: () => void;
  onOpenRewards?: () => void;
}

export const VampireHud: React.FC<VampireHudProps> = ({
  hp,
  maxHp,
  isSizzling,
  currentShadeRatio,
  weather,
  solarPosition,
  gear,
  coolingTokens,
  onToggleGear,
  onOpenDemographics,
  onOpenManual,
  onOpenCover,
  onOpenRewards,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  // Determine current shade category status
  let shadeBadgeText = 'Deep Arcade (95% Shaded)';
  let shadeBadgeColor = 'bg-purple-900/80 text-purple-200 border-purple-500/40';

  if (currentShadeRatio >= 0.8) {
    shadeBadgeText = 'Tree Canopy (85% Shaded)';
    shadeBadgeColor = 'bg-emerald-900/80 text-emerald-200 border-emerald-500/40';
  } else if (currentShadeRatio >= 0.5) {
    shadeBadgeText = 'Building Shadow (60% Shaded)';
    shadeBadgeColor = 'bg-sky-900/80 text-sky-200 border-sky-500/40';
  } else if (currentShadeRatio < 0.5) {
    shadeBadgeText = 'BLAZING SUN! (Unshaded)';
    shadeBadgeColor = 'bg-rose-900/90 text-rose-200 border-rose-500 animate-pulse';
  }

  return (
    <div className="relative w-full z-20 pointer-events-none">
      {/* Visual Screen Burn vignette effect if sizzling */}
      {isSizzling && (
        <div className="fixed inset-0 pointer-events-none z-10 border-4 border-rose-600/60 shadow-[inset_0_0_60px_rgba(244,63,94,0.45)] animate-pulse" />
      )}

      {/* Top Header Card */}
      <div className="mx-3 mt-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Vampire Avatar & HP */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCover || onOpenDemographics}
              className="relative p-0.5 rounded-xl bg-slate-800/90 border border-purple-500/50 hover:border-emerald-400 transition cursor-pointer group flex items-center justify-center shrink-0 shadow-md"
              title="Open UmbraNav Theme & Cover Page"
            >
              <img
                src="/app-logo.png"
                alt="UmbraNav Logo"
                className="w-8 h-8 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-slate-900" />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">Vampire Health</span>
                <span className="text-[11px] font-mono text-rose-400 font-bold">
                  {Math.round(hp)} / {maxHp} HP
                </span>
                {isSizzling && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/40 animate-bounce">
                    <AlertTriangle className="w-3 h-3" /> Sizzling!
                  </span>
                )}
              </div>

              {/* HP Progress Bar */}
              <div className="w-36 sm:w-48 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-1">
                <div
                  className={`h-full transition-all duration-300 ${
                    hpPercent > 50
                      ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                      : hpPercent > 20
                      ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                      : 'bg-gradient-to-r from-red-700 to-red-500 animate-pulse'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Taichung Solar & Weather readout + Cover & Manual Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenRewards && (
              <button
                onClick={onOpenRewards}
                className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/90 to-amber-900/90 hover:from-amber-900 hover:to-amber-850 border border-amber-500/60 text-amber-300 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-[0_2px_10px_rgba(245,158,11,0.25)] active:scale-95 group"
                title="Open Cooling Tokens & Rewards Hub (兌換獎勵)"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="font-mono">{coolingTokens ?? 85}</span>
                <span className="text-[10px] text-amber-200">🪙</span>
              </button>
            )}

            {onOpenCover && (
              <button
                onClick={onOpenCover}
                className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md active:scale-95 group"
                title="Open Cover Page & Concept Overview"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Cover</span>
              </button>
            )}

            {onOpenManual && (
              <button
                onClick={onOpenManual}
                className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/50 text-teal-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md active:scale-95 group"
                title="Open User Manual (Interface & Symbols Guide)"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-300 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">Manual</span>
              </button>
            )}

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs font-semibold text-amber-300">
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>UV {weather ? weather.uvIndex : '7.5'}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-200">{weather ? `${weather.temperature}°C` : '31°C'}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Sun Alt: {solarPosition.altitude > 0 ? `${solarPosition.altitude}°` : 'Night (0°)'} • Az: {solarPosition.azimuth}°
              </div>
            </div>
          </div>
        </div>

        {/* Current Zone Shade Status & Gear Shields */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
          {/* Current Ground Shade Badge */}
          <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${shadeBadgeColor}`}>
            {currentShadeRatio < 0.5 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span className="truncate">{shadeBadgeText}</span>
          </div>

          {/* Quick Gear Shields */}
          <div className="flex items-center gap-1.5">
            {/* Parasol */}
            <button
              onClick={() => onToggleGear('hasParasol')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                gear.hasParasol
                  ? 'bg-purple-950/90 text-purple-200 border-purple-500 shadow-sm shadow-purple-900/50'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Vampire Parasol: Blocks 60% UV damage"
            >
              <Umbrella className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Parasol</span>
            </button>

            {/* Sunscreen */}
            <button
              onClick={() => onToggleGear('hasSunscreen')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                gear.hasSunscreen
                  ? 'bg-rose-950/90 text-rose-200 border-rose-500 shadow-sm shadow-rose-900/50'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="SPF 100+ Vampire Alchemical Sunscreen: Blocks 30% UV damage"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SPF100</span>
            </button>

            {/* Cloak */}
            <button
              onClick={() => onToggleGear('hasCloak')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                gear.hasCloak
                  ? 'bg-indigo-950/90 text-indigo-200 border-indigo-500 shadow-sm shadow-indigo-900/50'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Gothic Shadow Cloak: Blocks 20% UV damage"
            >
              <span className="text-xs">🦇</span>
              <span className="hidden sm:inline">Cloak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
