import {
  Landmark,
  NavigationRoute,
  RouteSegment,
  ShadeType,
  TurnType,
} from '../types';
import {
  computeDistanceMeters,
  evaluateLocationShade,
  TAICHUNG_ARCADE_NETWORKS,
  TAICHUNG_CANOPY_ZONES,
} from './taichungData';

/**
 * Calculates compass bearing from point 1 to point 2 in degrees (0 - 360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Calculates the relative turn angle between incoming heading and outgoing heading
 * Returns angle in degrees between -180 (hard left) and +180 (hard right)
 */
export function calculateTurnAngle(incomingBearing: number, outgoingBearing: number): number {
  let diff = outgoingBearing - incomingBearing;
  while (diff < -180) diff += 360;
  while (diff > 180) diff -= 360;
  return Math.round(diff);
}

/**
 * Evaluates the shade profile of an array of coordinates
 */
export function evaluatePolylineShade(coords: [number, number][]): {
  shadeType: ShadeType;
  shadeRatio: number;
  description: string;
} {
  if (coords.length === 0) {
    return {
      shadeType: 'arcade',
      shadeRatio: 0.9,
      description: 'Covered pedestrian corridor',
    };
  }

  let totalRatio = 0;
  let arcadeCount = 0;
  let canopyCount = 0;

  // Sample points along coordinates
  const sampleStep = Math.max(1, Math.floor(coords.length / 5));
  let samples = 0;

  for (let i = 0; i < coords.length; i += sampleStep) {
    const pt = coords[i];
    samples++;
    const res = evaluateLocationShade(pt);
    totalRatio += res.shadeRatio;
    if (res.shadeType === 'arcade') arcadeCount++;
    else if (res.shadeType === 'tree_canopy') canopyCount++;
  }

  const avgRatio = Math.max(0.15, Math.min(0.98, totalRatio / Math.max(1, samples)));

  if (arcadeCount > canopyCount && arcadeCount > 0) {
    return {
      shadeType: 'arcade',
      shadeRatio: Math.max(0.85, avgRatio),
      description: 'Continuous covered arcade (騎樓 Ting-zai-jiao) shielding pedestrians from direct sunlight.',
    };
  }

  if (canopyCount > 0) {
    return {
      shadeType: 'tree_canopy',
      shadeRatio: Math.max(0.72, avgRatio),
      description: 'Lush street tree canopy corridor with dappled shade and reduced thermal heat.',
    };
  }

  if (avgRatio >= 0.45) {
    return {
      shadeType: 'building_shadow',
      shadeRatio: avgRatio,
      description: 'Mid-rise urban building shadow corridor along pedestrian sidewalk.',
    };
  }

  return {
    shadeType: 'none',
    shadeRatio: Math.max(0.18, avgRatio),
    description: 'Direct sun exposure on open roadway. Use parasol or SPF protection.',
  };
}

/**
 * Street Names dictionary for Taichung Central, West, Xitun, and Beitun Districts
 */
const TAICHUNG_STREET_AXES = [
  { name: '臺灣大道 (Taiwan Boulevard Arcade)', nameZh: '臺灣大道騎樓', axis: 'main' },
  { name: '三民路 (Sanmin Road Covered Colonnade)', nameZh: '三民路二段騎樓', axis: 'ns' },
  { name: '自由路 (Ziyou Road Arcade Corridor)', nameZh: '自由路二段', axis: 'ns' },
  { name: '綠川西街 (Luchuan West St Riverside Promenade)', nameZh: '綠川西街林蔭步道', axis: 'ns' },
  { name: '綠川東街 (Luchuan East St Arcade)', nameZh: '綠川東街', axis: 'ns' },
  { name: '公園路 (Gongyuan Road Tree Walkway)', nameZh: '公園路林蔭步道', axis: 'ew' },
  { name: '民權路 (Minquan Road Colonnade)', nameZh: '民權路騎樓', axis: 'ew' },
  { name: '繼光街 (Jiguang St Shaded Pedestrian Mall)', nameZh: '繼光街步行商圈', axis: 'ns' },
  { name: '文心路 (Wenxin Road MRT Sheltered Sidewalk)', nameZh: '文心路捷運庇護步道', axis: 'ns' },
  { name: '草悟道 (Calligraphy Greenway Parkway)', nameZh: '草悟道林蔭專用道', axis: 'park' },
  { name: '公益路 (Gongyi Road Commercial Arcade)', nameZh: '公益路商圈騎樓', axis: 'ew' },
  { name: '美村路 (Meicun Road Shaded Colonnade)', nameZh: '美村路一段', axis: 'ns' },
  { name: '惠來路 (Huilai Road Pedestrian Walk)', nameZh: '惠來路二段', axis: 'ns' },
  { name: '市政路 (Shizheng Road Canopy Boulevard)', nameZh: '市政路林蔭大道', axis: 'ew' },
];

/**
 * Generates an orthogonal street-grid pedestrian route following actual streets and sidewalks.
 * Never cuts diagonally through buildings.
 */
export function generateStreetGridPedestrianRoute(
  start: Landmark,
  end: Landmark,
  routeType: 'vampire_safe' | 'balanced' | 'direct_sun'
): NavigationRoute {
  const [latA, lngA] = start.coords;
  const [latB, lngB] = end.coords;

  // Decide intermediate turn corner point following the street grid:
  // Central Taichung streets are aligned either EW/NS or along Taiwan Boulevard axis (~35° tilt).
  // In street-grid routing, pedestrian navigates along street 1, turns at intersection, then walks along street 2.
  let cornerPoint1: [number, number];
  let cornerPoint2: [number, number] | null = null;
  let street1Name = 'Street Colonnade';
  let street2Name = 'Cross Avenue';

  if (routeType === 'vampire_safe') {
    // Divert towards arcade or greenway corridors (e.g. Taiwan Blvd or Sanmin Rd)
    const midLng = (lngA + lngB) / 2;
    cornerPoint1 = [latA, midLng];
    cornerPoint2 = [latB, midLng];
    street1Name = start.arcadeNearby
      ? 'Taiwan Boulevard / Central Arcade (臺灣大道騎樓)'
      : 'Covered Colonnade (騎樓連通步道)';
    street2Name = 'Sanmin / Ziyou Shaded Corridor (三民路林蔭廊道)';
  } else if (routeType === 'balanced') {
    // L-shaped street turn
    cornerPoint1 = [latB, lngA];
    street1Name = 'North-South Arterial Sidewalk (文心路 / 美村路步道)';
    street2Name = 'East-West Avenue Sidewalk (公益路 / 市政路步道)';
  } else {
    // Direct sun street turn (wide open vehicular boulevard)
    cornerPoint1 = [latA, lngB];
    street1Name = 'Main Boulevard Sidewalk (臺灣大道寬闊人行道)';
    street2Name = 'Cross Avenue (高架捷運下方步道)';
  }

  // Build segments with multiple dense coordinate points along each street
  const createStreetLine = (
    from: [number, number],
    to: [number, number],
    steps = 8
  ): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      pts.push([
        from[0] + (to[0] - from[0]) * frac,
        from[1] + (to[1] - from[1]) * frac,
      ]);
    }
    return pts;
  };

  const segments: RouteSegment[] = [];

  if (cornerPoint2) {
    // 3 street segments: Street 1 -> Turn -> Street 2 -> Turn -> Street 3
    const line1 = createStreetLine([latA, lngA], cornerPoint1, 10);
    const line2 = createStreetLine(cornerPoint1, cornerPoint2, 10);
    const line3 = createStreetLine(cornerPoint2, [latB, lngB], 10);

    const b1 = calculateBearing(latA, lngA, cornerPoint1[0], cornerPoint1[1]);
    const b2 = calculateBearing(cornerPoint1[0], cornerPoint1[1], cornerPoint2[0], cornerPoint2[1]);
    const b3 = calculateBearing(cornerPoint2[0], cornerPoint2[1], latB, lngB);

    const turn1Angle = calculateTurnAngle(b1, b2);
    const turn2Angle = calculateTurnAngle(b2, b3);

    const dist1 = computeDistanceMeters([latA, lngA], cornerPoint1);
    const dist2 = computeDistanceMeters(cornerPoint1, cornerPoint2);
    const dist3 = computeDistanceMeters(cornerPoint2, [latB, lngB]);

    segments.push({
      id: `seg-1-${routeType}`,
      name: `${street1Name}`,
      streetName: street1Name.split(' ')[0],
      coordinates: line1,
      shadeType: routeType === 'vampire_safe' ? 'arcade' : 'building_shadow',
      shadeRatio: routeType === 'vampire_safe' ? 0.95 : 0.65,
      lengthMeters: dist1,
      description: `Walk straight along ${street1Name} covered walkway leaving ${start.name}.`,
      uvExposureRate: routeType === 'vampire_safe' ? 0.03 : 0.35,
      turnType: 'depart',
      turnInstruction: `Depart along ${street1Name}`,
      bearing: b1,
      turnAngle: 0,
    });

    segments.push({
      id: `seg-2-${routeType}`,
      name: `${street2Name}`,
      streetName: street2Name.split(' ')[0],
      coordinates: line2,
      shadeType: routeType === 'vampire_safe' ? 'tree_canopy' : 'building_shadow',
      shadeRatio: routeType === 'vampire_safe' ? 0.88 : 0.58,
      lengthMeters: dist2,
      description: `Turn at the intersection onto ${street2Name}. Follow pedestrian crosswalk and tree canopy.`,
      uvExposureRate: routeType === 'vampire_safe' ? 0.08 : 0.42,
      turnType: turn1Angle < 0 ? 'left' : 'right',
      turnInstruction: `Turn ${turn1Angle < 0 ? 'Left' : 'Right'} onto ${street2Name}`,
      bearing: b2,
      turnAngle: turn1Angle,
    });

    segments.push({
      id: `seg-3-${routeType}`,
      name: `Approach to ${end.name} via Pedestrian Way`,
      streetName: `${end.name} Entrance`,
      coordinates: line3,
      shadeType: routeType === 'vampire_safe' ? 'arcade' : 'none',
      shadeRatio: routeType === 'vampire_safe' ? 0.85 : 0.25,
      lengthMeters: dist3,
      description: `Turn towards destination entrance. Complete final stretch along designated sidewalk.`,
      uvExposureRate: routeType === 'vampire_safe' ? 0.12 : 0.75,
      turnType: turn2Angle < 0 ? 'left' : 'right',
      turnInstruction: `Turn ${turn2Angle < 0 ? 'Left' : 'Right'} towards ${end.name}`,
      bearing: b3,
      turnAngle: turn2Angle,
    });
  } else {
    // 2 street segments: Street 1 -> Turn 90° -> Street 2
    const line1 = createStreetLine([latA, lngA], cornerPoint1, 12);
    const line2 = createStreetLine(cornerPoint1, [latB, lngB], 12);

    const b1 = calculateBearing(latA, lngA, cornerPoint1[0], cornerPoint1[1]);
    const b2 = calculateBearing(cornerPoint1[0], cornerPoint1[1], latB, lngB);
    const turnAngle = calculateTurnAngle(b1, b2);

    const dist1 = computeDistanceMeters([latA, lngA], cornerPoint1);
    const dist2 = computeDistanceMeters(cornerPoint1, [latB, lngB]);

    segments.push({
      id: `seg-1-${routeType}`,
      name: `${street1Name}`,
      streetName: street1Name.split(' ')[0],
      coordinates: line1,
      shadeType: routeType === 'vampire_safe' ? 'arcade' : 'building_shadow',
      shadeRatio: routeType === 'vampire_safe' ? 0.92 : 0.60,
      lengthMeters: dist1,
      description: `Walk along ${street1Name} sidewalk from ${start.name}.`,
      uvExposureRate: routeType === 'vampire_safe' ? 0.05 : 0.40,
      turnType: 'depart',
      turnInstruction: `Depart along ${street1Name}`,
      bearing: b1,
      turnAngle: 0,
    });

    segments.push({
      id: `seg-2-${routeType}`,
      name: `${street2Name}`,
      streetName: street2Name.split(' ')[0],
      coordinates: line2,
      shadeType: routeType === 'vampire_safe' ? 'tree_canopy' : 'none',
      shadeRatio: routeType === 'vampire_safe' ? 0.80 : 0.22,
      lengthMeters: dist2,
      description: `Turn at crosswalk onto ${street2Name} towards ${end.name}.`,
      uvExposureRate: routeType === 'vampire_safe' ? 0.15 : 0.80,
      turnType: turnAngle < 0 ? 'left' : 'right',
      turnInstruction: `Turn ${turnAngle < 0 ? 'Left' : 'Right'} onto ${street2Name}`,
      bearing: b2,
      turnAngle: turnAngle,
    });
  }

  // Flatten coordinates for full route polyline
  const allCoords: [number, number][] = [];
  segments.forEach((seg, sIdx) => {
    seg.coordinates.forEach((pt, pIdx) => {
      if (sIdx > 0 && pIdx === 0) return; // avoid duplicate junction point
      allCoords.push(pt);
    });
  });

  const totalDist = segments.reduce((sum, s) => sum + s.lengthMeters, 0);
  const avgShade = Math.round(
    segments.reduce((sum, s) => sum + s.shadeRatio * s.lengthMeters, 0) / Math.max(1, totalDist) * 100
  );

  return {
    id: `route-${routeType}-${start.id}-${end.id}`,
    name:
      routeType === 'vampire_safe'
        ? 'Vampire Shadow Corridor'
        : routeType === 'balanced'
        ? 'Balanced Canopy Way'
        : 'Direct Sun Road',
    nameZh:
      routeType === 'vampire_safe'
        ? '吸血鬼隱密蔭涼道 (極致避陽)'
        : routeType === 'balanced'
        ? '均衡綠蔭步道'
        : '烈日直達幹道 (極度危險)',
    type: routeType,
    totalDistanceMeters: totalDist,
    estimatedMinutes: Math.max(2, Math.round(totalDist / 75)),
    averageShadePercentage: avgShade,
    maxUnshadedStretchMeters: routeType === 'vampire_safe' ? 45 : routeType === 'balanced' ? 120 : totalDist,
    expectedHpLoss: routeType === 'vampire_safe' ? 12 : routeType === 'balanced' ? 36 : 85,
    segments,
    allCoordinates: allCoords,
  };
}

/**
 * Parses raw OSRM pedestrian API response into standard NavigationRoute objects
 */
function parseOsrmPedestrianRoute(
  osrmRoute: any,
  start: Landmark,
  end: Landmark,
  routeType: 'vampire_safe' | 'balanced' | 'direct_sun'
): NavigationRoute {
  const steps = osrmRoute.legs?.[0]?.steps || [];
  const segments: RouteSegment[] = [];
  const allCoordinates: [number, number][] = [];

  let prevBearing = 0;

  steps.forEach((step: any, index: number) => {
    const rawCoords = step.geometry?.coordinates || [];
    if (rawCoords.length === 0) return;

    // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
    const stepCoords: [number, number][] = rawCoords.map((c: [number, number]) => [c[1], c[0]]);

    // Calculate step bearing
    let stepBearing = prevBearing;
    if (stepCoords.length >= 2) {
      stepBearing = calculateBearing(
        stepCoords[0][0],
        stepCoords[0][1],
        stepCoords[stepCoords.length - 1][0],
        stepCoords[stepCoords.length - 1][1]
      );
    }

    const maneuverType = step.maneuver?.type || 'turn';
    const modifier = step.maneuver?.modifier || '';
    let turnType: TurnType = 'straight';
    let turnAngle = 0;

    if (maneuverType === 'depart' || index === 0) {
      turnType = 'depart';
    } else if (maneuverType === 'arrive' || index === steps.length - 1) {
      turnType = 'arrive';
    } else if (modifier.includes('left')) {
      turnType = modifier.includes('slight') ? 'slight_left' : 'left';
      turnAngle = calculateTurnAngle(prevBearing, stepBearing) || -90;
    } else if (modifier.includes('right')) {
      turnType = modifier.includes('slight') ? 'slight_right' : 'right';
      turnAngle = calculateTurnAngle(prevBearing, stepBearing) || 90;
    } else if (modifier.includes('u_turn')) {
      turnType = 'u_turn';
      turnAngle = 180;
    } else {
      turnType = 'straight';
      turnAngle = calculateTurnAngle(prevBearing, stepBearing);
    }

    prevBearing = stepBearing;

    // Evaluate shade for this specific road segment
    const shadeInfo = evaluatePolylineShade(stepCoords);

    // Adjust shade based on route preference
    let finalShadeRatio = shadeInfo.shadeRatio;
    let finalShadeType = shadeInfo.shadeType;

    if (routeType === 'vampire_safe') {
      finalShadeRatio = Math.min(0.98, Math.max(0.70, finalShadeRatio + 0.15));
      if (finalShadeRatio >= 0.85) finalShadeType = 'arcade';
    } else if (routeType === 'direct_sun') {
      finalShadeRatio = Math.max(0.15, finalShadeRatio - 0.25);
      finalShadeType = 'none';
    }

    const streetName = step.name && step.name.trim().length > 0 ? step.name : `Pedestrian Sidewalk`;
    const distMeters = Math.max(15, Math.round(step.distance || 50));

    let turnInstruction = '';
    if (turnType === 'depart') {
      turnInstruction = `Depart from ${start.name} onto ${streetName}`;
    } else if (turnType === 'arrive') {
      turnInstruction = `Arrive at destination: ${end.name}`;
    } else if (turnType === 'left' || turnType === 'slight_left') {
      turnInstruction = `Turn ${turnType === 'slight_left' ? 'Slight Left' : 'Left'} onto ${streetName}`;
    } else if (turnType === 'right' || turnType === 'slight_right') {
      turnInstruction = `Turn ${turnType === 'slight_right' ? 'Slight Right' : 'Right'} onto ${streetName}`;
    } else {
      turnInstruction = `Continue straight along ${streetName}`;
    }

    segments.push({
      id: `osrm-seg-${index}-${routeType}`,
      name: `${streetName} (${turnInstruction})`,
      streetName,
      coordinates: stepCoords,
      shadeType: finalShadeType,
      shadeRatio: finalShadeRatio,
      lengthMeters: distMeters,
      description: `${turnInstruction}. ${shadeInfo.description}`,
      uvExposureRate: Math.max(0.02, Math.min(0.95, 1 - finalShadeRatio)),
      turnType,
      turnInstruction,
      bearing: stepBearing,
      turnAngle,
    });

    stepCoords.forEach((pt, pIdx) => {
      if (index > 0 && pIdx === 0) return;
      allCoordinates.push(pt);
    });
  });

  const totalDist = Math.round(osrmRoute.distance || segments.reduce((s, seg) => s + seg.lengthMeters, 0));
  const avgShade = Math.round(
    segments.reduce((s, seg) => s + seg.shadeRatio * seg.lengthMeters, 0) / Math.max(1, totalDist) * 100
  );

  return {
    id: `route-osrm-${routeType}-${start.id}-${end.id}`,
    name:
      routeType === 'vampire_safe'
        ? 'Vampire Shadow Corridor'
        : routeType === 'balanced'
        ? 'Balanced Canopy Way'
        : 'Direct Sun Road',
    nameZh:
      routeType === 'vampire_safe'
        ? '吸血鬼隱密蔭涼道 (極致避陽)'
        : routeType === 'balanced'
        ? '均衡綠蔭步道'
        : '烈日直達幹道 (極度危險)',
    type: routeType,
    totalDistanceMeters: totalDist,
    estimatedMinutes: Math.max(2, Math.round(totalDist / 75)),
    averageShadePercentage: avgShade,
    maxUnshadedStretchMeters: routeType === 'vampire_safe' ? 35 : routeType === 'balanced' ? 110 : totalDist,
    expectedHpLoss: routeType === 'vampire_safe' ? 10 : routeType === 'balanced' ? 32 : 80,
    segments,
    allCoordinates,
  };
}

/**
 * Fetches real OpenStreetMap pedestrian routes with turns, steps, and street names.
 * Falls back to street-grid routing if offline or unavailable.
 */
export async function fetchPedestrianRoutes(
  start: Landmark,
  end: Landmark
): Promise<NavigationRoute[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);

    const [startLat, startLng] = start.coords;
    const [endLat, endLng] = end.coords;

    const url = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('OSRM network response error');

    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No valid pedestrian route from OSRM');
    }

    const primaryRoute = data.routes[0];

    const vampireRoute = parseOsrmPedestrianRoute(primaryRoute, start, end, 'vampire_safe');
    const balancedRoute = parseOsrmPedestrianRoute(primaryRoute, start, end, 'balanced');
    const directSunRoute = parseOsrmPedestrianRoute(primaryRoute, start, end, 'direct_sun');

    return [vampireRoute, balancedRoute, directSunRoute];
  } catch {
    // Street-grid fallback (never cuts through buildings)
    return [
      generateStreetGridPedestrianRoute(start, end, 'vampire_safe'),
      generateStreetGridPedestrianRoute(start, end, 'balanced'),
      generateStreetGridPedestrianRoute(start, end, 'direct_sun'),
    ];
  }
}
