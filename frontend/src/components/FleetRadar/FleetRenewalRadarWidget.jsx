import { useState, useEffect } from 'react';
import { crmApi } from '../../api/client';
import { Link } from 'react-router-dom';

export default function FleetRenewalRadarWidget({ onOpenWhatsApp = null }) {
  const [loading, setLoading] = useState(true);
  const [radarItems, setRadarItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'urgent' | 'upcoming'

  useEffect(() => {
    fetchRadar();
  }, []);

  const fetchRadar = async () => {
    try {
      setLoading(true);
      const res = await crmApi.getFleetRenewalRadar({ limit: 10 });
      setRadarItems(res.data || []);
    } catch (err) {
      console.error('Fleet radar fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = radarItems.filter(item => {
    if (filter === 'urgent') return item.urgency === 'urgent';
    if (filter === 'upcoming') return item.urgency === 'upcoming';
    return true;
  });

  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)', borderRadius: '16px', border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', overflow: 'hidden', marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
          }}>
            📡
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Filo Yaşam Döngüsü & Yenileme Radarı
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              3. yılını veya 160.000 km'yi dolduran müşteri filolarında takas ve yenileme alarmları.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              border: '1px solid #cbd5e1', background: filter === 'all' ? '#0f172a' : '#fff', color: filter === 'all' ? '#fff' : '#475569'
            }}
          >
            Tümü ({radarItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('urgent')}
            style={{
              padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              border: '1px solid #fecaca', background: filter === 'urgent' ? '#ef4444' : '#fef2f2', color: filter === 'urgent' ? '#fff' : '#dc2626'
            }}
          >
            🔴 Kritik ({radarItems.filter(i => i.urgency === 'urgent').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            style={{
              padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              border: '1px solid #fde68a', background: filter === 'upcoming' ? '#f59e0b' : '#fffbeb', color: filter === 'upcoming' ? '#fff' : '#b45309'
            }}
          >
            🟡 Yaklaşan ({radarItems.filter(i => i.urgency === 'upcoming').length})
          </button>
        </div>
      </div>

      {/* List Body */}
      <div style={{ padding: '16px 20px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            Filolar taranıyor...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            Kritik eşikte filo yenileme alarmı bulunmuyor.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  border: item.urgency === 'urgent' ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  borderRadius: '12px', padding: '14px', background: item.urgency === 'urgent' ? '#fffbfb' : '#ffffff',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <Link
                      to={`/customers/${item.customer_id}`}
                      style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', textDecoration: 'none' }}
                    >
                      {item.customer_name}
                    </Link>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '700',
                      background: item.urgency === 'urgent' ? '#fee2e2' : '#fef3c7',
                      color: item.urgency === 'urgent' ? '#b91c1c' : '#92400e'
                    }}>
                      {item.urgency === 'urgent' ? 'Ağır Bakım Eşiği' : 'Garanti Bitimi'}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                    📍 {item.city} {item.district ? `• ${item.district}` : ''} | 🚗 {item.current_vehicle}
                  </div>

                  <div style={{
                    fontSize: '12px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px',
                    color: '#334155', border: '1px solid #f1f5f9', lineHeight: 1.4
                  }}>
                    ⚠️ {item.reason}
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600', marginBottom: '6px' }}>
                    🎯 Tavsiye: {item.suggested_iveco}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
                      🏦 {item.campaign_highlight}
                    </span>
                    <a
                      href={`https://wa.me/90${(item.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Ben IVECO ERC Otomotiv Satış Sorumlusu Can Murat. Sizin için hazırladığımız avantajlı IVECO filo yenileme ve takas kampanyamızı paylaşmak istedim. Düşünürseniz detayları görüşmekten memnuniyet duyarım.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 10px', background: '#22c55e', color: '#fff', borderRadius: '6px',
                        fontSize: '11px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
