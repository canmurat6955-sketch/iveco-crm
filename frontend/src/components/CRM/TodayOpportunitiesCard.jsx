import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiZap, FiTrash2, FiTruck, FiPhone, FiMessageSquare, 
  FiCheckCircle, FiAlertTriangle, FiFileText, FiCalendar, FiArrowRight, FiPlus 
} from 'react-icons/fi';

export default function TodayOpportunitiesCard({
  fieldAssistant,
  opportunities,
  onOpenWhatsApp,
  onOpenQuickVisit,
  onCleanupAuto,
  cleaningAuto,
  isMobile = false
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('unvisited_a'); // unvisited_a, quote_pending, follow_ups, new_discoveries, hot_leads

  const unvisitedACount = fieldAssistant?.counts?.unvisited_a ?? 0;
  const quotePendingCount = (fieldAssistant?.counts?.proposals_pending ?? 0) + (opportunities?.counts?.quote_pending ?? 0);
  const followUpsCount = (fieldAssistant?.counts?.follow_ups_due ?? 0) + (opportunities?.counts?.follow_up_needed ?? 0);
  const newDiscoveriesCount = fieldAssistant?.counts?.new_discoveries ?? 0;
  const hotLeadsCount = (opportunities?.counts?.hot_leads ?? 0) + (opportunities?.counts?.stock_matches ?? 0);

  const TABS = [
    { key: 'unvisited_a', label: '⚠️ Ziyaretsiz (A)', fullLabel: '⚠️ Ziyaret Bekleyen (A-Segment)', count: unvisitedACount, color: '#ef4444' },
    { key: 'quote_pending', label: '📋 Teklif Bekleyen', fullLabel: '📋 Teklif & Şasi Bekleyenler', count: quotePendingCount, color: '#3b82f6' },
    { key: 'follow_ups', label: '⏰ Takip Günü', fullLabel: '⏰ Takip Tarihi Gelenler', count: followUpsCount, color: '#f59e0b' },
    { key: 'new_discoveries', label: '✨ Yeni Keşifler', fullLabel: '✨ Yeni Kurulan / Keşifler', count: newDiscoveriesCount, color: '#a855f7' },
    { key: 'hot_leads', label: '🔥 Sıcak / Stok', fullLabel: '🔥 Sıcak Müşteri & Stok Eşleşmesi', count: hotLeadsCount, color: '#10b981' },
  ];

  return (
    <div 
      className={`card ${!isMobile ? 'glass-card' : ''} mb-6`} 
      style={{ 
        border: '1px solid rgba(59, 130, 246, 0.35)', 
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        borderRadius: 14,
        overflow: 'hidden'
      }}
    >
      {/* Kart Başlığı */}
      <div 
        style={{ 
          background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.35), rgba(15, 23, 42, 0.85))', 
          padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 10,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: isMobile ? '0.95rem' : '1.08rem', fontWeight: 800, color: '#f8fafc' }}>
            <FiZap style={{ color: '#38bdf8' }} size={isMobile ? 18 : 22} /> BUGÜNÜN SATIŞ FIRSATLARI
          </h3>
          {!isMobile && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Ziyaret zamanı, araç ihtiyacı ve teklifleri eşleşen öncelikli aksiyonlar
            </span>
          )}
        </div>

        {onCleanupAuto && (
          <button
            onClick={onCleanupAuto}
            disabled={cleaningAuto}
            className="btn btn-sm"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontSize: isMobile ? '0.68rem' : '0.74rem',
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              borderRadius: 6
            }}
            title="Rehber aktarımından otomatik algılanan ilgi kayıtlarını temizle"
          >
            <FiTrash2 size={12} />
            {cleaningAuto ? 'Temizleniyor...' : 'Rehber Kayıtlarını Temizle'}
          </button>
        )}
      </div>

      {/* Kategori Sekmeleri */}
      <div 
        style={{ 
          display: 'flex', 
          gap: 6, 
          padding: isMobile ? '0.6rem 0.8rem' : '0.85rem 1.25rem', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)', 
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: isMobile ? '5px 10px' : '7px 14px', 
                borderRadius: 20, 
                fontSize: isMobile ? '0.72rem' : '0.78rem', 
                fontWeight: 700,
                border: active ? `2px solid ${tab.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                background: active ? `${tab.color}25` : 'rgba(255, 255, 255, 0.03)',
                color: active ? '#f8fafc' : '#94a3b8',
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 5,
                transition: 'all 0.15s ease', 
                whiteSpace: 'nowrap'
              }}
            >
              <span>{isMobile ? tab.label : tab.fullLabel}</span>
              <span style={{
                background: active ? tab.color : 'rgba(255,255,255,0.1)',
                color: '#fff', 
                padding: '1px 6px', 
                borderRadius: 10, 
                fontSize: '0.68rem',
                fontWeight: 800
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fırsat Kartları Listesi */}
      <div style={{ padding: isMobile ? '0.75rem' : '1.25rem' }}>
        
        {/* TAB 1: ZİYARETSİZ A-MÜŞTERİLER */}
        {activeTab === 'unvisited_a' && (
          <div>
            {(fieldAssistant?.unvisited_a?.length > 0) ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
                {fieldAssistant.unvisited_a.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-input, #1e293b)', borderRadius: 12, padding: '1rem',
                      border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', flexDirection: 'column', gap: 8,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div onClick={() => navigate(`/customers/${item.id}`)} style={{ cursor: 'pointer' }}>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc' }}>
                          {item.company_name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          📍 {item.city} / {item.district || 'Merkez'} · {item.sector || 'Genel Ticaret'}
                        </span>
                      </div>
                      <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.7rem' }}>
                        A-Segment
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.74rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)',
                      padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
                      borderLeft: '3px solid #ef4444'
                    }}>
                      <FiAlertTriangle size={13} />
                      <span>{item.days_since_visit ? `⚠️ ${item.days_since_visit} gündür ziyaret edilmedi` : '⚠️ Hiç ziyaret edilmedi!'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                      <FiTruck size={14} /> {item.vehicle_opportunity}
                    </div>

                    {/* Aksiyon Butonları */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="btn btn-sm btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6 }}
                        >
                          <FiPhone size={12} /> Ara
                        </a>
                      )}
                      {item.phone && onOpenWhatsApp && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp({
                            customer: item,
                            vehicleTitle: item.vehicle_opportunity,
                            interestId: null,
                            defaultStatus: 'offer_given'
                          })}
                          className="btn btn-sm btn-success"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25d366', borderColor: '#25d366', borderRadius: 6 }}
                        >
                          <FiMessageSquare size={12} /> WhatsApp
                        </button>
                      )}
                      {onOpenQuickVisit && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => onOpenQuickVisit({ id: item.id, company_name: item.company_name })}
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6 }}
                        >
                          <FiPlus size={12} /> Ziyaret
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/customers/${item.id}`)}
                        style={{ padding: '5px 8px', fontSize: '0.75rem', borderRadius: 6 }}
                      >
                        Kartı Aç
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Tebrikler! Bölgenizdeki tüm A-segment müşteriler yakın zamanda ziyaret edilmiş." />
            )}
          </div>
        )}

        {/* TAB 2: TEKLİF BEKLEYENLER */}
        {activeTab === 'quote_pending' && (
          <div>
            {((fieldAssistant?.proposals_pending?.length > 0) || (opportunities?.quote_pending?.length > 0)) ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
                {[...(fieldAssistant?.proposals_pending || []), ...(opportunities?.quote_pending || [])].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-input, #1e293b)', borderRadius: 12, padding: '1rem',
                      border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column', gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div onClick={() => navigate(`/customers/${item.id || item.customer_id}`)} style={{ cursor: 'pointer' }}>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc' }}>
                          {item.company_name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          📍 {item.city} {item.district ? `/ ${item.district}` : ''}
                        </span>
                      </div>
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.7rem' }}>
                        Teklif Aşamasında
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(0, 0, 0, 0.25)',
                      padding: '6px 8px', borderRadius: 6, borderLeft: '3px solid #3b82f6'
                    }}>
                      {item.note || item.reason || 'Proforma ve şasi fiyatı bekleniyor'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/proforma/quick?customer_id=${item.id || item.customer_id}`)}
                        style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6 }}
                      >
                        <FiFileText size={12} /> Hızlı Proforma
                      </button>
                      {item.phone && onOpenWhatsApp && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp({
                            customer: item,
                            vehicleTitle: item.vehicle_title || 'Iveco Şasi Teklifi',
                            interestId: item.interest_id,
                            defaultStatus: 'offer_given'
                          })}
                          className="btn btn-sm btn-success"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25d366', borderColor: '#25d366', borderRadius: 6 }}
                        >
                          <FiMessageSquare size={12} /> WhatsApp
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/customers/${item.id || item.customer_id}`)}
                        style={{ padding: '5px 8px', fontSize: '0.75rem', borderRadius: 6 }}
                      >
                        Kartı Aç
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Bekleyen açık teklif bulunmamaktadır." />
            )}
          </div>
        )}

        {/* TAB 3: TAKİP TARİHİ BUGÜN OLANLAR */}
        {activeTab === 'follow_ups' && (
          <div>
            {((fieldAssistant?.follow_ups?.length > 0) || (opportunities?.follow_up_needed?.length > 0)) ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
                {[...(fieldAssistant?.follow_ups || []), ...(opportunities?.follow_up_needed || [])].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-input, #1e293b)', borderRadius: 12, padding: '1rem',
                      border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', flexDirection: 'column', gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div onClick={() => navigate(`/customers/${item.id || item.customer_id}`)} style={{ cursor: 'pointer' }}>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc' }}>
                          {item.company_name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          📍 {item.city}
                        </span>
                      </div>
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.7rem' }}>
                        Takip Günü Geldi
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(0, 0, 0, 0.25)',
                      padding: '6px 8px', borderRadius: 6, borderLeft: '3px solid #f59e0b'
                    }}>
                      {item.notes || item.reason || 'Telefonla arama veya ziyaret planı bulunuyor.'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="btn btn-sm btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6 }}
                        >
                          <FiPhone size={12} /> Ara
                        </a>
                      )}
                      {item.phone && onOpenWhatsApp && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp({
                            customer: item,
                            vehicleTitle: item.vehicle_title || 'Iveco Araç Takibi',
                            interestId: item.interest_id,
                            defaultStatus: 'call_back'
                          })}
                          className="btn btn-sm btn-success"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25d366', borderColor: '#25d366', borderRadius: 6 }}
                        >
                          <FiMessageSquare size={12} /> WhatsApp
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/customers/${item.id || item.customer_id}`)}
                        style={{ padding: '5px 8px', fontSize: '0.75rem', borderRadius: 6 }}
                      >
                        Kartı Aç
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Bugün için bekleyen takip veya görüşme randevusu yok." />
            )}
          </div>
        )}

        {/* TAB 4: YENİ KEŞİFLER */}
        {activeTab === 'new_discoveries' && (
          <div>
            {(fieldAssistant?.new_discoveries?.length > 0) ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
                {fieldAssistant.new_discoveries.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-input, #1e293b)', borderRadius: 12, padding: '1rem',
                      border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', flexDirection: 'column', gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc' }}>
                          {item.company_name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          📍 {item.city} / {item.district || 'Merkez'}
                        </span>
                      </div>
                      <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.7rem' }}>
                        Ticaret Sicil
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.74rem', color: '#cbd5e1', background: 'rgba(0, 0, 0, 0.25)',
                      padding: '6px 8px', borderRadius: 6, borderLeft: '3px solid #a855f7'
                    }}>
                      <strong>Faaliyet:</strong> {item.nace_description || 'Sanayi & Ticaret'}
                      {item.capital && ` · Sermaye: ${item.capital}`}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="btn btn-sm btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6 }}
                        >
                          <FiPhone size={12} /> Ara
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/discovery?q=${encodeURIComponent(item.company_name)}`)}
                        style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: 6 }}
                      >
                        Keşifte İncele
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Yeni kurulan firmalar güncel." />
            )}
          </div>
        )}

        {/* TAB 5: SICAK FIRSATLAR & STOK */}
        {activeTab === 'hot_leads' && (
          <div>
            {(opportunities?.hot_leads?.length > 0 || opportunities?.stock_matches?.length > 0) ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
                {[...(opportunities?.hot_leads || []), ...(opportunities?.stock_matches || [])].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-input, #1e293b)', borderRadius: 12, padding: '1rem',
                      border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div onClick={() => navigate(`/customers/${item.customer_id}`)} style={{ cursor: 'pointer' }}>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc' }}>
                          {item.company_name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          📍 {item.city || 'Şehir Yok'} · Tel: {item.phone || '-'}
                        </span>
                      </div>
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.7rem' }}>
                        {item.interest_level || 'Yüksek İlgi'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                      <FiTruck size={14} /> {item.vehicle_title}
                    </div>

                    <div style={{
                      fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(0, 0, 0, 0.25)',
                      padding: '6px 8px', borderRadius: 6, borderLeft: '3px solid #10b981'
                    }}>
                      {item.reason}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="btn btn-sm btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6 }}
                        >
                          <FiPhone size={12} /> Ara
                        </a>
                      )}
                      {item.phone && onOpenWhatsApp && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp({
                            customer: {
                              id: item.customer_id,
                              company_name: item.company_name,
                              phone: item.phone,
                              city: item.city
                            },
                            vehicleTitle: item.vehicle_title,
                            interestId: item.interest_id,
                            defaultStatus: 'offer_given'
                          })}
                          className="btn btn-sm btn-success"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25d366', borderColor: '#25d366', borderRadius: 6 }}
                        >
                          <FiMessageSquare size={12} /> WhatsApp
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/customers/${item.customer_id}`)}
                        style={{ padding: '5px 8px', fontSize: '0.75rem', borderRadius: 6 }}
                      >
                        Kartı Aç
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Sıcak araç fırsatları ve stok eşleşmeleri güncel." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.84rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10 }}>
      <FiCheckCircle size={24} style={{ color: '#10b981', marginBottom: 6 }} />
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
