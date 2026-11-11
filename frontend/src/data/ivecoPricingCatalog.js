// IVECO 2026 Model Fiyat Matrisi ve Dinamik Fiyatlama Kataloğu
// Eylül 2026 Resmi Fiyatlandırma Kuralları ile yapılandırılmıştır.

export const IVECO_PRICING_CATALOG = [
  // ==========================================
  // GRUP 1: 2026 MODEL DAILY 35 ŞASİ KAMYONET
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
    bodyLength: '3.50 – 3.80 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2095000,
    cashDiscount: 190000,
    cashPrice: 1905000,
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
    bodyLength: '3.50 – 3.80 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2205000,
    cashDiscount: 190000,
    cashPrice: 2015000,
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
    bodyLength: '4.10 – 4.30 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2125000,
    cashDiscount: 190000,
    cashPrice: 1935000,
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
    bodyLength: '2.80 – 3.10 m Kasa (Çift Kabin)',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2460000,
    cashDiscount: 190000,
    cashPrice: 2270000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35c16-3450-30',
    segment: 'Daily 35',
    category: 'Çift Teker Şasi Kamyonet',
    model: 'IVECO DAILY 35 C 16 CC 3450 H 3.0 Motor',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Manuel',
    wheelbase: 3450,
    bodyLength: '3.50 – 3.80 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2035000,
    cashDiscount: 0,
    cashPrice: 2035000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },
  {
    id: 'daily-35c16-3450-30-himatic',
    segment: 'Daily 35',
    category: 'Çift Teker Şasi Kamyonet',
    model: 'IVECO DAILY 35 C 16 H 3.0 A8 CC 3450 Hi-Matic',
    engine: '3.0 F1C',
    power: '2998 CM3 118 KW (160 BG)',
    transmission: 'Hi-Matic (8 İleri Otomatik)',
    wheelbase: 3450,
    bodyLength: '3.50 – 3.80 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2140000,
    cashDiscount: 0,
    cashPrice: 2140000,
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
    bodyLength: '4.10 – 4.30 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2065000,
    cashDiscount: 0,
    cashPrice: 2065000,
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
    bodyLength: '4.10 – 4.30 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2170000,
    cashDiscount: 0,
    cashPrice: 2170000,
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
    bodyLength: '4.50 – 4.80 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2385000,
    cashDiscount: 190000,
    cashPrice: 2195000,
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
    bodyLength: '4.50 – 4.80 m Kasa',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2490000,
    cashDiscount: 190000,
    cashPrice: 2300000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },

  // ==========================================
  // GRUP 2: 2026 MODEL DAILY 35 PANELVAN
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
    bodyLength: '3.54 m İç Boy (12 m³)',
    bodyVolume: '12 m³',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2320000,
    cashDiscount: 190000,
    cashPrice: 2130000,
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
    bodyLength: '4.68 m İç Boy (16 m³)',
    bodyVolume: '16 m³',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2350000,
    cashDiscount: 190000,
    cashPrice: 2160000,
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
    bodyLength: '4.68 m İç Boy (16 m³)',
    bodyVolume: '16 m³',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2490000,
    cashDiscount: 190000,
    cashPrice: 2300000,
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
    bodyLength: '4.68 m İç Boy (18 m³)',
    bodyVolume: '18 m³',
    tonnage: '3500 KG',
    year: '2026',
    campaignPrice: 2510000,
    cashDiscount: 190000,
    cashPrice: 2320000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },

  // ==========================================
  // GRUP 3: 2026 MODEL DAILY 70 C (7 TON KAMYON ŞASİ & PANELVAN)
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
    bodyLength: '4.10 – 4.30 m Kasa',
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    campaignPrice: 2480000,
    cashDiscount: 110000,
    cashPrice: 2370000,
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
    bodyLength: '4.10 – 4.30 m Kasa',
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    campaignPrice: 2610000,
    cashDiscount: 110000,
    cashPrice: 2500000,
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
    bodyLength: '5.10 – 5.30 m Kasa',
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    campaignPrice: 2550000,
    cashDiscount: 110000,
    cashPrice: 2440000,
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
    bodyLength: '5.10 – 5.30 m Kasa',
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    campaignPrice: 2670000,
    cashDiscount: 110000,
    cashPrice: 2560000,
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
    bodyLength: '5.60 – 5.90 m Kasa',
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    campaignPrice: 2660000,
    cashDiscount: 260000,
    cashPrice: 2400000,
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
    bodyLength: '5.60 – 5.90 m Kasa',
    tonnage: '7000 KG / 7200 KG',
    year: '2026',
    campaignPrice: 2780000,
    cashDiscount: 260000,
    cashPrice: 2520000,
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
    bodyLength: '5.12 m İç Boy (19.6 m³)',
    bodyVolume: '19.6 m³',
    tonnage: '7000 KG',
    year: '2026',
    campaignPrice: 2650000,
    cashDiscount: 260000,
    cashPrice: 2390000,
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
    bodyLength: '5.12 m İç Boy (19.6 m³)',
    bodyVolume: '19.6 m³',
    tonnage: '7000 KG',
    year: '2026',
    campaignPrice: 2770000,
    cashDiscount: 260000,
    cashPrice: 2510000,
    currency: 'TRY',
    otvRate: 4.0,
    kdvRate: 20.0
  },

  // ==========================================
  // GRUP 4: 2026 MODEL EUROCARGO (ORTA SEGMENT KAMYON)
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
    bodyLength: '5.40 – 5.75 m Kasa',
    tonnage: '10000 KG',
    year: '2026',
    campaignPrice: 3590000,
    cashDiscount: 260000,
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
    bodyLength: '6.00 – 6.40 m Kasa',
    tonnage: '12000 KG',
    year: '2026',
    campaignPrice: 4080000,
    cashDiscount: 260000,
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
    bodyLength: '6.20 – 6.60 m Kasa',
    tonnage: '15000 KG',
    year: '2026',
    campaignPrice: 4340000,
    cashDiscount: 260000,
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
    bodyLength: '7.10 – 7.50 m Kasa',
    tonnage: '15000 KG',
    year: '2026',
    campaignPrice: 4540000,
    cashDiscount: 260000,
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
    bodyLength: '7.50 – 8.20 m Kasa',
    tonnage: '16000 KG',
    year: '2026',
    campaignPrice: 4830000,
    cashDiscount: 260000,
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
    bodyLength: '13.60 m Standart Treyler',
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
    bodyLength: '13.60 m Standart Treyler',
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
    bodyLength: '13.60 m Standart Treyler',
    tonnage: '18000 KG / 44000 KG',
    year: '2026',
    eurPrice: 131000,
    campaignPrice: 131000,
    cashDiscount: 0,
    cashPrice: 131000,
    currency: 'EUR',
    otvRate: 4.0,
    kdvRate: 20.0
  },

  // ==========================================
  // GRUP 5: 2026 MODEL T-WAY AĞIR ŞANTİYE & HAFRİYAT (10 & 12 TEKER)
  // ==========================================
  {
    id: 'tway-ad380t54-6x4',
    segment: 'T-Way',
    category: '6x4 Ağır Şantiye (10 Teker Damper)',
    model: 'IVECO T-WAY AD 380T 54 6x4 (10 Teker 540 BG Damper)',
    engine: 'Cursor 13 (12.9L)',
    power: '12882 CM3 397 KW (540 BG) - 2500 Nm',
    transmission: '16 İleri Hi-Tronix (Rocking Mode)',
    wheelbase: 3800,
    bodyLength: '5.40 m Damper (16–18 m³)',
    tonnage: '26000 KG (Kantar) / 41000 KG (GVW)',
    year: '2026',
    isCustomPrice: true,
    customPricePrompt: "Özel Proje & Filo Fiyatı İçin Satış Sorumlusu ile Görüşün",
    currency: 'EUR',
    otvRate: 4.0,
    kdvRate: 20.0,
    finderKey: 'tway_10teker_540'
  },
  {
    id: 'tway-ad380t46-6x4',
    segment: 'T-Way',
    category: '6x4 Şantiye (10 Teker Damper)',
    model: 'IVECO T-WAY AD 380T 46 6x4 (10 Teker 460 BG Damper)',
    engine: 'Cursor 11/13 (11.1L)',
    power: '11120 CM3 338 KW (460 BG) - 2150 Nm',
    transmission: '16 İleri Hi-Tronix (Rocking Mode)',
    wheelbase: 3800,
    bodyLength: '5.40 m Damper (16–18 m³)',
    tonnage: '26000 KG (Kantar) / 41000 KG (GVW)',
    year: '2026',
    isCustomPrice: true,
    customPricePrompt: "Özel Proje & Filo Fiyatı İçin Satış Sorumlusu ile Görüşün",
    currency: 'EUR',
    otvRate: 4.0,
    kdvRate: 20.0,
    finderKey: 'tway_10teker_460'
  },
  {
    id: 'tway-ad410t54-8x4',
    segment: 'T-Way',
    category: '8x4 Ağır Hafriyat (12 Teker Kaya Damperi)',
    model: 'IVECO T-WAY AD 410T 54 8x4 (12 Teker 540 BG Kaya Damperi)',
    engine: 'Cursor 13 (12.9L)',
    power: '12882 CM3 397 KW (540 BG) - 2500 Nm',
    transmission: '16 İleri Hi-Tronix (Rocking Mode)',
    wheelbase: 4350,
    bodyLength: '6.40 m Damper (22–24 m³)',
    tonnage: '32000 KG (Kantar) / 50000 KG (GVW)',
    year: '2026',
    isCustomPrice: true,
    customPricePrompt: "Özel Proje & Filo Fiyatı İçin Satış Sorumlusu ile Görüşün",
    currency: 'EUR',
    otvRate: 4.0,
    kdvRate: 20.0,
    finderKey: 'tway_12teker_540'
  },
  {
    id: 'tway-ad410t46-8x4',
    segment: 'T-Way',
    category: '8x4 Ağır Şantiye (12 Teker Mikser / Damper)',
    model: 'IVECO T-WAY AD 410T 46 8x4 (12 Teker 460 BG Mikser/Damper)',
    engine: 'Cursor 11/13 (11.1L)',
    power: '11120 CM3 338 KW (460 BG) - 2150 Nm',
    transmission: '16 İleri Hi-Tronix (Rocking Mode)',
    wheelbase: 4350,
    bodyLength: '6.40 m Damper / 10–12 m³ Mikser',
    tonnage: '32000 KG (Kantar) / 50000 KG (GVW)',
    year: '2026',
    isCustomPrice: true,
    customPricePrompt: "Özel Proje & Filo Fiyatı İçin Satış Sorumlusu ile Görüşün",
    currency: 'EUR',
    otvRate: 4.0,
    kdvRate: 20.0,
    finderKey: 'tway_12teker_460'
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
  if (vehicle.isCustomPrice || vehicle.segment === 'T-Way') {
    return {
      currency: 'EUR',
      isCustomPrice: true,
      customPricePrompt: "Özel Proje & Filo Fiyatı İçin Satış Sorumlusu ile Görüşün",
      basePrice: null,
      finalPrice: null
    };
  }

  if (vehicle.currency === 'EUR') {
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

/**
 * Verilen araç objesine veya model/kategori anahtarına göre ufak sticker görselini döndürür.
 * - T-Way -> /vehicles/tway-damper.jpg
 * - Eurocargo 150E21 / 150E22 / 160E32 / 10 Teker -> /vehicles/eurocargo-150-160.jpg
 * - Eurocargo 100E19 / 120EL19 -> /vehicles/eurocargo-100-120.jpg
 * - Panelvan (Daily 35 VAN & 70C18 VAN) -> /vehicles/daily-panelvan.jpg
 * - Daily 35S Tek Teker Şasi -> /vehicles/daily-35s-sasi.jpg
 * - Daily 35C & Daily 70C / 72C Çift Teker Şasi -> /vehicles/daily-35c-72c.jpg
 * - S-Way Çekici -> /vehicles/sway-cekici.jpg
 */
export function getVehicleSticker(vehicleOrKey) {
  if (!vehicleOrKey) return null;

  if (typeof vehicleOrKey === 'string') {
    const k = vehicleOrKey.toLowerCase();
    if (k.includes('tway') || k.includes('t-way') || k === 'hafriyat') {
      return { src: '/vehicles/tway-damper.jpg', label: 'IVECO T-Way Hafriyat' };
    }
    if (k.includes('sway') || k.includes('s-way') || k === 'cekici' || k === 'tractor_sway') {
      return { src: '/vehicles/sway-cekici.jpg?v=2', label: 'IVECO S-Way Çekici' };
    }
    if (k.includes('panelvan') || k.includes('van')) {
      return { src: '/vehicles/daily-panelvan.jpg', label: 'IVECO Daily Panelvan' };
    }
    if (k === 'daily35_chassis' || k.includes('35s')) {
      return { src: '/vehicles/daily-35s-sasi.jpg', label: 'IVECO Daily 35S Şasi' };
    }
    if (k === 'daily70' || k.includes('35c') || k.includes('70c') || k.includes('72c')) {
      return { src: '/vehicles/daily-35c-72c.jpg', label: 'IVECO Daily 35C / 72C' };
    }
    if (k.includes('150e') || k.includes('160e') || k.includes('10teker')) {
      return { src: '/vehicles/eurocargo-150-160.jpg', label: 'IVECO Eurocargo 150E / 160E' };
    }
    if (k.includes('100e') || k.includes('120e')) {
      return { src: '/vehicles/eurocargo-100-120.jpg', label: 'IVECO Eurocargo 100E / 120E' };
    }
    return null;
  }

  const id = (vehicleOrKey.id || vehicleOrKey.key || '').toLowerCase();
  const model = (vehicleOrKey.model || vehicleOrKey.title || vehicleOrKey.modelTitle || '').toLowerCase();
  const category = (vehicleOrKey.category || '').toLowerCase();
  const segment = (vehicleOrKey.segment || vehicleOrKey.series || '').toLowerCase();

  // 1. T-Way
  if (segment.includes('t-way') || segment.includes('tway') || id.includes('tway') || model.includes('t-way') || vehicleOrKey.isTway) {
    return { src: '/vehicles/tway-damper.jpg', label: 'T-Way Şantiye' };
  }

  // 2. S-Way
  if (segment.includes('s-way') || segment.includes('sway') || id.includes('sway') || model.includes('s-way') || id === 'tractor_sway') {
    return { src: '/vehicles/sway-cekici.jpg?v=2', label: 'S-Way Çekici' };
  }

  // 3. Panelvan (Daily 35 Panelvan & Daily 70C18 Panelvan)
  if (category.includes('panelvan') || id.includes('van') || id.includes('panelvan') || model.includes(' panelvan') || model.includes(' van ')) {
    return { src: '/vehicles/daily-panelvan.jpg', label: 'Daily Panelvan' };
  }

  // 4. Daily 35S Tek Teker Şasi
  if (
    id.includes('35s') ||
    model.includes('35 s') ||
    model.includes('35s') ||
    segment.includes('35s')
  ) {
    return { src: '/vehicles/daily-35s-sasi.jpg', label: 'Daily 35S Tek Teker Şasi' };
  }

  // 5. Daily 35C & Daily 70C / 72C Çift Teker Şasi
  if (
    id.includes('35c') ||
    id.includes('70c') ||
    id.includes('72c') ||
    model.includes('35 c') ||
    model.includes('35c') ||
    model.includes('70 c') ||
    model.includes('70c') ||
    model.includes('72 c') ||
    model.includes('72c') ||
    segment.includes('35c') ||
    segment.includes('70 c') ||
    segment.includes('72c')
  ) {
    return { src: '/vehicles/daily-35c-72c.jpg', label: 'Daily 35C / 72C Çift Teker' };
  }

  // 6. Eurocargo 150E21, 150E22, 160E32 ve 10 Teker
  if (
    id.includes('150e') ||
    id.includes('160e') ||
    id.includes('10teker') ||
    model.includes('150 e') ||
    model.includes('160 e') ||
    model.includes('160/180')
  ) {
    return { src: '/vehicles/eurocargo-150-160.jpg', label: 'Eurocargo 150E / 160E' };
  }

  // 7. Eurocargo 100E19 ve 120EL19
  if (
    id.includes('100e') ||
    id.includes('120e') ||
    model.includes('100 e') ||
    model.includes('120 el') ||
    model.includes('120 e')
  ) {
    return { src: '/vehicles/eurocargo-100-120.jpg', label: 'Eurocargo 100E / 120E' };
  }

  return null;
}


