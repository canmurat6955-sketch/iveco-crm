import { useState, useEffect } from 'react';
import { crmApi, salesApi, vehiclesApi } from '../../api/client';
import useGeolocation from '../../hooks/useGeolocation';
import { useVisit } from '../../contexts/VisitContext';
import { FiX, FiCheck, FiMapPin, FiTruck, FiUser, FiCalendar, FiFileText, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function QuickVisitModal({ isOpen, onClose, initialCustomerId, initialCompanyName, onSuccess }) {
  const { location, getLocation, loading: gpsLoading } = useGeolocation();
  const { startVisit, endVisit, activeVisit } = useVisit();

  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [contactName, setContactName] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('Daily');
  const [visitNote, setVisitNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getLocation();
      if (initialCustomerId) {
        setSelectedCustomer({ id: initialCustomerId, company_name: initialCompanyName || 'Müşteri' });
      } else if (activeVisit) {
        setSelectedCustomer({ id: activeVisit.customer_id, company_name: activeVisit.company_name });
      }
    }
  }, [isOpen, initialCustomerId, initialCompanyName, activeVisit]);

  // Arama yaptıkça müşterileri bul
  useEffect(() => {
    if (customerSearch.trim().length >= 2 && !selectedCustomer) {
      crmApi.getCustomers({ search: customerSearch.trim(), limit: 8 })
        .then(res => {
          setSearchResults(res.data.items || []);
        })
        .catch(() => {});
    } else {
      setSearchResults([]);
    }
  }, [customerSearch, selectedCustomer]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('Lütfen bir müşteri seçin.');
      return;
    }

    setSaving(true);
    toast.loading('Ziyaret kaydı oluşturuluyor...', { id: 'save_visit' });

    try {
      const fullNote = `Yetkili: ${contactName || 'Belirtilmedi'} | İlgilenilen Araç: ${selectedVehicle} | Not: ${visitNote || 'Detaylı görüşme yapıldı.'}`;
      
      // 1. Ziyaret kaydını tamamla
      if (activeVisit && activeVisit.customer_id === selectedCustomer.id) {
        await endVisit(fullNote, 'interested', 'Teklif hazırlanacak / Takip', followUpDate);
      } else {
        // Yeni bir anlık hızlı ziyaret oluştur ve sonlandır
        const startRes = await salesApi.startVisit({
          customer_id: selectedCustomer.id,
          start_latitude: location?.latitude || null,
          start_longitude: location?.longitude || null,
          accuracy: location?.accuracy || null
        });
        const visitId = startRes.data.id;
        await salesApi.endVisit(visitId, {
          notes: fullNote,
          outcome: 'interested',
          next_action: `${selectedVehicle} için teklif ve takip`,
          next_follow_up_date: followUpDate,
          end_latitude: location?.latitude || null,
          end_longitude: location?.longitude || null
        });
      }

      // 2. Müşteriye araç ilgisini kaydet (isteğe bağlı arka plan çağrısı)
      try {
        await vehiclesApi.createCustomerInterest(selectedCustomer.id, {
          series: selectedVehicle,
          interest_level: 'high',
          notes: `Saha ziyaretinde ${selectedVehicle} ilgisi belirtildi. Not: ${visitNote}`
        });
      } catch {
        // Hata verse bile ziyareti engelleme
      }

      toast.success('Hızlı ziyaret kaydı başarıyla tamamlandı! 🚀', { id: 'save_visit' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Ziyaret kaydedilemedi.', { id: 'save_visit' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-card, #1e293b)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Başlık */}
        <div 
          style={{
            background: 'linear-gradient(90deg, #1e3a8a, #0f172a)',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ color: '#38bdf8' }}><FiMapPin size={20} /></div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                Hızlı Saha Ziyareti Kaydı
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {location ? '📍 GPS Konumunuz Alındı' : 'GPS Alınıyor...'}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Gövde */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 1. Müşteri Seçimi */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              1. Ziyaret Edilen Müşteri *
            </label>
            {selectedCustomer ? (
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  padding: '8px 12px',
                  borderRadius: 10
                }}
              >
                <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem' }}>
                  🏢 {selectedCustomer.company_name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Değiştir
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Firma adını yazmaya başlayın..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  style={{
                    height: 40,
                    paddingLeft: 36,
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: 8,
                    fontSize: '0.85rem'
                  }}
                  autoFocus
                />
                <FiSearch size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                
                {searchResults.length > 0 && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 8,
                      marginTop: 4,
                      maxHeight: 180,
                      overflowY: 'auto',
                      zIndex: 100,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }}
                  >
                    {searchResults.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setSearchResults([]);
                          setCustomerSearch('');
                        }}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                          {c.company_name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {c.city} • {c.segment || 'C'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Yetkili / Görüşülen Kişi */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              2. Görüşülen Yetkili
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Ahmet Bey (Satın Alma Müdürü)"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                style={{ height: 40, paddingLeft: 36, background: 'rgba(15, 23, 42, 0.8)', borderRadius: 8, fontSize: '0.85rem' }}
              />
              <FiUser size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            </div>
          </div>

          {/* 3. İlgilenilen Araç Modeli */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              3. İlgilenilen IVECO Modeli
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { key: 'S-Way', label: '🚛 S-Way' },
                { key: 'Eurocargo', label: '🚚 Eurocargo' },
                { key: 'Daily', label: '🚐 Daily' },
                { key: 'T-Way', label: '🚜 T-Way' },
              ].map(veh => {
                const isSel = selectedVehicle === veh.key;
                return (
                  <button
                    key={veh.key}
                    type="button"
                    onClick={() => setSelectedVehicle(veh.key)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 8,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      border: isSel ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: isSel ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSel ? '#38bdf8' : '#cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {veh.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Kısa Not */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              4. Ziyaret Notu (1 Cümle)
            </label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Örn: 2 adet 70C18 damper için teklif istedi, filodaki eski aracı takasa verebilir..."
              value={visitNote}
              onChange={e => setVisitNote(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: 8,
                fontSize: '0.85rem',
                resize: 'none'
              }}
            />
          </div>

          {/* 5. Takip Tarihi */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              5. Sonraki Takip Tarihi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="form-control"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                style={{ height: 40, paddingLeft: 36, background: 'rgba(15, 23, 42, 0.8)', borderRadius: 8, fontSize: '0.85rem' }}
              />
              <FiCalendar size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1, height: 44, borderRadius: 10 }}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving || !selectedCustomer}
              className="btn btn-primary"
              style={{
                flex: 2,
                height: 44,
                borderRadius: 10,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: '0.9rem'
              }}
            >
              <FiCheck size={18} />
              {saving ? 'Kaydediliyor...' : 'Ziyareti Kaydet & Tamamla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
