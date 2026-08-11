import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiMapPin, FiMap, FiMoreHorizontal } from 'react-icons/fi';
import { useState } from 'react';

export default function BottomNav({ onVisitStart }) {
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
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
        
        <button className="bottom-nav-item visit-btn" onClick={onVisitStart}>
          <div className="visit-icon-wrapper">
            <FiMapPin size={22} color="#fff" />
          </div>
          <span>+ Ziyaret</span>
        </button>
        
        <NavLink to="/map" className="bottom-nav-item">
          <FiMap size={20} />
          <span>Harita</span>
        </NavLink>
        
        <button className="bottom-nav-item" onClick={() => setShowMoreMenu(!showMoreMenu)}>
          <FiMoreHorizontal size={20} />
          <span>Daha Fazla</span>
        </button>
      </nav>

      {showMoreMenu && (
        <div className="more-menu-overlay" onClick={() => setShowMoreMenu(false)}>
          <div className="more-menu" onClick={e => e.stopPropagation()}>
            <div className="more-menu-header">Hızlı Erişim</div>
            <button className="more-menu-item" onClick={() => { navigate('/discovery'); setShowMoreMenu(false); }}>
              🧭 Firma Keşfi (Discovery)
            </button>
            <button className="more-menu-item" onClick={() => { navigate('/routes'); setShowMoreMenu(false); }}>
              🗺️ Rota Planlayıcı (Route)
            </button>

            <button className="more-menu-item" onClick={() => { navigate('/sales'); setShowMoreMenu(false); }}>
              📈 Satış Takip
            </button>
            <button className="more-menu-item" onClick={() => { navigate('/pipeline'); setShowMoreMenu(false); }}>
              📋 Pipeline (Kanban)
            </button>
            <button className="more-menu-item" onClick={() => { navigate('/campaigns'); setShowMoreMenu(false); }}>
              📂 Kampanyalar & Katalog
            </button>
            <button className="more-menu-item" onClick={() => { navigate('/notifications'); setShowMoreMenu(false); }}>
              🔔 Bildirimler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
