import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoveryApi } from '../../api/client';
import toast from 'react-hot-toast';
import {
  FiTarget,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiGlobe,
  FiPhoneCall,
  FiMessageSquare,
  FiUserPlus,
  FiLink,
  FiCheckCircle,
  FiRefreshCw,
  FiExternalLink,
  FiSliders,
  FiEye,
  FiCopy,
  FiCheck,
  FiX,
  FiZap,
  FiTruck,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiActivity
} from 'react-icons/fi';

export default function IntentRadar() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [sourceFilter, setSourceFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQueryTag, setActiveQueryTag] = useState('');

  // Smart Link Generator Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [copiedStatusText, setCopiedStatusText] = useState(false);
  const [generatorModel, setGeneratorModel] = useState('Daily 35C16 Şasi');
  const [generatorCampaign, setGeneratorCampaign] = useState('kuveyt-turk-6-ay');
  const [generatorCompany, setGeneratorCompany] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [signalsRes, statsRes] = await Promise.all([
        discoveryApi.getIntentSignals(),
        discoveryApi.getIntentStats()
      ]);
      setSignals(signalsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('İstihbarat verileri alınamadı:', err);
      toast.error('İstihbarat verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Signals
  const filteredSignals = useMemo(() => {
    return signals.filter(item => {
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
      if (levelFilter !== 'all' && item.intent_level !== levelFilter) return false;
      if (selectedCity !== 'all' && item.city !== selectedCity) return false;
      if (activeQueryTag && item.search_query !== activeQueryTag) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch =
          (item.company_name && item.company_name.toLowerCase().includes(q)) ||
          (item.search_query && item.search_query.toLowerCase().includes(q)) ||
          (item.target_model && item.target_model.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.city && item.city.toLowerCase().includes(q));
        if (!textMatch) return false;
      }
      return true;
    });
  }, [signals, sourceFilter, levelFilter, selectedCity, searchQuery, activeQueryTag]);

  // Cities List for Filter
  const uniqueCities = useMemo(() => {
    const set = new Set();
    signals.forEach(s => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set);
  }, [signals]);

  // Convert to CRM Lead
  const handleConvertToLead = async (signal) => {
    try {
      setActionLoading(signal.id);
      const res = await discoveryApi.convertIntentToLead(signal.id);
      toast.success(res.data.message || 'Müşteri CRM satış adaylarına eklendi!');
      // Update local state
      setSignals(prev =>
        prev.map(s => (s.id === signal.id ? { ...s, status: 'converted', matched_customer_id: res.data.customer_id } : s))
      );
      // Optional: navigate to customer or pipeline
      if (res.data.customer_id) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Müşteri kartına gitmek ister misiniz?</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/customers/${res.data.customer_id}`);
              }}
              style={{
                background: 'var(--accent-blue)',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Görüntüle
            </button>
          </div>
        ), { duration: 6000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Adaya dönüştürülürken bir hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  // WhatsApp Outreach Direct
  const handleOpenWhatsApp = (signal) => {
    if (!signal.phone) {
      toast.error('Telefon numarası bulunamadı');
      return;
    }
    const cleanPhone = signal.phone.replace(/\D/g, '');
    const model = signal.target_model || 'IVECO Daily Şasi';
    const message = `Merhaba, IVECO ERC Otomotiv Satış Sorumlusu Can Murat ben. ${model} ve avantajlı Kuveyt Türk 6 ay ödemesiz ticari araç finansman çözümlerimiz hakkında bilgi paylaşmak isterim. Dilerseniz firmanıza özel teklif tablomuzu iletebilirim.`;
    const url = `https://wa.me/90${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Generate Smart Link
  const handleGenerateLink = () => {
    const slug = generatorModel.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const compSlug = generatorCompany.trim() ? encodeURIComponent(generatorCompany.trim().replace(/\s+/g, '_')) : 'kampanya_ziyaretci';
    const link = `https://iveco-crm.vercel.app/campaigns/${slug}?utm_source=whatsapp&utm_medium=smart_link&camp=${generatorCampaign}&ref=canmurat&cust=${compSlug}`;
    setGeneratedLink(link);
    setCopiedLink(false);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    toast.success('Akıllı kampanya linki panoya kopyalandı!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Format Duration
  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins} dk ${secs} sn`;
    return `${secs} sn`;
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              color: '#fff',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)'
            }}>
              <FiTarget size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Google Arama Niyeti & Dijital İstihbarat Radarı
            </h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }}></span>
              Canlı Niyet Akışı
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Google'da kamyon, frigorifik kasa ve ticari kampanya arayan sıcak potansiyel müşteriler, kurumsal IP eşleştirmeleri ve WhatsApp akıllı link okuma zekâsı.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setIsLinkModalOpen(true);
              handleGenerateLink();
            }}
            style={{
              background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(43, 125, 233, 0.35)'
            }}
          >
            <FiZap size={16} />
            Akıllı Kampanya Linki Üret
          </button>

          <button
            onClick={() => setIsStatusModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}
          >
            <FiMessageSquare size={16} />
            📲 WhatsApp Durumunda Paylaş
          </button>

          <button
            onClick={fetchData}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
            title="Yenile"
          >
            <FiRefreshCw size={16} className={loading ? 'loading-pulse' : ''} />
            Yenile
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ───────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>TOPLAM DİJİTAL SİNYAL</span>
            <span style={{ color: '#2b7de9', background: 'rgba(43, 125, 233, 0.1)', padding: '6px', borderRadius: '8px' }}><FiGlobe size={18} /></span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {stats ? stats.total_signals : signals.length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
            Google Arama + Ads + Akıllı Link
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>🔥 ÇOK SICAK (%90+ NİYET)</span>
            <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '6px', borderRadius: '8px' }}><FiTrendingUp size={18} /></span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f87171' }}>
            {stats ? stats.very_high_intent : signals.filter(s => s.intent_level === 'very_high').length}
          </div>
          <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px', fontWeight: 600 }}>
            Satışa hazır acil aranacaklar
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>GOOGLE ARAMA & ADS</span>
            <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '8px' }}><FiSearch size={18} /></span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {signals.filter(s => s.source === 'google_search' || s.source === 'google_ads').length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
            Kamyon ve kasa terimi aratanlar
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>ORT. İNCELEME SÜRESİ</span>
            <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '6px', borderRadius: '8px' }}><FiClock size={18} /></span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            2 dk 45 sn
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
            Ort. %85 sayfa kaydırma derinliği
          </div>
        </div>
      </div>

      {/* ── GOOGLE SEARCH QUERIES CLOUD / HOT TRENDS ────────────── */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            <FiSearch style={{ color: '#2b7de9' }} />
            Bölgede Google'da En Çok Aratılan Kelimeler (Hedef Terimler)
          </div>
          {activeQueryTag && (
            <button
              onClick={() => setActiveQueryTag('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FiX size={14} /> Filtreyi Temizle
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { tag: 'iveco daily 35c16 şasi fiyatları samsun', count: 1, hot: true },
            { tag: 'kuveyt türk 6 ay ödemesiz ticari araç kredisi', count: 1, hot: true },
            { tag: 'satılık frigorifik kasa kamyonet samsun', count: 1, hot: true },
            { tag: 'satılık çekici 530 beygir tır kampanyası', count: 1, hot: true },
            { tag: 'iveco eurocargo 150e21 damper kasa samsun', count: 1, hot: false },
            { tag: 'ford transit takas iveco daily farkı', count: 1, hot: false },
            { tag: 'sıfır km 7.2 ton kamyonet b ehliyet', count: 1, hot: false }
          ].map((item, idx) => {
            const isSelected = activeQueryTag === item.tag;
            return (
              <button
                key={idx}
                onClick={() => setActiveQueryTag(isSelected ? '' : item.tag)}
                style={{
                  background: isSelected
                    ? 'var(--accent-blue)'
                    : item.hot
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'var(--bg-card)',
                  color: isSelected ? '#fff' : item.hot ? '#f87171' : 'var(--text-secondary)',
                  border: isSelected
                    ? '1px solid var(--accent-blue-light)'
                    : item.hot
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🔍</span>
                <span>"{item.tag}"</span>
                {item.hot && <span style={{ fontSize: '11px' }}>🔥</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card)',
        padding: '14px 18px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        {/* Left: Source & Level Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>KAYNAK:</span>
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'google_search', label: '🔍 Google Organik' },
            { id: 'google_ads', label: '🎯 Google Ads' },
            { id: 'whatsapp_link', label: '💬 WhatsApp Link' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSourceFilter(f.id)}
              style={{
                background: sourceFilter === f.id ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                color: sourceFilter === f.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: sourceFilter === f.id ? 'var(--accent-blue)' : 'var(--border-color)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: sourceFilter === f.id ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}

          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '8px' }}>NİYET:</span>
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'very_high', label: '🔥 Çok Sıcak (%90+)' },
            { id: 'high', label: 'Sıcak (%75+)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setLevelFilter(f.id)}
              style={{
                background: levelFilter === f.id ? '#ef4444' : 'var(--bg-secondary)',
                color: levelFilter === f.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: levelFilter === f.id ? '#ef4444' : 'var(--border-color)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: levelFilter === f.id ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Right: City and Search input */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {uniqueCities.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tüm İller</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Firma, araç veya terim ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '7px 12px 7px 32px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                minWidth: '220px'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── LIVE INTENT SIGNALS LIST ─────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="loading-pulse" style={{ margin: '0 auto 16px' }}></div>
          <p>Dijital niyet sinyalleri taranıyor...</p>
        </div>
      ) : filteredSignals.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px dashed var(--border-color)'
        }}>
          <FiTarget size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>Kriterlere Uygun Niyet Sinyali Bulunamadı</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Filtreleri sıfırlayarak tüm dijital sinyalleri görüntüleyebilirsiniz.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredSignals.map((signal) => {
            const isVeryHot = signal.intent_level === 'very_high' || signal.intent_score >= 90;
            const isConverted = signal.status === 'converted' || !!signal.matched_customer_id;

            return (
              <div
                key={signal.id}
                style={{
                  background: 'var(--bg-card)',
                  border: isVeryHot
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  boxShadow: isVeryHot ? '0 4px 20px rgba(245, 158, 11, 0.08)' : 'var(--shadow-card)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(280px, 1.8fr) minmax(260px, 1.6fr) minmax(200px, 1fr) minmax(220px, 1.2fr)',
                  gap: '20px',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                {/* 1. SÜTUN: Firma, Lokasyon & IP */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {/* Source Pill */}
                    {signal.source === 'google_search' && (
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FiSearch size={12} /> Google Organik
                      </span>
                    )}
                    {signal.source === 'google_ads' && (
                      <span style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FiTarget size={12} /> Google Ads
                      </span>
                    )}
                    {signal.source === 'whatsapp_link' && (
                      <span style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FiMessageSquare size={12} /> WhatsApp Smart Link
                      </span>
                    )}

                    {isConverted && (
                      <span style={{
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        ✓ CRM Lead'de
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.08rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-heading)' }}>
                    {signal.company_name || 'Tespit Edilen Kurumsal Ziyaretçi'}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiMapPin size={13} style={{ color: 'var(--text-muted)' }} />
                      {signal.city}{signal.district ? ` / ${signal.district}` : ''}
                    </span>
                    {signal.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-blue-light)', fontWeight: 500 }}>
                        <FiPhoneCall size={12} />
                        {signal.phone}
                      </span>
                    )}
                  </div>

                  {signal.ip_address && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      🌐 IP: {signal.ip_address}
                    </div>
                  )}
                </div>

                {/* 2. SÜTUN: Google Arama Terimi & Model */}
                <div>
                  {signal.search_query && (
                    <div style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Google Arama Terimi
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fef08a' }}>
                        "{signal.search_query}"
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {signal.target_model && (
                      <span style={{
                        background: 'rgba(43, 125, 233, 0.12)',
                        color: '#60a5fa',
                        border: '1px solid rgba(43, 125, 233, 0.25)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FiTruck size={13} /> {signal.target_model}
                      </span>
                    )}

                    {signal.target_campaign && (
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.78rem',
                        fontWeight: 500
                      }}>
                        🏷️ {signal.target_campaign}
                      </span>
                    )}
                  </div>

                  {signal.notes && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                      {signal.notes}
                    </p>
                  )}
                </div>

                {/* 3. SÜTUN: Davranış & Niyet Skoru */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: isVeryHot ? '#ef4444' : '#f59e0b'
                    }}>
                      %{signal.intent_score || 85}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: isVeryHot ? '#ef4444' : '#f59e0b'
                    }}>
                      {isVeryHot ? '🔥 Çok Sıcak' : 'Sıcak Niyet'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock size={12} style={{ color: 'var(--text-muted)' }} />
                      İnceleme: <strong>{formatDuration(signal.duration_seconds)}</strong>
                    </div>
                    <div>
                      Kaydırma: <strong>%{signal.scroll_depth || 75} derinlik</strong>
                    </div>
                  </div>
                </div>

                {/* 4. SÜTUN: Aksiyon Butonları */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {signal.phone ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a
                        href={`tel:${signal.phone.replace(/\s+/g, '')}`}
                        style={{
                          flex: 1,
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          textDecoration: 'none'
                        }}
                      >
                        <FiPhoneCall size={14} /> Hemen Ara
                      </a>

                      <button
                        onClick={() => handleOpenWhatsApp(signal)}
                        style={{
                          flex: 1,
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#22c55e',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <FiMessageSquare size={14} /> WhatsApp
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Kurumsal IP İletişimi Bekleniyor
                    </div>
                  )}

                  {!isConverted ? (
                    <button
                      onClick={() => handleConvertToLead(signal)}
                      disabled={actionLoading === signal.id}
                      style={{
                        background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: actionLoading === signal.id ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 75, 147, 0.3)'
                      }}
                    >
                      {actionLoading === signal.id ? (
                        <>
                          <div className="loading-pulse" style={{ width: '14px', height: '14px' }}></div>
                          Aktarılıyor...
                        </>
                      ) : (
                        <>
                          <FiUserPlus size={14} /> CRM'e Lead Olarak Aktar
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(signal.matched_customer_id ? `/customers/${signal.matched_customer_id}` : '/pipeline')}
                      style={{
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <FiExternalLink size={14} /> Satış Pipeline'da Gör
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SMART TRACKING LINK GENERATOR MODAL ────────────────── */}
      {isLinkModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsLinkModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <FiX size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiZap size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Akıllı Kampanya Takip Linki Üretici
              </h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Müşteriye WhatsApp veya SMS ile göndereceğiniz linki özelleştirin. Müşteri linke tıkladığı anda sistem IP, inceleme süresi ve arama niyetini bu radara canlı düşürür.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  HEDEF ARAÇ MODELİ
                </label>
                <select
                  value={generatorModel}
                  onChange={(e) => {
                    setGeneratorModel(e.target.value);
                    handleGenerateLink();
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="Daily 35C16 Şasi">IVECO Daily 35C16 Şasi</option>
                  <option value="Daily 35S16 Panelvan">IVECO Daily 35S16 Panelvan</option>
                  <option value="Daily 70C / 72C Şasi">IVECO Daily 70C / 72C (7.2 Ton)</option>
                  <option value="Eurocargo ML150E21">IVECO Eurocargo 150E21</option>
                  <option value="S-Way 530 Çekici">IVECO S-Way 530 Çekici</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  KAMPANYA / FİNANSMAN SEÇENEĞİ
                </label>
                <select
                  value={generatorCampaign}
                  onChange={(e) => {
                    setGeneratorCampaign(e.target.value);
                    handleGenerateLink();
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="kuveyt-turk-6-ay">Kuveyt Türk 6 Ay Ödemesiz - Bayi Katkılı</option>
                  <option value="denizbank-cati">Denizbank Avantajlı Ticari Kredi</option>
                  <option value="garanti-bbva-agir">Garanti BBVA Ağır Vasıta Çatı Matrisi</option>
                  <option value="tco-tasarruf">TCO Rakip Yakıt & Servis Tasarruf Aracı</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  FİRMA / MÜŞTERİ ADI (Opsiyonel Takip Etiketi)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Sampa Lojistik, Temel Nakliyat..."
                  value={generatorCompany}
                  onChange={(e) => {
                    setGeneratorCompany(e.target.value);
                  }}
                  onBlur={handleGenerateLink}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Generated Link Box */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                ÜRETİLEN AKILLI İSTİHBARAT LİNKİ:
              </div>
              <div style={{
                fontSize: '0.82rem',
                color: '#60a5fa',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                lineHeight: 1.4
              }}>
                {generatedLink || 'https://iveco-crm.vercel.app/campaigns/daily-35c16'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  background: copiedLink ? '#10b981' : 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                {copiedLink ? (
                  <>
                    <FiCheck size={18} /> Link Panoya Kopyalandı!
                  </>
                ) : (
                  <>
                    <FiCopy size={18} /> Takip Linkini Kopyala
                  </>
                )}
              </button>

              <button
                onClick={() => setIsLinkModalOpen(false)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── WHATSAPP STATUS SHARING MODAL ────────────────────── */}
      {isStatusModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsStatusModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <FiX size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                background: '#22c55e',
                color: '#fff',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)'
              }}>
                <FiMessageSquare size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  WhatsApp Durum Paylaşım Kartı
                </h2>
                <span style={{ fontSize: '0.78rem', color: '#4ade80' }}>
                  Akıllı Araç & Kredi Seçici Linki
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Aşağıdaki hazır şablonu WhatsApp Durumunuzda paylaşın. Müşterileriniz durumunuzdaki linke tıkladığında istedikleri tonaj ve kasayı seçip anında taksit hesaplayabilir; teklif istediklerinde doğrudan bu radara <strong>🔥 Çok Sıcak</strong> olarak düşerler!
            </p>

            {/* Metin Kutusu */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '16px',
              fontSize: '0.84rem',
              lineHeight: 1.6,
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap'
            }}>
{`🚛 İŞİNİZE EN UYGUN IVECO'YU VE %0 FAİZLİ KREDİ PLANINIZI 30 SANİYEDE HESAPLAYIN! 📲

Tonaj ve kasa ihtiyacınızı seçin; sistemimiz en verimli şasiyi ve anlaşmalı bankaların (TEB Cetelem, Kuveyt Türk vb.) %0 faizli resmi taksit tablosunu anında özetlesin.

👇 Aşağıdaki linke tıklayarak hemen hesaplayın:
👉 https://iveco-crm.vercel.app/ozel-teklif?ref=canmurat_vip

IVECO ERC Otomotiv • Can Murat (Sales Priest)`}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  const text = `🚛 İŞİNİZE EN UYGUN IVECO'YU VE %0 FAİZLİ KREDİ PLANINIZI 30 SANİYEDE HESAPLAYIN! 📲\n\nTonaj ve kasa ihtiyacınızı seçin; sistemimiz en verimli şasiyi ve anlaşmalı bankaların (TEB Cetelem, Kuveyt Türk vb.) %0 faizli resmi taksit tablosunu anında özetlesin.\n\n👇 Aşağıdaki linke tıklayarak hemen hesaplayın:\n👉 https://iveco-crm.vercel.app/ozel-teklif?ref=canmurat_vip\n\nIVECO ERC Otomotiv • Can Murat (Sales Priest)`;
                  navigator.clipboard.writeText(text);
                  setCopiedStatusText(true);
                  toast.success('WhatsApp Durum metni ve linki panoya kopyalandı!');
                  setTimeout(() => setCopiedStatusText(false), 3000);
                }}
                style={{
                  flex: 1,
                  background: copiedStatusText ? '#10b981' : '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
                }}
              >
                {copiedStatusText ? (
                  <>
                    <FiCheck size={18} /> Metin Kopyalandı!
                  </>
                ) : (
                  <>
                    <FiCopy size={18} /> Durum Metnini & Linki Kopyala
                  </>
                )}
              </button>

              <button
                onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                WhatsApp Web'i Aç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
