import { scannerApi } from '../api/client';

let mapsPromise = null;

export const mapService = {
  /**
   * Google Maps API SDK'sını dinamik olarak yükler.
   */
  loadGoogleMaps: async () => {
    if (mapsPromise) return mapsPromise;

    mapsPromise = new Promise(async (resolve, reject) => {
      // 1. Zaten yüklü ise hemen dön
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
        return;
      }

      try {
        // 2. API anahtarını backend'den çek
        const res = await scannerApi.getConfig();
        const apiKey = res.data.google_maps_api_key;

        // Eger mock key ise veya bos ise hata fırlat (Mock fallback yapılacak)
        if (!apiKey || apiKey === 'MOCK_GOOGLE_MAPS_API_KEY') {
          reject(new Error('Geçerli bir Google Maps API anahtarı yapılandırılmamış.'));
          return;
        }

        // 3. Script elementini oluşturup DOM'a ekle (Dynamic Script Injection)
        const script = document.createElement('script');
        // Güncel Google Maps JS SDK URL'i (libraries: places, routes)
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,routes&callback=__googleMapsCallback`;
        script.async = true;
        script.defer = true;

        window.__googleMapsCallback = () => {
          delete window.__googleMapsCallback;
          resolve(window.google.maps);
        };

        script.onerror = () => {
          reject(new Error('Google Maps script yükleme hatası.'));
        };

        document.head.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });

    return mapsPromise;
  },

  /**
   * İki koordinat arasındaki Haversine mesafesini (metre cinsinden) hesaplar.
   */
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
    const R = 6371e3; // Dünya yarıçapı (metre)
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Metre
  },

  /**
   * Mesafeyi okunabilir formatta (m veya km) döner.
   */
  formatDistance: (meters) => {
    if (!meters) return '0 m';
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  },

  /**
   * Google Maps Marker Clusterer kütüphanesini dinamik olarak yükler.
   */
  loadMarkerClusterer: () => {
    return new Promise((resolve, reject) => {
      if (window.markerClusterer) {
        resolve(window.markerClusterer);
        return;
      }
      const script = document.createElement('script');
      // En son stabil CDN sürümü
      script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve(window.markerClusterer);
      };
      script.onerror = () => {
        reject(new Error('MarkerClusterer kütüphanesi yüklenemedi.'));
      };
      document.head.appendChild(script);
    });
  }
};

