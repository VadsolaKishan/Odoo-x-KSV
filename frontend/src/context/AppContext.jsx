import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

// ============================================================
// DEMO CREDENTIALS — all roles
// ============================================================
export const DEMO_CREDENTIALS = [
  {
    email: 'admin@vendorbridge.com',
    password: 'Admin123',
    role: 'admin',
    name: 'Rahul Sharma',
    title: 'System Administrator',
    phone: '+91 22 5550 0001',
    office: 'Mumbai HQ',
    vendorId: null,
  },
  {
    email: 'officer@vendorbridge.com',
    password: 'Officer123',
    role: 'officer',
    name: 'Sarah Jenkins',
    title: 'VP of Procurement',
    phone: '+91 79 5550 9182',
    office: 'Ahmedabad Corporate HQ',
    vendorId: null,
  },
  {
    email: 'manager@vendorbridge.com',
    password: 'Manager123',
    role: 'manager',
    name: 'Priya Shah',
    title: 'Finance Manager',
    phone: '+91 80 5550 3344',
    office: 'Bangalore Annex',
    vendorId: null,
  },
  {
    email: 'vendor1@vendorbridge.com',
    password: 'Vendor123',
    role: 'vendor',
    name: 'Tata Digital Solutions',
    title: 'Vendor Partner',
    phone: '+91 22 5550 1010',
    office: 'Mumbai',
    vendorId: 'V-001',
  },
  {
    email: 'vendor2@vendorbridge.com',
    password: 'Vendor123',
    role: 'vendor',
    name: 'Reliance Logistics Ltd',
    title: 'Vendor Partner',
    phone: '+91 22 5550 2020',
    office: 'Navi Mumbai',
    vendorId: 'V-002',
  },
  {
    email: 'vendor3@vendorbridge.com',
    password: 'Vendor123',
    role: 'vendor',
    name: 'Mahindra Metalworks',
    title: 'Vendor Partner',
    phone: '+91 20 5550 3030',
    office: 'Pune',
    vendorId: 'V-003',
  },
  {
    email: 'vendor4@vendorbridge.com',
    password: 'Vendor123',
    role: 'vendor',
    name: 'Jaipur Stationery Mart',
    title: 'Vendor Partner',
    phone: '+91 14 5550 4040',
    office: 'Jaipur',
    vendorId: 'V-004',
  },
];

// Helper to format currency in Indian system (e.g. ₹10,50,000)
export const formatIndianCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

// Helper to convert number to Rupees in Words (Indian numbering system)
export const convertNumberToWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '';
  let n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const doubleDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertGroup = (val) => {
    let str = '';
    if (val >= 100) {
      str += singleDigits[Math.floor(val / 100)] + ' Hundred ';
      val %= 100;
    }
    if (val >= 20) {
      str += tensDigits[Math.floor(val / 10)] + ' ';
      val %= 10;
    }
    if (val >= 10) {
      str += doubleDigits[val - 10] + ' ';
      val = 0;
    }
    if (val > 0) {
      str += singleDigits[val] + ' ';
    }
    return str.trim();
  };

  let words = '';
  if (n >= 10000000) { words += convertGroup(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
  if (n >= 100000) { words += convertGroup(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
  if (n >= 1000) { words += convertGroup(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
  if (n > 0) { words += convertGroup(n) + ' '; }

  return (words.trim() + ' Rupees Only').replace(/\s+/g, ' ');
};

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('vb_theme') || 'light');

  // Auth state — null means not logged in (shows landing page)
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('vb_user');
    return user ? JSON.parse(user) : null;
  });

  // Base State Collections
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);

  // Loading & Toasts state
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('vb_theme', theme);
  }, [theme]);

  // Toast Helpers
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    addToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // Sync everything from LocalStorage/mock API
  const refreshAllData = async () => {
    try {
      setLoading(true);
      const [v, r, q, po, inv, feed, notif, pv] = await Promise.all([
        api.vendors.getAll(),
        api.rfqs.getAll(),
        api.quotations.getAll(),
        api.purchaseOrders.getAll(),
        api.invoices.getAll(),
        api.feed.getAll(),
        api.notifications.getAll(),
        api.pendingVendors.getAll(),
      ]);
      setVendors(v);
      setRfqs(r);
      setQuotations(q);
      setPurchaseOrders(po);
      setInvoices(inv);
      setActivityFeed(feed);
      setNotifications(notif);
      setPendingVendors(pv);
    } catch (err) {
      addToast('Error loading application data', 'danger');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // ============================================================
  // AUTH FUNCTIONS
  // ============================================================

  // Credential-based login (checks DEMO_CREDENTIALS)
  const loginWithCredentials = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const cred = DEMO_CREDENTIALS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );
    if (!cred) {
      setLoading(false);
      addToast('Invalid email or password. Check demo credentials.', 'danger');
      return null;
    }
    const user = {
      name: cred.name,
      email: cred.email,
      role: cred.role,
      title: cred.title,
      phone: cred.phone,
      office: cred.office,
      vendorId: cred.vendorId || null,
    };
    setCurrentUser(user);
    localStorage.setItem('vb_user', JSON.stringify(user));
    setLoading(false);
    addToast(`Welcome back, ${cred.name}! 👋`, 'success');
    return user;
  };

  // Legacy alias (used by existing components)
  const loginUser = loginWithCredentials;

  // Vendor self-registration (adds to pending queue)
  const vendorRegister = async (data) => {
    setLoading(true);
    try {
      await api.pendingVendors.add(data);
      addToast('Registration submitted! Admin will review your request.', 'success');
      await refreshAllData();
      return true;
    } catch (err) {
      addToast('Registration failed. Please try again.', 'danger');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('vb_user');
    addToast('Logged out of VendorBridge', 'info');
  };

  // ============================================================
  // PENDING VENDORS (Admin Only)
  // ============================================================
  const approvePendingVendor = async (id) => {
    try {
      setLoading(true);
      await api.pendingVendors.approve(id);
      addToast('Vendor approved and activated!', 'success');
      await refreshAllData();
    } catch (err) {
      addToast('Failed to approve vendor', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const rejectPendingVendor = async (id) => {
    try {
      setLoading(true);
      await api.pendingVendors.reject(id);
      addToast('Vendor registration rejected.', 'warning');
      await refreshAllData();
    } catch (err) {
      addToast('Failed to reject vendor', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VENDORS CRUD
  // ============================================================
  const addVendor = async (data) => {
    try {
      setLoading(true);
      await api.vendors.create(data);
      addToast('Vendor added successfully!', 'success');
      await refreshAllData();
    } catch (err) {
      addToast('Failed to add vendor', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const updateVendor = async (id, data) => {
    try {
      setLoading(true);
      await api.vendors.update(id, data);
      addToast('Vendor updated successfully!', 'success');
      await refreshAllData();
    } catch (err) {
      addToast('Failed to update vendor', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const deleteVendor = async (id) => {
    try {
      setLoading(true);
      await api.vendors.delete(id);
      addToast('Vendor removed successfully!', 'warning');
      await refreshAllData();
    } catch (err) {
      addToast('Failed to delete vendor', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RFQ OPERATIONS
  // ============================================================
  const createRfq = async (data) => {
    try {
      setLoading(true);
      const rfq = await api.rfqs.create(data);
      addToast(`RFQ ${rfq.id} created successfully!`, 'success');
      await refreshAllData();
      return rfq;
    } catch (err) {
      addToast('Failed to create RFQ', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const selectQuoteForRfq = async (rfqId, bidId) => {
    try {
      setLoading(true);
      await api.rfqs.selectBid(rfqId, bidId);
      addToast('Bid selected. Sent for approval workflow.', 'success');
      await refreshAllData();
    } catch (err) {
      addToast('Failed to select bid', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Vendor submits quotation
  const submitQuotation = async (rfqId, vendorId, quoteData) => {
    try {
      setLoading(true);
      await api.quotations.create({ rfqId, vendorId, ...quoteData });
      addToast('Quotation submitted successfully!', 'success');
      await refreshAllData();
      return true;
    } catch (err) {
      addToast('Failed to submit quotation', 'danger');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // APPROVAL OPERATIONS
  // ============================================================
  const processApproval = async (rfqId, actionType, remarks) => {
    try {
      setLoading(true);
      await api.approvals.action(rfqId, actionType, remarks);
      if (actionType === 'approve') {
        addToast(`RFQ ${rfqId} approved. PO & Invoice generated.`, 'success');
      } else {
        addToast(`RFQ ${rfqId} rejected and sent back to quotes.`, 'warning');
      }
      await refreshAllData();
    } catch (err) {
      addToast('Error actioning approval request', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INVOICE OPERATIONS
  // ============================================================
  const payInvoice = async (id) => {
    try {
      setLoading(true);
      await api.invoices.pay(id);
      addToast('Invoice paid successfully!', 'success');
      await refreshAllData();
    } catch (err) {
      addToast('Failed to pay invoice', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const emailInvoice = async (id, emailAddress) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    addToast(`Invoice emailed to ${emailAddress || 'vendor contact'}`, 'success');
    setLoading(false);
  };

  const markAllNotificationsRead = async () => {
    await api.notifications.markAllAsRead();
    await refreshAllData();
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  return (
    <AppContext.Provider
      value={{
        // Theme
        theme,
        toggleTheme,

        // Auth
        currentUser,
        setCurrentUser,
        loginUser,
        loginWithCredentials,
        vendorRegister,
        logoutUser,
        DEMO_CREDENTIALS,

        // Data
        vendors,
        rfqs,
        quotations,
        purchaseOrders,
        invoices,
        activityFeed,
        notifications,
        pendingVendors,

        // Loading & Toasts
        loading,
        toasts,
        addToast,
        removeToast,

        // Vendor CRUD
        addVendor,
        updateVendor,
        deleteVendor,

        // Pending vendor management (admin)
        approvePendingVendor,
        rejectPendingVendor,

        // RFQ operations
        createRfq,
        selectQuoteForRfq,
        submitQuotation,

        // Approval
        processApproval,

        // Invoices
        payInvoice,
        emailInvoice,

        // Notifications
        markAllNotificationsRead,

        // Utility
        refreshAllData,
        formatIndianCurrency,
        convertNumberToWords,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
