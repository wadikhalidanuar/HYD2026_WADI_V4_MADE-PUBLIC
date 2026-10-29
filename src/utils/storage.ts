import { ShadeProposal, UserDemographics, ShadeProposalCategory } from '../types';

const STORAGE_KEYS = {
  USER_DEMOGRAPHICS: 'umbranav_user_demographics_v1',
  SHADE_PROPOSALS: 'umbranav_shade_proposals_v1',
  ACTIVE_GEAR: 'umbranav_active_gear_v1',
  COOLING_TOKENS: 'umbranav_cooling_tokens_v1',
  TOKEN_TRANSACTIONS: 'umbranav_token_transactions_v1',
};

export interface TokenTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'redeem';
  title: string;
  description: string;
  timestamp: string;
}

export function getCoolingTokens(): number {
  if (typeof window === 'undefined') return 85;
  const stored = localStorage.getItem(STORAGE_KEYS.COOLING_TOKENS);
  if (stored) {
    const val = parseInt(stored, 10);
    return isNaN(val) ? 85 : val;
  }
  // Initialize with 85 welcome tokens
  localStorage.setItem(STORAGE_KEYS.COOLING_TOKENS, '85');
  return 85;
}

export function addCoolingTokens(amount: number, title: string, description: string): number {
  const current = getCoolingTokens();
  const next = current + amount;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.COOLING_TOKENS, next.toString());
    const tx: TokenTransaction = {
      id: 'tx-' + Date.now(),
      amount,
      type: 'earn',
      title,
      description,
      timestamp: new Date().toISOString(),
    };
    const txList = getTokenTransactions();
    txList.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TOKEN_TRANSACTIONS, JSON.stringify(txList.slice(0, 30)));
    window.dispatchEvent(new CustomEvent('cooling-tokens-updated', { detail: { tokens: next, added: amount, title } }));
  }
  return next;
}

export function redeemCoolingTokens(amount: number, outletId: string, offerTitle: string): boolean {
  const current = getCoolingTokens();
  if (current < amount) return false;
  const next = current - amount;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.COOLING_TOKENS, next.toString());
    const tx: TokenTransaction = {
      id: 'tx-' + Date.now(),
      amount,
      type: 'redeem',
      title: `Redeemed: ${offerTitle}`,
      description: `Partner outlet reward redemption (${outletId})`,
      timestamp: new Date().toISOString(),
    };
    const txList = getTokenTransactions();
    txList.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TOKEN_TRANSACTIONS, JSON.stringify(txList.slice(0, 30)));
    window.dispatchEvent(new CustomEvent('cooling-tokens-updated', { detail: { tokens: next, deducted: amount, title: offerTitle } }));
  }
  return true;
}

export function getTokenTransactions(): TokenTransaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.TOKEN_TRANSACTIONS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  const defaultTx: TokenTransaction[] = [
    {
      id: 'tx-init-1',
      amount: 50,
      type: 'earn',
      title: 'Welcome Cooling Pioneer Bonus',
      description: 'Joined the Taichung Urban Shade microclimate network',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'tx-init-2',
      amount: 35,
      type: 'earn',
      title: 'Walked Shaded Arcade Corridor',
      description: 'Maintained 95% HP along Central District Ting-zai-jiao',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEYS.TOKEN_TRANSACTIONS, JSON.stringify(defaultTx));
  return defaultTx;
}


export const INITIAL_USER_DEMOGRAPHICS: UserDemographics = {
  registered: false,
  registeredAt: '',
  userId: 'vamp-' + Math.random().toString(36).substring(2, 9),
  nickname: 'Taichung Nightwalker',
  ageGroup: '25_34',
  gender: 'prefer_not_to_say',
  nationality: 'Taiwan',
  ethnicity: 'East Asian',
  walkingFrequency: 'daily',
  heatSensitivity: 'extreme_vampire',
  vampireClan: 'Nosferatu Nightwalker',
};

// Seed initial realistic proposals in Taichung to make map vibrant out of the box
export const INITIAL_COMMUNITY_PROPOSALS: ShadeProposal[] = [
  {
    id: 'prop-1',
    userId: 'vamp-tw-01',
    userDemographics: {
      ageGroup: '25_34',
      gender: 'female',
      nationality: 'Taiwan',
      ethnicity: 'Han Chinese',
    },
    coords: [24.1388, 120.6848],
    addressName: 'Jianguo Rd & Taiwan Blvd Intersection (near Station)',
    category: 'vertical_green',
    categoryTitle: 'Vertical green (垂直綠化植生棚架)',
    notes: 'Reported heat trap: The arcade breaks right before the station bus lane. AI Concept Preview shows fast climbing vines and facade trellises cooling the walkway by 4°C!',
    urgency: 'critical_burn',
    upvotes: 48,
    hasPhoto: true,
    photoUrl: '/starter_kits/vertical_green.jpg',
    createdAt: '2026-10-12T14:20:00Z',
    status: 'submitted_to_taichung_gov',
  },
  {
    id: 'prop-2',
    userId: 'vamp-my-04',
    userDemographics: {
      ageGroup: '18_24',
      gender: 'male',
      nationality: 'Malaysia',
      ethnicity: 'Southeast Asian',
    },
    coords: [24.1482, 120.6631],
    addressName: 'Civil Square Southern Edge (Civic Plaza)',
    category: 'shade_sail',
    categoryTitle: 'Shade sail (模組化懸掛式遮陽帆)',
    notes: 'Wide open sidewalk heat trap between CMP greenway and park. Modular canvas canopies between balconies or posts will bridge the pedestrian shade network.',
    urgency: 'high_heat',
    upvotes: 36,
    hasPhoto: true,
    photoUrl: '/starter_kits/shade_sail.jpg',
    createdAt: '2026-10-13T10:15:00Z',
    status: 'scheduled_planting',
  },
  {
    id: 'prop-3',
    userId: 'vamp-id-09',
    userDemographics: {
      ageGroup: '35_49',
      gender: 'female',
      nationality: 'Indonesia',
      ethnicity: 'Austronesian',
    },
    coords: [24.1430, 120.6775],
    addressName: 'Sanmin Rd near Second Market entrance',
    category: 'misting_water',
    categoryTitle: 'Misting and water (微霧水降溫噴淋系統)',
    notes: 'Peak noon asphalt reaches 40.2°C near market entrance. Plug-in misting nozzles and outdoor hose sprinklers will instantly drop apparent temperature.',
    urgency: 'critical_burn',
    upvotes: 42,
    hasPhoto: true,
    photoUrl: '/starter_kits/misting_water.jpg',
    createdAt: '2026-10-14T11:45:00Z',
    status: 'community_reviewed',
  },
  {
    id: 'prop-4',
    userId: 'vamp-us-12',
    userDemographics: {
      ageGroup: '50_64',
      gender: 'non_binary',
      nationality: 'United States',
      ethnicity: 'Caucasian',
    },
    coords: [24.1530, 120.6640],
    addressName: 'Jingming 1st St & Calligraphy Greenway connector',
    category: 'knitted_canopy',
    categoryTitle: 'Knitted canopy (社區編織彩繪遮陽天幕)',
    notes: 'Exposed pedestrian alleyway. Community-made crochet panels on a partner-built steel structure will turn this heat trap into a colorful cultural shaded sanctuary.',
    urgency: 'high_heat',
    upvotes: 29,
    hasPhoto: true,
    photoUrl: '/starter_kits/knitted_canopy.jpg',
    createdAt: '2026-10-14T15:30:00Z',
    status: 'community_reviewed',
  },
];

export function getStoredUserDemographics(): UserDemographics {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_DEMOGRAPHICS);
    if (!raw) return INITIAL_USER_DEMOGRAPHICS;
    return { ...INITIAL_USER_DEMOGRAPHICS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_USER_DEMOGRAPHICS;
  }
}

export function saveUserDemographics(data: UserDemographics): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DEMOGRAPHICS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save demographics', e);
  }
}

export function getStoredProposals(): ShadeProposal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHADE_PROPOSALS);
    if (!raw) {
      // Initialize with seed data
      localStorage.setItem(STORAGE_KEYS.SHADE_PROPOSALS, JSON.stringify(INITIAL_COMMUNITY_PROPOSALS));
      return INITIAL_COMMUNITY_PROPOSALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMMUNITY_PROPOSALS;
  }
}

export function saveShadeProposal(proposal: ShadeProposal): ShadeProposal[] {
  try {
    const current = getStoredProposals();
    const updated = [proposal, ...current];
    localStorage.setItem(STORAGE_KEYS.SHADE_PROPOSALS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save proposal', e);
    return [proposal, ...INITIAL_COMMUNITY_PROPOSALS];
  }
}

export function upvoteProposal(id: string): ShadeProposal[] {
  try {
    const current = getStoredProposals();
    const updated = current.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
    localStorage.setItem(STORAGE_KEYS.SHADE_PROPOSALS, JSON.stringify(updated));
    return updated;
  } catch {
    return getStoredProposals();
  }
}

export function exportProposalsToJSON(): void {
  const data = {
    app: 'UmbraNav - Taichung Vampire Shade Walker',
    exportedAt: new Date().toISOString(),
    proposalsCount: getStoredProposals().length,
    proposals: getStoredProposals(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `umbranav-taichung-shade-proposals-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportProposalsToCSV(customProposals?: ShadeProposal[]): void {
  const proposals = customProposals || getStoredProposals();
  const headers = [
    'Proposal ID',
    'Category Title',
    'Category ID',
    'Road Name / Address / Intersection',
    'Exact GPS Latitude (N)',
    'Exact GPS Longitude (E)',
    'GPS WGS84 Coords',
    'Google Maps Link',
    'Urgency Level',
    'Community Upvotes',
    'Submitter Age Group',
    'Submitter Gender',
    'Submitter Nationality',
    'Citizen Notes / Request Details',
    'Date Submitted',
  ];

  const rows = proposals.map((p) => [
    `"${p.id}"`,
    `"${p.categoryTitle.replace(/"/g, '""')}"`,
    `"${p.category}"`,
    `"${p.addressName.replace(/"/g, '""')}"`,
    p.coords[0].toFixed(6),
    p.coords[1].toFixed(6),
    `"${p.coords[0].toFixed(6)}, ${p.coords[1].toFixed(6)}"`,
    `"https://www.google.com/maps?q=${p.coords[0]},${p.coords[1]}"`,
    `"${p.urgency === 'critical_burn' ? 'Critical Sunburn Danger' : 'High Heat'}"`,
    p.upvotes,
    `"${p.userDemographics?.ageGroup || 'N/A'}"`,
    `"${p.userDemographics?.gender || 'N/A'}"`,
    `"${p.userDemographics?.nationality || 'Taiwan'}"`,
    `"${p.notes.replace(/"/g, '""')}"`,
    `"${new Date(p.createdAt).toISOString()}"`,
  ]);

  // \uFEFF Byte Order Mark for Microsoft Excel UTF-8 encoding support
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Taichung_Shade_Proposals_GPS_Analytics_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const exportProposalsToExcel = exportProposalsToCSV;

export const CATEGORY_LABELS: Record<ShadeProposalCategory, { label: string; icon: string; desc: string }> = {
  vertical_green: {
    label: 'Vertical green (垂直綠化植生棚架)',
    icon: '🌿',
    desc: 'Fast climbing vines, planters and light trellises for facades',
  },
  misting_water: {
    label: 'Misting and water (微霧水降溫噴淋系統)',
    icon: '💧',
    desc: 'Plug-in misting nozzles and sprinklers for outdoor hose outlets',
  },
  shade_sail: {
    label: 'Shade sail (模組化懸掛式遮陽帆)',
    icon: '⛵',
    desc: 'Modular canvas canopies between balconies or posts',
  },
  knitted_canopy: {
    label: 'Knitted canopy (社區編織彩繪遮陽天幕)',
    icon: '🧶',
    desc: 'Community-made panels on a partner-built structure',
  },
  arcade_roof: {
    label: 'Pedestrian Arcade Roof (騎樓簷篷)',
    icon: '🏛️',
    desc: 'Extend continuous Taiwanese covered walkway roof over gap',
  },
  shade_tree: {
    label: 'Plant a Shade Tree (種植林蔭大樹)',
    icon: '🌳',
    desc: 'Plant high-canopy trees (Camphor, Banyan, Rain Tree)',
  },
  solar_canopy: {
    label: 'High-Tech Solar Tensile Pergola (科技張拉膜涼亭)',
    icon: '☂️',
    desc: 'Reflective UV-blocking fabric shade structure',
  },
  mist_cooling: {
    label: 'Mist-Cooling Shade Awning (噴霧遮陽廊)',
    icon: '💧',
    desc: 'Combine shaded canvas with micro-droplet evaporative cooling',
  },
  green_trellis: {
    label: 'Living Green Trellis / Vine Wall (垂直綠化棚架)',
    icon: '🌿',
    desc: 'Climbing vines on architectural timber/steel frame',
  },
  pedestrian_overpass: {
    label: 'Covered Crosswalk / Shaded Overpass (遮陽天橋/路口)',
    icon: '🌉',
    desc: 'Overhead shade covering wide multi-lane traffic intersections',
  },
  retractable_sail: {
    label: 'Retractable Smart Shade Sail (電動伸縮遮陽帆)',
    icon: '⛺',
    desc: 'Automated weather-responsive shade deployment',
  },
};
