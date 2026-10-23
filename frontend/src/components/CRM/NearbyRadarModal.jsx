import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  FiX, FiNavigation, FiMapPin, FiPhone, FiMessageSquare, 
  FiRadio, FiRefreshCw, FiAlertCircle, FiChevronRight, FiTruck, FiPlay, FiSearch
} from 'react-icons/fi';
import { crmApi } from '../../api/client';
import { openWhatsApp } from '../../utils/whatsapp';

const CITY_CENTERS = [
  { name: 'Samsun', lat: 41.2867, lng: 36.33, isHub: true },
  { name: 'Sinop', lat: 42.0231, lng: 35.1531 },
  { name: 'Çorum', lat: 40.5506, lng: 34.9556 },
  { name: 'Ordu', lat: 40.9839, lng: 37.8764 },
  { name: 'Amasya', lat: 40.6534, lng: 35.8331 },
  { name: 'Tokat', lat: 40.3167, lng: 36.5500 },
];

const RADIUS_OPTIONS = [
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
  { label: 'Tüm Bölge (300 km)', value: 300 },
];

export default function NearbyRadarModal({ isOpen, onClose, onStartVisit }) {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('Samsun');
  const [coords, setCoords] = useState({ lat: 41.2867, lng: 36.33 });
  const [userGpsCoords, setUserGpsCoords] = useState(null);
  const [radius, setRadius] = useState(50); // Varsayılan 50 km ile zengin müşteri havuzu
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [notice, setNotice] = useState(null);

  // Modal her açıldığında anında yükle (GPS beklemeden ilk veriyi 50ms'de getir)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // 1. Anında varsayılan Samsun bayisi koordinatlarıyla müşterileri yükle
      const targetCoords = userGpsCoords || { lat: 41.2867, lng: 36.33 };
      fetchNearby(targetCoords.lat, targetCoords.lng, radius);
      
      // 2. Arka planda sessizce canlı GPS iste (bekletmeden)
      requestGpsSilently();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC tuşuna basınca kapat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const requestGpsSilently = () => {
    if (!navigator.geolocation) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setUserGpsCoords({ lat: uLat, lng: uLng });
        setLocating(false);

        // Kullanıcının Samsun merkezine mesafesini kabaca hesapla
        const dLat = (uLat - 41.2867) * 111;
        const dLng = (uLng - 36.33) * 85;
        const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

        // Kullanıcı Karadeniz bölgesindeyse (< 250 km) otomatik GPS'e geç
        if (distKm <= 250) {
          setSelectedCity('GPS');
          setCoords({ lat: uLat, lng: uLng });
          fetchNearby(uLat, uLng, radius);
        } else {
          setNotice(`Canlı GPS'iniz bölge dışında (~${Math.round(distKm)} km). Bayi merkezli portföy gösterilmektedir.`);
        }
      },
      (err) => {
        console.warn('GPS sessiz okunamadı:', err);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  const fetchNearby = async (lat, lng, r) => {
    try {
      setLoading(true);
      const res = await crmApi.getNearbyCustomers(lat, lng, r, 50);
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Nearby fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (cityObj) => {
    setSelectedCity(cityObj.name);
    setCoords({ lat: cityObj.lat, lng: cityObj.lng });
    setNotice(null);
    fetchNearby(cityObj.lat, cityObj.lng, radius);
  };

  const handleUseGpsClick = () => {
    if (userGpsCoords) {
      setSelectedCity('GPS');
      setCoords(userGpsCoords);
      setNotice(null);
      fetchNearby(userGpsCoords.lat, userGpsCoords.lng, radius);
      return;
    }

    setLocating(true);
    if (!navigator.geolocation) {
      alert('Cihazınızda GPS desteği bulunamadı.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setUserGpsCoords({ lat: uLat, lng: uLng });
        setSelectedCity('GPS');
        setCoords({ lat: uLat, lng: uLng });
        setLocating(false);
        fetchNearby(uLat, uLng, radius);
      },
      (err) => {
        setLocating(false);
        alert('GPS konumu alınamadı: ' + (err.message || 'Lütfen konum izni verin.'));
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    const targetLat = coords?.lat || 41.2867;
    const targetLng = coords?.lng || 36.33;
    fetchNearby(targetLat, targetLng, newRadius);
  };

  // Filtrelenmiş liste
  const filteredCustomers = useMemo(() => {
    if (!searchFilter.trim()) return customers;
    const q = searchFilter.toLowerCase();
    return customers.filter(c => 
      c.company_name?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.sector?.toLowerCase().includes(q) ||
      c.interested_vehicle?.toLowerCase().includes(q)
    );
  }, [customers, searchFilter]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 11, 24, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(180deg, #0d1a30 0%, #080f1d 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: 18,
          width: '100%',
          maxWidth: 720,
          maxHeight: '92vh',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 30px rgba(2, 132, 199, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2b54 0%, #07152b 100%)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(2, 132, 199, 0.6)'
            }}>
              <FiRadio size={24} className={locating || loading ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Yakınımdaki Müşteriler
                </h2>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.18)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em'
                }}>
                  GPS CANLI RADAR
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', marginTop: 3 }}>
                Merkez: <strong style={{ color: '#38bdf8' }}>{selectedCity === 'GPS' ? '📍 Canlı Konumunuz' : `${selectedCity} Bayi`}</strong> · Yarıçap: <strong style={{ color: '#f8fafc' }}>{radius} km</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => fetchNearby(coords.lat, coords.lng, radius)}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                borderRadius: 8,
                padding: '7px 11px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.78rem',
                fontWeight: 600
              }}
              title="Yenile"
            >
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Tazele</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease'
              }}
              title="Kapat (ESC)"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Bölge & Şehir Seçici Barı (Tek Tıkla Merkez Değiştirme) */}
        <div style={{
          background: 'rgba(10, 20, 38, 0.95)',
          padding: '10px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            MERKEZ:
          </span>

          {/* Canlı GPS Butonu */}
          <button
            type="button"
            onClick={handleUseGpsClick}
            disabled={locating}
            style={{
              background: selectedCity === 'GPS' 
                ? 'linear-gradient(135deg, #0284c7, #2563eb)' 
                : 'rgba(2, 132, 199, 0.12)',
              color: selectedCity === 'GPS' ? '#fff' : '#38bdf8',
              border: '1px solid',
              borderColor: selectedCity === 'GPS' ? '#38bdf8' : 'rgba(2, 132, 199, 0.35)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.15s ease'
            }}
          >
            <FiNavigation size={12} className={locating ? 'animate-spin' : ''} />
            {locating ? 'GPS Aranıyor...' : '📍 Canlı GPS Konumum'}
          </button>

          {/* Şehir Merkezleri */}
          {CITY_CENTERS.map(c => {
            const active = selectedCity === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleCitySelect(c)}
                style={{
                  background: active ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                  color: active ? '#fff' : '#94a3b8',
                  border: '1px solid',
                  borderColor: active ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 20,
                  padding: '4px 11px',
                  fontSize: '0.74rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {c.name} {c.isHub ? '(Bayi)' : ''}
              </button>
            );
          })}
        </div>

        {/* Yarıçap & Filtreleme Barı */}
        <div style={{
          background: 'rgba(8, 15, 29, 0.85)',
          padding: '10px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          {/* Yarıçap Butonları */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              YARIÇAP:
            </span>
            {RADIUS_OPTIONS.map(opt => {
              const active = radius === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleRadiusChange(opt.value)}
                  style={{
                    background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#38bdf8' : '#94a3b8',
                    border: '1px solid',
                    borderColor: active ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: '3px 10px',
                    fontSize: '0.72rem',
                    fontWeight: active ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Müşteri İçi Hızlı Arama */}
          <div style={{ position: 'relative', minWidth: 160 }}>
            <FiSearch size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Listede firma ara..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                padding: '4px 8px 4px 26px',
                fontSize: '0.74rem',
                color: '#fff',
                outline: 'none',
                width: '100%',
                maxWidth: 180
              }}
            />
          </div>
        </div>

        {/* Bilgilendirme Notu (GPS uyarısı vb.) */}
        {notice && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '8px 18px',
            fontSize: '0.74rem',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FiAlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{notice}</span>
          </div>
        )}

        {/* Müşteri Listesi İçeriği */}
        <div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1, maxHeight: 'calc(92vh - 190px)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
              <div style={{
                width: 36,
                height: 36,
                border: '3px solid rgba(2, 132, 199, 0.2)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                margin: '0 auto 12px',
                animation: 'spin 0.8s linear infinite'
              }} />
              <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc', margin: '0 0 4px' }}>
                Müşteri koordinatları taranıyor...
              </p>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{selectedCity} ve çevresindeki firmalar listeleniyor</span>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              borderRadius: 14,
              background: 'rgba(15, 23, 42, 0.4)'
            }}>
              <div style={{ fontSize: '36px', marginBottom: 10 }}>📍</div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' }}>
                {searchFilter ? 'Aramaya uygun müşteri bulunamadı' : `Bu yarıçapta (${radius} km) müşteri bulunamadı`}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 16px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                {searchFilter 
                  ? 'Farklı bir anahtar kelime deneyebilir veya arama filtresini temizleyebilirsiniz.'
                  : 'Arama yarıçapını genişleterek veya Samsun / Sinop / Çorum bayilerini seçerek diğer firmaları görüntüleyebilirsiniz.'}
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleRadiusChange(100)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  100 km Olarak Genişlet
                </button>
                <button
                  type="button"
                  onClick={() => handleCitySelect(CITY_CENTERS[0])}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Samsun Bayi Portföyünü Getir
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Bulunan Müşteri Sayısı Başlığı */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: '0.76rem', color: '#94a3b8' }}>
                <span>
                  Toplam: <strong style={{ color: '#38bdf8' }}>{filteredCustomers.length} firma</strong>
                  {searchFilter && <span style={{ color: '#fbbf24', marginLeft: 6 }}>({searchFilter} filtreli)</span>}
                </span>
                <span>En yakından uzağa sıralı</span>
              </div>

              {/* Müşteri Kartları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'border-color 0.2s ease, background 0.2s ease'
                    }}
                  >
                    {/* Sol Bilgiler */}
                    <div style={{ flex: '1 1 260px', minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f8fafc' }}>
                          {c.company_name}
                        </span>
                        <span style={{
                          background: 'rgba(2, 132, 199, 0.2)',
                          color: '#38bdf8',
                          border: '1px solid rgba(2, 132, 199, 0.45)',
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {c.distance_km < 1 ? `${Math.round(c.distance_km * 1000)} m` : `${c.distance_km} km`}
                        </span>
                        {c.segment && (
                          <span style={{
                            background: c.segment === 'A' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: c.segment === 'A' ? '#fbbf24' : '#60a5fa',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}>
                            Seg. {c.segment}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.75rem', color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiMapPin size={12} style={{ color: '#64748b' }} />
                          {[c.district, c.city].filter(Boolean).join(', ') || 'Samsun'}
                        </span>
                        {c.interested_vehicle && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8', fontWeight: 600 }}>
                            <FiTruck size={12} />
                            {c.interested_vehicle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sağ Hızlı Saha Aksiyon Butonları */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {/* Ziyaret Başlat Butonu */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onStartVisit) {
                            onStartVisit(c);
                          } else {
                            onClose();
                            navigate(`/customers/${c.id}`);
                          }
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '7px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                        title="Bu firmaya hemen ziyaret kaydı başlat"
                      >
                        <FiPlay size={12} /> Ziyaret Başlat
                      </button>

                      {/* Telefonla Ara */}
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 8,
                            padding: '7px 10px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none'
                          }}
                          title="Telefonla Ara"
                        >
                          <FiPhone size={14} />
                        </a>
                      )}

                      {/* WhatsApp */}
                      {c.phone && (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(c.phone, '', { customer: c, defaultStatus: 'offer_given' })}
                          style={{
                            background: 'rgba(37, 211, 102, 0.15)',
                            color: '#25d366',
                            border: '1px solid rgba(37, 211, 102, 0.3)',
                            borderRadius: 8,
                            padding: '7px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="WhatsApp İle İletişime Geç"
                        >
                          <FiMessageSquare size={14} />
                        </button>
                      )}

                      {/* Apple / Google Haritalar Yol Tarifi */}
                      <a
                        href={c.apple_maps_url || c.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.company_name + ' ' + (c.city || 'Samsun'))}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: 8,
                          padding: '7px 10px',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          textDecoration: 'none'
                        }}
                        title="Haritada Yol Tarifi Al"
                      >
                        <FiNavigation size={14} />
                      </a>

                      {/* Müşteri Detayı */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(`/customers/${c.id}`);
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#cbd5e1',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 8,
                          padding: '7px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Müşteri Profiline Git"
                      >
                        <FiChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alt Bilgi */}
        <div style={{
          background: 'rgba(5, 11, 24, 0.95)',
          padding: '10px 18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <span>⚡ IVECO PRIEST OS Saha İstihbarat Radarı</span>
          <span>Haritada görüntülemek için <button type="button" onClick={() => { onClose(); navigate('/map'); }} style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Harita Ekranı</button></span>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
