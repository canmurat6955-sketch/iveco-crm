import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, crmApi } from '../../api/client';
import useGeolocation from '../../hooks/useGeolocation';
import { useVisit } from '../../contexts/VisitContext';
import { FiMapPin, FiCalendar, FiPlus, FiTrash2, FiCheckCircle, FiPlay, FiMap, FiChevronRight, FiList, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RoutePlanner() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sekme yönetimi: 'plans' veya 'along'
  const [activeTab, setActiveTab] = useState('plans');

  // Rota Yaratma Formu
  const [showCreate, setShowCreate] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [optimizedStops, setOptimizedStops] = useState([]);
  const [optimizing, setOptimizing] = useState(false);

  // Güzergah Boyunca Arama State'leri
  const [startCity, setStartCity] = useState('Samsun');
  const [endCity, setEndCity] = useState('Çorum');
  const [alongThreshold, setAlongThreshold] = useState(3000); // 3 km yakınlık
  const [alongResults, setAlongResults] = useState([]);
  const [searchingAlong, setSearchingAlong] = useState(false);

  const { location, getLocation, loading: gpsLoading } = useGeolocation();
  const { startVisit } = useVisit();
  const navigate = useNavigate();

  const CITY_COORDS = {
    "Samsun": { lat: 41.2582, lon: 36.4385 },
    "Çorum": { lat: 40.5284, lon: 34.9080 },
    "Sinop": { lat: 41.9892, lon: 35.1950 },
    "Ordu": { lat: 40.9862, lon: 37.8797 },
    "Amasya": { lat: 40.6531, lon: 35.8331 },
    "Tokat": { lat: 40.3160, lon: 36.5540 },
    "Giresun": { lat: 40.9169, lon: 38.3886 }
  };


  useEffect(() => {
    fetchRoutes();
    // Arama yapmak için tüm müşterileri çek (Bunun yerine fuzzy/arama kutusu da yapabiliriz ama hızlıca select için listeliyoruz)
    crmApi.getCustomers({ limit: 100 })
      .then(res => setAllCustomers(res.data.items || []))
      .catch(() => {});
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await salesApi.getRoutePlans();
      setRoutes(res.data || []);
      if (res.data && res.data.length > 0 && !selectedRoute) {
        setSelectedRoute(res.data[0]);
      }
    } catch (err) {
      toast.error("Rotalar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (selectedCustomerIds.length === 0) {
      toast.error("Lütfen rotaya eklemek için en az bir müşteri seçin.");
      return;
    }
    
    // GPS konumunu al
    getLocation();
    
    const startLat = location?.latitude || 41.2582; // Samsun OSB fallback
    const startLon = location?.longitude || 36.4385;

    setOptimizing(true);
    toast.loading("Google ve local algoritmalar ile sürüş rotası optimize ediliyor...", { id: 'opt_load' });

    try {
      const res = await salesApi.optimizeRoute({
        start_latitude: startLat,
        start_longitude: startLon,
        customer_ids: selectedCustomerIds
      });
      
      setOptimizedStops(res.data.optimized_stops || []);
      toast.success("Rota başarıyla optimize edildi! En yakın noktalar sıraya dizildi.", { id: 'opt_load' });
    } catch (err) {
      toast.error("Rota optimizasyonu başarısız oldu.", { id: 'opt_load' });
    } finally {
      setOptimizing(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!routeName.trim()) {
      toast.error("Lütfen rota adı girin.");
      return;
    }
    if (optimizedStops.length === 0) {
      toast.error("Lütfen önce rotayı optimize edin.");
      return;
    }

    try {
      const stops = optimizedStops.map(s => ({
        customer_id: s.customer_id,
        sequence_order: s.sequence_order
      }));

      const res = await salesApi.createRoutePlan({
        name: routeName,
        date: routeDate,
        stops
      });

      toast.success("Rota planı başarıyla kaydedildi! 🗺️");
      setShowCreate(false);
      
      // Formu temizle
      setRouteName('');
      setSelectedCustomerIds([]);
      setOptimizedStops([]);
      
      fetchRoutes();
      setSelectedRoute(res.data);
    } catch (err) {
      toast.error("Rota kaydedilemedi.");
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm("Bu rota planını silmek istediğinize emin misiniz?")) return;
    try {
      await salesApi.deleteRoutePlan(id);
      toast.success("Rota silindi.");
      setRoutes(routes.filter(r => r.id !== id));
      if (selectedRoute?.id === id) {
        setSelectedRoute(null);
      }
    } catch (err) {
      toast.error("Rota silinemedi.");
    }
  };

  const handleToggleVisited = async (stop) => {
    try {
      const nextStatus = !stop.visited;
      await salesApi.markStopVisited(selectedRoute.id, stop.id, nextStatus);
      
      // State'i güncelle
      const updatedStops = selectedRoute.stops.map(s => 
        s.id === stop.id ? { ...s, visited: nextStatus, visited_at: nextStatus ? new Date().toISOString() : null } : s
      );
      setSelectedRoute({
        ...selectedRoute,
        stops: updatedStops
      });
      
      toast.success(nextStatus ? "Ziyaret edildi olarak işaretlendi!" : "Ziyaret geri alındı.");
    } catch (err) {
      toast.error("Güncelleme başarısız.");
    }
  };

  const handleSearchAlong = async () => {
    if (!startCity || !endCity) {
      toast.error("Lütfen başlangıç ve bitiş şehirlerini seçin.");
      return;
    }
    if (startCity === endCity) {
      toast.error("Başlangıç ve bitiş şehirleri farklı olmalıdır.");
      return;
    }

    const start = CITY_COORDS[startCity];
    const end = CITY_COORDS[endCity];

    setSearchingAlong(true);
    toast.loading("Güzergah boyunca müşteriler tespit ediliyor...", { id: 'search_along_load' });

    try {
      const res = await crmApi.searchRouteAlong({
        start_lat: start.lat,
        start_lon: start.lon,
        end_lat: end.lat,
        end_lon: end.lon,
        threshold: alongThreshold
      });
      setAlongResults(res.data || []);
      toast.success(`${res.data.length} müşteri güzergah üzerinde bulundu!`, { id: 'search_along_load' });
    } catch (err) {
      toast.error("Güzergah araması başarısız.", { id: 'search_along_load' });
    } finally {
      setSearchingAlong(false);
    }
  };

  const handleApplyAlongToRoute = () => {
    if (alongResults.length === 0) return;
    const ids = alongResults.map(r => r.id);
    setSelectedCustomerIds(ids);
    setRouteName(`${startCity} - ${endCity} Güzergahı`);
    setActiveTab('plans');
    setShowCreate(true);
    toast.success("Güzergahtaki müşteriler yeni rota duraklarına eklendi. Şimdi sıralamayı optimize edebilirsiniz!");
  };



  const getGoogleMapsDir = (stop) => {
    if (!stop.latitude || !stop.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.company_name)}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
  };

  const handleStartVisit = (stop) => {
    startVisit(stop.customer_id, stop.company_name);
  };

  const toggleCustomerSelect = (id) => {
    if (selectedCustomerIds.includes(id)) {
      setSelectedCustomerIds(selectedCustomerIds.filter(cid => cid !== id));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, id]);
    }
    // Optimizasyonu sıfırla
    setOptimizedStops([]);
  };

  if (loading && routes.length === 0) {
    return <div className="dashboard-loading"><div className="loading-pulse" /><span>Rotalar yükleniyor...</span></div>;
  }

  return (
    <div className="mobile-page animate-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ margin: 0 }}>📍 Rota Yönetimi</h2>
        {activeTab === 'plans' && (
          <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => setShowCreate(true)}>
            <FiPlus size={16} /> Yeni Rota
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
        <button 
          style={{ flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 600, border: 'none', background: activeTab === 'plans' ? 'rgba(43, 125, 233, 0.15)' : 'none', color: activeTab === 'plans' ? 'var(--accent-blue-light)' : 'var(--text-secondary)', borderRadius: 6, cursor: 'pointer' }}
          onClick={() => setActiveTab('plans')}
        >
          🗺️ Rota Planları
        </button>
        <button 
          style={{ flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 600, border: 'none', background: activeTab === 'along' ? 'rgba(43, 125, 233, 0.15)' : 'none', color: activeTab === 'along' ? 'var(--accent-blue-light)' : 'var(--text-secondary)', borderRadius: 6, cursor: 'pointer' }}
          onClick={() => setActiveTab('along')}
        >
          🧭 Güzergah Arama
        </button>
      </div>

      {activeTab === 'plans' ? (
        <>
          {showCreate ? (

        <div className="card mb-4">
          <h3 className="card-title">🗺️ Yeni Rota Planı</h3>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Rota Adı / Başlığı</label>
              <input 
                className="form-input" 
                value={routeName} 
                onChange={e => setRouteName(e.target.value)} 
                placeholder="Örn: Samsun OSB Ziyaret Grubu" 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Ziyaret Tarihi</label>
              <input 
                type="date" 
                className="form-input" 
                value={routeDate} 
                onChange={e => setRouteDate(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duraklar Seçin (CRM Müşterileri)</label>
              <div className="customer-selection-list" style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8 }}>
                {allCustomers.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedCustomerIds.includes(c.id)} 
                      onChange={() => toggleCustomerSelect(c.id)}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.company_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.city} - {c.segment} Segmenti</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                type="button" 
                className="btn btn-secondary w-full" 
                onClick={() => {
                  setOptimizedStops([]);
                  setSelectedCustomerIds([]);
                  setShowCreate(false);
                }}
              >
                İptal
              </button>
              <button 
                type="button" 
                className="btn btn-primary w-full" 
                onClick={handleOptimize}
                disabled={optimizing || selectedCustomerIds.length === 0}
              >
                {optimizing ? 'Hesaplanıyor...' : 'Sıralamayı Optimize Et'}
              </button>
            </div>

            {optimizedStops.length > 0 && (
              <div className="mt-3 p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--accent-green)' }}>✓ Optimize Edilen Sıralama</h4>
                <ol style={{ fontSize: 12, paddingLeft: 16 }}>
                  {optimizedStops.map((stop, i) => {
                    const cust = allCustomers.find(c => c.id === stop.customer_id);
                    return (
                      <li key={i} style={{ marginBottom: 4 }}>
                        <strong>{cust?.company_name}</strong> 
                        <span style={{ color: 'var(--text-muted)' }}> (+{Math.round(stop.distance_from_previous)}m)</span>
                      </li>
                    );
                  })}
                </ol>
                <button type="button" className="btn btn-success w-full mt-3" onClick={handleSaveRoute}>
                  Rotayı Kaydet ve Başlat
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Rota Listesi / Seçici */}
      {routes.length > 0 ? (
        <div className="form-group mb-4">
          <label className="form-label">Aktif Rota Seçin</label>
          <select 
            className="form-select" 
            value={selectedRoute?.id || ''} 
            onChange={e => setSelectedRoute(routes.find(r => r.id === parseInt(e.target.value)))}
          >
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.date})</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mobile-empty card">
          <p>Henüz planlanmış bir rota bulunmuyor.</p>
          <button className="btn btn-primary btn-sm mt-3" onClick={() => setShowCreate(true)}>İlk Rotamı Oluştur</button>
        </div>
      )}

      {/* Seçili Rota Detayı */}
      {selectedRoute ? (
        <div className="card animate-in">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedRoute.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>📅 Plan Tarihi: {selectedRoute.date}</p>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRoute(selectedRoute.id)}>
              <FiTrash2 size={14} />
            </button>
          </div>

          <div className="route-stops-timeline mt-4" style={{ position: 'relative', paddingLeft: 24 }}>
            {/* Timeline çizgisi */}
            <div style={{ position: 'absolute', left: 8, top: 12, bottom: 12, width: 2, background: 'rgba(255,255,255,0.06)' }} />
            
            {selectedRoute.stops.map((stop, i) => (
              <div key={stop.id} style={{ position: 'relative', marginBottom: 20 }}>
                {/* Durak sırası balonu */}
                <div style={{
                  position: 'absolute',
                  left: -24,
                  top: 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: stop.visited ? 'var(--accent-green)' : 'var(--bg-card)',
                  border: stop.visited ? 'none' : '2px solid var(--border-color)',
                  color: stop.visited ? 'black' : 'var(--text-secondary)',
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  {stop.visited ? '✓' : stop.sequence_order}
                </div>

                <div className="flex justify-between items-start">
                  <div onClick={() => navigate(`/customers/${stop.customer_id}`)} style={{ cursor: 'pointer', flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, textDecoration: stop.visited ? 'line-through' : 'none', color: stop.visited ? 'var(--text-muted)' : 'var(--text-heading)' }}>
                      {stop.company_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {stop.district} · {stop.city}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* Yol Tarifi */}
                    <a 
                      href={getGoogleMapsDir(stop)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: 6, display: 'inline-flex', alignItems: 'center' }}
                      title="Navigasyon"
                    >
                      <FiNavigation size={14} />
                    </a>

                    {/* Ziyaret Başlat */}
                    {!stop.visited && (
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => handleStartVisit(stop)}
                        style={{ padding: 6, display: 'inline-flex', alignItems: 'center' }}
                        title="Ziyareti Başlat"
                      >
                        <FiPlay size={14} />
                      </button>
                    )}

                    {/* Checkbox Ziyaret Edildi */}
                    <input 
                      type="checkbox" 
                      checked={stop.visited} 
                      onChange={() => handleToggleVisited(stop)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      </>

      ) : (
        <div className="animate-in flex flex-col gap-4">
          <div className="card">
            <h3 className="card-title">🧭 Rota Boyunca Firma Bul</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 15 }}>İki şehir arasındaki seyahat güzergahınızın yakınındaki firmaları bulun.</p>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Başlangıç Şehri</label>
                <select className="form-select" value={startCity} onChange={e => setStartCity(e.target.value)}>
                  {Object.keys(CITY_COORDS).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bitiş Şehri</label>
                <select className="form-select" value={endCity} onChange={e => setEndCity(e.target.value)}>
                  {Object.keys(CITY_COORDS).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label">Yoldan Maksimum Uzaklık (Eşik Mesafe)</label>
              <select className="form-select" value={alongThreshold} onChange={e => setAlongThreshold(parseInt(e.target.value))}>
                <option value={1000}>1 km (Yol kenarı)</option>
                <option value={2000}>2 km (Yakın)</option>
                <option value={3000}>3 km (Normal)</option>
                <option value={5000}>5 km (Geniş)</option>
              </select>
            </div>

            <button className="btn btn-primary w-full mt-4" onClick={handleSearchAlong} disabled={searchingAlong}>
              {searchingAlong ? 'Aranıyor...' : 'Güzergah Boyunca Müşterileri Bul'}
            </button>
          </div>

          {alongResults.length > 0 ? (
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="card-title" style={{ margin: 0, fontSize: 14 }}>🔍 Bulunan Potansiyel Firmalar ({alongResults.length})</h3>
                <button className="btn btn-success btn-sm" onClick={handleApplyAlongToRoute}>
                  Hepsini Rotaya Aktar
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alongResults.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.company_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Yola Uzaklık: <strong>{Math.round(c.distance_to_route)}m</strong> · {c.district} ({c.city})
                      </div>
                    </div>
                    <span className="badge" style={{
                      background: c.priority_score >= 70 ? 'rgba(239, 68, 68, 0.12)' : c.priority_score >= 40 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(156, 163, 175, 0.12)',
                      color: c.priority_score >= 70 ? '#f87171' : c.priority_score >= 40 ? '#fbbf24' : '#9ca3af',
                      border: `1px solid ${c.priority_score >= 70 ? 'rgba(239, 68, 68, 0.25)' : c.priority_score >= 40 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(156, 163, 175, 0.25)'}`,
                      fontWeight: 700,
                      fontSize: 11
                    }}>{c.priority_score}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : alongResults.length === 0 && !searchingAlong ? (
            <div className="mobile-empty card">
              <p>Arama kriterlerinize göre güzergah üzerinde müşteri bulunamadı.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

