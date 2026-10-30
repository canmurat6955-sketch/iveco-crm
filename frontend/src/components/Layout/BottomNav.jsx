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
              <div className="more-menu-handle" />

              <div className="more-menu-header-bar">
                <div>
                  <span className="more-menu-title">📱 Saha Hızlı Menüsü</span>
                  <span className="more-menu-sub">Tüm araçlar & kısayollar</span>
                </div>
                <button 
                  type="button" 
                  className="more-menu-close-btn" 
                  onClick={() => setShowMoreMenu(false)}
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>

              {/* 1. KATEGORİ: TEKLİF & SATIŞ */}
              <div className="more-menu-section-label">⚡ TEKLİF & FİNANSMAN</div>
              <div className="more-menu-grid">
                <button 
                  type="button"
                  className="more-menu-card highlight" 
                  onClick={() => { navigate('/proforma/quick'); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">📄 1-Tıkla Proforma</span>
                  <span className="more-menu-card-sub">WhatsApp & PDF teklif</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { setShowTco(true); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">📊 TCO Kıyaslama</span>
                  <span className="more-menu-card-sub">50.000 km tasarruf</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { setShowBodybuilder(true); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">🏗️ Şasi & Üst Yapı</span>
                  <span className="more-menu-card-sub">İstiap & kasa seçici</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { navigate('/vehicles/management'); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">🚛 Araç Kataloğu</span>
                  <span className="more-menu-card-sub">Fabrika stok & talep</span>
                </button>
              </div>

              {/* 2. KATEGORİ: SAHA & KEŞİF */}
              <div className="more-menu-section-label">🛰️ SAHA & KEŞİF OPERASYONU</div>
              <div className="more-menu-grid">
                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { setShowRadar(true); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">🛰️ GPS Radarı</span>
                  <span className="more-menu-card-sub">5 km'deki müşteriler</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { navigate('/scan-card'); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">🎴 Kartvizit Tara</span>
                  <span className="more-menu-card-sub">Kamera ile OCR</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { navigate('/routes'); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">🚗 Saha Rotası</span>
                  <span className="more-menu-card-sub">Güzergah & randevu</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { navigate('/discovery'); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">🧭 Firma Keşfi</span>
                  <span className="more-menu-card-sub">Yeni potansiyel bul</span>
                </button>
              </div>

              {/* 3. KATEGORİ: MÜŞTERİ & İLETİŞİM */}
              <div className="more-menu-section-label">💼 MÜŞTERİ & İLETİŞİM</div>
              <div className="more-menu-grid">
                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { navigate('/workbench'); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">📞 Çalışma Masası</span>
                  <span className="more-menu-card-sub">Bugün aranacaklar</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { setShowVoiceDebrief(true); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">🎙️ Sesli Satış Notu</span>
                  <span className="more-menu-card-sub">Araç içi AI debrief</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { navigate('/contacts'); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">📇 Kişiler Rehberi</span>
                  <span className="more-menu-card-sub">Yetkili listesi</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { navigate('/sales'); setShowMoreMenu(false); }}
                >
                  <span className="more-menu-card-title">📈 Satış Takip</span>
                  <span className="more-menu-card-sub">Fırsatlar & pipeline</span>
                </button>
              </div>

              <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)', margin: '12px 0 8px 0' }} />

              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={() => { navigate('/notifications'); setShowMoreMenu(false); }}
                  style={{ flex: 1, minHeight: 44, padding: '8px 12px' }}
                >
                  <span className="more-menu-card-title" style={{ fontSize: '0.75rem' }}>🔔 Bildirimler</span>
                </button>

                <button 
                  type="button"
                  className="more-menu-card" 
                  onClick={handleLogout} 
                  style={{ flex: 1, minHeight: 44, padding: '8px 12px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <span className="more-menu-card-title" style={{ color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiLogOut size={14} /> Çıkış Yap
                  </span>
                </button>
              </div>
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

