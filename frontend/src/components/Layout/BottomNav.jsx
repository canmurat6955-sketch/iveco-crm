import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiMapPin, FiMap, FiMoreHorizontal, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import NearbyRadarModal from '../CRM/NearbyRadarModal';
import VoiceDebriefModal from '../VoiceDebrief/VoiceDebriefModal';
import TCOCalculatorModal from '../TCO/TCOCalculatorModal';
import BodybuilderMatcherModal from '../Bodybuilder/BodybuilderMatcherModal';

export default function BottomNav({ onVisitStart }) {
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showVoiceDebrief, setShowVoiceDebrief] = useState(false);
  const [showTco, setShowTco] = useState(false);
  const [showBodybuilder, setShowBodybuilder] = useState(false);


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
              <div className="more-menu-header">Mobil Hızlı Menü</div>

              <button 
                className="more-menu-item" 
                onClick={() => { setShowVoiceDebrief(true); setShowMoreMenu(false); }} 
                style={{ fontWeight: 'bold', color: '#0284c7', background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.3)' }}
              >
                🎙️ Araç İçi Sesli Satış Notu (AI Debrief)
              </button>

              <button 
                className="more-menu-item" 
                onClick={() => { setShowTco(true); setShowMoreMenu(false); }} 
                style={{ fontWeight: 'bold', color: '#059669', background: 'rgba(5, 150, 105, 0.12)' }}
              >
                📊 TCO & Tasarruf Kıyaslama (50.000 km)
              </button>

              <button 
                className="more-menu-item" 
                onClick={() => { setShowBodybuilder(true); setShowMoreMenu(false); }} 
                style={{ fontWeight: 'bold', color: '#d97706', background: 'rgba(217, 119, 6, 0.12)' }}
              >
                🏗️ Şasi - Üst Yapı & İstiap Motoru
              </button>
              
              <button 
                className="more-menu-item" 
                onClick={() => { navigate('/scan-card'); setShowMoreMenu(false); }} 
                style={{ fontWeight: 'bold', color: '#f472b6', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)' }}
              >
                🎴 Kartvizit Tara & Yönlendir (Kamera)
              </button>


              <button 
                className="more-menu-item" 
                onClick={() => { navigate('/workbench'); setShowMoreMenu(false); }} 
                style={{ fontWeight: 'bold', color: '#38bdf8', background: 'rgba(2, 132, 199, 0.12)' }}
              >
                📞 Çalışma Masası (Bugün Aranacaklar)
              </button>

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

      <VoiceDebriefModal
        isOpen={showVoiceDebrief}
        onClose={() => setShowVoiceDebrief(false)}
      />

      <TCOCalculatorModal
        isOpen={showTco}
        onClose={() => setShowTco(false)}
      />

      <BodybuilderMatcherModal
        isOpen={showBodybuilder}
        onClose={() => setShowBodybuilder(false)}
      />
    </>
  );
}

