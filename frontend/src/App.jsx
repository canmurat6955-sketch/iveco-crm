import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VisitProvider } from './contexts/VisitContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import { WhatsAppProvider } from './contexts/WhatsAppContext';

// Sayfalar ihtiyaç anında yüklenir (code splitting): ilk açılışta tüm uygulama inmez.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CustomerList = lazy(() => import('./pages/CRM/CustomerList'));
const CustomerDetail = lazy(() => import('./pages/CRM/CustomerDetail'));
const ImportCustomers = lazy(() => import('./pages/CRM/ImportCustomers'));
const CampaignList = lazy(() => import('./pages/Campaigns/CampaignList'));
const SalesActivity = lazy(() => import('./pages/Sales/SalesActivity'));
const Pipeline = lazy(() => import('./pages/Sales/Pipeline'));
const NotificationCenter = lazy(() => import('./pages/Notifications/NotificationCenter'));
const DiscoveryList = lazy(() => import('./pages/Discovery/DiscoveryList'));
const RoutePlanner = lazy(() => import('./pages/Sales/RoutePlanner'));
const CardScanner = lazy(() => import('./pages/CRM/CardScanner'));
const MapPage = lazy(() => import('./pages/CRM/Map'));
const ProformaNew = lazy(() => import('./pages/CRM/ProformaNew'));
const ProformaDetail = lazy(() => import('./pages/CRM/ProformaDetail'));
const ProformaQuick = lazy(() => import('./pages/CRM/ProformaQuick'));
const VehicleManagement = lazy(() => import('./pages/Vehicles/VehicleManagement'));
const PersonalContacts = lazy(() => import('./pages/Contacts/PersonalContacts'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', color: 'var(--text-muted)' }}>
    <div className="loading-pulse"></div>
  </div>
);

const page = (Comp) => <Suspense fallback={<PageLoader />}><Comp /></Suspense>;

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
        <WhatsAppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={page(Dashboard)} />
              <Route path="customers" element={page(CustomerList)} />
              <Route path="customers/:id" element={page(CustomerDetail)} />
              <Route path="customers/import" element={page(ImportCustomers)} />
              <Route path="contacts" element={page(PersonalContacts)} />
              <Route path="campaigns" element={page(CampaignList)} />
              <Route path="sales" element={page(SalesActivity)} />
              <Route path="pipeline" element={page(Pipeline)} />
              <Route path="notifications" element={page(NotificationCenter)} />
              <Route path="discovery" element={page(DiscoveryList)} />
              <Route path="routes" element={page(RoutePlanner)} />
              <Route path="scan-card" element={page(CardScanner)} />
              <Route path="map" element={page(MapPage)} />
              <Route path="customers/:customerId/proforma/new" element={page(ProformaNew)} />
              <Route path="proformas/:id" element={page(ProformaDetail)} />
              <Route path="proforma/quick" element={page(ProformaQuick)} />
              <Route path="vehicles/management" element={page(VehicleManagement)} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WhatsAppProvider>
      </VisitProvider>
    </AuthProvider>
  );
}
