import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/client';
import { FiHome, FiUsers, FiActivity, FiFolder, FiBell, FiColumns, FiCompass, FiFileText, FiTruck, FiBookOpen, FiPhoneCall, FiCamera, FiTarget, FiEye } from 'react-icons/fi';
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
  
  const { user } = useAuth();
  let userName = user?.full_name || 'Can Murat Onay';
  const userRole = (user?.role === 'admin' && !userName.includes('Murat')) ? 'Yönetici' : 'Satış Sorumlusu';
  const userAvatar = userName.charAt(0);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>IVECO CRM</h1>
        <p>Müşteri İstihbarat</p>
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
            href="/ozel-teklif?preview=true&company=%C3%96rnek%20Lojistik&name=Can%20Murat%20Onay&phone=05446225931"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{
              background: 'rgba(217, 119, 6, 0.12)',
              color: '#f59e0b',
              border: '1px dashed rgba(245, 158, 11, 0.4)',
              fontWeight: 700,
              marginTop: '4px'
            }}
            title="Müşterinin göreceği akıllı şasi ve kredi ekranını test et"
          >
            <span className="nav-icon" style={{ color: '#f59e0b' }}><FiEye size={18} /></span>
            Müşteri Ekranı Test & Önizle
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

      <div className="sidebar-user">
        <div className="user-avatar">{userAvatar}</div>
        <div className="user-info">
          <div className="user-name">{userName}</div>
          <div className="user-role">{userRole}</div>
        </div>
      </div>
    </aside>
  );
}
