import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, crmApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import useDeviceDetect from '../hooks/useDeviceDetect';
import useGeolocation from '../hooks/useGeolocation';
import { FiUsers, FiStar, FiSearch, FiPhone, FiBell, FiFolder, FiTrendingUp, FiMapPin, FiCamera, FiMap } from 'react-icons/fi';
import { CityDonutChart, SectorBarChart, TrendAreaChart, PipelineFunnel, SegmentChart, ChartLegend, RegionMap } from '../components/Charts/AnalyticsCharts';
import toast from 'react-hot-toast';

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
  
  // GPS ve Yakınım State'leri
  const { location, error: gpsError, loading: gpsLoading } = useGeolocation();
  const [nearbyA, setNearbyA] = useState(0);
  const [nearbyB, setNearbyB] = useState(0);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [nearbyList, setNearbyList] = useState([]);

  const { user } = useAuth();
  const isMobile = useDeviceDetect();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardApi.getSummary().then(r => setSummary(r.data)),
      dashboardApi.getAnalytics().then(r => setAnalytics(r.data)),
      dashboardApi.getGeoData().then(r => setGeoData(r.data)),
      dashboardApi.getNewDiscoveries().then(r => setDiscoveries(r.data)),
      dashboardApi.getHighPotential().then(r => setHighPotential(r.data)),
      dashboardApi.getTodayCalls().then(r => setTodayCalls(r.data)),
    ]).catch(() => {});
  }, []);

  // Konum alındığında yakındaki müşterileri dinamik sorgula
  useEffect(() => {
    if (location) {
      crmApi.getNearbyCustomers({
        lat: location.latitude,
        lon: location.longitude,
        radius: 5000 // 5 km yarıçap
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

  if (!summary) return <div className="dashboard-loading"><div className="loading-pulse" /><span>Dashboard yükleniyor...</span></div>;

  // ── MOBILE DASHBOARD (Saha Satış Arayüzü) ──────────────────────────
  if (isMobile) {
    let firstName = user?.full_name?.split(' ')[0] || 'Satışçı';
    if (firstName === 'Satış' || firstName === 'Satis') {
      firstName = 'King';
    }
    
    return (
      <div className="mobile-dashboard animate-in">
        <header className="mobile-dashboard-header">
          <div className="welcome-text">
            <h2>Merhaba, {firstName} 👋</h2>
            <p className="app-subtitle">Bugün harika bir satış günü!</p>
          </div>
          <div className="location-indicator">
            <FiMapPin size={14} className={gpsLoading ? "pulse-icon" : ""} />
            <span>
              {gpsLoading 
                ? "Konum alınıyor..." 
                : location 
                  ? `Samsun (Konum Aktif)` 
                  : "Konum Servisi Devre Dışı"}
            </span>
          </div>
        </header>

        {/* Bugün Widget'ı */}
        <section className="mobile-section">
          <div className="section-title">BUGÜNÜN ÖZETİ</div>
          <div className="mobile-today-grid">
            <div className="today-stat-card" onClick={() => navigate('/sales')}>
              <span className="stat-num">{todayCalls.length}</span>
              <span className="stat-lbl">Takip Sırada</span>
            </div>
            <div className="today-stat-card" onClick={() => navigate('/pipeline')}>
              <span className="stat-num">{summary.pipeline?.proposal || 0}</span>
              <span className="stat-lbl">Açık Teklif</span>
            </div>
            <div className="today-stat-card">
              <span className="stat-num">{summary.pipeline?.negotiation || 0}</span>
              <span className="stat-lbl">Pazarlıkta</span>
            </div>
          </div>
        </section>

        {/* Hızlı İşlemler */}
        <section className="mobile-section">
          <div className="section-title">HIZLI İŞLEMLER</div>
          <div className="quick-actions-grid">
            <button className="quick-btn start-visit" onClick={() => toast.success('Ziyaret başlatılıyor... GPS konumu alınıyor.')}>
              <div className="quick-btn-icon"><FiMapPin size={20} /></div>
              <span>Ziyaret Başlat</span>
            </button>
            <button className="quick-btn find-companies" onClick={() => navigate('/discovery')}>
              <div className="quick-btn-icon"><FiSearch size={20} /></div>
              <span>Firma Bul</span>
            </button>
            <button className="quick-btn scan-card" onClick={() => navigate('/scan-card')}>
              <div className="quick-btn-icon"><FiCamera size={20} /></div>
              <span>Kartvizit Tara</span>
            </button>

            <button className="quick-btn view-map" onClick={() => navigate('/map')}>
              <div className="quick-btn-icon"><FiMap size={20} /></div>
              <span>Harita</span>
            </button>
          </div>
        </section>

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
              <div key={i} className="mobile-list-item" onClick={() => navigate(`/customers/${c.customer_id}`)}>
                <div className="item-avatar">{c.customer_name?.charAt(0)}</div>
                <div className="item-details">
                  <div className="item-name">{c.customer_name}</div>
                  <div className="item-sub">{c.city} · {c.phone || 'Telefon Yok'}</div>
                </div>
                <span className="badge badge-amber">{c.status}</span>
              </div>
            )) : (
              <div className="mobile-empty">
                <p>Bugün için planlanmış takip bulunmuyor.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ── DESKTOP DASHBOARD (Mevcut Görünüm) ─────────────────────────────
  return (
    <div className="animate-in">
      {/* KPI Stats */}
      <div className="kpi-grid">
        {STAT_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="kpi-card" style={{ animationDelay: `${idx * 60}ms` }}>
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

      {/* Pipeline + Trend Row */}
      <div className="dashboard-row-2">
        <div className="card glass-card">
          <div className="card-header">
            <h3 className="card-title"><FiTrendingUp style={{ marginRight: 8 }} /> Satış Pipeline</h3>
            <span className="text-xs text-muted">Toplam: {Object.values(summary.pipeline).reduce((a, b) => a + b, 0)}</span>
          </div>
          <PipelineFunnel data={summary.pipeline} />
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

      {/* Action Lists Row */}
      <div className="dashboard-row-3">
        {/* Bugün Aranacaklar */}
        <div className="card glass-card">
          <div className="card-header">
            <h3 className="card-title"><FiPhone style={{ marginRight: 8 }} /> Bugün Aranacak</h3>
            <span className="badge badge-purple">{todayCalls.length}</span>
          </div>
          {todayCalls.length > 0 ? todayCalls.slice(0, 5).map((c, i) => (
            <div key={i} className="list-item" onClick={() => navigate(`/customers/${c.customer_id}`)}>
              <div className="list-avatar" style={{ background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)' }}>{c.customer_name?.charAt(0)}</div>
              <div className="list-item-content">
                <div className="list-item-title">{c.customer_name}</div>
                <div className="list-item-subtitle">{c.city} · {c.phone || 'Tel yok'}</div>
              </div>
              <span className="badge badge-amber">{c.status}</span>
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
    </div>
  );
}

