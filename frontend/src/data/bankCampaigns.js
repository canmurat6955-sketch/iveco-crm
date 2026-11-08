// IVECO Ekim 2026 Resmi Banka Kampanyaları & Yüksek Tutarlı Finansman Matrisi
// Kaynak: LM_EKİM 2026 KAMPANYALARI_14102026.xlsx, LM_EYLÜL KAMPANYA 2.xlsx ve HEAVY_EYLÜL KAMPANYASI.xlsx
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
    // heavy (S-Way & T-Way) - Standart 250.000 TL IVECO/Bayi katkı payı ile %0 faiz 1M - 1.5M TL arasındadır
    return [
      { id: 'all', label: 'Tüm Tutarlar', range: '1M - 6M TL', icon: '📋', min: 0, max: 6000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '1M - 1.5M TL', icon: '💎', min: 400000, max: 1500000 },
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
    "description": "800K-2M TL kamyonet, 4M TL'ye kadar kamyon & Eurocargo resmi kampanya tablosu"
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
    "badge": "%0 Faiz & 60 Ay Vade",
    "color": "#22c55e",
    "bg": "rgba(34, 197, 94, 0.15)",
    "border": "rgba(74, 222, 128, 0.4)",
    "icon": "🍀",
    "description": "800K-1.1M TL %0 faiz, 6M TL ve 60 aya varan resmi ticari finansman"
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
    "description": "800K %0.36, 900K %0.31, 1M TL %0.13-%1.22 ve 6M TL'ye kadar ticari krediler"
  },
  {
    "id": "akbank",
    "name": "Akbank",
    "shortName": "Akbank",
    "badge": "%0 Faiz Kampanyası",
    "color": "#ef4444",
    "bg": "rgba(239, 68, 68, 0.15)",
    "border": "rgba(248, 113, 113, 0.4)",
    "icon": "🦁",
    "description": "800K-900K (Daily 35), 1M TL (Daily 70 & Eurocargo) ve 1.5M TL'ye kadar (Heavy) %0 faiz"
  },
  {
    "id": "yapi_kredi",
    "name": "Yapı Kredi",
    "shortName": "Yapı Kredi",
    "badge": "6-12 Ay %0 & Düşük Faiz",
    "color": "#3b82f6",
    "bg": "rgba(59, 130, 246, 0.15)",
    "border": "rgba(96, 165, 250, 0.4)",
    "icon": "🦅",
    "description": "800K-1.2M TL %0 faiz, 900K 9 ay %0.04, 1M TL 12 ay %0.13 ve 4M TL'ye kadar ticari kredi"
  },
  {
    "id": "vakif_katilim",
    "name": "Vakıf Katılım",
    "shortName": "Vakıf Katılım",
    "badge": "%0 Kâr Payı",
    "color": "#f59e0b",
    "bg": "rgba(245, 158, 11, 0.15)",
    "border": "rgba(251, 191, 36, 0.4)",
    "icon": "⭐",
    "description": "800K-900K (Daily 35) ve 1M TL (Daily 70 & Eurocargo) sıfır kâr paylı kampanya"
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
    "description": "1.000.000 TL 12 ay %0 faiz (Daily 70 & Eurocargo)"
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
        "id": "teb_banka_35_800_8",
        "title": "800.000 TL — 8 Ay (%0.02 Faiz — TEB Banka)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0.02",
        "rate": 0.02,
        "monthly": 100090,
        "total": 800718,
        "highlight": true,
        "tag": "TEB BANKA ÖZEL"
      },
      {
        "id": "teb_banka_35_900_9",
        "title": "900.000 TL — 9 Ay (%0.02 Faiz — TEB Banka)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0.02",
        "rate": 0.02,
        "monthly": 100100,
        "total": 900898,
        "highlight": true,
        "tag": "TEB BANKA ÖZEL"
      },
      {
        "id": "tc_35_800_8",
        "title": "800.000 TL — 8 Ay (%0.14 Faiz)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0.14",
        "rate": 0.14,
        "monthly": 100663,
        "total": 805301,
        "highlight": true,
        "tag": "35C ŞASİ ÖZEL"
      },
      {
        "id": "tc_35_900_12",
        "title": "900.000 TL — 12 Ay (%0.89 Faiz)",
        "principal": 900000,
        "term": 12,
        "rateLabel": "%0.89",
        "rate": 0.89,
        "monthly": 79633,
        "total": 955600
      },
      {
        "id": "tc_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.18 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.18",
        "rate": 1.18,
        "monthly": 90196,
        "total": 1082352
      },
      {
        "id": "tc_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.26 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.26",
        "rate": 2.26,
        "monthly": 55131,
        "total": 1323152
      },
      {
        "id": "tc_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%2.03 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%2.03",
        "rate": 2.03,
        "monthly": 142987,
        "total": 1715848
      },
      {
        "id": "tc_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.74 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.74",
        "rate": 2.74,
        "monthly": 87402,
        "total": 2097641,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "tc_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.97 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.97",
        "rate": 2.97,
        "monthly": 119607,
        "total": 2870578,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "tc_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%3.15 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%3.15",
        "rate": 3.15,
        "monthly": 95859,
        "total": 3450918
      }
    ],
    "daily70": [
      {
        "id": "teb_banka_daily70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz — TEB Banka Kredisi)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ (TEB BANKA)"
      },
      {
        "id": "tc_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0.14 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.14",
        "rate": 0.14,
        "monthly": 84132,
        "total": 1009581,
        "highlight": true,
        "tag": "12 AY KAMPANYA"
      },
      {
        "id": "tc_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.67 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.67",
        "rate": 1.67,
        "monthly": 51406,
        "total": 1233751
      },
      {
        "id": "tc_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.35 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.35",
        "rate": 1.35,
        "monthly": 136814,
        "total": 1641771
      },
      {
        "id": "tc_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.36 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.36",
        "rate": 2.36,
        "monthly": 83666,
        "total": 2007973,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "tc_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.94 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.94",
        "rate": 1.94,
        "monthly": 189549,
        "total": 2274590
      },
      {
        "id": "tc_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.69 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.69",
        "rate": 2.69,
        "monthly": 115873,
        "total": 2780963,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "tc_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%3.02 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%3.02",
        "rate": 3.02,
        "monthly": 180421,
        "total": 4330109,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "tc_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.19 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.19",
        "rate": 3.19,
        "monthly": 144670,
        "total": 5208130
      },
      {
        "id": "tc_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.30 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.30",
        "rate": 3.3,
        "monthly": 196146,
        "total": 7061254
      }
    ],
    "eurocargo": [
      {
        "id": "teb_banka_eurocargo_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz — TEB Banka Kredisi)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ (TEB BANKA)"
      },
      {
        "id": "tc_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0.14 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.14",
        "rate": 0.14,
        "monthly": 84132,
        "total": 1009581,
        "highlight": true,
        "tag": "12 AY KAMPANYA"
      },
      {
        "id": "tc_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.67 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.67",
        "rate": 1.67,
        "monthly": 51406,
        "total": 1233751
      },
      {
        "id": "tc_ec_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.35 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.35",
        "rate": 1.35,
        "monthly": 136814,
        "total": 1641771
      },
      {
        "id": "tc_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.36 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.36",
        "rate": 2.36,
        "monthly": 83666,
        "total": 2007973,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "tc_ec_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.94 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.94",
        "rate": 1.94,
        "monthly": 189549,
        "total": 2274590
      },
      {
        "id": "tc_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.69 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.69",
        "rate": 2.69,
        "monthly": 115873,
        "total": 2780963,
        "highlight": true,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "tc_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%3.02 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%3.02",
        "rate": 3.02,
        "monthly": 180421,
        "total": 4330109,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "tc_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.19 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.19",
        "rate": 3.19,
        "monthly": 144670,
        "total": 5208130
      },
      {
        "id": "tc_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.30 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.30",
        "rate": 3.3,
        "monthly": 196146,
        "total": 7061254
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
        "title": "1.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 1000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.21",
        "rate": 2.21,
        "monthly": 62390,
        "total": 1497371,
        "highlight": true,
        "tag": "İLK 6 AY 0 TL TAKSİT",
        "gracePeriod": 6
      },
      {
        "id": "kt_35_grace_2000_24",
        "title": "2.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 2000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.72",
        "rate": 2.72,
        "monthly": 135609,
        "total": 3254612,
        "highlight": true,
        "tag": "2M 6 AY ÖDEMESİZ",
        "gracePeriod": 6
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
        "id": "kt_70_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 1500000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 95315,
        "total": 2287561,
        "highlight": true,
        "tag": "1.5M 6 AY ÖDEMESİZ",
        "gracePeriod": 6
      },
      {
        "id": "kt_70_grace_3000_24",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 3000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.79",
        "rate": 2.79,
        "monthly": 205687,
        "total": 4936486,
        "tag": "3M 6 AY ÖDEMESİZ",
        "gracePeriod": 6
      }
    ],
    "eurocargo": [
      {
        "id": "kt_ec_1000_12",
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
        "id": "kt_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.33 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.33",
        "rate": 1.33,
        "monthly": 49441,
        "total": 1186592
      },
      {
        "id": "kt_ec_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.23 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.23",
        "rate": 1.23,
        "monthly": 135896,
        "total": 1630749
      },
      {
        "id": "kt_ec_1500_24",
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
        "id": "kt_ec_2000_24",
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
        "id": "kt_ec_3000_24",
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
        "id": "kt_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.74 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.74",
        "rate": 2.74,
        "monthly": 135773,
        "total": 4887823
      },
      {
        "id": "kt_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.86 Kar Payı)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.86",
        "rate": 2.86,
        "monthly": 184522,
        "total": 6642779
      },
      {
        "id": "kt_ec_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 1500000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 95315,
        "total": 2287561,
        "highlight": true,
        "tag": "1.5M 6 AY ÖDEMESİZ",
        "gracePeriod": 6
      },
      {
        "id": "kt_ec_grace_3000_24",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 3000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.79",
        "rate": 2.79,
        "monthly": 205687,
        "total": 4936486,
        "tag": "3M 6 AY ÖDEMESİZ",
        "gracePeriod": 6
      }
    ]
  },
  "garanti": {
    "daily35": [
      {
        "id": "gar_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "35C ŞASİ %0 FAİZ"
      },
      {
        "id": "gar_35_900_9",
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
        "id": "gar_35_1000_9",
        "title": "1.000.000 TL — 9 Ay (%0.37 Faiz)",
        "principal": 1000000,
        "term": 9,
        "rateLabel": "%0.37",
        "rate": 0.37,
        "monthly": 113304,
        "total": 1019736
      },
      {
        "id": "gar_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.07 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.07",
        "rate": 1.07,
        "monthly": 89521,
        "total": 1074252,
        "highlight": true,
        "tag": "AVANTAJLI ORAN"
      },
      {
        "id": "gar_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.14 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.14",
        "rate": 2.14,
        "monthly": 54335,
        "total": 1304040
      },
      {
        "id": "gar_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.93 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.93",
        "rate": 1.93,
        "monthly": 142078,
        "total": 1704936
      },
      {
        "id": "gar_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.62 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.62",
        "rate": 2.62,
        "monthly": 86215,
        "total": 2069160
      },
      {
        "id": "gar_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.86 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.86",
        "rate": 2.86,
        "monthly": 118098,
        "total": 2834352
      },
      {
        "id": "gar_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.99 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.99",
        "rate": 2.99,
        "monthly": 93470,
        "total": 3364920
      },
      {
        "id": "gar_35_2000_48",
        "title": "2.000.000 TL — 48 Ay (%3.04 Faiz)",
        "principal": 2000000,
        "term": 48,
        "rateLabel": "%3.04",
        "rate": 3.04,
        "monthly": 81984,
        "total": 3935232
      }
    ],
    "daily70": [
      {
        "id": "gar_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 999996,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "gar_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.21 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.21",
        "rate": 1.21,
        "monthly": 48617,
        "total": 1166808
      },
      {
        "id": "gar_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.25 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.25",
        "rate": 1.25,
        "monthly": 135879,
        "total": 1630548
      },
      {
        "id": "gar_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.90 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.90",
        "rate": 1.9,
        "monthly": 79253,
        "total": 1902072
      },
      {
        "id": "gar_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.85 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.85",
        "rate": 1.85,
        "monthly": 188436,
        "total": 2261232
      },
      {
        "id": "gar_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.23 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.23",
        "rate": 2.23,
        "monthly": 109895,
        "total": 2637480
      },
      {
        "id": "gar_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.56 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.56",
        "rate": 2.56,
        "monthly": 171183,
        "total": 4108392
      },
      {
        "id": "gar_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.73 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.73",
        "rate": 2.73,
        "monthly": 134719,
        "total": 4849884
      },
      {
        "id": "gar_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.72 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.72",
        "rate": 2.72,
        "monthly": 232474,
        "total": 5579376
      },
      {
        "id": "gar_70_4000_36",
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
        "id": "gar_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 999996,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "gar_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.21 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.21",
        "rate": 1.21,
        "monthly": 48617,
        "total": 1166808
      },
      {
        "id": "gar_ec_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.25 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.25",
        "rate": 1.25,
        "monthly": 135879,
        "total": 1630548
      },
      {
        "id": "gar_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.90 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.90",
        "rate": 1.9,
        "monthly": 79253,
        "total": 1902072
      },
      {
        "id": "gar_ec_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.85 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.85",
        "rate": 1.85,
        "monthly": 188436,
        "total": 2261232
      },
      {
        "id": "gar_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.23 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.23",
        "rate": 2.23,
        "monthly": 109895,
        "total": 2637480
      },
      {
        "id": "gar_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.56 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.56",
        "rate": 2.56,
        "monthly": 171183,
        "total": 4108392
      },
      {
        "id": "gar_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.73 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.73",
        "rate": 2.73,
        "monthly": 134719,
        "total": 4849884
      },
      {
        "id": "gar_ec_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.72 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.72",
        "rate": 2.72,
        "monthly": 232474,
        "total": 5579376
      },
      {
        "id": "gar_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 182941,
        "total": 6585876
      }
    ]
  },
  "is_bankasi": {
    "daily35": [
      {
        "id": "is_35_800_8",
        "title": "800.000 TL — 8 Ay (%0.36 Faiz — 35C Şasi)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0.36",
        "rate": 0.36,
        "monthly": 101713,
        "total": 813706,
        "highlight": true,
        "tag": "35C ŞASİ ÖZEL"
      },
      {
        "id": "is_35_900_9",
        "title": "900.000 TL — 9 Ay (%0.31 Faiz)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0.31",
        "rate": 0.31,
        "monthly": 101650,
        "total": 914854,
        "highlight": true,
        "tag": "DÜŞÜK FAİZ"
      },
      {
        "id": "is_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.22 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.22",
        "rate": 1.22,
        "monthly": 90416,
        "total": 1084993,
        "highlight": true,
        "tag": "STANDART KAMPANYA"
      },
      {
        "id": "is_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.12 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.12",
        "rate": 2.12,
        "monthly": 54228,
        "total": 1301471
      },
      {
        "id": "is_35_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.51 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.51",
        "rate": 2.51,
        "monthly": 43333,
        "total": 1559992
      },
      {
        "id": "is_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%2.46 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%2.46",
        "rate": 2.46,
        "monthly": 147004,
        "total": 1764046
      },
      {
        "id": "is_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.81 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.81",
        "rate": 2.81,
        "monthly": 88129,
        "total": 2115108
      },
      {
        "id": "is_35_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.53 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.53",
        "rate": 2.53,
        "monthly": 196839,
        "total": 2362067
      },
      {
        "id": "is_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.85 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 117999,
        "total": 2831987
      },
      {
        "id": "is_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%3.04 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%3.04",
        "rate": 3.04,
        "monthly": 94251,
        "total": 3393029
      }
    ],
    "daily70": [
      {
        "id": "is_70_1000_12_cc",
        "title": "1.000.000 TL — 12 Ay (%0.13 Faiz — 70C Şasi)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.13",
        "rate": 0.13,
        "monthly": 84052,
        "total": 1008620,
        "highlight": true,
        "tag": "70C ŞASİ ÖZEL"
      },
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
        "tag": "DÜŞÜK FAİZ"
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
        "total": 2748696
      },
      {
        "id": "is_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.92 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.92",
        "rate": 2.92,
        "monthly": 178304,
        "total": 4279296
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
        "id": "is_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%3.08 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%3.08",
        "rate": 3.08,
        "monthly": 242075,
        "total": 5809800
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
      },
      {
        "id": "is_70_4000_48",
        "title": "4.000.000 TL — 48 Ay (%3.27 Faiz)",
        "principal": 4000000,
        "term": 48,
        "rateLabel": "%3.27",
        "rate": 3.27,
        "monthly": 171112,
        "total": 8213376
      }
    ],
    "eurocargo": [
      {
        "id": "is_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0.22 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.22",
        "rate": 0.22,
        "monthly": 84578,
        "total": 1014936,
        "highlight": true,
        "tag": "DÜŞÜK FAİZ"
      },
      {
        "id": "is_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.56 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.56",
        "rate": 1.56,
        "monthly": 50752,
        "total": 1218048
      },
      {
        "id": "is_ec_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.06 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.06",
        "rate": 2.06,
        "monthly": 191017,
        "total": 2292204
      },
      {
        "id": "is_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.59 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 114529,
        "total": 2748696
      },
      {
        "id": "is_ec_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 91491,
        "total": 3293676
      },
      {
        "id": "is_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.92 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.92",
        "rate": 2.92,
        "monthly": 178304,
        "total": 4279296
      },
      {
        "id": "is_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.09 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.09",
        "rate": 3.09,
        "monthly": 142404,
        "total": 5126544
      },
      {
        "id": "is_ec_4000_24",
        "title": "4.000.000 TL — 24 Ay (%3.08 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%3.08",
        "rate": 3.08,
        "monthly": 242075,
        "total": 5809800
      },
      {
        "id": "is_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.20 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.20",
        "rate": 3.2,
        "monthly": 193306,
        "total": 6959016
      },
      {
        "id": "is_ec_4000_48",
        "title": "4.000.000 TL — 48 Ay (%3.27 Faiz)",
        "principal": 4000000,
        "term": 48,
        "rateLabel": "%3.27",
        "rate": 3.27,
        "monthly": 171112,
        "total": 8213376
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
        "id": "ak_35_800_12",
        "title": "800.000 TL — 12 Ay (%1.03 Faiz)",
        "principal": 800000,
        "term": 12,
        "rateLabel": "%1.03",
        "rate": 1.03,
        "monthly": 71446,
        "total": 857347
      },
      {
        "id": "ak_35_800_24",
        "title": "800.000 TL — 24 Ay (%2.04 Faiz)",
        "principal": 800000,
        "term": 24,
        "rateLabel": "%2.04",
        "rate": 2.04,
        "monthly": 42980,
        "total": 1031527
      },
      {
        "id": "ak_35_800_36",
        "title": "800.000 TL — 36 Ay (%2.42 Faiz)",
        "principal": 800000,
        "term": 36,
        "rateLabel": "%2.42",
        "rate": 2.42,
        "monthly": 34177,
        "total": 1230379
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
        "total": 947363
      },
      {
        "id": "ak_35_900_18",
        "title": "900.000 TL — 18 Ay (%1.57 Faiz)",
        "principal": 900000,
        "term": 18,
        "rateLabel": "%1.57",
        "rate": 1.57,
        "monthly": 58193,
        "total": 1047467
      },
      {
        "id": "ak_35_900_24",
        "title": "900.000 TL — 24 Ay (%1.89 Faiz)",
        "principal": 900000,
        "term": 24,
        "rateLabel": "%1.89",
        "rate": 1.89,
        "monthly": 47500,
        "total": 1140012
      },
      {
        "id": "ak_35_900_36",
        "title": "900.000 TL — 36 Ay (%2.32 Faiz)",
        "principal": 900000,
        "term": 36,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 37829,
        "total": 1361838
      },
      {
        "id": "ak_35_900_48",
        "title": "900.000 TL — 48 Ay (%2.53 Faiz)",
        "principal": 900000,
        "term": 48,
        "rateLabel": "%2.53",
        "rate": 2.53,
        "monthly": 33396,
        "total": 1602997
      }
    ],
    "daily70": [
      {
        "id": "ak_70_1000_8",
        "title": "1.000.000 TL — 8 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 125000,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "ak_70_1000_9",
        "title": "1.000.000 TL — 9 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 111111,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "ak_70_1000_10",
        "title": "1.000.000 TL — 10 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 10,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
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
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "ak_70_1000_18",
        "title": "1.000.000 TL — 18 Ay (%1.03 Faiz)",
        "principal": 1000000,
        "term": 18,
        "rateLabel": "%1.03",
        "rate": 1.03,
        "monthly": 61437,
        "total": 1105872
      },
      {
        "id": "ak_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.47 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.47",
        "rate": 1.47,
        "monthly": 50177,
        "total": 1204241
      },
      {
        "id": "ak_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.01 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.01",
        "rate": 2.01,
        "monthly": 39932,
        "total": 1437568
      },
      {
        "id": "ak_70_1000_48",
        "title": "1.000.000 TL — 48 Ay (%2.28 Faiz)",
        "principal": 1000000,
        "term": 48,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 35270,
        "total": 1692959
      }
    ],
    "eurocargo": [
      {
        "id": "ak_ec_1000_8",
        "title": "1.000.000 TL — 8 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 125000,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "ak_ec_1000_9",
        "title": "1.000.000 TL — 9 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 111111,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "ak_ec_1000_10",
        "title": "1.000.000 TL — 10 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 10,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 1000000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "ak_ec_1000_12",
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
        "id": "ak_ec_1000_18",
        "title": "1.000.000 TL — 18 Ay (%1.03 Faiz)",
        "principal": 1000000,
        "term": 18,
        "rateLabel": "%1.03",
        "rate": 1.03,
        "monthly": 61437,
        "total": 1105872
      },
      {
        "id": "ak_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.47 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.47",
        "rate": 1.47,
        "monthly": 50177,
        "total": 1204241
      },
      {
        "id": "ak_ec_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.01 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.01",
        "rate": 2.01,
        "monthly": 39932,
        "total": 1437568
      },
      {
        "id": "ak_ec_1000_48",
        "title": "1.000.000 TL — 48 Ay (%2.28 Faiz)",
        "principal": 1000000,
        "term": 48,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 35270,
        "total": 1692959
      }
    ]
  },
  "yapi_kredi": {
    "daily35": [
      {
        "id": "yk_35_800_9",
        "title": "800.000 TL — 9 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 88889,
        "total": 800000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "yk_35_900_6",
        "title": "900.000 TL — 6 Ay (%0 Faiz)",
        "principal": 900000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 150000,
        "total": 900000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "yk_35_900_9",
        "title": "900.000 TL — 9 Ay (%0.04 Faiz)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0.04",
        "rate": 0.04,
        "monthly": 100231,
        "total": 902080,
        "highlight": true,
        "tag": "%0.04 KAMPANYA"
      },
      {
        "id": "yk_35_1000_6",
        "title": "1.000.000 TL — 6 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 166667,
        "total": 1000000,
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
        "total": 1076655
      },
      {
        "id": "yk_35_1200_6",
        "title": "1.200.000 TL — 6 Ay (%0 Faiz)",
        "principal": 1200000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 200000,
        "total": 1200000,
        "highlight": true,
        "tag": "SIFIR FAİZ"
      },
      {
        "id": "yk_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.96 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 142308,
        "total": 1707702
      },
      {
        "id": "yk_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.58 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.58",
        "rate": 2.58,
        "monthly": 85828,
        "total": 2059865
      },
      {
        "id": "yk_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.82 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.82",
        "rate": 2.82,
        "monthly": 117546,
        "total": 2821103
      },
      {
        "id": "yk_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%3.00 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%3.00",
        "rate": 3,
        "monthly": 93684,
        "total": 3372621
      }
    ],
    "daily70": [
      {
        "id": "yk_70_1000_12_ozel",
        "title": "1.000.000 TL — 12 Ay (%0.13 Faiz — 70C Kampanyası)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.13",
        "rate": 0.13,
        "monthly": 84052,
        "total": 1008624,
        "highlight": true,
        "tag": "70C ÖZEL ORAN"
      },
      {
        "id": "yk_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.10",
        "rate": 2.1,
        "monthly": 54126,
        "total": 1299023
      },
      {
        "id": "yk_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.96 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 142308,
        "total": 1707702
      },
      {
        "id": "yk_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.58 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.58",
        "rate": 2.58,
        "monthly": 85828,
        "total": 2059865
      },
      {
        "id": "yk_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.38 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.38",
        "rate": 2.38,
        "monthly": 194900,
        "total": 2338806
      },
      {
        "id": "yk_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.82 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.82",
        "rate": 2.82,
        "monthly": 117546,
        "total": 2821103
      },
      {
        "id": "yk_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%3.05 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%3.05",
        "rate": 3.05,
        "monthly": 180968,
        "total": 4343229
      },
      {
        "id": "yk_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.17 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.17",
        "rate": 3.17,
        "monthly": 144207,
        "total": 5191448
      },
      {
        "id": "yk_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%3.16 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%3.16",
        "rate": 3.16,
        "monthly": 244381,
        "total": 5865140
      },
      {
        "id": "yk_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.25 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.25",
        "rate": 3.25,
        "monthly": 194753,
        "total": 7011113
      }
    ],
    "eurocargo": [
      {
        "id": "yk_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.10 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.10",
        "rate": 1.1,
        "monthly": 89721,
        "total": 1076655
      },
      {
        "id": "yk_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.10",
        "rate": 2.1,
        "monthly": 54126,
        "total": 1299023
      },
      {
        "id": "yk_ec_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.96 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 142308,
        "total": 1707702
      },
      {
        "id": "yk_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.58 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.58",
        "rate": 2.58,
        "monthly": 85828,
        "total": 2059865
      },
      {
        "id": "yk_ec_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.38 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.38",
        "rate": 2.38,
        "monthly": 194900,
        "total": 2338806
      },
      {
        "id": "yk_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.82 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.82",
        "rate": 2.82,
        "monthly": 117546,
        "total": 2821103
      },
      {
        "id": "yk_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%3.05 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%3.05",
        "rate": 3.05,
        "monthly": 180968,
        "total": 4343229
      },
      {
        "id": "yk_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.17 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.17",
        "rate": 3.17,
        "monthly": 144207,
        "total": 5191448
      },
      {
        "id": "yk_ec_4000_24",
        "title": "4.000.000 TL — 24 Ay (%3.16 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%3.16",
        "rate": 3.16,
        "monthly": 244381,
        "total": 5865140
      },
      {
        "id": "yk_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.25 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.25",
        "rate": 3.25,
        "monthly": 194753,
        "total": 7011113
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
      }
    ],
    "eurocargo": [
      {
        "id": "vk_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 83333,
        "total": 1000000,
        "highlight": true,
        "tag": "12 AY SIFIR KAR PAYI"
      }
    ]
  },
  "bnp_paribas": {
    "daily35": [],
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
        ...(heavyBank.sifirFaiz6AyOdemesizTL || []),
        ...(heavyBank.odemesiz6AyTL || []),
        ...(heavyBank.esitTaksitTL || [])
      ];
    }
    // Heavy tablosu olmayan bankada Eurocargo / Daily 70 rakamlarına düşülmez (kaynaksız veri gösterilmez)
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
    "id": "kuveyt_turk_h_eur_esit_80000_12",
    "title": "€80.000 — 12 Ay (%0 Kar Payı)",
    "principal": 80000,
    "term": 12,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 6667,
    "total": 80000,
    "currency": "EUR",
    "tag": "%0 FAİZ",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_80000_24",
    "title": "€80.000 — 24 Ay (%0 Kar Payı)",
    "principal": 80000,
    "term": 24,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 3333,
    "total": 80000,
    "currency": "EUR",
    "tag": "%0 FAİZ",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_100000_12",
    "title": "€100.000 — 12 Ay (%0 Kar Payı)",
    "principal": 100000,
    "term": 12,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 8333,
    "total": 100000,
    "currency": "EUR",
    "tag": "%0 FAİZ",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_120000_9",
    "title": "€120.000 — 9 Ay (%0 Kar Payı)",
    "principal": 120000,
    "term": 9,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 13333,
    "total": 120000,
    "currency": "EUR",
    "tag": "%0 FAİZ",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_100000_24",
    "title": "€100.000 — 24 Ay (%0.10 Kar Payı)",
    "principal": 100000,
    "term": 24,
    "rate": 0.1,
    "rateLabel": "%0.10",
    "monthly": 4222,
    "total": 101337,
    "currency": "EUR",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_100000_36",
    "title": "€100.000 — 36 Ay (%0.27 Kar Payı)",
    "principal": 100000,
    "term": 36,
    "rate": 0.27,
    "rateLabel": "%0.27",
    "monthly": 2928,
    "total": 105413,
    "currency": "EUR",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_120000_24",
    "title": "€120.000 — 24 Ay (%0.17 Kar Payı)",
    "principal": 120000,
    "term": 24,
    "rate": 0.17,
    "rateLabel": "%0.17",
    "monthly": 5114,
    "total": 122736,
    "currency": "EUR",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_130000_36",
    "title": "€130.000 — 36 Ay (%0.33 Kar Payı)",
    "principal": 130000,
    "term": 36,
    "rate": 0.33,
    "rateLabel": "%0.33",
    "monthly": 3851,
    "total": 138631,
    "currency": "EUR",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_odemesiz_100000_24_g6",
    "title": "€100.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.27 Kar Payı)",
    "principal": 100000,
    "term": 24,
    "rate": 0.27,
    "rateLabel": "%0.27",
    "monthly": 4393,
    "total": 105421,
    "currency": "EUR",
    "gracePeriodMonths": 6,
    "gracePeriod": 6,
    "totalTerm": 30,
    "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
    "tag": "6 AY ÖDEMESİZ",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_odemesiz_120000_36_g6",
    "title": "€120.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.37 Kar Payı)",
    "principal": 120000,
    "term": 36,
    "rate": 0.37,
    "rateLabel": "%0.37",
    "monthly": 3666,
    "total": 131992,
    "currency": "EUR",
    "gracePeriodMonths": 6,
    "gracePeriod": 6,
    "totalTerm": 42,
    "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
    "tag": "6 AY ÖDEMESİZ",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "garanti_h_eur_esit_100000_24",
    "title": "€100.000 — 24 Ay (%0.15 Faiz)",
    "principal": 100000,
    "term": 24,
    "rate": 0.15,
    "rateLabel": "%0.15",
    "monthly": 4251,
    "total": 102024,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "garanti_h_eur_esit_100000_36",
    "title": "€100.000 — 36 Ay (%0.30 Faiz)",
    "principal": 100000,
    "term": 36,
    "rate": 0.3,
    "rateLabel": "%0.30",
    "monthly": 2942,
    "total": 105912,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "garanti_h_eur_esit_100000_48",
    "title": "€100.000 — 48 Ay (%0.38 Faiz)",
    "principal": 100000,
    "term": 48,
    "rate": 0.38,
    "rateLabel": "%0.38",
    "monthly": 2294,
    "total": 110112,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "garanti_h_eur_esit_100000_60",
    "title": "€100.000 — 60 Ay (%0.43 Faiz)",
    "principal": 100000,
    "term": 60,
    "rate": 0.43,
    "rateLabel": "%0.43",
    "monthly": 1907,
    "total": 114420,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "bnp_paribas_h_eur_esit_100000_12",
    "title": "€100.000 — 12 Ay",
    "principal": 100000,
    "term": 12,
    "rate": null,
    "rateLabel": "Sabit Taksit",
    "monthly": 8200,
    "total": 98400,
    "currency": "EUR",
    "bankId": "bnp_paribas"
  },
  {
    "id": "bnp_paribas_h_eur_esit_100000_24",
    "title": "€100.000 — 24 Ay",
    "principal": 100000,
    "term": 24,
    "rate": null,
    "rateLabel": "Sabit Taksit",
    "monthly": 4253,
    "total": 102072,
    "currency": "EUR",
    "bankId": "bnp_paribas"
  },
  {
    "id": "bnp_paribas_h_eur_esit_100000_36",
    "title": "€100.000 — 36 Ay",
    "principal": 100000,
    "term": 36,
    "rate": null,
    "rateLabel": "Sabit Taksit",
    "monthly": 2950,
    "total": 106200,
    "currency": "EUR",
    "bankId": "bnp_paribas"
  },
  {
    "id": "bnp_paribas_h_eur_esit_100000_48",
    "title": "€100.000 — 48 Ay",
    "principal": 100000,
    "term": 48,
    "rate": null,
    "rateLabel": "Sabit Taksit",
    "monthly": 2306,
    "total": 110688,
    "currency": "EUR",
    "bankId": "bnp_paribas"
  },
  {
    "id": "bnp_paribas_h_eur_esit_100000_60",
    "title": "€100.000 — 60 Ay",
    "principal": 100000,
    "term": 60,
    "rate": null,
    "rateLabel": "Sabit Taksit",
    "monthly": 1927,
    "total": 115620,
    "currency": "EUR",
    "bankId": "bnp_paribas"
  }
];

export const EUR_PARTNER_BANKS = [
  {
    "id": "kuveyt_turk",
    "name": "Kuveyt Türk Katılım",
    "shortName": "Kuveyt Türk",
    "badge": "24 Aya Kadar %0 Kâr Payı",
    "icon": "🕌",
    "color": "#10b981",
    "bg": "rgba(16, 185, 129, 0.15)",
    "border": "rgba(52, 211, 153, 0.4)",
    "desc": "€80.000 - €130.000 arası 9-24 ay %0 kâr payı, 48 aya kadar eşit taksit ve 6 ay ödemesiz Euro finansman"
  },
  {
    "id": "garanti",
    "name": "Garanti BBVA",
    "shortName": "Garanti BBVA",
    "badge": "%0.15'ten Başlayan Euro Kredisi",
    "icon": "🟢",
    "color": "#22c55e",
    "bg": "rgba(34, 197, 94, 0.15)",
    "border": "rgba(74, 222, 128, 0.4)",
    "desc": "€100.000 için 24-60 ay arası %0.15 - %0.43 indirimli Euro finansman"
  },
  {
    "id": "bnp_paribas",
    "name": "BNP Paribas",
    "shortName": "BNP Paribas",
    "badge": "60 Aya Kadar Sabit Euro Taksit",
    "icon": "🏛️",
    "color": "#38bdf8",
    "bg": "rgba(56, 189, 248, 0.15)",
    "border": "rgba(125, 211, 252, 0.4)",
    "desc": "€100.000 için 12-60 ay arası sabit Euro taksitli ticari finansman"
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
    "badge": "TL & Euro • 6 Ay Ödemesiz • %0 Kâr Payı",
    "esitTaksitTL": [
      {
        "id": "kuveyt_turk_h_try_esit_2500000_12",
        "title": "2.500.000 TL — 12 Ay (%1.88 Kar Payı)",
        "principal": 2500000,
        "term": 12,
        "rate": 1.88,
        "rateLabel": "%1.88",
        "monthly": 236428,
        "total": 2837137,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_2500000_24",
        "title": "2.500.000 TL — 24 Ay (%2.37 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rate": 2.37,
        "rateLabel": "%2.37",
        "monthly": 140155,
        "total": 3363726,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.53 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.53,
        "rateLabel": "%2.53",
        "monthly": 171365,
        "total": 4112757,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%2.72 Kar Payı)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.72,
        "rateLabel": "%2.72",
        "monthly": 233575,
        "total": 5605793,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%2.78 Kar Payı)",
        "principal": 4000000,
        "term": 36,
        "rate": 2.78,
        "rateLabel": "%2.78",
        "monthly": 182190,
        "total": 6558857,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%2.87 Kar Payı)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.87,
        "rateLabel": "%2.87",
        "monthly": 231018,
        "total": 8316633,
        "currency": "TRY"
      }
    ],
    "esitTaksitEUR": [
      {
        "id": "kuveyt_turk_h_eur_esit_80000_9",
        "title": "€80.000 — 9 Ay (%0 Kar Payı)",
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
        "id": "kuveyt_turk_h_eur_esit_80000_12",
        "title": "€80.000 — 12 Ay (%0 Kar Payı)",
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
        "id": "kuveyt_turk_h_eur_esit_80000_18",
        "title": "€80.000 — 18 Ay (%0 Kar Payı)",
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
        "id": "kuveyt_turk_h_eur_esit_80000_24",
        "title": "€80.000 — 24 Ay (%0 Kar Payı)",
        "principal": 80000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 3333,
        "total": 80000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_80000_36",
        "title": "€80.000 — 36 Ay (%0.20 Kar Payı)",
        "principal": 80000,
        "term": 36,
        "rate": 0.2,
        "rateLabel": "%0.20",
        "monthly": 2311,
        "total": 83194,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_80000_48",
        "title": "€80.000 — 48 Ay (%0.28 Kar Payı)",
        "principal": 80000,
        "term": 48,
        "rate": 0.28,
        "rateLabel": "%0.28",
        "monthly": 1791,
        "total": 85985,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_90000_9",
        "title": "€90.000 — 9 Ay (%0 Kar Payı)",
        "principal": 90000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 10000,
        "total": 90000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_90000_12",
        "title": "€90.000 — 12 Ay (%0 Kar Payı)",
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
        "id": "kuveyt_turk_h_eur_esit_90000_18",
        "title": "€90.000 — 18 Ay (%0.06 Kar Payı)",
        "principal": 90000,
        "term": 18,
        "rate": 0.06,
        "rateLabel": "%0.06",
        "monthly": 5030,
        "total": 90547,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_90000_24",
        "title": "€90.000 — 24 Ay (%0.06 Kar Payı)",
        "principal": 90000,
        "term": 24,
        "rate": 0.06,
        "rateLabel": "%0.06",
        "monthly": 3780,
        "total": 90721,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_90000_36",
        "title": "€90.000 — 36 Ay (%0.24 Kar Payı)",
        "principal": 90000,
        "term": 36,
        "rate": 0.24,
        "rateLabel": "%0.24",
        "monthly": 2620,
        "total": 94323,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_90000_48",
        "title": "€90.000 — 48 Ay (%0.31 Kar Payı)",
        "principal": 90000,
        "term": 48,
        "rate": 0.31,
        "rateLabel": "%0.31",
        "monthly": 2031,
        "total": 97472,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_100000_9",
        "title": "€100.000 — 9 Ay (%0 Kar Payı)",
        "principal": 100000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 11111,
        "total": 100000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_100000_12",
        "title": "€100.000 — 12 Ay (%0 Kar Payı)",
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
        "id": "kuveyt_turk_h_eur_esit_100000_18",
        "title": "€100.000 — 18 Ay (%0.12 Kar Payı)",
        "principal": 100000,
        "term": 18,
        "rate": 0.12,
        "rateLabel": "%0.12",
        "monthly": 5623,
        "total": 101219,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_100000_24",
        "title": "€100.000 — 24 Ay (%0.10 Kar Payı)",
        "principal": 100000,
        "term": 24,
        "rate": 0.1,
        "rateLabel": "%0.10",
        "monthly": 4222,
        "total": 101337,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_100000_36",
        "title": "€100.000 — 36 Ay (%0.27 Kar Payı)",
        "principal": 100000,
        "term": 36,
        "rate": 0.27,
        "rateLabel": "%0.27",
        "monthly": 2928,
        "total": 105413,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_100000_48",
        "title": "€100.000 — 48 Ay (%0.33 Kar Payı)",
        "principal": 100000,
        "term": 48,
        "rate": 0.33,
        "rateLabel": "%0.33",
        "monthly": 2268,
        "total": 108853,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_9",
        "title": "€110.000 — 9 Ay (%0 Kar Payı)",
        "principal": 110000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 12222,
        "total": 110000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_12",
        "title": "€110.000 — 12 Ay (%0 Kar Payı)",
        "principal": 110000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 9167,
        "total": 110000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_18",
        "title": "€110.000 — 18 Ay (%0.17 Kar Payı)",
        "principal": 110000,
        "term": 18,
        "rate": 0.17,
        "rateLabel": "%0.17",
        "monthly": 6217,
        "total": 111902,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_24",
        "title": "€110.000 — 24 Ay (%0.14 Kar Payı)",
        "principal": 110000,
        "term": 24,
        "rate": 0.14,
        "rateLabel": "%0.14",
        "monthly": 4669,
        "total": 112062,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_36",
        "title": "€110.000 — 36 Ay (%0.29 Kar Payı)",
        "principal": 110000,
        "term": 36,
        "rate": 0.29,
        "rateLabel": "%0.29",
        "monthly": 3233,
        "total": 116403,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_48",
        "title": "€110.000 — 48 Ay (%0.35 Kar Payı)",
        "principal": 110000,
        "term": 48,
        "rate": 0.35,
        "rateLabel": "%0.35",
        "monthly": 2507,
        "total": 120345,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_9",
        "title": "€120.000 — 9 Ay (%0 Kar Payı)",
        "principal": 120000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 13333,
        "total": 120000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_12",
        "title": "€120.000 — 12 Ay (%0.01 Kar Payı)",
        "principal": 120000,
        "term": 12,
        "rate": 0.01,
        "rateLabel": "%0.01",
        "monthly": 10007,
        "total": 120083,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_18",
        "title": "€120.000 — 18 Ay (%0.21 Kar Payı)",
        "principal": 120000,
        "term": 18,
        "rate": 0.21,
        "rateLabel": "%0.21",
        "monthly": 6809,
        "total": 122566,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_24",
        "title": "€120.000 — 24 Ay (%0.17 Kar Payı)",
        "principal": 120000,
        "term": 24,
        "rate": 0.17,
        "rateLabel": "%0.17",
        "monthly": 5114,
        "total": 122736,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_36",
        "title": "€120.000 — 36 Ay (%0.31 Kar Payı)",
        "principal": 120000,
        "term": 36,
        "rate": 0.31,
        "rateLabel": "%0.31",
        "monthly": 3541,
        "total": 127475,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_48",
        "title": "€120.000 — 48 Ay (%0.37 Kar Payı)",
        "principal": 120000,
        "term": 48,
        "rate": 0.37,
        "rateLabel": "%0.37",
        "monthly": 2749,
        "total": 131949,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_9",
        "title": "€130.000 — 9 Ay (%0 Kar Payı)",
        "principal": 130000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 14444,
        "total": 130000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_12",
        "title": "€130.000 — 12 Ay (%0.06 Kar Payı)",
        "principal": 130000,
        "term": 12,
        "rate": 0.06,
        "rateLabel": "%0.06",
        "monthly": 10878,
        "total": 130541,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_18",
        "title": "€130.000 — 18 Ay (%0.24 Kar Payı)",
        "principal": 130000,
        "term": 18,
        "rate": 0.24,
        "rateLabel": "%0.24",
        "monthly": 7399,
        "total": 133179,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_24",
        "title": "€130.000 — 24 Ay (%0.20 Kar Payı)",
        "principal": 130000,
        "term": 24,
        "rate": 0.2,
        "rateLabel": "%0.20",
        "monthly": 5562,
        "total": 133489,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_36",
        "title": "€130.000 — 36 Ay (%0.33 Kar Payı)",
        "principal": 130000,
        "term": 36,
        "rate": 0.33,
        "rateLabel": "%0.33",
        "monthly": 3851,
        "total": 138631,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_48",
        "title": "€130.000 — 48 Ay (%0.38 Kar Payı)",
        "principal": 130000,
        "term": 48,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 2986,
        "total": 143306,
        "currency": "EUR"
      }
    ],
    "odemesiz6AyTL": [
      {
        "id": "kuveyt_turk_h_try_odemesiz_3000000_24_g6",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.69 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.69,
        "rateLabel": "%2.69",
        "monthly": 202443,
        "total": 4858623,
        "currency": "TRY",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_try_odemesiz_5000000_36_g6",
        "title": "5.000.000 TL — 6 Ay Ödemesiz + 36 Eşit Taksit (%2.98 Kar Payı)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.98,
        "rateLabel": "%2.98",
        "monthly": 273912,
        "total": 9860844,
        "currency": "TRY",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      }
    ],
    "odemesiz6AyEUR": [
      {
        "id": "kuveyt_turk_h_eur_odemesiz_80000_18_g6",
        "title": "€80.000 — 6 Ay Ödemesiz + 18 Eşit Taksit (%0.14 Kar Payı)",
        "principal": 80000,
        "term": 18,
        "rate": 0.14,
        "rateLabel": "%0.14",
        "monthly": 4548,
        "total": 81863,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 24,
        "desc": "İlk 6 ay ödeme yok, ardından 18 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_80000_24_g6",
        "title": "€80.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.20 Kar Payı)",
        "principal": 80000,
        "term": 24,
        "rate": 0.2,
        "rateLabel": "%0.20",
        "monthly": 3467,
        "total": 83198,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_80000_36_g6",
        "title": "€80.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.28 Kar Payı)",
        "principal": 80000,
        "term": 36,
        "rate": 0.28,
        "rateLabel": "%0.28",
        "monthly": 2389,
        "total": 86001,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_90000_18_g6",
        "title": "€90.000 — 6 Ay Ödemesiz + 18 Eşit Taksit (%0.18 Kar Payı)",
        "principal": 90000,
        "term": 18,
        "rate": 0.18,
        "rateLabel": "%0.18",
        "monthly": 5150,
        "total": 92700,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 24,
        "desc": "İlk 6 ay ödeme yok, ardından 18 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_90000_24_g6",
        "title": "€90.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.24 Kar Payı)",
        "principal": 90000,
        "term": 24,
        "rate": 0.24,
        "rateLabel": "%0.24",
        "monthly": 3930,
        "total": 94327,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_90000_36_g6",
        "title": "€90.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.31 Kar Payı)",
        "principal": 90000,
        "term": 36,
        "rate": 0.31,
        "rateLabel": "%0.31",
        "monthly": 2708,
        "total": 97494,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_100000_18_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 18 Eşit Taksit (%0.22 Kar Payı)",
        "principal": 100000,
        "term": 18,
        "rate": 0.22,
        "rateLabel": "%0.22",
        "monthly": 5760,
        "total": 103674,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 24,
        "desc": "İlk 6 ay ödeme yok, ardından 18 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_100000_24_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.27 Kar Payı)",
        "principal": 100000,
        "term": 24,
        "rate": 0.27,
        "rateLabel": "%0.27",
        "monthly": 4393,
        "total": 105421,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_100000_36_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.33 Kar Payı)",
        "principal": 100000,
        "term": 36,
        "rate": 0.33,
        "rateLabel": "%0.33",
        "monthly": 3024,
        "total": 108881,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_110000_18_g6",
        "title": "€110.000 — 6 Ay Ödemesiz + 18 Eşit Taksit (%0.25 Kar Payı)",
        "principal": 110000,
        "term": 18,
        "rate": 0.25,
        "rateLabel": "%0.25",
        "monthly": 6367,
        "total": 114599,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 24,
        "desc": "İlk 6 ay ödeme yok, ardından 18 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_110000_24_g6",
        "title": "€110.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.29 Kar Payı)",
        "principal": 110000,
        "term": 24,
        "rate": 0.29,
        "rateLabel": "%0.29",
        "monthly": 4851,
        "total": 116412,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_110000_36_g6",
        "title": "€110.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.35 Kar Payı)",
        "principal": 110000,
        "term": 36,
        "rate": 0.35,
        "rateLabel": "%0.35",
        "monthly": 3344,
        "total": 120380,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_120000_18_g6",
        "title": "€120.000 — 6 Ay Ödemesiz + 18 Eşit Taksit (%0.27 Kar Payı)",
        "principal": 120000,
        "term": 18,
        "rate": 0.27,
        "rateLabel": "%0.27",
        "monthly": 6968,
        "total": 125424,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 24,
        "desc": "İlk 6 ay ödeme yok, ardından 18 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_120000_24_g6",
        "title": "€120.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.31 Kar Payı)",
        "principal": 120000,
        "term": 24,
        "rate": 0.31,
        "rateLabel": "%0.31",
        "monthly": 5312,
        "total": 127489,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_120000_36_g6",
        "title": "€120.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.37 Kar Payı)",
        "principal": 120000,
        "term": 36,
        "rate": 0.37,
        "rateLabel": "%0.37",
        "monthly": 3666,
        "total": 131992,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_130000_18_g6",
        "title": "€130.000 — 6 Ay Ödemesiz + 18 Eşit Taksit (%0.29 Kar Payı)",
        "principal": 130000,
        "term": 18,
        "rate": 0.29,
        "rateLabel": "%0.29",
        "monthly": 7573,
        "total": 136318,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 24,
        "desc": "İlk 6 ay ödeme yok, ardından 18 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_130000_24_g6",
        "title": "€130.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.33 Kar Payı)",
        "principal": 130000,
        "term": 24,
        "rate": 0.33,
        "rateLabel": "%0.33",
        "monthly": 5777,
        "total": 138647,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_130000_36_g6",
        "title": "€130.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.38 Kar Payı)",
        "principal": 130000,
        "term": 36,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 3982,
        "total": 143355,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      }
    ],
    "sifirFaizTL": [
      {
        "id": "kuveyt_turk_h_try_sifir_1000000_6",
        "title": "1.000.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1000000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 1000000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_try_sifir_1000000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 83333,
        "total": 1000000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      }
    ]
  },
  "garanti": {
    "name": "Garanti BBVA",
    "badge": "1M-1.1M TL %0 Faiz • 6M TL & 60 Aya Kadar Vade",
    "esitTaksitTL": [
      {
        "id": "garanti_h_try_esit_1500000_12",
        "title": "1.500.000 TL — 12 Ay (%0.76 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rate": 0.76,
        "rateLabel": "%0.76",
        "monthly": 131598,
        "total": 1579176,
        "currency": "TRY"
      },
      {
        "id": "garanti_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.06 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.06,
        "rateLabel": "%2.06",
        "monthly": 107762,
        "total": 2586300,
        "currency": "TRY"
      },
      {
        "id": "garanti_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.46 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.46,
        "rateLabel": "%2.46",
        "monthly": 169253,
        "total": 4062077,
        "currency": "TRY"
      },
      {
        "id": "garanti_h_try_esit_3000000_36",
        "title": "3.000.000 TL — 36 Ay (%2.64 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rate": 2.64,
        "rateLabel": "%2.64",
        "monthly": 132763,
        "total": 4779460,
        "currency": "TRY"
      },
      {
        "id": "garanti_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%2.65 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.65,
        "rateLabel": "%2.65",
        "monthly": 230747,
        "total": 5537935,
        "currency": "TRY"
      },
      {
        "id": "garanti_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%2.78 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rate": 2.78,
        "rateLabel": "%2.78",
        "monthly": 180985,
        "total": 6515444,
        "currency": "TRY"
      },
      {
        "id": "garanti_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%2.86 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.86,
        "rateLabel": "%2.86",
        "monthly": 229207,
        "total": 8251454,
        "currency": "TRY"
      },
      {
        "id": "garanti_h_try_esit_6000000_48",
        "title": "6.000.000 TL — 48 Ay (%2.92 Faiz)",
        "principal": 6000000,
        "term": 48,
        "rate": 2.92,
        "rateLabel": "%2.92",
        "monthly": 240365,
        "total": 11537521,
        "currency": "TRY"
      }
    ],
    "esitTaksitEUR": [
      {
        "id": "garanti_h_eur_esit_100000_24",
        "title": "€100.000 — 24 Ay (%0.15 Faiz)",
        "principal": 100000,
        "term": 24,
        "rate": 0.15,
        "rateLabel": "%0.15",
        "monthly": 4251,
        "total": 102024,
        "currency": "EUR"
      },
      {
        "id": "garanti_h_eur_esit_100000_36",
        "title": "€100.000 — 36 Ay (%0.30 Faiz)",
        "principal": 100000,
        "term": 36,
        "rate": 0.3,
        "rateLabel": "%0.30",
        "monthly": 2942,
        "total": 105912,
        "currency": "EUR"
      },
      {
        "id": "garanti_h_eur_esit_100000_48",
        "title": "€100.000 — 48 Ay (%0.38 Faiz)",
        "principal": 100000,
        "term": 48,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 2294,
        "total": 110112,
        "currency": "EUR"
      },
      {
        "id": "garanti_h_eur_esit_100000_60",
        "title": "€100.000 — 60 Ay (%0.43 Faiz)",
        "principal": 100000,
        "term": 60,
        "rate": 0.43,
        "rateLabel": "%0.43",
        "monthly": 1907,
        "total": 114420,
        "currency": "EUR"
      }
    ],
    "sifirFaizTL": [
      {
        "id": "garanti_h_try_esit_1000000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 83333,
        "total": 1000000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "garanti_h_try_esit_1100000_12",
        "title": "1.100.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1100000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 91667,
        "total": 1100000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      }
    ]
  },
  "teb_cetelem": {
    "name": "TEB",
    "badge": "1M TL %0 Faiz • 6M TL'ye Kadar Eşit Taksit",
    "esitTaksitTL": [
      {
        "id": "teb_cetelem_h_try_esit_1000000_24",
        "title": "1.000.000 TL — 24 Ay (%0.85 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rate": 0.85,
        "rateLabel": "%0.85",
        "monthly": 46497,
        "total": 1115928,
        "currency": "TRY"
      },
      {
        "id": "teb_cetelem_h_try_esit_1500000_12",
        "title": "1.500.000 TL — 12 Ay (%0.68 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rate": 0.68,
        "rateLabel": "%0.68",
        "monthly": 130877,
        "total": 1570524,
        "currency": "TRY"
      },
      {
        "id": "teb_cetelem_h_try_esit_2000000_12",
        "title": "2.000.000 TL — 12 Ay (%1.41 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rate": 1.41,
        "rateLabel": "%1.41",
        "monthly": 183137,
        "total": 2197644,
        "currency": "TRY"
      },
      {
        "id": "teb_cetelem_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.10 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.1,
        "rateLabel": "%2.10",
        "monthly": 108252,
        "total": 2598048,
        "currency": "TRY"
      },
      {
        "id": "teb_cetelem_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.50 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.5,
        "rateLabel": "%2.50",
        "monthly": 170024,
        "total": 4080576,
        "currency": "TRY"
      },
      {
        "id": "teb_cetelem_h_try_esit_3000000_36",
        "title": "3.000.000 TL — 36 Ay (%2.66 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rate": 2.66,
        "rateLabel": "%2.66",
        "monthly": 133179,
        "total": 4794444,
        "currency": "TRY"
      },
      {
        "id": "teb_cetelem_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%2.69 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.69,
        "rateLabel": "%2.69",
        "monthly": 231800,
        "total": 5563200,
        "currency": "TRY"
      },
      {
        "id": "teb_cetelem_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%2.80 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rate": 2.8,
        "rateLabel": "%2.80",
        "monthly": 181550,
        "total": 6535800,
        "currency": "TRY"
      },
      {
        "id": "teb_cetelem_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%2.88 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.88,
        "rateLabel": "%2.88",
        "monthly": 229912,
        "total": 8276832,
        "currency": "TRY"
      }
    ],
    "sifirFaizTL": [
      {
        "id": "teb_cetelem_h_try_esit_1000000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 83339,
        "total": 1000068,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      }
    ]
  },
  "akbank": {
    "name": "Akbank",
    "badge": "1.5M TL'ye Kadar %0 Faiz • 60 Aya Varan Vade",
    "esitTaksitTL": [
      {
        "id": "akbank_h_try_esit_1500000_12",
        "title": "1.500.000 TL — 12 Ay (%0.95 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rate": 0.95,
        "rateLabel": "%0.95",
        "monthly": 133252,
        "total": 1599026,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.51 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.51,
        "rateLabel": "%2.51",
        "monthly": 113506,
        "total": 2724154,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.91 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.91,
        "rateLabel": "%2.91",
        "monthly": 178203,
        "total": 4276872,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%3.11 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 3.11,
        "rateLabel": "%3.11",
        "monthly": 242996,
        "total": 5831898,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%3.26 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rate": 3.26,
        "rateLabel": "%3.26",
        "monthly": 194960,
        "total": 7018569,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%3.35 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 3.35,
        "rateLabel": "%3.35",
        "monthly": 247041,
        "total": 8893481,
        "currency": "TRY"
      }
    ],
    "sifirFaizTL": [
      {
        "id": "akbank_h_try_esit_1000000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 83333,
        "total": 1000000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "akbank_h_try_esit_1140000_12",
        "title": "1.140.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1140000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 95000,
        "total": 1140000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "akbank_h_try_esit_1400000_9",
        "title": "1.400.000 TL — 9 Ay (%0 Faiz)",
        "principal": 1400000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 155556,
        "total": 1400000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "akbank_h_try_esit_1500000_6",
        "title": "1.500.000 TL — 6 Ay (%0 Faiz)",
        "principal": 1500000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 250000,
        "total": 1500000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      }
    ]
  },
  "bnp_paribas": {
    "name": "BNP Paribas",
    "badge": "2M-6M TL & €100.000 Sabit Taksitli Finansman",
    "esitTaksitTL": [
      {
        "id": "bnp_paribas_h_try_esit_2000000_12",
        "title": "2.000.000 TL — 12 Ay",
        "principal": 2000000,
        "term": 12,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 175307,
        "total": 2103684,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay",
        "principal": 2000000,
        "term": 24,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 105115,
        "total": 2522760,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_3000000_12",
        "title": "3.000.000 TL — 12 Ay",
        "principal": 3000000,
        "term": 12,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 275455,
        "total": 3305460,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay",
        "principal": 3000000,
        "term": 24,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 165163,
        "total": 3963912,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay",
        "principal": 4000000,
        "term": 24,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 225221,
        "total": 5405304,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay",
        "principal": 4000000,
        "term": 36,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 177683,
        "total": 6396588,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_5000000_24",
        "title": "5.000.000 TL — 24 Ay",
        "principal": 5000000,
        "term": 24,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 285280,
        "total": 6846720,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay",
        "principal": 5000000,
        "term": 36,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 225066,
        "total": 8102376,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_6000000_24",
        "title": "6.000.000 TL — 24 Ay",
        "principal": 6000000,
        "term": 24,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 345342,
        "total": 8288208,
        "currency": "TRY"
      },
      {
        "id": "bnp_paribas_h_try_esit_6000000_36",
        "title": "6.000.000 TL — 36 Ay",
        "principal": 6000000,
        "term": 36,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 272446,
        "total": 9808056,
        "currency": "TRY"
      }
    ],
    "esitTaksitEUR": [
      {
        "id": "bnp_paribas_h_eur_esit_100000_12",
        "title": "€100.000 — 12 Ay",
        "principal": 100000,
        "term": 12,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 8200,
        "total": 98400,
        "currency": "EUR"
      },
      {
        "id": "bnp_paribas_h_eur_esit_100000_24",
        "title": "€100.000 — 24 Ay",
        "principal": 100000,
        "term": 24,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 4253,
        "total": 102072,
        "currency": "EUR"
      },
      {
        "id": "bnp_paribas_h_eur_esit_100000_36",
        "title": "€100.000 — 36 Ay",
        "principal": 100000,
        "term": 36,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 2950,
        "total": 106200,
        "currency": "EUR"
      },
      {
        "id": "bnp_paribas_h_eur_esit_100000_48",
        "title": "€100.000 — 48 Ay",
        "principal": 100000,
        "term": 48,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 2306,
        "total": 110688,
        "currency": "EUR"
      },
      {
        "id": "bnp_paribas_h_eur_esit_100000_60",
        "title": "€100.000 — 60 Ay",
        "principal": 100000,
        "term": 60,
        "rate": null,
        "rateLabel": "Sabit Taksit",
        "monthly": 1927,
        "total": 115620,
        "currency": "EUR"
      }
    ]
  },
  "is_bankasi": {
    "name": "Türkiye İş Bankası",
    "badge": "1M - 6M TL Ticari Filo Kredisi",
    "esitTaksitTL": [
      {
        "id": "is_bankasi_h_try_esit_1000000_12",
        "title": "1.000.000 TL — 12 Ay (%0.22 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rate": 0.22,
        "rateLabel": "%0.22",
        "monthly": 84578,
        "total": 1014936,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_1000000_24",
        "title": "1.000.000 TL — 24 Ay (%1.56 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rate": 1.56,
        "rateLabel": "%1.56",
        "monthly": 50752,
        "total": 1218048,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_2000000_12",
        "title": "2.000.000 TL — 12 Ay (%2.06 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rate": 2.06,
        "rateLabel": "%2.06",
        "monthly": 191017,
        "total": 2292204,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.59 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.59,
        "rateLabel": "%2.59",
        "monthly": 114529,
        "total": 2748696,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.92 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.92,
        "rateLabel": "%2.92",
        "monthly": 178304,
        "total": 4279296,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_3000000_36",
        "title": "3.000.000 TL — 36 Ay (%3.09 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rate": 3.09,
        "rateLabel": "%3.09",
        "monthly": 142404,
        "total": 5126544,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%3.08 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 3.08,
        "rateLabel": "%3.08",
        "monthly": 242075,
        "total": 5809800,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%3.20 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rate": 3.2,
        "rateLabel": "%3.20",
        "monthly": 193306,
        "total": 6959016,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%3.27 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 3.27,
        "rateLabel": "%3.27",
        "monthly": 244219,
        "total": 8791884,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_6000000_48",
        "title": "6.000.000 TL — 48 Ay (%3.36 Faiz)",
        "principal": 6000000,
        "term": 48,
        "rate": 3.36,
        "rateLabel": "%3.36",
        "monthly": 261214,
        "total": 12538272,
        "currency": "TRY"
      }
    ]
  }
};
