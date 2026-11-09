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
  { id: 'all', label: 'Tüm Araçlar', shortLabel: 'Tümü' },
  { id: 'daily35_chassis', label: 'Daily 35 Şasi (B Ehliyet)', shortLabel: 'Daily 35 Şasi (B Ehliyet)' },
  { id: 'daily35_van', label: 'Daily 35 Panelvan (B Ehliyet)', shortLabel: 'Daily Panelvan (B Ehliyet)' },
  { id: 'daily70', label: 'Daily 70C / 72C (7 Ton • C1 / C Ehliyet)', shortLabel: 'Daily 70C / 72C (C Ehliyet)' },
  { id: 'eurocargo', label: 'Eurocargo Kamyon (10–18 Ton • C Ehliyet)', shortLabel: 'Eurocargo (C Ehliyet)' },
  { id: 'sway', label: 'S-Way Çekici (CE Ehliyet)', shortLabel: 'S-Way Çekici (CE Ehliyet)' },
  { id: 'tway', label: 'T-Way Şantiye & Hafriyat (10–12 Teker • C Ehliyet)', shortLabel: 'T-Way Şantiye (C Ehliyet)' }
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

export default function PricingCatalogTab({ initialSector = '', partnerProtocol = null, onSelectVehicle, onDirectWhatsApp, onTrackFootprint, salesRep }) {
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
      const msg = `Merhaba ${salesRep?.name || 'Can Bey'}, 2026 Model Fiyat Listesindeki *${vehicle.model}* (${priceText})${protocolPrefix} hakkında detaylı proforma ve teslimat bilgisi almak istiyorum.`;
      onDirectWhatsApp(msg);
    }
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

      {/* 🔄 TAKAS + KREDİ NET ÖDEME HESAPLAYICI & 🏢 2+ ARAÇ FİLO İSKONTOSU ÇİFT AKSİYON BARI */}
      <div
        id="tradein-loan-calc-box"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(24, 42, 72, 0.94) 100%)',
          border: showTradeInBox ? '1.5px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.42)',
          borderRadius: '12px',
          padding: isMobileView ? '10px 12px' : '12px 16px',
          marginBottom: isMobileView ? '12px' : '16px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
            <span style={{ fontSize: isMobileView ? '1.25rem' : '1.45rem' }}>🔄</span>
            <div>
              <div style={{ fontSize: isMobileView ? '0.82rem' : '0.88rem', fontWeight: 800, color: '#fde68a' }}>
                Takas + Kredi Net Ödeme Hesaplayıcı & Filo İskontosu (2+ Araç)
              </div>
              <div style={{ fontSize: isMobileView ? '0.71rem' : '0.75rem', color: '#e2e8f0' }}>
                Mevcut aracınızı peşinata saydırıp kalan fark için aylık banka kredi taksitinizi anında hesaplayın.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                const next = !showTradeInBox;
                setShowTradeInBox(next);
                setShowFleetBox(false);
                if (next && onTrackFootprint) {
                  onTrackFootprint('Takas + Kredi Hesaplayıcı Açıldı', selectedTradeVehicle?.model || 'Daily 35C16', 'Üst Bar');
                }
              }}
              style={{
                background: showTradeInBox ? 'rgba(255,255,255,0.16)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: showTradeInBox ? '#fff' : '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: isMobileView ? '8px 11px' : '8px 13px',
                fontSize: '0.75rem',
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {showTradeInBox ? '✕ Hesaplayıcıyı Kapat' : '🔄 Takas + Kredi Hesapla'}
            </button>

            <button
              type="button"
              onClick={() => { setShowFleetBox(prev => !prev); setShowTradeInBox(false); }}
              style={{
                background: showFleetBox ? 'rgba(255,255,255,0.16)' : 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                color: '#ffffff',
                border: '1px solid #38bdf8',
                borderRadius: '8px',
                padding: isMobileView ? '8px 11px' : '8px 13px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {showFleetBox ? '✕ Kapat' : '🏢 2+ Araç Filo İskontosu'}
            </button>
          </div>
        </div>

        {showTradeInBox && (
          <div style={{
            marginTop: '12px',
            paddingTop: '14px',
            borderTop: '1px dashed rgba(245, 158, 11, 0.45)',
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
                  placeholder="Örn: 2020 Ford Transit 350ED / 2018 Daily / Atego..."
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '8px' }}>
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
                        gap: '4px'
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
              padding: isMobileView ? '10px 12px' : '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobileView ? '10px' : '18px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 700 }}>SIFIR ARAÇ BEDELİ</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                    {tradeInCalc.vehiclePrice.toLocaleString('tr-TR')} TL
                  </div>
                </div>
                <div style={{ color: '#64748b', fontWeight: 900 }}>−</div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#fde68a', fontWeight: 700 }}>TAKAS PEŞİNATINIZ</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24' }}>
                    {tradeInCalc.safeTradeVal.toLocaleString('tr-TR')} TL
                  </div>
                </div>
                <div style={{ color: '#64748b', fontWeight: 900 }}>=</div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#7dd3fc', fontWeight: 700 }}>KREDİLENDİRİLECEK FARK</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#38bdf8' }}>
                    {tradeInCalc.remainingPrincipal.toLocaleString('tr-TR')} TL
                  </div>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.16)',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  borderRadius: '8px',
                  padding: '6px 12px'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 800 }}>
                    {tradeInCalc.term} AY TAHMİNİ TAKSİT {tradeInCalc.isZeroInterest ? '(%0 FAİZ!)' : ''}
                  </div>
                  <div style={{ fontSize: '1.02rem', fontWeight: 900, color: '#34d399' }}>
                    {tradeInCalc.remainingPrincipal > 0 ? `~${tradeInCalc.monthlyPayment.toLocaleString('tr-TR')} TL / Ay` : 'Kredi Gerekmiyor'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGeneralTradeInSubmit}
                style={{
                  background: uploadedPhotoCount === 4
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: uploadedPhotoCount === 4 ? '#fff' : '#0f172a',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '10px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
              >
                <FiMessageSquare size={14} />
                {uploadedPhotoCount === 4
                  ? '4 Resmi & Takas Hesabımı Gönder (Can M.)'
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
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <FiMessageSquare size={14} /> Filo Özel İskontosu İste
            </button>
          </div>
        )}
      </div>

      {/* 🎯 İŞİNİZE / SEKTÖRÜNÜZE GÖRE KOMPAKT FİLTRE */}
      <div style={{
        background: 'rgba(24, 42, 72, 0.85)',
        border: selectedSectorFilter !== 'all' ? '1.5px solid #4ade80' : '1px solid rgba(125, 211, 252, 0.25)',
        borderRadius: '12px',
        padding: isMobileView ? '8px 10px' : '10px 14px',
        marginBottom: isMobileView ? '10px' : '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 260px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7dd3fc', whiteSpace: 'nowrap' }}>
            🎯 Sektöre Göre Araç Süz:
          </span>
          <select
            value={selectedSectorFilter}
            onChange={(e) => {
              setSelectedSectorFilter(e.target.value);
              setSelectedCategory('all');
            }}
            style={{
              flex: isMobileView ? '1 1 100%' : '0 1 280px',
              background: selectedSectorFilter !== 'all' ? 'rgba(5, 150, 105, 0.28)' : 'rgba(15, 28, 50, 0.95)',
              color: '#ffffff',
              border: selectedSectorFilter !== 'all' ? '1.5px solid #4ade80' : '1px solid rgba(125, 211, 252, 0.35)',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '0.80rem',
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
          {selectedSectorFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedSectorFilter('all')}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✕ Filtreyi Kaldır
            </button>
          )}
        </div>
        {selectedSectorFilter !== 'all' && activeSectorObj && (
          <div style={{ fontSize: '0.73rem', color: '#4ade80', fontWeight: 700 }}>
            ✓ {activeSectorObj.desc}
          </div>
        )}
      </div>

      {/* Yasal İstiap & Kantar Güvencesi Banner (YALNIZCA Daily 35 Serisi Seçildiğinde Gösterilir) */}
      {(selectedCategory === 'daily35_chassis' || selectedCategory === 'daily35_van') && (
        <div style={{
          background: 'rgba(30, 52, 86, 0.85)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '12px',
          padding: isMobileView ? '10px 12px' : '12px 16px',
          marginBottom: isMobileView ? '12px' : '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              fontSize: '16px',
              flexShrink: 0
            }}>
              🛡️
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
                B Ehliyet & Kantar Uyumu (Daily 35)
              </div>
              {!isMobileView && (
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  Daily 35 serisi B sınıfı otomobil ehliyetiyle kullanılabilir, şehir içi saat yasaklarından ve takograftan muaftır.
                </div>
              )}
            </div>
          </div>
          {!isMobileView && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56, 189, 248, 0.14)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.72rem',
              color: '#7dd3fc',
              fontWeight: 700
            }}>
              <span>🟢</span> 2026 Kota Tahsisinden Hızlı Teslim
            </div>
          )}
        </div>
      )}

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: isMobileView ? '12px' : '20px' }}>
        {/* Category Pills — Mobilde kesilmeyen net ızgara */}
        <div style={isMobileView ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px'
        } : {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                gridColumn: (isMobileView && cat.id === 'all') ? 'span 3' : undefined,
                background: selectedCategory === cat.id ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : 'rgba(33, 55, 90, 0.88)',
                color: selectedCategory === cat.id ? '#fff' : '#f1f5f9',
                border: selectedCategory === cat.id ? '1.5px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.28)',
                borderRadius: isMobileView ? '10px' : '20px',
                padding: isMobileView ? '9px 6px' : '6px 14px',
                fontSize: isMobileView ? '0.78rem' : '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              {isMobileView ? (cat.id === 'all' ? `Tüm Modeller (${IVECO_PRICING_CATALOG.length} Araç)` : cat.shortLabel) : cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Checkbox */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: isMobileView ? '170px' : '220px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMobileView ? 'Model ara (35C16, Hi-Matic...)' : 'Model, vites, motor ara (örn: 35C16, Hi-Matic, 3.0)...'}
              style={{
                width: '100%',
                padding: isMobileView ? '11px 12px 11px 34px' : '10px 12px 10px 36px',
                background: 'rgba(33, 55, 90, 0.85)',
                border: '1px solid rgba(148, 163, 184, 0.32)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: isMobileView ? '0.85rem' : '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: onlyDoubleWheels ? 'rgba(245, 158, 11, 0.22)' : 'rgba(33, 55, 90, 0.85)',
            border: onlyDoubleWheels ? '1px solid #f59e0b' : '1px solid rgba(148, 163, 184, 0.28)',
            borderRadius: '10px',
            padding: isMobileView ? '10px 12px' : '8px 14px',
            cursor: 'pointer',
            fontSize: isMobileView ? '0.78rem' : '0.78rem',
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
            {isMobileView ? 'Çift Teker' : 'Yalnızca Çift Teker Modelleri'}
          </label>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: isMobileView ? '12px' : '16px' }}>
        {filteredVehicles.map(vehicle => {
          const sticker = getVehicleSticker(vehicle);
          const partnerPricing = partnerProtocol
            ? calculatePartnerVehiclePricing(vehicle, partnerProtocol, tcmbEurRate)
            : null;
          const effectiveTlPrice = partnerPricing && !partnerPricing.isEur
            ? partnerPricing.finalCash
            : (vehicle.cashPrice || vehicle.campaignPrice || 0);
          const vatShieldTl = effectiveTlPrice > 0 ? Math.round(effectiveTlPrice - (effectiveTlPrice / 1.20)) : 0;

          return (
            <div
              key={vehicle.id}
              style={{
                background: 'linear-gradient(165deg, rgba(33, 55, 90, 0.94) 0%, rgba(24, 41, 68, 0.94) 100%)',
                border: partnerPricing ? '1.5px solid rgba(16, 185, 129, 0.55)' : '1.5px solid rgba(125, 211, 252, 0.26)',
                boxShadow: '0 8px 24px rgba(8, 15, 30, 0.25)',
                borderRadius: '14px',
                padding: isMobileView ? '16px' : '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
            >
              {/* Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem',
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
                    {vehicle.cashDiscount.toLocaleString('tr-TR')} TL Peşin İndirimi
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
                    ⭐ Özel Proje & Filo Fiyatı
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
                    💶 İhracatçı Euro Kredisi Uyumlu
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
                    💳 Kredili Kampanya Fiyatı
                  </span>
                )}
              </div>

              {/* Title, Sticker & Specs */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: isMobileView ? '1.06rem' : '0.98rem', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.3, flex: 1 }}>
                    {vehicle.model}
                  </h3>
                  {sticker && (
                    <div
                      style={{
                        width: isMobileView ? '78px' : '74px',
                        height: isMobileView ? '54px' : '50px',
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: isMobileView ? '0.78rem' : '0.72rem', color: '#e2e8f0', marginBottom: '8px' }}>
                  <div>⚙️ <strong>Vites:</strong> {vehicle.transmission || 'Manuel'}</div>
                  <div>🐎 <strong>Motor:</strong> {vehicle.engine || '-'}</div>
                  <div>⚡ <strong>Güç:</strong> {vehicle.power ? vehicle.power.split('(')[1]?.replace(')', '') || vehicle.power : '-'}</div>
                  <div>📏 <strong>Dingil:</strong> {vehicle.wheelbase ? `${vehicle.wheelbase} mm` : '-'}</div>
                </div>

                {/* Uyumlu Kasa Boyu & Dingil Karşılığı */}
                {vehicle.bodyLength && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(16, 185, 129, 0.14)',
                    border: '1px solid rgba(16, 185, 129, 0.38)',
                    borderRadius: '8px',
                    padding: isMobileView ? '7px 10px' : '5px 8px',
                    marginBottom: '10px',
                    fontSize: isMobileView ? '0.78rem' : '0.71rem'
                  }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 700 }}>
                      📦 Uyumlu Kasa Boyu:
                    </span>
                    <strong style={{ color: '#4ade80', fontWeight: 900 }}>
                      {vehicle.bodyLength}
                    </strong>
                  </div>
                )}
              </div>

              {/* Pricing Box + Automatic KDV Shield */}
              <div style={{
                background: 'rgba(16, 30, 54, 0.65)',
                border: partnerPricing ? '1px solid rgba(16, 185, 129, 0.38)' : '1px solid rgba(148, 163, 184, 0.22)',
                borderRadius: '10px',
                padding: isMobileView ? '12px 14px' : '10px 12px',
                marginBottom: '12px'
              }}>
                {(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.32)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
                      ⭐ {partnerProtocol ? `${partnerProtocol.shortName} ÖZEL ŞANTİYE PROTOKOLÜ` : 'PROJEYE ÖZEL ŞANTİYE FİYATLANDIRMASI'}
                    </div>
                    <div style={{ fontSize: isMobileView ? '1.08rem' : '1.02rem', fontWeight: 900, color: '#fef08a', marginBottom: '3px' }}>
                      Satış Sorumlusu Can M. ile Görüşün
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                      {partnerProtocol
                        ? `${partnerProtocol.shortName} üyelerine özel T-Way ağır şantiye protokol iskontosu için doğrudan iletişime geçin.`
                        : 'T-Way ağır şantiye araçlarımız damper/mikser tipi, takas ve filo kotasına göre özel fiyatlandırılmaktadır.'}
                    </div>
                  </div>
                ) : vehicle.currency === 'EUR' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#cbd5e1', marginBottom: '4px', gap: '6px', flexWrap: 'wrap' }}>
                      <span>Resmi Liste Fiyatı:</span>
                      <span style={{ fontWeight: 700, color: '#ffffff', textAlign: 'right', textDecoration: partnerPricing ? 'line-through' : 'none' }}>
                        €{(vehicle.eurPrice || vehicle.cashPrice).toLocaleString('tr-TR')}{' '}
                        <span style={{ color: '#fde047', fontWeight: 800 }}>
                          ({Math.round((vehicle.eurPrice || vehicle.cashPrice) * tcmbEurRate).toLocaleString('tr-TR')} TL)
                        </span>{' '}
                        + KDV
                      </span>
                    </div>
                    {partnerPricing ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.76rem' : '0.72rem', color: '#4ade80', marginBottom: '6px', fontWeight: 800 }}>
                        <span>🏛️ {partnerProtocol.shortName} Üye İndirimi:</span>
                        <span>-€{partnerPricing.discountEur.toLocaleString('tr-TR')} (-{partnerPricing.discountTl.toLocaleString('tr-TR')} TL)</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.74rem' : '0.70rem', color: '#93c5fd', marginBottom: '6px' }}>
                        <span>🏛️ Merkez Bankası (TCMB) Kur:</span>
                        <span style={{ fontWeight: 700, color: '#e0f2fe' }}>
                          1 € = {tcmbEurRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL (Günlük)
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.14)', paddingTop: '6px', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: isMobileView ? '0.8rem' : '0.76rem', color: '#7dd3fc', fontWeight: 800 }}>
                        {partnerPricing ? `${partnerProtocol.shortName.toUpperCase()} ÜYE FİYATI:` : 'EURO PROJE FİYATI:'}
                      </span>
                      <span style={{ fontSize: isMobileView ? '1.12rem' : '1.0rem', color: '#38bdf8', fontWeight: 900, textAlign: 'right' }}>
                        €{(partnerPricing ? partnerPricing.finalEur : (vehicle.eurPrice || vehicle.cashPrice)).toLocaleString('tr-TR')}{' '}
                        <span style={{ fontSize: isMobileView ? '0.92rem' : '0.84rem', color: '#4ade80', fontWeight: 800 }}>
                          ({(partnerPricing ? partnerPricing.finalTl : Math.round((vehicle.eurPrice || vehicle.cashPrice) * tcmbEurRate)).toLocaleString('tr-TR')} TL)
                        </span>
                      </span>
                    </div>
                    <div style={{
                      marginTop: '6px',
                      paddingTop: '6px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '0.68rem',
                      color: '#fcd34d',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>🧾 Vergi Kalkanı:</span>
                      <span>%20 KDV İndirimi + 5 Yıl Amortisman</span>
                    </div>
                  </>
                ) : partnerPricing ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      <span>Normal Liste / Peşin:</span>
                      <span style={{ textDecoration: 'line-through' }}>{partnerPricing.baseCash.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#fbbf24', marginBottom: '6px', fontWeight: 800 }}>
                      <span>🏛️ {partnerProtocol.shortName} Üye İndirimi:</span>
                      <span>-{partnerPricing.discountTl.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.14)', paddingTop: '6px' }}>
                      <span style={{ fontSize: isMobileView ? '0.8rem' : '0.75rem', color: '#4ade80', fontWeight: 900 }}>
                        NET {partnerProtocol.shortName.toUpperCase()} FİYATI:
                      </span>
                      <span style={{ fontSize: isMobileView ? '1.22rem' : '1.06rem', color: '#4ade80', fontWeight: 900 }}>
                        {partnerPricing.finalCash.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    {vatShieldTl > 0 && (
                      <div style={{
                        marginTop: '6px',
                        paddingTop: '6px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: isMobileView ? '0.72rem' : '0.68rem',
                        color: '#fcd34d',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>🧾 Vergi Avantajı (KDV):</span>
                        <span>~{vatShieldTl.toLocaleString('tr-TR')} TL Vergiden Düşülür</span>
                      </div>
                    )}
                  </>
                ) : vehicle.campaignPrice ? (
                  vehicle.cashDiscount > 0 ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#cbd5e1', marginBottom: '4px' }}>
                        <span>Kampanyalı (KDV Dahil):</span>
                        <span style={{ textDecoration: 'line-through' }}>{vehicle.campaignPrice.toLocaleString('tr-TR')} TL</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#fbbf24', marginBottom: '6px', fontWeight: 700 }}>
                        <span>Peşin İndirimi:</span>
                        <span>-{vehicle.cashDiscount.toLocaleString('tr-TR')} TL</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.14)', paddingTop: '6px' }}>
                        <span style={{ fontSize: isMobileView ? '0.8rem' : '0.76rem', color: '#4ade80', fontWeight: 800 }}>NET PEŞİN (KDV Dahil):</span>
                        <span style={{ fontSize: isMobileView ? '1.22rem' : '1.05rem', color: '#4ade80', fontWeight: 900 }}>
                          {vehicle.cashPrice.toLocaleString('tr-TR')} TL
                        </span>
                      </div>
                      {vatShieldTl > 0 && (
                        <div style={{
                          marginTop: '6px',
                          paddingTop: '6px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: isMobileView ? '0.72rem' : '0.68rem',
                          color: '#fcd34d',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>🧾 Vergi Avantajı (KDV):</span>
                          <span>~{vatShieldTl.toLocaleString('tr-TR')} TL Vergiden Düşülür</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#cbd5e1', marginBottom: '4px' }}>
                        <span>Kredili Liste (KDV Dahil):</span>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{vehicle.campaignPrice.toLocaleString('tr-TR')} TL</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.76rem' : '0.73rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                        <span>Peşin / Nakit İndirimi:</span>
                        <span>Bulunmamaktadır</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.14)', paddingTop: '6px' }}>
                        <span style={{ fontSize: isMobileView ? '0.8rem' : '0.76rem', color: '#38bdf8', fontWeight: 800 }}>KREDİLİ / NET (KDV Dahil):</span>
                        <span style={{ fontSize: isMobileView ? '1.22rem' : '1.05rem', color: '#4ade80', fontWeight: 900 }}>
                          {vehicle.cashPrice.toLocaleString('tr-TR')} TL
                        </span>
                      </div>
                      {vatShieldTl > 0 && (
                        <div style={{
                          marginTop: '6px',
                          paddingTop: '6px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: isMobileView ? '0.72rem' : '0.68rem',
                          color: '#fcd34d',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>🧾 Vergi Avantajı (KDV):</span>
                          <span>~{vatShieldTl.toLocaleString('tr-TR')} TL Vergiden Düşülür</span>
                        </div>
                      )}
                    </>
                  )
                ) : (
                  <div style={{ textAlign: 'center', color: '#7dd3fc', fontWeight: 700, fontSize: '0.85rem' }}>
                    Özel Teklif & Döviz Kuru İçin Danışınız
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
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
                    flex: 1,
                    background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: isMobileView ? '11px 8px' : '8px 8px',
                    fontSize: isMobileView ? '0.8rem' : '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <FiTruck size={isMobileView ? 14 : 12} /> Kredi Planı
                </button>

                <button
                  type="button"
                  onClick={() => handleVehicleTradeIn(vehicle)}
                  style={{
                    background: 'rgba(245, 158, 11, 0.18)',
                    color: '#fde68a',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                    borderRadius: '10px',
                    padding: isMobileView ? '11px 9px' : '8px 9px',
                    fontSize: isMobileView ? '0.78rem' : '0.71rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
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
                    background: (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? '#f59e0b' : '#22c55e',
                    color: (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: isMobileView ? '11px 10px' : '8px 10px',
                    fontSize: isMobileView ? '0.8rem' : '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                  title={(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? "Satış Sorumlusu Can M.'den Özel Fiyat Al" : "WhatsApp'tan Teklif Al"}
                >
                  <FiMessageSquare size={isMobileView ? 14 : 12} /> {(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? 'Özel Fiyat' : 'Teklif Al'}
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
    </div>
  );
}
