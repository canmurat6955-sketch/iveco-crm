import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiZap } from 'react-icons/fi';
import VehicleAISearchModal from '../Search/VehicleAISearchModal';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/customers': 'Müşteri Yönetimi',
  '/customers/import': 'Müşteri İçe Aktar',
  '/discovery': 'Firma Keşfi',
  '/sales': 'Satış Takip',
  '/campaigns': 'Kampanya & Katalog',
  '/notifications': 'Bildirimler',
  '/vehicles/management': 'Araç Yönetimi & Talep Raporları',
  '/contacts': 'Kişilerim',
  '/pipeline': 'Satış Pipeline',
  '/workbench': 'Çalışma Masası & Operasyon',
};

export default function Header() {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [showAiSearch, setShowAiSearch] = useState(false);

  useEffect(() => {
    // Saat sadece SS:DD gösteriyor; her saniye yeniden çizmeye gerek yok
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    if (location.pathname.match(/^\/customers\/\d+$/)) return 'Müşteri Detayı';
    return PAGE_TITLES[location.pathname] || 'Iveco CRM';
  };

  return (
    <>
      <header className="header">
        <h2 className="header-title">{getTitle()}</h2>
        <div className="header-actions">
          <div
            onClick={() => setShowAiSearch(true)}
            className="flex items-center gap-2 mr-4"
            style={{
              background: 'var(--bg-input)', padding: '6px 14px', borderRadius: 20,
              border: '1px solid rgba(59, 130, 246, 0.4)', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <FiZap color="#38bdf8" size={14} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              AI Araç & Müşteri Arama (35C16, 16m³...)...
            </span>
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

      <VehicleAISearchModal isOpen={showAiSearch} onClose={() => setShowAiSearch(false)} />
    </>
  );
}
