import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';
import { useThemeStore } from './store/theme.store';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VendorsPage from './pages/VendorsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import CreateRFQPage from './pages/CreateRFQPage';
import PlaceholderPage from './pages/PlaceholderPage';
import InvoicesPage from './pages/InvoicesPage';
import SubmitQuotationPage from './pages/SubmitQuotationPage';
import QuotationComparisonPage from './pages/QuotationComparisonPage';
import ApprovalsPage from './pages/ApprovalsPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import ActivityPage from './pages/ActivityPage';
import ReportsPage from './pages/ReportsPage';
import RFQsPage from './pages/RFQsPage';
import QuotationsPage from './pages/QuotationsPage';





const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route: redirect authenticated users to dashboard
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const RFQDetailsRouteWrapper = () => {
  const { user } = useAuthStore();
  if (user?.role === 'vendor') {
    return <SubmitQuotationPage />;
  }
  return <PlaceholderPage title="RFQ Details" />;
};

export default function App() {
  const { theme } = useThemeStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: theme === 'dark' ? { 
              background: '#151f32', 
              color: '#f8fafc', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            } : {
              background: '#ffffff', 
              color: '#0f172a', 
              border: '1px solid rgba(5, 150, 105, 0.2)',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }
          }} 
        />
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />



          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          
          {/* Protected Main Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
          
          <Route path="/rfqs" element={<ProtectedRoute><RFQsPage /></ProtectedRoute>} />
          <Route path="/rfqs/new" element={<ProtectedRoute><CreateRFQPage /></ProtectedRoute>} />
          <Route path="/rfq/new" element={<ProtectedRoute><CreateRFQPage /></ProtectedRoute>} />
          <Route path="/rfqs/:id" element={<ProtectedRoute><RFQDetailsRouteWrapper /></ProtectedRoute>} />
          <Route path="/rfqs/:id/submit" element={<ProtectedRoute><SubmitQuotationPage /></ProtectedRoute>} />
          <Route path="/rfqs/:rfq_id/compare" element={<ProtectedRoute><QuotationComparisonPage /></ProtectedRoute>} />
          
          {/* Quotations, Approvals, POs & Invoices */}
          <Route path="/quotations" element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute><ApprovalsPage /></ProtectedRoute>} />
          <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrdersPage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
          
          {/* Reports & Audits */}
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
          
          {/* Fallback: send authenticated users to dashboard, unauthenticated to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
