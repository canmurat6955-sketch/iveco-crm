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
    accentBg: 'rgba(56, 189, 248, 0.16)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
    icon: FiTarget 
  },
  { 
    key: 'contact', 
    label: 'İlk Temas & Ziyaret', 
    shortLabel: 'İlk Temas', 
    color: '#60a5fa', 
    accentBg: 'rgba(59, 130, 246, 0.18)',
    borderColor: 'rgba(96, 165, 250, 0.48)',
    icon: FiPhoneCall 
  },
  { 
    key: 'proposal', 
    label: 'Teklif & Proforma', 
    shortLabel: 'Teklif', 
    color: '#fbbf24', 
    accentBg: 'rgba(245, 158, 11, 0.16)',
    borderColor: 'rgba(251, 191, 36, 0.45)',
    icon: FiFileText 
  },
  { 
    key: 'negotiation', 
    label: 'Ticari Pazarlık', 
    shortLabel: 'Pazarlık', 
    color: '#fb923c', 
    accentBg: 'rgba(249, 115, 22, 0.16)',
    borderColor: 'rgba(251, 146, 60, 0.45)',
    icon: FiTrendingUp 
  },
  { 
    key: 'won', 
    label: 'Teslimat & Satış', 
    shortLabel: 'Kazanıldı', 
    color: '#34d399', 
    accentBg: 'rgba(16, 185, 129, 0.16)',
    borderColor: 'rgba(52, 211, 153, 0.45)',
    icon: FiCheckCircle 
  },
  { 
    key: 'lost', 
    label: 'Arşiv / İptal', 
    shortLabel: 'Kaybedildi', 
    color: '#cbd5e1', 
    accentBg: 'rgba(148, 163, 184, 0.16)',
    borderColor: 'rgba(203, 213, 225, 0.38)',
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
          <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#e2e8f0', fontWeight: 500 }}>
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
              fontSize: '0.8rem',
              fontWeight: 700,
              background: '#243b61',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              color: '#f8fafc'
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
              fontSize: '0.82rem', 
              fontWeight: 700,
              border: '1px solid rgba(56, 189, 248, 0.4)',
              background: 'linear-gradient(180deg, #243b61 0%, #1b2d4d 100%)',
              color: '#ffffff',
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
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
              borderColor: '#38bdf8',
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
        background: '#1b2d4d',
        borderRadius: 12,
        border: '1px solid rgba(125, 211, 252, 0.25)',
        padding: '12px 16px',
        marginBottom: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
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
                borderLeft: idx > 0 ? '1px solid rgba(148, 163, 184, 0.22)' : 'none'
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: s.accentBg,
                border: `1px solid ${s.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.color,
                flexShrink: 0
              }}>
                <IconComp size={17} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 700 }}>{s.shortLabel}</span>
                  <span style={{ fontSize: '0.74rem', color: '#7dd3fc', fontWeight: 700 }}>%{percentage}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{count}</span>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Firma</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── YETKİ ALANI & ARAMA KONSOLU ── */}
      <div style={{
        background: '#1b2d4d',
        borderRadius: 12,
        border: '1px solid rgba(125, 211, 252, 0.24)',
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
            fontSize: '0.8rem', 
            fontWeight: 800, 
            color: '#38bdf8', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 5, 
            marginRight: 4 
          }}>
            <FiMapPin size={14} /> Yetki Alanı:
          </span>
          <button
            type="button"
            onClick={() => setCityFilter('target_9')}
            style={{
              padding: '5px 11px',
              borderRadius: 7,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: cityFilter === 'target_9' ? '1.5px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.35)',
              background: cityFilter === 'target_9' ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : '#243b61',
              color: '#ffffff'
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
                padding: '5px 10px',
                borderRadius: 7,
                fontSize: '0.78rem',
                fontWeight: cityFilter === p ? 800 : 600,
                cursor: 'pointer',
                border: cityFilter === p ? '1.5px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.3)',
                background: cityFilter === p ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : '#243b61',
                color: cityFilter === p ? '#ffffff' : '#e2e8f0'
              }}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCityFilter('all')}
            style={{
              padding: '5px 10px',
              borderRadius: 7,
              fontSize: '0.78rem',
              fontWeight: cityFilter === 'all' ? 800 : 600,
              cursor: 'pointer',
              border: cityFilter === 'all' ? '1.5px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.3)',
              background: cityFilter === 'all' ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : '#243b61',
              color: cityFilter === 'all' ? '#ffffff' : '#e2e8f0'
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
                padding: '6px 10px 6px 30px', 
                fontSize: '0.8rem', 
                width: 220,
                background: '#13223b',
                border: '1px solid rgba(148, 163, 184, 0.38)',
                borderRadius: 7,
                color: '#ffffff',
                fontWeight: 500
              }}
            />
            <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7dd3fc' }} />
          </div>
          <button 
            type="submit" 
            style={{ 
              padding: '6px 14px', 
              fontSize: '0.8rem', 
              fontWeight: 700,
              background: '#243b61',
              border: '1px solid rgba(148, 163, 184, 0.38)',
              borderRadius: 7,
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Filtrele
          </button>
        </form>
      </div>

      {/* ── KANBAN PANOSU ── */}
      {loading && customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#e2e8f0' }}>
          <div className="loading-pulse" style={{ margin: '0 auto 14px auto', width: 32, height: 32 }}></div>
          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>Pipeline Verileri Taranıyor...</div>
          <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: 4 }}>Yetki alanı fırsatları ve teklif kayıtları derleniyor.</div>
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
                  background: '#172844',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  minWidth: 225,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.22)'
                }}
              >
                {/* Kolon Üst Vurgu Çizgisi */}
                <div style={{ height: 4, background: stage.color, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />

                {/* Kolon Başlığı */}
                <div 
                  onClick={() => toggleCol(stage.key)} 
                  style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '11px 12px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
                    background: '#1e3356',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <StageIcon size={15} style={{ color: stage.color, flexShrink: 0 }} />
                    <span style={{ 
                      fontWeight: 800, 
                      color: '#ffffff', 
                      fontSize: '0.86rem',
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
                      <FiPlus size={15} />
                    </button>
                    <span style={{
                      background: stage.color, 
                      color: stage.key === 'proposal' || stage.key === 'lost' ? '#0f172a' : '#ffffff', 
                      borderRadius: 10, 
                      padding: '1px 8px',
                      fontSize: '0.75rem', 
                      fontWeight: 800,
                      minWidth: 22,
                      textAlign: 'center'
                    }}>
                      {items.length}
                    </span>
                    <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center' }}>
                      {collapsed ? <FiChevronDown size={15} /> : <FiChevronUp size={15} />}
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
                        color: '#cbd5e1', 
                        padding: '2.5rem 1rem', 
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px dashed rgba(148, 163, 184, 0.35)',
                        borderRadius: 8,
                        background: 'rgba(30, 51, 86, 0.45)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <FiLayers size={24} style={{ color: '#7dd3fc' }} />
                        <span>Bu aşamada aktif kayıt bulunmuyor</span>
                        <button
                          type="button"
                          onClick={() => { setModalStage(stage.key); setShowOpportunityModal(true); }}
                          style={{
                            marginTop: 4,
                            padding: '5px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: stage.color,
                            background: stage.accentBg,
                            border: `1px solid ${stage.borderColor}`,
                            borderRadius: 6,
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
                            background: '#21375c', 
                            borderRadius: 10, 
                            padding: '12px 13px', 
                            cursor: 'pointer',
                            border: '1px solid rgba(148, 163, 184, 0.28)', 
                            transition: 'all 0.18s ease-in-out',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.22)',
                            position: 'relative'
                          }}
                          onMouseEnter={e => { 
                            e.currentTarget.style.borderColor = '#38bdf8'; 
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.35)';
                          }}
                          onMouseLeave={e => { 
                            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.28)'; 
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.22)';
                          }}
                        >
                          {/* Firma Bilgisi */}
                          <div onClick={() => navigate(`/customers/${c.id}`)}>
                            <div style={{ 
                              fontWeight: 800, 
                              fontSize: '0.88rem', 
                              color: '#ffffff', 
                              lineHeight: 1.35,
                              marginBottom: 5,
                              wordBreak: 'break-word'
                            }}>
                              {formattedTitle}
                            </div>

                            {/* İlçe/İl & Sektör */}
                            <div style={{ 
                              fontSize: '0.76rem', 
                              color: '#e2e8f0', 
                              fontWeight: 600,
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 5, 
                              marginBottom: 7,
                              flexWrap: 'wrap'
                            }}>
                              <FiMapPin size={12} style={{ color: '#38bdf8', flexShrink: 0 }} />
                              <span>{c.city ? `${c.city}${c.district ? ' / ' + c.district : ''}` : 'Bölge Belirtilmemiş'}</span>
                              <span style={{ color: '#94a3b8' }}>•</span>
                              <span style={{ color: '#7dd3fc', fontWeight: 700 }}>{c.sector || 'Ticari Taşımacılık'}</span>
                            </div>

                            {/* Son Görüşme Notu (Endüstriyel Slate Bloğu) */}
                            {c.pipeline_note && (
                              <div style={{ 
                                fontSize: '0.76rem', 
                                color: '#ffffff', 
                                fontWeight: 500,
                                marginBottom: 8, 
                                background: 'rgba(15, 26, 46, 0.72)', 
                                padding: '6px 9px', 
                                borderRadius: '0 6px 6px 0',
                                borderLeft: '3px solid #fbbf24',
                                lineHeight: 1.45
                              }}>
                                <span style={{ color: '#fbbf24', fontSize: '0.67rem', display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                                  Görüşme Notu
                                </span>
                                {c.pipeline_note}
                              </div>
                            )}

                            {/* İletişim Telefonu */}
                            {c.phone && (
                              <div style={{ 
                                fontSize: '0.78rem', 
                                color: '#f1f5f9', 
                                marginBottom: 8, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 6 
                              }}>
                                <FiPhone size={12} style={{ color: '#38bdf8' }} /> 
                                <span style={{ fontFamily: 'monospace', letterSpacing: '0.03em', color: '#ffffff', fontWeight: 700 }}>{c.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* İlgilenilen Araç / Segment ve Skor Rozeti */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: 10,
                            paddingTop: 7,
                            borderTop: '1px solid rgba(148, 163, 184, 0.18)'
                          }}>
                            {/* Araç Segment Rozeti */}
                            <span style={{
                              fontSize: '0.72rem', 
                              padding: '3px 8px', 
                              borderRadius: 5, 
                              fontWeight: 700,
                              background: 'rgba(2, 132, 199, 0.22)',
                              color: '#bae6fd',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <FiTruck size={11} /> {c.segment || 'IVECO Daily'}
                            </span>

                            {/* Öncelik / Skor Rozeti */}
                            <span style={{
                              fontSize: '0.72rem', 
                              padding: '3px 8px', 
                              borderRadius: 5, 
                              fontWeight: 800,
                              background: c.potential_score >= 70 ? 'rgba(16, 185, 129, 0.22)' : c.potential_score >= 50 ? 'rgba(245, 158, 11, 0.22)' : 'rgba(148, 163, 184, 0.22)',
                              color: c.potential_score >= 70 ? '#4ade80' : c.potential_score >= 50 ? '#fde047' : '#e2e8f0',
                              border: `1px solid ${c.potential_score >= 70 ? 'rgba(52, 211, 153, 0.45)' : c.potential_score >= 50 ? 'rgba(251, 191, 36, 0.45)' : 'rgba(203, 213, 225, 0.35)'}`
                            }}>
                              Skor: {c.potential_score || 0}
                            </span>
                          </div>

                          {/* ── KURUMSAL HIZLI AKSİYON ÇUBUĞU ── */}
                          <div style={{ 
                            display: 'flex', 
                            gap: 6, 
                            alignItems: 'center',
                            flexWrap: 'wrap' 
                          }}>
                            {/* WhatsApp Görüşmesi */}
                            {c.phone && (
                              <button 
                                type="button"
                                onClick={e => { e.stopPropagation(); handleWhatsApp(c); }}
                                style={{ 
                                  fontSize: '0.74rem', 
                                  padding: '5px 9px', 
                                  borderRadius: 6, 
                                  border: '1px solid rgba(52, 211, 153, 0.45)', 
                                  background: 'rgba(16, 185, 129, 0.2)', 
                                  color: '#4ade80', 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 4, 
                                  fontWeight: 700 
                                }}
                                title="Müşteriyle WhatsApp Görüşmesi Başlat"
                              >
                                <FiMessageSquare size={12} /> WhatsApp
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
                                      fontSize: '0.74rem', 
                                      padding: '5px 10px', 
                                      borderRadius: 6, 
                                      border: `1px solid ${stage.borderColor}`, 
                                      background: stage.accentBg, 
                                      color: stage.color, 
                                      cursor: 'pointer', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 4,
                                      fontWeight: 700
                                    }}
                                    title="Sonraki Satış Aşamasına İlerle"
                                  >
                                    İlerle <FiArrowRight size={12} />
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
                                    fontSize: '0.74rem', 
                                    padding: '5px 8px', 
                                    borderRadius: 6, 
                                    border: '1px solid rgba(203, 213, 225, 0.35)', 
                                    background: 'rgba(148, 163, 184, 0.18)', 
                                    color: '#e2e8f0', 
                                    cursor: 'pointer' 
                                  }}
                                  title="Fırsatı Arşivle / Kaybedildi"
                                >
                                  <FiArchive size={12} />
                                </button>
                              </>
                            )}

                            {/* Kazanıldı veya Kaybedildi durumunda Fırsatı Yeniden Aç */}
                            {(stage.key === 'won' || stage.key === 'lost') && (
                              <button 
                                type="button"
                                onClick={e => { e.stopPropagation(); moveStage(c.id, 'lead'); }}
                                style={{ 
                                  fontSize: '0.74rem', 
                                  padding: '5px 9px', 
                                  borderRadius: 6, 
                                  border: '1px solid rgba(56, 189, 248, 0.45)', 
                                  background: 'rgba(56, 189, 248, 0.18)', 
                                  color: '#7dd3fc', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontWeight: 700
                                }}
                              >
                                <FiRotateCcw size={12} /> Yeniden Aç
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
