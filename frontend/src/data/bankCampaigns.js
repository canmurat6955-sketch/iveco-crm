// IVECO Kasım 2026 Resmi Banka Kampanyaları & Yüksek Tutarlı Finansman Matrisi
// Kaynak: LM - KASIM 2026 KAMPANYALARI - 09112026_v8.xlsx ve HEAVY_KASIM 2026 KAMPANYALAR_05112026.xlsx
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
    "range": "800K - 1.5M TL",
    "icon": "💎",
    "min": 400000,
    "max": 1500000
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
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '800K - 1.2M TL', icon: '💎', min: 400000, max: 1250000 },
      { id: 'high_credit', label: '🚀 Yüksek Kredi', range: '1.2M - 2M TL', icon: '🚀', min: 1100000, max: 2000000 }
    ];
  } else if (category === 'daily70' || category === 'eurocargo') {
    return [
      { id: 'all', label: 'Tüm Tutarlar', range: '1M - 4M TL', icon: '📋', min: 0, max: 4000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '1M - 1.5M TL', icon: '💎', min: 400000, max: 1500000 },
      { id: 'high_credit', label: '🚀 Yüksek Kredi', range: '1.2M - 2.5M TL', icon: '🚀', min: 1100000, max: 2500000 },
      { id: 'fleet', label: '🏢 Kamyon & Filo', range: '2.6M - 4M TL', icon: '🏢', min: 2600000, max: 4000000 }
    ];
  } else {
    // heavy (S-Way & T-Way) - Standart 250.000 TL IVECO/Bayi katkı payı ile %0 faiz
    return [
      { id: 'all', label: 'Tüm Tutarlar', range: '1M - 6M TL', icon: '📋', min: 0, max: 6000000 },
      { id: 'zero_interest', label: '💎 %0 Faiz', range: '1M - 2M TL', icon: '💎', min: 400000, max: 2000000 },
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
    "description": "800K-1M TL %0 faiz (TEB), %0.07-%0.09 (Cetelem) ve 4M TL'ye kadar Kasım 2026 kampanya tablosu"
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
    "description": "800K-1.5M TL %0 kâr payı, eşit aylık taksit ve 3-6 ay ödemesiz Kasım 2026 seçenekleri"
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
    "description": "800K-1.5M TL %0 kâr payı, €100K 12 ay %0 Euro finansman ve 3-6 ay ödemesiz Kasım 2026 seçenekleri"
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
    "description": "800K-1.1M TL %0 faiz, €100K 12 ay %0 Euro ve 60 aya varan Kasım 2026 ticari finansman"
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
    "description": "800K-900K (Daily 35), 1M TL (Daily 70 & Eurocargo) ve 1.9M TL'ye kadar (Heavy) %0 faiz"
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
    "description": "800K %0.36, 900K %0.31, 1M TL %0.07-%0.19 ve 6M TL'ye kadar Kasım 2026 ticari krediler"
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
    "description": "1.24M TL'ye kadar 6 ay %0, 894K TL 12 ay %0 (Daily 35) ve 60 aya varan ticari kredi"
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
    "description": "800K 8 ay, 900K 9 ay (Daily 35) ve 1M TL 12 ay (Daily 70 & Eurocargo) %0 kâr payı"
  },
  {
    "id": "denizbank",
    "name": "DenizBank",
    "shortName": "DenizBank",
    "badge": "Ağır Vasıta %0 Faiz",
    "color": "#0ea5e9",
    "bg": "rgba(14, 165, 233, 0.15)",
    "border": "rgba(56, 189, 248, 0.4)",
    "icon": "⚓",
    "description": "Ağır Vasıta 1.100.000 TL 12 ay %0 faiz ve 5M TL'ye kadar 60 ay vadeli ticari finansman"
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
        "id": "teb_banka_35_900_9",
        "title": "900.000 TL — 9 Ay (%0.03 Faiz — TEB Banka)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0.03",
        "rate": 0.03,
        "monthly": 100147,
        "total": 901324,
        "highlight": true,
        "tag": "TEB BANKA ÖZEL"
      },
      {
        "id": "tc_35_800_8",
        "title": "800.000 TL — 8 Ay (%0.08 Faiz — TEB Cetelem 35C)",
        "principal": 800000,
        "term": 8,
        "rateLabel": "%0.08",
        "rate": 0.08,
        "monthly": 100362,
        "total": 802896,
        "highlight": true,
        "tag": "35C CETELEM ÖZEL"
      },
      {
        "id": "tc_35_900_9",
        "title": "900.000 TL — 9 Ay (%0.09 Faiz — TEB Cetelem)",
        "principal": 900000,
        "term": 9,
        "rateLabel": "%0.09",
        "rate": 0.09,
        "monthly": 100452,
        "total": 904068,
        "highlight": true,
        "tag": "CETELEM KAMPANYA"
      },
      {
        "id": "tc_35_900_12",
        "title": "900.000 TL — 12 Ay (%0.73 Faiz — TEB)",
        "principal": 900000,
        "term": 12,
        "rateLabel": "%0.73",
        "rate": 0.73,
        "monthly": 78805,
        "total": 945657
      },
      {
        "id": "tc_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.01 Faiz — TEB)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.01",
        "rate": 1.01,
        "monthly": 89183,
        "total": 1070194
      },
      {
        "id": "tc_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.87 Faiz — TEB)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.87",
        "rate": 1.87,
        "monthly": 52665,
        "total": 1263967
      },
      {
        "id": "tc_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.82 Faiz — TEB)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.82",
        "rate": 1.82,
        "monthly": 141102,
        "total": 1693221
      },
      {
        "id": "tc_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.32 Faiz — TEB)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 83306,
        "total": 1999355,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "tc_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.54 Faiz — TEB)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.54",
        "rate": 2.54,
        "monthly": 113951,
        "total": 2734836,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "tc_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.69 Faiz — TEB)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.69",
        "rate": 2.69,
        "monthly": 89267,
        "total": 3213614
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
        "title": "1.000.000 TL — 12 Ay (%0.07 Faiz — TEB Cetelem)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.07",
        "rate": 0.07,
        "monthly": 83790,
        "total": 1005480,
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
        "highlight": true,
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
        "highlight": true,
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
        "title": "1.000.000 TL — 12 Ay (%0.07 Faiz — TEB Cetelem)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.07",
        "rate": 0.07,
        "monthly": 83790,
        "total": 1005480,
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
        "highlight": true,
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
        "highlight": true,
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
        "id": "kt_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Kar Payı — 35C16H)",
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
        "id": "kt_35_900_6",
        "title": "900.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 900000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 150000,
        "total": 900000,
        "highlight": true,
        "tag": "6 AY SIFIR KAR PAYI"
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
        "id": "kt_35_1200_6",
        "title": "1.200.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1200000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 200000,
        "total": 1200000,
        "highlight": true,
        "tag": "1.2M SIFIR KAR PAYI"
      },
      {
        "id": "kt_35_900_12",
        "title": "900.000 TL — 12 Ay (%0.75 Kar Payı)",
        "principal": 900000,
        "term": 12,
        "rateLabel": "%0.75",
        "rate": 0.75,
        "monthly": 78902,
        "total": 946827,
        "highlight": true,
        "tag": "ÖZEL %0.75 ORAN"
      },
      {
        "id": "kt_35_900_24",
        "title": "900.000 TL — 24 Ay (%1.65 Kar Payı)",
        "principal": 900000,
        "term": 24,
        "rateLabel": "%1.65",
        "rate": 1.65,
        "monthly": 46178,
        "total": 1108283,
        "tag": "2 YIL EŞİT TAKSİT"
      },
      {
        "id": "kt_35_1400_12",
        "title": "1.400.000 TL — 12 Ay (%1.73 Kar Payı)",
        "principal": 1400000,
        "term": 12,
        "rateLabel": "%1.73",
        "rate": 1.73,
        "monthly": 131104,
        "total": 1573247
      },
      {
        "id": "kt_35_1400_24",
        "title": "1.400.000 TL — 24 Ay (%2.24 Kar Payı)",
        "principal": 1400000,
        "term": 24,
        "rateLabel": "%2.24",
        "rate": 2.24,
        "monthly": 77299,
        "total": 1855169,
        "highlight": true,
        "tag": "1.4 MİLYON TL"
      },
      {
        "id": "kt_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.54 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.54",
        "rate": 2.54,
        "monthly": 114386,
        "total": 2745259,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "kt_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.67 Kar Payı)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.67",
        "rate": 2.67,
        "monthly": 89496,
        "total": 3221858
      },
      {
        "id": "kt_35_grace_1000_24",
        "title": "1.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 1000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.15",
        "rate": 2.15,
        "monthly": 61825,
        "total": 1483800,
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
        "rateLabel": "%2.67",
        "rate": 2.67,
        "monthly": 134517,
        "total": 3228409,
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
        "title": "1.000.000 TL — 24 Ay (%1.30 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.30",
        "rate": 1.3,
        "monthly": 49188,
        "total": 1180517
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
        "highlight": true,
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
        "highlight": true,
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
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 1500000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.24",
        "rate": 2.24,
        "monthly": 94047,
        "total": 2257133,
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
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 202745,
        "total": 4865879,
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
        "title": "1.000.000 TL — 24 Ay (%1.30 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.30",
        "rate": 1.3,
        "monthly": 49188,
        "total": 1180517
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
        "highlight": true,
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
        "highlight": true,
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
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 1500000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.24",
        "rate": 2.24,
        "monthly": 94047,
        "total": 2257133,
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
        "rateLabel": "%2.70",
        "rate": 2.7,
        "monthly": 202745,
        "total": 4865879,
        "tag": "3M 6 AY ÖDEMESİZ",
        "gracePeriod": 6
      }
    ]
  },
  "albaraka": {
    "daily35": [
      {
        "id": "alb_35_800_8",
        "title": "800.000 TL — 8 Ay (%0 Kar Payı — 35C16H)",
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
        "id": "alb_35_900_6",
        "title": "900.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 900000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 150000,
        "total": 900000,
        "highlight": true,
        "tag": "6 AY SIFIR KAR PAYI"
      },
      {
        "id": "alb_35_900_9",
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
        "id": "alb_35_1000_9",
        "title": "1.000.000 TL — 9 Ay (%0.36 Kar Payı)",
        "principal": 1000000,
        "term": 9,
        "rateLabel": "%0.36",
        "rate": 0.36,
        "monthly": 113240,
        "total": 1019158,
        "highlight": true,
        "tag": "DÜŞÜK KAR PAYI"
      },
      {
        "id": "alb_35_1000_12",
        "title": "1.000.000 TL — 12 Ay (%1.02 Kar Payı)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.02",
        "rate": 1.02,
        "monthly": 89387,
        "total": 1072645
      },
      {
        "id": "alb_35_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.86 Kar Payı)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.86",
        "rate": 1.86,
        "monthly": 52786,
        "total": 1266862
      },
      {
        "id": "alb_35_1500_12",
        "title": "1.500.000 TL — 12 Ay (%1.86 Kar Payı)",
        "principal": 1500000,
        "term": 12,
        "rateLabel": "%1.86",
        "rate": 1.86,
        "monthly": 141726,
        "total": 1700708
      },
      {
        "id": "alb_35_1500_24",
        "title": "1.500.000 TL — 24 Ay (%2.32 Kar Payı)",
        "principal": 1500000,
        "term": 24,
        "rateLabel": "%2.32",
        "rate": 2.32,
        "monthly": 83663,
        "total": 2007904,
        "highlight": true,
        "tag": "1.5 MİLYON TL"
      },
      {
        "id": "alb_35_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.54 Kar Payı)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.54",
        "rate": 2.54,
        "monthly": 114539,
        "total": 2748946,
        "highlight": true,
        "tag": "2 MİLYON TAVAN"
      },
      {
        "id": "alb_35_2000_36",
        "title": "2.000.000 TL — 36 Ay (%2.68 Kar Payı)",
        "principal": 2000000,
        "term": 36,
        "rateLabel": "%2.68",
        "rate": 2.68,
        "monthly": 89671,
        "total": 3228161
      },
      {
        "id": "alb_35_grace_1000_24",
        "title": "1.000.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 1000000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.22",
        "rate": 2.22,
        "monthly": 61879,
        "total": 1485102,
        "highlight": true,
        "tag": "6 AY ÖDEMESİZ",
        "gracePeriod": 6
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
        "monthly": 49255,
        "total": 1182114
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
        "highlight": true,
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
        "highlight": true,
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
        "title": "1.500.000 TL — 6 Ay Ödemesiz + 24 Eşit Taksit",
        "principal": 1500000,
        "term": 24,
        "gracePeriodMonths": 6,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 93903,
        "total": 2253678,
        "highlight": true,
        "tag": "1.5M 6 AY ÖDEMESİZ",
        "gracePeriod": 6
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
        "monthly": 49255,
        "total": 1182114
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
        "highlight": true,
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
        "highlight": true,
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
        "title": "1.000.000 TL — 12 Ay (%0.07 Faiz — 70C16 Şasi)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.07",
        "rate": 0.07,
        "monthly": 83800,
        "total": 1005603,
        "highlight": true,
        "tag": "70C ŞASİ ÖZEL"
      },
      {
        "id": "is_70_1000_12",
        "title": "1.000.000 TL — 12 Ay (%0.19 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.19",
        "rate": 0.19,
        "monthly": 84426,
        "total": 1013112,
        "highlight": true,
        "tag": "DÜŞÜK FAİZ"
      },
      {
        "id": "is_70_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.54 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.54",
        "rate": 1.54,
        "monthly": 50625,
        "total": 1215000
      },
      {
        "id": "is_70_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.05 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.05",
        "rate": 2.05,
        "monthly": 190900,
        "total": 2290800
      },
      {
        "id": "is_70_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.59 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 114525,
        "total": 2748600
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
        "title": "1.000.000 TL — 12 Ay (%0.19 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%0.19",
        "rate": 0.19,
        "monthly": 84426,
        "total": 1013112,
        "highlight": true,
        "tag": "DÜŞÜK FAİZ"
      },
      {
        "id": "is_ec_1000_24",
        "title": "1.000.000 TL — 24 Ay (%1.54 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rateLabel": "%1.54",
        "rate": 1.54,
        "monthly": 50625,
        "total": 1215000
      },
      {
        "id": "is_ec_2000_12",
        "title": "2.000.000 TL — 12 Ay (%2.05 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rateLabel": "%2.05",
        "rate": 2.05,
        "monthly": 190900,
        "total": 2290800
      },
      {
        "id": "is_ec_2000_24",
        "title": "2.000.000 TL — 24 Ay (%2.59 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rateLabel": "%2.59",
        "rate": 2.59,
        "monthly": 114525,
        "total": 2748600
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
        "title": "800.000 TL — 8 Ay (%0 Faiz — 35C16)",
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
        "title": "800.000 TL — 12 Ay (%0.98 Faiz)",
        "principal": 800000,
        "term": 12,
        "rateLabel": "%0.98",
        "rate": 0.98,
        "monthly": 71196,
        "total": 854353
      },
      {
        "id": "ak_35_800_24",
        "title": "800.000 TL — 24 Ay (%1.99 Faiz)",
        "principal": 800000,
        "term": 24,
        "rateLabel": "%1.99",
        "rate": 1.99,
        "monthly": 42739,
        "total": 1025736
      },
      {
        "id": "ak_35_800_36",
        "title": "800.000 TL — 36 Ay (%2.37 Faiz)",
        "principal": 800000,
        "term": 36,
        "rateLabel": "%2.37",
        "rate": 2.37,
        "monthly": 33901,
        "total": 1220429
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
        "title": "900.000 TL — 12 Ay (%0.71 Faiz)",
        "principal": 900000,
        "term": 12,
        "rateLabel": "%0.71",
        "rate": 0.71,
        "monthly": 78670,
        "total": 944041
      },
      {
        "id": "ak_35_900_18",
        "title": "900.000 TL — 18 Ay (%1.52 Faiz)",
        "principal": 900000,
        "term": 18,
        "rateLabel": "%1.52",
        "rate": 1.52,
        "monthly": 57893,
        "total": 1042067
      },
      {
        "id": "ak_35_900_24",
        "title": "900.000 TL — 24 Ay (%1.85 Faiz)",
        "principal": 900000,
        "term": 24,
        "rateLabel": "%1.85",
        "rate": 1.85,
        "monthly": 47278,
        "total": 1134680
      },
      {
        "id": "ak_35_900_36",
        "title": "900.000 TL — 36 Ay (%2.28 Faiz)",
        "principal": 900000,
        "term": 36,
        "rateLabel": "%2.28",
        "rate": 2.28,
        "monthly": 37576,
        "total": 1352732
      },
      {
        "id": "ak_35_900_48",
        "title": "900.000 TL — 48 Ay (%2.47 Faiz)",
        "principal": 900000,
        "term": 48,
        "rateLabel": "%2.47",
        "rate": 2.47,
        "monthly": 32995,
        "total": 1583776
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
        "monthly": 61073,
        "total": 1099317
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
        "monthly": 61073,
        "total": 1099317
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
        "id": "yk_35_894_12",
        "title": "894.000 TL — 12 Ay (%0 Faiz)",
        "principal": 894000,
        "term": 12,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 74500,
        "total": 894000,
        "highlight": true,
        "tag": "12 AY SIFIR FAİZ"
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
        "id": "yk_35_900_12",
        "title": "900.000 TL — 12 Ay (%0.76 Faiz)",
        "principal": 900000,
        "term": 12,
        "rateLabel": "%0.76",
        "rate": 0.76,
        "monthly": 78963,
        "total": 947553,
        "highlight": true,
        "tag": "%0.76 KAMPANYA"
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
        "title": "1.000.000 TL — 12 Ay (%1.05 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rateLabel": "%1.05",
        "rate": 1.05,
        "monthly": 89449,
        "total": 1073387
      },
      {
        "id": "yk_35_1245_6",
        "title": "1.245.000 TL — 6 Ay (%0 Faiz)",
        "principal": 1245000,
        "term": 6,
        "rateLabel": "%0 Faiz",
        "rate": 0,
        "monthly": 207500,
        "total": 1245000,
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
    "id": "garanti_h_eur_esit_100000_12",
    "title": "€100.000 — 12 Ay (%0 Faiz)",
    "principal": 100000,
    "term": 12,
    "rate": 0,
    "rateLabel": "%0 Faiz",
    "monthly": 8333,
    "total": 100000,
    "currency": "EUR",
    "tag": "%0 FAİZ",
    "bankId": "garanti"
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
    "title": "€100.000 — 36 Ay (%0.31 Faiz)",
    "principal": 100000,
    "term": 36,
    "rate": 0.31,
    "rateLabel": "%0.31",
    "monthly": 2950,
    "total": 106187,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "garanti_h_eur_esit_100000_48",
    "title": "€100.000 — 48 Ay (%0.40 Faiz)",
    "principal": 100000,
    "term": 48,
    "rate": 0.4,
    "rateLabel": "%0.40",
    "monthly": 2306,
    "total": 110675,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "garanti_h_eur_esit_100000_60",
    "title": "€100.000 — 60 Ay (%0.45 Faiz)",
    "principal": 100000,
    "term": 60,
    "rate": 0.45,
    "rateLabel": "%0.45",
    "monthly": 1922,
    "total": 115303,
    "currency": "EUR",
    "bankId": "garanti"
  },
  {
    "id": "garanti_h_eur_odemesiz_100000_24_g6",
    "title": "€100.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.52 Faiz)",
    "principal": 100000,
    "term": 24,
    "rate": 0.52,
    "rateLabel": "%0.52",
    "monthly": 4598,
    "total": 110345,
    "currency": "EUR",
    "gracePeriodMonths": 6,
    "gracePeriod": 6,
    "totalTerm": 30,
    "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
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
    "monthly": 2940,
    "total": 105832,
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
    "id": "garanti",
    "name": "Garanti BBVA",
    "shortName": "Garanti BBVA",
    "badge": "12 Ay %0 Faiz • 6 Ay Ödemesiz • 60 Aya Kadar",
    "icon": "🟢",
    "color": "#22c55e",
    "bg": "rgba(34, 197, 94, 0.15)",
    "border": "rgba(74, 222, 128, 0.4)",
    "desc": "€100.000 için 12 ay %0 faiz, 24-60 ay arası %0.17 - %0.45 eşit taksit ve 6 ay ödemesiz Euro finansman"
  },
  {
    "id": "albaraka",
    "name": "Albaraka Türk Katılım",
    "shortName": "Albaraka Türk",
    "badge": "6 ve 12 Ay %0 Kâr Payı • 48 Aya Kadar",
    "icon": "🟠",
    "color": "#f97316",
    "bg": "rgba(249, 115, 22, 0.15)",
    "border": "rgba(251, 146, 60, 0.4)",
    "desc": "€100.000 için 6 ve 12 ay %0 kâr payı, 24-48 ay arası %0.15 - %0.38 Euro finansman"
  },
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
    "badge": "1M - 1.75M TL %0 Kâr Payı • 6 Ay Ödemesiz • Euro & TL",
    "esitTaksitTL": [
      {
        "id": "kuveyt_turk_h_try_esit_2500000_12",
        "title": "2.500.000 TL — 12 Ay (%1.76 Kar Payı)",
        "principal": 2500000,
        "term": 12,
        "rate": 1.76,
        "rateLabel": "%1.76",
        "monthly": 234576,
        "total": 2814912,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_2500000_24",
        "title": "2.500.000 TL — 24 Ay (%2.27 Kar Payı)",
        "principal": 2500000,
        "term": 24,
        "rate": 2.27,
        "rateLabel": "%2.27",
        "monthly": 138524,
        "total": 3324576,
        "currency": "TRY"
      },
      {
        "id": "kuveyt_turk_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.43 Kar Payı)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.43,
        "rateLabel": "%2.43",
        "monthly": 169392,
        "total": 4065409,
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
      },
      {
        "id": "kuveyt_turk_h_try_sifir_1250000_9",
        "title": "1.250.000 TL — 9 Ay (%0 Kar Payı)",
        "principal": 1250000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 138889,
        "total": 1250000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "kuveyt_turk_h_try_sifir_1500000_6",
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
        "id": "kuveyt_turk_h_try_sifir_1750000_6",
        "title": "1.750.000 TL — 6 Ay (%0 Kar Payı)",
        "principal": 1750000,
        "term": 6,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 291667,
        "total": 1750000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      }
    ]
  },
  "albaraka": {
    "name": "Albaraka Türk Katılım",
    "badge": "1M - 2M TL & €100K %0 Kâr Payı • 6 Ay Ödemesiz",
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
        "monthly": 2940,
        "total": 105832,
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
      }
    ],
    "sifirFaizTL": [
      {
        "id": "albaraka_h_try_sifir_1000000_12",
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
        "id": "albaraka_h_try_sifir_1500000_6",
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
        "id": "albaraka_h_try_sifir_2000000_6",
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
    ]
  },
  "garanti": {
    "name": "Garanti BBVA",
    "badge": "1M-1.1M TL & €100K %0 Faiz • 6M TL & 60 Aya Kadar",
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
        "id": "garanti_h_eur_esit_100000_12",
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
        "title": "€100.000 — 36 Ay (%0.31 Faiz)",
        "principal": 100000,
        "term": 36,
        "rate": 0.31,
        "rateLabel": "%0.31",
        "monthly": 2950,
        "total": 106187,
        "currency": "EUR"
      },
      {
        "id": "garanti_h_eur_esit_100000_48",
        "title": "€100.000 — 48 Ay (%0.40 Faiz)",
        "principal": 100000,
        "term": 48,
        "rate": 0.4,
        "rateLabel": "%0.40",
        "monthly": 2306,
        "total": 110675,
        "currency": "EUR"
      },
      {
        "id": "garanti_h_eur_esit_100000_60",
        "title": "€100.000 — 60 Ay (%0.45 Faiz)",
        "principal": 100000,
        "term": 60,
        "rate": 0.45,
        "rateLabel": "%0.45",
        "monthly": 1922,
        "total": 115303,
        "currency": "EUR"
      }
    ],
    "odemesiz6AyEUR": [
      {
        "id": "garanti_h_eur_odemesiz_100000_24_g6",
        "title": "€100.000 — 6 Ay Ödemesiz + 24 Eşit Taksit (%0.52 Faiz)",
        "principal": 100000,
        "term": 24,
        "rate": 0.52,
        "rateLabel": "%0.52",
        "monthly": 4598,
        "total": 110345,
        "currency": "EUR",
        "gracePeriodMonths": 6,
        "gracePeriod": 6,
        "totalTerm": 30,
        "desc": "İlk 6 ay ödeme yok, ardından 24 eşit taksit",
        "tag": "6 AY ÖDEMESİZ"
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
    "badge": "1M - 2M TL %0 Faiz • 5M TL'ye Kadar Finansman",
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
        "id": "akbank_h_try_esit_1150000_12",
        "title": "1.150.000 TL — 12 Ay (%0 Faiz)",
        "principal": 1150000,
        "term": 12,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 95833,
        "total": 1150000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "akbank_h_try_esit_1500000_9",
        "title": "1.500.000 TL — 9 Ay (%0 Faiz)",
        "principal": 1500000,
        "term": 9,
        "rate": 0,
        "rateLabel": "%0 Faiz",
        "monthly": 166667,
        "total": 1500000,
        "currency": "TRY",
        "highlight": true,
        "tag": "%0 FAİZ"
      },
      {
        "id": "akbank_h_try_esit_2000000_6",
        "title": "2.000.000 TL — 6 Ay (%0 Faiz)",
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
    ]
  },
  "denizbank": {
    "name": "DenizBank",
    "badge": "1.1M TL 12 Ay %0 Faiz • 5M TL & 48 Aya Kadar",
    "esitTaksitTL": [
      {
        "id": "denizbank_h_try_esit_1500000_12",
        "title": "1.500.000 TL — 12 Ay (%1.38 Faiz)",
        "principal": 1500000,
        "term": 12,
        "rate": 1.38,
        "rateLabel": "%1.38",
        "monthly": 137126,
        "total": 1645512,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_2500000_24",
        "title": "2.500.000 TL — 24 Ay (%2.48 Faiz)",
        "principal": 2500000,
        "term": 24,
        "rate": 2.48,
        "rateLabel": "%2.48",
        "monthly": 141227,
        "total": 3389445,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_3500000_24",
        "title": "3.500.000 TL — 24 Ay (%2.70 Faiz)",
        "principal": 3500000,
        "term": 24,
        "rate": 2.7,
        "rateLabel": "%2.70",
        "monthly": 202967,
        "total": 4871211,
        "currency": "TRY"
      },
      {
        "id": "denizbank_h_try_esit_3500000_36",
        "title": "3.500.000 TL — 36 Ay (%2.81 Faiz)",
        "principal": 3500000,
        "term": 36,
        "rate": 2.81,
        "rateLabel": "%2.81",
        "monthly": 159128,
        "total": 5728608,
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
      }
    ],
    "sifirFaizTL": [
      {
        "id": "denizbank_h_try_sifir_1100000_12",
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
    "badge": "1M - 6M TL Ticari Filo Kredisi (%0.07'den Başlayan)",
    "esitTaksitTL": [
      {
        "id": "is_bankasi_h_try_esit_1000000_12",
        "title": "1.000.000 TL — 12 Ay (%0.07 Faiz)",
        "principal": 1000000,
        "term": 12,
        "rate": 0.07,
        "rateLabel": "%0.07",
        "monthly": 83804,
        "total": 1005644,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_1100000_12",
        "title": "1.100.000 TL — 12 Ay (%0.37 Faiz)",
        "principal": 1100000,
        "term": 12,
        "rate": 0.37,
        "rateLabel": "%0.37",
        "monthly": 94066,
        "total": 1128791,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_1000000_24",
        "title": "1.000.000 TL — 24 Ay (%1.41 Faiz)",
        "principal": 1000000,
        "term": 24,
        "rate": 1.41,
        "rateLabel": "%1.41",
        "monthly": 49811,
        "total": 1195461,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_2000000_12",
        "title": "2.000.000 TL — 12 Ay (%2.01 Faiz)",
        "principal": 2000000,
        "term": 12,
        "rate": 2.01,
        "rateLabel": "%2.01",
        "monthly": 190335,
        "total": 2284020,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_2000000_24",
        "title": "2.000.000 TL — 24 Ay (%2.54 Faiz)",
        "principal": 2000000,
        "term": 24,
        "rate": 2.54,
        "rateLabel": "%2.54",
        "monthly": 113869,
        "total": 2732856,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_3000000_24",
        "title": "3.000.000 TL — 24 Ay (%2.88 Faiz)",
        "principal": 3000000,
        "term": 24,
        "rate": 2.88,
        "rateLabel": "%2.88",
        "monthly": 177564,
        "total": 4261536,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_3000000_36",
        "title": "3.000.000 TL — 36 Ay (%3.05 Faiz)",
        "principal": 3000000,
        "term": 36,
        "rate": 3.05,
        "rateLabel": "%3.05",
        "monthly": 141553,
        "total": 5095908,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_4000000_24",
        "title": "4.000.000 TL — 24 Ay (%3.05 Faiz)",
        "principal": 4000000,
        "term": 24,
        "rate": 3.05,
        "rateLabel": "%3.05",
        "monthly": 241328,
        "total": 5791872,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_4000000_36",
        "title": "4.000.000 TL — 36 Ay (%3.17 Faiz)",
        "principal": 4000000,
        "term": 36,
        "rate": 3.17,
        "rateLabel": "%3.17",
        "monthly": 192446,
        "total": 6928056,
        "currency": "TRY"
      },
      {
        "id": "is_bankasi_h_try_esit_5000000_36",
        "title": "5.000.000 TL — 36 Ay (%3.25 Faiz)",
        "principal": 5000000,
        "term": 36,
        "rate": 3.25,
        "rateLabel": "%3.25",
        "monthly": 243354,
        "total": 8760744,
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
