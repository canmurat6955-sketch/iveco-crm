import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import toast from 'react-hot-toast';
import { openWhatsApp as triggerWhatsApp } from '../../utils/whatsapp';
import PipelineOpportunityModal from '../../components/CRM/PipelineOpportunityModal';
import { 
  FiPhone, FiMapPin, FiArrowRight, FiMessageSquare, 
  FiChevronDown, FiChevronUp, FiSearch, FiRefreshCw, FiTruck, FiPlus,
  FiCamera, FiTarget, FiPhoneCall, FiFileText, FiTrendingUp, FiCheckCircle, 
  FiArchive, FiLayers, FiBriefcase, FiRotateCcw
} from 'react-icons/fi';

const TARGET_PROVINCES = [
  'Samsun', 'Ordu', 'Sivas', 'Giresun', 'Çorum', 'Amasya', 'Sinop', 'Tokat', 'Kastamonu'
];

const STAGES = [
  { 
    key: 'lead', 
    label: 'Potansiyel (Lead)', 
    shortLabel: 'Lead', 
    color: '#38bdf8', 
    accentBg: 'rgba(56, 189, 248, 0.08)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    icon: FiTarget 
  },
  { 
    key: 'contact', 
    label: 'İlk Temas & Ziyaret', 
    shortLabel: 'İlk Temas', 
    color: '#004B93', 
    accentBg: 'rgba(0, 75, 147, 0.12)',
    borderColor: 'rgba(43, 125, 233, 0.35)',
    icon: FiPhoneCall 
  },
  { 
    key: 'proposal', 
    label: 'Teklif & Proforma', 
    shortLabel: 'Teklif', 
    color: '#d97706', 
    accentBg: 'rgba(217, 119, 6, 0.10)',
    borderColor: 'rgba(217, 119, 6, 0.35)',
    icon: FiFileText 
  },
  { 
    key: 'negotiation', 
    label: 'Ticari Pazarlık', 
    shortLabel: 'Pazarlık', 
    color: '#ea580c', 
    accentBg: 'rgba(234, 88, 12, 0.10)',
    borderColor: 'rgba(234, 88, 12, 0.35)',
    icon: FiTrendingUp 
  },
  { 
    key: 'won', 
    label: 'Teslimat & Satış', 
    shortLabel: 'Kazanıldı', 
    color: '#059669', 
    accentBg: 'rgba(5, 150, 105, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    icon: FiCheckCircle 
  },
  { 
    key: 'lost', 
    label: 'Arşiv / İptal', 
    shortLabel: 'Kaybedildi', 
    color: '#64748b', 
    accentBg: 'rgba(100, 116, 139, 0.08)',
    borderColor: 'rgba(100, 116, 139, 0.25)',
    icon: FiArchive 
  },
];

// Metinleri profesyonel kurumsal başlık formatına dönüştürücü
function formatCompanyName(name) {
  if (!name) return 'İsimsiz Firma';
  const trimmed = name.trim();
  // Eğer tamamı büyük harfse kurumsal title case yap
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 4) {
    return trimmed
      .split(' ')
      .map(word => {
        if (word.length <= 2) return word; // LTD, AŞ, ŞTİ vb.
        if (['LTD.', 'ŞTİ.', 'A.Ş.', 'A.S.', 'LTD', 'STI', 'SAN.', 'TİC.', 'TIC.'].includes(word)) return word;
        return word.charAt(0) + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
  return trimmed;
}

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
      const targetLabel = STAGES.find(s => s.key === newStage)?.label || newStage;
      toast.success(`Aşama güncellendi: ${targetLabel}`);
    } catch { 
      toast.error('Aşama güncelleme hatası'); 
    }
  };

  const getStageCustomers = (stageKey) => {
    return customers.filter(c => (c.pipeline_stage || 'lead') === stageKey);
  };

  const toggleCol = (key) => {
    setCollapsedCols(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleWhatsApp = (customer) => {
    if (!customer?.phone) return toast.error('Telefon numarası kayıtlı değil');
    triggerWhatsApp(customer.phone, `Sayın Yetkili (${customer.company_name || ''}), IVECO ERC Samsun Otomotiv adına güncel ticari araç kampanyalarımız ve proforma teklifimiz hakkında görüşmek isteriz.`, {
      customer: customer,
      defaultStatus: 'offer_given'
    });
  };

  // Pipeline İstatistikleri
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.pipeline_stage !== 'won' && c.pipeline_stage !== 'lost').length;
    const inProposal = customers.filter(c => c.pipeline_stage === 'proposal' || c.pipeline_stage === 'negotiation').length;
    const wonCount = customers.filter(c => c.pipeline_stage === 'won').length;
    return { total, active, inProposal, wonCount };
  }, [customers]);

  return (
    <div className="animate-in" style={{ paddingBottom: '2rem' }}>
      
      {/* ── KURUMSAL ÜST BAŞLIK VE HIZLI AKSİYONLAR ── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 16, 
        flexWrap: 'wrap', 
        gap: 16,
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        paddingBottom: 16
      }}>
        <div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            padding: '3px 10px', 
            background: 'rgba(0, 75, 147, 0.15)', 
            border: '1px solid rgba(0, 75, 147, 0.4)', 
            borderRadius: 6,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: '#38bdf8',
            marginBottom: 6
          }}>
            <FiBriefcase size={12} /> IVECO ERC SAMSUN • SATIŞ OPERASYON MASASI
          </div>
          <h1 style={{ 
            margin: 0, 
            color: '#f8fafc', 
            fontSize: '1.5rem', 
            fontWeight: 800, 
            letterSpacing: '-0.02em',
            display: 'flex', 
            alignItems: 'center', 
            gap: 10 
          }}>
            Ticari Araç Satış Hattı (Pipeline)
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
            Yetki alanı fırsatları, teklif verilen filolar ve teslimat süreçleri takibi
          </p>
        </div>

        {/* Aksiyon Butonları */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={load} 
            className="btn btn-secondary btn-sm"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              padding: '7px 12px', 
              fontSize: '0.78rem',
              fontWeight: 600,
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#cbd5e1'
            }}
            title="Verileri Yenile"
          >
            <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Yenile
          </button>

          <button 
            type="button" 
            onClick={() => navigate('/scan-card')} 
            className="btn btn-secondary btn-sm"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              padding: '7px 14px', 
              fontSize: '0.8rem', 
              fontWeight: 600,
              border: '1px solid #475569',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              color: '#e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            <FiCamera size={14} style={{ color: '#38bdf8' }} /> Kartvizit Tara & Fırsat Aç
          </button>

          <button 
            type="button" 
            onClick={() => { setModalStage('lead'); setShowOpportunityModal(true); }}
            className="btn btn-primary btn-sm"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              padding: '7px 16px', 
              fontSize: '0.82rem', 
              fontWeight: 700,
              background: '#004B93',
              borderColor: '#0284c7',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 75, 147, 0.4)'
            }}
          >
            <FiPlus size={15} /> Yeni Fırsat / Ziyaret Ekle
          </button>
        </div>
      </div>

      {/* ── KURUMSAL SATIŞ HUNİSİ (EXECUTIVE PIPELINE METRİK ŞERİDİ) ── */}
      <div style={{
        background: '#0f172a',
        borderRadius: 10,
        border: '1px solid #1e293b',
        padding: '12px 16px',
        marginBottom: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
      }}>
        {STAGES.map((s, idx) => {
          const count = getStageCustomers(s.key).length;
          const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          const IconComp = s.icon;
          return (
            <div 
              key={s.key} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 10px',
                borderLeft: idx > 0 ? '1px solid #1e293b' : 'none'
              }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: s.accentBg,
                border: `1px solid ${s.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.color,
                flexShrink: 0
              }}>
                <IconComp size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>{s.shortLabel}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>%{percentage}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 1 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{count}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Firma</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── YETKİ ALANI & ARAMA KONSOLU ── */}
      <div style={{
        background: '#131b2e',
        borderRadius: 10,
        border: '1px solid #1e293b',
        padding: '10px 14px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Yetki Alanı Şehir Seçicisi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ 
            fontSize: '0.76rem', 
            fontWeight: 700, 
            color: '#38bdf8', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 5, 
            marginRight: 4 
          }}>
            <FiMapPin size={13} /> Yetki Alanı:
          </span>
          <button
            type="button"
            onClick={() => setCityFilter('target_9')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: cityFilter === 'target_9' ? '1px solid #0284c7' : '1px solid #334155',
              background: cityFilter === 'target_9' ? '#004B93' : '#1e293b',
              color: cityFilter === 'target_9' ? '#ffffff' : '#94a3b8'
            }}
          >
            Hedef 9 İl (Bölge)
          </button>
          {TARGET_PROVINCES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setCityFilter(p)}
              style={{
                padding: '4px 9px',
                borderRadius: 6,
                fontSize: '0.74rem',
                fontWeight: cityFilter === p ? 700 : 500,
                cursor: 'pointer',
                border: cityFilter === p ? '1px solid #0284c7' : '1px solid #1e293b',
                background: cityFilter === p ? '#004B93' : '#0f172a',
                color: cityFilter === p ? '#ffffff' : '#94a3b8'
              }}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCityFilter('all')}
            style={{
              padding: '4px 9px',
              borderRadius: 6,
              fontSize: '0.74rem',
              fontWeight: cityFilter === 'all' ? 700 : 500,
              cursor: 'pointer',
              border: cityFilter === 'all' ? '1px solid #0284c7' : '1px solid #1e293b',
              background: cityFilter === 'all' ? '#004B93' : '#0f172a',
              color: cityFilter === 'all' ? '#ffffff' : '#64748b'
            }}
          >
            Tüm İller
          </button>
        </div>

        {/* Hızlı Arama */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Firma veya telefon ara..."
              style={{ 
                padding: '5px 10px 5px 30px', 
                fontSize: '0.76rem', 
                width: 220,
                background: '#0a0f1d',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#f8fafc'
              }}
            />
            <FiSearch size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          </div>
          <button 
            type="submit" 
            style={{ 
              padding: '5px 12px', 
              fontSize: '0.76rem', 
              fontWeight: 600,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            Filtrele
          </button>
        </form>
      </div>

      {/* ── KANBAN PANOSU ── */}
      {loading && customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
          <div className="loading-pulse" style={{ margin: '0 auto 14px auto', width: 32, height: 32 }}></div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>Pipeline Verileri Taranıyor...</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>Yetki alanı fırsatları ve teklif kayıtları derleniyor.</div>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: 14, 
          overflowX: 'auto', 
          minHeight: 'calc(100vh - 270px)',
          alignItems: 'start'
        }}>
          {STAGES.map(stage => {
            const items = getStageCustomers(stage.key);
            const collapsed = collapsedCols[stage.key];
            const StageIcon = stage.icon;

            return (
              <div 
                key={stage.key} 
                style={{
                  background: '#0b1120',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #1e293b',
                  minWidth: 220,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}
              >
                {/* Kolon Üst Vurgu Çizgisi */}
                <div style={{ height: 3, background: stage.color, borderTopLeftRadius: 10, borderTopRightRadius: 10 }} />

                {/* Kolon Başlığı */}
                <div 
                  onClick={() => toggleCol(stage.key)} 
                  style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 12px',
                    borderBottom: '1px solid #1e293b',
                    background: '#0f172a',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <StageIcon size={14} style={{ color: stage.color, flexShrink: 0 }} />
                    <span style={{ 
                      fontWeight: 700, 
                      color: '#f8fafc', 
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {stage.shortLabel}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalStage(stage.key);
                        setShowOpportunityModal(true);
                      }}
                      title={`${stage.label} aşamasına yeni dosya ekle`}
                      style={{ 
                        padding: '3px 6px', 
                        color: stage.color, 
                        borderRadius: 4, 
                        display: 'flex', 
                        alignItems: 'center',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <FiPlus size={14} />
                    </button>
                    <span style={{
                      background: stage.color, 
                      color: '#ffffff', 
                      borderRadius: 10, 
                      padding: '1px 7px',
                      fontSize: '0.72rem', 
                      fontWeight: 800,
                      minWidth: 20,
                      textAlign: 'center'
                    }}>
                      {items.length}
                    </span>
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                      {collapsed ? <FiChevronDown size={14} /> : <FiChevronUp size={14} />}
                    </span>
                  </div>
                </div>

                {/* Kart Listesi */}
                {!collapsed && (
                  <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 10, 
                    padding: 10,
                    maxHeight: 'calc(100vh - 330px)' 
                  }}>
                    {/* Kolon Boş Durumu (Dashed Blueprint Görünümü) */}
                    {items.length === 0 && (
                      <div style={{ 
                        textAlign: 'center', 
                        color: '#64748b', 
                        padding: '2.5rem 1rem', 
                        fontSize: '0.76rem',
                        border: '1px dashed #1e293b',
                        borderRadius: 8,
                        background: 'rgba(15, 23, 42, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <FiLayers size={22} style={{ color: '#334155' }} />
                        <span>Bu aşamada aktif kayıt bulunmuyor</span>
                        <button
                          type="button"
                          onClick={() => { setModalStage(stage.key); setShowOpportunityModal(true); }}
                          style={{
                            marginTop: 4,
                            padding: '3px 8px',
                            fontSize: '0.7rem',
                            color: stage.color,
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${stage.borderColor}`,
                            borderRadius: 4,
                            cursor: 'pointer'
                          }}
                        >
                          + Fırsat Oluştur
                        </button>
                      </div>
                    )}

                    {/* Fırsat Kartları */}
                    {items.map(c => {
                      const formattedTitle = formatCompanyName(c.company_name);
                      return (
                        <div 
                          key={c.id} 
                          style={{
                            background: '#131b2e', 
                            borderRadius: 8, 
                            padding: '11px 12px', 
                            cursor: 'pointer',
                            border: '1px solid #1e293b', 
                            transition: 'all 0.18s ease-in-out',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                            position: 'relative'
                          }}
                          onMouseEnter={e => { 
                            e.currentTarget.style.borderColor = '#38bdf8'; 
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                          }}
                          onMouseLeave={e => { 
                            e.currentTarget.style.borderColor = '#1e293b'; 
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
                          }}
                        >
                          {/* Firma Bilgisi */}
                          <div onClick={() => navigate(`/customers/${c.id}`)}>
                            <div style={{ 
                              fontWeight: 700, 
                              fontSize: '0.85rem', 
                              color: '#f8fafc', 
                              lineHeight: 1.35,
                              marginBottom: 4,
                              wordBreak: 'break-word'
                            }}>
                              {formattedTitle}
                            </div>

                            {/* İlçe/İl & Sektör */}
                            <div style={{ 
                              fontSize: '0.72rem', 
                              color: '#94a3b8', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 4, 
                              marginBottom: 6,
                              flexWrap: 'wrap'
                            }}>
                              <FiMapPin size={11} style={{ color: '#38bdf8', flexShrink: 0 }} />
                              <span>{c.city ? `${c.city}${c.district ? ' / ' + c.district : ''}` : 'Bölge Belirtilmemiş'}</span>
                              <span style={{ color: '#475569' }}>•</span>
                              <span style={{ color: '#cbd5e1' }}>{c.sector || 'Ticari Taşımacılık'}</span>
                            </div>

                            {/* Son Görüşme Notu (Endüstriyel Slate Bloğu) */}
                            {c.pipeline_note && (
                              <div style={{ 
                                fontSize: '0.72rem', 
                                color: '#e2e8f0', 
                                marginBottom: 8, 
                                background: '#0a0f1d', 
                                padding: '5px 8px', 
                                borderRadius: '0 5px 5px 0',
                                borderLeft: '3px solid #f59e0b',
                                lineHeight: 1.4
                              }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.64rem', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Görüşme Notu
                                </span>
                                {c.pipeline_note}
                              </div>
                            )}

                            {/* İletişim Telefonu */}
                            {c.phone && (
                              <div style={{ 
                                fontSize: '0.72rem', 
                                color: '#94a3b8', 
                                marginBottom: 8, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 5 
                              }}>
                                <FiPhone size={11} style={{ color: '#64748b' }} /> 
                                <span style={{ fontFamily: 'monospace', letterSpacing: '0.02em', color: '#cbd5e1' }}>{c.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* İlgilenilen Araç / Segment ve Skor Rozeti */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: 10,
                            paddingTop: 6,
                            borderTop: '1px solid rgba(148, 163, 184, 0.08)'
                          }}>
                            {/* Araç Segment Rozeti */}
                            <span style={{
                              fontSize: '0.68rem', 
                              padding: '2px 7px', 
                              borderRadius: 4, 
                              fontWeight: 600,
                              background: '#0f172a',
                              color: '#93c5fd',
                              border: '1px solid #1e293b',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <FiTruck size={10} /> {c.segment || 'IVECO Daily'}
                            </span>

                            {/* Öncelik / Skor Rozeti */}
                            <span style={{
                              fontSize: '0.68rem', 
                              padding: '2px 7px', 
                              borderRadius: 4, 
                              fontWeight: 700,
                              background: c.potential_score >= 70 ? 'rgba(5, 150, 105, 0.15)' : c.potential_score >= 50 ? 'rgba(217, 119, 6, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                              color: c.potential_score >= 70 ? '#34d399' : c.potential_score >= 50 ? '#fbbf24' : '#94a3b8',
                              border: `1px solid ${c.potential_score >= 70 ? 'rgba(5, 150, 105, 0.3)' : c.potential_score >= 50 ? 'rgba(217, 119, 6, 0.3)' : 'rgba(100, 116, 139, 0.2)'}`
                            }}>
                              Skor: {c.potential_score || 0}
                            </span>
                          </div>

                          {/* ── KURUMSAL HIZLI AKSİYON ÇUBUĞU ── */}
                          <div style={{ 
                            display: 'flex', 
                            gap: 5, 
                            alignItems: 'center',
                            flexWrap: 'wrap' 
                          }}>
                            {/* WhatsApp Görüşmesi */}
                            {c.phone && (
                              <button 
                                type="button"
                                onClick={e => { e.stopPropagation(); handleWhatsApp(c); }}
                                style={{ 
                                  fontSize: '0.7rem', 
                                  padding: '4px 8px', 
                                  borderRadius: 5, 
                                  border: '1px solid rgba(16, 185, 129, 0.35)', 
                                  background: 'rgba(5, 150, 105, 0.12)', 
                                  color: '#10b981', 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 4, 
                                  fontWeight: 600 
                                }}
                                title="Müşteriyle WhatsApp Görüşmesi Başlat"
                              >
                                <FiMessageSquare size={11} /> WhatsApp
                              </button>
                            )}

                            {/* Aşama İlerletme (Lead -> Won) */}
                            {stage.key !== 'won' && stage.key !== 'lost' && (
                              <>
                                {STAGES.findIndex(s => s.key === stage.key) < 4 && (
                                  <button 
                                    type="button"
                                    onClick={e => { 
                                      e.stopPropagation(); 
                                      moveStage(c.id, STAGES[STAGES.findIndex(s => s.key === stage.key) + 1].key); 
                                    }}
                                    style={{ 
                                      fontSize: '0.7rem', 
                                      padding: '4px 9px', 
                                      borderRadius: 5, 
                                      border: `1px solid ${stage.borderColor}`, 
                                      background: stage.accentBg, 
                                      color: stage.color, 
                                      cursor: 'pointer', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 4,
                                      fontWeight: 600
                                    }}
                                    title="Sonraki Satış Aşamasına İlerle"
                                  >
                                    İlerle <FiArrowRight size={11} />
                                  </button>
                                )}

                                {/* Arşiv / Kaybedildi Butonu */}
                                <button 
                                  type="button"
                                  onClick={e => { 
                                    e.stopPropagation(); 
                                    if (confirm(`"${formattedTitle}" dosyası Kaybedildi/Arşiv olarak işaretlensin mi?`)) {
                                      moveStage(c.id, 'lost');
                                    }
                                  }}
                                  style={{ 
                                    fontSize: '0.7rem', 
                                    padding: '4px 7px', 
                                    borderRadius: 5, 
                                    border: '1px solid rgba(100, 116, 139, 0.3)', 
                                    background: 'rgba(100, 116, 139, 0.1)', 
                                    color: '#94a3b8', 
                                    cursor: 'pointer' 
                                  }}
                                  title="Fırsatı Arşivle / Kaybedildi"
                                >
                                  <FiArchive size={11} />
                                </button>
                              </>
                            )}

                            {/* Kazanıldı veya Kaybedildi durumunda Fırsatı Yeniden Aç */}
                            {(stage.key === 'won' || stage.key === 'lost') && (
                              <button 
                                type="button"
                                onClick={e => { e.stopPropagation(); moveStage(c.id, 'lead'); }}
                                style={{ 
                                  fontSize: '0.7rem', 
                                  padding: '4px 8px', 
                                  borderRadius: 5, 
                                  border: '1px solid rgba(56, 189, 248, 0.3)', 
                                  background: 'rgba(56, 189, 248, 0.1)', 
                                  color: '#38bdf8', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontWeight: 600
                                }}
                              >
                                <FiRotateCcw size={11} /> Yeniden Aç
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
