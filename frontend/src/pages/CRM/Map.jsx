import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import { mapService } from '../../services/mapService';
import useGeolocation from '../../hooks/useGeolocation';
import QuickVisitModal from '../../components/CRM/QuickVisitModal';
import WhatsAppActionModal from '../../components/CRM/WhatsAppActionModal';
import toast from 'react-hot-toast';
import { 
  FiUsers, FiFilter, FiNavigation, FiInfo, FiCompass, 
  FiPhone, FiMessageSquare, FiTruck, FiCalendar, FiArrowRight, FiX, FiCheckCircle 
} from 'react-icons/fi';

// Haversine km hesaplama
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

export default function MapPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtreler
  const [cityFilter, setCityFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL'); // ALL, A, B, C, OVERDUE, DISCOVERY
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(10); // 10 km
  
  // Seçili Müşteri (Bottom Sheet Card)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quickVisitModalOpen, setQuickVisitModalOpen] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState(null);

  const [mapType, setMapType] = useState('loading'); // 'google', 'leaflet', 'loading'
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  const { location, loading: gpsLoading } = useGeolocation();

  // Şehir ve Sektör listeleri
  const [cities, setCities] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    window.__selectMapCustomer = (id) => {
      const found = customers.find(c => c.id === id);
      if (found) setSelectedCustomer(found);
    };
    return () => {
      delete window.__selectMapCustomer;
    };
  }, [customers]);

  useEffect(() => {
    crmApi.getMapMarkers()
      .then(res => {
        const items = res.data || [];
        const withCoords = items.filter(c => c.latitude && c.longitude);
        setCustomers(withCoords);
        setFilteredCustomers(withCoords);
        
        const uniqueCities = [...new Set(withCoords.map(c => c.city).filter(Boolean))];
        const uniqueSectors = [...new Set(withCoords.map(c => c.sector).filter(Boolean))];
        setCities(uniqueCities);
        setSectors(uniqueSectors);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Müşteri koordinatları yüklenemedi.');
        setLoading(false);
      });
  }, []);

  // Haritayı başlat
  useEffect(() => {
    if (loading || customers.length === 0) return;

    const initMap = async () => {
      try {
        const googleMaps = await mapService.loadGoogleMaps();
        setMapType('google');
        renderGoogleMap(googleMaps);
      } catch (err) {
        console.warn('Google Maps yüklenemedi, Leaflet haritasına geçiliyor...', err);
        try {
          await loadLeafletScripts();
          setMapType('leaflet');
          renderLeafletMap();
        } catch (leafletErr) {
          console.error('Leaflet de yüklenemedi:', leafletErr);
          toast.error('Harita yükleme hatası oluştu.');
        }
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [loading, customers]);

  // Filtreler değiştikçe haritayı güncelle
  useEffect(() => {
    if (loading || !mapInstanceRef.current) return;

    let result = [...customers];
    
    if (cityFilter) {
      result = result.filter(c => c.city === cityFilter);
    }
    if (sectorFilter) {
      result = result.filter(c => c.sector === sectorFilter);
    }
    
    // Segment & Durum Filtresi
    if (segmentFilter === 'A') {
      result = result.filter(c => c.segment === 'A');
    } else if (segmentFilter === 'B') {
      result = result.filter(c => c.segment === 'B');
    } else if (segmentFilter === 'C') {
      result = result.filter(c => c.segment === 'C');
    } else if (segmentFilter === 'OVERDUE') {
      result = result.filter(c => c.is_overdue);
    } else if (segmentFilter === 'DISCOVERY') {
      result = result.filter(c => c.source === 'discovery');
    }

    // Yakınımdakiler Radarı
    if (nearbyOnly && location) {
      result = result.filter(c => {
        const dist = calculateDistance(location.latitude, location.longitude, c.latitude, c.longitude);
        return dist !== null && dist <= nearbyRadius;
      });
    }

    setFilteredCustomers(result);

    if (mapType === 'google') {
      updateGoogleMarkers(result);
    } else if (mapType === 'leaflet') {
      updateLeafletMarkers(result);
    }
  }, [cityFilter, sectorFilter, segmentFilter, nearbyOnly, nearbyRadius, customers, mapType, location]);

  const getMarkerColor = (c) => {
    if (c.is_overdue) return '#ef4444'; // Kırmızı (30+ gündür ziyaret edilmemiş)
    if (c.source === 'discovery') return '#a855f7'; // Mor (Yeni Keşif)
    if (c.segment === 'A') return '#10b981'; // Yeşil (A Segment)
    if (c.segment === 'B') return '#3b82f6'; // Mavi (B Segment)
    return '#f59e0b'; // Sarı / Amber (C Segment)
  };

  // Leaflet CDN Script Yükleme
  const loadLeafletScripts = () => {
    return new Promise((resolve, reject) => {
      if (window.L) {
        resolve(window.L);
        return;
      }
      const link1 = document.createElement('link');
      link1.rel = 'stylesheet';
      link1.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link1);

      const link2 = document.createElement('link');
      link2.rel = 'stylesheet';
      link2.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
      document.head.appendChild(link2);

      const link3 = document.createElement('link');
      link3.rel = 'stylesheet';
      link3.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
      document.head.appendChild(link3);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        const clusterScript = document.createElement('script');
        clusterScript.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
        clusterScript.async = true;
        clusterScript.onload = () => resolve(window.L);
        clusterScript.onerror = () => reject(new Error('Leaflet MarkerCluster yüklenemedi.'));
        document.head.appendChild(clusterScript);
      };
      script.onerror = () => reject(new Error('Leaflet yüklenemedi.'));
      document.head.appendChild(script);
    });
  };

  // Google Maps Çizimi
  const renderGoogleMap = (googleMaps) => {
    if (!mapContainerRef.current) return;
    const defaultCenter = location 
      ? { lat: location.latitude, lng: location.longitude }
      : { lat: 41.2797, lng: 36.3361 };
    
    const map = new googleMaps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 9,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] }
      ]
    });

    mapInstanceRef.current = map;
    updateGoogleMarkers(filteredCustomers);
  };

  const updateGoogleMarkers = async (data) => {
    if (!window.google || !mapInstanceRef.current) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (clusterInstanceRef.current) {
      clusterInstanceRef.current.clearMarkers();
    }

    const google = window.google;
    const markers = data.map(c => {
      const pinColor = getMarkerColor(c);
      const svgIcon = {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: pinColor,
        fillOpacity: 0.95,
        strokeWeight: 1.5,
        strokeColor: '#ffffff',
        scale: 1.6,
        anchor: new google.maps.Point(12, 22),
      };

      const marker = new google.maps.Marker({
        position: { lat: parseFloat(c.latitude), lng: parseFloat(c.longitude) },
        title: c.company_name,
        icon: svgIcon,
      });

      marker.addListener('click', () => {
        setSelectedCustomer(c);
      });

      markersRef.current.push(marker);
      return marker;
    });

    try {
      const clusterer = await mapService.loadMarkerClusterer();
      clusterInstanceRef.current = new clusterer.MarkerClusterer({
        map: mapInstanceRef.current,
        markers: markers
      });
    } catch {
      markers.forEach(m => m.setMap(mapInstanceRef.current));
    }
  };

  // Leaflet Harita Çizimi
  const renderLeafletMap = () => {
    if (!mapContainerRef.current || !window.L) return;
    const defaultCenter = location 
      ? [location.latitude, location.longitude] 
      : [41.2797, 36.3361];

    const map = window.L.map(mapContainerRef.current).setView(defaultCenter, 9);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CartoDB',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;
    updateLeafletMarkers(filteredCustomers);
  };

  const updateLeafletMarkers = (data) => {
    if (!window.L || !mapInstanceRef.current) return;
    if (clusterInstanceRef.current) {
      mapInstanceRef.current.removeLayer(clusterInstanceRef.current);
    }

    const L = window.L;
    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45
    });

    data.forEach(c => {
      const pinColor = getMarkerColor(c);
      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="
          width: 24px; 
          height: 24px; 
          border-radius: 50% 50% 50% 0; 
          background: ${pinColor}; 
          transform: rotate(-45deg); 
          border: 2px solid white; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        "><div style="width: 8px; height: 8px; border-radius: 50%; background: white; transform: rotate(45deg);"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });

      const marker = L.marker([parseFloat(c.latitude), parseFloat(c.longitude)], { icon: customIcon });
      marker.on('click', () => {
        setSelectedCustomer(c);
      });

      markerClusterGroup.addLayer(marker);
    });

    mapInstanceRef.current.addLayer(markerClusterGroup);
    clusterInstanceRef.current = markerClusterGroup;
  };

  // Sayı Hesaplamaları
  const aCount = customers.filter(c => c.segment === 'A').length;
  const bCount = customers.filter(c => c.segment === 'B').length;
  const overdueCount = customers.filter(c => c.is_overdue).length;
  const discoveryCount = customers.filter(c => c.source === 'discovery').length;

  const currentDist = selectedCustomer && location
    ? calculateDistance(location.latitude, location.longitude, selectedCustomer.latitude, selectedCustomer.longitude)
    : null;

  return (
    <div className="mobile-page animate-in" style={{ padding: 0, height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Üst Filtre & Segment Çubuğu */}
      <div 
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '0.65rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '4px 20px 4px 10px', fontSize: 12, height: 30, background: '#1e293b' }}
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
          >
            <option value="">Tüm Şehirler ({cities.length})</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '4px 20px 4px 10px', fontSize: 12, height: 30, background: '#1e293b' }}
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
          >
            <option value="">Tüm Sektörler ({sectors.length})</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          {/* Yakınımdakiler Butonu */}
          <button
            type="button"
            onClick={() => setNearbyOnly(!nearbyOnly)}
            style={{
              padding: '4px 10px',
              borderRadius: 16,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              border: nearbyOnly ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
              background: nearbyOnly ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: nearbyOnly ? '#38bdf8' : '#cbd5e1'
            }}
          >
            <FiNavigation size={12} />
            <span>Yakınım (10 km)</span>
          </button>

          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }} className="flex items-center gap-2">
            <FiUsers /> <strong>{filteredCustomers.length}</strong> pin
          </div>
        </div>

        {/* Renkli Segment Seçici Çipleri */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {[
            { key: 'ALL', label: 'Tümü', count: customers.length, color: '#94a3b8' },
            { key: 'A', label: '🟢 A Segment', count: aCount, color: '#10b981' },
            { key: 'B', label: '🔵 B Segment', count: bCount, color: '#3b82f6' },
            { key: 'OVERDUE', label: '🔴 30+ Gün Ziyaretsiz', count: overdueCount, color: '#ef4444' },
            { key: 'DISCOVERY', label: '🟣 Yeni Keşifler', count: discoveryCount, color: '#a855f7' },
          ].map(tab => {
            const active = segmentFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSegmentFilter(tab.key)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 12,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: active ? `2px solid ${tab.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                  background: active ? `${tab.color}30` : 'rgba(255, 255, 255, 0.04)',
                  color: active ? '#f8fafc' : '#94a3b8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>{tab.label}</span>
                <span style={{ 
                  background: active ? tab.color : 'rgba(255, 255, 255, 0.1)', 
                  color: '#fff', 
                  padding: '0 4px', 
                  borderRadius: 6, 
                  fontSize: '0.65rem' 
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Harita Gövdesi */}
      <div style={{ flex: 1, position: 'relative', background: '#0f172a' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 100,
            color: 'var(--text-primary)'
          }}>
            <div className="loading-pulse" style={{ marginBottom: 15 }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Satış Haritası Yükleniyor...</span>
            <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Renkli segment pinleri ve fırsatlar taranıyor</span>
          </div>
        )}
        
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* ── İNTERAKTİF BOTTOM-SHEET KART (Tıklanan Firma Detay & Hızlı Aksiyon) ── */}
        {selectedCustomer && (
          <div 
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              maxWidth: 480,
              margin: '0 auto',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `1.5px solid ${getMarkerColor(selectedCustomer)}`,
              borderRadius: 16,
              padding: '1rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              animation: 'slideUp 0.2s ease-out'
            }}
          >
            {/* Kart Başlığı */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {selectedCustomer.company_name}
                  </h3>
                  <span 
                    style={{
                      background: `${getMarkerColor(selectedCustomer)}25`,
                      color: getMarkerColor(selectedCustomer),
                      border: `1px solid ${getMarkerColor(selectedCustomer)}`,
                      padding: '1px 6px',
                      borderRadius: 6,
                      fontSize: '0.68rem',
                      fontWeight: 800
                    }}
                  >
                    {selectedCustomer.segment} Segment
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 2 }}>
                  📍 {selectedCustomer.city} / {selectedCustomer.district || 'Merkez'} · {selectedCustomer.sector || 'Genel Ticaret'}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Mesafe & Son Ziyaret Bilgi Rozetleri */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.74rem' }}>
              {currentDist !== null && (
                <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiNavigation size={12} /> {currentDist} km uzaklıkta
                </div>
              )}
              <div style={{ 
                background: selectedCustomer.is_overdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
                color: selectedCustomer.is_overdue ? '#f87171' : '#cbd5e1', 
                padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 
              }}>
                <FiCalendar size={12} />
                {selectedCustomer.days_since_visit 
                  ? `${selectedCustomer.days_since_visit} gündür ziyaret edilmedi` 
                  : 'Henüz ziyaret kaydı yok'}
              </div>
            </div>

            {/* IVECO Araç Fırsatı */}
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '6px 10px',
                borderRadius: 8,
                borderLeft: '3px solid #38bdf8',
                fontSize: '0.76rem',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <FiTruck size={14} color="#38bdf8" />
              <span><strong>Fırsat:</strong> {selectedCustomer.vehicle_opportunity}</span>
            </div>

            {/* Aksiyon Butonları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 4 }}>
              {selectedCustomer.phone && (
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="btn btn-sm btn-primary"
                  style={{ padding: '6px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderRadius: 8 }}
                >
                  <FiPhone size={13} />
                  <span>Ara</span>
                </a>
              )}

              {selectedCustomer.phone && (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setWhatsAppModalData({
                    customer: selectedCustomer,
                    vehicleTitle: selectedCustomer.vehicle_opportunity,
                    interestId: null,
                    defaultStatus: 'offer_given'
                  })}
                  style={{ padding: '6px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: '#25d366', color: '#fff', border: 'none', borderRadius: 8 }}
                >
                  <FiMessageSquare size={13} />
                  <span>WhatsApp</span>
                </button>
              )}

              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={() => setQuickVisitModalOpen(true)}
                style={{ padding: '6px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderRadius: 8 }}
              >
                <FiCheckCircle size={13} />
                <span>+ Ziyaret</span>
              </button>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCustomer.latitude},${selectedCustomer.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-secondary"
                style={{ padding: '6px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderRadius: 8 }}
              >
                <FiCompass size={13} />
                <span>Yol Tarifi</span>
              </a>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => navigate(`/customers/${selectedCustomer.id}`)}
              style={{ marginTop: 2, fontSize: '0.76rem', borderRadius: 8, textAlign: 'center' }}
            >
              🏢 Müşteri Kartını Detaylı İncele <FiArrowRight size={12} style={{ display: 'inline' }} />
            </button>
          </div>
        )}
      </div>

      {/* Hızlı Ziyaret Modalı */}
      {selectedCustomer && (
        <QuickVisitModal
          isOpen={quickVisitModalOpen}
          onClose={() => setQuickVisitModalOpen(false)}
          initialCustomerId={selectedCustomer.id}
          initialCompanyName={selectedCustomer.company_name}
          onSuccess={() => {
            toast.success('Ziyaret başarıyla kaydedildi!');
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
          onSuccess={() => {
            toast.success('WhatsApp mesajı iletildi ve kayıt güncellendi!');
          }}
        />
      )}
    </div>
  );
}
