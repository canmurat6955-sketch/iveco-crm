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
    id: 'all',
    title: 'Tüm Araçlar',
    licenseBadge: '22 Model',
    label: 'Tüm Araçlar',
    shortLabel: 'Tümü',
    images: ['/vehicles/daily-35s-sasi.jpg', '/vehicles/eurocargo-100-120.jpg', '/vehicles/sway-cekici.jpg?v=2']
  },
  {
    id: 'daily35_chassis',
    title: 'Daily 35 Şasi',
    licenseBadge: '(B Ehliyet)',
    label: 'Daily 35 Şasi (B Ehliyet)',
    shortLabel: 'Daily 35 Şasi',
    image: '/vehicles/daily-35s-sasi.jpg'
  },
  {
    id: 'daily35_van',
    title: 'Daily Panelvan',
    licenseBadge: '(B Ehliyet)',
    label: 'Daily Panelvan (B Ehliyet)',
    shortLabel: 'Daily Panelvan',
    image: '/vehicles/daily-panelvan.jpg'
  },
  {
    id: 'daily70',
    title: 'Daily 70C / 72C',
    licenseBadge: '(7 Ton • C Ehliyet)',
    label: 'Daily 70C / 72C (C Ehliyet)',
    shortLabel: 'Daily 70C / 72C',
    image: '/vehicles/daily-35c-72c.jpg'
  },
  {
    id: 'eurocargo',
    title: 'Eurocargo',
    licenseBadge: '(10–18T • C Ehliyet)',
    label: 'Eurocargo (C Ehliyet)',
    shortLabel: 'Eurocargo',
    image: '/vehicles/eurocargo-100-120.jpg'
  },
  {
    id: 'sway',
    title: 'S-Way Çekici',
    licenseBadge: '(CE Ehliyet)',
    label: 'S-Way Çekici (CE Ehliyet)',
    shortLabel: 'S-Way Çekici',
    image: '/vehicles/sway-cekici.jpg?v=2'
  },
  {
    id: 'tway',
    title: 'T-Way Şantiye',
    licenseBadge: '(10–12T • C Ehliyet)',
    label: 'T-Way Şantiye (C Ehliyet)',
    shortLabel: 'T-Way Şantiye',
    image: '/vehicles/tway-damper.jpg'
  }
];

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

export default function PricingCatalogTab({ initialSector = '', partnerProtocol = null, lockedBank = null, onSelectVehicle, onOpenLoanTab, onDirectWhatsApp, onTrackFootprint, salesRep }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState(() => normalizeSectorId(initialSector));
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyDoubleWheels, setOnlyDoubleWheels] = useState(false);
  const [showTradeInBox, setShowTradeInBox] = useState(false);
  const [tradeInVehicleText, setTradeInVehicleText] = useState('');
  const [tradeInValue, setTradeInValue] = useState(1100000);
  const [tradeInTerm, setTradeInTerm] = useState(24);
  const [selectedTradeInVehicleId, setSelectedTradeInVehicleId] = useState('daily-35c16-3750');
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
  const [showDetailedFilters, setShowDetailedFilters] = useState(() => Boolean(initialSector && normalizeSectorId(initialSector) !== 'all'));
  const [showAllCardDetails, setShowAllCardDetails] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState({});
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxModalVehicleId, setTaxModalVehicleId] = useState('daily-35c16-3750');
  const [customTaxInvoiceTl, setCustomTaxInvoiceTl] = useState(0);
  const [taxEntityRate, setTaxEntityRate] = useState(0.25); // 0.25 (%25 Kurumlar) | 0.35 (%35 Gelir Vergisi)

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
    if (initialSector) {
      setSelectedSectorFilter(normalizeSectorId(initialSector));
    }
  }, [initialSector]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredVehicles = useMemo(() => {
    return IVECO_PRICING_CATALOG.filter(v => {
      // Sector filter (Madde 1: İşinize Göre Hızlı Araç Filtresi)
      if (selectedSectorFilter !== 'all') {
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

      // Category filter
      if (selectedCategory === 'daily35_chassis') {
        if (v.segment !== 'Daily 35' || v.category.includes('Panelvan')) return false;
      } else if (selectedCategory === 'daily35_van') {
        if (v.segment !== 'Daily 35' || !v.category.includes('Panelvan')) return false;
      } else if (selectedCategory === 'daily70') {
        if (v.segment !== 'Daily 70 C' && v.segment !== 'Daily 70' && !v.segment.includes('70') && !v.segment.includes('72')) return false;
      } else if (selectedCategory === 'eurocargo') {
        if (v.segment !== 'Eurocargo') return false;
      } else if (selectedCategory === 'sway') {
        if (v.segment !== 'S-Way') return false;
      } else if (selectedCategory === 'tway') {
        if (v.segment !== 'T-Way') return false;
      }

      // Double wheel filter
      if (onlyDoubleWheels) {
        if (v.segment === 'Daily 35' && !v.category.toLowerCase().includes('çift teker') && !v.model.toLowerCase().includes(' 35 c')) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchModel = v.model.toLowerCase().includes(q);
        const matchCat = v.category.toLowerCase().includes(q);
        const matchEngine = (v.engine || '').toLowerCase().includes(q);
        const matchPower = (v.power || '').toLowerCase().includes(q);
        const matchTrans = (v.transmission || '').toLowerCase().includes(q);
        if (!matchModel && !matchCat && !matchEngine && !matchPower && !matchTrans) return false;
      }

      return true;
    });
  }, [selectedSectorFilter, selectedCategory, searchQuery, onlyDoubleWheels]);

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

    let monthlyPayment = 0;
    let isZeroInterest = false;
    if (remainingPrincipal === 0) {
      monthlyPayment = 0;
    } else if (!isEur && remainingPrincipal <= 1000000 && term === 12) {
      // 1.000.000 TL'ye kadar 12 Ay %0 Faiz avantajı (Hafif Ticari)
      monthlyPayment = Math.round(remainingPrincipal / 12);
      isZeroInterest = true;
    } else {
      const r = 0.0329; // Ortalama anlaşmalı ticari kredi oranı
      const factor = Math.pow(1 + r, term);
      monthlyPayment = Math.round((remainingPrincipal * r * factor) / (factor - 1));
    }

    return {
      vehiclePrice,
      safeTradeVal,
      remainingPrincipal,
      term,
      monthlyPayment,
      isZeroInterest
    };
  }, [selectedTradeVehicle, tradeInValue, tradeInTerm, tcmbEurRate, partnerProtocol]);

  const handleVehicleQuote = (vehicle) => {
    const partnerPricing = partnerProtocol
      ? calculatePartnerVehiclePricing(vehicle, partnerProtocol, tcmbEurRate)
      : null;
    if (onTrackFootprint) {
      onTrackFootprint(
        partnerProtocol ? `${partnerProtocol.shortName} Üye Teklif İsteği` : 'Fiyat Kartı Teklif İsteği',
        vehicle.model,
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
      if (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) {
        const msg = `Merhaba ${salesRep?.name || 'Can Bey'}, 2026 Model Fiyat Listesindeki *${vehicle.model}* (Ağır Şantiye / Hafriyat)${protocolPrefix} için şantiye ve proje ihtiyacımıza özel filo fiyat teklifi ve teslimat kotası hakkında bilgi almak istiyorum.`;
        onDirectWhatsApp(msg);
        return;
      }
      const eurVal = partnerPricing?.isEur ? partnerPricing.finalEur : (vehicle.eurPrice || vehicle.cashPrice || 0);
      const tryEq = Math.round(eurVal * tcmbEurRate);
      const priceText = vehicle.currency === 'EUR'
        ? `€${eurVal.toLocaleString('tr-TR')} (${tryEq.toLocaleString('tr-TR')} TL - TCMB Kur: ${tcmbEurRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL) + KDV`
        : partnerPricing
          ? `${partnerPricing.finalCash.toLocaleString('tr-TR')} TL (${partnerProtocol.shortName} Üye İndirimli Net Fiyat)`
          : (vehicle.cashDiscount > 0
              ? `${vehicle.cashPrice.toLocaleString('tr-TR')} TL Peşin`
              : `${(vehicle.campaignPrice || vehicle.cashPrice).toLocaleString('tr-TR')} TL Kredili Fiyat`);
      const msg = `Merhaba ${salesRep?.name || 'Satış Sorumlusu Can Murat'}, 2026 Model Fiyat Listesindeki *${vehicle.model}* (${priceText})${protocolPrefix} hakkında detaylı proforma ve teslimat bilgisi almak istiyorum.`;
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
    const shareUrl = `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_muhasebe_paylasim${bankQuery}`;
    const priceLine = (vehicle.segment === 'T-Way' || vehicle.isCustomPrice)
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
      {/* Tab Banner (Yalnızca özel bir kategori seçildiğinde gösterilir, tüm araçlarda üst başlığı tekrar etmez) */}
      {selectedCategory !== 'all' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: isMobileView ? '12px' : '16px',
          padding: isMobileView ? '10px 12px' : '18px 20px',
          marginBottom: isMobileView ? '10px' : '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: isMobileView ? '0.68rem' : '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {selectedCategory === 'sway' 
                ? '🛣️ S-WAY ÇEKİCİ GRUBU RESMİ EURO MATRİSİ'
                : selectedCategory === 'tway'
                  ? '🚜 T-WAY AĞIR ŞANTİYE & HAFRİYAT MATRİSİ'
                  : selectedCategory === 'daily70'
                    ? '🚛 DAILY 70C / 72C 7 TON KAMYON & PANELVAN LİSTESİ'
                    : 'RESMİ 2026 MODEL FİYAT LİSTESİ'}
            </div>
            <h2 style={{ fontSize: isMobileView ? '0.98rem' : '1.25rem', fontWeight: 800, margin: '2px 0 0', color: '#fff' }}>
              {selectedCategory === 'sway'
                ? 'IVECO S-Way Ağır Vasıta & Çekici Fiyat Listesi'
                : selectedCategory === 'tway'
                  ? 'IVECO T-Way 10-12 Teker Ağır Şantiye Fiyat Listesi'
                  : selectedCategory === 'daily70'
                    ? 'IVECO Daily 70C / 72C 7 Ton Kamyon & Panelvan Fiyat Listesi'
                    : 'IVECO Sıfır Kilometre Şasi Fiyat Listesi'}
            </h2>
            {!isMobileView && (
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 0' }}>
                {selectedCategory === 'sway'
                  ? 'Uluslararası lojistik ve taşımacılık filoları için resmi Euro (€) liste fiyatları ve ihracatçı Euro kredisi seçenekleri.'
                  : selectedCategory === 'tway'
                    ? '10 ve 12 teker ağır kaya damperi ve mikser şasilerinde Euro (€) liste fiyatları ve fabrika kota tahsisi.'
                    : selectedCategory === 'daily70'
                      ? '7.000 kg ve 7.200 kg azami yüklü ağırlıklı 70C16 şasi kamyon ve 70C18 yüksek hacimli (19.6 m³) panelvan resmi liste fiyatları.'
                      : 'Tüm modellerde şeffaf resmi liste fiyatları, KDV vergi kalkanı, takas ve çoklu filo alım desteği uygulanmıştır.'}
              </p>
            )}
          </div>
          {!isMobileView && (
            <div style={{
              background: (selectedCategory === 'sway' || selectedCategory === 'tway') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              border: (selectedCategory === 'sway' || selectedCategory === 'tway') ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '12px',
              padding: '8px 14px',
              textAlign: 'right'
            }}>
              {selectedCategory === 'sway' ? (
                <>
                  <div style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 700 }}>💶 EURO BAZLI LİSTE</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>İhracatçıya Özel Euro Kredisi</div>
                </>
              ) : selectedCategory === 'tway' ? (
                <>
                  <div style={{ fontSize: '0.70rem', color: '#fbbf24', fontWeight: 700 }}>🚜 AĞIR HAFRİYAT KOTASI</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>Cursor 13 (540 / 460 BG)</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 700 }}>⚡ 2026 KOTA TAHSİSİ</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>Fabrika Teslimat Güvencesi</div>
                </>
              )}
            </div>
          )}
        </div>
      )}

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
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#7dd3fc', marginBottom: '5px' }}>
                  4. Kalan Tutar İçin Kredi Vadesi:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[12, 24, 36].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTradeInTerm(t)}
                      style={{
                        padding: '9px 6px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: tradeInTerm === t ? 'linear-gradient(135deg, #0284c7, #004B93)' : 'rgba(15, 28, 50, 0.9)',
                        color: '#fff',
                        border: tradeInTerm === t ? '1.5px solid #38bdf8' : '1px solid rgba(148,163,184,0.3)'
                      }}
                    >
                      {t} Ay
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
                    {tradeInCalc.term} AY TAKSİT {tradeInCalc.isZeroInterest ? '(%0 FAİZ!)' : ''}
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
              <option value="Daily 72C18 (7 Ton Kamyon)">Model: Daily 72C18 (7 Ton Kamyon)</option>
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

      {/* 1. ANA MODEL & EHLİYET GRUBU SEÇİCİ + İSTEĞE BAĞLI DETAYLI FİLTRE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: isMobileView ? '12px' : '16px' }}>
        {/* Category Pills — Araç Görselli, Mobilde ve Masaüstünde Taşmayan Simetrik Izgara */}
        <div style={isMobileView ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '7px'
        } : {
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '8px'
        }}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const isAllMobile = isMobileView && cat.id === 'all';
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  gridColumn: isAllMobile ? 'span 2' : undefined,
                  background: isSelected
                    ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)'
                    : 'rgba(33, 55, 90, 0.92)',
                  color: isSelected ? '#fff' : '#f1f5f9',
                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '12px',
                  padding: isAllMobile ? '6px 10px' : (isMobileView ? '6px 6px 7px' : '6px 6px 7px'),
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: isAllMobile ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isAllMobile ? '10px' : '4px',
                  minWidth: 0,
                  boxShadow: isSelected ? '0 6px 16px rgba(2, 132, 199, 0.32)' : '0 2px 6px rgba(0, 0, 0, 0.18)'
                }}
              >
                {/* Araç Resmi Kutusu — Beyaz Zeminli, Oranlı ve Telefonda Asla Taşmayan Yapı */}
                <div style={{
                  width: isAllMobile ? '114px' : '100%',
                  height: isAllMobile ? '36px' : (isMobileView ? '44px' : '42px'),
                  background: '#ffffff',
                  borderRadius: '8px',
                  padding: isAllMobile ? '2px 4px' : '2px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  boxShadow: isSelected
                    ? '0 2px 6px rgba(0, 0, 0, 0.22)'
                    : 'inset 0 0 0 1px rgba(148, 163, 184, 0.22)'
                }}>
                  {cat.images ? (
                    cat.images.map((imgSrc, idx) => (
                      <img
                        key={idx}
                        src={imgSrc}
                        alt={cat.title}
                        loading="lazy"
                        style={{
                          width: '32%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    ))
                  ) : (
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
                  )}
                </div>

                {/* Başlık ve Ehliyet Etiketi */}
                <div style={{
                  display: 'flex',
                  flexDirection: isAllMobile ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isAllMobile ? '6px' : '1px',
                  minWidth: 0,
                  width: isAllMobile ? 'auto' : '100%'
                }}>
                  <span style={{
                    fontSize: isMobileView ? '0.77rem' : '0.75rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1.18,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}>
                    {cat.title}
                  </span>
                  <span style={{
                    fontSize: isMobileView ? '0.66rem' : '0.64rem',
                    fontWeight: 700,
                    color: isSelected ? '#bae6fd' : '#7dd3fc',
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}>
                    {cat.id === 'all' ? `(${IVECO_PRICING_CATALOG.length} Araç)` : cat.licenseBadge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* İsteğe Bağlı Detaylı Filtre, KDV & Kampanya Tablosu ve Kart Detay Görünümü Çubuğu */}
        <div style={isMobileView ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '5px'
        } : {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'rgba(15, 28, 50, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.22)',
          borderRadius: '10px',
          padding: '7px 10px'
        }}>
          <button
            type="button"
            onClick={() => setShowDetailedFilters(prev => !prev)}
            style={{
              background: (showDetailedFilters || selectedSectorFilter !== 'all' || searchQuery || onlyDoubleWheels)
                ? 'rgba(56, 189, 248, 0.22)'
                : 'rgba(15, 28, 50, 0.85)',
              color: (showDetailedFilters || selectedSectorFilter !== 'all' || searchQuery || onlyDoubleWheels)
                ? '#7dd3fc'
                : '#cbd5e1',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '8px',
              padding: isMobileView ? '8px 4px' : '6px 11px',
              fontSize: isMobileView ? '0.68rem' : '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              minWidth: 0
            }}
          >
            <FiFilter size={11} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isMobileView
                ? (showDetailedFilters ? 'Filtre ▴' : 'Sektör/Ara ▾')
                : (showDetailedFilters ? 'Detaylı Filtreleri Gizle ▴' : 'Sektöre Göre Süz / Model Ara ▾')}
            </span>
            {(selectedSectorFilter !== 'all' || onlyDoubleWheels || searchQuery) && (
              <span style={{
                background: '#10b981',
                color: '#0f172a',
                padding: '1px 4px',
                borderRadius: '8px',
                fontSize: '0.60rem',
                fontWeight: 900,
                flexShrink: 0
              }}>
                ✓
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleOpenTaxModal(null)}
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.24) 0%, rgba(16, 185, 129, 0.22) 100%)',
              color: '#fde68a',
              border: '1px solid rgba(245, 158, 11, 0.55)',
              borderRadius: '8px',
              padding: isMobileView ? '8px 4px' : '6px 12px',
              fontSize: isMobileView ? '0.68rem' : '0.75rem',
              fontWeight: 900,
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {isMobileView ? '🧾 KDV & Kampanya' : '🧾 Yıl Sonu KDV Hesaplama & Kampanya Tablosu'}
          </button>

          <button
            type="button"
            onClick={() => setShowAllCardDetails(prev => !prev)}
            style={{
              background: showAllCardDetails ? 'rgba(16, 185, 129, 0.22)' : 'rgba(15, 28, 50, 0.85)',
              color: showAllCardDetails ? '#4ade80' : '#cbd5e1',
              border: showAllCardDetails ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(148, 163, 184, 0.28)',
              borderRadius: '8px',
              padding: isMobileView ? '8px 4px' : '6px 11px',
              fontSize: isMobileView ? '0.68rem' : '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {isMobileView
              ? (showAllCardDetails ? '✓ Detay Açık' : '🔍 Tüm Detaylar')
              : (showAllCardDetails ? '✓ Tüm Teknik Detaylar Açık (Özet Görünüme Dön)' : '🔍 Tüm Araçların Teknik & KDV Detaylarını Aç')}
          </button>
        </div>

        {/* Açılır Detaylı Filtre Kutusu (Sektör + Arama + Çift Teker) */}
        {showDetailedFilters && (
          <div style={{
            background: 'rgba(24, 42, 72, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: isMobileView ? '1 1 100%' : '0 1 290px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#7dd3fc', whiteSpace: 'nowrap' }}>
                  🎯 İş Kolu:
                </span>
                <select
                  value={selectedSectorFilter}
                  onChange={(e) => {
                    setSelectedSectorFilter(e.target.value);
                    setSelectedCategory('all');
                  }}
                  style={{
                    flex: 1,
                    background: selectedSectorFilter !== 'all' ? 'rgba(5, 150, 105, 0.28)' : 'rgba(15, 28, 50, 0.95)',
                    color: '#ffffff',
                    border: selectedSectorFilter !== 'all' ? '1.5px solid #4ade80' : '1px solid rgba(125, 211, 252, 0.35)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {SECTOR_FILTERS.map(sec => (
                    <option key={sec.id} value={sec.id} style={{ background: '#0f1c32', color: '#ffffff' }}>
                      {sec.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ position: 'relative', flex: 1, minWidth: isMobileView ? '170px' : '200px' }}>
                <FiSearch style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Model, vites, motor ara (örn: 35C16, Hi-Matic)..."
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 32px',
                    background: 'rgba(15, 28, 50, 0.92)',
                    border: '1px solid rgba(148, 163, 184, 0.32)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>

              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: onlyDoubleWheels ? 'rgba(245, 158, 11, 0.22)' : 'rgba(15, 28, 50, 0.92)',
                border: onlyDoubleWheels ? '1px solid #f59e0b' : '1px solid rgba(148, 163, 184, 0.28)',
                borderRadius: '8px',
                padding: '7px 11px',
                cursor: 'pointer',
                fontSize: '0.76rem',
                color: onlyDoubleWheels ? '#fbbf24' : '#e2e8f0',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                <input
                  type="checkbox"
                  checked={onlyDoubleWheels}
                  onChange={(e) => setOnlyDoubleWheels(e.target.checked)}
                  style={{ accentColor: '#f59e0b', cursor: 'pointer' }}
                />
                Yalnızca Çift Teker
              </label>

              {(selectedSectorFilter !== 'all' || searchQuery || onlyDoubleWheels) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSectorFilter('all');
                    setSearchQuery('');
                    setOnlyDoubleWheels(false);
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '8px',
                    padding: '7px 10px',
                    fontSize: '0.73rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ✕ Sıfırla
                </button>
              )}
            </div>
            {selectedSectorFilter !== 'all' && activeSectorObj && (
              <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>
                ✓ {activeSectorObj.desc}
              </div>
            )}
          </div>
        )}
      </div>

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
          const compactProfileBadge = getCompactProfileBadge(vehicle);
          const remainingAfterTradeIn = (!vehicle.isCustomPrice && vehicle.segment !== 'T-Way' && vehicle.currency !== 'EUR' && effectiveTlPrice > 0)
            ? Math.max(0, effectiveTlPrice - (Number(tradeInValue) || 0))
            : 0;
          const isZeroInterestEligible = remainingAfterTradeIn > 0 && remainingAfterTradeIn <= 1000000;
          const monthlyPaymentEst = remainingAfterTradeIn <= 0
            ? 0
            : isZeroInterestEligible
              ? Math.round(remainingAfterTradeIn / 12)
              : Math.round((remainingAfterTradeIn * 0.0329 * Math.pow(1.0329, 24)) / (Math.pow(1.0329, 24) - 1));

          return (
            <div
              key={vehicle.id}
              style={{
                background: 'linear-gradient(165deg, rgba(33, 55, 90, 0.94) 0%, rgba(24, 41, 68, 0.94) 100%)',
                border: partnerPricing ? '1.5px solid rgba(16, 185, 129, 0.55)' : '1.5px solid rgba(125, 211, 252, 0.26)',
                boxShadow: '0 8px 24px rgba(8, 15, 30, 0.25)',
                borderRadius: '14px',
                padding: isMobileView ? '14px' : '15px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
            >
              {/* Badges */}
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
                    fontSize: '0.66rem',
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
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    background: 'rgba(34, 197, 94, 0.18)',
                    color: '#4ade80',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(34, 197, 94, 0.35)'
                  }}>
                    -{vehicle.cashDiscount.toLocaleString('tr-TR')} TL İndirim
                  </span>
                ) : (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? (
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 158, 11, 0.4)'
                  }}>
                    ⭐ Özel Proje Fiyatı
                  </span>
                ) : vehicle.currency === 'EUR' ? (
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    background: 'rgba(16, 185, 129, 0.18)',
                    color: '#34d399',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.35)'
                  }}>
                    💶 Euro Kredisi Uyumlu
                  </span>
                ) : (
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    background: 'rgba(56, 189, 248, 0.18)',
                    color: '#7dd3fc',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(56, 189, 248, 0.38)'
                  }}>
                    💳 Kredili Kampanya
                  </span>
                )}
              </div>

              {/* Title, Sticker & 1-Line Quick Summary */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: isMobileView ? '1.05rem' : '0.98rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px', lineHeight: 1.25 }}>
                      {vehicle.model}
                    </h3>
                    <div style={{ fontSize: '0.73rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <span>⚙️ {vehicle.transmission || 'Manuel'}</span>
                      {vehicle.bodyLength && (
                        <>
                          <span style={{ color: '#64748b' }}>•</span>
                          <span style={{ color: '#4ade80', fontWeight: 800 }}>📦 Kasa: {vehicle.bodyLength}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {sticker && (
                    <div
                      style={{
                        width: isMobileView ? '74px' : '70px',
                        height: isMobileView ? '50px' : '48px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '2px solid rgba(56, 189, 248, 0.65)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px',
                        transform: 'rotate(-1.5deg)'
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

                {/* ÖZELLİK 2A: 3 KELİMELİK İŞ, PALET & KASA ROZETİ */}
                {compactProfileBadge && (
                  <div style={{
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    color: '#bae6fd',
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(56, 189, 248, 0.22)',
                    borderRadius: '7px',
                    padding: '4px 8px',
                    marginBottom: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {compactProfileBadge}
                  </div>
                )}
              </div>

              {/* SONUÇ ODAKLI NET FİYAT KUTUSU + İSTEĞE BAĞLI DETAY AÇICI */}
              <div style={{
                background: 'rgba(16, 30, 54, 0.72)',
                border: partnerPricing ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(148, 163, 184, 0.24)',
                borderRadius: '10px',
                padding: isMobileView ? '11px 12px' : '10px 12px',
                marginBottom: '10px'
              }}>
                {(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? (
                  <div style={{ textAlign: 'center', padding: '4px 0' }}>
                    <div style={{ fontSize: '0.67rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>
                      ⭐ {partnerProtocol ? `${partnerProtocol.shortName} ÖZEL ŞANTİYE PROTOKOLÜ` : 'PROJEYE ÖZEL ŞANTİYE FİYATI'}
                    </div>
                    <div style={{ fontSize: isMobileView ? '1.04rem' : '0.98rem', fontWeight: 900, color: '#fef08a', marginTop: '2px' }}>
                      Satış Sorumlusu Can Murat ile Görüşün
                    </div>
                  </div>
                ) : vehicle.currency === 'EUR' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#7dd3fc', fontWeight: 800 }}>
                        {partnerPricing ? `NET ${partnerProtocol.shortName.toUpperCase()} FİYATI` : 'NET EURO FİYATI (+KDV)'}
                      </div>
                      <div style={{ fontSize: isMobileView ? '1.16rem' : '1.08rem', color: '#38bdf8', fontWeight: 900 }}>
                        €{(partnerPricing ? partnerPricing.finalEur : (vehicle.eurPrice || vehicle.cashPrice)).toLocaleString('tr-TR')}{' '}
                        <span style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 800 }}>
                          ({(partnerPricing ? partnerPricing.finalTl : Math.round((vehicle.eurPrice || vehicle.cashPrice) * tcmbEurRate)).toLocaleString('tr-TR')} TL)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : partnerPricing ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 900, display: 'block' }}>
                        NET {partnerProtocol.shortName.toUpperCase()} ÜYE FİYATI:
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        {partnerPricing.baseCash.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    <span style={{ fontSize: isMobileView ? '1.26rem' : '1.15rem', color: '#4ade80', fontWeight: 900 }}>
                      {partnerPricing.finalCash.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                ) : vehicle.campaignPrice ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.69rem', color: vehicle.cashDiscount > 0 ? '#4ade80' : '#38bdf8', fontWeight: 900, display: 'block' }}>
                        {vehicle.cashDiscount > 0 ? 'NET PEŞİN FİYAT (KDV Dahil):' : 'KREDİLİ / NET FİYAT (KDV Dahil):'}
                      </span>
                      {vehicle.cashDiscount > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                          Liste: {vehicle.campaignPrice.toLocaleString('tr-TR')} TL
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: isMobileView ? '1.26rem' : '1.15rem', color: '#4ade80', fontWeight: 900 }}>
                      {vehicle.cashPrice.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#7dd3fc', fontWeight: 700, fontSize: '0.85rem' }}>
                    Özel Teklif & Döviz Kuru İçin Danışınız
                  </div>
                )}

                {/* ÖZELLİK 2B: TEK SATIRLIK %20 KDV VERGİ AVANTAJI + KDV & KAMPANYA TABLOSU AÇICI */}
                {!vehicle.isCustomPrice && vehicle.segment !== 'T-Way' && vehicle.currency !== 'EUR' && vatShieldTl > 0 && (
                  <div style={{
                    marginTop: '7px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(148, 163, 184, 0.16)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    fontSize: '0.69rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fcd34d', fontWeight: 800, gap: '4px' }}>
                      <span>🧾 %20 İndirilecek KDV: ~{vatShieldTl.toLocaleString('tr-TR')} TL</span>
                      <button
                        type="button"
                        onClick={() => handleOpenTaxModal(vehicle)}
                        style={{
                          background: 'rgba(245, 158, 11, 0.18)',
                          border: '1px solid rgba(245, 158, 11, 0.45)',
                          color: '#fde68a',
                          borderRadius: '5px',
                          padding: '1px 6px',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📊 KDV Tablosu
                      </button>
                    </div>
                    {Number(tradeInValue) > 0 && remainingAfterTradeIn > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7dd3fc', fontWeight: 700 }}>
                        <span>🔄 {(Number(tradeInValue) / 1000000).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}M Peşinat Sonrası:</span>
                        <span style={{ color: '#4ade80', fontWeight: 800 }}>
                          ~{monthlyPaymentEst.toLocaleString('tr-TR')} TL/Ay {isZeroInterestEligible ? '(%0 Faiz 12 Ay)' : '(24 Ay)'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* İSTEĞE BAĞLI DETAY BUTONU */}
                <button
                  type="button"
                  onClick={() => toggleCardDetail(vehicle.id)}
                  style={{
                    width: '100%',
                    marginTop: '7px',
                    paddingTop: '6px',
                    border: 'none',
                    borderTop: '1px dashed rgba(148, 163, 184, 0.22)',
                    background: 'transparent',
                    color: isDetailOpen ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>
                    {isDetailOpen ? 'Teknik & KDV Detaylarını Gizle' : '🔍 Motor, Dingil & KDV Muhasebe Tablosu'}
                  </span>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>
                    {isDetailOpen ? '▴' : '▾'}
                  </span>
                </button>

                {/* AÇILIR DETAY ALANI (YALNIZCA MÜŞTERİ İSTERSE GÖRÜNÜR) */}
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

                    {vehicle.currency === 'EUR' ? (
                      <div style={{ fontSize: '0.70rem', color: '#93c5fd', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🏛️ TCMB Günlük Euro Kuru:</span>
                        <strong>1 € = {tcmbEurRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</strong>
                      </div>
                    ) : (
                      <>
                        {vehicle.campaignPrice && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                            <span>Kredili Kampanya Fiyatı:</span>
                            <strong>{(partnerPricing ? partnerPricing.finalCampaign : vehicle.campaignPrice).toLocaleString('tr-TR')} TL</strong>
                          </div>
                        )}
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
                            <div style={{ fontWeight: 900, color: '#34d399' }}>
                              🧾 Yıl Sonu Mali Müşavir / KDV & Amortisman Özeti:
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#cbd5e1' }}>KDV Hariç Net Matrah:</span>
                              <strong>{Math.round(effectiveTlPrice - vatShieldTl).toLocaleString('tr-TR')} TL</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fde047' }}>
                              <span>İndirilecek %20 KDV (Tek Seferde):</span>
                              <strong>{vatShieldTl.toLocaleString('tr-TR')} TL</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86efac' }}>
                              <span>1. Yıl %20 Tam Amortisman (Kıst Yok):</span>
                              <strong>{Math.round((effectiveTlPrice - vatShieldTl) * 0.20).toLocaleString('tr-TR')} TL</strong>
                            </div>
                            <div style={{ color: '#93c5fd', fontSize: '0.64rem', marginTop: '2px' }}>
                              ⚡ Üstyapıyı beklemeden <strong>şasi faturası hemen kesilip</strong> 2026 vergisinden düşülebilir.
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons — Mobilde taşmayan 3 eşit sütunlu ızgara + ÖZELLİK 3: Ortağına/Muhasebene İlet */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!onSelectVehicle) return;
                      if (partnerPricing && !partnerPricing.isEur) {
                        onSelectVehicle({
                          ...vehicle,
                          campaignPrice: partnerPricing.finalCampaign,
                          cashPrice: partnerPricing.finalCash,
                          cashDiscount: partnerPricing.discountTl
                        });
                      } else {
                        onSelectVehicle(vehicle);
                      }
                    }}
                    style={{
                      minWidth: 0,
                      background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: isMobileView ? '10px 4px' : '8px 8px',
                      fontSize: isMobileView ? '0.73rem' : '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <FiTruck size={isMobileView ? 13 : 12} style={{ flexShrink: 0 }} /> {lockedBank ? `${lockedBank.shortName} Kredi` : 'Kredi Planı'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVehicleTradeIn(vehicle)}
                    style={{
                      minWidth: 0,
                      background: 'rgba(245, 158, 11, 0.18)',
                      color: '#fde68a',
                      border: '1px solid rgba(245, 158, 11, 0.45)',
                      borderRadius: '10px',
                      padding: isMobileView ? '10px 4px' : '8px 9px',
                      fontSize: isMobileView ? '0.73rem' : '0.71rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap'
                    }}
                    title="Mevcut aracımı takasa verip peşinata saydır"
                  >
                    🔄 Takaslı Al
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVehicleQuote(vehicle)}
                    style={{
                      minWidth: 0,
                      background: (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? '#f59e0b' : '#22c55e',
                      color: (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? '#000' : '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: isMobileView ? '10px 4px' : '8px 10px',
                      fontSize: isMobileView ? '0.73rem' : '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                    title={(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? "Satış Sorumlusu Can Murat ile Özel Fiyat Görüş" : "WhatsApp'tan Teklif Al"}
                  >
                    <FiMessageSquare size={isMobileView ? 13 : 12} style={{ flexShrink: 0 }} /> {(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? 'Özel Fiyat' : 'Teklif Al'}
                  </button>
                </div>

                {/* ÖZELLİK 3: MALİ MÜŞAVİRE / MUHASEBEYE / ORTAĞA İLET TEK TIKLI BUTON */}
                <button
                  type="button"
                  onClick={() => handleShareWithPartner(vehicle, effectiveTlPrice, vatShieldTl, remainingAfterTradeIn, monthlyPaymentEst)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.55)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(148, 163, 184, 0.26)',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                  title="Bu aracın KDV matrahını, %20 KDV avantajını, tam yıl amortismanını ve kampanya tablosunu WhatsApp'tan mali müşavirine veya ortağına gönder"
                >
                  📤 KDV & Kampanya Tablosunu Mali Müşavirime / Ortağıma İlet
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          Aradığınız kriterlere uygun araç bulunamadı. Lütfen filtreleri sıfırlayın.
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
          : (modalPartnerPricing ? modalPartnerPricing.finalCash : (selectedModalVeh?.cashPrice || selectedModalVeh?.campaignPrice || 1850000));
        const activeInvoiceTl = customTaxInvoiceTl > 0 ? Number(customTaxInvoiceTl) : baseInvoiceTl;
        const netMatrahTl = Math.round(activeInvoiceTl / 1.20);
        const kdvAmountTl = activeInvoiceTl - netMatrahTl;
        const firstYearDepTl = Math.round(netMatrahTl * 0.20); // Ticari araçta kıst amortisman yok, %20 tam yıl
        const incomeTaxShieldTl = Math.round(firstYearDepTl * taxEntityRate);
        const totalFirstYearGainTl = kdvAmountTl + incomeTaxShieldTl;

        const bankTag = lockedBank ? `${lockedBank.shortName} • ` : '';
        const summaryRows = [
          { label: 'Daily 35S16 / 35C16 Şasi (B Ehliyet)', gross: 1850000, campaign: `${bankTag}1.000.000 TL • 12 Ay %0 Faiz (83.333 ₺/Ay)` },
          { label: 'Daily 35S16 Panelvan (12m³ - 16m³)', gross: 2050000, campaign: `${bankTag}1.000.000 TL • 12 Ay %0 Faiz (83.333 ₺/Ay)` },
          { label: 'Daily 70C18 / 72C18 Şasi (7.2 Ton)', gross: 2490000, campaign: `${bankTag}1M TL %0 Faiz veya 6 Ay Ödemesiz Kredi` },
          { label: 'Eurocargo 150E21 / 180E25 Şasi', gross: Math.round(92000 * tcmbEurRate * 1.20), campaign: lockedBank ? `${lockedBank.name} Özel Ticari Kredisi` : 'Anlaşmalı Banka & Katılım Kredisi' },
          { label: 'S-Way 530 4x2 Çekici (Euro + KDV)', gross: Math.round(123000 * tcmbEurRate * 1.20), campaign: lockedBank ? `${lockedBank.name} Filo Finansmanı` : 'İhracatçı Euro & TL Filo Finansmanı' }
        ];

        const handleShareFullTaxTable = () => {
          if (onTrackFootprint) {
            onTrackFootprint(
              '👨‍💼 Yıl Sonu KDV & Kampanya Tablosu Mali Müşavire Gönderildi',
              selectedModalVeh?.model || '2026 Kampanya Tablosu',
              `Fatura: ${activeInvoiceTl.toLocaleString('tr-TR')} TL | KDV: ${kdvAmountTl.toLocaleString('tr-TR')} TL | Toplam 1.Yıl Vergi Avantajı: ${totalFirstYearGainTl.toLocaleString('tr-TR')} TL`
            );
          }
          const bankQuery = lockedBank ? `&bank=${lockedBank.id}` : '';
          const shareUrl = `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_smmm_tablo${bankQuery}`;
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
            `💳 *Aktif Kredi Kampanyası:* ${lockedBank ? `${lockedBank.name} • ` : ''}1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)\n\n` +
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
