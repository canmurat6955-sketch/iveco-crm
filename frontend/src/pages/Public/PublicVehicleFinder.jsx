import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { discoveryApi } from '../../api/client';
import toast, { Toaster } from 'react-hot-toast';
import { BANK_LIST, AMOUNT_TIERS, getCampaignsForVehicleAndBank } from '../../data/bankCampaigns';
import {
  FiTruck,
  FiCheckCircle,
  FiDollarSign,
  FiShield,
  FiPhoneCall,
  FiMessageSquare,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiLayers,
  FiCalendar,
  FiZap,
  FiChevronRight,
  FiDownload,
  FiFileText,
  FiAlertCircle,
  FiMaximize2,
  FiShare2,
  FiCopy,
  FiExternalLink,
  FiSend,
  FiSmartphone,
  FiEye,
  FiX,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { getPublicOrigin } from '../../utils/publicUrl';

// ── RESMİ SATIŞ SORUMLUSU BİLGİLERİ ─────────────────────────────
const SALES_REP = {
  name: 'Can Murat Onay',
  title: 'Satış Sorumlusu',
  dealership: 'IVECO ERC Samsun Otomotiv',
  dealershipShort: 'IVECO ERC Samsun',
  phoneDisplay: '0544 622 59 31',
  phoneClean: '05446225931',
  phoneWhatsapp: '905446225931',
  email: 'murat.onay@ercsamsunotomotiv.com',
  city: 'Samsun',
  initials: 'CMO'
};

// Sektör Seçenekleri
const SECTORS = [
  { id: 'hafriyat_santiye', icon: '🚜', label: 'Hafriyat, Damper & Şantiye', desc: 'T-Way 10 & 12 teker, kaya, maden, agrega ve hazır beton' },
  { id: 'gida_frigo', icon: '🥩', label: 'Soğuk Zincir & Gıda', desc: 'Et, süt, tavuk, dondurma, peynir ve medikal' },
  { id: 'kargo_dagitim', icon: '📦', label: 'Kargo & Dağıtım', desc: 'Şehir içi koli, e-ticaret, mobilya, beyaz eşya' },
  { id: 'insaat_malzeme', icon: '🏗️', label: 'İnşaat & Nalbur', desc: 'Demir, çimento, kereste, hırdavat, agrega' },
  { id: 'tarim_yem', icon: '🌾', label: 'Tarım, Un & Yem', desc: 'Çeltik, un çuvalı, fındık, tohum ve gübre' },
  { id: 'oto_kurtarma', icon: '🚚', label: 'Oto Kurtarma', desc: '7/24 kayar kasa araç taşıma ve yol yardım' },
  { id: 'agir_nakliye', icon: '🛣️', label: 'Ağır Vasıta & Çekici', desc: 'Şehirlerarası ve uluslararası tır taşımacılığı' }
];

// Hızlı Tonaj Seçenekleri
const QUICK_TONNAGES = [
  { id: '1_5_ton', label: '1.5 Ton', payloadKg: 1500, badge: 'B Ehliyet Kamyonet', desc: 'Otomobil ehliyeti, takografsız, şehir içine 7/24 serbest' },
  { id: '3_5_ton', label: '3.5 Ton', payloadKg: 3500, badge: 'B Ehliyet / Çift Teker', desc: '3.5 Ton kamyonet dayanımı, B sınıfı ehliyet, şehir içi serbest dağıtım' },
  { id: '4_8_ton', label: '4.8 Ton', payloadKg: 4800, badge: 'Daily 72C Kamyon', desc: '7.970 kg kantar geçeri, sınıfının en yüksek net yükü' },
  { id: '6_5_ton', label: '6.5 Ton', payloadKg: 6500, badge: 'Eurocargo 100E', desc: '10.875 kg kantar geçeri, şehirlerarası ve bölge dağıtım' },
  { id: '8_0_ton', label: '8.0 Ton', payloadKg: 8000, badge: 'Eurocargo 120E', desc: '12.950 kg kantar geçeri, 6.50 metreye kadar kasa' },
  { id: '10_5_ton', label: '10.5 Ton', payloadKg: 10500, badge: 'Eurocargo 150E', desc: '16.060 kg kantar geçeri, 7.50 metreye kadar dev kasa' },
  { id: '11_0_ton', label: '11.0 Ton', payloadKg: 11000, badge: 'Eurocargo 160', desc: '17.080 kg kantar geçeri, havalı süspansiyon, 320 BG' },
  { id: '16_0_ton', label: '16.0 Ton (10 Teker Yol)', payloadKg: 16000, badge: 'Eurocargo 10 Teker', desc: '26.000 kg kantar geçeri, 3 dingil 10 teker, 16 ton net yük, 8.40m dev kasa' },
  { id: '18_0_ton', label: '18.0 Ton (10T T-Way)', payloadKg: 18000, badge: 'T-Way 10 Teker 6x4', desc: '26.000 kg kantar / 41 Ton GVW, 460/540 BG Cursor 13, Hardox Damper' },
  { id: '24_0_ton', label: '24.0 Ton (12T T-Way)', payloadKg: 24000, badge: 'T-Way 12 Teker 8x4', desc: '32.000 kg kantar / 50 Ton GVW, 4 aks çift çeker, 460/540 BG Cursor 13' },
  { id: '25_0_ton', label: '25 Ton+ Çekici', payloadKg: 25000, badge: 'IVECO S-Way', desc: '40.000+ kg çekici katar ağırlığı, 13.60 dorse, 530 HP' },
];

// Kasa Seçenekleri ve Dara Ağırlıkları
const BODY_TYPES = [
  { id: 'panelvan', icon: '🚐', name: 'Fabrika Orijinal Sac Panelvan', tare: 0, desc: '12 m³, 16 m³ ve 18 m³ orijinal sac kargo gövde (Ek kasa maliyetsiz)' },
  { id: 'damper', icon: '🚜', name: 'Damper Kasa (Hardox Hafriyat)', tare: 2500, desc: 'Kum, çakıl, hafriyat, kaya, agrega ve dökme malzeme' },
  { id: 'frigo', icon: '❄️', name: 'Frigorifik Soğutuculu Kasa', tare: 1100, desc: '-18°C dondurucu veya +4°C taze gıda taşımacılığı' },
  { id: 'kapali_kutu', icon: '📦', name: 'Kapalı Kutu / Kargo Kasası', tare: 650, desc: 'Mobilya, tekstil, koli ve kuru gıda taşımacılığı' },
  { id: 'acik_sac', icon: '🪵', name: 'Açık Sac / Ahşap İlave Kasa', tare: 500, desc: 'Demir, profil, inşaat malzemesi ve paletli yük' },
  { id: 'kayar_perde', icon: '🚛', name: 'Kayar Perde / Tente Kasa', tare: 750, desc: 'Hızlı yan yükleme, paletli kargo ve içecek sevkiyatı' },
  { id: 'oto_kurtarma', icon: '🛞', name: 'Kayar Kasa Platform', tare: 1200, desc: 'Araç taşıma, vinç ve oto çekici üstyapısı' }
];

// IVECO Resmi Araç Kataloğu (Doğrudan Seçim ve Çoklu Öneriler İçin)
const VEHICLE_CATALOG = [
  // ── PANELVAN MODELLERİ (FABRİKA SAC KASA) ──
  {
    key: 'panelvan_12',
    category: 'panelvan',
    categoryLabel: '🚐 Panelvan',
    title: 'Daily 35S16 Panelvan 12 m³',
    fullTitle: 'IVECO Daily 35S16 Panelvan (3520 Şasi - 12 m³)',
    modelTitle: 'IVECO Daily 35S16 Panelvan (3520 Şasi - 12 m³)',
    series: 'Daily 35S Panelvan',
    wheelbase: '3520 mm (3520L H2)',
    payloadKg: 1350,
    volumeM3: 12,
    badge: 'B Sınıfı • 3.5 Ton Kamyonet • 12 m³ Sac Gövde',
    license: 'B Sınıfı (Otomobil Ehliyeti)',
    kantarLimit: 4130,
    unladenWeight: 2150,
    kantarStatus: 'exempt',
    kantarTitle: '3.5 Ton Kamyonet Statüsünde (B Sınıfı Ehliyet)',
    kantarDesc: '2.150 kg boş ağırlık (fabrika sac gövde dahil), 3.500 kg azami yüklü ağırlık kapasitesi. Şehir merkezine 7/24 takografsız serbest giriş.',
    dims: {
      length: '354 cm (İç Yükleme)',
      width: '174 cm (Davlumbaz: 132 cm)',
      height: '190 cm (İç Tavan H2)',
      volume: '12.0 m³',
      pallets: '4 - 5 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
    pdfName: 'DAILY PANELVAN 12M3 TEKNİK FÖY.pdf',
    priceRange: '2.110.000 TL (Peşin) / 2.300.000 TL (Kampanyalı)',
    campaignPriceText: '2.300.000 TL',
    cashPriceText: '2.110.000 TL',
    cashDiscountText: '190.000 TL',
    defaultLoan: 1000000,
    bodyType: 'panelvan'
  },
  {
    key: 'panelvan_16',
    category: 'panelvan',
    categoryLabel: '🚐 Panelvan',
    title: 'Daily 35S16 Panelvan 16 m³',
    fullTitle: 'IVECO Daily 35S16 Panelvan (4100 Şasi - 16 m³)',
    modelTitle: 'IVECO Daily 35S16 Panelvan (4100 Şasi - 16 m³)',
    series: 'Daily 35S Panelvan',
    wheelbase: '4100 mm (4100L H2)',
    payloadKg: 1250,
    volumeM3: 16,
    badge: 'B Sınıfı • 3.5 Ton Kamyonet • 16 m³ Sac Gövde',
    license: 'B Sınıfı (Otomobil Ehliyeti)',
    kantarLimit: 4130,
    unladenWeight: 2280,
    kantarStatus: 'exempt',
    kantarTitle: '3.5 Ton Kamyonet Statüsünde (B Sınıfı Ehliyet)',
    kantarDesc: '2.280 kg boş ağırlık, 3.500 kg azami yüklü ağırlık kapasitesi. 4.68 metre iç yükleme boyu ile kargo ve şehir içi e-ticaret dağıtımında standart belirleyici.',
    dims: {
      length: '468 cm (İç Yükleme)',
      width: '174 cm (Davlumbaz: 132 cm)',
      height: '190 cm (İç Tavan H2)',
      volume: '16.0 m³',
      pallets: '5 - 6 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
    pdfName: 'DAILY PANELVAN 16M3 TEKNİK FÖY.pdf',
    priceRange: '2.140.000 TL (Peşin) / 2.330.000 TL (Kampanyalı)',
    campaignPriceText: '2.330.000 TL',
    cashPriceText: '2.140.000 TL',
    cashDiscountText: '190.000 TL',
    defaultLoan: 1000000,
    bodyType: 'panelvan'
  },
  {
    key: 'panelvan_18',
    category: 'panelvan',
    categoryLabel: '🚐 Panelvan',
    title: 'Daily 35C16 Panelvan 18 m³ (Çift Teker)',
    fullTitle: 'IVECO Daily 35C16 Panelvan (4100 Şasi - 18 m³ Çift Teker)',
    modelTitle: 'IVECO Daily 35C16 Panelvan (4100 Şasi - 18 m³ Çift Teker)',
    series: 'Daily 35C Panelvan',
    wheelbase: '4100 mm (4100L H3 Süper Yüksek Tavan)',
    payloadKg: 1350,
    volumeM3: 18,
    badge: 'B Sınıfı • Çift Teker • 18 m³ Dev Hacim',
    license: 'B Sınıfı (Kamyonet Ruhsatlı)',
    kantarLimit: 4130,
    unladenWeight: 2380,
    kantarStatus: 'exempt',
    kantarTitle: '3.5 Ton Kamyonet Statüsünde (B Sınıfı Ehliyet)',
    kantarDesc: '2.380 kg boş ağırlık, 3.500 kg azami yüklü ağırlık kapasitesi. Çift arka tekerlek dayanımı ve 2.10 m iç tavan yüksekliğiyle 18 m³ dev yükleme hacmi.',
    dims: {
      length: '468 cm (İç Yükleme)',
      width: '174 cm (Davlumbaz: 103 cm)',
      height: '210 cm (İç Tavan H3 Süper Yüksek)',
      volume: '18.0 m³ Dev Hacim',
      pallets: '6 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
    pdfName: 'DAILY PANELVAN 18M3 ÇİFT TEKER TEKNİK FÖY.pdf',
    priceRange: '2.300.000 TL (Peşin) / 2.490.000 TL (Kampanyalı)',
    campaignPriceText: '2.490.000 TL',
    cashPriceText: '2.300.000 TL',
    cashDiscountText: '190.000 TL',
    defaultLoan: 1000000,
    bodyType: 'panelvan'
  },

  // ── ŞASİ KAMYONET (B EHLİYET - 3.5 TON KAMYONET) ──
  {
    key: 'chassis_35s',
    category: 'kamyonet',
    categoryLabel: '🚛 Kamyonet (B)',
    title: 'Daily 35S16 Tek Teker Şasi',
    fullTitle: 'IVECO Daily 35S16 Tek Teker Şasi (3450 / 3750 / 4100 mm)',
    modelTitle: 'IVECO Daily 35S16 Tek Teker Şasi (3450 / 3750 / 4100 mm)',
    series: 'Daily 35S',
    wheelbase: '3450 - 4100 mm',
    payloadKg: 1500,
    volumeM3: 16,
    badge: 'B Sınıfı • 3.5 Ton Kamyonet • Şehir İçi Serbest',
    license: 'B Sınıfı (Otomobil Ehliyeti)',
    kantarLimit: 4130,
    unladenWeight: 2000,
    kantarStatus: 'exempt',
    kantarTitle: '3.5 Ton Kamyonet Statüsünde (B Sınıfı Ehliyet)',
    kantarDesc: '2.000 kg boş ağırlık (şoför+yakıt dahil), 3.500 kg azami yüklü ağırlık, şehir merkezine 7/24 takografsız serbest giriş. 3.50m - 5.00m kasa seçeneği.',
    dims: {
      length: '350 - 500 cm (Önerilen: 430 cm)',
      width: '215 - 235 cm (Önerilen: 215 cm)',
      height: '160 - 300 cm (Önerilen: 200 cm)',
      volume: '16.0 m³',
      pallets: '8 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
    pdfName: 'DAILY KAMYONET TEKNİK FÖY .pdf',
    priceRange: '1.885.000 TL (Peşin) / 2.075.000 TL (Kampanyalı)',
    campaignPriceText: '2.075.000 TL',
    cashPriceText: '1.885.000 TL',
    cashDiscountText: '190.000 TL',
    defaultLoan: 1000000,
    bodyType: 'kapali_kutu'
  },
  {
    key: 'chassis_35c',
    category: 'kamyonet',
    categoryLabel: '🚛 Kamyonet (B)',
    title: 'Daily 35C16 Çift Teker Şasi',
    fullTitle: 'IVECO Daily 35C16 Çift Teker Şasi (3450 / 3750 / 4100 mm)',
    modelTitle: 'IVECO Daily 35C16 Çift Teker Şasi (3450 / 3750 / 4100 mm)',
    series: 'Daily 35C',
    wheelbase: '3450 - 4100 mm',
    payloadKg: 3500,
    volumeM3: 20,
    badge: 'B Sınıfı • 3.5 Ton Kamyonet • Çift Teker Dayanımı',
    license: 'B Sınıfı (Otomobil Ehliyeti)',
    kantarLimit: 4130,
    unladenWeight: 2200,
    kantarStatus: 'exempt',
    kantarTitle: '3.5 Ton Kamyonet Statüsünde (B Sınıfı Ehliyet)',
    kantarDesc: '2.200 kg boş ağırlık, 3.500 kg azami yüklü ağırlık. Çift tekerlekli C-profil ağır hizmet şasisi sayesinde yüksek taşıma mukavemetine sahiptir.',
    dims: {
      length: '350 - 500 cm (Önerilen: 430 cm)',
      width: '215 - 235 cm (Önerilen: 220 cm)',
      height: '160 - 300 cm (Önerilen: 210 cm)',
      volume: '20.0 m³',
      pallets: '8 - 10 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
    pdfName: 'DAILY KAMYONET TEKNİK FÖY .pdf',
    priceRange: '2.145.000 TL (Peşin) / 2.335.000 TL (Kampanyalı)',
    campaignPriceText: '2.335.000 TL',
    cashPriceText: '2.145.000 TL',
    cashDiscountText: '190.000 TL',
    defaultLoan: 1000000,
    bodyType: 'kapali_kutu'
  },


  // ── KAMYON GRUBU (C EHLİYET - RESMİ KANTARLI) ──
  {
    key: 'truck_72c',
    category: 'kamyon',
    categoryLabel: '🚚 Kamyon (C)',
    title: 'Daily 72C18 Şasi Kamyon',
    fullTitle: 'IVECO Daily 72C18 Şasi Kamyon (3750 / 4350 / 4750 mm)',
    modelTitle: 'IVECO Daily 72C18 Şasi Kamyon (3750 / 4350 / 4750 mm)',
    series: 'Daily 72C',
    wheelbase: '3750 - 4750 mm',
    payloadKg: 4800,
    volumeM3: 28,
    badge: '7.970 kg Kantar • 4.8 Ton Net Yük',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 7970,
    unladenWeight: 2400,
    kantarStatus: 'safe',
    kantarTitle: '7.970 kg ile Kantardan Geçer',
    kantarDesc: '2.400 kg boş ağırlık (şoför+yakıt dahil), 410 cm ila 620 cm kasa seçeneği, 3.0L 180 HP C-profil şasi.',
    dims: {
      length: '410 - 620 cm (Önerilen: 600 cm)',
      width: '215 - 235 cm (Önerilen: 225 cm)',
      height: '160 - 300 cm (Önerilen: 220 cm)',
      volume: '28.0 m³',
      pallets: '12 - 14 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyon-70c-72c.pdf',
    pdfName: 'DAILY KAMYON TEKNİK FÖY.pdf',
    priceRange: '2.220.000 TL (Peşin) / 2.480.000 TL (Kampanyalı)',
    campaignPriceText: '2.480.000 TL',
    cashPriceText: '2.220.000 TL',
    cashDiscountText: '260.000 TL',
    defaultLoan: 1500000,
    bodyType: 'frigo'
  },
  {
    key: 'truck_100e',
    category: 'kamyon',
    categoryLabel: '🚚 Kamyon (C)',
    title: 'Eurocargo ML 100 E 19',
    fullTitle: 'IVECO Eurocargo ML 100 E 19 (3690 mm Şasi)',
    modelTitle: 'IVECO Eurocargo ML 100 E 19 (3690 mm Şasi)',
    series: 'Eurocargo 100E',
    wheelbase: '3690 mm',
    payloadKg: 6500,
    volumeM3: 35,
    badge: '10.875 kg Kantar • 6.5 Ton Net Yük',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 10875,
    unladenWeight: 3680,
    kantarStatus: 'safe',
    kantarTitle: '10.875 kg ile Kantardan Geçer',
    kantarDesc: '3.680 kg boş ağırlık (şoför+yakıt dahil), 540 cm ila 575 cm kasa boyu, Tector motor.',
    dims: {
      length: '540 - 575 cm (Önerilen: 560 cm)',
      width: '225 - 245 cm',
      height: '220 - 240 cm',
      volume: '35.0 m³',
      pallets: '14 Euro Palet'
    },
    pdfUrl: '/specs/eurocargo-ml100e19.pdf',
    pdfName: 'ML 100 E 19 TEKNİK FÖY .pdf',
    priceRange: '3.330.000 TL (Peşin) / 3.570.000 TL (Kampanyalı)',
    campaignPriceText: '3.570.000 TL',
    cashPriceText: '3.330.000 TL',
    cashDiscountText: '240.000 TL',
    defaultLoan: 1500000,
    bodyType: 'kayar_perde'
  },
  {
    key: 'truck_120e',
    category: 'kamyon',
    categoryLabel: '🚚 Kamyon (C)',
    title: 'Eurocargo ML 120 EL 19',
    fullTitle: 'IVECO Eurocargo ML 120 EL 19 (3690 / 4185 mm Şasi)',
    modelTitle: 'IVECO Eurocargo ML 120 EL 19 (3690 / 4185 mm Şasi)',
    series: 'Eurocargo 120E',
    wheelbase: '3690 - 4185 mm',
    payloadKg: 8000,
    volumeM3: 42,
    badge: '12.950 kg Kantar • 8.0 Ton Net Yük',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 12950,
    unladenWeight: 4000,
    kantarStatus: 'safe',
    kantarTitle: '12.950 kg ile Kantardan Geçer',
    kantarDesc: '4.000 kg boş ağırlık, 540 cm ila 650 cm kasa boyu seçeneği.',
    dims: {
      length: '540 - 650 cm (Önerilen: 630 cm)',
      width: '225 - 245 cm',
      height: '225 - 250 cm',
      volume: '42.0 m³',
      pallets: '14 - 16 Euro Palet'
    },
    pdfUrl: '/specs/eurocargo-ml120el19.pdf',
    pdfName: 'ML 120 EL 19 TEKNİK FÖY .pdf',
    priceRange: '3.820.000 TL (Peşin) / 4.060.000 TL (Kampanyalı)',
    campaignPriceText: '4.060.000 TL',
    cashPriceText: '3.820.000 TL',
    cashDiscountText: '240.000 TL',
    defaultLoan: 2000000,
    bodyType: 'kayar_perde'
  },
  {
    key: 'truck_150e',
    category: 'kamyon',
    categoryLabel: '🚚 Kamyon (C)',
    title: 'Eurocargo ML 150 E 21',
    fullTitle: 'IVECO Eurocargo ML 150 E 21 (4455 / 5175 mm Şasi)',
    modelTitle: 'IVECO Eurocargo ML 150 E 21 (4455 / 5175 mm Şasi)',
    series: 'Eurocargo 150E',
    wheelbase: '4455 - 5175 mm',
    payloadKg: 10500,
    volumeM3: 48,
    badge: '16.060 kg Kantar • 10.5 Ton Net Yük',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 16060,
    unladenWeight: 4750,
    kantarStatus: 'safe',
    kantarTitle: '16.060 kg ile Kantardan Geçer',
    kantarDesc: 'Tector 7 motor, 4.750 kg boş ağırlık, 6.50m - 7.50m kasa boyu seçeneği.',
    dims: {
      length: '650 - 750 cm (Önerilen: 710 cm)',
      width: '230 - 250 cm',
      height: '230 - 260 cm',
      volume: '48.0 m³',
      pallets: '16 - 18 Euro Palet'
    },
    pdfUrl: '/specs/eurocargo-ml150e21.pdf',
    pdfName: 'ML 150 E 21 TEKNİK FÖY .pdf',
    priceRange: '4.080.000 TL (Peşin) / 4.320.000 TL (Kampanyalı)',
    campaignPriceText: '4.320.000 TL',
    cashPriceText: '4.080.000 TL',
    cashDiscountText: '240.000 TL',
    defaultLoan: 2000000,
    bodyType: 'kayar_perde'
  },
  {
    key: 'truck_160e',
    category: 'kamyon',
    categoryLabel: '🚚 Kamyon (C)',
    title: 'Eurocargo ML 160 E 32P',
    fullTitle: 'IVECO Eurocargo ML 160 E 32P (5670 mm Şasi)',
    modelTitle: 'IVECO Eurocargo ML 160 E 32P (5670 mm Şasi)',
    series: 'Eurocargo 160',
    wheelbase: '5670 mm',
    payloadKg: 11000,
    volumeM3: 54,
    badge: '17.080 kg Kantar • 11.0 Ton Net Yük',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 17080,
    unladenWeight: 5475,
    kantarStatus: 'safe',
    kantarTitle: '17.080 kg ile Kantardan Geçer',
    kantarDesc: 'Havalı süspansiyonlu, dingilsiz 5.475 kg boş ağırlık, 7.50m - 8.20m dev kasa hacmi.',
    dims: {
      length: '750 - 820 cm (Önerilen: 780 cm)',
      width: '230 - 255 cm',
      height: '240 - 270 cm',
      volume: '54.0 m³',
      pallets: '18 - 20 Euro Palet'
    },
    pdfUrl: '/specs/eurocargo-ml160e32p.pdf',
    pdfName: 'ML 160 E 32P TEKNİK FÖY .pdf',
    priceRange: '4.570.000 TL (Peşin) / 4.810.000 TL (Kampanyalı)',
    campaignPriceText: '4.810.000 TL',
    cashPriceText: '4.570.000 TL',
    cashDiscountText: '240.000 TL',
    defaultLoan: 2500000,
    bodyType: 'kayar_perde'
  },
  {
    key: 'truck_10teker',
    category: 'kamyon',
    categoryLabel: '🚚 10 Teker Kamyon (C)',
    title: 'Eurocargo 10 Teker (16 Ton Net Yük)',
    fullTitle: 'IVECO Eurocargo ML 160/180/260 (6x2 - 10 Teker / 3 Dingil)',
    modelTitle: 'IVECO Eurocargo 10 Teker ML 160/180 (6x2 İlave Dingilli)',
    series: 'Eurocargo 10 Teker',
    wheelbase: '4815 - 5670 mm (İlave Dingilli)',
    payloadKg: 16000,
    volumeM3: 60,
    badge: '26.000 kg Kantar • 16.0 Ton Net Yük • 10 Teker',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 26000,
    unladenWeight: 6800,
    kantarStatus: 'safe',
    kantarTitle: '26.000 kg ile Kantardan Geçer (10 Teker 3 Dingil)',
    kantarDesc: 'Tector 7 motor (320 BG), 6x2 çift dingilli / kaldırılabilir 3. dingil, 16 Ton net taşıma kapasitesi, 8.40m dev kasa boyu.',
    dims: {
      length: '820 - 860 cm (Önerilen: 840 cm)',
      width: '245 - 255 cm',
      height: '240 - 270 cm',
      volume: '60.0 m³',
      pallets: '20 - 22 Euro Palet'
    },
    pdfUrl: '/specs/eurocargo-ml160e32p.pdf',
    pdfName: 'ML 160 E 32P 10 TEKER TEKNİK FÖY .pdf',
    priceRange: '4.570.000 TL (Peşin) / 4.810.000 TL (Kampanyalı)',
    campaignPriceText: '4.810.000 TL',
    cashPriceText: '4.570.000 TL',
    cashDiscountText: '240.000 TL',
    defaultLoan: 2500000,
    bodyType: 'kayar_perde'
  },

  // ── AĞIR ŞANTİYE & HAFRİYAT (T-WAY SERİSİ) ──
  {
    key: 'tway_10teker_540',
    category: 'hafriyat',
    categoryLabel: '🚜 10 Teker Hafriyat (T-Way)',
    title: 'T-Way 10 Teker Hafriyat 540 BG (6x4)',
    fullTitle: 'IVECO T-Way AD 380T 54 (6x4 - 10 Teker 540 BG Damper/Hafriyat)',
    modelTitle: 'IVECO T-Way AD 380T 54 6x4 (10 Teker 540 BG Hafriyat Damperi)',
    series: 'T-Way 10 Teker 540',
    wheelbase: '3500 - 3800 mm (Ağır Hizmet 6x4)',
    payloadKg: 15000,
    volumeM3: 18,
    badge: '6x4 Çift Çeker • 540 BG Cursor 13 • 10 Teker Hafriyat',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 26000,
    unladenWeight: 11500,
    kantarStatus: 'safe',
    kantarTitle: '26.000 kg Karayolları Kantarı / 41.000 kg Şantiye GVW',
    kantarDesc: 'Cursor 13 (540 BG / 2.500 Nm Tork), 16 ileri Hi-Tronix otomatik şanzıman (Rocking Mode), ağır hizmet poyra redüksiyonlu 6x4 çift çeker akslar, 16-18 m³ Hardox 450 hafriyat damperi.',
    dims: {
      length: '540 cm (Damper Kasa)',
      width: '240 cm',
      height: '150 cm',
      volume: '18.0 m³',
      pallets: 'Hardox 450 Damper'
    },
    pdfUrl: '/specs/t-way-ad380t54-tipper.pdf',
    pdfName: 'Teknik Foy_T-Way_AD380T54_Rigid_6x4_Tipper.pdf',
    priceRange: "Fiyatlandırma için Can Murat'a Danışabilirsiniz",
    isTway: true,
    consultPrompt: "Fiyatlandırma için Can Murat'a Danışabilirsiniz",
    defaultLoan: 3000000,
    bodyType: 'damper'
  },
  {
    key: 'tway_10teker_460',
    category: 'hafriyat',
    categoryLabel: '🚜 10 Teker Hafriyat (T-Way)',
    title: 'T-Way 10 Teker Hafriyat 460 BG (6x4)',
    fullTitle: 'IVECO T-Way AD 380T 46 (6x4 - 10 Teker 460 BG Damper/Hafriyat)',
    modelTitle: 'IVECO T-Way AD 380T 46 6x4 (10 Teker 460 BG Hafriyat Damperi)',
    series: 'T-Way 10 Teker 460',
    wheelbase: '3500 - 3800 mm (Ağır Hizmet 6x4)',
    payloadKg: 15000,
    volumeM3: 18,
    badge: '6x4 Çift Çeker • 460 BG Cursor 11/13 • 10 Teker Hafriyat',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 26000,
    unladenWeight: 11200,
    kantarStatus: 'safe',
    kantarTitle: '26.000 kg Karayolları Kantarı / 41.000 kg Şantiye GVW',
    kantarDesc: 'Cursor 11/13 (460 BG / 2.150 Nm Tork), 16 ileri Hi-Tronix, 6x4 çift çeker ağır hizmet poyra redüksiyonlu akslar, 16-18 m³ Hardox hafriyat damperi.',
    dims: {
      length: '540 cm (Damper Kasa)',
      width: '240 cm',
      height: '150 cm',
      volume: '18.0 m³',
      pallets: 'Hardox 450 Damper'
    },
    pdfUrl: '/specs/t-way-ad380t54-tipper.pdf',
    pdfName: 'T-WAY AD 380T 46 6x4 HAFRİYAT TEKNİK FÖY.pdf',
    priceRange: "Fiyatlandırma için Can Murat'a Danışabilirsiniz",
    isTway: true,
    consultPrompt: "Fiyatlandırma için Can Murat'a Danışabilirsiniz",
    defaultLoan: 3000000,
    bodyType: 'damper'
  },
  {
    key: 'tway_12teker_540',
    category: 'hafriyat',
    categoryLabel: '🚜 12 Teker Hafriyat (T-Way)',
    title: 'T-Way 12 Teker Hafriyat 540 BG (8x4)',
    fullTitle: 'IVECO T-Way AD 410T 54 (8x4 - 12 Teker 540 BG Ağır Hafriyat Damperi)',
    modelTitle: 'IVECO T-Way AD 410T 54 8x4 (12 Teker 540 BG Ağır Hafriyat)',
    series: 'T-Way 12 Teker 540',
    wheelbase: '4350 - 4750 mm (10 mm Çelik Şasi)',
    payloadKg: 18000,
    volumeM3: 24,
    badge: '8x4 Çift Çeker • 540 BG Cursor 13 • 12 Teker Ağır Hafriyat',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 32000,
    unladenWeight: 14000,
    kantarStatus: 'safe',
    kantarTitle: '32.000 kg Karayolları Kantarı / 50.000 kg Şantiye GVW',
    kantarDesc: 'Cursor 13 (540 BG / 2.500 Nm Tork), 16 ileri Hi-Tronix otomatik, 10 mm şasi et kalınlığı, ön çift yönlendirilebilir dümen aksı + arka çift çeker tandem akslar, 22-24 m³ Hardox 450/500 kaya ve hafriyat damperi.',
    dims: {
      length: '640 cm (Damper Kasa)',
      width: '240 cm',
      height: '160 cm',
      volume: '22.0 - 24.0 m³',
      pallets: 'Hardox Kaya Damperi'
    },
    pdfUrl: '/specs/t-way-ad410t54-tipper.pdf',
    pdfName: 'Teknik Foy_T-Way_AD410T54_Rigid_8x4_Tipper.pdf',
    priceRange: "Fiyatlandırma için Can Murat'a Danışabilirsiniz",
    isTway: true,
    consultPrompt: "Fiyatlandırma için Can Murat'a Danışabilirsiniz",
    defaultLoan: 3000000,
    bodyType: 'damper'
  },
  {
    key: 'tway_12teker_460',
    category: 'hafriyat',
    categoryLabel: '🚜 12 Teker Hafriyat (T-Way)',
    title: 'T-Way 12 Teker Hafriyat 460 BG (8x4)',
    fullTitle: 'IVECO T-Way AD 410T 46 (8x4 - 12 Teker 460 BG Hafriyat / Mikser)',
    modelTitle: 'IVECO T-Way AD 410T 46 8x4 (12 Teker 460 BG Hafriyat)',
    series: 'T-Way 12 Teker 460',
    wheelbase: '4350 - 4750 mm (10 mm Şasi)',
    payloadKg: 18000,
    volumeM3: 24,
    badge: '8x4 Çift Çeker • 460 BG Cursor 11/13 • 12 Teker Hafriyat',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 32000,
    unladenWeight: 13800,
    kantarStatus: 'safe',
    kantarTitle: '32.000 kg Karayolları Kantarı / 50.000 kg Şantiye GVW',
    kantarDesc: 'Cursor 11/13 (460 BG / 2.150 Nm Tork), 16 ileri Hi-Tronix, 8x4 çift çeker 4 aks, 20-24 m³ Hardox hafriyat damperi veya 10-12 m³ beton mikseri şasisi.',
    dims: {
      length: '640 cm (Damper Kasa)',
      width: '240 cm',
      height: '160 cm',
      volume: '20.0 - 24.0 m³',
      pallets: 'Hardox Damper / Mikser'
    },
    pdfUrl: '/specs/t-way-ad410t46b-mixer.pdf',
    pdfName: 'Teknik Foy_TW_Rigid_8x4_AD410T46.pdf',
    priceRange: "Fiyatlandırma için Can Murat'a Danışabilirsiniz",
    isTway: true,
    consultPrompt: "Fiyatlandırma için Can Murat'a Danışabilirsiniz",
    defaultLoan: 3000000,
    bodyType: 'damper'
  },

  // ── AĞIR VASITA & ÇEKİCİ ──
  {
    key: 'tractor_sway',
    category: 'cekici',
    categoryLabel: '🛣️ Çekici (CE)',
    title: 'IVECO S-Way 500 / 580 Çekici',
    fullTitle: 'IVECO S-Way 500 / 580 Çekici (Cursor 13)',
    modelTitle: 'IVECO S-Way 500 / 580 Çekici (Cursor 13)',
    series: 'S-Way 500',
    wheelbase: '3800 mm',
    payloadKg: 25000,
    volumeM3: 92,
    badge: '40.000+ kg Uluslararası Tır Katarı',
    license: 'CE Sınıfı Ehliyet',
    kantarLimit: 40000,
    unladenWeight: 7800,
    kantarStatus: 'safe',
    kantarTitle: '40.000+ kg Uluslararası Tır Katar Limiti',
    kantarDesc: 'Cursor 13 motor, Hi-Tronix şanzıman ve yüksek tavan çift yataklı kabin.',
    dims: {
      length: '1360 cm (Dorse)',
      width: '248 cm',
      height: '270 - 300 cm',
      volume: '90 - 100 m³',
      pallets: '33 Euro Palet'
    },
    pdfUrl: '/specs/s-way-500-full-plus.pdf',
    pdfName: 'S-WAY 500 FULL PLUS TEKNİK FÖY .pdf',
    priceRange: '123.000 € (500 Full Plus) / 126.000 € (580) / 131.000 € (Diamond)',
    currency: 'EUR',
    displayPrice: '123.000 € – 131.000 €',
    modelsDetail: '500 Full Plus: 123.000 € • 580 Full Plus: 126.000 € • 580 Diamond: 131.000 €',
    defaultLoan: 3000000,
    bodyType: 'kayar_perde'
  }
];


export default function PublicVehicleFinder() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || 'whatsapp_durum';
  const customerIdParam = searchParams.get('cid') || searchParams.get('customer_id');
  const companyParam = searchParams.get('company') || searchParams.get('firma') || searchParams.get('comp') || '';
  const nameParam = searchParams.get('name') || searchParams.get('yetkili') || '';
  const phoneParam = searchParams.get('phone') || searchParams.get('tel') || '';
  const sectorParam = searchParams.get('sector') || '';
  const payloadParam = searchParams.get('payload') || searchParams.get('tonaj') || '';
  const volumeParam = searchParams.get('volume') || searchParams.get('hacim') || '';
  const bodyParam = searchParams.get('body') || searchParams.get('kasa') || '';
  const modelParam = searchParams.get('model') || searchParams.get('arac') || '';

  const location = useLocation();
  const isTestRoute = location.pathname.includes('/test') || searchParams.get('preview') === 'true' || searchParams.get('test') === 'true' || searchParams.get('demo') === 'true';
  const isPreviewMode = isTestRoute;
  const isVipCustomer = Boolean(customerIdParam || companyParam || nameParam || phoneParam);

  const [step, setStep] = useState(1);
  const [selectorMode, setSelectorMode] = useState(modelParam ? 'catalog' : 'catalog');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [selectedModelKey, setSelectedModelKey] = useState(modelParam || null);
  const [selectedSector, setSelectedSector] = useState(
    SECTORS.some(s => s.id === sectorParam) ? sectorParam : 'gida_frigo'
  );
  
  // Tonaj & Hacim State'leri
  const [payloadKg, setPayloadKg] = useState(
    payloadParam && !isNaN(Number(payloadParam)) ? Number(payloadParam) : 4800
  );
  const [volumeM3, setVolumeM3] = useState(
    volumeParam && !isNaN(Number(volumeParam)) ? Number(volumeParam) : 28
  );
  const [customDims, setCustomDims] = useState(false);
  const [bodyLengthCm, setBodyLengthCm] = useState(580);
  const [bodyWidthCm, setBodyWidthCm] = useState(225);
  const [bodyHeightCm, setBodyHeightCm] = useState(220);
  const [selectedBody, setSelectedBody] = useState(
    BODY_TYPES.some(b => b.id === bodyParam) ? bodyParam : 'frigo'
  );

  // Doğrudan Araç Seçimi & Sürgü Etkileşim Fonksiyonları
  const handleSelectVehicle = (modelKey) => {
    const item = VEHICLE_CATALOG.find(v => v.key === modelKey);
    if (!item) return;
    setSelectedModelKey(item.key);
    setPayloadKg(item.payloadKg);
    setVolumeM3(item.volumeM3);
    setSelectedBody(item.bodyType || 'kapali_kutu');
    setCustomDims(false);
    toast.success(`${item.title} seçildi! ✓`);
  };

  const handlePayloadChange = (val) => {
    setSelectedModelKey(null);
    setPayloadKg(val);
  };

  const handleVolumeChange = (val) => {
    setSelectedModelKey(null);
    setVolumeM3(val);
  };

  // URL'den gelen modelParam parametresini otomatik seç (T-Way kısayolları dahil)
  useEffect(() => {
    if (modelParam) {
      const lower = modelParam.toLowerCase();
      let matchedKey = null;
      if (lower === 'tway_10teker_540' || lower === 'tway_10_540' || lower === 'tway10_540') matchedKey = 'tway_10teker_540';
      else if (lower === 'tway_10teker_460' || lower === 'tway_10_460' || lower === 'tway10_460') matchedKey = 'tway_10teker_460';
      else if (lower === 'tway_12teker_540' || lower === 'tway_12_540' || lower === 'tway12_540') matchedKey = 'tway_12teker_540';
      else if (lower === 'tway_12teker_460' || lower === 'tway_12_460' || lower === 'tway12_460') matchedKey = 'tway_12teker_460';
      else if (lower.includes('12') && lower.includes('tway')) matchedKey = 'tway_12teker_540';
      else if (lower.includes('10') && lower.includes('tway')) matchedKey = 'tway_10teker_540';
      else if (lower === 'tway' || lower === 't-way') matchedKey = 'tway_10teker_540';
      else {
        const found = VEHICLE_CATALOG.find(v => v.key.toLowerCase() === lower);
        if (found) matchedKey = found.key;
      }
      if (matchedKey) {
        handleSelectVehicle(matchedKey);
      }
    }
  }, [modelParam]);

  // Kredi Parametreleri (Çoklu Banka & Tutar Kırılımları - Ekim 2026 Kampanyaları)
  const [selectedBankId, setSelectedBankId] = useState('teb_cetelem');
  const [selectedTierId, setSelectedTierId] = useState('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  // VIP Test & Simülasyon Paneli State'leri (Satış Sorumlusu: Can Murat Onay)
  const [showTestPanel, setShowTestPanel] = useState(isTestRoute);
  const [testGenCompany, setTestGenCompany] = useState(companyParam || 'Öz Karadeniz Lojistik Ltd.');
  const [testGenPhone, setTestGenPhone] = useState(phoneParam || SALES_REP.phoneDisplay);
  const [testSimulationResult, setTestSimulationResult] = useState(null);

  // Müşteriye Prestijli Link & Teklif Gönderme Masası (WhatsApp / E-Posta / QR / vCard)
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendCompany, setSendCompany] = useState(companyParam || 'Öz Karadeniz Lojistik Ltd.');
  const [sendPhone, setSendPhone] = useState(phoneParam || SALES_REP.phoneDisplay);
  const [sendEmail, setSendEmail] = useState('');
  const [sendContactName, setSendContactName] = useState(nameParam || '');
  const [sendTemplate, setSendTemplate] = useState('vip'); // 'vip' | 'quick' | 'heavy'
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    if (companyParam) {
      setSendCompany(companyParam);
      setTestGenCompany(companyParam);
    }
    if (phoneParam) {
      setSendPhone(phoneParam);
      setTestGenPhone(phoneParam);
    }
    if (nameParam) setSendContactName(nameParam);
  }, [companyParam, phoneParam, nameParam]);

  // Müşteri İletişim Formu (Mevcut Müşteri Linkinden Otomatik Doldurma)
  const [customerName, setCustomerName] = useState(nameParam);
  const [customerCompany, setCustomerCompany] = useState(companyParam);
  const [customerPhone, setCustomerPhone] = useState(phoneParam);
  const [customerCity, setCustomerCity] = useState('Samsun');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [startTime] = useState(Date.now());

  // Kişisel VIP Link tıklandığında CRM'e sessizce dijital niyet / ziyaret sinyali kaydet
  useEffect(() => {
    if (!isPreviewMode && (customerIdParam || phoneParam || companyParam)) {
      const parsedCid = customerIdParam ? parseInt(customerIdParam, 10) : undefined;
      discoveryApi.recordIntentSignal({
        source: 'whatsapp_personalized_link',
        search_query: `[Kişisel Link Ziyareti]: ${companyParam || nameParam || 'VIP Müşteri'} Araç Seçiciyi Açtı`,
        target_model: 'IVECO Şasi & Kasa Seçici',
        company_name: companyParam || nameParam || 'Kayıtlı Müşteri',
        phone: phoneParam || undefined,
        city: 'Samsun',
        page_url: window.location.href,
        referrer: document.referrer || 'whatsapp_chat',
        duration_seconds: 3,
        scroll_depth: 30,
        intent_score: 92,
        intent_level: 'high',
        matched_customer_id: !isNaN(parsedCid) ? parsedCid : undefined,
        notes: `Müşteri WhatsApp üzerinden iletilen kişiselleştirilmiş şasi & kantar seçici bağlantısını tıkladı.`
      }).catch(err => console.debug('Intent signal log error:', err));
    }
  }, [customerIdParam, phoneParam, companyParam, isPreviewMode]);

  // ── KESİN ŞASİ, KASA BOYUTLARI VE KANTAR EŞLEŞTİRME MOTORU ──────
  const matched = useMemo(() => {
    // 1. Müşteri doğrudan katalogdan araç seçtiyse:
    if (selectedModelKey) {
      const item = VEHICLE_CATALOG.find(v => v.key === selectedModelKey);
      if (item) {
        const multiRecs = [];
        if (item.payloadKg <= 5000 || item.category === 'panelvan' || item.key === 'chassis_35s' || item.key === 'chassis_35c' || item.key === 'truck_72c') {
          if (item.key !== 'chassis_35c') {
            multiRecs.push({
              key: 'chassis_35c',
              title: 'Daily 35C16 Çift Teker Kamyonet',
              badge: 'B Ehliyet • Kamyonet Ruhsatlı • Çift Teker',
              reason: 'Kamyonet statüsünde olup B sınıfı ehliyetle kullanılır, takograf muafiyeti vardır. Çift tekerlekli C-şasisiyle yüksek yük dayanımına sahiptir.',
              icon: '🚛'
            });
          }
          if (item.category !== 'panelvan') {
            multiRecs.push({
              key: 'panelvan_16',
              title: 'Daily Panelvan (12 m³ / 16 m³ / 18 m³ Çift Teker)',
              badge: 'Fabrika Sac Kasa • 3.5 Ton Kamyonet • Hemen Teslim',
              reason: 'Harici kasa yaptırma masrafı ve süresi olmadan anahtar teslim. Şehir içi dağıtım, kargo ve lojistikte 18 m³e varan dev iç hacim.',
              icon: '🚐'
            });
          } else {
            if (item.key !== 'panelvan_18') {
              multiRecs.push({
                key: 'panelvan_18',
                title: 'Daily 35C16 Panelvan 18 m³ (Çift Teker)',
                badge: '18 m³ Dev Hacim • H3 Yüksek Tavan • B Ehliyet',
                reason: 'Süper yüksek tavan (2.10m), çift tekerlekli ağır hizmet yürüyen aksamı ve 18 m³ maksimum yükleme alanı.',
                icon: '🚐'
              });
            }
            if (item.key !== 'panelvan_12') {
              multiRecs.push({
                key: 'panelvan_12',
                title: 'Daily 35S16 Panelvan 12 m³ (3520 Şasi)',
                badge: '12 m³ Şehir İçi • B Ehliyet • Kıvrak Gövde',
                reason: 'Kompakt 3520 mm şasi, dar sokaklarda üstün manevra kabiliyeti ve 12 m³ pratik sac kargo alanı.',
                icon: '🚐'
              });
            }
          }
          if (item.key !== 'truck_72c' && item.payloadKg >= 3000) {
            multiRecs.push({
              key: 'truck_72c',
              title: 'Daily 72C18 Şasi Kamyon (7.970 kg Kantar)',
              badge: '7.970 kg Kantar • 4.8 Ton Net Yük',
              reason: 'Resmi kantar tescili ile 4.8 ton net yük taşımak ve 6.20 metreye kadar kasa koymak isteyenler için sınıfının lideri.',
              icon: '🚚'
            });
          }
        }

        // T-Way Ağır Şantiye Modelleri Arası Geçiş Önerileri
        if (item.category === 'hafriyat' || item.key.startsWith('tway_')) {
          if (item.key === 'tway_10teker_540') {
            multiRecs.push({
              key: 'tway_10teker_460',
              title: 'T-Way 10 Teker Hafriyat 460 BG (6x4)',
              badge: 'Ekonomik 460 BG • 6x4 Çift Çeker',
              reason: 'Aynı 26.000 kg karayolları kantar geçeri ve çift çeker gücü, daha optimize yakıt tüketimli Cursor 11/13 460 BG motor seçeneği.',
              icon: '🚜'
            });
            multiRecs.push({
              key: 'tway_12teker_540',
              title: 'T-Way 12 Teker Hafriyat 540 BG (8x4)',
              badge: '32.000 kg Kantar • 50 Ton GVW • 8x4 Zirve',
              reason: '4 aks (ön çift dümen, arka çift tandem çeker) ile 32 ton yasal kantar ve 50 ton şantiye taşıma kapasitesi.',
              icon: '🚜'
            });
          } else if (item.key === 'tway_10teker_460') {
            multiRecs.push({
              key: 'tway_10teker_540',
              title: 'T-Way 10 Teker Hafriyat 540 BG (6x4)',
              badge: '540 BG Cursor 13 • 2.500 Nm Zirve Tork',
              reason: 'Zorlu rampa, derin çamur ve ağır ocak şartları için sınıfının en yüksek motor gücü ve tork kapasitesi.',
              icon: '🚜'
            });
            multiRecs.push({
              key: 'tway_12teker_460',
              title: 'T-Way 12 Teker Hafriyat 460 BG (8x4)',
              badge: '32.000 kg Kantar • 8x4 12 Teker',
              reason: 'Daha yüksek kasa hacmi (20-24 m³) ve 32 ton yasal kantar için 4 akslı 8x4 şantiye şasisi.',
              icon: '🚜'
            });
          } else if (item.key === 'tway_12teker_540') {
            multiRecs.push({
              key: 'tway_12teker_460',
              title: 'T-Way 12 Teker Hafriyat 460 BG (8x4)',
              badge: 'Ekonomik 460 BG • 8x4 12 Teker',
              reason: '32 ton yasal kantar geçeri ve 12 teker dengesiyle hafriyat ve hazır beton mikseri için optimize motor.',
              icon: '🚜'
            });
            multiRecs.push({
              key: 'tway_10teker_540',
              title: 'T-Way 10 Teker Hafriyat 540 BG (6x4)',
              badge: 'Kıvrak 6x4 Şasi • 540 BG Cursor 13',
              reason: 'Daha kısa dingil mesafesi, dar şantiye yollarında üstün manevra ve 540 BG güç.',
              icon: '🚜'
            });
          } else if (item.key === 'tway_12teker_460') {
            multiRecs.push({
              key: 'tway_12teker_540',
              title: 'T-Way 12 Teker Hafriyat 540 BG (8x4)',
              badge: '540 BG Cursor 13 • 8x4 En Güçlü Şantiye',
              reason: 'En dik ocak rampalarında ve ağır madencilik şartlarında maksimum çekiş gücü ve dayanım.',
              icon: '🚜'
            });
            multiRecs.push({
              key: 'tway_10teker_460',
              title: 'T-Way 10 Teker Hafriyat 460 BG (6x4)',
              badge: '6x4 Çift Çeker • 26.000 kg Kantar',
              reason: '3 akslı kompakt şasi ile hafriyat döküm sahalarında daha pratik dönüş açısı.',
              icon: '🚜'
            });
          }
        }
        return {
          ...item,
          modelKey: item.key,
          totalGross: item.unladenWeight + item.payloadKg,
          multiRecommendations: multiRecs
        };
      }
    }

    // 2. Otomatik Eşleştirme (Tonaj & Hacim Parametrelerine Göre)
    const bodyTare = BODY_TYPES.find(b => b.id === selectedBody)?.tare || 650;
    const targetVolume = customDims 
      ? (bodyLengthCm * bodyWidthCm * bodyHeightCm) / 1000000 
      : volumeM3;

    // A. Panelvan seçildiyse (Fabrika Sac Kasa):
    if (selectedBody === 'panelvan') {
      let chosenKey = 'panelvan_12';
      if (targetVolume > 16 || payloadKg > 1300) {
        chosenKey = 'panelvan_18';
      } else if (targetVolume > 13) {
        chosenKey = 'panelvan_16';
      }
      const item = VEHICLE_CATALOG.find(v => v.key === chosenKey) || VEHICLE_CATALOG[0];
      const multiRecs = [
        {
          key: 'chassis_35c',
          title: 'Daily 35C16 Çift Teker Kamyonet',
          badge: 'B Ehliyet • Kamyonet Ruhsatlı • Çift Teker',
          reason: 'Kamyonet statüsünde olup B sınıfı ehliyetle kullanılır, takograf muafiyeti vardır. Çift tekerlekli C-şasisiyle yüksek yük dayanımına sahiptir.',
          icon: '🚛'
        },
        chosenKey !== 'panelvan_18' ? {
          key: 'panelvan_18',
          title: 'Daily 35C16 Panelvan 18 m³ Çift Teker',
          badge: '18 m³ Dev Hacim • H3 Yüksek Tavan • B Ehliyet',
          reason: 'Çift teker dayanımı ve 2.10m iç tavan yüksekliğiyle 18 m³ dev yükleme hacmi.',
          icon: '🚐'
        } : {
          key: 'panelvan_16',
          title: 'Daily 35S16 Panelvan 16 m³',
          badge: '16 m³ Kargo • B Ehliyet • Şehir İçi Dağıtım',
          reason: '4.68 m iç yükleme boyu ile uzun koli ve paletli yük dağıtımı.',
          icon: '🚐'
        }
      ];
      return {
        ...item,
        modelKey: item.key,
        totalGross: item.unladenWeight + payloadKg,
        multiRecommendations: multiRecs
      };
    }

    // B. Hafriyat, Damper & Şantiye (T-Way Serisi)
    if (selectedBody === 'damper' || selectedSector === 'hafriyat_santiye') {
      if (payloadKg > 16000 || targetVolume > 20) {
        const item = VEHICLE_CATALOG.find(v => v.key === 'tway_12teker_540');
        return {
          ...item,
          modelKey: 'tway_12teker_540',
          totalGross: 14000 + bodyTare + payloadKg,
          kantarStatus: (14000 + bodyTare + payloadKg) <= 32000 ? 'safe' : 'overload',
          multiRecommendations: [
            {
              key: 'tway_12teker_460',
              title: 'T-Way 12 Teker Hafriyat 460 BG (8x4)',
              badge: 'Ekonomik 460 BG • 8x4 12 Teker',
              reason: '32 ton yasal kantar geçeri ve 12 teker dengesiyle hafriyat ve hazır beton mikseri için optimize motor.',
              icon: '🚜'
            },
            {
              key: 'tway_10teker_540',
              title: 'T-Way 10 Teker Hafriyat 540 BG (6x4)',
              badge: 'Kıvrak 6x4 Şasi • 540 BG Cursor 13',
              reason: 'Daha kısa dingil mesafesi, dar şantiye yollarında üstün manevra ve 540 BG güç.',
              icon: '🚜'
            }
          ]
        };
      } else {
        const item = VEHICLE_CATALOG.find(v => v.key === 'tway_10teker_540');
        return {
          ...item,
          modelKey: 'tway_10teker_540',
          totalGross: 11500 + bodyTare + payloadKg,
          kantarStatus: (11500 + bodyTare + payloadKg) <= 26000 ? 'safe' : 'overload',
          multiRecommendations: [
            {
              key: 'tway_10teker_460',
              title: 'T-Way 10 Teker Hafriyat 460 BG (6x4)',
              badge: 'Ekonomik 460 BG • 6x4 Çift Çeker',
              reason: 'Aynı 26.000 kg karayolları kantar geçeri ve çift çeker gücü, daha optimize yakıt tüketimli Cursor 11/13 460 BG motor seçeneği.',
              icon: '🚜'
            },
            {
              key: 'tway_12teker_540',
              title: 'T-Way 12 Teker Hafriyat 540 BG (8x4)',
              badge: '32.000 kg Kantar • 50 Ton GVW • 8x4 Zirve',
              reason: '4 aks (ön çift dümen, arka çift tandem çeker) ile 32 ton yasal kantar ve 50 ton şantiye taşıma kapasitesi.',
              icon: '🚜'
            }
          ]
        };
      }
    }

    // C. Ağır Vasıta & Çekici (≥ 18 Ton veya Ağır Nakliye)
    if (payloadKg >= 18000 || selectedSector === 'agir_nakliye') {
      const item = VEHICLE_CATALOG.find(v => v.key === 'tractor_sway');
      return {
        ...item,
        modelKey: 'tractor_sway',
        totalGross: 7800 + bodyTare + payloadKg,
        multiRecommendations: [
          {
            key: 'truck_10teker',
            title: 'Eurocargo 10 Teker (16 Ton Net Yük)',
            badge: '26.000 kg Kantar • 3 Dingil 10 Teker',
            reason: 'Dorse takmadan rijit şasi ile 16 ton net yük taşımak için ekonomik filo alternatifi.',
            icon: '🚚'
          },
          {
            key: 'tway_12teker_540',
            title: 'T-Way 12 Teker Hafriyat 540 BG (8x4)',
            badge: '32.000 kg Kantar • 50 Ton GVW • 8x4 Damper',
            reason: 'Şantiye ve dökme malzeme taşımacılığı için 8x4 çift çeker ağır hizmet şasisi.',
            icon: '🚜'
          }
        ]
      };
    }

    // C. Eurocargo 10 Teker (16 Ton Net Yük / 26.000 kg Kantar)
    if (payloadKg >= 13500 || targetVolume > 56) {
      const item = VEHICLE_CATALOG.find(v => v.key === 'truck_10teker');
      return {
        ...item,
        modelKey: 'truck_10teker',
        totalGross: 6800 + bodyTare + payloadKg,
        kantarStatus: (6800 + bodyTare + payloadKg) <= 26000 ? 'safe' : 'overload',
        multiRecommendations: [
          {
            key: 'truck_160e',
            title: 'Eurocargo ML 160 E 32P (Dingilsiz 4x2)',
            badge: '17.080 kg Kantar • 11.0 Ton Net Yük',
            reason: 'Daha kısa dingil mesafesi ve dar alanlarda manevra kabiliyeti arayanlar için dingilsiz 4x2 seçeneği.',
            icon: '🚚'
          },
          {
            key: 'tractor_sway',
            title: 'IVECO S-Way 500 Çekici (40 Ton Katar)',
            badge: '40.000+ kg Uluslararası Tır',
            reason: '13.60 dorse ile 25 ton ve 90 m³ üzeri ağır yükler için uluslararası çekici.',
            icon: '🛣️'
          }
        ]
      };
    }

    // D. Eurocargo 160 (11 Ton Net Yük / 17.080 kg Kantar)
    if (payloadKg > 10500 || targetVolume > 50) {
      const item = VEHICLE_CATALOG.find(v => v.key === 'truck_160e');
      return {
        ...item,
        modelKey: 'truck_160e',
        totalGross: 5475 + bodyTare + payloadKg,
        kantarStatus: (5475 + bodyTare + payloadKg) <= 17080 ? 'safe' : 'overload',
        multiRecommendations: [
          {
            key: 'truck_10teker',
            title: 'Eurocargo 10 Teker (16 Ton Net Yük)',
            badge: '26.000 kg Kantar • İlave Dingilli 10 Teker',
            reason: '11 ton yerine 16 tona kadar resmi kantar kapasitesi ve 8.40m dev kasa hacmi.',
            icon: '🚚'
          }
        ]
      };
    }

    // E. Eurocargo 150E (10 Ton Net Yük / 16.060 kg Kantar)
    if (payloadKg > 8000 || targetVolume > 40) {
      const item = VEHICLE_CATALOG.find(v => v.key === 'truck_150e');
      return {
        ...item,
        modelKey: 'truck_150e',
        totalGross: 4750 + bodyTare + payloadKg,
        kantarStatus: (4750 + bodyTare + payloadKg) <= 16060 ? 'safe' : 'overload',
        multiRecommendations: [
          {
            key: 'truck_160e',
            title: 'Eurocargo ML 160 E 32P (17.080 kg Kantar)',
            badge: '17.080 kg Kantar • 320 BG',
            reason: 'Daha yüksek motor gücü ve 17 ton kantar kapasitesi.',
            icon: '🚚'
          }
        ]
      };
    }

    // F. Eurocargo 120E (8 Ton Net Yük / 12.950 kg Kantar)
    if (payloadKg > 6500 || targetVolume > 32) {
      const item = VEHICLE_CATALOG.find(v => v.key === 'truck_120e');
      return {
        ...item,
        modelKey: 'truck_120e',
        totalGross: 4000 + bodyTare + payloadKg,
        kantarStatus: (4000 + bodyTare + payloadKg) <= 12950 ? 'safe' : 'overload',
        multiRecommendations: [
          {
            key: 'truck_100e',
            title: 'Eurocargo ML 100 E 19 (10.875 kg Kantar)',
            badge: '10.875 kg Kantar • 6.5 Ton Net Yük',
            reason: 'Bölge ve şehirlerarası orta tonaj dağıtımda daha ekonomik işletme maliyeti.',
            icon: '🚚'
          }
        ]
      };
    }

    // G. Eurocargo 100E (6.5 Ton Net Yük / 10.875 kg Kantar)
    if (payloadKg > 4800 || targetVolume > 28) {
      const item = VEHICLE_CATALOG.find(v => v.key === 'truck_100e');
      return {
        ...item,
        modelKey: 'truck_100e',
        totalGross: 3680 + bodyTare + payloadKg,
        kantarStatus: (3680 + bodyTare + payloadKg) <= 10875 ? 'safe' : 'overload',
        multiRecommendations: [
          {
            key: 'truck_72c',
            title: 'Daily 72C18 Şasi Kamyon (7.970 kg Kantar)',
            badge: '7.970 kg Kantar • 4.8 Ton Net Yük',
            reason: 'Daily şasi hafifliği ve esnekliği ile 4.8 ton net yük taşıma avantajı.',
            icon: '🚚'
          },
          {
            key: 'chassis_35c',
            title: 'Daily 35C16 Çift Teker Kamyonet (B Sınıfı Kamyonet)',
            badge: 'B Ehliyet • Kamyonet Ruhsatlı • Çift Teker',
            reason: '3.5 Ton kamyonet ruhsatlı, takograf muafiyetli, B sınıfı ehliyet ve şehir içine 7/24 serbest dağıtım.',
            icon: '🚛'
          }
        ]
      };
    }

    // H. Daily 72C (4.8 Ton Net Yük / 7.970 kg Kantar)
    if (payloadKg > 2000 || targetVolume > 22) {
      const item = VEHICLE_CATALOG.find(v => v.key === 'truck_72c');
      const totalGross = 2400 + bodyTare + payloadKg;
      return {
        ...item,
        modelKey: 'truck_72c',
        totalGross: totalGross,
        kantarStatus: totalGross <= 7970 ? 'safe' : 'overload',
        multiRecommendations: [
          {
            key: 'chassis_35c',
            title: 'Daily 35C16 Çift Teker Kamyonet (3.5 Ton Kamyonet)',
            badge: 'B Ehliyet • Kamyonet Ruhsatlı • Çift Teker Dayanımı',
            reason: 'Kamyonet statüsünde olup takograf zorunluluğu yoktur, B sınıfı otomobil ehliyetiyle kullanılır ve şehir içine 7/24 serbest girer. Çift tekerlekli C-kesit ağır şasisi sayesinde yüksek taşıma mukavemetine sahiptir.',
            icon: '🚛'
          },
          {
            key: 'panelvan_18',
            title: 'Daily 35C16 Panelvan (18 m³ Çift Teker)',
            badge: '18 m³ Dev Hacim • Fabrika Sac Kasa • B Ehliyet',
            reason: 'Kasa yaptırma masrafı ve bekleme süresi olmadan hazır sac kargo gövde. 18 m³ dev yükleme alanı.',
            icon: '🚐'
          }
        ]
      };
    }

    // I. Daily 35C (3.5 Ton Çift Teker Kamyonet)
    if (payloadKg > 1500 || selectedSector === 'insaat_malzeme' || selectedSector === 'tarim_yem') {
      const item = VEHICLE_CATALOG.find(v => v.key === 'chassis_35c');
      return {
        ...item,
        modelKey: 'chassis_35c',
        totalGross: 2200 + bodyTare + payloadKg,
        multiRecommendations: [
          {
            key: 'panelvan_18',
            title: 'Daily 35C16 Panelvan 18 m³ (Çift Teker)',
            badge: '18 m³ Dev Panelvan • 3.5 Ton Kamyonet • Hazır Teslim',
            reason: 'Kasa yaptırma masrafı olmadan 18 m³ orijinal sac kargo gövde, 3.5 ton hafif ticari statüsü, B sınıfı ehliyet.',
            icon: '🚐'
          },
          {
            key: 'panelvan_16',
            title: 'Daily 35S16 Panelvan 16 m³',
            badge: '16 m³ Kargo • B Ehliyet • Tek Teker',
            reason: 'Daha düşük yakıt tüketimi ve tek tekerlekli hafif yürüyen aksam ile 16 m³ hacim.',
            icon: '🚐'
          },
          {
            key: 'truck_72c',
            title: 'Daily 72C18 Şasi Kamyon (7.970 kg Kantar)',
            badge: '7.970 kg Kantar • 4.8 Ton Net Yük',
            reason: 'Resmi kantar tescilli daha yüksek tonaj ve 6.20 metreye varan kasa boyu arayanlara.',
            icon: '🚚'
          }
        ]
      };
    }

    // J. Daily 35S (1.5 Ton Tek Teker Kamyonet)
    const item = VEHICLE_CATALOG.find(v => v.key === 'chassis_35s');
    return {
      ...item,
      modelKey: 'chassis_35s',
      totalGross: 2000 + bodyTare + payloadKg,
      multiRecommendations: [
        {
          key: 'panelvan_12',
          title: 'Daily 35S16 Panelvan 12 m³ (3520 Şasi)',
          badge: '12 m³ Sac Gövde • 3.5 Ton Kamyonet • B Ehliyet',
          reason: 'Kasa beklemeden fabrika orijinal sac gövde, şehir içi dar sokaklarda maksimum kıvraklık.',
          icon: '🚐'
        },
        {
          key: 'panelvan_16',
          title: 'Daily 35S16 Panelvan 16 m³ (4100 Şasi)',
          badge: '16 m³ Geniş Hacim • B Ehliyet • Şehir İçi Dağıtım',
          reason: '4.68 m iç yükleme boyu ile mobilya, koli ve e-ticaret dağıtımında ideal çözüm.',
          icon: '🚐'
        },
        {
          key: 'chassis_35c',
          title: 'Daily 35C16 Çift Teker Kamyonet',
          badge: 'B Ehliyet • Kamyonet Ruhsatlı • Çift Teker Dayanımı',
          reason: 'Ağır yük ihtimaline karşı çift tekerlekli C-profil dayanımı, 3.5 ton kamyonet ruhsatı.',
          icon: '🚛'
        }
      ]
    };
  }, [selectedModelKey, payloadKg, volumeM3, customDims, bodyLengthCm, bodyWidthCm, bodyHeightCm, selectedBody, selectedSector]);

  // Banka ve Kampanya Bilgisi (Ekim 2026 IVECO Resmi Banka Kampanyaları)
  const { category: vehicleCategory, effectiveBankId, campaigns: availableCampaigns } = useMemo(() => {
    return getCampaignsForVehicleAndBank(matched.series, selectedBankId, selectedTierId);
  }, [matched.series, selectedBankId, selectedTierId]);

  const currentBankMeta = useMemo(() => {
    return BANK_LIST.find(b => b.id === selectedBankId) || BANK_LIST[0];
  }, [selectedBankId]);

  const activeCampaign = useMemo(() => {
    if (!availableCampaigns || availableCampaigns.length === 0) return null;
    if (selectedCampaignId) {
      const found = availableCampaigns.find(c => c.id === selectedCampaignId);
      if (found) return found;
    }
    return availableCampaigns.find(c => c.highlight) || availableCampaigns[0];
  }, [availableCampaigns, selectedCampaignId]);

  // Form Gönderimi (Teklif İste & CRM'e Lead / Müşteri Etkileşimi Olarak Yaz)
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      toast.error('Lütfen geçerli bir telefon numarası girin (örn: 0544 622 59 31)');
      return;
    }

    setSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const parsedCid = customerIdParam ? parseInt(customerIdParam, 10) : undefined;

    const campaignSummary = activeCampaign
      ? `${currentBankMeta.name} — ${activeCampaign.title} (Aylık: ${activeCampaign.monthly.toLocaleString('tr-TR')} TL)`
      : `${currentBankMeta.name} (Resmi IVECO Kredi Kampanyası)`;

    const leadPayload = {
      source: customerIdParam ? 'crm_existing_customer' : (refCode || 'whatsapp_link'),
      search_query: `[Şasi & Kasa Seçici]: ${selectedSector} | ${payloadKg} kg | ${volumeM3} m3 | ${selectedBody}`,
      target_model: matched.modelTitle,
      target_campaign: campaignSummary,
      company_name: customerCompany.trim() || customerName.trim() || 'WhatsApp Ziyaretçisi',
      city: customerCity,
      phone: customerPhone.trim(),
      page_url: window.location.href,
      referrer: document.referrer || 'whatsapp_chat',
      duration_seconds: durationSeconds,
      scroll_depth: 100,
      intent_score: 99,
      intent_level: 'very_high',
      matched_customer_id: !isNaN(parsedCid) ? parsedCid : undefined,
      notes: `Müşteri Akıllı Şasi & Kredi Seçiciyi kullandı.\nModel: ${matched.modelTitle}\nŞasi: ${matched.wheelbase}\nYük: ${payloadKg} kg, Hacim: ${matched.dims.volume}\nKasa: ${matched.dims.length} x ${matched.dims.width} x ${matched.dims.height}\nKantar Sınırı: ${matched.kantarLimit} kg, Boş Ağırlık: ${matched.unladenWeight} kg\nFinansman: ${campaignSummary}\nMüşteri Notu: ${customerNotes}`
    };

    if (isPreviewMode) {
      setSubmitted(true);
      setSubmitting(false);
      setTestSimulationResult({
        ...leadPayload,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      });
      toast.success('🛠️ VIP TEST: Can Murat Onay Simülasyonu çalıştırıldı! CRM Pipeline kaydı aşağıda gösterilmektedir.', { duration: 5000 });
      return;
    }

    try {
      await discoveryApi.recordIntentSignal(leadPayload);
      setSubmitted(true);
      toast.success('Talebiniz alındı! Satış Sorumlumuz Can Murat Onay en kısa sürede sizinle iletişime geçecektir.');
    } catch (err) {
      console.error(err);
      toast.error('Kayıt alınırken bir sorun oluştu, lütfen doğrudan WhatsApp üzerinden iletişime geçin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Doğrudan WhatsApp Aç (Can Murat Onay - Satış Sorumlusu)
  const handleDirectWhatsApp = () => {
    const cleanPhone = SALES_REP.phoneWhatsapp;
    const clientGreeting = (customerCompany || customerName)
      ? `Merhaba Can Murat Bey, ben ${customerCompany || customerName}. Paylaştığınız IVECO Akıllı Şasi, Kasa ve Finansman Seçici üzerinden inceleme yaptım.\n\n`
      : `Merhaba Can Murat Bey, paylaştığınız IVECO Akıllı Şasi, Kasa ve Kredi Seçici üzerinden inceleme yaptım.\n\n`;

    const priceText = matched.isTway
      ? `🏷️ *Fiyatlandırma:* T-Way Şantiye & Damper Özel Fiyatı (Can Murat'a Danışılacak)\n`
      : matched.currency === 'EUR'
        ? `🏷️ *Fiyat Aralığı:* ${matched.displayPrice} (${matched.modelsDetail || 'Euro Dövizli'})\n`
        : matched.cashPriceText
          ? `🏷️ *Kampanyalı Fiyat:* ${matched.campaignPriceText}\n🎁 *Net Peşin Fiyat:* ${matched.cashPriceText} (-${matched.cashDiscountText} Peşin İndirimi)\n`
          : '';

    const campaignText = activeCampaign
      ? `💳 *Seçilen Finansman:* ${currentBankMeta.name} — ${activeCampaign.title}\n` +
        `💰 *Aylık Taksit:* ${activeCampaign.monthly.toLocaleString('tr-TR')} TL / ay (Toplam Geri Ödeme: ${activeCampaign.total.toLocaleString('tr-TR')} TL)\n\n`
      : `💳 *Finansman Tercihi:* ${currentBankMeta.name} (Resmi IVECO Finansman Desteği)\n\n`;

    const msg = (
      clientGreeting +
      `🚛 *Tavsiye Edilen Model:* ${matched.modelTitle}\n` +
      `📐 *Önerilen Kasa Boyutları:* ${matched.dims.length} × ${matched.dims.width} × ${matched.dims.height} (${matched.dims.volume})\n` +
      `⚖️ *Yük İhtiyacım:* ${payloadKg} kg Net Yük | Kantar Durumu: ${matched.kantarTitle}\n` +
      priceText +
      campaignText +
      `Bu aracın hazır şasi stok durumu ve resmi teklifi hakkında görüşmek istiyorum.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Can Murat Onay Dijital Kartvizit (vCard) İndirme & Rehbere Ekleme
  const handleDownloadVCard = () => {
    const vcard = 
`BEGIN:VCARD
VERSION:3.0
N:Onay;Can Murat;;;
FN:Can Murat Onay
ORG:IVECO ERC Samsun Otomotiv
TITLE:Satış Sorumlusu
TEL;TYPE=CELL,VOICE;VALUE=uri:tel:+905446225931
EMAIL;TYPE=WORK,INTERNET:murat.onay@ercsamsunotomotiv.com
URL:https://erc-iveco.com/ozel-teklif
NOTE:IVECO ERC Samsun Otomotiv Ticari Araçlar Satış Sorumlusu
END:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Can_Murat_Onay_IVECO_ERC.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📇 Can Murat Onay dijital kartviziti indirildi! Telefon rehberinize kaydedebilirsiniz.', { duration: 4000 });
  };

  // Doğrudan E-Posta Gönderme
  const handleDirectEmail = () => {
    const subject = `IVECO Araç & Finansman Teklifi Talebi — ${customerCompany || customerName || 'Ticari Müşteri'}`;
    const body = `Merhaba Can Murat Bey,\n\nIVECO ERC Samsun Otomotiv üzerinden hazırlanan Akıllı Şasi ve Kredi Portalı'nı inceledim.\n\n` +
      `Seçilen Model: ${matched.modelTitle}\n` +
      `Yük İhtiyacı: ${payloadKg} kg (${matched.kantarTitle})\n` +
      `Finansman: ${currentBankMeta.name} — ${activeCampaign ? `${activeCampaign.principal.toLocaleString('tr-TR')} TL (${activeCampaign.term} Ay)` : 'Resmi Kredi'}\n\n` +
      `Hazır şasi stok teslim tarihi ve resmi proforma teklifi talep ediyorum.\n\n` +
      `Firma: ${customerCompany || '-'}\nYetkili: ${customerName || '-'}\nTelefon: ${customerPhone || '-'}`;
    window.location.href = `mailto:${SALES_REP.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Sayfayı Paylaş / Linki Kopyala
  const handleShareLink = async () => {
    const shareUrl = window.location.href;
    const shareTitle = 'IVECO Akıllı Şasi, Kasa & Finansman Seçici';
    const shareText = `İşinize en uygun IVECO şasisini, kasa ölçülerini ve anlaşmalı banka kredi kampanyalarını (%0 Faiz vb.) buradan hesaplayabilirsiniz:\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Konfigürasyon bağlantısı kopyalandı! 📋');
    } catch {
      toast.error('Bağlantı kopyalanamadı.');
    }
  };

  // VIP Test Paneli Fonksiyonları (Can Murat Onay - Satış Sorumlusu)
  const handleApplyPreset = (type) => {
    if (type === 'panelvan_12') {
      handleSelectVehicle('panelvan_12');
    } else if (type === 'panelvan_16') {
      handleSelectVehicle('panelvan_16');
    } else if (type === 'panelvan_18') {
      handleSelectVehicle('panelvan_18');
    } else if (type === '35s') {
      handleSelectVehicle('chassis_35s');
    } else if (type === '35c') {
      handleSelectVehicle('chassis_35c');
    } else if (type === '72c') {
      handleSelectVehicle('truck_72c');
    } else if (type === '100e') {
      handleSelectVehicle('truck_100e');
    } else if (type === '120e') {
      handleSelectVehicle('truck_120e');
    } else if (type === '150e') {
      handleSelectVehicle('truck_150e');
    } else if (type === '160e') {
      handleSelectVehicle('truck_160e');
    } else if (type === '10teker') {
      handleSelectVehicle('truck_10teker');
    } else if (type === 'tway_10_540') {
      handleSelectVehicle('tway_10teker_540');
    } else if (type === 'tway_10_460') {
      handleSelectVehicle('tway_10teker_460');
    } else if (type === 'tway_12_540') {
      handleSelectVehicle('tway_12teker_540');
    } else if (type === 'tway_12_460') {
      handleSelectVehicle('tway_12teker_460');
    } else if (type === 'sway') {
      handleSelectVehicle('tractor_sway');
    }
  };

  const getGeneratedVipLink = (isTest = false) => {
    const origin = getPublicOrigin();
    const cleanCompany = (testGenCompany || 'VIP Müşteri').trim();
    const cleanPhone = (testGenPhone || SALES_REP.phoneDisplay).trim();
    const testQuery = isTest ? '&test=true' : '';
    const modelQuery = selectedModelKey ? `&model=${selectedModelKey}` : '';
    return `${origin}/ozel-teklif?company=${encodeURIComponent(cleanCompany)}&tel=${encodeURIComponent(cleanPhone)}&ref=muratonay${modelQuery}${testQuery}`;
  };

  const handleCopyGeneratedVipLink = () => {
    const link = getGeneratedVipLink(false);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success('📋 Müşteri VIP Linki Kopyalandı!');
    } else {
      prompt('Müşteri VIP Linki:', link);
    }
  };

  const handleCopyVipWhatsAppTemplate = () => {
    const link = getGeneratedVipLink(false);
    const cleanCompany = (testGenCompany || 'Değerli İş Ortağımız').trim();
    const text = `Sayın ${cleanCompany} Yetkilisi,\n\nIVECO ERC Samsun Otomotiv olarak filonuza ve taşıma operasyonunuza özel hazırladığımız dijital şasi, kasa boyutu ve Ekim 2026 anlaşmalı banka kredi simülatörünü (%0 Faiz ve Yüksek Limitli Ticari Kredi Seçenekleri) incelemeniz için aşağıdaki bağlantıyı hazırladık:\n\n🔗 ${link}\n\nİnceledikten sonra dilediğiniz şasi konfigürasyonunu doğrudan bana iletebilirsiniz.\n\nSaygılarımla,\nCan Murat Onay | Satış Sorumlusu\nIVECO ERC Samsun Otomotiv\n📞 0544 622 59 31\n✉️ murat.onay@ercsamsunotomotiv.com`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('📲 VIP WhatsApp Metni & Linki Kopyalandı!');
    } else {
      prompt('WhatsApp Metni:', text);
    }
  };

  const handleTestOpenGeneratedLink = () => {
    const link = getGeneratedVipLink(true);
    window.open(link, '_blank');
  };

  // Müşteriye Özel Canlı Link (Seçili model ve firma parametreleriyle)
  // Link HER ZAMAN herkese açık canlı adresle üretilir: localhost / 10.x / 192.168.x adresleri
  // müşterinin telefonunda açılmaz.
  const currentClientLink = useMemo(() => {
    const origin = getPublicOrigin();
    const cleanCompany = (sendCompany || 'VIP Müşteri').trim();
    const cleanPhone = (sendPhone || '').replace(/\D/g, '');
    const modelKey = selectedModelKey || matched.modelKey;
    const params = new URLSearchParams();
    if (cleanCompany) params.set('company', cleanCompany);
    if (cleanPhone) params.set('tel', cleanPhone);
    if (modelKey) params.set('model', modelKey);
    params.set('ref', 'muratonay');
    // WhatsApp önizleme önbelleğini kırmak için günlük sürüm kodu (aynı gün aynı link sabit kalır)
    params.set('v', new Date().toISOString().slice(0, 10).replace(/-/g, ''));
    return `${origin}/ozel-teklif?${params.toString()}`;
  }, [sendCompany, sendPhone, selectedModelKey, matched.modelKey]);

  // Telefon Numarası Otomatik Biçimlendirici (Kullanım Kolaylığı)
  const formatPhoneInput = (val) => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  };

  // Prestijli WhatsApp & E-Posta Mesaj Formatlayıcı (3 Farklı Profesyonel Şablon)
  const getFormattedMessage = (templateKey = sendTemplate) => {
    const targetCompany = (sendCompany || sendContactName || 'Değerli İş Ortağımız').trim();
    const targetModel = matched.fullTitle || matched.title;
    const targetKantar = matched.kantarTitle || '26.000 kg Kantar Uygun';
    const targetPayload = (matched.payloadKg / 1000).toFixed(1);
    const link = currentClientLink;

    if (templateKey === 'quick') {
      return (
`Sayın ${targetCompany} Yetkilisi,

İşletmeniz için belirlediğimiz *${targetModel}* aracına ait teknik şasi detaylarını ve Ekim 2026 %0 faizli kredi simülatörünü aşağıdaki bağlantıdan tek tıkla inceleyebilirsiniz:

👉 ${link}

• Net Taşıma: ~${targetPayload} Ton
• Kantar Güvencesi: ${targetKantar}
• Kredi: 12-48 Ay Resmi Banka Taksit Seçenekleri
• İletişim: Can Murat Onay (Satış Sorumlusu) | 0544 622 59 31
• E-Posta: murat.onay@ercsamsunotomotiv.com`
      );
    }

    if (templateKey === 'heavy') {
      return (
`🚜 *AĞIR VASITA & ŞANTİYE TEKLİFİ — ${targetCompany.toUpperCase()}*

Sayın Yetkili,
Ağır hafriyat, maden ve şantiye operasyonunuz için yapılandırdığımız *${targetModel}* aracımıza ait karayolları yasal kantar sınırları, brüt GVW kapasitesi ve Ekim 2026 resmi ticari kredi imkanları hazırlanmıştır:

📌 *Araç:* ${targetModel}
⚖️ *Kantar / GVW:* ${targetKantar}
🛠️ *Damper / Kasa:* Ağır Hizmet Hardox Uyumu
💰 *Ticari Finansman:* 3.000.000 TL - 5.000.000 TL Özel Filo Desteği

Detaylı teknik föyü ve banka ödeme planını buradan anında görüntüleyebilirsiniz:
🔗 ${link}

Saygılarımla,
*Can Murat Onay | Satış Sorumlusu*
IVECO ERC Samsun Otomotiv
📞 0544 622 59 31
✉️ murat.onay@ercsamsunotomotiv.com`
      );
    }

    // Default: 'vip'
    return (
`🌟 *SAYIN ${targetCompany.toUpperCase()} YETKİLİSİ,*

IVECO ERC Samsun Otomotiv olarak, firmanızın taşımacılık operasyonuna özel hazırladığımız dijital şasi konfigürasyonunu ve Ekim 2026 anlaşmalı banka kredi simülatörünü (%0 Faiz ve Yüksek Limitli Ticari Kredi Seçenekleri) bilgilerinize sunarım.

🚛 *Önerilen Model:* ${targetModel}
⚖️ *Kantar Sınırı:* ${targetKantar}
💎 *Finansman:* %0 Faiz & 5.000.000 TL'ye Varan Esnek Vadeli Kredi

Aşağıdaki firmanıza özel güvenli bağlantıdan kasa boyutlarını, kantar analizini ve banka taksit tablolarını doğrudan inceleyebilirsiniz:

🔗 *Size Özel Teklif Portalı:*
${link}

Seçtiğiniz şasinin stok ve fabrika teslim tarihleri için bu mesaja yanıt vermeniz yeterlidir.

Saygılarımla,
*Can Murat Onay | Satış Sorumlusu*
IVECO ERC Samsun Otomotiv
📞 0544 622 59 31
✉️ murat.onay@ercsamsunotomotiv.com`
    );
  };

  const handleSendViaWhatsApp = () => {
    const cleanPhone = (sendPhone || '').replace(/\D/g, '');
    const text = getFormattedMessage();
    let url = '';
    if (cleanPhone.length >= 10) {
      const formattedPhone = cleanPhone.startsWith('90') ? cleanPhone : (cleanPhone.startsWith('0') ? `9${cleanPhone}` : `90${cleanPhone}`);
      url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
    toast.success('WhatsApp sohbeti açıldı! 📲');
  };

  // Müşteriye Hazır E-Posta Taslağı Aç (Outlook / Webmail)
  const handleSendViaEmail = () => {
    const cleanMail = (sendEmail || '').trim();
    const subject = `IVECO ERC Samsun Otomotiv — ${sendCompany || 'Firmanıza Özel'} Şasi ve Finansman Teklifi`;
    const body = getFormattedMessage();
    const mailtoUrl = cleanMail
      ? `mailto:${cleanMail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      : `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    toast.success('E-posta taslağı hazırlandı! ✉️');
  };

  const handleCopyMessage = () => {
    const text = getFormattedMessage();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('📋 Mesaj metni kopyalandı!');
    } else {
      prompt('Mesaj Metni:', text);
    }
  };

  const handleCopyOnlyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentClientLink);
      toast.success('🔗 Müşteri bağlantısı kopyalandı!');
    } else {
      prompt('Müşteri Linki:', currentClientLink);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #080b16 0%, #0d1224 100%)',
      color: '#e2e8f0',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '16px 12px 60px'
    }}>
      <Toaster position="top-center" />

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: '680px', margin: '0 auto 20px', textAlign: 'center' }}>
        
        {/* Can Murat Onay VIP Test & Canlı Simülasyon Dock'u */}
        {showTestPanel && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.8)',
            borderRadius: '16px',
            padding: '16px 18px',
            marginBottom: '20px',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.25)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(245, 158, 11, 0.25)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🛠️</span>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#fbbf24', letterSpacing: '0.5px' }}>
                    CAN MURAT ONAY — VIP TEST & SİMÜLASYON DOCK'U
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Şasi kantar geçişlerini, yüksek kredi tutarlarını ve prestijli müşteri linklerini buradan test edin.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestPanel(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#cbd5e1',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Kapat ✕
              </button>
            </div>

            {/* 1. Hızlı Şasi Simülasyonu */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', marginBottom: '6px' }}>
                1. HIZLI ŞASİ & KASA ÖLÇÜSÜ TESTİ (TEK TIKLA YÜKLE):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px' }}>
                {[
                  { id: 'panelvan_12', label: '🚐 35S16 12 m³', desc: '3520 Şasi (3.5 Ton B Ehliyet)' },
                  { id: 'panelvan_16', label: '🚐 35S16 16 m³', desc: '4100 Şasi (3.5 Ton B Ehliyet)' },
                  { id: 'panelvan_18', label: '🚐 35C16 18 m³', desc: 'Çift Teker H3 (3.5 Ton B Ehliyet)' },
                  { id: '35s', label: 'Daily 35S Tek Teker', desc: '1.5t / 16 m³ (B Ehliyet)' },
                  { id: '35c', label: 'Daily 35C Çift Teker', desc: '3.5t / B Ehliyet Çift Teker' },
                  { id: '72c', label: 'Daily 72C Kamyon', desc: '4.8t / 7.970 kg Kantar' },
                  { id: '100e', label: 'Eurocargo 100E', desc: '6.5t / 10.875 kg Kantar' },
                  { id: '120e', label: 'Eurocargo 120E', desc: '8t / 12.950 kg Kantar' },
                  { id: '10teker', label: 'Eurocargo 10 Teker', desc: '16 Ton / 26.000 kg Kantar' },
                  { id: 'tway_10_540', label: '🚜 T-Way 10T 540 BG', desc: '6x4 / 10 Teker / Cursor 13' },
                  { id: 'tway_10_460', label: '🚜 T-Way 10T 460 BG', desc: '6x4 / 10 Teker Hafriyat' },
                  { id: 'tway_12_540', label: '🚜 T-Way 12T 540 BG', desc: '8x4 / 12 Teker / 32-50t GVW' },
                  { id: 'tway_12_460', label: '🚜 T-Way 12T 460 BG', desc: '8x4 / 12 Teker Hafriyat' },
                  { id: 'sway', label: 'IVECO S-Way', desc: '25t+ / 40 Ton Katar' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyPreset(item.id)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      color: '#f8fafc',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>{item.label}</div>
                    <div style={{ fontSize: '0.62rem', color: '#fbbf24', fontWeight: 500 }}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Müşteri İçin Prestijli Link Üretici */}
            <div style={{ background: 'rgba(0, 0, 0, 0.45)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                2. MÜŞTERİYE ÖZEL PRESTİJLİ LİNK ÜRETİCİ (/ozel-teklif):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Firma / Müşteri Adı</label>
                  <input
                    type="text"
                    value={testGenCompany}
                    onChange={(e) => setTestGenCompany(e.target.value)}
                    placeholder="Örn: Karadeniz Dağıtım Ltd."
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.76rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Telefon No</label>
                  <input
                    type="text"
                    value={testGenPhone}
                    onChange={(e) => setTestGenPhone(e.target.value)}
                    placeholder="0544 622 59 31"
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.76rem'
                    }}
                  />
                </div>
              </div>

              {/* URL Önizleme Kutusu */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px dashed rgba(56, 189, 248, 0.4)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.68rem',
                color: '#38bdf8',
                wordBreak: 'break-all',
                marginBottom: '8px',
                fontFamily: 'monospace'
              }}>
                {getGeneratedVipLink(false)}
              </div>

              {/* Hızlı Aksiyon Butonları */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleCopyGeneratedVipLink}
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FiCopy size={12} /> Linki Kopyala
                </button>
                <button
                  type="button"
                  onClick={handleCopyVipWhatsAppTemplate}
                  style={{
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FiMessageSquare size={12} /> WhatsApp VIP Mesajını Kopyala
                </button>
                <button
                  type="button"
                  onClick={handleTestOpenGeneratedLink}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🚀 Yeni Sekmede Test Et
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Eğer test panel kapalıysa ama isTestRoute ise ufak bir açma çubuğu göster */}
        {!showTestPanel && isTestRoute && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px dashed rgba(245, 158, 11, 0.5)',
            borderRadius: '10px',
            padding: '8px 14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>
              🛠️ Can Murat Onay Test Modu Aktif (Satış Sorumlusu)
            </div>
            <button
              type="button"
              onClick={() => setShowTestPanel(true)}
              style={{
                background: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Test Dock'unu Aç
            </button>
          </div>
        )}

        {/* VIP Karşılama Kartı (Linkten Müşteri / Firma Bilgisi Gelmişse) */}
        {isVipCustomer && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 75, 147, 0.45) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.45)',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(0, 75, 147, 0.25)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
                boxShadow: '0 0 14px rgba(2, 132, 199, 0.5)'
              }}>
                ✨
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  FİRMANIZA ÖZEL HAZIRLANDI
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.25 }}>
                  Sayın {customerCompany || customerName || 'Değerli Müşterimiz'}, Hoş Geldiniz!
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                  Satış Sorumlunuz <strong style={{ color: '#e2e8f0' }}>{SALES_REP.name}</strong> operasyonunuza özel teknik şasi ve kantar simülasyonunu hazırladı.
                </div>
              </div>
            </div>
            <button
              onClick={handleShareLink}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f8fafc',
                borderRadius: '10px',
                padding: '7px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
              title="Bu bağlantıyı kopyala veya paylaş"
            >
              <FiShare2 size={13} /> Paylaş
            </button>
          </div>
        )}

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          padding: '8px 18px',
          borderRadius: '35px',
          marginBottom: '14px',
          boxShadow: '0 4px 20px rgba(0, 75, 147, 0.35)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <img src="/logo-iveco-white.png" alt="IVECO" style={{ height: '24px', objectFit: 'contain' }} />
          <span style={{ height: '20px', width: '1px', background: 'rgba(56, 189, 248, 0.4)', display: 'inline-block' }} />
          <img src="/logo-erc-samsun-white.png" alt="ERC Samsun Otomotiv" style={{ height: '28px', objectFit: 'contain' }} />
          <span style={{
            fontSize: '0.70rem',
            color: '#fbbf24',
            fontWeight: 800,
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '3px 9px',
            borderRadius: '12px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Yetkili Satıcı & Servis
          </span>
        </div>

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3, margin: '0 0 6px' }}>
          İşinize En Uygun IVECO Şasisini, Kasa Ölçüsünü ve Kredi Planını Belirleyin
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
          Taşıyacağınız tonaj ve kasa hacmini seçin; sistemimiz kantar sınırına en uygun şasiyi, kasa ebatlarını ve <strong>resmi banka kredi kampanyalarını (%0 Faiz, TEB Cetelem, Kuveyt Türk vb.)</strong> anında hesaplasın.
        </p>

        {/* Can Murat Onay Temsilci Rozeti (Satış Sorumlusu) & Hızlı İletişim Butonları */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '25px',
          padding: '6px 16px',
          marginTop: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(0, 75, 147, 0.25)'
        }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
            {SALES_REP.initials}
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.76rem', marginRight: '4px' }}>
            <span style={{ color: '#f8fafc', fontWeight: 800, display: 'block' }}>{SALES_REP.name}</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{SALES_REP.title} • {SALES_REP.phoneDisplay}</span>
          </div>

          {/* 📞 Hemen Ara */}
          <a
            href={`tel:${SALES_REP.phoneClean}`}
            style={{
              background: '#0284c7',
              color: '#fff',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={`${SALES_REP.name}'ı Telefonla Ara`}
          >
            <FiPhone size={12} /> Ara
          </a>

          {/* 💬 WhatsApp */}
          <button
            type="button"
            onClick={handleDirectWhatsApp}
            style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="WhatsApp Üzerinden Görüş"
          >
            <FiMessageSquare size={12} /> WhatsApp
          </button>

          {/* ✉️ E-Posta */}
          <button
            type="button"
            onClick={handleDirectEmail}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Resmi Proforma Talebi İçin E-Posta Gönder"
          >
            <FiMail size={12} /> E-Posta
          </button>

          {/* 📇 Rehbere Kaydet (vCard) */}
          <button
            type="button"
            onClick={handleDownloadVCard}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Can Murat Onay İletişim Kartını Telefona İndir & Rehbere Kaydet"
          >
            <FiDownload size={12} /> Rehbere Ekle
          </button>

          {/* 📤 Müşteriye Gönder */}
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
              color: '#fff',
              border: '1px solid #38bdf8',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)'
            }}
            title="Müşteriye özel yakışıklı WhatsApp teklif linki ve QR kod hazırla"
          >
            <FiShare2 size={13} /> 📤 Müşteriye Gönder
          </button>

          <button
            onClick={handleShareLink}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Sistemin linkini kopyala"
          >
            <FiCopy size={12} /> Linki Kopyala
          </button>
          <button
            type="button"
            onClick={() => setShowTestPanel(prev => !prev)}
            style={{
              background: showTestPanel ? '#f59e0b' : 'rgba(245, 158, 11, 0.15)',
              color: showTestPanel ? '#0f172a' : '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Can Murat Onay VIP Test Paneli ve Müşteri Link Üreticisini Aç/Kapat"
          >
            <span>🛠️</span> {showTestPanel ? 'Test Paneli Açık' : 'Test Paneli'}
          </button>
        </div>
      </div>

      {/* ── STEPPER BAR (2 ADIM: TONAJ & METREKÜP ➔ KREDİ & TEKLİF PLANI) ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto 20px', display: 'flex', justifyContent: 'center', gap: '14px', position: 'relative' }}>
        {[
          { num: 1, label: '1. Tonaj & Metreküp' },
          { num: 2, label: '2. Kredi & Teklif Planı' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: s.num < step ? 'pointer' : 'default',
              padding: '8px 18px',
              borderRadius: '24px',
              background: step === s.num ? 'rgba(0, 75, 147, 0.45)' : 'rgba(15, 23, 42, 0.6)',
              border: step === s.num ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: step === s.num ? '#0284c7' : step > s.num ? '#10b981' : '#1e293b',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem'
            }}>
              {step > s.num ? <FiCheck size={14} /> : s.num}
            </div>
            <span style={{ fontSize: '0.84rem', color: step === s.num ? '#38bdf8' : '#94a3b8', fontWeight: step === s.num ? 800 : 500 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── CARD CONTENT ────────────────────────────────────────── */}
      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        background: 'rgba(17, 24, 51, 0.85)',
        border: '1px solid rgba(99, 179, 237, 0.2)',
        borderRadius: '16px',
        padding: '22px 20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)'
      }}>

        {/* ── ADIM 1: TONAJ & METREKÜP SEÇİMİ ─────────────────────── */}
        {/* ── ADIM 1: ARAÇ SEÇİMİ VEYA TONAJ & METREKÜP HESAPLAMA ───── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: '#f8fafc' }}>
                1. IVECO Aracınızı Belirleyin
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                İster doğrudan araç listesinden model seçin, ister taşıyacağınız yük ağırlığı ve kasa hacmine göre aratın:
              </p>
            </div>

            {/* Seçim Modu Değiştirici (Katalog vs. Tonaj Sürgüsü) */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setSelectorMode('catalog')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: selectorMode === 'catalog' ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectorMode === 'catalog' ? '#fff' : '#94a3b8',
                  border: '1px solid',
                  borderColor: selectorMode === 'catalog' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: selectorMode === 'catalog' ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none'
                }}
              >
                <FiTruck size={15} /> 📋 Doğrudan Araç Listesinden Seç
              </button>
              <button
                type="button"
                onClick={() => setSelectorMode('slider')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: selectorMode === 'slider' ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectorMode === 'slider' ? '#fff' : '#94a3b8',
                  border: '1px solid',
                  borderColor: selectorMode === 'slider' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: selectorMode === 'slider' ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none'
                }}
              >
                <FiMaximize2 size={15} /> ⚖️ Tonaj & Hacme Göre Hesapla
              </button>
            </div>

            {/* SEÇENEK A: DOĞRUDAN ARAÇ KATALOĞU */}
            {selectorMode === 'catalog' && (
              <div style={{ marginBottom: '18px' }}>
                {/* Kategori Filtre Çipleri */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {[
                    { id: 'all', label: 'Tüm Modeller' },
                    { id: 'hafriyat', label: '🚜 T-Way Hafriyat & Şantiye (10 ve 12 Teker)' },
                    { id: 'panelvan', label: '🚐 Panelvan Modelleri (12, 16, 18 m³)' },
                    { id: 'kamyonet', label: '🚛 Kamyonetler (B Sınıfı / 3.5 Ton)' },
                    { id: 'kamyon', label: '🚚 Kamyonlar (C - 10 Teker Dahil)' },
                    { id: 'cekici', label: '🛣️ Çekici (S-Way)' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryTab(cat.id)}
                      style={{
                        background: selectedCategoryTab === cat.id ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                        color: selectedCategoryTab === cat.id ? '#fff' : '#94a3b8',
                        border: '1px solid',
                        borderColor: selectedCategoryTab === cat.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        padding: '5px 12px',
                        fontSize: '0.74rem',
                        fontWeight: selectedCategoryTab === cat.id ? 800 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Model Kartları Izgarası */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {VEHICLE_CATALOG.filter(v => selectedCategoryTab === 'all' || v.category === selectedCategoryTab).map(v => {
                    const isSelected = matched.key === v.key || matched.modelTitle === v.modelTitle;
                    return (
                      <div
                        key={v.key}
                        onClick={() => handleSelectVehicle(v.key)}
                        style={{
                          background: isSelected ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)' : 'rgba(15, 23, 42, 0.65)',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>
                              {v.categoryLabel}
                            </span>
                            {isSelected ? (
                              <span style={{ background: '#10b981', color: '#0f172a', fontWeight: 800, fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <FiCheck size={11} /> SEÇİLİ
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.66rem', color: v.kantarStatus === 'exempt' ? '#38bdf8' : '#10b981', fontWeight: 700 }}>
                                {v.kantarStatus === 'exempt' ? 'B Ehliyet / 3.5 Ton' : 'Kantar Tescilli (C)'}
                              </span>
                            )}
                          </div>

                          <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                            {v.title}
                          </h4>
                          <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600, marginBottom: '8px' }}>
                            {v.badge}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px', marginBottom: '8px', textAlign: 'center', fontSize: '0.66rem' }}>
                            <div>
                              <span style={{ color: '#64748b', display: 'block' }}>NET YÜK</span>
                              <strong style={{ color: '#fff' }}>{(v.payloadKg / 1000).toFixed(1)} Ton</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block' }}>HACİM</span>
                              <strong style={{ color: '#10b981' }}>{v.volumeM3} m³</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block' }}>EHLİYET</span>
                              <strong style={{ color: '#e2e8f0' }}>{v.license.split(' ')[0]}</strong>
                            </div>
                          </div>

                          {/* 🏷️ 2026 ARAÇ FİYATLANDIRMA ALANI */}
                          {v.isTway ? (
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.25) 100%)',
                              border: '1px solid rgba(245, 158, 11, 0.45)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              marginBottom: '8px',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🚜 ŞANTİYE & HAFRİYAT ÖZEL FİYATI
                              </div>
                              <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#fef08a', marginTop: '3px' }}>
                                Fiyatlandırma için Can Murat'a Danışabilirsiniz
                              </div>
                              <div style={{ fontSize: '0.66rem', color: '#cbd5e1', marginTop: '2px' }}>
                                Can Murat Onay: 0544 622 59 31
                              </div>
                            </div>
                          ) : v.currency === 'EUR' ? (
                            <div style={{
                              background: 'rgba(59, 130, 246, 0.12)',
                              border: '1px solid rgba(59, 130, 246, 0.35)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              marginBottom: '8px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '0.66rem', color: '#93c5fd', fontWeight: 700 }}>ÇEKİCİ FİYAT ARALIĞI:</span>
                                <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#60a5fa' }}>{v.displayPrice}</span>
                              </div>
                              <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>
                                {v.modelsDetail || '500 Full Plus: 123.000 € • 580: 126.000 € • Diamond: 131.000 €'}
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              background: 'rgba(16, 185, 129, 0.08)',
                              border: '1px solid rgba(16, 185, 129, 0.28)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              marginBottom: '8px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Kampanyalı:</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', textDecoration: 'line-through' }}>{v.campaignPriceText}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#34d399' }}>NET PEŞİN:</span>
                                <span style={{ fontSize: '0.96rem', fontWeight: 900, color: '#10b981' }}>{v.cashPriceText}</span>
                              </div>
                              {v.cashDiscountText && (
                                <div style={{ marginTop: '4px', textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.62rem', background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, display: 'inline-block' }}>
                                    🎁 -{v.cashDiscountText} Peşin İndirimi
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectVehicle(v.key);
                          }}
                          style={{
                            width: '100%',
                            background: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                            color: isSelected ? '#0f172a' : '#cbd5e1',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {isSelected ? '✓ Seçili Araç (Krediye Geçebilirsiniz)' : 'Bu Aracı Seç'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SEÇENEK B: TONAJ & METREKÜP SÜRGÜLERİ */}
            {selectorMode === 'slider' && (
              <div>
                {/* Net Yük Ağırlığı Sürgüsü */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                      TAŞINACAK NET YÜK AĞIRLIĞI:
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                      {(payloadKg / 1000).toFixed(1)} Ton ({payloadKg.toLocaleString('tr-TR')} kg)
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1000"
                    max="32000"
                    step="250"
                    value={payloadKg}
                    onChange={e => handlePayloadChange(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0284c7', marginBottom: '12px' }}
                  />

                  {/* Hızlı Çipler */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {QUICK_TONNAGES.map(qt => (
                      <button
                        key={qt.id}
                        type="button"
                        onClick={() => handlePayloadChange(qt.payloadKg)}
                        style={{
                          background: payloadKg === qt.payloadKg ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                          color: payloadKg === qt.payloadKg ? '#fff' : '#94a3b8',
                          border: '1px solid',
                          borderColor: payloadKg === qt.payloadKg ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '4px 10px',
                          fontSize: '0.74rem',
                          fontWeight: payloadKg === qt.payloadKg ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {qt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kasa Hacmi (m³) / Boyutlar */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                      TALEP EDİLEN KASA HACMİ (m³):
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomDims(!customDims)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {customDims ? 'm³ Sürgüsüne Dön' : 'Özel Kasa Ebatı (cm) Gir'}
                    </button>
                  </div>

                  {!customDims ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İdeal Kasa Hacmi:</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981' }}>{volumeM3} m³</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="65"
                        step="1"
                        value={volumeM3}
                        onChange={e => handleVolumeChange(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#10b981', marginBottom: '6px' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                        <span>12 m³ (Panelvan / Kamyonet)</span>
                        <span>28 m³ (7.2 Ton Kamyon)</span>
                        <span>45 m³ (Eurocargo)</span>
                        <span>65 m³ (Dev Hacim)</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Dış Boy (cm)</label>
                        <input
                          type="number"
                          value={bodyLengthCm}
                          onChange={e => setBodyLengthCm(Number(e.target.value))}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Dış En (cm)</label>
                        <input
                          type="number"
                          value={bodyWidthCm}
                          onChange={e => setBodyWidthCm(Number(e.target.value))}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Yükseklik (cm)</label>
                        <input
                          type="number"
                          value={bodyHeightCm}
                          onChange={e => setBodyHeightCm(Number(e.target.value))}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Kasa Tipi Seçimi */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '18px'
                }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: '10px' }}>
                    KASA TİPİ VEYA GÖVDE YAPISI:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                    {BODY_TYPES.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBody(b.id)}
                        style={{
                          background: selectedBody === b.id ? 'rgba(2, 132, 199, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid',
                          borderColor: selectedBody === b.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '10px 8px',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{b.icon}</div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: selectedBody === b.id ? '#fff' : '#cbd5e1' }}>{b.name}</div>
                        <div style={{ fontSize: '0.64rem', color: '#64748b', marginTop: '2px' }}>{b.tare === 0 ? 'Orijinal Sac Gövde' : `+${b.tare} kg Dara`}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ⚡ ANLIK EŞLEŞEN İDEAL ŞASİ ÖNİZLEMESİ */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 75, 147, 0.35) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {selectedModelKey ? 'SEÇİLEN MODEL:' : 'OTOMATİK EŞLEŞEN İDEAL ŞASİ:'}
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                  {matched.modelTitle} ({matched.wheelbase})
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '3px' }}>
                  {matched.kantarTitle} · {matched.badge}
                </div>
              </div>
              <div style={{
                background: matched.kantarStatus === 'safe' ? '#10b981' : '#38bdf8',
                color: '#0f172a',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 800
              }}>
                {matched.kantarStatus === 'safe' ? 'KANTAR UYGUN ✓' : '3.5 TON B EHLİYET'}
              </div>
            </div>

            {/* 💡 ÇOKLU ÖNERİ & ALTERNATİF ARAÇLAR */}
            {matched.multiRecommendations && matched.multiRecommendations.length > 0 && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💡 {matched.payloadKg <= 5000 ? 'ÇOKLU ÖNERİ (3.5 Ton Alternatifler):' : 'ÇOKLU ÖNERİ (Alternatif Modeller & Şasiler):'}
                  </span>
                  <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>İncelemek için tıkla</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                  {matched.multiRecommendations.map(alt => (
                    <div
                      key={alt.key}
                      onClick={() => handleSelectVehicle(alt.key)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '1.1rem' }}>{alt.icon || '🚛'}</span>
                          <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{alt.title}</strong>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                          {alt.badge}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.35, marginBottom: '8px' }}>
                          {alt.reason}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVehicle(alt.key);
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Bu Aracı Seç & Kredisini Gör →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* İLERLEME BUTONU */}
            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span>Kredi & Taksit Kampanyalarına Geç (%0 Faiz & Çoklu Banka)</span>
              <FiArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── ADIM 2: EŞLEŞEN ŞASİ, KASA BOYUTLARI, KANTAR & KREDİ ─ */}
        {step === 2 && (
          <div>
            {/* Geri Dön Butonu */}
            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <FiArrowLeft size={14} /> Tonaj ve Metreküpü Değiştir
              </button>
            </div>

            {/* Adım 2 İçi Çoklu Öneri ve Hızlı Model Değiştirici */}
            {matched.multiRecommendations && matched.multiRecommendations.length > 0 && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                  💡 {matched.payloadKg <= 5000 ? '3.5 Ton Diğer Alternatifler:' : 'Diğer Alternatif Modeller & Şasiler:'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {matched.multiRecommendations.map(alt => (
                    <button
                      key={alt.key}
                      type="button"
                      onClick={() => handleSelectVehicle(alt.key)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#f8fafc',
                        borderRadius: '16px',
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{alt.icon || '🚛'}</span>
                      <span>{alt.title.split('(')[0]}</span>
                      <span style={{ color: '#10b981', fontSize: '0.65rem' }}>→ Kredisini Gör</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Eşleşen Araç Kartı */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 75, 147, 0.4) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ background: '#10b981', color: '#0f172a', fontWeight: 800, fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px' }}>
                  ✓ İHTİYACINIZA EN UYGUN ŞASİ
                </span>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                  {matched.badge}
                </span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
                {matched.modelTitle}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 14px' }}>
                Şasi: <strong style={{ color: '#38bdf8' }}>{matched.wheelbase}</strong> · Ehliyet: <strong style={{ color: '#f8fafc' }}>{matched.license}</strong>
              </p>

              {/* 🏷️ 2026 RESMİ SATIŞ FİYATI & PEŞİN İNDİRİMİ */}
              {matched.isTway ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(180, 83, 9, 0.28) 100%)',
                  border: '1.5px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🚜 T-WAY ŞANTİYE & HAFRİYAT ÖZEL FİYATLANDIRMA
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fef08a', marginTop: '4px' }}>
                      Fiyatlandırma için Can Murat'a Danışabilirsiniz
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '3px' }}>
                      Can Murat Onay · IVECO ERC Samsun Satış Sorumlusu (0544 622 59 31)
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/905446225931?text=${encodeURIComponent(`Merhaba Can Murat Bey, ${matched.modelTitle || matched.title} T-Way aracı için özel fiyatlandırma ve şasi teslim süresi hakkında bilgi alabilir miyim?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#22c55e',
                      color: '#0f172a',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <FiPhoneCall size={16} /> Fiyat Sor (0544 622 59 31)
                  </a>
                </div>
              ) : matched.currency === 'EUR' ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1.5px solid rgba(59, 130, 246, 0.45)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase' }}>
                        🛣️ 2026 S-WAY ÇEKİCİ RESMİ LİSTE FİYATLARI
                      </span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#60a5fa', marginTop: '2px' }}>
                        {matched.displayPrice || '123.000 € – 131.000 €'}
                      </div>
                    </div>
                    <span style={{ background: '#1d4ed8', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                      EUR DÖVİZLİ / KREDİYE UYGUN
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '8px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>500 Full Plus:</span>
                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>123.000 €</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>580 Full Plus:</span>
                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>126.000 €</strong>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <span style={{ fontSize: '0.68rem', color: '#fbbf24', display: 'block' }}>580 Diamond:</span>
                      <strong style={{ fontSize: '0.95rem', color: '#fef08a' }}>131.000 €</strong>
                    </div>
                  </div>
                </div>
              ) : matched.campaignPriceText ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1.5px solid rgba(16, 185, 129, 0.45)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🏷️ 2026 RESMİ KAMPANYALI & PEŞİN SATIŞ FİYATI
                    </span>
                    {matched.cashDiscountText && (
                      <span style={{ background: '#059669', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                        🎁 -{matched.cashDiscountText} Peşin Alım İndirimi
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>KAMPANYALI / KREDİLİ FİYAT</span>
                      <strong style={{ fontSize: '1.05rem', color: '#cbd5e1' }}>{matched.campaignPriceText}</strong>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#34d399', display: 'block', marginBottom: '2px', fontWeight: 700 }}>NET PEŞİN ALIM FİYATI</span>
                      <strong style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: 900 }}>{matched.cashPriceText}</strong>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* 📐 KASA ÖLÇÜLERİ & HACİM KUTUSU */}
              <div style={{
                background: 'rgba(10, 18, 36, 0.8)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  📐 ŞASİYE UYGUN KASA BOYUTLARI:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px 4px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>KASA BOYU</span>
                    <strong style={{ fontSize: '0.82rem', color: '#38bdf8' }}>{matched.dims.length}</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px 4px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>KASA ENİ</span>
                    <strong style={{ fontSize: '0.82rem', color: '#38bdf8' }}>{matched.dims.width}</strong>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', padding: '8px 4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'block' }}>NET HACİM</span>
                    <strong style={{ fontSize: '0.82rem', color: '#10b981' }}>{matched.dims.volume}</strong>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Euro Palet Kapasitesi: <strong style={{ color: '#fff' }}>{matched.dims.pallets}</strong></span>
                  <span>Kasa Yüksekliği: <strong style={{ color: '#38bdf8' }}>{matched.dims.height}</strong></span>
                </div>
              </div>

              {/* ⚖️ KANTAR KARNESİ & GÜVENLİK ANALİZİ */}
              <div style={{
                background: matched.kantarStatus === 'safe' ? 'rgba(16, 185, 129, 0.12)' : matched.kantarStatus === 'exempt' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: '1px solid',
                borderColor: matched.kantarStatus === 'safe' ? 'rgba(16, 185, 129, 0.4)' : matched.kantarStatus === 'exempt' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {matched.kantarStatus === 'overload' ? (
                    <FiAlertCircle size={18} style={{ color: '#ef4444' }} />
                  ) : (
                    <FiCheckCircle size={18} style={{ color: matched.kantarStatus === 'safe' ? '#10b981' : '#38bdf8' }} />
                  )}
                  <strong style={{ fontSize: '0.85rem', color: matched.kantarStatus === 'overload' ? '#ef4444' : '#fff' }}>
                    {matched.kantarTitle}
                  </strong>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {matched.kantarDesc}
                </p>

                {/* Ağırlık Dökümü */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.7rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Araç Boş (Şoför+Yakıt):</span>
                    <strong style={{ color: '#fff' }}>{matched.unladenWeight} kg</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Kasa Ağırlığı:</span>
                    <strong style={{ color: '#fff' }}>+{BODY_TYPES.find(b => b.id === selectedBody)?.tare || 650} kg</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Yükünüz:</span>
                    <strong style={{ color: '#38bdf8' }}>+{payloadKg} kg</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Kantar Sınırı:</span>
                    <strong style={{ color: '#10b981' }}>{matched.kantarLimit} kg</strong>
                  </div>
                </div>
              </div>

              {/* 📄 TEKNİK FÖY İNDİRME BUTONU */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <a
                  href={matched.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                  title="Resmi Teknik Föy PDF"
                >
                  <FiDownload size={15} style={{ color: '#38bdf8' }} />
                  <span>Resmi Teknik Föyü İndir (PDF)</span>
                </a>
              </div>
            </div>

            {/* ── ÇOKLU BANKA KREDİ KAMPANYALARI (EKİM 2026) ─────── */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '18px 16px',
              marginBottom: '20px'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <FiDollarSign />
                  </span>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                      Resmi Finansman & Banka Kampanyaları
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      Ekim 2026 IVECO Yetkili Bayi Destekli Kredi Tablosu
                    </span>
                  </div>
                </div>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  borderRadius: '20px',
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  %0 Faiz Seçenekleri
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '14px', lineHeight: 1.4 }}>
                Çalıştığınız bankayı seçerek <strong>{matched.series}</strong> modeline özel taksit ve finansman seçeneklerini inceleyebilirsiniz:
              </p>

              {/* 1. BANKA SEÇİCİ GRID */}
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Hangi Banka ile Çalışıyorsunuz?
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                gap: '8px',
                marginBottom: '16px'
              }}>
                {BANK_LIST.map(bank => {
                  const isSelected = selectedBankId === bank.id;
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => {
                        setSelectedBankId(bank.id);
                        setSelectedCampaignId(null);
                      }}
                      style={{
                        background: isSelected ? bank.bg : 'rgba(255, 255, 255, 0.04)',
                        border: `1.5px solid ${isSelected ? bank.color : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '10px',
                        padding: '10px 8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{bank.icon}</span>
                        {isSelected && (
                          <span style={{
                            background: bank.color,
                            color: '#fff',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 800
                          }}>✓</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: isSelected ? '#fff' : '#e2e8f0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {bank.shortName}
                      </div>
                      <div style={{
                        fontSize: '0.64rem',
                        color: isSelected ? bank.color : '#94a3b8',
                        marginTop: '2px',
                        fontWeight: 600
                      }}>
                        {bank.badge}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 2. DİĞER / BANKAM YOK SEÇİLDİĞİNDE ÖZEL TEB CETELEM BİLGİLENDİRMESİ */}
              {selectedBankId === 'diger_yok' && (
                <div style={{
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(167, 139, 250, 0.35)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '1.25rem', marginTop: '2px' }}>🤝</span>
                  <div style={{ fontSize: '0.76rem', color: '#ddd6fe', lineHeight: 1.45 }}>
                    <strong>Anlaşmalı bankanız listede yoksa hiç sorun değil!</strong><br />
                    IVECO resmi taşıt finansman çözüm ortağımız <strong>TEB Cetelem</strong> ile işletmenize özel <strong>%0 faizli</strong> veya <strong>48 aya varan</strong> ticari taşıt kredisi kullandırımı ERC Otomotiv yetkili bayimiz tarafından hızla onaylatılır. Aşağıdaki avantajlı planlardan dilediğinizi seçebilirsiniz:
                  </div>
                </div>
              )}

              {/* 3. TUTAR KATEGORİSİ FİLTRESİ (0 Faiz, Yüksek Kredi, Filo) */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>
                    KREDİ TUTAR KATEGORİSİ:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
                    {availableCampaigns.length} Kampanya Listelendi
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '6px' }}>
                  {AMOUNT_TIERS.map(tier => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => {
                          setSelectedTierId(tier.id);
                          setSelectedCampaignId(null);
                        }}
                        style={{
                          background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: isSelected ? '#38bdf8' : '#cbd5e1',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '2px',
                          transition: 'all 0.15s ease',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'space-between' }}>
                          <span>{tier.icon} {tier.label}</span>
                          {isSelected && <span style={{ fontSize: '10px', color: '#38bdf8' }}>●</span>}
                        </div>
                        <span style={{
                          fontSize: '0.64rem',
                          color: isSelected ? '#bae6fd' : '#94a3b8',
                          fontWeight: 500
                        }}>
                          {tier.range}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. ARACA VE BANKAYA ÖZEL KAMPANYA SEÇENEKLERİ */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>
                    {currentBankMeta.name.toUpperCase()} KAMPANYA PLANLARI:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
                    Araç Grubu: {matched.series}
                  </span>
                </div>

                {availableCampaigns.length === 0 ? (
                  <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Bu model için seçilen bankada doğrudan tanımlı kampanya bulunamadı. Lütfen TEB Cetelem veya Kuveyt Türk seçeneklerini inceleyiniz.
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: '8px'
                  }}>
                    {availableCampaigns.map(camp => {
                      const isChosen = activeCampaign?.id === camp.id;
                      return (
                        <div
                          key={camp.id}
                          onClick={() => setSelectedCampaignId(camp.id)}
                          style={{
                            background: isChosen ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0, 0, 0, 0.35)',
                            border: `1.5px solid ${isChosen ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                            borderRadius: '10px',
                            padding: '12px 10px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            position: 'relative'
                          }}
                        >
                          {camp.tag && (
                            <span style={{
                              position: 'absolute',
                              top: '-7px',
                              right: '8px',
                              background: camp.highlight ? '#10b981' : '#0284c7',
                              color: '#fff',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              letterSpacing: '0.3px'
                            }}>
                              {camp.tag}
                            </span>
                          )}

                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                            {camp.title}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Aylık Taksit</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24' }}>
                                {camp.monthly.toLocaleString('tr-TR')} TL
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Faiz / Oran</div>
                              <div style={{
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                color: camp.rate === 0 ? '#34d399' : '#e2e8f0'
                              }}>
                                {camp.rateLabel}
                              </div>
                            </div>
                          </div>

                          {camp.gracePeriodMonths && (
                            <div style={{ fontSize: '0.66rem', color: '#34d399', fontWeight: 700, marginTop: '4px' }}>
                              ⚡ İlk {camp.gracePeriodMonths} ay boyunca 0 TL taksit!
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. SEÇİLEN KAMPANYA ÖZETİ & DETAY HESAPLAMA KARTI */}
              {activeCampaign && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Seçilen Kredi Planı:
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24' }}>
                        {activeCampaign.monthly.toLocaleString('tr-TR')} TL <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#cbd5e1' }}>/ ay</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Finans Kuruluşu:
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                        {currentBankMeta.name}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.72rem'
                  }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Kredi Tutarı: </span>
                      <strong style={{ color: '#fff' }}>{activeCampaign.principal.toLocaleString('tr-TR')} TL</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Vade: </span>
                      <strong style={{ color: '#fff' }}>{activeCampaign.term} Ay</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#94a3b8' }}>Oran: </span>
                      <strong style={{ color: activeCampaign.rate === 0 ? '#34d399' : '#fff' }}>{activeCampaign.rateLabel}</strong>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    lineHeight: 1.35,
                    marginTop: '4px'
                  }}>
                    🛡️ <em>Resmi IVECO Ekim 2026 anlaşmalı ticari finansman tablosudur. Katkı payı bayimiz ve üretici tarafından sübvanse edilmiş olup ilave masraf veya gizli komisyon yansıtılmaz.</em>
                  </div>
                </div>
              )}
            </div>

            {/* Can Murat Onay - Bu Teklifi Müşteriye WhatsApp'tan Gönder Butonu */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid #38bdf8',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.2)'
            }}>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📲</span> Bu Teklifi Müşteriye WhatsApp'tan Gönder
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  {matched.title} ({activeCampaign ? `${activeCampaign.principal.toLocaleString('tr-TR')} TL Kredi` : ''}) için zengin görsel kartı ve kişiselleştirilmiş bağlantı.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSendModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
                }}
              >
                <FiShare2 size={14} /> Müşteriye Gönder (WhatsApp / QR)
              </button>
            </div>

            {/* ── İLETİŞİM & TEKLİF ALMA FORMU ──────────────────────── */}
            {!submitted ? (
              <form onSubmit={handleSubmitLead} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 4px' }}>
                  📋 Can Murat Onay (Satış Sorumlusu) — Resmi Teklif & Şasi Rezervasyonu
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 12px' }}>
                  Bilgilerinizi bırakın; Can Murat Onay aracın fabrika şasi teslim tarihini ve firmanıza özel teklifini 15 dakikada iletsin.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="Adınız Soyadınız *"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Firma / Ticari Ünvan"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Şehir (Örn: Samsun)"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Cep Telefonu (05XX XXX XX XX) *"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(formatPhoneInput(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="İlave Notunuz / Mevcut Araç Takas Talebiniz (Opsiyonel)"
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#fff',
                        fontSize: '0.82rem',
                        resize: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(43, 125, 233, 0.4)'
                  }}
                >
                  {submitting ? 'İletiliyor...' : '📞 Can Murat Onay Beni Arasın & Teklif Göndersin'}
                </button>
              </form>
            ) : (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '14px',
                padding: '18px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <FiCheckCircle size={36} style={{ color: '#10b981', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
                  Talebiniz Can Murat Onay'a (Satış Sorumlusu) Ulaştı!
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 10px' }}>
                  Seçtiğiniz <strong>{matched.modelTitle}</strong> için en güncel şasi ve {currentBankMeta.name} resmi kampanya tablosuyla 15 dakika içinde aranacaksınız.
                </p>
              </div>
            )}

            {/* Alternatif Doğrudan WhatsApp Butonu */}
            <button
              onClick={handleDirectWhatsApp}
              style={{
                width: '100%',
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                marginBottom: '12px'
              }}
            >
              <FiMessageSquare size={18} /> Can Murat Onay ile WhatsApp'tan Hemen Görüş
            </button>

            <button
              onClick={() => setStep(1)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'block',
                margin: '0 auto'
              }}
            >
              ← Farklı bir tonaj veya kasa ölçüsü için tekrar hesapla
            </button>
          </div>
        )}
      </div>

      {/* ── CAN MURAT ONAY VIP TEST SİMÜLASYON RAPOR MODALI ── */}
      {testSimulationResult && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            color: '#f8fafc',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🛠️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#fbbf24' }}>
                    CRM PIPELINE SİMÜLASYONU BAŞARILI
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Satış Sorumlusu: Can Murat Onay Test Önizleme Raporu ({testSimulationResult.timestamp})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestSimulationResult(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                ✕ Kapat
              </button>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px', padding: '12px', marginBottom: '12px', fontSize: '0.78rem', lineHeight: 1.6 }}>
              <div style={{ color: '#38bdf8', fontWeight: 800, marginBottom: '6px' }}>📋 CRM Lead Verisi:</div>
              <div><strong>Firma / İsim:</strong> {testSimulationResult.company_name}</div>
              <div><strong>Telefon:</strong> {testSimulationResult.phone} ({testSimulationResult.city})</div>
              <div><strong>Model & Şasi:</strong> {testSimulationResult.target_model}</div>
              <div><strong>Kredi Kampanyası:</strong> {testSimulationResult.target_campaign}</div>
              <div><strong>Lead Kaynağı:</strong> {testSimulationResult.source}</div>
              <div><strong>Niyet Skoru:</strong> %{testSimulationResult.intent_score} ({testSimulationResult.intent_level.toUpperCase()})</div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '0.72rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '140px', overflowY: 'auto' }}>
              {testSimulationResult.notes}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setTestSimulationResult(null);
                  handleDirectWhatsApp();
                }}
                style={{
                  flex: 1,
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FiMessageSquare size={14} /> WhatsApp'ta Test Mesajını Gör
              </button>
              <button
                type="button"
                onClick={() => setTestSimulationResult(null)}
                style={{
                  background: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MÜŞTERİYE PRESTİJLİ LİNK & TEKLİF GÖNDERİM MASASI (MODAL) ── */}
      {showSendModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '940px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '22px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.25)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(2, 132, 199, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '12px'
                }}>
                  <img src="/logo-iveco-white.png" alt="IVECO" style={{ height: '20px', objectFit: 'contain' }} />
                  <div style={{ height: '16px', width: '1px', background: 'rgba(255, 255, 255, 0.25)' }} />
                  <img src="/logo-erc-samsun-white.png" alt="ERC Samsun" style={{ height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    Müşteriye Prestijli Teklif & Link Gönder
                    <span style={{ fontSize: '0.68rem', background: '#f59e0b', color: '#0f172a', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                      CANLI WHATSAPP SİMÜLASYONU
                    </span>
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                    Satış Sorumlusu: <strong style={{ color: '#e2e8f0' }}>{SALES_REP.name}</strong> • {SALES_REP.dealership} (📞 {SALES_REP.phoneDisplay} • ✉️ {SALES_REP.email})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowSendModal(false); setShowQrCode(false); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' }}>
              
              {/* SOL KOLON: Müşteri Bilgileri & Gönderim Butonları */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                  1. Müşteri & Firma Bilgileri
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Firma / Müşteri Ünvanı
                    </label>
                    <input
                      type="text"
                      value={sendCompany}
                      onChange={(e) => setSendCompany(e.target.value)}
                      placeholder="Örn: Öz Karadeniz Nakliyat Ltd."
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        color: '#f8fafc',
                        fontSize: '0.82rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                        Müşteri Telefonu (WhatsApp)
                      </label>
                      <input
                        type="text"
                        value={sendPhone}
                        onChange={(e) => setSendPhone(formatPhoneInput(e.target.value))}
                        placeholder="0544 622 59 31"
                        style={{
                          width: '100%',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          color: '#f8fafc',
                          fontSize: '0.82rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                        Yetkili Adı (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={sendContactName}
                        onChange={(e) => setSendContactName(e.target.value)}
                        placeholder="Örn: Ahmet Bey"
                        style={{
                          width: '100%',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          color: '#f8fafc',
                          fontSize: '0.82rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Müşteri E-Posta Adresi (Opsiyonel — Outlook / Webmail İçin)
                    </label>
                    <input
                      type="email"
                      value={sendEmail}
                      onChange={(e) => setSendEmail(e.target.value)}
                      placeholder="Örn: info@karadeniznakliyat.com"
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        color: '#f8fafc',
                        fontSize: '0.82rem'
                      }}
                    />
                  </div>
                </div>

                {/* Mesaj Şablonu Seçimi */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Mesaj Şablonu Seçin:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'vip', icon: '🌟', label: 'VIP Prestij', desc: 'Kapsamlı Sunum' },
                      { id: 'quick', icon: '⚡', label: 'Hızlı Özet', desc: 'Net 3 Madde' },
                      { id: 'heavy', icon: '🚜', label: 'Ağır Şantiye', desc: 'T-Way & Damper' }
                    ].map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSendTemplate(tpl.id)}
                        style={{
                          background: sendTemplate === tpl.id ? 'rgba(2, 132, 199, 0.35)' : 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid',
                          borderColor: sendTemplate === tpl.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                          color: sendTemplate === tpl.id ? '#fff' : '#94a3b8',
                          borderRadius: '8px',
                          padding: '8px 6px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{tpl.icon} {tpl.label}</div>
                        <div style={{ fontSize: '0.62rem', opacity: 0.8, marginTop: '2px' }}>{tpl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Üretilen Prestijli Link Kutusu */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px dashed rgba(56, 189, 248, 0.5)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Müşteriye Gidecek Özel Link:</span>
                    <span style={{ fontSize: '0.62rem', color: '#34d399', fontWeight: 700 }}>✓ Aktif Araç: {matched.title}</span>
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '6px 8px',
                    borderRadius: '6px'
                  }}>
                    {currentClientLink}
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleSendViaWhatsApp}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 18px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4)'
                    }}
                  >
                    <FiMessageSquare size={16} /> 📲 WhatsApp'tan Hemen Gönder
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleSendViaEmail}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      title="Müşteriye gitmek üzere Outlook veya varsayılan e-posta istemcisini açar"
                    >
                      <FiMail size={13} /> ✉️ E-Posta Aç
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadVCard}
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      title="Can Murat Onay iletişim kartvizitini (.vcf) indirir"
                    >
                      <FiDownload size={13} /> 📇 vCard İndir
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiCopy size={13} /> Mesajı Kopyala
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyOnlyLink}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiCopy size={13} /> Linki Kopyala
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQrCode(prev => !prev)}
                    style={{
                      background: showQrCode ? '#f59e0b' : 'rgba(245, 158, 11, 0.15)',
                      color: showQrCode ? '#0f172a' : '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiSmartphone size={13} /> {showQrCode ? 'Karekodu Gizle' : '📱 Showroom / Yüzyüze Karekod (QR Kod) Aç'}
                  </button>

                  {/* QR Kod Kutusu (Showroom için) */}
                  {showQrCode && (
                    <div style={{
                      background: '#fff',
                      borderRadius: '12px',
                      padding: '14px',
                      textAlign: 'center',
                      color: '#0f172a',
                      marginTop: '4px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
                        Müşteriniz Telefon Kamerasından Okutsun:
                      </div>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentClientLink)}`}
                        alt="Müşteri QR Kodu"
                        style={{ width: '160px', height: '160px', display: 'block', margin: '0 auto', borderRadius: '8px' }}
                      />
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                        {sendCompany || 'VIP Müşteri'} için doğrudan açılır
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SAĞ KOLON: Canlı WhatsApp Görsel Simülasyonu */}
              <div style={{
                background: '#0b141a',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* WhatsApp Chat Üst Barı */}
                <div style={{
                  background: '#202c33',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#004B93',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}>
                    🏢
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e9edef' }}>
                      {sendCompany || 'Müşteri Sohbeti'}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#00a884' }}>
                      çevrimiçi • WhatsApp Business
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat İç Alanı */}
                <div style={{
                  padding: '14px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: 'radial-gradient(circle at center, #111b21 0%, #0b141a 100%)'
                }}>
                  
                  {/* WhatsApp Gelen / Gönderilen Balonu */}
                  <div style={{
                    background: '#005c4b',
                    borderRadius: '12px',
                    padding: '8px 10px',
                    maxWidth: '100%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    alignSelf: 'flex-end',
                    color: '#e9edef',
                    fontSize: '0.74rem'
                  }}>
                    
                    {/* ZENGİN GÖRSEL LİNK KARTI (OPEN GRAPH PREVIEW) */}
                    <div style={{
                      background: '#025144',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <img
                        src="/og-iveco-preview.png"
                        alt="IVECO Önizleme"
                        style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div style={{ padding: '8px 10px' }}>
                        <div style={{ fontSize: '0.62rem', color: '#8696a0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          erc-iveco.com/ozel-teklif
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                          IVECO ERC Otomotiv | Firmanıza Özel Şasi & Kredi Teklifi
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#aebac1', marginTop: '2px', lineHeight: 1.3 }}>
                          İşletmenize özel şasi ölçüleri, karayolları kantar analizi ve Ekim 2026 %0 faizli kredi planları.
                        </div>
                      </div>
                    </div>

                    {/* Mesaj Metni Önizlemesi */}
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45, color: '#e9edef', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                      {getFormattedMessage()}
                    </div>

                    {/* WhatsApp Saati & Mavi Tık */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '3px', marginTop: '4px', fontSize: '0.6rem', color: '#8696a0' }}>
                      <span>20:25</span>
                      <span style={{ color: '#53bdeb', fontWeight: 800 }}>✓✓</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#8696a0', marginTop: '4px' }}>
                    ✨ Müşteriniz linke tıkladığında adıyla karşılanır ve seçtiğiniz araç hazır açılır.
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── SAĞ ALT YÜZEN HIZLI İLETİŞİM DOCK'U (CAN MURAT ONAY) ── */}
      <div style={{
        position: 'fixed',
        bottom: '18px',
        right: '18px',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1.5px solid #38bdf8',
        borderRadius: '35px',
        padding: '6px 12px 6px 8px',
        boxShadow: '0 10px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.3)',
        backdropFilter: 'blur(12px)',
        gap: '8px',
        maxWidth: 'calc(100vw - 36px)',
        flexWrap: 'wrap'
      }}>
        {/* Avatar & İsim */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '12px',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)'
          }}>
            {SALES_REP.initials}
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
              {SALES_REP.name}
            </div>
            <div style={{ fontSize: '0.64rem', color: '#38bdf8', fontWeight: 600 }}>
              {SALES_REP.title} • {SALES_REP.phoneDisplay}
            </div>
          </div>
        </div>

        {/* 📞 Ara */}
        <a
          href={`tel:${SALES_REP.phoneClean}`}
          style={{
            background: '#0284c7',
            color: '#fff',
            borderRadius: '20px',
            padding: '5px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Can Murat Onay'ı Ara"
        >
          <FiPhone size={12} /> Ara
        </a>

        {/* 💬 WhatsApp */}
        <button
          type="button"
          onClick={handleDirectWhatsApp}
          style={{
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '5px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="WhatsApp'tan Yaz"
        >
          <FiMessageSquare size={12} /> WhatsApp
        </button>

        {/* ✉️ Mail */}
        <button
          type="button"
          onClick={handleDirectEmail}
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '20px',
            padding: '5px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="E-Posta Gönder"
        >
          <FiMail size={12} /> Mail
        </button>

        {/* 📇 Rehbere Kaydet */}
        <button
          type="button"
          onClick={handleDownloadVCard}
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '20px',
            padding: '5px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Rehbere Kaydet (vCard)"
        >
          <FiDownload size={12} /> Rehbere Ekle
        </button>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: '680px', margin: '24px auto 0', textAlign: 'center', color: '#64748b', fontSize: '0.74rem' }}>
        IVECO ERC Samsun Otomotiv Ticari Araçlar Yetkili Satıcısı & Servisi • Samsun<br />
        Tüm boş ağırlıklar şoför ve yakıt dahil resmi teknik föy verileridir.
      </div>
    </div>
  );
}
