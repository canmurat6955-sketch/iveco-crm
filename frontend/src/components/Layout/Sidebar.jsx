import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/client';
import { FiHome, FiUsers, FiActivity, FiFolder, FiBell, FiColumns, FiCompass, FiFileText, FiTruck, FiBookOpen, FiPhoneCall, FiCamera, FiTarget, FiEye, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>MÜŞTERİ İSTİHBARAT</div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>Yetkili Satıcı & Servis</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Ana Menü</div>
          <NavLink to="/" end className={`nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
            <span className="nav-icon"><FiHome size={18} /></span>
            Dashboard
          </NavLink>
          <NavLink to="/workbench" className={`nav-item ${isActive('/workbench') ? 'active' : ''}`}>
            <span className="nav-icon"><FiPhoneCall size={18} /></span>
            Çalışma Masası
          </NavLink>
          <NavLink to="/customers" className={`nav-item ${isActive('/customers') ? 'active' : ''}`}>
            <span className="nav-icon"><FiUsers size={18} /></span>
            Müşteriler
          </NavLink>
          <NavLink to="/contacts" className={`nav-item ${isActive('/contacts') ? 'active' : ''}`}>
            <span className="nav-icon"><FiBookOpen size={18} /></span>
            Kişilerim
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Satış</div>
          <NavLink to="/scan-card" className={`nav-item ${isActive('/scan-card') ? 'active' : ''}`}>
            <span className="nav-icon" style={{ color: '#ec4899' }}><FiCamera size={18} /></span>
            Kartvizit Tara & Yönlendir
          </NavLink>
          <NavLink to="/sales" className={`nav-item ${isActive('/sales') ? 'active' : ''}`}>
            <span className="nav-icon"><FiActivity size={18} /></span>
            Satış Takip
          </NavLink>
          <NavLink to="/pipeline" className={`nav-item ${isActive('/pipeline') ? 'active' : ''}`}>
            <span className="nav-icon"><FiColumns size={18} /></span>
            Pipeline
          </NavLink>
          <NavLink to="/discovery" className={`nav-item ${isActive('/discovery') ? 'active' : ''}`}>
            <span className="nav-icon"><FiCompass size={18} /></span>
            Firma Keşfi
          </NavLink>
          <NavLink to="/intent-radar" className={`nav-item ${isActive('/intent-radar') ? 'active' : ''}`}>
            <span className="nav-icon" style={{ color: '#f59e0b' }}><FiTarget size={18} /></span>
            Arama & Niyet Radarı
          </NavLink>
          <NavLink to="/campaigns" className={`nav-item ${isActive('/campaigns') ? 'active' : ''}`}>
            <span className="nav-icon"><FiFolder size={18} /></span>
            Kampanyalar
          </NavLink>
          <NavLink to="/proforma/quick" className={`nav-item ${isActive('/proforma/quick') ? 'active' : ''}`}>
            <span className="nav-icon"><FiFileText size={18} /></span>
            Hızlı Proforma
          </NavLink>
          <NavLink to="/vehicles/management" className={`nav-item ${isActive('/vehicles/management') ? 'active' : ''}`}>
            <span className="nav-icon"><FiTruck size={18} /></span>
            Araç Yönetimi
          </NavLink>
          <a
            href="/musteri?preview=true"
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
            title="Müşterilerinize göndereceğiniz fiyat, kasa, kredi ve LinkedIn SSS portalını aç & test et"
          >
            <span className="nav-icon" style={{ color: '#38bdf8' }}><FiEye size={18} /></span>
            🌟 Müşteri Portalı & SSS
          </a>
        </div>


        <div className="nav-section">
          <div className="nav-section-title">Sistem</div>
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
    </aside>
  );
}
