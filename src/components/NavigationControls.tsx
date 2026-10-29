import React, { useState } from 'react';
import {
  NavigationRoute,
  RouteSegment,
  Landmark,
  VampireGear,
  TurnType,
} from '../types';
import {
  Navigation,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Plus,
  Compass,
  Umbrella,
  Shield,
  FastForward,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  CheckCircle,
} from 'lucide-react';

interface NavigationControlsProps {
  activeRoute: NavigationRoute;
  currentSegment: RouteSegment;
  currentSegmentIndex: number;
  totalSegments: number;
  progressPercent: number;
  isSimulating: boolean;
  simulationSpeed: number;
  useRealGps: boolean;
  remainingMeters: number;
  etaMinutes: number;
  followUser: boolean;
  voiceEnabled: boolean;
  hp: number;
  maxHp: number;
  isSizzling: boolean;
  gear: VampireGear;
  coolingTokens?: number;
  startLandmark: Landmark;
  endLandmark: Landmark;
  onTogglePlayPause: () => void;
  onChangeSpeed: (spd: number) => void;
  onToggleRealGps: () => void;
  onToggleFollowUser: () => void;
  onToggleVoice: () => void;
  onStopNavigation: () => void;
  onOpenProposeShadeModal: () => void;
  onOpenManual: () => void;
  onOpenRewards?: () => void;
  onToggleGear: (item: keyof VampireGear) => void;
  viewPerspective?: 'rpg_3d' | 'map_2d' | 'pip_split';
  onChangePerspective?: (mode: 'rpg_3d' | 'map_2d' | 'pip_split') => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  activeRoute,
  currentSegment,
  currentSegmentIndex,
  totalSegments,
  progressPercent,
  isSimulating,
  simulationSpeed,
  useRealGps,
  remainingMeters,
  etaMinutes,
  voiceEnabled,
  hp,
  maxHp,
  isSizzling,
  gear,
  coolingTokens,
  endLandmark,
  onTogglePlayPause,
  onChangeSpeed,
  onToggleRealGps,
  onToggleVoice,
  onStopNavigation,
  onOpenProposeShadeModal,
  onOpenRewards,
  onToggleGear,
  viewPerspective = 'rpg_3d',
  onChangePerspective,
}) => {
  // Allows user to collapse details to side for 100% unobstructed view of RPG character
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  // Determine current segment shade status styling
  let shadeBadgeColor = 'bg-emerald-950 text-emerald-200 border-emerald-500';
  let shadeIcon = '🟢';
  let advice = 'Continuous covered arcade roof. 100% safe from solar rays.';

  if (currentSegment.shadeRatio >= 0.75) {
    shadeBadgeColor = 'bg-emerald-950 text-emerald-200 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
    shadeIcon = '🟢';
    advice = 'Very good shade: Continuous arcade & tree canopy corridor.';
  } else if (currentSegment.shadeRatio >= 0.4) {
    shadeBadgeColor = 'bg-amber-950 text-amber-200 border-amber-500';
    shadeIcon = '🟡';
    advice = 'Partial shade: Building shadow corridor. Hug the shopfront colonnade.';
  } else {
    shadeBadgeColor = 'bg-rose-950 text-rose-200 border-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]';
    shadeIcon = '🔴';
    advice = 'CRITICAL NO SHADE: Wide open street crossing! Open parasol!';
  }

  // Turn maneuver directional icon
  const getTurnIcon = (type?: TurnType, turnAngle?: number) => {
    if (type === 'left' || (turnAngle && turnAngle < -20)) {
      return <ArrowLeft className="w-5 h-5 text-white" />;
    }
    if (type === 'right' || (turnAngle && turnAngle > 20)) {
      return <ArrowRight className="w-5 h-5 text-white" />;
    }
    if (type === 'slight_left') {
      return <ArrowLeft className="w-5 h-5 text-white transform rotate-45" />;
    }
    if (type === 'slight_right') {
      return <ArrowRight className="w-5 h-5 text-white transform -rotate-45" />;
    }
    if (type === 'u_turn') {
      return <RotateCcw className="w-5 h-5 text-white" />;
    }
    if (type === 'arrive') {
      return <Check className="w-5 h-5 text-emerald-300" />;
    }
    return <ArrowUp className="w-5 h-5 text-white" />;
  };

  // Next upcoming turn instruction
  const nextSegment = activeRoute.segments[currentSegmentIndex + 1];
  const turnInstructionText = currentSegment.turnInstruction || (
    currentSegment.turnType === 'left'
      ? `Turn Left onto ${currentSegment.streetName || currentSegment.name}`
      : currentSegment.turnType === 'right'
      ? `Turn Right onto ${currentSegment.streetName || currentSegment.name}`
      : currentSegment.turnType === 'arrive'
      ? `Arrive at destination: ${endLandmark.nameZh}`
      : `Walk along ${currentSegment.streetName || currentSegment.name}`
  );

  return (
    // Docked to bottom-left corner so center of screen remains 100% open for the RPG character
    <div className="fixed bottom-3 sm:bottom-4 left-3 sm:left-4 z-30 max-w-[340px] sm:max-w-[370px] w-full flex flex-col gap-2 pointer-events-none select-none">
      {/* Collapsed Pill View */}
      {isCollapsed ? (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-emerald-500/70 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
              {getTurnIcon(currentSegment.turnType, currentSegment.turnAngle)}
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold truncate text-[11px]">
                {turnInstructionText}
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-1.5 flex-wrap">
                <span className="text-emerald-400 font-bold">{etaMinutes} min</span>
                <span>•</span>
                <span>{remainingMeters} m</span>
                <span>•</span>
                <span className="text-purple-300">HP {Math.round(hp)}</span>
                {onOpenRewards && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRewards();
                      }}
                      className="text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/40 hover:bg-amber-900 cursor-pointer flex items-center gap-0.5"
                    >
                      <span>🪙</span>
                      <span>{coolingTokens ?? 85}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer shrink-0"
            title="Expand Navigation Details"
          >
            <ChevronUp className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      ) : (
        <>
          {/* Card 1: Turn Guidance & Shade Alert (Google Maps style) */}
          <div className="pointer-events-auto bg-slate-900/98 backdrop-blur-xl border-2 border-emerald-500/80 rounded-2xl p-3 shadow-2xl space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Turn Direction Icon */}
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg shrink-0 mt-0.5">
                  {getTurnIcon(currentSegment.turnType, currentSegment.turnAngle)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${shadeBadgeColor} flex items-center gap-1`}>
                      <span>{shadeIcon}</span>
                      <span>{Math.round(currentSegment.shadeRatio * 100)}% Shade</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Seg {currentSegmentIndex + 1}/{totalSegments}
                    </span>
                    {onOpenRewards && (
                      <button
                        type="button"
                        onClick={onOpenRewards}
                        className="text-[10px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/50 hover:bg-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer shrink-0 shadow-sm"
                        title="Open Cooling Tokens & Rewards"
                      >
                        <span>🪙</span>
                        <span className="font-mono">{coolingTokens ?? 85}</span>
                        <span className="text-[9px] text-amber-400">Reward</span>
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-white mt-0.5 truncate">
                    {turnInstructionText}
                  </h4>
                  <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                    {advice}
                  </p>
                </div>
              </div>

              {/* Action buttons: Voice & Minimize */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={onToggleVoice}
                  className={`p-1.5 rounded-xl border transition cursor-pointer ${
                    voiceEnabled
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title={voiceEnabled ? 'Voice Guidance Active' : 'Voice Muted'}
                >
                  {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                  title="Move/Minimize to side to see full RPG character"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Route Progress Bar with Shade Segments */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  🟢 Good Shade
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  🟡 Partial
                </span>
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  🔴 Sun Trap
                </span>
              </div>

              <div className="relative w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800 flex">
                {activeRoute.segments.map((seg, sIdx) => {
                  const segColor =
                    seg.shadeRatio >= 0.75
                      ? 'bg-emerald-500'
                      : seg.shadeRatio >= 0.4
                      ? 'bg-amber-500'
                      : 'bg-rose-500';
                  const segWidth = (seg.lengthMeters / Math.max(1, activeRoute.totalDistanceMeters)) * 100;
                  const isCurrent = sIdx === currentSegmentIndex;
                  return (
                    <div
                      key={seg.id || sIdx}
                      className={`h-full ${segColor} ${isCurrent ? 'ring-2 ring-white z-10' : 'opacity-85'} transition-all`}
                      style={{ width: `${segWidth}%` }}
                      title={`${seg.name}: ${Math.round(seg.shadeRatio * 100)}% Shade (${seg.lengthMeters}m)`}
                    />
                  );
                })}

                {/* Avatar Pin along Route */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 shadow-md flex items-center justify-center text-[7px] z-20 pointer-events-none transition-all duration-300"
                  style={{ left: `${Math.min(98, Math.max(2, progressPercent))}%` }}
                >
                  🧛
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Main Bottom Navigation Dock & Action Controls */}
          <div className="pointer-events-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl space-y-2.5">
            {/* ETA, Distance, Vampire HP */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {etaMinutes}
                  </span>
                  <span className="text-xs font-bold text-slate-300">min</span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-xs font-bold text-slate-200">
                    {remainingMeters > 1000 ? `${(remainingMeters / 1000).toFixed(1)} km` : `${remainingMeters} m`}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                  Dest: {endLandmark.nameZh.split(' ')[0]}
                </div>
              </div>

              {/* HP Bar */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] font-bold">
                  <span className="text-slate-300">HP:</span>
                  <span className={hp < 30 ? 'text-rose-400 animate-pulse font-mono' : 'text-emerald-400 font-mono'}>
                    {Math.round(hp)}/100
                  </span>
                  {isSizzling && <span className="text-[9px] text-rose-400">🔥 Sizzling!</span>}
                </div>
                <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-1 ml-auto">
                  <div
                    className={`h-full transition-all duration-200 ${
                      hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Control Action Buttons */}
            <div className="flex items-center justify-between gap-1 text-[11px]">
              {/* Play / Pause */}
              {!useRealGps && (
                <button
                  type="button"
                  onClick={onTogglePlayPause}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer border ${
                    isSimulating
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                      : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  }`}
                  title={isSimulating ? 'Pause walking simulation' : 'Resume walking'}
                >
                  {isSimulating ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isSimulating ? 'Pause' : 'Walk'}</span>
                </button>
              )}

              {/* Speed Multiplier with Slower Stroll Options (0.25x, 0.5x, 1x, 2x, 4x) */}
              {!useRealGps && (
                <button
                  type="button"
                  onClick={() => {
                    const speedOrder = [0.25, 0.5, 1, 2, 4];
                    const currentIndex = speedOrder.indexOf(simulationSpeed);
                    const nextIndex = currentIndex === -1 ? 2 : (currentIndex + 1) % speedOrder.length;
                    onChangeSpeed(speedOrder[nextIndex]);
                  }}
                  className={`py-1.5 px-2.5 rounded-xl font-mono font-bold border cursor-pointer transition flex items-center gap-1 active:scale-95 ${
                    simulationSpeed < 1
                      ? 'bg-sky-950 text-sky-200 border-sky-500/80 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                      : simulationSpeed === 1
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                      : 'bg-purple-950 text-purple-200 border-purple-500/80'
                  }`}
                  title={`Walking Speed: ${simulationSpeed}x (${
                    simulationSpeed === 0.25
                      ? 'Slow Stroll'
                      : simulationSpeed === 0.5
                      ? 'Gentle Walk'
                      : simulationSpeed === 1
                      ? 'Normal Walk'
                      : simulationSpeed === 2
                      ? 'Brisk Walk'
                      : 'Jogging'
                  }). Click to cycle.`}
                >
                  <FastForward className="w-3 h-3" />
                  <span>{simulationSpeed}x</span>
                  {simulationSpeed < 1 && <span className="text-[9px] font-sans font-bold text-sky-300">Slow</span>}
                </button>
              )}

              {/* View Perspective Split/Switch */}
              {onChangePerspective && (
                <button
                  type="button"
                  onClick={() => {
                    const next = viewPerspective === 'rpg_3d' ? 'pip_split' : viewPerspective === 'pip_split' ? 'map_2d' : 'rpg_3d';
                    onChangePerspective(next);
                  }}
                  className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Switch 3D RPG / 2D Map"
                >
                  <span>{viewPerspective === 'rpg_3d' ? '🎮 3D' : viewPerspective === 'pip_split' ? '🪟 Split' : '🗺️ 2D'}</span>
                </button>
              )}

              {/* Real GPS Toggle */}
              <button
                type="button"
                onClick={onToggleRealGps}
                className={`py-1.5 px-2 rounded-xl border font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  useRealGps
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Toggle Real GPS Mode"
              >
                <Compass className={`w-3 h-3 ${useRealGps ? 'animate-spin' : ''}`} />
                <span>{useRealGps ? 'GPS' : 'Sim'}</span>
              </button>

              {/* Propose Shade Button */}
              <button
                type="button"
                onClick={onOpenProposeShadeModal}
                className="py-1.5 px-2 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-500/60 text-rose-200 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                title="Propose shade here"
              >
                <Plus className="w-3 h-3 text-rose-400" />
                <span>Propose</span>
              </button>

              {/* Exit Button */}
              <button
                type="button"
                onClick={onStopNavigation}
                className="py-1.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 border border-rose-400/40"
                title="End navigation"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Exit</span>
              </button>
            </div>

            {/* Quick Gear Defense Shields */}
            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800 text-slate-400">
              <span className="font-semibold text-slate-400">Shields:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onToggleGear('hasParasol')}
                  className={`px-2 py-0.5 rounded-lg border font-bold cursor-pointer transition ${
                    gear.hasParasol
                      ? 'bg-purple-950 border-purple-500 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  ☂️ Parasol
                </button>
                <button
                  type="button"
                  onClick={() => onToggleGear('hasSunscreen')}
                  className={`px-2 py-0.5 rounded-lg border font-bold cursor-pointer transition ${
                    gear.hasSunscreen
                      ? 'bg-rose-950 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  🛡️ SPF100
                </button>
                <button
                  type="button"
                  onClick={() => onToggleGear('hasCloak')}
                  className={`px-2 py-0.5 rounded-lg border font-bold cursor-pointer transition ${
                    gear.hasCloak
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  🦇 Cloak
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
