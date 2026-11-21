// IVECO Kasım 2026 Resmi Banka Kampanyaları & Yüksek Tutarlı Finansman Matrisi
// Kaynak: LM - KASIM 2026 KAMPANYALARI - 09112026_v8.xlsx ve HEAVY_KASIM 2026 KAMPANYALAR_05112026.xlsx
// DİKKAT: Dahili maliyet/iskonto ve komisyon detayları müşteri gizliliği gereği bu dosyada YER ALMAZ.
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
    "range": "715K - 2.18M TL",
    "icon": "💎",
    "min": 400000,
    "max": 2200000
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
      { id: 'all', label: 'Tüm Tutarlar', range: '715K - 2M TL', icon: '📋', min: 0, max: 2000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '715K - 1.24M TL', icon: '💎', min: 400000, max: 1250000 },
      { id: 'high_credit', label: '🚀 Yüksek Kredi', range: '1.2M - 2M TL', icon: '🚀', min: 1100000, max: 2000000 }
    ];
  } else if (category === 'daily70' || category === 'eurocargo') {
    return [
      { id: 'all', label: 'Tüm Tutarlar', range: '593K - 4M TL', icon: '📋', min: 0, max: 4000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '593K - 1.5M TL', icon: '💎', min: 400000, max: 1500000 },
      { id: 'high_credit', label: '🚀 Yüksek Kredi', range: '1.2M - 2.5M TL', icon: '🚀', min: 1100000, max: 2500000 },
      { id: 'fleet', label: '🏢 Kamyon & Filo', range: '2.6M - 4M TL', icon: '🏢', min: 2600000, max: 4000000 }
    ];
  } else {
    return [
      { id: 'all', label: 'Tüm Tutarlar', range: '1M - 6M TL', icon: '📋', min: 0, max: 6000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '1M - 2.18M TL', icon: '💎', min: 400000, max: 2200000 },
      { id: 'high_credit', label: '🚀 Ağır Ticari', range: '2M - 4.5M TL', icon: '🚀', min: 2000000, max: 4500000 },
      { id: 'fleet', label: '🏗️ Büyük Filo & Çekici', range: '4.6M - 6M TL', icon: '🏗️', min: 4600000, max: 6000000 }
    ];
  }
}

export const BANK_LIST = [
  {
    "id": "teb_cetelem",
    "name": "TEB & TEB Cetelem",
    "shortName": "TEB / Cetelem",
    "badge": "Yetkili Finansman",
    "color": "#0284c7",
    "bg": "rgba(2, 132, 199, 0.15)",
    "border": "rgba(56, 189, 248, 0.4)",
    "icon": "🏛️",
    "description": "800K-1M TL %0 faiz (TEB), %0.07-%0.08 (Cetelem) ve 4M TL'ye kadar Daily/Eurocargo Kasım 2026 kampanya tablosu"
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
    "description": "800K-1.5M TL %0 kâr payı, €50K-€110K 12-24 ay %0 Euro ve 6 ay ödemesiz Kasım 2026 seçenekleri"
  },
  {
    "id": "albaraka",
    "name": "Albaraka Türk",
    "shortName": "Albaraka",
    "badge": "%0 Kâr Payı & Ödemesiz",
    "color": "#f97316",
    "bg": "rgba(249, 115, 22, 0.15)",
    "border": "rgba(251, 146, 60, 0.4)",
    "icon": "🕌",
    "description": "800K-2M TL %0 kâr payı, €100K 12 ay %0 Euro finansman ve 6 ay ödemesiz Kasım 2026 seçenekleri"
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
    "description": "800K-1.1M TL %0 faiz, €100K-€110K Euro ve 60 aya varan Kasım 2026 ticari finansman"
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
    "description": "800K (Daily 35), 1M TL (Daily 70 & Eurocargo) ve 2.18M TL'ye kadar (Heavy) %0 faiz"
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
    "description": "Heavy 1M TL %0 faiz, Daily 70C/Eurocargo %0.11'den başlayan 6M TL'ye kadar Kasım 2026 kredileri"
  },
  {
    "id": "yapi_kredi",
    "name": "Yapı Kredi",
    "shortName": "Yapı Kredi",
    "badge": "6-24 Ay %0 & 60 Ay Vade",
    "color": "#3b82f6",
    "bg": "rgba(59, 130, 246, 0.15)",
    "border": "rgba(96, 165, 250, 0.4)",
    "icon": "🦅",
    "description": "Daily 35'te 1.24M TL 6 ay / 715K TL 12 ay %0, 70C'de 593K TL 24 ay %0 ve 4M TL'ye kadar Kasım tablosu"
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
    "description": "800K TL 8 ay (Daily 35) ve 1M TL 12 ay (Daily 70 & Eurocargo) %0 kâr payı"
  },
  {
    "id": "denizbank",
    "name": "DenizBank",
    "shortName": "DenizBank",
    "badge": "Ağır Vasıta TL & Euro",
    "color": "#0ea5e9",
    "bg": "rgba(14, 165, 233, 0.15)",
    "border": "rgba(56, 189, 248, 0.4)",
    "icon": "⚓",
    "description": "S-Way & T-Way 1M-5M TL ve €100K-€120K 60 ay vadeli ağır vasıta ticari finansmanı"
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
        "title": "800.000 TL — 8 Ay (%0 Faiz — TEB Banka 35C16)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "SIFIR FAİZ (TEB)"
      },
      {
        "id": "tc_35_800_8",
        "title": "800.000 TL — 8 Ay (%0.08 Faiz — TEB Cetelem 35C)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0.08",
        "rate": 0.08,
        "monthly": 100378,
        "total": 803027,
        "highlight": true,
        "tag": "35C CETELEM ÖZEL"
      },
      {
        "id": "tc_35_800_12",
        "title": "800.000 TL — 12 Ay (%1.11 Faiz — TEB Cetelem)",
        "principal": 800000,
        "term": 12,
        "rateLabel": "%1.11",
        "rate": 1.11,
        "monthly": 71824,
        "total": 861893
      },
      {
        "id": "tc_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.64 Faiz — TEB Cetelem)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.64",
        "rate": 1.64,
        "monthly": 92953,
        "total": 1115431
      },
      {
        "id": "tc_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.52 Faiz — TEB Cetelem)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.52",
        "rate": 2.52,
        "monthly": 56819,
        "total": 1363647
      },
      {
        "id": "tc_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%2.32 Faiz — TEB Cetelem)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 145665,
        "total": 1747975
      },
      {
        "id": "tc_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.90 Faiz — TEB Cetelem)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.90",
        "rate": 2.9,
        "monthly": 89001,
        "total": 2136025,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "tc_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%3.09 Faiz — TEB Cetelem)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%3.09",
        "rate": 3.09,
        "monthly": 121227,
        "total": 2909445,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "tc_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%3.24 Faiz — TEB Cetelem)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%3.24",
        "rate": 3.24,
        "monthly": 97184,
        "total": 3498637
      }
    ],
    "daily70": [
      {
        "id": "teb_banka_daily70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz — TEB Banka)",
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
        "title": "1.000.000 TL — 12 Ay (%0.07 Faiz — TEB Cetelem)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.07",
        "rate": 0.07,
        "monthly": 83732,
        "total": 1004784,
        "highlight": true,
        "tag": "12 AY CETELEM"
      },
      {
        "id": "tc_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.31 Faiz — TEB)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.31",
        "rate": 1.31,
        "monthly": 49223,
        "total": 1181360
      },
      {
        "id": "tc_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.17 Faiz — TEB)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.17",
        "rate": 1.17,
        "monthly": 135241,
        "total": 1622887
      },
      {
        "id": "tc_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.96 Faiz — TEB)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 79857,
        "total": 1916570,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "tc_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.74 Faiz — TEB)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.74",
        "rate": 1.74,
        "monthly": 187152,
        "total": 2245824
      },
      {
        "id": "tc_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.28 Faiz — TEB)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 110507,
        "total": 2652178,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "tc_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.59 Faiz — TEB)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 171793,
        "total": 4123040,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "tc_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.73 Faiz — TEB)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.73",
        "rate": 2.73,
        "monthly": 134581,
        "total": 4844931
      },
      {
        "id": "tc_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.84 Faiz — TEB)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.84",
        "rate": 2.84,
        "monthly": 182580,
        "total": 6572885
      }
    ],
    "eurocargo": [
      {
        "id": "teb_banka_eurocargo_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0 Faiz — TEB Banka)",
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
        "title": "1.000.000 TL — 12 Ay (%0.07 Faiz — TEB Cetelem)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.07",
        "rate": 0.07,
        "monthly": 83732,
        "total": 1004784,
        "highlight": true,
        "tag": "12 AY CETELEM"
      },
      {
        "id": "tc_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.31 Faiz — TEB)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.31",
        "rate": 1.31,
        "monthly": 49223,
        "total": 1181360
      },
      {
        "id": "tc_ec_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.17 Faiz — TEB)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.17",
        "rate": 1.17,
        "monthly": 135241,
        "total": 1622887
      },
      {
        "id": "tc_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.96 Faiz — TEB)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 79857,
        "total": 1916570,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "tc_ec_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.74 Faiz — TEB)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.74",
        "rate": 1.74,
        "monthly": 187152,
        "total": 2245824
      },
      {
        "id": "tc_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.28 Faiz — TEB)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 110507,
        "total": 2652178,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "tc_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.59 Faiz — TEB)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 171793,
        "total": 4123040,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "tc_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.73 Faiz — TEB)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.73",
        "rate": 2.73,
        "monthly": 134581,
        "total": 4844931
      },
      {
        "id": "tc_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.84 Faiz — TEB)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.84",
        "rate": 2.84,
        "monthly": 182580,
        "total": 6572885
      }
    ]
  },
  "kuveyt_turk": {
    "daily35": [
      {
        "id": "kt_35_800_6",
        "title": "800.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 800000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 133333,
        "total": 800000,
        "highlight": true,
        "tag": "6 AY SIFIR KAR PAYI"
      },
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
        "id": "kt_35_1000_6",
        "title": "1.000.000 TL — 6 Ay (%0.01 Kar Payı)",
        "principal": 1000000,
        "term": 6,
        "rateLabel": "%0.01",
        "rate": 0.01,
        "monthly": 166729,
        "total": 1000373,
        "highlight": true,
        "tag": "1M TL 6 AY %0.01"
      },
      {
        "id": "kt_35_800_12",
        "title": "800.000 TL — 12 Ay (%0.98 Kar Payı)",
        "principal": 800000,
        "term": 12,
        "rateLabel": "%0.98",
        "rate": 0.98,
        "monthly": 71275,
        "total": 855297
      },
      {
        "id": "kt_35_800_24",
        "title": "800.000 TL — 24 Ay (%1.83 Kar Payı)",
        "principal": 800000,
        "term": 24,
        "rateLabel": "%1.83",
        "rate": 1.83,
        "monthly": 42056,
        "total": 1009338
      },
      {
        "id": "kt_35_1000_9",
        "title": "1.000.000 TL — 9 Ay (%0.96 Kar Payı)",
        "principal": 1000000,
        "term": 9,
        "rateLabel": "%0.96",
        "rate": 0.96,
        "monthly": 116863,
        "total": 1051770,
        "tag": "DÜŞÜK KAR PAYI"
      },
      {
        "id": "kt_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.49 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.49",
        "rate": 1.49,
        "monthly": 92176,
        "total": 1106106
      },
      {
        "id": "kt_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.11 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.11",
        "rate": 2.11,
        "monthly": 54367,
        "total": 1304817,
        "tag": "2 YIL EŞİT TAKSİT"
      },
      {
        "id": "kt_35_1400_12",
        "title": "1.400.000 TL — 12 Ay (%2.07 Kar Payı)",
        "principal": 1400000,
        "term": 12,
        "rateLabel": "%2.07",
        "rate": 2.07,
        "monthly": 134050,
        "total": 1608600
      },
      {
        "id": "kt_35_1400_24",
        "title": "1.400.000 TL — 24 Ay (%2.43 Kar Payı)",
        "principal": 1400000,
        "term": 24,
        "rateLabel": "%2.43",
        "rate": 2.43,
        "monthly": 79048,
        "total": 1897146,
        "tag": "1.4 MİLYON TL"
      },
      {
        "id": "kt_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.67 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.67",
        "rate": 2.67,
        "monthly": 116125,
        "total": 2786997,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "kt_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.76 Kar Payı)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.76",
        "rate": 2.76,
        "monthly": 90796,
        "total": 3268657
      },
      {
        "id": "kt_35_grace_1000_24",
        "title": "1.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.36 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "gracePeriod": 6,
        "gracePeriodMonths": 6,
        "totalTerm": 30,
        "rateLabel": "%2.36",
        "rate": 2.36,
        "monthly": 63959,
        "total": 1535022,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksitli ödeme",
        "tag": "İLK 6 AY 0 TL TAKSİT"
      },
      {
        "id": "kt_35_grace_2000_24",
        "title": "2.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.76 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "gracePeriod": 6,
        "gracePeriodMonths": 6,
        "totalTerm": 30,
        "rateLabel": "%2.76",
        "rate": 2.76,
        "monthly": 136460,
        "total": 3275051,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksitli ödeme",
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
        "id": "kt_70_1250_9",
        "title": "1.250.000 TL — 9 Ay (%0 Kar Payı)",
        "principal": 1250000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 138889,
        "total": 1250000,
        "highlight": true,
        "tag": "9 AY SIFIR KAR PAYI"
      },
      {
        "id": "kt_70_1500_6",
        "title": "1.500.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1500000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 250000,
        "total": 1500000,
        "highlight": true,
        "tag": "6 AY SIFIR KAR PAYI"
      },
      {
        "id": "kt_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.27 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.27",
        "rate": 1.27,
        "monthly": 49076,
        "total": 1177825
      },
      {
        "id": "kt_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.18 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.18",
        "rate": 1.18,
        "monthly": 135443,
        "total": 1625313
      },
      {
        "id": "kt_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.94 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.94",
        "rate": 1.94,
        "monthly": 79908,
        "total": 1917789,
        "tag": "1.5M EŞİT TAKSİT"
      },
      {
        "id": "kt_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.27 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.27",
        "rate": 2.27,
        "monthly": 110819,
        "total": 2659661,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "kt_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.58 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.58",
        "rate": 2.58,
        "monthly": 172379,
        "total": 4137098,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "kt_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.70 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 134892,
        "total": 4856129
      },
      {
        "id": "kt_70_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.24 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "gracePeriod": 6,
        "gracePeriodMonths": 6,
        "totalTerm": 30,
        "rateLabel": "%2.24",
        "rate": 2.24,
        "monthly": 94047,
        "total": 2257133,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksitli ödeme",
        "tag": "1.5M 6 AY ÖDEMESİZ"
      },
      {
        "id": "kt_70_grace_3000_24",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.70 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "gracePeriod": 6,
        "gracePeriodMonths": 6,
        "totalTerm": 30,
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 202745,
        "total": 4865879,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksitli ödeme",
        "tag": "3M 6 AY ÖDEMESİZ"
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
        "id": "kt_ec_1250_9",
        "title": "1.250.000 TL — 9 Ay (%0 Kar Payı)",
        "principal": 1250000,
        "term": 9,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 138889,
        "total": 1250000,
        "highlight": true,
        "tag": "9 AY SIFIR KAR PAYI"
      },
      {
        "id": "kt_ec_1500_6",
        "title": "1.500.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1500000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 250000,
        "total": 1500000,
        "highlight": true,
        "tag": "6 AY SIFIR KAR PAYI"
      },
      {
        "id": "kt_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.27 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.27",
        "rate": 1.27,
        "monthly": 49076,
        "total": 1177825
      },
      {
        "id": "kt_ec_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.18 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.18",
        "rate": 1.18,
        "monthly": 135443,
        "total": 1625313
      },
      {
        "id": "kt_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.94 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.94",
        "rate": 1.94,
        "monthly": 79908,
        "total": 1917789,
        "tag": "1.5M EŞİT TAKSİT"
      },
      {
        "id": "kt_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.27 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.27",
        "rate": 2.27,
        "monthly": 110819,
        "total": 2659661,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "kt_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.58 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.58",
        "rate": 2.58,
        "monthly": 172379,
        "total": 4137098,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "kt_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.70 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 134892,
        "total": 4856129
      },
      {
        "id": "kt_ec_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.24 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "gracePeriod": 6,
        "gracePeriodMonths": 6,
        "totalTerm": 30,
        "rateLabel": "%2.24",
        "rate": 2.24,
        "monthly": 94047,
        "total": 2257133,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksitli ödeme",
        "tag": "1.5M 6 AY ÖDEMESİZ"
      },
      {
        "id": "kt_ec_grace_3000_24",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.70 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "gracePeriod": 6,
        "gracePeriodMonths": 6,
        "totalTerm": 30,
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 202745,
        "total": 4865879,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksitli ödeme",
        "tag": "3M 6 AY ÖDEMESİZ"
      }
    ]
  },
  "albaraka": {
    "daily35": [
      {
        "id": "alb_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Kar Payı)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
        "highlight": true,
        "tag": "35C16H SIFIR KAR PAYI"
      },
      {
        "id": "alb_35_1000_6",
        "title": "1.000.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1000000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 166667,
        "total": 1000000,
        "highlight": true,
        "tag": "1M TL 6 AY SIFIR KAR"
      }
    ],
    "daily70": [
      {
        "id": "alb_70_1000_12",
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
        "id": "alb_70_1500_6",
        "title": "1.500.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1500000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 250000,
        "total": 1500000,
        "highlight": true,
        "tag": "6 AY SIFIR KAR PAYI"
      },
      {
        "id": "alb_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.29 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.29",
        "rate": 1.29,
        "monthly": 49232,
        "total": 1181576
      },
      {
        "id": "alb_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.20 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.20",
        "rate": 1.2,
        "monthly": 135667,
        "total": 1628000
      },
      {
        "id": "alb_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.95 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.95",
        "rate": 1.95,
        "monthly": 80109,
        "total": 1922618,
        "tag": "1.5M EŞİT TAKSİT"
      },
      {
        "id": "alb_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.28 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 110986,
        "total": 2663660,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "alb_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.59 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 172739,
        "total": 4145744,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "alb_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.71 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.71",
        "rate": 2.71,
        "monthly": 135231,
        "total": 4868321
      },
      {
        "id": "alb_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.82 Kar Payı)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.82",
        "rate": 2.82,
        "monthly": 183559,
        "total": 6608113
      },
      {
        "id": "alb_70_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.28 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "gracePeriod": 6,
        "gracePeriodMonths": 6,
        "totalTerm": 30,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 93903,
        "total": 2253678,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksitli ödeme",
        "tag": "1.5M 6 AY ÖDEMESİZ"
      }
    ],
    "eurocargo": [
      {
        "id": "alb_ec_1000_12",
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
        "id": "alb_ec_1500_6",
        "title": "1.500.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1500000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 250000,
        "total": 1500000,
        "highlight": true,
        "tag": "6 AY SIFIR KAR PAYI"
      },
      {
        "id": "alb_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.29 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.29",
        "rate": 1.29,
        "monthly": 49232,
        "total": 1181576
      },
      {
        "id": "alb_ec_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.20 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.20",
        "rate": 1.2,
        "monthly": 135667,
        "total": 1628000
      },
      {
        "id": "alb_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.95 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.95",
        "rate": 1.95,
        "monthly": 80109,
        "total": 1922618,
        "tag": "1.5M EŞİT TAKSİT"
      },
      {
        "id": "alb_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.28 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 110986,
        "total": 2663660,
        "tag": "2 MİLYON TL"
      },
      {
        "id": "alb_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.59 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 172739,
        "total": 4145744,
        "tag": "3 MİLYON TL"
      },
      {
        "id": "alb_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.71 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.71",
        "rate": 2.71,
        "monthly": 135231,
        "total": 4868321
      },
      {
        "id": "alb_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.82 Kar Payı)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.82",
        "rate": 2.82,
        "monthly": 183559,
        "total": 6608113
      },
      {
        "id": "alb_ec_grace_1500_24",
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.28 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "gracePeriod": 6,
        "gracePeriodMonths": 6,
        "totalTerm": 30,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 93903,
        "total": 2253678,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksitli ödeme",
        "tag": "1.5M 6 AY ÖDEMESİZ"
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
        "id": "gar_35_800_12",
        "title": "800.000 TL — 12 Ay (%1.04 Faiz)",
        "principal": 800000,
        "term": 12,
        "rateLabel": "%1.04",
        "rate": 1.04,
        "monthly": 71477,
        "total": 857723
      },
      {
        "id": "gar_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.56 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.56",
        "rate": 1.56,
        "monthly": 92499,
        "total": 1109983,
        "tag": "AVANTAJLI ORAN"
      },
      {
        "id": "gar_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.32 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 55523,
        "total": 1332546
      },
      {
        "id": "gar_35_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.63 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.63",
        "rate": 2.63,
        "monthly": 44172,
        "total": 1590179
      },
      {
        "id": "gar_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%2.25 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%2.25",
        "rate": 2.25,
        "monthly": 145059,
        "total": 1740704
      },
      {
        "id": "gar_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.71 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.71",
        "rate": 2.71,
        "monthly": 87058,
        "total": 2089396
      },
      {
        "id": "gar_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.89 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.89",
        "rate": 2.89,
        "monthly": 118595,
        "total": 2846284
      },
      {
        "id": "gar_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%3.05 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%3.05",
        "rate": 3.05,
        "monthly": 94325,
        "total": 3395706
      },
      {
        "id": "gar_35_2000_48",
        "title": "2.000.000 TL — 48 Ay (%3.12 Faiz)",
        "principal": 2000000,
        "term": 48,
        "rateLabel": "%3.12",
        "rate": 3.12,
        "monthly": 83226,
        "total": 3994845
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
        "total": 1000000,
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
        "monthly": 48616,
        "total": 1166774
      },
      {
        "id": "gar_70_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.25 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.25",
        "rate": 1.25,
        "monthly": 135876,
        "total": 1630512
      },
      {
        "id": "gar_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.90 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.90",
        "rate": 1.9,
        "monthly": 79252,
        "total": 1902038
      },
      {
        "id": "gar_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.85 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.85",
        "rate": 1.85,
        "monthly": 188433,
        "total": 2261194
      },
      {
        "id": "gar_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.23 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.23",
        "rate": 2.23,
        "monthly": 109893,
        "total": 2637438
      },
      {
        "id": "gar_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.56 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.56",
        "rate": 2.56,
        "monthly": 171182,
        "total": 4108357
      },
      {
        "id": "gar_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.73 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.73",
        "rate": 2.73,
        "monthly": 134717,
        "total": 4849815
      },
      {
        "id": "gar_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.72 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.72",
        "rate": 2.72,
        "monthly": 232472,
        "total": 5579329
      },
      {
        "id": "gar_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 182939,
        "total": 6585818
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
        "total": 1000000,
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
        "monthly": 48616,
        "total": 1166774
      },
      {
        "id": "gar_ec_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.25 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.25",
        "rate": 1.25,
        "monthly": 135876,
        "total": 1630512
      },
      {
        "id": "gar_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%1.90 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%1.90",
        "rate": 1.9,
        "monthly": 79252,
        "total": 1902038
      },
      {
        "id": "gar_ec_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.85 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.85",
        "rate": 1.85,
        "monthly": 188433,
        "total": 2261194
      },
      {
        "id": "gar_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.23 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.23",
        "rate": 2.23,
        "monthly": 109893,
        "total": 2637438
      },
      {
        "id": "gar_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.56 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.56",
        "rate": 2.56,
        "monthly": 171182,
        "total": 4108357
      },
      {
        "id": "gar_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.73 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.73",
        "rate": 2.73,
        "monthly": 134717,
        "total": 4849815
      },
      {
        "id": "gar_ec_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.72 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.72",
        "rate": 2.72,
        "monthly": 232472,
        "total": 5579329
      },
      {
        "id": "gar_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%2.85 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%2.85",
        "rate": 2.85,
        "monthly": 182939,
        "total": 6585818
      }
    ]
  },
  "is_bankasi": {
    "daily35": [
      {
        "id": "is_35_800_8",
        "title": "800.000 TL — 8 Ay (%0.28 Faiz)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0.28",
        "rate": 0.28,
        "monthly": 101313,
        "total": 810506,
        "highlight": true,
        "tag": "35C ŞASİ ÖZEL"
      },
      {
        "id": "is_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.68 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.68",
        "rate": 1.68,
        "monthly": 93207,
        "total": 1118478,
        "tag": "STANDART KAMPANYA"
      },
      {
        "id": "is_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%2.34 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%2.34",
        "rate": 2.34,
        "monthly": 55622,
        "total": 1334920
      },
      {
        "id": "is_35_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.59 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 43928,
        "total": 1581413
      },
      {
        "id": "is_35_1000_48",
        "title": "1.000.000 TL — 48 Ay (%2.83 Faiz)",
        "principal": 1000000,
        "term": 48,
        "rateLabel": "%2.83",
        "rate": 2.83,
        "monthly": 39355,
        "total": 1889019
      },
      {
        "id": "is_35_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.70 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 198988,
        "total": 2387854
      },
      {
        "id": "is_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.90 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.90",
        "rate": 2.9,
        "monthly": 118708,
        "total": 2848997
      },
      {
        "id": "is_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%3.00 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%3.00",
        "rate": 3.0,
        "monthly": 93713,
        "total": 3373666
      }
    ],
    "daily70": [
      {
        "id": "is_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0.11 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.11",
        "rate": 0.11,
        "monthly": 83949,
        "total": 1007386,
        "highlight": true,
        "tag": "DÜŞÜK FAİZ"
      },
      {
        "id": "is_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.46 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.46",
        "rate": 1.46,
        "monthly": 50128,
        "total": 1203068
      },
      {
        "id": "is_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.96 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 39619,
        "total": 1426290
      },
      {
        "id": "is_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.96 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 189732,
        "total": 2276789
      },
      {
        "id": "is_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.49 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.49",
        "rate": 2.49,
        "monthly": 113219,
        "total": 2717254
      },
      {
        "id": "is_70_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.70 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 89409,
        "total": 3218716
      },
      {
        "id": "is_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.81 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.81",
        "rate": 2.81,
        "monthly": 176299,
        "total": 4231174
      },
      {
        "id": "is_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.94 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.94",
        "rate": 2.94,
        "monthly": 139201,
        "total": 5011235
      },
      {
        "id": "is_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.98 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.98",
        "rate": 2.98,
        "monthly": 239376,
        "total": 5745030
      },
      {
        "id": "is_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.06 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.06",
        "rate": 3.06,
        "monthly": 188968,
        "total": 6802839
      },
      {
        "id": "is_70_4000_48",
        "title": "4.000.000 TL — 48 Ay (%3.21 Faiz)",
        "principal": 4000000,
        "term": 48,
        "rateLabel": "%3.21",
        "rate": 3.21,
        "monthly": 169242,
        "total": 8123613
      }
    ],
    "eurocargo": [
      {
        "id": "is_ec_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0.11 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.11",
        "rate": 0.11,
        "monthly": 83949,
        "total": 1007386,
        "highlight": true,
        "tag": "DÜŞÜK FAİZ"
      },
      {
        "id": "is_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.46 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.46",
        "rate": 1.46,
        "monthly": 50128,
        "total": 1203068
      },
      {
        "id": "is_ec_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.96 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 39619,
        "total": 1426290
      },
      {
        "id": "is_ec_2000_12",
        "title": "2.000.000 TL — 12 Ay (%1.96 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%1.96",
        "rate": 1.96,
        "monthly": 189732,
        "total": 2276789
      },
      {
        "id": "is_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.49 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.49",
        "rate": 2.49,
        "monthly": 113219,
        "total": 2717254
      },
      {
        "id": "is_ec_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.70 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 89409,
        "total": 3218716
      },
      {
        "id": "is_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.81 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.81",
        "rate": 2.81,
        "monthly": 176299,
        "total": 4231174
      },
      {
        "id": "is_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%2.94 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%2.94",
        "rate": 2.94,
        "monthly": 139201,
        "total": 5011235
      },
      {
        "id": "is_ec_4000_24",
        "title": "4.000.000 TL — 24 Ay (%2.98 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%2.98",
        "rate": 2.98,
        "monthly": 239376,
        "total": 5745030
      },
      {
        "id": "is_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.06 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.06",
        "rate": 3.06,
        "monthly": 188968,
        "total": 6802839
      },
      {
        "id": "is_ec_4000_48",
        "title": "4.000.000 TL — 48 Ay (%3.21 Faiz)",
        "principal": 4000000,
        "term": 48,
        "rateLabel": "%3.21",
        "rate": 3.21,
        "monthly": 169242,
        "total": 8123613
      }
    ]
  },
  "akbank": {
    "daily35": [
      {
        "id": "ak_35_800_6",
        "title": "800.000 TL — 6 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 133333,
        "total": 800000,
        "highlight": true,
        "tag": "6 AY SIFIR FAİZ"
      },
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
        "id": "ak_35_800_9",
        "title": "800.000 TL — 9 Ay (%0.32 Faiz)",
        "principal": 800000,
        "term": 9,
        "rateLabel": "%0.32",
        "rate": 0.32,
        "monthly": 90389,
        "total": 813500
      },
      {
        "id": "ak_35_800_10",
        "title": "800.000 TL — 10 Ay (%0.58 Faiz)",
        "principal": 800000,
        "term": 10,
        "rateLabel": "%0.58",
        "rate": 0.58,
        "monthly": 82704,
        "total": 827040
      },
      {
        "id": "ak_35_800_12",
        "title": "800.000 TL — 12 Ay (%0.98 Faiz)",
        "principal": 800000,
        "term": 12,
        "rateLabel": "%0.98",
        "rate": 0.98,
        "monthly": 71209,
        "total": 854512
      },
      {
        "id": "ak_35_800_18",
        "title": "800.000 TL — 18 Ay (%1.69 Faiz)",
        "principal": 800000,
        "term": 18,
        "rateLabel": "%1.69",
        "rate": 1.69,
        "monthly": 52310,
        "total": 941572
      },
      {
        "id": "ak_35_800_24",
        "title": "800.000 TL — 24 Ay (%2.00 Faiz)",
        "principal": 800000,
        "term": 24,
        "rateLabel": "%2.00",
        "rate": 2.0,
        "monthly": 42778,
        "total": 1026661
      },
      {
        "id": "ak_35_800_36",
        "title": "800.000 TL — 36 Ay (%2.37 Faiz)",
        "principal": 800000,
        "term": 36,
        "rateLabel": "%2.37",
        "rate": 2.37,
        "monthly": 33901,
        "total": 1220430
      },
      {
        "id": "ak_35_800_48",
        "title": "800.000 TL — 48 Ay (%2.55 Faiz)",
        "principal": 800000,
        "term": 48,
        "rateLabel": "%2.55",
        "rate": 2.55,
        "monthly": 29804,
        "total": 1430604
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
        "title": "1.000.000 TL — 18 Ay (%0.99 Faiz)",
        "principal": 1000000,
        "term": 18,
        "rateLabel": "%0.99",
        "rate": 0.99,
        "monthly": 61202,
        "total": 1101644
      },
      {
        "id": "ak_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.45 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.45",
        "rate": 1.45,
        "monthly": 50055,
        "total": 1201312
      },
      {
        "id": "ak_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.97 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%1.97",
        "rate": 1.97,
        "monthly": 39666,
        "total": 1427967
      },
      {
        "id": "ak_70_1000_48",
        "title": "1.000.000 TL — 48 Ay (%2.23 Faiz)",
        "principal": 1000000,
        "term": 48,
        "rateLabel": "%2.23",
        "rate": 2.23,
        "monthly": 34908,
        "total": 1675596
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
        "title": "1.000.000 TL — 18 Ay (%0.99 Faiz)",
        "principal": 1000000,
        "term": 18,
        "rateLabel": "%0.99",
        "rate": 0.99,
        "monthly": 61202,
        "total": 1101644
      },
      {
        "id": "ak_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.45 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.45",
        "rate": 1.45,
        "monthly": 50055,
        "total": 1201312
      },
      {
        "id": "ak_ec_1000_36",
        "title": "1.000.000 TL — 36 Ay (%1.97 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%1.97",
        "rate": 1.97,
        "monthly": 39666,
        "total": 1427967
      },
      {
        "id": "ak_ec_1000_48",
        "title": "1.000.000 TL — 48 Ay (%2.23 Faiz)",
        "principal": 1000000,
        "term": 48,
        "rateLabel": "%2.23",
        "rate": 2.23,
        "monthly": 34908,
        "total": 1675596
      }
    ]
  },
  "yapi_kredi": {
    "daily35": [
      {
        "id": "yk_35_715_12",
        "title": "715.000 TL — 12 Ay (%0 Faiz)",
        "principal": 715000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 59583,
        "total": 715000,
        "highlight": true,
        "tag": "12 AY SIFIR FAİZ"
      },
      {
        "id": "yk_35_800_6",
        "title": "800.000 TL — 6 Ay (%0 Faiz)",
        "principal": 800000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 133333,
        "total": 800000,
        "highlight": true,
        "tag": "6 AY SIFIR FAİZ"
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
        "tag": "1M TL 6 AY %0"
      },
      {
        "id": "yk_35_1244_6",
        "title": "1.244.000 TL — 6 Ay (%0 Faiz)",
        "principal": 1244000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 207333,
        "total": 1244000,
        "highlight": true,
        "tag": "1.24M TL 6 AY %0"
      },
      {
        "id": "yk_35_900_12",
        "title": "900.000 TL — 12 Ay (%0.76 Faiz)",
        "principal": 900000,
        "term": 12,
        "rateLabel": "%0.76",
        "rate": 0.76,
        "monthly": 78963,
        "total": 947553,
        "tag": "%0.76 KAMPANYA"
      },
      {
        "id": "yk_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.05 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.05",
        "rate": 1.05,
        "monthly": 89449,
        "total": 1073387
      },
      {
        "id": "yk_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.91 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.91",
        "rate": 1.91,
        "monthly": 141878,
        "total": 1702538
      },
      {
        "id": "yk_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.53 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.53",
        "rate": 2.53,
        "monthly": 85365,
        "total": 2048769
      },
      {
        "id": "yk_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.77 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.77",
        "rate": 2.77,
        "monthly": 116894,
        "total": 2805456
      },
      {
        "id": "yk_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.95 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.95",
        "rate": 2.95,
        "monthly": 92989,
        "total": 3347588
      }
    ],
    "daily70": [
      {
        "id": "yk_70_593_24",
        "title": "593.000 TL — 24 Ay (%0 Faiz)",
        "principal": 593000,
        "term": 24,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 24708,
        "total": 593000,
        "highlight": true,
        "tag": "24 AY SIFIR FAİZ"
      },
      {
        "id": "yk_70_800_24",
        "title": "800.000 TL — 24 Ay (%0.99 Faiz)",
        "principal": 800000,
        "term": 24,
        "rateLabel": "%0.99",
        "rate": 0.99,
        "monthly": 37846,
        "total": 908293,
        "tag": "DÜŞÜK FAİZ 70C"
      },
      {
        "id": "yk_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.53 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.53",
        "rate": 1.53,
        "monthly": 50550,
        "total": 1213198,
        "tag": "1M TL 24 AY %1.53"
      },
      {
        "id": "yk_70_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.07 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.07",
        "rate": 2.07,
        "monthly": 40341,
        "total": 1452277
      },
      {
        "id": "yk_70_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.22 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.22",
        "rate": 2.22,
        "monthly": 82321,
        "total": 1975703
      },
      {
        "id": "yk_70_1500_36",
        "title": "1.500.000 TL — 36 Ay (%2.57 Faiz)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.57",
        "rate": 2.57,
        "monthly": 65682,
        "total": 2364539
      },
      {
        "id": "yk_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.56 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.56",
        "rate": 2.56,
        "monthly": 114096,
        "total": 2738297
      },
      {
        "id": "yk_70_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.82 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.82",
        "rate": 2.82,
        "monthly": 91018,
        "total": 3276650
      },
      {
        "id": "yk_70_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.88 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.88",
        "rate": 2.88,
        "monthly": 177661,
        "total": 4263858
      },
      {
        "id": "yk_70_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.05 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.05",
        "rate": 3.05,
        "monthly": 141704,
        "total": 5101342
      },
      {
        "id": "yk_70_4000_24",
        "title": "4.000.000 TL — 24 Ay (%3.04 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%3.04",
        "rate": 3.04,
        "monthly": 241209,
        "total": 5789027
      },
      {
        "id": "yk_70_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.17 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.17",
        "rate": 3.17,
        "monthly": 192393,
        "total": 6926164
      }
    ],
    "eurocargo": [
      {
        "id": "yk_ec_593_24",
        "title": "593.000 TL — 24 Ay (%0 Faiz)",
        "principal": 593000,
        "term": 24,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 24708,
        "total": 593000,
        "highlight": true,
        "tag": "24 AY SIFIR FAİZ"
      },
      {
        "id": "yk_ec_800_24",
        "title": "800.000 TL — 24 Ay (%0.99 Faiz)",
        "principal": 800000,
        "term": 24,
        "rateLabel": "%0.99",
        "rate": 0.99,
        "monthly": 37846,
        "total": 908293,
        "tag": "DÜŞÜK FAİZ 70C"
      },
      {
        "id": "yk_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.53 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.53",
        "rate": 1.53,
        "monthly": 50550,
        "total": 1213198,
        "tag": "1M TL 24 AY %1.53"
      },
      {
        "id": "yk_ec_1000_36",
        "title": "1.000.000 TL — 36 Ay (%2.07 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rateLabel": "%2.07",
        "rate": 2.07,
        "monthly": 40341,
        "total": 1452277
      },
      {
        "id": "yk_ec_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.22 Faiz)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.22",
        "rate": 2.22,
        "monthly": 82321,
        "total": 1975703
      },
      {
        "id": "yk_ec_1500_36",
        "title": "1.500.000 TL — 36 Ay (%2.57 Faiz)",
        "principal": 1500000,
        "term": 36,
        "rateLabel": "%2.57",
        "rate": 2.57,
        "monthly": 65682,
        "total": 2364539
      },
      {
        "id": "yk_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.56 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.56",
        "rate": 2.56,
        "monthly": 114096,
        "total": 2738297
      },
      {
        "id": "yk_ec_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.82 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.82",
        "rate": 2.82,
        "monthly": 91018,
        "total": 3276650
      },
      {
        "id": "yk_ec_3000_24",
        "title": "3.000.000 TL — 24 Ay (%2.88 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rateLabel": "%2.88",
        "rate": 2.88,
        "monthly": 177661,
        "total": 4263858
      },
      {
        "id": "yk_ec_3000_36",
        "title": "3.000.000 TL — 36 Ay (%3.05 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rateLabel": "%3.05",
        "rate": 3.05,
        "monthly": 141704,
        "total": 5101342
      },
      {
        "id": "yk_ec_4000_24",
        "title": "4.000.000 TL — 24 Ay (%3.04 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rateLabel": "%3.04",
        "rate": 3.04,
        "monthly": 241209,
        "total": 5789027
      },
      {
        "id": "yk_ec_4000_36",
        "title": "4.000.000 TL — 36 Ay (%3.17 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rateLabel": "%3.17",
        "rate": 3.17,
        "monthly": 192393,
        "total": 6926164
      }
    ]
  },
  "vakif_katilim": {
    "daily35": [
      {
        "id": "vk_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Kar Payı — Vakıf Katılım 35C)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 100000,
        "total": 800000,
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
  "denizbank": {
    "daily35": [],
    "daily70": [],
    "eurocargo": []
  }
};

const BANK_QUERY_ALIASES = {
  garanti: 'garanti',
  garanti_bbva: 'garanti',
  garantibbva: 'garanti',
  deniz: 'denizbank',
  denizbank: 'denizbank',
  deniz_bank: 'denizbank',
  kuveyt: 'kuveyt_turk',
  kuveyt_turk: 'kuveyt_turk',
  kuveytturk: 'kuveyt_turk',
  albaraka: 'albaraka',
  albaraka_turk: 'albaraka',
  albarakaturk: 'albaraka',
  teb: 'teb_cetelem',
  cetelem: 'teb_cetelem',
  teb_cetelem: 'teb_cetelem',
  akbank: 'akbank',
  is: 'is_bankasi',
  is_bankasi: 'is_bankasi',
  isbankasi: 'is_bankasi',
  yapi_kredi: 'yapi_kredi',
  yapikredi: 'yapi_kredi',
  yk: 'yapi_kredi',
  vakif: 'vakif_katilim',
  vakif_katilim: 'vakif_katilim',
  vakifkatilim: 'vakif_katilim',
  bnp: 'teb_cetelem',
  bnp_paribas: 'teb_cetelem',
  bnpparibas: 'teb_cetelem'
};

export function resolveBankFromSearchParams(searchParams) {
  if (!searchParams) return null;
  const rawBank = (
    searchParams.get('bank') ||
    searchParams.get('banka') ||
    ''
  ).trim().toLowerCase();

  const rawRef = (searchParams.get('ref') || '').trim().toLowerCase();
  let candidateKey = rawBank;
  if (!candidateKey && rawRef.startsWith('banka_')) {
    candidateKey = rawRef.replace(/^banka_/, '');
  }
  if (!candidateKey) return null;

  const resolvedId = BANK_QUERY_ALIASES[candidateKey] || candidateKey;
  const bankObj = BANK_LIST.find(b => b.id === resolvedId && b.id !== 'diger_yok');
  if (!bankObj) return null;

  const hasEurCampaigns = EUR_PARTNER_BANKS.some(eb => eb.id === bankObj.id);
  const bankerName = (searchParams.get('bbanker') || searchParams.get('bankaci') || '').trim();
  const branchName = (searchParams.get('bbranch') || searchParams.get('sube') || '').trim();

  return {
    ...bankObj,
    hasEurCampaigns,
    bankerName,
    branchName
  };
}

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
  const bankData = BANK_CAMPAIGNS[effectiveBankId];
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
  } else if (bankData) {
    campaigns = bankData[category] || [];
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
    "id": "kuveyt_turk_h_eur_esit_60000_24",
    "title": "€60.000 — 24 Ay (%0 Kar Payı)",
    "principal": 60000,
    "term": 24,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 2500,
    "total": 60000,
    "currency": "EUR",
    "tag": "%0 FAİZ",
    "bankId": "kuveyt_turk"
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
    "tag": "%0 FAİZ",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_80000_24",
    "title": "€80.000 — 24 Ay (%0.09 Kar Payı)",
    "principal": 80000,
    "term": 24,
    "rate": 0.09,
    "rateLabel": "%0.09",
    "monthly": 3373,
    "total": 80962,
    "currency": "EUR",
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
    "id": "kuveyt_turk_h_eur_esit_100000_24",
    "title": "€100.000 — 24 Ay (%0.19 Kar Payı)",
    "principal": 100000,
    "term": 24,
    "rate": 0.19,
    "rateLabel": "%0.19",
    "monthly": 4273,
    "total": 102550,
    "currency": "EUR",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_100000_36",
    "title": "€100.000 — 36 Ay (%0.32 Kar Payı)",
    "principal": 100000,
    "term": 36,
    "rate": 0.32,
    "rateLabel": "%0.32",
    "monthly": 2956,
    "total": 106432,
    "currency": "EUR",
    "bankId": "kuveyt_turk"
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
    "tag": "%0 FAİZ",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_120000_24",
    "title": "€120.000 — 24 Ay (%0.26 Kar Payı)",
    "principal": 120000,
    "term": 24,
    "rate": 0.26,
    "rateLabel": "%0.26",
    "monthly": 5175,
    "total": 124197,
    "currency": "EUR",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_esit_130000_36",
    "title": "€130.000 — 36 Ay (%0.38 Kar Payı)",
    "principal": 130000,
    "term": 36,
    "rate": 0.38,
    "rateLabel": "%0.38",
    "monthly": 3888,
    "total": 139966,
    "currency": "EUR",
    "bankId": "kuveyt_turk"
  },
  {
    "id": "kuveyt_turk_h_eur_odemesiz_100000_24_g6",
    "title": "€100.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.32 Kar Payı)",
    "principal": 100000,
    "term": 24,
    "rate": 0.32,
    "rateLabel": "%0.32",
    "monthly": 4435,
    "total": 106444,
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
    "title": "€120.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.42 Kar Payı)",
    "principal": 120000,
    "term": 36,
    "rate": 0.42,
    "rateLabel": "%0.42",
    "monthly": 3713,
    "total": 133674,
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
    "title": "€100.000 — 24 Ay (%0.17 Faiz)",
    "principal": 100000,
    "term": 24,
    "rate": 0.17,
    "rateLabel": "%0.17",
    "monthly": 4262,
    "total": 102281,
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
    "total": 105899,
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
    "total": 110135,
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
    "total": 114403,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "garanti_h_eur_esit_110000_24",
    "title": "€110.000 — 24 Ay (%0.21 Faiz)",
    "principal": 110000,
    "term": 24,
    "rate": 0.21,
    "rateLabel": "%0.21",
    "monthly": 4710,
    "total": 113046,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "garanti_h_eur_odemesiz_100000_36_g6",
    "title": "€100.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.38 Faiz)",
    "principal": 100000,
    "term": 36,
    "rate": 0.38,
    "rateLabel": "%0.38",
    "monthly": 3059,
    "total": 110135,
    "currency": "EUR",
    "gracePeriodMonths": 6,
    "gracePeriod": 6,
    "totalTerm": 42,
    "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
    "tag": "6 AY ÖDEMESİZ",
    "bankId": "garanti"
  },
  {
    "id": "albaraka_h_eur_esit_100000_6",
    "title": "€100.000 — 6 Ay (%0 Kar Payı)",
    "principal": 100000,
    "term": 6,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 16667,
    "total": 100000,
    "currency": "EUR",
    "tag": "%0 FAİZ",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_esit_100000_12",
    "title": "€100.000 — 12 Ay (%0 Kar Payı)",
    "principal": 100000,
    "term": 12,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 8333,
    "total": 100000,
    "currency": "EUR",
    "tag": "%0 FAİZ",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_esit_100000_18",
    "title": "€100.000 — 18 Ay (%0.03 Kar Payı)",
    "principal": 100000,
    "term": 18,
    "rate": 0.03,
    "rateLabel": "%0.03",
    "monthly": 5573,
    "total": 100319,
    "currency": "EUR",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_esit_100000_24",
    "title": "€100.000 — 24 Ay (%0.15 Kar Payı)",
    "principal": 100000,
    "term": 24,
    "rate": 0.15,
    "rateLabel": "%0.15",
    "monthly": 4251,
    "total": 102030,
    "currency": "EUR",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_esit_100000_36",
    "title": "€100.000 — 36 Ay (%0.29 Kar Payı)",
    "principal": 100000,
    "term": 36,
    "rate": 0.29,
    "rateLabel": "%0.29",
    "monthly": 2942,
    "total": 105912,
    "currency": "EUR",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_esit_100000_48",
    "title": "€100.000 — 48 Ay (%0.38 Kar Payı)",
    "principal": 100000,
    "term": 48,
    "rate": 0.38,
    "rateLabel": "%0.38",
    "monthly": 2295,
    "total": 110151,
    "currency": "EUR",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_odemesiz_100000_6_g6",
    "title": "€100.000 — 6 Ay Ödemesiz + 6 Eşit Taksit (%0 Kar Payı)",
    "principal": 100000,
    "term": 6,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 16667,
    "total": 100000,
    "currency": "EUR",
    "gracePeriodMonths": 6,
    "gracePeriod": 6,
    "totalTerm": 12,
    "desc": "İlk 6 ay ödeme yok, ardından 6 eşit taksit",
    "tag": "6 AY ÖDEMESİZ",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_odemesiz_100000_12_g6",
    "title": "€100.000 — 6 Ay Ödemesiz + 12 Eşit Taksit (%0.12 Kar Payı)",
    "principal": 100000,
    "term": 12,
    "rate": 0.12,
    "rateLabel": "%0.12",
    "monthly": 8458,
    "total": 101497,
    "currency": "EUR",
    "gracePeriodMonths": 6,
    "gracePeriod": 6,
    "totalTerm": 18,
    "desc": "İlk 6 ay ödeme yok, ardından 12 eşit taksit",
    "tag": "6 AY ÖDEMESİZ",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_odemesiz_100000_24_g6",
    "title": "€100.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.28 Kar Payı)",
    "principal": 100000,
    "term": 24,
    "rate": 0.28,
    "rateLabel": "%0.28",
    "monthly": 4391,
    "total": 105388,
    "currency": "EUR",
    "gracePeriodMonths": 6,
    "gracePeriod": 6,
    "totalTerm": 30,
    "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
    "tag": "6 AY ÖDEMESİZ",
    "bankId": "albaraka"
  },
  {
    "id": "albaraka_h_eur_odemesiz_100000_36_g6",
    "title": "€100.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.37 Kar Payı)",
    "principal": 100000,
    "term": 36,
    "rate": 0.37,
    "rateLabel": "%0.37",
    "monthly": 3046,
    "total": 109644,
    "currency": "EUR",
    "gracePeriodMonths": 6,
    "gracePeriod": 6,
    "totalTerm": 42,
    "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
    "tag": "6 AY ÖDEMESİZ",
    "bankId": "albaraka"
  },
  {
    "id": "denizbank_h_eur_esit_100000_24",
    "title": "€100.000 — 24 Ay (%0.31 Faiz)",
    "principal": 100000,
    "term": 24,
    "rate": 0.31,
    "rateLabel": "%0.31",
    "monthly": 4338,
    "total": 104120,
    "currency": "EUR",
    "bankId": "denizbank"
  },
  {
    "id": "denizbank_h_eur_esit_100000_36",
    "title": "€100.000 — 36 Ay (%0.48 Faiz)",
    "principal": 100000,
    "term": 36,
    "rate": 0.48,
    "rateLabel": "%0.48",
    "monthly": 3048,
    "total": 109710,
    "currency": "EUR",
    "bankId": "denizbank"
  },
  {
    "id": "denizbank_h_eur_esit_100000_48",
    "title": "€100.000 — 48 Ay (%0.60 Faiz)",
    "principal": 100000,
    "term": 48,
    "rate": 0.6,
    "rateLabel": "%0.60",
    "monthly": 2420,
    "total": 116170,
    "currency": "EUR",
    "bankId": "denizbank"
  },
  {
    "id": "denizbank_h_eur_esit_100000_60",
    "title": "€100.000 — 60 Ay (%0.68 Faiz)",
    "principal": 100000,
    "term": 60,
    "rate": 0.68,
    "rateLabel": "%0.68",
    "monthly": 2059,
    "total": 123568,
    "currency": "EUR",
    "bankId": "denizbank"
  },
  {
    "id": "denizbank_h_eur_esit_120000_24",
    "title": "€120.000 — 24 Ay (%0.38 Faiz)",
    "principal": 120000,
    "term": 24,
    "rate": 0.38,
    "rateLabel": "%0.38",
    "monthly": 5252,
    "total": 126039,
    "currency": "EUR",
    "bankId": "denizbank"
  },
  {
    "id": "denizbank_h_eur_esit_120000_36",
    "title": "€120.000 — 36 Ay (%0.53 Faiz)",
    "principal": 120000,
    "term": 36,
    "rate": 0.53,
    "rateLabel": "%0.53",
    "monthly": 3689,
    "total": 132807,
    "currency": "EUR",
    "bankId": "denizbank"
  },
  {
    "id": "denizbank_h_eur_esit_120000_48",
    "title": "€120.000 — 48 Ay (%0.63 Faiz)",
    "principal": 120000,
    "term": 48,
    "rate": 0.63,
    "rateLabel": "%0.63",
    "monthly": 2930,
    "total": 140625,
    "currency": "EUR",
    "bankId": "denizbank"
  },
  {
    "id": "denizbank_h_eur_esit_120000_60",
    "title": "€120.000 — 60 Ay (%0.71 Faiz)",
    "principal": 120000,
    "term": 60,
    "rate": 0.71,
    "rateLabel": "%0.71",
    "monthly": 2493,
    "total": 149585,
    "currency": "EUR",
    "bankId": "denizbank"
  }
];

export const EUR_PARTNER_BANKS = [
  {
    "id": "kuveyt_turk",
    "name": "Kuveyt Türk",
    "shortName": "Kuveyt Türk",
    "badge": "€50K-€110K %0 Kâr Payı & 6 Ay Ödemesiz",
    "icon": "🌿",
    "color": "#10b981",
    "bg": "rgba(16, 185, 129, 0.15)",
    "border": "rgba(52, 211, 153, 0.4)",
    "desc": "€50K-€60K 24 ay %0, €80K-€110K 12 ay %0 ve 6 ay ödemesiz Euro finansmanı"
  },
  {
    "id": "garanti",
    "name": "Garanti BBVA",
    "shortName": "Garanti",
    "badge": "60 Ay Vade & 36+6 Ay Ödemesiz",
    "icon": "🍀",
    "color": "#22c55e",
    "bg": "rgba(34, 197, 94, 0.15)",
    "border": "rgba(74, 222, 128, 0.4)",
    "desc": "€100.000-%110.000 için 24-60 ay ve %0.38'li 6 ay ödemesiz 36 ay Euro seçenekleri"
  },
  {
    "id": "albaraka",
    "name": "Albaraka Türk",
    "shortName": "Albaraka",
    "badge": "€100K 12 Ay %0 Kâr Payı",
    "icon": "🕌",
    "color": "#f97316",
    "bg": "rgba(249, 115, 22, 0.15)",
    "border": "rgba(251, 146, 60, 0.4)",
    "desc": "€100.000 için 6 ve 12 ay %0 kâr payı, 48 aya kadar vade ve 6 ay ödemesiz"
  },
  {
    "id": "denizbank",
    "name": "DenizBank",
    "shortName": "DenizBank",
    "badge": "€100K-€120K 60 Ay Sabit Taksit",
    "icon": "⚓",
    "color": "#0ea5e9",
    "bg": "rgba(14, 165, 233, 0.15)",
    "border": "rgba(56, 189, 248, 0.4)",
    "desc": "€100.000, €110.000 ve €120.000 için 24-60 ay sabit Euro taksitli S-Way/T-Way finansmanı"
  }
];

export function calculateEurLoan(principal, termMonths = 36, annualRatePct = 5.49) {
  const p = Number(principal);
  const n = termMonths === '' || termMonths == null ? 12 : Number(termMonths);
  const annualRate = annualRatePct === '' || annualRatePct == null ? 5.49 : Number(annualRatePct);
  if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(n) || n <= 0 || !Number.isFinite(annualRate) || annualRate < 0) {
    return { monthly: 0, total: 0, totalInterest: 0 };
  }
  if (annualRate === 0) {
    const monthly = Math.round(p / n);
    return {
      principal: p,
      termMonths: n,
      annualRatePct: 0,
      monthly,
      total: p,
      totalInterest: 0
    };
  }
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
    "badge": "€50K–€110K %0 Kâr Payı • 2.5M–6M TL • 6 Ay Ödemesiz",
    "sifirFaizTL": [],
    "esitTaksitTL": [
      {
        "id": "kuveyt_turk_h_try_esit_2500000_6",
        "title": "2.500.000 TL — 6 Ay (%0.52 Kar Payı)",
        "principal": 2500000,
        "term": 6,
        "rate": 0.52,
        "rateLabel": "%0.52",
        "monthly": 424768,
        "total": 2548605,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_2500000_12",
        "title": "2.500.000 TL — 12 Ay (%1.78 Kar Payı)",
        "principal": 2500000,
        "term": 12,
        "rate": 1.78,
        "rateLabel": "%1.78",
        "monthly": 234858,
        "total": 2818301,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_2500000_24",
        "title": "2.500.000 TL — 24 Ay (%2.27 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rate": 2.27,
        "rateLabel": "%2.27",
        "monthly": 138505,
        "total": 3324116,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_3000000_12",
        "title": "3.000.000 TL — 12 Ay (%2.07 Kar Payı)",
        "principal": 3000000,
        "term": 12,
        "rate": 2.07,
        "rateLabel": "%2.07",
        "monthly": 287214,
        "total": 3446563,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.43 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.43,
        "rateLabel": "%2.43",
        "monthly": 169363,
        "total": 4064709,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_3000000_36",
        "title": "3.000.000 TL — 36 Ay (%2.59 Kar Payı)",
        "principal": 3000000,
        "term": 36,
        "rate": 2.59,
        "rateLabel": "%2.59",
        "monthly": 132514,
        "total": 4770499,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%2.63 Kar Payı)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.63,
        "rateLabel": "%2.63",
        "monthly": 231139,
        "total": 5547340,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%2.74 Kar Payı)",
        "principal": 4000000,
        "term": 36,
        "rate": 2.74,
        "rateLabel": "%2.74",
        "monthly": 180999,
        "total": 6515975,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%2.82 Kar Payı)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.82,
        "rateLabel": "%2.82",
        "monthly": 229152,
        "total": 8249478,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_6000000_48",
        "title": "6.000.000 TL — 48 Ay (%2.88 Kar Payı)",
        "principal": 6000000,
        "term": 48,
        "rate": 2.88,
        "rateLabel": "%2.88",
        "monthly": 240454,
        "total": 11541811,
        "currency": "TRY"
      }
    ],
    "odemesiz6AyTL": [
      {
        "id": "kuveyt_turk_h_try_odemesiz_2500000_24_g6",
        "title": "2.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.48 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rate": 2.48,
        "rateLabel": "%2.48",
        "monthly": 163066,
        "total": 3913582,
        "currency": "TRY",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_try_odemesiz_3000000_24_g6",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.59 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.59,
        "rateLabel": "%2.59",
        "monthly": 199189,
        "total": 4780533,
        "currency": "TRY",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_try_odemesiz_5000000_36_g6",
        "title": "5.000.000 TL — 6 Ay Ödemesiz + 36 Eşit Taksit (%2.83 Kar Payı)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.83,
        "rateLabel": "%2.83",
        "monthly": 266049,
        "total": 9577758,
        "currency": "TRY",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      }
    ],
    "esitTaksitEUR": [
      {
        "id": "kuveyt_turk_h_eur_esit_50000_9",
        "title": "€50.000 — 9 Ay (%0 Kar Payı)",
        "principal": 50000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 5556,
        "total": 50000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_50000_12",
        "title": "€50.000 — 12 Ay (%0 Kar Payı)",
        "principal": 50000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 4167,
        "total": 50000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_50000_18",
        "title": "€50.000 — 18 Ay (%0 Kar Payı)",
        "principal": 50000,
        "term": 18,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 2778,
        "total": 50000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_50000_24",
        "title": "€50.000 — 24 Ay (%0 Kar Payı)",
        "principal": 50000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 2083,
        "total": 50000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_50000_36",
        "title": "€50.000 — 36 Ay (%0.04 Kar Payı)",
        "principal": 50000,
        "term": 36,
        "rate": 0.04,
        "rateLabel": "%0.04",
        "monthly": 1400,
        "total": 50395,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_50000_48",
        "title": "€50.000 — 48 Ay (%0.17 Kar Payı)",
        "principal": 50000,
        "term": 48,
        "rate": 0.17,
        "rateLabel": "%0.17",
        "monthly": 1089,
        "total": 52249,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_60000_9",
        "title": "€60.000 — 9 Ay (%0 Kar Payı)",
        "principal": 60000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 6667,
        "total": 60000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_60000_12",
        "title": "€60.000 — 12 Ay (%0 Kar Payı)",
        "principal": 60000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 5000,
        "total": 60000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_60000_18",
        "title": "€60.000 — 18 Ay (%0 Kar Payı)",
        "principal": 60000,
        "term": 18,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 3333,
        "total": 60000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_60000_24",
        "title": "€60.000 — 24 Ay (%0 Kar Payı)",
        "principal": 60000,
        "term": 24,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 2500,
        "total": 60000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_60000_36",
        "title": "€60.000 — 36 Ay (%0.13 Kar Payı)",
        "principal": 60000,
        "term": 36,
        "rate": 0.13,
        "rateLabel": "%0.13",
        "monthly": 1710,
        "total": 61550,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_60000_48",
        "title": "€60.000 — 48 Ay (%0.24 Kar Payı)",
        "principal": 60000,
        "term": 48,
        "rate": 0.24,
        "rateLabel": "%0.24",
        "monthly": 1330,
        "total": 63834,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_70000_9",
        "title": "€70.000 — 9 Ay (%0 Kar Payı)",
        "principal": 70000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 7778,
        "total": 70000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_70000_12",
        "title": "€70.000 — 12 Ay (%0 Kar Payı)",
        "principal": 70000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 5833,
        "total": 70000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_70000_18",
        "title": "€70.000 — 18 Ay (%0 Kar Payı)",
        "principal": 70000,
        "term": 18,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 3889,
        "total": 70000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_70000_24",
        "title": "€70.000 — 24 Ay (%0.02 Kar Payı)",
        "principal": 70000,
        "term": 24,
        "rate": 0.02,
        "rateLabel": "%0.02",
        "monthly": 2924,
        "total": 70187,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_70000_36",
        "title": "€70.000 — 36 Ay (%0.20 Kar Payı)",
        "principal": 70000,
        "term": 36,
        "rate": 0.2,
        "rateLabel": "%0.20",
        "monthly": 2022,
        "total": 72794,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_70000_48",
        "title": "€70.000 — 48 Ay (%0.29 Kar Payı)",
        "principal": 70000,
        "term": 48,
        "rate": 0.29,
        "rateLabel": "%0.29",
        "monthly": 1571,
        "total": 75428,
        "currency": "EUR"
      },
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
        "title": "€80.000 — 18 Ay (%0.02 Kar Payı)",
        "principal": 80000,
        "term": 18,
        "rate": 0.02,
        "rateLabel": "%0.02",
        "monthly": 4453,
        "total": 80162,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_80000_24",
        "title": "€80.000 — 24 Ay (%0.09 Kar Payı)",
        "principal": 80000,
        "term": 24,
        "rate": 0.09,
        "rateLabel": "%0.09",
        "monthly": 3373,
        "total": 80962,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_80000_36",
        "title": "€80.000 — 36 Ay (%0.25 Kar Payı)",
        "principal": 80000,
        "term": 36,
        "rate": 0.25,
        "rateLabel": "%0.25",
        "monthly": 2333,
        "total": 84004,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_80000_48",
        "title": "€80.000 — 48 Ay (%0.33 Kar Payı)",
        "principal": 80000,
        "term": 48,
        "rate": 0.33,
        "rateLabel": "%0.33",
        "monthly": 1814,
        "total": 87081,
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
        "title": "€90.000 — 18 Ay (%0.10 Kar Payı)",
        "principal": 90000,
        "term": 18,
        "rate": 0.1,
        "rateLabel": "%0.10",
        "monthly": 5051,
        "total": 90913,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_90000_24",
        "title": "€90.000 — 24 Ay (%0.15 Kar Payı)",
        "principal": 90000,
        "term": 24,
        "rate": 0.15,
        "rateLabel": "%0.15",
        "monthly": 3825,
        "total": 91809,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_90000_36",
        "title": "€90.000 — 36 Ay (%0.29 Kar Payı)",
        "principal": 90000,
        "term": 36,
        "rate": 0.29,
        "rateLabel": "%0.29",
        "monthly": 2645,
        "total": 95236,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_90000_48",
        "title": "€90.000 — 48 Ay (%0.36 Kar Payı)",
        "principal": 90000,
        "term": 48,
        "rate": 0.36,
        "rateLabel": "%0.36",
        "monthly": 2056,
        "total": 98710,
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
        "title": "€100.000 — 18 Ay (%0.16 Kar Payı)",
        "principal": 100000,
        "term": 18,
        "rate": 0.16,
        "rateLabel": "%0.16",
        "monthly": 5646,
        "total": 101626,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_100000_24",
        "title": "€100.000 — 24 Ay (%0.19 Kar Payı)",
        "principal": 100000,
        "term": 24,
        "rate": 0.19,
        "rateLabel": "%0.19",
        "monthly": 4273,
        "total": 102550,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_100000_36",
        "title": "€100.000 — 36 Ay (%0.32 Kar Payı)",
        "principal": 100000,
        "term": 36,
        "rate": 0.32,
        "rateLabel": "%0.32",
        "monthly": 2956,
        "total": 106432,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_100000_48",
        "title": "€100.000 — 48 Ay (%0.38 Kar Payı)",
        "principal": 100000,
        "term": 48,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 2297,
        "total": 110232,
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
        "title": "€110.000 — 18 Ay (%0.21 Kar Payı)",
        "principal": 110000,
        "term": 18,
        "rate": 0.21,
        "rateLabel": "%0.21",
        "monthly": 6242,
        "total": 112351,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_24",
        "title": "€110.000 — 24 Ay (%0.23 Kar Payı)",
        "principal": 110000,
        "term": 24,
        "rate": 0.23,
        "rateLabel": "%0.23",
        "monthly": 4725,
        "total": 113399,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_36",
        "title": "€110.000 — 36 Ay (%0.34 Kar Payı)",
        "principal": 110000,
        "term": 36,
        "rate": 0.34,
        "rateLabel": "%0.34",
        "monthly": 3265,
        "total": 117527,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_110000_48",
        "title": "€110.000 — 48 Ay (%0.40 Kar Payı)",
        "principal": 110000,
        "term": 48,
        "rate": 0.4,
        "rateLabel": "%0.40",
        "monthly": 2539,
        "total": 121868,
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
        "title": "€120.000 — 12 Ay (%0.05 Kar Payı)",
        "principal": 120000,
        "term": 12,
        "rate": 0.05,
        "rateLabel": "%0.05",
        "monthly": 10035,
        "total": 120415,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_18",
        "title": "€120.000 — 18 Ay (%0.25 Kar Payı)",
        "principal": 120000,
        "term": 18,
        "rate": 0.25,
        "rateLabel": "%0.25",
        "monthly": 6836,
        "total": 123056,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_24",
        "title": "€120.000 — 24 Ay (%0.26 Kar Payı)",
        "principal": 120000,
        "term": 24,
        "rate": 0.26,
        "rateLabel": "%0.26",
        "monthly": 5175,
        "total": 124197,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_36",
        "title": "€120.000 — 36 Ay (%0.36 Kar Payı)",
        "principal": 120000,
        "term": 36,
        "rate": 0.36,
        "rateLabel": "%0.36",
        "monthly": 3575,
        "total": 128705,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_120000_48",
        "title": "€120.000 — 48 Ay (%0.42 Kar Payı)",
        "principal": 120000,
        "term": 48,
        "rate": 0.42,
        "rateLabel": "%0.42",
        "monthly": 2784,
        "total": 133615,
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
        "title": "€130.000 — 12 Ay (%0.10 Kar Payı)",
        "principal": 130000,
        "term": 12,
        "rate": 0.1,
        "rateLabel": "%0.10",
        "monthly": 10908,
        "total": 130901,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_18",
        "title": "€130.000 — 18 Ay (%0.28 Kar Payı)",
        "principal": 130000,
        "term": 18,
        "rate": 0.28,
        "rateLabel": "%0.28",
        "monthly": 7428,
        "total": 133710,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_24",
        "title": "€130.000 — 24 Ay (%0.28 Kar Payı)",
        "principal": 130000,
        "term": 24,
        "rate": 0.28,
        "rateLabel": "%0.28",
        "monthly": 5621,
        "total": 134901,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_36",
        "title": "€130.000 — 36 Ay (%0.38 Kar Payı)",
        "principal": 130000,
        "term": 36,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 3888,
        "total": 139966,
        "currency": "EUR"
      },
      {
        "id": "kuveyt_turk_h_eur_esit_130000_48",
        "title": "€130.000 — 48 Ay (%0.43 Kar Payı)",
        "principal": 130000,
        "term": 48,
        "rate": 0.43,
        "rateLabel": "%0.43",
        "monthly": 3023,
        "total": 145114,
        "currency": "EUR"
      }
    ],
    "odemesiz6AyEUR": [
      {
        "id": "kuveyt_turk_h_eur_odemesiz_60000_24_g6",
        "title": "€60.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.13 Kar Payı)",
        "principal": 60000,
        "term": 24,
        "rate": 0.13,
        "rateLabel": "%0.13",
        "monthly": 2565,
        "total": 61551,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_60000_36_g6",
        "title": "€60.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.24 Kar Payı)",
        "principal": 60000,
        "term": 36,
        "rate": 0.24,
        "rateLabel": "%0.24",
        "monthly": 1773,
        "total": 63843,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_80000_24_g6",
        "title": "€80.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.25 Kar Payı)",
        "principal": 80000,
        "term": 24,
        "rate": 0.25,
        "rateLabel": "%0.25",
        "monthly": 3500,
        "total": 84009,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_80000_36_g6",
        "title": "€80.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.33 Kar Payı)",
        "principal": 80000,
        "term": 36,
        "rate": 0.33,
        "rateLabel": "%0.33",
        "monthly": 2420,
        "total": 87105,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_90000_24_g6",
        "title": "€90.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.29 Kar Payı)",
        "principal": 90000,
        "term": 24,
        "rate": 0.29,
        "rateLabel": "%0.29",
        "monthly": 3969,
        "total": 95245,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_90000_36_g6",
        "title": "€90.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.36 Kar Payı)",
        "principal": 90000,
        "term": 36,
        "rate": 0.36,
        "rateLabel": "%0.36",
        "monthly": 2743,
        "total": 98742,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_100000_24_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.32 Kar Payı)",
        "principal": 100000,
        "term": 24,
        "rate": 0.32,
        "rateLabel": "%0.32",
        "monthly": 4435,
        "total": 106444,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_100000_36_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.38 Kar Payı)",
        "principal": 100000,
        "term": 36,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 3063,
        "total": 110273,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_110000_24_g6",
        "title": "€110.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.34 Kar Payı)",
        "principal": 110000,
        "term": 24,
        "rate": 0.34,
        "rateLabel": "%0.34",
        "monthly": 4898,
        "total": 117541,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_110000_36_g6",
        "title": "€110.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.40 Kar Payı)",
        "principal": 110000,
        "term": 36,
        "rate": 0.4,
        "rateLabel": "%0.40",
        "monthly": 3387,
        "total": 121917,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_120000_24_g6",
        "title": "€120.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.36 Kar Payı)",
        "principal": 120000,
        "term": 24,
        "rate": 0.36,
        "rateLabel": "%0.36",
        "monthly": 5363,
        "total": 128724,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_120000_36_g6",
        "title": "€120.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.42 Kar Payı)",
        "principal": 120000,
        "term": 36,
        "rate": 0.42,
        "rateLabel": "%0.42",
        "monthly": 3713,
        "total": 133674,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_130000_24_g6",
        "title": "€130.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.38 Kar Payı)",
        "principal": 130000,
        "term": 24,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 5833,
        "total": 139989,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "kuveyt_turk_h_eur_odemesiz_130000_36_g6",
        "title": "€130.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.43 Kar Payı)",
        "principal": 130000,
        "term": 36,
        "rate": 0.43,
        "rateLabel": "%0.43",
        "monthly": 4033,
        "total": 145179,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      }
    ]
  },
  "albaraka": {
    "name": "Albaraka Türk Katılım",
    "badge": "1M - 2M TL & €100K %0 Kâr Payı • 6 Ay Ödemesiz",
    "sifirFaizTL": [
      {
        "id": "albaraka_h_try_esit_1000000_12",
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
      },
      {
        "id": "albaraka_h_try_esit_1500000_6",
        "title": "1.500.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1500000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 250000,
        "total": 1500000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "albaraka_h_try_esit_2000000_6",
        "title": "2.000.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 2000000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 333333,
        "total": 2000000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      }
    ],
    "esitTaksitTL": [
      {
        "id": "albaraka_h_try_esit_1500000_12",
        "title": "1.500.000 TL — 12 Ay (%0.77 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rate": 0.77,
        "rateLabel": "%0.77",
        "monthly": 131764,
        "total": 1581166,
        "currency": "TRY"
      },
      {
        "id": "albaraka_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.17 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.17,
        "rateLabel": "%2.17",
        "monthly": 109547,
        "total": 2629124,
        "currency": "TRY"
      },
      {
        "id": "albaraka_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.55 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.55,
        "rateLabel": "%2.55",
        "monthly": 172004,
        "total": 4128086,
        "currency": "TRY"
      },
      {
        "id": "albaraka_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%2.74 Kar Payı)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.74,
        "rateLabel": "%2.74",
        "monthly": 234460,
        "total": 5627048,
        "currency": "TRY"
      },
      {
        "id": "albaraka_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%2.80 Kar Payı)",
        "principal": 4000000,
        "term": 36,
        "rate": 2.8,
        "rateLabel": "%2.80",
        "monthly": 182916,
        "total": 6584968,
        "currency": "TRY"
      },
      {
        "id": "albaraka_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%2.88 Kar Payı)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.88,
        "rateLabel": "%2.88",
        "monthly": 231627,
        "total": 8338567,
        "currency": "TRY"
      },
      {
        "id": "albaraka_h_try_esit_6000000_48",
        "title": "6.000.000 TL — 48 Ay (%2.98 Kar Payı)",
        "principal": 6000000,
        "term": 48,
        "rate": 2.98,
        "rateLabel": "%2.98",
        "monthly": 245666,
        "total": 11791961,
        "currency": "TRY"
      }
    ],
    "odemesiz6AyTL": [
      {
        "id": "albaraka_h_try_odemesiz_3000000_24_g6",
        "title": "3.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit (%2.68 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.68,
        "rateLabel": "%2.68",
        "monthly": 200977,
        "total": 4823444,
        "currency": "TRY",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "albaraka_h_try_odemesiz_5000000_36_g6",
        "title": "5.000.000 TL — 6 Ay Ödemesiz + 36 Eşit Taksit (%2.96 Kar Payı)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.96,
        "rateLabel": "%2.96",
        "monthly": 273499,
        "total": 9845972,
        "currency": "TRY",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      }
    ],
    "esitTaksitEUR": [
      {
        "id": "albaraka_h_eur_esit_100000_6",
        "title": "€100.000 — 6 Ay (%0 Kar Payı)",
        "principal": 100000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 16667,
        "total": 100000,
        "currency": "EUR",
        "tag": "%0 FAİZ"
      },
      {
        "id": "albaraka_h_eur_esit_100000_12",
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
        "id": "albaraka_h_eur_esit_100000_18",
        "title": "€100.000 — 18 Ay (%0.03 Kar Payı)",
        "principal": 100000,
        "term": 18,
        "rate": 0.03,
        "rateLabel": "%0.03",
        "monthly": 5573,
        "total": 100319,
        "currency": "EUR"
      },
      {
        "id": "albaraka_h_eur_esit_100000_24",
        "title": "€100.000 — 24 Ay (%0.15 Kar Payı)",
        "principal": 100000,
        "term": 24,
        "rate": 0.15,
        "rateLabel": "%0.15",
        "monthly": 4251,
        "total": 102030,
        "currency": "EUR"
      },
      {
        "id": "albaraka_h_eur_esit_100000_36",
        "title": "€100.000 — 36 Ay (%0.29 Kar Payı)",
        "principal": 100000,
        "term": 36,
        "rate": 0.29,
        "rateLabel": "%0.29",
        "monthly": 2942,
        "total": 105912,
        "currency": "EUR"
      },
      {
        "id": "albaraka_h_eur_esit_100000_48",
        "title": "€100.000 — 48 Ay (%0.38 Kar Payı)",
        "principal": 100000,
        "term": 48,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 2295,
        "total": 110151,
        "currency": "EUR"
      }
    ],
    "odemesiz6AyEUR": [
      {
        "id": "albaraka_h_eur_odemesiz_100000_6_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 6 Eşit Taksit (%0 Kar Payı)",
        "principal": 100000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 16667,
        "total": 100000,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 12,
        "desc": "İlk 6 ay ödeme yok, ardından 6 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "albaraka_h_eur_odemesiz_100000_12_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 12 Eşit Taksit (%0.12 Kar Payı)",
        "principal": 100000,
        "term": 12,
        "rate": 0.12,
        "rateLabel": "%0.12",
        "monthly": 8458,
        "total": 101497,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 18,
        "desc": "İlk 6 ay ödeme yok, ardından 12 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "albaraka_h_eur_odemesiz_100000_24_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.28 Kar Payı)",
        "principal": 100000,
        "term": 24,
        "rate": 0.28,
        "rateLabel": "%0.28",
        "monthly": 4391,
        "total": 105388,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      },
      {
        "id": "albaraka_h_eur_odemesiz_100000_36_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.37 Kar Payı)",
        "principal": 100000,
        "term": 36,
        "rate": 0.37,
        "rateLabel": "%0.37",
        "monthly": 3046,
        "total": 109644,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      }
    ]
  },
  "garanti": {
    "name": "Garanti BBVA",
    "badge": "1M-1.1M TL %0 Faiz • 6M TL & 60 Ay • €100K–€110K Euro",
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
    ],
    "esitTaksitTL": [
      {
        "id": "garanti_h_try_esit_1000000_24",
        "title": "1.000.000 TL — 24 Ay (%0.79 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rate": 0.79,
        "rateLabel": "%0.79",
        "monthly": 46133,
        "total": 1107196,
        "currency": "TRY"
      },
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
        "title": "2.000.000 TL — 24 Ay (%2.04 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.04,
        "rateLabel": "%2.04",
        "monthly": 107403,
        "total": 2577673,
        "currency": "TRY"
      },
      {
        "id": "garanti_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.43 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.43,
        "rateLabel": "%2.43",
        "monthly": 168689,
        "total": 4048542,
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
        "title": "4.000.000 TL — 24 Ay (%2.62 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.62,
        "rateLabel": "%2.62",
        "monthly": 229979,
        "total": 5519491,
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
        "title": "€100.000 — 24 Ay (%0.17 Faiz)",
        "principal": 100000,
        "term": 24,
        "rate": 0.17,
        "rateLabel": "%0.17",
        "monthly": 4262,
        "total": 102281,
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
        "total": 105899,
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
        "total": 110135,
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
        "total": 114403,
        "currency": "EUR"
      },
      {
        "id": "garanti_h_eur_esit_110000_24",
        "title": "€110.000 — 24 Ay (%0.21 Faiz)",
        "principal": 110000,
        "term": 24,
        "rate": 0.21,
        "rateLabel": "%0.21",
        "monthly": 4710,
        "total": 113046,
        "currency": "EUR"
      }
    ],
    "odemesiz6AyEUR": [
      {
        "id": "garanti_h_eur_odemesiz_100000_36_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 36 Eşit Taksit (%0.38 Faiz)",
        "principal": 100000,
        "term": 36,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 3059,
        "total": 110135,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 42,
        "desc": "İlk 6 ay ödeme yok, ardından 36 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
      }
    ]
  },
  "akbank": {
    "name": "Akbank",
    "badge": "1M - 2.18M TL %0 Faiz • 5M TL'ye Kadar Finansman",
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
        "id": "akbank_h_try_esit_1250000_12",
        "title": "1.250.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1250000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 104167,
        "total": 1250000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "akbank_h_try_esit_1580000_9",
        "title": "1.580.000 TL — 9 Ay (%0 Faiz)",
        "principal": 1580000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 175556,
        "total": 1580000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "akbank_h_try_esit_2180000_6",
        "title": "2.180.000 TL — 6 Ay (%0 Faiz)",
        "principal": 2180000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 363333,
        "total": 2180000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      }
    ],
    "esitTaksitTL": [
      {
        "id": "akbank_h_try_esit_1500000_12",
        "title": "1.500.000 TL — 12 Ay (%0.59 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rate": 0.59,
        "rateLabel": "%0.59",
        "monthly": 130090,
        "total": 1561085,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.19 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.19,
        "rateLabel": "%2.19",
        "monthly": 109364,
        "total": 2624728,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.58 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.58,
        "rateLabel": "%2.58",
        "monthly": 171636,
        "total": 4119257,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%2.78 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.78,
        "rateLabel": "%2.78",
        "monthly": 234134,
        "total": 5619205,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%2.93 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rate": 2.93,
        "rateLabel": "%2.93",
        "monthly": 185313,
        "total": 6671250,
        "currency": "TRY"
      },
      {
        "id": "akbank_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%3.02 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 3.02,
        "rateLabel": "%3.02",
        "monthly": 234900,
        "total": 8456390,
        "currency": "TRY"
      }
    ]
  },
  "is_bankasi": {
    "name": "Türkiye İş Bankası",
    "badge": "1M TL 12 Ay %0 Faiz • 6M TL Ticari Filo Kredisi",
    "sifirFaizTL": [
      {
        "id": "is_bankasi_h_try_esit_1000000_12",
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
      }
    ],
    "esitTaksitTL": [
      {
        "id": "is_bankasi_h_try_esit_1000000_24",
        "title": "1.000.000 TL — 24 Ay (%1.03 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rate": 1.03,
        "rateLabel": "%1.03",
        "monthly": 47514,
        "total": 1140330,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_1500000_12",
        "title": "1.500.000 TL — 12 Ay (%0.86 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rate": 0.86,
        "rateLabel": "%0.86",
        "monthly": 132431,
        "total": 1589176,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_2000000_12",
        "title": "2.000.000 TL — 12 Ay (%1.59 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rate": 1.59,
        "rateLabel": "%1.59",
        "monthly": 185326,
        "total": 2223908,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.29 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.29,
        "rateLabel": "%2.29",
        "monthly": 110598,
        "total": 2654344,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.68 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.68,
        "rateLabel": "%2.68",
        "monthly": 173671,
        "total": 4168112,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_3000000_36",
        "title": "3.000.000 TL — 36 Ay (%2.84 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rate": 2.84,
        "rateLabel": "%2.84",
        "monthly": 137129,
        "total": 4936629,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%2.88 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.88,
        "rateLabel": "%2.88",
        "monthly": 236747,
        "total": 5681933,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%2.99 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rate": 2.99,
        "rateLabel": "%2.99",
        "monthly": 186933,
        "total": 6729576,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%3.07 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 3.07,
        "rateLabel": "%3.07",
        "monthly": 236720,
        "total": 8521923,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_6000000_48",
        "title": "6.000.000 TL — 48 Ay (%3.26 Faiz)",
        "principal": 6000000,
        "term": 48,
        "rate": 3.26,
        "rateLabel": "%3.26",
        "monthly": 256525,
        "total": 12313220,
        "currency": "TRY"
      }
    ]
  },
  "denizbank": {
    "name": "DenizBank",
    "badge": "S-Way & T-Way 1M–5M TL • €100K–€120K 60 Ay Finansman",
    "sifirFaizTL": [],
    "esitTaksitTL": [
      {
        "id": "denizbank_h_try_esit_1000000_24",
        "title": "1.000.000 TL — 24 Ay (%0.83 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rate": 0.83,
        "rateLabel": "%0.83",
        "monthly": 46357,
        "total": 1112579,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_1000000_36",
        "title": "1.000.000 TL — 36 Ay (%1.46 Faiz)",
        "principal": 1000000,
        "term": 36,
        "rate": 1.46,
        "rateLabel": "%1.46",
        "monthly": 36436,
        "total": 1311700,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_1000000_48",
        "title": "1.000.000 TL — 48 Ay (%1.79 Faiz)",
        "principal": 1000000,
        "term": 48,
        "rate": 1.79,
        "rateLabel": "%1.79",
        "monthly": 31921,
        "total": 1532210,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_1000000_60",
        "title": "1.000.000 TL — 60 Ay (%1.95 Faiz)",
        "principal": 1000000,
        "term": 60,
        "rate": 1.95,
        "rateLabel": "%1.95",
        "monthly": 29223,
        "total": 1753355,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.08 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.08,
        "rateLabel": "%2.08",
        "monthly": 108167,
        "total": 2596008,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_2000000_36",
        "title": "2.000.000 TL — 36 Ay (%2.37 Faiz)",
        "principal": 2000000,
        "term": 36,
        "rate": 2.37,
        "rateLabel": "%2.37",
        "monthly": 85017,
        "total": 3060602,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_2000000_48",
        "title": "2.000.000 TL — 48 Ay (%2.52 Faiz)",
        "principal": 2000000,
        "term": 48,
        "rate": 2.52,
        "rateLabel": "%2.52",
        "monthly": 74482,
        "total": 3575112,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.47 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.47,
        "rateLabel": "%2.47",
        "monthly": 169977,
        "total": 4079438,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_3000000_36",
        "title": "3.000.000 TL — 36 Ay (%2.65 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rate": 2.65,
        "rateLabel": "%2.65",
        "monthly": 133598,
        "total": 4809528,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_3000000_48",
        "title": "3.000.000 TL — 48 Ay (%2.75 Faiz)",
        "principal": 3000000,
        "term": 48,
        "rate": 2.75,
        "rateLabel": "%2.75",
        "monthly": 117044,
        "total": 5618090,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%2.67 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 2.67,
        "rateLabel": "%2.67",
        "monthly": 231786,
        "total": 5562866,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%2.78 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rate": 2.78,
        "rateLabel": "%2.78",
        "monthly": 182179,
        "total": 6558451,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_5000000_24",
        "title": "5.000.000 TL — 24 Ay (%2.78 Faiz)",
        "principal": 5000000,
        "term": 24,
        "rate": 2.78,
        "rateLabel": "%2.78",
        "monthly": 293596,
        "total": 7046314,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%2.88 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 2.88,
        "rateLabel": "%2.88",
        "monthly": 230760,
        "total": 8307368,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_5000000_48",
        "title": "5.000.000 TL — 48 Ay (%2.94 Faiz)",
        "principal": 5000000,
        "term": 48,
        "rate": 2.94,
        "rateLabel": "%2.94",
        "monthly": 202167,
        "total": 9704003,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_5000000_60",
        "title": "5.000.000 TL — 60 Ay (%2.93 Faiz)",
        "principal": 5000000,
        "term": 60,
        "rate": 2.93,
        "rateLabel": "%2.93",
        "monthly": 185077,
        "total": 11104604,
        "currency": "TRY"
      }
    ],
    "esitTaksitEUR": [
      {
        "id": "denizbank_h_eur_esit_100000_24",
        "title": "€100.000 — 24 Ay (%0.31 Faiz)",
        "principal": 100000,
        "term": 24,
        "rate": 0.31,
        "rateLabel": "%0.31",
        "monthly": 4338,
        "total": 104120,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_100000_36",
        "title": "€100.000 — 36 Ay (%0.48 Faiz)",
        "principal": 100000,
        "term": 36,
        "rate": 0.48,
        "rateLabel": "%0.48",
        "monthly": 3048,
        "total": 109710,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_100000_48",
        "title": "€100.000 — 48 Ay (%0.60 Faiz)",
        "principal": 100000,
        "term": 48,
        "rate": 0.6,
        "rateLabel": "%0.60",
        "monthly": 2420,
        "total": 116170,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_100000_60",
        "title": "€100.000 — 60 Ay (%0.68 Faiz)",
        "principal": 100000,
        "term": 60,
        "rate": 0.68,
        "rateLabel": "%0.68",
        "monthly": 2059,
        "total": 123568,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_110000_24",
        "title": "€110.000 — 24 Ay (%0.35 Faiz)",
        "principal": 110000,
        "term": 24,
        "rate": 0.35,
        "rateLabel": "%0.35",
        "monthly": 4795,
        "total": 115080,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_110000_36",
        "title": "€110.000 — 36 Ay (%0.51 Faiz)",
        "principal": 110000,
        "term": 36,
        "rate": 0.51,
        "rateLabel": "%0.51",
        "monthly": 3368,
        "total": 121259,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_110000_48",
        "title": "€110.000 — 48 Ay (%0.61 Faiz)",
        "principal": 110000,
        "term": 48,
        "rate": 0.61,
        "rateLabel": "%0.61",
        "monthly": 2675,
        "total": 128396,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_120000_24",
        "title": "€120.000 — 24 Ay (%0.38 Faiz)",
        "principal": 120000,
        "term": 24,
        "rate": 0.38,
        "rateLabel": "%0.38",
        "monthly": 5252,
        "total": 126039,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_120000_36",
        "title": "€120.000 — 36 Ay (%0.53 Faiz)",
        "principal": 120000,
        "term": 36,
        "rate": 0.53,
        "rateLabel": "%0.53",
        "monthly": 3689,
        "total": 132807,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_120000_48",
        "title": "€120.000 — 48 Ay (%0.63 Faiz)",
        "principal": 120000,
        "term": 48,
        "rate": 0.63,
        "rateLabel": "%0.63",
        "monthly": 2930,
        "total": 140625,
        "currency": "EUR"
      },
      {
        "id": "denizbank_h_eur_esit_120000_60",
        "title": "€120.000 — 60 Ay (%0.71 Faiz)",
        "principal": 120000,
        "term": 60,
        "rate": 0.71,
        "rateLabel": "%0.71",
        "monthly": 2493,
        "total": 149585,
        "currency": "EUR"
      }
    ]
  }
};
