/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Landmark,
  NavigationRoute,
  RouteSegment,
  ShadeProposal,
  SolarPosition,
  TileLayerType,
  UserDemographics,
  VampireGear,
  WeatherData,
} from './types';
import { calculateTaichungSolarPosition } from './utils/solar';
import { fetchTaichungWeather } from './utils/weather';
import {
  generateCuratedRoutes,
  TAICHUNG_LANDMARKS,
  evaluateLocationShade,
  computeDistanceMeters,
} from './utils/taichungData';
import { fetchPedestrianRoutes } from './utils/pedestrianRouting';
import {
  getStoredProposals,
  getStoredUserDemographics,
  upvoteProposal,
  CATEGORY_LABELS,
  getCoolingTokens,
} from './utils/storage';
import { MapComponent } from './components/MapComponent';
import { VampireHud } from './components/VampireHud';
import { RouteSelector } from './components/RouteSelector';
import { NavigationControls } from './components/NavigationControls';
import { ProposeShadeModal } from './components/ProposeShadeModal';
import { DemographicsModal } from './components/DemographicsModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { GitHubGuideModal } from './components/GitHubGuideModal';
import { MapLegend } from './components/MapLegend';
import { UserManualModal } from './components/UserManualModal';
import { CoverPageModal } from './components/CoverPageModal';
import { ConceptPreviewModal } from './components/ConceptPreviewModal';
import { CoolingRewardsModal } from './components/CoolingRewardsModal';
import { Rpg3dRoadView } from './components/Rpg3dRoadView';
import {
  ConceptPreviewScene,
  CONCEPT_PREVIEW_SCENES,
  SPONSORED_STARTER_KITS,
  STARTER_KIT_AFTER_IMAGES,
} from './assets/starterKits';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  Navigation,
  Layers,
  BarChart3,
  Smartphone,
  Github,
  Plus,
  Crosshair,
  User,
  ExternalLink,
  ThumbsUp,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Landmarks & Routes
  const [startLandmark, setStartLandmark] = useState<Landmark>(TAICHUNG_LANDMARKS[0]); // Taichung Train Station
  const [endLandmark, setEndLandmark] = useState<Landmark>(TAICHUNG_LANDMARKS[4]); // Calligraphy Greenway
  const [routes, setRoutes] = useState<NavigationRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<NavigationRoute | null>(null);

  // Vampire Navigation & Position
  const [currentCoords, setCurrentCoords] = useState<[number, number]>(TAICHUNG_LANDMARKS[0].coords);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [useRealGps, setUseRealGps] = useState<boolean>(false);
  const [followUser, setFollowUser] = useState<boolean>(true);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(15);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const lastAnnouncedShadeRef = useRef<number>(0.95);

  // Vampire Health & Gear
  const [hp, setHp] = useState<number>(100);
  const maxHp = 100;
  const [isSizzling, setIsSizzling] = useState<boolean>(false);
  const [currentShadeRatio, setCurrentShadeRatio] = useState<number>(0.95);
  const [gear, setGear] = useState<VampireGear>({
    hasParasol: true,
    hasSunscreen: false,
    hasCloak: false,
  });

  // Weather & Solar Engine
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [solarPosition, setSolarPosition] = useState<SolarPosition>(() =>
    calculateTaichungSolarPosition(new Date())
  );

  // Map Tile & Layers
  const [tileLayer, setTileLayer] = useState<TileLayerType>('dark');
  const [showArcadeLayer, setShowArcadeLayer] = useState<boolean>(true);
  const [showCanopyLayer, setShowCanopyLayer] = useState<boolean>(true);
  const [showProposalsLayer, setShowProposalsLayer] = useState<boolean>(true);
  const [showShadowVectors, setShowShadowVectors] = useState<boolean>(false);
  const [showTreeInventoryLayer, setShowTreeInventoryLayer] = useState<boolean>(true);
  const [showThermalHeatLayer, setShowThermalHeatLayer] = useState<boolean>(true);
  const [showCoolingOutlets, setShowCoolingOutlets] = useState<boolean>(true);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Perspective View Mode: 3D RPG Game vs 2D Map vs Dual PiP
  const [viewPerspective, setViewPerspective] = useState<'rpg_3d' | 'map_2d' | 'pip_split'>('rpg_3d');

  // Cooling Tokens & Rewards State
  const [coolingTokens, setCoolingTokens] = useState<number>(() => getCoolingTokens());
  const [isCoolingRewardsOpen, setIsCoolingRewardsOpen] = useState<boolean>(false);

  // Data & Modals
  const [proposals, setProposals] = useState<ShadeProposal[]>([]);
  const [userDemographics, setUserDemographics] = useState<UserDemographics>(() =>
    getStoredUserDemographics()
  );
  const [proposalTargetCoords, setProposalTargetCoords] = useState<[number, number] | null>(null);

  const [isRouteSelectorOpen, setIsRouteSelectorOpen] = useState<boolean>(false);
  const [isProposeShadeOpen, setIsProposeShadeOpen] = useState<boolean>(false);
  const [isDemographicsOpen, setIsDemographicsOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState<boolean>(false);
  const [isGitHubGuideOpen, setIsGitHubGuideOpen] = useState<boolean>(false);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [isCoverOpen, setIsCoverOpen] = useState<boolean>(true);
  const [isConceptPreviewOpen, setIsConceptPreviewOpen] = useState<boolean>(false);
  const [activePreviewScene, setActivePreviewScene] = useState<ConceptPreviewScene | null>(null);
  const [inspectedProposal, setInspectedProposal] = useState<ShadeProposal | null>(null);

  // PWA Install Hook
  const { isInstallable, install } = usePWAInstall();

  // Watch GPS ID
  const gpsWatchIdRef = useRef<number | null>(null);

  // Listen for Cooling Tokens updates across app components
  useEffect(() => {
    const handleTokensUpdated = (e: any) => {
      if (e && e.detail && typeof e.detail.tokens === 'number') {
        setCoolingTokens(e.detail.tokens);
      } else {
        setCoolingTokens(getCoolingTokens());
      }
    };
    window.addEventListener('cooling-tokens-updated', handleTokensUpdated);
    return () => window.removeEventListener('cooling-tokens-updated', handleTokensUpdated);
  }, []);

  // Load initial data
  useEffect(() => {
    // Generate initial street-grid routes immediately (no wait)
    const initialRoutes = generateCuratedRoutes(startLandmark, endLandmark);
    setRoutes(initialRoutes);
    setSelectedRoute(initialRoutes[0]);

    // Asynchronously fetch full OpenStreetMap pedestrian routes with turns and steps
    fetchPedestrianRoutes(startLandmark, endLandmark).then((osmRoutes) => {
      if (osmRoutes && osmRoutes.length > 0) {
        setRoutes(osmRoutes);
        setSelectedRoute(osmRoutes[0]);
      }
    });

    // Load initial proposals & demographics
    setProposals(getStoredProposals());
    setUserDemographics(getStoredUserDemographics());

    // Fetch initial weather
    fetchTaichungWeather().then((data) => setWeather(data));

    // Update solar position every minute
    const solarInterval = setInterval(() => {
      setSolarPosition(calculateTaichungSolarPosition(new Date()));
    }, 60000);

    return () => clearInterval(solarInterval);
  }, []);

  // Update routes when landmarks change
  const handleSelectStart = (landmark: Landmark) => {
    setStartLandmark(landmark);
    setCurrentCoords(landmark.coords);
    const gridRoutes = generateCuratedRoutes(landmark, endLandmark);
    setRoutes(gridRoutes);
    setSelectedRoute(gridRoutes[0]);
    setSimulationProgress(0);
    setIsSimulating(false);

    // Fetch real pedestrian sidewalk routes
    fetchPedestrianRoutes(landmark, endLandmark).then((osmRoutes) => {
      if (osmRoutes && osmRoutes.length > 0) {
        setRoutes(osmRoutes);
        setSelectedRoute(osmRoutes[0]);
      }
    });
  };

  const handleSelectEnd = (landmark: Landmark) => {
    setEndLandmark(landmark);
    const gridRoutes = generateCuratedRoutes(startLandmark, landmark);
    setRoutes(gridRoutes);
    setSelectedRoute(gridRoutes[0]);
    setSimulationProgress(0);
    setIsSimulating(false);

    // Fetch real pedestrian sidewalk routes
    fetchPedestrianRoutes(startLandmark, landmark).then((osmRoutes) => {
      if (osmRoutes && osmRoutes.length > 0) {
        setRoutes(osmRoutes);
        setSelectedRoute(osmRoutes[0]);
      }
    });
  };

  // Determine current route segment from simulation progress based on actual distance walked
  const getCurrentSegment = (): { segment: RouteSegment; index: number } => {
    if (!selectedRoute || selectedRoute.segments.length === 0) {
      return {
        segment: {
          id: 'def',
          name: 'Central District Arcade',
          coordinates: [startLandmark.coords],
          shadeType: 'arcade',
          shadeRatio: 0.95,
          lengthMeters: 100,
          description: 'Covered pedestrian corridor',
          uvExposureRate: 0.05,
        },
        index: 0,
      };
    }

    const totalDist = Math.max(1, selectedRoute.totalDistanceMeters);
    const walkedDist = simulationProgress * totalDist;

    let accumulated = 0;
    for (let i = 0; i < selectedRoute.segments.length; i++) {
      accumulated += selectedRoute.segments[i].lengthMeters;
      if (walkedDist <= accumulated || i === selectedRoute.segments.length - 1) {
        return { segment: selectedRoute.segments[i], index: i };
      }
    }

    return { segment: selectedRoute.segments[0], index: 0 };
  };

  const { segment: activeSegment, index: activeSegmentIndex } = getCurrentSegment();

  // Keep shade ratio in sync
  useEffect(() => {
    if (activeSegment) {
      setCurrentShadeRatio(activeSegment.shadeRatio);
    }
  }, [activeSegment]);

  // Simulation step loop (moves avatar along route)
  useEffect(() => {
    if (!isNavigating || !isSimulating || useRealGps || !selectedRoute) return;

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        const next = prev + 0.006 * simulationSpeed;
        if (next >= 1) {
          setIsSimulating(false);
          return 1;
        }

        // Interpolate coordinate along allCoordinates
        const coords = selectedRoute.allCoordinates;
        if (coords.length >= 2) {
          const totalPoints = coords.length - 1;
          const floatIdx = next * totalPoints;
          const baseIdx = Math.floor(floatIdx);
          const remainder = floatIdx - baseIdx;
          const p1 = coords[baseIdx];
          const p2 = coords[Math.min(baseIdx + 1, coords.length - 1)];

          const nextLat = p1[0] + (p2[0] - p1[0]) * remainder;
          const nextLng = p1[1] + (p2[1] - p1[1]) * remainder;
          setCurrentCoords([nextLat, nextLng]);
        }

        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isNavigating, isSimulating, simulationSpeed, useRealGps, selectedRoute]);

  // Helper to project character's current position onto the active route to resume simulation seamlessly
  const calculateRouteProgressFromCoords = (
    coords: [number, number],
    route: NavigationRoute | null
  ): number => {
    if (!route || !route.allCoordinates || route.allCoordinates.length < 2) return 0;
    const pts = route.allCoordinates;
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < pts.length; i++) {
      const dist = computeDistanceMeters(coords, pts[i]);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    return Math.min(0.99, Math.max(0, closestIndex / (pts.length - 1)));
  };

  // Real GPS Geolocation Watcher with seamless toggle between Live GPS and Simulation Walk
  const toggleRealGps = () => {
    if (useRealGps) {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      setUseRealGps(false);
      // Seamlessly continue simulation from character's current position all the way to destination!
      if (selectedRoute) {
        const prog = calculateRouteProgressFromCoords(currentCoords, selectedRoute);
        setSimulationProgress(prog);
      }
      setIsSimulating(true);
      setIsNavigating(true);
    } else {
      if (!('geolocation' in navigator)) {
        alert('Geolocation is not supported by your browser.');
        return;
      }

      setUseRealGps(true);
      setIsSimulating(false);
      setFollowUser(true);

      gpsWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setCurrentCoords(newCoords);
          setGpsAccuracy(pos.coords.accuracy || 15);

          // Dynamically regenerate route starting directly from user's live position
          const liveLandmark: Landmark = {
            id: 'live-gps',
            name: 'My Live GPS Location',
            nameZh: '我的即時位置',
            district: 'Live GPS',
            coords: newCoords,
            category: 'transit',
            description: `Live coordinates: ${newCoords[0].toFixed(4)}, ${newCoords[1].toFixed(4)}`,
            arcadeNearby: false,
          };
          setStartLandmark(liveLandmark);

          const updatedRoutes = generateCuratedRoutes(liveLandmark, endLandmark);
          setRoutes(updatedRoutes);
          setSelectedRoute((prev) => {
            const prevType = prev?.type || 'vampire_safe';
            return updatedRoutes.find((r) => r.type === prevType) || updatedRoutes[0];
          });

          // Evaluate live shade based on phone's real geographic location
          const shadeEval = evaluateLocationShade(newCoords);
          setCurrentShadeRatio(shadeEval.shadeRatio);

          // Real-time Spoken Voice Cues (like Google Maps)
          if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            if (shadeEval.shadeRatio < 0.4 && lastAnnouncedShadeRef.current >= 0.4) {
              const u = new SpeechSynthesisUtterance('Warning: Entering unshaded sunlight! Open your parasol or suggest shade.');
              u.rate = 1.05;
              window.speechSynthesis.speak(u);
            } else if (shadeEval.shadeRatio >= 0.8 && lastAnnouncedShadeRef.current < 0.4) {
              const u = new SpeechSynthesisUtterance('Entered covered pedestrian arcade. Solar protection active.');
              u.rate = 1.05;
              window.speechSynthesis.speak(u);
            }
          }
          lastAnnouncedShadeRef.current = shadeEval.shadeRatio;
        },
        (err) => {
          console.warn('Geolocation error or permission denied:', err.message);
          setUseRealGps(false);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    }
  };

  // Toggle play/pause simulation, picking up from current character position
  const handleTogglePlayPause = () => {
    if (useRealGps) {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      setUseRealGps(false);
      if (selectedRoute) {
        const prog = calculateRouteProgressFromCoords(currentCoords, selectedRoute);
        setSimulationProgress(prog);
      }
      setIsSimulating(true);
      setIsNavigating(true);
      return;
    }

    if (simulationProgress >= 1) {
      if (selectedRoute) {
        const prog = calculateRouteProgressFromCoords(currentCoords, selectedRoute);
        setSimulationProgress(prog < 0.95 ? prog : 0);
      } else {
        setSimulationProgress(0);
      }
      setIsSimulating(true);
    } else {
      setIsSimulating((prev) => !prev);
    }
  };

  // Live real-time distance and ETA from current phone location to destination
  const remainingMeters = computeDistanceMeters(currentCoords, endLandmark.coords);
  const etaMinutes = Math.max(1, Math.round(remainingMeters / 75));

  // Vampire HP & Sizzling Simulation loop
  useEffect(() => {
    const hpInterval = setInterval(() => {
      // If it's night (solar altitude <= 0), no sun burn! Safe vampire night walk.
      if (solarPosition.altitude <= 0) {
        setIsSizzling(false);
        setHp((prev) => Math.min(maxHp, prev + 1));
        return;
      }

      const uv = weather?.uvIndex ?? 7.5;
      const shadeRatio = currentShadeRatio;

      // Direct sun intensity = (1 - shadeRatio) * (uv / 10)
      let sunExposure = (1 - shadeRatio) * (uv / 8);

      // Gear mitigation
      if (gear.hasParasol) sunExposure *= 0.35; // 65% protection
      if (gear.hasSunscreen) sunExposure *= 0.70; // 30% protection
      if (gear.hasCloak) sunExposure *= 0.80; // 20% protection

      if (sunExposure > 0.35) {
        // Vampire is sizzling!
        setIsSizzling(true);
        const damage = Math.round(sunExposure * 2.2 * 10) / 10;
        setHp((prev) => Math.max(0, prev - damage));
      } else {
        // Safe shade or parasol protection: restore HP
        setIsSizzling(false);
        if (shadeRatio >= 0.75) {
          setHp((prev) => Math.min(maxHp, prev + 0.8));
        }
      }
    }, 1000);

    return () => clearInterval(hpInterval);
  }, [currentShadeRatio, weather, solarPosition, gear]);

  const handleToggleGear = (item: keyof VampireGear) => {
    setGear((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleMapClickForProposal = (coords: [number, number]) => {
    setProposalTargetCoords(coords);
    setIsProposeShadeOpen(true);
  };

  const handleUpvoteProposal = (id: string) => {
    const updated = upvoteProposal(id);
    setProposals(updated);
    setInspectedProposal((prev) => (prev && prev.id === id ? { ...prev, upvotes: prev.upvotes + 1 } : prev));
  };

  const handleOpenConceptPreview = (proposalOrId?: ShadeProposal | string | null) => {
    if (!proposalOrId) {
      setActivePreviewScene(CONCEPT_PREVIEW_SCENES['prop-1']);
      setIsConceptPreviewOpen(true);
      return;
    }

    if (typeof proposalOrId === 'string') {
      const found = CONCEPT_PREVIEW_SCENES[proposalOrId];
      if (found) {
        setActivePreviewScene(found);
      } else if (SPONSORED_STARTER_KITS[proposalOrId]) {
        setActivePreviewScene({
          id: `preview-${proposalOrId}`,
          streetName: 'Taichung Pedestrian Walkway Heat Trap',
          streetNameZh: '臺中示範行人遮陽廊道',
          district: 'Central & West District',
          coords: proposalTargetCoords || currentCoords,
          starterKitId: proposalOrId as any,
          beforeTemp: 39.5,
          afterTemp: 30.5,
          beforeShade: 15,
          afterShade: 90,
          uvIndexBefore: 11.2,
          uvIndexAfter: 2.2,
          upvotes: 42,
          beforeVisualSvg: '/starter_kits/before_sun.svg',
          afterVisualSvg: STARTER_KIT_AFTER_IMAGES[proposalOrId] || '/starter_kits/after_green_tunnel.svg',
        });
      } else {
        setActivePreviewScene(CONCEPT_PREVIEW_SCENES['prop-1']);
      }
      setIsConceptPreviewOpen(true);
      return;
    }

    // It is a ShadeProposal object
    const existing = CONCEPT_PREVIEW_SCENES[proposalOrId.id];
    if (existing) {
      setActivePreviewScene(existing);
    } else {
      const kitId = (
        ['vertical_green', 'misting_water', 'shade_sail', 'knitted_canopy'].includes(proposalOrId.category)
          ? proposalOrId.category
          : 'vertical_green'
      ) as 'vertical_green' | 'misting_water' | 'shade_sail' | 'knitted_canopy';

      setActivePreviewScene({
        id: proposalOrId.id,
        streetName: proposalOrId.addressName,
        streetNameZh: proposalOrId.categoryTitle,
        district: 'Taichung City',
        coords: proposalOrId.coords,
        starterKitId: kitId,
        beforeTemp: proposalOrId.urgency === 'critical_burn' ? 40.2 : 38.2,
        afterTemp: proposalOrId.urgency === 'critical_burn' ? 31.0 : 29.8,
        beforeShade: 12,
        afterShade: 91,
        uvIndexBefore: 11.4,
        uvIndexAfter: 2.3,
        upvotes: proposalOrId.upvotes,
        beforeVisualSvg: '/starter_kits/before_sun.svg',
        afterVisualSvg: STARTER_KIT_AFTER_IMAGES[kitId] || '/starter_kits/after_green_tunnel.svg',
      });
    }
    setIsConceptPreviewOpen(true);
  };

  const handleStartNavigation = (forceGps?: boolean, perspective?: 'rpg_3d' | 'map_2d') => {
    const shouldGps = forceGps !== undefined ? forceGps : useRealGps;
    setIsRouteSelectorOpen(false);
    setIsNavigating(true);
    if (perspective) {
      setViewPerspective(perspective);
    }
    setSimulationProgress(0);

    if (shouldGps) {
      if (!useRealGps) {
        toggleRealGps();
      }
      setIsSimulating(false);
      setFollowUser(true);
    } else {
      if (useRealGps && gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
        setUseRealGps(false);
      }
      setIsSimulating(true);
      if (selectedRoute && selectedRoute.allCoordinates.length > 0) {
        setCurrentCoords(selectedRoute.allCoordinates[0]);
      }
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setIsSimulating(false);
    setSimulationProgress(0);
  };

  const teleportToTaichung = () => {
    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    setUseRealGps(false);
    const station = TAICHUNG_LANDMARKS[0];
    const destination = TAICHUNG_LANDMARKS[4];
    setStartLandmark(station);
    setEndLandmark(destination);
    setCurrentCoords(station.coords);
    const newRoutes = generateCuratedRoutes(station, destination);
    setRoutes(newRoutes);
    setSelectedRoute(newRoutes[0]);
    setSimulationProgress(0);
    setIsSimulating(false);
  };

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 flex flex-col font-sans select-none pb-[max(env(safe-area-inset-bottom,0px),8px)]">
      {/* Top Vampire HUD Bar (Shown when exploring; hidden during active Google Maps turn navigation) */}
      {!isNavigating && (
        <>
          <VampireHud
            hp={hp}
            maxHp={maxHp}
            isSizzling={isSizzling}
            currentShadeRatio={currentShadeRatio}
            weather={weather}
            solarPosition={solarPosition}
            gear={gear}
            coolingTokens={coolingTokens}
            onToggleGear={handleToggleGear}
            onOpenDemographics={() => setIsDemographicsOpen(true)}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenCover={() => setIsCoverOpen(true)}
            onOpenRewards={() => setIsCoolingRewardsOpen(true)}
          />

          {/* Quick Google Maps Style Search & Route Planner Trigger */}
          <div className="mx-3 mt-1.5 pointer-events-auto z-20">
            <button
              onClick={() => setIsRouteSelectorOpen(true)}
              className="w-full bg-slate-900/90 hover:bg-slate-800/95 backdrop-blur-md border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl px-3 py-2 shadow-xl flex items-center justify-between text-left transition cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shrink-0">
                  <Navigation className="w-4 h-4 fill-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>{startLandmark.nameZh.split(' ')[0]} ➔ {endLandmark.nameZh.split(' ')[0]}</span>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-600/30">
                      {selectedRoute ? `${selectedRoute.averageShadePercentage}% Shade` : '95% Shade'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Search 45+ Taichung locations or tap to customize departure &amp; destination
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-bold text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-xl border border-emerald-600/50 shrink-0 ml-2 group-hover:bg-emerald-800 transition">
                Search
              </div>
            </button>
          </div>
        </>
      )}

      {/* Real GPS location notice when user is testing outside Taichung */}
      {useRealGps && computeDistanceMeters(currentCoords, [24.1477, 120.6736]) > 35000 && (
        <div className="mx-3 mt-1 pointer-events-auto bg-slate-900/95 border border-purple-500/50 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-purple-200 shadow-xl z-20">
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span className="text-[11px]">
              Phone GPS active at your location! Real-time path is tracking you.
            </span>
          </div>
          <button
            onClick={teleportToTaichung}
            className="px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition shrink-0 ml-2 cursor-pointer"
          >
            Teleport to Taichung Station
          </button>
        </div>
      )}

      {/* View Perspective Switcher Pill (3D RPG vs Dual PiP vs 2D Map) */}
      <div className="absolute top-20 right-3 z-30 pointer-events-auto flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-2xl">
        <button
          type="button"
          onClick={() => setViewPerspective('rpg_3d')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            viewPerspective === 'rpg_3d'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="RPG 3D Real-Time Road Perspective"
        >
          <span>🎮 3D RPG</span>
        </button>

        <button
          type="button"
          onClick={() => setViewPerspective('pip_split')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            viewPerspective === 'pip_split'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Dual 3D RPG + 2D Minimap Split View"
        >
          <span>🪟 Dual PiP</span>
        </button>

        <button
          type="button"
          onClick={() => setViewPerspective('map_2d')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            viewPerspective === 'map_2d'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          title="2D Top-Down Aerial Map"
        >
          <span>🗺️ 2D Map</span>
        </button>
      </div>

      {/* Main Fullscreen Interactive View: 3D RPG Perspective View AND / OR 2D Leaflet Map */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* 1. 3D RPG Road View (Human street level perspective & 3rd-person) */}
        {(viewPerspective === 'rpg_3d' || viewPerspective === 'pip_split') && selectedRoute && (
          <div className="absolute inset-0 w-full h-full z-0">
            <Rpg3dRoadView
              activeRoute={selectedRoute}
              currentSegment={activeSegment}
              currentSegmentIndex={activeSegmentIndex}
              progressPercent={simulationProgress * 100}
              simulationProgress={simulationProgress}
              isSimulating={isSimulating}
              simulationSpeed={simulationSpeed}
              useRealGps={useRealGps}
              solarPosition={solarPosition}
              weather={weather}
              gear={gear}
              isSizzling={isSizzling}
              hp={hp}
              maxHp={maxHp}
              currentCoords={currentCoords}
              coolingTokens={coolingTokens}
              onOpenRewards={() => setIsCoolingRewardsOpen(true)}
              onToggleGear={handleToggleGear}
              onTogglePlayPause={handleTogglePlayPause}
              onChangeSpeed={setSimulationSpeed}
              onToggleRealGps={toggleRealGps}
              onSwitchTo2dMap={() => setViewPerspective('map_2d')}
              onStopNavigation={handleStopNavigation}
              onOpenProposeShade={() => {
                setProposalTargetCoords(currentCoords);
                setIsProposeShadeOpen(true);
              }}
            />
          </div>
        )}

        {/* 2. 2D Interactive Leaflet Map (Full screen in map_2d mode; PiP card in pip_split mode; pre-cached full dimensions in rpg_3d) */}
        <div
          className={
            viewPerspective === 'map_2d'
              ? 'absolute inset-0 w-full h-full z-0 opacity-100 pointer-events-auto transition-opacity duration-200'
              : viewPerspective === 'pip_split'
              ? 'absolute top-32 right-3 w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-emerald-500/80 shadow-[0_15px_35px_rgba(0,0,0,0.85)] overflow-hidden z-20 pointer-events-auto bg-slate-900 transition-all duration-200'
              : 'absolute inset-0 w-full h-full z-0 opacity-0 pointer-events-none'
          }
        >
          <MapComponent
            currentCoords={currentCoords}
            startCoords={startLandmark.coords}
            endCoords={endLandmark.coords}
            activeRoute={selectedRoute}
            currentSegmentIndex={activeSegmentIndex}
            solarPosition={solarPosition}
            proposals={proposals}
            tileLayer={tileLayer}
            gear={gear}
            isSizzling={isSizzling}
            showArcadeLayer={showArcadeLayer}
            showCanopyLayer={showCanopyLayer}
            showProposalsLayer={showProposalsLayer}
            showShadowVectors={showShadowVectors}
            showTreeInventoryLayer={showTreeInventoryLayer}
            showThermalHeatLayer={showThermalHeatLayer}
            showCoolingOutlets={showCoolingOutlets}
            coolingTokens={coolingTokens}
            isNavigating={isNavigating}
            followUser={followUser}
            gpsAccuracy={gpsAccuracy}
            onMapClickForProposal={handleMapClickForProposal}
            onSelectProposal={(p) => setInspectedProposal(p)}
            onSelectHotspot={(hotspot) => {
              setProposalTargetCoords(hotspot.coords);
              setIsProposeShadeOpen(true);
            }}
            onUserPanMap={() => setFollowUser(false)}
            onOpenRewards={() => setIsCoolingRewardsOpen(true)}
            viewPerspective={viewPerspective}
          />
          {viewPerspective === 'pip_split' && (
            <div className="absolute bottom-1 right-1 bg-black/80 px-2 py-0.5 rounded text-[9px] text-emerald-400 font-mono font-bold pointer-events-none">
              2D Minimap
            </div>
          )}
        </div>
      </div>

      {/* Map Legend / Visual Guide (Visible when 2D map is active or in split view without overlapping 3D HUD) */}
      {viewPerspective === 'map_2d' && (
        <div className="absolute left-3 top-28 z-20 pointer-events-auto">
          <MapLegend
            showArcadeLayer={showArcadeLayer}
            showCanopyLayer={showCanopyLayer}
            showProposalsLayer={showProposalsLayer}
            showShadowVectors={showShadowVectors}
            showTreeInventoryLayer={showTreeInventoryLayer}
            showThermalHeatLayer={showThermalHeatLayer}
            showCoolingOutlets={showCoolingOutlets}
            onToggleArcade={setShowArcadeLayer}
            onToggleCanopy={setShowCanopyLayer}
            onToggleProposals={setShowProposalsLayer}
            onToggleShadows={setShowShadowVectors}
            onToggleTrees={setShowTreeInventoryLayer}
            onToggleThermal={setShowThermalHeatLayer}
            onToggleCoolingOutlets={setShowCoolingOutlets}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenRewards={() => setIsCoolingRewardsOpen(true)}
          />
        </div>
      )}
      {viewPerspective === 'pip_split' && (
        <div className="absolute right-3 top-[380px] sm:top-[420px] z-20 pointer-events-auto max-w-[200px]">
          <MapLegend
            showArcadeLayer={showArcadeLayer}
            showCanopyLayer={showCanopyLayer}
            showProposalsLayer={showProposalsLayer}
            showShadowVectors={showShadowVectors}
            showTreeInventoryLayer={showTreeInventoryLayer}
            showThermalHeatLayer={showThermalHeatLayer}
            showCoolingOutlets={showCoolingOutlets}
            onToggleArcade={setShowArcadeLayer}
            onToggleCanopy={setShowCanopyLayer}
            onToggleProposals={setShowProposalsLayer}
            onToggleShadows={setShowShadowVectors}
            onToggleTrees={setShowTreeInventoryLayer}
            onToggleThermal={setShowThermalHeatLayer}
            onToggleCoolingOutlets={setShowCoolingOutlets}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenRewards={() => setIsCoolingRewardsOpen(true)}
          />
        </div>
      )}

      {/* Floating Action Buttons (Right side) */}
      <div className="absolute right-3 top-28 z-20 flex flex-col gap-2">
        {/* Re-center / Locate */}
        <button
          onClick={() => {
            setFollowUser(true);
            setCurrentCoords([...currentCoords]);
          }}
          className={`w-10 h-10 rounded-2xl backdrop-blur-md border shadow-xl flex items-center justify-center transition cursor-pointer active:scale-95 ${
            followUser
              ? 'bg-rose-950/90 border-rose-500 text-rose-300'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-slate-500'
          }`}
          title="Center & Follow Vampire Walker"
        >
          <Crosshair className={`w-5 h-5 ${followUser ? 'text-rose-400 animate-spin-slow' : 'text-slate-300'}`} />
        </button>

        {/* Map Layers Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`w-10 h-10 rounded-2xl backdrop-blur-md border shadow-xl flex items-center justify-center transition cursor-pointer active:scale-95 ${
              showLayerMenu
                ? 'bg-purple-900 border-purple-500 text-white'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
            }`}
            title="Map Tile & Shade Layers"
          >
            <Layers className="w-5 h-5 text-purple-300" />
          </button>

          {/* Layers Popover Menu */}
          {showLayerMenu && (
            <div className="absolute right-12 top-0 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-2.5 z-30">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Map Style
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {(
                  [
                    { id: 'dark', label: 'Dark Matter 🌙' },
                    { id: 'satellite', label: 'Satellite 🛰️' },
                    { id: 'streets', label: 'Streets 🗺️' },
                    { id: 'topo', label: 'Topography ⛰️' },
                  ] as const
                ).map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setTileLayer(layer.id)}
                    className={`px-2 py-1.5 rounded-lg border text-left text-[11px] font-medium transition cursor-pointer ${
                      tileLayer === layer.id
                        ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>

              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-1 border-t border-slate-800">
                Taichung Shade Overlays
              </div>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer">
                  <span>🏛️ Covered Arcades (騎樓)</span>
                  <input
                    type="checkbox"
                    checked={showArcadeLayer}
                    onChange={(e) => setShowArcadeLayer(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer">
                  <span>🌳 Tree Canopies (綠園道)</span>
                  <input
                    type="checkbox"
                    checked={showCanopyLayer}
                    onChange={(e) => setShowCanopyLayer(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer">
                  <span>🏢 Route Building Shade Corridors</span>
                  <input
                    type="checkbox"
                    checked={showShadowVectors}
                    onChange={(e) => setShowShadowVectors(e.target.checked)}
                    className="accent-sky-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer">
                  <span>📍 Community Proposed Shades</span>
                  <input
                    type="checkbox"
                    checked={showProposalsLayer}
                    onChange={(e) => setShowProposalsLayer(e.target.checked)}
                    className="accent-rose-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Suggest Shade Floating Action Button */}
        <button
          onClick={() => {
            setProposalTargetCoords(currentCoords);
            setIsProposeShadeOpen(true);
          }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-purple-600 border border-rose-400/50 shadow-xl shadow-rose-950/60 flex items-center justify-center text-white transition cursor-pointer active:scale-95 animate-pulse"
          title="Suggest Shade at Current Location"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* In-App PWA Install Banner (When Installable) */}
      {isInstallable && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-950/60 border border-emerald-400/40 cursor-pointer transition active:scale-95 animate-bounce-slow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Android App (APK)</span>
          </button>
        </div>
      )}

      {/* Active Navigation Controls OR Bottom Dock */}
      <div className="mt-auto w-full z-20 pointer-events-none">
        {isNavigating && selectedRoute ? (
          <NavigationControls
            activeRoute={selectedRoute}
            currentSegment={activeSegment}
            currentSegmentIndex={activeSegmentIndex}
            totalSegments={selectedRoute.segments.length}
            progressPercent={simulationProgress * 100}
            isSimulating={isSimulating}
            simulationSpeed={simulationSpeed}
            useRealGps={useRealGps}
            remainingMeters={remainingMeters}
            etaMinutes={etaMinutes}
            followUser={followUser}
            voiceEnabled={voiceEnabled}
            hp={hp}
            maxHp={maxHp}
            isSizzling={isSizzling}
            gear={gear}
            coolingTokens={coolingTokens}
            startLandmark={startLandmark}
            endLandmark={endLandmark}
            onTogglePlayPause={handleTogglePlayPause}
            onChangeSpeed={(spd) => setSimulationSpeed(spd)}
            onToggleRealGps={toggleRealGps}
            onToggleFollowUser={() => setFollowUser(!followUser)}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
            onStopNavigation={handleStopNavigation}
            onOpenProposeShadeModal={() => {
              setProposalTargetCoords(currentCoords);
              setIsProposeShadeOpen(true);
            }}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenRewards={() => setIsCoolingRewardsOpen(true)}
            onToggleGear={handleToggleGear}
            viewPerspective={viewPerspective}
            onChangePerspective={(p) => setViewPerspective(p)}
          />
        ) : (
          <div className="space-y-2 pointer-events-auto">
            {/* Google Maps Style Route Floating Direction Bar */}
            {selectedRoute && (
              <div className="mx-3 bg-gradient-to-r from-slate-900 via-slate-900/98 to-slate-950 border-2 border-emerald-500/60 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white truncate">
                      {selectedRoute.name} ({selectedRoute.nameZh})
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40 shrink-0">
                      {selectedRoute.averageShadePercentage}% Shade
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-emerald-400">🚶 {etaMinutes} min</span>
                    <span>•</span>
                    <span>{remainingMeters > 1000 ? `${(remainingMeters / 1000).toFixed(1)} km` : `${remainingMeters} m`}</span>
                    <span>•</span>
                    <button
                      onClick={toggleRealGps}
                      className="text-[10px] font-semibold text-emerald-300 hover:underline flex items-center gap-0.5 cursor-pointer bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/40"
                      title="Toggle Real GPS mode"
                    >
                      <span className={`w-2 h-2 rounded-full ${useRealGps ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span>{useRealGps ? 'Real-Time GPS' : 'Virtual Sim'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleStartNavigation(true)}
                    className="py-2.5 px-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-950/60 flex items-center gap-1.5 cursor-pointer active:scale-95 border border-emerald-400/40"
                    title="Start Live Real-Time Navigation (Google Maps style)"
                  >
                    <Navigation className="w-4 h-4 fill-white" />
                    <span>Start • 即時導航</span>
                  </button>

                  <button
                    onClick={() => setIsRouteSelectorOpen(true)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
                    title="Change route strategy or customize departure/destination"
                  >
                    Routes
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Navigation Dock */}
            <div className="mx-3 mb-3 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 shadow-2xl flex items-center justify-around gap-1">
            {/* Cover / Welcome Portal */}
            <button
              onClick={() => setIsCoverOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 transition flex flex-col items-center gap-0.5 cursor-pointer active:scale-95"
              title="Open Cover & Concept Page"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-[10px] font-bold">Cover</span>
            </button>

            {/* Route Selector */}
            <button
              onClick={() => setIsRouteSelectorOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 hover:from-emerald-900/70 hover:to-teal-900/70 border border-emerald-500/40 text-white transition flex flex-col items-center gap-0.5 cursor-pointer active:scale-95"
            >
              <Navigation className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="text-[10px] font-bold">Routes</span>
            </button>

            {/* Propose Shade */}
            <button
              onClick={() => {
                setProposalTargetCoords(currentCoords);
                setIsProposeShadeOpen(true);
              }}
              className="flex-1 py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition flex flex-col items-center gap-0.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold">Propose</span>
            </button>

            {/* Analytics & Demographics */}
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition flex flex-col items-center gap-0.5 cursor-pointer active:scale-95"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold">Analytics</span>
            </button>

            {/* User Manual & Symbols Guide */}
            <button
              onClick={() => setIsManualOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/40 text-teal-200 transition flex flex-col items-center gap-0.5 cursor-pointer active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-bold">Manual</span>
            </button>

            {/* Android APK */}
            <button
              onClick={() => setIsAndroidInstallOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition flex flex-col items-center gap-0.5 cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold">APK / PWA</span>
            </button>

            {/* GitHub Push Guide */}
            <button
              onClick={() => setIsGitHubGuideOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition flex flex-col items-center gap-0.5 cursor-pointer active:scale-95"
            >
              <Github className="w-4 h-4 text-slate-300" />
              <span className="text-[10px] font-bold">GitHub</span>
            </button>
          </div>
        </div>
      )}
    </div>

      {/* Route Selector Modal / Bottom Sheet */}
      {isRouteSelectorOpen && selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <RouteSelector
            startLandmark={startLandmark}
            endLandmark={endLandmark}
            availableRoutes={routes}
            selectedRoute={selectedRoute}
            useRealGps={useRealGps}
            defaultPerspective={viewPerspective === 'map_2d' ? 'map_2d' : 'rpg_3d'}
            onSelectStart={handleSelectStart}
            onSelectEnd={handleSelectEnd}
            onSelectRoute={(r) => setSelectedRoute(r)}
            onToggleRealGps={(val) => {
              if (val !== useRealGps) toggleRealGps();
            }}
            onStartNavigation={handleStartNavigation}
            onClose={() => setIsRouteSelectorOpen(false)}
          />
        </div>
      )}

      {/* Propose Shade Modal */}
      {isProposeShadeOpen && (
        <ProposeShadeModal
          coords={proposalTargetCoords || currentCoords}
          userDemographics={userDemographics}
          onClose={() => setIsProposeShadeOpen(false)}
          onProposalCreated={(newProp) => {
            setProposals((prev) => [newProp, ...prev]);
            setCoolingTokens(getCoolingTokens());
          }}
          onOpenDemographics={() => {
            setIsProposeShadeOpen(false);
            setIsDemographicsOpen(true);
          }}
          onOpenConceptPreview={(kitId) => handleOpenConceptPreview(kitId)}
        />
      )}

      {/* Demographics Registration Modal */}
      {isDemographicsOpen && (
        <DemographicsModal
          currentDemographics={userDemographics}
          onClose={() => setIsDemographicsOpen(false)}
          onSave={(updated) => setUserDemographics(updated)}
        />
      )}

      {/* Analytics Dashboard Modal */}
      {isAnalyticsOpen && (
        <AnalyticsDashboard
          proposals={proposals}
          onProposalsUpdated={(updated) => setProposals(updated)}
          onClose={() => setIsAnalyticsOpen(false)}
          onFocusProposal={(p) => {
            setCurrentCoords(p.coords);
            setInspectedProposal(p);
          }}
          onOpenConceptPreview={(proposalId) => handleOpenConceptPreview(proposalId)}
        />
      )}

      {/* Android Install & APK Modal */}
      {isAndroidInstallOpen && (
        <AndroidInstallModal onClose={() => setIsAndroidInstallOpen(false)} />
      )}

      {/* GitHub Push Guide Modal */}
      {isGitHubGuideOpen && (
        <GitHubGuideModal onClose={() => setIsGitHubGuideOpen(false)} />
      )}

      {/* User Manual Modal */}
      {isManualOpen && (
        <UserManualModal
          onClose={() => setIsManualOpen(false)}
          onOpenRoutes={() => setIsRouteSelectorOpen(true)}
          onOpenPropose={() => {
            setProposalTargetCoords(currentCoords);
            setIsProposeShadeOpen(true);
          }}
          onOpenDemographics={() => setIsDemographicsOpen(true)}
          onOpenCover={() => setIsCoverOpen(true)}
        />
      )}

      {/* Cover Page Modal (Matching Image 2 with 4 Action Offerings) */}
      <CoverPageModal
        isOpen={isCoverOpen}
        onClose={() => setIsCoverOpen(false)}
        onStartExploring={() => {
          setIsCoverOpen(false);
          setIsNavigating(true);
          if (useRealGps) {
            setIsSimulating(false);
          } else {
            setIsSimulating(true);
          }
          setIsRouteSelectorOpen(false);
        }}
        onReportHotSpot={() => {
          setIsCoverOpen(false);
          setProposalTargetCoords(currentCoords);
          setIsProposeShadeOpen(true);
        }}
        onOpenProjects={() => {
          setIsCoverOpen(false);
          setActivePreviewScene(CONCEPT_PREVIEW_SCENES[0]);
          setIsConceptPreviewOpen(true);
        }}
        onOpenManual={() => {
          setIsCoverOpen(false);
          setIsManualOpen(true);
        }}
        onOpenAnalytics={() => {
          setIsCoverOpen(false);
          setIsAnalyticsOpen(true);
        }}
        onOpenDemographics={() => {
          setIsCoverOpen(false);
          setIsDemographicsOpen(true);
        }}
        onOpenAndroidInstall={() => {
          setIsCoverOpen(false);
          setIsAndroidInstallOpen(true);
        }}
        onOpenRewards={() => {
          setIsCoverOpen(false);
          setIsCoolingRewardsOpen(true);
        }}
        coolingTokens={coolingTokens}
        isInstallable={isInstallable}
        onInstallPWA={install}
      />

      {/* Cooling Tokens & Partner Outlets Rewards Hub Modal */}
      <CoolingRewardsModal
        isOpen={isCoolingRewardsOpen}
        onClose={() => setIsCoolingRewardsOpen(false)}
        tokens={coolingTokens}
        onTokensUpdated={(newBal) => setCoolingTokens(newBal)}
        onFlyToOutlet={(coords) => {
          setCurrentCoords(coords);
          setIsCoolingRewardsOpen(false);
          setViewPerspective('map_2d');
        }}
      />

      {/* AI Concept Preview Modal (Matching Image 2 Interactive Before vs After Slider) */}
      {isConceptPreviewOpen && (
        <ConceptPreviewModal
          scene={activePreviewScene}
          onClose={() => setIsConceptPreviewOpen(false)}
          onVote={(id) => handleUpvoteProposal(id)}
        />
      )}

      {/* Proposal Pin Detail Popover - With Hypothetical Live Image Installed (Image 2) */}
      {inspectedProposal && (
        <div className="fixed inset-x-3 bottom-24 sm:bottom-28 z-40 max-w-md mx-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                {CATEGORY_LABELS[inspectedProposal.category]?.icon || '☂️'}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                    Shade Infrastructure
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    {inspectedProposal.urgency === 'critical_burn' ? '🔥 40°C Heat Trap' : '☀️ High Heat'}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-0.5">
                  {inspectedProposal.categoryTitle}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {inspectedProposal.addressName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setInspectedProposal(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 italic bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 leading-snug">
            "{inspectedProposal.notes}"
          </p>

          {/* Hypothetical Live Image Installed at this Proposal Location */}
          <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-xl group bg-slate-950">
            <img
              src={
                STARTER_KIT_AFTER_IMAGES[inspectedProposal.category] ||
                inspectedProposal.photoUrl ||
                `/starter_kits/${inspectedProposal.category}.jpg`
              }
              alt="Hypothetical Live Urban Shade Installation"
              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Top Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400/60 text-[10px] font-black text-emerald-300 flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>HYPOTHETICAL LIVE SHADE</span>
              </span>
            </div>

            {/* Launch Comparison Slider Button */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end justify-between p-2.5">
              <div className="text-[10px] text-slate-200">
                <span className="text-emerald-300 font-bold">Projected:</span> -4.2°C Surface Temp
              </div>
              <button
                type="button"
                onClick={() => handleOpenConceptPreview(inspectedProposal)}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-black rounded-xl shadow-lg border border-white/20 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Open Before &amp; After (Image 2)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            <span>
              👤 {inspectedProposal.userDemographics?.nationality || 'Taichung Walker'} •{' '}
              {inspectedProposal.userDemographics?.ageGroup?.replace('_', '-') || 'Citizen'}
            </span>
            <button
              type="button"
              onClick={() => handleUpvoteProposal(inspectedProposal.id)}
              className="flex items-center gap-1.5 font-bold text-emerald-300 hover:text-emerald-200 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{inspectedProposal.upvotes} Upvotes · Support Installation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
