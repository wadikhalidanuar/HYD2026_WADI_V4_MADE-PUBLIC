export interface CoolingOutlet {
  id: string;
  name: string;
  nameZh: string;
  category: 'cafe' | 'tea' | 'ice_dessert' | 'bakery' | 'cooling_shelter';
  coords: [number, number];
  address: string;
  offerTitle: string;
  offerDetails: string;
  tokenCost: number;
  partnerBenefit: string;
  icon: string;
  photoUrl?: string;
}

export const TAICHUNG_COOLING_OUTLETS: CoolingOutlet[] = [
  {
    id: 'chun_shui_tang_siwei',
    name: 'Chun Shui Tang Original Store',
    nameZh: '春水堂 創始店 (四維街)',
    category: 'tea',
    coords: [24.1378, 120.6729],
    address: 'No. 30, Siwei St, West District, Taichung City',
    offerTitle: '20% Off Iced Tieguanyin Milk Tea',
    offerDetails: 'Redeem 30 Cooling Tokens for 20% discount on any cold signature beverage & free shaded indoor seating.',
    tokenCost: 30,
    partnerBenefit: 'Local discount & pedestrian foot traffic',
    icon: '🧋',
  },
  {
    id: 'miyahara_ice',
    name: 'Miyahara Historic Eye Clinic & Ice Parlor',
    nameZh: '宮原眼科 綠川涼憩站',
    category: 'ice_dessert',
    coords: [24.1378, 120.6834],
    address: 'No. 20, Zhongshan Rd, Central District, Taichung City',
    offerTitle: 'Free Cold Brew Herbal Tea + Shaded Patio Pass',
    offerDetails: 'Redeem 25 Cooling Tokens for a free iced Taiwanese Luohanguo tea and priority shaded riverside arcade seating.',
    tokenCost: 25,
    partnerBenefit: 'Heritage arcade promotion',
    icon: '🍨',
  },
  {
    id: 'fengjia_taro_ice',
    name: 'Feng Chia Dajia Taro Ice Oasis',
    nameZh: '逢甲 大甲芋頭城 涼憩站',
    category: 'ice_dessert',
    coords: [24.1788, 120.6465],
    address: 'No. 46, Fuxing Rd, Xitun District, Taichung City',
    offerTitle: 'NT$15 Off Handmade Shaved Taro Ice',
    offerDetails: 'Redeem 20 Cooling Tokens for an instant NT$15 discount on signature icy taro balls in Feng Chia market.',
    tokenCost: 20,
    partnerBenefit: 'Night market shaded foot traffic',
    icon: '🍧',
  },
  {
    id: 'green_light_cafe',
    name: 'Calligraphy Greenway Green Light Cafe',
    nameZh: '草悟道 綠光計畫 涼茶鋪',
    category: 'cafe',
    coords: [24.1482, 120.6631],
    address: 'Zhongxing 1st Lane, West District, Taichung City',
    offerTitle: 'Buy 1 Get 1 Free Cold Citrus Cold Brew',
    offerDetails: 'Redeem 40 Cooling Tokens for 2-for-1 refreshing cold citrus coffee under the lush tree canopy.',
    tokenCost: 40,
    partnerBenefit: 'Community garden foot traffic',
    icon: '☕',
  },
  {
    id: 'taichung_station_kiosk',
    name: 'Taichung Station Shaded Heritage Pavilion',
    nameZh: '臺中驛 鐵道木造涼亭合作店',
    category: 'cooling_shelter',
    coords: [24.1373, 120.6869],
    address: 'Old Taichung Station Plaza, Central District',
    offerTitle: 'Free Cooling Mist Refill & Chilled Towel',
    offerDetails: 'Redeem 15 Cooling Tokens for an iced mineral spray refill, cooling neck patch, and shaded bench access.',
    tokenCost: 15,
    partnerBenefit: 'Civic cooling infrastructure',
    icon: '💧',
  },
  {
    id: 'yizhong_black_tea',
    name: 'Yizhong Street Ayue Iced Black Tea',
    nameZh: '一中街 阿月紅茶冰 綠蔭站',
    category: 'tea',
    coords: [24.1502, 120.6853],
    address: 'No. 96, Yizhong St, North District, Taichung City',
    offerTitle: 'Free Up-size to Giant Shaded Cup (1000cc)',
    offerDetails: 'Redeem 20 Cooling Tokens to upgrade any iced black tea to 1000cc jumbo insulated cup.',
    tokenCost: 20,
    partnerBenefit: 'Local student shopping district discount',
    icon: '🥤',
  },
  {
    id: 'shenji_bakery_cafe',
    name: 'Shenji New Village Shaded Bakery',
    nameZh: '審計新村 綠蔭文創麵包房',
    category: 'bakery',
    coords: [24.1458, 120.6622],
    address: 'Minsheng Rd, West District, Taichung City',
    offerTitle: 'Free Chilled Custard Cream Puff with Any Drink',
    offerDetails: 'Redeem 30 Cooling Tokens for an artisanal cold cream puff under the historic courtyard tree shade.',
    tokenCost: 30,
    partnerBenefit: 'Boutique village promotion',
    icon: '🥐',
  },
  {
    id: 'national_museum_cafe',
    name: 'National Fine Arts Museum Shaded Garden',
    nameZh: '國立臺灣美術館 雕塑涼廊咖啡',
    category: 'cafe',
    coords: [24.1408, 120.6635],
    address: 'No. 2, Sec. 1, Wuquan W. Rd, West District',
    offerTitle: '15% Off Cold Botanical Drinks & Sculpture Tour',
    offerDetails: 'Redeem 25 Cooling Tokens for 15% off iced herbal infusions inside the covered sculpture colonnade.',
    tokenCost: 25,
    partnerBenefit: 'Museum pedestrian corridor partnership',
    icon: '🏛️',
  },
];
