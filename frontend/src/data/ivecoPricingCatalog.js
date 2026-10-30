// IVECO 2026 Model Fiyat Matrisi ve Dinamik Fiyatlama Kataloğu
// Eylül 2026 Resmi Fiyatlandırma Kuralları ile yapılandırılmıştır.

export const IVECO_PRICING_CATALOG = [
  // ==========================================
  // GRUP 1: 2026 MODEL DAILY 35 ŞASİ KAMYONET
  // Kural: Maliyet + 250.000 TL | Peşin İndirimi: -190.000 TL
  // ==========================================
  {
    id: 'daily-35s16-3450-h',
    segment: 'Daily 35',
    category: 'Şasi Kamyonet',
    model: 'IVECO DAILY 35 S 16 CC 3450 H 2.3',
    engine: '2.3 F1A',
    power: '2287 CM3 115 KW (156 BG)',
    transmission: 'Manuel',
    wheelbase: 3450,
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 1825000,
    campaignPrice: 2075000,
    cashDiscount: 190000,
    cashPrice: 1885000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35s16-3450-himatic',
    segment: 'Daily 35',
    category: 'Şasi Kamyonet',
    model: 'IVECO DAILY 35 S 16 H A 8 CC 3450 2.3 Hi-Matic',
    engine: '2.3 F1A',
    power: '2287 CM3 115 KW (156 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 3450,
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 1935000,
    campaignPrice: 2185000,
    cashDiscount: 190000,
    cashPrice: 1995000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35s16-3750-h',
    segment: 'Daily 35',
    category: 'Şasi Kamyonet',
    model: 'IVECO DAILY 35 S 16 CC 3750 H 2.3',
    engine: '2.3 F1A',
    power: '2287 CM3 115 KW (156 BG)',
    transmission: 'Manuel',
    wheelbase: 3750,
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 1855000,
    campaignPrice: 2105000,
    cashDiscount: 190000,
    cashPrice: 1915000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35s16-3450-dc-himatic',
    segment: 'Daily 35',
    category: 'Çift Kabin Şasi Kamyonet',
    model: 'IVECO DAILY 35 S 16 H A 8 DC 3450 2.3 Çift Kabin Hi-Matic',
    engine: '2.3 F1A',
    power: '2287 CM3 115 KW (156 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 3450,
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2190000,
    campaignPrice: 2440000,
    cashDiscount: 190000,
    cashPrice: 2250000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35c16-3750-30',
    segment: 'Daily 35',
    category: 'Çift Teker Şasi Kamyonet',
    model: 'IVECO DAILY 35 C 16 CC 3750 H 3.0 Motor',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Manuel',
    wheelbase: 3750,
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2085000,
    campaignPrice: 2335000,
    cashDiscount: 190000,
    cashPrice: 2145000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35c16-3750-30-himatic',
    segment: 'Daily 35',
    category: 'Çift Teker Şasi Kamyonet',
    model: 'IVECO DAILY 35 C 16 H 3.0 A8 CC 3750 Hi-Matic',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 3750,
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2195000,
    campaignPrice: 2445000,
    cashDiscount: 190000,
    cashPrice: 2255000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35c16-4100-30',
    segment: 'Daily 35',
    category: 'Çift Teker Şasi Kamyonet',
    model: 'IVECO DAILY 35 C 16 CC 4100 H 3.0 Motor',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Manuel',
    wheelbase: 4100,
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2205000,
    campaignPrice: 2455000,
    cashDiscount: 190000,
    cashPrice: 2265000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35c16-4100-30-himatic',
    segment: 'Daily 35',
    category: 'Çift Teker Şasi Kamyonet',
    model: 'IVECO DAILY 35 C 16 H 3.0 A 8 CC 4100 Hi-Matic',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 4100,
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2310000,
    campaignPrice: 2560000,
    cashDiscount: 190000,
    cashPrice: 2370000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },

  // ==========================================
  // GRUP 2: 2026 MODEL DAILY 35 PANELVAN
  // Kural: Maliyet + 250.000 TL | Peşin İndirimi: -190.000 TL
  // ==========================================
  {
    id: 'daily-35s16-van-3520l-h2',
    segment: 'Daily 35',
    category: 'Panelvan (12 m³)',
    model: 'IVECO DAILY 35 S 16A8 VAN 3520L H2 Hi-Matic 3.0 (12 m³)',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 3520,
    bodyVolume: '12 m³',
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2050000,
    campaignPrice: 2300000,
    cashDiscount: 190000,
    cashPrice: 2110000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35s16-van-4100-h2',
    segment: 'Daily 35',
    category: 'Panelvan (16 m³)',
    model: 'IVECO DAILY 35 S 16A8 VAN 4100 H2 Hi-Matic 3.0 (16 m³)',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 4100,
    bodyVolume: '16 m³',
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2080000,
    campaignPrice: 2330000,
    cashDiscount: 190000,
    cashPrice: 2140000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35c16-van-4100-h2',
    segment: 'Daily 35',
    category: 'Çift Teker Panelvan (16 m³)',
    model: 'IVECO DAILY 35 C 16A8 H VAN 4100 H2 Hi-Matic 3.0 (Çift Teker 16 m³)',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 4100,
    bodyVolume: '16 m³',
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2220000,
    campaignPrice: 2470000,
    cashDiscount: 190000,
    cashPrice: 2280000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35c16-van-4100-h3',
    segment: 'Daily 35',
    category: 'Çift Teker Yüksek Tavan Panelvan (18 m³)',
    model: 'IVECO DAILY 35 C 16A8 H VAN 4100 H3 Hi-Matic 3.0 (Çift Teker 18 m³)',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 4100,
    bodyVolume: '18 m³',
    tonnage: '3500 KG',
    year: '2026',
    dealerCost: 2240000,
    campaignPrice: 2490000,
    cashDiscount: 190000,
    cashPrice: 2300000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },

  // ==========================================
  // GRUP 3: 2026 MODEL DAILY 70 C (7 TON KAMYON ŞASİ & PANELVAN)
  // Kural: Maliyet + 80.000 TL | Peşin İndirimi: -260.000 TL
  // ==========================================
  {
    id: 'daily-70c16-3750-klima',
    segment: 'Daily 70 C',
    category: '7 Ton Kamyon Şasi',
    model: 'IVECO DAILY 70 C 16 CC 3750 H 3.0 Klimalı',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Manuel',
    wheelbase: 3750,
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    dealerCost: 2400000,
    campaignPrice: 2480000,
    cashDiscount: 260000,
    cashPrice: 2220000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-70c16-3750-himatic-klima',
    segment: 'Daily 70 C',
    category: '7 Ton Kamyon Şasi',
    model: 'IVECO DAILY 70 C 16 H A 8 CC 3750 Hi-Matic Klimalı',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 3750,
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    dealerCost: 2530000,
    campaignPrice: 2610000,
    cashDiscount: 260000,
    cashPrice: 2350000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-70c16-4350-klima',
    segment: 'Daily 70 C',
    category: '7 Ton Kamyon Şasi',
    model: 'IVECO DAILY 70 C 16 CC 4350 H 3.0 Klimalı',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Manuel',
    wheelbase: 4350,
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    dealerCost: 2470000,
    campaignPrice: 2550000,
    cashDiscount: 260000,
    cashPrice: 2290000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-70c16-4350-himatic-klima',
    segment: 'Daily 70 C',
    category: '7 Ton Kamyon Şasi',
    model: 'IVECO DAILY 70 C 16 H A 8 CC 4350 Hi-Matic Klimalı',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 4350,
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    dealerCost: 2590000,
    campaignPrice: 2670000,
    cashDiscount: 260000,
    cashPrice: 2410000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-70c16-4750-klima',
    segment: 'Daily 70 C',
    category: '7 Ton Kamyon Şasi',
    model: 'IVECO DAILY 70 C 16 CC 4750 H 3.0 Klimalı',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Manuel',
    wheelbase: 4750,
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    dealerCost: 2590000,
    campaignPrice: 2670000,
    cashDiscount: 260000,
    cashPrice: 2410000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-70c16-4750-himatic-klima',
    segment: 'Daily 70 C',
    category: '7 Ton Kamyon Şasi',
    model: 'IVECO DAILY 70 C 16 H A 8 CC 4750 Hi-Matic Klimalı',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 4750,
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    dealerCost: 2710000,
    campaignPrice: 2790000,
    cashDiscount: 260000,
    cashPrice: 2530000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-70c18-van-4100-klima',
    segment: 'Daily 70 C',
    category: '7 Ton Panelvan (19.6 m³)',
    model: 'IVECO DAILY 70 C 18 VAN 4100 H Klimalı',
    engine: '3.0 F1C',
    power: '2998 CM3 132 KW (180 BG)',
    transmission: 'Manuel',
    wheelbase: 4100,
    bodyVolume: '19.6 m³',
    tonnage: '7000 KG',
    year: '2026',
    dealerCost: 2580000,
    campaignPrice: 2660000,
    cashDiscount: 260000,
    cashPrice: 2400000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-70c18-van-a8-4100-klima',
    segment: 'Daily 70 C',
    category: '7 Ton Panelvan (19.6 m³)',
    model: 'IVECO DAILY 70 C 18 VAN A8 4100 H Hi-Matic Klimalı',
    engine: '3.0 F1C',
    power: '2998 CM3 132 KW (180 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 4100,
    bodyVolume: '19.6 m³',
    tonnage: '7000 KG',
    year: '2026',
    dealerCost: 2700000,
    campaignPrice: 2780000,
    cashDiscount: 260000,
    cashPrice: 2520000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },

  // ==========================================
  // GRUP 4: 2026 MODEL EUROCARGO (ORTA SEGMENT KAMYON)
  // Kural: Maliyet + 320.000 TL | Peşin İndirimi: -240.000 TL
  // Opsiyon: Otomatik Şanzıman +220.000 TL (Vergiler Dahil)
  // ==========================================
  {
    id: 'eurocargo-mlc-100e19-3690',
    segment: 'Eurocargo',
    category: '10 Ton Dağıtım Kamyonu',
    model: 'IVECO EUROCARGO MLC 100 E 19 3690 MANUEL',
    engine: 'Tector 4 (3.9L)',
    power: '3920 CM3 140 KW (190 BG)',
    transmission: 'Manuel',
    wheelbase: 3690,
    tonnage: '10000 KG',
    year: '2026',
    dealerCost: 3250000,
    campaignPrice: 3570000,
    cashDiscount: 240000,
    cashPrice: 3330000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0,
    autoTransmissionCost: 220000
  },
  {
    id: 'eurocargo-mlc-120el19-4185',
    segment: 'Eurocargo',
    category: '12 Ton Kamyon',
    model: 'IVECO EUROCARGO MLC 120 EL 19 4185 MANUEL',
    engine: 'Tector 4 (3.9L)',
    power: '3920 CM3 140 KW (190 BG)',
    transmission: 'Manuel',
    wheelbase: 4185,
    tonnage: '12000 KG',
    year: '2026',
    dealerCost: 3740000,
    campaignPrice: 4060000,
    cashDiscount: 240000,
    cashPrice: 3820000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0,
    autoTransmissionCost: 220000
  },
  {
    id: 'eurocargo-mlc-150e21-4185',
    segment: 'Eurocargo',
    category: '15 Ton Kamyon',
    model: 'IVECO EUROCARGO MLC 150 E 21 4185-4455 MANUEL',
    engine: 'Tector 5 (4.5L)',
    power: '4485 CM3 154 KW (210 BG)',
    transmission: 'Manuel',
    wheelbase: 4185,
    tonnage: '15000 KG',
    year: '2026',
    dealerCost: 4000000,
    campaignPrice: 4320000,
    cashDiscount: 240000,
    cashPrice: 4080000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0,
    autoTransmissionCost: 220000
  },
  {
    id: 'eurocargo-mll-150e22-5175',
    segment: 'Eurocargo',
    category: '15 Ton Yataklı Kabin Kamyon',
    model: 'IVECO EUROCARGO MLL 150 E 22 5175 MANUEL (Yataklı Kabin)',
    engine: 'Tector 7 (6.7L)',
    power: '6728 CM3 162 KW (220 BG)',
    transmission: 'Manuel',
    wheelbase: 5175,
    tonnage: '15000 KG',
    year: '2026',
    dealerCost: 4200000,
    campaignPrice: 4520000,
    cashDiscount: 240000,
    cashPrice: 4280000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0,
    autoTransmissionCost: 220000
  },
  {
    id: 'eurocargo-mll-160e32-5175',
    segment: 'Eurocargo',
    category: '16 Ton Ağır Dağıtım & Nakliye',
    model: 'IVECO EUROCARGO MLL 160 E 32/P 5175-5670 MANUEL',
    engine: 'Tector 7 (6.7L)',
    power: '6728 CM3 235 KW (320 BG)',
    transmission: 'Manuel',
    wheelbase: 5175,
    tonnage: '16000 KG',
    year: '2026',
    dealerCost: 4490000,
    campaignPrice: 4810000,
    cashDiscount: 240000,
    cashPrice: 4570000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0,
    autoTransmissionCost: 220000
  },

  // ==========================================
  // GRUP 5: 2026 MODEL S-WAY ÇEKİCİ GRUBU (EURO BAZLI)
  // ==========================================
  {
    id: 'sway-500-full-plus',
    segment: 'S-Way',
    category: '4x2 Çekici',
    model: 'IVECO S-WAY 500 FULL PLUS ÇEKİCİ',
    engine: 'Cursor 13 (12.9L)',
    power: '12882 CM3 368 KW (500 BG)',
    transmission: 'HI-TRONIX (12 İleri Otomatik)',
    wheelbase: 3800,
    tonnage: '18000 KG / 44000 KG',
    year: '2026',
    eurPrice: 123000,
    campaignPrice: 123000,
    cashDiscount: 0,
    cashPrice: 123000,
    currency: 'EUR',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'sway-580-full-plus',
    segment: 'S-Way',
    category: '4x2 Çekici',
    model: 'IVECO S-WAY 580 FULL PLUS ÇEKİCİ',
    engine: 'Cursor 13 (12.9L)',
    power: '12882 CM3 427 KW (580 BG)',
    transmission: 'HI-TRONIX (12 İleri Otomatik)',
    wheelbase: 3800,
    tonnage: '18000 KG / 44000 KG',
    year: '2026',
    eurPrice: 126000,
    campaignPrice: 126000,
    cashDiscount: 0,
    cashPrice: 126000,
    currency: 'EUR',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'sway-580-diamond',
    segment: 'S-Way',
    category: '4x2 Çekici (Diamond Edition)',
    model: 'IVECO S-WAY 580 DIAMOND EDİTİON ÇEKİCİ',
    engine: 'Cursor 13 (12.9L)',
    power: '12882 CM3 427 KW (580 BG)',
    transmission: 'HI-TRONIX (12 İleri Otomatik)',
    wheelbase: 3800,
    tonnage: '18000 KG / 44000 KG',
    year: '2026',
    eurPrice: 131000,
    campaignPrice: 131000,
    cashDiscount: 0,
    cashPrice: 131000,
    currency: 'EUR',
    otvRate: 4.0,
    kdvRate: 20.0
  }
];

/**
 * Verilen araç ve tercihlere göre dinamik fiyat hesaplar.
 * @param {Object} vehicle - Seçilen araç objesi
 * @param {'campaign' | 'cash'} paymentType - 'campaign' (vadeli/kredili) veya 'cash' (peşin/nakit)
 * @param {Object} options - { hasAutoTransmission: boolean, eurExchangeRate: number }
 */
export function calculatePricing(vehicle, paymentType = 'cash', options = {}) {
  if (!vehicle) return null;

  const { hasAutoTransmission = false, eurExchangeRate = 38.0 } = options;

  let basePrice = 0;
  let discount = 0;
  let finalPrice = 0;
  let currency = vehicle.currency || 'TRY';

  if (currency === 'EUR') {
    // S-Way Çekici
    const eurVal = vehicle.eurPrice || 123000;
    basePrice = eurVal;
    discount = 0;
    finalPrice = eurVal;
    const tryEquivalent = Math.round(finalPrice * eurExchangeRate);

    return {
      currency: 'EUR',
      eurPrice: finalPrice,
      eurExchangeRate,
      basePrice,
      discount,
      finalPrice,
      tryEquivalent,
      paymentType,
      isCash: paymentType === 'cash'
    };
  }

  // TL Bazlı Araçlar (Daily 35, Daily 70 C, Eurocargo)
  let campaign = vehicle.campaignPrice || 0;
  let cashDisc = vehicle.cashDiscount || 0;

  // Eurocargo Otomatik Şanzıman Farkı
  if (hasAutoTransmission && vehicle.autoTransmissionCost) {
    campaign += vehicle.autoTransmissionCost;
  }

  if (paymentType === 'cash') {
    basePrice = campaign;
    discount = cashDisc;
    finalPrice = campaign - cashDisc;
  } else {
    basePrice = campaign;
    discount = 0;
    finalPrice = campaign;
  }

  return {
    currency: 'TRY',
    basePrice,
    discount,
    finalPrice,
    paymentType,
    isCash: paymentType === 'cash',
    hasAutoTransmission
  };
}
