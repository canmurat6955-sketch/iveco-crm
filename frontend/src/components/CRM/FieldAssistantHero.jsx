import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../../hooks/useGeolocation';
import { 
  FiZap, FiMapPin, FiSearch, FiNavigation, FiPlus, 
  FiCompass, FiTruck, FiUsers, FiClock, FiAlertCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const TARGET_CITIES = [
  'Samsun', 'Ordu', 'Çorum', 'Amasya', 'Tokat', 
  'Sivas', 'Giresun', 'Sinop', 'Kastamonu'
];

export default function FieldAssistantHero({ 
  stats = {}, 
  selectedCity = 'Samsun', 
  onCityChange, 
  onOpenVisitModal,
  onOpenRadar 
}) {
  const navigate = useNavigate();
  const { location, loading: gpsLoading } = useGeolocation();
  const [promptQuery, setPromptQuery] = useState('');

  const handlePromptSubmit = (e) => {
    e?.preventDefault();
    const query = promptQuery.trim();
    if (!query) {
      toast.error('Lütfen bir sektör, firma adı veya araç modeli yazın.');
      return;
    }

    const lower = query.toLowerCase();
    // Hafriyat, gıda, akaryakıt, lojistik arandığında keşif veya müşteri listesine yönlendir
    if (lower.includes('keşif') || lower.includes('bul') || lower.includes('yeni')) {
      const cleanQ = query.replace(/(bul|listele|getir|göster|yeni|ara)/gi, '').trim();
      navigate(`/discovery?q=${encodeURIComponent(cleanQ || query)}`);
    } else if (lower.includes('rota') || lower.includes('güzergah')) {
      navigate('/routes');
    } else {
      // Varsayılan olarak müşterilerde veya keşifte ara
      navigate(`/discovery?q=${encodeURIComponent(query)}`);
    }
  };

  const handleChipClick = (sectorKeyword) => {
    navigate(`/discovery?q=${encodeURIComponent(sectorKeyword)}`);
  };

  return (
    <div 
      className="card mb-6" 
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.4) 50%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 10px 30px -5px rgba(2, 132, 199, 0.25), 0 0 15px rgba(56, 189, 248, 0.1)',
        borderRadius: 16,
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Arka plan parlama efekti */}
      <div 
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Üst Başlık & Konum Barı */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#fff',
              boxShadow: '0 0 15px rgba(2, 132, 199, 0.5)'
            }}
          >
            <FiZap size={22} className="animate-pulse" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.5px', color: '#f8fafc' }}>
                ⚡ SAHA SATIŞ ASİSTANI
              </h2>
              <span 
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid rgba(56, 189, 248, 0.4)'
                }}
              >
                Canlı Saha OS
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
              Bölgenizdeki fırsatları yönetin, rota ve ziyaretlerinizi tek merkezden yönlendirin
            </p>
          </div>
        </div>

        {/* Canlı Konum Seçici */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '6px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <FiMapPin 
            size={16} 
            style={{ 
              color: location ? '#10b981' : '#f59e0b',
              animation: gpsLoading ? 'spin 1s linear infinite' : 'none'
            }} 
          />
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
            Konum:
          </span>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange && onCityChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="Tümü" style={{ background: '#0f172a', color: '#f8fafc' }}>🌍 Tüm Bölge (9 İl)</option>
            {TARGET_CITIES.map(c => (
              <option key={c} value={c} style={{ background: '#0f172a', color: '#f8fafc' }}>{c}</option>
            ))}
          </select>
          {location && (
            <span 
              title="GPS Uydusu Aktif" 
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}
            />
          )}
        </div>
      </div>

      {/* Hızlı Arama & Prompt Girişi */}
      <form onSubmit={handlePromptSubmit} style={{ marginBottom: '1rem' }}>
        <div 
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="🔎 Ne aramak istiyorsunuz? (Örn: 'Samsun akaryakıt firmalarını bul', 'Hafriyatçıları listele', 'Çorum S-Way')..."
            value={promptQuery}
            onChange={(e) => setPromptQuery(e.target.value)}
            style={{
              height: 48,
              paddingLeft: 46,
              paddingRight: 110,
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1.5px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 12,
              fontSize: '0.9rem',
              color: '#f8fafc',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}
          />
          <FiSearch 
            size={18} 
            style={{ position: 'absolute', left: 16, color: '#38bdf8', pointerEvents: 'none' }} 
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              position: 'absolute',
              right: 6,
              height: 36,
              padding: '0 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0284c7, #2563eb)'
            }}
          >
            Firma Bul
          </button>
        </div>

        {/* Hızlı Sektör Çipleri */}
        <div 
          style={{
            display: 'flex',
            gap: 6,
            marginTop: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none'
          }}
        >
          {[
            { label: '🚜 Hafriyat & İnşaat', keyword: 'Hafriyat' },
            { label: '⛽ Akaryakıt & Petrol', keyword: 'Akaryakıt' },
            { label: '❄️ Frigo / Gıda', keyword: 'Gıda' },
            { label: '🚛 Lojistik & Nakliye', keyword: 'Lojistik' },
            { label: '🌾 Tarım & Yem', keyword: 'Tarım' },
            { label: '🏛️ Belediye & Kamu', keyword: 'Belediye' },
          ].map(chip => (
            <button
              key={chip.keyword}
              type="button"
              onClick={() => handleChipClick(chip.keyword)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: '0.74rem',
                color: '#cbd5e1',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                e.currentTarget.style.color = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </form>

      {/* 4 Ana Hızlı Aksiyon Butonu */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/customers')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '12px 10px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <div style={{ color: '#60a5fa' }}><FiUsers size={22} /></div>
          <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Firma Ara</span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CRM Portföyü</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenRadar ? onOpenRadar() : navigate('/map')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '12px 10px',
            borderRadius: 12,
            background: 'rgba(2, 132, 199, 0.1)',
            border: '1px solid rgba(2, 132, 199, 0.3)',
            color: '#f8fafc',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(2, 132, 199, 0.22)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(2, 132, 199, 0.1)';
          }}
        >
          <div style={{ color: '#38bdf8' }}><FiNavigation size={22} /></div>
          <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Yakınımdakiler</span>
          <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>
            {stats.nearby_5km ? `${stats.nearby_5km} Müşteri (5 km)` : 'GPS Radarı'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/routes')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '12px 10px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <div style={{ color: '#f59e0b' }}><FiCompass size={22} /></div>
          <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Bugünün Rotası</span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Güzergah & Sıralama</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenVisitModal ? onOpenVisitModal() : navigate('/customers')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '12px 10px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            color: '#f8fafc',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
            transition: 'transform 0.15s ease, background 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.45))';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))';
          }}
        >
          <div style={{ color: '#34d399' }}><FiPlus size={22} /></div>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#34d399' }}>+ Ziyaret Başlat</span>
          <span style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>GPS Konumlu</span>
        </button>
      </div>
    </div>
  );
}
