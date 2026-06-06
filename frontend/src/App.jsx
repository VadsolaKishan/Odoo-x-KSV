import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Shell Layout
import { Layout } from './components/Layout';

// Public Pages (no lazy — fast load)
import { Login }    from './pages/Login';
import { Signup }   from './pages/Signup';
import { LandingPage } from './pages/LandingPage';

// Core Dashboard Pages
import { Dashboard }       from './pages/Dashboard';
import { Vendors }         from './pages/Vendors';
import { RfqCreate }       from './pages/RfqCreate';
import { RfqDetails }      from './pages/RfqDetails';
import { Quotations }      from './pages/Quotations';
import { Approvals }       from './pages/Approvals';
import { PurchaseOrders }  from './pages/PurchaseOrders';
import { Invoices }        from './pages/Invoices';
import { Reports }         from './pages/Reports';
import { ActivityLog }     from './pages/ActivityLog';
import { Profile }         from './pages/Profile';

// New Role-Specific Pages
import { VendorDashboard }        from './pages/VendorDashboard';
import { VendorRfqList }          from './pages/VendorRfqList';
import { VendorQuotationSubmit }  from './pages/VendorQuotationSubmit';
import { QuotationComparison }    from './pages/QuotationComparison';
import { PendingVendors }         from './pages/PendingVendors';
import { UserManagement }         from './pages/UserManagement';
import { SystemLogs }             from './pages/SystemLogs';

// ──────────────────────────────────────────────
// ROUTE GUARDS
// ──────────────────────────────────────────────

/** Any logged-in user — redirects to landing if not authed */
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
};

/** Company roles only (admin, officer, manager) — vendor goes to vendor portal */
const CompanyRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

/** Vendor-only route */
const VendorRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'vendor') return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

/** Admin-only route */
const AdminRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

/** Manager or Admin route */
const ManagerRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (!['admin', 'manager'].includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

/** Public route — redirects logged-in users to their correct dashboard */
const PublicRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (currentUser) {
    if (currentUser.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/** Smart root redirect */
const RootRedirect = () => {
  const { currentUser } = useApp();
  if (!currentUser) return <LandingPage />;
  if (currentUser.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ─── PUBLIC ─── */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* ─── COMPANY DASHBOARD (Admin / Officer / Manager) ─── */}
        <Route path="/dashboard"       element={<CompanyRoute><Dashboard /></CompanyRoute>} />
        <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Vendors — Admin sees full CRUD + approval, others can view */}
        <Route path="/vendors"         element={<CompanyRoute><Vendors /></CompanyRoute>} />
        <Route path="/admin/vendors"   element={<AdminRoute><PendingVendors /></AdminRoute>} />
        <Route path="/admin/users"     element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/admin/logs"      element={<AdminRoute><SystemLogs /></AdminRoute>} />

        {/* RFQ — Officer creates, others can view */}
        <Route path="/rfq/create"      element={<CompanyRoute><RfqCreate /></CompanyRoute>} />
        <Route path="/rfq/:id"         element={<CompanyRoute><RfqDetails /></CompanyRoute>} />

        {/* Quotations & Comparison */}
        <Route path="/quotations"      element={<CompanyRoute><Quotations /></CompanyRoute>} />
        <Route path="/comparison"      element={<CompanyRoute><QuotationComparison /></CompanyRoute>} />

        {/* Approvals — Manager + Admin */}
        <Route path="/approvals"       element={<ManagerRoute><Approvals /></ManagerRoute>} />

        {/* Purchase Orders & Invoices */}
        <Route path="/purchase-orders" element={<CompanyRoute><PurchaseOrders /></CompanyRoute>} />
        <Route path="/invoices"        element={<CompanyRoute><Invoices /></CompanyRoute>} />

        {/* Reports & Activity */}
        <Route path="/reports"         element={<CompanyRoute><Reports /></CompanyRoute>} />
        <Route path="/activity"        element={<CompanyRoute><ActivityLog /></CompanyRoute>} />

        {/* ─── VENDOR PORTAL ─── */}
        <Route path="/vendor/dashboard"   element={<VendorRoute><VendorDashboard /></VendorRoute>} />
        <Route path="/vendor/rfqs"        element={<VendorRoute><VendorRfqList /></VendorRoute>} />
        <Route path="/vendor/quotations"  element={<VendorRoute><VendorQuotationSubmit /></VendorRoute>} />
        <Route path="/vendor/profile"     element={<VendorRoute><Profile /></VendorRoute>} />

        {/* ─── CATCH-ALL ─── */}
        <Route path="*" element={<RootRedirect />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
