import React, { useState, useMemo, useEffect } from 'react';
import { IVECO_PRICING_CATALOG, getVehicleSticker } from '../../../data/ivecoPricingCatalog';
import { calculatePartnerVehiclePricing } from '../../../data/partnerProtocols';
import { fetchTcmbEurRate } from '../../../api/client';
import { openWhatsAppChat } from '../../../utils/openExternal';
import { FiTruck, FiSearch, FiFilter, FiCheck, FiMessageSquare, FiExternalLink, FiDollarSign, FiTag, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';

const REQUIRED_TRADEIN_PHOTOS = [
  { id: 'dis_gorunum', label: '1. Dışarıdan Resim', icon: '📸', desc: 'Dıştan genel görünüm' },
  { id: 'ic_gorunum', label: '2. İçeriden Resim', icon: '💺', desc: 'Kabin içi & torpido' },
  { id: 'km_saati', label: '3. KM Kadran Resmi', icon: '⏲️', desc: 'Güncel kilometre saati' },
  { id: 'ruhsat', label: '4. Ruhsat Resmi', icon: '📄', desc: 'Araç ruhsat yaprağı' }
];

const CATEGORIES = [
  {
    id: 'daily35_chassis',
    title: '3.5 Ton Kamyonet',
    licenseBadge: 'B Ehliyet • Açık/Kapalı Kasa',
    label: 'Kamyonet Şasi (B Ehliyet)',
    shortLabel: '3.5T Kamyonet',
    image: '/vehicles/daily-35s-sasi.jpg'
  },
  {
    id: 'daily35_van',
    title: 'Kapalı Panelvan',
    licenseBadge: 'B Ehliyet • Hazır Van',
    label: 'Kapalı Panelvan (B Ehliyet)',
    shortLabel: 'Panelvan',
    image: '/vehicles/daily-panelvan.jpg'
  },
  {
    id: 'daily70',
    title: '7 Ton Kamyon',
    licenseBadge: 'Daily 70C • 4.8 Ton Yük',
    label: '7 Ton Kamyon (Daily 70C)',
    shortLabel: '7 Ton Kamyon',
    image: '/vehicles/daily-35c-72c.jpg'
  },
  {
    id: 'eurocargo',
    title: 'Eurocargo',
    licenseBadge: '10–18 Ton • 14–20 Palet',
    label: 'Eurocargo (10–18 Ton Kamyon)',
    shortLabel: 'Eurocargo',
    image: '/vehicles/eurocargo-100-120.jpg'
  },
  {
    id: 'sway',
    title: 'S-Way Çekici (Tır)',
    licenseBadge: '500–580 BG • Uzun Yol',
    label: 'Tır Çekici (S-Way)',
    shortLabel: 'S-Way Çekici',
    image: '/vehicles/sway-cekici.jpg?v=2'
  },
  {
    id: 'tway',
    title: 'Mikser & Hafriyat',
    licenseBadge: 'T-Way • 12 & 10 Teker',
    label: 'Damper & Mikser (T-Way)',
    shortLabel: 'T-Way Mikser/Damper',
    image: '/vehicles/tway-damper.jpg'
  },
  {
    id: 'all',
    title: 'Tüm Modeller',
    licenseBadge: 'Hepsini Listele',
    label: 'Tüm Araçlar',
    shortLabel: 'Tümü',
    images: ['/vehicles/daily-35s-sasi.jpg', '/vehicles/eurocargo-100-120.jpg', '/vehicles/sway-cekici.jpg?v=2']
  }
];

const FRIENDLY_VEHICLE_TITLES = {
  'daily-35s16-3450-h': {
    title: 'Daily 3.5 Ton Tek Teker — Kısa Şasi (Manuel)',
    subtitle: '3.5 – 3.8 Metre Kasa Uygun • 2.3 Motor (156 BG) • B Ehliyet'
  },
  'daily-35s16-3450-himatic': {
    title: 'Daily 3.5 Ton Tek Teker — Kısa Şasi (Otomatik)',
    subtitle: '3.5 – 3.8 Metre Kasa Uygun • 8 İleri Otomatik • B Ehliyet'
  },
  'daily-35s16-3750-h': {
    title: 'Daily 3.5 Ton Tek Teker — Orta Şasi (Manuel)',
    subtitle: '4.1 – 4.3 Metre Kasa Uygun • 2.3 Motor (156 BG) • B Ehliyet'
  },
  'daily-35s16-3450-dc-himatic': {
    title: 'Daily 3.5 Ton Çift Kabin (6+1 Kişilik - Otomatik)',
    subtitle: 'Ekip + Yük Taşıma (3.0m Kasa) • 8 İleri Otomatik • B Ehliyet'
  },
  'daily-35c16-3450-30': {
    title: 'Daily 3.5 Ton Çift Teker — Kısa Şasi (Manuel)',
    subtitle: '3.5 – 3.8 Metre Kasa • 3.0 Büyük Motor (160 BG) • B Ehliyet'
  },
  'daily-35c16-3450-30-himatic': {
    title: 'Daily 3.5 Ton Çift Teker — Kısa Şasi (Otomatik)',
    subtitle: '3.5 – 3.8 Metre Kasa • 3.0 Büyük Motor • 8 İleri Otomatik'
  },
  'daily-35c16-3750-30': {
    title: 'Daily 3.5 Ton Çift Teker — Orta Şasi (Manuel)',
    subtitle: '4.1 – 4.3 Metre Kasa • 3.0 Büyük Motor (160 BG) • B Ehliyet'
  },
  'daily-35c16-3750-30-himatic': {
    title: 'Daily 3.5 Ton Çift Teker — Orta Şasi (Otomatik)',
    subtitle: '4.1 – 4.3 Metre Kasa • 3.0 Büyük Motor • 8 İleri Otomatik'
  },
  'daily-35c16-4100-30': {
    title: 'Daily 3.5 Ton Çift Teker — Uzun Şasi (Manuel)',
    subtitle: '4.5 – 4.8 Metre Kasa • 3.0 Büyük Motor (160 BG) • B Ehliyet'
  },
  'daily-35c16-4100-30-himatic': {
    title: 'Daily 3.5 Ton Çift Teker — Uzun Şasi (Otomatik)',
    subtitle: '4.5 – 4.8 Metre Kasa • 3.0 Büyük Motor • 8 İleri Otomatik'
  },
  'daily-35s16-van-3520l-h2': {
    title: 'Daily Panelvan — Orta Boy (12 m³ Otomatik)',
    subtitle: '3.54m İç Uzunluk • Tek Teker • 8 İleri Otomatik • B Ehliyet'
  },
  'daily-35s16-van-4100-h2': {
    title: 'Daily Panelvan — Uzun Boy (16 m³ Otomatik)',
    subtitle: '4.68m İç Uzunluk • Tek Teker • 8 İleri Otomatik • B Ehliyet'
  },
  'daily-35c16-van-4100-h2': {
    title: 'Daily Panelvan — Çift Teker Uzun Boy (16 m³ Otomatik)',
    subtitle: '4.68m İç Uzunluk • Çift Teker Ağır Hizmet • 8 İleri Otomatik'
  },
  'daily-35c16-van-4100-h3': {
    title: 'Daily Panelvan — Çift Teker Yüksek Tavan (18 m³ Otomatik)',
    subtitle: 'En Büyük 18 m³ Hacim • Çift Teker • 8 İleri Otomatik • B Ehliyet'
  },
  'daily-70c16-3750-klima': {
    title: 'Daily 7 Ton Kamyon — Kısa Şasi (Manuel)',
    subtitle: '4.1 – 4.3 Metre Kasa • ~4.8 Ton Yük • Klimalı • C Ehliyet'
  },
  'daily-70c16-3750-himatic-klima': {
    title: 'Daily 7 Ton Kamyon — Kısa Şasi (Otomatik)',
    subtitle: '4.1 – 4.3 Metre Kasa • ~4.8 Ton Yük • 8 İleri Otomatik'
  },
  'daily-70c16-4350-klima': {
    title: 'Daily 7 Ton Kamyon — Orta Şasi (Manuel)',
    subtitle: '5.1 – 5.3 Metre Kasa (10 Palet) • ~4.8 Ton Yük • Klimalı'
  },
  'daily-70c16-4350-himatic-klima': {
    title: 'Daily 7 Ton Kamyon — Orta Şasi (Otomatik)',
    subtitle: '5.1 – 5.3 Metre Kasa (10 Palet) • 8 İleri Otomatik • Klimalı'
  },
  'daily-70c16-4750-klima': {
    title: 'Daily 7 Ton Kamyon — Uzun Şasi (Manuel)',
    subtitle: '5.6 – 5.9 Metre Kasa (12 Palet) • ~4.7 Ton Yük • Klimalı'
  },
  'daily-70c16-4750-himatic-klima': {
    title: 'Daily 7 Ton Kamyon — Uzun Şasi (Otomatik)',
    subtitle: '5.6 – 5.9 Metre Kasa (12 Palet) • 8 İleri Otomatik • Klimalı'
  },
  'daily-70c18-van-4100-klima': {
    title: 'Daily 7 Ton Dev Panelvan (19.6 m³ Manuel)',
    subtitle: '5.12m İç Uzunluk • 180 BG Büyük Motor • Çift Teker • Klimalı'
  },
  'daily-70c18-van-a8-4100-klima': {
    title: 'Daily 7 Ton Dev Panelvan (19.6 m³ Otomatik)',
    subtitle: '5.12m İç Uzunluk • 180 BG • 8 İleri Otomatik • Klimalı'
  },
  'eurocargo-mlc-100e19-3690': {
    title: 'Eurocargo 10 Ton Kamyon (190 BG)',
    subtitle: '5.4 – 5.75 Metre Kasa • ~6.5 Ton Net Yük • C Ehliyet'
  },
  'eurocargo-mlc-120el19-4185': {
    title: 'Eurocargo 12 Ton Kamyon (190 BG)',
    subtitle: '6.0 – 6.4 Metre Kasa • ~8 Ton Net Yük • C Ehliyet'
  },
  'eurocargo-mlc-150e21-4185': {
    title: 'Eurocargo 15 Ton Kamyon (210 BG)',
    subtitle: '6.2 – 6.6 Metre Kasa • ~10 Ton Net Yük • C Ehliyet'
  },
  'eurocargo-mll-150e22-5175': {
    title: 'Eurocargo 15 Ton Yataklı Kabin Kamyon (220 BG)',
    subtitle: '7.1 – 7.5 Metre Kasa (16–18 Palet) • Uzun Yol Yataklı Kabin'
  },
  'eurocargo-mll-160e32-5175': {
    title: 'Eurocargo 16 Ton Körüklü Kamyon (320 BG)',
    subtitle: '7.5 – 8.2 Metre Kasa (18–20 Palet) • Hava Süspansiyonlu'
  },
  'sway-500-full-plus': {
    title: 'S-Way 500 BG Çekici (Full Plus Tır)',
    subtitle: '4x2 Uzun Yol Çekici • 12 İleri Otomatik • Retarderli'
  },
  'sway-580-full-plus': {
    title: 'S-Way 580 BG Çekici (Full Plus Tır)',
    subtitle: '4x2 Ağır Tonaj / Rampacı 580 BG • 12 İleri Otomatik'
  },
  'sway-580-diamond': {
    title: 'S-Way 580 BG Diamond Özel Seri Çekici',
    subtitle: '4x2 En Üst Donanım Paketi • 580 BG Cursor 13 • Otomatik'
  },
  'tway-ad410t46-8x4': {
    title: 'T-Way 12 Teker (8x4) Beton Mikseri Şasisi (460 BG)',
    subtitle: '10–12 m³ Beton Mikseri Uygun • 32 Ton Kantar • Otomatik'
  },
  'tway-ad410t54-8x4': {
    title: 'T-Way 12 Teker (8x4) Ağır Hafriyat & Kaya Damperi (540 BG)',
    subtitle: '22–24 m³ Kaya Damperi Uygun • 540 BG • 32 Ton Kantar'
  },
  'tway-ad380t54-6x4': {
    title: 'T-Way 10 Teker (6x4) Ağır Şantiye Damperi (540 BG)',
    subtitle: '16–18 m³ Damper Uygun • 540 BG • 26 Ton Kantar'
  },
  'tway-ad380t46-6x4': {
    title: 'T-Way 10 Teker (6x4) Şantiye Damperi (460 BG)',
    subtitle: '16–18 m³ Damper Uygun • 460 BG • 26 Ton Kantar'
  }
};

function getFriendlyVehicleDisplay(vehicle) {
  if (!vehicle) return { title: '', subtitle: '' };
  if (FRIENDLY_VEHICLE_TITLES[vehicle.id]) {
    return FRIENDLY_VEHICLE_TITLES[vehicle.id];
  }
  return {
    title: vehicle.model,
    subtitle: `${vehicle.bodyLength || vehicle.category} • ${vehicle.transmission || 'Manuel'}`
  };
}

const SECTOR_FILTERS = [
  { id: 'all', label: '🏢 Tüm İş Kolları', desc: 'Tüm IVECO ürün gamı' },
  { id: 'gida_frigo', label: '🥩 Gıda & Soğuk Zincir', desc: 'Et, süt, dondurma, sebze-meyve ve market dağıtımına uygun şasi ve panelvanlar' },
  { id: 'kargo_dagitim', label: '📦 Kargo, Dağıtım & Nakliye', desc: 'Şehir içi koli, e-ticaret, mobilya ve evden eve nakliyat araçları' },
  { id: 'insaat_malzeme', label: '🏗️ İnşaat, Nalbur & Sanayi', desc: 'Demir, çimento, kereste, profil ve ağır yük taşımaya uygun çift teker şasiler' },
  { id: 'tarim_yem', label: '🌾 Tarım, Yem & Tonajlı Yük', desc: 'Çeltik, fındık, un, gübre ve yüksek tonajlı bölge nakliyesi araçları' },
  { id: 'oto_kurtarma', label: '🛞 Oto Kurtarma & Yol Yardım', desc: 'Kayar kasa ve vinç uygulamalarına uygun C-profil kamyon şasileri' },
  { id: 'hafriyat_santiye', label: '🚜 Hafriyat & Şantiye', desc: '10 ve 12 teker damper, mikser ve ağır şantiye kamyonları' },
  { id: 'agir_nakliye', label: '🛣️ Uzun Yol & Uluslararası Tır', desc: 'Uluslararası ve şehirlerarası dorse çekici filoları' }
];

function normalizeSectorId(rawSector) {
  if (!rawSector) return 'all';
  const s = String(rawSector).toLowerCase();
  if (SECTOR_FILTERS.some(item => item.id === s)) return s;
  if (s.includes('gıda') || s.includes('gida') || s.includes('frigo') || s.includes('süt') || s.includes('et') || s.includes('market')) return 'gida_frigo';
  if (s.includes('kargo') || s.includes('dağıtım') || s.includes('dagitim') || s.includes('mobilya') || s.includes('nakliyat')) return 'kargo_dagitim';
  if (s.includes('inşaat') || s.includes('insaat') || s.includes('nalbur') || s.includes('kereste') || s.includes('demir') || s.includes('sanayi')) return 'insaat_malzeme';
  if (s.includes('tarım') || s.includes('tarim') || s.includes('yem') || s.includes('un') || s.includes('fındık') || s.includes('çeltik')) return 'tarim_yem';
  if (s.includes('kurtarma') || s.includes('çekici') || s.includes('yol yardım')) return 'oto_kurtarma';
  if (s.includes('hafriyat') || s.includes('şantiye') || s.includes('santiye') || s.includes('maden') || s.includes('beton') || s.includes('damper')) return 'hafriyat_santiye';
  if (s.includes('uluslararası') || s.includes('tır') || s.includes('lojistik')) return 'agir_nakliye';
  return 'all';
}

function getVehicleGroupKey(v) {
  if (!v) return 'all';
  if (v.segment === 'Daily 35' && v.category.includes('Panelvan')) return 'daily35_van';
  if (v.segment === 'Daily 35') return 'daily35_chassis';
  if (v.segment === 'Daily 70 C' || v.segment === 'Daily 70' || v.segment.includes('70') || v.segment.includes('72')) return 'daily70';
  if (v.segment === 'Eurocargo') return 'eurocargo';
  if (v.segment === 'S-Way') return 'sway';
  if (v.segment === 'T-Way') return 'tway';
  return 'all';
}

function resolveDefaultCategory(hasGroupRestriction, allowedGroups, initialSector) {
  if (hasGroupRestriction && allowedGroups.length > 0) {
    return allowedGroups[0];
  }
  const sec = normalizeSectorId(initialSector);
  if (sec === 'hafriyat_santiye') return 'tway';
  if (sec === 'agir_nakliye') return 'sway';
  if (sec === 'tarim_yem') return 'eurocargo';
  if (sec === 'oto_kurtarma') return 'daily70';
  return 'daily35_chassis';
}

export default function PricingCatalogTab({ initialSector = '', allowedGroups = [], partnerProtocol = null, lockedBank = null, onSelectVehicle, onOpenLoanTab, onDirectWhatsApp, onTrackFootprint, salesRep }) {
  const hasGroupRestriction = Array.isArray(allowedGroups) && allowedGroups.length > 0;
  const [selectedCategory, setSelectedCategory] = useState(() =>
    resolveDefaultCategory(hasGroupRestriction, allowedGroups, initialSector)
  );
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyDoubleWheels, setOnlyDoubleWheels] = useState(false);
  // 🛻 3.5 Ton Kamyonet (daily35_chassis) Çoktan Seçmeli 3 Adımlı Seçici State'leri
  const [kamyonetWheelType, setKamyonetWheelType] = useState(null); // 'cift_teker' | 'tek_teker' | 'cift_kabin' | null
  const [kamyonetChassisLen, setKamyonetChassisLen] = useState(null); // '3450' | '3750' | '4100' | null
  const [kamyonetGearType, setKamyonetGearType] = useState(null); // 'manuel' | 'otomatik' | 'both' | null
  const [showAllKamyonetList, setShowAllKamyonetList] = useState(false);
  // 🚛 7 Ton Daily Kamyon (daily70) Çoktan Seçmeli (Kısa / Orta / Uzun Şasi) State'leri
  const [daily70ChassisLen, setDaily70ChassisLen] = useState(null); // '3750' | '4350' | '4750' | 'van' | null
  const [daily70GearType, setDaily70GearType] = useState(null); // 'manuel' | 'otomatik' | 'both' | null
  const [showAllDaily70List, setShowAllDaily70List] = useState(false);
  const [activeInlineCalcId, setActiveInlineCalcId] = useState(null);
  const [showInlinePhotoUpload, setShowInlinePhotoUpload] = useState(false);
  const [showTradeInBox, setShowTradeInBox] = useState(false);
  const [tradeInVehicleText, setTradeInVehicleText] = useState('');
  const [tradeInValue, setTradeInValue] = useState(1000000);
  const [tradeInTerm, setTradeInTerm] = useState(12);
  const [selectedTradeInVehicleId, setSelectedTradeInVehicleId] = useState('daily-35c16-3750-30');
  const [tradeInTargetModel, setTradeInTargetModel] = useState('Daily 35C16 Çift Teker');
  const [tradeInPhotos, setTradeInPhotos] = useState({
    dis_gorunum: null,
    ic_gorunum: null,
    km_saati: null,
    ruhsat: null
  });
  const [showFleetBox, setShowFleetBox] = useState(false);
  const [fleetQuantity, setFleetQuantity] = useState('2 Adet');
  const [fleetTargetModel, setFleetTargetModel] = useState('Daily 35C16 Çift Teker Şasi');
  const [isMobileView, setIsMobileView] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [tcmbEurRate, setTcmbEurRate] = useState(38.50);
  const [showDetailedFilters, setShowDetailedFilters] = useState(false);
  const [showAllCardDetails, setShowAllCardDetails] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState({});
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxModalVehicleId, setTaxModalVehicleId] = useState('daily-35c16-3750-30');
  const [customTaxInvoiceTl, setCustomTaxInvoiceTl] = useState(0);
  const [taxEntityRate, setTaxEntityRate] = useState(0.25); // 0.25 (%25 Kurumlar) | 0.35 (%35 Gelir Vergisi)
  const isExporterUrl = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const loanParam = (params.get('loan') || params.get('kredi') || params.get('currency') || '').toLowerCase();
    const ref = (params.get('ref') || '').toLowerCase();
    return loanParam === 'eur' || loanParam === 'euro' || ref.includes('ihracat') || ref.includes('euro');
  }, []);

  const [inlineCalcCurrency, setInlineCalcCurrency] = useState(() => isExporterUrl ? 'EUR' : 'TRY');
  const [inlineGraceMonths, setInlineGraceMonths] = useState(0); // 0 = Hemen Eşit Taksit | 6 = 6 Ay Ödemesiz (Kuveyt Türk / Albaraka)
  const [eurTradeInValue, setEurTradeInValue] = useState(0);
  const [eurLoanTerm, setEurLoanTerm] = useState(36);
  const [inlineEurGraceMonths, setInlineEurGraceMonths] = useState(0); // 0 = Hemen Eşit Taksit | 6 = 6 Ay Ödemesiz Euro Kredisi
  const [showSmartNudge, setShowSmartNudge] = useState(false);
  const [dismissedSmartNudge, setDismissedSmartNudge] = useState(false);

  const referralBannerInfo = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const ref = (params.get('ref') || '').toLowerCase();
    const loanParam = (params.get('loan') || params.get('kredi') || '').toLowerCase();
    const company = params.get('company') || params.get('firma') || params.get('kisi') || '';

    if (loanParam === 'eur' || loanParam === 'euro' || ref.includes('ihracat') || ref.includes('euro')) {
      return {
        badge: '🇪🇺 İHRACATÇI & DÖVİZ GELİRLİ FİRMALARA ÖZEL EURO (€) KREDİSİ AKTİF',
        title: `${company ? `${company} — ` : ''}Euro (€) Bazlı Ticari Kredi & Özel Filo İskontosu Tanımlandı!`,
        desc: '32 Sayılı Karar kapsamında ihracatçı ve döviz gelirli firmalarımıza özel Kuveyt Türk (%0 Kâr Payı / 6 Ay Ödemesiz), Albaraka Türk, Garanti BBVA ve DenizBank Euro (€) taksitlerini her araç kartındaki "Taksit & Takas Hesapla" tuşuyla Euro bazında hesaplayabilirsiniz.'
      };
    }
    if (ref.includes('kasaci') || ref.includes('karoser') || ref.includes('servis')) {
      return {
        badge: '🎟️ ÜSTYAPICI & KASACI REFERANS İNDİRİMİ AKTİF',
        title: `${company ? `${company} — ` : ''}Şasi + Üstyapı Özel Referans İskontosu Tanımlandı!`,
        desc: 'Ekrandaki standart fiyatlara ek olarak kasacı/üstyapıcı referansına özel "Son Dip Fiyat" hakkınızı her aracın altındaki yeşil tuşla Can Murat’a sorabilirsiniz.'
      };
    }
    if (ref.includes('smmm') || ref.includes('kdv') || ref.includes('muhasebe') || ref.includes('vergi')) {
      return {
        badge: '🎟️ MALİ MÜŞAVİR & VERGİ KALKANI ÖZEL İSKONTOSU AKTİF',
        title: `${company ? `${company} — ` : ''}%20 KDV Mahsubu + Ekstra Bayi İskontosu Tanımlandı!`,
        desc: 'Üstyapıyı beklemeden hemen şasi faturası kesim avantajı ve mükelleflere özel "Son Dip Fiyat" iskontosunu kartlardaki yeşil tuşla isteyebilirsiniz.'
      };
    }
    if (ref.includes('koop') || ref.includes('nakliye') || ref.includes('beton') || ref.includes('gida') || ref.includes('garaj')) {
      return {
        badge: '🎟️ SEKTÖR & KOOPERATİF ÖZEL FİLO İSKONTOSU AKTİF',
        title: `${company ? `${company} — ` : ''}Sektörünüze Özel Ekstra Şasi İndirimi Tanımlandı!`,
        desc: 'Ekrandaki standart liste/kampanya fiyatlarının altındaki "Sektör Özel Son Olur Fiyatı"nı her araç kartındaki yeşil tuşla Can Murat’a sorabilirsiniz.'
      };
    }
    return {
      badge: '🤫 IVECO SAMSUN ÖZEL BAYİ İSKONTOSU & TAKAS DESTEĞİ',
      title: `${company ? `${company} — ` : ''}Liste Fiyatının Altındaki "Özel Dip Fiyatı" Öğrenin!`,
      desc: 'Ekrandaki rakamlar standart kampanya fiyatlarıdır. Peşin, kredili (TL veya İhracatçı Euro Kredisi) veya takaslı alımda size özel ekstra bayi indirimini karttaki yeşil "Son Oluru / Dip Fiyatı Sor" tuşuyla anında öğrenin.'
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSmartNudge(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const visibleCategories = useMemo(() => {
    if (!hasGroupRestriction) return CATEGORIES.filter(c => c.id !== 'all');
    if (allowedGroups.length === 1) {
      return CATEGORIES.filter(c => c.id === allowedGroups[0]);
    }
    return CATEGORIES.filter(c => allowedGroups.includes(c.id));
  }, [hasGroupRestriction, allowedGroups]);

  const toggleCardDetail = (vehicleId) => {
    setExpandedCardIds(prev => ({
      ...prev,
      [vehicleId]: !prev[vehicleId]
    }));
  };

  const handleOpenTaxModal = (vehicle = null) => {
    if (vehicle && !vehicle.isCustomPrice) {
      setTaxModalVehicleId(vehicle.id);
      setCustomTaxInvoiceTl(0);
    }
    setIsTaxModalOpen(true);
    if (onTrackFootprint) {
      onTrackFootprint(
        '🧾 KDV & Kampanya Tablosu Açıldı',
        vehicle?.model || 'Genel 2026 KDV & Kampanya Tablosu',
        'Yıl Sonu %20 KDV & Tam Amortisman Hesaplayıcı'
      );
    }
  };

  const uploadedPhotoCount = REQUIRED_TRADEIN_PHOTOS.filter(p => Boolean(tradeInPhotos[p.id])).length;

  const handleSelectTradeInPhoto = (slotId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTradeInPhotos(prev => ({
        ...prev,
        [slotId]: { name: file.name, dataUrl: ev.target.result }
      }));
      const slotMeta = REQUIRED_TRADEIN_PHOTOS.find(s => s.id === slotId);
      toast.success(`${slotMeta?.label || 'Resim'} eklendi ✓`);
    };
    reader.readAsDataURL(file);
  };

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
    if (hasGroupRestriction) {
      setSelectedSectorFilter('all');
      if (allowedGroups.length > 0 && !allowedGroups.includes(selectedCategory)) {
        setSelectedCategory(allowedGroups[0]);
      }
    }
  }, [hasGroupRestriction, allowedGroups, selectedCategory]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredVehicles = useMemo(() => {
    return IVECO_PRICING_CATALOG.filter(v => {
      // Linkten belirli araç grupları seçildiyse (?groups=sway,tway,daily35_chassis vb.) sadece o grupları göster
      if (hasGroupRestriction) {
        const vGroup = getVehicleGroupKey(v);
        if (!allowedGroups.includes(vGroup)) return false;
      }

      // Sector filter (Madde 1: İşinize Göre Hızlı Araç Filtresi)
      if (!hasGroupRestriction && selectedSectorFilter !== 'all') {
        const isVan = v.category.toLowerCase().includes('panelvan');
        const isDoubleWheel35 = v.segment === 'Daily 35' && !isVan && (v.category.toLowerCase().includes('çift teker') || v.model.toLowerCase().includes('35 c'));
        const isSingleWheel35 = v.segment === 'Daily 35' && !isVan && !isDoubleWheel35;
        const is70C = v.segment.includes('70') || v.segment.includes('72');
        const isEurocargo = v.segment === 'Eurocargo';
        const isSway = v.segment === 'S-Way';
        const isTway = v.segment === 'T-Way';

        if (selectedSectorFilter === 'gida_frigo') {
          if (isTway || isSway) return false;
        } else if (selectedSectorFilter === 'kargo_dagitim') {
          if (isTway || isSway) return false;
        } else if (selectedSectorFilter === 'insaat_malzeme') {
          if (isVan || isSingleWheel35 || isSway) return false;
        } else if (selectedSectorFilter === 'tarim_yem') {
          if (isVan || isSingleWheel35) return false;
        } else if (selectedSectorFilter === 'oto_kurtarma') {
          if (!isDoubleWheel35 && (!is70C || isVan) && !isEurocargo) return false;
        } else if (selectedSectorFilter === 'hafriyat_santiye') {
          if (!isTway && !isEurocargo && (!is70C || isVan) && !isDoubleWheel35) return false;
        } else if (selectedSectorFilter === 'agir_nakliye') {
          if (!isSway && !isEurocargo) return false;
        }
      }

      // Category filter (Arama kutusuna bir şey yazıldığında tüm gruplarda arar!)
      if (!searchQuery.trim()) {
        if (selectedCategory === 'daily35_chassis') {
          if (v.segment !== 'Daily 35' || v.category.includes('Panelvan')) return false;
          // 🛻 Çoktan Seçmeli 3 Adımlı Kamyonet Seçici aktifse (Tümünü Listele açık değilse):
          if (!showAllKamyonetList) {
            if (!kamyonetWheelType) return false;
            const isDoubleCab = v.category.toLowerCase().includes('çift kabin') || v.id.includes('-dc-');
            const isDoubleWheel = !isDoubleCab && (v.category.toLowerCase().includes('çift teker') || v.model.toLowerCase().includes('35 c'));
            const isSingleWheel = !isDoubleCab && !isDoubleWheel;

            if (kamyonetWheelType === 'cift_kabin') {
              return isDoubleCab;
            }
            if (kamyonetWheelType === 'cift_teker' && !isDoubleWheel) return false;
            if (kamyonetWheelType === 'tek_teker' && !isSingleWheel) return false;

            if (!kamyonetChassisLen) return false;
            if (String(v.wheelbase) !== String(kamyonetChassisLen)) return false;

            if (!kamyonetGearType) return false;
            const isAuto = (v.transmission || '').toLowerCase().includes('otomatik') || (v.transmission || '').toLowerCase().includes('hi-matic') || v.id.includes('himatic');
            if (kamyonetGearType === 'manuel' && isAuto) return false;
            if (kamyonetGearType === 'otomatik' && !isAuto) return false;
          }
        } else if (selectedCategory === 'daily35_van') {
          if (v.segment !== 'Daily 35' || !v.category.includes('Panelvan')) return false;
        } else if (selectedCategory === 'daily70') {
          if (v.segment !== 'Daily 70 C' && v.segment !== 'Daily 70' && !v.segment.includes('70') && !v.segment.includes('72')) return false;
          // 🚛 Çoktan Seçmeli Daily 7 Ton Kamyon (Kısa / Orta / Uzun Şasi) Seçici aktifse:
          if (!showAllDaily70List) {
            if (!daily70ChassisLen) return false;
            const is70Van = v.category.toLowerCase().includes('panelvan') || v.id.includes('-van-');
            if (daily70ChassisLen === 'van') {
              if (!is70Van) return false;
            } else {
              if (is70Van) return false;
              if (String(v.wheelbase) !== String(daily70ChassisLen)) return false;
            }

            if (!daily70GearType) return false;
            const isAuto70 = (v.transmission || '').toLowerCase().includes('otomatik') || (v.transmission || '').toLowerCase().includes('hi-matic') || v.id.includes('himatic') || v.id.includes('-a8-');
            if (daily70GearType === 'manuel' && isAuto70) return false;
            if (daily70GearType === 'otomatik' && !isAuto70) return false;
          }
        } else if (selectedCategory === 'eurocargo') {
          if (v.segment !== 'Eurocargo') return false;
        } else if (selectedCategory === 'sway') {
          if (v.segment !== 'S-Way') return false;
        } else if (selectedCategory === 'tway') {
          if (v.segment !== 'T-Way') return false;
        }
      }

      // Double wheel filter
      if (onlyDoubleWheels) {
        if (v.segment === 'Daily 35' && !v.category.toLowerCase().includes('çift teker') && !v.model.toLowerCase().includes(' 35 c')) {
          return false;
        }
      }

      // Search query (Hem halk dili başlığında hem fabrika kodunda arar)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const friendly = getFriendlyVehicleDisplay(v);
        const matchFriendlyTitle = (friendly.title || '').toLowerCase().includes(q);
        const matchFriendlySub = (friendly.subtitle || '').toLowerCase().includes(q);
        const matchModel = v.model.toLowerCase().includes(q);
        const matchCat = v.category.toLowerCase().includes(q);
        const matchEngine = (v.engine || '').toLowerCase().includes(q);
        const matchPower = (v.power || '').toLowerCase().includes(q);
        const matchTrans = (v.transmission || '').toLowerCase().includes(q);
        if (!matchFriendlyTitle && !matchFriendlySub && !matchModel && !matchCat && !matchEngine && !matchPower && !matchTrans) return false;
      }

      return true;
    });
  }, [hasGroupRestriction, allowedGroups, selectedSectorFilter, selectedCategory, searchQuery, onlyDoubleWheels, showAllKamyonetList, kamyonetWheelType, kamyonetChassisLen, kamyonetGearType, showAllDaily70List, daily70ChassisLen, daily70GearType]);

  const tradeInCatalogModels = useMemo(() => {
    return IVECO_PRICING_CATALOG.filter(v => !v.isCustomPrice && (v.campaignPrice || v.cashPrice || v.eurPrice));
  }, []);

  const selectedTradeVehicle = useMemo(() => {
    return tradeInCatalogModels.find(v => v.id === selectedTradeInVehicleId) || tradeInCatalogModels[0] || {
      id: 'daily-35c16-3750',
      model: 'IVECO Daily 35C16 3750 Şasi',
      campaignPrice: 1930000,
      cashPrice: 1850000
    };
  }, [tradeInCatalogModels, selectedTradeInVehicleId]);

  const tradeInCalc = useMemo(() => {
    const isEur = selectedTradeVehicle?.currency === 'EUR';
    const partnerPricing = partnerProtocol
      ? calculatePartnerVehiclePricing(selectedTradeVehicle, partnerProtocol, tcmbEurRate)
      : null;

    const vehiclePrice = partnerPricing
      ? (partnerPricing.isEur ? partnerPricing.finalTl : partnerPricing.finalCampaign)
      : isEur
        ? Math.round((selectedTradeVehicle?.eurPrice || selectedTradeVehicle?.cashPrice || 123000) * tcmbEurRate)
        : (selectedTradeVehicle?.campaignPrice || selectedTradeVehicle?.cashPrice || 1930000);
    const safeTradeVal = Math.max(0, Number(tradeInValue) || 0);
    const remainingPrincipal = Math.max(0, vehiclePrice - safeTradeVal);
    const term = Number(tradeInTerm) || 24;
    const isHeavy = selectedTradeVehicle?.segment === 'S-Way' || selectedTradeVehicle?.segment === 'T-Way';
    const zeroCap = isHeavy ? 2000000 : 1200000;

    let monthlyPayment = 0;
    let isZeroInterest = false;
    let appliedRatePct = 0;
    let rateExplain = '';

    if (remainingPrincipal === 0) {
      monthlyPayment = 0;
    } else if (inlineGraceMonths === 6) {
      // ⏳ 6 Ay Ödemesiz + Eşit Taksit (Kuveyt Türk & Albaraka Kasım 2026 Resmi Oranları: İlk 6 ay 0 TL, sonra taksit)
      appliedRatePct = remainingPrincipal <= 1000000 ? 2.15 : remainingPrincipal <= 1500000 ? 2.24 : 2.67;
      const r = appliedRatePct / 100;
      const graceCompounded = remainingPrincipal * Math.pow(1 + r * 0.45, 2); // 6 ay erteleme kâr payı farkı (resmi tabloyla birebir uyumlu: 1M 24 ay -> ~61.825 TL)
      const factor = Math.pow(1 + r, term);
      monthlyPayment = Math.round((graceCompounded * r * factor) / (factor - 1));
      rateExplain = `İlk 6 Ay 0 TL Ödeme • 7. Aydan İtibaren %${appliedRatePct.toFixed(2)} Oranla ${term} Taksit`;
    } else if (!isEur && remainingPrincipal <= zeroCap && (term === 6 || term === 9 || term === 12)) {
      monthlyPayment = Math.round(remainingPrincipal / term);
      isZeroInterest = true;
      appliedRatePct = 0;
      rateExplain = '%0 Faiz / Kâr Payı (IVECO Sübvansiyonlu Resmi Kampanya)';
    } else {
      // IVECO Kasım 2026 Resmi Banka Tablosu Kademeli Sübvansiyon Oranları (Kuveyt Türk / Albaraka / Garanti / TEB)
      if (term <= 12) {
        appliedRatePct = remainingPrincipal <= 1000000 ? 0.75 : remainingPrincipal <= 1500000 ? 1.18 : 1.74;
      } else if (term <= 24) {
        appliedRatePct = remainingPrincipal <= 1000000 ? 1.30 : remainingPrincipal <= 1500000 ? 1.94 : remainingPrincipal <= 2000000 ? 2.24 : 2.54;
      } else if (term <= 36) {
        appliedRatePct = remainingPrincipal <= 2000000 ? 2.67 : 2.73;
      } else {
        appliedRatePct = 2.89;
      }
      const r = appliedRatePct / 100;
      const factor = Math.pow(1 + r, term);
      monthlyPayment = Math.round((remainingPrincipal * r * factor) / (factor - 1));
      rateExplain = `%${appliedRatePct.toFixed(2)} IVECO Sübvansiyonlu Banka Oranı`;
    }

    return {
      vehiclePrice,
      safeTradeVal,
      remainingPrincipal,
      term,
      monthlyPayment,
      isZeroInterest,
      appliedRatePct,
      rateExplain,
      graceMonths: inlineGraceMonths
    };
  }, [selectedTradeVehicle, tradeInValue, tradeInTerm, inlineGraceMonths, tcmbEurRate, partnerProtocol]);

  const handleVehicleQuote = (vehicle) => {
    const partnerPricing = partnerProtocol
      ? calculatePartnerVehiclePricing(vehicle, partnerProtocol, tcmbEurRate)
      : null;
    const friendlyInfo = getFriendlyVehicleDisplay(vehicle);
    if (onTrackFootprint) {
      onTrackFootprint(
        partnerProtocol ? `${partnerProtocol.shortName} Üye Son Fiyat İsteği` : '🔥 Son Oluru / Dip Fiyatı Sor Tıklandı',
        `${friendlyInfo.title} (${vehicle.model})`,
        partnerPricing
          ? `${(partnerPricing.finalCash || partnerPricing.finalEur || 0).toLocaleString('tr-TR')} ${vehicle.currency || 'TL'} (${partnerProtocol.shortName} İndirimli)`
          : `${(vehicle.cashPrice || vehicle.campaignPrice || 0).toLocaleString('tr-TR')} ${vehicle.currency || 'TL'}`
      );
    }
    if (onDirectWhatsApp) {
      const protocolPrefix = partnerProtocol
        ? ` [🏛️ *${partnerProtocol.fullName}* — ${partnerProtocol.discountLabel}]`
        : lockedBank
          ? ` [🏦 *${lockedBank.name}* Özel Finansman]`
          : '';
      if (vehicle.isCustomPrice) {
        const msg = `Merhaba ${salesRep?.name || 'Satış Sorumlusu Can Murat'}, 2026 Fiyat Listesindeki *${friendlyInfo.title}* (${vehicle.model})${protocolPrefix} için şantiye/proje ihtiyacımıza özel yapabileceğiniz son dip fiyat ve teslimat bilgisi nedir?`;
        onDirectWhatsApp(msg);
        return;
      }
      const eurVal = partnerPricing?.isEur ? partnerPricing.finalEur : (vehicle.eurPrice || vehicle.cashPrice || 0);
      const tryEq = Math.round(eurVal * tcmbEurRate);
      const priceText = vehicle.currency === 'EUR'
        ? `€${eurVal.toLocaleString('tr-TR')} (${tryEq.toLocaleString('tr-TR')} TL) + KDV`
        : partnerPricing
          ? `${partnerPricing.finalCash.toLocaleString('tr-TR')} TL (${partnerProtocol.shortName} Üye Fiyatı)`
          : (vehicle.cashDiscount > 0
              ? `${vehicle.cashPrice.toLocaleString('tr-TR')} TL Nakit / ${vehicle.campaignPrice.toLocaleString('tr-TR')} TL Liste`
              : `${(vehicle.campaignPrice || vehicle.cashPrice).toLocaleString('tr-TR')} TL Liste`);
      const msg = `Merhaba ${salesRep?.name || 'Satış Sorumlusu Can Murat'}, 2026 Fiyat Listesindeki *${friendlyInfo.title}* (${vehicle.model} — ${priceText})${protocolPrefix} aracınızı inceledim. Bu araçta peşin, kredili veya takaslı alımda bana özel yapabileceğiniz son olur / dip fiyat ve ekstra bayi iskontosu nedir?`;
      onDirectWhatsApp(msg);
    }
  };

  const getCompactProfileBadge = (vehicle) => {
    const cat = (vehicle.category || '').toLowerCase();
    const seg = (vehicle.segment || '').toLowerCase();
    if (cat.includes('panelvan')) {
      return '🪪 B Ehliyet • 🚫 Takograf Muafiyetli • 📦 Hazır Sac Kargo Gövde';
    }
    if (seg === 'daily 35' && (cat.includes('çift teker') || vehicle.model.toLowerCase().includes('35 c'))) {
      return '🪪 B Ehliyet • 🛞 Çift Teker C-Şasi • 🏗️ Frigo / Tente / Sac / Kurtarıcı';
    }
    if (seg === 'daily 35') {
      return '🪪 B Ehliyet • 🚫 Takograf Muafiyetli • 🏗️ Kutu / Tente / Frigo Kasa';
    }
    if (seg.includes('70') || seg.includes('72')) {
      return '⚖️ 4.8 Ton Net Yük • 📦 10–12 Euro Palet • 🏗️ Frigo / Kayar Kasa / Sac';
    }
    if (seg === 'eurocargo') {
      return '⚖️ 6.5–16 Ton Net Yük • 📦 14–20 Palet • 🏗️ Frigo / Tente / Damper';
    }
    if (seg === 's-way') {
      return '🛣️ 40 Ton Katar • 💶 İhracatçı Euro & TL Kredi • ⛽ Yakıt Tasarruflu';
    }
    if (seg === 't-way') {
      return '🚜 10mm Ağır Şasi • ⚖️ 26T (6x4) & 32T (8x4) Kantar • 🏗️ Damper & Mikser';
    }
    return `🚛 Resmi Kantar Uyumlu • 🏦 ${lockedBank ? `${lockedBank.name} Özel` : 'Anlaşmalı Banka & Katılım'} Finansmanı`;
  };

  const handleShareWithPartner = (vehicle, effectiveTlPrice, vatShieldTl, remainingAfterTradeIn, monthlyPaymentEst) => {
    const netMatrah = effectiveTlPrice > 0 ? Math.round(effectiveTlPrice - vatShieldTl) : 0;
    const firstYearAmortisman = netMatrah > 0 ? Math.round(netMatrah * 0.20) : 0;
    const corpTaxShield = firstYearAmortisman > 0 ? Math.round(firstYearAmortisman * 0.25) : 0;
    if (onTrackFootprint) {
      onTrackFootprint(
        '📤 KDV & Kampanya Tablosu Mali Müşavire / Ortağa İletildi',
        vehicle.model,
        `KDV Avantajı: ${vatShieldTl.toLocaleString('tr-TR')} TL | 1.Yıl Amortisman: ${firstYearAmortisman.toLocaleString('tr-TR')} TL`
      );
    }
    const bankQuery = lockedBank ? `&bank=${lockedBank.id}` : '';
    const shareUrl = `https://iveco-crm.onrender.com/fiyat-listesi?ref=wa_muhasebe_paylasim${bankQuery}`;
    const priceLine = vehicle.isCustomPrice
      ? `💰 *Fiyat:* Özel Şantiye / Proje Teklifi`
      : vehicle.currency === 'EUR'
        ? `💰 *Net Fiyat:* €${(vehicle.eurPrice || vehicle.cashPrice || 0).toLocaleString('tr-TR')} (+%20 KDV)`
        : `💰 *Fatura Toplamı (KDV Dahil):* ${effectiveTlPrice.toLocaleString('tr-TR')} TL\n📐 *KDV Hariç Net Matrah:* ~${netMatrah.toLocaleString('tr-TR')} TL`;
    const vatLine = vatShieldTl > 0
      ? `\n🧾 *İndirilecek %20 KDV (Tek Seferde Mahsup):* ~${vatShieldTl.toLocaleString('tr-TR')} TL\n📉 *1. Yıl Tam Amortisman Gideri (%20 - Ticari Şaside Kıst Amortisman Yok):* ~${firstYearAmortisman.toLocaleString('tr-TR')} TL (~${corpTaxShield.toLocaleString('tr-TR')} TL Kurumlar Vergisi Avantajı)\n⚡ *Yıl Sonu Fatura Notu:* Üstyapının (kasa/frigo/tente) tamamlanmasını beklemeden *ŞASİ faturası hemen kesilip* 2026 KDV ve amortisman hakkı kullanılabilir.`
      : '';
    const bankPrefix = lockedBank ? `${lockedBank.name} • ` : '';
    const loanLine = (!vehicle.isCustomPrice && vehicle.currency !== 'EUR' && remainingAfterTradeIn > 0)
      ? `\n💳 *Kampanya Özeti:* ${bankPrefix}1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay) | ${Number(tradeInValue || 0).toLocaleString('tr-TR')} TL Peşinat/Takas Sonrası Kalan: ${remainingAfterTradeIn.toLocaleString('tr-TR')} TL (~${monthlyPaymentEst.toLocaleString('tr-TR')} TL/Ay)`
      : `\n💳 *Kampanya Özeti:* ${bankPrefix}1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay) veya 6 Ay Ödemesiz Ticari Kredi`;

    const text =
      `📋 *2026 IVECO Yıl Sonu KDV, Amortisman & Kampanya Tablosu (Mali Müşavir / Muhasebe Özeti)*\n` +
      `🚛 *Model:* ${vehicle.model} (${vehicle.category})\n` +
      `${priceLine}${vatLine}${loanLine}\n` +
      `👤 *Yetkili:* Satış Sorumlusu Can Murat — 0544 622 59 31 (IVECO ERC Samsun Otomotiv)\n\n` +
      `👇 Tüm modellerin KDV tablosu, kredi ve kantar detaylarını buradan inceleyebilirsin:\n\n` +
      `${shareUrl}`;

    const waShareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waShareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVehicleTradeIn = (vehicle) => {
    if (onTrackFootprint) {
      onTrackFootprint('Takas + Kredi Hesaplama Açıldı', vehicle.model, `Takas Peşinat Hesaplayıcı`);
    }
    if (!vehicle.isCustomPrice) {
      setSelectedTradeInVehicleId(vehicle.id);
      setTradeInTargetModel(vehicle.model);
      setShowTradeInBox(true);
      setShowFleetBox(false);
      setTimeout(() => {
        const el = document.getElementById('tradein-loan-calc-box');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
      return;
    }
    if (onDirectWhatsApp) {
      const msg =
        `Merhaba ${salesRep?.name || 'Can Bey'}, mevcut ticari aracımı takasa vererek sıfır *${vehicle.model}* almak istiyorum.\n\n` +
        `📸 *Takas Ön Ekspertiz İçin Gerekli 4 Resim:*\n` +
        `1️⃣ Dışarıdan Görünüm Resmi (1 Adet)\n` +
        `2️⃣ İçeriden Kabin Resmi (1 Adet)\n` +
        `3️⃣ Kilometre (KM) Kadran Resmi (1 Adet)\n` +
        `4️⃣ Araç Ruhsat Resmi (1 Adet)\n\n` +
        `Takas ekspertiz ve ödeme planı için görüşebilir miyiz?`;
      onDirectWhatsApp(msg);
    }
  };

  const handleGeneralTradeInSubmit = () => {
    const missing = REQUIRED_TRADEIN_PHOTOS.filter(p => !tradeInPhotos[p.id]);
    if (missing.length > 0) {
      toast.error(
        `Takasla fiyat almak için 4 resim gereklidir: 1 Dışarıdan, 1 İçeriden, KM ve Ruhsat resmi. (Eksik: ${missing.map(m => m.label).join(', ')})`,
        { duration: 4000 }
      );
      return;
    }
    const modelName = selectedTradeVehicle?.model || tradeInTargetModel;
    if (onTrackFootprint) {
      onTrackFootprint(
        'Takas + Kredi Teklif Talebi (4 Resimli)',
        modelName,
        `Takas: ${tradeInCalc.safeTradeVal.toLocaleString('tr-TR')} TL | Kalan Kredi: ${tradeInCalc.remainingPrincipal.toLocaleString('tr-TR')} TL (${tradeInCalc.term} Ay x ${tradeInCalc.monthlyPayment.toLocaleString('tr-TR')} TL) | 4/4 Resim Hazır`
      );
    }
    if (onDirectWhatsApp) {
      const currentCar = tradeInVehicleText.trim() ? `*${tradeInVehicleText.trim()}*` : 'mevcut ticari aracımı';
      const msg =
        `Merhaba ${salesRep?.name || 'Can Bey'}, elimdeki ${currentCar} (Tahmini Takas Değeri: *${tradeInCalc.safeTradeVal.toLocaleString('tr-TR')} TL*) peşinata saydırarak sıfır *${modelName}* (*${tradeInCalc.vehiclePrice.toLocaleString('tr-TR')} TL*) almak istiyorum.\n\n` +
        `📊 *Takas + Kredi Hesabım:*\n` +
        `• Sıfır Araç Bedeli: ${tradeInCalc.vehiclePrice.toLocaleString('tr-TR')} TL\n` +
        `• Takas Peşinatım: -${tradeInCalc.safeTradeVal.toLocaleString('tr-TR')} TL\n` +
        `• Kredilendirilecek Fark: *${tradeInCalc.remainingPrincipal.toLocaleString('tr-TR')} TL*\n` +
        `• Tercih Edilen Vade: *${tradeInCalc.term} Ay* (Aylık ~${tradeInCalc.monthlyPayment.toLocaleString('tr-TR')} TL)\n\n` +
        `📸 *Takas Ekspertizi 4 Resim Kontrolü (Tamamlandı ✓):*\n` +
        `1️⃣ Dışarıdan Görünüm Resmi (1 Adet) ✅\n` +
        `2️⃣ İçeriden Kabin Resmi (1 Adet) ✅\n` +
        `3️⃣ Kilometre (KM) Kadran Resmi (1 Adet) ✅\n` +
        `4️⃣ Araç Ruhsat Resmi (1 Adet) ✅\n\n` +
        `Takas ekspertiz ve kesin ödeme planı için benimle iletişime geçebilir misiniz?`;
      onDirectWhatsApp(msg);
    }
  };

  const handleFleetDiscountSubmit = () => {
    if (onTrackFootprint) {
      onTrackFootprint('Çoklu Filo İskonto Talebi', fleetTargetModel, `${fleetQuantity} Filo Alımı`);
    }
    const msg = `Merhaba ${salesRep?.name || 'Can Bey'}, şirketimiz bünyesinde *${fleetQuantity}* *IVECO ${fleetTargetModel}* çoklu filo alımı planlıyoruz. Kurumsal filo özel iskontonuz, teslimat kotası ve finansman koşullarınız hakkında teklif rica ederiz.`;
    toast.success(`🏢 ${fleetQuantity} ${fleetTargetModel} için Filo Özel İskonto talebiniz hazırlandı, WhatsApp açılıyor...`, { duration: 3500 });
    if (onDirectWhatsApp) {
      onDirectWhatsApp(msg);
    } else {
      openWhatsAppChat(salesRep?.phoneWhatsapp || '905446225931', msg);
    }
  };

  const activeSectorObj = SECTOR_FILTERS.find(s => s.id === selectedSectorFilter);

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* 🔄 ARAÇ KARTINDAN "TAKASA SAY" TIKLANDIĞINDA AÇILAN PANEL (Varsayılan olarak gizlidir, telefonda yer kaplamaz) */}
      {(showTradeInBox || showFleetBox) && (
      <div
        id="tradein-loan-calc-box"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(24, 42, 72, 0.94) 100%)',
          border: '1.5px solid #f59e0b',
          borderRadius: '12px',
          padding: isMobileView ? '10px 12px' : '12px 16px',
          marginBottom: isMobileView ? '12px' : '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fde68a' }}>
            🔄 Takas + Kredi Hesaplayıcı
          </div>
          <button
            type="button"
            onClick={() => { setShowTradeInBox(false); setShowFleetBox(false); }}
            style={{
              background: 'rgba(255,255,255,0.14)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ✕ Kapat
          </button>
        </div>

        {showTradeInBox && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* 1. Satır: Hedef Sıfır IVECO Modeli & Mevcut Takas Aracı */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#7dd3fc', marginBottom: '4px' }}>
                  1. Almak İstediğiniz Sıfır IVECO Modeli:
                </label>
                <select
                  value={selectedTradeInVehicleId}
                  onChange={(e) => {
                    setSelectedTradeInVehicleId(e.target.value);
                    const found = tradeInCatalogModels.find(v => v.id === e.target.value);
                    if (found) setTradeInTargetModel(found.model);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(15, 28, 50, 0.95)',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  {tradeInCatalogModels.map(v => (
                    <option key={v.id} value={v.id} style={{ background: '#0f1c32', color: '#fff' }}>
                      {v.model} — {v.currency === 'EUR'
                        ? `€${(v.eurPrice || v.cashPrice).toLocaleString('tr-TR')} (${Math.round((v.eurPrice || v.cashPrice) * tcmbEurRate).toLocaleString('tr-TR')} TL)`
                        : `${(v.campaignPrice || v.cashPrice).toLocaleString('tr-TR')} TL`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#fde68a', marginBottom: '4px' }}>
                  2. Takasa Vereceğiniz Mevcut Araç (Opsiyonel):
                </label>
                <input
                  type="text"
                  value={tradeInVehicleText}
                  onChange={(e) => setTradeInVehicleText(e.target.value)}
                  placeholder="Örn: 2020 Model Kamyonet / Panelvan / Çekici..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(15, 28, 50, 0.9)',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* 2. Satır: Takas Aracının Tahmini Peşinat Değeri + Vade Seçimi */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1.3fr 0.7fr', gap: '10px', alignItems: 'end' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fde68a' }}>
                    3. Takas Aracınızın Tahmini Değeri (Peşinat):
                  </label>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {[750000, 1000000, 1250000, 1500000, 2000000].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTradeInValue(preset)}
                        style={{
                          padding: '3px 7px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: Number(tradeInValue) === preset ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                          color: Number(tradeInValue) === preset ? '#0f172a' : '#cbd5e1',
                          border: Number(tradeInValue) === preset ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)'
                        }}
                      >
                        {(preset / 1000000).toLocaleString('tr-TR')}M TL
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  step={50000}
                  min={0}
                  max={10000000}
                  value={tradeInValue}
                  onChange={(e) => setTradeInValue(Math.max(0, Number(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(15, 28, 50, 0.95)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    borderRadius: '8px',
                    color: '#fde68a',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', gap: '6px', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7dd3fc' }}>
                    4. Kredi Vadesi & Erteleme Seçimi:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextGrace = inlineGraceMonths === 6 ? 0 : 6;
                      setInlineGraceMonths(nextGrace);
                      if (nextGrace === 6 && tradeInTerm < 24) setTradeInTerm(24);
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.67rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      background: inlineGraceMonths === 6 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.08)',
                      color: inlineGraceMonths === 6 ? '#fde047' : '#cbd5e1',
                      border: inlineGraceMonths === 6 ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.18)'
                    }}
                  >
                    {inlineGraceMonths === 6 ? '⏳ 6 Ay Ertelemeli (İlk 6 Ay 0 TL) ✓' : '⏳ 6 Ay Erteleme Ekle'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[12, 24, 36].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTradeInTerm(t)}
                      style={{
                        padding: '9px 6px',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: tradeInTerm === t ? 'linear-gradient(135deg, #0284c7, #004B93)' : 'rgba(15, 28, 50, 0.9)',
                        color: '#fff',
                        border: tradeInTerm === t ? '1.5px solid #38bdf8' : '1px solid rgba(148,163,184,0.3)'
                      }}
                    >
                      {inlineGraceMonths === 6 ? `6+${t} Ay` : `${t} Ay`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Satır: Takasla Fiyat Almak İçin Gerekli 4 Resim (1 Dıştan, 1 İçten, KM, Ruhsat) */}
            <div style={{
              background: 'rgba(15, 28, 50, 0.85)',
              border: uploadedPhotoCount === 4 ? '1.5px solid #10b981' : '1px dashed rgba(245, 158, 11, 0.5)',
              borderRadius: '10px',
              padding: isMobileView ? '10px' : '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fde68a' }}>
                  5. Takasla Fiyat Almak İçin Gerekli 4 Resim (1 Dışarıdan • 1 İçeriden • KM • Ruhsat):
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: uploadedPhotoCount === 4 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.2)',
                  color: uploadedPhotoCount === 4 ? '#34d399' : '#fde68a',
                  border: uploadedPhotoCount === 4 ? '1px solid #10b981' : '1px solid rgba(245, 158, 11, 0.45)'
                }}>
                  {uploadedPhotoCount === 4 ? '✓ 4 / 4 Resim Eklendi' : `${uploadedPhotoCount} / 4 Resim Eklendi (4 Resim Zorunlu)`}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                {REQUIRED_TRADEIN_PHOTOS.map(slot => {
                  const uploaded = tradeInPhotos[slot.id];
                  return (
                    <label
                      key={slot.id}
                      style={{
                        background: uploaded ? 'rgba(16, 185, 129, 0.14)' : 'rgba(15, 23, 42, 0.9)',
                        border: uploaded ? '1.5px solid #10b981' : '1px solid rgba(148, 163, 184, 0.35)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '4px',
                        minWidth: 0
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.73rem', fontWeight: 800, color: uploaded ? '#34d399' : '#f8fafc' }}>
                          {slot.icon} {slot.label}
                        </span>
                        {uploaded && <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 900 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                        {slot.desc}
                      </div>
                      {uploaded ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <img
                            src={uploaded.dataUrl}
                            alt={slot.label}
                            style={{ width: '38px', height: '30px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #10b981' }}
                          />
                          <span style={{ fontSize: '0.66rem', color: '#6ee7b7', fontWeight: 800 }}>Yüklendi (Değiştir)</span>
                        </div>
                      ) : (
                        <div style={{
                          marginTop: '3px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FiCamera size={12} /> Resim Seç / Çek
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSelectTradeInPhoto(slot.id, e)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Satır: Canlı Hesaplama Özeti & Gönder Butonu */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid rgba(56, 189, 248, 0.38)',
              borderRadius: '10px',
              padding: isMobileView ? '10px' : '12px 16px',
              display: 'flex',
              flexDirection: isMobileView ? 'column' : 'row',
              alignItems: isMobileView ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={isMobileView ? {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '8px'
              } : {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '18px',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>SIFIR ARAÇ BEDELİ</div>
                  <div style={{ fontSize: isMobileView ? '0.84rem' : '0.9rem', fontWeight: 800, color: '#fff' }}>
                    {tradeInCalc.vehiclePrice.toLocaleString('tr-TR')} TL
                  </div>
                </div>
                {!isMobileView && <div style={{ color: '#64748b', fontWeight: 900 }}>−</div>}
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#fde68a', fontWeight: 700 }}>TAKAS PEŞİNATINIZ</div>
                  <div style={{ fontSize: isMobileView ? '0.84rem' : '0.9rem', fontWeight: 800, color: '#fbbf24' }}>
                    {tradeInCalc.safeTradeVal.toLocaleString('tr-TR')} TL
                  </div>
                </div>
                {!isMobileView && <div style={{ color: '#64748b', fontWeight: 900 }}>=</div>}
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#7dd3fc', fontWeight: 700 }}>KREDİLENDİRİLECEK FARK</div>
                  <div style={{ fontSize: isMobileView ? '0.88rem' : '0.95rem', fontWeight: 900, color: '#38bdf8' }}>
                    {tradeInCalc.remainingPrincipal.toLocaleString('tr-TR')} TL
                  </div>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.16)',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  borderRadius: '8px',
                  padding: isMobileView ? '5px 8px' : '6px 12px'
                }}>
                  <div style={{ fontSize: '0.63rem', color: '#6ee7b7', fontWeight: 800 }}>
                    {tradeInCalc.graceMonths === 6 ? `6 AY ERTELEME + ${tradeInCalc.term} TAKSİT` : `${tradeInCalc.term} AY TAKSİT`} {tradeInCalc.isZeroInterest ? '(%0 FAİZ!)' : `(%${tradeInCalc.appliedRatePct.toFixed(2)})`}
                  </div>
                  <div style={{ fontSize: isMobileView ? '0.9rem' : '1.02rem', fontWeight: 900, color: '#34d399' }}>
                    {tradeInCalc.remainingPrincipal > 0 ? `~${tradeInCalc.monthlyPayment.toLocaleString('tr-TR')} TL/Ay` : 'Kredi Yok'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGeneralTradeInSubmit}
                style={{
                  width: isMobileView ? '100%' : 'auto',
                  background: uploadedPhotoCount === 4
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: uploadedPhotoCount === 4 ? '#fff' : '#0f172a',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
              >
                <FiMessageSquare size={14} />
                {uploadedPhotoCount === 4
                  ? '4 Resmi & Takas Hesabımı Gönder'
                  : `4 Resmi Ekle & Takasla Fiyat Al (${uploadedPhotoCount}/4)`}
              </button>
            </div>
          </div>
        )}

        {showFleetBox && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px dashed rgba(56, 189, 248, 0.35)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center'
          }}>
            <select
              value={fleetQuantity}
              onChange={(e) => setFleetQuantity(e.target.value)}
              style={{
                flex: '1 1 150px',
                padding: '9px 12px',
                background: 'rgba(15, 28, 50, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="2 Adet">Alım Adedi: 2 Adet Araç</option>
              <option value="3 - 5 Adet">Alım Adedi: 3 - 5 Adet Filo</option>
              <option value="6 - 10 Adet">Alım Adedi: 6 - 10 Adet Filo</option>
              <option value="10+ Adet Kurumsal Filo">Alım Adedi: 10+ Adet Kurumsal Filo</option>
            </select>
            <select
              value={fleetTargetModel}
              onChange={(e) => setFleetTargetModel(e.target.value)}
              style={{
                flex: '2 1 200px',
                padding: '9px 12px',
                background: 'rgba(15, 28, 50, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="Daily 35C16 Çift Teker Şasi">Model: Daily 35C16 Çift Teker Şasi</option>
              <option value="Daily 35S16 Panelvan (12 / 16 / 18 m³)">Model: Daily Panelvan (12 / 16 / 18 m³)</option>
              <option value="Daily 70C16 / 72C16 (7 Ton Kamyon)">Model: Daily 70C16 / 72C16 (7 Ton Kamyon)</option>
              <option value="Eurocargo 100E / 150E / 160E">Model: Eurocargo Orta Ağır Kamyon</option>
              <option value="S-Way Çekici (500 / 530 / 580 HP)">Model: S-Way Çekici Filosu</option>
              <option value="T-Way 10 / 12 Teker Hafriyat">Model: T-Way Hafriyat & Mikser Filosu</option>
            </select>
            <button
              type="button"
              onClick={handleFleetDiscountSubmit}
              style={{
                width: isMobileView ? '100%' : 'auto',
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FiMessageSquare size={14} /> Filo Özel İskontosu İste
            </button>
          </div>
        )}
      </div>
      )}

      {/* 🔍 HIZLI ARAÇ / TONAJ / MODEL ARAMA ÇUBUĞU (Kaybolmaz, Her Zaman Görünür) */}
      <div style={{
        position: 'relative',
        marginBottom: isMobileView ? '8px' : '12px'
      }}>
        <FiSearch
          size={15}
          color="#38bdf8"
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Hızlı Araç, Tonaj veya Model Ara (Örn: 7 Ton, Mikser, Panelvan, Otomatik)..."
          style={{
            width: '100%',
            padding: isMobileView ? '9px 34px 9px 34px' : '10px 36px 10px 36px',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1.5px solid rgba(56, 189, 248, 0.42)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: isMobileView ? '0.78rem' : '0.84rem',
            fontWeight: 700,
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: '#cbd5e1',
              borderRadius: '6px',
              padding: '2px 7px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 1. TEK ADIMLI SADE ARAÇ GRUBU SEÇİCİ */}
      {visibleCategories.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: isMobileView ? '8px' : '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            <div style={{ fontSize: isMobileView ? '0.78rem' : '0.9rem', fontWeight: 900, color: '#fde047' }}>
              👇 Hangi Araç Grubuna Bakıyorsunuz?
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === 'all' ? visibleCategories[0].id : 'all')}
              style={{
                background: selectedCategory === 'all' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.7)',
                color: selectedCategory === 'all' ? '#7dd3fc' : '#cbd5e1',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '7px',
                padding: '3px 9px',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {selectedCategory === 'all' ? '✓ Tümü Açık' : 'Tümünü Listele'}
            </button>
          </div>

          <div style={isMobileView ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '6px'
          } : {
            display: 'grid',
            gridTemplateColumns: `repeat(${visibleCategories.length}, minmax(0, 1fr))`,
            gap: '8px'
          }}>
            {visibleCategories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (onTrackFootprint) {
                      onTrackFootprint('Araç Grubu Seçildi', cat.title, cat.licenseBadge);
                    }
                    if (isMobileView) {
                      setTimeout(() => {
                        const anchor = document.getElementById('vehicle-cards-grid-anchor');
                        if (anchor) {
                          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 60);
                    }
                  }}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)'
                      : 'rgba(30, 48, 80, 0.92)',
                    color: '#fff',
                    border: isSelected ? '2px solid #fde047' : '1px solid rgba(148, 163, 184, 0.32)',
                    borderRadius: '11px',
                    padding: isMobileView ? '6px 6px' : '8px 8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.18s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isMobileView ? '4px' : '5px',
                    minWidth: 0,
                    boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.18)'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: isMobileView ? '34px' : '44px',
                    background: '#ffffff',
                    borderRadius: '7px',
                    padding: '2px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxSizing: 'border-box'
                  }}>
                    <img
                      src={cat.image}
                      alt={cat.title}
                      loading="lazy"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1px',
                    minWidth: 0,
                    width: '100%'
                  }}>
                    <span style={{
                      fontSize: isMobileView ? '0.76rem' : '0.78rem',
                      fontWeight: 900,
                      color: isSelected ? '#fde047' : '#ffffff',
                      lineHeight: 1.15,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}>
                      {cat.title}
                    </span>
                    <span style={{
                      fontSize: isMobileView ? '0.63rem' : '0.65rem',
                      fontWeight: 700,
                      color: isSelected ? '#e0f2fe' : '#93c5fd',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}>
                      {cat.licenseBadge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🎟️ ÖZEL BAYİ / REFERANS İSKONTOSU MERAK KANCASI BANNERI (Mobilde Kompakt 2 Satır) */}
      <div id="vehicle-cards-grid-anchor" style={{ scrollMarginTop: '12px' }} />
      {referralBannerInfo && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(15, 23, 42, 0.94) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '11px',
          padding: isMobileView ? '8px 10px' : '11px 16px',
          marginBottom: isMobileView ? '10px' : '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: isMobileView ? 'nowrap' : 'wrap',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.14)'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: isMobileView ? '0.65rem' : '0.68rem', fontWeight: 900, color: '#4ade80', letterSpacing: '0.2px' }}>
              {referralBannerInfo.badge}
            </div>
            <div style={{ fontSize: isMobileView ? '0.76rem' : '0.9rem', fontWeight: 900, color: '#ffffff', marginTop: '1px', lineHeight: 1.25 }}>
              {referralBannerInfo.title}
            </div>
            {!isMobileView && (
              <div style={{ fontSize: '0.73rem', color: '#cbd5e1', marginTop: '2px', lineHeight: 1.35 }}>
                {referralBannerInfo.desc}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const firstVeh = filteredVehicles[0] || IVECO_PRICING_CATALOG[0];
              if (firstVeh) handleVehicleQuote(firstVeh);
            }}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: isMobileView ? '7px 10px' : '9px 14px',
              fontSize: isMobileView ? '0.7rem' : '0.76rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(34, 197, 94, 0.35)'
            }}
          >
            <FiMessageSquare size={13} /> {isMobileView ? 'Dip Fiyat Sor' : 'Özel Dip Fiyatımı Sor (Can Murat)'}
          </button>
        </div>
      )}

      {/* 🛻 3.5 TON KAMYONET GRUBU — ADIM ADIM ÇOKTAN SEÇMELİ SİHİRBAZ */}
      {selectedCategory === 'daily35_chassis' && !searchQuery.trim() && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.96) 0%, rgba(23, 37, 84, 0.94) 100%)',
          border: '2px solid rgba(56, 189, 248, 0.55)',
          borderRadius: '14px',
          padding: isMobileView ? '12px' : '15px 18px',
          marginBottom: '14px',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: isMobileView ? '0.84rem' : '0.95rem', fontWeight: 900, color: '#fde047' }}>
                🛻 3.5 Ton Kamyonet — 3 Adımda Aracınızı Seçin
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                Önce teker tipini, sonra şasi boyunu, en son vites tipini seçin; aradığınız aracın net fiyatı ve taksiti anında açılsın.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {(kamyonetWheelType || kamyonetChassisLen || kamyonetGearType) && !showAllKamyonetList && (
                <button
                  type="button"
                  onClick={() => {
                    setKamyonetWheelType(null);
                    setKamyonetChassisLen(null);
                    setKamyonetGearType(null);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#e2e8f0',
                    borderRadius: '7px',
                    padding: '5px 9px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ↺ Seçimi Sıfırla
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAllKamyonetList(prev => !prev)}
                style={{
                  background: showAllKamyonetList ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                  border: showAllKamyonetList ? '1.5px solid #10b981' : '1px solid rgba(148, 163, 184, 0.35)',
                  color: showAllKamyonetList ? '#4ade80' : '#93c5fd',
                  borderRadius: '7px',
                  padding: '5px 10px',
                  fontSize: '0.69rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {showAllKamyonetList ? '🎯 Adım Adım Seçime Dön' : '📋 Tümünü Listele (10 Model)'}
              </button>
            </div>
          </div>

          {!showAllKamyonetList && (
            <>
              {/* 1. ADIM: TEKER / KABİN TİPİ */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#38bdf8', marginBottom: '6px' }}>
                  1. ADIM — Teker / Kabin Tipi Seçin:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)',
                  gap: '8px'
                }}>
                  {[
                    {
                      id: 'cift_teker',
                      icon: '💪',
                      title: '35C Çift Teker Kamyonet',
                      sub: '3.0 Büyük Motor (160 BG) • Ağır Yük Şasisi',
                      badge: 'En Çok Tercih Edilen'
                    },
                    {
                      id: 'tek_teker',
                      icon: '🛞',
                      title: '35S Tek Teker Kamyonet',
                      sub: '2.3 Ekonomik Motor (156 BG) • Şehir İçi Dağıtım',
                      badge: '190.000 TL Nakit İndirimli'
                    },
                    {
                      id: 'cift_kabin',
                      icon: '👷',
                      title: 'Çift Kabin (6+1 Kişilik)',
                      sub: 'Ekip + Yük Taşıma (3.0m Kasa • 8 İleri Otomatik)',
                      badge: 'Ekip Aracı'
                    }
                  ].map(opt => {
                    const active = kamyonetWheelType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setKamyonetWheelType(opt.id);
                          if (opt.id === 'cift_kabin') {
                            setKamyonetChassisLen('3450');
                            setKamyonetGearType('otomatik');
                            if (onTrackFootprint) {
                              onTrackFootprint('Kamyonet Seçimi Yapıldı', 'IVECO DAILY 35 S 16 H A 8 DC 3450', 'Çift Kabin 6+1 Otomatik');
                            }
                            setTimeout(() => {
                              const el = document.getElementById('kamyonet-result-anchor');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 80);
                          } else {
                            setKamyonetChassisLen(null);
                            setKamyonetGearType(null);
                            if (onTrackFootprint) {
                              onTrackFootprint('Kamyonet Seçimi Yapıldı', opt.title, opt.sub);
                            }
                          }
                        }}
                        style={{
                          padding: isMobileView ? '10px 12px' : '11px 12px',
                          borderRadius: '10px',
                          border: active ? '2px solid #4ade80' : '1px solid rgba(148, 163, 184, 0.3)',
                          background: active
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(15, 23, 42, 0.95) 100%)'
                            : 'rgba(15, 23, 42, 0.82)',
                          color: '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          boxShadow: active ? '0 4px 14px rgba(16, 185, 129, 0.25)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 900, color: active ? '#4ade80' : '#f8fafc' }}>
                            {opt.icon} {opt.title}
                          </span>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '999px',
                            background: active ? '#22c55e' : 'rgba(56, 189, 248, 0.18)',
                            color: active ? '#052e16' : '#7dd3fc'
                          }}>
                            {active ? '✓ Seçildi' : opt.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600 }}>
                          {opt.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. ADIM: KISA / ORTA / UZUN ŞASİ SEÇİMİ */}
              {kamyonetWheelType && kamyonetWheelType !== 'cift_kabin' && (
                <div style={{
                  paddingTop: '10px',
                  borderTop: '1px dashed rgba(56, 189, 248, 0.35)'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#fde047', marginBottom: '6px' }}>
                    2. ADIM — Şasi Boyu (Kasa Uzunluğu) Seçin:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)',
                    gap: '8px'
                  }}>
                    {[
                      {
                        len: '3450',
                        title: '📏 Kısa Şasi',
                        kasa: '3.5 – 3.8 Metre Kasa Uygun',
                        sub: '3450 mm Dingil Mesafesi • Şehir İçi Manevra'
                      },
                      {
                        len: '3750',
                        title: '📐 Orta Şasi',
                        kasa: '4.1 – 4.3 Metre Kasa Uygun',
                        sub: '3750 mm Dingil Mesafesi • Standart 8 Palet'
                      },
                      {
                        len: '4100',
                        title: '🚛 Uzun Şasi',
                        kasa: '4.5 – 4.8 Metre Kasa Uygun',
                        sub: kamyonetWheelType === 'tek_teker'
                          ? '4100 mm Uzun Şasi (35C Çift Teker Modelinde Mevcut)'
                          : '4100 mm Dingil Mesafesi • Maksimum Hacim (-190.000 TL Nakit İndirimli)'
                      }
                    ].map(sOpt => {
                      const active = kamyonetChassisLen === sOpt.len;
                      return (
                        <button
                          key={sOpt.len}
                          type="button"
                          onClick={() => {
                            if (kamyonetWheelType === 'tek_teker' && sOpt.len === '4100') {
                              setKamyonetWheelType('cift_teker');
                              setKamyonetChassisLen('4100');
                              setKamyonetGearType(null);
                              if (onTrackFootprint) {
                                onTrackFootprint('Kamyonet Şasi Seçimi Yapıldı', '35C Çift Teker Uzun Şasi (4100mm)', sOpt.kasa);
                              }
                              toast.success('4.5–4.8m Uzun Şasi 35C Çift Teker modelimizde üretilmektedir; 35C Uzun Şasi seçildi ✓');
                              return;
                            }
                            setKamyonetChassisLen(sOpt.len);
                            if (kamyonetWheelType === 'tek_teker' && sOpt.len === '3750') {
                              // Tek teker orta şasi sadece Manuel olarak mevcuttur
                              setKamyonetGearType('manuel');
                              if (onTrackFootprint) {
                                onTrackFootprint('Kamyonet Seçimi Yapıldı', 'IVECO DAILY 35 S 16 CC 3750 H 2.3', 'Tek Teker Orta Şasi Manuel');
                              }
                              setTimeout(() => {
                                const el = document.getElementById('kamyonet-result-anchor');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 80);
                            } else {
                              setKamyonetGearType(null);
                              if (onTrackFootprint) {
                                onTrackFootprint(
                                  'Kamyonet Şasi Seçimi Yapıldı',
                                  `${kamyonetWheelType === 'cift_teker' ? '35C Çift Teker' : '35S Tek Teker'} ${sOpt.title} (${sOpt.len}mm)`,
                                  sOpt.kasa
                                );
                              }
                            }
                          }}
                          style={{
                            padding: isMobileView ? '10px 12px' : '11px 12px',
                            borderRadius: '10px',
                            border: active ? '2px solid #fde047' : '1px solid rgba(148, 163, 184, 0.3)',
                            background: active
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(15, 23, 42, 0.95) 100%)'
                              : 'rgba(15, 23, 42, 0.82)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            boxShadow: active ? '0 4px 14px rgba(245, 158, 11, 0.25)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: active ? '#fde047' : '#ffffff' }}>
                              {sOpt.title}
                            </span>
                            {active && (
                              <span style={{ fontSize: '0.63rem', background: '#fde047', color: '#0f172a', padding: '1px 6px', borderRadius: '999px', fontWeight: 900 }}>
                                ✓ Seçildi
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#86efac', fontWeight: 800 }}>
                            {sOpt.kasa}
                          </div>
                          <div style={{ fontSize: '0.67rem', color: '#94a3b8', fontWeight: 600 }}>
                            {sOpt.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. ADIM (SON SEÇİM): VİTES TİPİ (MANUEL / OTOMATİK) */}
              {kamyonetWheelType && kamyonetWheelType !== 'cift_kabin' && kamyonetChassisLen && (
                <div style={{
                  paddingTop: '10px',
                  borderTop: '1px dashed rgba(56, 189, 248, 0.35)'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#4ade80', marginBottom: '6px' }}>
                    3. ADIM (SON SEÇİM) — Vites Tipini Seçin:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)',
                    gap: '8px'
                  }}>
                    {[
                      {
                        id: 'manuel',
                        icon: '⚙️',
                        title: 'Manuel Vites',
                        sub: '6 İleri Manuel Şanzıman'
                      },
                      {
                        id: 'otomatik',
                        icon: '⚡',
                        title: 'Otomatik Vites (Hi-Matic)',
                        sub: kamyonetWheelType === 'tek_teker' && kamyonetChassisLen === '3750'
                          ? '8 İleri Otomatik (35C Çift Teker Orta Şaside Mevcut)'
                          : '8 İleri Tam Otomatik Şanzıman'
                      },
                      {
                        id: 'both',
                        icon: '🔄',
                        title: 'İkisini Yan Yana Karşılaştır',
                        sub: 'Manuel ve Otomatik Fiyatını Birlikte Gör'
                      }
                    ].map(gOpt => {
                      const active = kamyonetGearType === gOpt.id;
                      return (
                        <button
                          key={gOpt.id}
                          type="button"
                          onClick={() => {
                            if (kamyonetWheelType === 'tek_teker' && kamyonetChassisLen === '3750' && gOpt.id === 'otomatik') {
                              setKamyonetWheelType('cift_teker');
                              setKamyonetChassisLen('3750');
                              setKamyonetGearType('otomatik');
                              toast.success('Orta Şasi Otomatik vites 35C Çift Teker modelimizde mevcuttur; otomatik seçildi ✓');
                            } else {
                              setKamyonetGearType(gOpt.id);
                            }
                            if (onTrackFootprint) {
                              onTrackFootprint(
                                'Kamyonet Son Seçimi Yapıldı',
                                `${kamyonetWheelType === 'cift_teker' ? '35C Çift Teker' : '35S Tek Teker'} ${kamyonetChassisLen}mm`,
                                gOpt.title
                              );
                            }
                            setTimeout(() => {
                              const el = document.getElementById('kamyonet-result-anchor');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 80);
                          }}
                          style={{
                            padding: isMobileView ? '10px 12px' : '11px 12px',
                            borderRadius: '10px',
                            border: active ? '2px solid #22c55e' : '1px solid rgba(148, 163, 184, 0.3)',
                            background: active
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.28) 0%, rgba(15, 23, 42, 0.95) 100%)'
                              : 'rgba(15, 23, 42, 0.82)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            boxShadow: active ? '0 4px 14px rgba(34, 197, 94, 0.25)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: active ? '#4ade80' : '#ffffff' }}>
                              {gOpt.icon} {gOpt.title}
                            </span>
                            {active && (
                              <span style={{ fontSize: '0.63rem', background: '#22c55e', color: '#052e16', padding: '1px 6px', borderRadius: '999px', fontWeight: 900 }}>
                                ✓ Seçildi
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.69rem', color: '#cbd5e1', fontWeight: 600 }}>
                            {gOpt.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 🚛 7 TON DAILY KAMYON (70C) GRUBU — KISA / ORTA / UZUN ŞASİ ÇOKTAN SEÇMELİ SİHİRBAZ */}
      {selectedCategory === 'daily70' && !searchQuery.trim() && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.96) 0%, rgba(23, 37, 84, 0.94) 100%)',
          border: '2px solid rgba(56, 189, 248, 0.55)',
          borderRadius: '14px',
          padding: isMobileView ? '12px' : '15px 18px',
          marginBottom: '14px',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: isMobileView ? '0.84rem' : '0.95rem', fontWeight: 900, color: '#fde047' }}>
                🚛 Daily 7 Ton Kamyon (70C) — Şasi Boyu ve Vites Seçin
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                Önce Kısa / Orta / Uzun şasi boyunu (veya 19.6 m³ Panelvanı), ardından vites tipini seçin; aradığınız aracın net fiyatı ve taksiti anında açılsın.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {(daily70ChassisLen || daily70GearType) && !showAllDaily70List && (
                <button
                  type="button"
                  onClick={() => {
                    setDaily70ChassisLen(null);
                    setDaily70GearType(null);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#e2e8f0',
                    borderRadius: '7px',
                    padding: '5px 9px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ↺ Seçimi Sıfırla
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAllDaily70List(prev => !prev)}
                style={{
                  background: showAllDaily70List ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                  border: showAllDaily70List ? '1.5px solid #10b981' : '1px solid rgba(148, 163, 184, 0.35)',
                  color: showAllDaily70List ? '#4ade80' : '#93c5fd',
                  borderRadius: '7px',
                  padding: '5px 10px',
                  fontSize: '0.69rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {showAllDaily70List ? '🎯 Adım Adım Seçime Dön' : '📋 Tümünü Listele (8 Model)'}
              </button>
            </div>
          </div>

          {!showAllDaily70List && (
            <>
              {/* 1. ADIM: KISA / ORTA / UZUN ŞASİ (VEYA DEV PANELVAN) SEÇİMİ */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#38bdf8', marginBottom: '6px' }}>
                  1. ADIM — Şasi Boyu (Kısa / Orta / Uzun) Seçin:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobileView ? '1fr' : 'repeat(4, 1fr)',
                  gap: '8px'
                }}>
                  {[
                    {
                      len: '3750',
                      title: '📏 Kısa Şasi',
                      kasa: '4.1 – 4.3 Metre Kasa Uygun',
                      sub: '3750 mm Dingil • ~4.8 Ton Yük • Klimalı',
                      badge: 'Manevra & Oto Kurtarma'
                    },
                    {
                      len: '4350',
                      title: '📐 Orta Şasi',
                      kasa: '5.1 – 5.3 Metre Kasa (10 Palet)',
                      sub: '4350 mm Dingil • ~4.8 Ton Yük • Klimalı',
                      badge: 'En Çok Tercih Edilen'
                    },
                    {
                      len: '4750',
                      title: '🚛 Uzun Şasi',
                      kasa: '5.6 – 5.9 Metre Kasa (12 Palet)',
                      sub: '4750 mm Dingil • ~4.7 Ton Yük • Klimalı',
                      badge: '-260.000 TL Nakit İndirimli'
                    },
                    {
                      len: 'van',
                      title: '🚐 7 Ton Dev Panelvan',
                      kasa: '19.6 m³ Kapalı Sac Gövde',
                      sub: '5.12m İç Uzunluk • 180 BG Büyük Motor',
                      badge: '19.6 m³ Hazır Van'
                    }
                  ].map(sOpt => {
                    const active = daily70ChassisLen === sOpt.len;
                    return (
                      <button
                        key={sOpt.len}
                        type="button"
                        onClick={() => {
                          setDaily70ChassisLen(sOpt.len);
                          setDaily70GearType(null);
                          if (onTrackFootprint) {
                            onTrackFootprint('Daily 70C Kamyon Seçimi Yapıldı', `Daily 70C ${sOpt.title}`, sOpt.kasa);
                          }
                        }}
                        style={{
                          padding: isMobileView ? '10px 12px' : '11px 12px',
                          borderRadius: '10px',
                          border: active ? '2px solid #fde047' : '1px solid rgba(148, 163, 184, 0.3)',
                          background: active
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(15, 23, 42, 0.95) 100%)'
                            : 'rgba(15, 23, 42, 0.82)',
                          color: '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          boxShadow: active ? '0 4px 14px rgba(245, 158, 11, 0.25)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.83rem', fontWeight: 900, color: active ? '#fde047' : '#ffffff' }}>
                            {sOpt.title}
                          </span>
                          <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '999px',
                            background: active ? '#fde047' : 'rgba(56, 189, 248, 0.18)',
                            color: active ? '#0f172a' : '#7dd3fc'
                          }}>
                            {active ? '✓ Seçildi' : sOpt.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.73rem', color: '#86efac', fontWeight: 800 }}>
                          {sOpt.kasa}
                        </div>
                        <div style={{ fontSize: '0.67rem', color: '#94a3b8', fontWeight: 600 }}>
                          {sOpt.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. ADIM (SON SEÇİM): VİTES TİPİ (MANUEL / OTOMATİK) */}
              {daily70ChassisLen && (
                <div style={{
                  paddingTop: '10px',
                  borderTop: '1px dashed rgba(56, 189, 248, 0.35)'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#4ade80', marginBottom: '6px' }}>
                    2. ADIM (SON SEÇİM) — Vites Tipini Seçin:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)',
                    gap: '8px'
                  }}>
                    {[
                      {
                        id: 'manuel',
                        icon: '⚙️',
                        title: 'Manuel Vites',
                        sub: '6 İleri Manuel Şanzıman (Klimalı)'
                      },
                      {
                        id: 'otomatik',
                        icon: '⚡',
                        title: 'Otomatik Vites (Hi-Matic)',
                        sub: '8 İleri Tam Otomatik Şanzıman (Klimalı)'
                      },
                      {
                        id: 'both',
                        icon: '🔄',
                        title: 'İkisini Yan Yana Karşılaştır',
                        sub: 'Manuel ve Otomatik Fiyatını Birlikte Gör'
                      }
                    ].map(gOpt => {
                      const active = daily70GearType === gOpt.id;
                      return (
                        <button
                          key={gOpt.id}
                          type="button"
                          onClick={() => {
                            setDaily70GearType(gOpt.id);
                            if (onTrackFootprint) {
                              onTrackFootprint(
                                'Daily 70C Kamyon Seçimi Yapıldı',
                                `Daily 70C ${daily70ChassisLen === '3750' ? 'Kısa Şasi (3750)' : daily70ChassisLen === '4350' ? 'Orta Şasi (4350)' : daily70ChassisLen === '4750' ? 'Uzun Şasi (4750)' : 'Dev Panelvan (19.6m3)'}`,
                                gOpt.title
                              );
                            }
                            setTimeout(() => {
                              const el = document.getElementById('kamyonet-result-anchor');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 80);
                          }}
                          style={{
                            padding: isMobileView ? '10px 12px' : '11px 12px',
                            borderRadius: '10px',
                            border: active ? '2px solid #22c55e' : '1px solid rgba(148, 163, 184, 0.3)',
                            background: active
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.28) 0%, rgba(15, 23, 42, 0.95) 100%)'
                              : 'rgba(15, 23, 42, 0.82)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            boxShadow: active ? '0 4px 14px rgba(34, 197, 94, 0.25)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: active ? '#4ade80' : '#ffffff' }}>
                              {gOpt.icon} {gOpt.title}
                            </span>
                            {active && (
                              <span style={{ fontSize: '0.63rem', background: '#22c55e', color: '#052e16', padding: '1px 6px', borderRadius: '999px', fontWeight: 900 }}>
                                ✓ Seçildi
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.69rem', color: '#cbd5e1', fontWeight: 600 }}>
                            {gOpt.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div id="kamyonet-result-anchor" style={{ scrollMarginTop: '12px' }} />

      {/* Seçilen Kamyonet / Daily 70C Kamyon Başlığı */}
      {((selectedCategory === 'daily35_chassis' && !showAllKamyonetList) || (selectedCategory === 'daily70' && !showAllDaily70List)) && !searchQuery.trim() && filteredVehicles.length > 0 && (
        <div style={{
          marginBottom: '10px',
          padding: '8px 12px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.16)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          color: '#86efac',
          fontSize: '0.78rem',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <span>✅ Seçiminize Uygun {selectedCategory === 'daily70' ? 'Daily 7 Ton Kamyon' : 'Kamyonet'} Modeli Aşağıda Hazır:</span>
          <span style={{ fontSize: '0.7rem', color: '#fde047' }}>
            👇 Taksit hesaplayabilir veya Can Murat’a son dip fiyatı sorabilirsiniz
          </span>
        </div>
      )}

      {/* Vehicle Grid — ÖNCE SONUÇ, MÜŞTERİ İSTERSE DETAY */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: isMobileView ? '12px' : '14px' }}>
        {filteredVehicles.map(vehicle => {
          const sticker = getVehicleSticker(vehicle);
          const partnerPricing = partnerProtocol
            ? calculatePartnerVehiclePricing(vehicle, partnerProtocol, tcmbEurRate)
            : null;
          const effectiveTlPrice = partnerPricing && !partnerPricing.isEur
            ? partnerPricing.finalCash
            : (vehicle.cashPrice || vehicle.campaignPrice || 0);
          const vatShieldTl = effectiveTlPrice > 0 ? Math.round(effectiveTlPrice - (effectiveTlPrice / 1.20)) : 0;
          const isDetailOpen = showAllCardDetails || Boolean(expandedCardIds[vehicle.id]);
          const isInlineCalcOpen = activeInlineCalcId === vehicle.id;
          const friendlyInfo = getFriendlyVehicleDisplay(vehicle);

          const fullPriceForLoan = vehicle.currency === 'EUR'
            ? Math.round(((partnerPricing ? partnerPricing.finalEur : (vehicle.eurPrice || vehicle.cashPrice || 123000)) * tcmbEurRate) * 1.20)
            : (partnerPricing && !partnerPricing.isEur ? partnerPricing.finalCampaign : (vehicle.campaignPrice || vehicle.cashPrice || 0));

          const fullPriceEurForLoan = vehicle.currency === 'EUR'
            ? Math.round(partnerPricing ? partnerPricing.finalEur : (vehicle.eurPrice || vehicle.cashPrice || 123000))
            : (fullPriceForLoan > 0 && tcmbEurRate > 0 ? Math.round(fullPriceForLoan / tcmbEurRate) : 0);

          const remainingAfterTradeIn = (!vehicle.isCustomPrice && fullPriceForLoan > 0)
            ? Math.max(0, fullPriceForLoan - (Number(tradeInValue) || 0))
            : 0;
          const activeTerm = Number(tradeInTerm) || 12;
          const isHeavyVeh = vehicle.segment === 'S-Way' || vehicle.segment === 'T-Way';
          const isDaily70OrEc = vehicle.segment === 'Daily 70 C' || vehicle.segment === 'Eurocargo';
          const zeroCapTl = isHeavyVeh
            ? (activeTerm <= 6 ? 2000000 : activeTerm <= 9 ? 1580000 : 1250000)
            : isDaily70OrEc
              ? (activeTerm <= 6 ? 1500000 : activeTerm <= 9 ? 1250000 : 1000000)
              : (activeTerm <= 6 ? 1000000 : 800000);
          const isZeroInterestEligible =
            !vehicle.isCustomPrice &&
            vehicle.currency !== 'EUR' &&
            inlineGraceMonths === 0 &&
            remainingAfterTradeIn > 0 &&
            remainingAfterTradeIn <= zeroCapTl &&
            (activeTerm === 6 || activeTerm === 8 || activeTerm === 9 || activeTerm === 12);

          // IVECO Kasım 2026 Resmi Banka Kampanya Tablosu Kademeli IVECO Katkılı Oranlar
          let appliedTlRatePct = 0;
          if (remainingAfterTradeIn > 0) {
            if (inlineGraceMonths === 6) {
              // ⏳ 6 Ay Ödemesiz + Eşit Taksit (Kuveyt Türk & Albaraka Kasım 2026 IVECO Katkılı Oranları)
              if (isHeavyVeh) {
                appliedTlRatePct = remainingAfterTradeIn <= 2500000 ? 2.48 : remainingAfterTradeIn <= 3500000 ? 2.59 : 2.83;
              } else if (isDaily70OrEc) {
                appliedTlRatePct = remainingAfterTradeIn <= 1000000 ? 1.76 : remainingAfterTradeIn <= 1500000 ? 2.24 : remainingAfterTradeIn <= 2000000 ? 2.47 : 2.70;
              } else {
                appliedTlRatePct = remainingAfterTradeIn <= 1000000 ? 2.36 : 2.76;
              }
            } else if (isZeroInterestEligible) {
              appliedTlRatePct = 0;
            } else if (lockedBank?.baseRate) {
              appliedTlRatePct = Number(lockedBank.baseRate);
            } else if (activeTerm <= 12) {
              appliedTlRatePct = (isHeavyVeh || isDaily70OrEc)
                ? (remainingAfterTradeIn <= 1250000 ? 0.70 : remainingAfterTradeIn <= 1500000 ? 1.18 : 1.76)
                : (remainingAfterTradeIn <= 1000000 ? 0.98 : remainingAfterTradeIn <= 1500000 ? 1.80 : 2.38);
            } else if (activeTerm <= 24) {
              appliedTlRatePct = (isHeavyVeh || isDaily70OrEc)
                ? (remainingAfterTradeIn <= 1000000 ? 1.21 : remainingAfterTradeIn <= 1500000 ? 1.90 : remainingAfterTradeIn <= 2000000 ? 2.23 : 2.58)
                : (remainingAfterTradeIn <= 800000 ? 1.83 : remainingAfterTradeIn <= 1000000 ? 2.11 : remainingAfterTradeIn <= 1500000 ? 2.43 : 2.67);
            } else if (activeTerm <= 36) {
              appliedTlRatePct = (isHeavyVeh || isDaily70OrEc)
                ? (remainingAfterTradeIn <= 2000000 ? 2.47 : 2.70)
                : 2.76;
            } else {
              appliedTlRatePct = 2.83;
            }
          }

          const monthlyRate = appliedTlRatePct / 100;
          // Ticari taşıt kredilerinde faiz/kâr payı üzerinden %5 BSMV uygulanır (resmi banka tabloları ile tam uyum)
          const effectiveMonthlyRate = inlineGraceMonths === 6 ? monthlyRate : monthlyRate * 1.05;
          const effectiveTlPrincipalForCalc =
            inlineGraceMonths === 6 && remainingAfterTradeIn > 0
              ? remainingAfterTradeIn * Math.pow(1 + monthlyRate, 6) // 6 ay ödemesiz dönem kâr payı bileşimi (Kuveyt/Albaraka resmi tablo uyumlu)
              : remainingAfterTradeIn;

          const monthlyPaymentEst = remainingAfterTradeIn <= 0
            ? 0
            : isZeroInterestEligible
              ? Math.round(remainingAfterTradeIn / activeTerm)
              : Math.round((effectiveTlPrincipalForCalc * effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, activeTerm)) / (Math.pow(1 + effectiveMonthlyRate, activeTerm) - 1));
          const totalTlRepaymentEst = remainingAfterTradeIn <= 0
            ? 0
            : isZeroInterestEligible
              ? remainingAfterTradeIn
              : monthlyPaymentEst * activeTerm;

          // 💶 İhracatçı Euro (€) Kredisi Hesaplamaları (32 Sayılı Karar - Kuveyt Türk / Garanti BBVA / Albaraka / DenizBank)
          const remainingEurAfterTradeIn = (!vehicle.isCustomPrice && fullPriceEurForLoan > 0)
            ? Math.max(0, fullPriceEurForLoan - (Number(eurTradeInValue) || 0))
            : 0;
          const activeEurTerm = Number(eurLoanTerm) || 36;
          const isZeroEurEligible =
            remainingEurAfterTradeIn > 0 &&
            inlineEurGraceMonths === 0 &&
            ((activeEurTerm <= 12 && remainingEurAfterTradeIn <= 110000) || (activeEurTerm <= 24 && remainingEurAfterTradeIn <= 60000));

          let appliedEurRatePct = 0;
          if (remainingEurAfterTradeIn > 0) {
            if (inlineEurGraceMonths === 6) {
              // ⏳ Kuveyt Türk, Albaraka & Garanti BBVA 6 Ay Ödemesiz Euro Kredisi Resmi Oranları
              appliedEurRatePct = activeEurTerm <= 24 ? 0.27 : 0.36;
            } else if (isZeroEurEligible) {
              appliedEurRatePct = 0;
            } else if (activeEurTerm <= 12) {
              appliedEurRatePct = 0.05;
            } else if (activeEurTerm <= 24) {
              appliedEurRatePct = 0.17;
            } else if (activeEurTerm <= 36) {
              appliedEurRatePct = 0.30;
            } else {
              appliedEurRatePct = 0.38;
            }
          }
          const monthlyEurRate = appliedEurRatePct / 100;
          const effectiveEurPrincipalForCalc =
            inlineEurGraceMonths === 6 && remainingEurAfterTradeIn > 0
              ? remainingEurAfterTradeIn * (1 + monthlyEurRate * 6)
              : remainingEurAfterTradeIn;
          const monthlyEurPaymentEst = remainingEurAfterTradeIn <= 0
            ? 0
            : appliedEurRatePct === 0
              ? Math.round(remainingEurAfterTradeIn / activeEurTerm)
              : Math.round((effectiveEurPrincipalForCalc * monthlyEurRate * Math.pow(1 + monthlyEurRate, activeEurTerm)) / (Math.pow(1 + monthlyEurRate, activeEurTerm) - 1));
          const totalEurRepaymentEst = monthlyEurPaymentEst * activeEurTerm;

          return (
            <div
              key={vehicle.id}
              style={{
                background: 'linear-gradient(165deg, rgba(33, 55, 90, 0.96) 0%, rgba(20, 36, 62, 0.96) 100%)',
                border: isInlineCalcOpen
                  ? '2px solid #38bdf8'
                  : partnerPricing
                    ? '1.5px solid rgba(16, 185, 129, 0.55)'
                    : '1.5px solid rgba(125, 211, 252, 0.28)',
                boxShadow: '0 8px 24px rgba(8, 15, 30, 0.25)',
                borderRadius: '14px',
                padding: isMobileView ? '14px' : '15px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* Üst Rozetler */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.67rem',
                  fontWeight: 800,
                  background: 'rgba(2, 132, 199, 0.25)',
                  color: '#7dd3fc',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.38)'
                }}>
                  {vehicle.category}
                </span>
                {partnerPricing ? (
                  <span style={{
                    fontSize: '0.67rem',
                    fontWeight: 900,
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: '#4ade80',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.55)'
                  }}>
                    🏷️ {partnerPricing.discountBadgeText}
                  </span>
                ) : vehicle.cashDiscount > 0 && vehicle.currency !== 'EUR' ? (
                  <span style={{
                    fontSize: '0.67rem',
                    fontWeight: 900,
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(34, 197, 94, 0.4)'
                  }}>
                    -{vehicle.cashDiscount.toLocaleString('tr-TR')} TL Nakit İndirimi
                  </span>
                ) : vehicle.isCustomPrice ? (
                  <span style={{
                    fontSize: '0.67rem',
                    fontWeight: 800,
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 158, 11, 0.4)'
                  }}>
                    ⭐ Özel Proje Fiyatı
                  </span>
                ) : null}
              </div>

              {/* Halk Dili Başlığı + Araç Görseli */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: isMobileView ? '1.06rem' : '1.02rem', fontWeight: 900, color: '#ffffff', margin: '0 0 4px', lineHeight: 1.25 }}>
                      {friendlyInfo.title}
                    </h3>
                    <div style={{ fontSize: '0.76rem', color: '#86efac', fontWeight: 800, lineHeight: 1.3 }}>
                      {friendlyInfo.subtitle}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px', fontWeight: 600 }}>
                      Fabrika Kodu: {vehicle.model}
                    </div>
                  </div>
                  {sticker && (
                    <div
                      style={{
                        width: isMobileView ? '76px' : '72px',
                        height: isMobileView ? '52px' : '50px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '2px solid rgba(56, 189, 248, 0.65)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px'
                      }}
                      title={sticker.label}
                    >
                      <img
                        src={sticker.src}
                        alt={sticker.label}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '7px',
                          display: 'block'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Net Fiyat Kutusu */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.78)',
                border: partnerPricing ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(148, 163, 184, 0.24)',
                borderRadius: '10px',
                padding: isMobileView ? '11px 12px' : '10px 12px',
                marginBottom: '10px'
              }}>
                {vehicle.isCustomPrice ? (
                  <div style={{ textAlign: 'center', padding: '4px 0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>
                      ⭐ 10 TEKER PROJEYE ÖZEL ŞANTİYE FİYATI
                    </div>
                    <div style={{ fontSize: isMobileView ? '1.04rem' : '0.98rem', fontWeight: 900, color: '#fef08a', marginTop: '2px' }}>
                      Satış Sorumlusu Can Murat ile Görüşün
                    </div>
                  </div>
                ) : vehicle.currency === 'EUR' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 800 }}>
                        {partnerPricing ? `NET ${partnerProtocol.shortName.toUpperCase()} FİYATI` : 'NET EURO FİYATI (+KDV)'}
                      </div>
                      <div style={{ fontSize: isMobileView ? '1.2rem' : '1.12rem', color: '#38bdf8', fontWeight: 900 }}>
                        €{(partnerPricing ? partnerPricing.finalEur : (vehicle.eurPrice || vehicle.cashPrice)).toLocaleString('tr-TR')}{' '}
                        <span style={{ fontSize: '0.84rem', color: '#4ade80', fontWeight: 800 }}>
                          ({(partnerPricing ? partnerPricing.finalTl : Math.round((vehicle.eurPrice || vehicle.cashPrice) * tcmbEurRate)).toLocaleString('tr-TR')} TL)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : partnerPricing ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 900, display: 'block' }}>
                        NET {partnerProtocol.shortName.toUpperCase()} ÜYE FİYATI:
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        {partnerPricing.baseCash.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    <span style={{ fontSize: isMobileView ? '1.3rem' : '1.2rem', color: '#4ade80', fontWeight: 900 }}>
                      {partnerPricing.finalCash.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                ) : vehicle.campaignPrice ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: vehicle.cashDiscount > 0 ? '#4ade80' : '#38bdf8', fontWeight: 900, display: 'block' }}>
                        {vehicle.cashDiscount > 0 ? 'NAKİT / PEŞİN FİYATI:' : 'NET FİYAT (KDV Dahil):'}
                      </span>
                      {vehicle.cashDiscount > 0 && (
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                          Liste / Kredili: {vehicle.campaignPrice.toLocaleString('tr-TR')} TL
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: isMobileView ? '1.32rem' : '1.2rem', color: '#4ade80', fontWeight: 900 }}>
                      {vehicle.cashPrice.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#7dd3fc', fontWeight: 700, fontSize: '0.85rem' }}>
                    Özel Teklif İçin Danışınız
                  </div>
                )}

                {/* Tek Satır KDV Bilgisi + İsteğe Bağlı Detay Açıcı */}
                {!vehicle.isCustomPrice && (
                  <div style={{
                    marginTop: '7px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(148, 163, 184, 0.16)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}>
                      {vatShieldTl > 0 ? (
                        <span style={{ fontSize: '0.71rem', color: '#fcd34d', fontWeight: 800 }}>
                          🧾 Vergiden Düşülen %20 KDV: ~{vatShieldTl.toLocaleString('tr-TR')} TL
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 700 }}>
                          💶 TCMB Kur: 1 € = {tcmbEurRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleCardDetail(vehicle.id)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: isDetailOpen ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.69rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {isDetailOpen ? 'Detayı Gizle ▴' : 'Teknik & KDV Detayı ▾'}
                      </button>
                    </div>

                    {(isExporterUrl || vehicle.currency === 'EUR') && fullPriceEurForLoan > 0 && (
                      <div style={{
                        fontSize: '0.69rem',
                        color: '#93c5fd',
                        fontWeight: 800,
                        background: 'rgba(30, 58, 138, 0.35)',
                        border: '1px solid rgba(96, 165, 250, 0.35)',
                        borderRadius: '6px',
                        padding: '3px 7px'
                      }}>
                        🇪🇺 İhracatçı Euro Kredisi: ~€{fullPriceEurForLoan.toLocaleString('tr-TR')} (36 Ay ~€{monthlyEurPaymentEst.toLocaleString('tr-TR')}/Ay • Kuveyt Türk %0 Kâr Payı Seçeneği)
                      </div>
                    )}

                    <div
                      onClick={() => handleVehicleQuote(vehicle)}
                      style={{
                        fontSize: '0.68rem',
                        color: '#86efac',
                        fontWeight: 800,
                        cursor: 'pointer',
                        lineHeight: 1.3
                      }}
                    >
                      🔥 Peşin, takaslı veya referanslı alıma özel ekstra bayi iskontosu (son dip fiyat) için yeşil tuşa dokunun 👇
                    </div>
                  </div>
                )}

                {/* Açılır Teknik & Muhasebe Detayı (Varsayılan Gizli) */}
                {isDetailOpen && (
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.73rem',
                    color: '#e2e8f0'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', background: 'rgba(15, 23, 42, 0.55)', padding: '7px 8px', borderRadius: '8px' }}>
                      <div>⚙️ <strong>Vites:</strong> {vehicle.transmission || 'Manuel'}</div>
                      <div>🐎 <strong>Motor:</strong> {vehicle.engine || '-'}</div>
                      <div>⚡ <strong>Güç:</strong> {vehicle.power ? vehicle.power.split('(')[1]?.replace(')', '') || vehicle.power : '-'}</div>
                      <div>📏 <strong>Dingil:</strong> {vehicle.wheelbase ? `${vehicle.wheelbase} mm` : '-'}</div>
                    </div>

                    {vatShieldTl > 0 && (
                      <div style={{
                        background: 'rgba(5, 150, 105, 0.14)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        fontSize: '0.68rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#cbd5e1' }}>KDV Hariç Fatura Matrahı:</span>
                          <strong>{Math.round(effectiveTlPrice - vatShieldTl).toLocaleString('tr-TR')} TL</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fde047' }}>
                          <span>İndirilecek %20 KDV:</span>
                          <strong>{vatShieldTl.toLocaleString('tr-TR')} TL</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86efac' }}>
                          <span>1. Yıl %20 Tam Amortisman:</span>
                          <strong>{Math.round((effectiveTlPrice - vatShieldTl) * 0.20).toLocaleString('tr-TR')} TL</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenTaxModal(vehicle)}
                            style={{
                              flex: 1,
                              background: 'rgba(245, 158, 11, 0.22)',
                              border: '1px solid rgba(245, 158, 11, 0.5)',
                              color: '#fde68a',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '0.67rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            📊 KDV Tablosunu Aç
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWithPartner(vehicle, effectiveTlPrice, vatShieldTl, remainingAfterTradeIn, monthlyPaymentEst)}
                            style={{
                              flex: 1,
                              background: 'rgba(16, 185, 129, 0.22)',
                              border: '1px solid rgba(16, 185, 129, 0.5)',
                              color: '#6ee7b7',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '0.67rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            📤 Muhasebeye Gönder
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 💳 KART İÇİ ANINDA TAKSİT & TAKAS HESAPLAYICI (TL + İHRACATÇI EURO KREDİSİ + 6 AY ERTELEME DESTEKLİ!) */}
              {isInlineCalcOpen && !vehicle.isCustomPrice && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.96)',
                  border: inlineCalcCurrency === 'EUR' ? '1.5px solid #60a5fa' : '1.5px solid #38bdf8',
                  borderRadius: '11px',
                  padding: '10px 11px',
                  marginBottom: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: inlineCalcCurrency === 'EUR' ? '#93c5fd' : '#38bdf8' }}>
                      {inlineCalcCurrency === 'EUR'
                        ? '🇪🇺 İhracatçı Euro (€) Kredi & Takas Hesaplayıcı'
                        : `💳 ${lockedBank ? `${lockedBank.shortName} Kredi` : 'Taksit & Takas'} Hesaplayıcı`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveInlineCalcId(null)}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#cbd5e1',
                        borderRadius: '5px',
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Kapat
                    </button>
                  </div>

                  {/* 🇹🇷 TL KREDİ | 💶 İHRACATÇI EURO (€) KREDİSİ SEÇİCİ */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.15fr',
                    gap: '5px',
                    background: 'rgba(2, 6, 23, 0.85)',
                    padding: '4px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <button
                      type="button"
                      onClick={() => setInlineCalcCurrency('TRY')}
                      style={{
                        padding: '6px 6px',
                        borderRadius: '6px',
                        border: inlineCalcCurrency === 'TRY' ? '1.5px solid #38bdf8' : 'none',
                        background: inlineCalcCurrency === 'TRY' ? 'rgba(2, 132, 199, 0.35)' : 'transparent',
                        color: inlineCalcCurrency === 'TRY' ? '#ffffff' : '#94a3b8',
                        fontSize: '0.69rem',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                    >
                      🇹🇷 TL Ticari Kredi
                    </button>
                    <button
                      type="button"
                      onClick={() => setInlineCalcCurrency('EUR')}
                      style={{
                        padding: '6px 6px',
                        borderRadius: '6px',
                        border: inlineCalcCurrency === 'EUR' ? '1.5px solid #60a5fa' : 'none',
                        background: inlineCalcCurrency === 'EUR'
                          ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.5) 0%, rgba(30, 58, 138, 0.85) 100%)'
                          : 'transparent',
                        color: inlineCalcCurrency === 'EUR' ? '#fef08a' : '#94a3b8',
                        fontSize: '0.69rem',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                    >
                      💶 İhracatçı Euro (€) Kredisi
                    </button>
                  </div>

                  {inlineCalcCurrency === 'EUR' ? (
                    <>
                      {/* Euro Peşinat / Takas Seçimi */}
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#fde68a', fontWeight: 800, marginBottom: '4px' }}>
                          1. Euro (€) Peşinat veya Takas Değeriniz:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                          {[0, 15000, 30000, 50000, 75000].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setEurTradeInValue(preset)}
                              style={{
                                padding: '4px 7px',
                                borderRadius: '6px',
                                fontSize: '0.67rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                background: Number(eurTradeInValue) === preset ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                                color: Number(eurTradeInValue) === preset ? '#0f172a' : '#e2e8f0',
                                border: Number(eurTradeInValue) === preset ? '1px solid #fde047' : '1px solid rgba(255,255,255,0.15)'
                              }}
                            >
                              {preset === 0 ? 'Peşinatsız' : `€${preset.toLocaleString('tr-TR')}`}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          step={5000}
                          min={0}
                          value={eurTradeInValue}
                          onChange={(e) => setEurTradeInValue(Math.max(0, Number(e.target.value) || 0))}
                          placeholder="Peşinat veya takas tutarı yazın (€)"
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            background: 'rgba(2, 6, 23, 0.9)',
                            border: '1px solid rgba(96, 165, 250, 0.45)',
                            borderRadius: '7px',
                            color: '#fde047',
                            fontSize: '0.82rem',
                            fontWeight: 900
                          }}
                        />
                      </div>

                      {/* Euro Ödeme Başlangıcı: Hemen Taksit vs 6 Ay Erteleme */}
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 800, marginBottom: '4px' }}>
                          2. Ödeme Başlangıcı (Kuveyt Türk / Garanti BBVA):
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '5px' }}>
                          <button
                            type="button"
                            onClick={() => setInlineEurGraceMonths(0)}
                            style={{
                              padding: '6px 6px',
                              borderRadius: '7px',
                              fontSize: '0.67rem',
                              fontWeight: 900,
                              cursor: 'pointer',
                              background: inlineEurGraceMonths === 0 ? 'rgba(37, 99, 235, 0.35)' : 'rgba(255,255,255,0.06)',
                              color: inlineEurGraceMonths === 0 ? '#ffffff' : '#94a3b8',
                              border: inlineEurGraceMonths === 0 ? '1.5px solid #60a5fa' : '1px solid rgba(255,255,255,0.12)'
                            }}
                          >
                            ⚡ Hemen Eşit Taksit (12-24 Ay %0)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInlineEurGraceMonths(6);
                              if (activeEurTerm < 18) setEurLoanTerm(24);
                            }}
                            style={{
                              padding: '6px 6px',
                              borderRadius: '7px',
                              fontSize: '0.67rem',
                              fontWeight: 900,
                              cursor: 'pointer',
                              background: inlineEurGraceMonths === 6 ? 'rgba(245, 158, 11, 0.28)' : 'rgba(255,255,255,0.06)',
                              color: inlineEurGraceMonths === 6 ? '#fde047' : '#94a3b8',
                              border: inlineEurGraceMonths === 6 ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)'
                            }}
                          >
                            ⏳ 6 Ay Erteleme (İlk 6 Ay 0 €)
                          </button>
                        </div>
                      </div>

                      {/* Euro Vade Seçimi */}
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 800, marginBottom: '4px' }}>
                          3. Euro (€) Taksit Sayısı Seçin:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                          {(inlineEurGraceMonths === 6
                            ? [
                                { t: 18, label: '6+18 Ay' },
                                { t: 24, label: '6+24 Ay' },
                                { t: 36, label: '6+36 Ay' },
                                { t: 48, label: '6+48 Ay' }
                              ]
                            : [
                                { t: 12, label: '12 Ay (%0)' },
                                { t: 24, label: remainingEurAfterTradeIn <= 80000 ? '24 Ay (%0)' : '24 Ay' },
                                { t: 36, label: '36 Ay' },
                                { t: 48, label: '48 Ay' }
                              ]
                          ).map(item => (
                            <button
                              key={item.t}
                              type="button"
                              onClick={() => setEurLoanTerm(item.t)}
                              style={{
                                padding: '6px 4px',
                                borderRadius: '7px',
                                fontSize: '0.68rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                background: activeEurTerm === item.t ? '#2563eb' : 'rgba(255,255,255,0.07)',
                                color: '#fff',
                                border: activeEurTerm === item.t ? '1.5px solid #93c5fd' : '1px solid rgba(255,255,255,0.15)'
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Euro Sonuç Özeti */}
                      <div style={{
                        background: 'rgba(30, 58, 138, 0.35)',
                        border: '1px solid rgba(96, 165, 250, 0.48)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71rem', color: '#cbd5e1' }}>
                          <span>Araç Euro Karşılığı:</span>
                          <strong>~€{fullPriceEurForLoan.toLocaleString('tr-TR')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71rem', color: '#fde68a' }}>
                          <span>Peşinat / Takas:</span>
                          <strong>-€{(Number(eurTradeInValue) || 0).toLocaleString('tr-TR')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#93c5fd', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3px' }}>
                          <span>Kullandırılacak Euro Kredi:</span>
                          <strong>€{remainingEurAfterTradeIn.toLocaleString('tr-TR')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#bfdbfe' }}>
                          <span>Uygulanan Aylık Oran:</span>
                          <strong style={{ color: appliedEurRatePct === 0 ? '#4ade80' : '#fde047' }}>
                            {appliedEurRatePct === 0 ? '%0 Kâr Payı / Faiz' : `Aylık %${appliedEurRatePct.toFixed(2)}`}
                          </strong>
                        </div>
                        {inlineEurGraceMonths === 6 && remainingEurAfterTradeIn > 0 && (
                          <div style={{
                            background: 'rgba(245, 158, 11, 0.18)',
                            border: '1px solid rgba(245, 158, 11, 0.45)',
                            borderRadius: '6px',
                            padding: '4px 7px',
                            fontSize: '0.67rem',
                            color: '#fde047',
                            fontWeight: 800,
                            marginTop: '2px'
                          }}>
                            ⏳ 1. – 6. Ay Arası: <strong>0 € Ödeme</strong> • 7. Aydan İtibaren {activeEurTerm} Eşit Taksit (Toplam {activeEurTerm + 6} Ay)
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#93c5fd' }}>
                            {inlineEurGraceMonths === 6 ? `7. Aydan İtibaren (${activeEurTerm} Ay):` : `${activeEurTerm} Ay Euro Taksit:`}
                          </span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#4ade80' }}>
                            {remainingEurAfterTradeIn > 0 ? `~€${monthlyEurPaymentEst.toLocaleString('tr-TR')} / Ay` : 'Kredi Yok'}
                          </span>
                        </div>
                        {remainingEurAfterTradeIn > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', color: '#94a3b8' }}>
                            <span>Toplam Geri Ödeme:</span>
                            <strong>~€{totalEurRepaymentEst.toLocaleString('tr-TR')}</strong>
                          </div>
                        )}
                      </div>

                      {/* Euro Hesaplayıcı İçi Hızlı Gönderim Butonları */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTradeInVehicleId(vehicle.id);
                            setTradeInTargetModel(friendlyInfo.title);
                            setShowTradeInBox(true);
                            setTimeout(() => {
                              const el = document.getElementById('tradein-loan-calc-box');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 80);
                          }}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '7px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid rgba(245, 158, 11, 0.5)',
                            color: '#fde68a',
                            fontSize: '0.69rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          📸 Takas Resmi Yükle
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const graceLabel = inlineEurGraceMonths === 6 ? '6 Ay Ödemesiz + ' : '';
                            if (onTrackFootprint) {
                              onTrackFootprint(
                                '💶 Kart İçi İhracatçı Euro Kredisi & Dip Fiyat Soruldu',
                                vehicle.model,
                                `Euro Peşinat: €${(Number(eurTradeInValue) || 0).toLocaleString('tr-TR')} | Euro Kredi: €${remainingEurAfterTradeIn.toLocaleString('tr-TR')} (${graceLabel}${activeEurTerm} Ay x ~€${monthlyEurPaymentEst.toLocaleString('tr-TR')}/Ay)`
                              );
                            }
                            const msg =
                              `Merhaba ${salesRep?.name || 'Satış Sorumlusu Can Murat'}, ihracatçı firmamız için *${friendlyInfo.title}* (${vehicle.model}) aracıyla ilgileniyoruz:\n` +
                              `• Araç Euro Karşılığı: ~€${fullPriceEurForLoan.toLocaleString('tr-TR')} (${fullPriceForLoan.toLocaleString('tr-TR')} TL)\n` +
                              `• Peşinat / Takasımız: €${(Number(eurTradeInValue) || 0).toLocaleString('tr-TR')}\n` +
                              `• İhracatçı Euro Kredisi: €${remainingEurAfterTradeIn.toLocaleString('tr-TR')} (${graceLabel}${activeEurTerm} Ay ~€${monthlyEurPaymentEst.toLocaleString('tr-TR')}/Ay • Oran: %${appliedEurRatePct.toFixed(2)})\n` +
                              `İhracatçı Euro kredisi (Kuveyt Türk / Garanti BBVA / Albaraka Türk / DenizBank) ve firmanıza özel son dip fiyat teklifinizi paylaşabilir misiniz?`;
                            if (onDirectWhatsApp) {
                              onDirectWhatsApp(msg);
                            } else {
                              openWhatsAppChat(salesRep?.phoneWhatsapp || '905446225931', msg);
                            }
                          }}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '7px',
                            background: '#22c55e',
                            border: 'none',
                            color: '#052e16',
                            fontSize: '0.69rem',
                            fontWeight: 900,
                            cursor: 'pointer'
                          }}
                        >
                          💬 Euro Kredi & Dip Fiyatı Sor
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* TL Peşinat / Takas Seçimi */}
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#fde68a', fontWeight: 800, marginBottom: '4px' }}>
                          1. Peşinatınız veya Takas Aracınızın Değeri:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                          {[0, 500000, 1000000, 1500000, 2000000, 3000000].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setTradeInValue(preset);
                                if (onTrackFootprint) {
                                  onTrackFootprint(
                                    'Kart İçi Peşinat Seçildi',
                                    vehicle.model,
                                    preset === 0 ? 'Peşinatsız Kredi Hesabı' : `Peşinat/Takas: ${(preset / 1000000).toLocaleString('tr-TR')} Milyon TL`
                                  );
                                }
                              }}
                              style={{
                                padding: '4px 7px',
                                borderRadius: '6px',
                                fontSize: '0.67rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                background: Number(tradeInValue) === preset ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                                color: Number(tradeInValue) === preset ? '#0f172a' : '#e2e8f0',
                                border: Number(tradeInValue) === preset ? '1px solid #fde047' : '1px solid rgba(255,255,255,0.15)'
                              }}
                            >
                              {preset === 0 ? 'Peşinatsız' : `${(preset / 1000000).toLocaleString('tr-TR')} Milyon`}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          step={50000}
                          min={0}
                          value={tradeInValue}
                          onChange={(e) => setTradeInValue(Math.max(0, Number(e.target.value) || 0))}
                          placeholder="Peşinat veya takas tutarı yazın (TL)"
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            background: 'rgba(2, 6, 23, 0.9)',
                            border: '1px solid rgba(245, 158, 11, 0.45)',
                            borderRadius: '7px',
                            color: '#fde047',
                            fontSize: '0.82rem',
                            fontWeight: 900
                          }}
                        />
                      </div>

                      {/* ⏳ 2. ADIM: Ödeme Başlangıcı (Hemen Taksit vs 6 Ay Ödemesiz / Ertelemeli) */}
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 800, marginBottom: '4px' }}>
                          2. İlk Taksit Ne Zaman Başlasın?
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '5px' }}>
                          <button
                            type="button"
                            onClick={() => setInlineGraceMonths(0)}
                            style={{
                              padding: '6px 6px',
                              borderRadius: '7px',
                              fontSize: '0.68rem',
                              fontWeight: 900,
                              cursor: 'pointer',
                              background: inlineGraceMonths === 0 ? 'rgba(2, 132, 199, 0.35)' : 'rgba(255,255,255,0.06)',
                              color: inlineGraceMonths === 0 ? '#ffffff' : '#94a3b8',
                              border: inlineGraceMonths === 0 ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)'
                            }}
                          >
                            ⚡ Hemen Başlasın (%0 Faiz Avantajı)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInlineGraceMonths(6);
                              setTradeInTerm(24);
                              if (onTrackFootprint) {
                                onTrackFootprint(
                                  '⏳ Kart İçi 6 Ay Erteleme Seçildi',
                                  vehicle.model,
                                  `İlk 6 Ay 0 TL Taksit + 24 Ay Vade`
                                );
                              }
                            }}
                            style={{
                              padding: '6px 6px',
                              borderRadius: '7px',
                              fontSize: '0.68rem',
                              fontWeight: 900,
                              cursor: 'pointer',
                              background: inlineGraceMonths === 6 ? 'rgba(245, 158, 11, 0.28)' : 'rgba(255,255,255,0.06)',
                              color: inlineGraceMonths === 6 ? '#fde047' : '#94a3b8',
                              border: inlineGraceMonths === 6 ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)'
                            }}
                          >
                            ⏳ 6 Ay Erteleme (İlk 6 Ay 0 TL)
                          </button>
                        </div>
                      </div>

                      {/* TL Vade Seçimi */}
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 800, marginBottom: '4px' }}>
                          3. Kaç Ay Taksit Olsun?
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: inlineGraceMonths === 6 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '5px' }}>
                          {(inlineGraceMonths === 6
                            ? [
                                { t: 24, label: '6 Ay Erteleme + 24 Taksit' },
                                { t: 36, label: '6 Ay Erteleme + 36 Taksit' }
                              ]
                            : [
                                { t: 6, label: remainingAfterTradeIn <= zeroCapTl ? '6 Ay (%0)' : '6 Ay' },
                                { t: 12, label: remainingAfterTradeIn <= zeroCapTl ? '12 Ay (%0)' : '12 Ay' },
                                { t: 24, label: '24 Ay' },
                                { t: 36, label: '36 Ay' }
                              ]
                          ).map(item => (
                            <button
                              key={item.t}
                              type="button"
                              onClick={() => {
                                setTradeInTerm(item.t);
                                if (onTrackFootprint) {
                                  onTrackFootprint(
                                    'Kart İçi Vade Seçildi',
                                    vehicle.model,
                                    `${inlineGraceMonths === 6 ? '6 Ay Ertelemeli ' : ''}${item.t} Ay Vade`
                                  );
                                }
                              }}
                              style={{
                                padding: '6px 4px',
                                borderRadius: '7px',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                background: activeTerm === item.t ? '#0284c7' : 'rgba(255,255,255,0.07)',
                                color: '#fff',
                                border: activeTerm === item.t ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)'
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* TL Sonuç Özeti */}
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.14)',
                        border: '1px solid rgba(16, 185, 129, 0.45)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71rem', color: '#cbd5e1' }}>
                          <span>Araç Bedeli:</span>
                          <strong>{fullPriceForLoan.toLocaleString('tr-TR')} TL</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71rem', color: '#fde68a' }}>
                          <span>Peşinat / Takas:</span>
                          <strong>-{(Number(tradeInValue) || 0).toLocaleString('tr-TR')} TL</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#7dd3fc', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3px' }}>
                          <span>Kalan Kredi Tutarı:</span>
                          <strong>{remainingAfterTradeIn.toLocaleString('tr-TR')} TL</strong>
                        </div>
                        {remainingAfterTradeIn > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.69rem', color: '#cbd5e1' }}>
                            <span>IVECO Kampanya Oranı:</span>
                            <strong style={{ color: isZeroInterestEligible ? '#4ade80' : '#fde047' }}>
                              {isZeroInterestEligible
                                ? '%0 Faiz / Kâr Payı (Sübvansiyonlu)'
                                : `Aylık %${appliedTlRatePct.toFixed(2)} (Kuveyt Türk / Albaraka / Garanti / TEB)`}
                            </strong>
                          </div>
                        )}
                        {inlineGraceMonths === 6 && remainingAfterTradeIn > 0 && (
                          <div style={{
                            background: 'rgba(245, 158, 11, 0.18)',
                            border: '1px solid rgba(245, 158, 11, 0.45)',
                            borderRadius: '6px',
                            padding: '4px 7px',
                            fontSize: '0.67rem',
                            color: '#fde047',
                            fontWeight: 800,
                            marginTop: '2px'
                          }}>
                            ⏳ 1. – 6. Ay Arası: <strong>0 TL Taksit</strong> (Aracı hemen teslim alıp çalıştırın, taksit 7. ayda başlasın • Toplam {activeTerm + 6} Ay)
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#6ee7b7' }}>
                            {inlineGraceMonths === 6
                              ? `7. Aydan İtibaren (${activeTerm} Taksit):`
                              : `${activeTerm} Ay Aylık Taksit ${isZeroInterestEligible ? '(%0 Faiz!)' : ''}:`}
                          </span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#4ade80' }}>
                            {remainingAfterTradeIn > 0 ? `~${monthlyPaymentEst.toLocaleString('tr-TR')} TL/Ay` : 'Kredi Yok'}
                          </span>
                        </div>
                        {remainingAfterTradeIn > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', color: '#94a3b8' }}>
                            <span>Toplam Geri Ödeme:</span>
                            <strong>~{totalTlRepaymentEst.toLocaleString('tr-TR')} TL</strong>
                          </div>
                        )}
                      </div>

                      {/* TL Hesaplayıcı İçi Hızlı Gönderim Butonları */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTradeInVehicleId(vehicle.id);
                            setTradeInTargetModel(friendlyInfo.title);
                            setShowTradeInBox(true);
                            setTimeout(() => {
                              const el = document.getElementById('tradein-loan-calc-box');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 80);
                          }}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '7px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid rgba(245, 158, 11, 0.5)',
                            color: '#fde68a',
                            fontSize: '0.69rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          📸 Takas Resmi Yükle
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const gracePrefix = inlineGraceMonths === 6 ? '6 Ay Ödemesiz + ' : '';
                            if (onTrackFootprint) {
                              onTrackFootprint(
                                '🔥 Kart İçi Taksit & Son Dip Fiyat Soruldu',
                                vehicle.model,
                                `Peşinat: ${(Number(tradeInValue) || 0).toLocaleString('tr-TR')} TL | Kredi: ${remainingAfterTradeIn.toLocaleString('tr-TR')} TL (${gracePrefix}${activeTerm} Ay x ${monthlyPaymentEst.toLocaleString('tr-TR')} TL)`
                              );
                            }
                            const msg =
                              `Merhaba ${salesRep?.name || 'Satış Sorumlusu Can Murat'}, *${friendlyInfo.title}* (${vehicle.model}) aracı için:\n` +
                              `• Araç Bedeli: ${fullPriceForLoan.toLocaleString('tr-TR')} TL\n` +
                              `• Peşinat / Takasım: ${(Number(tradeInValue) || 0).toLocaleString('tr-TR')} TL\n` +
                              `• Kalan Kredi: ${remainingAfterTradeIn.toLocaleString('tr-TR')} TL (${gracePrefix}${activeTerm} Ay ~${monthlyPaymentEst.toLocaleString('tr-TR')} TL/Ay • Oran: %${appliedTlRatePct.toFixed(2)})\n` +
                              `Bu ödeme planında bana özel yapabileceğiniz son dip fiyat / ekstra bayi iskontosu nedir?`;
                            if (onDirectWhatsApp) {
                              onDirectWhatsApp(msg);
                            } else {
                              openWhatsAppChat(salesRep?.phoneWhatsapp || '905446225931', msg);
                            }
                          }}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '7px',
                            background: '#22c55e',
                            border: 'none',
                            color: '#052e16',
                            fontSize: '0.69rem',
                            fontWeight: 900,
                            cursor: 'pointer'
                          }}
                        >
                          💬 Son Dip Fiyat & Taksiti Sor
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SADECE 2 NET ANA BUTON (Müşteri Hiç Karıştırmaz!) */}
              <div style={{ display: 'grid', gridTemplateColumns: vehicle.isCustomPrice ? '1fr' : '1fr 1fr', gap: '8px' }}>
                {!vehicle.isCustomPrice && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextId = isInlineCalcOpen ? null : vehicle.id;
                      setActiveInlineCalcId(nextId);
                      if (nextId && (isExporterUrl || vehicle.currency === 'EUR')) {
                        setInlineCalcCurrency('EUR');
                      }
                      setShowSmartNudge(true);
                      if (nextId && onTrackFootprint) {
                        onTrackFootprint('Taksit & Takas Hesapla Açıldı', vehicle.model, friendlyInfo.title);
                      }
                    }}
                    style={{
                      minWidth: 0,
                      background: isInlineCalcOpen
                        ? 'rgba(56, 189, 248, 0.28)'
                        : 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                      color: '#fff',
                      border: isInlineCalcOpen ? '1.5px solid #38bdf8' : 'none',
                      borderRadius: '10px',
                      padding: isMobileView ? '11px 8px' : '10px 10px',
                      fontSize: isMobileView ? '0.78rem' : '0.76rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    💳 {isInlineCalcOpen ? 'Hesabı Kapat ▴' : 'Taksit & Takas Hesapla'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleVehicleQuote(vehicle)}
                  style={{
                    minWidth: 0,
                    background: vehicle.isCustomPrice
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: vehicle.isCustomPrice ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: isMobileView ? '11px 8px' : '10px 10px',
                    fontSize: isMobileView ? '0.76rem' : '0.75rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.28)'
                  }}
                >
                  <FiMessageSquare size={14} style={{ flexShrink: 0 }} />
                  {vehicle.isCustomPrice ? 'Özel Dip Fiyatı Sor' : 'Son Oluru / Dip Fiyatı Sor'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && !(!searchQuery.trim() && ((selectedCategory === 'daily35_chassis' && !showAllKamyonetList) || (selectedCategory === 'daily70' && !showAllDaily70List))) && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          Aradığınız kriterlere uygun araç bulunamadı. Lütfen filtreleri sıfırlayın.
        </div>
      )}

      {/* 👋 12. SANİYEDE ALTTAN ÇIKAN AKILLI CAN MURAT ÖZEL TEKLİF ÇUBUĞU (Sadece Masaüstünde; Mobilde Sabit Alt Barda Entegre) */}
      {showSmartNudge && !dismissedSmartNudge && !isMobileView && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          right: isMobileView ? '10px' : 'auto',
          transform: isMobileView ? 'none' : 'translateX(-50%)',
          width: isMobileView ? 'auto' : 'min(92vw, 680px)',
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
          border: '2px solid #22c55e',
          borderRadius: '14px',
          padding: isMobileView ? '10px 12px' : '12px 16px',
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.65)',
          zIndex: 995,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: isMobileView ? 'wrap' : 'nowrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 900, color: '#4ade80' }}>
              👋 Can Murat — IVECO ERC Samsun (0544 622 59 31)
            </div>
            <div style={{ fontSize: isMobileView ? '0.75rem' : '0.8rem', color: '#f8fafc', fontWeight: 700, marginTop: '2px', lineHeight: 1.3 }}>
              İncelediğiniz araçta liste fiyatının altında <strong>ekstra bayi iskontosu</strong> veya <strong>takas desteği</strong> tanımlayabilirim.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: isMobileView ? '100%' : 'auto', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                const activeVeh = filteredVehicles.find(v => v.id === activeInlineCalcId) || filteredVehicles[0] || IVECO_PRICING_CATALOG[0];
                if (activeVeh) handleVehicleQuote(activeVeh);
              }}
              style={{
                flex: isMobileView ? 1 : 'initial',
                background: '#22c55e',
                color: '#052e16',
                border: 'none',
                borderRadius: '9px',
                padding: '9px 14px',
                fontSize: '0.77rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <FiMessageSquare size={14} /> 💬 Son Oluru / Dip Fiyatı Sor
            </button>

            <button
              type="button"
              onClick={() => setDismissedSmartNudge(true)}
              title="Kapat"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 🧾 YIL SONU KDV HESAPLAMA, TAM AMORTİSMAN & 2026 KAMPANYA TABLOSU MODAL */}
      {isTaxModalOpen && (() => {
        const selectedModalVeh = tradeInCatalogModels.find(v => v.id === taxModalVehicleId) || tradeInCatalogModels[0];
        const modalPartnerPricing = partnerProtocol
          ? calculatePartnerVehiclePricing(selectedModalVeh, partnerProtocol, tcmbEurRate)
          : null;
        const baseInvoiceTl = selectedModalVeh?.currency === 'EUR'
          ? Math.round(((modalPartnerPricing ? modalPartnerPricing.finalEur : (selectedModalVeh.eurPrice || selectedModalVeh.cashPrice || 123000)) * tcmbEurRate) * 1.20)
          : (modalPartnerPricing ? modalPartnerPricing.finalCash : (selectedModalVeh?.cashPrice || selectedModalVeh?.campaignPrice || 1925000));
        const activeInvoiceTl = customTaxInvoiceTl > 0 ? Number(customTaxInvoiceTl) : baseInvoiceTl;
        const netMatrahTl = Math.round(activeInvoiceTl / 1.20);
        const kdvAmountTl = activeInvoiceTl - netMatrahTl;
        const firstYearDepTl = Math.round(netMatrahTl * 0.20); // Ticari araçta kıst amortisman yok, %20 tam yıl
        const incomeTaxShieldTl = Math.round(firstYearDepTl * taxEntityRate);
        const totalFirstYearGainTl = kdvAmountTl + incomeTaxShieldTl;

        const bankTag = lockedBank ? `${lockedBank.shortName} • ` : '';
        const getCatalogPrice = (id, fallback) => {
          const item = tradeInCatalogModels.find(v => v.id === id);
          if (!item) return fallback;
          const pp = partnerProtocol ? calculatePartnerVehiclePricing(item, partnerProtocol, tcmbEurRate) : null;
          return pp ? pp.finalCash : (item.cashPrice || item.campaignPrice || fallback);
        };
        const summaryRows = [
          { label: 'Daily 35S16 / 35C16 Şasi (B Ehliyet)', gross: getCatalogPrice('daily-35s16-3450-h', 1925000), campaign: `${bankTag}800.000 TL • 8 Ay %0 Faiz (100.000 ₺/Ay)` },
          { label: 'Daily 35S16 Panelvan (12m³ - 16m³)', gross: getCatalogPrice('daily-35s16-van-3520l-h2', 2150000), campaign: `${bankTag}800.000 TL • 8 Ay %0 Faiz (100.000 ₺/Ay)` },
          { label: 'Daily 70C16 / 72C16 Şasi (7.2 Ton)', gross: getCatalogPrice('daily-70c16-3750-klima', 2390000), campaign: `${bankTag}1.000.000 TL • 12 Ay %0 Faiz (83.333 ₺/Ay)` },
          { label: 'Eurocargo 150E21 / 160E32 Şasi', gross: getCatalogPrice('eurocargo-mlc-150e21-4185', 4080000), campaign: lockedBank ? `${lockedBank.name} Özel Ticari Kredisi` : 'Anlaşmalı Banka & Katılım Kredisi' },
          { label: 'T-Way 12 Teker Beton Mikseri (8x4)', gross: getCatalogPrice('tway-ad410t46-8x4', 5750000), campaign: `${bankTag}5.750.000 TL Nakit / 6.075.000 TL Liste` },
          { label: 'T-Way 12 Teker Hafriyat Damper (8x4)', gross: getCatalogPrice('tway-ad410t54-8x4', 5850000), campaign: `${bankTag}5.850.000 TL Nakit / 6.175.000 TL Liste` },
          { label: 'S-Way 500 / 580 4x2 Çekici (Euro + KDV)', gross: Math.round(123000 * tcmbEurRate * 1.20), campaign: lockedBank ? `${lockedBank.name} Filo Finansmanı` : 'İhracatçı Euro & TL Filo Finansmanı' }
        ];

        const activeLoanShareSummary = selectedModalVeh?.segment === 'Daily 35'
          ? '800.000 TL 8 Ay %0 Faiz (100.000 TL/Ay)'
          : '1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)';

        const handleShareFullTaxTable = () => {
          if (onTrackFootprint) {
            onTrackFootprint(
              '👨‍💼 Yıl Sonu KDV & Kampanya Tablosu Mali Müşavire Gönderildi',
              selectedModalVeh?.model || '2026 Kampanya Tablosu',
              `Fatura: ${activeInvoiceTl.toLocaleString('tr-TR')} TL | KDV: ${kdvAmountTl.toLocaleString('tr-TR')} TL | Toplam 1.Yıl Vergi Avantajı: ${totalFirstYearGainTl.toLocaleString('tr-TR')} TL`
            );
          }
          const bankQuery = lockedBank ? `&bank=${lockedBank.id}` : '';
          const shareUrl = `https://iveco-crm.onrender.com/fiyat-listesi?ref=wa_smmm_tablo${bankQuery}`;
          const msg =
            `👨‍💼 *2026 IVECO Yıl Sonu KDV, Tam Amortisman & Kampanya Tablosu (Mali Müşavir / Muhasebe Özeti)*\n\n` +
            `🚛 *Seçilen Araç:* ${selectedModalVeh?.model || 'IVECO 2026 Ticari Şasi'}\n` +
            `💰 *Fatura Toplamı (KDV Dahil):* ${activeInvoiceTl.toLocaleString('tr-TR')} TL\n` +
            `📐 *KDV Hariç Net Matrah:* ${netMatrahTl.toLocaleString('tr-TR')} TL\n` +
            `🧾 *1. İndirilecek %20 KDV (Tek Seferde Mahsup):* *${kdvAmountTl.toLocaleString('tr-TR')} TL*\n` +
            `📉 *2. 1. Yıl Tam Amortisman Gideri (%20 - Kıst Amortisman Yok):* *${firstYearDepTl.toLocaleString('tr-TR')} TL*\n` +
            `🏦 *3. Kurumlar/Gelir Vergisi Kalkanı (%${Math.round(taxEntityRate * 100)}):* *~${incomeTaxShieldTl.toLocaleString('tr-TR')} TL*\n` +
            `✅ *1. Yıl Toplam KDV + Vergi Avantajı:* *~${totalFirstYearGainTl.toLocaleString('tr-TR')} TL*\n\n` +
            `⚡ *Kritik Yıl Sonu Avantajı:* Ticari şasi alımlarında binek araçtaki kıst amortisman ve gider kısıtlaması yoktur. Üstyapının (kasa/frigo/tente) bitmesini beklemeden *ŞASİ faturası hemen kesilip* 2026 vergisinden düşülebilir.\n` +
            `💳 *Aktif Kredi Kampanyası:* ${lockedBank ? `${lockedBank.name} • ` : ''}${activeLoanShareSummary}\n\n` +
            `📞 *Yetkili:* Satış Sorumlusu Can Murat — 0544 622 59 31 (IVECO ERC Samsun Otomotiv)\n` +
            `👇 *Canlı katalog ve tüm modellerin KDV tablosu:*\n${shareUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
        };

        return (
          <div
            onClick={() => setIsTaxModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(2, 6, 23, 0.84)',
              backdropFilter: 'blur(5px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobileView ? '10px' : '18px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '720px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'linear-gradient(165deg, #0f172a 0%, #172554 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.55)',
                borderRadius: '16px',
                padding: isMobileView ? '14px' : '20px',
                color: '#f8fafc',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#fde047',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    marginBottom: '4px'
                  }}>
                    👨‍💼 MALİ MÜŞAVİR & İŞLETME VERGİ KALKANI REHBERİ
                  </span>
                  <h3 style={{ margin: 0, fontSize: isMobileView ? '1rem' : '1.18rem', fontWeight: 900, color: '#ffffff' }}>
                    🧾 Yıl Sonu %20 KDV Hesaplama & 2026 Kampanya Tablosu
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTaxModalOpen(false)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    color: '#fca5a5',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  ✕ Kapat
                </button>
              </div>

              {/* 3 Kritik Vergi & Şasi Faturası Avantajı */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '14px'
              }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(250, 204, 21, 0.35)', borderRadius: '10px', padding: '9px 10px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#fde047' }}>1️⃣ %20 KDV Tek Seferde İndirilir</div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.35 }}>
                    Binek araçların aksine ticari şasi/panelvan/çekici faturasındaki <strong>%20 KDV’nin tamamı</strong> ödenecek KDV’den doğrudan mahsup edilir.
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '10px', padding: '9px 10px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#4ade80' }}>2️⃣ Kıst Amortisman Cezası Yoktur</div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.35 }}>
                    Yılın son ayında bile alınsa <strong>1. yıl tam (%20) amortisman</strong> gider yazılır; binek araç gider kısıtlamasına takılmaz.
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '10px', padding: '9px 10px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#38bdf8' }}>3️⃣ Üstyapıyı Beklemeden Şasi Faturası</div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.35 }}>
                    Kasa/frigo imalatını beklemeden <strong>ŞASİ faturanızı hemen kesiyoruz</strong>; 2026 vergi avantajını kaçırmadan üstyapıyı yaptırabilirsiniz.
                  </div>
                </div>
              </div>

              {/* Canlı KDV & Vergi Kalkanı Hesaplama Kutusu */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '12px',
                padding: isMobileView ? '11px' : '14px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#7dd3fc', marginBottom: '8px' }}>
                  🧮 Canlı Model & Fatura KDV / Amortisman Hesaplayıcı
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1.3fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, marginBottom: '3px' }}>
                      1. 2026 IVECO Modeli Seçin:
                    </label>
                    <select
                      value={taxModalVehicleId}
                      onChange={(e) => {
                        setTaxModalVehicleId(e.target.value);
                        setCustomTaxInvoiceTl(0);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 9px',
                        borderRadius: '8px',
                        background: '#020617',
                        border: '1px solid rgba(56, 189, 248, 0.45)',
                        color: '#fff',
                        fontSize: '0.76rem',
                        fontWeight: 800
                      }}
                    >
                      {tradeInCatalogModels.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.model} ({m.currency === 'EUR' ? `€${(m.eurPrice || m.cashPrice).toLocaleString('tr-TR')}+KDV` : `${(m.cashPrice || m.campaignPrice).toLocaleString('tr-TR')} TL`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, marginBottom: '3px' }}>
                      2. Fatura Tutarı (KDV Dahil TL):
                    </label>
                    <input
                      type="number"
                      value={activeInvoiceTl}
                      step={50000}
                      onChange={(e) => setCustomTaxInvoiceTl(Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 9px',
                        borderRadius: '8px',
                        background: '#020617',
                        border: '1px solid rgba(16, 185, 129, 0.5)',
                        color: '#4ade80',
                        fontSize: '0.82rem',
                        fontWeight: 900
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, marginBottom: '3px' }}>
                      3. Vergi Mükellefiyet Türü:
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[
                        { rate: 0.25, label: 'Kurumlar (%25)' },
                        { rate: 0.35, label: 'Şahıs/Gelir (%35)' }
                      ].map(opt => (
                        <button
                          key={opt.rate}
                          type="button"
                          onClick={() => setTaxEntityRate(opt.rate)}
                          style={{
                            flex: 1,
                            padding: '8px 6px',
                            borderRadius: '8px',
                            border: taxEntityRate === opt.rate ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)',
                            background: taxEntityRate === opt.rate ? 'rgba(245, 158, 11, 0.22)' : '#020617',
                            color: taxEntityRate === opt.rate ? '#fde047' : '#cbd5e1',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hesaplama Sonuç Kartları */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobileView ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                  gap: '8px'
                }}>
                  <div style={{ background: 'rgba(2, 6, 23, 0.8)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.2)' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>KDV Hariç Net Matrah</div>
                    <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 900, marginTop: '2px' }}>
                      {netMatrahTl.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.14)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.45)' }}>
                    <div style={{ fontSize: '0.65rem', color: '#fde047', fontWeight: 800 }}>🧾 İndirilecek %20 KDV</div>
                    <div style={{ fontSize: '0.96rem', color: '#fde047', fontWeight: 900, marginTop: '2px' }}>
                      {kdvAmountTl.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.14)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.4)' }}>
                    <div style={{ fontSize: '0.65rem', color: '#7dd3fc', fontWeight: 800 }}>📉 1. Yıl Tam Amortisman (%20)</div>
                    <div style={{ fontSize: '0.92rem', color: '#38bdf8', fontWeight: 900, marginTop: '2px' }}>
                      {firstYearDepTl.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.18)', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #10b981' }}>
                    <div style={{ fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 800 }}>✅ 1. Yıl Toplam KDV + Vergi Kalkanı</div>
                    <div style={{ fontSize: '0.98rem', color: '#4ade80', fontWeight: 900, marginTop: '2px' }}>
                      ~{totalFirstYearGainTl.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>
              </div>

              {/* 2026 Kampanya & KDV Özet Tablosu */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#f8fafc', marginBottom: '6px' }}>
                  📊 2026 IVECO Ana Segmentler KDV, Amortisman & Kredi Kampanya Tablosu
                </div>
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.25)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobileView ? '0.68rem' : '0.73rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(2, 6, 23, 0.9)', color: '#94a3b8' }}>
                        <th style={{ padding: '7px 8px' }}>Segment / Model</th>
                        <th style={{ padding: '7px 8px' }}>Örnek Fatura</th>
                        <th style={{ padding: '7px 8px', color: '#fde047' }}>%20 İndirilecek KDV</th>
                        <th style={{ padding: '7px 8px', color: '#4ade80' }}>1. Yıl Amortisman</th>
                        <th style={{ padding: '7px 8px', color: '#7dd3fc' }}>Aktif Kredi Kampanyası</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryRows.map((r, i) => {
                        const net = Math.round(r.gross / 1.20);
                        const kdv = r.gross - net;
                        const dep = Math.round(net * 0.20);
                        return (
                          <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: i % 2 === 0 ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.3)' }}>
                            <td style={{ padding: '7px 8px', fontWeight: 800, color: '#fff' }}>{r.label}</td>
                            <td style={{ padding: '7px 8px', color: '#cbd5e1' }}>~{r.gross.toLocaleString('tr-TR')} ₺</td>
                            <td style={{ padding: '7px 8px', fontWeight: 900, color: '#fde047' }}>~{kdv.toLocaleString('tr-TR')} ₺</td>
                            <td style={{ padding: '7px 8px', fontWeight: 800, color: '#4ade80' }}>~{dep.toLocaleString('tr-TR')} ₺</td>
                            <td style={{ padding: '7px 8px', color: '#bae6fd', fontWeight: 700 }}>{r.campaign}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1.3fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleShareFullTaxTable}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#052e16',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  👨‍💼 Bu KDV & Kampanya Tablosunu Mali Müşavirime / Muhasebecime Gönder
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTaxModalOpen(false);
                    if (selectedModalVeh) handleVehicleQuote(selectedModalVeh);
                  }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  ⚡ Yıl Bitmeden Şasi Faturası & Proforma İste (Can Murat)
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
