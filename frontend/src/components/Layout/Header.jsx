import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSearch, FiMic, FiBarChart2, FiTruck, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import VehicleAISearchModal from '../Search/VehicleAISearchModal';
import VoiceDebriefModal from '../VoiceDebrief/VoiceDebriefModal';
import TCOCalculatorModal from '../TCO/TCOCalculatorModal';
import BodybuilderMatcherModal from '../Bodybuilder/BodybuilderMatcherModal';

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
  const { logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [showVoiceDebrief, setShowVoiceDebrief] = useState(false);
  const [showTco, setShowTco] = useState(false);
  const [showBodybuilder, setShowBodybuilder] = useState(false);

  useEffect(() => {
    // Saat sadece SS:DD gösteriyor; her saniye yeniden çizmeye gerek yok
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowAiSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTitle = () => {
    if (location.pathname.match(/^\/customers\/\d+$/)) return 'Müşteri Detayı';
    return PAGE_TITLES[location.pathname] || 'Iveco Enterprise CRM';
  };

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 className="header-title">{getTitle()}</h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '20px',
            padding: '2px 10px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#38bdf8',
            letterSpacing: '0.4px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            ERC CANLI SİSTEM
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Quick Field Tools Buttons */}
          <button
            type="button"
            onClick={() => setShowVoiceDebrief(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(0, 102, 255, 0.12)',
              color: '#60a5fa',
              border: '1px solid rgba(0, 102, 255, 0.35)',
              padding: '6px 12px', borderRadius: '8px',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 102, 255, 0.22)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 102, 255, 0.12)'; }}
            title="Sözlü konuşarak müşteri notu, takas ve takip tarihi ekle"
          >
            <FiMic size={14} color="#38bdf8" />
            <span>Sesli Not</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTco(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '6px 12px', borderRadius: '8px',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; }}
            title="Resmi Bakım (25.000 / 40.000 / 60.000 km), Yakıt ve TCO Kıyaslama Hesaplayıcı"
          >
            <FiBarChart2 size={14} color="#10b981" />
            <span>TCO Kıyaslama</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBodybuilder(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '6px 12px', borderRadius: '8px',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; }}
            title="Palet / İstiap tonajına göre şasi ve üst yapıcı eşleştir"
          >
            <FiTruck size={14} color="#f59e0b" />
            <span>Şasi & Üst Yapı</span>
          </button>

          <div
            onClick={() => setShowAiSearch(true)}
            className="flex items-center gap-2"
            style={{
              background: 'var(--bg-input)',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <FiSearch color="#38bdf8" size={14} />
            <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
              Model, Şasi veya Müşteri Ara...
            </span>
            <kbd style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              padding: '1px 5px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#f1f5f9'
            }}>⌘K</kbd>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
              {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600 }}>
              {time.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Oturumu kapatmak istediğinize emin misiniz?')) {
                logout();
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              marginLeft: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
            title="Sistemden Güvenli Çıkış Yap"
          >
            <FiLogOut size={13} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </header>

      <VehicleAISearchModal isOpen={showAiSearch} onClose={() => setShowAiSearch(false)} />
      <VoiceDebriefModal isOpen={showVoiceDebrief} onClose={() => setShowVoiceDebrief(false)} />
      <TCOCalculatorModal isOpen={showTco} onClose={() => setShowTco(false)} />
      <BodybuilderMatcherModal isOpen={showBodybuilder} onClose={() => setShowBodybuilder(false)} />
    </>
  );
}

