import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PageLoading } from './components/shared';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import CompanyLayout from './layouts/CompanyLayout';

// Public pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SuperAdminLoginPage from './pages/auth/SuperAdminLoginPage';
import EnterpriseRegisterPage from './pages/auth/EnterpriseRegisterPage';
import PendingPaymentPage from './pages/auth/PendingPaymentPage';
import PaymentCallbackPage from './pages/auth/PaymentCallbackPage';

// Super Admin pages
import SADashboard from './pages/super-admin/Dashboard';
import SAPendingApprovals from './pages/super-admin/Approvals';
import SACompanies from './pages/super-admin/Companies';
import SACompanyDetail from './pages/super-admin/CompanyDetail';
import SASalesInquiries from './pages/super-admin/SalesInquiries';
import SAAnalytics from './pages/super-admin/Analytics';
import SASettings from './pages/super-admin/Settings';
import SANotifications from './pages/super-admin/Notifications';

// Company pages
import CompanyDashboard from './pages/company/Dashboard';
import CompanyComplaints from './pages/company/Complaints';
import CompanyComplaintDetail from './pages/company/ComplaintDetail';
import CompanyBranches from './pages/company/Branches';
import CompanyQRCodes from './pages/company/QRCodes';
import CompanyAnalytics from './pages/company/Analytics';
import CompanySettings from './pages/company/Settings';
import CompanyStaff from './pages/company/Staff';
import CompanyNotifications from './pages/company/Notifications';
import CompanyBilling from './pages/company/Billing';

// Public complaint portal
import ComplaintPortal from './pages/portal/ComplaintPortal';
import ComplaintSuccess from './pages/portal/ComplaintSuccess';
import InvalidQR from './pages/portal/InvalidQR';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoading />;
  if (user) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/register/enterprise" element={<GuestRoute><EnterpriseRegisterPage /></GuestRoute>} />
      <Route path="/super-admin/login" element={<GuestRoute><SuperAdminLoginPage /></GuestRoute>} />
      <Route path="/pending-payment" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><PendingPaymentPage /></ProtectedRoute>} />
      <Route path="/payment/callback" element={<PaymentCallbackPage />} />

      {/* Public complaint portal */}
      <Route path="/c/:slug" element={<ComplaintPortal />} />
      <Route path="/complaint-success" element={<ComplaintSuccess />} />
      <Route path="/invalid-qr" element={<InvalidQR />} />

      {/* Super Admin routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SADashboard />} />
        <Route path="approvals" element={<SAPendingApprovals />} />
        <Route path="companies" element={<SACompanies />} />
        <Route path="companies/:id" element={<SACompanyDetail />} />
        <Route path="sales-inquiries" element={<SASalesInquiries />} />
        <Route path="analytics" element={<SAAnalytics />} />
        <Route path="notifications" element={<SANotifications />} />
        <Route path="settings" element={<SASettings />} />
      </Route>

      {/* Company routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'COMPANY_STAFF']}>
            <CompanyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CompanyDashboard />} />
        <Route path="complaints" element={<CompanyComplaints />} />
        <Route path="complaints/:id" element={<CompanyComplaintDetail />} />
        <Route path="branches" element={<CompanyBranches />} />
        <Route path="qr-codes" element={<CompanyQRCodes />} />
        <Route path="analytics" element={<CompanyAnalytics />} />
        <Route path="settings" element={<CompanySettings />} />
        <Route path="staff" element={<CompanyStaff />} />
        <Route path="notifications" element={<CompanyNotifications />} />
        <Route path="billing" element={<CompanyBilling />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
