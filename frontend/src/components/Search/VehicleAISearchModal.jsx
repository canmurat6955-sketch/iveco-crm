import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehiclesApi } from '../../api/client';
import { FiSearch, FiX, FiZap, FiTruck, FiPhone, FiMessageSquare, FiExternalLink, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EXAMPLE_QUERIES = [
  "16 m³ panelvan isteyen müşteriler",
  "35C16 3750 isteyen müşteriler",
  "Eurocargo 150E21 5175",
  "S-Way 580 Diamond",
  "T-Way 10 teker hafriyat",
  "T-Way 12 teker mikser",
  "Son 30 gündür görüşmediğimiz 35C16 müşterileri",
  "0-3 ay içinde araç alacak Daily müşterileri",
  "Stokta bulunan araçlarla eşleşen müşteriler"
];

export default function VehicleAISearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSearch = async (queryText) => {
    const q = (queryText !== undefined ? queryText : query).trim();
    if (!q) {
      toast.error('Lütfen bir arama sorgusu yazın');
      return;
    }
    setQuery(q);
    setLoading(true);

    try {
      const res = await vehiclesApi.aiSearch(q);
      setSearchResponse(res.data);
    } catch (err) {
      toast.error('AI arama gerçekleştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = (customerId) => {
    onClose();
    navigate(`/customers/${customerId}`);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 99999, padding: '3rem 1rem 1rem 1rem'
    }}>
      <div className="modal-card animate-in" style={{
        background: '#0f172a', border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 16, width: '100%', maxWidth: 780, maxHeight: '88vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Search Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.9))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiZap size={20} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                IVECO Global AI Araç & Müşteri Arama Zekâsı
              </h3>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', padding: 6, borderRadius: 6
            }}>
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: 8 }}>
            <div style={{
              flex: 1, position: 'relative', display: 'flex', alignItems: 'center',
              background: '#090d16', borderRadius: 10, border: '1px solid rgba(59, 130, 246, 0.4)'
            }}>
              <FiSearch style={{ position: 'absolute', left: 14, color: '#60a5fa' }} size={18} />
              <input
                type="text"
                autoFocus
                placeholder="Örn: 16 m3 panelvan isteyen müşterileri getir veya 35C16 3750..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px 12px 42px', background: 'transparent',
                  border: 'none', color: '#fff', fontSize: '0.92rem', outline: 'none'
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', paddingRight: 12 }}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '0 20px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {loading ? 'Aranıyor...' : 'Sorgula'}
            </button>
          </form>

          {/* Quick Example Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>Örnek Sorgular:</span>
            {EXAMPLE_QUERIES.slice(0, 5).map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSearch(ex)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8', fontSize: '0.7rem', padding: '3px 8px', borderRadius: 12,
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Parsed Filters Display */}
          {searchResponse?.parsed_filters && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.4)', borderRadius: 10, padding: '10px 14px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiZap size={12} /> AI Parser Çözümlemesi:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {searchResponse.parsed_filters.vehicle_group && (
                  <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                    Grup: {searchResponse.parsed_filters.vehicle_group}
                  </span>
                )}
                {searchResponse.parsed_filters.model_code && (
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    Model: {searchResponse.parsed_filters.model_code}
                  </span>
                )}
                {searchResponse.parsed_filters.wheelbase && (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    Dingil: {searchResponse.parsed_filters.wheelbase} mm
                  </span>
                )}
                {searchResponse.parsed_filters.wbs && (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    WBS: {searchResponse.parsed_filters.wbs}
                  </span>
                )}
                {searchResponse.parsed_filters.body_volume && (
                  <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
                    Hacim: {searchResponse.parsed_filters.body_volume} m³
                  </span>
                )}
                {searchResponse.parsed_filters.engine_power && (
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                    Motor: {searchResponse.parsed_filters.engine_power} BG
                  </span>
                )}
                {searchResponse.parsed_filters.usage_type && (
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    Kullanım: {searchResponse.parsed_filters.usage_type}
                  </span>
                )}
                {searchResponse.parsed_filters.wheel_count && (
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0' }}>
                    Teker: {searchResponse.parsed_filters.wheel_count}
                  </span>
                )}
                {searchResponse.parsed_filters.equipment_level && (
                  <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
                    Donanım: {searchResponse.parsed_filters.equipment_level}
                  </span>
                )}
                {searchResponse.parsed_filters.city && (
                  <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
                    Şehir: {searchResponse.parsed_filters.city}
                  </span>
                )}
                {searchResponse.parsed_filters.days_since_contact && (
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                    Görüşülmeyen: &gt;={searchResponse.parsed_filters.days_since_contact} Gün
                  </span>
                )}
                {searchResponse.parsed_filters.has_stock_match && (
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                    ✓ Stokla Eşleşenler
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Results Summary */}
          {searchResponse && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Toplam <strong>{searchResponse.total_found}</strong> eşleşen müşteri bulundu
              </span>
            </div>
          )}

          {/* Results List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <div className="loading-pulse" style={{ margin: '0 auto 12px auto' }} />
              Veritabanı taranıyor ve filtreler uygulanıyor...
            </div>
          ) : searchResponse?.results?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {searchResponse.results.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleCustomerClick(c.id)}
                  style={{
                    background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12, padding: '1rem', cursor: 'pointer',
                    transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: 8
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = ''; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                        {c.company_name}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {c.city || 'Şehir Yok'} • Tel: {c.phone || '-'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {c.stock_matched && (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid #10b981' }}>
                          📦 Stokta Var
                        </span>
                      )}
                      {c.has_campaign && (
                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444' }}>
                          🔥 Kampanya
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                    padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: '0.78rem'
                  }}>
                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                      🚚 {c.interest_summary || 'Araç İlgisi'}
                    </span>
                    {c.interest_level && (
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                        İlgi: {c.interest_level}
                      </span>
                    )}
                    {c.last_contact_date && (
                      <span style={{ color: '#64748b' }}>
                        Son Temas: {new Date(c.last_contact_date).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchResponse && searchResponse.total_found === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <FiAlertCircle size={32} style={{ color: '#f59e0b', marginBottom: 8 }} />
              <p>Aradığınız kriterlere uyan kayıtlı müşteri bulunamadı.</p>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Farklı bir tonaj, model kodu veya arama terimi deneyebilirsiniz.</span>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <FiSearch size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Doğal dilde arama yapmak için yukarıdaki arama kutusuna yazın veya örneklerden birini seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
