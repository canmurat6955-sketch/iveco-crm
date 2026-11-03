import React, { useState, useMemo, useEffect } from 'react';
import { IVECO_PRICING_CATALOG } from '../../../data/ivecoPricingCatalog';
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

export default function PricingCatalogTab({ onSelectVehicle, onDirectWhatsApp, salesRep }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyDoubleWheels, setOnlyDoubleWheels] = useState(false);
  const [isMobileView, setIsMobileView] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredVehicles = useMemo(() => {
    return IVECO_PRICING_CATALOG.filter(v => {
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
  }, [selectedCategory, searchQuery, onlyDoubleWheels]);

  const handleVehicleQuote = (vehicle) => {
    if (onDirectWhatsApp) {
      if (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) {
        const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, 2026 Model Fiyat Listesindeki *${vehicle.model}* (Ağır Şantiye / Hafriyat) için şantiye ve proje ihtiyacımıza özel filo fiyat teklifi ve teslimat kotası hakkında bilgi almak istiyorum.`;
        onDirectWhatsApp(msg);
        return;
      }
      const priceText = vehicle.currency === 'EUR'
        ? `€${(vehicle.eurPrice || vehicle.cashPrice).toLocaleString('tr-TR')} + KDV (Euro)`
        : (vehicle.cashPrice ? `${vehicle.cashPrice.toLocaleString('tr-TR')} TL Peşin` : 'Özel Proje Fiyatı');
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, 2026 Model Fiyat Listesindeki *${vehicle.model}* (${priceText}) hakkında detaylı proforma ve teslimat bilgisi almak istiyorum.`;
      onDirectWhatsApp(msg);
    }
  };

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
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
                {selectedCategory === 'sway'
                  ? 'Uluslararası lojistik ve taşımacılık filoları için resmi Euro (€) liste fiyatları ve ihracatçı Euro kredisi seçenekleri.'
                  : selectedCategory === 'tway'
                    ? '10 ve 12 teker ağır kaya damperi ve mikser şasilerinde Euro (€) liste fiyatları ve fabrika kota tahsisi.'
                    : selectedCategory === 'daily70'
                      ? '7.000 kg ve 7.200 kg azami yüklü ağırlıklı 70C16 şasi kamyon ve 70C18 yüksek hacimli (19.6 m³) panelvan resmi liste fiyatları.'
                      : 'Tüm modellerde şeffaf resmi liste fiyatları ve fabrika kota tahsisi uygulanmıştır.'}
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

      {/* Yasal İstiap & Kantar Güvencesi Banner (YALNIZCA Daily 35 Serisi Seçildiğinde Gösterilir) */}
      {(selectedCategory === 'daily35_chassis' || selectedCategory === 'daily35_van') && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
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
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                B Ehliyet & Kantar Uyumu (Daily 35)
              </div>
              {!isMobileView && (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
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
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.72rem',
              color: '#38bdf8',
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
                background: selectedCategory === cat.id ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : 'rgba(15, 23, 42, 0.8)',
                color: selectedCategory === cat.id ? '#fff' : '#cbd5e1',
                border: selectedCategory === cat.id ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
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
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMobileView ? 'Model ara (35C16, Hi-Matic...)' : 'Model, vites, motor ara (örn: 35C16, Hi-Matic, 3.0)...'}
              style={{
                width: '100%',
                padding: isMobileView ? '11px 12px 11px 34px' : '10px 12px 10px 36px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
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
            background: onlyDoubleWheels ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: onlyDoubleWheels ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: isMobileView ? '10px 12px' : '8px 14px',
            cursor: 'pointer',
            fontSize: isMobileView ? '0.78rem' : '0.78rem',
            color: onlyDoubleWheels ? '#fbbf24' : '#94a3b8',
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
          return (
            <div
              key={vehicle.id}
              style={{
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1.5px solid rgba(255, 255, 255, 0.14)',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  background: 'rgba(2, 132, 199, 0.2)',
                  color: '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  {vehicle.category}
                </span>
                {vehicle.cashDiscount && vehicle.currency !== 'EUR' ? (
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
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
                ) : null}
              </div>

              {/* Title & Specs */}
              <div>
                <h3 style={{ fontSize: isMobileView ? '1.08rem' : '0.98rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {vehicle.model}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: isMobileView ? '0.78rem' : '0.72rem', color: '#cbd5e1', marginBottom: '8px' }}>
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
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '8px',
                    padding: isMobileView ? '7px 10px' : '5px 8px',
                    marginBottom: '10px',
                    fontSize: isMobileView ? '0.78rem' : '0.71rem'
                  }}>
                    <span style={{ color: '#94a3b8', fontWeight: 700 }}>
                      📦 Uyumlu Kasa Boyu:
                    </span>
                    <strong style={{ color: '#34d399', fontWeight: 900 }}>
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
                    background: 'rgba(2, 132, 199, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.18)',
                    borderRadius: '8px',
                    padding: '5px 8px',
                    marginBottom: '12px',
                    fontSize: '0.67rem'
                  }}>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                      🟢 2026 Kota: Hazır Teslim Şasi
                    </span>
                    {vehicle.segment === 'Daily 35' && (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>
                        🛡️ B Ehliyet / Kantar Uyumu
                      </span>
                    )}
                    {vehicle.segment === 'T-Way' && (
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                        🚜 Ağır Hizmet / Kaya Damperi
                      </span>
                    )}
                    {vehicle.segment === 'S-Way' && (
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                        🛣️ Uzun Yol Çekici
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing Box */}
              <div style={{
                background: 'rgba(2, 6, 23, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: isMobileView ? '12px 14px' : '10px 12px',
                marginBottom: '12px'
              }}>
                {(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.28)',
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
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', lineHeight: 1.35 }}>
                      T-Way ağır şantiye ve hafriyat araçlarımız şasi boyutu, damper hacmi ve filo kotasına göre şahsen fiyatlandırılmaktadır.
                    </div>
                  </div>
                ) : vehicle.currency === 'EUR' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#94a3b8', marginBottom: '4px' }}>
                      <span>Resmi Liste Fiyatı:</span>
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>€{(vehicle.eurPrice || vehicle.cashPrice).toLocaleString('tr-TR')} + KDV</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.76rem' : '0.74rem', color: '#38bdf8', marginBottom: '6px' }}>
                      <span>Finansman & Teslimat:</span>
                      <span>Euro Kredisi & Filo Kotası</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '6px' }}>
                      <span style={{ fontSize: isMobileView ? '0.8rem' : '0.76rem', color: '#38bdf8', fontWeight: 800 }}>EURO PROJE FİYATI:</span>
                      <span style={{ fontSize: isMobileView ? '1.22rem' : '1.08rem', color: '#38bdf8', fontWeight: 900 }}>
                        €{(vehicle.eurPrice || vehicle.cashPrice).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </>
                ) : vehicle.campaignPrice ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#94a3b8', marginBottom: '4px' }}>
                      <span>Kampanyalı Liste:</span>
                      <span style={{ textDecoration: 'line-through' }}>{vehicle.campaignPrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobileView ? '0.78rem' : '0.74rem', color: '#f59e0b', marginBottom: '6px', fontWeight: 700 }}>
                      <span>Peşin İndirimi:</span>
                      <span>-{vehicle.cashDiscount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '6px' }}>
                      <span style={{ fontSize: isMobileView ? '0.8rem' : '0.76rem', color: '#4ade80', fontWeight: 800 }}>NET PEŞİN FİYAT:</span>
                      <span style={{ fontSize: isMobileView ? '1.22rem' : '1.05rem', color: '#4ade80', fontWeight: 900 }}>
                        {vehicle.cashPrice.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                    Özel Teklif & Döviz Kuru İçin Danışınız
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onSelectVehicle && onSelectVehicle(vehicle)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: isMobileView ? '12px 10px' : '8px 10px',
                    fontSize: isMobileView ? '0.84rem' : '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FiTruck size={isMobileView ? 15 : 13} /> Kredi Hesapla
                </button>

                <button
                  type="button"
                  onClick={() => handleVehicleQuote(vehicle)}
                  style={{
                    background: (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? '#f59e0b' : '#22c55e',
                    color: (vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: isMobileView ? '12px 14px' : '8px 12px',
                    fontSize: isMobileView ? '0.84rem' : '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title={(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? "Can Murat'tan Özel Fiyat Al" : "WhatsApp'tan Teklif Al"}
                >
                  <FiMessageSquare size={isMobileView ? 15 : 13} /> {(vehicle.segment === 'T-Way' || vehicle.isCustomPrice) ? 'Özel Fiyat Al' : 'Teklif Al'}
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
