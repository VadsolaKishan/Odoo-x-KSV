import demoUsers from '../mockData/demoUsers.json';
import vendorSeed from '../mockData/vendors.json';
import rfqSeed from '../mockData/rfqs.json';
import quotationSeed from '../mockData/quotations.json';
import purchaseOrderSeed from '../mockData/purchaseOrders.json';
import invoiceSeed from '../mockData/invoices.json';
import activityFeedSeed from '../mockData/activityFeed.json';
import notificationSeed from '../mockData/notifications.json';
import { delay, nextId, readJsonStore, writeJsonStore } from './mockStorageService';

const DELAY = 550;

const STORAGE_KEYS = {
  users: 'vb_users',
  vendors: 'vb_vendors',
  rfqs: 'vb_rfqs',
  quotations: 'vb_quotations',
  purchaseOrders: 'vb_purchase_orders',
  invoices: 'vb_invoices',
  activityFeed: 'vb_activity_feed',
  notifications: 'vb_notifications',
  authToken: 'vb_auth_token',
  authUser: 'vb_auth_user',
};

const seedStore = (key, seedValue) => {
  if (!localStorage.getItem(key)) {
    writeJsonStore(key, seedValue);
  }
};

seedStore(STORAGE_KEYS.users, demoUsers);
seedStore(STORAGE_KEYS.vendors, vendorSeed);
seedStore(STORAGE_KEYS.rfqs, rfqSeed);
seedStore(STORAGE_KEYS.quotations, quotationSeed);
seedStore(STORAGE_KEYS.purchaseOrders, purchaseOrderSeed);
seedStore(STORAGE_KEYS.invoices, invoiceSeed);
seedStore(STORAGE_KEYS.activityFeed, activityFeedSeed);
seedStore(STORAGE_KEYS.notifications, notificationSeed);

const readStore = (key, fallback = []) => readJsonStore(key, fallback);
const writeStore = (key, value) => writeJsonStore(key, value);
const clone = (value) => JSON.parse(JSON.stringify(value));

const getAuthUser = () => {
  const token = sessionStorage.getItem(STORAGE_KEYS.authToken);
  const userRaw = localStorage.getItem(STORAGE_KEYS.authUser);
  if (!token || !userRaw) return null;

  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
};

const saveSession = (user, token) => {
  sessionStorage.setItem(STORAGE_KEYS.authToken, token);
  localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user));
};

const clearSession = () => {
  sessionStorage.removeItem(STORAGE_KEYS.authToken);
  localStorage.removeItem(STORAGE_KEYS.authUser);
};

const addFeed = (type, description, user = 'Current User') => {
  const feed = readStore(STORAGE_KEYS.activityFeed, []);
  feed.unshift({
    id: `act-${Date.now()}`,
    type,
    user,
    description,
    time: 'Just now',
  });
  writeStore(STORAGE_KEYS.activityFeed, feed.slice(0, 50));
};

const addNotification = (type, message) => {
  const notifications = readStore(STORAGE_KEYS.notifications, []);
  notifications.unshift({
    id: `not-${Date.now()}`,
    type,
    message,
    read: false,
    time: 'Just now',
  });
  writeStore(STORAGE_KEYS.notifications, notifications.slice(0, 50));
};

const getFinancials = (bid, vendor) => {
  const subtotal = bid.totalCost;
  const gstRate = 18;
  const gstAmount = Number((subtotal * 0.18).toFixed(2));
  const grandTotal = Number((subtotal + gstAmount).toFixed(2));
  const interstate = String(vendor.state || '').toLowerCase() !== 'maharashtra';
  return {
    subtotal,
    gstRate,
    gstAmount,
    grandTotal,
    cgst: interstate ? 0 : Number((gstAmount / 2).toFixed(2)),
    sgst: interstate ? 0 : Number((gstAmount / 2).toFixed(2)),
    igst: interstate ? gstAmount : 0,
  };
};

const buildToken = (user) => `vb.${btoa(JSON.stringify({ sub: user.email, roleKey: user.roleKey, issuedAt: Date.now() }))}.${Math.random().toString(36).slice(2, 10)}`;

const getCurrentSessionUser = () => getAuthUser();

export const api = {
  auth: {
    getCurrentUser: () => getCurrentSessionUser(),
    login: async ({ email, password }) => {
      await delay(DELAY);
      const users = readStore(STORAGE_KEYS.users, []);
      const user = users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase() && entry.password === password);
      if (!user) throw new Error('Invalid email or password');

      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleKey: user.roleKey || 'manager',
        role: user.role || 'Buyer Manager',
        vendorScope: user.vendorScope || 'buyer',
      };

      saveSession(sessionUser, buildToken(sessionUser));
      return { user: sessionUser };
    },
    signup: async ({ name, email, password }) => {
      await delay(DELAY);
      const users = readStore(STORAGE_KEYS.users, []);
      if (users.some((entry) => entry.email.toLowerCase() === String(email).toLowerCase())) {
        throw new Error('An account already exists for this email');
      }

      const user = {
        id: `U-${Date.now()}`,
        name,
        email,
        password,
        roleKey: 'manager',
        role: 'Buyer Manager',
        vendorScope: 'buyer',
      };

      users.unshift(user);
      writeStore(STORAGE_KEYS.users, users);
      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleKey: user.roleKey,
        role: user.role,
        vendorScope: user.vendorScope,
      };
      saveSession(sessionUser, buildToken(sessionUser));
      return { user: sessionUser };
    },
    logout: async () => {
      await delay(100);
      clearSession();
      return true;
    },
  },

  vendors: {
    getAll: async () => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.vendors, []);
    },
    getById: async (id) => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.vendors, []).find((vendor) => vendor.id === id) || null;
    },
    create: async (data) => {
      await delay(DELAY);
      const vendors = readStore(STORAGE_KEYS.vendors, []);
      const newVendor = {
        ...clone(data),
        id: nextId('V', vendors),
        rating: data.rating ? Number.parseFloat(data.rating) : 0,
        status: data.status || 'Active',
      };
      vendors.unshift(newVendor);
      writeStore(STORAGE_KEYS.vendors, vendors);
      addFeed('vendor', `Added new vendor "${newVendor.name}"`);
      return newVendor;
    },
    update: async (id, data) => {
      await delay(DELAY);
      const vendors = readStore(STORAGE_KEYS.vendors, []);
      const index = vendors.findIndex((vendor) => vendor.id === id);
      if (index === -1) throw new Error('Vendor not found');
      vendors[index] = { ...vendors[index], ...clone(data), rating: data.rating ? Number.parseFloat(data.rating) : vendors[index].rating };
      writeStore(STORAGE_KEYS.vendors, vendors);
      addFeed('vendor', `Updated vendor profile for "${vendors[index].name}"`);
      return vendors[index];
    },
    delete: async (id) => {
      await delay(DELAY);
      const vendors = readStore(STORAGE_KEYS.vendors, []);
      const vendor = vendors.find((entry) => entry.id === id);
      writeStore(STORAGE_KEYS.vendors, vendors.filter((entry) => entry.id !== id));
      if (vendor) addFeed('vendor', `Removed vendor "${vendor.name}"`);
      return true;
    },
  },

  rfqs: {
    getAll: async () => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.rfqs, []);
    },
    getById: async (id) => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.rfqs, []).find((rfq) => rfq.id === id) || null;
    },
    create: async (data) => {
      await delay(DELAY);
      const rfqs = readStore(STORAGE_KEYS.rfqs, []);
      const vendors = readStore(STORAGE_KEYS.vendors, []);
      const quotations = readStore(STORAGE_KEYS.quotations, []);
      const newRfq = {
        id: nextId('RFQ-2026', rfqs),
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'Quotes Gathered',
        items: data.items || [],
        assignedVendors: data.assignedVendors || [],
        timelineStep: 1,
      };

      rfqs.unshift(newRfq);
      writeStore(STORAGE_KEYS.rfqs, rfqs);

      (data.assignedVendors || []).forEach((vendorId, index) => {
        const vendor = vendors.find((entry) => entry.id === vendorId);
        if (!vendor) return;

        let totalCost = 0;
        const items = newRfq.items.map((item) => {
          const basePrice = (index + 1) * 12 + item.quantity * 2;
          const unitPrice = Number((basePrice * (0.85 + Math.random() * 0.3)).toFixed(2));
          const total = Number((unitPrice * item.quantity).toFixed(2));
          totalCost += total;
          return { name: item.name, quantity: item.quantity, unitPrice, total, hsnCode: item.hsnCode || '84713010' };
        });

        quotations.push({
          id: nextId('Q', quotations),
          rfqId: newRfq.id,
          vendorId: vendor.id,
          vendorName: vendor.name,
          deliveryTimeDays: Math.floor(Math.random() * 10) + 3,
          totalCost: Number(totalCost.toFixed(2)),
          items,
          status: 'Submitted',
          remarks: `Official bid for ${newRfq.title}. Standard commercial terms apply.`,
        });
      });

      writeStore(STORAGE_KEYS.quotations, quotations);
      addFeed('rfq', `Created RFQ ${newRfq.id} "${newRfq.title}" with ${newRfq.items.length} items`);
      addNotification('rfq', `Bids received for newly created RFQ ${newRfq.id}.`);
      return newRfq;
    },
    reorder: async (rfqId) => {
      await delay(DELAY);
      const source = readStore(STORAGE_KEYS.rfqs, []).find((rfq) => rfq.id === rfqId);
      if (!source) throw new Error('Source RFQ not found');
      return {
        title: `Copy of ${source.title}`,
        description: source.description,
        items: clone(source.items),
        assignedVendors: clone(source.assignedVendors),
      };
    },
    selectBid: async (rfqId, bidId) => {
      await delay(DELAY);
      const rfqs = readStore(STORAGE_KEYS.rfqs, []);
      const rfqIndex = rfqs.findIndex((rfq) => rfq.id === rfqId);
      if (rfqIndex === -1) throw new Error('RFQ not found');

      const quotations = readStore(STORAGE_KEYS.quotations, []);
      quotations.forEach((quote) => {
        if (quote.rfqId === rfqId) {
          quote.status = quote.id === bidId ? 'Selected' : 'Rejected';
        }
      });
      writeStore(STORAGE_KEYS.quotations, quotations);

      rfqs[rfqIndex].status = 'Pending Approval';
      rfqs[rfqIndex].timelineStep = 2;
      rfqs[rfqIndex].selectedBidId = bidId;
      writeStore(STORAGE_KEYS.rfqs, rfqs);

      const selectedQuote = quotations.find((quote) => quote.id === bidId);
      if (selectedQuote) {
        addFeed('rfq', `Selected vendor "${selectedQuote.vendorName}" for RFQ ${rfqId}. Sent for approval.`);
        addNotification('approval', `RFQ ${rfqId} is ready for executive approval.`);
      }
      return rfqs[rfqIndex];
    },
  },

  quotations: {
    getByRfqId: async (rfqId) => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.quotations, []).filter((quote) => quote.rfqId === rfqId);
    },
    getAll: async () => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.quotations, []);
    },
  },

  approvals: {
    getPending: async () => {
      await delay(DELAY);
      const rfqs = readStore(STORAGE_KEYS.rfqs, []);
      const quotations = readStore(STORAGE_KEYS.quotations, []);
      return rfqs.filter((rfq) => rfq.status === 'Pending Approval').map((rfq) => ({
        id: rfq.id,
        rfq,
        selectedBid: quotations.find((quote) => quote.id === rfq.selectedBidId),
      }));
    },
    action: async (rfqId, actionType, remarks) => {
      await delay(DELAY);
      const rfqs = readStore(STORAGE_KEYS.rfqs, []);
      const quotations = readStore(STORAGE_KEYS.quotations, []);
      const rfqIndex = rfqs.findIndex((rfq) => rfq.id === rfqId);
      if (rfqIndex === -1) throw new Error('RFQ not found');

      const rfq = rfqs[rfqIndex];
      const bid = quotations.find((quote) => quote.id === rfq.selectedBidId);
      if (!bid) throw new Error('Selected quotation not found');

      if (actionType === 'approve') {
        rfq.status = 'Approved (Pending PO)';
        rfq.timelineStep = 3;

        const vendors = readStore(STORAGE_KEYS.vendors, []);
        const vendor = vendors.find((entry) => entry.id === bid.vendorId) || {};
        const f = getFinancials(bid, vendor);
        const dateStamp = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const purchaseOrders = readStore(STORAGE_KEYS.purchaseOrders, []);
        const po = {
          id: nextId('PO-2026', purchaseOrders),
          rfqId: rfq.id,
          rfqTitle: rfq.title,
          vendorId: bid.vendorId,
          vendorName: bid.vendorName,
          bidId: bid.id,
          subtotal: f.subtotal,
          gstRate: f.gstRate,
          gstAmount: f.gstAmount,
          cgst: f.cgst,
          sgst: f.sgst,
          igst: f.igst,
          totalCost: f.grandTotal,
          createdAt: dateStamp,
          status: 'Sent',
          placeOfSupply: vendor.state || 'Maharashtra',
          vendorGstin: vendor.gstin || '27AABCV1020K1Z9',
          upiId: vendor.upiId || 'vendor@okaxis',
          accountNo: vendor.accountNo || '999988887777',
          ifscCode: vendor.ifscCode || 'UTIB0000194',
          items: bid.items.map((item) => ({ ...item, hsnCode: item.hsnCode || '84713010' })),
        };
        purchaseOrders.unshift(po);
        writeStore(STORAGE_KEYS.purchaseOrders, purchaseOrders);
        rfq.poId = po.id;

        const invoices = readStore(STORAGE_KEYS.invoices, []);
        const invoice = {
          id: nextId('INV-2026', invoices),
          invoiceNumber: `INV/2026/${String(invoices.length + 1).padStart(3, '0')}`,
          poId: po.id,
          rfqTitle: rfq.title,
          vendorName: bid.vendorName,
          subtotal: f.subtotal,
          gstRate: f.gstRate,
          gstAmount: f.gstAmount,
          cgst: f.cgst,
          sgst: f.sgst,
          igst: f.igst,
          totalCost: f.grandTotal,
          createdAt: dateStamp,
          status: 'Sent',
          placeOfSupply: vendor.state || 'Maharashtra',
          vendorGstin: vendor.gstin || '27AABCV1020K1Z9',
          upiId: vendor.upiId || 'vendor@okaxis',
          accountNo: vendor.accountNo || '999988887777',
          ifscCode: vendor.ifscCode || 'UTIB0000194',
          items: bid.items.map((item) => ({ ...item, hsnCode: item.hsnCode || '84713010' })),
        };
        invoices.unshift(invoice);
        writeStore(STORAGE_KEYS.invoices, invoices);
        rfq.invoiceId = invoice.id;
        rfq.status = 'PO Generated';

        addFeed('approval', `Executive approved RFQ ${rfqId}. Created PO ${po.id}. Remarks: "${remarks || 'None'}"`);
        addNotification('po', `Purchase order ${po.id} dispatched to ${bid.vendorName}.`);
      } else {
        rfq.status = 'Rejected';
        rfq.timelineStep = 1;
        bid.status = 'Submitted';
        writeStore(STORAGE_KEYS.quotations, quotations);
        addFeed('approval', `Executive rejected RFQ ${rfqId}. Remarks: "${remarks || 'No remarks added'}"`);
        addNotification('rfq', `RFQ ${rfqId} has been rejected. Resubmission required.`);
      }

      writeStore(STORAGE_KEYS.rfqs, rfqs);
      return true;
    },
  },

  purchaseOrders: {
    getAll: async () => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.purchaseOrders, []);
    },
    getById: async (id) => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.purchaseOrders, []).find((po) => po.id === id) || null;
    },
  },

  invoices: {
    getAll: async () => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.invoices, []);
    },
    pay: async (id) => {
      await delay(DELAY);
      const invoices = readStore(STORAGE_KEYS.invoices, []);
      const index = invoices.findIndex((invoice) => invoice.id === id);
      if (index === -1) throw new Error('Invoice not found');
      invoices[index].status = 'Paid';
      writeStore(STORAGE_KEYS.invoices, invoices);

      const rfqs = readStore(STORAGE_KEYS.rfqs, []);
      const rfqIndex = rfqs.findIndex((rfq) => rfq.invoiceId === id);
      if (rfqIndex !== -1) {
        rfqs[rfqIndex].status = 'Invoice Settled';
        rfqs[rfqIndex].timelineStep = 4;
        writeStore(STORAGE_KEYS.rfqs, rfqs);
      }

      addFeed('invoice', `Paid invoice ${invoices[index].invoiceNumber} for ₹${invoices[index].totalCost.toLocaleString('en-IN')}`);
      return invoices[index];
    },
  },

  feed: {
    getAll: async () => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.activityFeed, []);
    },
    add: (type, description) => addFeed(type, description),
  },

  notifications: {
    getAll: async () => {
      await delay(DELAY);
      return readStore(STORAGE_KEYS.notifications, []);
    },
    add: (type, message) => addNotification(type, message),
    markAllAsRead: async () => {
      await delay(100);
      const notifications = readStore(STORAGE_KEYS.notifications, []);
      notifications.forEach((notification) => {
        notification.read = true;
      });
      writeStore(STORAGE_KEYS.notifications, notifications);
      return notifications;
    },
  },
};
