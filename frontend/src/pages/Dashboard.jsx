import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, crmApi, vehiclesApi, workbenchApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import useDeviceDetect from '../hooks/useDeviceDetect';
import useGeolocation from '../hooks/useGeolocation';
import { FiUsers, FiStar, FiSearch, FiPhone, FiBell, FiFolder, FiTrendingUp, FiMapPin, FiCamera, FiMap, FiTruck, FiRefreshCw, FiMessageSquare, FiCalendar, FiArrowRight, FiZap, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { CityDonutChart, SectorBarChart, TrendAreaChart, PipelineFunnel, SegmentChart, ChartLegend, RegionMap } from '../components/Charts/AnalyticsCharts';
import toast from 'react-hot-toast';
import { getWhatsAppUrl } from '../utils/whatsapp';
import WhatsAppActionModal from '../components/CRM/WhatsAppActionModal';
import FieldAssistantHero from '../components/CRM/FieldAssistantHero';
import TodayOpportunitiesCard from '../components/CRM/TodayOpportunitiesCard';
import QuickVisitModal from '../components/CRM/QuickVisitModal';
import NearbyRadarModal from '../components/CRM/NearbyRadarModal';

const STAT_CARDS = [
  { key: 'total_customers', label: 'Toplam Müşteri', icon: FiUsers, gradient: 'linear-gradient(135deg, #1e3a5f, #2b7de9)' },
  { key: 'high_potential_customers', label: 'Yüksek Potansiyel', icon: FiStar, gradient: 'linear-gradient(135deg, #064e3b, #10b981)' },
  { key: 'new_discoveries', label: 'Yeni Keşifler', icon: FiSearch, gradient: 'linear-gradient(135deg, #78350f, #f59e0b)' },
  { key: 'today_follow_ups', label: 'Bugün Aranacak', icon: FiPhone, gradient: 'linear-gradient(135deg, #3b0764, #8b5cf6)' },
  { key: 'unread_notifications', label: 'Okunmamış Bildirim', icon: FiBell, gradient: 'linear-gradient(135deg, #7f1d1d, #ef4444)' },
  { key: 'active_campaigns', label: 'Aktif Kampanya', icon: FiFolder, gradient: 'linear-gradient(135deg, #164e63, #06b6d4)' },
];


export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [geoData, setGeoData] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  const [highPotential, setHighPotential] = useState([]);
  const [todayCalls, setTodayCalls] = useState([]);

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

  useEffect(() => {
    loadDashboard();
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
    let firstName = user?.full_name?.split(' ')[0] || 'Satışçı';
    if (firstName === 'Satış' || firstName === 'Satis') {
      firstName = 'King';
    }
    
    return (
      <div className="mobile-dashboard animate-in">
        {/* ⚡ Saha Asistanı Hero (Mobil) */}
        <FieldAssistantHero
          stats={fieldAssistant?.counts || {}}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          onOpenVisitModal={() => setQuickVisitModalOpen(true)}
          onOpenRadar={() => setRadarOpen(true)}
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
        />
      </div>
    );
  }

  // ── DESKTOP DASHBOARD (Mevcut Görünüm) ─────────────────────────────
  return (
    <div className="animate-in">
      {/* ⚡ SAHA SATIŞ ASİSTANI (Desktop Hero) */}
      <FieldAssistantHero
        stats={fieldAssistant?.counts || {}}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        onOpenVisitModal={() => setQuickVisitModalOpen(true)}
        onOpenRadar={() => setRadarOpen(true)}
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

      {/* ── ARAÇ BAZLI SATIŞ PIPELINE (Canlı Talep Dağılımı) ── */}
      {vehiclePipeline && (
        <div className="card glass-card mt-6" style={{ border: '1px solid rgba(139, 92, 246, 0.25)' }}>
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
            {/* Group Summary Badges */}
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

            {/* Detailed Model Breakdown Bars */}
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
      <div className="dashboard-row-2 mt-6">
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
              <ChartLegend data={analytics.segment_distribution} colors={{ A: '#10b981', B: '#2b7de9', C: '#f59e0b', D: '#ef4444' }} />
            </div>
          </div>
          <div className="card glass-card">
            <div className="card-header"><h3 className="card-title">Potansiyel Dağılımı</h3></div>
            <div className="flex items-center" style={{ gap: '2rem' }}>
              <SegmentChart data={analytics.potential_distribution} />
              <ChartLegend data={analytics.potential_distribution} colors={{ very_high: '#10b981', high: '#2b7de9', medium: '#f59e0b', low: '#ef4444' }} />
            </div>
          </div>
        </div>
      )}

      {/* Fleet Renewal & Upcoming Reminders Row */}
      <div className="dashboard-row-2" style={{ marginBottom: '1.5rem' }}>
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
      </div>

      {/* Action Lists Row */}
      <div className="dashboard-row-3">
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
                    style={{ padding: '3px 8px', fontSize: '0.72rem', background: '#25d366', borderColor: '#25d366', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    title="WhatsApp & Kayıt"
                  >
                    <FiMessageSquare size={12} /> WA
                  </button>
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
      />
    </div>
  );
}

