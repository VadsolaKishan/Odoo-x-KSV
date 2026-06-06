import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

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

  // Crores
  if (n >= 10000000) {
    words += convertGroup(Math.floor(n / 10000000)) + ' Crore ';
    n %= 10000000;
  }
  // Lakhs
  if (n >= 100000) {
    words += convertGroup(Math.floor(n / 100000)) + ' Lakh ';
    n %= 100000;
  }
  // Thousands
  if (n >= 1000) {
    words += convertGroup(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }
  // Remaining
  if (n > 0) {
    words += convertGroup(n) + ' ';
  }

  return (words.trim() + ' Rupees Only').replace(/\s+/g, ' ');
};

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('vb_theme') || 'light');
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('vb_user');
    return user ? JSON.parse(user) : { name: 'Sarah Jenkins', email: 'sarah.j@vendorbridge.com', role: 'VP of Procurement' }; // Initial log state
  });
  
  // Base State Collections
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Loading & Toasts state
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vb_theme', theme);
  }, [theme]);

  // Toast Helpers
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    addToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // Sync everything from LocalStorage/mock API
  const refreshAllData = async () => {
    try {
      setLoading(true);
      const [v, r, q, po, inv, feed, notif] = await Promise.all([
        api.vendors.getAll(),
        api.rfqs.getAll(),
        api.quotations.getAll(),
        api.purchaseOrders.getAll(),
        api.invoices.getAll(),
        api.feed.getAll(),
        api.notifications.getAll(),
      ]);
      setVendors(v);
      setRfqs(r);
      setQuotations(q);
      setPurchaseOrders(po);
      setInvoices(inv);
      setActivityFeed(feed);
      setNotifications(notif);
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

  // Auth Functions
  const loginUser = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // fake delay
    const user = { name: 'Sarah Jenkins', email, role: 'VP of Procurement' };
    setCurrentUser(user);
    localStorage.setItem('vb_user', JSON.stringify(user));
    setLoading(false);
    addToast('Successfully logged in!', 'success');
    return true;
  };

  const signupUser = async (name, email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const user = { name, email, role: 'Buyer Manager' };
    setCurrentUser(user);
    localStorage.setItem('vb_user', JSON.stringify(user));
    setLoading(false);
    addToast('Account created successfully!', 'success');
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('vb_user');
    addToast('Logged out of VendorBridge', 'info');
  };

  // Vendors CRUD operations
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

  // RFQ operations
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

  // Approval operations
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

  // Invoices actions
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

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        loginUser,
        signupUser,
        logoutUser,
        vendors,
        rfqs,
        quotations,
        purchaseOrders,
        invoices,
        activityFeed,
        notifications,
        loading,
        toasts,
        addToast,
        removeToast,
        addVendor,
        updateVendor,
        deleteVendor,
        createRfq,
        selectQuoteForRfq,
        processApproval,
        payInvoice,
        emailInvoice,
        markAllNotificationsRead,
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
