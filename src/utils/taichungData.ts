import { Landmark, NavigationRoute, RouteSegment } from '../types';
import { generateStreetGridPedestrianRoute } from './pedestrianRouting';

export const TAICHUNG_LANDMARKS: Landmark[] = [
  // Transit Hubs & MRT
  {
    id: 'station',
    name: 'Taichung Train Station',
    nameZh: '臺中車站 (舊城樞紐)',
    district: 'Central District',
    coords: [24.1373, 120.6869],
    category: 'transit',
    description: 'Modern transit hub linked to historic red-brick 1917 station with continuous covered arcades and bus transfer platforms.',
    arcadeNearby: true,
  },
  {
    id: 'hsr_taichung',
    name: 'Taichung High Speed Rail (HSR) Station',
    nameZh: '高鐵臺中站 / 新烏日站',
    district: 'Wuri District',
    coords: [24.1121, 120.6157],
    category: 'transit',
    description: 'Major high-speed rail terminal with full indoor climate control, covered pedestrian skybridges, and shade transfer bays.',
    arcadeNearby: true,
  },
  {
    id: 'mrt_city_hall',
    name: 'MRT Taichung City Hall Station',
    nameZh: '捷運市政府站 (文心中港交叉口)',
    district: 'Xitun District',
    coords: [24.1601, 120.6498],
    category: 'transit',
    description: 'Key Green Line MRT station connecting Taiwan Boulevard bus rapid transit, city hall plaza, and shopping arcade bridges.',
    arcadeNearby: true,
  },
  {
    id: 'mrt_songzhu',
    name: 'MRT Songzhu Station (Dual Rail Interchange)',
    nameZh: '捷運松竹站 (雙鐵共構)',
    district: 'Beitun District',
    coords: [24.1798, 120.7022],
    category: 'transit',
    description: 'Dual-rail interchange station connecting TRA railway and MRT Green Line with sheltered transfer walkways.',
    arcadeNearby: true,
  },
  {
    id: 'mrt_shui_an',
    name: 'MRT Shui-an Temple Station',
    nameZh: '捷運水安宮站',
    district: 'Nantun District',
    coords: [24.1534, 120.6482],
    category: 'transit',
    description: 'Central MRT stop in Nantun with sheltered colonnades leading directly to Wenxin Carrefour and dining alleys.',
    arcadeNearby: true,
  },
  {
    id: 'mrt_fengle',
    name: 'MRT Feng-le Park Station',
    nameZh: '捷運豐樂公園站',
    district: 'Nantun District',
    coords: [24.1302, 120.6475],
    category: 'transit',
    description: 'Green elevated MRT station surrounded by shaded neighborhood arcades, COSTCO, and sculpture park trails.',
    arcadeNearby: true,
  },
  {
    id: 'chaoma_bus',
    name: 'Chaoma Highway Bus Terminal',
    nameZh: '朝馬國道客運轉運站',
    district: 'Xitun District',
    coords: [24.1685, 120.6378],
    category: 'transit',
    description: 'Major intercity bus terminal along Taiwan Boulevard flanked by covered retail arcades and taxi shelters.',
    arcadeNearby: true,
  },

  // Historic Arcades & Heritage
  {
    id: 'miyahara',
    name: 'Miyahara Historic Eye Clinic',
    nameZh: '宮原眼科 (紅磚拱廊)',
    district: 'Central District',
    coords: [24.1378, 120.6834],
    category: 'culture',
    description: 'Iconic 1927 ophthalmology clinic turned pastry salon, renowned for heritage red-brick arched covered walkway.',
    arcadeNearby: true,
  },
  {
    id: 'fourth_credit',
    name: 'Fourth Credit Union Pastry Parlor',
    nameZh: '臺中市第四信用合作社',
    district: 'Central District',
    coords: [24.1396, 120.6826],
    category: 'culture',
    description: 'Historic brutalist bank turned dessert parlor with continuous sidewalk colonnades and banking vault interiors.',
    arcadeNearby: true,
  },
  {
    id: 'second_market',
    name: 'Taichung Second Market',
    nameZh: '臺中市第二市場 (百年六角樓)',
    district: 'Central District',
    coords: [24.1423, 120.6787],
    category: 'market',
    description: 'Hexagonal historical covered indoor food market built in 1917. Complete 100% roof shade with authentic Taiwanese delicacies.',
    arcadeNearby: true,
  },
  {
    id: 'third_market',
    name: 'Taichung Third Market & Cultural Walk',
    nameZh: '臺中市第三市場',
    district: 'South District',
    coords: [24.1328, 120.6861],
    category: 'market',
    description: 'Vibrant local marketplace with continuous overhead metal canopy shielding pedestrians from direct midday solar rays.',
    arcadeNearby: true,
  },
  {
    id: 'asean_square',
    name: 'ASEAN Square (First Square)',
    nameZh: '東協廣場 (第一廣場)',
    district: 'Central District',
    coords: [24.1382, 120.6853],
    category: 'market',
    description: 'Multicultural Southeast Asian hub with towering multi-story arcades, covered public plazas, and shaded shopping alleys.',
    arcadeNearby: true,
  },
  {
    id: 'tccip',
    name: 'Taichung Cultural and Creative Industries Park',
    nameZh: '文化部文化資產園區 (舊臺中酒廠)',
    district: 'South District',
    coords: [24.1332, 120.6825],
    category: 'culture',
    description: 'Former state brewery dating to 1916 transformed into shaded arts spaces, canopy corridors, and indoor exhibition galleries.',
    arcadeNearby: true,
  },
  {
    id: 'literature_museum',
    name: 'Taichung Literature Museum',
    nameZh: '臺中文學館 (百年大榕樹)',
    district: 'West District',
    coords: [24.1408, 120.6728],
    category: 'culture',
    description: 'Restored 1932 Japanese police dormitories surrounded by a legendary century-old banyan tree with aerial root shade.',
    arcadeNearby: false,
  },
  {
    id: 'historic_city_hall',
    name: 'Taichung Prefectural Hall (Historic City Hall)',
    nameZh: '臺中州廳 (國定古蹟)',
    district: 'West District',
    coords: [24.1402, 120.6791],
    category: 'culture',
    description: 'National historic French Baroque administration building featuring classic covered veranda colonnades.',
    arcadeNearby: true,
  },

  // Culture, Arts & Theaters
  {
    id: 'national_theater',
    name: 'National Taichung Theater',
    nameZh: '臺中國家歌劇院',
    district: 'Xitun District',
    coords: [24.1628, 120.6405],
    category: 'culture',
    description: 'Pritzker-winner Toyo Ito masterpiece with cave-like curved shaded colonnades, cool interior cavern, and rooftop sky garden.',
    arcadeNearby: true,
  },
  {
    id: 'ntmofa',
    name: 'National Taiwan Museum of Fine Arts',
    nameZh: '國立臺灣美術館 (國美館)',
    district: 'West District',
    coords: [24.1415, 120.6635],
    category: 'culture',
    description: 'Asia’s largest fine arts museum nestled in lush sculpture lawns, shaded outdoor pavilions, and subterranean cooling galleries.',
    arcadeNearby: true,
  },
  {
    id: 'nm_science',
    name: 'National Museum of Natural Science',
    nameZh: '國立自然科學博物館 (科博館)',
    district: 'North District',
    coords: [24.1578, 120.6660],
    category: 'culture',
    description: 'Massive science museum with tropical botanical garden greenhouse, outdoor shaded prehistoric walk, and dense canopy.',
    arcadeNearby: true,
  },
  {
    id: 'audit_village',
    name: 'Audit Village 368 Creative Base',
    nameZh: '審計新村 368文創聚落',
    district: 'West District',
    coords: [24.1466, 120.6628],
    category: 'culture',
    description: 'Former government employee dorms repurposed into shaded creative craft alleyways, vintage market stalls, and patio cafes.',
    arcadeNearby: false,
  },
  {
    id: 'confucius_temple',
    name: 'Taichung Confucius Temple & Martyr’s Shrine',
    nameZh: '臺中孔子廟 / 忠烈祠',
    district: 'North District',
    coords: [24.1537, 120.6908],
    category: 'culture',
    description: 'Majestic Song Dynasty architectural complex with deeply overhanging tile eaves, covered courtyard cloisters, and tranquil shaded paths.',
    arcadeNearby: true,
  },

  // Parks, Greenways & Waterfront
  {
    id: 'calligraphy_greenway',
    name: 'Calligraphy Greenway & CMP Block',
    nameZh: '草悟道 / 勤美誠品綠園道',
    district: 'West District',
    coords: [24.1511, 120.6638],
    category: 'park',
    description: 'Multi-layered urban tree corridor stretching from NMNS to NTMOFA, offering continuous leafy shade and sidewalk cafes.',
    arcadeNearby: true,
  },
  {
    id: 'taichung_park',
    name: 'Taichung Park & Lakeside Pavilion',
    nameZh: '臺中公園 / 湖心亭',
    district: 'North District',
    coords: [24.1444, 120.6838],
    category: 'park',
    description: 'Taichung’s oldest landmark park shaded by towering banyan and camphor groves surrounding sunlit Ryuseitei lake.',
    arcadeNearby: false,
  },
  {
    id: 'central_park',
    name: 'Taichung Central Park (Shuinan)',
    nameZh: '臺中中央公園 (水湳經貿)',
    district: 'Xitun District',
    coords: [24.1865, 120.6558],
    category: 'park',
    description: '67-hectare smart climate park featuring solar-shaded climate sensing pavilions, cooling misting nodes, and dense woodlands.',
    arcadeNearby: false,
  },
  {
    id: 'wenxin_forest_park',
    name: 'Wen-Xin Forest Park & Fulfillment Amphitheatre',
    nameZh: '文心森林公園 / 圓滿戶外劇場',
    district: 'Nantun District',
    coords: [24.1459, 120.6455],
    category: 'park',
    description: '8.8-hectare green sanctuary adjacent to MRT, shaded jogging perimeters, and massive open-air amphitheater with covered colonnades.',
    arcadeNearby: true,
  },
  {
    id: 'fengle_sculpture_park',
    name: 'Fengle Sculpture Park',
    nameZh: '豐樂雕塑公園',
    district: 'Nantun District',
    coords: [24.1315, 120.6438],
    category: 'park',
    description: 'Taiwan’s first sculpture theme park featuring shaded lakeside bridges, red-roofed rest pavilions, and lush weeping willows.',
    arcadeNearby: false,
  },
  {
    id: 'maple_garden',
    name: 'Maple Garden (Qiuhonggu Ecological Park)',
    nameZh: '秋紅谷景觀生態公園',
    district: 'Xitun District',
    coords: [24.1661, 120.6389],
    category: 'park',
    description: 'Sunken ecological valley that acts as a natural cooling urban microclimate basin with terraced shade paths below street level.',
    arcadeNearby: true,
  },
  {
    id: 'green_river_walk',
    name: 'Green River (Lu Chuan) Waterfront Corridor',
    nameZh: '綠川水岸景觀步道',
    district: 'Central District',
    coords: [24.1388, 120.6837],
    category: 'park',
    description: 'Restored canal promenade featuring water-level boardwalks shaded by weeping willows and neighboring commercial arcades.',
    arcadeNearby: true,
  },
  {
    id: 'liu_chuan_walk',
    name: 'Liu Chuan Riverside Promenade',
    nameZh: '柳川水岸步道',
    district: 'Central District',
    coords: [24.1412, 120.6775],
    category: 'park',
    description: 'Award-winning daylighted urban river promenade with shaded sunken amphitheater steps and riparian greenery.',
    arcadeNearby: true,
  },

  // Night Markets & Food Districts
  {
    id: 'fengjia',
    name: 'Fengjia Night Market & Wenhua Rd',
    nameZh: '逢甲夜市 / 文華路徒步區',
    district: 'Xitun District',
    coords: [24.1798, 120.6472],
    category: 'food',
    description: 'Taiwan’s largest night market district with dense overlapping shop awnings, covered food courts, and vibrant night pedestrian alleys.',
    arcadeNearby: true,
  },
  {
    id: 'yizhong_street',
    name: 'Yizhong Street Shopping & Food District',
    nameZh: '一中街商圈 (青年流行街)',
    district: 'North District',
    coords: [24.1505, 120.6852],
    category: 'food',
    description: 'High-energy student fashion and food hub with tightly packed covered stalls, shaded lane canopies, and arcade storefronts.',
    arcadeNearby: true,
  },
  {
    id: 'zhongxiao_night_market',
    name: 'Zhongxiao Road Night Market',
    nameZh: '忠孝路觀光夜市',
    district: 'South District',
    coords: [24.1298, 120.6855],
    category: 'food',
    description: 'Culinary corridor known for traditional eateries situated beneath continuous residential shop-house arcades (騎樓).',
    arcadeNearby: true,
  },
  {
    id: 'zhonghua_night_market',
    name: 'Zhonghua Road Historic Night Market',
    nameZh: '中華路夜市 (老字號小吃)',
    district: 'Central District',
    coords: [24.1441, 120.6767],
    category: 'food',
    description: 'Historic evening street food avenue framed by vintage 1960s covered pedestrian walkways and cinema arcades.',
    arcadeNearby: true,
  },

  // Shopping Centers & Malls
  {
    id: 'top_city',
    name: 'Top City (Far Eastern) Department Store',
    nameZh: '大遠百 Top City (七期新市政)',
    district: 'Xitun District',
    coords: [24.1648, 120.6425],
    category: 'shopping',
    description: 'Flagship 7th Redevelopment Zone luxury mall with expansive shaded covered drop-off colonnades and indoor cooling halls.',
    arcadeNearby: true,
  },
  {
    id: 'shin_kong',
    name: 'Shin Kong Mitsukoshi Taichung Store',
    nameZh: '新光三越 臺中中港店',
    district: 'Xitun District',
    coords: [24.1658, 120.6441],
    category: 'shopping',
    description: 'Top-grossing department store in Taiwan, featuring covered walkway connections along Taiwan Boulevard.',
    arcadeNearby: true,
  },
  {
    id: 'lalaport',
    name: 'Mitsui Shopping Park LaLaport Taichung',
    nameZh: '三井 LaLaport 臺中 (東區新地標)',
    district: 'East District',
    coords: [24.1338, 120.6922],
    category: 'shopping',
    description: 'Massive regional shopping mall with North/South buildings joined by an enclosed air-conditioned pedestrian skybridge.',
    arcadeNearby: true,
  },
  {
    id: 'sogo',
    name: 'Kuang San SOGO Department Store',
    nameZh: '廣三 SOGO 百貨',
    district: 'West District',
    coords: [24.1554, 120.6617],
    category: 'shopping',
    description: 'Taiwan Boulevard landmark with continuous grand colonnade and subterranean pedestrian connection under the avenue.',
    arcadeNearby: true,
  },
  {
    id: 'taroko_mall',
    name: 'Taroko Mall (Mode Mall Taichung)',
    nameZh: '大魯閣新時代購物中心',
    district: 'East District',
    coords: [24.1357, 120.6888],
    category: 'shopping',
    description: 'Directly east of Taichung Station, connected via shaded railway underpass and covered pedestrian plaza.',
    arcadeNearby: true,
  },
  {
    id: 'costco_taichung',
    name: 'COSTCO Wholesale Taichung Store',
    nameZh: '好市多 臺中店 (南屯)',
    district: 'Nantun District',
    coords: [24.1345, 120.6482],
    category: 'shopping',
    description: 'High-traffic retail warehouse adjacent to MRT Fengle Park with fully sheltered covered vehicle and pedestrian bays.',
    arcadeNearby: true,
  },

  // Universities & Education
  {
    id: 'tunghai_univ',
    name: 'Tunghai University & Luce Memorial Chapel',
    nameZh: '東海大學 / 路思義教堂',
    district: 'Xitun District',
    coords: [24.1788, 120.6005],
    category: 'university',
    description: 'Renowned wooded campus with historic I.M. Pei chapel, surrounded by cathedral-like camphor and phoenix tree shade corridors.',
    arcadeNearby: false,
  },
  {
    id: 'fcu_univ',
    name: 'Feng Chia University (FCU) Main Gate',
    nameZh: '逢甲大學 (正門廣場)',
    district: 'Xitun District',
    coords: [24.1802, 120.6488],
    category: 'university',
    description: 'Vibrant university campus entrance leading directly into shaded campus malls and the surrounding commercial arcade network.',
    arcadeNearby: true,
  },
  {
    id: 'nchu_univ',
    name: 'National Chung Hsing University (NCHU)',
    nameZh: '國立中興大學 (黑森林步道)',
    district: 'South District',
    coords: [24.1205, 120.6755],
    category: 'university',
    description: 'Agricultural flagship university featuring the famous Black Forest pine walk, green lake trail, and shaded campus perimeter.',
    arcadeNearby: false,
  },
  {
    id: 'cmu_univ',
    name: 'China Medical University Main Campus',
    nameZh: '中國醫藥大學 (水湳/英才校區)',
    district: 'North District',
    coords: [24.1565, 120.6828],
    category: 'university',
    description: 'Historic medical campus linked by covered building overpasses and shaded arcade sidewalks adjacent to Zhongzheng Park.',
    arcadeNearby: true,
  },

  // Healthcare & Public Administration
  {
    id: 'cmu_hospital',
    name: 'China Medical University Hospital',
    nameZh: '中國醫藥大學附設醫院 (醫學中心)',
    district: 'North District',
    coords: [24.1558, 120.6835],
    category: 'hospital',
    description: 'Major medical center complex linked by continuous underground and overhead covered pedways shielding patients from direct sun.',
    arcadeNearby: true,
  },
  {
    id: 'vgh_taichung',
    name: 'Taichung Veterans General Hospital',
    nameZh: '臺中榮民總醫院 (臺中榮總)',
    district: 'Xitun District',
    coords: [24.1838, 120.6035],
    category: 'hospital',
    description: 'Leading tertiary medical center on Dadu Mountain with sheltered bus shelters, covered ambulance canopies, and pavilion walks.',
    arcadeNearby: true,
  },
  {
    id: 'new_city_hall',
    name: 'Taichung City Government (New Civic Center)',
    nameZh: '臺中市政府 臺灣大道市政大樓',
    district: 'Xitun District',
    coords: [24.1625, 120.6472],
    category: 'culture',
    description: 'Modern glass-and-steel civic headquarters with massive shaded ground-level colonnade archways and civic greenway.',
    arcadeNearby: true,
  },
];

// Open Shade Map: Pre-calculated Covered Walkway (Qilou/Tingzaijiao) lines in Taichung
export const TAICHUNG_ARCADE_NETWORKS: [number, number][][] = [
  // Taiwan Boulevard Arcade corridor (Section 1)
  [
    [24.1373, 120.6869],
    [24.1384, 120.6845],
    [24.1401, 120.6815],
    [24.1423, 120.6787],
    [24.1450, 120.6740],
    [24.1480, 120.6690],
  ],
  // Zhongshan Road Historic Arcade
  [
    [24.1378, 120.6834],
    [24.1392, 120.6810],
    [24.1415, 120.6775],
    [24.1435, 120.6742],
  ],
  // Ziyou Road Covered Arcades (famous suncake street)
  [
    [24.1405, 120.6828],
    [24.1432, 120.6800],
    [24.1455, 120.6776],
  ],
  // Jiguang Street Pedestrian Covered Street
  [
    [24.1388, 120.6842],
    [24.1410, 120.6820],
    [24.1428, 120.6803],
  ],
  // Calligraphy Greenway shaded promenade
  [
    [24.1466, 120.6628],
    [24.1490, 120.6632],
    [24.1511, 120.6638],
    [24.1535, 120.6644],
    [24.1560, 120.6652],
    [24.1578, 120.6660],
  ],
  // Gongyuan Road arcade stretch
  [
    [24.1430, 120.6815],
    [24.1444, 120.6838],
    [24.1460, 120.6855],
  ],
];

// Major Tree Canopies in Taichung (Polygons)
export const TAICHUNG_CANOPY_ZONES: {
  name: string;
  coords: [number, number][];
  shadeDensity: number;
}[] = [
  {
    name: 'Taichung Park Century Banyan Forest',
    shadeDensity: 0.88,
    coords: [
      [24.1430, 120.6820],
      [24.1460, 120.6825],
      [24.1465, 120.6860],
      [24.1435, 120.6865],
    ],
  },
  {
    name: 'Calligraphy Greenway Canopy Corridor',
    shadeDensity: 0.82,
    coords: [
      [24.1465, 120.6620],
      [24.1580, 120.6650],
      [24.1580, 120.6670],
      [24.1465, 120.6640],
    ],
  },
  {
    name: 'National Museum Botanical Forest',
    shadeDensity: 0.92,
    coords: [
      [24.1565, 120.6645],
      [24.1610, 120.6645],
      [24.1610, 120.6685],
      [24.1565, 120.6685],
    ],
  },
  {
    name: 'Civil Square Shaded Lawn Perimeter',
    shadeDensity: 0.75,
    coords: [
      [24.1495, 120.6625],
      [24.1525, 120.6625],
      [24.1525, 120.6655],
      [24.1495, 120.6655],
    ],
  },
];

// Helper to generate a realistic set of 3 routes between start & end following street grids
export function generateCuratedRoutes(
  start: Landmark,
  end: Landmark
): NavigationRoute[] {
  // Use street-grid pedestrian routing following real streets & corners (never cutting through buildings)
  return [
    generateStreetGridPedestrianRoute(start, end, 'vampire_safe'),
    generateStreetGridPedestrianRoute(start, end, 'balanced'),
    generateStreetGridPedestrianRoute(start, end, 'direct_sun'),
  ];
}

/**
 * Computes distance in meters between two lat/lng coordinates (Haversine formula)
 */
export function computeDistanceMeters(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Evaluates whether a real physical GPS location is currently under an arcade or canopy
 */
export function evaluateLocationShade(
  coords: [number, number]
): {
  shadeType: 'arcade' | 'tree_canopy' | 'none';
  shadeRatio: number;
  nearestFeatureName: string;
} {
  // Check distance to any arcade network segment
  for (const line of TAICHUNG_ARCADE_NETWORKS) {
    for (const pt of line) {
      if (computeDistanceMeters(coords, pt) <= 35) {
        return {
          shadeType: 'arcade',
          shadeRatio: 0.95,
          nearestFeatureName: 'Taichung Covered Sidewalk Arcade (騎樓 Ting-zai-jiao)',
        };
      }
    }
  }

  // Check canopy zone
  for (const zone of TAICHUNG_CANOPY_ZONES) {
    const centerLat = zone.coords.reduce((acc, c) => acc + c[0], 0) / zone.coords.length;
    const centerLng = zone.coords.reduce((acc, c) => acc + c[1], 0) / zone.coords.length;
    if (computeDistanceMeters(coords, [centerLat, centerLng]) <= 120) {
      return {
        shadeType: 'tree_canopy',
        shadeRatio: zone.shadeDensity,
        nearestFeatureName: zone.name,
      };
    }
  }

  // Default: open exposure
  return {
    shadeType: 'none',
    shadeRatio: 0.15,
    nearestFeatureName: 'Open Street (Direct Sunlight)',
  };
}
