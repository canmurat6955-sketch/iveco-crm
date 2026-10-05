import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiX, FiNavigation, FiMapPin, FiPhone, FiMessageSquare, FiExternalLink, 
  FiCompass, FiRadio, FiRefreshCw, FiAlertCircle, FiChevronRight, FiTruck, FiCheck, FiLoader 
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

export default function NearbyRadarModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(25);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackCity, setFallbackCity] = useState(null);

  useEffect(() => {
    if (isOpen) {
      locateUserAndFetch();
    }
  }, [isOpen]);

  const locateUserAndFetch = () => {
    setLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Cihazınızda GPS / Konum servisi desteklenmiyor.');
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
        setError('GPS konumu alınamadı (izin verilmemiş olabilir). Varsayılan Samsun bayisi konumu kullanılıyor.');
        useDefaultLocation(41.2867, 36.33, 'Samsun');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
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
    if (coords) {
      fetchNearby(coords.lat, coords.lng, newRadius);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Radar Animation */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-950 text-white relative overflow-hidden">
          {/* Subtle radar pulse effect */}
          <div className="absolute right-12 -top-10 w-40 h-40 bg-blue-500/10 rounded-full animate-ping pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/60 border border-blue-400/30 flex items-center justify-center shadow-lg">
              <FiRadio className="w-5 h-5 text-blue-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Yakınımdaki Müşteriler
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-mono">
                  GPS RADAR
                </span>
              </h2>
              <p className="text-xs text-blue-200/80">
                {locating 
                  ? 'Mevcut konum tespit ediliyor...' 
                  : coords 
                  ? `${radius} km yarıçapındaki müşteriler listeleniyor` 
                  : 'Konum bekleniyor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative z-10">
            <button
              onClick={locateUserAndFetch}
              disabled={locating || loading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
              title="Konumu Yenile"
            >
              <FiRefreshCw className={`w-4 h-4 ${locating || loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Radius Filter Chips */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <FiCompass className="w-3.5 h-3.5" /> Arama Yarıçapı:
          </span>
          <div className="flex items-center gap-1.5">
            {RADIUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleRadiusChange(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  radius === opt.value
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {loading || locating ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="relative mb-4">
                <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
                <FiRadio className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {locating ? 'GPS uyduları ile konum eşleniyor...' : 'Yakındaki müşteriler taranıyor...'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Lütfen bekleyin...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-14 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-3 text-xl">
                📍
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                Bu yarıçapta ({radius} km) müşteri bulunamadı
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Daha geniş bir alanı taramak için arama yarıçapını 25 km veya 50 km olarak deneyebilirsiniz.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleRadiusChange(50)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                >
                  50 km Olarak Genişlet
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                <span>Bulunan: <strong>{customers.length} müşteri</strong></span>
                <span>Mesafeye göre sıralı</span>
              </div>

              {customers.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {c.company_name}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {c.distance_km < 1 ? `${Math.round(c.distance_km * 1000)} m` : `${c.distance_km} km`}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        c.segment === 'A' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        c.segment === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        Segment {c.segment}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <FiMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {[c.district, c.city].filter(Boolean).join(', ') || 'Konum belirtilmedi'}
                      </span>
                      {c.interested_vehicle && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md font-medium truncate">
                          <FiTruck className="w-3 h-3" />
                          {c.interested_vehicle}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons for Field Reps */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                    {/* Call Directly */}
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1 text-xs font-semibold transition-all active:scale-95"
                        title="Telefonla Ara"
                      >
                        <FiPhone className="w-4 h-4" />
                        <span className="hidden sm:inline">Ara</span>
                      </a>
                    )}

                    {/* WhatsApp with Customer Info Modal */}
                    {c.phone && (
                      <button
                        type="button"
                        onClick={() => openWhatsApp(c.phone, '', { customer: c, defaultStatus: 'offer_given' })}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1 text-xs font-semibold transition-all active:scale-95"
                        title="WhatsApp & Bilgi Girişi"
                      >
                        <FiMessageSquare className="w-4 h-4 text-[#25d366]" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    )}

                    {/* Apple Maps 1-Tap Directions */}
                    <a
                      href={c.apple_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 flex items-center gap-1 text-xs font-semibold shadow-sm transition-all active:scale-95"
                      title="Apple Haritalar ile Yol Tarifi"
                    >
                      <FiNavigation className="w-4 h-4 text-blue-400" />
                      <span className="hidden sm:inline">Yol Tarifi</span>
                    </a>

                    {/* Google Maps Fallback */}
                    <a
                      href={c.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-all"
                      title="Google Haritalar"
                    >
                      <FiMapPin className="w-4 h-4 text-red-500" />
                    </a>

                    {/* View Customer Detail */}
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/customers/${c.id}`);
                      }}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition-all"
                      title="Müşteri Detayına Git"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
