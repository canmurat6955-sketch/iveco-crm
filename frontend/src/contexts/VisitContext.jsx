import { createContext, useContext, useState, useEffect } from 'react';
import { salesApi } from '../api/client';
import useGeolocation from '../hooks/useGeolocation';
import toast from 'react-hot-toast';

const VisitContext = createContext(null);

export function VisitProvider({ children }) {
  const [activeVisit, setActiveVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // GPS hook'unu kullanıyoruz (İhtiyaç anında tetiklemek için)
  const { location, error: gpsError, getLocation } = useGeolocation();

  // İlk yüklemede aktif ziyaret var mı sorgula
  useEffect(() => {
    salesApi.getActiveVisit()
      .then(res => {
        if (res.data) {
          setActiveVisit(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Ziyaret Başlat
  const startVisit = async (customerId, companyName) => {
    // 1. Zaten aktif ziyaret var mı kontrolü
    if (activeVisit) {
      toast.error(`Şu anda zaten '${activeVisit.company_name || "bir firmada"}' aktif bir ziyaretiniz bulunuyor.`);
      return false;
    }

    toast.loading("GPS konumu alınıyor ve ziyaret başlatılıyor...", { id: 'visit_loading' });
    
    // GPS konumunu yenile
    getLocation();

    try {
      const visitData = {
        customer_id: customerId,
        start_latitude: location ? location.latitude : null,
        start_longitude: location ? location.longitude : null,
        accuracy: location ? location.accuracy : null,
        address: null // Google reverse coding entegre edilebilir
      };

      const res = await salesApi.startVisit(visitData);
      // Backend Visit nesnesine company_name ekleyelim
      const visitObj = {
        ...res.data,
        company_name: companyName
      };
      
      setActiveVisit(visitObj);
      toast.success(`'${companyName}' ziyareti başarıyla başlatıldı! 📍`, { id: 'visit_loading' });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Ziyaret başlatılamadı.", { id: 'visit_loading' });
      return false;
    }
  };

  // Ziyareti Sonlandır
  const endVisit = async (notes, outcome, nextAction, nextFollowUpDate) => {
    if (!activeVisit) return false;

    toast.loading("Ziyaret sonlandırılıyor ve koordinatlar kaydediliyor...", { id: 'visit_end_loading' });
    getLocation();

    try {
      const endData = {
        notes,
        outcome,
        next_action: nextAction || null,
        next_follow_up_date: nextFollowUpDate || null,
        end_latitude: location ? location.latitude : null,
        end_longitude: location ? location.longitude : null
      };

      await salesApi.endVisit(activeVisit.id, endData);
      toast.success("Ziyaret başarıyla tamamlandı ve rapor kaydedildi. ✅", { id: 'visit_end_loading' });
      setActiveVisit(null);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Ziyaret sonlandırılamadı.", { id: 'visit_end_loading' });
      return false;
    }
  };

  return (
    <VisitContext.Provider value={{ activeVisit, startVisit, endVisit, loading, refreshActiveVisit: () => salesApi.getActiveVisit().then(r => setActiveVisit(r.data)) }}>
      {children}
    </VisitContext.Provider>
  );
}

export function useVisit() {
  const context = useContext(VisitContext);
  if (!context) throw new Error('useVisit must be used within VisitProvider');
  return context;
}
