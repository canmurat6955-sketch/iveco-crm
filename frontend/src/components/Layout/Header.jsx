import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiZap } from 'react-icons/fi';
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

  const getTitle = () => {
    if (location.pathname.match(/^\/customers\/\d+$/)) return 'Müşteri Detayı';
    return PAGE_TITLES[location.pathname] || 'Iveco CRM';
  };

  return (
    <>
      <header className="header">
        <h2 className="header-title">{getTitle()}</h2>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Quick Field Tools Buttons */}
          <button
            type="button"
            onClick={() => setShowVoiceDebrief(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
            }}
            title="Sözlü konuşarak müşteri notu, takas ve takip tarihi ekle"
          >
            <span>🎙️</span>
            <span>Sesli Not</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTco(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
              padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
            }}
            title="50.000 km bakım ve yakıt tasarrufu hesaplayıcı"
          >
            <span>📊</span>
            <span>TCO Kıyasla</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBodybuilder(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a',
              padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
            }}
            title="Palet / İstiap tonajına göre şasi ve üst yapıcı eşleştir"
          >
            <span>🏗️</span>
            <span>Üst Yapı</span>
          </button>

          <div
            onClick={() => setShowAiSearch(true)}
            className="flex items-center gap-2"
            style={{
              background: 'var(--bg-input)', padding: '6px 14px', borderRadius: 20,
              border: '1px solid rgba(59, 130, 246, 0.4)', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <FiZap color="#38bdf8" size={14} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              AI Araç Arama...
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '6px' }}>
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
      <VoiceDebriefModal isOpen={showVoiceDebrief} onClose={() => setShowVoiceDebrief(false)} />
      <TCOCalculatorModal isOpen={showTco} onClose={() => setShowTco(false)} />
      <BodybuilderMatcherModal isOpen={showBodybuilder} onClose={() => setShowBodybuilder(false)} />
    </>
  );
}

