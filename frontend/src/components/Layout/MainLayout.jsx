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

  if (isMobile) {
    return (
      <div className="app-layout mobile-layout">
        <SystemStatusBanner />
        <ActiveVisitBanner />
        <div
          onClick={() => setShowMobileSearch(true)}
          style={{
            margin: '8px 12px 0',
            padding: '9px 12px',
            background: 'rgba(15, 28, 50, 0.92)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#cbd5e1',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FiSearch size={15} color="#38bdf8" />
          <span>Hızlı Müşteri, Telefon veya Araç Ara...</span>
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


