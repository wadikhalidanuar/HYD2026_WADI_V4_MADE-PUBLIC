import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  NavigationRoute,
  SolarPosition,
  ShadeProposal,
  TileLayerType,
  VampireGear,
  HeatIslandHotspot,
} from '../types';
import {
  TAICHUNG_ARCADE_NETWORKS,
  TAICHUNG_CANOPY_ZONES,
} from '../utils/taichungData';
import {
  TAICHUNG_HEAT_ISLAND_HOTSPOTS,
  TAICHUNG_XITUN_BEITUN_TREES,
} from '../data/taichungXitunBeitunData';
import {
  TAICHUNG_COOLING_OUTLETS,
  CoolingOutlet,
} from '../data/coolingOutletsData';
import { CATEGORY_LABELS, redeemCoolingTokens } from '../utils/storage';

interface MapComponentProps {
  currentCoords: [number, number];
  startCoords: [number, number];
  endCoords: [number, number];
  activeRoute: NavigationRoute | null;
  currentSegmentIndex: number;
  solarPosition: SolarPosition;
  proposals: ShadeProposal[];
  tileLayer: TileLayerType;
  gear: VampireGear;
  isSizzling: boolean;
  showArcadeLayer: boolean;
  showCanopyLayer: boolean;
  showProposalsLayer: boolean;
  showShadowVectors: boolean;
  showTreeInventoryLayer: boolean;
  showThermalHeatLayer: boolean;
  showCoolingOutlets?: boolean;
  coolingTokens?: number;
  isNavigating: boolean;
  followUser: boolean;
  gpsAccuracy?: number;
  simulationProgress?: number;
  isSimulating?: boolean;
  viewPerspective?: 'rpg_3d' | 'map_2d' | 'pip_split';
  onMapClickForProposal: (coords: [number, number]) => void;
  onSelectProposal: (proposal: ShadeProposal) => void;
  onSelectHotspot: (hotspot: HeatIslandHotspot) => void;
  onUserPanMap: () => void;
  onOpenRewards?: () => void;
}

const TILE_URLS: Record<
  TileLayerType,
  { url: string; attribution: string; subdomains?: string[]; maxNativeZoom?: number; maxZoom?: number }
> = {
  dark: {
    // 100% Watermark-Free CartoDB Dark Matter Tile Canvas
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '',
    subdomains: ['a', 'b', 'c', 'd'],
    maxNativeZoom: 20,
    maxZoom: 22,
  },
  satellite: {
    // 100% Clean Watermark-Free Satellite Imagery
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '',
    subdomains: ['0', '1', '2', '3'],
    maxNativeZoom: 20,
    maxZoom: 21,
  },
  google_satellite: {
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '',
    subdomains: ['0', '1', '2', '3'],
    maxNativeZoom: 20,
    maxZoom: 21,
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c'],
    maxNativeZoom: 19,
    maxZoom: 20,
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
    subdomains: ['a', 'b', 'c'],
    maxNativeZoom: 17,
    maxZoom: 19,
  },
};

export const MapComponent: React.FC<MapComponentProps> = ({
  currentCoords,
  startCoords,
  endCoords,
  activeRoute,
  currentSegmentIndex,
  solarPosition,
  proposals,
  tileLayer,
  gear,
  isSizzling,
  showArcadeLayer,
  showCanopyLayer,
  showProposalsLayer,
  showShadowVectors,
  showTreeInventoryLayer,
  showThermalHeatLayer,
  showCoolingOutlets = true,
  coolingTokens = 85,
  isNavigating,
  followUser,
  gpsAccuracy = 15,
  simulationProgress = 0,
  isSimulating = false,
  viewPerspective = 'map_2d',
  onMapClickForProposal,
  onSelectProposal,
  onSelectHotspot,
  onUserPanMap,
  onOpenRewards,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups for dynamic toggles
  const userMarkerLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const arcadesLayerRef = useRef<L.LayerGroup | null>(null);
  const canopiesLayerRef = useRef<L.LayerGroup | null>(null);
  const shadowsLayerRef = useRef<L.LayerGroup | null>(null);
  const proposalsLayerRef = useRef<L.LayerGroup | null>(null);
  const treesLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const outletsLayerRef = useRef<L.LayerGroup | null>(null);

  // Keep references to latest callbacks
  const onMapClickRef = useRef(onMapClickForProposal);
  onMapClickRef.current = onMapClickForProposal;
  const onSelectProposalRef = useRef(onSelectProposal);
  onSelectProposalRef.current = onSelectProposal;
  const onSelectHotspotRef = useRef(onSelectHotspot);
  onSelectHotspotRef.current = onSelectHotspot;
  const onUserPanMapRef = useRef(onUserPanMap);
  onUserPanMapRef.current = onUserPanMap;
  const onOpenRewardsRef = useRef(onOpenRewards);
  onOpenRewardsRef.current = onOpenRewards;

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: currentCoords,
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer
    const tileConf = TILE_URLS[tileLayer];
    tileLayerRef.current = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains || ['a', 'b', 'c'],
      className: '',
      maxNativeZoom: tileConf.maxNativeZoom || 19,
      maxZoom: tileConf.maxZoom || 20,
      keepBuffer: 12,
      updateWhenIdle: false,
      updateWhenZooming: true,
      crossOrigin: true,
    }).addTo(map);

    // Create layer groups
    userMarkerLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    arcadesLayerRef.current = L.layerGroup().addTo(map);
    canopiesLayerRef.current = L.layerGroup().addTo(map);
    shadowsLayerRef.current = L.layerGroup().addTo(map);
    proposalsLayerRef.current = L.layerGroup().addTo(map);
    treesLayerRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);
    outletsLayerRef.current = L.layerGroup().addTo(map);

    // User interaction pan/drag
    map.on('dragstart', () => onUserPanMapRef.current());
    map.on('click', (e) => {
      onMapClickRef.current([e.latlng.lat, e.latlng.lng]);
    });

    mapInstanceRef.current = map;

    // Set up ResizeObserver to immediately eliminate any black void when container dimensions change
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    };
    window.addEventListener('resize', handleWindowResize);

    // Multi-frame size invalidations to ensure 100% full tile coverage immediately
    const t0 = setTimeout(() => map.invalidateSize({ pan: false }), 20);
    const t1 = setTimeout(() => map.invalidateSize({ pan: false }), 100);
    const t2 = setTimeout(() => map.invalidateSize({ pan: false }), 300);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Invalidate size and update tiles whenever perspective or tileLayer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Immediately invalidate and re-run on subsequent animation ticks
    map.invalidateSize({ pan: false });
    const timer1 = setTimeout(() => map.invalidateSize({ pan: false }), 60);
    const timer2 = setTimeout(() => map.invalidateSize({ pan: false }), 180);
    const timer3 = setTimeout(() => map.invalidateSize({ pan: false }), 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [viewPerspective, tileLayer]);

  // 3. Update Tile Layer on tileLayer change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const tileConf = TILE_URLS[tileLayer];
    tileLayerRef.current = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains || ['a', 'b', 'c'],
      className: '',
      maxNativeZoom: tileConf.maxNativeZoom || 19,
      maxZoom: tileConf.maxZoom || 20,
      keepBuffer: 12,
      updateWhenIdle: false,
      updateWhenZooming: true,
      crossOrigin: true,
    }).addTo(map);

    map.invalidateSize({ pan: false });
  }, [tileLayer]);

  // 4. Update Camera / Follow User
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (followUser || viewPerspective === 'pip_split' || isSimulating) {
      map.panTo(currentCoords, { animate: true, duration: 0.5 });
    }
  }, [currentCoords, followUser, viewPerspective, isSimulating]);

  // 4. Render User Position Marker & Accuracy Circle
  useEffect(() => {
    const layer = userMarkerLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    // Accuracy Circle
    if (gpsAccuracy > 0) {
      const accuracyCircle = L.circle(currentCoords, {
        radius: Math.min(gpsAccuracy, 40),
        color: isSizzling ? '#f43f5e' : '#10b981',
        fillColor: isSizzling ? '#f43f5e' : '#10b981',
        fillOpacity: 0.15,
        weight: 1,
      });
      layer.addLayer(accuracyCircle);
    }

    // Avatar Icon HTML
    let gearEmojis = '';
    if (gear.hasParasol) gearEmojis += '☂️';
    if (gear.hasSunscreen) gearEmojis += '🛡️';
    if (gear.hasCloak) gearEmojis += '🦇';

    const progressPercentText =
      simulationProgress !== undefined && simulationProgress > 0
        ? `${Math.round(simulationProgress * 100)}%`
        : '';

    const avatarHtml = `
      <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
        ${
          isSimulating || viewPerspective === 'pip_split'
            ? `<div class="absolute -inset-3 rounded-full border-2 border-emerald-400 opacity-75 animate-ping pointer-events-none"></div>`
            : ''
        }
        <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 ${
          isSizzling
            ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.9)] animate-bounce'
            : 'bg-slate-900/90 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)] ring-2 ring-emerald-500/40'
        }">
          <span class="text-xl leading-none">🧛</span>
        </div>
        ${
          gearEmojis
            ? `<div class="absolute -top-2 -right-2 bg-slate-900 border border-slate-700 px-1 py-0.2 rounded-full text-[9px] shadow-sm">${gearEmojis}</div>`
            : ''
        }
        ${
          progressPercentText
            ? `<div class="absolute -bottom-5 bg-emerald-950/95 text-emerald-300 border border-emerald-500/80 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black whitespace-nowrap shadow-lg">👣 ${progressPercentText}</div>`
            : ''
        }
      </div>
    `;

    const userIcon = L.divIcon({
      html: avatarHtml,
      className: 'custom-vampire-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const userMarker = L.marker(currentCoords, { icon: userIcon, zIndexOffset: 1000 });
    userMarker.bindPopup(`
      <div class="p-3 text-xs bg-slate-900 text-slate-100 rounded-xl">
        <div class="font-bold text-sm text-emerald-400 mb-1">🧛 You (Vampire Shade Walker)</div>
        <div>Coordinates: ${currentCoords[0].toFixed(5)}, ${currentCoords[1].toFixed(5)}</div>
        ${
          progressPercentText
            ? `<div class="text-emerald-300 font-mono mt-1 font-bold">Progress: ${progressPercentText} completed</div>`
            : ''
        }
        <div class="mt-1 ${isSizzling ? 'text-rose-400 font-bold' : 'text-emerald-300'}">
          ${isSizzling ? '🔥 Sizzling in Direct Sunlight! Find Shade!' : '🛡️ Protected by Shade or Parasol'}
        </div>
      </div>
    `);
    layer.addLayer(userMarker);
  }, [currentCoords, gear, isSizzling, gpsAccuracy, isSimulating, simulationProgress, viewPerspective]);

  // 5. Render Active Route Segments, Traveled Trail, & Start/End Markers
  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    // Start Marker (A)
    const startIcon = L.divIcon({
      html: `<div class="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-lg">A</div>`,
      className: 'route-start-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const startMarker = L.marker(startCoords, { icon: startIcon });
    startMarker.bindPopup(`<div class="p-2 text-xs font-bold text-slate-900">Departure: Origin Point (A)</div>`);
    layer.addLayer(startMarker);

    // End Marker (B)
    const endIcon = L.divIcon({
      html: `<div class="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-lg">B</div>`,
      className: 'route-end-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const endMarker = L.marker(endCoords, { icon: endIcon });
    endMarker.bindPopup(`<div class="p-2 text-xs font-bold text-slate-900">Destination: Goal Landmark (B)</div>`);
    layer.addLayer(endMarker);

    if (!activeRoute) return;

    // Full Route Outline Halo
    const haloLine = L.polyline(activeRoute.allCoordinates, {
      color: '#0f172a',
      weight: 10,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    });
    layer.addLayer(haloLine);

    // Segmented color-coded polylines based on shade:
    // Green = very good shade (>=75%)
    // Yellow/Amber = partial shade (40-74%)
    // Red = critical no shade / unprotected (<40%)
    activeRoute.segments.forEach((seg, idx) => {
      let color = '#10b981'; // Green for very good shade
      let dashArray: string | undefined = undefined;

      if (seg.shadeRatio >= 0.75) {
        color = '#10b981'; // Green (very good shade)
      } else if (seg.shadeRatio >= 0.4) {
        color = '#f59e0b'; // Amber / Yellow (moderate shade)
      } else {
        color = '#ef4444'; // Red (critical no shade, unprotected from sun)
        dashArray = '6, 6';
      }

      const isCurrent = idx === currentSegmentIndex;
      const poly = L.polyline(seg.coordinates, {
        color,
        weight: isCurrent ? 8 : 6,
        opacity: isCurrent ? 1 : 0.88,
        dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      });

      poly.bindPopup(`
        <div class="p-2.5 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-1">
          <div class="font-bold text-white">${seg.name}</div>
          <div class="text-[11px] text-slate-300">${seg.description}</div>
          <div class="text-[10px] text-purple-300 font-mono">
            Shade: ${Math.round(seg.shadeRatio * 100)}% • Distance: ${seg.lengthMeters}m
          </div>
        </div>
      `);

      layer.addLayer(poly);
    });

    // 5b. Live Dynamic Traveled Trail Progression
    // Highlights the exact completed path behind the walking avatar in real time
    const allCoords = activeRoute.allCoordinates;
    if (allCoords.length >= 2 && simulationProgress !== undefined && simulationProgress > 0) {
      const splitIdx = Math.min(
        Math.floor(simulationProgress * (allCoords.length - 1)),
        allCoords.length - 1
      );
      const traveledPoints = [...allCoords.slice(0, splitIdx + 1), currentCoords];

      const traveledPoly = L.polyline(traveledPoints, {
        color: '#06b6d4', // Glowing Cyan Traveled Corridor
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });
      layer.addLayer(traveledPoly);
    }
  }, [
    activeRoute,
    currentSegmentIndex,
    startCoords,
    endCoords,
    currentCoords,
    simulationProgress,
    isSimulating,
  ]);

  // 6. Covered Arcades Layer (Qilou)
  useEffect(() => {
    const layer = arcadesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showArcadeLayer) return;

    TAICHUNG_ARCADE_NETWORKS.forEach((line) => {
      const arcadePoly = L.polyline(line, {
        color: '#c084fc',
        weight: 5,
        opacity: 0.75,
        lineCap: 'round',
      });
      arcadePoly.bindPopup(`
        <div class="p-2 text-xs bg-slate-900 text-white rounded-lg">
          <b class="text-purple-400">🏛️ Covered Arcade (騎樓 Ting-zai-jiao)</b>
          <p class="text-[10px] text-slate-300 mt-0.5">Continuous building overhang with 95% pedestrian shade.</p>
        </div>
      `);
      layer.addLayer(arcadePoly);
    });
  }, [showArcadeLayer]);

  // 7. Tree Canopies Polygons Layer
  useEffect(() => {
    const layer = canopiesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showCanopyLayer) return;

    TAICHUNG_CANOPY_ZONES.forEach((zone) => {
      const polygon = L.polygon(zone.coords, {
        color: '#10b981',
        fillColor: '#059669',
        fillOpacity: 0.25,
        weight: 1.5,
      });
      polygon.bindPopup(`
        <div class="p-2.5 text-xs bg-slate-900 text-white rounded-lg">
          <b class="text-emerald-400">🌳 ${zone.name}</b>
          <p class="text-[11px] text-slate-300 mt-1">Dense tree foliage blocking ~${Math.round(zone.shadeDensity * 100)}% of direct sunlight.</p>
        </div>
      `);
      layer.addLayer(polygon);
    });
  }, [showCanopyLayer]);

  // 8. Solar Building Shadows Corridors
  useEffect(() => {
    const layer = shadowsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showShadowVectors || !activeRoute) return;

    // Project shadow offset based on solar position
    const rad = (solarPosition.shadowDirection * Math.PI) / 180;
    const lenMeters = Math.min(30, (solarPosition.shadowMultiplier || 1.5) * 8);
    const dLat = (lenMeters * Math.cos(rad)) / 111000;
    const dLng = (lenMeters * Math.sin(rad)) / (111000 * Math.cos((24.1477 * Math.PI) / 180));

    activeRoute.allCoordinates.forEach((pt) => {
      const shadowEnd: [number, number] = [pt[0] + dLat, pt[1] + dLng];
      const shadowLine = L.polyline([pt, shadowEnd], {
        color: '#38bdf8',
        weight: 3,
        opacity: 0.6,
        dashArray: '3, 4',
      });
      layer.addLayer(shadowLine);
    });
  }, [showShadowVectors, solarPosition, activeRoute]);

  // 9. Community Proposals Pins
  useEffect(() => {
    const layer = proposalsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showProposalsLayer) return;

    proposals.forEach((prop) => {
      const info = CATEGORY_LABELS[prop.category] || { icon: '☂️' };
      const icon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full bg-slate-900 border-2 ${
            prop.urgency === 'critical_burn' ? 'border-rose-500' : 'border-purple-500'
          } flex items-center justify-center text-sm shadow-xl cursor-pointer hover:scale-110 transition-transform">
            ${info.icon}
          </div>
        `,
        className: 'proposal-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(prop.coords, { icon });
      marker.on('click', () => {
        onSelectProposalRef.current(prop);
      });

      layer.addLayer(marker);
    });
  }, [showProposalsLayer, proposals]);

  // 10. Tree Inventory Layer (Taichung_XitunBeitun_Tree.csv)
  useEffect(() => {
    const layer = treesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showTreeInventoryLayer) return;

    TAICHUNG_XITUN_BEITUN_TREES.forEach((tree) => {
      const icon = L.divIcon({
        html: `
          <div class="w-6 h-6 rounded-full bg-emerald-950/90 border border-emerald-400 flex items-center justify-center text-[11px] shadow-md cursor-pointer hover:scale-125 transition-transform">
            🌳
          </div>
        `,
        className: 'tree-survey-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(tree.coords, { icon });
      marker.bindPopup(`
        <div class="p-2.5 bg-slate-900 text-white rounded-xl text-xs space-y-1">
          <div class="font-bold text-emerald-400">${tree.commonNameZh}</div>
          <div class="text-[10px] text-slate-300 italic">${tree.scientificName}</div>
          <div class="text-[10px] text-slate-400">
            Height: <b>${tree.heightMeters}m</b> • Canopy: <b>${tree.canopyRadiusMeters * 2}m</b>
          </div>
          <div class="text-[9px] text-emerald-300">
            🌱 Carbon Offset: ~${tree.co2OffsetKgYear} kg/year
          </div>
        </div>
      `);

      layer.addLayer(marker);
    });
  }, [showTreeInventoryLayer]);

  // 11. Thermal Heat Island Hotspot Layer (Taichung Xitun Beitun Temp.tif)
  useEffect(() => {
    const layer = heatLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showThermalHeatLayer) return;

    TAICHUNG_HEAT_ISLAND_HOTSPOTS.forEach((hotspot) => {
      // Hotspot circle
      const circle = L.circle(hotspot.coords, {
        radius: 75,
        color: '#f43f5e',
        fillColor: '#e11d48',
        fillOpacity: 0.35,
        weight: 1.5,
      });

      const icon = L.divIcon({
        html: `
          <div class="px-1.5 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-[10px] font-black text-rose-300 flex items-center gap-0.5 shadow-lg cursor-pointer hover:scale-110 transition-transform">
            🔥 ${hotspot.surfaceTempCelsius}°C
          </div>
        `,
        className: 'heat-hotspot-pin',
        iconSize: [48, 20],
        iconAnchor: [24, 10],
      });

      const marker = L.marker(hotspot.coords, { icon });
      marker.on('click', () => {
        onSelectHotspotRef.current(hotspot);
      });

      layer.addLayer(circle);
      layer.addLayer(marker);
    });
  }, [showThermalHeatLayer]);

  // 12. Participating Cooling Outlets Layer (Taichung Urban Cooling Incentive Partners)
  useEffect(() => {
    const layer = outletsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (showCoolingOutlets === false) return;

    TAICHUNG_COOLING_OUTLETS.forEach((outlet) => {
      const userTokens = coolingTokens ?? 85;
      const canAfford = userTokens >= outlet.tokenCost;

      const customIcon = L.divIcon({
        className: 'custom-outlet-pin',
        html: `
          <div class="relative flex flex-col items-center group cursor-pointer filter hover:brightness-110 transition-transform">
            <div class="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 p-0.5 shadow-[0_4px_14px_rgba(245,158,11,0.55)] border-2 border-white flex items-center justify-center transform group-hover:scale-110 transition-all">
              <span class="text-base select-none">${outlet.icon}</span>
              <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
            </div>
            <div class="px-1.5 py-0.5 rounded-full bg-slate-900/95 border border-amber-400 text-[9px] font-black text-amber-300 shadow-lg -mt-1.5 whitespace-nowrap flex items-center gap-0.5">
              <span>🪙</span>
              <span>${outlet.tokenCost}</span>
            </div>
          </div>
        `,
        iconSize: [36, 46],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker(outlet.coords, { icon: customIcon });

      const popupHtml = `
        <div class="p-3 bg-slate-900 text-slate-100 rounded-2xl text-xs space-y-2 min-w-[240px] max-w-[280px] border border-amber-500/40 shadow-2xl">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div class="flex items-center gap-1.5">
              <span class="text-xl">${outlet.icon}</span>
              <div>
                <div class="font-black text-white text-sm leading-tight">${outlet.nameZh}</div>
                <div class="text-[10px] text-slate-400 leading-tight">${outlet.name}</div>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 font-black text-[10px] shrink-0">
              🪙 ${outlet.tokenCost} pts
            </span>
          </div>

          <div class="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-2 space-y-1">
            <div class="font-bold text-emerald-300 text-xs flex items-center gap-1">
              <span>🎁</span>
              <span>${outlet.offerTitle}</span>
            </div>
            <div class="text-[11px] text-slate-300 leading-snug">
              ${outlet.offerDetails}
            </div>
          </div>

          <div class="text-[10px] text-slate-400 flex items-center gap-1">
            <span>📍</span>
            <span class="truncate">${outlet.address}</span>
          </div>

          <div class="pt-1 flex items-center gap-2">
            <button
              id="outlet-redeem-${outlet.id}"
              class="flex-1 py-1.5 px-2 rounded-xl ${
                canAfford
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 font-medium'
              } text-xs transition cursor-pointer text-center shadow-md"
            >
              ${canAfford ? `Redeem Offer (🪙 ${outlet.tokenCost})` : `Need ${outlet.tokenCost} 🪙 (Have ${userTokens})`}
            </button>
            <button
              id="outlet-view-hub-${outlet.id}"
              class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700"
              title="Open Rewards Hub"
            >
              Rewards
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const redeemBtn = document.getElementById(`outlet-redeem-${outlet.id}`);
        if (redeemBtn) {
          redeemBtn.onclick = () => {
            if (canAfford) {
              const ok = redeemCoolingTokens(outlet.tokenCost, outlet.id, outlet.offerTitle);
              if (ok) {
                marker.closePopup();
                if (onOpenRewardsRef.current) {
                  onOpenRewardsRef.current();
                }
              }
            } else {
              if (onOpenRewardsRef.current) {
                onOpenRewardsRef.current();
              }
            }
          };
        }

        const hubBtn = document.getElementById(`outlet-view-hub-${outlet.id}`);
        if (hubBtn) {
          hubBtn.onclick = () => {
            if (onOpenRewardsRef.current) {
              onOpenRewardsRef.current();
            }
          };
        }
      });

      layer.addLayer(marker);
    });
  }, [showCoolingOutlets, coolingTokens]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
