import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, crmApi, vehiclesApi, workbenchApi, discoveryApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import useDeviceDetect from '../hooks/useDeviceDetect';
import useGeolocation from '../hooks/useGeolocation';
import { FiUsers, FiStar, FiSearch, FiPhone, FiBell, FiFolder, FiTrendingUp, FiMapPin, FiCamera, FiMap, FiTruck, FiRefreshCw, FiMessageSquare, FiCalendar, FiArrowRight, FiZap, FiCheckCircle, FiTrash2, FiFileText, FiBarChart2, FiChevronDown, FiChevronUp, FiSend } from 'react-icons/fi';
import { CityDonutChart, SectorBarChart, TrendAreaChart, PipelineFunnel, SegmentChart, ChartLegend, RegionMap } from '../components/Charts/AnalyticsCharts';
import toast from 'react-hot-toast';
import { getWhatsAppUrl, sendCustomerVipPortalWhatsApp } from '../utils/whatsapp';
import { getPublicOrigin } from '../utils/publicUrl';
import { openExternal, buildWhatsAppUrl } from '../utils/openExternal';
import WhatsAppActionModal from '../components/CRM/WhatsAppActionModal';
import FieldAssistantHero, { TARGET_CITIES } from '../components/CRM/FieldAssistantHero';
import TodayOpportunitiesCard from '../components/CRM/TodayOpportunitiesCard';
import QuickVisitModal from '../components/CRM/QuickVisitModal';
import NearbyRadarModal from '../components/CRM/NearbyRadarModal';
import FleetRenewalRadarWidget from '../components/FleetRadar/FleetRenewalRadarWidget';
import PartnerLinkGeneratorCard from '../components/CRM/PartnerLinkGeneratorCard';


const STAT_CARDS = [
  { key: 'total_customers', label: 'Toplam Müşteri Portföyü', icon: FiUsers, gradient: 'linear-gradient(135deg, #0f2d59, #004B93)' },
  { key: 'high_potential_customers', label: 'A-Segment Öncelikli', icon: FiStar, gradient: 'linear-gradient(135deg, #064e3b, #059669)' },
  { key: 'new_discoveries', label: 'Bölgesel Yeni Keşifler', icon: FiSearch, gradient: 'linear-gradient(135deg, #78350f, #d97706)' },
  { key: 'today_follow_ups', label: 'Bugün Aranacak & Takip', icon: FiPhone, gradient: 'linear-gradient(135deg, #0369a1, #0284c7)' },
  { key: 'unread_notifications', label: 'Aksiyon Bekleyen Talepler', icon: FiBell, gradient: 'linear-gradient(135deg, #881337, #e11d48)' },
  { key: 'active_campaigns', label: 'Aktif Satış Kampanyaları', icon: FiFolder, gradient: 'linear-gradient(135deg, #312e81, #4f46e5)' },
];


export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [geoData, setGeoData] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  const [highPotential, setHighPotential] = useState([]);
  const [todayCalls, setTodayCalls] = useState([]);
  const [liveFootprints, setLiveFootprints] = useState([]);

  // Filo Yenileme & Akıllı Takip State'leri
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [renewalOpportunities, setRenewalOpportunities] = useState([]);

  // Araç Odaklı Satış Fırsatları & Pipeline State'leri
  const [opportunities, setOpportunities] = useState(null);
  const [activeOppTab, setActiveOppTab] = useState('hot_leads'); // 'hot_leads', 'stock_matches', 'follow_up_needed', 'quote_pending', 'campaign_opportunities'
  const [vehiclePipeline, setVehiclePipeline] = useState(null);
  
  // WhatsApp Action Modal & Auto-Interest Cleanup State'leri
  const [whatsAppModalData, setWhatsAppModalData] = useState(null);
  const [cleaningAuto, setCleaningAuto] = useState(false);

  // Saha Asistanı State'leri
  const [selectedCity, setSelectedCity] = useState('Samsun');
  const [fieldAssistant, setFieldAssistant] = useState(null);
  const [quickVisitModalOpen, setQuickVisitModalOpen] = useState(false);
  const [quickVisitCustomer, setQuickVisitCustomer] = useState(null);
  const [radarOpen, setRadarOpen] = useState(false);

  // GPS ve Yakınım State'leri
  const { location, error: gpsError, loading: gpsLoading } = useGeolocation();
  const [nearbyA, setNearbyA] = useState(0);
  const [nearbyB, setNearbyB] = useState(0);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [nearbyList, setNearbyList] = useState([]);

  const [loadError, setLoadError] = useState(false);
  const [showAnalyticsCharts, setShowAnalyticsCharts] = useState(false);
  const lastSeenFootprintIdRef = useRef(null);

  const playFootprintChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const playTone = (freq, startOffset, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + startOffset);
        gain.gain.setValueAtTime(0.14, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration);
      };
      playTone(880, 0, 0.18);
      playTone(1174.66, 0.16, 0.28);
    } catch {
      // Ses çalınamazsa sessizce geç
    }
  };

  const { user } = useAuth();
  const isMobile = useDeviceDetect();
  const navigate = useNavigate();

  const loadDashboard = (city = selectedCity) => {
    setLoadError(false);
    Promise.all([
      dashboardApi.getSummary().then(r => setSummary(r.data)),
      dashboardApi.getAnalytics().then(r => setAnalytics(r.data)),
      dashboardApi.getGeoData().then(r => setGeoData(r.data)),
      dashboardApi.getNewDiscoveries().then(r => setDiscoveries(r.data)),
      dashboardApi.getHighPotential().then(r => setHighPotential(r.data)),
      dashboardApi.getTodayCalls().then(r => setTodayCalls(r.data)),
      crmApi.getUpcomingReminders(14).then(r => setUpcomingReminders(r.data || [])),
      crmApi.getFleetRenewalOpportunities().then(r => setRenewalOpportunities(r.data || [])),
      vehiclesApi.getTodayOpportunities().then(r => setOpportunities(r.data)).catch(() => {}),
      vehiclesApi.getVehiclePipeline().then(r => setVehiclePipeline(r.data)).catch(() => {}),
      discoveryApi.getIntentSignals({ limit: 6 }).then(r => {
        const list = r.data || [];
        setLiveFootprints(list);
        if (list.length > 0 && list[0].id && !lastSeenFootprintIdRef.current) {
          lastSeenFootprintIdRef.current = list[0].id;
        }
      }).catch(() => {}),
      workbenchApi.getFieldAssistant({
        city: city === 'Tümü' ? undefined : city,
        lat: location?.latitude,
        lng: location?.longitude
      }).then(r => setFieldAssistant(r.data)).catch(() => {}),
    ]).catch((err) => {
      console.error("Dashboard yüklenirken hata:", err);
      setLoadError(true);
    });
  };

  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    workbenchApi.getFieldAssistant({
      city: newCity === 'Tümü' ? undefined : newCity,
      lat: location?.latitude,
      lng: location?.longitude
    }).then(r => setFieldAssistant(r.data)).catch(() => {});
  };

  const handleCleanupAutoInterests = async () => {
    if (!window.confirm("Rehber aktarımından otomatik algılanan ilgi kayıtlarını silmek istiyor musunuz? Sadece sizin manuel eklediğiniz ve teklif hazırladığınız araç ilgileri korunacaktır.")) {
      return;
    }
    try {
      setCleaningAuto(true);
      const res = await vehiclesApi.cleanupAutoInterests();
      toast.success(res.data?.message || 'Rehber kaynaklı otomatik kayıtlar temizlendi!');
      loadDashboard();
    } catch (err) {
      console.error("Temizleme hatası:", err);
      toast.error("Temizleme işlemi sırasında bir hata oluştu.");
    } finally {
      setCleaningAuto(false);
    }
  };

  const refreshLiveFootprints = () => {
    discoveryApi.getIntentSignals({ limit: 6 })
      .then(r => {
        const list = r.data || [];
        if (list.length > 0 && list[0].id) {
          if (lastSeenFootprintIdRef.current && list[0].id > lastSeenFootprintIdRef.current) {
            const newest = list[0];
            playFootprintChime();
            toast.success(
              `🔥 CANLI MÜŞTERİ PORTALDA: ${newest.company_name || 'Ziyaretçi'} şu an ${newest.target_model || '2026 Katalog'} inceliyor!`,
              { duration: 8000 }
            );
            if (typeof document !== 'undefined') {
              document.title = `🔥 (1) ${newest.company_name || 'MÜŞTERİ'} PORTALDA! | IVECO CRM`;
            }
          }
          lastSeenFootprintIdRef.current = list[0].id;
        }
        setLiveFootprints(list);
      })
      .catch(() => {});
  };

  const isFreshFootprint = (createdAt) => {
    if (!createdAt) return false;
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return diffMs >= 0 && diffMs <= 20 * 60 * 1000; // Son 20 dakika
  };

  useEffect(() => {
    loadDashboard();
    const fpInterval = setInterval(() => {
      refreshLiveFootprints();
    }, 20000);
    const resetTitle = () => {
      if (typeof document !== 'undefined' && document.title.startsWith('🔥')) {
        document.title = 'IVECO CRM — Müşteri İstihbarat & Satış';
      }
    };
    window.addEventListener('focus', resetTitle);
    window.addEventListener('click', resetTitle);
    return () => {
      clearInterval(fpInterval);
      window.removeEventListener('focus', resetTitle);
      window.removeEventListener('click', resetTitle);
    };
  }, []);

  // Konum alındığında yakındaki müşterileri dinamik sorgula
  useEffect(() => {
    if (location) {
      crmApi.getNearbyCustomers({
        lat: location.latitude,
        lng: location.longitude,
        radius_km: 5
      })
      .then(res => {
        const list = res.data || [];
        setNearbyList(list);
        setNearbyCount(list.length);
        setNearbyA(list.filter(c => c.segment === 'A').length);
        setNearbyB(list.filter(c => c.segment === 'B').length);
      })
      .catch(() => {});
    }
  }, [location]);

  if (loadError && !summary) {
    return (
      <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Dashboard verileri yüklenemedi veya sunucu yanıt vermedi.</p>
        <button className="btn btn-primary btn-sm" onClick={loadDashboard}>
          Yeniden Dene
        </button>
      </div>
    );
  }

  if (!summary) return <div className="dashboard-loading"><div className="loading-pulse" /><span>Dashboard yükleniyor...</span></div>;

  // ── MOBILE DASHBOARD (Saha Satış Arayüzü) ──────────────────────────
  if (isMobile) {
    const displayName = user?.full_name || 'Can Murat Onay';

    return (
      <div className="mobile-dashboard animate-in">
        {/* ── MOBİL KARŞILAMA & YÖNETİCİ BAŞLIĞI ── */}
        <div className="mobile-welcome-header">
          <div className="mobile-welcome-top">
            <div className="mobile-welcome-brand">
              <span className="brand-dot-pulse" />
              <span className="brand-title">IVECO ERC SAMSUN</span>
            </div>
            {/* Hızlı Şehir / Bölge Seçici */}
            <div className="mobile-city-pill">
              <FiMapPin size={12} style={{ color: location ? '#10b981' : '#f59e0b' }} />
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="mobile-city-select"
              >
                <option value="Tümü">Tüm Bölge (9 İl)</option>
                {TARGET_CITIES.map(c => (
                  <option key={c} value={c} style={{ background: '#0f172a', color: '#f8fafc' }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mobile-welcome-main">
            <div className="mobile-welcome-greeting">
              <div className="mobile-welcome-text">
                Hoş Geldiniz, <strong>{displayName}</strong>
              </div>
              <div className="mobile-welcome-sub">
                Satış Sorumlusu · 0544 622 59 31
              </div>
            </div>
            <div className="mobile-live-badge">
              <span className="live-dot" /> Canlı Saha
            </div>
          </div>
        </div>

        {/* ── HIZLI TEKLİF & PROFORMA KARTI (MOBİL ÖNCELİKLİ) ── */}
        <div 
          className="mobile-quick-proposal-card" 
          onClick={() => navigate('/proforma/quick')}
          role="button"
          tabIndex={0}
        >
          <div className="proposal-card-left">
            <div className="proposal-card-icon">
              <FiFileText size={22} />
            </div>
            <div className="proposal-card-text">
              <div className="proposal-badge">
                <FiZap size={11} /> 1-TIKLA HIZLI TEKLİF
              </div>
              <div className="proposal-title">Müşteriye Teklif & Proforma Gönder</div>
              <div className="proposal-sub">WhatsApp'tan anında ilet veya resmi PDF hazırla (30 sn)</div>
            </div>
          </div>
          <button type="button" className="proposal-card-action-btn">
            Teklif Hazırla
          </button>
        </div>

        {/* ── FİYAT LİSTESİNİ MÜŞTERİYLE PAYLAŞ (MOBİL) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', margin: '0 0 14px' }}>
          <button
            type="button"
            onClick={() => {
              const url = `${getPublicOrigin()}/fiyat-listesi?ref=muratonay`;
              const text = `Merhaba,\n\nIVECO 2026 model Daily, Eurocargo ve S-Way araçlarımızın güncel fiyat listesi ve banka kredi kampanyalarını aşağıdaki bağlantıdan inceleyebilirsiniz:\n\n${url}\n\n*Satış Sorumlusu Can M. - 0544 622 59 31*\n*IVECO ERC Samsun Otomotiv*`;
              openExternal(buildWhatsAppUrl(text));
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(37,211,102,0.45)', background: 'rgba(37,211,102,0.14)', color: '#4ade80', fontWeight: 800, fontSize: '0.88rem' }}
          >
            <FiMessageSquare size={16} /> Fiyat Listesini WhatsApp'tan Paylaş
          </button>
          <button
            type="button"
            onClick={async () => {
              const url = `${getPublicOrigin()}/fiyat-listesi?ref=muratonay`;
              try {
                await navigator.clipboard.writeText(url);
                toast.success('Fiyat listesi linki kopyalandı');
              } catch {
                window.prompt('Linki kopyalayın:', url);
              }
            }}
            style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontWeight: 700, fontSize: '0.8rem' }}
            title="Linki kopyala"
          >
            Link Kopyala
          </button>
        </div>

        {/* 🏛️ Dernek, Oda & Birlik Özel İndirimli Link Üretici (Mobil) */}
        <PartnerLinkGeneratorCard isMobile={true} />

        {/* ⚡ Saha Asistanı Hero (Mobil - 6'lı Minimal Matris) */}
        <FieldAssistantHero
          stats={fieldAssistant?.counts || {}}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          onOpenVisitModal={() => setQuickVisitModalOpen(true)}
          onOpenRadar={() => setRadarOpen(true)}
          isMobile={true}
        />

        {/* ── BUGÜNÜN SATIŞ FIRSATLARI (Mobil Saha Satış) ── */}
        <TodayOpportunitiesCard
          fieldAssistant={fieldAssistant}
          opportunities={opportunities}
          onOpenWhatsApp={setWhatsAppModalData}
          onOpenQuickVisit={setQuickVisitCustomer}
          onCleanupAuto={handleCleanupAutoInterests}
          cleaningAuto={cleaningAuto}
          isMobile={true}
        />

        {/* Yakınımda */}
        <section className="mobile-section">
          <div className="section-title">YAKINIMDAKİLER (5 KM)</div>
          <div className="nearby-summary-card">
            <div className="nearby-stat">
              <span className="label">A Segment Müşteri</span>
              <span className="value text-green">{location ? nearbyA : '—'}</span>
            </div>
            <div className="nearby-stat">
              <span className="label">B Segment Müşteri</span>
              <span className="value text-blue">{location ? nearbyB : '—'}</span>
            </div>
            <div className="nearby-stat">
              <span className="label">Potansiyel Yeni Firma</span>
              <span className="value text-amber">{discoveries.length}</span>
            </div>
          </div>
        </section>


        {/* Takipler */}
        <section className="mobile-section mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="section-title" style={{ margin: 0 }}>BUGÜN ARANACAKLAR</div>
            <span className="badge badge-purple">{todayCalls.length}</span>
          </div>
          <div className="mobile-list">
            {todayCalls.length > 0 ? todayCalls.slice(0, 5).map((c, i) => (
              <div key={i} className="mobile-list-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/customers/${c.customer_id}`)}>
                  <div className="item-avatar">{c.customer_name?.charAt(0)}</div>
                  <div className="item-details">
                    <div className="item-name">{c.customer_name}</div>
                    <div className="item-sub">{c.city} · {c.phone || 'Telefon Yok'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.phone && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhatsAppModalData({
                          customer: {
                            id: c.customer_id,
                            company_name: c.customer_name,
                            phone: c.phone,
                            city: c.city
                          },
                          vehicleTitle: '',
                          interestId: null,
                          defaultStatus: 'offer_given'
                        });
                      }}
                      className="btn btn-sm btn-success"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', background: '#25d366', borderColor: '#25d366', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      title="WhatsApp & Kayıt"
                    >
                      <FiMessageSquare size={12} /> WA
                    </button>
                  )}
                  <span className="badge badge-amber">{c.status}</span>
                </div>
              </div>
            )) : (
              <div className="mobile-empty">
                <p>Bugün için planlanmış takip bulunmuyor.</p>
              </div>
            )}
          </div>
        </section>

        {/* 📡 Canlı Müşteri Ayak İzi (Mobil) */}
        {liveFootprints.length > 0 && (
          <section className="mobile-section mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="section-title" style={{ margin: 0, color: '#38bdf8' }}>📡 CANLI MÜŞTERİ AYAK İZİ (PORTAL)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={refreshLiveFootprints}
                  style={{ background: 'rgba(56, 189, 248, 0.14)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', borderRadius: 6, padding: '2px 7px', fontSize: '0.68rem', fontWeight: 700 }}
                >
                  🔄 Canlı
                </button>
                <span className="badge badge-blue">{liveFootprints.length}</span>
              </div>
            </div>
            <div className="mobile-list">
              {liveFootprints.slice(0, 4).map((fp, i) => (
                <div
                  key={fp.id || i}
                  className="mobile-list-item"
                  onClick={() => fp.matched_customer_id ? navigate(`/customers/${fp.matched_customer_id}`) : navigate('/intent-radar')}
                  style={{ borderLeft: isFreshFootprint(fp.created_at) ? '3px solid #10b981' : '3px solid #38bdf8' }}
                >
                  <div className="item-avatar" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    <FiZap size={16} />
                  </div>
                  <div className="item-details">
                    <div className="item-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{fp.company_name || 'Portal Ziyaretçisi'}</span>
                      {isFreshFootprint(fp.created_at) && (
                        <span style={{ background: '#10b981', color: '#052e16', fontSize: '0.62rem', fontWeight: 900, padding: '1px 5px', borderRadius: 4 }}>
                          🔥 YENİ
                        </span>
                      )}
                    </div>
                    <div className="item-sub" style={{ color: '#7dd3fc' }}>
                      {fp.target_model || '2026 Katalog'} · {fp.search_query?.replace(/^\[|\]$/g, '') || 'Portal İncelemesi'}
                    </div>
                  </div>
                  {fp.phone && (
                    <a
                      href={`tel:${fp.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="btn btn-sm"
                      style={{ padding: '5px 8px', background: '#0284c7', color: '#fff', borderRadius: 6, fontSize: '0.72rem', textDecoration: 'none' }}
                    >
                      <FiPhone size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Yaklaşan Bilgilendirmeler & Hatırlatıcılar */}
        {upcomingReminders.length > 0 && (
          <section className="mobile-section mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="section-title" style={{ margin: 0 }}>YAKLAŞAN BİLGİLENDİRMELER (14 GÜN)</div>
              <span className="badge badge-purple">{upcomingReminders.length}</span>
            </div>
            <div className="mobile-list">
              {upcomingReminders.slice(0, 5).map((r, i) => (
                <div key={i} className="mobile-list-item" onClick={() => navigate(`/customers/${r.customer_id}`)}>
                  <div className="item-avatar" style={{ background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)' }}>
                    <FiBell size={16} />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{r.company_name}</div>
                    <div className="item-sub">{r.title} · {r.reminder_date}</div>
                  </div>
                  {r.is_overdue ? (
                    <span className="badge badge-red">Gecikmiş</span>
                  ) : (
                    <span className="badge badge-purple">Yakında</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filo Yenileme Fırsatları */}
        {renewalOpportunities.length > 0 && (
          <section className="mobile-section mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="section-title" style={{ margin: 0 }}>FİLO YENİLEME FIRSATLARI (≥3 YAŞ)</div>
              <span className="badge badge-amber">{renewalOpportunities.length}</span>
            </div>
            <div className="mobile-list">
              {renewalOpportunities.slice(0, 5).map((v, i) => (
                <div key={i} className="mobile-list-item" onClick={() => navigate(`/customers/${v.customer_id}`)}>
                  <div className="item-avatar" style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}>
                    <FiTruck size={16} />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{v.company_name}</div>
                    <div className="item-sub">{v.brand} {v.model} ({v.model_year || '—'}) {v.plate_number ? `· ${v.plate_number}` : ''}</div>
                  </div>
                  <span className="badge badge-amber">{v.vehicle_age} Yaş</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WhatsApp Teklif & Görüşme Modalı (Mobil) */}
        <WhatsAppActionModal
          isOpen={!!whatsAppModalData}
          onClose={() => setWhatsAppModalData(null)}
          customer={whatsAppModalData?.customer}
          vehicleTitle={whatsAppModalData?.vehicleTitle}
          interestId={whatsAppModalData?.interestId}
          defaultStatus={whatsAppModalData?.defaultStatus || 'offer_given'}
          onSuccess={() => {
            loadDashboard();
          }}
        />

        {/* Hızlı Ziyaret Modalı (Mobil) */}
        <QuickVisitModal
          isOpen={quickVisitModalOpen || !!quickVisitCustomer}
          onClose={() => {
            setQuickVisitModalOpen(false);
            setQuickVisitCustomer(null);
          }}
          initialCustomerId={quickVisitCustomer?.id}
          initialCompanyName={quickVisitCustomer?.company_name}
          onSuccess={() => {
            loadDashboard();
          }}
        />

        {/* GPS Radar Modalı (Mobil) */}
        <NearbyRadarModal
          isOpen={radarOpen}
          onClose={() => setRadarOpen(false)}
          onStartVisit={(cust) => {
            setRadarOpen(false);
            setQuickVisitCustomer(cust);
            setQuickVisitModalOpen(true);
          }}
        />
      </div>
    );
  }

  // ── DESKTOP DASHBOARD (Mevcut Görünüm) ─────────────────────────────
  return (
    <div className="animate-in">
      {/* ⚡ SAHA SATIST ASİSTANI (Desktop Hero) */}
      <FieldAssistantHero
        stats={fieldAssistant?.counts || {}}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        onOpenVisitModal={() => setQuickVisitModalOpen(true)}
        onOpenRadar={() => setRadarOpen(true)}
        isMobile={false}
      />

      {/* KPI Stats */}
      <div className="kpi-grid">
        {STAT_CARDS.map((card, idx) => {
          const Icon = card.icon;
          const isFollowUp = card.key === 'today_follow_ups';
          return (
            <div
              key={card.key}
              className="kpi-card"
              onClick={() => {
                if (isFollowUp) navigate('/workbench');
                else if (card.key === 'total_customers') navigate('/customers');
                else if (card.key === 'new_discoveries') navigate('/discovery');
                else if (card.key === 'unread_notifications') navigate('/notifications');
                else if (card.key === 'active_campaigns') navigate('/campaigns');
              }}
              style={{
                animationDelay: `${idx * 60}ms`,
                cursor: 'pointer',
                border: isFollowUp ? '1.5px solid rgba(139, 92, 246, 0.4)' : undefined,
                boxShadow: isFollowUp ? '0 4px 20px rgba(139, 92, 246, 0.15)' : undefined
              }}
              title={isFollowUp ? "Bugün Aranacaklar listesini aç" : undefined}
            >
              <div className="kpi-icon-wrap" style={{ background: card.gradient }}>
                <Icon size={22} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">{card.label}</span>
                <span className="kpi-value">{summary[card.key] ?? 0}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🏛️ DERNEK, ODA & BİRLİK ÖZEL İNDİRİMLİ LİNK ÜRETİCİ (SİMDER, Arıcılar Birliği vb.) */}
      <PartnerLinkGeneratorCard isMobile={false} />

      {/* ── BUGÜNÜN SATIŞ FIRSATLARI (Araç & Saha Zekâsı) ── */}
      <TodayOpportunitiesCard
        fieldAssistant={fieldAssistant}
        opportunities={opportunities}
        onOpenWhatsApp={setWhatsAppModalData}
        onOpenQuickVisit={setQuickVisitCustomer}
        onCleanupAuto={handleCleanupAutoInterests}
        cleaningAuto={cleaningAuto}
        isMobile={false}
      />

      {/* ── 📡 CANLI MÜŞTERİ AYAK İZİ (Müşteri Form Doldurmasa Bile Portalda Ne İnceledi?) ── */}
      {liveFootprints.length > 0 && (
        <div className="card glass-card mt-6" style={{
          border: '1px solid rgba(56, 189, 248, 0.35)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(12, 32, 62, 0.88) 100%)'
        }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 10px #10b981', display: 'inline-block'
              }} />
              <h3 className="card-title" style={{ margin: 0, color: '#f8fafc', fontSize: '0.96rem' }}>
                📡 Canlı Müşteri Ayak İzi (Portalda Ne İncelediler?)
              </h3>
              <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                Son {liveFootprints.length} Sinyal
              </span>
              <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
                • Otomatik Canlı (20 sn)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={refreshLiveFootprints}
                style={{
                  background: 'rgba(16, 185, 129, 0.14)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Şimdi Yenile"
              >
                🔄 Şimdi Yenile
              </button>
              <button
                type="button"
                onClick={() => navigate('/intent-radar')}
                style={{
                  background: 'rgba(56, 189, 248, 0.14)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                Tüm Niyet Radarını Aç <FiArrowRight size={13} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '10px', marginTop: '8px' }}>
            {liveFootprints.slice(0, 6).map((fp, idx) => (
              <div
                key={fp.id || idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: isFreshFootprint(fp.created_at) ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderLeft: isFreshFootprint(fp.created_at) ? '3px solid #10b981' : '3px solid #38bdf8',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <div
                      onClick={() => fp.matched_customer_id ? navigate(`/customers/${fp.matched_customer_id}`) : navigate('/intent-radar')}
                      style={{ fontWeight: 800, fontSize: '0.86rem', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
                    >
                      <span>{fp.company_name || 'Portal Ziyaretçisi'}</span>
                      {isFreshFootprint(fp.created_at) && (
                        <span style={{ background: '#10b981', color: '#052e16', fontSize: '0.64rem', fontWeight: 900, padding: '1px 6px', borderRadius: 4 }}>
                          🔥 YENİ
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {fp.created_at ? new Date(fp.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Canlı'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 700, marginTop: '3px' }}>
                    🚛 {fp.target_model || '2026 Katalog İncelemesi'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {fp.search_query?.replace(/^\[|\]$/g, '') || fp.target_campaign || 'VIP Portal Ziyareti'}
                    {fp.target_campaign ? ` • ${fp.target_campaign}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {fp.phone && (
                    <a
                      href={`tel:${fp.phone}`}
                      style={{
                        padding: '4px 9px', borderRadius: '6px', background: '#0284c7', color: '#fff',
                        fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4
                      }}
                    >
                      <FiPhone size={11} /> Ara
                    </a>
                  )}
                  {fp.phone && (
                    <button
                      type="button"
                      onClick={() => sendCustomerVipPortalWhatsApp({
                        id: fp.matched_customer_id,
                        company_name: fp.company_name,
                        phone: fp.phone,
                        city: fp.city
                      })}
                      style={{
                        padding: '4px 9px', borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.45)',
                        color: '#34d399', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                      }}
                    >
                      <FiSend size={11} /> VIP Link
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/proforma/quick', {
                      state: {
                        customer: {
                          id: fp.matched_customer_id,
                          company_name: fp.company_name,
                          phone: fp.phone,
                          city: fp.city
                        }
                      }
                    })}
                    style={{
                      padding: '4px 9px', borderRadius: '6px',
                      background: 'rgba(59, 130, 246, 0.16)', border: '1px solid rgba(59, 130, 246, 0.35)',
                      color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <FiFileText size={11} /> Teklif
                  </button>
                  {fp.matched_customer_id && (
                    <button
                      type="button"
                      onClick={() => navigate(`/customers/${fp.matched_customer_id}`)}
                      style={{
                        marginLeft: 'auto', padding: '4px 8px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#cbd5e1', fontSize: '0.7rem', cursor: 'pointer'
                      }}
                    >
                      Kartı Aç
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GÜNLÜK AKSİYON LİSTELERİ (Bugün Aranacak, Yeni Keşifler, Yüksek Potansiyel) ── */}
      <div className="dashboard-row-3 mt-6">
        {/* Bugün Aranacaklar */}
        <div className="card glass-card">
          <div className="card-header">
            <h3 className="card-title"><FiPhone style={{ marginRight: 8 }} /> Bugün Aranacak</h3>
            <span className="badge badge-purple">{todayCalls.length}</span>
          </div>
          {todayCalls.length > 0 ? todayCalls.slice(0, 5).map((c, i) => (
            <div key={i} className="list-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/customers/${c.customer_id}`)}>
                <div className="list-avatar" style={{ background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)' }}>{c.customer_name?.charAt(0)}</div>
                <div className="list-item-content">
                  <div className="list-item-title">{c.customer_name}</div>
                  <div className="list-item-subtitle">{c.city} · {c.phone || 'Tel yok'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {c.phone && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendCustomerVipPortalWhatsApp({
                          id: c.customer_id,
                          company_name: c.customer_name,
                          phone: c.phone,
                          city: c.city
                        }, { onSuccess: loadDashboard });
                      }}
                      className="btn btn-sm"
                      style={{ padding: '3px 7px', fontSize: '0.70rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700 }}
                      title="Sektöre Özel VIP Portal Linki Gönder"
                    >
                      <FiSend size={11} /> VIP Link
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhatsAppModalData({
                          customer: {
                            id: c.customer_id,
                            company_name: c.customer_name,
                            phone: c.phone,
                            city: c.city
                          },
                          vehicleTitle: '',
                          interestId: null,
                          defaultStatus: 'offer_given'
                        });
                      }}
                      className="btn btn-sm btn-success"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', background: '#25d366', borderColor: '#25d366', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      title="WhatsApp & Kayıt"
                    >
                      <FiMessageSquare size={12} /> WA
                    </button>
                  </>
                )}
                <span className="badge badge-amber">{c.status}</span>
              </div>
            </div>
          )) : <div className="empty-state"><p>Bugün takip yok</p></div>}
        </div>

        {/* Yeni Keşifler */}
        <div className="card glass-card">
          <div className="card-header">
            <h3 className="card-title"><FiSearch style={{ marginRight: 8 }} /> Yeni Keşifler</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/discovery')}>Tümü →</button>
          </div>
          {discoveries.length > 0 ? discoveries.slice(0, 5).map((c, i) => (
            <div key={i} className="list-item" onClick={() => navigate('/discovery')}>
              <div className="list-avatar" style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue-light)' }}>{c.company_name?.charAt(0)}</div>
              <div className="list-item-content">
                <div className="list-item-title">{c.company_name}</div>
                <div className="list-item-subtitle">{c.city}{c.district ? ` / ${c.district}` : ''} · {c.sector || ''}</div>
              </div>
              {c.score != null && (
                <span className={`badge ${c.score >= 55 ? 'badge-green' : c.score >= 35 ? 'badge-amber' : 'badge-red'}`}>{c.score}</span>
              )}
            </div>
          )) : <div className="empty-state"><p>Henüz keşif yapılmadı</p></div>}
        </div>

        {/* Yüksek Potansiyel */}
        <div className="card glass-card">
          <div className="card-header">
            <h3 className="card-title"><FiStar style={{ marginRight: 8 }} /> Yüksek Potansiyel</h3>
          </div>
          {highPotential.length > 0 ? highPotential.slice(0, 5).map((c, i) => (
            <div key={i} className="list-item">
              <div className="list-avatar" style={{ background: 'var(--accent-green-glow)', color: 'var(--accent-green)' }}>{c.company_name?.charAt(0)}</div>
              <div className="list-item-content">
                <div className="list-item-title">{c.company_name}</div>
                <div className="list-item-subtitle">{c.city} · {c.activity}</div>
              </div>
              <span className="badge badge-green">{c.score}</span>
            </div>
          )) : <div className="empty-state"><p>Zenginleştirme yapılmamış</p></div>}
        </div>
      </div>

      {/* ── HATIRLATICILAR & FİLO YENİLEME FIRSATLARI ── */}
      <div className="dashboard-row-2" style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Yaklaşan Bilgilendirmeler */}
        <div className="card glass-card">
          <div className="card-header">
            <h3 className="card-title">
              <FiBell style={{ marginRight: 8, color: 'var(--accent-purple)' }} /> Yaklaşan Müşteri Bilgilendirmeleri (14 Gün)
            </h3>
            <span className="badge badge-purple">{upcomingReminders.length} Bildirim</span>
          </div>
          {upcomingReminders.length > 0 ? (
            <div className="custom-table-wrapper" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {upcomingReminders.slice(0, 6).map((r, i) => (
                <div key={i} className="list-item" onClick={() => navigate(`/customers/${r.customer_id}`)} style={{ cursor: 'pointer' }}>
                  <div className="list-avatar" style={{ background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)' }}>
                    <FiCalendar size={16} />
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-title">{r.company_name}</div>
                    <div className="list-item-subtitle">{r.title} · <span style={{ color: 'var(--accent-blue-light)' }}>{r.reminder_date}</span></div>
                  </div>
                  {r.is_overdue ? (
                    <span className="badge badge-red">Gecikti</span>
                  ) : (
                    <span className="badge badge-purple">Yakında</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>Önümüzdeki 14 gün için planlanan hatırlatıcı yok.</p></div>
          )}
        </div>

        {/* Filo Yenileme Fırsatları */}
        <div className="card glass-card">
          <div className="card-header">
            <h3 className="card-title">
              <FiRefreshCw style={{ marginRight: 8, color: 'var(--accent-amber)' }} /> Filo Yenileme Fırsatları (≥3 Yaş)
            </h3>
            <span className="badge badge-amber">{renewalOpportunities.length} Araç</span>
          </div>
          {renewalOpportunities.length > 0 ? (
            <div className="custom-table-wrapper" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {renewalOpportunities.slice(0, 6).map((v, i) => (
                <div key={i} className="list-item" onClick={() => navigate(`/customers/${v.customer_id}`)} style={{ cursor: 'pointer' }}>
                  <div className="list-avatar" style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}>
                    <FiTruck size={16} />
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-title">{v.company_name} <span className="text-xs text-muted">({v.city || '—'})</span></div>
                    <div className="list-item-subtitle">{v.brand} {v.model} {v.plate_number ? `[${v.plate_number}]` : ''} · Model: {v.model_year}</div>
                  </div>
                  <span className="badge badge-amber">{v.vehicle_age} Yaşında</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>Yenileme kriterine uyan araç kaydı bulunmuyor.</p></div>
          )}
        </div>
      </div>

      {/* Filo Yaşam Döngüsü & Yenileme Radarı */}
      <FleetRenewalRadarWidget onOpenWhatsApp={(item) => setWhatsAppModalData(item)} />

      {/* ── AÇILIR/KAPANIR BÖLGE İSTATİSTİKLERİ & ANALİZ GRAFİKLERİ ── */}
      <div className="mt-6" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setShowAnalyticsCharts(prev => !prev)}
          style={{
            width: '100%',
            background: showAnalyticsCharts
              ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.65) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'rgba(15, 23, 42, 0.78)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '12px',
            padding: '14px 20px',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiBarChart2 size={18} color="#38bdf8" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                Bölge İstatistikleri, Araç Pipeline & Analiz Grafikleri
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Şehir/sektör dağılımı, araç bazlı talep grafikleri ve bölge haritasını incelemek için tıklayın
              </div>
            </div>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 800
          }}>
            {showAnalyticsCharts ? (
              <><FiChevronUp size={15} /> Grafikleri Gizle</>
            ) : (
              <><FiChevronDown size={15} /> Grafikleri Göster</>
            )}
          </span>
        </button>

        {showAnalyticsCharts && (
          <div style={{ marginTop: '1rem' }}>
            {/* ── ARAÇ BAZLI SATIŞ PIPELINE (Canlı Talep Dağılımı) ── */}
            {vehiclePipeline && (
              <div className="card glass-card" style={{ border: '1px solid rgba(139, 92, 246, 0.25)', marginBottom: '1.25rem' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiTruck style={{ color: '#c084fc' }} size={18} />
                    <h3 className="card-title" style={{ margin: 0 }}>ARAÇ BAZLI SATIŞ PIPELINE</h3>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Toplam Aktif Talep: <strong style={{ color: '#f8fafc' }}>{vehiclePipeline.total_demand_count} Müşteri</strong>
                  </span>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {Object.entries(vehiclePipeline.group_counts || {}).map(([grp, cnt]) => (
                      <div key={grp} style={{
                        background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10
                      }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{grp}</span>
                        <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 800 }}>
                          {cnt} müşteri
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
                    {vehiclePipeline.breakdown?.slice(0, 8).map((b, i) => (
                      <div key={i} style={{
                        background: 'var(--bg-input)', padding: '0.85rem 1rem', borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: 6
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                            {b.vehicle_group} {b.model_or_type}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa' }}>
                            {b.customer_count} müşteri ({b.total_vehicle_count} adet)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, b.percentage * 2)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                            borderRadius: 3
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline + Trend Row */}
            <div className="dashboard-row-2">
              <div className="card glass-card">
                <div className="card-header">
                  <h3 className="card-title"><FiTrendingUp style={{ marginRight: 8 }} /> Satış Pipeline</h3>
                  <span className="text-xs text-muted">Toplam: {Object.values(summary?.pipeline || {}).reduce((a, b) => a + b, 0)}</span>
                </div>
                <PipelineFunnel data={summary?.pipeline || {}} />
              </div>
              <div className="card glass-card">
                <div className="card-header">
                  <h3 className="card-title">Aylık Müşteri Trendi</h3>
                </div>
                {analytics && <TrendAreaChart data={analytics.monthly_trend} />}
              </div>
            </div>

            {/* Charts Row */}
            <div className="dashboard-row-3">
              <div className="card glass-card">
                <div className="card-header">
                  <h3 className="card-title">Şehir Dağılımı</h3>
                </div>
                {analytics && (
                  <>
                    <CityDonutChart data={analytics.city_distribution} />
                    <ChartLegend data={analytics.city_distribution} />
                  </>
                )}
              </div>
              <div className="card glass-card">
                <div className="card-header">
                  <h3 className="card-title">Sektör Dağılımı</h3>
                </div>
                {analytics && <SectorBarChart data={analytics.sector_breakdown} />}
              </div>
              <div className="card glass-card">
                <div className="card-header">
                  <h3 className="card-title"><FiMapPin style={{ marginRight: 8 }} /> Bölge Haritası</h3>
                </div>
                <RegionMap data={geoData} />
              </div>
            </div>

            {/* Segment + Source Row */}
            {analytics && (
              <div className="dashboard-row-2">
                <div className="card glass-card">
                  <div className="card-header"><h3 className="card-title">Segment Dağılımı</h3></div>
                  <div className="flex items-center" style={{ gap: '2rem' }}>
                    <SegmentChart data={analytics.segment_distribution} />
                    <ChartLegend data={analytics.segment_distribution} colors={{ A: '#10b981', B: '#2b7de9', C: '#f59e0b', D: '#ef4444', Belirlenmedi: '#cbd5e1' }} />
                  </div>
                </div>
                <div className="card glass-card">
                  <div className="card-header"><h3 className="card-title">Potansiyel Dağılımı</h3></div>
                  <div className="flex items-center" style={{ gap: '2rem' }}>
                    <SegmentChart data={analytics.potential_distribution} />
                    <ChartLegend data={analytics.potential_distribution} colors={{ very_high: '#10b981', high: '#2b7de9', medium: '#f59e0b', low: '#ef4444', Belirlenmedi: '#cbd5e1' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Teklif & Görüşme Modalı (Desktop) */}
      <WhatsAppActionModal
        isOpen={!!whatsAppModalData}
        onClose={() => setWhatsAppModalData(null)}
        customer={whatsAppModalData?.customer}
        vehicleTitle={whatsAppModalData?.vehicleTitle}
        interestId={whatsAppModalData?.interestId}
        defaultStatus={whatsAppModalData?.defaultStatus || 'offer_given'}
        onSuccess={() => {
          loadDashboard();
        }}
      />

      {/* Hızlı Ziyaret Modalı (Desktop) */}
      <QuickVisitModal
        isOpen={quickVisitModalOpen || !!quickVisitCustomer}
        onClose={() => {
          setQuickVisitModalOpen(false);
          setQuickVisitCustomer(null);
        }}
        initialCustomerId={quickVisitCustomer?.id}
        initialCompanyName={quickVisitCustomer?.company_name}
        onSuccess={() => {
          loadDashboard();
        }}
      />

      {/* GPS Radar Modalı (Desktop) */}
      <NearbyRadarModal
        isOpen={radarOpen}
        onClose={() => setRadarOpen(false)}
        onStartVisit={(cust) => {
          setRadarOpen(false);
          setQuickVisitCustomer(cust);
          setQuickVisitModalOpen(true);
        }}
      />
    </div>
  );
}

