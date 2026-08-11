import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import toast from 'react-hot-toast';
import { FiPhone, FiMapPin, FiArrowRight, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const STAGES = [
  { key: 'lead', label: 'Lead', color: '#6366f1', emoji: '🎯' },
  { key: 'contact', label: 'İlk Görüşme', color: '#3b82f6', emoji: '📞' },
  { key: 'proposal', label: 'Teklif', color: '#f59e0b', emoji: '📋' },
  { key: 'negotiation', label: 'Pazarlık', color: '#f97316', emoji: '🤝' },
  { key: 'won', label: 'Kazanıldı', color: '#10b981', emoji: '✅' },
  { key: 'lost', label: 'Kaybedildi', color: '#ef4444', emoji: '❌' },
];

export default function Pipeline() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedCols, setCollapsedCols] = useState({});
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      // Get pipeline customers (B and A segments primarily, or any with non-lead stage)
      const r = await crmApi.getCustomers({ page: 1, page_size: 500, sort_by: 'potential_score', sort_order: 'desc' });
      setCustomers(r.data.items || []);
    } catch { toast.error('Yüklenemedi'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const moveStage = async (customerId, newStage) => {
    try {
      await crmApi.updateCustomer(customerId, { pipeline_stage: newStage });
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, pipeline_stage: newStage } : c));
      toast.success(`Aşama: ${STAGES.find(s => s.key === newStage)?.label}`);
    } catch { toast.error('Güncelleme hatası'); }
  };

  const getStageCustomers = (stageKey) => {
    return customers.filter(c => (c.pipeline_stage || 'lead') === stageKey);
  };

  const toggleCol = (key) => {
    setCollapsedCols(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openWhatsApp = (phone, name) => {
    if (!phone) return toast.error('Telefon yok');
    const num = phone.replace(/\D/g, '');
    const full = num.startsWith('0') ? '90' + num.slice(1) : num.startsWith('90') ? num : '90' + num;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(`Merhaba, ${name} hakkında bilgi almak istiyorum.`)}`, '_blank');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Yükleniyor...</div>;

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>📊 Satış Pipeline</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          {STAGES.map(s => (
            <span key={s.key} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              {getStageCustomers(s.key).length}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, overflowX: 'auto', minHeight: 'calc(100vh - 180px)' }}>
        {STAGES.map(stage => {
          const items = getStageCustomers(stage.key);
          const collapsed = collapsedCols[stage.key];
          return (
            <div key={stage.key} style={{
              background: 'var(--bg-secondary)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column',
              border: `2px solid ${stage.color}22`, minWidth: 200
            }}>
              {/* Column header */}
              <div onClick={() => toggleCol(stage.key)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
                padding: '8px 12px', borderRadius: 8, background: `${stage.color}15`, cursor: 'pointer'
              }}>
                <span style={{ fontWeight: 700, color: stage.color, fontSize: '0.85rem' }}>
                  {stage.emoji} {stage.label}
                </span>
                <span style={{
                  background: stage.color, color: '#fff', borderRadius: 12, padding: '2px 8px',
                  fontSize: '0.75rem', fontWeight: 700
                }}>{items.length}</span>
              </div>

              {/* Cards */}
              {!collapsed && (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 280px)' }}>
                  {items.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24, fontSize: '0.8rem' }}>
                      Boş
                    </div>
                  )}
                  {items.map(c => (
                    <div key={c.id} style={{
                      background: 'var(--bg-primary)', borderRadius: 10, padding: 12, cursor: 'pointer',
                      border: '1px solid var(--border-color)', transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
                    >
                      <div onClick={() => navigate(`/customers/${c.id}`)} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {c.company_name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          {c.city}{c.district ? ` / ${c.district}` : ''} • {c.sector || 'Diğer'}
                        </div>
                        {c.phone && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiPhone size={10} /> {c.phone}
                          </div>
                        )}
                      </div>

                      {/* Score badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{
                          fontSize: '0.65rem', padding: '2px 6px', borderRadius: 6, fontWeight: 600,
                          background: c.potential_score >= 70 ? '#10b98120' : c.potential_score >= 50 ? '#f59e0b20' : '#6b728020',
                          color: c.potential_score >= 70 ? '#10b981' : c.potential_score >= 50 ? '#f59e0b' : '#6b7280'
                        }}>
                          Skor: {c.potential_score}
                        </span>
                        <span style={{
                          fontSize: '0.65rem', padding: '2px 6px', borderRadius: 6, fontWeight: 600,
                          background: '#6366f120', color: '#6366f1'
                        }}>
                          {c.segment}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {c.phone && (
                          <button onClick={e => { e.stopPropagation(); openWhatsApp(c.phone, c.company_name); }}
                            style={{ fontSize: '0.65rem', padding: '3px 6px', borderRadius: 6, border: '1px solid #25D36620', background: '#25D36610', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FiMessageSquare size={10} /> WA
                          </button>
                        )}
                        {stage.key !== 'won' && stage.key !== 'lost' && (
                          <>
                            {STAGES.findIndex(s => s.key === stage.key) < 4 && (
                              <button onClick={e => { e.stopPropagation(); moveStage(c.id, STAGES[STAGES.findIndex(s => s.key === stage.key) + 1].key); }}
                                style={{ fontSize: '0.65rem', padding: '3px 6px', borderRadius: 6, border: `1px solid ${stage.color}30`, background: `${stage.color}10`, color: stage.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <FiArrowRight size={10} /> İlerle
                              </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); moveStage(c.id, 'lost'); }}
                              style={{ fontSize: '0.65rem', padding: '3px 6px', borderRadius: 6, border: '1px solid #ef444430', background: '#ef444410', color: '#ef4444', cursor: 'pointer' }}>
                              ✕
                            </button>
                          </>
                        )}
                        {(stage.key === 'won' || stage.key === 'lost') && (
                          <button onClick={e => { e.stopPropagation(); moveStage(c.id, 'lead'); }}
                            style={{ fontSize: '0.65rem', padding: '3px 6px', borderRadius: 6, border: '1px solid #6366f130', background: '#6366f110', color: '#6366f1', cursor: 'pointer' }}>
                            ↩ Lead'e
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
