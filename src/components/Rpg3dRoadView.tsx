import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  NavigationRoute,
  RouteSegment,
  SolarPosition,
  VampireGear,
  WeatherData,
} from '../types';
import {
  Eye,
  Compass,
  Sparkles,
  Umbrella,
  Shield,
  RefreshCw,
  Flame,
  CheckCircle,
  Play,
  Pause,
  Map,
  Footprints,
  CornerUpRight,
  CornerUpLeft,
  Coins,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TAICHUNG_COOLING_OUTLETS, CoolingOutlet } from '../data/coolingOutletsData';
import { TAICHUNG_XITUN_BEITUN_TREES } from '../data/taichungXitunBeitunData';
import { computeDistanceMeters } from '../utils/taichungData';

interface Rpg3dRoadViewProps {
  activeRoute: NavigationRoute;
  currentSegment: RouteSegment;
  currentSegmentIndex: number;
  progressPercent: number;
  simulationProgress: number;
  isSimulating: boolean;
  simulationSpeed?: number;
  useRealGps?: boolean;
  solarPosition: SolarPosition;
  weather: WeatherData | null;
  gear: VampireGear;
  isSizzling: boolean;
  hp: number;
  maxHp: number;
  currentCoords: [number, number];
  coolingTokens?: number;
  onToggleGear?: (item: keyof VampireGear) => void;
  onOpenProposeShade?: () => void;
  onTogglePlayPause?: () => void;
  onChangeSpeed?: (spd: number) => void;
  onToggleRealGps?: () => void;
  onSwitchTo2dMap?: () => void;
  onStopNavigation?: () => void;
  onOpenRewards?: () => void;
}

type CameraPerspective = 'rpg_3rd_person' | 'human_1st_person' | 'cinematic_overhead';
type GroundLayerMode = 'street' | 'satellite';

const PEDESTRIAN_X = 7.6;
const SIDEWALK_ELEVATION_Y = 0.28;
const NUM_ROAD_SLICES = 52;
const SLICE_STEP = 2.4; // meters per slice
const SLICE_START_DIST = -14; // start 14 meters behind avatar

interface PathSlice {
  center: { x: number; z: number };
  tangent: { x: number; z: number };
  normal: { x: number; z: number };
  dist: number;
  shadeRatio: number;
  isTurn: boolean;
}

// Helper to create a dynamic ribbon geometry
function createRibbonGeometry(numSlices: number) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(numSlices * 2 * 3);
  const uvs = new Float32Array(numSlices * 2 * 2);
  const colors = new Float32Array(numSlices * 2 * 3);
  const indices = new Uint16Array((numSlices - 1) * 6);

  let idx = 0;
  for (let i = 0; i < numSlices - 1; i++) {
    const v0 = i * 2;
    const v1 = i * 2 + 1;
    const v2 = (i + 1) * 2;
    const v3 = (i + 1) * 2 + 1;

    indices[idx++] = v0;
    indices[idx++] = v1;
    indices[idx++] = v2;

    indices[idx++] = v2;
    indices[idx++] = v1;
    indices[idx++] = v3;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  return geo;
}

// Helper to update a ribbon's vertex positions
function updateRibbonGeometry(
  geo: THREE.BufferGeometry,
  slices: PathSlice[],
  leftOffset: number,
  rightOffset: number,
  elevY: number,
  uvRepeatY: number = 0.2
) {
  const pos = geo.attributes.position.array as Float32Array;
  const uv = geo.attributes.uv.array as Float32Array;

  for (let i = 0; i < slices.length; i++) {
    const s = slices[i];
    // Left vertex
    pos[i * 6 + 0] = s.center.x + s.normal.x * leftOffset;
    pos[i * 6 + 1] = elevY;
    pos[i * 6 + 2] = s.center.z + s.normal.z * leftOffset;

    // Right vertex
    pos[i * 6 + 3] = s.center.x + s.normal.x * rightOffset;
    pos[i * 6 + 4] = elevY;
    pos[i * 6 + 5] = s.center.z + s.normal.z * rightOffset;

    const v = s.dist * uvRepeatY;
    uv[i * 4 + 0] = 0;
    uv[i * 4 + 1] = v;
    uv[i * 4 + 2] = 1;
    uv[i * 4 + 3] = v;
  }

  geo.attributes.position.needsUpdate = true;
  geo.attributes.uv.needsUpdate = true;
  geo.computeVertexNormals();
}

// Dynamic Guidance Ribbon with Color-Coded Shade per slice (Green=Safe, Yellow=Moderate, Red=Sun Trap)
function updateGuidanceRibbonWithShade(
  geo: THREE.BufferGeometry,
  slices: PathSlice[],
  leftOffset: number,
  rightOffset: number,
  elevY: number
) {
  const pos = geo.attributes.position.array as Float32Array;
  const colors = geo.attributes.color.array as Float32Array;

  for (let i = 0; i < slices.length; i++) {
    const s = slices[i];
    pos[i * 6 + 0] = s.center.x + s.normal.x * leftOffset;
    pos[i * 6 + 1] = elevY;
    pos[i * 6 + 2] = s.center.z + s.normal.z * leftOffset;

    pos[i * 6 + 3] = s.center.x + s.normal.x * rightOffset;
    pos[i * 6 + 4] = elevY;
    pos[i * 6 + 5] = s.center.z + s.normal.z * rightOffset;

    // Color code based on shade ratio: Green >= 0.75, Yellow 0.40-0.74, Red < 0.40
    let r = 0.06;
    let g = 0.72;
    let b = 0.50; // Emerald
    if (s.shadeRatio < 0.40) {
      r = 0.95;
      g = 0.20;
      b = 0.20; // Red
    } else if (s.shadeRatio < 0.75) {
      r = 0.96;
      g = 0.62;
      b = 0.04; // Amber
    }

    colors[i * 6 + 0] = r;
    colors[i * 6 + 1] = g;
    colors[i * 6 + 2] = b;
    colors[i * 6 + 3] = r;
    colors[i * 6 + 4] = g;
    colors[i * 6 + 5] = b;
  }

  geo.attributes.position.needsUpdate = true;
  geo.attributes.color.needsUpdate = true;
  geo.computeVertexNormals();
}

// Procedural Tree Generator - 4 Taichung Species from Open Data
function createProceduralTaichungTree(speciesIdx: number = 0): THREE.Group {
  const group = new THREE.Group();

  // Bark trunk
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 3.4, 8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.9,
    metalness: 0.05,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.7;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // Varied canopy styles based on Taichung open data trees
  if (speciesIdx % 4 === 0) {
    // 臺灣欒樹 (Taiwan Golden Rain Tree) - layered golden-green crown
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.7,
      metalness: 0.05,
    });
    const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), leafMat);
    c1.position.set(0, 3.8, 0);
    c1.castShadow = true;
    group.add(c1);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc0ca33,
      roughness: 0.6,
    });
    const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), goldMat);
    c2.position.set(0.3, 4.6, 0.2);
    c2.castShadow = true;
    group.add(c2);
  } else if (speciesIdx % 4 === 1) {
    // 樟樹 (Camphor Tree) - broad rounded deep emerald dome
    const camphorMat = new THREE.MeshStandardMaterial({
      color: 0x1b5e20,
      roughness: 0.65,
    });
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), camphorMat);
    c1.position.set(0, 4.2, 0);
    c1.scale.set(1.1, 0.9, 1.1);
    c1.castShadow = true;
    group.add(c1);
  } else if (speciesIdx % 4 === 2) {
    // 榕樹 (Chinese Banyan) - wide spreading umbrella canopy
    const banyanMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.75,
    });
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 1.8, 1.4, 8), banyanMat);
    c1.position.set(0, 4.0, 0);
    c1.castShadow = true;
    group.add(c1);
  } else {
    // 小葉欖仁 (Madagascar Almond) - 3 tiered pagoda tiers
    const almondMat = new THREE.MeshStandardMaterial({
      color: 0x43a047,
      roughness: 0.6,
    });
    for (let t = 0; t < 3; t++) {
      const tier = new THREE.Mesh(
        new THREE.ConeGeometry(1.8 - t * 0.4, 0.8, 8),
        almondMat
      );
      tier.position.set(0, 3.0 + t * 0.9, 0);
      tier.castShadow = true;
      group.add(tier);
    }
  }

  return group;
}

// Procedural Taichung Taiwanese Shophouse (騎樓街屋) Generator
function createTaichungShophouse(type: number = 0, title: string = '臺中老街'): THREE.Group {
  const building = new THREE.Group();

  const colors = [0xd6d3d1, 0xe7e5e4, 0xfecdd3, 0xfef08a, 0xbae6fd];
  const wallColor = colors[type % colors.length];
  const height = 8 + (type % 4) * 2.5; // 3 to 5 floors

  // Main upper facade
  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.85,
    metalness: 0.05,
  });
  const wallGeo = new THREE.BoxGeometry(7.5, height - 3.8, 6.0);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 3.8 + (height - 3.8) / 2, 0);
  wall.castShadow = true;
  wall.receiveShadow = true;
  building.add(wall);

  // Ground Floor Covered Arcade (騎樓) Columns
  const columnMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.7 });
  const colGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.8, 8);
  const col1 = new THREE.Mesh(colGeo, columnMat);
  col1.position.set(-3.2, 1.9, 2.7);
  col1.castShadow = true;
  building.add(col1);

  const col2 = new THREE.Mesh(colGeo, columnMat);
  col2.position.set(3.2, 1.9, 2.7);
  col2.castShadow = true;
  building.add(col2);

  // Arcade Ceiling
  const ceilGeo = new THREE.BoxGeometry(7.5, 0.3, 3.2);
  const ceil = new THREE.Mesh(ceilGeo, columnMat);
  ceil.position.set(0, 3.8, 1.4);
  ceil.castShadow = true;
  building.add(ceil);

  // Traditional Signboard (招牌)
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 64;
  const sCtx = signCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = type % 2 === 0 ? '#b91c1c' : '#0369a1';
    sCtx.fillRect(0, 0, 256, 64);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 26px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText(title, 128, 32);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 0.1), signMat);
  signMesh.position.set(0, 3.4, 2.9);
  building.add(signMesh);

  // Windows on upper floors
  const winMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.2,
    metalness: 0.8,
  });
  const winGeo = new THREE.BoxGeometry(1.2, 1.4, 0.15);
  for (let f = 5.2; f < height - 1; f += 2.2) {
    for (let wx = -2.2; wx <= 2.2; wx += 2.2) {
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(wx, f, 3.0);
      building.add(win);
    }
  }

  return building;
}

// Procedural 3D Cooling Outlet Kiosk
function createCoolingOutletKiosk(outlet: CoolingOutlet): THREE.Group {
  const group = new THREE.Group();

  // Kiosk Base
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.5 });
  const baseGeo = new THREE.BoxGeometry(3.6, 3.2, 2.5);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(0, 1.6, 0);
  base.castShadow = true;
  group.add(base);

  // Striped Awning
  const awningMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.4,
  });
  const awning = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.8, 4), awningMat);
  awning.rotation.y = Math.PI / 4;
  awning.position.set(0, 3.4, 0.6);
  awning.castShadow = true;
  group.add(awning);

  // Floating 3D Token Coin
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.2,
  });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16), coinMat);
  coin.rotation.x = Math.PI / 2;
  coin.position.set(0, 4.4, 0.6);
  coin.name = 'token_coin';
  group.add(coin);

  // Sign with Outlet Name
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 96);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${outlet.icon} ${outlet.nameZh.slice(0, 6)}`, 128, 40);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`🪙 -${outlet.tokenCost} pts Discount`, 128, 75);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 1.0),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  sign.position.set(0, 2.6, 1.3);
  group.add(sign);

  return group;
}

export const Rpg3dRoadView: React.FC<Rpg3dRoadViewProps> = ({
  activeRoute,
  currentSegment,
  currentSegmentIndex,
  progressPercent,
  simulationProgress,
  isSimulating,
  simulationSpeed = 1,
  useRealGps = false,
  solarPosition,
  weather,
  gear,
  isSizzling,
  hp,
  maxHp,
  currentCoords,
  coolingTokens = 85,
  onToggleGear,
  onOpenProposeShade,
  onTogglePlayPause,
  onChangeSpeed,
  onToggleRealGps,
  onSwitchTo2dMap,
  onStopNavigation,
  onOpenRewards,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<CameraPerspective>('human_1st_person');
  const [groundMode, setGroundMode] = useState<GroundLayerMode>('street');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  // References to keep props up to date in the render loop without closure bugs
  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const isSimulatingRef = useRef(isSimulating);
  isSimulatingRef.current = isSimulating;

  const simulationProgressRef = useRef(simulationProgress);
  simulationProgressRef.current = simulationProgress;

  const simulationSpeedRef = useRef(simulationSpeed);
  simulationSpeedRef.current = simulationSpeed;

  const currentCoordsRef = useRef(currentCoords);
  currentCoordsRef.current = currentCoords;

  const activeRouteRef = useRef(activeRoute);
  activeRouteRef.current = activeRoute;

  const currentSegmentRef = useRef(currentSegment);
  currentSegmentRef.current = currentSegment;

  const currentSegmentIndexRef = useRef(currentSegmentIndex);
  currentSegmentIndexRef.current = currentSegmentIndex;

  const isSizzlingRef = useRef(isSizzling);
  isSizzlingRef.current = isSizzling;

  const gearRef = useRef(gear);
  gearRef.current = gear;

  const groundModeRef = useRef(groundMode);
  groundModeRef.current = groundMode;

  const useRealGpsRef = useRef(useRealGps);
  useRealGpsRef.current = useRealGps;

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Mesh | null>(null);
  const rightLegRef = useRef<THREE.Mesh | null>(null);
  const capeMeshRef = useRef<THREE.Mesh | null>(null);
  const parasolGroupRef = useRef<THREE.Group | null>(null);
  const auraMeshRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const mistParticlesRef = useRef<THREE.Points | null>(null);
  const sizzlingEmberParticlesRef = useRef<THREE.Points | null>(null);
  const roadSceneryGroupRef = useRef<THREE.Group | null>(null);
  const dynamicRoadElementsRef = useRef<THREE.Group | null>(null);
  const roadsidePropsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Dynamic road ribbon geometries
  const roadGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const rightSidewalkGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const leftSidewalkGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const guidanceRibbonGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const arcadeRoofGeoRef = useRef<THREE.BufferGeometry | null>(null);

  // Textures & materials
  const roadTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const sidewalkTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const streetGroundMatRef = useRef<THREE.Material | null>(null);
  const satelliteGroundMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);

  // Drag interaction for looking around
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraYawOffsetRef = useRef<number>(0);
  const cameraPitchOffsetRef = useRef<number>(0);

  // Dynamic turning & banking refs for RPG character
  const avatarTurnYawRef = useRef<number>(0);
  const avatarBankRef = useRef<number>(0);

  // Reusable prop instances cache
  const roadsideObjectsRef = useRef<THREE.Object3D[]>([]);

  // Shade level metrics
  const isGoodShade = currentSegment.shadeRatio >= 0.75;
  const isModerateShade = currentSegment.shadeRatio >= 0.4 && currentSegment.shadeRatio < 0.75;
  const currentShadeColor = isGoodShade ? '#10b981' : isModerateShade ? '#f59e0b' : '#ef4444';

  // Helper to extract upcoming turn info directly from the 2D activeRoute polyline
  const getUpcomingTurnInfo = () => {
    const route = activeRouteRef.current;
    const coords = currentCoordsRef.current;
    if (!route || !route.allCoordinates || route.allCoordinates.length < 2) {
      return {
        cornerDist: 35,
        turnType: 'straight' as const,
        nextStreetName: 'Taichung Boulevard',
        nextShadeRatio: 0.9,
      };
    }

    const pts = route.allCoordinates;

    // Find closest index on polyline
    let minD = Infinity;
    let closestIdx = 0;
    for (let i = 0; i < pts.length; i++) {
      const d = computeDistanceMeters(coords, pts[i]);
      if (d < minD) {
        minD = d;
        closestIdx = i;
      }
    }

    // Determine current bearing
    const nextIdx = Math.min(closestIdx + 1, pts.length - 1);
    const p0 = pts[closestIdx];
    const p1 = pts[nextIdx];
    const dLng0 = p1[1] - p0[1];
    const dLat0 = p1[0] - p0[0];
    const currentBearing = Math.atan2(dLng0 * Math.cos((p0[0] * Math.PI) / 180), dLat0);

    // Look ahead along polyline for a turn
    let accumulatedDist = 0;
    for (let i = closestIdx; i < pts.length - 1; i++) {
      const legDist = computeDistanceMeters(pts[i], pts[i + 1]);
      accumulatedDist += legDist;

      const dLngA = pts[i + 1][1] - pts[i][1];
      const dLatA = pts[i + 1][0] - pts[i][0];
      const legBearing = Math.atan2(dLngA * Math.cos((pts[i][0] * Math.PI) / 180), dLatA);

      let diff = legBearing - currentBearing;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      const diffDeg = (diff * 180) / Math.PI;
      if (Math.abs(diffDeg) >= 20) {
        const segIdx = currentSegmentIndexRef.current;
        const nextSeg = route.segments[segIdx + 1] || route.segments[segIdx];
        return {
          cornerDist: Math.max(5, accumulatedDist),
          turnType: diffDeg > 0 ? ('right' as const) : ('left' as const),
          nextStreetName: nextSeg.name || nextSeg.streetName || 'Side Street',
          nextShadeRatio: nextSeg.shadeRatio ?? 0.85,
        };
      }
    }

    const curSeg = currentSegmentRef.current;
    return {
      cornerDist: 40,
      turnType: 'straight' as const,
      nextStreetName: curSeg.name || 'Destination',
      nextShadeRatio: curSeg.shadeRatio,
    };
  };

  // Helper to build asphalt road texture
  const createAsphaltTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#1e242d';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 15000; i++) {
      const x = Math.floor(Math.random() * 512);
      const y = Math.floor(Math.random() * 512);
      ctx.fillStyle = Math.random() > 0.5 ? '#151920' : '#28313d';
      ctx.fillRect(x, y, 1, 1);
    }

    // Yellow center lines
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(250, 512);
    ctx.moveTo(262, 0);
    ctx.lineTo(262, 512);
    ctx.stroke();

    // White outer shoulders
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(28, 512);
    ctx.moveTo(484, 0);
    ctx.lineTo(484, 512);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Helper to build sidewalk paver texture
  const createSidewalkTileTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#5c6b7d';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        ctx.fillStyle = (x + y) % (tileSize * 2) === 0 ? '#4f5d6e' : '#69798c';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        ctx.strokeStyle = '#384350';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Yellow tactile strip
    ctx.fillStyle = '#eab308';
    ctx.fillRect(215, 0, 70, 512);
    ctx.fillStyle = '#ca8a04';
    for (let ty = 0; ty < 512; ty += 28) {
      ctx.fillRect(222, ty + 4, 56, 10);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // 1. Initialize Scene & Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const isNight = solarPosition.altitude <= 0;
    scene.background = new THREE.Color(isNight ? 0x050811 : 0x76bde8);
    scene.fog = new THREE.FogExp2(isNight ? 0x090e1a : 0xb0e0f8, 0.011);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 600);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Warm Key Light + Cool Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(
      isNight ? 0x1e293b : 0xe0f2fe,
      0x1e293b,
      isNight ? 0.45 : 0.75
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, isNight ? 0.15 : 1.35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 180;
    const d = 45;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;

    const altRad = Math.max(0.12, (solarPosition.altitude * Math.PI) / 180);
    const azRad = (solarPosition.azimuth * Math.PI) / 180;
    const sunDist = 70;
    sunLight.position.set(
      Math.sin(azRad) * Math.cos(altRad) * sunDist,
      Math.sin(altRad) * sunDist,
      Math.cos(azRad) * Math.cos(altRad) * sunDist
    );
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Road Scenery Root Group
    const sceneryGroup = new THREE.Group();
    scene.add(sceneryGroup);
    roadSceneryGroupRef.current = sceneryGroup;

    // Ground Plane Materials
    const streetGroundMat = new THREE.MeshStandardMaterial({
      color: 0x18202c,
      roughness: 0.95,
      metalness: 0.05,
    });
    streetGroundMatRef.current = streetGroundMat;

    // Real Aerial Satellite Texture for Taichung Ground
    const satelliteGroundMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.85,
      metalness: 0.1,
    });
    satelliteGroundMatRef.current = satelliteGroundMat;

    // Base Terrain Mesh
    const groundGeo = new THREE.PlaneGeometry(350, 500);
    const groundMesh = new THREE.Mesh(
      groundGeo,
      groundMode === 'satellite' ? satelliteGroundMat : streetGroundMat
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    sceneryGroup.add(groundMesh);
    groundMeshRef.current = groundMesh;

    // Load initial real satellite aerial image for Taichung coordinates
    const lat = currentCoords[0];
    const lng = currentCoords[1];
    const zoom = 17;
    const n = Math.pow(2, zoom);
    const tileX = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const tileY = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );
    const satUrl = `https://mt1.google.com/vt/lyrs=s&x=${tileX}&y=${tileY}&z=${zoom}`;

    new THREE.TextureLoader().load(
      satUrl,
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
        tex.colorSpace = THREE.SRGBColorSpace;
        satelliteGroundMat.map = tex;
        satelliteGroundMat.needsUpdate = true;
      },
      undefined,
      () => {
        satelliteGroundMat.color.setHex(0x1e293b);
      }
    );

    // DYNAMIC ROAD RIBBON MESHES (Synchronized with 2D Turning!)
    const dynamicRoadElements = new THREE.Group();
    sceneryGroup.add(dynamicRoadElements);
    dynamicRoadElementsRef.current = dynamicRoadElements;

    // 1. Asphalt Road Mesh
    const roadTexture = createAsphaltTexture();
    roadTextureRef.current = roadTexture;
    const roadGeo = createRibbonGeometry(NUM_ROAD_SLICES);
    roadGeoRef.current = roadGeo;
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.85,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const curvedRoadMesh = new THREE.Mesh(roadGeo, roadMat);
    curvedRoadMesh.receiveShadow = true;
    dynamicRoadElements.add(curvedRoadMesh);

    // 2. Right Pedestrian Sidewalk
    const swTex = createSidewalkTileTexture();
    sidewalkTextureRef.current = swTex;
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: swTex || undefined,
      roughness: 0.75,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const rightSidewalkGeo = createRibbonGeometry(NUM_ROAD_SLICES);
    rightSidewalkGeoRef.current = rightSidewalkGeo;
    const curvedRightSidewalk = new THREE.Mesh(rightSidewalkGeo, sidewalkMat);
    curvedRightSidewalk.receiveShadow = true;
    dynamicRoadElements.add(curvedRightSidewalk);

    // 3. Left Sidewalk
    const leftSidewalkGeo = createRibbonGeometry(NUM_ROAD_SLICES);
    leftSidewalkGeoRef.current = leftSidewalkGeo;
    const curvedLeftSidewalk = new THREE.Mesh(leftSidewalkGeo, sidewalkMat);
    curvedLeftSidewalk.receiveShadow = true;
    dynamicRoadElements.add(curvedLeftSidewalk);

    // 4. Safe Shade Guidance Path Ribbon with dynamic vertex colors
    const guidanceRibbonGeo = createRibbonGeometry(NUM_ROAD_SLICES);
    guidanceRibbonGeoRef.current = guidanceRibbonGeo;
    const guidanceMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const curvedGuidanceMesh = new THREE.Mesh(guidanceRibbonGeo, guidanceMat);
    dynamicRoadElements.add(curvedGuidanceMesh);

    // 5. Covered Arcade Roof (騎樓) over sidewalk
    const arcadeRoofGeo = createRibbonGeometry(NUM_ROAD_SLICES);
    arcadeRoofGeoRef.current = arcadeRoofGeo;
    const arcadeRoofMat = new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    const curvedArcadeRoof = new THREE.Mesh(arcadeRoofGeo, arcadeRoofMat);
    curvedArcadeRoof.castShadow = true;
    curvedArcadeRoof.receiveShadow = true;
    dynamicRoadElements.add(curvedArcadeRoof);

    // 6. Dynamic Roadside Props Group (3D Taiwanese Shophouses, Trees, Outlets)
    const roadsidePropsGroup = new THREE.Group();
    sceneryGroup.add(roadsidePropsGroup);
    roadsidePropsGroupRef.current = roadsidePropsGroup;

    // 7. 3D Vampire Hero Character Model
    const charGroup = new THREE.Group();

    // Torso / Gothic Doublet
    const torsoGeo = new THREE.BoxGeometry(0.68, 1.0, 0.42);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    charGroup.add(torso);

    // Silver Brooch
    const broochGeo = new THREE.OctahedronGeometry(0.08);
    const broochMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const brooch = new THREE.Mesh(broochGeo, broochMat);
    brooch.position.set(0, 1.55, 0.23);
    charGroup.add(brooch);

    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.3 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.05;
    head.castShadow = true;
    charGroup.add(head);

    // Crimson Eyes
    const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 2.08, 0.28);
    charGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 2.08, 0.28);
    charGroup.add(rightEye);

    // Smile
    const mouthGeo = new THREE.BoxGeometry(0.12, 0.03, 0.04);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x881337 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 1.95, 0.29);
    charGroup.add(mouth);

    // Hair
    const hairGeo = new THREE.ConeGeometry(0.32, 0.45, 8);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.rotation.x = Math.PI;
    hair.position.set(0, 2.2, -0.06);
    charGroup.add(hair);

    // High Standing Collar
    const collarGeo = new THREE.BoxGeometry(0.72, 0.45, 0.08);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x4c0519, roughness: 0.4 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 1.85, -0.22);
    charGroup.add(collar);

    // Cloak
    const capeGeo = new THREE.PlaneGeometry(0.9, 1.4);
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      side: THREE.DoubleSide,
      roughness: 0.35,
    });
    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, 1.25, -0.25);
    cape.castShadow = true;
    charGroup.add(cape);
    capeMeshRef.current = cape;

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.85, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x020617 });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.45, 0);
    leftLeg.castShadow = true;
    charGroup.add(leftLeg);
    leftLegRef.current = leftLeg;

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.45, 0);
    rightLeg.castShadow = true;
    charGroup.add(rightLeg);
    rightLegRef.current = rightLeg;

    // UV Parasol Shield
    const parasolGroup = new THREE.Group();
    const parasolCanopyGeo = new THREE.ConeGeometry(1.0, 0.38, 16, 1, true);
    const parasolMat = new THREE.MeshStandardMaterial({
      color: 0x6b21a8,
      side: THREE.DoubleSide,
      roughness: 0.25,
    });
    const parasolCanopy = new THREE.Mesh(parasolCanopyGeo, parasolMat);
    parasolCanopy.position.set(0.35, 2.65, 0);
    parasolCanopy.castShadow = true;
    parasolGroup.add(parasolCanopy);

    const parasolHandleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.15, 8);
    const parasolHandleMat = new THREE.MeshBasicMaterial({ color: 0xe4e4e7 });
    const parasolHandle = new THREE.Mesh(parasolHandleGeo, parasolHandleMat);
    parasolHandle.position.set(0.35, 2.05, 0);
    parasolGroup.add(parasolHandle);

    parasolGroup.visible = gear.hasParasol;
    charGroup.add(parasolGroup);
    parasolGroupRef.current = parasolGroup;

    // Sunscreen Aura
    const auraGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: gear.hasSunscreen ? 0.35 : 0,
      wireframe: true,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.y = 1.35;
    charGroup.add(auraMesh);
    auraMeshRef.current = auraMesh;

    charGroup.position.set(PEDESTRIAN_X, SIDEWALK_ELEVATION_Y, 0);
    scene.add(charGroup);
    characterGroupRef.current = charGroup;

    // Particles: Cooling Mist
    const mistCount = 180;
    const mistGeo = new THREE.BufferGeometry();
    const mistPos = new Float32Array(mistCount * 3);
    for (let i = 0; i < mistCount * 3; i += 3) {
      mistPos[i] = PEDESTRIAN_X + (Math.random() - 0.5) * 4;
      mistPos[i + 1] = 0.5 + Math.random() * 4.0;
      mistPos[i + 2] = (Math.random() - 0.5) * 60;
    }
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
    const mistMat = new THREE.PointsMaterial({
      color: 0xbbf7d0,
      size: 0.16,
      transparent: true,
      opacity: 0.65,
    });
    const mistParticles = new THREE.Points(mistGeo, mistMat);
    sceneryGroup.add(mistParticles);
    mistParticlesRef.current = mistParticles;

    // Particles: Sizzling Embers
    const emberCount = 200;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount * 3; i += 3) {
      emberPos[i] = PEDESTRIAN_X + (Math.random() - 0.5) * 3;
      emberPos[i + 1] = 0.4 + Math.random() * 2.5;
      emberPos[i + 2] = (Math.random() - 0.5) * 3;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xff3b30,
      size: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const emberParticles = new THREE.Points(emberGeo, emberMat);
    emberParticles.visible = false;
    sceneryGroup.add(emberParticles);
    sizzlingEmberParticlesRef.current = emberParticles;

    // ANIMATION & REAL-TIME 2D-TO-3D CURVED ROAD LOOP
    const clock = new THREE.Clock();
    let walkClock = 0;
    let smoothedUserBearing = 0;
    let lastRoadsideBuildDist = -9999;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const isSimulatingNow = isSimulatingRef.current;
      const progressNow = simulationProgressRef.current;
      const spd = simulationSpeedRef.current;
      const isSizzlingNow = isSizzlingRef.current;
      const route = activeRouteRef.current;
      const userCoords = currentCoordsRef.current;

      // 1. CALCULATE 1:1 METRIC PATH DIRECTLY FROM 2D ROUTE POLYLINE
      if (route && route.allCoordinates && route.allCoordinates.length >= 2) {
        const pts = route.allCoordinates;

        // Cumulative distances in meters along polyline
        const cumDist: number[] = [0];
        for (let i = 1; i < pts.length; i++) {
          cumDist.push(cumDist[i - 1] + computeDistanceMeters(pts[i - 1], pts[i]));
        }
        const totalDist = cumDist[pts.length - 1];

        // Find user distance along route
        let userDist = progressNow * totalDist;
        if (useRealGpsRef.current) {
          let minD = Infinity;
          let bestI = 0;
          for (let i = 0; i < pts.length; i++) {
            const d = computeDistanceMeters(userCoords, pts[i]);
            if (d < minD) {
              minD = d;
              bestI = i;
            }
          }
          userDist = cumDist[bestI];
        }

        // Determine current user forward bearing
        let segI = 0;
        while (segI < cumDist.length - 2 && cumDist[segI + 1] < userDist) {
          segI++;
        }
        const pA = pts[segI];
        const pB = pts[segI + 1];
        const dLngA = pB[1] - pA[1];
        const dLatA = pB[0] - pA[0];
        const targetBearing = Math.atan2(
          dLngA * Math.cos((userCoords[0] * Math.PI) / 180),
          dLatA
        );

        // Smooth heading damp
        let diff = targetBearing - smoothedUserBearing;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        smoothedUserBearing += diff * Math.min(1, delta * 4.5);

        // March along the exact 2D polyline at SLICE_STEP intervals
        const slices: PathSlice[] = [];
        for (let i = 0; i < NUM_ROAD_SLICES; i++) {
          const sampleDist = Math.max(0, Math.min(totalDist, userDist + SLICE_START_DIST + i * SLICE_STEP));

          // Segment for sampleDist
          let k = 0;
          while (k < cumDist.length - 2 && cumDist[k + 1] < sampleDist) {
            k++;
          }
          const span = Math.max(0.001, cumDist[k + 1] - cumDist[k]);
          const t = Math.max(0, Math.min(1, (sampleDist - cumDist[k]) / span));

          const sLat = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t;
          const sLng = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t;

          // Metric offset from current user GPS position
          const dNorth = (sLat - userCoords[0]) * 111139;
          const dEast = (sLng - userCoords[1]) * (111139 * Math.cos((userCoords[0] * Math.PI) / 180));

          // Project to user local frame: localForward along heading, localRight perpendicular
          const localForward = dEast * Math.sin(smoothedUserBearing) + dNorth * Math.cos(smoothedUserBearing);
          const localRight = dEast * Math.cos(smoothedUserBearing) - dNorth * Math.sin(smoothedUserBearing);

          // Find shade ratio of this route segment
          let sliceShade = 0.85;
          let accSeg = 0;
          for (let sIdx = 0; sIdx < route.segments.length; sIdx++) {
            accSeg += route.segments[sIdx].lengthMeters;
            if (sampleDist <= accSeg || sIdx === route.segments.length - 1) {
              sliceShade = route.segments[sIdx].shadeRatio ?? 0.8;
              break;
            }
          }

          slices.push({
            center: { x: localRight, z: localForward },
            tangent: { x: 0, z: 1 },
            normal: { x: 1, z: 0 },
            dist: SLICE_START_DIST + i * SLICE_STEP,
            shadeRatio: sliceShade,
            isTurn: false,
          });
        }

        // Calculate smooth tangents and normals between slices
        for (let i = 0; i < slices.length; i++) {
          const prev = slices[Math.max(0, i - 1)];
          const next = slices[Math.min(slices.length - 1, i + 1)];
          const dx = next.center.x - prev.center.x;
          const dz = next.center.z - prev.center.z;
          const len = Math.max(0.001, Math.hypot(dx, dz));
          const tx = dx / len;
          const tz = dz / len;
          slices[i].tangent = { x: tx, z: tz };
          // Normal to the right
          slices[i].normal = { x: tz, z: -tx };
        }

        // 2. UPDATE PROCEDURAL CURVED ROAD RIBBONS WITH 100% 2D SYNCHRONIZATION
        if (roadGeoRef.current) {
          updateRibbonGeometry(roadGeoRef.current, slices, -5.5, 5.5, 0.02, 0.25);
        }
        if (rightSidewalkGeoRef.current) {
          updateRibbonGeometry(rightSidewalkGeoRef.current, slices, 5.5, 9.7, SIDEWALK_ELEVATION_Y, 0.25);
        }
        if (leftSidewalkGeoRef.current) {
          updateRibbonGeometry(leftSidewalkGeoRef.current, slices, -9.7, -5.5, SIDEWALK_ELEVATION_Y, 0.25);
        }
        if (guidanceRibbonGeoRef.current) {
          updateGuidanceRibbonWithShade(
            guidanceRibbonGeoRef.current,
            slices,
            6.9,
            8.3,
            SIDEWALK_ELEVATION_Y + 0.02
          );
        }
        if (arcadeRoofGeoRef.current) {
          // Only show arcade roof if current slice has shade >= 0.40
          updateRibbonGeometry(arcadeRoofGeoRef.current, slices, 5.5, 9.7, 4.2, 0.25);
        }

        // 3. Avatar Turning & Banking into the curve
        const aheadSlice = slices[Math.min(slices.length - 1, 10)];
        const currentSlice = slices[6]; // avatar slice
        const angleAhead = Math.atan2(aheadSlice.tangent.x, aheadSlice.tangent.z);
        const angleNow = Math.atan2(currentSlice.tangent.x, currentSlice.tangent.z);
        let turnLead = angleAhead - angleNow;
        while (turnLead < -Math.PI) turnLead += Math.PI * 2;
        while (turnLead > Math.PI) turnLead -= Math.PI * 2;

        avatarTurnYawRef.current = THREE.MathUtils.damp(
          avatarTurnYawRef.current,
          turnLead * 0.95,
          4.5,
          delta
        );

        if (charGroup) {
          charGroup.rotation.y = avatarTurnYawRef.current;
          avatarBankRef.current = THREE.MathUtils.damp(avatarBankRef.current, turnLead * 0.45, 5.5, delta);
          charGroup.rotation.z = avatarBankRef.current;
        }

        // 4. REBUILD ROADSIDE 3D ENVIRONMENT (Trees, Shophouses, Outlets) ALONG CURVED SLICES
        if (Math.abs(userDist - lastRoadsideBuildDist) > 12 && roadsidePropsGroupRef.current) {
          lastRoadsideBuildDist = userDist;
          const group = roadsidePropsGroupRef.current;

          // Clear previous props
          while (group.children.length > 0) {
            group.remove(group.children[0]);
          }

          // Generate 3D props matching the slices and shade level
          for (let i = 4; i < slices.length - 2; i += 3) {
            const s = slices[i];
            const isCriticalSunTrap = s.shadeRatio < 0.40;
            const isHighShade = s.shadeRatio >= 0.75;

            // Taiwanese Shophouses on Right Side
            const bldgTitle = i % 2 === 0 ? '臺中太陽餅' : '春水堂茶飲';
            const bldg = createTaichungShophouse(i, bldgTitle);
            bldg.position.set(
              s.center.x + s.normal.x * 13.5,
              SIDEWALK_ELEVATION_Y,
              s.center.z + s.normal.z * 13.5
            );
            bldg.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);
            group.add(bldg);

            // Left Side Shophouses
            const leftBldg = createTaichungShophouse(i + 1, '綠園道茶舍');
            leftBldg.position.set(
              s.center.x - s.normal.x * 13.5,
              SIDEWALK_ELEVATION_Y,
              s.center.z - s.normal.z * 13.5
            );
            leftBldg.rotation.y = Math.atan2(s.tangent.x, s.tangent.z) + Math.PI;
            group.add(leftBldg);

            // TREES: Reflect shade level!
            // If High Shade: Dense trees (Taiwan Golden Rain Tree, Camphor, Banyan, Almond)
            // If Sun Trap: NO trees!
            if (!isCriticalSunTrap && (isHighShade || i % 2 === 0)) {
              const tree1 = createProceduralTaichungTree(i);
              tree1.position.set(
                s.center.x + s.normal.x * 9.2,
                SIDEWALK_ELEVATION_Y,
                s.center.z + s.normal.z * 9.2
              );
              group.add(tree1);

              const tree2 = createProceduralTaichungTree(i + 2);
              tree2.position.set(
                s.center.x - s.normal.x * 9.2,
                SIDEWALK_ELEVATION_Y,
                s.center.z - s.normal.z * 9.2
              );
              group.add(tree2);
            }

            // PARTICIPATING COOLING OUTLET KIOSK ON SIDEWALK
            const nearOutlet = TAICHUNG_COOLING_OUTLETS.find((o) => {
              const d = computeDistanceMeters(userCoords, o.coords);
              return d < 350;
            });

            if (nearOutlet && i === 12) {
              const kiosk = createCoolingOutletKiosk(nearOutlet);
              kiosk.position.set(
                s.center.x + s.normal.x * 7.5,
                SIDEWALK_ELEVATION_Y,
                s.center.z + s.normal.z * 7.5
              );
              kiosk.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);
              group.add(kiosk);
            }
          }
        }
      }

      // Rotate floating coins on cooling kiosks
      if (roadsidePropsGroupRef.current) {
        roadsidePropsGroupRef.current.traverse((child) => {
          if (child.name === 'token_coin') {
            child.rotation.z += delta * 2.0;
          }
        });
      }

      // Continuous texture scrolling
      if (roadTextureRef.current) {
        roadTextureRef.current.offset.y = -(progressNow * 40);
      }
      if (sidewalkTextureRef.current) {
        sidewalkTextureRef.current.offset.y = -(progressNow * 40);
      }

      // Walking leg animation along sidewalk
      if (isSimulatingNow) {
        walkClock += delta * (spd || 1);

        if (leftLegRef.current && rightLegRef.current && charGroup && capeMeshRef.current) {
          const walkFreq = 8 * Math.min(spd, 2.5);
          leftLegRef.current.rotation.x = Math.sin(walkClock * walkFreq) * 0.65;
          rightLegRef.current.rotation.x = -Math.sin(walkClock * walkFreq) * 0.65;
          charGroup.position.y = SIDEWALK_ELEVATION_Y + Math.abs(Math.sin(walkClock * walkFreq)) * 0.10;
          capeMeshRef.current.rotation.x = 0.15 + Math.abs(Math.sin(walkClock * walkFreq * 0.8)) * 0.3;
        }
      } else {
        if (leftLegRef.current && rightLegRef.current && charGroup && capeMeshRef.current) {
          leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, 0, 10, delta);
          rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, 0, 10, delta);
          charGroup.position.y = THREE.MathUtils.damp(charGroup.position.y, SIDEWALK_ELEVATION_Y, 10, delta);
          capeMeshRef.current.rotation.x = THREE.MathUtils.damp(capeMeshRef.current.rotation.x, 0.08, 6, delta);
        }
      }

      // Particles update
      if (mistParticles) {
        const pos = mistParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] -= delta * 0.7;
          if (pos[i] < 0.2) pos[i] = 4.5;
        }
        mistParticles.geometry.attributes.position.needsUpdate = true;
      }

      if (emberParticles) {
        emberParticles.visible = isSizzlingNow;
        if (isSizzlingNow) {
          const ePos = emberParticles.geometry.attributes.position.array as Float32Array;
          for (let i = 1; i < ePos.length; i += 3) {
            ePos[i] += delta * 2.5;
            if (ePos[i] > 3.0) ePos[i] = 0.5;
          }
          emberParticles.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Camera Positioning & Orientation
      const yaw = cameraYawOffsetRef.current;
      const pitch = cameraPitchOffsetRef.current;
      const currentCamMode = cameraModeRef.current;

      if (currentCamMode === 'human_1st_person') {
        if (charGroup) charGroup.visible = false;

        const totalYaw = avatarTurnYawRef.current + yaw;
        const headBobY = isSimulatingNow ? Math.sin(walkClock * 8) * 0.04 : 0;
        const headBobX = isSimulatingNow ? Math.cos(walkClock * 4) * 0.02 : 0;

        camera.position.set(
          PEDESTRIAN_X + headBobX,
          SIDEWALK_ELEVATION_Y + 1.70 + headBobY + pitch * 0.2,
          0
        );
        const lookX = 22 * Math.sin(totalYaw);
        const lookZ = 22 * Math.cos(totalYaw);
        camera.lookAt(PEDESTRIAN_X + lookX, SIDEWALK_ELEVATION_Y + 1.70 + pitch * 2, lookZ);
      } else if (currentCamMode === 'rpg_3rd_person') {
        if (charGroup) charGroup.visible = true;

        const totalYaw = avatarTurnYawRef.current + yaw;
        const dist = 3.6;
        const shoulderOffset = 0.45;
        const camX = -Math.sin(totalYaw) * dist + Math.cos(totalYaw) * shoulderOffset;
        const camZ = -Math.cos(totalYaw) * dist - Math.sin(totalYaw) * shoulderOffset;
        const camY = SIDEWALK_ELEVATION_Y + 1.95 + pitch;

        camera.position.set(PEDESTRIAN_X + camX, camY, camZ);
        const lookX = Math.sin(totalYaw) * 22;
        const lookZ = Math.cos(totalYaw) * 22;
        camera.lookAt(PEDESTRIAN_X + lookX, SIDEWALK_ELEVATION_Y + 1.45 + pitch * 1.5, lookZ);
      } else {
        if (charGroup) charGroup.visible = true;
        camera.position.set(PEDESTRIAN_X - 2, 22 + pitch * 2, -18);
        camera.lookAt(PEDESTRIAN_X, 0, 14);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Update dynamic properties when shade, gear, or groundMode change
  useEffect(() => {
    if (parasolGroupRef.current) {
      parasolGroupRef.current.visible = gear.hasParasol;
    }
    if (auraMeshRef.current) {
      const mat = auraMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = gear.hasSunscreen ? 0.35 : 0;
    }

    if (groundMeshRef.current) {
      groundMeshRef.current.material =
        groundMode === 'satellite'
          ? (satelliteGroundMatRef.current || streetGroundMatRef.current!)
          : (streetGroundMatRef.current || satelliteGroundMatRef.current!);
    }
  }, [isGoodShade, isModerateShade, gear, groundMode]);

  // Touch / Mouse Drag Look Around 360°
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    cameraYawOffsetRef.current = Math.max(-1.2, Math.min(1.2, cameraYawOffsetRef.current - dx * 0.005));
    cameraPitchOffsetRef.current = Math.max(-1.5, Math.min(2.5, cameraPitchOffsetRef.current - dy * 0.01));
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleResetCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    cameraYawOffsetRef.current = 0;
    cameraPitchOffsetRef.current = 0;
  };

  const upcomingTurn = getUpcomingTurnInfo();

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Extreme Sun Burn / Heat Vignette Warning */}
      {isSizzling && (
        <div className="absolute inset-0 pointer-events-none z-10 border-4 border-rose-500/80 shadow-[inset_0_0_100px_rgba(244,63,94,0.7)]" />
      )}

      {/* Top Left: Navigation Turn Direction & Live Status */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-auto flex flex-col gap-2 max-w-[320px] sm:max-w-sm">
        <div className="px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl flex flex-col gap-2">
          {/* Header Row: Perspective & Live Tokens */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentShadeColor }}
              />
              <span className="font-extrabold text-white text-[11px] tracking-wide">
                {cameraMode === 'human_1st_person'
                  ? '👁️ 1st Person'
                  : cameraMode === 'rpg_3rd_person'
                  ? '🎮 3rd Person'
                  : '🚁 Drone'}
              </span>
            </div>

            {/* Tokens Tracker Button */}
            {onOpenRewards && (
              <button
                type="button"
                onClick={onOpenRewards}
                className="text-[10px] font-black text-amber-300 bg-amber-950/90 border border-amber-500/50 hover:bg-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer shadow-sm active:scale-95"
                title="Open Cooling Rewards & Participating Outlets"
              >
                <span>🪙</span>
                <span className="font-mono">{coolingTokens}</span>
                <span className="text-[9px] text-amber-400">Tokens</span>
              </button>
            )}

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                useRealGps
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                  : isSimulating
                  ? 'bg-sky-950 text-sky-300 border border-sky-500/60'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {useRealGps ? '📡 Live' : isSimulating ? '🚶 Sim' : '⏸️ Paused'}
            </span>
          </div>

          {/* Color-Coded Shade Indicator */}
          <div
            className="text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center justify-between gap-1 shadow-sm"
            style={{
              backgroundColor: isGoodShade
                ? 'rgba(16,185,129,0.18)'
                : isModerateShade
                ? 'rgba(245,158,11,0.18)'
                : 'rgba(239,68,68,0.22)',
              color: currentShadeColor,
              border: `1px solid ${currentShadeColor}60`,
            }}
          >
            {isGoodShade ? (
              <span className="flex items-center gap-1.5 truncate">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">🟢 Dense Tree Canopy (綠廊遮陽)</span>
              </span>
            ) : isModerateShade ? (
              <span className="flex items-center gap-1.5 truncate">
                <span className="truncate">🟡 Building Shadow (大樓陰影)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 truncate font-black">
                <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">🔴 SUN TRAP (日曬熱陷阱 - 無遮蔽)</span>
              </span>
            )}
            <span className="font-mono text-[10px] shrink-0 font-extrabold ml-1">
              {Math.round(currentSegment.shadeRatio * 100)}%
            </span>
          </div>

          {/* Current Street & Synchronized 2D Maneuver */}
          <div className="flex flex-col gap-1 text-[10px] text-slate-300 pt-0.5 border-t border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold text-white truncate">{currentSegment.name}</span>
              </div>
              <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                <Footprints className="w-3 h-3" />
                <span>2D Synced</span>
              </span>
            </div>

            {/* Upcoming Corner Ahead */}
            <div className="flex items-center justify-between text-[10px] bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-sky-200">
              <div className="flex items-center gap-1.5 font-bold truncate">
                {upcomingTurn.turnType === 'right' ? (
                  <CornerUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : upcomingTurn.turnType === 'left' ? (
                  <CornerUpLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-emerald-400">⬆</span>
                )}
                <span className="truncate">
                  {upcomingTurn.turnType === 'right'
                    ? `Turn Right in ${Math.round(upcomingTurn.cornerDist)}m`
                    : upcomingTurn.turnType === 'left'
                    ? `Turn Left in ${Math.round(upcomingTurn.cornerDist)}m`
                    : `Follow route ${Math.round(upcomingTurn.cornerDist)}m ahead`}
                </span>
              </div>
              <span className="text-slate-400 text-[9px] shrink-0 font-mono">
                ➔ {upcomingTurn.nextStreetName.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Layer & Perspective Switchers */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setGroundMode(groundMode === 'satellite' ? 'street' : 'satellite')}
          className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xl border ${
            groundMode === 'satellite'
              ? 'bg-amber-600 text-white border-amber-400'
              : 'bg-slate-900/95 text-slate-300 hover:text-white border-slate-700/80'
          }`}
          title="Toggle Real Taichung Aerial Satellite Layer in 3D View"
        >
          <span>🛰️</span>
          <span className="hidden sm:inline">{groundMode === 'satellite' ? 'Satellite 3D' : 'Street 3D'}</span>
        </button>

        {onSwitchTo2dMap && (
          <button
            type="button"
            onClick={onSwitchTo2dMap}
            className="px-3 py-1.5 rounded-2xl bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-500/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xl"
            title="Switch to 2D Top-Down Aerial Map"
          >
            <Map className="w-3.5 h-3.5 text-sky-400" />
            <span>2D Map</span>
          </button>
        )}

        <div className="flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 p-1 rounded-2xl shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setCameraMode('human_1st_person');
              cameraYawOffsetRef.current = 0;
              cameraPitchOffsetRef.current = 0;
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 active:scale-95 ${
              cameraMode === 'human_1st_person'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="1st-Person Street Level View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>1st Person</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCameraMode('rpg_3rd_person');
              cameraYawOffsetRef.current = 0;
              cameraPitchOffsetRef.current = 0;
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 active:scale-95 ${
              cameraMode === 'rpg_3rd_person'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="RPG 3rd-Person View"
          >
            <span>3rd Person</span>
          </button>

          {(cameraYawOffsetRef.current !== 0 || cameraPitchOffsetRef.current !== 0) && (
            <button
              type="button"
              onClick={handleResetCamera}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Reset View Angle to Straight Ahead"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unified Ergonomic Bottom Control Dock (Three.js Constituted Design) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-1.5 w-[94%] max-w-lg">
        {/* Collapsible Toggle Handle */}
        <button
          type="button"
          onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
          className="px-3 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer shadow-md"
        >
          {isControlsCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3 text-emerald-400" />
              <span>Show Navigation Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 text-slate-400" />
              <span>Hide Controls (Cinema View)</span>
            </>
          )}
        </button>

        {!isControlsCollapsed && (
          <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2">
            {/* Action Row */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onToggleRealGps}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  useRealGps
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>📡 Live GPS</span>
              </button>

              <button
                type="button"
                onClick={onTogglePlayPause}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  !useRealGps && isSimulating
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{!useRealGps && isSimulating ? 'Pause Walk' : 'Walk Ahead'}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleGear?.('hasParasol')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  gear.hasParasol
                    ? 'bg-purple-900/90 text-purple-200 border border-purple-500'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle UV Parasol Shield"
              >
                <Umbrella className="w-3.5 h-3.5 text-purple-400" />
                <span>Parasol {gear.hasParasol ? '✓' : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleGear?.('hasSunscreen')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  gear.hasSunscreen
                    ? 'bg-sky-900/90 text-sky-200 border border-sky-500'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Sunscreen SPF Aura Shield"
              >
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>SPF {gear.hasSunscreen ? '✓' : ''}</span>
              </button>
            </div>

            {/* Propose Shade Button (+50 Tokens) */}
            {onOpenProposeShade && (
              <button
                type="button"
                onClick={onOpenProposeShade}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Propose Shade Kit Here (+50 🪙 Cooling Tokens)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
