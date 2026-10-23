import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiX, FiNavigation, FiMapPin, FiPhone, FiMessageSquare, 
  FiRadio, FiRefreshCw, FiAlertCircle, FiChevronRight, FiTruck, FiPlay
} from 'react-icons/fi';
import { crmApi } from '../../api/client';
import { openWhatsApp } from '../../utils/whatsapp';

const RADIUS_OPTIONS = [
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
];

export default function NearbyRadarModal({ isOpen, onClose, onStartVisit }) {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(25);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackCity, setFallbackCity] = useState('Samsun');

  useEffect(() => {
    if (isOpen) {
      locateUserAndFetch();
    }
  }, [isOpen]);

  const locateUserAndFetch = () => {
    setLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Cihazınızda GPS desteği bulunamadı. Varsayılan Samsun bayisi konumu kullanılıyor.');
      useDefaultLocation(41.2867, 36.33, 'Samsun');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoords(userCoords);
        setLocating(false);
        fetchNearby(userCoords.lat, userCoords.lng, radius);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        setError('GPS konumu alınamadı. Samsun bayisi merkezli radar çalıştırılıyor.');
        useDefaultLocation(41.2867, 36.33, 'Samsun');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const useDefaultLocation = (lat, lng, cityName) => {
    const defaultCoords = { lat, lng };
    setCoords(defaultCoords);
    setFallbackCity(cityName);
    fetchNearby(lat, lng, radius);
  };

  const fetchNearby = async (lat, lng, r) => {
    try {
      setLoading(true);
      const res = await crmApi.getNearbyCustomers(lat, lng, r, 50);
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Nearby fetch error:', err);
      setError('Yakındaki müşteriler sorgulanırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    const targetLat = coords?.lat || 41.2867;
    const targetLng = coords?.lng || 36.33;
    fetchNearby(targetLat, targetLng, newRadius);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-card, #111833)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 680,
          maxHeight: '88vh',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f274a 0%, #0a1128 100%)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(2, 132, 199, 0.5)'
            }}>
              <FiRadio size={22} className="animate-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Yakınımdaki Müşteriler
                </h2>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  GPS RADAR
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                {locating 
                  ? 'Konum tespit ediliyor...' 
                  : coords 
                  ? `${radius} km yarıçapındaki müşteriler (Mesafe sıralı)` 
                  : `${fallbackCity} bayisi çevresi`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={locateUserAndFetch}
              disabled={locating || loading}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                borderRadius: 8,
                padding: '7px 10px',
                cursor: (locating || loading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.78rem',
                fontWeight: 600
              }}
              title="Konumu Yenile"
            >
              <FiRefreshCw size={14} className={locating || loading ? 'loading-pulse' : ''} />
              Yenile
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <FiX size={22} />
            </button>
          </div>
        </div>

        {/* Yarıçap Filtresi */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '10px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiNavigation size={14} style={{ color: '#38bdf8' }} /> ARAMA YARIÇAPI:
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RADIUS_OPTIONS.map(opt => {
              const active = radius === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleRadiusChange(opt.value)}
                  style={{
                    background: active ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                    color: active ? '#fff' : '#94a3b8',
                    border: '1px solid',
                    borderColor: active ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 20,
                    padding: '4px 12px',
                    fontSize: '0.76rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Müşteri Listesi */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, maxHeight: 'calc(88vh - 150px)' }}>
          {error && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12
            }}>
              <FiAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading || locating ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
              <div className="loading-pulse" style={{ margin: '0 auto 16px' }}></div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', margin: '0 0 4px' }}>
                {locating ? 'GPS konumu eşleniyor...' : 'Yakındaki müşteriler taranıyor...'}
              </p>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Lütfen bekleyin...</span>
            </div>
          ) : customers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              borderRadius: 12
            }}>
              <div style={{ fontSize: '32px', marginBottom: 10 }}>📍</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px' }}>
                Bu yarıçapta ({radius} km) kayıtlı müşteri bulunamadı
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 16px' }}>
                Arama yarıçapını genişleterek bölgedeki diğer firmaları görüntüleyebilirsiniz.
              </p>
              <button
                onClick={() => handleRadiusChange(50)}
                style={{
                  background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                50 km Olarak Genişlet
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: '0.78rem', color: '#94a3b8' }}>
                <span>Bulunan: <strong style={{ color: '#38bdf8' }}>{customers.length} müşteri</strong></span>
                <span>En yakından uzağa sıralı</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {customers.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    {/* Sol Bilgiler */}
                    <div style={{ flex: '1 1 280px', minWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f8fafc' }}>
                          {c.company_name}
                        </span>
                        <span style={{
                          background: 'rgba(2, 132, 199, 0.2)',
                          color: '#38bdf8',
                          border: '1px solid rgba(2, 132, 199, 0.4)',
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
                            Segment {c.segment}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.76rem', color: '#94a3b8' }}>
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

                    {/* Sağ Aksiyon Butonları */}
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
                        title="Bu firmaya ziyaret kaydı başlat"
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
                          title="WhatsApp Aç"
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
                        title="Müşteri Kartına Git"
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
      </div>
    </div>
  );
}
