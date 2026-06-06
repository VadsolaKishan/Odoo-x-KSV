import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Shell Layout
import { Layout } from './components/Layout';

// Auth Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// Core Dashboard Pages
import { Dashboard } from './pages/Dashboard';
import { Vendors } from './pages/Vendors';
import { RfqCreate } from './pages/RfqCreate';
import { RfqDetails } from './pages/RfqDetails';
import { Quotations } from './pages/Quotations';
import { Approvals } from './pages/Approvals';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { Invoices } from './pages/Invoices';
import { Reports } from './pages/Reports';
import { ActivityLog } from './pages/ActivityLog';

// Route Guard for Authenticated Views
const ProtectedRoute = ({ children, roles }) => {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0 && !roles.includes(currentUser.roleKey)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Layout>{children}</Layout>;
};

// Route Guard for Auth Pages (Login / Signup)
const PublicRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />

        {/* Dashboard routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vendors" 
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Vendors />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rfq/create" 
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <RfqCreate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rfq/:id" 
          element={
            <ProtectedRoute>
              <RfqDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quotations" 
          element={
            <ProtectedRoute>
              <Quotations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/approvals" 
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Approvals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/purchase-orders" 
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <PurchaseOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/invoices" 
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Invoices />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/activity" 
          element={
            <ProtectedRoute>
              <ActivityLog />
            </ProtectedRoute>
          } 
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
