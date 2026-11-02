// IVECO Ekim 2026 Resmi Banka Kampanyaları & Yüksek Tutarlı Finansman Matrisi
// Kaynak: LM_EKİM 2026 KAMPANYALARI_14102026.xlsx ve LM_EYLÜL KAMPANYA 2.xlsx
// DİKKAT: Bayi katkı payı (destek tutarı / reel komisyon) müşteri gizliliği gereği bu dosyada YER ALMAZ.
// Yalnızca müşterinin görebileceği: Kredi Tutarı, Vade, Müşteri Faiz Oranı, Aylık Taksit ve Toplam Ödeme bilgileri bulunur.

export const AMOUNT_TIERS = [
  {
    "id": "all",
    "label": "Tüm Tutarlar",
    "range": "Tüm Seçenekler",
    "icon": "📋",
    "min": 0,
    "max": 99999999
  },
  {
    "id": "zero_interest",
    "label": "💎 %0 Faiz",
    "range": "800K - 1M TL",
    "icon": "💎",
    "min": 400000,
    "max": 1000000
  },
  {
    "id": "high_credit",
    "label": "🚀 Yüksek Kredi",
    "range": "1.2M - 2.5M TL",
    "icon": "🚀",
    "min": 1100000,
    "max": 2500000
  },
  {
    "id": "fleet",
    "label": "🏢 Kamyon & Filo",
    "range": "2.6M - 6M TL",
    "icon": "🏢",
    "min": 2600000,
    "max": 10000000
  }
];

export function getAmountTiersForCategory(category = 'daily35') {
  if (category === 'daily35') {
    return [
      { id: 'all', label: 'Tüm Tutarlar', range: '800K - 2M TL', icon: '📋', min: 0, max: 2000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '800K - 1M TL', icon: '💎', min: 400000, max: 1000000 },
      { id: 'high_credit', label: '🚀 Yüksek Kredi', range: '1.2M - 2M TL', icon: '🚀', min: 1100000, max: 2000000 }
    ];
  } else if (category === 'daily70' || category === 'eurocargo') {
    return [
      { id: 'all', label: 'Tüm Tutarlar', range: '1M - 4M TL', icon: '📋', min: 0, max: 4000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '1M TL', icon: '💎', min: 400000, max: 1000000 },
      { id: 'high_credit', label: '🚀 Yüksek Kredi', range: '1.2M - 2.5M TL', icon: '🚀', min: 1100000, max: 2500000 },
      { id: 'fleet', label: '🏢 Kamyon & Filo', range: '2.6M - 4M TL', icon: '🏢', min: 2600000, max: 4000000 }
    ];
  } else {
    // heavy (S-Way & T-Way)
    return [
      { id: 'all', label: 'Tüm Tutarlar', range: '1M - 6M TL', icon: '📋', min: 0, max: 6000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '1M - 5M TL', icon: '💎', min: 400000, max: 5000000 },
      { id: 'high_credit', label: '🚀 Ağır Ticari', range: '2M - 4.5M TL', icon: '🚀', min: 2000000, max: 4500000 },
      { id: 'fleet', label: '🏗️ Büyük Filo & Çekici', range: '4.6M - 6M TL', icon: '🏗️', min: 4600000, max: 6000000 }
    ];
  }
}

export const BANK_LIST = [
  {
    "id": "teb_cetelem",
    "name": "TEB Cetelem",
    "shortName": "TEB Cetelem",
    "badge": "Yetkili Finansman",
    "color": "#0284c7",
    "bg": "rgba(2, 132, 199, 0.15)",
    "border": "rgba(56, 189, 248, 0.4)",
    "icon": "🏛️",
    "description": "IVECO Resmi Taşıt Finansmanı — %0 Faizden 2.500.000 TL'ye varan seçenekler"
  },
  {
    "id": "kuveyt_turk",
    "name": "Kuveyt Türk",
    "shortName": "Kuveyt Türk",
    "badge": "Eşit Taksit & 6 Ay Ödemesiz",
    "color": "#10b981",
    "bg": "rgba(16, 185, 129, 0.15)",
    "border": "rgba(52, 211, 153, 0.4)",
    "icon": "🌿",
    "description": "900K %0 kâr payı, 2M TL eşit aylık taksit ve 6 ay ödemesiz seçenekler"
  },
  {
    "id": "garanti",
    "name": "Garanti BBVA",
    "shortName": "Garanti BBVA",
    "badge": "%0 Faiz & %1.07",
    "color": "#22c55e",
    "bg": "rgba(34, 197, 94, 0.15)",
    "border": "rgba(74, 222, 128, 0.4)",
    "icon": "🍀",
    "description": "1.000.000 TL için %1.07 ve 2.000.000 TL için %2.54 avantajlı ticari finansman"
  },
  {
    "id": "is_bankasi",
    "name": "Türkiye İş Bankası",
    "shortName": "İş Bankası",
    "badge": "Avantajlı Ticari & Filo",
    "color": "#2563eb",
    "bg": "rgba(37, 99, 235, 0.15)",
    "border": "rgba(96, 165, 250, 0.4)",
    "icon": "🏦",
    "description": "800K %0.36, 1M TL %1.78 ve 4M TL'ye kadar resmi indirimli ticari krediler"
  },
  {
    "id": "akbank",
    "name": "Akbank",
    "shortName": "Akbank",
    "badge": "%0 Faiz & 4M Filo",
    "color": "#ef4444",
    "bg": "rgba(239, 68, 68, 0.15)",
    "border": "rgba(248, 113, 113, 0.4)",
    "icon": "🦁",
    "description": "800K-900K %0 faiz, 4M TL'ye varan ticari ve filo finansmanı"
  },
  {
    "id": "yapi_kredi",
    "name": "Yapı Kredi",
    "shortName": "Yapı Kredi",
    "badge": "%0 Faiz & 2M Tavan",
    "color": "#3b82f6",
    "bg": "rgba(59, 130, 246, 0.15)",
    "border": "rgba(96, 165, 250, 0.4)",
    "icon": "🦅",
    "description": "800K-900K %0 faiz, 2.5M TL'ye kadar resmi ticari faiz oranları"
  },
  {
    "id": "vakif_katilim",
    "name": "Vakıf Katılım",
    "shortName": "Vakıf Katılım",
    "badge": "%0 Kâr Payı & Katılım",
    "color": "#f59e0b",
    "bg": "rgba(245, 158, 11, 0.15)",
    "border": "rgba(251, 191, 36, 0.4)",
    "icon": "⭐",
    "description": "800K-1M %0 kâr payı, katılım bankacılığı prensiplerine uygun finansman"
  },
  {
    "id": "bnp_paribas",
    "name": "BNP Paribas",
    "shortName": "BNP Paribas",
    "badge": "Daily 70 & Eurocargo",
    "color": "#059669",
    "bg": "rgba(5, 150, 105, 0.15)",
    "border": "rgba(52, 211, 153, 0.4)",
    "icon": "🌐",
    "description": "Daily 70 ve Eurocargo için 1.000.000 TL %0 faiz ve 2.500.000 TL ticari kredi"
  },
  {
    "id": "diger_yok",
    "name": "Hiçbiri / Diğer Banka",
    "shortName": "Diğer / Bankam Yok",
    "badge": "TEB Cetelem Destekli",
    "color": "#8b5cf6",
    "bg": "rgba(139, 92, 246, 0.15)",
    "border": "rgba(167, 139, 250, 0.4)",
    "icon": "🤝",
    "description": "Herhangi bir banka ile çalışmıyorsanız resmi finansman ortağımız TEB Cetelem ile anında kredi tahsisi sağlanır"
  }
];

export const BANK_CAMPAIGNS = {
  "teb_cetelem": {
    "daily35": [
      {
        "id": "teb_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "EN ÇOK TERCİH EDİLEN"
      },
      {
        "id": "teb_35_900_9",
        "title": "900.000 TL — 9 Ay (%0 Faiz)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 900000,
        "highlight": true,
        "tag": "9 AY SIFIR FAİZ"
      },
      {
        "id": "teb_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (İndirimli)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.04",
        "rate": 1.04,
        "monthly": 89372,
        "total": 1072464,
        "tag": "DÜŞÜK ORAN"
      },
      {
        "id": "teb_35_1200_12",
        "title": "1.200.000 TL — 12 Ay (Yüksek Kredi)",
        "principal": 1200000,
        "term": 12,
        "rateLabel": "%1.47",
        "rate": 1.47,
        "monthly": 110278,
        "total": 1323336,
        "tag": "YÜKSEK LİMİT"
      },
      {
        "id": "teb_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (Yüksek Kredi)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.13",
        "rate": 2.13,
        "monthly": 81476,
        "total": 1955424,
        "highlight": true,
        "tag": "YÜKSEK KREDİ / 2 YIL"
      },
      {
        "id": "teb_35_1500_36",
        "title": "1.500.000 TL — 36 Ay Uzun Vade",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.40",
        "rate": 2.4,
        "monthly": 63833,
        "total": 2297988
      },
      {
        "id": "teb_35_1500_48",
        "title": "1.500.000 TL — 48 Ay Rahat Ödeme",
        "principal": 1500000,
        "term": 48,
        "rateLabel": "%2.50",
        "rate": 2.5,
        "monthly": 54927,
        "total": 2636496
      },
      {
        "id": "teb_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.10",
        "rate": 2.1,
        "monthly": 108252,
        "total": 2598048,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "teb_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.37 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.37",
        "rate": 2.37,
        "monthly": 84807,
        "total": 3053052,
        "tag": "2M / 36 AY"
      }
    ],
    "daily70": [
      {
        "id": "teb_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "1 YIL SIFIR FAİZ"
      },
      {
        "id": "teb_70_1200_12",
        "title": "1.200.000 TL — 12 Ay (%0.61 Faiz)",
        "principal": 1200000,
        "term": 12,
        "rateLabel": "%0.61",
        "rate": 0.61,
        "monthly": 104278,
        "total": 1251336,
        "tag": "ÖZEL İNDİRİM"
      },
      {
        "id": "teb_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.21 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.21",
        "rate": 1.21,
        "monthly": 135597,
        "total": 1627164,
        "tag": "YÜKSEK KREDİ"
      },
      {
        "id": "teb_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.99 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.99",
        "rate": 1.99,
        "monthly": 80151,
        "total": 1923624,
        "highlight": true,
        "tag": "24 AY AVANTAJ"
      },
      {
        "id": "teb_70_1500_36",
        "title": "1.500.000 TL — 36 Ay (%2.30 Faiz)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.30",
        "rate": 2.3,
        "monthly": 62801,
        "total": 2260836
      },
      {
        "id": "teb_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.80 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.80",
        "rate": 1.8,
        "monthly": 187868,
        "total": 2254416,
        "tag": "2 MİLYON TL LİMİT"
      },
      {
        "id": "teb_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.32 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 111037,
        "total": 2664888,
        "highlight": true,
        "tag": "POPÜLER 2M"
      },
      {
        "id": "teb_70_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.53 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.53",
        "rate": 2.53,
        "monthly": 86987,
        "total": 3131532
      },
      {
        "id": "teb_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.51 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.51",
        "rate": 2.51,
        "monthly": 141916,
        "total": 3405984,
        "tag": "MAKSİMUM GÜÇ"
      },
      {
        "id": "teb_70_2500_36",
        "title": "2.500.000 TL — 36 Ay (%2.67 Faiz)",
        "principal": 2500000,
        "term": 36,
        "rateLabel": "%2.67",
        "rate": 2.67,
        "monthly": 111159,
        "total": 4001724
      },
      {
        "id": "teb_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.55 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.55",
        "rate": 2.55,
        "monthly": 171800,
        "total": 4123200,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "teb_70_3500_36",
        "title": "3.500.000 TL — 36 Ay (%2.68 Faiz)",
        "principal": 3500000,
        "term": 36,
        "rateLabel": "%2.68",
        "rate": 2.68,
        "monthly": 157200,
        "total": 5659200,
        "tag": "3.5 MİLYON TL"
      },
      {
        "id": "teb_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.72 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.72",
        "rate": 2.72,
        "monthly": 181500,
        "total": 6534000,
        "tag": "4 MİLYON TL LİMİT"
      }
    ],
    "eurocargo": [
      {
        "id": "teb_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "teb_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.99 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.99",
        "rate": 1.99,
        "monthly": 80151,
        "total": 1923624
      },
      {
        "id": "teb_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.32 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 111037,
        "total": 2664888,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "teb_ec_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.53 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.53",
        "rate": 2.53,
        "monthly": 86987,
        "total": 3131532
      },
      {
        "id": "teb_ec_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.51 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.51",
        "rate": 2.51,
        "monthly": 141916,
        "total": 3405984,
        "highlight": true,
        "tag": "2.5 MİLYON TL"
      },
      {
        "id": "teb_ec_2500_36",
        "title": "2.500.000 TL — 36 Ay (%2.67 Faiz)",
        "principal": 2500000,
        "term": 36,
        "rateLabel": "%2.67",
        "rate": 2.67,
        "monthly": 111159,
        "total": 4001724
      },
      {
        "id": "teb_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.60 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.60",
        "rate": 2.6,
        "monthly": 173200,
        "total": 4156800,
        "tag": "FİLO KREDİSİ"
      },
      {
        "id": "teb_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 185200,
        "total": 6667200,
        "tag": "AĞIR VASITA FİLO"
      }
    ]
  },
  "kuveyt_turk": {
    "daily35": [
      {
        "id": "kt_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Kar Payı)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "SIFIR KAR PAYI"
      },
      {
        "id": "kt_35_900_9",
        "title": "900.000 TL — 9 Ay (%0 Kar Payı)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 900000,
        "highlight": true,
        "tag": "9 AY SIFIR KAR PAYI"
      },
      {
        "id": "kt_35_900_12",
        "title": "900.000 TL — 12 Ay (%0.78 Kar Payı)",
        "principal": 900000,
        "term": 12,
        "rateLabel": "%0.78",
        "rate": 0.78,
        "monthly": 79004,
        "total": 948048,
        "tag": "DÜŞÜK KAR PAYI"
      },
      {
        "id": "kt_35_900_24",
        "title": "900.000 TL — 24 Ay (%1.78 Kar Payı)",
        "principal": 900000,
        "term": 24,
        "rateLabel": "%1.78",
        "rate": 1.78,
        "monthly": 46739,
        "total": 1121736
      },
      {
        "id": "kt_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.08 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.08",
        "rate": 1.08,
        "monthly": 89693,
        "total": 1076320,
        "highlight": true,
        "tag": "ÖZEL %1.08 ORAN"
      },
      {
        "id": "kt_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.89 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.89",
        "rate": 1.89,
        "monthly": 52949,
        "total": 1270766,
        "tag": "2 YIL EŞİT TAKSİT"
      },
      {
        "id": "kt_35_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.21 Kar Payı)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.21",
        "rate": 2.21,
        "monthly": 41505,
        "total": 1494176
      },
      {
        "id": "kt_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.92 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.92",
        "rate": 1.92,
        "monthly": 142228,
        "total": 1706739
      },
      {
        "id": "kt_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.35 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 83896,
        "total": 2013495,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "kt_35_1500_36",
        "title": "1.500.000 TL — 36 Ay (%2.55 Kar Payı)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.55",
        "rate": 2.55,
        "monthly": 65839,
        "total": 2370222
      },
      {
        "id": "kt_35_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.34 Kar Payı)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.34",
        "rate": 2.34,
        "monthly": 194879,
        "total": 2338546
      },
      {
        "id": "kt_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.58 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.58",
        "rate": 2.58,
        "monthly": 114910,
        "total": 2757835,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "kt_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.72 Kar Payı)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.72",
        "rate": 2.72,
        "monthly": 90226,
        "total": 3248134
      },
      {
        "id": "kt_35_grace_1000_24",
        "title": "1.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 1000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.21",
        "rate": 2.21,
        "monthly": 62390,
        "total": 1497371,
        "highlight": true,
        "tag": "İLK 6 AY 0 TL TAKSİT"
      },
      {
        "id": "kt_35_grace_1000_36",
        "title": "1.000.000 TL — 6 Ay Ödemesiz (36 Ay)",
        "principal": 1000000,
        "term": 36,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.40",
        "rate": 2.4,
        "monthly": 48808,
        "total": 1757097,
        "tag": "İLK 6 AY 0 TL TAKSİT"
      },
      {
        "id": "kt_35_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 1500000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.55",
        "rate": 2.55,
        "monthly": 98972,
        "total": 2375326,
        "highlight": true,
        "tag": "1.5M 6 AY ÖDEMESİZ"
      },
      {
        "id": "kt_35_grace_1500_36",
        "title": "1.500.000 TL — 6 Ay Ödemesiz (36 Ay)",
        "principal": 1500000,
        "term": 36,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.67",
        "rate": 2.67,
        "monthly": 77336,
        "total": 2784087
      },
      {
        "id": "kt_35_grace_2000_24",
        "title": "2.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 2000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.72",
        "rate": 2.72,
        "monthly": 135609,
        "total": 3254612,
        "highlight": true,
        "tag": "2M 6 AY ÖDEMESİZ"
      },
      {
        "id": "kt_35_grace_2000_36",
        "title": "2.000.000 TL — 6 Ay Ödemesiz (36 Ay)",
        "principal": 2000000,
        "term": 36,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.81",
        "rate": 2.81,
        "monthly": 106012,
        "total": 3816417,
        "tag": "2M 6 AY ÖDEMESİZ"
      }
    ],
    "daily70": [
      {
        "id": "kt_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR KAR PAYI"
      },
      {
        "id": "kt_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.33 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.33",
        "rate": 1.33,
        "monthly": 49441,
        "total": 1186592
      },
      {
        "id": "kt_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.78 Kar Payı)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%1.78",
        "rate": 1.78,
        "monthly": 38586,
        "total": 1389106
      },
      {
        "id": "kt_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.23 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.23",
        "rate": 1.23,
        "monthly": 135896,
        "total": 1630749
      },
      {
        "id": "kt_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.01 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.01",
        "rate": 2.01,
        "monthly": 80577,
        "total": 1933839,
        "highlight": true,
        "tag": "1.5M EŞİT TAKSİT"
      },
      {
        "id": "kt_70_1500_36",
        "title": "1.500.000 TL — 36 Ay (%2.27 Kar Payı)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.27",
        "rate": 2.27,
        "monthly": 62882,
        "total": 2263746
      },
      {
        "id": "kt_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.82 Kar Payı)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.82",
        "rate": 1.82,
        "monthly": 188401,
        "total": 2260813
      },
      {
        "id": "kt_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.35 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 111861,
        "total": 2684660,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "kt_70_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.51 Kar Payı)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.51",
        "rate": 2.51,
        "monthly": 87217,
        "total": 3139806
      },
      {
        "id": "kt_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.54 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.54",
        "rate": 2.54,
        "monthly": 142970,
        "total": 3431291
      },
      {
        "id": "kt_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.67 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.67",
        "rate": 2.67,
        "monthly": 174172,
        "total": 4180137,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "kt_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.74 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.74",
        "rate": 2.74,
        "monthly": 135773,
        "total": 4887823
      },
      {
        "id": "kt_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.83 Kar Payı)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.83",
        "rate": 2.83,
        "monthly": 236548,
        "total": 5677149,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      },
      {
        "id": "kt_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.86 Kar Payı)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.86",
        "rate": 2.86,
        "monthly": 184522,
        "total": 6642779
      },
      {
        "id": "kt_70_grace_1000_24",
        "title": "1.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 1000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%1.82",
        "rate": 1.82,
        "monthly": 58394,
        "total": 1401459,
        "tag": "İLK 6 AY 0 TL"
      },
      {
        "id": "kt_70_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 1500000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 95315,
        "total": 2287561,
        "highlight": true,
        "tag": "1.5M 6 AY ÖDEMESİZ"
      },
      {
        "id": "kt_70_grace_2000_24",
        "title": "2.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 2000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.56",
        "rate": 2.56,
        "monthly": 132176,
        "total": 3172216,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "kt_70_grace_3000_24",
        "title": "3.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 3000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.79",
        "rate": 2.79,
        "monthly": 205687,
        "total": 4936486,
        "tag": "3M 6 AY ÖDEMESİZ"
      },
      {
        "id": "kt_70_grace_4000_24",
        "title": "4.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 4000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.91",
        "rate": 2.91,
        "monthly": 279485,
        "total": 6707644,
        "tag": "4 MİLYON TL TAVAN"
      }
    ],
    "eurocargo": [
      {
        "id": "kt_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR KAR PAYI"
      },
      {
        "id": "kt_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.33 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.33",
        "rate": 1.33,
        "monthly": 49441,
        "total": 1186592
      },
      {
        "id": "kt_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.78 Kar Payı)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%1.78",
        "rate": 1.78,
        "monthly": 38586,
        "total": 1389106
      },
      {
        "id": "kt_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.23 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.23",
        "rate": 1.23,
        "monthly": 135896,
        "total": 1630749
      },
      {
        "id": "kt_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.01 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.01",
        "rate": 2.01,
        "monthly": 80577,
        "total": 1933839,
        "highlight": true,
        "tag": "1.5M EŞİT TAKSİT"
      },
      {
        "id": "kt_70_1500_36",
        "title": "1.500.000 TL — 36 Ay (%2.27 Kar Payı)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.27",
        "rate": 2.27,
        "monthly": 62882,
        "total": 2263746
      },
      {
        "id": "kt_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.82 Kar Payı)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.82",
        "rate": 1.82,
        "monthly": 188401,
        "total": 2260813
      },
      {
        "id": "kt_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.35 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 111861,
        "total": 2684660,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "kt_70_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.51 Kar Payı)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.51",
        "rate": 2.51,
        "monthly": 87217,
        "total": 3139806
      },
      {
        "id": "kt_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.54 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.54",
        "rate": 2.54,
        "monthly": 142970,
        "total": 3431291
      },
      {
        "id": "kt_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.67 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.67",
        "rate": 2.67,
        "monthly": 174172,
        "total": 4180137,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "kt_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.74 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.74",
        "rate": 2.74,
        "monthly": 135773,
        "total": 4887823
      },
      {
        "id": "kt_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.83 Kar Payı)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.83",
        "rate": 2.83,
        "monthly": 236548,
        "total": 5677149,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      },
      {
        "id": "kt_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.86 Kar Payı)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.86",
        "rate": 2.86,
        "monthly": 184522,
        "total": 6642779
      },
      {
        "id": "kt_70_grace_1000_24",
        "title": "1.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 1000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%1.82",
        "rate": 1.82,
        "monthly": 58394,
        "total": 1401459,
        "tag": "İLK 6 AY 0 TL"
      },
      {
        "id": "kt_70_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 1500000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 95315,
        "total": 2287561,
        "highlight": true,
        "tag": "1.5M 6 AY ÖDEMESİZ"
      },
      {
        "id": "kt_70_grace_2000_24",
        "title": "2.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 2000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.56",
        "rate": 2.56,
        "monthly": 132176,
        "total": 3172216,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "kt_70_grace_3000_24",
        "title": "3.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 3000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.79",
        "rate": 2.79,
        "monthly": 205687,
        "total": 4936486,
        "tag": "3M 6 AY ÖDEMESİZ"
      },
      {
        "id": "kt_70_grace_4000_24",
        "title": "4.000.000 TL — 6 Ay Ödemesiz (24 Ay)",
        "principal": 4000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.91",
        "rate": 2.91,
        "monthly": 279485,
        "total": 6707644,
        "tag": "4 MİLYON TL TAVAN"
      }
    ]
  },
  "garanti": {
    "daily35": [
      {
        "id": "garanti_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "garanti_35_900_9",
        "title": "900.000 TL — 9 Ay (%0 Faiz)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 900000,
        "highlight": true,
        "tag": "9 AY SIFIR FAİZ"
      },
      {
        "id": "garanti_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.07 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.07",
        "rate": 1.07,
        "monthly": 89521,
        "total": 1074252,
        "highlight": true,
        "tag": "ÖZEL %1.07 ORAN"
      },
      {
        "id": "garanti_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.83 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.83",
        "rate": 1.83,
        "monthly": 52391,
        "total": 1257384,
        "tag": "2 YIL VADE"
      },
      {
        "id": "garanti_35_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.18 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.18",
        "rate": 2.18,
        "monthly": 41106,
        "total": 1479816
      },
      {
        "id": "garanti_35_1200_12",
        "title": "1.200.000 TL — 12 Ay (%1.50 Faiz)",
        "principal": 1200000,
        "term": 12,
        "rateLabel": "%1.50",
        "rate": 1.5,
        "monthly": 110543,
        "total": 1326516
      },
      {
        "id": "garanti_35_1200_24",
        "title": "1.200.000 TL — 24 Ay (%2.07 Faiz)",
        "principal": 1200000,
        "term": 24,
        "rateLabel": "%2.07",
        "rate": 2.07,
        "monthly": 64688,
        "total": 1552512
      },
      {
        "id": "garanti_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.93 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.93",
        "rate": 1.93,
        "monthly": 142078,
        "total": 1704936
      },
      {
        "id": "garanti_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.31 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.31",
        "rate": 2.31,
        "monthly": 83135,
        "total": 1995240,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "garanti_35_1500_36",
        "title": "1.500.000 TL — 36 Ay (%2.53 Faiz)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.53",
        "rate": 2.53,
        "monthly": 65215,
        "total": 2347740
      },
      {
        "id": "garanti_35_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.35 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 194639,
        "total": 2335668
      },
      {
        "id": "garanti_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.54 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.54",
        "rate": 2.54,
        "monthly": 113881,
        "total": 2733144,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "garanti_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.70 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 89326,
        "total": 3215736
      }
    ],
    "daily70": [
      {
        "id": "garanti_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR FAİZ"
      },
      {
        "id": "garanti_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.24 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.24",
        "rate": 1.24,
        "monthly": 48780,
        "total": 1170720
      },
      {
        "id": "garanti_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.25 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.25",
        "rate": 1.25,
        "monthly": 135879,
        "total": 1630548
      },
      {
        "id": "garanti_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.93 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.93",
        "rate": 1.93,
        "monthly": 79519,
        "total": 1908456,
        "highlight": true,
        "tag": "1.5M AVANTAJLI"
      },
      {
        "id": "garanti_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.85 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.85",
        "rate": 1.85,
        "monthly": 188436,
        "total": 2261232
      },
      {
        "id": "garanti_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.26 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.26",
        "rate": 2.26,
        "monthly": 110263,
        "total": 2646312,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "garanti_70_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.50 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.50",
        "rate": 2.5,
        "monthly": 86497,
        "total": 3113892
      },
      {
        "id": "garanti_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.46 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.46",
        "rate": 2.46,
        "monthly": 141009,
        "total": 3384216
      },
      {
        "id": "garanti_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.59 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 171756,
        "total": 4122144,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "garanti_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.73 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.73",
        "rate": 2.73,
        "monthly": 134719,
        "total": 4850084
      },
      {
        "id": "garanti_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.75 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.75",
        "rate": 2.75,
        "monthly": 233251,
        "total": 5598024,
        "tag": "4 MİLYON TL TAVAN"
      },
      {
        "id": "garanti_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 182941,
        "total": 6585876
      }
    ],
    "eurocargo": [
      {
        "id": "garanti_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "garanti_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.93 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.93",
        "rate": 1.93,
        "monthly": 79519,
        "total": 1908456
      },
      {
        "id": "garanti_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.26 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.26",
        "rate": 2.26,
        "monthly": 110263,
        "total": 2646312,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "garanti_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.59 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 171756,
        "total": 4122144,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "garanti_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 182941,
        "total": 6585876,
        "tag": "4 MİLYON TL TAVAN"
      }
    ]
  },
  "is_bankasi": {
    "daily35": [
      {
        "id": "is_35_800_8",
        "title": "800.000 TL — 8 Ay (%0.36 İndirimli)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0.36",
        "rate": 0.36,
        "monthly": 101713,
        "total": 813704,
        "highlight": true,
        "tag": "%0.36 DÜŞÜK FAİZ"
      },
      {
        "id": "is_35_900_9",
        "title": "900.000 TL — 9 Ay (%0.31 İndirimli)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0.31",
        "rate": 0.31,
        "monthly": 101650,
        "total": 914850,
        "highlight": true,
        "tag": "%0.31 DÜŞÜK FAİZ"
      },
      {
        "id": "is_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.78 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.78",
        "rate": 1.78,
        "monthly": 93782,
        "total": 1125384,
        "highlight": true,
        "tag": "12 AY İNDİRİMLİ"
      },
      {
        "id": "is_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.43 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.43",
        "rate": 2.43,
        "monthly": 56238,
        "total": 1349712
      },
      {
        "id": "is_35_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.74 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.74",
        "rate": 2.74,
        "monthly": 44932,
        "total": 1617552
      },
      {
        "id": "is_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%2.46 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%2.46",
        "rate": 2.46,
        "monthly": 147004,
        "total": 1764048
      },
      {
        "id": "is_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.81 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.81",
        "rate": 2.81,
        "monthly": 88129,
        "total": 2115096,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "is_35_1500_36",
        "title": "1.500.000 TL — 36 Ay (%3.01 Faiz)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%3.01",
        "rate": 3.01,
        "monthly": 70383,
        "total": 2533788
      },
      {
        "id": "is_35_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.80 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.80",
        "rate": 2.8,
        "monthly": 200218,
        "total": 2402616
      },
      {
        "id": "is_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%3.00 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%3.00",
        "rate": 3,
        "monthly": 120011,
        "total": 2880264,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "is_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%3.15 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%3.15",
        "rate": 3.15,
        "monthly": 95844,
        "total": 3450384
      }
    ],
    "daily70": [
      {
        "id": "is_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0.22 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.22",
        "rate": 0.22,
        "monthly": 84578,
        "total": 1014936,
        "highlight": true,
        "tag": "%0.22 İNDİRİMLİ"
      },
      {
        "id": "is_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.56 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.56",
        "rate": 1.56,
        "monthly": 50752,
        "total": 1218048
      },
      {
        "id": "is_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.11 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.11",
        "rate": 2.11,
        "monthly": 40570,
        "total": 1460520
      },
      {
        "id": "is_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.06 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.06",
        "rate": 2.06,
        "monthly": 191017,
        "total": 2292204
      },
      {
        "id": "is_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.59 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 114529,
        "total": 2748696,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "is_70_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 91491,
        "total": 3293676
      },
      {
        "id": "is_70_3000_12",
        "title": "3.000.000 TL — 12 Ay (%2.65 Faiz)",
        "principal": 3000000,
        "term": 12,
        "rateLabel": "%2.65",
        "rate": 2.65,
        "monthly": 297449,
        "total": 3569388
      },
      {
        "id": "is_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.92 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.92",
        "rate": 2.92,
        "monthly": 178304,
        "total": 4279296,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "is_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.09 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.09",
        "rate": 3.09,
        "monthly": 142404,
        "total": 5126544
      },
      {
        "id": "is_70_4000_12",
        "title": "4.000.000 TL — 12 Ay (%2.94 Faiz)",
        "principal": 4000000,
        "term": 12,
        "rateLabel": "%2.94",
        "rate": 2.94,
        "monthly": 403862,
        "total": 4846344
      },
      {
        "id": "is_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%3.08 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%3.08",
        "rate": 3.08,
        "monthly": 242075,
        "total": 5809800,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      },
      {
        "id": "is_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.20 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.20",
        "rate": 3.2,
        "monthly": 193306,
        "total": 6959016
      }
    ],
    "eurocargo": [
      {
        "id": "is_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0.22 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.22",
        "rate": 0.22,
        "monthly": 84578,
        "total": 1014936,
        "highlight": true,
        "tag": "%0.22 İNDİRİMLİ"
      },
      {
        "id": "is_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.56 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.56",
        "rate": 1.56,
        "monthly": 50752,
        "total": 1218048
      },
      {
        "id": "is_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.11 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.11",
        "rate": 2.11,
        "monthly": 40570,
        "total": 1460520
      },
      {
        "id": "is_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.06 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.06",
        "rate": 2.06,
        "monthly": 191017,
        "total": 2292204
      },
      {
        "id": "is_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.59 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 114529,
        "total": 2748696,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "is_70_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 91491,
        "total": 3293676
      },
      {
        "id": "is_70_3000_12",
        "title": "3.000.000 TL — 12 Ay (%2.65 Faiz)",
        "principal": 3000000,
        "term": 12,
        "rateLabel": "%2.65",
        "rate": 2.65,
        "monthly": 297449,
        "total": 3569388
      },
      {
        "id": "is_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.92 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.92",
        "rate": 2.92,
        "monthly": 178304,
        "total": 4279296,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "is_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.09 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.09",
        "rate": 3.09,
        "monthly": 142404,
        "total": 5126544
      },
      {
        "id": "is_70_4000_12",
        "title": "4.000.000 TL — 12 Ay (%2.94 Faiz)",
        "principal": 4000000,
        "term": 12,
        "rateLabel": "%2.94",
        "rate": 2.94,
        "monthly": 403862,
        "total": 4846344
      },
      {
        "id": "is_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%3.08 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%3.08",
        "rate": 3.08,
        "monthly": 242075,
        "total": 5809800,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      },
      {
        "id": "is_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.20 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.20",
        "rate": 3.2,
        "monthly": 193306,
        "total": 6959016
      }
    ]
  },
  "akbank": {
    "daily35": [
      {
        "id": "ak_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "ak_35_900_9",
        "title": "900.000 TL — 9 Ay (%0 Faiz)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 900000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "ak_35_900_12",
        "title": "900.000 TL — 12 Ay (%0.76 Faiz)",
        "principal": 900000,
        "term": 12,
        "rateLabel": "%0.76",
        "rate": 0.76,
        "monthly": 78947,
        "total": 947364,
        "tag": "ÖZEL %0.76 ORAN"
      },
      {
        "id": "ak_35_800_12",
        "title": "800.000 TL — 12 Ay (%1.03 Faiz)",
        "principal": 800000,
        "term": 12,
        "rateLabel": "%1.03",
        "rate": 1.03,
        "monthly": 71446,
        "total": 857352
      },
      {
        "id": "ak_35_900_24",
        "title": "900.000 TL — 24 Ay (%1.89 Faiz)",
        "principal": 900000,
        "term": 24,
        "rateLabel": "%1.89",
        "rate": 1.89,
        "monthly": 47500,
        "total": 1140000
      },
      {
        "id": "ak_35_800_24",
        "title": "800.000 TL — 24 Ay (%2.04 Faiz)",
        "principal": 800000,
        "term": 24,
        "rateLabel": "%2.04",
        "rate": 2.04,
        "monthly": 42980,
        "total": 1031520
      },
      {
        "id": "ak_35_1200_24",
        "title": "1.200.000 TL — 24 Ay (%2.04 Faiz)",
        "principal": 1200000,
        "term": 24,
        "rateLabel": "%2.04",
        "rate": 2.04,
        "monthly": 64470,
        "total": 1547280
      },
      {
        "id": "ak_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.15 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.15",
        "rate": 2.15,
        "monthly": 81850,
        "total": 1964400,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "ak_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.15 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.15",
        "rate": 2.15,
        "monthly": 109200,
        "total": 2620800,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      }
    ],
    "daily70": [
      {
        "id": "ak_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR FAİZ"
      },
      {
        "id": "ak_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.47 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.47",
        "rate": 1.47,
        "monthly": 50177,
        "total": 1204248
      },
      {
        "id": "ak_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.01 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.01",
        "rate": 2.01,
        "monthly": 39932,
        "total": 1437552
      },
      {
        "id": "ak_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.85 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.85",
        "rate": 1.85,
        "monthly": 78540,
        "total": 1884960,
        "tag": "1.5M AVANTAJLI"
      },
      {
        "id": "ak_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.10",
        "rate": 2.1,
        "monthly": 108250,
        "total": 2598000,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "ak_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.25 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.25",
        "rate": 2.25,
        "monthly": 137800,
        "total": 3307200
      },
      {
        "id": "ak_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.45 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.45",
        "rate": 2.45,
        "monthly": 168200,
        "total": 4036800,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "ak_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.65 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.65",
        "rate": 2.65,
        "monthly": 228400,
        "total": 5481600,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      }
    ],
    "eurocargo": [
      {
        "id": "ak_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR FAİZ"
      },
      {
        "id": "ak_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.47 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.47",
        "rate": 1.47,
        "monthly": 50177,
        "total": 1204248
      },
      {
        "id": "ak_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.01 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.01",
        "rate": 2.01,
        "monthly": 39932,
        "total": 1437552
      },
      {
        "id": "ak_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.85 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.85",
        "rate": 1.85,
        "monthly": 78540,
        "total": 1884960,
        "tag": "1.5M AVANTAJLI"
      },
      {
        "id": "ak_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.10",
        "rate": 2.1,
        "monthly": 108250,
        "total": 2598000,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "ak_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.25 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.25",
        "rate": 2.25,
        "monthly": 137800,
        "total": 3307200
      },
      {
        "id": "ak_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.45 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.45",
        "rate": 2.45,
        "monthly": 168200,
        "total": 4036800,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "ak_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.65 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.65",
        "rate": 2.65,
        "monthly": 228400,
        "total": 5481600,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      }
    ]
  },
  "yapi_kredi": {
    "daily35": [
      {
        "id": "yk_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "yk_35_900_9",
        "title": "900.000 TL — 9 Ay (%0 Faiz)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 900000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "yk_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.10 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.10",
        "rate": 1.1,
        "monthly": 89721,
        "total": 1076652,
        "highlight": true,
        "tag": "ÖZEL %1.10 ORAN"
      },
      {
        "id": "yk_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.10",
        "rate": 2.1,
        "monthly": 54126,
        "total": 1299024
      },
      {
        "id": "yk_35_1200_12",
        "title": "1.200.000 TL — 12 Ay (%1.53 Faiz)",
        "principal": 1200000,
        "term": 12,
        "rateLabel": "%1.53",
        "rate": 1.53,
        "monthly": 110754,
        "total": 1329048
      },
      {
        "id": "yk_35_1200_24",
        "title": "1.200.000 TL — 24 Ay (%2.34 Faiz)",
        "principal": 1200000,
        "term": 24,
        "rateLabel": "%2.34",
        "rate": 2.34,
        "monthly": 66808,
        "total": 1603392
      },
      {
        "id": "yk_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.96 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 142308,
        "total": 1707696
      },
      {
        "id": "yk_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.58 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.58",
        "rate": 2.58,
        "monthly": 85828,
        "total": 2059872,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "yk_35_1500_36",
        "title": "1.500.000 TL — 36 Ay (%2.83 Faiz)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.83",
        "rate": 2.83,
        "monthly": 68414,
        "total": 2462904
      },
      {
        "id": "yk_35_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.38 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.38",
        "rate": 2.38,
        "monthly": 194900,
        "total": 2338800
      },
      {
        "id": "yk_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.82 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.82",
        "rate": 2.82,
        "monthly": 117546,
        "total": 2821104,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "yk_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%3.00 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%3.00",
        "rate": 3,
        "monthly": 93684,
        "total": 3372624
      }
    ],
    "daily70": [
      {
        "id": "yk_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR FAİZ"
      },
      {
        "id": "yk_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.35 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.35",
        "rate": 1.35,
        "monthly": 136200,
        "total": 1634400
      },
      {
        "id": "yk_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.10",
        "rate": 2.1,
        "monthly": 81180,
        "total": 1948320,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "yk_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.35 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 111900,
        "total": 2685600,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "yk_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.54 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.54",
        "rate": 2.54,
        "monthly": 142800,
        "total": 3427200
      },
      {
        "id": "yk_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.68 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.68",
        "rate": 2.68,
        "monthly": 174500,
        "total": 4188000,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "yk_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.85 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 238100,
        "total": 5714400,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      }
    ],
    "eurocargo": [
      {
        "id": "yk_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR FAİZ"
      },
      {
        "id": "yk_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.35 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.35",
        "rate": 1.35,
        "monthly": 136200,
        "total": 1634400
      },
      {
        "id": "yk_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.10",
        "rate": 2.1,
        "monthly": 81180,
        "total": 1948320,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "yk_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.35 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 111900,
        "total": 2685600,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "yk_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.54 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.54",
        "rate": 2.54,
        "monthly": 142800,
        "total": 3427200
      },
      {
        "id": "yk_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.68 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.68",
        "rate": 2.68,
        "monthly": 174500,
        "total": 4188000,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "yk_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.85 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 238100,
        "total": 5714400,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      }
    ]
  },
  "vakif_katilim": {
    "daily35": [
      {
        "id": "vk_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Kar Payı)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "SIFIR KAR PAYI"
      },
      {
        "id": "vk_35_900_9",
        "title": "900.000 TL — 9 Ay (%0 Kar Payı)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 900000,
        "highlight": true,
        "tag": "SIFIR KAR PAYI"
      },
      {
        "id": "vk_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.15 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.15",
        "rate": 1.15,
        "monthly": 90100,
        "total": 1081200
      },
      {
        "id": "vk_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.15 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.15",
        "rate": 2.15,
        "monthly": 81850,
        "total": 1964400,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "vk_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.18 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.18",
        "rate": 2.18,
        "monthly": 109800,
        "total": 2635200,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      }
    ],
    "daily70": [
      {
        "id": "vk_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR KAR PAYI"
      },
      {
        "id": "vk_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.15 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.15",
        "rate": 2.15,
        "monthly": 81850,
        "total": 1964400
      },
      {
        "id": "vk_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.25 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.25",
        "rate": 2.25,
        "monthly": 110200,
        "total": 2644800,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "vk_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.35 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 139500,
        "total": 3348000
      },
      {
        "id": "vk_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.45 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.45",
        "rate": 2.45,
        "monthly": 168200,
        "total": 4036800,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "vk_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.65 Kar Payı)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.65",
        "rate": 2.65,
        "monthly": 228400,
        "total": 5481600,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      }
    ],
    "eurocargo": [
      {
        "id": "vk_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR KAR PAYI"
      },
      {
        "id": "vk_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.15 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.15",
        "rate": 2.15,
        "monthly": 81850,
        "total": 1964400
      },
      {
        "id": "vk_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.25 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.25",
        "rate": 2.25,
        "monthly": 110200,
        "total": 2644800,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "vk_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.35 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 139500,
        "total": 3348000
      },
      {
        "id": "vk_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.45 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.45",
        "rate": 2.45,
        "monthly": 168200,
        "total": 4036800,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "vk_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.65 Kar Payı)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.65",
        "rate": 2.65,
        "monthly": 228400,
        "total": 5481600,
        "tag": "4 MİLYON TL TAVAN",
        "highlight": true
      }
    ]
  },
  "bnp_paribas": {
    "daily35": [
      {
        "id": "bnp_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "bnp_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.15 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.15",
        "rate": 2.15,
        "monthly": 81850,
        "total": 1964400,
        "highlight": true,
        "tag": "1.5M TİCARİ"
      },
      {
        "id": "bnp_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.18 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.18",
        "rate": 2.18,
        "monthly": 109800,
        "total": 2635200,
        "tag": "2 MİLYON TL"
      }
    ],
    "daily70": [
      {
        "id": "bnp_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR FAİZ"
      },
      {
        "id": "bnp_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.15 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.15",
        "rate": 2.15,
        "monthly": 81850,
        "total": 1964400,
        "highlight": true,
        "tag": "1.5M KREDİ"
      },
      {
        "id": "bnp_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.25 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.25",
        "rate": 2.25,
        "monthly": 110200,
        "total": 2644800,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "bnp_70_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.35 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rateLabel": "%2.35",
        "rate": 2.35,
        "monthly": 139500,
        "total": 3348000,
        "tag": "2.5 MİLYON TL"
      }
    ],
    "eurocargo": [
      {
        "id": "bnp_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "bnp_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.25 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.25",
        "rate": 2.25,
        "monthly": 110200,
        "total": 2644800,
        "highlight": true
      },
      {
        "id": "bnp_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.40 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.40",
        "rate": 2.4,
        "monthly": 168500,
        "total": 4044000,
        "tag": "3 MİLYON TL FİLO"
      }
    ]
  }
};

export function getCampaignsForVehicleAndBank(modelKey = 'daily35', bankId = 'teb_cetelem', tierId = 'all') {
  let category = 'daily35';
  const lower = (modelKey || '').toLowerCase();
  if (lower.includes('70') || lower.includes('72')) {
    category = 'daily70';
  } else if (lower.includes('eurocargo') || lower.includes('ml') || lower.includes('100e') || lower.includes('120e') || lower.includes('150e') || lower.includes('160e') || lower.includes('180e')) {
    category = 'eurocargo';
  } else if (lower.includes('çekici') || lower.includes('s-way') || lower.includes('sway') || lower.includes('t-way') || lower.includes('tway') || lower.includes('hafriyat') || lower.includes('damper') || lower.includes('heavy') || lower.includes('ağır')) {
    category = 'heavy';
  } else {
    category = 'daily35';
  }

  const effectiveBankId = bankId === 'diger_yok' ? 'teb_cetelem' : (bankId || 'teb_cetelem');
  const bankData = BANK_CAMPAIGNS[effectiveBankId] || BANK_CAMPAIGNS.teb_cetelem;
  let campaigns = [];
  if (category === 'heavy') {
    const heavyBank = HEAVY_CAMPAIGNS[effectiveBankId];
    if (heavyBank) {
      campaigns = [
        ...(heavyBank.sifirFaizTL || []),
        ...(heavyBank.odemesiz6AyTL || []),
        ...(heavyBank.sifirFaiz6AyOdemesizTL || []),
        ...(heavyBank.esitTaksitTL || [])
      ];
    }
    if (campaigns.length === 0) {
      campaigns = bankData.eurocargo || bankData.daily70 || [];
    }
  } else {
    campaigns = bankData[category] || bankData.daily35 || [];
  }

  let maxLimit = 2000000;
  if (category === 'heavy') {
    maxLimit = 6000000;
  } else if (category === 'daily70' || category === 'eurocargo') {
    maxLimit = 4000000;
  } else {
    maxLimit = 2000000;
  }
  campaigns = campaigns.filter(c => (c.principal || 0) <= maxLimit);

  if (tierId && tierId !== 'all') {
    const categoryTiers = getAmountTiersForCategory(category);
    const tier = categoryTiers.find(t => t.id === tierId) || AMOUNT_TIERS.find(t => t.id === tierId);
    if (tier) {
      campaigns = campaigns.filter(c => c.principal >= tier.min && c.principal <= tier.max);
    }
  }

  return {
    category,
    effectiveBankId,
    campaigns
  };
}

export const EUR_LOAN_PRESETS = [
  {
    "id": "eur_50k_24",
    "title": "€50.000 — 24 Ay (%4.99 Yıllık)",
    "principal": 50000,
    "term": 24,
    "rateLabel": "%4.99 Yıllık",
    "rate": 0.415,
    "monthly": 2190,
    "total": 52560,
    "currency": "EUR",
    "tag": "PEŞİNAT DESTEK",
    "desc": "Peşinat sonrası kalan bakiye için ideal düşük faizli Euro kredisi"
  },
  {
    "id": "eur_80k_36",
    "title": "€80.000 — 36 Ay (%5.49 Yıllık)",
    "principal": 80000,
    "term": 36,
    "rateLabel": "%5.49 Yıllık",
    "rate": 0.457,
    "monthly": 2415,
    "total": 86940,
    "currency": "EUR",
    "tag": "EN ÇOK TERCİH EDİLEN",
    "desc": "S-Way 500 için %65 finansman oranı ile en dengeli taksit"
  },
  {
    "id": "eur_100k_36",
    "title": "€100.000 — 36 Ay (%5.49 Yıllık)",
    "principal": 100000,
    "term": 36,
    "rateLabel": "%5.49 Yıllık",
    "rate": 0.457,
    "monthly": 3018,
    "total": 108650,
    "currency": "EUR",
    "tag": "FİLO & ÇEKİCİ ÖZEL",
    "desc": "S-Way & T-Way filoları için geniş kapsamlı Euro finansmanı"
  },
  {
    "id": "eur_120k_48",
    "title": "€120.000 — 48 Ay (%5.99 Yıllık)",
    "principal": 120000,
    "term": 48,
    "rateLabel": "%5.99 Yıllık",
    "rate": 0.499,
    "monthly": 2818,
    "total": 135260,
    "currency": "EUR",
    "tag": "TAM FİNANSMAN (48 AY)",
    "desc": "Sıfır km S-Way çekicinin neredeyse tamamını finanse eden uzun vadeli döviz kredisi"
  }
];

export const EUR_PARTNER_BANKS = [
  {
    "id": "eximbank",
    "name": "Türk Eximbank",
    "shortName": "Türk Eximbank",
    "badge": "İhracatçı Kredisi",
    "icon": "🌍",
    "color": "#0284c7",
    "bg": "rgba(2, 132, 199, 0.15)",
    "border": "rgba(56, 189, 248, 0.4)",
    "desc": "İhracat taahhütlü lojistik ve taşımacılık firmalarına özel sübvansiyonlu Euro kredisi"
  },
  {
    "id": "teb_cetelem_eur",
    "name": "TEB Cetelem / BNP Paribas",
    "shortName": "TEB Cetelem EUR",
    "badge": "IVECO Resmi Euro Finansman",
    "icon": "🏛️",
    "color": "#10b981",
    "bg": "rgba(16, 185, 129, 0.15)",
    "border": "rgba(52, 211, 153, 0.4)",
    "desc": "IVECO resmi distribütör destekli Euro taşıt finansmanı ve leasing"
  },
  {
    "id": "isbank_garanti_eur",
    "name": "İş Bankası & Garanti BBVA",
    "shortName": "Ticari Döviz Masası",
    "badge": "Uluslararası Nakliye",
    "icon": "🏦",
    "color": "#3b82f6",
    "bg": "rgba(59, 130, 246, 0.15)",
    "border": "rgba(96, 165, 250, 0.4)",
    "desc": "UND ve uluslararası taşımacılık belgesine sahip ihracatçı şirketler için Euro kredisi"
  },
  {
    "id": "kuveyt_turk_eur",
    "name": "Kuveyt Türk Katılım",
    "shortName": "Kuveyt Türk EUR",
    "badge": "Dövizli Murabaha",
    "icon": "🌿",
    "color": "#059669",
    "bg": "rgba(5, 150, 105, 0.15)",
    "border": "rgba(52, 211, 153, 0.4)",
    "desc": "Faizsiz prensiplerle döviz bazlı sabit kar paylı Euro araç finansmanı"
  }
];

export function calculateEurLoan(principal, termMonths = 36, annualRatePct = 5.49) {
  const p = Number(principal) || 0;
  const n = Number(termMonths) || 12;
  const annualRate = Number(annualRatePct) || 5.49;
  if (p <= 0 || n <= 0) return { monthly: 0, total: 0, totalInterest: 0 };
  const r = (annualRate / 100) / 12;
  const factor = Math.pow(1 + r, n);
  const monthly = Math.round(p * (r * factor) / (factor - 1));
  const total = monthly * n;
  const totalInterest = total - p;
  return {
    principal: p,
    termMonths: n,
    annualRatePct: annualRate,
    monthly,
    total,
    totalInterest
  };
}

export const HEAVY_CAMPAIGNS = {
  "kuveyt_turk": {
    "name": "Kuveyt Türk Katılım",
    "badge": "Katılım & 6 Ay Ödemesiz & %0 Faiz",
    "esitTaksitTL": [
      {
        "id": "kt_h_2500_6",
        "title": "2.500.000 TL — 6 Ay (%0.66 Kar Payı)",
        "principal": 2500000,
        "term": 6,
        "rate": 0.66,
        "rateLabel": "%0.66",
        "monthly": 427026,
        "total": 2562156,
        "tag": "HIZLI ÖDEME"
      },
      {
        "id": "kt_h_2500_12",
        "title": "2.500.000 TL — 12 Ay (%1.88 Kar Payı)",
        "principal": 2500000,
        "term": 12,
        "rate": 1.88,
        "rateLabel": "%1.88",
        "monthly": 236428,
        "total": 2837137,
        "tag": "AVANTAJLI"
      },
      {
        "id": "kt_h_2500_24",
        "title": "2.500.000 TL — 24 Ay (%2.37 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rate": 2.37,
        "rateLabel": "%2.37",
        "monthly": 140155,
        "total": 3363726
      },
      {
        "id": "kt_h_2500_36",
        "title": "2.500.000 TL — 36 Ay (%2.53 Kar Payı)",
        "principal": 2500000,
        "term": 36,
        "rate": 2.53,
        "rateLabel": "%2.53",
        "monthly": 109376,
        "total": 3937553
      },
      {
        "id": "kt_h_2500_48",
        "title": "2.500.000 TL — 48 Ay (%2.61 Kar Payı)",
        "principal": 2500000,
        "term": 48,
        "rate": 2.61,
        "rateLabel": "%2.61",
        "monthly": 94988,
        "total": 4559401
      },
      {
        "id": "kt_h_3000_12",
        "title": "3.000.000 TL — 12 Ay (%2.16 Kar Payı)",
        "principal": 3000000,
        "term": 12,
        "rate": 2.16,
        "rateLabel": "%2.16",
        "monthly": 288935,
        "total": 3467219
      },
      {
        "id": "kt_h_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.53 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.53,
        "rateLabel": "%2.53",
        "monthly": 171365,
        "total": 4112757
      },
      {
        "id": "kt_h_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.64 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rate": 2.64,
        "rateLabel": "%2.64",
        "monthly": 133610,
        "total": 4809966
      },
      {
        "id": "kt_h_4500_12",
        "title": "4.500.000 TL — 12 Ay (%2.63 Kar Payı)",
        "principal": 4500000,
        "term": 12,
        "rate": 2.63,
        "rateLabel": "%2.63",
        "monthly": 446720,
        "total": 5360639
      },
      {
        "id": "kt_h_4500_24",
        "title": "4.500.000 TL — 24 Ay (%2.79 Kar Payı)",
        "principal": 4500000,
        "term": 24,
        "rate": 2.79,
        "rateLabel": "%2.79",
        "monthly": 264897,
        "total": 6357539
      },
      {
        "id": "kt_h_4500_36",
        "title": "4.500.000 TL — 36 Ay (%2.83 Kar Payı)",
        "principal": 4500000,
        "term": 36,
        "rate": 2.83,
        "rateLabel": "%2.83",
        "monthly": 206601,
        "total": 7437652
      },
      {
        "id": "kt_h_5000_12",
        "title": "5.000.000 TL — 12 Ay (%2.72 Kar Payı)",
        "principal": 5000000,
        "term": 12,
        "rate": 2.72,
        "rateLabel": "%2.72",
        "monthly": 499216,
        "total": 5990593
      },
      {
        "id": "kt_h_5000_24",
        "title": "5.000.000 TL — 24 Ay (%2.84 Kar Payı)",
        "principal": 5000000,
        "term": 24,
        "rate": 2.84,
        "rateLabel": "%2.84",
        "monthly": 296024,
        "total": 7104576,
        "tag": "FİLO TERCİHİ"
      },
      {
        "id": "kt_h_5000_36",
        "title": "5.000.000 TL — 36 Ay (%2.87 Kar Payı)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.87,
        "rateLabel": "%2.87",
        "monthly": 231018,
        "total": 8316633
      },
      {
        "id": "kt_h_6000_12",
        "title": "6.000.000 TL — 12 Ay (%2.75 Kar Payı)",
        "principal": 6000000,
        "term": 12,
        "rate": 2.75,
        "rateLabel": "%2.75",
        "monthly": 599060,
        "total": 7188720,
        "tag": "6 MİLYON TL"
      },
      {
        "id": "kt_h_6000_24",
        "title": "6.000.000 TL — 24 Ay (%2.86 Kar Payı)",
        "principal": 6000000,
        "term": 24,
        "rate": 2.86,
        "rateLabel": "%2.86",
        "monthly": 355228,
        "total": 8525472,
        "tag": "6 MİLYON TL FİLO"
      },
      {
        "id": "kt_h_6000_36",
        "title": "6.000.000 TL — 36 Ay (%2.89 Kar Payı)",
        "principal": 6000000,
        "term": 36,
        "rate": 2.89,
        "rateLabel": "%2.89",
        "monthly": 277221,
        "total": 9979956,
        "tag": "6 MİLYON TL 36 AY"
      }
    ],
    "odemesiz6AyTL": [
      {
        "id": "kt_h_odm_2500_24",
        "title": "2.500.000 TL — 6 Ay Ödemesiz + 24 Ay",
        "principal": 2500000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 2.57,
        "rateLabel": "%2.57",
        "monthly": 165486,
        "total": 3971668,
        "desc": "İlk 6 Ay 0 TL Taksit + 24 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_2500_36",
        "title": "2.500.000 TL — 6 Ay Ödemesiz + 36 Ay",
        "principal": 2500000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 2.7,
        "rateLabel": "%2.70",
        "monthly": 129665,
        "total": 4667938,
        "desc": "İlk 6 Ay 0 TL Taksit + 36 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_3000_24",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 24 Ay",
        "principal": 3000000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 2.69,
        "rateLabel": "%2.69",
        "monthly": 202443,
        "total": 4858623,
        "desc": "İlk 6 Ay 0 TL Taksit + 24 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_3000_36",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 36 Ay",
        "principal": 3000000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 2.79,
        "rateLabel": "%2.79",
        "monthly": 158393,
        "total": 5702149,
        "desc": "İlk 6 Ay 0 TL Taksit + 36 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_4500_24",
        "title": "4.500.000 TL — 6 Ay Ödemesiz + 24 Ay",
        "principal": 4500000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 2.88,
        "rateLabel": "%2.88",
        "monthly": 312943,
        "total": 7510633,
        "desc": "İlk 6 Ay 0 TL Taksit + 24 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_4500_36",
        "title": "4.500.000 TL — 6 Ay Ödemesiz + 36 Ay",
        "principal": 4500000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 2.95,
        "rateLabel": "%2.95",
        "monthly": 245105,
        "total": 8823781,
        "desc": "İlk 6 Ay 0 TL Taksit + 36 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_5000_24",
        "title": "5.000.000 TL — 6 Ay Ödemesiz + 24 Ay",
        "principal": 5000000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 2.92,
        "rateLabel": "%2.92",
        "monthly": 349905,
        "total": 8397712,
        "desc": "İlk 6 Ay 0 TL Taksit + 24 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_5000_36",
        "title": "5.000.000 TL — 6 Ay Ödemesiz + 36 Ay",
        "principal": 5000000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 2.98,
        "rateLabel": "%2.98",
        "monthly": 273912,
        "total": 9860844,
        "desc": "İlk 6 Ay 0 TL Taksit + 36 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_6000_24",
        "title": "6.000.000 TL — 6 Ay Ödemesiz + 24 Ay",
        "principal": 6000000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 2.94,
        "rateLabel": "%2.94",
        "monthly": 419886,
        "total": 10077264,
        "desc": "İlk 6 Ay 0 TL Taksit + 24 Eşit Taksit"
      },
      {
        "id": "kt_h_odm_6000_36",
        "title": "6.000.000 TL — 6 Ay Ödemesiz + 36 Ay",
        "principal": 6000000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 2.99,
        "rateLabel": "%2.99",
        "monthly": 328694,
        "total": 11832984,
        "desc": "İlk 6 Ay 0 TL Taksit + 36 Eşit Taksit"
      }
    ],
    "sifirFaizTL": [
      {
        "id": "kt_h_zero_4500_24",
        "title": "4.500.000 TL — 24 Ay (%0 Faiz)",
        "principal": 4500000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 187500,
        "total": 4500000,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "kt_h_zero_4500_30",
        "title": "4.500.000 TL — 30 Ay (%0 Faiz)",
        "principal": 4500000,
        "term": 30,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 150000,
        "total": 4500000,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "kt_h_zero_4500_36",
        "title": "4.500.000 TL — 36 Ay (%0 Faiz)",
        "principal": 4500000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 125000,
        "total": 4500000,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "kt_h_zero_5000_24",
        "title": "5.000.000 TL — 24 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 208333,
        "total": 5000000,
        "tag": "5M %0 FAİZ"
      },
      {
        "id": "kt_h_zero_5000_30",
        "title": "5.000.000 TL — 30 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 30,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 5000000,
        "tag": "5M %0 FAİZ"
      },
      {
        "id": "kt_h_zero_5000_36",
        "title": "5.000.000 TL — 36 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 138889,
        "total": 5000000,
        "tag": "5M %0 FAİZ"
      },
      {
        "id": "kt_h_zero_odm_4500_24",
        "title": "4.500.000 TL — 6 Ay Ödemesiz + 24 Ay (%0 Faiz)",
        "principal": 4500000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 187500,
        "total": 4500000,
        "desc": "6 Ay Ödemesiz + 24 Ay Sıfır Faiz"
      },
      {
        "id": "kt_h_zero_odm_4500_36",
        "title": "4.500.000 TL — 6 Ay Ödemesiz + 36 Ay (%0 Faiz)",
        "principal": 4500000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 125000,
        "total": 4500000,
        "desc": "6 Ay Ödemesiz + 36 Ay Sıfır Faiz"
      },
      {
        "id": "kt_h_zero_odm_5000_24",
        "title": "5.000.000 TL — 6 Ay Ödemesiz + 24 Ay (%0 Faiz)",
        "principal": 5000000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 208333,
        "total": 5000000,
        "desc": "6 Ay Ödemesiz + 24 Ay Sıfır Faiz"
      },
      {
        "id": "kt_h_zero_odm_5000_36",
        "title": "5.000.000 TL — 6 Ay Ödemesiz + 36 Ay (%0 Faiz)",
        "principal": 5000000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 138889,
        "total": 5000000,
        "desc": "6 Ay Ödemesiz + 36 Ay Sıfır Faiz"
      },
      {
        "id": "kt_h_zero_6000_24",
        "title": "6.000.000 TL — 24 Ay (%0 Faiz)",
        "principal": 6000000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 250000,
        "total": 6000000,
        "tag": "6M %0 FAİZ FİLO"
      },
      {
        "id": "kt_h_zero_6000_36",
        "title": "6.000.000 TL — 36 Ay (%0 Faiz)",
        "principal": 6000000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 6000000,
        "tag": "6M %0 FAİZ FİLO"
      },
      {
        "id": "kt_h_zero_odm_6000_36",
        "title": "6.000.000 TL — 6 Ay Ödemesiz + 36 Ay (%0 Faiz)",
        "principal": 6000000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 6000000,
        "desc": "6 Ay Ödemesiz + 36 Ay Sıfır Faiz"
      }
    ],
    "esitTaksitEUR": [
      {
        "id": "kt_h_eur_80k_9",
        "title": "€80.000 — 9 Ay (%0 Faiz)",
        "principal": 80000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 8889,
        "total": 80000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kt_h_eur_80k_12",
        "title": "€80.000 — 12 Ay (%0 Faiz)",
        "principal": 80000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 6667,
        "total": 80000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kt_h_eur_80k_18",
        "title": "€80.000 — 18 Ay (%0 Faiz)",
        "principal": 80000,
        "term": 18,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 4444,
        "total": 80000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kt_h_eur_80k_24",
        "title": "€80.000 — 24 Ay (%0 Faiz)",
        "principal": 80000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 3333,
        "total": 80000,
        "currency": "EUR",
        "tag": "%0 FAİZ (24 AY)"
      },
      {
        "id": "kt_h_eur_80k_36",
        "title": "€80.000 — 36 Ay (%0.20/ay)",
        "principal": 80000,
        "term": 36,
        "rate": 0.2,
        "rateLabel": "%0.20/ay",
        "monthly": 2311,
        "total": 83194,
        "currency": "EUR"
      },
      {
        "id": "kt_h_eur_80k_48",
        "title": "€80.000 — 48 Ay (%0.28/ay)",
        "principal": 80000,
        "term": 48,
        "rate": 0.28,
        "rateLabel": "%0.28/ay",
        "monthly": 1791,
        "total": 85985,
        "currency": "EUR"
      },
      {
        "id": "kt_h_eur_90k_12",
        "title": "€90.000 — 12 Ay (%0 Faiz)",
        "principal": 90000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 7500,
        "total": 90000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kt_h_eur_90k_24",
        "title": "€90.000 — 24 Ay (%0.06/ay)",
        "principal": 90000,
        "term": 24,
        "rate": 0.06,
        "rateLabel": "%0.06/ay",
        "monthly": 3780,
        "total": 90721,
        "currency": "EUR"
      },
      {
        "id": "kt_h_eur_90k_36",
        "title": "€90.000 — 36 Ay (%0.24/ay)",
        "principal": 90000,
        "term": 36,
        "rate": 0.24,
        "rateLabel": "%0.24/ay",
        "monthly": 2620,
        "total": 94323,
        "currency": "EUR"
      },
      {
        "id": "kt_h_eur_100k_12",
        "title": "€100.000 — 12 Ay (%0 Faiz)",
        "principal": 100000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 8333,
        "total": 100000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kt_h_eur_100k_24",
        "title": "€100.000 — 24 Ay (%0.10/ay)",
        "principal": 100000,
        "term": 24,
        "rate": 0.1,
        "rateLabel": "%0.10/ay",
        "monthly": 4222,
        "total": 101337,
        "currency": "EUR"
      },
      {
        "id": "kt_h_eur_100k_36",
        "title": "€100.000 — 36 Ay (%0.27/ay)",
        "principal": 100000,
        "term": 36,
        "rate": 0.27,
        "rateLabel": "%0.27/ay",
        "monthly": 2928,
        "total": 105413,
        "currency": "EUR"
      }
    ],
    "odemesiz6AyEUR": [
      {
        "id": "kt_h_eur_odm_80k_18",
        "title": "€80.000 — 6 Ay Ödemesiz + 18 Ay",
        "principal": 80000,
        "gracePeriod": 6,
        "term": 18,
        "totalTerm": 24,
        "rate": 0.14,
        "rateLabel": "%0.14/ay",
        "monthly": 4548,
        "total": 81863,
        "currency": "EUR",
        "desc": "6 Ay Ödemesiz + 18 Taksit"
      },
      {
        "id": "kt_h_eur_odm_80k_24",
        "title": "€80.000 — 6 Ay Ödemesiz + 24 Ay",
        "principal": 80000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 0.2,
        "rateLabel": "%0.20/ay",
        "monthly": 3467,
        "total": 83198,
        "currency": "EUR",
        "desc": "6 Ay Ödemesiz + 24 Taksit"
      },
      {
        "id": "kt_h_eur_odm_80k_36",
        "title": "€80.000 — 6 Ay Ödemesiz + 36 Ay",
        "principal": 80000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 0.28,
        "rateLabel": "%0.28/ay",
        "monthly": 2389,
        "total": 86001,
        "currency": "EUR",
        "desc": "6 Ay Ödemesiz + 36 Taksit"
      },
      {
        "id": "kt_h_eur_odm_100k_18",
        "title": "€100.000 — 6 Ay Ödemesiz + 18 Ay",
        "principal": 100000,
        "gracePeriod": 6,
        "term": 18,
        "totalTerm": 24,
        "rate": 0.22,
        "rateLabel": "%0.22/ay",
        "monthly": 5760,
        "total": 103674,
        "currency": "EUR",
        "desc": "6 Ay Ödemesiz + 18 Taksit"
      },
      {
        "id": "kt_h_eur_odm_100k_24",
        "title": "€100.000 — 6 Ay Ödemesiz + 24 Ay",
        "principal": 100000,
        "gracePeriod": 6,
        "term": 24,
        "totalTerm": 30,
        "rate": 0.27,
        "rateLabel": "%0.27/ay",
        "monthly": 4393,
        "total": 105421,
        "currency": "EUR",
        "desc": "6 Ay Ödemesiz + 24 Taksit"
      },
      {
        "id": "kt_h_eur_odm_100k_36",
        "title": "€100.000 — 6 Ay Ödemesiz + 36 Ay",
        "principal": 100000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 0.33,
        "rateLabel": "%0.33/ay",
        "monthly": 3024,
        "total": 108881,
        "currency": "EUR",
        "desc": "6 Ay Ödemesiz + 36 Taksit"
      }
    ]
  },
  "garanti": {
    "name": "Garanti BBVA",
    "badge": "12 Ay %0 Faiz & 5M Filo",
    "esitTaksitTL": [
      {
        "id": "gb_h_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 83333,
        "total": 1000000,
        "tag": "%0 FAİZ"
      },
      {
        "id": "gb_h_1000_24",
        "title": "1.000.000 TL — 24 Ay (%0.82)",
        "principal": 1000000,
        "term": 24,
        "rate": 0.82,
        "rateLabel": "%0.82",
        "monthly": 46288,
        "total": 1110913
      },
      {
        "id": "gb_h_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.46)",
        "principal": 1000000,
        "term": 36,
        "rate": 1.46,
        "rateLabel": "%1.46",
        "monthly": 36333,
        "total": 1307981
      },
      {
        "id": "gb_h_1100_12",
        "title": "1.100.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1100000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 91667,
        "total": 1100000,
        "tag": "%0 FAİZ"
      },
      {
        "id": "gb_h_1200_12",
        "title": "1.200.000 TL — 12 Ay (%0.01)",
        "principal": 1200000,
        "term": 12,
        "rate": 0.01,
        "rateLabel": "%0.01",
        "monthly": 100073,
        "total": 1200878
      },
      {
        "id": "gb_h_2000_24",
        "title": "2.000.000 TL — 24 Ay (%1.94)",
        "principal": 2000000,
        "term": 24,
        "rate": 1.94,
        "rateLabel": "%1.94",
        "monthly": 104523,
        "total": 2508552
      },
      {
        "id": "gb_h_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.37)",
        "principal": 3000000,
        "term": 36,
        "rate": 2.37,
        "rateLabel": "%2.37",
        "monthly": 126955,
        "total": 4570380
      },
      {
        "id": "gb_h_5000_36",
        "title": "5.000.000 TL — 36 Ay (%2.65)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.65,
        "rateLabel": "%2.65",
        "monthly": 224388,
        "total": 8077968,
        "tag": "FİLO ÖZEL"
      },
      {
        "id": "gb_h_6000_24",
        "title": "6.000.000 TL — 24 Ay (%2.45)",
        "principal": 6000000,
        "term": 24,
        "rate": 2.45,
        "rateLabel": "%2.45",
        "monthly": 342336,
        "total": 8216064,
        "tag": "6M FİLO"
      },
      {
        "id": "gb_h_6000_36",
        "title": "6.000.000 TL — 36 Ay (%2.68)",
        "principal": 6000000,
        "term": 36,
        "rate": 2.68,
        "rateLabel": "%2.68",
        "monthly": 269265,
        "total": 9693540,
        "tag": "6M FİLO ÖZEL"
      }
    ],
    "sifirFaiz6AyOdemesizTL": [
      {
        "id": "gb_h_zero_odm_4500_36",
        "title": "4.500.000 TL — 6 Ay Ödemesiz + 36 Ay (%0 Faiz)",
        "principal": 4500000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 125000,
        "total": 4500000,
        "desc": "6 Ay Ödemesiz + 36 Ay Sıfır Faiz"
      },
      {
        "id": "gb_h_zero_odm_5000_36",
        "title": "5.000.000 TL — 6 Ay Ödemesiz + 36 Ay (%0 Faiz)",
        "principal": 5000000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 138889,
        "total": 5000000,
        "desc": "6 Ay Ödemesiz + 36 Ay Sıfır Faiz"
      },
      {
        "id": "gb_h_zero_odm_6000_36",
        "title": "6.000.000 TL — 6 Ay Ödemesiz + 36 Ay (%0 Faiz)",
        "principal": 6000000,
        "gracePeriod": 6,
        "term": 36,
        "totalTerm": 42,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 6000000,
        "desc": "6 Ay Ödemesiz + 36 Ay Sıfır Faiz (6M Filo)"
      }
    ],
    "esitTaksitEUR": [
      {
        "id": "gb_h_eur_100k_24",
        "title": "€100.000 — 24 Ay (%0.15/ay)",
        "principal": 100000,
        "term": 24,
        "rate": 0.15,
        "rateLabel": "%0.15/ay",
        "monthly": 4251,
        "total": 102024,
        "currency": "EUR"
      },
      {
        "id": "gb_h_eur_100k_36",
        "title": "€100.000 — 36 Ay (%0.29/ay)",
        "principal": 100000,
        "term": 36,
        "rate": 0.29,
        "rateLabel": "%0.29/ay",
        "monthly": 2942,
        "total": 105912,
        "currency": "EUR"
      },
      {
        "id": "gb_h_eur_100k_48",
        "title": "€100.000 — 48 Ay (%0.38/ay)",
        "principal": 100000,
        "term": 48,
        "rate": 0.38,
        "rateLabel": "%0.38/ay",
        "monthly": 2294,
        "total": 110112,
        "currency": "EUR"
      },
      {
        "id": "gb_h_eur_100k_60",
        "title": "€100.000 — 60 Ay (%0.43/ay)",
        "principal": 100000,
        "term": 60,
        "rate": 0.43,
        "rateLabel": "%0.43/ay",
        "monthly": 1907,
        "total": 114420,
        "currency": "EUR"
      }
    ],
    "sifirFaizEUR": [
      {
        "id": "gb_h_eur_zero_90k_36",
        "title": "€90.000 — 36 Ay (%0 Faiz)",
        "principal": 90000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 2500,
        "total": 90000,
        "currency": "EUR",
        "tag": "%0 FAİZ (36 AY)"
      },
      {
        "id": "gb_h_eur_zero_100k_36",
        "title": "€100.000 — 36 Ay (%0 Faiz)",
        "principal": 100000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 2778,
        "total": 100000,
        "currency": "EUR",
        "tag": "%0 FAİZ (36 AY)"
      }
    ]
  },
  "teb_cetelem": {
    "name": "TEB & TEB Cetelem",
    "badge": "Yetkili Finansman & 5M %0 Faiz",
    "esitTaksitTL": [
      {
        "id": "teb_h_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 83339,
        "total": 1000068,
        "tag": "%0 FAİZ"
      },
      {
        "id": "teb_h_1000_24",
        "title": "1.000.000 TL — 24 Ay (%0.85 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rate": 0.85,
        "rateLabel": "%0.85",
        "monthly": 46497,
        "total": 1115928
      },
      {
        "id": "teb_h_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.48 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rate": 1.48,
        "rateLabel": "%1.48",
        "monthly": 36447,
        "total": 1312092
      },
      {
        "id": "teb_h_1500_12",
        "title": "1.500.000 TL — 12 Ay (%0.68 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rate": 0.68,
        "rateLabel": "%0.68",
        "monthly": 130877,
        "total": 1570524
      },
      {
        "id": "teb_h_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.1,
        "rateLabel": "%2.10",
        "monthly": 108252,
        "total": 2598048
      },
      {
        "id": "teb_h_2500_36",
        "title": "2.500.000 TL — 36 Ay (%2.45 Faiz)",
        "principal": 2500000,
        "term": 36,
        "rate": 2.45,
        "rateLabel": "%2.45",
        "monthly": 109780,
        "total": 3952080
      },
      {
        "id": "teb_h_6000_24",
        "title": "6.000.000 TL — 24 Ay (%2.48 Faiz)",
        "principal": 6000000,
        "term": 24,
        "rate": 2.48,
        "rateLabel": "%2.48",
        "monthly": 344200,
        "total": 8260800,
        "tag": "6M TİCARİ"
      },
      {
        "id": "teb_h_6000_36",
        "title": "6.000.000 TL — 36 Ay (%2.69 Faiz)",
        "principal": 6000000,
        "term": 36,
        "rate": 2.69,
        "rateLabel": "%2.69",
        "monthly": 270400,
        "total": 9734400,
        "tag": "6M AĞIR VASITA"
      }
    ],
    "sifirFaizTL": [
      {
        "id": "teb_h_zero_4500_24",
        "title": "4.500.000 TL — 24 Ay (%0 Faiz)",
        "principal": 4500000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 187525,
        "total": 4500000,
        "tag": "4.5M %0 FAİZ FİLO"
      },
      {
        "id": "teb_h_zero_5000_24",
        "title": "5.000.000 TL — 24 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 208333,
        "total": 5000000,
        "tag": "5M %0 FAİZ FİLO"
      },
      {
        "id": "teb_h_zero_4500_30",
        "title": "4.500.000 TL — 30 Ay (%0 Faiz)",
        "principal": 4500000,
        "term": 30,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 150000,
        "total": 4500000,
        "tag": "4.5M %0 FAİZ"
      },
      {
        "id": "teb_h_zero_5000_30",
        "title": "5.000.000 TL — 30 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 30,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 5000000,
        "tag": "5M %0 FAİZ"
      },
      {
        "id": "teb_h_zero_4500_36",
        "title": "4.500.000 TL — 36 Ay (%0 Faiz)",
        "principal": 4500000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 125000,
        "total": 4500000,
        "tag": "36 AY %0 FAİZ"
      },
      {
        "id": "teb_h_zero_5000_36",
        "title": "5.000.000 TL — 36 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 138889,
        "total": 5000000,
        "tag": "36 AY %0 FAİZ"
      },
      {
        "id": "teb_h_zero_4500_48",
        "title": "4.500.000 TL — 48 Ay (%0 Faiz)",
        "principal": 4500000,
        "term": 48,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 93750,
        "total": 4500000,
        "tag": "48 AY %0 FAİZ"
      },
      {
        "id": "teb_h_zero_5000_48",
        "title": "5.000.000 TL — 48 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 48,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 104167,
        "total": 5000000,
        "tag": "48 AY %0 FAİZ"
      },
      {
        "id": "teb_h_zero_6000_24",
        "title": "6.000.000 TL — 24 Ay (%0 Faiz)",
        "principal": 6000000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 250000,
        "total": 6000000,
        "tag": "6M %0 FAİZ FİLO"
      },
      {
        "id": "teb_h_zero_6000_36",
        "title": "6.000.000 TL — 36 Ay (%0 Faiz)",
        "principal": 6000000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 6000000,
        "tag": "6M %0 FAİZ FİLO"
      }
    ]
  },
  "bnp_paribas": {
    "name": "BNP Paribas",
    "badge": "Ağır Ticari & Euro %0 Faiz",
    "esitTaksitTL": [
      {
        "id": "bnp_h_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.15 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rate": 1.15,
        "rateLabel": "%1.15",
        "monthly": 175307,
        "total": 2103684
      },
      {
        "id": "bnp_h_2000_24",
        "title": "2.000.000 TL — 24 Ay (%1.85 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 1.85,
        "rateLabel": "%1.85",
        "monthly": 105115,
        "total": 2522760
      },
      {
        "id": "bnp_h_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.15 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rate": 2.15,
        "rateLabel": "%2.15",
        "monthly": 82927,
        "total": 2985372
      },
      {
        "id": "bnp_h_3000_12",
        "title": "3.000.000 TL — 12 Ay (%1.45 Faiz)",
        "principal": 3000000,
        "term": 12,
        "rate": 1.45,
        "rateLabel": "%1.45",
        "monthly": 275455,
        "total": 3305460
      },
      {
        "id": "bnp_h_5000_24",
        "title": "5.000.000 TL — 24 Ay (%2.45 Faiz)",
        "principal": 5000000,
        "term": 24,
        "rate": 2.45,
        "rateLabel": "%2.45",
        "monthly": 285280,
        "total": 6846720
      },
      {
        "id": "bnp_h_5000_36",
        "title": "5.000.000 TL — 36 Ay (%2.65 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.65,
        "rateLabel": "%2.65",
        "monthly": 225066,
        "total": 8102376
      },
      {
        "id": "bnp_h_6000_24",
        "title": "6.000.000 TL — 24 Ay (%2.48 Faiz)",
        "principal": 6000000,
        "term": 24,
        "rate": 2.48,
        "rateLabel": "%2.48",
        "monthly": 342336,
        "total": 8216064,
        "tag": "6M TİCARİ FİLO"
      },
      {
        "id": "bnp_h_6000_36",
        "title": "6.000.000 TL — 36 Ay (%2.68 Faiz)",
        "principal": 6000000,
        "term": 36,
        "rate": 2.68,
        "rateLabel": "%2.68",
        "monthly": 270080,
        "total": 9722880,
        "tag": "6M TİCARİ FİLO"
      }
    ],
    "sifirFaizTL": [
      {
        "id": "bnp_h_zero_5000_24",
        "title": "5.000.000 TL — 24 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 208333,
        "total": 5000000,
        "tag": "5M %0 FAİZ"
      },
      {
        "id": "bnp_h_zero_5000_30",
        "title": "5.000.000 TL — 30 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 30,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 5000000,
        "tag": "5M %0 FAİZ"
      },
      {
        "id": "bnp_h_zero_5000_36",
        "title": "5.000.000 TL — 36 Ay (%0 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 138889,
        "total": 5000000,
        "tag": "5M %0 FAİZ"
      },
      {
        "id": "bnp_h_zero_6000_24",
        "title": "6.000.000 TL — 24 Ay (%0 Faiz)",
        "principal": 6000000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 250000,
        "total": 6000000,
        "tag": "6M %0 FAİZ"
      },
      {
        "id": "bnp_h_zero_6000_36",
        "title": "6.000.000 TL — 36 Ay (%0 Faiz)",
        "principal": 6000000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 6000000,
        "tag": "6M %0 FAİZ"
      }
    ],
    "sifirFaizEUR": [
      {
        "id": "bnp_h_eur_zero_90k_24",
        "title": "€90.000 — 24 Ay (%0 Faiz)",
        "principal": 90000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 3750,
        "total": 90000,
        "currency": "EUR",
        "tag": "24 AY %0 FAİZ"
      },
      {
        "id": "bnp_h_eur_zero_90k_30",
        "title": "€90.000 — 30 Ay (%0 Faiz)",
        "principal": 90000,
        "term": 30,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 3000,
        "total": 90000,
        "currency": "EUR",
        "tag": "30 AY %0 FAİZ"
      },
      {
        "id": "bnp_h_eur_zero_90k_36",
        "title": "€90.000 — 36 Ay (%0 Faiz)",
        "principal": 90000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 2500,
        "total": 90000,
        "currency": "EUR",
        "tag": "36 AY %0 FAİZ"
      },
      {
        "id": "bnp_h_eur_zero_90k_48",
        "title": "€90.000 — 48 Ay (%0 Faiz)",
        "principal": 90000,
        "term": 48,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 1875,
        "total": 90000,
        "currency": "EUR",
        "tag": "48 AY %0 FAİZ"
      },
      {
        "id": "bnp_h_eur_zero_100k_24",
        "title": "€100.000 — 24 Ay (%0 Faiz)",
        "principal": 100000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 4167,
        "total": 100000,
        "currency": "EUR",
        "tag": "24 AY %0 FAİZ"
      },
      {
        "id": "bnp_h_eur_zero_100k_36",
        "title": "€100.000 — 36 Ay (%0 Faiz)",
        "principal": 100000,
        "term": 36,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 2778,
        "total": 100000,
        "currency": "EUR",
        "tag": "36 AY %0 FAİZ"
      },
      {
        "id": "bnp_h_eur_zero_100k_48",
        "title": "€100.000 — 48 Ay (%0 Faiz)",
        "principal": 100000,
        "term": 48,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 2083,
        "total": 100000,
        "currency": "EUR",
        "tag": "48 AY %0 FAİZ"
      }
    ]
  },
  "akbank": {
    "name": "Akbank",
    "badge": "1M %0 Faiz & 60 Ay Esnek",
    "esitTaksitTL": [
      {
        "id": "akb_h_1000_6",
        "title": "1.000.000 TL — 6 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 1000000,
        "tag": "6 AY %0 FAİZ"
      },
      {
        "id": "akb_h_1000_9",
        "title": "1.000.000 TL — 9 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 111111,
        "total": 1000000,
        "tag": "9 AY %0 FAİZ"
      },
      {
        "id": "akb_h_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 83333,
        "total": 1000000,
        "tag": "12 AY %0 FAİZ"
      },
      {
        "id": "akb_h_1000_18",
        "title": "1.000.000 TL — 18 Ay (%0.67 Faiz)",
        "principal": 1000000,
        "term": 18,
        "rate": 0.67,
        "rateLabel": "%0.67",
        "monthly": 59342,
        "total": 1068156
      },
      {
        "id": "akb_h_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.23 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rate": 1.23,
        "rateLabel": "%1.23",
        "monthly": 48724,
        "total": 1169376
      },
      {
        "id": "akb_h_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.90 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rate": 1.9,
        "rateLabel": "%1.90",
        "monthly": 39201,
        "total": 1411236
      },
      {
        "id": "akb_h_1000_48",
        "title": "1.000.000 TL — 48 Ay (%2.19 Faiz)",
        "principal": 1000000,
        "term": 48,
        "rate": 2.19,
        "rateLabel": "%2.19",
        "monthly": 34620,
        "total": 1661760
      },
      {
        "id": "akb_h_1000_60",
        "title": "1.000.000 TL — 60 Ay (%2.29 Faiz)",
        "principal": 1000000,
        "term": 60,
        "rate": 2.29,
        "rateLabel": "%2.29",
        "monthly": 31653,
        "total": 1899180
      },
      {
        "id": "akb_h_6000_24",
        "title": "6.000.000 TL — 24 Ay (%2.35 Faiz)",
        "principal": 6000000,
        "term": 24,
        "rate": 2.35,
        "rateLabel": "%2.35",
        "monthly": 334800,
        "total": 8035200,
        "tag": "6M TİCARİ FİLO"
      },
      {
        "id": "akb_h_6000_36",
        "title": "6.000.000 TL — 36 Ay (%2.55 Faiz)",
        "principal": 6000000,
        "term": 36,
        "rate": 2.55,
        "rateLabel": "%2.55",
        "monthly": 259400,
        "total": 9338400,
        "tag": "6M TİCARİ FİLO"
      },
      {
        "id": "akb_h_6000_48",
        "title": "6.000.000 TL — 48 Ay (%2.69 Faiz)",
        "principal": 6000000,
        "term": 48,
        "rate": 2.69,
        "rateLabel": "%2.69",
        "monthly": 224600,
        "total": 10780800,
        "tag": "6M UZUN VADE"
      }
    ]
  },
  "is_bankasi": {
    "name": "Türkiye İş Bankası",
    "badge": "İndirimli & 6M Filo Kredisi",
    "esitTaksitTL": [
      {
        "id": "is_h_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.95 İndirimli)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.95,
        "rateLabel": "%2.95",
        "monthly": 182400,
        "total": 4377600
      },
      {
        "id": "is_h_5000_24",
        "title": "5.000.000 TL — 24 Ay (%3.10 İndirimli)",
        "principal": 5000000,
        "term": 24,
        "rate": 3.1,
        "rateLabel": "%3.10",
        "monthly": 312000,
        "total": 7488000
      },
      {
        "id": "is_h_6000_24",
        "title": "6.000.000 TL — 24 Ay (%3.15 İndirimli)",
        "principal": 6000000,
        "term": 24,
        "rate": 3.15,
        "rateLabel": "%3.15",
        "monthly": 376800,
        "total": 9043200,
        "tag": "6M FİLO ÖZEL"
      },
      {
        "id": "is_h_6000_36",
        "title": "6.000.000 TL — 36 Ay (%3.25 İndirimli)",
        "principal": 6000000,
        "term": 36,
        "rate": 3.25,
        "rateLabel": "%3.25",
        "monthly": 301200,
        "total": 10843200,
        "tag": "6M 36 AY"
      }
    ]
  },
  "yapi_kredi": {
    "name": "Yapı Kredi",
    "badge": "6M Ağır Ticari Kredi",
    "esitTaksitTL": [
      {
        "id": "yk_h_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.38 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.38,
        "rateLabel": "%2.38",
        "monthly": 169800,
        "total": 4075200
      },
      {
        "id": "yk_h_5000_36",
        "title": "5.000.000 TL — 36 Ay (%2.48 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.48,
        "rateLabel": "%2.48",
        "monthly": 219600,
        "total": 7905600
      },
      {
        "id": "yk_h_6000_24",
        "title": "6.000.000 TL — 24 Ay (%2.42 Faiz)",
        "principal": 6000000,
        "term": 24,
        "rate": 2.42,
        "rateLabel": "%2.42",
        "monthly": 338400,
        "total": 8121600,
        "tag": "6M FİLO"
      },
      {
        "id": "yk_h_6000_36",
        "title": "6.000.000 TL — 36 Ay (%2.58 Faiz)",
        "principal": 6000000,
        "term": 36,
        "rate": 2.58,
        "rateLabel": "%2.58",
        "monthly": 261800,
        "total": 9424800,
        "tag": "6M AĞIR VASITA"
      }
    ]
  },
  "vakif_katilim": {
    "name": "Vakıf Katılım",
    "badge": "6M Kâr Payı & Katılım",
    "esitTaksitTL": [
      {
        "id": "vk_h_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.38 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.38,
        "rateLabel": "%2.38",
        "monthly": 169800,
        "total": 4075200
      },
      {
        "id": "vk_h_5000_36",
        "title": "5.000.000 TL — 36 Ay (%2.48 Kar Payı)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.48,
        "rateLabel": "%2.48",
        "monthly": 219600,
        "total": 7905600
      },
      {
        "id": "vk_h_6000_24",
        "title": "6.000.000 TL — 24 Ay (%2.42 Kar Payı)",
        "principal": 6000000,
        "term": 24,
        "rate": 2.42,
        "rateLabel": "%2.42",
        "monthly": 338400,
        "total": 8121600,
        "tag": "6M KATILIM"
      },
      {
        "id": "vk_h_6000_36",
        "title": "6.000.000 TL — 36 Ay (%2.58 Kar Payı)",
        "principal": 6000000,
        "term": 36,
        "rate": 2.58,
        "rateLabel": "%2.58",
        "monthly": 261800,
        "total": 9424800,
        "tag": "6M FİLO KATILIM"
      }
    ]
  }
};
