import React, { useState, useEffect } from 'react';
import { vehiclesApi } from '../../api/client';
import { FiX, FiCheckCircle, FiPhone, FiMessageSquare, FiTruck, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StockMatchModal({ stockId, onClose, onCustomerSelect }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!stockId) return;
    setLoading(true);
    vehiclesApi.getStockMatchingCustomers(stockId)
      .then(res => setData(res.data))
      .catch(err => toast.error('Stok eşleşmeleri yüklenemedi'))
      .finally(() => setLoading(false));
  }, [stockId]);

  const getMatchBadge = (level) => {
    switch (level) {
      case 'exact':
        return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981' }}>Birebir Eşleşme (100%)</span>;
      case 'model':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6' }}>Model Eşleşmesi (85%)</span>;
      case 'spec':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b' }}>Spesifikasyon Eşleşmesi (70%)</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1' }}>Grup İlgisi (50%)</span>;
    }
  };

  const getInterestBadge = (level) => {
    const map = {
      purchase_ready: { label: 'Satın Alma Aşamasında 🔥', color: '#ef4444' },
      high: { label: 'Yüksek İlgi', color: '#f97316' },
      medium: { label: 'Orta İlgi', color: '#f59e0b' },
      low: { label: 'Düşük İlgi', color: '#3b82f6' },
      very_low: { label: 'Çok Düşük', color: '#64748b' }
    };
    const item = map[level] || { label: level, color: '#94a3b8' };
    return (
      <span style={{
        background: `${item.color}15`, color: item.color,
        border: `1px solid ${item.color}30`, padding: '2px 8px',
        borderRadius: 4, fontSize: '0.72rem', fontWeight: 700
      }}>
        {item.label}
      </span>
    );
  };

  const getTimeframeLabel = (tf) => {
    const map = {
      immediate: 'Hemen',
      '0_30_days': '0–30 Gün',
      '1_3_months': '1–3 Ay',
      '3_6_months': '3–6 Ay',
      '6_12_months': '6–12 Ay',
      unknown: 'Belirsiz'
    };
    return map[tf] || tf;
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div className="modal-card animate-in" style={{
        background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 16, width: '100%', maxWidth: 750, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(15, 23, 42, 0.8))'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiTruck size={20} color="#34d399" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                BU ARAÇLA İLGİLENEN MÜŞTERİLER
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
              Stok Araç: <strong>{data?.stock_vehicle_title || 'Yükleniyor...'}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', padding: 6, borderRadius: 6
          }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Stats Row */}
        {data && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
            padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Toplam Müşteri</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{data.total_matches}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>Yüksek / Hazır</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>{data.high_interest_count}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Orta İlgi</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>{data.medium_interest_count}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#3b82f6' }}>Düşük İlgi</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6' }}>{data.low_interest_count}</div>
            </div>
          </div>
        )}

        {/* Matches List */}
        <div style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Eşleşen müşteriler taranıyor...</div>
          ) : data?.matches?.length > 0 ? (
            data.matches.map((item) => (
              <div key={item.interest_id} style={{
                background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                      {item.company_name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {item.city || 'Şehir Belirtilmemiş'} • Tel: {item.phone || '-'}
                    </span>
                  </div>
                  <div>
                    {getMatchBadge(item.match_level)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: '0.78rem' }}>
                  {getInterestBadge(item.interest_level)}
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1' }}>
                    Alım Zamanı: {getTimeframeLabel(item.purchase_timeframe)}
                  </span>
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1' }}>
                    Adet: {item.estimated_quantity}
                  </span>
                  <span style={{ color: '#64748b' }}>
                    Danışman: {item.assigned_sales_rep}
                  </span>
                </div>

                {item.customer_note && (
                  <div style={{
                    fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(0, 0, 0, 0.2)',
                    padding: '6px 10px', borderRadius: 6, borderLeft: '3px solid #3b82f6'
                  }}>
                    {item.customer_note}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      className="btn btn-sm btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <FiPhone size={12} /> Ara
                    </a>
                  )}
                  {item.phone && (
                    <a
                      href={`https://wa.me/90${item.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Sayın Yetkili, IVECO ${data?.stock_vehicle_title || ''} aracımız hemen teslim bayii stoklarımızda mevcuttur. Bilgi almak ister misiniz?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-success"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25d366', borderColor: '#25d366' }}
                    >
                      <FiMessageSquare size={12} /> WhatsApp
                    </a>
                  )}
                  {onCustomerSelect && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => onCustomerSelect(item.customer_id)}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Müşteri Kartına Git
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <FiAlertCircle size={32} style={{ marginBottom: 8, color: '#f59e0b' }} />
              <p>Bu araç spesifikasyonu ile doğrudan eşleşen açık müşteri ilgisi bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
