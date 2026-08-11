import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/client';
import { FiHome, FiUsers, FiActivity, FiFolder, FiBell, FiColumns, FiCompass } from 'react-icons/fi';

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
          <NavLink to="/customers" className={`nav-item ${isActive('/customers') ? 'active' : ''}`}>
            <span className="nav-icon"><FiUsers size={18} /></span>
            Müşteriler
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Satış</div>
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
          <NavLink to="/campaigns" className={`nav-item ${isActive('/campaigns') ? 'active' : ''}`}>
            <span className="nav-icon"><FiFolder size={18} /></span>
            Kampanyalar
          </NavLink>
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
        <div className="user-avatar">S</div>
        <div className="user-info">
          <div className="user-name">Sistem Yöneticisi</div>
          <div className="user-role">Yönetici</div>
        </div>
      </div>
    </aside>
  );
}
