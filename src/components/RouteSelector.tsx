import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Landmark, NavigationRoute } from '../types';
import { TAICHUNG_LANDMARKS } from '../utils/taichungData';
import {
  MapPin,
  Navigation,
  ShieldAlert,
  Sparkles,
  Flame,
  Clock,
  Search,
  ArrowUpDown,
  X,
  Compass,
  Train,
  Landmark as LandmarkIcon,
  Trees,
  UtensilsCrossed,
  ShoppingBag,
  GraduationCap,
  Building2,
  Check,
} from 'lucide-react';

interface RouteSelectorProps {
  startLandmark: Landmark;
  endLandmark: Landmark;
  availableRoutes: NavigationRoute[];
  selectedRoute: NavigationRoute;
  useRealGps?: boolean;
  defaultPerspective?: 'rpg_3d' | 'map_2d';
  onSelectStart: (landmark: Landmark) => void;
  onSelectEnd: (landmark: Landmark) => void;
  onSelectRoute: (route: NavigationRoute) => void;
  onToggleRealGps?: (val: boolean) => void;
  onStartNavigation: (useGps: boolean, perspective?: 'rpg_3d' | 'map_2d') => void;
  onClose: () => void;
}

type CategoryFilter = 'all' | 'transit' | 'culture' | 'park' | 'food' | 'shopping' | 'university' | 'hospital' | 'market';

const POPULAR_DESTINATIONS = [
  'station',
  'calligraphy_greenway',
  'national_theater',
  'fengjia',
  'second_market',
  'lalaport',
  'nm_science',
  'hsr_taichung',
];

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  startLandmark,
  endLandmark,
  availableRoutes,
  selectedRoute,
  useRealGps = false,
  defaultPerspective = 'rpg_3d',
  onSelectStart,
  onSelectEnd,
  onSelectRoute,
  onToggleRealGps,
  onStartNavigation,
  onClose,
}) => {
  // Search queries & dropdown states
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [isLiveGpsMode, setIsLiveGpsMode] = useState<boolean>(useRealGps);
  const [navPerspective, setNavPerspective] = useState<'rpg_3d' | 'map_2d'>(defaultPerspective);

  const startContainerRef = useRef<HTMLDivElement>(null);
  const endContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (startContainerRef.current && !startContainerRef.current.contains(e.target as Node)) {
        setIsStartOpen(false);
      }
      if (endContainerRef.current && !endContainerRef.current.contains(e.target as Node)) {
        setIsEndOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter landmarks for Start
  const filteredStartLandmarks = useMemo(() => {
    const q = startQuery.trim().toLowerCase();
    return TAICHUNG_LANDMARKS.filter((l) => {
      if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.nameZh.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    });
  }, [startQuery, categoryFilter]);

  // Filter landmarks for End
  const filteredEndLandmarks = useMemo(() => {
    const q = endQuery.trim().toLowerCase();
    return TAICHUNG_LANDMARKS.filter((l) => {
      if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.nameZh.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    });
  }, [endQuery, categoryFilter]);

  // Swap start & destination
  const handleSwap = () => {
    if (startLandmark.id === 'live-gps') {
      alert('Cannot swap when departure is live phone GPS');
      return;
    }
    const temp = startLandmark;
    onSelectStart(endLandmark);
    onSelectEnd(temp);
  };

  // Helper to render category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transit':
        return <Train className="w-3.5 h-3.5 text-sky-400" />;
      case 'culture':
        return <LandmarkIcon className="w-3.5 h-3.5 text-purple-400" />;
      case 'park':
        return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'food':
      case 'market':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />;
      case 'shopping':
        return <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />;
      case 'university':
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />;
      case 'hospital':
        return <Building2 className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const handleUseGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingGps(false);
        const liveGpsLandmark: Landmark = {
          id: 'live-gps',
          name: 'My Current Location (Live GPS)',
          nameZh: '我的即時GPS位置',
          district: 'Live GPS',
          coords: [pos.coords.latitude, pos.coords.longitude],
          category: 'transit',
          description: `Live phone coordinate: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          arcadeNearby: false,
        };
        onSelectStart(liveGpsLandmark);
        setStartQuery('');
        setIsStartOpen(false);
      },
      (err) => {
        setIsGettingGps(false);
        alert('Could not retrieve GPS location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-t-3xl sm:rounded-2xl p-4 shadow-2xl max-w-lg w-full max-h-[88vh] overflow-y-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Taichung Vampire Route Search</span>
              <span className="text-[10px] font-semibold bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-600/30">
                Google Maps Style
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Search 45+ Taichung locations or use live GPS with shade corridor routing
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          ✕
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-thin border-b border-slate-800/80">
        <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Filter:</span>
        {[
          { id: 'all', label: 'All Places' },
          { id: 'transit', label: '🚆 Transit' },
          { id: 'culture', label: '🏛️ Heritage' },
          { id: 'park', label: '🌳 Parks' },
          { id: 'food', label: '🍜 Night Markets' },
          { id: 'shopping', label: '🛍️ Shopping' },
          { id: 'university', label: '🎓 University' },
          { id: 'hospital', label: '🏥 Hospital' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
              categoryFilter === cat.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Origin & Destination Searchable Inputs */}
      <div className="relative my-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
        {/* Swap Button on Right */}
        <button
          onClick={handleSwap}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 hover:bg-emerald-700 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white flex items-center justify-center transition shadow-lg cursor-pointer active:rotate-180 z-10"
          title="Swap Departure and Destination"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        {/* 1. Departure (Origin) Input */}
        <div className="relative pr-9 mb-2.5" ref={startContainerRef}>
          <div className="flex items-center justify-between mb-1">
            <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Departure (Origin)</span>
            </label>
            <button
              type="button"
              onClick={handleUseGps}
              disabled={isGettingGps}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/30"
            >
              <Compass className={`w-3 h-3 ${isGettingGps ? 'animate-spin' : ''}`} />
              <span>{isGettingGps ? 'Locating...' : '📍 Use Live GPS'}</span>
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={isStartOpen ? startQuery : startLandmark.name}
              onFocus={() => {
                setIsStartOpen(true);
                setIsEndOpen(false);
                setStartQuery('');
              }}
              onChange={(e) => {
                setStartQuery(e.target.value);
                setIsStartOpen(true);
              }}
              placeholder="Search departure (e.g. Taichung Station, 臺中車站)..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
            {isStartOpen && (
              <button
                onClick={() => {
                  setStartQuery('');
                  setIsStartOpen(false);
                }}
                className="absolute right-2.5 text-slate-400 hover:text-white text-xs p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Start Dropdown Results */}
          {isStartOpen && (
            <div className="absolute left-0 right-9 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-30 divide-y divide-slate-800/60">
              {filteredStartLandmarks.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No landmark matching &quot;{startQuery}&quot;
                </div>
              ) : (
                filteredStartLandmarks.map((l) => {
                  const isSelected = l.id === startLandmark.id;
                  const isEnd = l.id === endLandmark.id;
                  return (
                    <button
                      key={l.id}
                      disabled={isEnd}
                      onClick={() => {
                        onSelectStart(l);
                        setIsStartOpen(false);
                        setStartQuery('');
                      }}
                      className={`w-full text-left p-2.5 flex items-start gap-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/60 text-emerald-200'
                          : isEnd
                          ? 'opacity-40 cursor-not-allowed bg-slate-950/30'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="p-1 rounded bg-slate-800 mt-0.5 shrink-0">
                        {getCategoryIcon(l.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate text-white">{l.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{l.nameZh}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">{l.district}</span>
                          {l.arcadeNearby && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                              騎樓 Arcade
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 2. Destination (Goal) Input */}
        <div className="relative pr-9" ref={endContainerRef}>
          <label className="flex items-center gap-1 text-[11px] font-bold text-rose-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            <span>Destination (Goal)</span>
          </label>

          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={isEndOpen ? endQuery : endLandmark.name}
              onFocus={() => {
                setIsEndOpen(true);
                setIsStartOpen(false);
                setEndQuery('');
              }}
              onChange={(e) => {
                setEndQuery(e.target.value);
                setIsEndOpen(true);
              }}
              placeholder="Search destination (e.g. Calligraphy Greenway, 逢甲)..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
            {isEndOpen && (
              <button
                onClick={() => {
                  setEndQuery('');
                  setIsEndOpen(false);
                }}
                className="absolute right-2.5 text-slate-400 hover:text-white text-xs p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* End Dropdown Results */}
          {isEndOpen && (
            <div className="absolute left-0 right-9 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-30 divide-y divide-slate-800/60">
              {filteredEndLandmarks.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No landmark matching &quot;{endQuery}&quot;
                </div>
              ) : (
                filteredEndLandmarks.map((l) => {
                  const isSelected = l.id === endLandmark.id;
                  const isStart = l.id === startLandmark.id;
                  return (
                    <button
                      key={l.id}
                      disabled={isStart}
                      onClick={() => {
                        onSelectEnd(l);
                        setIsEndOpen(false);
                        setEndQuery('');
                      }}
                      className={`w-full text-left p-2.5 flex items-start gap-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/60 text-rose-200'
                          : isStart
                          ? 'opacity-40 cursor-not-allowed bg-slate-950/30'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="p-1 rounded bg-slate-800 mt-0.5 shrink-0">
                        {getCategoryIcon(l.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate text-white">{l.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-rose-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{l.nameZh}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">{l.district}</span>
                          {l.arcadeNearby && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                              騎樓 Arcade
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popular Quick Destinations */}
      <div className="my-2.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Popular Taichung Hubs</span>
          <span className="text-slate-500 lowercase font-normal">Tap to set as destination</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_DESTINATIONS.map((id) => {
            const landmark = TAICHUNG_LANDMARKS.find((l) => l.id === id);
            if (!landmark || landmark.id === startLandmark.id) return null;
            const isSelected = endLandmark.id === landmark.id;
            return (
              <button
                key={landmark.id}
                onClick={() => onSelectEnd(landmark)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-rose-950 border-rose-500 text-rose-200 font-bold'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{landmark.nameZh.split(' ')[0]}</span>
                <span className="text-[9px] text-slate-500">({landmark.district.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Route Cards */}
      <div className="space-y-2.5 my-3">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Choose Shade Navigation Strategy
        </div>

        {availableRoutes.map((route) => {
          const isSelected = selectedRoute.id === route.id;
          const isVampireSafe = route.type === 'vampire_safe';
          const isDirect = route.type === 'direct_sun';

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? isVampireSafe
                    ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50'
                    : isDirect
                    ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/50'
                    : 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-950/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {isVampireSafe ? (
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  ) : isDirect ? (
                    <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  ) : (
                    <Clock className="w-4 h-4 text-sky-400" />
                  )}
                  <span className="text-xs font-bold text-white">{route.name}</span>
                  <span className="text-[10px] text-slate-400">({route.nameZh})</span>
                </div>

                <div
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isVampireSafe
                      ? 'bg-purple-900/90 text-purple-200 border border-purple-500/50'
                      : isDirect
                      ? 'bg-rose-900/90 text-rose-200 border border-rose-500/50'
                      : 'bg-sky-900/90 text-sky-200 border border-sky-500/50'
                  }`}
                >
                  {route.averageShadePercentage}% Shade
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">Distance / Time</span>
                  <span className="font-semibold text-slate-200">
                    {route.totalDistanceMeters > 1000 ? `${(route.totalDistanceMeters / 1000).toFixed(1)}km` : `${route.totalDistanceMeters}m`} ({route.estimatedMinutes}m)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Unshaded Gap</span>
                  <span
                    className={`font-semibold ${
                      route.maxUnshadedStretchMeters > 100 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {route.maxUnshadedStretchMeters}m
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated HP Loss</span>
                  <span
                    className={`font-semibold ${
                      route.expectedHpLoss > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400'
                    }`}
                  >
                    -{route.expectedHpLoss} HP
                  </span>
                </div>
              </div>

              {isDirect && (
                <div className="mt-2 text-[10px] text-rose-300 flex items-center gap-1 bg-rose-950/50 p-1.5 rounded border border-rose-800/40">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Blazing sun! Heavy sizzling damage without umbrellas or covered arcades.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2 Clear Navigation Perspective Options: Top-Down Aerial vs 3D RPG Street */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 my-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Navigation View Mode (視角選擇)</span>
          </span>
          <span className="text-[10px] text-purple-300 font-bold bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-800">
            {navPerspective === 'rpg_3d' ? '🎮 3D RPG Street' : '🗺️ Top-Down Aerial Map'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Option 1: 3D RPG Street View */}
          <button
            type="button"
            onClick={() => setNavPerspective('rpg_3d')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              navPerspective === 'rpg_3d'
                ? 'bg-purple-950/90 border-purple-400 text-white shadow-lg ring-2 ring-purple-500/40'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🎮</span>
                <span className="font-bold text-white text-xs">3D RPG Street Walk</span>
              </div>
              <div className="text-[10px] text-purple-300 font-medium mt-0.5">
                沉浸式 RPG 街景
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                3rd-person avatar, 1st-person human eye level, 3D arcades, trees &amp; Google 3D Satellite Map!
              </p>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Full 3D City Simulation</span>
            </div>
          </button>

          {/* Option 2: Top-Down Aerial Map */}
          <button
            type="button"
            onClick={() => setNavPerspective('map_2d')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              navPerspective === 'map_2d'
                ? 'bg-sky-950/90 border-sky-400 text-white shadow-lg ring-2 ring-sky-500/40'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🗺️</span>
                <span className="font-bold text-white text-xs">Top-Down 2D Map</span>
              </div>
              <div className="text-[10px] text-sky-300 font-medium mt-0.5">
                由上往下鳥瞰導航
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                Classic bird&apos;s-eye map view with full route shade polylines, 騎樓 arcades, and tree canopy layers.
              </p>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-sky-400 flex items-center gap-1">
              <Check className="w-3 h-3 text-sky-400" />
              <span>Tactical Aerial Overview</span>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation Engine: Live GPS vs Virtual Walk Simulation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 my-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tracking Engine Mode</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
            {isLiveGpsMode ? '📍 Live Phone GPS Active' : '🚶 Virtual Sim Walk'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsLiveGpsMode(true);
              onToggleRealGps?.(true);
            }}
            className={`p-2 rounded-lg border text-left transition cursor-pointer flex items-center gap-2 ${
              isLiveGpsMode
                ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${isLiveGpsMode ? 'border-emerald-400' : 'border-slate-600'}`}>
              {isLiveGpsMode && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </div>
            <div>
              <div className="font-bold text-[11px] text-white">Live Real-Time GPS</div>
              <div className="text-[9px] text-slate-400">Track actual phone walking location</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLiveGpsMode(false);
              onToggleRealGps?.(false);
            }}
            className={`p-2 rounded-lg border text-left transition cursor-pointer flex items-center gap-2 ${
              !isLiveGpsMode
                ? 'bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${!isLiveGpsMode ? 'border-purple-400' : 'border-slate-600'}`}>
              {!isLiveGpsMode && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </div>
            <div>
              <div className="font-bold text-[11px] text-white">Virtual Walk Sim</div>
              <div className="text-[9px] text-slate-400">Animated walk preview &amp; testing</div>
            </div>
          </button>
        </div>
      </div>

      {/* Google Maps Style Primary Action Buttons: Clear Options for RPG vs Top-Down */}
      <div className="space-y-2 mt-2">
        {/* 1. Primary Action based on selected perspective */}
        <button
          onClick={() => onStartNavigation(isLiveGpsMode, navPerspective)}
          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] border ${
            navPerspective === 'rpg_3d'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/60 border-purple-400/40'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 border-emerald-400/30'
          }`}
        >
          <Navigation className="w-5 h-5 fill-white" />
          <span>
            {navPerspective === 'rpg_3d'
              ? `🎮 Start in 3D RPG Street View (${isLiveGpsMode ? '即時GPS' : '虛擬試走'})`
              : `🗺️ Start in Top-Down Map (${isLiveGpsMode ? '即時GPS' : '虛擬試走'})`}
          </span>
        </button>

        {/* 2. Secondary Alternative Option Button */}
        <button
          onClick={() => onStartNavigation(isLiveGpsMode, navPerspective === 'rpg_3d' ? 'map_2d' : 'rpg_3d')}
          className="w-full py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
        >
          <span>
            {navPerspective === 'rpg_3d'
              ? '🗺️ Or Launch in Top-Down 2D Aerial Map (由上往下鳥瞰導航)'
              : '🎮 Or Launch in 3D RPG Street View (3D RPG 街景導航)'}
          </span>
        </button>
      </div>
    </div>
  );
};
