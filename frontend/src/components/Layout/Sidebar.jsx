import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/client';
import { FiHome, FiUsers, FiActivity, FiFolder, FiBell, FiColumns, FiCompass, FiFileText, FiTruck, FiBookOpen, FiPhoneCall, FiCamera, FiTarget, FiEye, FiLogOut, FiMessageSquare, FiChevronDown, FiChevronUp, FiTool } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import WhatsAppIntegrationModal from '../CRM/WhatsAppIntegrationModal';

const SECONDARY_PATHS = ['/scan-card', '/discovery', '/intent-radar', '/sales', '/contacts', '/campaigns', '/vehicles/management'];

export default function Sidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const isSecondaryRouteActive = SECONDARY_PATHS.some(p => location.pathname.startsWith(p));
  const [showSecondaryMenu, setShowSecondaryMenu] = useState(isSecondaryRouteActive);

  useEffect(() => {
    if (isSecondaryRouteActive) {
      setShowSecondaryMenu(true);
    }
  }, [isSecondaryRouteActive]);

  useEffect(() => {
    notificationsApi.getUnreadCount()
      .then(res => setUnreadCount(res.data.count))
      .catch(() => {});
    const interval = setInterval(() => {
      notificationsApi.getUnreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  
  const { user, logout } = useAuth();
  let userName = user?.full_name || 'Can Murat Onay';
  const userRole = (user?.role === 'admin' && !userName.includes('Murat')) ? 'Yönetici' : 'Satış Sorumlusu';
  const userAvatar = userName.charAt(0);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ padding: '16px 12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
          <img src="/logo-iveco-white.png" alt="IVECO" style={{ height: '20px', objectFit: 'contain' }} />
          <div style={{ height: '18px', width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
          <img src="/logo-erc-samsun-white.png" alt="ERC Samsun" style={{ height: '24px', objectFit: 'contain' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7dd3fc', letterSpacing: '0.5px' }}>MÜŞTERİ İSTİHBARAT</div>
          <div style={{ fontSize: '0.66rem', color: '#e2e8f0', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Yetkili Satıcı & Servis</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Günlük İş Akışı</div>
          <NavLink to="/" end className={`nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
            <span className="nav-icon"><FiHome size={18} /></span>
            Bugün & Dashboard
          </NavLink>
          <NavLink to="/workbench" className={`nav-item ${isActive('/workbench') ? 'active' : ''}`}>
            <span className="nav-icon"><FiPhoneCall size={18} /></span>
            Çalışma Masası
          </NavLink>
          <NavLink to="/customers" className={`nav-item ${isActive('/customers') ? 'active' : ''}`}>
            <span className="nav-icon"><FiUsers size={18} /></span>
            Müşteriler
          </NavLink>
          <NavLink to="/proforma/quick" className={`nav-item ${isActive('/proforma/quick') ? 'active' : ''}`}>
            <span className="nav-icon" style={{ color: '#38bdf8' }}><FiFileText size={18} /></span>
            Hızlı Proforma
          </NavLink>
          <NavLink to="/pipeline" className={`nav-item ${isActive('/pipeline') ? 'active' : ''}`}>
            <span className="nav-icon"><FiColumns size={18} /></span>
            Pipeline & Fırsatlar
          </NavLink>
          <a
            href="/fiyat-listesi"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(0, 75, 147, 0.25) 100%)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              fontWeight: 700,
              marginTop: '6px'
            }}
            title="Müşterilerinize göndereceğiniz 2026 fiyat listesi ve kredi portalını aç & test et"
          >
            <span className="nav-icon" style={{ color: '#38bdf8' }}><FiEye size={18} /></span>
            Müşteri Portalı (Canlı)
          </a>
        </div>

        <div className="nav-section">
          <button
            type="button"
            onClick={() => setShowSecondaryMenu(prev => !prev)}
            style={{
              width: '100%',
              background: showSecondaryMenu ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: showSecondaryMenu ? '6px' : '0'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <FiTool size={14} color="#94a3b8" />
              <span>Saha & Yönetim Araçları</span>
            </span>
            {showSecondaryMenu ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
          </button>

          {showSecondaryMenu && (
            <div style={{ paddingLeft: '4px', borderLeft: '2px solid rgba(56, 189, 248, 0.25)', marginTop: '4px' }}>
              <NavLink to="/scan-card" className={`nav-item ${isActive('/scan-card') ? 'active' : ''}`}>
                <span className="nav-icon" style={{ color: '#ec4899' }}><FiCamera size={17} /></span>
                Kartvizit Tara
              </NavLink>
              <NavLink to="/discovery" className={`nav-item ${isActive('/discovery') ? 'active' : ''}`}>
                <span className="nav-icon"><FiCompass size={17} /></span>
                Firma Keşfi
              </NavLink>
              <NavLink to="/intent-radar" className={`nav-item ${isActive('/intent-radar') ? 'active' : ''}`}>
                <span className="nav-icon" style={{ color: '#f59e0b' }}><FiTarget size={17} /></span>
                Arama & Niyet Radarı
              </NavLink>
              <NavLink to="/sales" className={`nav-item ${isActive('/sales') ? 'active' : ''}`}>
                <span className="nav-icon"><FiActivity size={17} /></span>
                Satış Takip
              </NavLink>
              <NavLink to="/contacts" className={`nav-item ${isActive('/contacts') ? 'active' : ''}`}>
                <span className="nav-icon"><FiBookOpen size={17} /></span>
                Kişilerim
              </NavLink>
              <NavLink to="/campaigns" className={`nav-item ${isActive('/campaigns') ? 'active' : ''}`}>
                <span className="nav-icon"><FiFolder size={17} /></span>
                Kampanyalar
              </NavLink>
              <NavLink to="/vehicles/management" className={`nav-item ${isActive('/vehicles/management') ? 'active' : ''}`}>
                <span className="nav-icon"><FiTruck size={17} /></span>
                Araç Yönetimi
              </NavLink>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="nav-item"
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.12) 0%, rgba(18, 140, 126, 0.2) 100%)',
                  color: '#4ade80',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  fontWeight: 700,
                  marginTop: '6px',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span className="nav-icon" style={{ color: '#22c55e' }}><FiMessageSquare size={17} /></span>
                WhatsApp Bağlantısı
              </button>
            </div>
          )}
        </div>

        <div className="nav-section">
          <NavLink to="/notifications" className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}>
            <span className="nav-icon"><FiBell size={18} /></span>
            Bildirimler
            {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div className="user-avatar">{userAvatar}</div>
          <div className="user-info" style={{ minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div className="user-role">{userRole}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Oturumu kapatmak istediğinize emin misiniz?')) {
              logout();
            }
          }}
          title="Güvenli Çıkış Yap"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            padding: '6px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11.5px',
            fontWeight: 700,
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; }}
        >
          <FiLogOut size={14} />
          <span>Çıkış</span>
        </button>
      </div>

      <WhatsAppIntegrationModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </aside>
  );
}
