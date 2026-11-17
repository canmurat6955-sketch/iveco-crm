import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import ActiveVisitBanner from './ActiveVisitBanner';
import SystemStatusBanner from './SystemStatusBanner';
import VehicleAISearchModal from '../Search/VehicleAISearchModal';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useVisit } from '../../contexts/VisitContext';
import toast from 'react-hot-toast';

import PwaInstallPrompt from '../common/PwaInstallPrompt';
import OfficeQuickAssistantDrawer from '../CRM/OfficeQuickAssistantDrawer';

export default function MainLayout() {
  const isMobile = useDeviceDetect();
  const { activeVisit, startVisit } = useVisit();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleQuickVisit = () => {
    toast.error("Ziyaret başlatmak için lütfen önce Müşteriler veya Firma Keşfi ekranından bir firma seçin.");
  };

  const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  if (isMobile) {
    return (
      <div className="app-layout mobile-layout">
        {/* Sabit Üst Güvenli Alan + Arama & Hızlı Kayıt Çubuğu (Kaydırınca Kaybolmaz, Saat Barının Altında Kalmaz) */}
        <div
          className="mobile-top-sticky-bar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 105,
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
            paddingTop: isIOS
              ? 'max(48px, calc(env(safe-area-inset-top, 44px) + 8px))'
              : 'max(12px, calc(env(safe-area-inset-top, 12px) + 6px))',
            paddingBottom: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)'
          }}
        >
          <SystemStatusBanner />
          <ActiveVisitBanner />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              onClick={() => setShowMobileSearch(true)}
              style={{
                flex: 1,
                padding: '9px 12px',
                background: 'rgba(25, 43, 72, 0.95)',
                border: '1.5px solid rgba(56, 189, 248, 0.45)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#e2e8f0',
                fontSize: '0.79rem',
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 0
              }}
            >
              <FiSearch size={15} color="#38bdf8" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Hızlı Müşteri, Telefon veya Araç Ara...
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-office-quick-assistant'))}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                color: '#ffffff',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '10px',
                padding: '9px 11px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Hızlı Görüşme Kaydı & Kopya Kağıdı"
            >
              📞 Kayıt
            </button>
          </div>
        </div>

        <main className="main-content-mobile">
          <Outlet />
        </main>
        <VehicleAISearchModal isOpen={showMobileSearch} onClose={() => setShowMobileSearch(false)} />
        <OfficeQuickAssistantDrawer />
        <PwaInstallPrompt />
        <BottomNav onVisitStart={handleQuickVisit} />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <SystemStatusBanner />
        <ActiveVisitBanner />
        <Header />
        <main className="main-content" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
      <OfficeQuickAssistantDrawer />
    </div>
  );
}


