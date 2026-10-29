/**
 * High-fidelity visual assets and data for Sponsored Starter Kits & AI Concept Previews
 * Matching Image 1 (Sponsored starter kits) & Image 2 (Before/After AI Preview)
 */

export interface StarterKitOption {
  id: 'vertical_green' | 'misting_water' | 'shade_sail' | 'knitted_canopy';
  title: string;
  titleZh: string;
  tagline: string;
  description: string;
  descriptionZh: string;
  coolingImpact: string;
  shadeRatioBoost: string;
  estimatedCost: string;
  partnerType: string;
  imageUrl: string;
  svgVisual: string;
}

export const SPONSORED_STARTER_KITS: Record<string, StarterKitOption> = {
  vertical_green: {
    id: 'vertical_green',
    title: 'Vertical green',
    titleZh: '垂直綠化植生棚架',
    tagline: 'Fast climbing vines, planters and light trellises for facades',
    description: 'Fast climbing vines, planters and light trellises for facades',
    descriptionZh: '利用快生攀爬綠藤、人行道盆栽及輕量棚架網，將建築立面轉化為自然綠簾，有效隔絕輻射熱並降溫。',
    coolingImpact: '-3.8°C 體感降溫',
    shadeRatioBoost: '+85% 綠蔭遮蔽率',
    estimatedCost: 'NT$ 18,000 / 單元',
    partnerType: '社區景觀苗圃 x 市政綠美化補助',
    imageUrl: '/starter_kits/vertical_green.jpg',
    svgVisual: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%2387CEEB"/><stop offset="100%" stop-color="%23E0F6FF"/></linearGradient>
        <linearGradient id="wall1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23EAE6DF"/><stop offset="100%" stop-color="%23CFC9C0"/></linearGradient>
        <linearGradient id="pave1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23B0A8A0"/><stop offset="100%" stop-color="%238E867E"/></linearGradient>
        <linearGradient id="plant1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%2348bb78"/><stop offset="100%" stop-color="%2322543d"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(%23sky1)"/>
      <rect x="0" y="40" width="160" height="260" fill="url(%23wall1)"/>
      <rect x="15" y="80" width="120" height="150" fill="%232D3748" rx="4"/>
      <rect x="20" y="85" width="110" height="140" fill="%23EDF2F7" opacity="0.3"/>
      <!-- Trellis Wire -->
      <g stroke="%234A5568" stroke-width="1.5" opacity="0.6">
        <line x1="20" y1="50" x2="20" y2="240"/><line x1="50" y1="50" x2="50" y2="240"/><line x1="80" y1="50" x2="80" y2="240"/><line x1="110" y1="50" x2="110" y2="240"/><line x1="140" y1="50" x2="140" y2="240"/>
        <line x1="10" y1="70" x2="150" y2="70"/><line x1="10" y1="110" x2="150" y2="110"/><line x1="10" y1="150" x2="150" y2="150"/><line x1="10" y1="190" x2="150" y2="190"/><line x1="10" y1="230" x2="150" y2="230"/>
      </g>
      <!-- Lush climbing vines -->
      <g fill="url(%23plant1)">
        <circle cx="25" cy="180" r="14"/><circle cx="45" cy="160" r="18"/><circle cx="35" cy="130" r="16"/><circle cx="55" cy="110" r="15"/>
        <circle cx="75" cy="140" r="17"/><circle cx="85" cy="95" r="16"/><circle cx="105" cy="120" r="19"/><circle cx="125" cy="80" r="15"/>
        <circle cx="135" cy="150" r="18"/><circle cx="30" cy="210" r="16"/><circle cx="65" cy="200" r="18"/><circle cx="110" cy="190" r="17"/>
        <circle cx="140" cy="210" r="16"/><circle cx="80" cy="70" r="14"/><circle cx="50" cy="80" r="15"/><circle cx="120" cy="160" r="17"/>
      </g>
      <!-- Sidewalk Planters -->
      <rect x="10" y="235" width="145" height="30" fill="%234A5568" rx="3"/>
      <rect x="15" y="238" width="135" height="4" fill="%232D3748"/>
      <!-- Pavement -->
      <polygon points="0,250 400,210 400,300 0,300" fill="url(%23pave1)"/>
      <!-- Walking pedestrians in shade -->
      <g transform="translate(220, 160)">
        <circle cx="10" cy="15" r="8" fill="%232D3748"/>
        <path d="M5,25 Q10,45 8,70 L14,70 Q16,45 15,25 Z" fill="%234A5568"/>
        <circle cx="35" cy="20" r="7" fill="%231A202C"/>
        <path d="M30,30 Q35,50 33,72 L39,72 Q41,50 40,30 Z" fill="%232B6CB0"/>
      </g>
      <!-- Sunlight dappled shadows -->
      <ellipse cx="235" cy="275" rx="35" ry="8" fill="%23000" opacity="0.25"/>
    </svg>`,
  },
  misting_water: {
    id: 'misting_water',
    title: 'Misting and water',
    titleZh: '微霧水降溫噴淋系統',
    tagline: 'Plug-in misting nozzles and sprinklers for outdoor hose outlets',
    description: 'Plug-in misting nozzles and sprinklers for outdoor hose outlets',
    descriptionZh: '即插即用型高壓微霧噴嘴，接駁於商鋪戶外水龍頭，於正午高溫時自動蒸發吸熱，快速降溫4至5度。',
    coolingImpact: '-5.2°C 瞬間涼感降溫',
    shadeRatioBoost: '+65% 熱島微氣候改善',
    estimatedCost: 'NT$ 12,500 / 門店套件',
    partnerType: '沿街商鋪店面 x 節水微噴灌贊助',
    imageUrl: '/starter_kits/misting_water.jpg',
    svgVisual: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%2363B3ED"/><stop offset="100%" stop-color="%23BEE3F8"/></linearGradient>
        <linearGradient id="mistG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23EBF8FF" stop-opacity="0.9"/><stop offset="100%" stop-color="%23BEE3F8" stop-opacity="0.1"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(%23sky2)"/>
      <!-- Shop building & awning -->
      <rect x="0" y="30" width="220" height="270" fill="%23D69E2E" opacity="0.2"/>
      <path d="M0,70 L230,85 L220,115 L0,95 Z" fill="%239B2C2C"/>
      <!-- Store Sign: 清心茶飲 -->
      <rect x="180" y="90" width="30" height="70" fill="%23276749" rx="2"/>
      <text x="195" y="115" font-size="11" fill="%23FFF" font-weight="bold" text-anchor="middle" font-family="sans-serif">清</text>
      <text x="195" y="132" font-size="11" fill="%23FFF" font-weight="bold" text-anchor="middle" font-family="sans-serif">心</text>
      <text x="195" y="149" font-size="9" fill="%23FFF" font-weight="bold" text-anchor="middle" font-family="sans-serif">茶飲</text>
      <!-- Misting line pipe -->
      <line x1="5" y1="95" x2="225" y2="115" stroke="%23CBD5E0" stroke-width="4"/>
      <!-- Nozzles -->
      <circle cx="35" cy="98" r="3" fill="%234A5568"/>
      <circle cx="85" cy="102" r="3" fill="%234A5568"/>
      <circle cx="135" cy="107" r="3" fill="%234A5568"/>
      <circle cx="185" cy="111" r="3" fill="%234A5568"/>
      <!-- Misting Clouds / Fine droplets -->
      <ellipse cx="40" cy="140" rx="35" ry="45" fill="url(%23mistG)"/>
      <ellipse cx="90" cy="150" rx="40" ry="50" fill="url(%23mistG)"/>
      <ellipse cx="140" cy="155" rx="45" ry="52" fill="url(%23mistG)"/>
      <ellipse cx="190" cy="160" rx="35" ry="48" fill="url(%23mistG)"/>
      <ellipse cx="115" cy="180" rx="75" ry="45" fill="url(%23mistG)"/>
      <!-- Pedestrians enjoying mist cooling -->
      <g transform="translate(130, 165)">
        <circle cx="15" cy="12" r="8" fill="%232D3748"/>
        <path d="M8,22 Q15,45 13,80 L20,80 Q22,45 20,22 Z" fill="%23FFF"/>
        <circle cx="45" cy="15" r="8" fill="%232D3748"/>
        <path d="M38,25 Q45,50 43,80 L50,80 Q52,50 50,25 Z" fill="%232B6CB0"/>
      </g>
      <!-- Pavement -->
      <polygon points="0,250 400,230 400,300 0,300" fill="%23718096"/>
      <!-- Wet mist pavement reflection -->
      <ellipse cx="140" cy="275" rx="80" ry="14" fill="%23BEE3F8" opacity="0.45"/>
    </svg>`,
  },
  shade_sail: {
    id: 'shade_sail',
    title: 'Shade sail',
    titleZh: '模組化懸掛式遮陽帆',
    tagline: 'Modular canvas canopies between balconies or posts',
    description: 'Modular canvas canopies between balconies or posts',
    descriptionZh: '張拉於街區二樓陽台或輕量立柱間的三角帆布天幕，抗UV率達98%，形成連續波浪形高空遮蔭廊道。',
    coolingImpact: '-4.5°C 阻隔直射日照',
    shadeRatioBoost: '+90% 地表陰影覆蓋',
    estimatedCost: 'NT$ 22,000 / 組',
    partnerType: '商圈街區協會 x 建築帆布製造商',
    imageUrl: '/starter_kits/shade_sail.jpg',
    svgVisual: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%234299E1"/><stop offset="100%" stop-color="%2390CDF4"/></linearGradient>
        <linearGradient id="sail1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23FAF089"/><stop offset="100%" stop-color="%23ECC94B"/></linearGradient>
        <linearGradient id="sail2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23FFF5F5"/><stop offset="100%" stop-color="%23E2E8F0"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(%23sky3)"/>
      <!-- Street Buildings Left and Right -->
      <polygon points="0,0 120,40 120,300 0,300" fill="%23CBD5E0"/>
      <polygon points="400,0 280,40 280,300 400,300" fill="%23CBD5E0"/>
      <!-- Connecting High-tension wires -->
      <line x1="80" y1="60" x2="220" y2="100" stroke="%234A5568" stroke-width="2"/>
      <line x1="220" y1="100" x2="330" y2="70" stroke="%234A5568" stroke-width="2"/>
      <line x1="90" y1="110" x2="310" y2="120" stroke="%234A5568" stroke-width="2"/>
      <!-- Triangular Shade Sails -->
      <!-- Sail A -->
      <polygon points="90,65 240,95 150,140" fill="url(%23sail2)" stroke="%23CBD5E0" stroke-width="1.5"/>
      <!-- Sail B -->
      <polygon points="180,90 320,75 250,150" fill="url(%23sail1)" stroke="%23D69E2E" stroke-width="1.5" opacity="0.95"/>
      <!-- Sail C -->
      <polygon points="110,135 270,145 190,195" fill="url(%23sail2)" stroke="%23CBD5E0" stroke-width="1.5"/>
      <!-- Shadows projected on street floor -->
      <polygon points="120,230 280,225 240,290 140,290" fill="%232D3748" opacity="0.45"/>
      <!-- Pavement -->
      <polygon points="120,220 280,220 320,300 80,300" fill="%23E2E8F0"/>
      <polygon points="140,235 260,235 245,285 135,285" fill="%234A5568" opacity="0.35"/>
      <!-- Pedestrians walking comfortably in shade -->
      <g transform="translate(180, 215)">
        <circle cx="10" cy="12" r="6" fill="%231A202C"/>
        <path d="M6,20 Q10,38 8,60 L14,60 Q16,38 15,20 Z" fill="%232B6CB0"/>
        <circle cx="28" cy="14" r="5" fill="%231A202C"/>
        <path d="M24,20 Q28,38 27,60 L32,60 Q34,38 33,20 Z" fill="%23E53E3E"/>
      </g>
    </svg>`,
  },
  knitted_canopy: {
    id: 'knitted_canopy',
    title: 'Knitted canopy',
    titleZh: '社區編織彩繪遮陽天幕',
    tagline: 'Community-made panels on a partner-built structure',
    description: 'Community-made panels on a partner-built structure',
    descriptionZh: '在地居民手工編織的幾何彩繪遮陽布片，搭設於輕量鋼構支架之上，既透氣又濾光，賦予街區藝術美感。',
    coolingImpact: '-3.2°C 溫潤透氣降溫',
    shadeRatioBoost: '+80% 社區休憩綠蔭',
    estimatedCost: 'NT$ 15,000 / 組 (社區共創)',
    partnerType: '在地社造工坊 x 志工編織工作坊',
    imageUrl: '/starter_kits/knitted_canopy.jpg',
    svgVisual: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%2363B3ED"/><stop offset="100%" stop-color="%23EBF8FF"/></linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(%23sky4)"/>
      <!-- Pergola Steel Frame Structure -->
      <g stroke="%232D3748" stroke-width="4">
        <!-- Vertical Posts -->
        <line x1="60" y1="80" x2="60" y2="260"/>
        <line x1="160" y1="75" x2="160" y2="255"/>
        <line x1="260" y1="75" x2="260" y2="255"/>
        <line x1="360" y1="80" x2="360" y2="260"/>
        <!-- Horizontal Roof Beams -->
        <line x1="50" y1="80" x2="370" y2="80"/>
        <line x1="55" y1="100" x2="365" y2="100"/>
      </g>
      <!-- Knitted Patchwork Panels (Community Crochet/Lace) -->
      <g stroke="%23FFF" stroke-width="1.5">
        <rect x="65" y="80" width="45" height="40" fill="%23DD6B20"/>
        <circle cx="87" cy="100" r="10" fill="none" stroke="%23FFF"/>
        <rect x="115" y="80" width="45" height="40" fill="%23D69E2E"/>
        <circle cx="137" cy="100" r="10" fill="none" stroke="%23FFF"/>
        <rect x="165" y="80" width="45" height="40" fill="%23319795"/>
        <circle cx="187" cy="100" r="10" fill="none" stroke="%23FFF"/>
        <rect x="215" y="80" width="45" height="40" fill="%23E53E3E"/>
        <circle cx="237" cy="100" r="10" fill="none" stroke="%23FFF"/>
        <rect x="265" y="80" width="45" height="40" fill="%2338A169"/>
        <circle cx="287" cy="100" r="10" fill="none" stroke="%23FFF"/>
        <rect x="315" y="80" width="45" height="40" fill="%23805AD5"/>
        <circle cx="337" cy="100" r="10" fill="none" stroke="%23FFF"/>
      </g>
      <g fill="%232D3748" opacity="0.35">
        <ellipse cx="110" cy="265" rx="35" ry="12"/>
        <ellipse cx="180" cy="265" rx="35" ry="12"/>
        <ellipse cx="250" cy="265" rx="35" ry="12"/>
        <ellipse cx="320" cy="265" rx="35" ry="12"/>
      </g>
      <rect x="120" y="220" width="100" height="15" fill="%23975A16" rx="2"/>
      <line x1="130" y1="235" x2="130" y2="255" stroke="%234A5568" stroke-width="4"/>
      <line x1="210" y1="235" x2="210" y2="255" stroke="%234A5568" stroke-width="4"/>
      <circle cx="150" cy="195" r="7" fill="%232D3748"/>
      <rect x="144" y="205" width="12" height="25" fill="%23E53E3E" rx="2"/>
      <circle cx="185" cy="197" r="7" fill="%232D3748"/>
      <rect x="179" y="207" width="12" height="25" fill="%232B6CB0" rx="2"/>
    </svg>`,
  },
};

/**
 * AI Concept Preview data: BEFORE vs AFTER matching Image 2
 */
export interface ConceptPreviewScene {
  id: string;
  streetName: string;
  streetNameZh: string;
  district: string;
  coords: [number, number];
  starterKitId: 'vertical_green' | 'misting_water' | 'shade_sail' | 'knitted_canopy';
  beforeTemp: number; // e.g. 38.5°C
  afterTemp: number; // e.g. 29.8°C
  beforeShade: number; // e.g. 15%
  afterShade: number; // e.g. 92%
  uvIndexBefore: number; // e.g. 11.2 (Extreme)
  uvIndexAfter: number; // e.g. 2.1 (Low)
  upvotes: number;
  beforeVisualSvg: string;
  afterVisualSvg: string;
}

export const STARTER_KIT_AFTER_IMAGES: Record<string, string> = {
  vertical_green: '/starter_kits/vertical_green.jpg',
  misting_water: '/starter_kits/misting_water.jpg',
  shade_sail: '/starter_kits/shade_sail.jpg',
  knitted_canopy: '/starter_kits/knitted_canopy.jpg',
};

export const CONCEPT_PREVIEW_SCENES: Record<string, ConceptPreviewScene> = {
  'prop-1': {
    id: 'prop-1',
    streetName: 'Jianguo Rd & Taiwan Blvd Intersection (near Station)',
    streetNameZh: '建國路與臺灣大道一段交叉口 (臺中車站前)',
    district: 'Central District (中區)',
    coords: [24.1388, 120.6848],
    starterKitId: 'vertical_green',
    beforeTemp: 39.8,
    afterTemp: 31.2,
    beforeShade: 12,
    afterShade: 92,
    uvIndexBefore: 11.4,
    uvIndexAfter: 2.3,
    upvotes: 48,
    beforeVisualSvg: '/starter_kits/before_sun.jpg',
    afterVisualSvg: '/starter_kits/vertical_green.jpg',
  },
  'prop-2': {
    id: 'prop-2',
    streetName: 'Civil Square Southern Edge (Civic Plaza)',
    streetNameZh: '市民廣場南側行人徒步區',
    district: 'West District (西區)',
    coords: [24.1482, 120.6631],
    starterKitId: 'shade_sail',
    beforeTemp: 38.6,
    afterTemp: 30.1,
    beforeShade: 18,
    afterShade: 89,
    uvIndexBefore: 10.9,
    uvIndexAfter: 2.5,
    upvotes: 36,
    beforeVisualSvg: '/starter_kits/before_sun.jpg',
    afterVisualSvg: '/starter_kits/shade_sail.jpg',
  },
  'prop-3': {
    id: 'prop-3',
    streetName: 'Sanmin Rd near Second Market entrance',
    streetNameZh: '三民路二段與第二市場入口前',
    district: 'Central District (中區)',
    coords: [24.1430, 120.6775],
    starterKitId: 'misting_water',
    beforeTemp: 40.2,
    afterTemp: 31.8,
    beforeShade: 14,
    afterShade: 91,
    uvIndexBefore: 11.5,
    uvIndexAfter: 2.1,
    upvotes: 42,
    beforeVisualSvg: '/starter_kits/before_sun.jpg',
    afterVisualSvg: '/starter_kits/misting_water.jpg',
  },
  'prop-4': {
    id: 'prop-4',
    streetName: 'Jingming 1st St & Calligraphy Greenway connector',
    streetNameZh: '精明一街與草悟道銜接行人走廊',
    district: 'West District (西區)',
    coords: [24.1530, 120.6640],
    starterKitId: 'knitted_canopy',
    beforeTemp: 37.9,
    afterTemp: 29.5,
    beforeShade: 20,
    afterShade: 88,
    uvIndexBefore: 10.5,
    uvIndexAfter: 2.8,
    upvotes: 29,
    beforeVisualSvg: '/starter_kits/before_sun.jpg',
    afterVisualSvg: '/starter_kits/knitted_canopy.jpg',
  },
};
