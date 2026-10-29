export type TileLayerType = 'dark' | 'satellite' | 'google_satellite' | 'streets' | 'topo';

export type LandmarkCategory =
  | 'transit'
  | 'culture'
  | 'park'
  | 'food'
  | 'shopping'
  | 'university'
  | 'hospital'
  | 'market';

export interface Landmark {
  id: string;
  name: string;
  nameZh: string;
  district: string;
  coords: [number, number];
  category: LandmarkCategory;
  description: string;
  arcadeNearby: boolean;
}

export type ShadeType = 'arcade' | 'tree_canopy' | 'building_shadow' | 'none';

export type TurnType =
  | 'depart'
  | 'straight'
  | 'left'
  | 'right'
  | 'slight_left'
  | 'slight_right'
  | 'u_turn'
  | 'arrive';

export interface RouteSegment {
  id: string;
  name: string;
  coordinates: [number, number][];
  shadeType: ShadeType;
  shadeRatio: number;
  lengthMeters: number;
  description: string;
  uvExposureRate: number;
  turnType?: TurnType;
  turnInstruction?: string;
  streetName?: string;
  bearing?: number; // 0 - 360 degrees
  turnAngle?: number; // relative degrees to turn (-90 left, +90 right, etc.)
}

export type RouteType = 'vampire_safe' | 'balanced' | 'direct_sun';

export interface NavigationRoute {
  id: string;
  name: string;
  nameZh: string;
  type: RouteType;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  averageShadePercentage: number;
  maxUnshadedStretchMeters: number;
  expectedHpLoss: number;
  segments: RouteSegment[];
  allCoordinates: [number, number][];
}

export interface SolarPosition {
  altitude: number;
  azimuth: number;
  shadowMultiplier: number;
  shadowDirection: number;
  uvIntensity: 'Zero (Night)' | 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
}

export interface VampireGear {
  hasParasol: boolean;
  hasSunscreen: boolean;
  hasCloak: boolean;
}

export interface WeatherData {
  temperature: number;
  uvIndex: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  apparentTemperature?: number;
}

export type ShadeProposalCategory =
  | 'vertical_green'
  | 'misting_water'
  | 'shade_sail'
  | 'knitted_canopy'
  | 'arcade_roof'
  | 'shade_tree'
  | 'solar_canopy'
  | 'mist_cooling'
  | 'green_trellis'
  | 'pedestrian_overpass'
  | 'retractable_sail';

export interface UserDemographics {
  registered: boolean;
  registeredAt: string;
  userId: string;
  nickname: string;
  ageGroup: 'under_18' | '18_24' | '25_34' | '35_49' | '50_64' | '65_plus';
  gender: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';
  nationality: string;
  ethnicity: string;
  walkingFrequency: 'daily' | 'several_times_week' | 'weekly' | 'occasional';
  heatSensitivity: 'extreme_vampire' | 'high' | 'moderate' | 'low';
  vampireClan: 'Nosferatu Nightwalker' | 'Shadowstalker' | 'Daywalker' | 'Gothic Commuter';
}

export interface ShadeProposal {
  id: string;
  userId: string;
  userDemographics: {
    ageGroup: string;
    gender: string;
    nationality: string;
    ethnicity: string;
  };
  coords: [number, number];
  addressName: string;
  category: ShadeProposalCategory;
  categoryTitle: string;
  notes: string;
  urgency: 'critical_burn' | 'high_heat' | 'moderate';
  upvotes: number;
  hasPhoto?: boolean;
  photoUrl?: string;
  createdAt: string;
  status: 'submitted_to_taichung_gov' | 'scheduled_planting' | 'community_reviewed' | 'under_review';
}

export interface TreeDataPoint {
  id: string;
  scientificName: string;
  commonNameZh: string;
  heightMeters: number;
  coords: [number, number];
  canopyRadiusMeters: number;
  co2OffsetKgYear: number;
}

export interface HeatIslandHotspot {
  id: string;
  name: string;
  nameZh: string;
  coords: [number, number];
  surfaceTempCelsius: number;
  ambientTempCelsius: number;
  urgency: 'critical_burn' | 'high_heat';
  description: string;
}
