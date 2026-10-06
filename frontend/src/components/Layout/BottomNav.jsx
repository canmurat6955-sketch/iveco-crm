import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiMapPin, FiMap, FiMoreHorizontal, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import NearbyRadarModal from '../CRM/NearbyRadarModal';

export default function BottomNav({ onVisitStart }) {
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRadar, setShowRadar] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setShowMoreMenu(false);
    navigate('/login');
  };

  return (
    <>
      <div className="bottom-nav-container">
        <nav className="bottom-nav">
          <NavLink to="/" end className="bottom-nav-item">
            <FiHome size={20} />
            <span>Ana Sayfa</span>
          </NavLink>
          
          <NavLink to="/customers" className="bottom-nav-item">
            <FiUsers size={20} />
            <span>Müşteriler</span>
          </NavLink>
          
          <div className="bottom-nav-item center-action-item">
            <button className="visit-btn" onClick={onVisitStart} aria-label="Ziyaret Başlat">
              <FiMapPin size={22} color="#fff" />
            </button>
            <span className="visit-btn-label">+ Ziyaret</span>
          </div>
          
          <button 
            className="bottom-nav-item" 
            onClick={() => setShowRadar(true)}
            style={{ color: '#38bdf8' }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="animate-ping" style={{ position: 'absolute', top: -2, right: -4, width: 7, height: 7, borderRadius: '50%', background: '#38bdf8', opacity: 0.75 }}></span>
              <span style={{ position: 'absolute', top: -2, right: -4, width: 7, height: 7, borderRadius: '50%', background: '#0284c7' }}></span>
              <FiMap size={20} />
            </div>
            <span style={{ fontWeight: 600 }}>Radar</span>
          </button>
          
          <button className="bottom-nav-item" onClick={() => setShowMoreMenu(!showMoreMenu)}>
            <FiMoreHorizontal size={20} />
            <span>Daha Fazla</span>
          </button>
        </nav>

        {showMoreMenu && (
          <div className="more-menu-overlay" onClick={() => setShowMoreMenu(false)}>
            <div className="more-menu" onClick={e => e.stopPropagation()}>
              <div className="more-menu-header">Mobil Hızlı Menü</div>
              
              <button 
                className="more-menu-item" 
                onClick={() => { setShowRadar(true); setShowMoreMenu(false); }} 
                style={{ fontWeight: 'bold', color: '#0284c7', background: 'rgba(2, 132, 199, 0.08)' }}
              >
                🛰️ Yakınımdaki Müşteriler (GPS Radar)
              </button>

              <button className="more-menu-item" onClick={() => { navigate('/proforma/quick'); setShowMoreMenu(false); }} style={{ fontWeight: 'bold', color: '#10b981' }}>
                📄 1-Tıkla Proforma Sihirbazı
              </button>

              <button className="more-menu-item" onClick={() => { navigate('/contacts'); setShowMoreMenu(false); }} style={{ fontWeight: 'bold' }}>
                📇 Kişilerim (Rehber)
              </button>
              
              <button className="more-menu-item" onClick={() => { navigate('/vehicles/management'); setShowMoreMenu(false); }}>
                🚛 Araç Kataloğu, Stok & Talepler
              </button>

              <button className="more-menu-item" onClick={() => { navigate('/map'); setShowMoreMenu(false); }}>
                🗺️ Müşteri Haritası (Tümü)
              </button>

              <button className="more-menu-item" onClick={() => { navigate('/discovery'); setShowMoreMenu(false); }}>
                🧭 Firma Keşfi (Discovery)
              </button>
              
              <button className="more-menu-item" onClick={() => { navigate('/routes'); setShowMoreMenu(false); }}>
                🚗 Saha Rota Planlayıcı
              </button>

              <button className="more-menu-item" onClick={() => { navigate('/sales'); setShowMoreMenu(false); }}>
                📈 Satış Takip & Fırsatlar
              </button>
              
              <button className="more-menu-item" onClick={() => { navigate('/pipeline'); setShowMoreMenu(false); }}>
                📋 Pipeline (Kanban)
              </button>
              
              <button className="more-menu-item" onClick={() => { navigate('/campaigns'); setShowMoreMenu(false); }}>
                📂 Kampanyalar & Katalog
              </button>
              
              <button className="more-menu-item" onClick={() => { navigate('/notifications'); setShowMoreMenu(false); }}>
                🔔 Hatırlatıcılar & Bildirimler
              </button>

              <div style={{ height: 1, background: 'var(--border-color)', margin: '6px 0' }} />

              <button 
                className="more-menu-item" 
                onClick={handleLogout} 
                style={{ color: '#ef4444', fontWeight: 600 }}
              >
                <FiLogOut style={{ marginRight: 6 }} /> Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GPS Radar Modal */}
      <NearbyRadarModal
        isOpen={showRadar}
        onClose={() => setShowRadar(false)}
      />
    </>
  );
}
