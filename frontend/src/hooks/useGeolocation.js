import { useState, useEffect, useCallback } from 'react';

export default function useGeolocation(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Cihazınızda GPS/Konum desteği bulunmuyor.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        let msg = 'Konum alınırken bir hata oluştu.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Konum bilgisi şu an alınamıyor.';
            break;
          case err.TIMEOUT:
            msg = 'Konum isteği zaman aşımına uğradı.';
            break;
        }
        setError(msg);
        setLoading(false);
      },
      defaultOptions
    );
  }, [defaultOptions]);

  // İlk yüklemede konumu otomatik almaya çalış
  useEffect(() => {
    getLocation();
  }, []);

  return { location, error, loading, getLocation };
}
