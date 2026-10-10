import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import toast from 'react-hot-toast';
import { openWhatsApp as triggerWhatsApp } from '../../utils/whatsapp';
import PipelineOpportunityModal from '../../components/CRM/PipelineOpportunityModal';
import { 
  FiPhone, FiMapPin, FiArrowRight, FiMessageSquare, 
  FiChevronDown, FiChevronUp, FiSearch, FiRefreshCw, FiTruck, FiPlus 
} from 'react-icons/fi';

const TARGET_PROVINCES = [
  'Samsun', 'Ordu', 'Sivas', 'Giresun', 'Çorum', 'Amasya', 'Sinop', 'Tokat', 'Kastamonu'
];

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
  const [cityFilter, setCityFilter] = useState('target_9');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [modalStage, setModalStage] = useState('lead');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      // Yalnızca aktif pipeline aşamasındaki müşterileri getir (havuzdaki ham firmaları dahil etme)
      const r = await crmApi.getCustomers({ 
        page: 1, 
        page_size: 500, 
        city: cityFilter !== 'all' ? cityFilter : undefined,
        search: searchQuery || undefined,
        pipeline_stage: 'active',
        sort_by: 'potential_score', 
        sort_order: 'desc' 
      });
      setCustomers(r.data.items || []);
    } catch (err) { 
      console.error('Pipeline error:', err);
      toast.error('Pipeline verileri yüklenemedi'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, [cityFilter]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    load();
  };

  const moveStage = async (customerId, newStage) => {
    try {
      await crmApi.updateCustomer(customerId, { pipeline_stage: newStage });
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, pipeline_stage: newStage } : c));
      toast.success(`Aşama: ${STAGES.find(s => s.key === newStage)?.label}`);
    } catch { 
      toast.error('Güncelleme hatası'); 
    }
  };

  const getStageCustomers = (stageKey) => {
    return customers.filter(c => (c.pipeline_stage || 'lead') === stageKey);
  };

  const toggleCol = (key) => {
    setCollapsedCols(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleWhatsApp = (customer) => {
    if (!customer?.phone) return toast.error('Telefon numarası bulunamadı');
    triggerWhatsApp(customer.phone, `Merhaba Sayın Yetkili (${customer.company_name || ''}), IVECO araç teklifimiz hakkında görüşebilir miyiz?`, {
      customer: customer,
      defaultStatus: 'offer_given'
    });
  };

  return (
    <div className="animate-in">
      {/* Header & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📊</span> Satış Pipeline
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Yetki alanı fırsatları, teklif verilen firmalar ve satış süreçleri (Toplam: {customers.length} Firma)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {STAGES.map(s => (
            <span key={s.key} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              <strong style={{ color: s.color }}>{getStageCustomers(s.key).length}</strong> {s.label}
            </span>
          ))}
          <button 
            type="button" 
            onClick={load} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: '0.75rem' }}
            title="Yenile"
          >
            <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Yenile
          </button>
          <button 
            type="button" 
            onClick={() => { setModalStage('lead'); setShowOpportunityModal(true); }}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <FiPlus size={14} /> Yeni Fırsat / Ziyaret Ekle
          </button>
        </div>
      </div>

      {/* ── İL SEÇİMİ VE ARAMA ÇUBUĞU ── */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-color)',
        padding: '10px 14px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {/* İl Filtre Hapları */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-blue-light)', display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 4 }}>
            <FiMapPin size={14} /> Yetki Alanı:
          </span>
          <button
            type="button"
            className={`btn btn-xs ${cityFilter === 'target_9' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCityFilter('target_9')}
            style={{ borderRadius: 14, fontWeight: cityFilter === 'target_9' ? 700 : 500, fontSize: '0.75rem' }}
          >
            🎯 Hedef 9 İl (Tümü)
          </button>
          {TARGET_PROVINCES.map(p => (
            <button
              key={p}
              type="button"
              className={`btn btn-xs ${cityFilter === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCityFilter(p)}
              style={{ borderRadius: 14, fontWeight: cityFilter === p ? 700 : 500, fontSize: '0.75rem' }}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className={`btn btn-xs ${cityFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCityFilter('all')}
            style={{ borderRadius: 14, fontWeight: cityFilter === 'all' ? 700 : 500, fontSize: '0.75rem' }}
          >
            🌐 Tüm İller
          </button>
        </div>

        {/* Canlı Arama */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Firma veya telefon ara..."
              style={{ padding: '4px 10px 4px 28px', fontSize: '0.78rem', width: 190 }}
            />
            <FiSearch size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            Ara
          </button>
        </form>
      </div>

      {loading && customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div className="loading-pulse" style={{ margin: '0 auto 12px auto' }}></div>
          Pipeline fırsatları taranıyor...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, overflowX: 'auto', minHeight: 'calc(100vh - 230px)' }}>
          {STAGES.map(stage => {
            const items = getStageCustomers(stage.key);
            const collapsed = collapsedCols[stage.key];
            return (
              <div key={stage.key} style={{
                background: 'var(--bg-secondary)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column',
                border: `2px solid ${stage.color}22`, minWidth: 200
              }}>
                {/* Column header */}
                <div onClick={() => toggleCol(stage.key)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
                  padding: '7px 10px', borderRadius: 8, background: `${stage.color}15`, cursor: 'pointer'
                }}>
                  <span style={{ fontWeight: 700, color: stage.color, fontSize: '0.85rem' }}>
                    {stage.emoji} {stage.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalStage(stage.key);
                        setShowOpportunityModal(true);
                      }}
                      className="btn btn-ghost btn-xs"
                      title={`${stage.label} aşamasına yeni fırsat/ziyaret ekle`}
                      style={{ padding: '2px 5px', color: stage.color, borderRadius: 4, display: 'flex', alignItems: 'center' }}
                    >
                      <FiPlus size={13} />
                    </button>
                    <span style={{
                      background: stage.color, color: '#fff', borderRadius: 12, padding: '2px 8px',
                      fontSize: '0.72rem', fontWeight: 700
                    }}>{items.length}</span>
                  </div>
                </div>

                {/* Cards */}
                {!collapsed && (
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 290px)' }}>
                    {items.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem', fontSize: '0.78rem' }}>
                        Bu aşamada firma yok
                      </div>
                    )}
                    {items.map(c => (
                      <div key={c.id} style={{
                        background: 'var(--bg-primary)', borderRadius: 10, padding: 10, cursor: 'pointer',
                        border: '1px solid var(--border-color)', transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
                      >
                        <div onClick={() => navigate(`/customers/${c.id}`)} style={{ marginBottom: 6 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {c.company_name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                            {c.city ? `${c.city}${c.district ? ' / ' + c.district : ''}` : 'Şehir Belirtilmemiş'} • {c.sector || 'Ticari'}
                          </div>
                          {c.pipeline_note && (
                            <div style={{ fontSize: '0.68rem', color: '#fbbf24', marginTop: 4, background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: 4, fontStyle: 'italic' }}>
                              📝 {c.pipeline_note}
                            </div>
                          )}
                          {c.phone && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FiPhone size={10} /> {c.phone}
                            </div>
                          )}
                        </div>

                        {/* Score badge & Segment */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
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
                            {c.segment} Segment
                          </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {c.phone && (
                            <button 
                              type="button"
                              onClick={e => { e.stopPropagation(); handleWhatsApp(c); }}
                              style={{ fontSize: '0.65rem', padding: '3px 6px', borderRadius: 6, border: '1px solid #25D36640', background: '#25D36615', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
                              title="WhatsApp Mesajı & Teklif"
                            >
                              <FiMessageSquare size={10} /> WA Teklif
                            </button>
                          )}
                          {stage.key !== 'won' && stage.key !== 'lost' && (
                            <>
                              {STAGES.findIndex(s => s.key === stage.key) < 4 && (
                                <button 
                                  type="button"
                                  onClick={e => { e.stopPropagation(); moveStage(c.id, STAGES[STAGES.findIndex(s => s.key === stage.key) + 1].key); }}
                                  style={{ fontSize: '0.65rem', padding: '3px 6px', borderRadius: 6, border: `1px solid ${stage.color}30`, background: `${stage.color}10`, color: stage.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                                >
                                  <FiArrowRight size={10} /> İlerle
                                </button>
                              )}
                              <button 
                                type="button"
                                onClick={e => { e.stopPropagation(); if (confirm(`"${c.company_name}" Kaybedildi olarak işaretlensin mi?`)) moveStage(c.id, 'lost'); }}
                                style={{ fontSize: '0.65rem', padding: '3px 6px', borderRadius: 6, border: '1px solid #ef444430', background: '#ef444410', color: '#ef4444', cursor: 'pointer' }}
                                title="Kaybedildi olarak işaretle"
                              >
                                ✕
                              </button>
                            </>
                          )}
                          {(stage.key === 'won' || stage.key === 'lost') && (
                            <button 
                              type="button"
                              onClick={e => { e.stopPropagation(); moveStage(c.id, 'lead'); }}
                              style={{ fontSize: '0.65rem', padding: '3px 6px', borderRadius: 6, border: '1px solid #6366f130', background: '#6366f110', color: '#6366f1', cursor: 'pointer' }}
                            >
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
      )}

      {/* ── FIRSAT & ZİYARET KAYIT MODALI ── */}
      <PipelineOpportunityModal
        isOpen={showOpportunityModal}
        onClose={() => setShowOpportunityModal(false)}
        initialStage={modalStage}
        onSuccess={() => load()}
      />
    </div>
  );
}
