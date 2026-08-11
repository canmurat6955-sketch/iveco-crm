import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSearch, FiBell } from 'react-icons/fi';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/customers': 'Müşteri Yönetimi',
  '/customers/import': 'Müşteri İçe Aktar',
  '/discovery': 'Firma Keşfi',
  '/sales': 'Satış Takip',
  '/campaigns': 'Kampanya & Katalog',
  '/notifications': 'Bildirimler',
};

export default function Header() {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    if (location.pathname.match(/^\/customers\/\d+$/)) return 'Müşteri Detayı';
    return PAGE_TITLES[location.pathname] || 'Iveco CRM';
  };

  return (
    <header className="header">
      <h2 className="header-title">{getTitle()}</h2>
      <div className="header-actions">
        <div className="flex items-center gap-2 mr-4" style={{ background: 'var(--bg-input)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border-color)' }}>
          <FiSearch color="var(--text-muted)" />
          <input type="text" placeholder="Hızlı arama..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.8rem', width: 150 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>
            {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {time.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
    </header>
  );
}
