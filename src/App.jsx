import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';

// Renter pages
import RenterDashboard from './pages/renter/RenterDashboard';
import MaintenanceRequest from './pages/renter/MaintenanceRequest';
import PayRent from './pages/renter/PayRent';
import Receipts from './pages/renter/Receipts';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMaintenance from './pages/admin/AdminMaintenance';
import AdminPayments from './pages/admin/AdminPayments';
import TaxForms from './pages/admin/TaxForms';
import AdminProperties from './pages/admin/AdminProperties';
import CalendarIntegration from './pages/admin/CalendarIntegration';
import GitHubProjects from './pages/admin/GitHubProjects';

function RequireAuth({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/renter'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={user?.role === 'admin' ? '/admin' : '/renter'} replace />
            : <Login />
        }
      />

      {/* Renter Portal */}
      <Route path="/renter" element={<RequireAuth role="renter"><Layout role="renter"><RenterDashboard /></Layout></RequireAuth>} />
      <Route path="/renter/maintenance" element={<RequireAuth role="renter"><Layout role="renter"><MaintenanceRequest /></Layout></RequireAuth>} />
      <Route path="/renter/pay-rent" element={<RequireAuth role="renter"><Layout role="renter"><PayRent /></Layout></RequireAuth>} />
      <Route path="/renter/receipts" element={<RequireAuth role="renter"><Layout role="renter"><Receipts /></Layout></RequireAuth>} />

      {/* Admin Portal */}
      <Route path="/admin" element={<RequireAuth role="admin"><Layout role="admin"><AdminDashboard /></Layout></RequireAuth>} />
      <Route path="/admin/properties" element={<RequireAuth role="admin"><Layout role="admin"><AdminProperties /></Layout></RequireAuth>} />
      <Route path="/admin/maintenance" element={<RequireAuth role="admin"><Layout role="admin"><AdminMaintenance /></Layout></RequireAuth>} />
      <Route path="/admin/payments" element={<RequireAuth role="admin"><Layout role="admin"><AdminPayments /></Layout></RequireAuth>} />
      <Route path="/admin/tax-forms" element={<RequireAuth role="admin"><Layout role="admin"><TaxForms /></Layout></RequireAuth>} />
      <Route path="/admin/calendar" element={<RequireAuth role="admin"><Layout role="admin"><CalendarIntegration /></Layout></RequireAuth>} />
      <Route path="/admin/github-projects" element={<RequireAuth role="admin"><Layout role="admin"><GitHubProjects /></Layout></RequireAuth>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
