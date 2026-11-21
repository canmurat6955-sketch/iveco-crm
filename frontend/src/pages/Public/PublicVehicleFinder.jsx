import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { discoveryApi, fetchTcmbEurRate } from '../../api/client';
import toast, { Toaster } from 'react-hot-toast';
import { BANK_LIST, AMOUNT_TIERS, getAmountTiersForCategory, getCampaignsForVehicleAndBank, EUR_LOAN_PRESETS, EUR_PARTNER_BANKS, resolveBankFromSearchParams } from '../../data/bankCampaigns';
import { resolvePartnerFromSearchParams } from '../../data/partnerProtocols';
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
import { openWhatsAppChat } from '../../utils/openExternal';
import { getVehicleSticker } from '../../data/ivecoPricingCatalog';
import PricingCatalogTab from './components/PricingCatalogTab';
import BodyStructureTab from './components/BodyStructureTab';
import LoanFinanceTab from './components/LoanFinanceTab';
import FaqLinkedInTab from './components/FaqLinkedInTab';
import TcoCompetitorTab from './components/TcoCompetitorTab';
import CustomerSmartActionHub from './components/CustomerSmartActionHub';
import BodyworkExamplesGallery from '../../components/Portal/BodyworkExamplesGallery';

// ── RESMİ SATIŞ SORUMLUSU BİLGİLERİ ─────────────────────────────
const SALES_REP = {
  name: 'Satış Sorumlusu Can Murat',
  title: 'IVECO ERC Samsun Otomotiv',
  dealership: 'IVECO ERC Samsun Otomotiv',
  dealershipShort: 'IVECO ERC Samsun',
  phoneDisplay: '0544 622 59 31',
  phoneClean: '05446225931',
  phoneWhatsapp: '905446225931',
  email: 'murat.onay@ercsamsunotomotiv.com',
  city: 'Samsun',
  initials: 'CM'
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
    priceRange: '2.150.000 TL (Peşin) / 2.340.000 TL (Kampanyalı)',
    campaignPriceText: '2.340.000 TL',
    cashPriceText: '2.150.000 TL',
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
    priceRange: '2.180.000 TL (Peşin) / 2.370.000 TL (Kampanyalı)',
    campaignPriceText: '2.370.000 TL',
    cashPriceText: '2.180.000 TL',
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
    priceRange: '2.340.000 TL (Peşin) / 2.530.000 TL (Kampanyalı)',
    campaignPriceText: '2.530.000 TL',
    cashPriceText: '2.340.000 TL',
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
    fullTitle: 'IVECO Daily 35S16 Tek Teker Şasi (3450 / 3750 mm)',
    modelTitle: 'IVECO Daily 35S16 Tek Teker Şasi (3450 / 3750 mm)',
    series: 'Daily 35S',
    wheelbase: '3450 - 3750 mm',
    payloadKg: 1500,
    volumeM3: 16,
    badge: 'B Sınıfı • 3.5 Ton Kamyonet • Şehir İçi Serbest',
    license: 'B Sınıfı (Otomobil Ehliyeti)',
    kantarLimit: 4130,
    unladenWeight: 2000,
    kantarStatus: 'exempt',
    kantarTitle: '3.5 Ton Kamyonet Statüsünde (B Sınıfı Ehliyet)',
    kantarDesc: '2.000 kg şasi boş ağırlığı (üstyapı/kasa ağırlığı hariç), 3.500 kg azami yüklü ağırlık, şehir merkezine 7/24 takografsız serbest giriş. 3.50m - 4.30m kasa seçeneği.',
    dims: {
      length: '350 - 430 cm (Önerilen: 410 cm)',
      width: '215 - 235 cm (Önerilen: 215 cm)',
      height: '160 - 300 cm (Önerilen: 200 cm)',
      volume: '16.0 m³',
      pallets: '8 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
    pdfName: 'DAILY KAMYONET TEKNİK FÖY .pdf',
    priceRange: '1.925.000 TL (Peşin) / 2.115.000 TL (Kampanyalı)',
    campaignPriceText: '2.115.000 TL',
    cashPriceText: '1.925.000 TL',
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
    payloadKg: 1500,
    volumeM3: 20,
    badge: 'B Sınıfı • 3.5 Ton Kamyonet • Çift Teker Dayanımı',
    license: 'B Sınıfı (Otomobil Ehliyeti)',
    kantarLimit: 4130,
    unladenWeight: 2200,
    kantarStatus: 'exempt',
    kantarTitle: '3.5 Ton Kamyonet Statüsünde (B Sınıfı Ehliyet)',
    kantarDesc: '2.200 kg şasi boş ağırlığı (üstyapı/kasa ağırlığı hariç), 3.500 kg azami yüklü ağırlık. Çift tekerlekli C-profil ağır hizmet şasisi sayesinde yüksek taşıma mukavemetine sahiptir.',
    dims: {
      length: '350 - 480 cm (Önerilen: 430 cm)',
      width: '215 - 235 cm (Önerilen: 220 cm)',
      height: '160 - 300 cm (Önerilen: 210 cm)',
      volume: '20.0 m³',
      pallets: '8 - 10 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
    pdfName: 'DAILY KAMYONET TEKNİK FÖY .pdf',
    priceRange: '2.055.000 TL (3450) / 2.085.000 TL (3750) / 2.215.000 TL (4100 Peşin)',
    campaignPriceText: '2.055.000 TL (3450) - 2.510.000 TL (4100 A8)',
    cashPriceText: '2.055.000 TL (3450) - 2.320.000 TL (4100 A8 Peşin)',
    cashDiscountText: '190.000 TL (4100 Şasi)',
    defaultLoan: 1000000,
    bodyType: 'kapali_kutu'
  },


  // ── KAMYON GRUBU (C EHLİYET - RESMİ KANTARLI) ──
  {
    key: 'truck_72c',
    category: 'kamyon',
    categoryLabel: '🚚 Kamyon (C)',
    title: 'Daily 70C16 / 72C16 Şasi Kamyon',
    fullTitle: 'IVECO Daily 70C16 / 72C16 Şasi Kamyon (3750 / 4350 / 4750 mm)',
    modelTitle: 'IVECO Daily 70C16 / 72C16 Şasi Kamyon (3750 / 4350 / 4750 mm)',
    series: 'Daily 70C / 72C',
    wheelbase: '3750 - 4750 mm',
    payloadKg: 4800,
    volumeM3: 28,
    badge: '7.970 kg Kantar • ~4.8 Ton Şasi Kapasitesi',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 7970,
    unladenWeight: 2400,
    kantarStatus: 'safe',
    kantarTitle: '7.970 kg ile Kantardan Geçer',
    kantarDesc: '2.400 kg çıplak şasi boş ağırlığı (şoför+yakıt dahil; üstyapı/kasa ağırlığı seçilen kasaya göre düşülür), 410 cm ila 590 cm kasa seçeneği, 3.0L 160 BG C-profil şasi.',
    dims: {
      length: '410 - 620 cm (Önerilen: 600 cm)',
      width: '215 - 235 cm (Önerilen: 225 cm)',
      height: '160 - 300 cm (Önerilen: 220 cm)',
      volume: '28.0 m³',
      pallets: '12 - 14 Euro Palet'
    },
    pdfUrl: '/specs/daily-kamyon-70c-72c.pdf',
    pdfName: 'DAILY KAMYON TEKNİK FÖY.pdf',
    priceRange: '2.390.000 TL (3750 Peşin) - 2.680.000 TL (4750 Peşin)',
    campaignPriceText: '2.500.000 TL - 3.060.000 TL',
    cashPriceText: '2.390.000 TL - 2.800.000 TL',
    cashDiscountText: '110.000 TL - 260.000 TL',
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
    priceRange: '3.330.000 TL (Peşin) / 3.590.000 TL (Kampanyalı)',
    campaignPriceText: '3.590.000 TL',
    cashPriceText: '3.330.000 TL',
    cashDiscountText: '260.000 TL',
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
    priceRange: '3.820.000 TL (Peşin) / 4.080.000 TL (Kampanyalı)',
    campaignPriceText: '4.080.000 TL',
    cashPriceText: '3.820.000 TL',
    cashDiscountText: '260.000 TL',
    defaultLoan: 2000000,
    bodyType: 'kayar_perde'
  },
  {
    key: 'truck_150e',
    category: 'kamyon',
    categoryLabel: '🚚 Kamyon (C)',
    title: 'Eurocargo ML 150 E 21 / 22',
    fullTitle: 'IVECO Eurocargo ML 150 E 21 / 22 (4185 / 4455 / 5175 mm Şasi)',
    modelTitle: 'IVECO Eurocargo ML 150 E 21 / 22 (4185 / 4455 / 5175 mm Şasi)',
    series: 'Eurocargo 150E',
    wheelbase: '4185 - 5175 mm',
    payloadKg: 10500,
    volumeM3: 48,
    badge: '16.060 kg Kantar • ~10.5 Ton Şasi Kapasitesi',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 16060,
    unladenWeight: 4750,
    kantarStatus: 'safe',
    kantarTitle: '16.060 kg ile Kantardan Geçer',
    kantarDesc: 'Tector 5 (4.5L 210 BG) / Tector 7 (6.7L 220 BG Yataklı Kabin) motor, 4.750 kg şasi boş ağırlığı, 6.20m - 7.50m kasa boyu seçeneği.',
    dims: {
      length: '650 - 750 cm (Önerilen: 710 cm)',
      width: '230 - 250 cm',
      height: '230 - 260 cm',
      volume: '48.0 m³',
      pallets: '16 - 18 Euro Palet'
    },
    pdfUrl: '/specs/eurocargo-ml150e21.pdf',
    pdfName: 'ML 150 E 21 TEKNİK FÖY .pdf',
    priceRange: '4.080.000 TL (Peşin) / 4.340.000 TL (Kampanyalı)',
    campaignPriceText: '4.340.000 TL',
    cashPriceText: '4.080.000 TL',
    cashDiscountText: '260.000 TL',
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
    priceRange: '4.570.000 TL (Peşin) / 4.830.000 TL (Kampanyalı)',
    campaignPriceText: '4.830.000 TL',
    cashPriceText: '4.570.000 TL',
    cashDiscountText: '260.000 TL',
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
    priceRange: '4.570.000 TL (4x2 Baz Şasi Peşin) / 4.830.000 TL (Kampanyalı — 3. Dingil Üstyapı Hariç)',
    campaignPriceText: '4.830.000 TL (4x2 Baz Şasi)',
    cashPriceText: '4.570.000 TL (4x2 Baz Şasi)',
    cashDiscountText: '260.000 TL',
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
    priceRange: "Fiyatlandırma İçin Satış Sorumlusu ile Görüşün",
    isTway: true,
    consultPrompt: "Fiyatlandırma İçin Satış Sorumlusu ile Görüşün",
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
    priceRange: "Fiyatlandırma İçin Satış Sorumlusu ile Görüşün",
    isTway: true,
    consultPrompt: "Fiyatlandırma İçin Satış Sorumlusu ile Görüşün",
    defaultLoan: 3000000,
    bodyType: 'damper'
  },
  {
    key: 'tway_12teker_540',
    category: 'hafriyat',
    categoryLabel: '🚜 12 Teker Hafriyat (T-Way)',
    title: 'T-Way 12 Teker Ağır Hafriyat 540 BG (8x4)',
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
    priceRange: '5.850.000 TL (Nakit) / 6.175.000 TL (Liste)',
    campaignPriceText: '6.175.000 TL',
    cashPriceText: '5.850.000 TL',
    cashDiscountText: '325.000 TL',
    currency: 'TRY',
    isTway: false,
    defaultLoan: 3000000,
    bodyType: 'damper'
  },
  {
    key: 'tway_12teker_460',
    category: 'hafriyat',
    categoryLabel: '🔄 12 Teker Beton Mikseri (T-Way)',
    title: 'T-Way 12 Teker Beton Mikseri 460 BG (8x4)',
    fullTitle: 'IVECO T-Way AD 410T 46 (8x4 - 12 Teker 460 BG Beton Mikseri Şasisi)',
    modelTitle: 'IVECO T-Way AD 410T 46 8x4 (12 Teker 460 BG Beton Mikseri Şasisi)',
    series: 'T-Way 12 Teker 460',
    wheelbase: '4350 - 4750 mm (10 mm Şasi)',
    payloadKg: 18000,
    volumeM3: 24,
    badge: '8x4 Çift Çeker • 460 BG Cursor 11/13 • 12 Teker Beton Mikseri',
    license: 'C Sınıfı Kamyon',
    kantarLimit: 32000,
    unladenWeight: 13800,
    kantarStatus: 'safe',
    kantarTitle: '32.000 kg Karayolları Kantarı / 50.000 kg Şantiye GVW',
    kantarDesc: 'Cursor 11/13 (460 BG / 2.150 Nm Tork), 16 ileri Hi-Tronix, 8x4 çift çeker 4 aks, 10-12 m³ hazır beton mikseri üstyapısına tam uyumlu ağır şantiye şasisi.',
    dims: {
      length: '10–12 m³ Beton Mikseri',
      width: '240 cm',
      height: '160 cm',
      volume: '10 - 12 m³ Mikser',
      pallets: 'Beton Mikseri Şasisi'
    },
    pdfUrl: '/specs/t-way-ad410t46b-mixer.pdf',
    pdfName: 'Teknik Foy_TW_Rigid_8x4_AD410T46.pdf',
    priceRange: '5.750.000 TL (Nakit) / 6.075.000 TL (Liste)',
    campaignPriceText: '6.075.000 TL',
    cashPriceText: '5.750.000 TL',
    cashDiscountText: '325.000 TL',
    currency: 'TRY',
    isTway: false,
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
  const activePartner = useMemo(() => resolvePartnerFromSearchParams(searchParams), [searchParams]);
  const lockedBank = useMemo(() => resolveBankFromSearchParams(searchParams), [searchParams]);
  const detectedReferrerChannel = useMemo(() => {
    if (typeof document === 'undefined' || !document.referrer) return '';
    const r = document.referrer.toLowerCase();
    if (r.includes('linkedin') || r.includes('lnkd.in')) return 'linkedin';
    if (r.includes('instagram')) return 'instagram';
    if (r.includes('facebook') || r.includes('fb.')) return 'facebook';
    return '';
  }, []);
  const refCode = searchParams.get('ref') || searchParams.get('src') || searchParams.get('source') || detectedReferrerChannel || (lockedBank ? `banka_${lockedBank.id}` : (activePartner ? `partner_${activePartner.id}` : 'wa_durum'));
  const customerIdParam = searchParams.get('cid') || searchParams.get('customer_id');
  const companyParam = searchParams.get('company') || searchParams.get('firma') || searchParams.get('comp') || '';
  const nameParam = searchParams.get('name') || searchParams.get('yetkili') || '';
  const phoneParam = searchParams.get('phone') || searchParams.get('tel') || '';
  const sectorParam = searchParams.get('sector') || '';
  const groupsParam = searchParams.get('groups') || searchParams.get('araclar') || '';
  const allowedGroups = useMemo(() => {
    if (!groupsParam) return [];
    const tokens = groupsParam.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const out = new Set();
    tokens.forEach(t => {
      if (t === 'daily' || t === 'daily35' || t === 'daily35_chassis' || t === 'kamyonet') out.add('daily35_chassis');
      if (t === 'panelvan' || t === 'daily35_van' || t === 'van') out.add('daily35_van');
      if (t === 'daily70' || t === '70c' || t === '72c') out.add('daily70');
      if (t === 'eurocargo' || t === 'kamyon') out.add('eurocargo');
      if (t === 'sway' || t === 's-way' || t === 'cekici' || t === 'tir') out.add('sway');
      if (t === 'tway' || t === 't-way' || t === 'mikser' || t === 'hafriyat' || t === 'santiye') out.add('tway');
    });
    return Array.from(out);
  }, [groupsParam]);
  const payloadParam = searchParams.get('payload') || searchParams.get('tonaj') || '';
  const volumeParam = searchParams.get('volume') || searchParams.get('hacim') || '';
  const bodyParam = searchParams.get('body') || searchParams.get('kasa') || '';
  const modelParam = searchParams.get('model') || searchParams.get('arac') || '';

  const location = useLocation();
  const isAdminMode = searchParams.get('admin') === 'true';
  const isTestRoute = isAdminMode;
  const isPreviewMode = isAdminMode || searchParams.get('preview') === 'true';
  const isVipCustomer = Boolean(customerIdParam || companyParam || nameParam || phoneParam);

  const tabFromUrl = searchParams.get('tab');
  const path = location.pathname;
  let initialTab = 'fiyatlar';
  if (tabFromUrl === 'krediler' || path === '/krediler' || path === '/iveco-finansman') {
    initialTab = 'krediler';
  }

  const [activeMainTab, setActiveMainTab] = useState(initialTab);
  const isFromLinkedIn = refCode === 'linkedin' || searchParams.get('source') === 'linkedin';
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const [isMobileView, setIsMobileView] = useState(isMobile);
  const [tcmbEurRate, setTcmbEurRate] = useState(38.50);

  useEffect(() => {
    let active = true;
    fetchTcmbEurRate().then(info => {
      if (active && info?.rate > 0) {
        setTcmbEurRate(info.rate);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [showMoreTabsMobile, setShowMoreTabsMobile] = useState(false);
  const [showTechDetailsMobile, setShowTechDetailsMobile] = useState(false);
  const [showAllLoansMobile, setShowAllLoansMobile] = useState(false);
  const [showSmartHub, setShowSmartHub] = useState(false);
  const [showBodyworkGallery, setShowBodyworkGallery] = useState(false);

  useEffect(() => {
    const handleOpenSmartHub = () => setShowSmartHub(true);
    window.addEventListener('iveco:select-smart-action', handleOpenSmartHub);
    return () => window.removeEventListener('iveco:select-smart-action', handleOpenSmartHub);
  }, []);

  const [step, setStep] = useState(1);
  const [selectorMode, setSelectorMode] = useState(modelParam ? 'catalog' : 'slider');
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
  const [selectedCatalogOverride, setSelectedCatalogOverride] = useState(null);

  // Doğrudan Araç Seçimi & Sürgü Etkileşim Fonksiyonları
  const handleSelectVehicle = (modelKeyOrObj) => {
    const isObj = modelKeyOrObj && typeof modelKeyOrObj === 'object';
    const modelKey = isObj ? (modelKeyOrObj.finderKey || modelKeyOrObj.id || modelKeyOrObj.key) : modelKeyOrObj;
    setSelectedCatalogOverride(isObj ? modelKeyOrObj : null);

    let item = VEHICLE_CATALOG.find(v => v.key === modelKey);
    if (!item && typeof modelKey === 'string') {
      const lower = modelKey.toLowerCase();
      if (lower.includes('tway') || lower.includes('t-way')) {
        if (lower.includes('12') && lower.includes('460')) item = VEHICLE_CATALOG.find(v => v.key === 'tway_12teker_460');
        else if (lower.includes('12')) item = VEHICLE_CATALOG.find(v => v.key === 'tway_12teker_540');
        else if (lower.includes('460')) item = VEHICLE_CATALOG.find(v => v.key === 'tway_10teker_460');
        else item = VEHICLE_CATALOG.find(v => v.key === 'tway_10teker_540');
      } else if (lower.includes('sway') || lower.includes('s-way')) {
        item = VEHICLE_CATALOG.find(v => v.key === 'tractor_sway');
      } else if (lower.includes('70c') || lower.includes('72c')) {
        item = VEHICLE_CATALOG.find(v => v.key === 'truck_72c');
      } else if (lower.includes('150e')) {
        item = VEHICLE_CATALOG.find(v => v.key === 'truck_150e');
      } else if (lower.includes('160e')) {
        item = VEHICLE_CATALOG.find(v => v.key === 'truck_160e');
      } else if (lower.includes('120e')) {
        item = VEHICLE_CATALOG.find(v => v.key === 'truck_120e');
      } else if (lower.includes('100e')) {
        item = VEHICLE_CATALOG.find(v => v.key === 'truck_100e');
      } else if (lower.includes('van') || lower.includes('panelvan')) {
        if (lower.includes('h3') || lower.includes('18')) item = VEHICLE_CATALOG.find(v => v.key === 'panelvan_18');
        else if (lower.includes('4100') || lower.includes('16')) item = VEHICLE_CATALOG.find(v => v.key === 'panelvan_16');
        else item = VEHICLE_CATALOG.find(v => v.key === 'panelvan_12');
      } else if (lower.includes('35c')) {
        item = VEHICLE_CATALOG.find(v => v.key === 'chassis_35c');
      } else if (lower.includes('35s')) {
        item = VEHICLE_CATALOG.find(v => v.key === 'chassis_35s');
      }
    }
    if (!item) return;
    setSelectedModelKey(item.key);
    setPayloadKg(item.payloadKg);
    setVolumeM3(item.volumeM3);
    setSelectedBody(item.bodyType || 'kapali_kutu');
    setCustomDims(false);
    toast.success(`${isObj && modelKeyOrObj.model ? modelKeyOrObj.model : item.title} seçildi! ✓`);
  };

  const handlePayloadChange = (val) => {
    setSelectedModelKey(null);
    setSelectedCatalogOverride(null);
    setPayloadKg(val);
  };

  const handleVolumeChange = (val) => {
    setSelectedModelKey(null);
    setSelectedCatalogOverride(null);
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
  const [selectedBankId, setSelectedBankId] = useState(lockedBank?.id || 'teb_cetelem');
  const [selectedTierId, setSelectedTierId] = useState('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  // İhracatçı Euro Kredisi State'leri (S-Way, T-Way ve Uluslararası Nakliye İçin)
  const [loanCurrencyMode, setLoanCurrencyMode] = useState(() => {
    const loanParam = (searchParams.get('loan') || searchParams.get('kredi') || searchParams.get('currency') || '').toLowerCase();
    const rCode = (searchParams.get('ref') || '').toLowerCase();
    return (loanParam === 'eur' || loanParam === 'euro' || rCode.includes('ihracat') || rCode.includes('euro')) ? 'EUR' : 'TRY';
  });
  const [selectedEurBankId, setSelectedEurBankId] = useState(
    lockedBank?.hasEurCampaigns ? lockedBank.id : 'kuveyt_turk'
  );
  const [selectedEurCampaignId, setSelectedEurCampaignId] = useState(null);

  useEffect(() => {
    if (lockedBank?.id) {
      setSelectedBankId(lockedBank.id);
      if (lockedBank.hasEurCampaigns) {
        setSelectedEurBankId(lockedBank.id);
      } else {
        setLoanCurrencyMode('TRY');
      }
    }
  }, [lockedBank?.id, lockedBank?.hasEurCampaigns]);

  // VIP Test & Simülasyon Paneli State'leri (Satış Sorumlusu: Can Murat Onay)
  const [showTestPanel, setShowTestPanel] = useState(false);
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

  // Müşteri İletişim Formu (URL Linkinden veya Tarayıcı Hafızasından Otomatik Doldurma)
  const storedVisitorProfile = useMemo(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem('iveco_visitor_profile_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  // Eğer linkte özel bir firma adı (?company=...) varsa ve tarayıcı hafızasındaki firma ile uyuşmuyorsa,
  // başka müşterinin eski telefon numarasının bu yeni firma linkine yapışmasını KESİN OLARAK engelle!
  const isMailChannelLink = (refCode || '').toLowerCase().includes('mail');
  const isStoredProfileMatchingCompany =
    !companyParam ||
    (storedVisitorProfile.company &&
      storedVisitorProfile.company.trim().toLowerCase() === companyParam.trim().toLowerCase());
  const safeInitialPhone = isMailChannelLink
    ? ''
    : (phoneParam || (isStoredProfileMatchingCompany ? (storedVisitorProfile.phone || '') : ''));

  const [customerName, setCustomerName] = useState(nameParam || (isStoredProfileMatchingCompany ? (storedVisitorProfile.name || '') : ''));
  const [customerCompany, setCustomerCompany] = useState(companyParam || storedVisitorProfile.company || '');
  const [customerPhone, setCustomerPhone] = useState(safeInitialPhone);
  const [customerCity, setCustomerCity] = useState('Samsun');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quickPhoneInput, setQuickPhoneInput] = useState(safeInitialPhone);
  const [quickNameInput, setQuickNameInput] = useState(companyParam || nameParam || storedVisitorProfile.company || storedVisitorProfile.name || '');
  const [quickPhoneUnlocked, setQuickPhoneUnlocked] = useState(Boolean(safeInitialPhone));

  // Aktif İnceleme Süresi Sayacı: Sekme arka planda (uykuda) kaldığında sayacı durdurur,
  // böylece akşamdan açık kalan sekmelerde "1106 dk" gibi gerçek dışı süreler oluşmaz.
  const activeSecondsRef = React.useRef(1);
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        activeSecondsRef.current = Math.min(activeSecondsRef.current + 1, 540);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
              title: 'Daily 72C16 Şasi Kamyon (7.970 kg Kantar)',
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
        const ov = selectedCatalogOverride;
        return {
          ...item,
          ...(ov ? {
            title: ov.model || item.title,
            fullTitle: ov.model || item.fullTitle,
            modelTitle: ov.model || item.modelTitle,
            wheelbase: ov.wheelbase ? `${ov.wheelbase} mm` : item.wheelbase,
            dims: ov.bodyLength ? { ...item.dims, length: ov.bodyLength } : item.dims,
            campaignPriceText: ov.campaignPrice && ov.currency !== 'EUR' ? `${ov.campaignPrice.toLocaleString('tr-TR')} TL` : item.campaignPriceText,
            cashPriceText: ov.cashPrice && ov.currency !== 'EUR' ? `${ov.cashPrice.toLocaleString('tr-TR')} TL` : item.cashPriceText,
            cashDiscountText: ov.currency !== 'EUR' ? (ov.cashDiscount > 0 ? `${ov.cashDiscount.toLocaleString('tr-TR')} TL` : null) : item.cashDiscountText,
            displayPrice: ov.currency === 'EUR' && ov.eurPrice ? `${ov.eurPrice.toLocaleString('tr-TR')} €` : item.displayPrice
          } : {}),
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
            title: 'Daily 72C16 Şasi Kamyon (7.970 kg Kantar)',
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
            title: 'Daily 72C16 Şasi Kamyon (7.970 kg Kantar)',
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
  }, [selectedModelKey, selectedCatalogOverride, payloadKg, volumeM3, customDims, bodyLengthCm, bodyWidthCm, bodyHeightCm, selectedBody, selectedSector]);

  const visibleFinderBanks = useMemo(() => {
    if (lockedBank) return BANK_LIST.filter(b => b.id === lockedBank.id);
    return BANK_LIST.filter(b => {
      if (b.id === 'diger_yok') return true;
      return getCampaignsForVehicleAndBank(matched.series, b.id, 'all').campaigns.length > 0;
    });
  }, [lockedBank, matched.series]);

  const visibleFinderEurBanks = useMemo(
    () => (lockedBank ? EUR_PARTNER_BANKS.filter(b => b.id === lockedBank.id) : EUR_PARTNER_BANKS),
    [lockedBank]
  );

  const activeFinderBankId = lockedBank?.id
    || (visibleFinderBanks.some(b => b.id === selectedBankId) ? selectedBankId : (visibleFinderBanks[0]?.id || 'teb_cetelem'));
  const activeFinderEurBankId = lockedBank?.hasEurCampaigns ? lockedBank.id : selectedEurBankId;

  // Banka ve Kampanya Bilgisi (Kasım 2026 IVECO Resmi Banka Kampanyaları)
  const { category: vehicleCategory, effectiveBankId, campaigns: availableCampaigns } = useMemo(() => {
    return getCampaignsForVehicleAndBank(matched.series, activeFinderBankId, selectedTierId);
  }, [matched.series, activeFinderBankId, selectedTierId]);

  const categoryTiers = useMemo(() => {
    return getAmountTiersForCategory(vehicleCategory);
  }, [vehicleCategory]);

  useEffect(() => {
    if (selectedTierId && selectedTierId !== 'all') {
      const exists = categoryTiers.some(t => t.id === selectedTierId);
      if (!exists) {
        setSelectedTierId('all');
      }
    }
  }, [categoryTiers, selectedTierId]);

  const currentBankMeta = useMemo(() => {
    return BANK_LIST.find(b => b.id === activeFinderBankId) || visibleFinderBanks[0] || BANK_LIST[0];
  }, [activeFinderBankId, visibleFinderBanks]);

  const activeCampaign = useMemo(() => {
    if (!availableCampaigns || availableCampaigns.length === 0) return null;
    if (selectedCampaignId) {
      const found = availableCampaigns.find(c => c.id === selectedCampaignId);
      if (found) return found;
    }
    return availableCampaigns.find(c => c.highlight) || availableCampaigns[0];
  }, [availableCampaigns, selectedCampaignId]);

  // İhracatçı Euro Finansmanı Banka ve Paket Bilgileri
  const activeEurBankMeta = useMemo(() => {
    return EUR_PARTNER_BANKS.find(b => b.id === activeFinderEurBankId) || visibleFinderEurBanks[0] || EUR_PARTNER_BANKS[0];
  }, [activeFinderEurBankId, visibleFinderEurBanks]);

  const eurBankPresets = useMemo(() => {
    return EUR_LOAN_PRESETS.filter(p => p.bankId === activeEurBankMeta.id);
  }, [activeEurBankMeta]);

  const activeEurCampaign = useMemo(() => {
    return eurBankPresets.find(p => p.id === selectedEurCampaignId) || eurBankPresets[0] || null;
  }, [eurBankPresets, selectedEurCampaignId]);

  // Eğer linkte sadece belirli araç grupları (?groups=...) seçilmişse, Araç Seçici'de ilk seçili grubun aracını varsayılan yap
  useEffect(() => {
    if (allowedGroups.length > 0 && !modelParam && !selectedModelKey) {
      const firstGroup = allowedGroups[0];
      const mapDefault = {
        tway: 'tway_12teker_460',
        sway: 'tractor_sway',
        daily35_chassis: 'chassis_35c',
        daily35_van: 'panelvan_16',
        daily70: 'truck_72c',
        eurocargo: 'truck_150e'
      };
      if (mapDefault[firstGroup]) {
        setSelectedModelKey(mapDefault[firstGroup]);
      }
    }
  }, [allowedGroups, modelParam, selectedModelKey]);

  // Model değişiminde EUR aracı (S-Way vb.) Euro Kredisi moduna, TL aracı (Daily, Eurocargo, 12 Teker T-Way) TL Kredisi moduna geçer
  useEffect(() => {
    if (lockedBank && !lockedBank.hasEurCampaigns) {
      setLoanCurrencyMode('TRY');
      return;
    }
    if (matched && (matched.currency === 'EUR' || matched.key === 'tractor_sway')) {
      setLoanCurrencyMode('EUR');
    } else if (matched && matched.currency === 'TRY') {
      setLoanCurrencyMode('TRY');
    }
  }, [matched?.key, matched?.currency, lockedBank]);

  const socialSourceLabel = React.useMemo(() => {
    const code = (refCode || '').toLowerCase();
    if (lockedBank) {
      return `${lockedBank.icon || '🏦'} ${lockedBank.name} Özel Link Ziyaretçisi`;
    }
    if (activePartner && activePartner.id !== 'vip_ozel') {
      return `${activePartner.icon || '🏛️'} ${activePartner.shortName} Üyesi Ziyaretçisi`;
    }
    if (code.includes('mail') || code.includes('eposta')) return '📧 Kurumsal E-Posta Ziyaretçisi';
    if (code.includes('smmm')) return '👨‍💼 Mali Müşavir / SMMM Linki Ziyaretçisi';
    if (code.includes('fb_grup')) return '📘 Facebook Grubu Ziyaretçisi';
    if (code.includes('face') || code.includes('fb')) return '📘 Facebook Ziyaretçisi';
    if (code.includes('wa_grup') || code.includes('grup') || code.includes('nakliye')) return '🚚 Nakliye WhatsApp Grubu Ziyaretçisi';
    if (code.includes('wa_ozel') || code.includes('ozel')) return '👑 WhatsApp Özel Müşteri Ziyaretçisi';
    if (code.includes('wa_musteri') || code.includes('musteri')) return '💬 WhatsApp Müşteri Linki Ziyaretçisi';
    if (code.includes('insta') || code.includes('reels')) return '📸 Instagram Ziyaretçisi';
    if (code.includes('linkedin')) return '💼 LinkedIn Ziyaretçisi';
    if (code.includes('wa_durum') || code.includes('durum')) return '🟢 WhatsApp Durum Ziyaretçisi';
    if (code.includes('wa_tanitim')) return '💬 WhatsApp Tanıtım Ziyaretçisi';
    if (code.includes('sosyal')) return '📱 Sosyal Medya Ziyaretçisi';
    if (activePartner) {
      return `${activePartner.icon || '👑'} ${activePartner.shortName} Ziyaretçisi`;
    }
    return '';
  }, [refCode, activePartner, lockedBank]);

  // 📡 CANLI MÜŞTERİ AYAK İZİ (Sessiz Sinyal Kaydedici — Müşteri Form Doldurmasa Bile Ne İncelediğini CRM'e ve WhatsApp Botuna İletir)
  const sentFootprintsRef = React.useRef(new Set());
  const isBotVisitor = React.useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    if (navigator.webdriver) return true;
    const ua = (navigator.userAgent || '').toLowerCase();
    return /facebookexternalhit|facebot|meta-externalagent|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot|yandexbot|headlesschrome|lighthouse/i.test(ua);
  }, []);

  const recordCustomerFootprint = (actionLabel, modelOverride, campaignOverride, phoneOverride, nameOverride) => {
    if (isAdminMode || isPreviewMode || isBotVisitor) return;
    const effectivePhone = (phoneOverride ?? customerPhone ?? '').trim();
    const isGroupRef = (refCode || '').includes('fb_grup') || (refCode || '').includes('wa_grup');
    const rawNameCandidate = (nameOverride ?? (customerCompany || customerName) ?? '').trim();
    // Grup linklerinde URL'deki ?company=... grup adıdır, kişinin şahsi adı değildir (telefon girmediyse grup adını kişi adı sanma)
    const effectiveName = (isGroupRef && !effectivePhone && rawNameCandidate === (companyParam || '').trim())
      ? ''
      : rawNameCandidate;

    const key = `${actionLabel}|${modelOverride || ''}|${campaignOverride || ''}|${effectivePhone}`;
    if (sentFootprintsRef.current.has(key)) return;
    sentFootprintsRef.current.add(key);

    const parsedCid = customerIdParam ? parseInt(customerIdParam, 10) : undefined;
    const cleanBaseName = effectiveName.replace(/\s*\([^)]*Ziyaretçisi\)\s*/gi, '').trim();
    const visitorLabel = cleanBaseName
      ? (socialSourceLabel ? `${cleanBaseName} (${socialSourceLabel})` : cleanBaseName)
      : (socialSourceLabel || 'Portal Ziyaretçisi');
    const durationSeconds = Math.max(1, Math.min(activeSecondsRef.current || 1, 540));

    discoveryApi.recordIntentSignal({
      source: String(customerIdParam ? 'crm_existing_customer' : (refCode || 'vip_portal_footprint')).slice(0, 48),
      search_query: `[Canlı Ayak İzi - ${actionLabel}]`.slice(0, 480),
      target_model: String(modelOverride || matched?.modelTitle || 'IVECO 2026 Katalog').slice(0, 98),
      target_campaign: String(campaignOverride || (isGroupRef && companyParam ? `Grup: ${companyParam}` : (sectorParam ? `Sektör: ${sectorParam}` : (socialSourceLabel || '2026 Fiyat & Kredi Portalı')))).slice(0, 195),
      company_name: String(visitorLabel).slice(0, 480),
      city: String(customerCity || 'Samsun').slice(0, 95),
      phone: String(effectivePhone).slice(0, 48),
      page_url: String(window.location.href).slice(0, 490),
      referrer: String(document.referrer || (refCode || 'whatsapp_vip_link')).slice(0, 490),
      duration_seconds: durationSeconds,
      scroll_depth: 80,
      intent_score: (effectiveName || customerIdParam || effectivePhone) ? 95 : 90,
      intent_level: 'very_high',
      matched_customer_id: !isNaN(parsedCid) ? parsedCid : undefined,
      notes: `📡 Canlı Portal Hareketi: ${actionLabel}\nKaynak: ${socialSourceLabel || 'Doğrudan / VIP Link'}\nNumara: ${effectivePhone || 'Henüz Tanımlanmadı'}\nİncelenen Araç: ${modelOverride || matched?.modelTitle || '-'}\nDetay: ${campaignOverride || '-'}`
    }).catch(() => {
      // KVKK gereği tarayıcıdan herkese açık ntfy kanalına müşteri telefonu gönderilmez
    });
  };

  // 📲 WhatsApp Durum / Grup ziyaretçisi 1 dokunuşla numarasını seçtiğinde anında bot bildirimi gönder ve cihaz hafızasına kaydet
  const handleQuickPhoneIdentify = (rawPhone, rawName, triggerReason = '📲 Ziyaretçi Numarasını Tanımladı (Özel İndirim & Tablo Kilidi)') => {
    const digits = String(rawPhone || '').replace(/\D/g, '');
    if (digits.length < 10) {
      toast.error('Lütfen geçerli bir cep telefonu numarası girin (Örn: 05XX XXX XX XX)');
      return false;
    }
    const cleanPhone = String(rawPhone).trim();
    const cleanName = String(rawName || customerCompany || customerName || '').trim();
    setCustomerPhone(cleanPhone);
    if (cleanName) {
      setCustomerName(cleanName);
      if (!customerCompany) setCustomerCompany(cleanName);
    }
    setQuickPhoneUnlocked(true);
    try {
      window.localStorage.setItem('iveco_visitor_profile_v1', JSON.stringify({
        phone: cleanPhone,
        name: cleanName,
        company: customerCompany || cleanName,
        updatedAt: Date.now()
      }));
    } catch {
      // ignore storage errors
    }
    recordCustomerFootprint(
      triggerReason,
      selectedModelKey ? (matched?.modelTitle || selectedModelKey) : '2026 Fiyat & Kredi Listesi',
      socialSourceLabel || 'WhatsApp Durum / Özel İskonto Aktivasyonu',
      cleanPhone,
      cleanName
    );
    toast.success('✅ Numaranız tanımlandı! Size özel nakit ve kredi avantajları aktif edildi.');
    return true;
  };

  // Müşteri kendisine gönderilen VIP Linki, Sosyal Medya Linkini veya doğrudan Fiyat Listesini açtığında anında CRM'e "Portal Açıldı" sinyali gönder
  useEffect(() => {
    if (!isAdminMode && !isPreviewMode && !isBotVisitor) {
      const timer = setTimeout(() => {
        recordCustomerFootprint(
          socialSourceLabel ? `${socialSourceLabel} Linkine Tıkladı` : 'Fiyat & Kampanya Linki Açıldı',
          selectedModelKey ? (matched?.modelTitle || selectedModelKey) : '2026 Fiyat & Kredi Listesi',
          activePartner ? `Kurum Protokolü: ${activePartner.shortTitle || activePartner.name}` : (sectorParam ? `Sektör Filtresi: ${sectorParam}` : (socialSourceLabel || 'Doğrudan Fiyat Listesi Girişi'))
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [customerIdParam, socialSourceLabel, refCode, isBotVisitor]);

  // ⏱️ GERÇEK KALMA SÜRESİ GÜNCELLEYİCİ (Herkesin "5 sn" kalmasını önler; müşteri sayfada kaldıkça gerçek süresini günceller)
  useEffect(() => {
    if (isAdminMode || isPreviewMode || isBotVisitor) return;
    const sendDurationHeartbeat = () => {
      const sec = Math.min(activeSecondsRef.current || 1, 540);
      if (sec < 8) return;
      discoveryApi.recordIntentSignal({
        source: String(customerIdParam ? 'crm_existing_customer' : (refCode || 'vip_portal_footprint')).slice(0, 48),
        search_query: '[Süre Güncellemesi]',
        target_model: String(selectedModelKey ? (matched?.modelTitle || selectedModelKey) : '2026 Fiyat & Kredi Listesi').slice(0, 98),
        page_url: String(window.location.href).slice(0, 490),
        duration_seconds: sec,
        scroll_depth: 85,
        intent_score: 85,
        intent_level: 'high'
      }).catch(() => {});
    };

    const t1 = setTimeout(sendDurationHeartbeat, 15000);
    const t2 = setTimeout(sendDurationHeartbeat, 35000);
    const t3 = setTimeout(sendDurationHeartbeat, 75000);
    const t4 = setTimeout(sendDurationHeartbeat, 150000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendDurationHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAdminMode, isPreviewMode, isBotVisitor, customerIdParam, refCode, selectedModelKey, matched?.modelTitle]);

  // Form Gönderimi (Teklif İste & CRM'e Lead / Müşteri Etkileşimi Olarak Yaz)
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      toast.error('Lütfen geçerli bir telefon numarası girin (örn: 0544 622 59 31)');
      return;
    }

    setSubmitting(true);
    const durationSeconds = Math.max(5, Math.min(activeSecondsRef.current || 20, 540));
    const parsedCid = customerIdParam ? parseInt(customerIdParam, 10) : undefined;

    try {
      window.localStorage.setItem('iveco_visitor_profile_v1', JSON.stringify({
        phone: customerPhone.trim(),
        name: customerName.trim(),
        company: customerCompany.trim() || customerName.trim(),
        updatedAt: Date.now()
      }));
    } catch {}

    const isEurFinancing = loanCurrencyMode === 'EUR' || (matched.currency === 'EUR' && loanCurrencyMode !== 'TRY');
    const campaignSummary = (isEurFinancing && activeEurCampaign)
      ? `${activeEurBankMeta.name} — ${activeEurCampaign.title} (Aylık: €${activeEurCampaign.monthly.toLocaleString('tr-TR')})`
      : activeCampaign
        ? `${currentBankMeta.name} — ${activeCampaign.title} (Aylık: ${activeCampaign.monthly.toLocaleString('tr-TR')} TL)`
        : `${currentBankMeta.name} (Resmi IVECO Kredi Kampanyası)`;

    const leadPayload = {
      source: String(customerIdParam ? 'crm_existing_customer' : (refCode || 'whatsapp_link')).slice(0, 48),
      search_query: `[Şasi & Kasa Seçici]: ${selectedSector} | ${payloadKg} kg | ${volumeM3} m3 | ${selectedBody}`.slice(0, 480),
      target_model: String(matched.modelTitle || '2026 IVECO Şasi').slice(0, 98),
      target_campaign: String(campaignSummary || '').slice(0, 195),
      company_name: String(customerCompany.trim() || customerName.trim() || 'WhatsApp Ziyaretçisi').slice(0, 480),
      city: String(customerCity || 'Samsun').slice(0, 95),
      phone: String(customerPhone.trim()).slice(0, 48),
      page_url: String(window.location.href).slice(0, 490),
      referrer: String(document.referrer || 'whatsapp_chat').slice(0, 490),
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
      toast.success('🛠️ VIP TEST: Simülasyon çalıştırıldı! CRM Pipeline kaydı aşağıda gösterilmektedir.', { duration: 5000 });
      return;
    }

    try {
      await discoveryApi.recordIntentSignal(leadPayload);
      setSubmitted(true);
      toast.success('Talebiniz alındı! Satış Sorumlusu en kısa sürede sizinle iletişime geçecektir.');
    } catch (err) {
      console.error(err);
      toast.error('Kayıt alınırken bir sorun oluştu, lütfen doğrudan WhatsApp üzerinden iletişime geçin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Doğrudan WhatsApp Aç (Can M. - Satış Sorumlusu)
  const handleDirectWhatsApp = (customMsg) => {
    const cleanPhone = SALES_REP.phoneWhatsapp;
    if (typeof customMsg === 'string' && customMsg.trim()) {
      openWhatsAppChat(cleanPhone, customMsg);
      return;
    }
    recordCustomerFootprint('Üst Bar WhatsApp Tıklandı', matched?.modelTitle || 'Genel Katalog', 'WhatsApp Direkt Mesaj');
    toast.success('💬 WhatsApp açılıyor... Mesajınız hazırlandı!', { duration: 3000 });
    const clientGreeting = (customerCompany || customerName)
      ? `Merhaba Can Bey, ben ${customerCompany || customerName}. Paylaştığınız IVECO 2026 Model Fiyat ve Şasi Kataloğu üzerinden inceleme yaptım.\n\n`
      : `Merhaba Can Bey, paylaştığınız IVECO 2026 Model Fiyat ve Şasi Kataloğu üzerinden inceleme yaptım.\n\n`;

    const priceText = matched.isTway
      ? `*Fiyatlandırma:* T-Way Şantiye & Ağır Hizmet Özel Fiyatı\n`
      : matched.currency === 'EUR'
        ? `*Fiyat Aralığı:* 500 Full Plus: 123.000 € (${Math.round(123000 * tcmbEurRate).toLocaleString('tr-TR')} TL) • 580 Full Plus: 126.000 € (${Math.round(126000 * tcmbEurRate).toLocaleString('tr-TR')} TL) • 580 Diamond: 131.000 € (${Math.round(131000 * tcmbEurRate).toLocaleString('tr-TR')} TL) [TCMB Kur: ${tcmbEurRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL]\n`
        : matched.cashPriceText
          ? (matched.cashDiscountText
              ? `*Kampanyalı Fiyat:* ${matched.campaignPriceText}\n*Net Peşin Fiyat:* ${matched.cashPriceText} (-${matched.cashDiscountText} Peşin İndirimi)\n`
              : `*Kredili / Net Fiyat:* ${matched.campaignPriceText} (Peşin indirimi uygulanmamaktadır)\n`)
          : '';

    const isEurFinancing = loanCurrencyMode === 'EUR' || (matched.currency === 'EUR' && loanCurrencyMode !== 'TRY');

    const campaignText = (isEurFinancing && activeEurCampaign)
      ? `*Finansman Tercihi:* ${activeEurBankMeta.name} — ${activeEurCampaign.title}\n` +
        `*Aylık Taksit:* €${activeEurCampaign.monthly.toLocaleString('tr-TR')} / ay (Toplam Geri Ödeme: €${activeEurCampaign.total.toLocaleString('tr-TR')})\n` +
        `*Kredi Kapsamı:* S-Way / T-Way Euro Finansman Kampanyası\n\n`
      : activeCampaign
        ? `*Seçilen Finansman:* ${currentBankMeta.name} — ${activeCampaign.title}\n` +
          `*Aylık Taksit:* ${activeCampaign.monthly.toLocaleString('tr-TR')} TL / ay (Toplam Geri Ödeme: ${activeCampaign.total.toLocaleString('tr-TR')} TL)\n\n`
        : `*Finansman Tercihi:* ${currentBankMeta.name} (Resmi Bayi Finansman Desteği)\n\n`;

    const partnerProtocolLine = activePartner
      ? `🏛️ *Kurumsal Protokol:* ${activePartner.fullName} (${activePartner.discountLabel})\n`
      : '';

    const msg = (
      clientGreeting +
      partnerProtocolLine +
      `*İncelenen Şasi Modeli:* ${matched.modelTitle}\n` +
      `*Taşıma Kapasitesi:* ${payloadKg} kg Net Yük | ${matched.kantarTitle}\n` +
      priceText +
      campaignText +
      `Bu aracın hazır stok teslim durumu ve resmi proforma teklifi hakkında detaylı bilgi almak istiyorum.`
    );
    openWhatsAppChat(cleanPhone, msg);
  };

  // Satış Sorumlusu Dijital Kartvizit (vCard) İndirme & Rehbere Ekleme
  const handleDownloadVCard = () => {
    const vcard = 
`BEGIN:VCARD
VERSION:3.0
N:Murat;Can;;;
FN:Satış Sorumlusu Can Murat (IVECO ERC)
ORG:IVECO ERC Samsun Otomotiv
TITLE:Satış Sorumlusu Can Murat
TEL;TYPE=CELL,VOICE;VALUE=uri:tel:+905446225931
EMAIL;TYPE=WORK,INTERNET:murat.onay@ercsamsunotomotiv.com
URL:https://erc-iveco.com/ozel-teklif
NOTE:IVECO ERC Samsun Otomotiv Satış Sorumlusu Can Murat
END:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'IVECO_ERC_Satis_Sorumlusu_Can_Murat.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📇 Satış Sorumlusu Can Murat dijital kartviziti indirildi! Telefon rehberinize kaydedebilirsiniz.', { duration: 4000 });
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

  // VIP Test Paneli Fonksiyonları (Satış Sorumlusu Can Murat)
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
    const text = `Sayın ${cleanCompany} Yetkilisi,\n\nIVECO ERC Samsun Otomotiv olarak filonuza ve taşıma operasyonunuza özel hazırladığımız dijital şasi, kasa boyutu ve 2026 güncel anlaşmalı banka kredi simülatörünü (%0 Faiz ve Yüksek Limitli Ticari Kredi Seçenekleri) incelemeniz için aşağıdaki bağlantıyı hazırladık:\n\n🔗 ${link}\n\nİnceledikten sonra dilediğiniz şasi konfigürasyonunu doğrudan bana iletebilirsiniz.\n\nSaygılarımla,\nSatış Sorumlusu Can Murat\nIVECO ERC Samsun Otomotiv\n📞 0544 622 59 31\n✉️ murat.onay@ercsamsunotomotiv.com`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('📲 VIP WhatsApp Metni & Linki Kopyalandı!');
    } else {
      prompt('WhatsApp Metni:', text);
    }
  };

  const handleCopyLinkedInPostTemplate = () => {
    const origin = getPublicOrigin();
    const link = `${origin}/musteri?ref=linkedin`;
    const postText = 
`🚛 Ticari araç filonuz ve taşımacılık operasyonunuz için merak edilen tüm soruların yanıtlarını, kasa çözümlerini ve güncel fiyat listesini tek bir interaktif portalda topladık!

💼 Sayın Lojistik, Dağıtım ve Filo Yöneticileri;
IVECO ERC Samsun Otomotiv olarak hazırladığımız dijital müşteri ve bilgi merkezimizde:
✅ B Sınıfı Ehliyetle Kullanılan Daily 35 Kamyonetler (Şehir İçi Serbest Dağıtım)
✅ Resmi Fabrika Kota Tahsisi ve Ticari Finansman Çözümleri
✅ Frigo, Damper, Kapalı Kutu ve Kayar Perde Üst Yapı Kasa Ölçüleri & Palet Kapasiteleri
✅ 1.000.000 TL'ye kadar %0 Faiz ve Anlaşmalı Banka Ticari Kredi Simülatörü
✅ Şirketler İçin %20 KDV Mahsubu ve 5 Yıllık Amortisman Rehberi
✅ Kantar Toleransları, Motor Ömrü ve Merak Edilen 10 Kritik Soru & Yanıtları

Aşağıdaki bağlantıdan doğrudan inceleyebilir, aklınıza takılan her konuyu bana sorabilirsiniz:
👉 ${link}

📞 İletişim: Satış Sorumlusu Can Murat | 0544 622 59 31
IVECO ERC Samsun Otomotiv San. ve Tic. A.Ş.

#IVECO #Daily35 #Eurocargo #Kamyonet #TicariAraç #Lojistik #FiloYönetimi #Taşıma #Samsun #ERCSamsun #Kredi #Finansman`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(postText);
      toast.success('💼 LinkedIn Gönderi Metni & Linki Kopyalandı!');
    } else {
      prompt('LinkedIn Gönderi Metni:', postText);
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

İşletmeniz için belirlediğimiz *${targetModel}* aracına ait teknik şasi detaylarını ve 2026 güncel %0 faizli kredi simülatörünü aşağıdaki bağlantıdan tek tıkla inceleyebilirsiniz:

👉 ${link}

• Net Taşıma: ~${targetPayload} Ton
• Kantar Güvencesi: ${targetKantar}
• Kredi: 12-48 Ay Resmi Banka Taksit Seçenekleri
• İletişim: Satış Sorumlusu Can Murat | 0544 622 59 31
• E-Posta: murat.onay@ercsamsunotomotiv.com`
      );
    }

    if (templateKey === 'heavy') {
      return (
`🚜 *AĞIR VASITA & ŞANTİYE TEKLİFİ — ${targetCompany.toUpperCase()}*

Sayın Yetkili,
Ağır hafriyat, maden ve şantiye operasyonunuz için yapılandırdığımız *${targetModel}* aracımıza ait karayolları yasal kantar sınırları, brüt GVW kapasitesi ve 2026 güncel resmi ticari kredi imkanları hazırlanmıştır:

📌 *Araç:* ${targetModel}
⚖️ *Kantar / GVW:* ${targetKantar}
🛠️ *Damper / Kasa:* Ağır Hizmet Hardox Uyumu
💰 *Ticari Finansman:* 3.000.000 TL - 5.000.000 TL Özel Filo Desteği

Detaylı teknik föyü ve banka ödeme planını buradan anında görüntüleyebilirsiniz:
🔗 ${link}

Saygılarımla,
*Satış Sorumlusu Can Murat*
IVECO ERC Samsun Otomotiv
📞 0544 622 59 31
✉️ murat.onay@ercsamsunotomotiv.com`
      );
    }

    // Default: 'vip'
    return (
`🌟 *SAYIN ${targetCompany.toUpperCase()} YETKİLİSİ,*

IVECO ERC Samsun Otomotiv olarak, firmanızın taşımacılık operasyonuna özel hazırladığımız dijital şasi konfigürasyonunu ve 2026 güncel anlaşmalı banka kredi simülatörünü (%0 Faiz ve Yüksek Limitli Ticari Kredi Seçenekleri) bilgilerinize sunarım.

🚛 *Önerilen Model:* ${targetModel}
⚖️ *Kantar Sınırı:* ${targetKantar}
💎 *Finansman:* %0 Faiz & 5.000.000 TL'ye Varan Esnek Vadeli Kredi

Aşağıdaki firmanıza özel güvenli bağlantıdan kasa boyutlarını, kantar analizini ve banka taksit tablolarını doğrudan inceleyebilirsiniz:

🔗 *Size Özel Teklif Portalı:*
${link}

Seçtiğiniz şasinin stok ve fabrika teslim tarihleri için bu mesaja yanıt vermeniz yeterlidir.

Saygılarımla,
*Satış Sorumlusu Can Murat*
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

  const isIOSDevice = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      background: 'radial-gradient(ellipse at 50% 0%, #233d63 0%, #192d4b 48%, #13233b 100%)',
      color: '#f1f5f9',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: isMobileView
        ? `${isIOSDevice ? 'max(52px, calc(env(safe-area-inset-top, 44px) + 10px))' : 'max(18px, calc(env(safe-area-inset-top, 14px) + 10px))'} 10px 88px`
        : '16px 12px 60px'
    }}>
      {isMobileView && isIOSDevice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'max(46px, env(safe-area-inset-top, 46px))',
          background: '#0f172a',
          zIndex: 9990,
          pointerEvents: 'none'
        }} />
      )}
      <Toaster position="top-center" />

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: '680px', margin: isMobileView ? '0 auto 8px' : '0 auto 20px', textAlign: 'center' }}>
        
        {/* Can Murat Onay VIP Test & Canlı Simülasyon Dock'u (Sadece ?admin=true olduğunda) */}
        {isAdminMode && showTestPanel && (
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
                  onClick={handleCopyLinkedInPostTemplate}
                  style={{
                    background: 'linear-gradient(135deg, #0077b5 0%, #004182 100%)',
                    color: '#fff',
                    border: '1px solid #0077b5',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="LinkedIn'de paylaşılacak hazır profesyonel gönderi metnini kopyala"
                >
                  <FiShare2 size={12} /> 💼 LinkedIn Gönderisini Kopyala
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
        {isVipCustomer && !isMobileView && (
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
                  <strong style={{ color: '#e2e8f0' }}>{SALES_REP.name}</strong> operasyonunuza özel teknik şasi ve kantar simülasyonunu hazırladı.
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

        {isMobileView ? (
          /* ── MOBİL KOMPAKT ÜST KİMLİK KARTI (ALTTAKİ BUTONLARI TEKRARLAMAZ, EKRAN YERİ KAZANDIRIR) ── */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '2px'
          }}>
            {isVipCustomer && (
              <div style={{
                background: 'rgba(2, 132, 199, 0.22)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                borderRadius: '10px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#f8fafc',
                textAlign: 'left'
              }}>
                ✨ Hoş Geldiniz, <strong style={{ color: '#38bdf8' }}>{customerCompany || customerName}</strong>
              </div>
            )}
            <div style={{
              background: '#0f172a',
              border: '1.5px solid rgba(56, 189, 248, 0.48)',
              borderRadius: '12px',
              padding: '8px 11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', minWidth: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                  flexShrink: 0,
                  border: '1px solid rgba(56, 189, 248, 0.5)'
                }}>
                  {SALES_REP.initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {SALES_REP.name}
                  </div>
                  <div style={{ fontSize: '0.69rem', color: '#4ade80', fontWeight: 800, marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    IVECO ERC Samsun · {SALES_REP.phoneDisplay}
                  </div>
                </div>
              </div>
              <img
                src="/logo-iveco-white.png"
                alt="IVECO"
                style={{ height: '15px', width: 'auto', maxWidth: '68px', objectFit: 'contain', flexShrink: 0 }}
              />
            </div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(30, 52, 86, 0.88)',
              border: '1px solid rgba(56, 189, 248, 0.42)',
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

            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3, margin: '0 0 6px' }}>
              IVECO 2026 Model Şasi Kataloğu, Fiyat Listesi & Finansman Portalı
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0 }}>
              Daily 35, Daily 70C, Eurocargo ve S-Way şasi modellerimizin güncel bayi fiyatlarını, yasal istiap kapasitelerini ve <strong>anlaşmalı banka resmi sübvansiyonlu kredi kampanyalarını</strong> inceleyebilirsiniz.
            </p>

            {/* Satış Sorumlusu Can Murat Temsilci Rozeti & Hızlı İletişim Butonları */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(30, 52, 86, 0.88)',
              border: '1px solid rgba(56, 189, 248, 0.42)',
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
                title="Satış Sorumlusu Can Murat İletişim Kartını Telefona İndir & Rehbere Kaydet"
              >
                <FiDownload size={12} /> Rehbere Ekle
              </button>

              {/* Yalnızca ?admin=true parametresiyle açtığında görünen dahili araçlar */}
              {isAdminMode && (
                <>
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
                    title="Satış Sorumlusu Can Murat VIP Test Paneli ve Müşteri Link Üreticisini Aç/Kapat"
                  >
                    <span>🛠️</span> {showTestPanel ? 'Test Paneli Açık' : 'Test Paneli'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── LINKEDIN ZİYARETÇİSİ ÖZEL KARŞILAMA BANNER'I ── */}
      {isFromLinkedIn && !isMobileView && (
        <div style={{
          maxWidth: '880px',
          margin: '0 auto 16px',
          background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.35) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1.5px solid rgba(0, 119, 181, 0.6)',
          borderRadius: '16px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(0, 119, 181, 0.25)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#0077b5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0
            }}>
              💼
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                LINKEDIN BAĞLANTISINDAN HOŞ GELDİNİZ
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.25 }}>
                IVECO ERC Samsun Otomotiv Müşteri & Bilgi Merkezine Hoş Geldiniz!
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                <strong>{SALES_REP.name}</strong> tarafından hazırlanan güncel araç fiyatlarını, kasa çözümlerini, kredi simülatörünü ve merak ettiğiniz soruların yanıtlarını aşağıdaki sekmelerden inceleyebilirsiniz.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 🏛️ DERNEK / ODA / BİRLİK ÖZEL PROTOKOL BANNER'I (SİMDER, Arıcılar Birliği vb.) ── */}
      {activePartner && (
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto 16px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.96) 55%, rgba(245, 158, 11, 0.22) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.65)',
          borderRadius: '18px',
          padding: isMobileView ? '14px' : '18px 22px',
          display: 'flex',
          flexDirection: isMobileView ? 'column' : 'row',
          alignItems: isMobileView ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 10px 32px rgba(16, 185, 129, 0.22)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {activePartner.logoUrl ? (
              <div style={{
                background: '#ffffff',
                padding: '6px 14px',
                borderRadius: '12px',
                border: '2px solid rgba(239, 68, 68, 0.45)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img
                  src={activePartner.logoUrl}
                  alt={activePartner.shortName}
                  style={{ height: isMobileView ? '34px' : '42px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{
                width: isMobileView ? '46px' : '54px',
                height: isMobileView ? '46px' : '54px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.22)',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobileView ? '1.5rem' : '1.75rem',
                flexShrink: 0
              }}>
                {activePartner.icon || '🏛️'}
              </div>
            )}

            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.22)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                color: '#6ee7b7',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: '999px',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                🤝 RESMİ KURUMSAL PROTOKOL & ÜYE İNDİRİM EKRANI
              </div>
              <div style={{ fontSize: isMobileView ? '1.02rem' : '1.16rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.25 }}>
                {activePartner.fullName} Üyelerine Hoş Geldiniz!
              </div>
              <div style={{ fontSize: isMobileView ? '0.78rem' : '0.82rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.4 }}>
                {activePartner.extraPerk} — <strong>Aşağıdaki tüm 2026 model şasi fiyatlarında {activePartner.shortName} üye indiriminiz otomatik olarak düşülmüştür.</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, marginTop: '5px' }}>
                👤 Yetkili: Satış Sorumlusu Can Murat • 📞 0544 622 59 31 (IVECO ERC Samsun Otomotiv)
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(2, 6, 23, 0.85)',
            border: '1.5px solid #fbbf24',
            borderRadius: '14px',
            padding: '10px 16px',
            textAlign: 'center',
            flexShrink: 0,
            width: isMobileView ? '100%' : 'auto'
          }}>
            <div style={{ fontSize: '0.68rem', color: '#fde047', fontWeight: 800, textTransform: 'uppercase' }}>
              AKTİF {activePartner.shortName} AVANTAJI
            </div>
            <div style={{ fontSize: isMobileView ? '1.08rem' : '1.15rem', fontWeight: 900, color: '#4ade80', marginTop: '2px' }}>
              🏷️ {activePartner.discountType === 'percent'
                ? `%${activePartner.discountValue} Özel İskonto`
                : `-${activePartner.discountValue.toLocaleString('tr-TR')} ₺ / Araç`}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
              Satış Sorumlusu Can Murat Notu ✓
            </div>
          </div>
        </div>
      )}

      {/* ── 🏦 BANKAYA ÖZEL KURUMSAL FİNANSMAN & PORTFÖY BANNER'I (Sadece Seçilen Bankanın Oranları Görünür) ── */}
      {lockedBank && (
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto 12px',
          background: `linear-gradient(135deg, ${lockedBank.bg || 'rgba(16, 185, 129, 0.22)'} 0%, rgba(15, 23, 42, 0.96) 65%, rgba(2, 132, 199, 0.2) 100%)`,
          border: `1.5px solid ${lockedBank.color || '#10b981'}`,
          borderRadius: isMobileView ? '12px' : '16px',
          padding: isMobileView ? '9px 12px' : '14px 18px',
          display: 'flex',
          flexDirection: isMobileView ? 'row' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          boxShadow: '0 8px 24px rgba(2, 6, 23, 0.35)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobileView ? '8px' : '12px', flex: '1 1 240px', minWidth: 0 }}>
            <div style={{
              width: isMobileView ? '34px' : '44px',
              height: isMobileView ? '34px' : '44px',
              borderRadius: '10px',
              background: lockedBank.bg || 'rgba(16, 185, 129, 0.22)',
              border: `1.5px solid ${lockedBank.color || '#10b981'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobileView ? '1.15rem' : '1.45rem',
              flexShrink: 0
            }}>
              {lockedBank.icon || '🏦'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: isMobileView ? '0.64rem' : '0.7rem',
                fontWeight: 900,
                color: lockedBank.color || '#4ade80',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                🔒 {lockedBank.name.toUpperCase()} {lockedBank.branchName ? `(${lockedBank.branchName}) ` : ''}ÖZEL TİCARİ FİNANSMAN EKRANI
              </div>
              <div style={{
                fontSize: isMobileView ? '0.82rem' : '0.98rem',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.25
              }}>
                {lockedBank.bankerName
                  ? `Sayın ${lockedBank.bankerName} Portföyü — Yalnızca ${lockedBank.shortName} Resmi Oranları Aktif`
                  : `Bu Bağlantıda Yalnızca ${lockedBank.name} Resmi Ticari Kredi Oranları Listelenmektedir`}
              </div>
              {!isMobileView && (
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                  {lockedBank.description} • <strong>Aynı gün şasi proforma faturası: Satış Sorumlusu Can Murat (0544 622 59 31)</strong>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveMainTab('krediler');
              recordCustomerFootprint('Banka Özel Linki', `${lockedBank.name} Kredi Tablosu Açıldı`, 'Banka Özel Banner');
            }}
            style={{
              background: lockedBank.color || '#10b981',
              color: '#020617',
              border: 'none',
              borderRadius: '10px',
              padding: isMobileView ? '7px 10px' : '9px 14px',
              fontSize: isMobileView ? '0.72rem' : '0.78rem',
              fontWeight: 900,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {lockedBank.icon} {lockedBank.shortName} Oran Tablosu →
          </button>
        </div>
      )}

      {/* 🚀 ULTRA SADE 2'Lİ SEÇİM BARI: ARAÇ FİYATLARI VEYA BANKA KREDİ TABLOSU */}
      <div style={{
        maxWidth: '1080px',
        margin: '0 auto 12px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.85)',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid rgba(56, 189, 248, 0.3)'
      }}>
        <button
          type="button"
          onClick={() => {
            setActiveMainTab('fiyatlar');
            recordCustomerFootprint('Başlangıç Kutusu', '2026 Fiyat Listesi', 'Hızlı Başlangıç');
          }}
          style={{
            padding: isMobileView ? '10px 8px' : '11px 14px',
            borderRadius: '10px',
            background: activeMainTab === 'fiyatlar'
              ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)'
              : 'transparent',
            border: activeMainTab === 'fiyatlar' ? '1.5px solid #38bdf8' : '1px solid transparent',
            color: activeMainTab === 'fiyatlar' ? '#ffffff' : '#94a3b8',
            fontWeight: 900,
            fontSize: isMobileView ? '0.78rem' : '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>🚛</span>
          <span>Araç Fiyatları & Taksit</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab('krediler');
            recordCustomerFootprint('Başlangıç Kutusu', lockedBank ? `${lockedBank.name} Kredi Tablosu` : 'Banka Kredi & Taksit Tablosu', 'Hızlı Başlangıç');
          }}
          style={{
            padding: isMobileView ? '10px 8px' : '11px 14px',
            borderRadius: '10px',
            background: activeMainTab === 'krediler'
              ? 'linear-gradient(135deg, #059669 0%, #065f46 100%)'
              : 'transparent',
            border: activeMainTab === 'krediler' ? '1.5px solid #4ade80' : '1px solid transparent',
            color: activeMainTab === 'krediler' ? '#ffffff' : '#94a3b8',
            fontWeight: 900,
            fontSize: isMobileView ? '0.78rem' : '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>{lockedBank ? lockedBank.icon : '💳'}</span>
          <span>{lockedBank ? `${lockedBank.shortName} Kredi Oranları` : 'Banka Kredi Oranları'}</span>
        </button>
      </div>

      {/* ── SEKME 2: 2026 MODEL FİYAT LİSTESİ ── */}
      {activeMainTab === 'fiyatlar' && (
        <div style={{ maxWidth: '1080px', margin: '0 auto 30px' }}>
          <PricingCatalogTab
            initialSector={sectorParam || activePartner?.defaultSector || ''}
            allowedGroups={allowedGroups}
            partnerProtocol={activePartner}
            lockedBank={lockedBank}
            onOpenLoanTab={() => {
              setActiveMainTab('krediler');
              recordCustomerFootprint('Fiyat Listesinden Banka Tablosuna Geçti', lockedBank ? lockedBank.name : 'Tüm Bankalar', 'Banka Kredi Sekmesi');
            }}
            onSelectVehicle={(vehicle) => {
              recordCustomerFootprint('Kredi Planı İnceleme', vehicle?.model || String(vehicle), lockedBank ? `${lockedBank.name} Özel Linkten Seçildi` : '2026 Fiyat Listesinden Seçildi');
              handleSelectVehicle(vehicle);
              setActiveMainTab('secici');
              setStep(2);
              setTimeout(() => {
                const resEl = document.getElementById('simple-selected-vehicle-result');
                if (resEl) resEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 80);
            }}
            onDirectWhatsApp={(customMsg) => handleDirectWhatsApp(customMsg)}
            onTrackFootprint={recordCustomerFootprint}
            salesRep={SALES_REP}
          />
        </div>
      )}

      {/* ── SEKME 3: ÜST YAPI & KASA REHBERİ ── */}
      {activeMainTab === 'ust-yapi' && (
        <div style={{ maxWidth: '1080px', margin: '0 auto 30px' }}>
          <BodyworkExamplesGallery
            selectedModelHint={selectedModelKey || matched?.modelTitle || ''}
            selectedBodyHint={selectedBody}
            onInspectExample={(item) =>
              recordCustomerFootprint(
                `📸 Örnek Üstyapı İnceledi: ${item.title}`,
                item.seriesLabel,
                item.bodyTypeLabel
              )
            }
          />
          <BodyStructureTab
            onSelectBody={(bodyId) => {
              setSelectedBody(bodyId);
              setActiveMainTab('secici');
              setStep(1);
            }}
            onDirectWhatsApp={(customMsg) => handleDirectWhatsApp(customMsg)}
            salesRep={SALES_REP}
          />
        </div>
      )}

      {/* ── SEKME 4: KREDİLER & FİNANSMAN ── */}
      {activeMainTab === 'krediler' && (
        <div style={{ maxWidth: '1080px', margin: '0 auto 30px' }}>
          <LoanFinanceTab
            lockedBank={lockedBank}
            onDirectWhatsApp={(customMsg) => handleDirectWhatsApp(customMsg)}
            salesRep={SALES_REP}
          />
        </div>
      )}

      {/* ── SEKME 5: SIKÇA SORULAN SORULAR (LINKEDIN & MÜŞTERİ SSS) ── */}
      {activeMainTab === 'sss' && (
        <div style={{ maxWidth: '980px', margin: '0 auto 30px' }}>
          <FaqLinkedInTab
            onDirectWhatsApp={(customMsg) => handleDirectWhatsApp(customMsg)}
            salesRep={SALES_REP}
          />
        </div>
      )}

      {/* ── SEKME 6: TCO & RAKİP KARŞILAŞTIRMA (M. & F. VERİLERİ) ── */}
      {activeMainTab === 'tco' && (
        <div style={{ maxWidth: '1080px', margin: '0 auto 30px' }}>
          <TcoCompetitorTab
            onDirectWhatsApp={(customMsg) => handleDirectWhatsApp(customMsg)}
            salesRep={SALES_REP}
          />
        </div>
      )}

      {/* ── SEKME 1: ÇOK BASİT TEK EKRANLI KOLAY ARAÇ & KREDİ SEÇİCİ (KARMAŞIK SÜRGÜ YOK, ADIM DUVARI YOK) ── */}
      {activeMainTab === 'secici' && (() => {
        const ALL_SIMPLE_GROUPS = [
          {
            id: 'kamyonet',
            groupCode: 'daily35_chassis',
            title: '3.5 Ton Kamyonet',
            subtitle: 'B Ehliyet • Kasa Konulur',
            desc: 'Şehir içi serbest girer, otomobil ehliyetiyle kullanılır (1.5 - 3.5 Ton yük)',
            image: '/vehicles/daily-35s-sasi.jpg',
            defaultKey: 'chassis_35c',
            options: [
              { key: 'chassis_35c', label: '🛞 Çift Teker (Ağır Yük • 35C16)', sub: '2.065.000 TL’den' },
              { key: 'chassis_35s', label: '🛞 Tek Teker (Hafif Yük • 35S16)', sub: '1.905.000 TL’den' }
            ]
          },
          {
            id: 'panelvan',
            groupCode: 'daily35_van',
            title: 'Kapalı Panelvan',
            subtitle: 'B Ehliyet • Hazır Sac Kasa',
            desc: 'Kargo, market, gıda ve koli dağıtımı için hazır kapalı sac gövde',
            image: '/vehicles/daily-panelvan.jpg',
            defaultKey: 'panelvan_16',
            options: [
              { key: 'panelvan_12', label: '🚐 Orta Boy (12 m³ • Tek Teker)', sub: '1.925.000 TL Peşin' },
              { key: 'panelvan_16', label: '🚐 Uzun Boy (16 m³ • Tek Teker)', sub: '2.050.000 TL Peşin' },
              { key: 'panelvan_18', label: '🚐 En Büyük Boy (18 m³ • Çift Teker)', sub: '2.320.000 TL Peşin' }
            ]
          },
          {
            id: 'daily70',
            groupCode: 'daily70',
            title: '7 Ton Kamyon (70C)',
            subtitle: 'C Ehliyet • 4.8 Ton Net Yük',
            desc: 'Resmi kantardan 7.970 kg ile geçer, 6.20 metreye kadar uzun kasa olur',
            image: '/vehicles/daily-35c-72c.jpg',
            defaultKey: 'truck_72c',
            options: [
              { key: 'truck_72c', label: '🚛 Daily 70C / 72C Şasi Kamyon (4.8 Ton Yük)', sub: '2.390.000 TL Peşin' }
            ]
          },
          {
            id: 'eurocargo',
            groupCode: 'eurocargo',
            title: 'Eurocargo',
            subtitle: 'C Ehliyet • 10–18 Ton • 14–20 Palet',
            desc: '6.5 Tondan 16 Tona kadar ağır yük taşıyan 6 teker ve 10 teker Eurocargo kamyonlar',
            image: '/vehicles/eurocargo-100-120.jpg',
            defaultKey: 'truck_150e',
            options: [
              { key: 'truck_100e', label: '🚚 6.5 Ton Yük (Eurocargo 100E)', sub: '3.330.000 TL Peşin' },
              { key: 'truck_120e', label: '🚚 8 Ton Yük (Eurocargo 120E)', sub: '3.820.000 TL Peşin' },
              { key: 'truck_150e', label: '🚚 10.5 Ton Yük (Eurocargo 150E)', sub: '4.450.000 TL Peşin' },
              { key: 'truck_160e', label: '🚚 11 Ton Yük (Eurocargo 160E)', sub: '5.100.000 TL Peşin' },
              { key: 'truck_10teker', label: '🚚 16 Ton Yük (10 Teker Eurocargo)', sub: '5.350.000 TL Peşin' }
            ]
          },
          {
            id: 'cekici',
            groupCode: 'sway',
            title: 'Tır Çekici (S-Way)',
            subtitle: 'CE Ehliyet • Uzun Yol Tır',
            desc: '40 Ton dorse çekici • Yurtiçi ve uluslararası nakliye filoları (500 / 530 / 580 BG)',
            image: '/vehicles/sway-cekici.jpg?v=2',
            defaultKey: 'tractor_sway',
            options: [
              { key: 'tractor_sway', label: '🛣️ S-Way 500 / 530 / 580 Çekici', sub: '123.000 €’dan' }
            ]
          },
          {
            id: 'hafriyat',
            groupCode: 'tway',
            title: 'Mikser & Hafriyat (T-Way)',
            subtitle: '12 Teker & 10 Teker Şantiye',
            desc: '12 Teker Beton Mikseri (5.750.000 TL Nakit) ve 12 Teker Hafriyat Damperi (5.850.000 TL Nakit)',
            image: '/vehicles/tway-damper.jpg',
            defaultKey: 'tway_12teker_460',
            options: [
              { key: 'tway_12teker_460', label: '🔄 12 Teker Beton Mikseri 460 BG (8x4)', sub: '5.750.000 TL Nakit / 6.075.000 TL Liste' },
              { key: 'tway_12teker_540', label: '🚜 12 Teker Ağır Hafriyat 540 BG (8x4)', sub: '5.850.000 TL Nakit / 6.175.000 TL Liste' },
              { key: 'tway_10teker_540', label: '🚜 10 Teker Hafriyat 540 BG (6x4)', sub: '26 Ton Kantar (Özel Proje)' },
              { key: 'tway_10teker_460', label: '🚜 10 Teker Hafriyat 460 BG (6x4)', sub: '26 Ton Kantar (Özel Proje)' }
            ]
          }
        ];

        const SIMPLE_GROUPS = allowedGroups.length > 0
          ? ALL_SIMPLE_GROUPS.filter(g => allowedGroups.includes(g.groupCode))
          : ALL_SIMPLE_GROUPS;

        const activeGroup = SIMPLE_GROUPS.find(g => g.options.some(o => o.key === matched.modelKey)) || SIMPLE_GROUPS[0] || ALL_SIMPLE_GROUPS[0];

        return (
          <div style={{
            maxWidth: '760px',
            margin: '0 auto 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* ── ADIM 1: 6 BÜYÜK RESİMLİ HALK DİLİNDE ARAÇ GRUBU KUTUSU ── */}
            <div style={{
              background: 'rgba(26, 44, 74, 0.92)',
              border: '1.5px solid rgba(56, 189, 248, 0.38)',
              borderRadius: '16px',
              padding: isMobileView ? '12px' : '18px',
              boxShadow: '0 8px 28px rgba(8, 15, 30, 0.35)'
            }}>
              <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                <div style={{ fontSize: isMobileView ? '1rem' : '1.12rem', fontWeight: 900, color: '#ffffff' }}>
                  👇 1. Hangi Tip Araç Bakıyorsunuz? (Üzerine Dokunun)
                </div>
                <div style={{ fontSize: '0.76rem', color: '#bae6fd', marginTop: '2px' }}>
                  Karmaşık ayarlarla uğraşmayın; sadece baktığınız araç tipine dokunun, fiyatı ve kredi taksiti hemen aşağıda açılsın:
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobileView ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
                gap: isMobileView ? '8px' : '10px'
              }}>
                {SIMPLE_GROUPS.map(group => {
                  const isGroupSelected = activeGroup.id === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        handleSelectVehicle(group.defaultKey);
                        recordCustomerFootprint('Kolay Araç Seçici Grubu Seçildi', group.title, group.subtitle);
                      }}
                      style={{
                        minWidth: 0,
                        background: isGroupSelected
                          ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)'
                          : 'rgba(15, 23, 42, 0.85)',
                        border: isGroupSelected ? '2.5px solid #4ade80' : '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '14px',
                        padding: isMobileView ? '8px' : '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '5px',
                        boxShadow: isGroupSelected ? '0 6px 18px rgba(16, 185, 129, 0.32)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: isMobileView ? '52px' : '58px',
                        background: '#ffffff',
                        borderRadius: '10px',
                        padding: '3px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxSizing: 'border-box'
                      }}>
                        <img
                          src={group.image}
                          alt={group.title}
                          loading="lazy"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                        />
                      </div>

                      <div style={{ width: '100%' }}>
                        <div style={{
                          fontSize: isMobileView ? '0.82rem' : '0.88rem',
                          fontWeight: 900,
                          color: '#ffffff',
                          lineHeight: 1.2
                        }}>
                          {group.title}
                        </div>
                        <div style={{
                          fontSize: isMobileView ? '0.67rem' : '0.7rem',
                          fontWeight: 800,
                          color: isGroupSelected ? '#bbf7d0' : '#38bdf8',
                          marginTop: '2px'
                        }}>
                          {group.subtitle}
                        </div>
                      </div>

                      {isGroupSelected && (
                        <span style={{
                          background: '#22c55e',
                          color: '#020617',
                          fontSize: '0.64rem',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '999px'
                        }}>
                          ✓ SEÇİLİ
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Seçilen Grubun Alt Modelleri (Varsa 2-5 Büyük Kolay Buton) */}
              {activeGroup.options.length > 1 && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px dashed rgba(56, 189, 248, 0.35)',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#fde047', marginBottom: '7px' }}>
                    👉 {activeGroup.title} İçinden Hangisi Size Uygun?
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobileView ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '7px'
                  }}>
                    {activeGroup.options.map(opt => {
                      const isOptSel = matched.modelKey === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            handleSelectVehicle(opt.key);
                            recordCustomerFootprint('Kolay Araç Seçici Alt Model Seçildi', opt.label, opt.sub);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: isOptSel
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.32) 0%, rgba(15, 23, 42, 0.95) 100%)'
                              : 'rgba(15, 23, 42, 0.8)',
                            border: isOptSel ? '2px solid #22c55e' : '1px solid rgba(148, 163, 184, 0.28)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                            {isOptSel ? '✅ ' : ''}{opt.label}
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            color: isOptSel ? '#4ade80' : '#7dd3fc',
                            whiteSpace: 'nowrap'
                          }}>
                            {opt.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── ADIM 2 (AYNI EKRANDA): SEÇİLEN ARACIN NET FİYATI, KREDİSİ VE TEK TUŞLA WHATSAPP / ARAMA ── */}
            <div
              id="simple-selected-vehicle-result"
              style={{
                background: 'rgba(26, 44, 74, 0.92)',
                border: '2px solid rgba(56, 189, 248, 0.45)',
                borderRadius: '16px',
                padding: isMobileView ? '14px 12px' : '20px',
                boxShadow: '0 8px 32px rgba(8, 15, 30, 0.35)'
              }}
            >
              {/* Seçilen Araç Özet Kartı */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 75, 147, 0.4) 0%, rgba(16, 185, 129, 0.15) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '14px',
                padding: isMobileView ? '14px' : '18px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ background: '#10b981', color: '#0f172a', fontWeight: 900, fontSize: '0.72rem', padding: '3px 9px', borderRadius: '12px' }}>
                    ✓ SEÇTİĞİNİZ ARAÇ ÖZETİ & FİYATI
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800 }}>
                    {matched.badge}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: isMobileView ? '1.12rem' : '1.28rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px' }}>
                      {matched.modelTitle}
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '6px',
                      background: 'rgba(15, 23, 42, 0.72)',
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.64rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>TAŞIMA KAPASİTESİ</span>
                        <strong style={{ fontSize: isMobileView ? '0.82rem' : '0.9rem', color: '#4ade80' }}>~{(matched.payloadKg / 1000).toFixed(1)} Ton Yük</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.64rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>EHLİYET SINIFI</span>
                        <strong style={{ fontSize: isMobileView ? '0.82rem' : '0.9rem', color: '#ffffff' }}>{matched.license.split(' ')[0]} Ehliyet</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.64rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>KASA BOYU</span>
                        <strong style={{ fontSize: isMobileView ? '0.78rem' : '0.86rem', color: '#38bdf8' }}>
                          {matched.dims?.length ? matched.dims.length.split(' (')[0] : matched.wheelbase}
                        </strong>
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const matchedSticker = getVehicleSticker(matched);
                    if (!matchedSticker) return null;
                    return (
                      <div
                        title={matchedSticker.label}
                        style={{
                          flexShrink: 0,
                          width: isMobileView ? '80px' : '94px',
                          height: isMobileView ? '56px' : '64px',
                          background: '#ffffff',
                          borderRadius: '11px',
                          border: '2px solid rgba(56, 189, 248, 0.85)',
                          boxShadow: '0 5px 14px rgba(0, 0, 0, 0.4)',
                          padding: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={matchedSticker.src}
                          alt={matchedSticker.label}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* 🏷️ 2026 RESMİ SATIŞ FİYATI & PEŞİN İNDİRİMİ */}
                {matched.isTway ? (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(180, 83, 9, 0.28) 100%)',
                    border: '1.5px solid rgba(245, 158, 11, 0.5)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fcd34d', textTransform: 'uppercase' }}>
                        🚜 T-WAY ŞANTİYE & HAFRİYAT ÖZEL FİYATLANDIRMA
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#fef08a', marginTop: '3px' }}>
                        Proje & Filo Fiyatı İçin Satış Sorumlusu Can Murat ile Görüşün
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDirectWhatsApp(`Merhaba Can Murat Bey, ${matched.modelTitle || matched.title} T-Way aracı için özel fiyatlandırma ve şasi teslim süresi hakkında bilgi alabilir miyim?`)}
                      style={{
                        background: '#22c55e',
                        color: '#0f172a',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiPhoneCall size={15} /> WhatsApp'tan Fiyat Sor
                    </button>
                  </div>
                ) : matched.currency === 'EUR' ? (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1.5px solid rgba(59, 130, 246, 0.45)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase' }}>
                      🛣️ 2026 S-WAY ÇEKİCİ RESMİ LİSTE FİYATLARI (1 € = {tcmbEurRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL)
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#60a5fa', marginTop: '3px' }}>
                      {matched.displayPrice || '123.000 € – 131.000 €'}{' '}
                      <span style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: 800 }}>
                        ({Math.round(123000 * tcmbEurRate).toLocaleString('tr-TR')} TL – {Math.round(131000 * tcmbEurRate).toLocaleString('tr-TR')} TL)
                      </span>
                    </div>
                  </div>
                ) : matched.campaignPriceText ? (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.85) 100%)',
                    border: '1.5px solid rgba(16, 185, 129, 0.45)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.18)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(16, 185, 129, 0.45)' }}>
                        <span style={{ fontSize: '0.68rem', color: '#6ee7b7', display: 'block', fontWeight: 800 }}>PEŞİN ALIM FİYATI (KDV DAHİL)</span>
                        <strong style={{ fontSize: '1.22rem', color: '#4ade80', fontWeight: 900 }}>{matched.cashPriceText}</strong>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.68rem', color: '#cbd5e1', display: 'block', fontWeight: 700 }}>KAMPANYALI / KREDİLİ FİYAT</span>
                        <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{matched.campaignPriceText}</strong>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 📐 İsteğe Bağlı Teknik Detaylar & PDF */}
                <button
                  type="button"
                  onClick={() => setShowTechDetailsMobile(prev => !prev)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '9px',
                    padding: '8px 12px',
                    color: '#7dd3fc',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <span>📐 Detaylı Kasa Ölçüleri, Kantar & Teknik Broşür (PDF)</span>
                  <span>{showTechDetailsMobile ? 'Gizle ▴' : 'Göster ▾'}</span>
                </button>

                {showTechDetailsMobile && (
                  <div style={{ marginTop: '10px', background: 'rgba(10, 18, 36, 0.85)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginBottom: '8px', lineHeight: 1.45 }}>
                      <strong>⚖️ {matched.kantarTitle}:</strong> {matched.kantarDesc}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.73rem', color: '#cbd5e1', marginBottom: '10px' }}>
                      <span>📦 Kasa Boyu: <strong style={{ color: '#38bdf8' }}>{matched.dims?.length}</strong></span>
                      <span>📏 Kasa Eni: <strong style={{ color: '#38bdf8' }}>{matched.dims?.width}</strong></span>
                      <span>🧱 Palet: <strong style={{ color: '#4ade80' }}>{matched.dims?.pallets}</strong></span>
                    </div>
                    <a
                      href={matched.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none'
                      }}
                    >
                      <FiDownload size={14} /> Resmi Teknik Broşürü İndir (PDF)
                    </a>
                  </div>
                )}
              </div>

              {/* ── KREDİ & TAKSİT SEÇENEKLERİ (SADELEŞTİRİLMİŞ) ── */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.78)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '14px',
                padding: isMobileView ? '12px' : '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f8fafc' }}>
                    💳 2. Bu Aracın Kredi & Taksit Seçenekleri
                  </div>
                  {(!lockedBank || lockedBank.hasEurCampaigns) && (
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(2, 6, 23, 0.7)', padding: '3px', borderRadius: '8px' }}>
                      <button
                        type="button"
                        onClick={() => { setLoanCurrencyMode('TRY'); setShowAllLoansMobile(false); }}
                        style={{
                          background: loanCurrencyMode === 'TRY' ? '#0284c7' : 'transparent',
                          color: loanCurrencyMode === 'TRY' ? '#fff' : '#94a3b8',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        🇹🇷 TL Kredi
                      </button>
                      <button
                        type="button"
                        onClick={() => { setLoanCurrencyMode('EUR'); setShowAllLoansMobile(false); }}
                        style={{
                          background: loanCurrencyMode === 'EUR' ? '#10b981' : 'transparent',
                          color: loanCurrencyMode === 'EUR' ? '#fff' : '#94a3b8',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        💶 Euro Kredisi
                      </button>
                    </div>
                  )}
                </div>

                {loanCurrencyMode === 'EUR' ? (
                  <div>
                    {!lockedBank && (
                      <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                        {visibleFinderEurBanks.map(bank => {
                          const isSelected = activeFinderEurBankId === bank.id;
                          return (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => { setSelectedEurBankId(bank.id); setSelectedEurCampaignId(null); }}
                              style={{
                                background: isSelected ? bank.bg : 'rgba(255,255,255,0.04)',
                                border: `1.5px solid ${isSelected ? bank.color : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '8px',
                                padding: '8px',
                                color: '#fff',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              {bank.icon} {bank.shortName}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(2, 1fr)', gap: '8px' }}>
                      {(showAllLoansMobile ? eurBankPresets : eurBankPresets.slice(0, 4)).map(preset => {
                        const isChosen = activeEurCampaign?.id === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => setSelectedEurCampaignId(preset.id)}
                            style={{
                              background: isChosen ? 'rgba(16, 185, 129, 0.18)' : 'rgba(0,0,0,0.35)',
                              border: `1.5px solid ${isChosen ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                              borderRadius: '10px',
                              padding: '10px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{preset.title}</div>
                              <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700 }}>{preset.rateLabel}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#34d399' }}>€{preset.monthly.toLocaleString('tr-TR')}/Ay</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Banka Seçimi (Sadece tek banka kilidi yoksa gösterilir) */}
                    {!lockedBank && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
                          Çalıştığınız Bankayı Seçin:
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobileView ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
                          gap: '6px'
                        }}>
                          {visibleFinderBanks.map(bank => {
                            const isSelected = activeFinderBankId === bank.id;
                            return (
                              <button
                                key={bank.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBankId(bank.id);
                                  setSelectedCampaignId(null);
                                  setShowAllLoansMobile(false);
                                }}
                                style={{
                                  background: isSelected ? bank.bg : 'rgba(255, 255, 255, 0.04)',
                                  border: `1.5px solid ${isSelected ? bank.color : 'rgba(255, 255, 255, 0.1)'}`,
                                  borderRadius: '8px',
                                  padding: '7px 8px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  color: '#fff',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {bank.icon} {bank.shortName}
                                </span>
                                {isSelected && <span style={{ color: '#4ade80' }}>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Taksit Kartları */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobileView ? '1fr' : 'repeat(2, 1fr)',
                      gap: '8px'
                    }}>
                      {(showAllLoansMobile ? availableCampaigns : availableCampaigns.slice(0, 4)).map(camp => {
                        const isChosen = activeCampaign?.id === camp.id;
                        return (
                          <div
                            key={camp.id}
                            onClick={() => setSelectedCampaignId(camp.id)}
                            style={{
                              background: isChosen ? 'rgba(56, 189, 248, 0.16)' : 'rgba(0, 0, 0, 0.35)',
                              border: `1.5px solid ${isChosen ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                              borderRadius: '10px',
                              padding: '10px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>{camp.title}</div>
                              <div style={{ fontSize: '0.7rem', color: camp.rate === 0 ? '#4ade80' : '#94a3b8', fontWeight: 700, marginTop: '2px' }}>
                                {camp.rateLabel} {camp.gracePeriodMonths ? `• İlk ${camp.gracePeriodMonths} Ay Ödemesiz` : ''}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>Aylık Taksit</div>
                              <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#fbbf24' }}>
                                {camp.monthly.toLocaleString('tr-TR')} TL
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {availableCampaigns.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setShowAllLoansMobile(prev => !prev)}
                        style={{
                          width: '100%',
                          background: 'rgba(56, 189, 248, 0.12)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          marginTop: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        {showAllLoansMobile ? 'Daha Az Vade Göster ▴' : `Diğer Vade & Tutarları Gör (${availableCampaigns.length} Seçenek) ▾`}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── TEK TUŞLA WHATSAPP VEYA TELEFON BIRAKMA ── */}
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px',
                  fontWeight: 900,
                  fontSize: isMobileView ? '0.95rem' : '1.02rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(34, 197, 94, 0.4)',
                  marginBottom: '12px'
                }}
              >
                <FiMessageSquare size={19} /> Bu Araç İçin WhatsApp'tan Hemen Fiyat & Bilgi Al
              </button>

              {!submitted ? (
                <form onSubmit={handleSubmitLead} style={{ background: 'rgba(15, 23, 42, 0.78)', border: '1px solid rgba(56, 189, 248, 0.28)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiPhone size={14} color="#38bdf8" /> Veya Numaranızı Yazın, Sizi Arayıp Anlatalım:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1.2fr 0.9fr auto', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="tel"
                      placeholder="Cep Telefonunuz (05XX XXX XX XX) *"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(formatPhoneInput(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.45)',
                        border: '1.5px solid rgba(56, 189, 248, 0.5)',
                        borderRadius: '9px',
                        padding: '10px 12px',
                        color: '#38bdf8',
                        fontWeight: 800,
                        fontSize: '0.88rem'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Adınız / Firma (İsteğe Bağlı)"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setCustomerCompany(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: '9px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '0.84rem'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '9px',
                        padding: '10px 16px',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {submitting ? 'İletiliyor...' : '📞 Beni Arayın'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center'
                }}>
                  <FiCheckCircle size={28} style={{ color: '#10b981', marginBottom: '4px' }} />
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                    Numaranız Satış Sorumlusu Can Murat'a Ulaştı!
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── SATIŞ SORUMLUSU CAN MURAT VIP TEST SİMÜLASYON RAPOR MODALI ── */}
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
                    Satış Sorumlusu Can Murat Test Önizleme Raporu ({testSimulationResult.timestamp})
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
                    <strong style={{ color: '#e2e8f0' }}>{SALES_REP.name}</strong> • {SALES_REP.dealership} (📞 {SALES_REP.phoneDisplay} • ✉️ {SALES_REP.email})
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              
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
                      <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '6px', fontWeight: 600 }}>
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
                          İşletmenize özel şasi ölçüleri, karayolları kantar analizi ve 2026 güncel %0 faizli kredi planları.
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

      {/* 📸 İSTEĞE BAĞLI: ÖRNEK KASA FOTOĞRAFLARI & EKSTRA HİZMETLER (Varsayılan Kapalı, Sayfayı Uzatmaz) */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setShowBodyworkGallery(prev => !prev)}
            style={{
              width: '100%',
              background: showBodyworkGallery ? 'rgba(2, 132, 199, 0.3)' : 'rgba(15, 28, 50, 0.85)',
              border: showBodyworkGallery ? '1.5px solid #38bdf8' : '1px solid rgba(125, 211, 252, 0.28)',
              borderRadius: '12px',
              padding: '11px 14px',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: isMobileView ? '0.78rem' : '0.84rem',
              fontWeight: 800
            }}
          >
            <span>📸 Şasi Üzeri Yapılmış 24 Örnek Kasa Fotoğrafı</span>
            <span style={{ color: '#38bdf8' }}>{showBodyworkGallery ? 'Gizle ▴' : 'Fotoğrafları Aç ▾'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSmartHub(prev => !prev)}
            style={{
              width: '100%',
              background: showSmartHub ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 28, 50, 0.85)',
              border: showSmartHub ? '1.5px solid #f59e0b' : '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '12px',
              padding: '11px 14px',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: isMobileView ? '0.78rem' : '0.84rem',
              fontWeight: 800
            }}
          >
            <span>🛠️ 4 Resimle Takas & 24 Saat Fiyat Kilitleme</span>
            <span style={{ color: '#fbbf24' }}>{showSmartHub ? 'Gizle ▴' : 'Aç ▾'}</span>
          </button>
        </div>

        {showBodyworkGallery && (
          <div id="bodywork-examples-gallery">
            <BodyworkExamplesGallery
              selectedModelHint={selectedModelKey || matched?.modelTitle || ''}
              selectedBodyHint={selectedBody}
              onInspectExample={(item) =>
                recordCustomerFootprint(
                  `📸 Örnek Üstyapı İnceledi: ${item.title}`,
                  item.seriesLabel,
                  item.bodyTypeLabel
                )
              }
            />
          </div>
        )}

        {showSmartHub && (
          <div id="smart-customer-action-hub">
            <CustomerSmartActionHub
              activeModelTitle={matched?.modelTitle || 'IVECO 2026 Ticari Araç'}
              activePrice={matched?.cashPrice || matched?.campaignPrice || 2150000}
              customerCompany={customerCompany || customerName}
              customerPhone={customerPhone}
              customerCity={customerCity}
              customerId={customerIdParam}
              salesRep={SALES_REP}
              onTrackFootprint={recordCustomerFootprint}
            />
          </div>
        )}
      </div>

      {/* ── FOOTER & YASAL BİLGİLENDİRME ─────────────────────────── */}
      <div style={{
        maxWidth: '740px',
        margin: isMobileView ? '24px auto 76px' : '24px auto 0',
        padding: '14px 18px',
        background: 'rgba(15, 23, 42, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#cbd5e1',
        fontSize: '0.70rem',
        lineHeight: 1.5
      }}>
        <div style={{ color: '#f1f5f9', fontWeight: 800, marginBottom: '4px', fontSize: '0.75rem' }}>
          IVECO ERC Samsun Otomotiv San. ve Tic. A.Ş. • Yetkili Satıcı & Servis
        </div>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.67rem' }}>
          Bu ekrandaki fiyatlar ve kredi hesaplamaları bilgilendirme amaçlıdır. Kesin proforma fatura ve teslimat tarihi için Satış Sorumlusu Can Murat (0544 622 59 31) ile iletişime geçebilirsiniz.
        </p>
      </div>

      {/* ── 📱 MOBİL SABİT HIZLI İLETİŞİM BARI (TEK BAR: ÜST ÜSTE BİNMEZ, NET 2 BUTON) ── */}
      {isMobileView && !showSendModal && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9980,
          background: 'rgba(11, 21, 38, 0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1.5px solid rgba(34, 197, 94, 0.5)',
          boxShadow: '0 -6px 24px rgba(0, 0, 0, 0.65)',
          padding: '6px 10px calc(8px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <div style={{
            fontSize: '0.67rem',
            fontWeight: 800,
            color: '#86efac',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            🔥 Peşin, takaslı veya referanslı alıma özel ekstra bayi iskontosu (son dip fiyat) tanımlıdır
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.45fr',
            gap: '8px',
            alignItems: 'center'
          }}>
            <a
              href={`tel:${SALES_REP.phoneClean}`}
              onClick={() => recordCustomerFootprint('Mobil Alt Bar: Telefonla Ara', matched?.modelTitle, SALES_REP.phoneDisplay)}
              style={{
                background: '#0284c7',
                color: '#fff',
                borderRadius: '10px',
                padding: '10px 8px',
                fontSize: '0.78rem',
                fontWeight: 900,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <FiPhone size={14} /> Hemen Ara
            </a>

            <button
              type="button"
              onClick={() => {
                recordCustomerFootprint('Mobil Alt Bar: Son Dip Fiyat Soruldu', matched?.modelTitle, 'Doğrudan WhatsApp');
                handleDirectWhatsApp(
                  `Merhaba ${SALES_REP.name}, 2026 Fiyat Listesindeki araçlarınızı inceledim. Peşin, kredili veya takaslı alımda bana özel yapabileceğiniz son olur / dip fiyat ve ekstra bayi iskontosu nedir?`
                );
              }}
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 8px',
                fontSize: '0.78rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                boxShadow: '0 3px 10px rgba(34, 197, 94, 0.35)'
              }}
            >
              <FiMessageSquare size={14} /> Son Dip Fiyatı Sor (WA)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
