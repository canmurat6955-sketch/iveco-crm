import React, { useState, useMemo } from 'react';
import { IVECO_PRICING_CATALOG } from '../../../data/ivecoPricingCatalog';
import { FiTruck, FiSearch, FiFilter, FiCheck, FiMessageSquare, FiExternalLink, FiDollarSign, FiTag } from 'react-icons/fi';

const CATEGORIES = [
  { id: 'all', label: 'Tüm Araçlar' },
  { id: 'daily35_chassis', label: 'Daily 35 Şasi (B Ehliyet)' },
  { id: 'daily35_van', label: 'Daily 35 Panelvan' },
  { id: 'daily70', label: 'Daily 70 Kamyon (7 Ton)' },
  { id: 'eurocargo', label: 'Eurocargo Kamyon (10-18 Ton)' },
  { id: 'sway', label: 'S-Way Çekici' }
];

export default function PricingCatalogTab({ onSelectVehicle, onDirectWhatsApp, salesRep }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyDoubleWheels, setOnlyDoubleWheels] = useState(false);

  const filteredVehicles = useMemo(() => {
    return IVECO_PRICING_CATALOG.filter(v => {
      // Category filter
      if (selectedCategory === 'daily35_chassis') {
        if (v.segment !== 'Daily 35' || v.category.includes('Panelvan')) return false;
      } else if (selectedCategory === 'daily35_van') {
        if (v.segment !== 'Daily 35' || !v.category.includes('Panelvan')) return false;
      } else if (selectedCategory === 'daily70') {
        if (v.segment !== 'Daily 70') return false;
      } else if (selectedCategory === 'eurocargo') {
        if (v.segment !== 'Eurocargo') return false;
      } else if (selectedCategory === 'sway') {
        if (v.segment !== 'S-Way') return false;
      }

      // Double wheel filter
      if (onlyDoubleWheels && !v.category.toLowerCase().includes('çift teker') && !v.model.toLowerCase().includes(' 35 c')) {
        return false;
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
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, 2026 Model Fiyat Listesindeki *${vehicle.model}* (${vehicle.cashPrice ? vehicle.cashPrice.toLocaleString('tr-TR') + ' TL Peşin' : 'Teklif Bekliyor'}) hakkında detaylı proforma ve teslimat bilgisi almak istiyorum.`;
      onDirectWhatsApp(msg);
    }
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Tab Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '16px',
        padding: '18px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            RESMİ 2026 MODEL FİYAT MATRİSİ
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 2px', color: '#fff' }}>
            IVECO Sıfır Kilometre Araç Fiyat Listesi
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Tüm modellerde şeffaf bayi maliyeti bazlı liste fiyatı ve özel peşin indirimleri uygulanmıştır.
          </p>
        </div>
        <div style={{
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '12px',
          padding: '8px 14px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.70rem', color: '#4ade80', fontWeight: 700 }}>🔥 GÜNCEL AVANTAJ</div>
          <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>Çift Tekerlerde 90.000 TL İndirim</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? '#0284c7' : 'rgba(15, 23, 42, 0.65)',
                color: selectedCategory === cat.id ? '#fff' : '#94a3b8',
                border: selectedCategory === cat.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Checkbox */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Model, vites, motor ara (örn: 35C16, Hi-Matic, 3.0)..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: onlyDoubleWheels ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: onlyDoubleWheels ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '0.78rem',
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
            Yalnızca Çift Teker Modelleri (-90k)
          </label>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredVehicles.map(vehicle => {
          const isDoubleWheel35 = vehicle.segment === 'Daily 35' && (vehicle.category.includes('Çift Teker') || vehicle.id.includes('35c16'));
          return (
            <div
              key={vehicle.id}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: isDoubleWheel35 ? '1.5px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: isDoubleWheel35 ? '0 4px 20px rgba(245, 158, 11, 0.15)' : 'none',
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

                {isDoubleWheel35 && (
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 158, 11, 0.4)'
                  }}>
                    🔥 90.000 TL İndirimli
                  </span>
                )}
              </div>

              {/* Title & Specs */}
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {vehicle.model}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '14px' }}>
                  <div>⚙️ <strong>Vites:</strong> {vehicle.transmission || 'Manuel'}</div>
                  <div>🐎 <strong>Motor:</strong> {vehicle.engine || '-'}</div>
                  <div>⚡ <strong>Güç:</strong> {vehicle.power ? vehicle.power.split('(')[1]?.replace(')', '') || vehicle.power : '-'}</div>
                  <div>📏 <strong>Dingil:</strong> {vehicle.wheelbase ? `${vehicle.wheelbase} mm` : '-'}</div>
                </div>
              </div>

              {/* Pricing Box */}
              <div style={{
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '12px'
              }}>
                {vehicle.campaignPrice ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '4px' }}>
                      <span>Kampanyalı Liste:</span>
                      <span style={{ textDecoration: 'line-through' }}>{vehicle.campaignPrice.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#f59e0b', marginBottom: '6px' }}>
                      <span>Peşin İndirimi:</span>
                      <span>-{vehicle.cashDiscount.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '6px' }}>
                      <span style={{ fontSize: '0.76rem', color: '#4ade80', fontWeight: 700 }}>NET PEŞİN FİYAT:</span>
                      <span style={{ fontSize: '1.05rem', color: '#4ade80', fontWeight: 800 }}>
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
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FiTruck size={13} /> Kredi Simülasyonu
                </button>

                <button
                  type="button"
                  onClick={() => handleVehicleQuote(vehicle)}
                  style={{
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="WhatsApp'tan Teklif Al"
                >
                  <FiMessageSquare size={13} /> Teklif Al
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
