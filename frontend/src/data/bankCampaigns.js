// IVECO Ekim 2026 Resmi Banka Kampanyaları & Yüksek Tutarlı Finansman Matrisi
// Kaynak: LM_EKİM 2026 KAMPANYALARI_14102026.xlsx
// DİKKAT: Bayi katkı payı (destek tutarı / reel komisyon) müşteri gizliliği gereği bu dosyada YER ALMAZ.
// Yalnızca müşterinin görebileceği: Kredi Tutarı, Vade, Müşteri Faiz Oranı, Aylık Taksit ve Toplam Ödeme bilgileri bulunur.

export const AMOUNT_TIERS = [
  { id: 'all', label: 'Tüm Tutarlar', min: 0, max: 99999999 },
  { id: 'zero_interest', label: '💎 %0 Faiz (800K - 1M TL)', min: 400000, max: 1000000 },
  { id: 'high_credit', label: '🚀 Yüksek Kredi (1.2M - 2.5M TL)', min: 1100000, max: 2500000 },
  { id: 'fleet', label: '🏢 Büyük Filo & Ağır Vasıta (3M - 5M TL)', min: 2600000, max: 10000000 }
];

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
    description: 'IVECO Resmi Taşıt Finansmanı — %0 Faizden 2.500.000 TL\'ye varan seçenekler'
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
    description: 'Faizsiz Katılım Finansmanı & 3.000.000 TL\'ye kadar İlk 6 Ay 0 TL Taksit'
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
    description: '2.500.000 TL\'ye kadar özel %0.99 faizli ve 60 aya varan ticari finansman'
  },
  {
    id: 'is_bankasi',
    name: 'Türkiye İş Bankası',
    shortName: 'İş Bankası',
    badge: 'İndirimli & 5M Filo',
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.15)',
    border: 'rgba(96, 165, 250, 0.4)',
    icon: '🏦',
    description: '5.000.000 TL\'ye kadar indirimli ticari faiz oranları ve 48 ay eşit taksit'
  },
  {
    id: 'akbank',
    name: 'Akbank',
    shortName: 'Akbank',
    badge: '6-12 Ay %0 & Yüksek Kredi',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(248, 113, 113, 0.4)',
    icon: '🦁',
    description: 'Daily 35 & 70 için %0 faiz ve 2.500.000 TL\'ye varan ticari destekli oranlar'
  },
  {
    id: 'yapi_kredi',
    name: 'Yapı Kredi',
    shortName: 'Yapı Kredi',
    badge: 'Esnek Tutar & 2.5M',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(96, 165, 250, 0.4)',
    icon: '🦅',
    description: 'Esnek tutarlı %0 faiz ve 2.500.000 TL\'ye varan eşit taksitli kredi'
  },
  {
    id: 'vakif_katilim',
    name: 'Vakıf Katılım',
    shortName: 'Vakıf Katılım',
    badge: '%0 Kar Payı & 2M+',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(251, 191, 36, 0.4)',
    icon: '⭐',
    description: 'Katılım bankacılığı prensipleriyle 8-12 ay sıfır kar payı ve yüksek limit'
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
    description: 'Daily 70 ve Eurocargo için 1.000.000 TL %0 faiz ve 2.500.000 TL ticari kredi'
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
    description: 'Herhangi bir banka ile çalışmıyorsanız resmi finansman ortağımız TEB Cetelem ile anında kredi tahsisi sağlanır'
  }
];

// Bankalara ve araç sınıflarına göre Ekim 2026 kampanyaları
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
        tag: 'EN ÇOK TERCİH EDİLEN'
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
        id: 'teb_35_1000_12',
        title: '1.000.000 TL — 12 Ay (İndirimli)',
        principal: 1000000,
        term: 12,
        rateLabel: '%1.04',
        rate: 1.04,
        monthly: 89372,
        total: 1072464,
        tag: 'DÜŞÜK ORAN'
      },
      {
        id: 'teb_35_1200_12',
        title: '1.200.000 TL — 12 Ay (Yüksek Kredi)',
        principal: 1200000,
        term: 12,
        rateLabel: '%1.47',
        rate: 1.47,
        monthly: 110278,
        total: 1323336,
        tag: 'YÜKSEK LİMİT'
      },
      {
        id: 'teb_35_1500_24',
        title: '1.500.000 TL — 24 Ay (Yüksek Kredi)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.13',
        rate: 2.13,
        monthly: 81476,
        total: 1955424,
        highlight: true,
        tag: 'YÜKSEK KREDİ / 2 YIL'
      },
      {
        id: 'teb_35_1500_36',
        title: '1.500.000 TL — 36 Ay Uzun Vade',
        principal: 1500000,
        term: 36,
        rateLabel: '%2.40',
        rate: 2.40,
        monthly: 63833,
        total: 2297988
      },
      {
        id: 'teb_35_1500_48',
        title: '1.500.000 TL — 48 Ay Rahat Ödeme',
        principal: 1500000,
        term: 48,
        rateLabel: '%2.50',
        rate: 2.50,
        monthly: 54927,
        total: 2636496
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
        tag: '1 YIL SIFIR FAİZ'
      },
      {
        id: 'teb_70_1200_12',
        title: '1.200.000 TL — 12 Ay (%0.61 Faiz)',
        principal: 1200000,
        term: 12,
        rateLabel: '%0.61',
        rate: 0.61,
        monthly: 104278,
        total: 1251336,
        tag: 'ÖZEL İNDİRİM'
      },
      {
        id: 'teb_70_1500_12',
        title: '1.500.000 TL — 12 Ay (%1.21 Faiz)',
        principal: 1500000,
        term: 12,
        rateLabel: '%1.21',
        rate: 1.21,
        monthly: 135597,
        total: 1627164,
        tag: 'YÜKSEK KREDİ'
      },
      {
        id: 'teb_70_1500_24',
        title: '1.500.000 TL — 24 Ay (%1.99 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%1.99',
        rate: 1.99,
        monthly: 80151,
        total: 1923624,
        highlight: true,
        tag: '24 AY AVANTAJ'
      },
      {
        id: 'teb_70_1500_36',
        title: '1.500.000 TL — 36 Ay (%2.30 Faiz)',
        principal: 1500000,
        term: 36,
        rateLabel: '%2.30',
        rate: 2.30,
        monthly: 62801,
        total: 2260836
      },
      {
        id: 'teb_70_2000_12',
        title: '2.000.000 TL — 12 Ay (%1.80 Faiz)',
        principal: 2000000,
        term: 12,
        rateLabel: '%1.80',
        rate: 1.80,
        monthly: 187868,
        total: 2254416,
        tag: '2 MİLYON TL LİMİT'
      },
      {
        id: 'teb_70_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.32 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.32',
        rate: 2.32,
        monthly: 111037,
        total: 2664888,
        highlight: true,
        tag: 'POPÜLER 2M'
      },
      {
        id: 'teb_70_2000_36',
        title: '2.000.000 TL — 36 Ay (%2.53 Faiz)',
        principal: 2000000,
        term: 36,
        rateLabel: '%2.53',
        rate: 2.53,
        monthly: 86987,
        total: 3131532
      },
      {
        id: 'teb_70_2500_24',
        title: '2.500.000 TL — 24 Ay (%2.51 Faiz)',
        principal: 2500000,
        term: 24,
        rateLabel: '%2.51',
        rate: 2.51,
        monthly: 141916,
        total: 3405984,
        tag: 'MAKSİMUM GÜÇ'
      },
      {
        id: 'teb_70_2500_36',
        title: '2.500.000 TL — 36 Ay (%2.67 Faiz)',
        principal: 2500000,
        term: 36,
        rateLabel: '%2.67',
        rate: 2.67,
        monthly: 111159,
        total: 4001724
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
        id: 'teb_ec_1500_24',
        title: '1.500.000 TL — 24 Ay (%1.99 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%1.99',
        rate: 1.99,
        monthly: 80151,
        total: 1923624
      },
      {
        id: 'teb_ec_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.32 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.32',
        rate: 2.32,
        monthly: 111037,
        total: 2664888,
        highlight: true,
        tag: '2 MİLYON TL'
      },
      {
        id: 'teb_ec_2000_36',
        title: '2.000.000 TL — 36 Ay (%2.53 Faiz)',
        principal: 2000000,
        term: 36,
        rateLabel: '%2.53',
        rate: 2.53,
        monthly: 86987,
        total: 3131532
      },
      {
        id: 'teb_ec_2500_24',
        title: '2.500.000 TL — 24 Ay (%2.51 Faiz)',
        principal: 2500000,
        term: 24,
        rateLabel: '%2.51',
        rate: 2.51,
        monthly: 141916,
        total: 3405984,
        highlight: true,
        tag: '2.5 MİLYON TL'
      },
      {
        id: 'teb_ec_2500_36',
        title: '2.500.000 TL — 36 Ay (%2.67 Faiz)',
        principal: 2500000,
        term: 36,
        rateLabel: '%2.67',
        rate: 2.67,
        monthly: 111159,
        total: 4001724
      },
      {
        id: 'teb_ec_3000_24',
        title: '3.000.000 TL — 24 Ay (%2.60 Faiz)',
        principal: 3000000,
        term: 24,
        rateLabel: '%2.60',
        rate: 2.60,
        monthly: 173200,
        total: 4156800,
        tag: 'FİLO KREDİSİ'
      },
      {
        id: 'teb_ec_4000_36',
        title: '4.000.000 TL — 36 Ay (%2.85 Faiz)',
        principal: 4000000,
        term: 36,
        rateLabel: '%2.85',
        rate: 2.85,
        monthly: 185200,
        total: 6667200,
        tag: 'AĞIR VASITA FİLO'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 2. KUVEYT TÜRK (Katılım Finansmanı & 6 Ay Ödemesiz Bayi Katkılı)
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
        tag: 'SIFIR KAR PAYI'
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
        tag: 'İLK 6 AY 0 TL TAKSİT'
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
        tag: 'İLK 6 AY 0 TL TAKSİT'
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
        total: 2375326,
        highlight: true,
        tag: '1.5M 6 AY ÖDEMESİZ'
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
        tag: 'İLK 6 AY 0 TL'
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
        total: 2375326,
        highlight: true,
        tag: '1.5M 6 AY ÖDEMESİZ'
      },
      {
        id: 'kt_70_grace_1500_36',
        title: '1.500.000 TL — 6 Ay Ödemesiz (36 Ay)',
        principal: 1500000,
        term: 36,
        gracePeriodMonths: 6,
        rateLabel: '%2.67',
        rate: 2.67,
        monthly: 77336,
        total: 2784087
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
        total: 3172216,
        highlight: true,
        tag: '2 MİLYON TL'
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
      },
      {
        id: 'kt_70_grace_2500_24',
        title: '2.500.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 2500000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.35',
        rate: 2.35,
        monthly: 165200,
        total: 3964800,
        tag: '2.5 MİLYON TL'
      },
      {
        id: 'kt_70_grace_2500_36',
        title: '2.500.000 TL — 6 Ay Ödemesiz (36 Ay)',
        principal: 2500000,
        term: 36,
        gracePeriodMonths: 6,
        rateLabel: '%2.45',
        rate: 2.45,
        monthly: 129400,
        total: 4658400
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
        total: 2375326
      },
      {
        id: 'kt_ec_grace_2000_24',
        title: '2.000.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 2000000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.20',
        rate: 2.20,
        monthly: 132176,
        total: 3172216,
        highlight: true,
        tag: '2 MİLYON TL'
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
      },
      {
        id: 'kt_ec_grace_3000_24',
        title: '3.000.000 TL — 6 Ay Ödemesiz (24 Ay)',
        principal: 3000000,
        term: 24,
        gracePeriodMonths: 6,
        rateLabel: '%2.20',
        rate: 2.20,
        monthly: 198000,
        total: 4752000,
        highlight: true,
        tag: '3 MİLYON TL FİLO'
      },
      {
        id: 'kt_ec_grace_3000_36',
        title: '3.000.000 TL — 6 Ay Ödemesiz (36 Ay)',
        principal: 3000000,
        term: 36,
        gracePeriodMonths: 6,
        rateLabel: '%2.35',
        rate: 2.35,
        monthly: 154500,
        total: 5562000,
        tag: '3 MİLYON TL / 3 YIL'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 3. GARANTİ BBVA & GARANTİ %0,99 (2.500.000 TL'ye kadar)
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
        id: 'garanti_35_1000_12_099',
        title: '1.000.000 TL — 12 Ay (%0.99 Kampanya)',
        principal: 1000000,
        term: 12,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 89071,
        total: 1068852,
        highlight: true,
        tag: 'ÖZEL %0.99'
      },
      {
        id: 'garanti_35_1000_24_099',
        title: '1.000.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 1000000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 47295,
        total: 1135080,
        tag: 'ÖZEL %0.99 2 YIL'
      },
      {
        id: 'garanti_35_1500_24_099',
        title: '1.500.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 1500000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 70943,
        total: 1702632,
        highlight: true,
        tag: '1.5M %0.99'
      },
      {
        id: 'garanti_35_1500_36_099',
        title: '1.500.000 TL — 36 Ay (%0.99 Kampanya)',
        principal: 1500000,
        term: 36,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 50162,
        total: 1805832
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
        id: 'garanti_70_1000_24_099',
        title: '1.000.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 1000000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 47295,
        total: 1135080,
        tag: '%0.99 2 YIL'
      },
      {
        id: 'garanti_70_1500_12_099',
        title: '1.500.000 TL — 12 Ay (%0.99 Kampanya)',
        principal: 1500000,
        term: 12,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 133606,
        total: 1603272,
        tag: '1.5M %0.99'
      },
      {
        id: 'garanti_70_1500_24_099',
        title: '1.500.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 1500000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 70943,
        total: 1702632,
        highlight: true,
        tag: '1.5M 24 AY'
      },
      {
        id: 'garanti_70_1500_36_099',
        title: '1.500.000 TL — 36 Ay (%0.99 Kampanya)',
        principal: 1500000,
        term: 36,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 50162,
        total: 1805832
      },
      {
        id: 'garanti_70_2000_12_099',
        title: '2.000.000 TL — 12 Ay (%0.99 Kampanya)',
        principal: 2000000,
        term: 12,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 178141,
        total: 2137692,
        tag: '2 MİLYON TL'
      },
      {
        id: 'garanti_70_2000_24_099',
        title: '2.000.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 2000000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 94590,
        total: 2270160,
        highlight: true,
        tag: '2M %0.99 2 YIL'
      },
      {
        id: 'garanti_70_2000_36_099',
        title: '2.000.000 TL — 36 Ay (%0.99 Kampanya)',
        principal: 2000000,
        term: 36,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 66882,
        total: 2407752
      },
      {
        id: 'garanti_70_2500_24_099',
        title: '2.500.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 2500000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 118238,
        total: 2837712,
        highlight: true,
        tag: '2.5M MAKSİMUM'
      },
      {
        id: 'garanti_70_2500_36_099',
        title: '2.500.000 TL — 36 Ay (%0.99 Kampanya)',
        principal: 2500000,
        term: 36,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 83603,
        total: 3009708
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
        title: '1.500.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 1500000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 70943,
        total: 1702632
      },
      {
        id: 'garanti_ec_2000_24_099',
        title: '2.000.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 2000000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 94590,
        total: 2270160,
        highlight: true,
        tag: '2M %0.99'
      },
      {
        id: 'garanti_ec_2000_36_099',
        title: '2.000.000 TL — 36 Ay (%0.99 Kampanya)',
        principal: 2000000,
        term: 36,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 66882,
        total: 2407752
      },
      {
        id: 'garanti_ec_2500_24_099',
        title: '2.500.000 TL — 24 Ay (%0.99 Kampanya)',
        principal: 2500000,
        term: 24,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 118238,
        total: 2837712,
        highlight: true,
        tag: '2.5M %0.99'
      },
      {
        id: 'garanti_ec_2500_36_099',
        title: '2.500.000 TL — 36 Ay (%0.99 Kampanya)',
        principal: 2500000,
        term: 36,
        rateLabel: '%0.99',
        rate: 0.99,
        monthly: 83603,
        total: 3009708
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 4. TÜRKİYE İŞ BANKASI (5.000.000 TL'ye kadar)
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
        tag: 'İNDİRİMLİ FAİZ'
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
        id: 'is_35_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.81 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.81',
        rate: 2.81,
        monthly: 88129,
        total: 2115096,
        highlight: true,
        tag: '1.5M TİCARİ'
      },
      {
        id: 'is_35_1500_36',
        title: '1.500.000 TL — 36 Ay (%3.01 Faiz)',
        principal: 1500000,
        term: 36,
        rateLabel: '%3.01',
        rate: 3.01,
        monthly: 70383,
        total: 2533788
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
        total: 2115096,
        highlight: true,
        tag: '1.5M TİCARİ'
      },
      {
        id: 'is_70_2000_12',
        title: '2.000.000 TL — 12 Ay (%2.80 Faiz)',
        principal: 2000000,
        term: 12,
        rateLabel: '%2.80',
        rate: 2.80,
        monthly: 200218,
        total: 2402616
      },
      {
        id: 'is_70_2000_24',
        title: '2.000.000 TL — 24 Ay (%3.00 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%3.00',
        rate: 3.00,
        monthly: 120011,
        total: 2880264,
        highlight: true,
        tag: '2 MİLYON TL'
      },
      {
        id: 'is_70_2000_36',
        title: '2.000.000 TL — 36 Ay (%3.15 Faiz)',
        principal: 2000000,
        term: 36,
        rateLabel: '%3.15',
        rate: 3.15,
        monthly: 95844,
        total: 3450384
      },
      {
        id: 'is_70_2500_24',
        title: '2.500.000 TL — 24 Ay (%3.11 Faiz)',
        principal: 2500000,
        term: 24,
        rateLabel: '%3.11',
        rate: 3.11,
        monthly: 151906,
        total: 3645744,
        tag: '2.5 MİLYON TL'
      },
      {
        id: 'is_70_2500_36',
        title: '2.500.000 TL — 36 Ay (%3.23 Faiz)',
        principal: 2500000,
        term: 36,
        rateLabel: '%3.23',
        rate: 3.23,
        monthly: 121296,
        total: 4366656
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
      },
      {
        id: 'is_ec_2500_24',
        title: '2.500.000 TL — 24 Ay (%3.11 Faiz)',
        principal: 2500000,
        term: 24,
        rateLabel: '%3.11',
        rate: 3.11,
        monthly: 151906,
        total: 3645744
      },
      {
        id: 'is_ec_3000_24',
        title: '3.000.000 TL — 24 Ay (%3.19 Faiz)',
        principal: 3000000,
        term: 24,
        rateLabel: '%3.19',
        rate: 3.19,
        monthly: 183796,
        total: 4411104,
        highlight: true,
        tag: '3 MİLYON TL'
      },
      {
        id: 'is_ec_3000_36',
        title: '3.000.000 TL — 36 Ay (%3.28 Faiz)',
        principal: 3000000,
        term: 36,
        rateLabel: '%3.28',
        rate: 3.28,
        monthly: 146753,
        total: 5283108
      },
      {
        id: 'is_ec_4000_24',
        title: '4.000.000 TL — 24 Ay (%3.28 Faiz)',
        principal: 4000000,
        term: 24,
        rateLabel: '%3.28',
        rate: 3.28,
        monthly: 247546,
        total: 5941104,
        highlight: true,
        tag: '4 MİLYON TL'
      },
      {
        id: 'is_ec_4000_36',
        title: '4.000.000 TL — 36 Ay (%3.35 Faiz)',
        principal: 4000000,
        term: 36,
        rateLabel: '%3.35',
        rate: 3.35,
        monthly: 197663,
        total: 7115868
      },
      {
        id: 'is_ec_5000_24',
        title: '5.000.000 TL — 24 Ay (%3.33 Faiz)',
        principal: 5000000,
        term: 24,
        rateLabel: '%3.33',
        rate: 3.33,
        monthly: 311318,
        total: 7471632,
        highlight: true,
        tag: '5 MİLYON TL FİLO'
      },
      {
        id: 'is_ec_5000_36',
        title: '5.000.000 TL — 36 Ay (%3.39 Faiz)',
        principal: 5000000,
        term: 36,
        rateLabel: '%3.39',
        rate: 3.39,
        monthly: 248570,
        total: 8948520,
        tag: 'DEV FİLO PLANI'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 5. AKBANK
  // ─────────────────────────────────────────────────────────────
  akbank: {
    daily35: [
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
        id: 'akbank_35_1200_24',
        title: '1.200.000 TL — 24 Ay (%2.04 Faiz)',
        principal: 1200000,
        term: 24,
        rateLabel: '%2.04',
        rate: 2.04,
        monthly: 64470,
        total: 1547280,
        tag: 'YÜKSEK LİMİT'
      },
      {
        id: 'akbank_35_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.15 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.15',
        rate: 2.15,
        monthly: 81850,
        total: 1964400,
        highlight: true,
        tag: '1.5M TİCARİ'
      }
    ],
    daily70: [
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
        id: 'akbank_70_1500_24',
        title: '1.500.000 TL — 24 Ay (%1.85 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%1.85',
        rate: 1.85,
        monthly: 78540,
        total: 1884960,
        highlight: true,
        tag: '1.5M KREDİ'
      },
      {
        id: 'akbank_70_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.10 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.10',
        rate: 2.10,
        monthly: 108250,
        total: 2598000,
        highlight: true,
        tag: '2 MİLYON TL'
      },
      {
        id: 'akbank_70_2500_24',
        title: '2.500.000 TL — 24 Ay (%2.25 Faiz)',
        principal: 2500000,
        term: 24,
        rateLabel: '%2.25',
        rate: 2.25,
        monthly: 137800,
        total: 3307200,
        tag: '2.5M MAKSİMUM'
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
        id: 'akbank_ec_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.10 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.10',
        rate: 2.10,
        monthly: 108250,
        total: 2598000,
        highlight: true
      },
      {
        id: 'akbank_ec_3000_24',
        title: '3.000.000 TL — 24 Ay (%2.35 Faiz)',
        principal: 3000000,
        term: 24,
        rateLabel: '%2.35',
        rate: 2.35,
        monthly: 167500,
        total: 4020000,
        tag: 'FİLO KREDİ'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 6. YAPI KREDİ
  // ─────────────────────────────────────────────────────────────
  yapi_kredi: {
    daily35: [
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
        id: 'yk_35_1000_12',
        title: '1.000.000 TL — 12 Ay (%1.10 Faiz)',
        principal: 1000000,
        term: 12,
        rateLabel: '%1.10',
        rate: 1.10,
        monthly: 89721,
        total: 1076652
      },
      {
        id: 'yk_35_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.10 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.10',
        rate: 2.10,
        monthly: 81180,
        total: 1948320,
        highlight: true,
        tag: '1.5M LİMİT'
      }
    ],
    daily70: [
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
        tag: 'KAMPANYALI ORAN'
      },
      {
        id: 'yk_70_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.10 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.10',
        rate: 2.10,
        monthly: 81180,
        total: 1948320,
        highlight: true,
        tag: '1.5M TİCARİ'
      },
      {
        id: 'yk_70_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.25 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.25',
        rate: 2.25,
        monthly: 110200,
        total: 2644800,
        highlight: true,
        tag: '2 MİLYON TL'
      },
      {
        id: 'yk_70_2500_24',
        title: '2.500.000 TL — 24 Ay (%2.40 Faiz)',
        principal: 2500000,
        term: 24,
        rateLabel: '%2.40',
        rate: 2.40,
        monthly: 140500,
        total: 3372000,
        tag: '2.5 MİLYON TL'
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
        total: 1076652
      },
      {
        id: 'yk_ec_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.25 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.25',
        rate: 2.25,
        monthly: 110200,
        total: 2644800,
        highlight: true
      },
      {
        id: 'yk_ec_3000_24',
        title: '3.000.000 TL — 24 Ay (%2.45 Faiz)',
        principal: 3000000,
        term: 24,
        rateLabel: '%2.45',
        rate: 2.45,
        monthly: 169800,
        total: 4075200,
        tag: 'FİLO PLANI'
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
      },
      {
        id: 'vk_35_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.15 Kar Payı)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.15',
        rate: 2.15,
        monthly: 81850,
        total: 1964400,
        highlight: true,
        tag: '1.5M KATILIM'
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
      },
      {
        id: 'vk_70_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.15 Kar Payı)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.15',
        rate: 2.15,
        monthly: 81850,
        total: 1964400,
        highlight: true,
        tag: '1.5M KATILIM'
      },
      {
        id: 'vk_70_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.25 Kar Payı)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.25',
        rate: 2.25,
        monthly: 110200,
        total: 2644800,
        tag: '2 MİLYON TL'
      },
      {
        id: 'vk_70_2500_24',
        title: '2.500.000 TL — 24 Ay (%2.35 Kar Payı)',
        principal: 2500000,
        term: 24,
        rateLabel: '%2.35',
        rate: 2.35,
        monthly: 139500,
        total: 3348000,
        tag: '2.5 MİLYON TL'
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
      },
      {
        id: 'vk_ec_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.25 Kar Payı)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.25',
        rate: 2.25,
        monthly: 110200,
        total: 2644800,
        highlight: true
      },
      {
        id: 'vk_ec_3000_24',
        title: '3.000.000 TL — 24 Ay (%2.40 Kar Payı)',
        principal: 3000000,
        term: 24,
        rateLabel: '%2.40',
        rate: 2.40,
        monthly: 168500,
        total: 4044000,
        tag: '3 MİLYON TL FİLO'
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
      },
      {
        id: 'bnp_35_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.15 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.15',
        rate: 2.15,
        monthly: 81850,
        total: 1964400,
        highlight: true,
        tag: '1.5M TİCARİ'
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
      },
      {
        id: 'bnp_70_1500_24',
        title: '1.500.000 TL — 24 Ay (%2.15 Faiz)',
        principal: 1500000,
        term: 24,
        rateLabel: '%2.15',
        rate: 2.15,
        monthly: 81850,
        total: 1964400,
        highlight: true,
        tag: '1.5M KREDİ'
      },
      {
        id: 'bnp_70_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.25 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.25',
        rate: 2.25,
        monthly: 110200,
        total: 2644800,
        tag: '2 MİLYON TL'
      },
      {
        id: 'bnp_70_2500_24',
        title: '2.500.000 TL — 24 Ay (%2.35 Faiz)',
        principal: 2500000,
        term: 24,
        rateLabel: '%2.35',
        rate: 2.35,
        monthly: 139500,
        total: 3348000,
        tag: '2.5 MİLYON TL'
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
      },
      {
        id: 'bnp_ec_2000_24',
        title: '2.000.000 TL — 24 Ay (%2.25 Faiz)',
        principal: 2000000,
        term: 24,
        rateLabel: '%2.25',
        rate: 2.25,
        monthly: 110200,
        total: 2644800,
        highlight: true
      },
      {
        id: 'bnp_ec_3000_24',
        title: '3.000.000 TL — 24 Ay (%2.40 Faiz)',
        principal: 3000000,
        term: 24,
        rateLabel: '%2.40',
        rate: 2.40,
        monthly: 168500,
        total: 4044000,
        tag: '3 MİLYON TL FİLO'
      }
    ]
  }
};

/**
 * Verilen araç serisi, banka ve isteğe bağlı tutar aralığı filtresine göre kampanyaları döndürür.
 * Müşteri "diger_yok" seçtiğinde otomatik olarak TEB Cetelem kampanyaları döner.
 */
export function getCampaignsForVehicleAndBank(modelKey = 'daily35', bankId = 'teb_cetelem', tierId = 'all') {
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

  let campaigns = bankData[category] || bankData.daily35 || [];

  // Tutar Filtresi uygulama
  if (tierId && tierId !== 'all') {
    const tier = AMOUNT_TIERS.find(t => t.id === tierId);
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
