import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, crmApi, vehiclesApi } from '../../api/client';
import useGeolocation from '../../hooks/useGeolocation';
import { useVisit } from '../../contexts/VisitContext';
import WhatsAppActionModal from '../../components/CRM/WhatsAppActionModal';
import QuickVisitModal from '../../components/CRM/QuickVisitModal';
import { 
  FiMapPin, FiCalendar, FiPlus, FiTrash2, FiCheckCircle, FiPlay, 
  FiMap, FiChevronRight, FiList, FiNavigation, FiTruck, FiZap, 
  FiCompass, FiPhone, FiMessageSquare, FiExternalLink, FiDollarSign 
} from 'react-icons/fi';
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

  // Araç İlgisine Göre Rota Filtresi State'leri
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [filterNotContacted30, setFilterNotContacted30] = useState(false);
  const [searchingVehicles, setSearchingVehicles] = useState(false);

  // Güzergah Boyunca Arama State'leri
  const [startCity, setStartCity] = useState('Samsun');
  const [endCity, setEndCity] = useState('Ordu');
  const [alongThreshold, setAlongThreshold] = useState(5000); // 5 km
  const [alongResults, setAlongResults] = useState([]);
  const [searchingAlong, setSearchingAlong] = useState(false);
  const [alongSectorFilter, setAlongSectorFilter] = useState('');

  // Modals
  const [quickVisitCustomer, setQuickVisitCustomer] = useState(null);
  const [whatsAppModalData, setWhatsAppModalData] = useState(null);

  const { location, getLocation, loading: gpsLoading } = useGeolocation();
  const { startVisit } = useVisit();
  const navigate = useNavigate();

  const CITY_COORDS = {
    "Samsun": { lat: 41.2582, lon: 36.4385 },
    "Ordu": { lat: 40.9862, lon: 37.8797 },
    "Çorum": { lat: 40.5284, lon: 34.9080 },
    "Amasya": { lat: 40.6531, lon: 35.8331 },
    "Tokat": { lat: 40.3160, lon: 36.5540 },
    "Sivas": { lat: 39.7505, lon: 37.0150 },
    "Giresun": { lat: 40.9169, lon: 38.3886 },
    "Sinop": { lat: 41.9892, lon: 35.1950 },
    "Kastamonu": { lat: 41.3766, lon: 33.7765 }
  };

  useEffect(() => {
    fetchRoutes();
    crmApi.getCustomers({ limit: 150 })
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

  const handleFilterByVehicleDemand = async () => {
    if (!vehicleQuery.trim()) {
      toast.error('Lütfen bir araç modeli veya arama terimi yazın (Örn: 35C16, Daily, Eurocargo)');
      return;
    }
    setSearchingVehicles(true);
    try {
      let queryStr = vehicleQuery.trim();
      if (filterNotContacted30) {
        queryStr += ' son 30 gündür görüşmediğimiz müşteriler';
      }
      const res = await vehiclesApi.aiSearch(queryStr);
      const foundIds = (res.data.results || []).map(r => r.id);
      if (foundIds.length === 0) {
        toast.error('Kriterlere uyan müşteri bulunamadı');
      } else {
        setSelectedCustomerIds(prev => Array.from(new Set([...prev, ...foundIds])));
        toast.success(`${foundIds.length} müşteri bulundu ve rotaya eklendi! 🎉`);
      }
    } catch {
      toast.error('Araç ilgisine göre müşteri aranırken hata oluştu');
    } finally {
      setSearchingVehicles(false);
    }
  };

  const handleOptimize = async () => {
    if (selectedCustomerIds.length === 0) {
      toast.error("Lütfen rotaya eklemek için en az bir müşteri seçin.");
      return;
    }
    getLocation();
    const startLat = location?.latitude || 41.2582;
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
    toast.loading(`${startCity} ➔ ${endCity} güzergahında firmalar taranıyor...`, { id: 'search_along_load' });

    try {
      const res = await crmApi.searchRouteAlong({
        start_lat: start.lat,
        start_lon: start.lon,
        end_lat: end.lat,
        end_lon: end.lon,
        threshold: alongThreshold
      });
      let items = res.data || [];
      if (alongSectorFilter) {
        items = items.filter(c => (c.sector || '').toLowerCase().includes(alongSectorFilter.toLowerCase()));
      }
      setAlongResults(items);
      toast.success(`${items.length} potansiyel firma güzergah koridorunda bulundu!`, { id: 'search_along_load' });
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
    setRouteName(`${startCity} - ${endCity} Satış Güzergahı`);
    setActiveTab('plans');
    setShowCreate(true);
    toast.success("Güzergahtaki firmalar yeni rota duraklarına eklendi. Sıralamayı optimize edebilirsiniz!");
  };

  // Google Maps Çoklu Durak Linki
  const getFullGoogleMapsRouteUrl = (stops) => {
    if (!stops || stops.length === 0) return null;
    const coords = stops
      .filter(s => s.latitude && s.longitude)
      .map(s => `${s.latitude},${s.longitude}`);
    if (coords.length === 0) return null;
    const origin = location ? `${location.latitude},${location.longitude}` : coords[0];
    const destination = coords[coords.length - 1];
    const waypoints = coords.slice(0, coords.length - 1).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
  };

  const getGoogleMapsDir = (stop) => {
    if (!stop.latitude || !stop.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.company_name)}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
  };

  const toggleCustomerSelect = (id) => {
    if (selectedCustomerIds.includes(id)) {
      setSelectedCustomerIds(selectedCustomerIds.filter(cid => cid !== id));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, id]);
    }
    setOptimizedStops([]);
  };

  // Rota Ticari Skoru ve Potansiyeli Hesaplama
  const computeRouteCommercialScore = (stops) => {
    if (!stops || stops.length === 0) return { score: 0, potentialEst: 0, aCount: 0, bCount: 0 };
    let aCount = 0;
    let bCount = 0;
    let potentialEst = 0;

    stops.forEach(s => {
      if (s.segment === 'A') {
        aCount += 1;
        potentialEst += 180000;
      } else if (s.segment === 'B') {
        bCount += 1;
        potentialEst += 90000;
      } else {
        potentialEst += 40000;
      }
    });

    const commercialScore = Math.min(100, Math.round((aCount * 25 + bCount * 15 + stops.length * 10)));
    return { score: commercialScore, potentialEst, aCount, bCount };
  };

  if (loading && routes.length === 0) {
    return <div className="dashboard-loading"><div className="loading-pulse" /><span>Rotalar yükleniyor...</span></div>;
  }

  const currentRouteStats = selectedRoute ? computeRouteCommercialScore(selectedRoute.stops) : null;
  const fullMapsUrl = selectedRoute ? getFullGoogleMapsRouteUrl(selectedRoute.stops) : null;

  return (
    <div className="mobile-page animate-in">
      {/* Üst Başlık & Sekmeler */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCompass style={{ color: '#38bdf8' }} /> Satış Odaklı Rota & Güzergah
          </h2>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
            En kısa yol değil, en yüksek ticari potansiyelli saha planlaması
          </span>
        </div>
        {activeTab === 'plans' && (
          <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => setShowCreate(true)}>
            <FiPlus size={16} /> Yeni Rota
          </button>
        )}
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
        <button 
          style={{
            flex: 1, padding: '10px 14px', fontSize: 13, fontWeight: 700, border: 'none',
            background: activeTab === 'plans' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'plans' ? '#38bdf8' : 'var(--text-secondary)',
            borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
          onClick={() => setActiveTab('plans')}
        >
          <FiMap size={16} /> Bugünün Sahası & Rotalar ({routes.length})
        </button>
        <button 
          style={{
            flex: 1, padding: '10px 14px', fontSize: 13, fontWeight: 700, border: 'none',
            background: activeTab === 'along' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'along' ? '#38bdf8' : 'var(--text-secondary)',
            borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
          onClick={() => setActiveTab('along')}
        >
          <FiNavigation size={16} /> 🧭 Yolum Üzerindeki Firmaları Bul
        </button>
      </div>

      {activeTab === 'plans' ? (
        <>
          {showCreate && (
            <div className="card mb-4" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  🗺️ Yeni Saha Satış Rotası
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-3">
                <div className="form-group">
                  <label className="form-label">Rota Adı / Başlığı</label>
                  <input 
                    className="form-input" 
                    value={routeName} 
                    onChange={e => setRouteName(e.target.value)} 
                    placeholder="Örn: Samsun OSB & Hafriyat Ziyaret Grubu" 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Planlanan Ziyaret Tarihi</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={routeDate} 
                    onChange={e => setRouteDate(e.target.value)} 
                  />
                </div>

                {/* Araç Odaklı Saha Satışı Filtresi */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: 10, padding: '12px', marginBottom: 4
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <FiZap color="#38bdf8" size={16} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#38bdf8' }}>
                      Araç İlgisine Göre Müşteri Bul & Rotaya Ekle
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Örn: 35C16, Daily Damper, Eurocargo, S-Way..."
                      value={vehicleQuery}
                      onChange={(e) => setVehicleQuery(e.target.value)}
                      style={{ flex: 1, minWidth: 200, fontSize: '0.82rem', padding: '8px 12px' }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filterNotContacted30}
                        onChange={(e) => setFilterNotContacted30(e.target.checked)}
                      />
                      Son 30 gündür görüşülmemiş
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={handleFilterByVehicleDemand}
                      disabled={searchingVehicles}
                      style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      {searchingVehicles ? 'Taranıyor...' : 'Müşterileri Ekle'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Durak Seçimi ({selectedCustomerIds.length} Müşteri Seçildi)
                  </label>
                  <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 10, padding: 8, background: 'rgba(0,0,0,0.2)' }}>
                    {allCustomers.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedCustomerIds.includes(c.id)} 
                          onChange={() => toggleCustomerSelect(c.id)}
                          style={{ width: 16, height: 16 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>{c.company_name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            {c.city} · {c.sector || 'Genel Ticaret'} · <span style={{ color: c.segment === 'A' ? '#34d399' : '#60a5fa' }}>{c.segment || 'C'} Segment</span>
                          </div>
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
                    Vazgeç
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary w-full" 
                    onClick={handleOptimize}
                    disabled={optimizing || selectedCustomerIds.length === 0}
                    style={{ fontWeight: 700, background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}
                  >
                    {optimizing ? 'Algoritma Çalışıyor...' : '🎯 Sıralamayı & Rotayı Optimize Et'}
                  </button>
                </div>

                {optimizedStops.length > 0 && (
                  <div className="mt-3 p-3" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 8, color: '#34d399' }}>
                      ✓ Satış Odaklı Optimize Sıralama
                    </h4>
                    <ol style={{ fontSize: '0.8rem', paddingLeft: 18, color: '#cbd5e1' }}>
                      {optimizedStops.map((stop, i) => {
                        const cust = allCustomers.find(c => c.id === stop.customer_id);
                        return (
                          <li key={i} style={{ marginBottom: 6 }}>
                            <strong>{cust?.company_name}</strong> 
                            <span style={{ color: '#94a3b8' }}> (+{Math.round(stop.distance_from_previous)} m)</span>
                          </li>
                        );
                      })}
                    </ol>
                    <button type="button" className="btn btn-success w-full mt-3" onClick={handleSaveRoute} style={{ fontWeight: 800 }}>
                      💾 Rotayı Kaydet ve Başlat
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rota Seçici */}
          {routes.length > 0 ? (
            <div className="form-group mb-4">
              <label className="form-label" style={{ fontWeight: 700 }}>Aktif Rota Seçin</label>
              <select 
                className="form-select" 
                value={selectedRoute?.id || ''} 
                onChange={e => setSelectedRoute(routes.find(r => r.id === parseInt(e.target.value)))}
                style={{ height: 42, fontSize: '0.9rem', fontWeight: 600 }}
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.date}) — {r.stops?.length || 0} Durak</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mobile-empty card">
              <p>Henüz planlanmış bir rota bulunmuyor.</p>
              <button className="btn btn-primary btn-sm mt-3" onClick={() => setShowCreate(true)}>İlk Rotamı Oluştur</button>
            </div>
          )}

          {/* Seçili Rota Paneli & Satış Odaklı Skor */}
          {selectedRoute && (
            <div className="card animate-in" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {selectedRoute.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                    📅 Tarih: {selectedRoute.date} · {selectedRoute.stops?.length || 0} Durak
                  </p>
                </div>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDeleteRoute(selectedRoute.id)}
                  title="Rotayı Sil"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>

              {/* ── SATIŞ ODAKLI ROTA SKORU & TİCARİ DEĞER KARTI ── */}
              {currentRouteStats && (
                <div 
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                        <FiZap size={16} /> SATIŞ ODAKLI ROTA DEĞERLENDİRMESİ
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 4 }}>
                        💡 <strong>Saha Satış Tavsiyesi:</strong> Bu rotadaki {selectedRoute.stops?.length} firmayı gezmek, tahmini <strong>₺ {currentRouteStats.potentialEst.toLocaleString('tr-TR')}</strong> potansiyel ve araç ihtiyacı barındırıyor.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.66rem', color: '#6ee7b7' }}>Ticari Skor</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>{currentRouteStats.score}/100</div>
                      </div>
                      <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 10px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.66rem', color: '#7dd3fc' }}>A-Segment</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>{currentRouteStats.aCount} Firma</div>
                      </div>
                    </div>
                  </div>

                  {/* Çoklu Durak Google Maps Navigasyon Başlat Butonu */}
                  {fullMapsUrl && (
                    <a
                      href={fullMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full mt-3"
                      style={{
                        height: 42,
                        borderRadius: 10,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: '0.88rem'
                      }}
                    >
                      <FiNavigation size={18} />
                      Rotayı Google Maps'te Başlat (Tüm Duraklar)
                    </a>
                  )}
                </div>
              )}

              {/* Duraklar Zaman Çizelgesi */}
              <div className="route-stops-timeline" style={{ position: 'relative', paddingLeft: 24 }}>
                <div style={{ position: 'absolute', left: 8, top: 12, bottom: 12, width: 2, background: 'rgba(255,255,255,0.08)' }} />
                
                {selectedRoute.stops.map((stop, i) => (
                  <div key={stop.id} style={{ position: 'relative', marginBottom: 20 }}>
                    <div style={{
                      position: 'absolute',
                      left: -24,
                      top: 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: stop.visited ? '#10b981' : 'var(--bg-card)',
                      border: stop.visited ? 'none' : '2px solid rgba(56, 189, 248, 0.6)',
                      color: stop.visited ? '#000' : '#38bdf8',
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
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, textDecoration: stop.visited ? 'line-through' : 'none', color: stop.visited ? 'var(--text-muted)' : '#f8fafc' }}>
                          {stop.company_name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          📍 {stop.district || 'Merkez'} · {stop.city}
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        {/* Hızlı Ziyaret Başlat */}
                        {!stop.visited && (
                          <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => setQuickVisitCustomer({ id: stop.customer_id, company_name: stop.company_name })}
                            style={{ padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', borderRadius: 8 }}
                            title="Ziyareti Başlat & Kaydet"
                          >
                            <FiPlay size={12} /> Ziyaret
                          </button>
                        )}

                        {/* Yol Tarifi */}
                        <a 
                          href={getGoogleMapsDir(stop)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px', display: 'inline-flex', alignItems: 'center', borderRadius: 8 }}
                          title="Navigasyon"
                        >
                          <FiNavigation size={13} />
                        </a>

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
          )}
        </>
      ) : (
        /* ── GÜZERGAH BOYUNCA ARAMA (YOLUM ÜZERİNDEKİ FİRMALAR) ── */
        <div className="animate-in flex flex-col gap-4">
          <div className="card" style={{ border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <h3 className="card-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              🧭 Yolum Üzerindeki Firmaları Bul
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 14 }}>
              Örn: Samsun'dan Ordu'ya seyahat ederken yol koridorunun 5 km yakınındaki akaryakıt & lojistik firmalarını tespit edin.
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>1. Çıkış Şehri</label>
                <select className="form-select" value={startCity} onChange={e => setStartCity(e.target.value)}>
                  {Object.keys(CITY_COORDS).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>2. Varış Şehri</label>
                <select className="form-select" value={endCity} onChange={e => setEndCity(e.target.value)}>
                  {Object.keys(CITY_COORDS).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row mt-3">
              <div className="form-group">
                <label className="form-label">Yoldan Koridor Sapma Mesafesi</label>
                <select className="form-select" value={alongThreshold} onChange={e => setAlongThreshold(parseInt(e.target.value))}>
                  <option value={2000}>2 km (Ana Yol Kenarı)</option>
                  <option value={3000}>3 km (Yakın Koridor)</option>
                  <option value={5000}>5 km (Önerilen - 10 Dk Sapma)</option>
                  <option value={10000}>10 km (Geniş Bölge)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hedef Sektör Filtresi</label>
                <select 
                  className="form-select" 
                  value={alongSectorFilter} 
                  onChange={e => setAlongSectorFilter(e.target.value)}
                >
                  <option value="">Tüm Sektörler</option>
                  <option value="Hafriyat">Hafriyat & İnşaat</option>
                  <option value="Akaryakıt">Akaryakıt / Petrol</option>
                  <option value="Lojistik">Lojistik & Nakliye</option>
                  <option value="Gıda">Gıda / Dağıtım</option>
                </select>
              </div>
            </div>

            <button 
              className="btn btn-primary w-full mt-4" 
              onClick={handleSearchAlong} 
              disabled={searchingAlong}
              style={{
                height: 44,
                borderRadius: 10,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0284c7, #2563eb)'
              }}
            >
              {searchingAlong ? 'Güzergah Taranıyor...' : `🧭 ${startCity} ➔ ${endCity} Yolundaki Firmaları Bul`}
            </button>
          </div>

          {alongResults.length > 0 ? (
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="card-title" style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>
                  🔍 Yol Koridorunda Bulunan Firmalar ({alongResults.length})
                </h3>
                <button className="btn btn-success btn-sm" onClick={handleApplyAlongToRoute} style={{ fontWeight: 700 }}>
                  Tümünü Rotaya Aktar ({alongResults.length})
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alongResults.map(c => (
                  <div 
                    key={c.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 12px', 
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                        {c.company_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                        Yoldan Sapma: <strong style={{ color: '#38bdf8' }}>{Math.round(c.distance_to_route)} m</strong> · {c.district} ({c.city}) · <span style={{ color: c.segment === 'A' ? '#34d399' : '#60a5fa' }}>{c.segment || 'C'} Segment</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '6px 8px', borderRadius: 8 }}
                          title="Ara"
                        >
                          <FiPhone size={13} />
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedCustomerIds(prev => Array.from(new Set([...prev, c.id])));
                          toast.success(`${c.company_name} rota listesine eklendi!`);
                        }}
                        style={{ padding: '6px 10px', fontSize: '0.74rem', fontWeight: 700, borderRadius: 8 }}
                      >
                        + Ekle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : alongResults.length === 0 && !searchingAlong ? (
            <div className="mobile-empty card">
              <p>Arama kriterlerinize göre güzergah koridorunda firma bulunamadı.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Hızlı Ziyaret Modalı */}
      {quickVisitCustomer && (
        <QuickVisitModal
          isOpen={Boolean(quickVisitCustomer)}
          onClose={() => setQuickVisitCustomer(null)}
          initialCustomerId={quickVisitCustomer.id}
          initialCompanyName={quickVisitCustomer.company_name}
          onSuccess={() => {
            fetchRoutes();
          }}
        />
      )}

      {/* WhatsApp Modal */}
      {whatsAppModalData && (
        <WhatsAppActionModal
          isOpen={Boolean(whatsAppModalData)}
          onClose={() => setWhatsAppModalData(null)}
          customer={whatsAppModalData.customer}
          vehicleTitle={whatsAppModalData.vehicleTitle}
          interestId={whatsAppModalData.interestId}
          defaultStatus={whatsAppModalData.defaultStatus}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
