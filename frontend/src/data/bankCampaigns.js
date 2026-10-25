// IVECO Ekim 2026 Resmi Banka Kampanyaları
// Kaynak: LM_EKİM 2026 KAMPANYALARI_14102026.xlsx
// DİKKAT: Bayi katkı payı (destek tutarı / reel komisyon) müşteri gizliliği gereği bu dosyada YER ALMAZ.
// Yalnızca müşterinin görebileceği: Kredi Tutarı, Vade, Müşteri Faiz Oranı, Aylık Taksit ve Toplam Ödeme bilgileri bulunur.

export const BANK_LIST = [
  {
    id: 'teb_cetelem',
    name: 'TEB Cetelem',
    shortName: 'TEB Cetelem',
    badge: 'Yetkili Finansman',
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.15)',
    border: 'rgba(56, 189, 248, 0.4)',
    icon: '🏛️',
    description: 'IVECO Resmi Taşıt Finansmanı — Hızlı onay ve sıfır faiz avantajı'
  },
  {
    id: 'kuveyt_turk',
    name: 'Kuveyt Türk',
    shortName: 'Kuveyt Türk',
    badge: 'Katılım & 6 Ay Ödemesiz',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(52, 211, 153, 0.4)',
    icon: '🌿',
    description: 'Faizsiz Katılım Finansmanı & İlk 6 Ay 0 TL Taksit seçeneği'
  },
  {
    id: 'garanti',
    name: 'Garanti BBVA',
    shortName: 'Garanti BBVA',
    badge: '%0 Faiz & %0.99',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(74, 222, 128, 0.4)',
    icon: '🍀',
    description: '8-12 ay %0 faiz ve 60 aya varan avantajlı ticari kredi'
  },
  {
    id: 'yapi_kredi',
    name: 'Yapı Kredi',
    shortName: 'Yapı Kredi',
    badge: '6-24 Ay %0 Faiz',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(96, 165, 250, 0.4)',
    icon: '🦅',
    description: 'Esnek tutarlı %0 faiz ve uzun vadeli taksit imkanı'
  },
  {
    id: 'akbank',
    name: 'Akbank',
    shortName: 'Akbank',
    badge: '6-12 Ay %0 Faiz',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(248, 113, 113, 0.4)',
    icon: '🦁',
    description: 'Daily 35 ve Daily 70 için sıfır faiz ve ticari destekli oranlar'
  },
  {
    id: 'is_bankasi',
    name: 'Türkiye İş Bankası',
    shortName: 'İş Bankası',
    badge: 'İndirimli Ticari',
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.15)',
    border: 'rgba(96, 165, 250, 0.4)',
    icon: '🏦',
    description: 'Düşük indirimli faiz oranları ve 48 aya varan eşit taksit'
  },
  {
    id: 'vakif_katilim',
    name: 'Vakıf Katılım',
    shortName: 'Vakıf Katılım',
    badge: '%0 Kar Payı',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(251, 191, 36, 0.4)',
    icon: '⭐',
    description: 'Katılım bankacılığı prensipleriyle 8-12 ay sıfır kar payı'
  },
  {
    id: 'bnp_paribas',
    name: 'BNP Paribas',
    shortName: 'BNP Paribas',
    badge: 'Daily 70 & Eurocargo',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.15)',
    border: 'rgba(52, 211, 153, 0.4)',
    icon: '🌐',
    description: 'Daily 70 ve Eurocargo için 1.000.000 TL 12 ay %0 faiz desteği'
  },
  {
    id: 'diger_yok',
    name: 'Hiçbiri / Diğer Banka',
    shortName: 'Diğer / Bankam Yok',
    badge: 'TEB Cetelem Destekli',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(167, 139, 250, 0.4)',
    icon: '🤝',
    description: 'Herhangi bir banka ile çalışmıyorsanız resmi finansman ortağımız TEB Cetelem ile anında kredi açılır'
  }
];

// Bankalara ve araç sınıflarına göre Ekim 2026 kampanyaları
// vehicleCategory: 'daily35' | 'daily70' | 'eurocargo' | 'all'
export const BANK_CAMPAIGNS = {
  // ─────────────────────────────────────────────────────────────
  // 1. TEB CETELEM & TEB (Resmi Finansman Ortağı — Fallback)
  // ─────────────────────────────────────────────────────────────
  teb_cetelem: {
    daily35: [
      {
        id: 'teb_35_800_8',
        title: '800.000 TL — 8 Ay (%0 Faiz)',
        principal: 800000,
        term: 8,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 800000,
        highlight: true,
        tag: 'EN POPÜLER SIFIR FAİZ'
      },
      {
        id: 'teb_35_900_9',
        title: '900.000 TL — 9 Ay (%0 Faiz)',
        principal: 900000,
        term: 9,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 900000,
        highlight: true,
        tag: '9 AY SIFIR FAİZ'
      },
      {
        id: 'teb_35_900_12',
        title: '900.000 TL — 12 Ay (İndirimli)',
        principal: 900000,
        term: 12,
        rateLabel: '%0.76',
        rate: 0.76,
        monthly: 78921,
        total: 947052,
        tag: 'DÜŞÜK TAKSİT'
      },
      {
        id: 'teb_35_900_24',
        title: '900.000 TL — 24 Ay',
        principal: 900000,
        term: 24,
        rateLabel: '%1.74',
        rate: 1.74,
        monthly: 46651,
        total: 1119624
      },
      {
        id: 'teb_35_900_36',
        title: '900.000 TL — 36 Ay',
        principal: 900000,
        term: 36,
        rateLabel: '%2.11',
        rate: 2.11,
        monthly: 36555,
        total: 1315980
      },
      {
        id: 'teb_35_900_48',
        title: '900.000 TL — 48 Ay Uzun Vade',
        principal: 900000,
        term: 48,
        rateLabel: '%2.26',
        rate: 2.26,
        monthly: 31593,
        total: 1516464
      },
      {
        id: 'teb_35_1000_12',
        title: '1.000.000 TL — 12 Ay',
        principal: 1000000,
        term: 12,
        rateLabel: '%1.04',
        rate: 1.04,
        monthly: 89372,
        total: 1072464
      },
      {
        id: 'teb_35_1000_24',
        title: '1.000.000 TL — 24 Ay',
        principal: 1000000,
        term: 24,
        rateLabel: '%1.90',
        rate: 1.90,
        monthly: 52829,
        total: 1267896
      }
    ],
    daily70: [
      {
        id: 'teb_70_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: 'YILLIK SIFIR FAİZ'
      },
      {
        id: 'teb_70_1000_24',
        title: '1.000.000 TL — 24 Ay',
        principal: 1000000,
        term: 24,
        rateLabel: '%1.32',
        rate: 1.32,
        monthly: 49272,
        total: 1182528,
        tag: 'AVANTAJLI 2 YIL'
      },
      {
        id: 'teb_70_1000_36',
        title: '1.000.000 TL — 36 Ay',
        principal: 1000000,
        term: 36,
        rateLabel: '%1.81',
        rate: 1.81,
        monthly: 38615,
        total: 1390140
      },
      {
        id: 'teb_70_1000_48',
        title: '1.000.000 TL — 48 Ay Uzun Vade',
        principal: 1000000,
        term: 48,
        rateLabel: '%2.02',
        rate: 2.02,
        monthly: 33374,
        total: 1601952
      },
      {
        id: 'teb_70_1200_12',
        title: '1.200.000 TL — 12 Ay (%0.61 Faiz)',
        principal: 1200000,
        term: 12,
        rateLabel: '%0.61',
        rate: 0.61,
        monthly: 104278,
        total: 1251336
      }
    ],
    eurocargo: [
      {
        id: 'teb_ec_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: 'SIFIR FAİZ'
      },
      {
        id: 'teb_ec_1000_24',
        title: '1.000.000 TL — 24 Ay',
        principal: 1000000,
        term: 24,
        rateLabel: '%1.32',
        rate: 1.32,
        monthly: 49272,
        total: 1182528
      },
      {
        id: 'teb_ec_1000_36',
        title: '1.000.000 TL — 36 Ay',
        principal: 1000000,
        term: 36,
        rateLabel: '%1.81',
        rate: 1.81,
        monthly: 38615,
        total: 1390140
      },
      {
        id: 'teb_ec_1000_48',
        title: '1.000.000 TL — 48 Ay',
        principal: 1000000,
        term: 48,
        rateLabel: '%2.02',
        rate: 2.02,
        monthly: 33374,
        total: 1601952
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 2. KUVEYT TÜRK (Katılım Finansmanı & 6 Ay Ödemesiz)
  // ─────────────────────────────────────────────────────────────
  kuveyt_turk: {
    daily35: [
      {
        id: 'kt_35_800_8',
        title: '800.000 TL — 8 Ay (%0 Kar Payı)',
        principal: 800000,
        term: 8,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 800000,
        highlight: true,
        tag: 'KATILIM SIFIR KAR PAYI'
      },
      {
        id: 'kt_35_900_9',
        title: '900.000 TL — 9 Ay (%0 Kar Payı)',
        principal: 900000,
        term: 9,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 900000,
        highlight: true,
        tag: '9 AY SIFIR KAR PAYI'
      },
      {
        id: 'kt_35_grace_1000_24',
        title: '1.000.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 1000000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.21',
        rate: 2.21,
        monthly: 62390,
        total: 1497371,
        highlight: true,
        tag: '6 AY 0 TL TAKSİT'
      },
      {
        id: 'kt_35_grace_1000_36',
        title: '1.000.000 TL — 6 Ay Ödemesiz (36 Ay)',
        principal: 1000000,
        term: 36,
        gracePeriodMonths: 6,
        rateLabel: '%2.40',
        rate: 2.40,
        monthly: 48808,
        total: 1757097,
        tag: '6 AY 0 TL TAKSİT'
      },
      {
        id: 'kt_35_grace_1500_24',
        title: '1.500.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 1500000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.55',
        rate: 2.55,
        monthly: 98972,
        total: 2375326
      },
      {
        id: 'kt_35_grace_1500_36',
        title: '1.500.000 TL — 6 Ay Ödemesiz (36 Ay)',
        principal: 1500000,
        term: 36,
        gracePeriodMonths: 6,
        rateLabel: '%2.67',
        rate: 2.67,
        monthly: 77336,
        total: 2784087
      }
    ],
    daily70: [
      {
        id: 'kt_70_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Kar Payı)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: '12 AY SIFIR KAR PAYI'
      },
      {
        id: 'kt_70_grace_1000_24',
        title: '1.000.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 1000000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.21',
        rate: 2.21,
        monthly: 62390,
        total: 1497371,
        highlight: true,
        tag: '6 AY 0 TL TAKSİT'
      },
      {
        id: 'kt_70_grace_1000_36',
        title: '1.000.000 TL — 6 Ay Ödemesiz (36 Ay)',
        principal: 1000000,
        term: 36,
        gracePeriodMonths: 6,
        rateLabel: '%2.40',
        rate: 2.40,
        monthly: 48808,
        total: 1757097,
        tag: '6 AY 0 TL TAKSİT'
      },
      {
        id: 'kt_70_grace_1500_24',
        title: '1.500.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 1500000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.55',
        rate: 2.55,
        monthly: 98972,
        total: 2375326
      },
      {
        id: 'kt_70_grace_2000_24',
        title: '2.000.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 2000000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.20',
        rate: 2.20,
        monthly: 132176,
        total: 3172216
      },
      {
        id: 'kt_70_grace_2000_36',
        title: '2.000.000 TL — 6 Ay Ödemesiz (36 Ay)',
        principal: 2000000,
        term: 36,
        gracePeriodMonths: 6,
        rateLabel: '%2.32',
        rate: 2.32,
        monthly: 103526,
        total: 3726932
      }
    ],
    eurocargo: [
      {
        id: 'kt_ec_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Kar Payı)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: '12 AY SIFIR KAR PAYI'
      },
      {
        id: 'kt_ec_grace_1500_24',
        title: '1.500.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 1500000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.55',
        rate: 2.55,
        monthly: 98972,
        total: 2375326,
        highlight: true,
        tag: '6 AY 0 TL TAKSİT'
      },
      {
        id: 'kt_ec_grace_2000_36',
        title: '2.000.000 TL — 6 Ay Ödemesiz (36 Ay)',
        principal: 2000000,
        term: 36,
        gracePeriodMonths: 6,
        rateLabel: '%2.32',
        rate: 2.32,
        monthly: 103526,
        total: 3726932
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 3. GARANTİ BBVA & GARANTİ %0,99
  // ─────────────────────────────────────────────────────────────
  garanti: {
    daily35: [
      {
        id: 'garanti_35_800_8',
        title: '800.000 TL — 8 Ay (%0 Faiz)',
        principal: 800000,
        term: 8,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 800000,
        highlight: true,
        tag: 'SIFIR FAİZ'
      },
      {
        id: 'garanti_35_800_12',
        title: '800.000 TL — 12 Ay (%1.04 Faiz)',
        principal: 800000,
        term: 12,
        rateLabel: '%1.04',
        rate: 1.04,
        monthly: 71477,
        total: 857724,
        tag: '12 AY KAMPANYA'
      },
      {
        id: 'garanti_35_800_24',
        title: '800.000 TL — 24 Ay (%2.12 Faiz)',
        principal: 800000,
        term: 24,
        rateLabel: '%2.12',
        rate: 2.12,
        monthly: 43383,
        total: 1041192
      },
      {
        id: 'garanti_35_800_36',
        title: '800.000 TL — 36 Ay (%2.45 Faiz)',
        principal: 800000,
        term: 36,
        rateLabel: '%2.45',
        rate: 2.45,
        monthly: 34347,
        total: 1236492
      },
      {
        id: 'garanti_35_800_48',
        title: '800.000 TL — 48 Ay (%2.61 Faiz)',
        principal: 800000,
        term: 48,
        rateLabel: '%2.61',
        rate: 2.61,
        monthly: 30136,
        total: 1446528
      },
      {
        id: 'garanti_35_800_60',
        title: '800.000 TL — 60 Ay (%2.72 Faiz)',
        principal: 800000,
        term: 60,
        rateLabel: '%2.72',
        rate: 2.72,
        monthly: 28002,
        total: 1680120
      },
      {
        id: 'garanti_35_900_8',
        title: '900.000 TL — 8 Ay (%0.41 Faiz)',
        principal: 900000,
        term: 8,
        rateLabel: '%0.41',
        rate: 0.41,
        monthly: 114708,
        total: 917664
      },
      {
        id: 'garanti_35_900_12',
        title: '900.000 TL — 12 Ay (%1.33 Faiz)',
        principal: 900000,
        term: 12,
        rateLabel: '%1.33',
        rate: 1.33,
        monthly: 81988,
        total: 983856
      }
    ],
    daily70: [
      {
        id: 'garanti_70_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: '12 AY SIFIR FAİZ'
      },
      {
        id: 'garanti_70_1000_12_099',
        title: '1.000.000 TL — 12 Ay (%0.99 Özel Kampanya)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 89071,
        total: 1068852,
        tag: 'ÖZEL %0.99'
      },
      {
        id: 'garanti_70_1000_24_099',
        title: '1.000.000 TL — 24 Ay (%0.99 Özel Kampanya)',
        principal: 1000000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 47295,
        total: 1135080,
        highlight: true,
        tag: 'ÖZEL %0.99 2 YIL'
      },
      {
        id: 'garanti_70_1000_36_099',
        title: '1.000.000 TL — 36 Ay (%0.99 Özel Kampanya)',
        principal: 1000000,
        term: 36,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 33441,
        total: 1203876,
        tag: 'ÖZEL %0.99 3 YIL'
      },
      {
        id: 'garanti_70_1500_24_099',
        title: '1.500.000 TL — 24 Ay (%0.99 Özel Kampanya)',
        principal: 1500000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 70943,
        total: 1702632
      },
      {
        id: 'garanti_70_1000_48',
        title: '1.000.000 TL — 48 Ay (%1.99 Faiz)',
        principal: 1000000,
        term: 48,
        rateLabel: '%1.99',
        rate: 1.99,
        monthly: 33189,
        total: 1593072
      },
      {
        id: 'garanti_70_1000_60',
        title: '1.000.000 TL — 60 Ay (%2.15 Faiz)',
        principal: 1000000,
        term: 60,
        rateLabel: '%2.15',
        rate: 2.15,
        monthly: 30584,
        total: 1835040
      }
    ],
    eurocargo: [
      {
        id: 'garanti_ec_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: 'SIFIR FAİZ'
      },
      {
        id: 'garanti_ec_1500_24_099',
        title: '1.500.000 TL — 24 Ay (%0.99 Özel Kampanya)',
        principal: 1500000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 70943,
        total: 1702632,
        highlight: true,
        tag: 'ÖZEL %0.99'
      },
      {
        id: 'garanti_ec_2000_24_099',
        title: '2.000.000 TL — 24 Ay (%0.99 Özel Kampanya)',
        principal: 2000000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 94590,
        total: 2270160
      },
      {
        id: 'garanti_ec_2000_36_099',
        title: '2.000.000 TL — 36 Ay (%0.99 Özel Kampanya)',
        principal: 2000000,
        term: 36,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 66882,
        total: 2407752
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 4. YAPI KREDİ
  // ─────────────────────────────────────────────────────────────
  yapi_kredi: {
    daily35: [
      {
        id: 'yk_35_800_6',
        title: '800.000 TL — 6 Ay (%0 Faiz)',
        principal: 800000,
        term: 6,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 133333,
        total: 800000,
        tag: '6 AY SIFIR FAİZ'
      },
      {
        id: 'yk_35_800_8',
        title: '800.000 TL — 8 Ay (%0 Faiz)',
        principal: 800000,
        term: 8,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 800000,
        highlight: true,
        tag: '8 AY SIFIR FAİZ'
      },
      {
        id: 'yk_35_800_9',
        title: '800.000 TL — 9 Ay (%0 Faiz)',
        principal: 800000,
        term: 9,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 88889,
        total: 800000,
        highlight: true,
        tag: '9 AY SIFIR FAİZ'
      },
      {
        id: 'yk_35_800_12',
        title: '800.000 TL — 12 Ay (%0.44 İndirimli Faiz)',
        principal: 800000,
        term: 12,
        rateLabel: '%0.44',
        rate: 0.44,
        monthly: 68690,
        total: 824280,
        tag: 'DÜŞÜK ORAN'
      },
      {
        id: 'yk_35_800_24',
        title: '800.000 TL — 24 Ay (%1.73 Faiz)',
        principal: 800000,
        term: 24,
        rateLabel: '%1.73',
        rate: 1.73,
        monthly: 41443,
        total: 994632
      },
      {
        id: 'yk_35_800_36',
        title: '800.000 TL — 36 Ay (%2.21 Faiz)',
        principal: 800000,
        term: 36,
        rateLabel: '%2.21',
        rate: 2.21,
        monthly: 33046,
        total: 1189656
      },
      {
        id: 'yk_35_400_24',
        title: '400.000 TL — 24 Ay (%0 Faiz)',
        principal: 400000,
        term: 24,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 16667,
        total: 400000,
        tag: '24 AY SIFIR FAİZ'
      }
    ],
    daily70: [
      {
        id: 'yk_70_1000_6',
        title: '1.000.000 TL — 6 Ay (%0 Faiz)',
        principal: 1000000,
        term: 6,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 166667,
        total: 1000000,
        tag: '6 AY SIFIR FAİZ'
      },
      {
        id: 'yk_70_1000_12',
        title: '1.000.000 TL — 12 Ay (%1.10 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%1.10',
        rate: 1.10,
        monthly: 89721,
        total: 1076652,
        highlight: true,
        tag: '12 AY KAMPANYA'
      },
      {
        id: 'yk_70_1000_24',
        title: '1.000.000 TL — 24 Ay (%2.10 Faiz)',
        principal: 1000000,
        term: 24,
        rateLabel: '%2.10',
        rate: 2.10,
        monthly: 54126,
        total: 1299024
      },
      {
        id: 'yk_70_1000_36',
        title: '1.000.000 TL — 36 Ay (%2.48 Faiz)',
        principal: 1000000,
        term: 36,
        rateLabel: '%2.48',
        rate: 2.48,
        monthly: 43152,
        total: 1553472
      }
    ],
    eurocargo: [
      {
        id: 'yk_ec_1000_12',
        title: '1.000.000 TL — 12 Ay (%1.10 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%1.10',
        rate: 1.10,
        monthly: 89721,
        total: 1076652,
        highlight: true
      },
      {
        id: 'yk_ec_1000_24',
        title: '1.000.000 TL — 24 Ay (%2.10 Faiz)',
        principal: 1000000,
        term: 24,
        rateLabel: '%2.10',
        rate: 2.10,
        monthly: 54126,
        total: 1299024
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 5. AKBANK
  // ─────────────────────────────────────────────────────────────
  akbank: {
    daily35: [
      {
        id: 'akbank_35_800_6',
        title: '800.000 TL — 6 Ay (%0 Faiz)',
        principal: 800000,
        term: 6,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 133333,
        total: 800000,
        tag: '6 AY SIFIR FAİZ'
      },
      {
        id: 'akbank_35_800_8',
        title: '800.000 TL — 8 Ay (%0 Faiz)',
        principal: 800000,
        term: 8,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 800000,
        highlight: true,
        tag: '8 AY SIFIR FAİZ'
      },
      {
        id: 'akbank_35_800_9',
        title: '800.000 TL — 9 Ay (%0.33 İndirimli Faiz)',
        principal: 800000,
        term: 9,
        rateLabel: '%0.33',
        rate: 0.33,
        monthly: 90436,
        total: 813924,
        tag: 'DÜŞÜK ORAN'
      },
      {
        id: 'akbank_35_800_12',
        title: '800.000 TL — 12 Ay (%1.03 Faiz)',
        principal: 800000,
        term: 12,
        rateLabel: '%1.03',
        rate: 1.03,
        monthly: 71446,
        total: 857352
      },
      {
        id: 'akbank_35_800_24',
        title: '800.000 TL — 24 Ay (%2.04 Faiz)',
        principal: 800000,
        term: 24,
        rateLabel: '%2.04',
        rate: 2.04,
        monthly: 42980,
        total: 1031520
      },
      {
        id: 'akbank_35_800_36',
        title: '800.000 TL — 36 Ay (%2.42 Faiz)',
        principal: 800000,
        term: 36,
        rateLabel: '%2.42',
        rate: 2.42,
        monthly: 34177,
        total: 1230372
      },
      {
        id: 'akbank_35_800_48',
        title: '800.000 TL — 48 Ay (%2.61 Faiz)',
        principal: 800000,
        term: 48,
        rateLabel: '%2.61',
        rate: 2.61,
        monthly: 30163,
        total: 1447824
      }
    ],
    daily70: [
      {
        id: 'akbank_70_1000_6',
        title: '1.000.000 TL — 6 Ay (%0 Faiz)',
        principal: 1000000,
        term: 6,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 166667,
        total: 1000000,
        tag: '6 AY SIFIR FAİZ'
      },
      {
        id: 'akbank_70_1000_8',
        title: '1.000.000 TL — 8 Ay (%0 Faiz)',
        principal: 1000000,
        term: 8,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 125000,
        total: 1000000,
        tag: '8 AY SIFIR FAİZ'
      },
      {
        id: 'akbank_70_1000_10',
        title: '1.000.000 TL — 10 Ay (%0 Faiz)',
        principal: 1000000,
        term: 10,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 1000000,
        tag: '10 AY SIFIR FAİZ'
      },
      {
        id: 'akbank_70_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: '12 AY SIFIR FAİZ'
      },
      {
        id: 'akbank_70_1000_18',
        title: '1.000.000 TL — 18 Ay (%1.03 Faiz)',
        principal: 1000000,
        term: 18,
        rateLabel: '%1.03',
        rate: 1.03,
        monthly: 61437,
        total: 1105866
      },
      {
        id: 'akbank_70_1000_24',
        title: '1.000.000 TL — 24 Ay (%1.47 Faiz)',
        principal: 1000000,
        term: 24,
        rateLabel: '%1.47',
        rate: 1.47,
        monthly: 50177,
        total: 1204248
      },
      {
        id: 'akbank_70_1000_36',
        title: '1.000.000 TL — 36 Ay (%2.01 Faiz)',
        principal: 1000000,
        term: 36,
        rateLabel: '%2.01',
        rate: 2.01,
        monthly: 39932,
        total: 1437552
      },
      {
        id: 'akbank_70_1000_48',
        title: '1.000.000 TL — 48 Ay (%2.28 Faiz)',
        principal: 1000000,
        term: 48,
        rateLabel: '%2.28',
        rate: 2.28,
        monthly: 35270,
        total: 1692960
      }
    ],
    eurocargo: [
      {
        id: 'akbank_ec_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: 'SIFIR FAİZ'
      },
      {
        id: 'akbank_ec_1000_24',
        title: '1.000.000 TL — 24 Ay (%1.47 Faiz)',
        principal: 1000000,
        term: 24,
        rateLabel: '%1.47',
        rate: 1.47,
        monthly: 50177,
        total: 1204248
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 6. TÜRKİYE İŞ BANKASI
  // ─────────────────────────────────────────────────────────────
  is_bankasi: {
    daily35: [
      {
        id: 'is_35_800_8',
        title: '800.000 TL — 8 Ay (%0.36 İndirimli Faiz)',
        principal: 800000,
        term: 8,
        rateLabel: '%0.36',
        rate: 0.36,
        monthly: 101713,
        total: 813704,
        highlight: true,
        tag: 'ÖZEL DESTEKLİ ORAN'
      },
      {
        id: 'is_35_1000_12',
        title: '1.000.000 TL — 12 Ay (%1.78 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%1.78',
        rate: 1.78,
        monthly: 93782,
        total: 1125384
      },
      {
        id: 'is_35_1000_24',
        title: '1.000.000 TL — 24 Ay (%2.43 Faiz)',
        principal: 1000000,
        term: 24,
        rateLabel: '%2.43',
        rate: 2.43,
        monthly: 56238,
        total: 1349712
      },
      {
        id: 'is_35_1000_36',
        title: '1.000.000 TL — 36 Ay (%2.74 Faiz)',
        principal: 1000000,
        term: 36,
        rateLabel: '%2.74',
        rate: 2.74,
        monthly: 44932,
        total: 1617552
      },
      {
        id: 'is_35_1000_48',
        title: '1.000.000 TL — 48 Ay (%2.88 Faiz)',
        principal: 1000000,
        term: 48,
        rateLabel: '%2.88',
        rate: 2.88,
        monthly: 39784,
        total: 1909632
      }
    ],
    daily70: [
      {
        id: 'is_70_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 / Düşük Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: 'SIFIR FAİZ'
      },
      {
        id: 'is_70_1500_12',
        title: '1.500.000 TL — 12 Ay (%2.46 Faiz)',
        principal: 1500000,
        term: 12,
        rateLabel: '%2.46',
        rate: 2.46,
        monthly: 147004,
        total: 1764048
      },
      {
        id: 'is_70_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.81 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.81',
        rate: 2.81,
        monthly: 88129,
        total: 2115096
      },
      {
        id: 'is_70_2000_24',
        title: '2.000.000 TL — 24 Ay (%3.00 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%3.00',
        rate: 3.00,
        monthly: 120011,
        total: 2880264
      }
    ],
    eurocargo: [
      {
        id: 'is_ec_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true
      },
      {
        id: 'is_ec_2000_24',
        title: '2.000.000 TL — 24 Ay (%3.00 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%3.00',
        rate: 3.00,
        monthly: 120011,
        total: 2880264
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 7. VAKIF KATILIM
  // ─────────────────────────────────────────────────────────────
  vakif_katilim: {
    daily35: [
      {
        id: 'vk_35_800_8',
        title: '800.000 TL — 8 Ay (%0 Kar Payı)',
        principal: 800000,
        term: 8,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 800000,
        highlight: true,
        tag: 'SIFIR KAR PAYI'
      },
      {
        id: 'vk_35_900_9',
        title: '900.000 TL — 9 Ay (%0 Kar Payı)',
        principal: 900000,
        term: 9,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 900000,
        highlight: true,
        tag: '9 AY SIFIR KAR PAYI'
      }
    ],
    daily70: [
      {
        id: 'vk_70_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Kar Payı)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: '12 AY SIFIR KAR PAYI'
      }
    ],
    eurocargo: [
      {
        id: 'vk_ec_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Kar Payı)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: '12 AY SIFIR KAR PAYI'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 8. BNP PARIBAS
  // ─────────────────────────────────────────────────────────────
  bnp_paribas: {
    daily35: [
      {
        id: 'bnp_35_800_8',
        title: '800.000 TL — 8 Ay (%0 Faiz)',
        principal: 800000,
        term: 8,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 100000,
        total: 800000,
        highlight: true,
        tag: 'SIFIR FAİZ'
      }
    ],
    daily70: [
      {
        id: 'bnp_70_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: '12 AY SIFIR FAİZ'
      }
    ],
    eurocargo: [
      {
        id: 'bnp_ec_1000_12',
        title: '1.000.000 TL — 12 Ay (%0 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0 Faiz',
        rate: 0,
        monthly: 83333,
        total: 1000000,
        highlight: true,
        tag: 'SIFIR FAİZ'
      }
    ]
  }
};

/**
 * Verilen araç serisi ve banka için geçerli kampanyaları döndürür.
 * Müşteri "diger_yok" seçtiğinde otomatik olarak TEB Cetelem kampanyaları döner.
 */
export function getCampaignsForVehicleAndBank(modelKey = 'daily35', bankId = 'teb_cetelem') {
  // Normalize model key
  let category = 'daily35';
  const lower = (modelKey || '').toLowerCase();
  if (lower.includes('70') || lower.includes('72')) {
    category = 'daily70';
  } else if (lower.includes('eurocargo') || lower.includes('ml') || lower.includes('100e') || lower.includes('120e') || lower.includes('150e') || lower.includes('160e') || lower.includes('180e')) {
    category = 'eurocargo';
  } else if (lower.includes('çekici') || lower.includes('s-way') || lower.includes('sway')) {
    category = 'eurocargo';
  } else {
    category = 'daily35';
  }

  // Müşteri hiçbiri/diğer seçtiyse otomatik TEB Cetelem'e bağla
  const effectiveBankId = bankId === 'diger_yok' ? 'teb_cetelem' : (bankId || 'teb_cetelem');
  const bankData = BANK_CAMPAIGNS[effectiveBankId] || BANK_CAMPAIGNS.teb_cetelem;

  const campaigns = bankData[category] || bankData.daily35 || [];
  return {
    category,
    effectiveBankId,
    campaigns
  };
}
