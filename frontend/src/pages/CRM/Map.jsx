import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import { mapService } from '../../services/mapService';
import toast from 'react-hot-toast';
import { FiUsers, FiFilter, FiNavigation, FiInfo, FiCompass } from 'react-icons/fi';

export default function MapPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [mapType, setMapType] = useState('loading'); // 'google', 'leaflet', 'loading'
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  // Şehir ve Sektör listeleri (filtreleme için)
  const [cities, setCities] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    // Tüm müşterileri hafif koordinat API'sinden çek
    crmApi.getMapMarkers()
      .then(res => {
        const items = res.data || [];
        // Sadece koordinatı olan müşterileri filtrele
        const withCoords = items.filter(c => c.latitude && c.longitude);
        setCustomers(withCoords);
        setFilteredCustomers(withCoords);
        
        // Benzersiz şehir ve sektörleri al
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

  // Haritayı yükle (Google veya Leaflet Fallback)
  useEffect(() => {
    if (loading || customers.length === 0) return;

    const initMap = async () => {
      try {
        // 1. Google Maps yüklemeyi dene
        const googleMaps = await mapService.loadGoogleMaps();
        setMapType('google');
        renderGoogleMap(googleMaps);
      } catch (err) {
        // 2. Google Maps başarısız olursa Leaflet yükle
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
      // Temizlik
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [loading, customers]);

  // Filtreler değiştikçe haritayı güncelle
  useEffect(() => {
    if (loading || !mapInstanceRef.current) return;

    let result = customers;
    if (cityFilter) {
      result = result.filter(c => c.city === cityFilter);
    }
    if (sectorFilter) {
      result = result.filter(c => c.sector === sectorFilter);
    }
    setFilteredCustomers(result);

    if (mapType === 'google') {
      updateGoogleMarkers(result);
    } else if (mapType === 'leaflet') {
      updateLeafletMarkers(result);
    }
  }, [cityFilter, sectorFilter]);

  // Leaflet CDN Dosyalarını Dinamik Yükle
  const loadLeafletScripts = () => {
    return new Promise((resolve, reject) => {
      if (window.L) {
        resolve(window.L);
        return;
      }

      // CSS Ekle
      const link1 = document.createElement('link');
      link1.rel = 'stylesheet';
      link1.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link1);

      // MarkerCluster CSS Ekle
      const link2 = document.createElement('link');
      link2.rel = 'stylesheet';
      link2.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
      document.head.appendChild(link2);

      const link3 = document.createElement('link');
      link3.rel = 'stylesheet';
      link3.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
      document.head.appendChild(link3);

      // JS Ekle
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        // MarkerCluster JS Ekle
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

  // Google Map Çizimi
  const renderGoogleMap = (googleMaps) => {
    if (!mapContainerRef.current) return;

    // Samsun merkezli başlat
    const defaultCenter = { lat: 41.2797, lng: 36.3361 };
    
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

    // Eski markerları temizle
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (clusterInstanceRef.current) {
      clusterInstanceRef.current.clearMarkers();
    }

    const google = window.google;
    const markers = data.map(c => {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(c.latitude), lng: parseFloat(c.longitude) },
        title: c.company_name,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #1e293b; padding: 6px; font-family: sans-serif;">
            <h4 style="margin: 0 0 6px 0; font-weight: 700; color: #1d4ed8;">${c.company_name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px;">📍 ${c.city} / ${c.district || ''}</p>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">💼 Sektör: ${c.sector || '—'}</p>
            <button onclick="window.location.hash='#/customers/${c.id}'" style="background: #2563eb; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Detaya Git</button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      return marker;
    });

    // Cluster yükle ve ata
    try {
      const clusterer = await mapService.loadMarkerClusterer();
      clusterInstanceRef.current = new clusterer.MarkerClusterer({
        map: mapInstanceRef.current,
        markers: markers
      });
    } catch {
      // Fallback: clusterer yoksa düz çiz
      markers.forEach(m => m.setMap(mapInstanceRef.current));
    }
  };

  // Leaflet Map Çizimi (Ücretsiz Fallback)
  const renderLeafletMap = () => {
    if (!mapContainerRef.current || !window.L) return;

    // Samsun merkezli başlat
    const map = window.L.map(mapContainerRef.current).setView([41.2797, 36.3361], 9);

    // Koyu tema (Dark Mode) OpenStreetMap karoları
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

    // Eski cluster ve markerları temizle
    if (clusterInstanceRef.current) {
      mapInstanceRef.current.removeLayer(clusterInstanceRef.current);
    }

    const L = window.L;
    // Yeni cluster grubu oluştur
    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50
    });

    data.forEach(c => {
      const marker = L.marker([parseFloat(c.latitude), parseFloat(c.longitude)]);
      
      const popupContent = document.createElement('div');
      popupContent.style.color = '#1e293b';
      popupContent.style.padding = '4px';
      popupContent.innerHTML = `
        <h4 style="margin: 0 0 6px 0; font-weight: 700; color: #2563eb; font-size: 14px;">${c.company_name}</h4>
        <p style="margin: 0 0 4px 0; font-size: 12px;">📍 ${c.city} / ${c.district || '—'}</p>
        <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">💼 Sektör: ${c.sector || '—'}</p>
      `;

      const btn = document.createElement('button');
      btn.innerHTML = 'Detaya Git 🏢';
      btn.style.cssText = 'background: #2563eb; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; width: 100%; text-align: center;';
      btn.onclick = () => {
        navigate(`/customers/${c.id}`);
      };

      popupContent.appendChild(btn);
      marker.bindPopup(popupContent);
      markerClusterGroup.addLayer(marker);
    });

    mapInstanceRef.current.addLayer(markerClusterGroup);
    clusterInstanceRef.current = markerClusterGroup;
  };

  return (
    <div className="mobile-page animate-in" style={{ padding: 0, height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Üst Filtre Çubuğu */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        zIndex: 10,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          <FiFilter style={{ color: 'var(--accent-blue-light)' }} /> Filtre:
        </div>
        
        <select 
          className="form-select" 
          style={{ width: 'auto', padding: '6px 24px 6px 12px', fontSize: 12, height: 32 }}
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
          style={{ width: 'auto', padding: '6px 24px 6px 12px', fontSize: 12, height: 32 }}
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
        >
          <option value="">Tüm Sektörler ({sectors.length})</option>
          {sectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }} className="flex items-center gap-2">
          <FiUsers /> <strong>{filteredCustomers.length}</strong> kayıt haritada
          <span style={{
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 9,
            fontWeight: 700,
            background: mapType === 'google' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
            color: mapType === 'google' ? '#34d399' : '#60a5fa'
          }}>
            {mapType === 'google' ? 'Google Maps' : mapType === 'leaflet' ? 'Leaflet (Free)' : 'Yükleniyor...'}
          </span>
        </div>
      </div>

      {/* Harita Container */}
      <div style={{ flex: 1, position: 'relative', background: '#0f172a' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 100,
            color: 'var(--text-primary)'
          }}>
            <div className="loading-pulse" style={{ marginBottom: 15 }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Müşteri Koordinatları Alınıyor...</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>4.000+ kayıt yükleniyor</span>
          </div>
        )}
        
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      </div>
    </div>
  );
}
