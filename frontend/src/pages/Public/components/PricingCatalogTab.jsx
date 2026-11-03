import React, { useState, useMemo, useEffect } from 'react';
import { IVECO_PRICING_CATALOG, getVehicleSticker } from '../../../data/ivecoPricingCatalog';
import { FiTruck, FiSearch, FiFilter, FiCheck, FiMessageSquare, FiExternalLink, FiDollarSign, FiTag } from 'react-icons/fi';

const CATEGORIES = [
  { id: 'all', label: 'Tüm Araçlar', shortLabel: 'Tümü' },
  { id: 'daily35_chassis', label: 'Daily 35 Şasi (B Ehliyet)', shortLabel: 'Daily 35 Şasi' },
  { id: 'daily35_van', label: 'Daily 35 Panelvan', shortLabel: 'Daily Panelvan' },
  { id: 'daily70', label: 'Daily 70C / 72C (7 Ton Kamyon)', shortLabel: 'Daily 70C / 72C' },
  { id: 'eurocargo', label: 'Eurocargo Kamyon (10-18 Ton)', shortLabel: 'Eurocargo' },
  { id: 'sway', label: 'S-Way Çekici', shortLabel: 'S-Way Çekici' },
  { id: 'tway', label: 'T-Way Şantiye & Hafriyat (10-12 Teker)', shortLabel: 'T-Way Şantiye' }
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

export default function PricingCatalogTab({ initialSector = '', onSelectVehicle, onDirectWhatsApp, salesRep }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState(() => normalizeSectorId(initialSector));
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyDoubleWheels, setOnlyDoubleWheels] = useState(false);
  const [showTradeInBox, setShowTradeInBox] = useState(false);
  const [tradeInVehicleText, setTradeInVehicleText] = useState('');
  const [tradeInTargetModel, setTradeInTargetModel] = useState('Daily 35C16 Çift Teker');
  const [showFleetBox, setShowFleetBox] = useState(false);
  const [fleetQuantity, setFleetQuantity] = useState('2 - 3 Adet');
  const [fleetTargetModel, setFleetTargetModel] = useState('Daily 35C16 Çift Teker');
  const [isMobileView, setIsMobileView] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

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

  const handleVehicleQuote = (vehicle) => {
    if (onDirectWhatsApp) {
      if (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) {
        const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, 2026 Model Fiyat Listesindeki *${vehicle.model}* (Ağır Şantiye / Hafriyat) için şantiye ve proje ihtiyacımıza özel filo fiyat teklifi ve teslimat kotası hakkında bilgi almak istiyorum.`;
        onDirectWhatsApp(msg);
        return;
      }
      const priceText = vehicle.currency === 'EUR'
        ? `€${(vehicle.eurPrice || vehicle.cashPrice).toLocaleString('tr-TR')} + KDV (Euro)`
        : (vehicle.cashDiscount > 0
            ? `${vehicle.cashPrice.toLocaleString('tr-TR')} TL Peşin`
            : `${(vehicle.campaignPrice || vehicle.cashPrice).toLocaleString('tr-TR')} TL Kredili Fiyat`);
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, 2026 Model Fiyat Listesindeki *${vehicle.model}* (${priceText}) hakkında detaylı proforma ve teslimat bilgisi almak istiyorum.`;
      onDirectWhatsApp(msg);
    }
  };

  const handleVehicleTradeIn = (vehicle) => {
    if (onDirectWhatsApp) {
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, mevcut ticari aracımı takasa vererek (peşinata saydırıp kalan tutarı kredilendirerek) sıfır *${vehicle.model}* almak istiyorum. Takas ekspertiz ve ödeme planı için görüşebilir miyiz?`;
      onDirectWhatsApp(msg);
    }
  };

  const handleGeneralTradeInSubmit = () => {
    if (onDirectWhatsApp) {
      const currentCar = tradeInVehicleText.trim() ? `*${tradeInVehicleText.trim()}*` : 'mevcut ticari aracımı';
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, elimdeki ${currentCar} takasa verip peşinata saydırarak sıfır *IVECO ${tradeInTargetModel}* almak istiyorum. Takas değerleme ve kredi farkı için bilgi alabilir miyim?`;
      onDirectWhatsApp(msg);
    }
  };

  const handleFleetDiscountSubmit = () => {
    if (onDirectWhatsApp) {
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, şirketimiz bünyesinde *${fleetQuantity}* *IVECO ${fleetTargetModel}* çoklu filo alımı planlıyoruz. Kurumsal filo özel iskontonuz, teslimat kotası ve finansman koşullarınız hakkında teklif rica ederiz.`;
      onDirectWhatsApp(msg);
    }
  };

  const activeSectorObj = SECTOR_FILTERS.find(s => s.id === selectedSectorFilter);

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Tab Banner (Mobilde yalnızca özel bir kategori seçildiğinde gösterilir, tüm araçlarda tekrar etmez) */}
      {(!isMobileView || selectedCategory !== 'all') && (
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

      {/* 🔄 TAKAS PEŞİNAT & 🏢 2+ ARAÇ FİLO İSKONTOSU ÇİFT AKSİYON BARI */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(24, 42, 72, 0.94) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.42)',
        borderRadius: '12px',
        padding: isMobileView ? '10px 12px' : '12px 16px',
        marginBottom: isMobileView ? '12px' : '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
            <span style={{ fontSize: isMobileView ? '1.25rem' : '1.45rem' }}>🤝</span>
            <div>
              <div style={{ fontSize: isMobileView ? '0.82rem' : '0.88rem', fontWeight: 800, color: '#fde68a' }}>
                Takas Peşinat Desteği & Kurumsal Filo İskontosu (2+ Araç)
              </div>
              <div style={{ fontSize: isMobileView ? '0.71rem' : '0.75rem', color: '#e2e8f0' }}>
                Eski aracınızı peşinata saydırabilir veya 2 ve üzeri çoklu araç alımlarınız için özel filo iskontosu talep edebilirsiniz.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setShowTradeInBox(prev => !prev); setShowFleetBox(false); }}
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
              {showTradeInBox ? '✕ Kapat' : '🔄 Takas Aracımı Saydır'}
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
            paddingTop: '12px',
            borderTop: '1px dashed rgba(245, 158, 11, 0.35)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={tradeInVehicleText}
              onChange={(e) => setTradeInVehicleText(e.target.value)}
              placeholder="Mevcut aracınız (Örn: 2020 Ford Transit 350ED / 2018 Atego...)"
              style={{
                flex: '2 1 220px',
                padding: '9px 12px',
                background: 'rgba(15, 28, 50, 0.85)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <select
              value={tradeInTargetModel}
              onChange={(e) => setTradeInTargetModel(e.target.value)}
              style={{
                flex: '1 1 180px',
                padding: '9px 12px',
                background: 'rgba(15, 28, 50, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="Daily 35C16 Çift Teker">Hedef: Daily 35C16 Çift Teker</option>
              <option value="Daily 35S16 Tek Teker / Panelvan">Hedef: Daily 35S16 / Panelvan</option>
              <option value="Daily 72C18 (7 Ton Kamyon)">Hedef: Daily 72C18 (7 Ton)</option>
              <option value="Eurocargo 100E / 150E / 160E">Hedef: Eurocargo Kamyon</option>
              <option value="S-Way Çekici / T-Way Hafriyat">Hedef: S-Way / T-Way</option>
            </select>
            <button
              type="button"
              onClick={handleGeneralTradeInSubmit}
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
              <FiMessageSquare size={14} /> WhatsApp'tan Takas Teklifi Al
            </button>
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

      {/* 🎯 İŞİNİZE / SEKTÖRÜNÜZE GÖRE HIZLI FİLTRE (Madde 1) */}
      <div style={{
        background: 'rgba(24, 42, 72, 0.85)',
        border: '1px solid rgba(125, 211, 252, 0.25)',
        borderRadius: '12px',
        padding: isMobileView ? '10px 10px' : '12px 14px',
        marginBottom: isMobileView ? '10px' : '14px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🎯 İŞİNİZE / SEKTÖRÜNÜZE UYGUN ARAÇLARI SÜZÜN:
          </span>
          {selectedSectorFilter !== 'all' && activeSectorObj && (
            <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>
              ✓ {activeSectorObj.desc}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {SECTOR_FILTERS.map(sec => {
            const isSel = selectedSectorFilter === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setSelectedSectorFilter(sec.id);
                  setSelectedCategory('all');
                }}
                style={{
                  background: isSel ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'rgba(15, 28, 50, 0.78)',
                  color: '#ffffff',
                  border: isSel ? '1.5px solid #4ade80' : '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '20px',
                  padding: isMobileView ? '7px 10px' : '6px 12px',
                  fontSize: isMobileView ? '0.74rem' : '0.75rem',
                  fontWeight: isSel ? 800 : 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {sec.label}
              </button>
            );
          })}
        </div>
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
          const effectiveTlPrice = vehicle.cashPrice || vehicle.campaignPrice || 0;
          const vatShieldTl = effectiveTlPrice > 0 ? Math.round(effectiveTlPrice - (effectiveTlPrice / 1.20)) : 0;

          return (
            <div
              key={vehicle.id}
              style={{
                background: 'linear-gradient(165deg, rgba(33, 55, 90, 0.94) 0%, rgba(24, 41, 68, 0.94) 100%)',
                border: '1.5px solid rgba(125, 211, 252, 0.26)',
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
                {vehicle.cashDiscount > 0 && vehicle.currency !== 'EUR' ? (
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

                {/* Stock Quota & Legal Payload Indicator */}
                {!isMobileView && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(2, 132, 199, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '8px',
                    padding: '5px 8px',
                    marginBottom: '12px',
                    fontSize: '0.67rem'
                  }}>
                    <span style={{ color: '#7dd3fc', fontWeight: 700 }}>
                      🟢 2026 Kota: Hazır Teslim Şasi
                    </span>
                    {vehicle.segment === 'Daily 35' && (
                      <span style={{ color: '#34d399', fontWeight: 700 }}>
                        🛡️ B Ehliyet / Kantar Uyumu
                      </span>
                    )}
                    {vehicle.segment === 'T-Way' && (
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                        🚜 Ağır Hizmet / Kaya Damperi
                      </span>
                    )}
                    {vehicle.segment === 'S-Way' && (
                      <span style={{ color: '#7dd3fc', fontWeight: 700 }}>
                        🛣️ Uzun Yol Çekici
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing Box + Automatic KDV Shield */}
              <div style={{
                background: 'rgba(16, 30, 54, 0.65)',
                border: '1px solid rgba(148, 163, 184, 0.22)',
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
                      ⭐ PROJEYE ÖZEL ŞANTİYE FİYATLANDIRMASI
                    </div>
                    <div style={{ fontSize: isMobileView ? '1.08rem' : '1.02rem', fontWeight: 900, color: '#fef08a', marginBottom: '3px' }}>
                      Can Murat Onay'a Danışınız
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                      T-Way ağır şantiye araçlarımız damper/mikser tipi, takas ve filo kotasına göre özel fiyatlandırılmaktadır.
                    </div>
                  </div>
                ) : vehicle.currency === 'EUR' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      <span>Resmi Liste Fiyatı:</span>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>€{(vehicle.eurPrice || vehicle.cashPrice).toLocaleString('tr-TR')} + KDV</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.76rem' : '0.74rem', color: '#7dd3fc', marginBottom: '6px' }}>
                      <span>Finansman & Teslimat:</span>
                      <span>Euro Kredisi & Filo Kotası</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.14)', paddingTop: '6px' }}>
                      <span style={{ fontSize: isMobileView ? '0.8rem' : '0.76rem', color: '#7dd3fc', fontWeight: 800 }}>EURO PROJE FİYATI:</span>
                      <span style={{ fontSize: isMobileView ? '1.22rem' : '1.08rem', color: '#38bdf8', fontWeight: 900 }}>
                        €{(vehicle.eurPrice || vehicle.cashPrice).toLocaleString('tr-TR')}
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
                  onClick={() => onSelectVehicle && onSelectVehicle(vehicle)}
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
                  title={(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? "Can Murat'tan Özel Fiyat Al" : "WhatsApp'tan Teklif Al"}
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
