import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';
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

const RFQDetailsRouteWrapper = () => {
  const { user } = useAuthStore();
  if (user?.role === 'vendor') {
    return <SubmitQuotationPage />;
  }
  return <PlaceholderPage title="RFQ Details" />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: { 
              background: '#111917', 
              color: '#e2e8f0', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            } 
          }} 
        />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Main Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
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
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
