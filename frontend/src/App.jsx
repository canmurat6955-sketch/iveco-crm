import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VisitProvider } from './contexts/VisitContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CRM/CustomerList';
import CustomerDetail from './pages/CRM/CustomerDetail';
import ImportCustomers from './pages/CRM/ImportCustomers';
import CampaignList from './pages/Campaigns/CampaignList';
import SalesActivity from './pages/Sales/SalesActivity';
import Pipeline from './pages/Sales/Pipeline';
import NotificationCenter from './pages/Notifications/NotificationCenter';
import DiscoveryList from './pages/Discovery/DiscoveryList';
import RoutePlanner from './pages/Sales/RoutePlanner';
import CardScanner from './pages/CRM/CardScanner';
import Login from './pages/Login';
import MapPage from './pages/CRM/Map';
import ProformaNew from './pages/CRM/ProformaNew';
import ProformaDetail from './pages/CRM/ProformaDetail';
import ProformaQuick from './pages/CRM/ProformaQuick';





function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        <div className="loading-pulse"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <VisitProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="customers/import" element={<ImportCustomers />} />
            <Route path="campaigns" element={<CampaignList />} />
            <Route path="sales" element={<SalesActivity />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="discovery" element={<DiscoveryList />} />
            <Route path="routes" element={<RoutePlanner />} />
            <Route path="scan-card" element={<CardScanner />} />
            <Route path="map" element={<MapPage />} />
            <Route path="customers/:customerId/proforma/new" element={<ProformaNew />} />
            <Route path="proformas/:id" element={<ProformaDetail />} />
            <Route path="proforma/quick" element={<ProformaQuick />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </VisitProvider>
    </AuthProvider>
  );
}



