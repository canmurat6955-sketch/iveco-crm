import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import ActiveVisitBanner from './ActiveVisitBanner';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useVisit } from '../../contexts/VisitContext';
import toast from 'react-hot-toast';

export default function MainLayout() {
  const isMobile = useDeviceDetect();
  const { activeVisit, startVisit } = useVisit();

  const handleQuickVisit = () => {
    toast.error("Ziyaret başlatmak için lütfen önce Müşteriler veya Firma Keşfi ekranından bir firma seçin.");
  };

  if (isMobile) {
    return (
      <div className="app-layout mobile-layout">
        <ActiveVisitBanner />
        <main className="main-content-mobile">
          <Outlet />
        </main>
        <BottomNav onVisitStart={handleQuickVisit} />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <ActiveVisitBanner />
        <Header />
        <main className="main-content" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}


