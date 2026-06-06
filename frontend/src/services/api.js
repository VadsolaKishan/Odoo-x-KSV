// Mock API Layer for VendorBridge
// Simulates delay and uses LocalStorage to persist changes.

const DELAY = 600; // ms

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to load/save localStorage
const getStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initial Datasets
const defaultVendors = [
  { id: 'V-001', name: 'Tata Digital Solutions', email: 'sales@tatadigital.com', category: 'Software & IT', status: 'Active', rating: 4.9, location: 'Bengaluru, Karnataka', phone: '+91 80 5550 1928', website: 'https://tatadigital.com', gstin: '29AAAAA1111A1Z1', pan: 'AAAAA1111A', state: 'Karnataka', city: 'Bengaluru', pincode: '560001', businessType: 'Pvt Ltd', upiId: 'tata@okaxis', accountNo: '302010998811', ifscCode: 'UTIB0000194' },
  { id: 'V-002', name: 'Reliance Logistics Ltd', email: 'contracts@reliancelog.com', category: 'Logistics', status: 'Active', rating: 4.6, location: 'Navi Mumbai, Maharashtra', phone: '+91 22 5550 1234', website: 'https://reliancelog.com', gstin: '27BBBBB2222B2Z2', pan: 'BBBBB2222B', state: 'Maharashtra', city: 'Navi Mumbai', pincode: '400701', businessType: 'Pvt Ltd', upiId: 'reliance@okicici', accountNo: '109988223344', ifscCode: 'ICIC0000104' },
  { id: 'V-003', name: 'Mahindra Metalworks', email: 'orders@mahindrametals.com', category: 'Manufacturing', status: 'Active', rating: 4.2, location: 'Pune, Maharashtra', phone: '+91 20 5550 1498', website: 'https://mahindrametals.com', gstin: '27CCCCC3333C3Z3', pan: 'CCCCC3333C', state: 'Maharashtra', city: 'Pune', pincode: '411001', businessType: 'LLP', upiId: 'mahindra@okhdfc', accountNo: '5010022334455', ifscCode: 'HDFC0000004' },
  { id: 'V-004', name: 'Jaipur Stationery Mart', email: 'sales@jaipurstationery.com', category: 'Office Supplies', status: 'Active', rating: 4.5, location: 'Jaipur, Rajasthan', phone: '+91 141 5550 165', website: 'https://jaipurstationers.in', gstin: '08DDDDD4444D4Z4', pan: 'DDDDD4444D', state: 'Rajasthan', city: 'Jaipur', pincode: '302001', businessType: 'Sole Proprietor', upiId: 'jaipur@oksbi', accountNo: '109988445566', ifscCode: 'SBIN0000302' },
  { id: 'V-005', name: 'Infosys Supplies', email: 'sales@infosys.com', category: 'Software & IT', status: 'Inactive', rating: 3.8, location: 'Mysuru, Karnataka', phone: '+91 821 5550 188', website: 'https://infosys.com', gstin: '29EEEEE5555E5Z5', pan: 'EEEEE5555E', state: 'Karnataka', city: 'Mysuru', pincode: '570001', businessType: 'Pvt Ltd', upiId: 'infosys@okaxis', accountNo: '302010112233', ifscCode: 'UTIB0000194' }
];

const defaultRfqs = [
  {
    id: 'RFQ-2026-001',
    title: 'High-Performance GPU Servers',
    description: 'Procuring 10x high-performance computing servers for AI model training cluster.',
    deadline: '25/06/2026',
    createdAt: '01/06/2026',
    status: 'Quotes Gathered', // RFQ -> Quotes -> Approval -> PO -> Invoice
    items: [
      { name: 'Nvidia H100 GPU Server Node', quantity: 10, hsnCode: '84713010' },
      { name: '100Gbps Switch ConnectX-7', quantity: 2, hsnCode: '85176200' },
    ],
    assignedVendors: ['V-001', 'V-002', 'V-003'],
    timelineStep: 1,
  },
  {
    id: 'RFQ-2026-002',
    title: 'Office Ergonomic Desks',
    description: 'Standardizing ergonomic standing desks for the new Mumbai workspace annex.',
    deadline: '12/06/2026',
    createdAt: '20/05/2026',
    status: 'Invoice Settled',
    items: [
      { name: 'Smart Height Standing Desk Dual-Motor', quantity: 45, hsnCode: '94031000' },
      { name: 'Under-desk Cable Trays', quantity: 45, hsnCode: '94039000' },
    ],
    assignedVendors: ['V-004'],
    timelineStep: 4,
    poId: 'PO-2026-001',
    invoiceId: 'INV-2026-001',
  },
  {
    id: 'RFQ-2026-003',
    title: 'Custom Fabricated Steel Rebars',
    description: 'Reinforced concrete foundation steel bars for construction Project Horizon.',
    deadline: '15/06/2026',
    createdAt: '03/06/2026',
    status: 'Pending Approval',
    items: [
      { name: 'Grade 60 Steel Rebar #4 (1/2 inch)', quantity: 1200, hsnCode: '72142090' },
      { name: 'Grade 60 Steel Rebar #5 (5/8 inch)', quantity: 800, hsnCode: '72142090' },
    ],
    assignedVendors: ['V-002', 'V-003'],
    timelineStep: 2,
    selectedBidId: 'Q-005',
  }
];

const defaultQuotations = [
  // Quotes for RFQ-2026-001
  {
    id: 'Q-001',
    rfqId: 'RFQ-2026-001',
    vendorId: 'V-001',
    vendorName: 'Tata Digital Solutions',
    deliveryTimeDays: 7,
    totalCost: 1450000,
    items: [
      { name: 'Nvidia H100 GPU Server Node', quantity: 10, unitPrice: 140000, total: 1400000, hsnCode: '84713010' },
      { name: '100Gbps Switch ConnectX-7', quantity: 2, unitPrice: 25000, total: 50000, hsnCode: '85176200' }
    ],
    status: 'Submitted',
    remarks: 'Includes premium 3-year support package and immediate deployment assistance in Bengaluru.',
  },
  {
    id: 'Q-002',
    rfqId: 'RFQ-2026-001',
    vendorId: 'V-002',
    vendorName: 'Reliance Logistics Ltd',
    deliveryTimeDays: 3, // Fastest!
    totalCost: 1600000,
    items: [
      { name: 'Nvidia H100 GPU Server Node', quantity: 10, unitPrice: 155000, total: 1550000, hsnCode: '84713010' },
      { name: '100Gbps Switch ConnectX-7', quantity: 2, unitPrice: 25000, total: 50000, hsnCode: '85176200' }
    ],
    status: 'Submitted',
    remarks: 'Expedited express shipment available, can deliver to Mumbai within 72 hours.',
  },
  {
    id: 'Q-003',
    rfqId: 'RFQ-2026-001',
    vendorId: 'V-003',
    vendorName: 'Mahindra Metalworks',
    deliveryTimeDays: 12,
    totalCost: 1380000, // Lowest!
    items: [
      { name: 'Nvidia H100 GPU Server Node', quantity: 10, unitPrice: 135000, total: 1350000, hsnCode: '84713010' },
      { name: '100Gbps Switch ConnectX-7', quantity: 2, unitPrice: 15000, total: 30000, hsnCode: '85176200' }
    ],
    status: 'Submitted',
    remarks: 'Extended shipping time due to high backorder volume. Prices guaranteed.',
  },
  // Quotes for RFQ-2026-003
  {
    id: 'Q-004',
    rfqId: 'RFQ-2026-003',
    vendorId: 'V-002',
    vendorName: 'Reliance Logistics Ltd',
    deliveryTimeDays: 8,
    totalCost: 450000,
    items: [
      { name: 'Grade 60 Steel Rebar #4 (1/2 inch)', quantity: 1200, unitPrice: 200, total: 240000, hsnCode: '72142090' },
      { name: 'Grade 60 Steel Rebar #5 (5/8 inch)', quantity: 800, unitPrice: 262.5, total: 210000, hsnCode: '72142090' }
    ],
    status: 'Rejected',
    remarks: 'Standard grade material. Standard freight cost included.'
  },
  {
    id: 'Q-005',
    rfqId: 'RFQ-2026-003',
    vendorId: 'V-003',
    vendorName: 'Mahindra Metalworks',
    deliveryTimeDays: 5,
    totalCost: 412000, // Best deal chosen
    items: [
      { name: 'Grade 60 Steel Rebar #4 (1/2 inch)', quantity: 1200, unitPrice: 185, total: 222000, hsnCode: '72142090' },
      { name: 'Grade 60 Steel Rebar #5 (5/8 inch)', quantity: 800, unitPrice: 237.5, total: 190000, hsnCode: '72142090' }
    ],
    status: 'Selected',
    remarks: 'Locally sourced steel. Fast delivery direct to construction site in Maharashtra.'
  }
];

const defaultPurchaseOrders = [
  {
    id: 'PO-2026-001',
    rfqId: 'RFQ-2026-002',
    rfqTitle: 'Office Ergonomic Desks',
    vendorId: 'V-004',
    vendorName: 'Jaipur Stationery Mart',
    subtotal: 162711.86,
    gstRate: 18,
    gstAmount: 29288.14,
    cgst: 0,
    sgst: 0,
    igst: 29288.14, // Rajasthan to Maharashtra is interstate
    totalCost: 192000,
    createdAt: '24/05/2026',
    status: 'Acknowledged',
    placeOfSupply: 'Rajasthan',
    vendorGstin: '08DDDDD4444D4Z4',
    upiId: 'jaipur@oksbi',
    accountNo: '109988445566',
    ifscCode: 'SBIN0000302',
    items: [
      { name: 'Smart Height Standing Desk Dual-Motor', quantity: 45, unitPrice: 4000, total: 180000, hsnCode: '94031000' },
      { name: 'Under-desk Cable Trays', quantity: 45, unitPrice: 266.66, total: 12000, hsnCode: '94039000' }
    ]
  }
];

const defaultInvoices = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'INV/2026/001',
    poId: 'PO-2026-001',
    rfqTitle: 'Office Ergonomic Desks',
    vendorName: 'Jaipur Stationery Mart',
    subtotal: 162711.86,
    gstRate: 18,
    gstAmount: 29288.14,
    cgst: 0,
    sgst: 0,
    igst: 29288.14,
    totalCost: 192000,
    createdAt: '28/05/2026',
    status: 'Paid',
    placeOfSupply: 'Rajasthan',
    vendorGstin: '08DDDDD4444D4Z4',
    upiId: 'jaipur@oksbi',
    accountNo: '109988445566',
    ifscCode: 'SBIN0000302',
    items: [
      { name: 'Smart Height Standing Desk Dual-Motor', quantity: 45, unitPrice: 4000, total: 180000, hsnCode: '94031000' },
      { name: 'Under-desk Cable Trays', quantity: 45, unitPrice: 266.66, total: 12000, hsnCode: '94039000' }
    ]
  }
];

const defaultActivityFeed = [
  { id: 'act-1', type: 'rfq', user: 'Procurement', description: 'Quotation selected - Infra supplies pvt ltd selected for office furniture Q2', time: '23 May 2025, 9:15 PM' },
  { id: 'act-2', type: 'approval', user: 'Priya Shah', description: 'Approval pending - PO-2024 awaiting L2 approval by priya shah', time: '22 May 2025, 09:15 AM' },
  { id: 'act-3', type: 'rfq', user: 'Mark Sterling', description: 'RFQ published - office furniture Q2 sent to 3 vendors', time: '19 May 2025' },
  { id: 'act-4', type: 'vendor', user: 'Registration', description: 'Vendor added - FastLog transport registered and pending verifications', time: '18 May 2025, 3:20 PM' },
];

const defaultNotifications = [
  { id: 'not-1', type: 'rfq', message: 'New quotations received for GPU Servers RFQ.', read: false, time: '10m ago' },
  { id: 'not-2', type: 'approval', message: 'RFQ-2026-003 is awaiting your signature.', read: false, time: '1h ago' },
  { id: 'not-3', type: 'vendor', message: 'Tata Digital Solutions updated their contact info.', read: true, time: '2d ago' },
];

const initMockDB = () => {
  // Reset if old dataset detected (contains Acme Corp)
  const oldVendors = localStorage.getItem('vb_vendors');
  if (oldVendors && oldVendors.includes('Acme Corp')) {
    localStorage.removeItem('vb_vendors');
    localStorage.removeItem('vb_rfqs');
    localStorage.removeItem('vb_quotations');
    localStorage.removeItem('vb_purchase_orders');
    localStorage.removeItem('vb_invoices');
    localStorage.removeItem('vb_activity_feed');
    localStorage.removeItem('vb_notifications');
  }

  // Force re-seed of old activity feed to match mockup
  const oldFeed = localStorage.getItem('vb_activity_feed');
  if (oldFeed && oldFeed.includes('Marked Invoice INV/2026/001 as Paid')) {
    localStorage.removeItem('vb_activity_feed');
  }

  if (!localStorage.getItem('vb_vendors')) setStorageItem('vb_vendors', defaultVendors);
  if (!localStorage.getItem('vb_rfqs')) setStorageItem('vb_rfqs', defaultRfqs);
  if (!localStorage.getItem('vb_quotations')) setStorageItem('vb_quotations', defaultQuotations);
  if (!localStorage.getItem('vb_purchase_orders')) setStorageItem('vb_purchase_orders', defaultPurchaseOrders);
  if (!localStorage.getItem('vb_invoices')) setStorageItem('vb_invoices', defaultInvoices);
  if (!localStorage.getItem('vb_activity_feed')) setStorageItem('vb_activity_feed', defaultActivityFeed);
  if (!localStorage.getItem('vb_notifications')) setStorageItem('vb_notifications', defaultNotifications);
};

initMockDB();

// API Layer
export const api = {
  // VENDORS
  vendors: {
    getAll: async () => {
      await sleep(DELAY);
      return getStorageItem('vb_vendors', []);
    },
    getById: async (id) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_vendors', []);
      return list.find(v => v.id === id) || null;
    },
    create: async (data) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_vendors', []);
      const newVendor = {
        ...data,
        id: `V-0${list.length + 1}`,
        rating: data.rating ? parseFloat(data.rating) : 0,
        status: data.status || 'Active'
      };
      list.unshift(newVendor);
      setStorageItem('vb_vendors', list);
      
      // Feed log
      api.feed.add('vendor', `Added new vendor "${newVendor.name}"`);
      return newVendor;
    },
    update: async (id, data) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_vendors', []);
      const index = list.findIndex(v => v.id === id);
      if (index === -1) throw new Error('Vendor not found');
      list[index] = { ...list[index], ...data };
      setStorageItem('vb_vendors', list);
      
      api.feed.add('vendor', `Updated vendor profile for "${list[index].name}"`);
      return list[index];
    },
    delete: async (id) => {
      await sleep(DELAY);
      let list = getStorageItem('vb_vendors', []);
      const vendor = list.find(v => v.id === id);
      list = list.filter(v => v.id !== id);
      setStorageItem('vb_vendors', list);
      if (vendor) {
        api.feed.add('vendor', `Removed vendor "${vendor.name}"`);
      }
      return true;
    }
  },

  // RFQS
  rfqs: {
    getAll: async () => {
      await sleep(DELAY);
      return getStorageItem('vb_rfqs', []);
    },
    getById: async (id) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_rfqs', []);
      return list.find(r => r.id === id) || null;
    },
    create: async (data) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_rfqs', []);
      const nextId = `RFQ-2026-0${list.length + 1}`;
      const newRfq = {
        id: nextId,
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'RFQ Created', // Initial
        items: data.items || [],
        assignedVendors: data.assignedVendors || [],
        timelineStep: 0,
      };
      list.unshift(newRfq);
      setStorageItem('vb_rfqs', list);

      // Generate random mock quotes from the assigned vendors for comparison
      const allVendors = getStorageItem('vb_vendors', []);
      const quotes = getStorageItem('vb_quotations', []);
      
      data.assignedVendors.forEach((vendorId, idx) => {
        const v = allVendors.find(vend => vend.id === vendorId);
        if (v) {
          // Compute logical mock price
          let totalCost = 0;
          const quoteItems = newRfq.items.map(item => {
            // pricing variations: base unit price varies slightly per vendor index
            const basePrice = (idx + 1) * 12 + (item.quantity * 2);
            const unitPrice = parseFloat((basePrice * (0.85 + Math.random() * 0.3)).toFixed(2));
            const total = parseFloat((unitPrice * item.quantity).toFixed(2));
            totalCost += total;
            return { name: item.name, quantity: item.quantity, unitPrice, total };
          });
          
          const newQuote = {
            id: `Q-0${quotes.length + 1}`,
            rfqId: nextId,
            vendorId: v.id,
            vendorName: v.name,
            deliveryTimeDays: Math.floor(Math.random() * 10) + 3,
            totalCost: parseFloat(totalCost.toFixed(2)),
            items: quoteItems,
            status: 'Submitted',
            remarks: `Official bid for ${newRfq.title}. Standard commercial terms apply.`
          };
          quotes.push(newQuote);
        }
      });
      setStorageItem('vb_quotations', quotes);

      // Transition RFQ automatically to "Quotes Gathered" step 1
      newRfq.status = 'Quotes Gathered';
      newRfq.timelineStep = 1;
      const index = list.findIndex(r => r.id === nextId);
      if (index !== -1) list[index] = newRfq;
      setStorageItem('vb_rfqs', list);

      api.feed.add('rfq', `Created RFQ ${nextId} "${newRfq.title}" with ${newRfq.items.length} items`);
      api.notifications.add('rfq', `Bids received for newly created RFQ ${nextId}.`);
      return newRfq;
    },
    // Reorder copy utility
    reorder: async (rfqId) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_rfqs', []);
      const source = list.find(r => r.id === rfqId);
      if (!source) throw new Error('Source RFQ not found');
      return {
        title: `Copy of ${source.title}`,
        description: source.description,
        items: source.items.map(i => ({ ...i })),
        assignedVendors: [...source.assignedVendors]
      };
    },
    selectBid: async (rfqId, bidId) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_rfqs', []);
      const index = list.findIndex(r => r.id === rfqId);
      if (index === -1) throw new Error('RFQ not found');

      // Update quote state
      const quotes = getStorageItem('vb_quotations', []);
      quotes.forEach(q => {
        if (q.rfqId === rfqId) {
          q.status = q.id === bidId ? 'Selected' : 'Rejected';
        }
      });
      setStorageItem('vb_quotations', quotes);

      list[index].status = 'Pending Approval';
      list[index].timelineStep = 2;
      list[index].selectedBidId = bidId;
      setStorageItem('vb_rfqs', list);

      const chosenQuote = quotes.find(q => q.id === bidId);
      api.feed.add('rfq', `Selected vendor "${chosenQuote.vendorName}" for RFQ ${rfqId}. Sent for approval.`);
      api.notifications.add('approval', `RFQ ${rfqId} is ready for executive approval.`);
      return list[index];
    }
  },

  // QUOTATIONS
  quotations: {
    getByRfqId: async (rfqId) => {
      await sleep(DELAY);
      const quotes = getStorageItem('vb_quotations', []);
      return quotes.filter(q => q.rfqId === rfqId);
    },
    getAll: async () => {
      await sleep(DELAY);
      return getStorageItem('vb_quotations', []);
    }
  },

  // APPROVALS
  approvals: {
    getPending: async () => {
      await sleep(DELAY);
      const rfqs = getStorageItem('vb_rfqs', []);
      // Pending approval items
      const pending = rfqs.filter(r => r.status === 'Pending Approval');
      const bids = getStorageItem('vb_quotations', []);
      return pending.map(r => {
        const bid = bids.find(b => b.id === r.selectedBidId);
        return {
          id: r.id,
          rfq: r,
          selectedBid: bid,
        };
      });
    },
    action: async (rfqId, actionType, remarks) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_rfqs', []);
      const index = list.findIndex(r => r.id === rfqId);
      if (index === -1) throw new Error('RFQ not found');

      const rfq = list[index];
      const bids = getStorageItem('vb_quotations', []);
      const bid = bids.find(b => b.id === rfq.selectedBidId);

      if (actionType === 'approve') {
        rfq.status = 'Approved (Pending PO)';
        rfq.timelineStep = 3;

        // Fetch vendor details
        const vendorsObj = getStorageItem('vb_vendors', []);
        const vendor = vendorsObj.find(v => v.id === bid.vendorId) || {};

        // Indian Date helper (DD/MM/YYYY)
        const indianDateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        // Calculate GST rates (18% standard split)
        const subtotal = bid.totalCost;
        const gstRate = 18;
        const gstAmount = parseFloat((subtotal * 0.18).toFixed(2));
        const grandTotal = parseFloat((subtotal + gstAmount).toFixed(2));

        const isIntrastate = (vendor.state || '').toLowerCase() === 'maharashtra';
        const cgst = isIntrastate ? parseFloat((gstAmount / 2).toFixed(2)) : 0;
        const sgst = isIntrastate ? parseFloat((gstAmount / 2).toFixed(2)) : 0;
        const igst = !isIntrastate ? gstAmount : 0;
        
        // Generate Purchase Order
        const pos = getStorageItem('vb_purchase_orders', []);
        const poId = `PO-2026-0${pos.length + 1}`;
        const newPo = {
          id: poId,
          rfqId: rfq.id,
          rfqTitle: rfq.title,
          vendorId: bid.vendorId,
          vendorName: bid.vendorName,
          bidId: bid.id,
          subtotal,
          gstRate,
          gstAmount,
          cgst,
          sgst,
          igst,
          totalCost: grandTotal,
          createdAt: indianDateStr,
          status: 'Sent',
          placeOfSupply: vendor.state || 'Maharashtra',
          vendorGstin: vendor.gstin || '27AABCV1020K1Z9',
          upiId: vendor.upiId || 'vendor@okaxis',
          accountNo: vendor.accountNo || '999988887777',
          ifscCode: vendor.ifscCode || 'UTIB0000194',
          items: bid.items.map(i => ({ ...i, hsnCode: i.hsnCode || '84713010' }))
        };
        pos.unshift(newPo);
        setStorageItem('vb_purchase_orders', pos);
        rfq.poId = poId;
        rfq.status = 'PO Generated';

        // Auto-generate invoice mock
        const invs = getStorageItem('vb_invoices', []);
        const invId = `INV-2026-0${invs.length + 1}`;
        const newInv = {
          id: invId,
          invoiceNumber: `INV/2026/0${invs.length + 1}`,
          poId: poId,
          rfqTitle: rfq.title,
          vendorName: bid.vendorName,
          subtotal,
          gstRate,
          gstAmount,
          cgst,
          sgst,
          igst,
          totalCost: grandTotal,
          createdAt: indianDateStr,
          status: 'Sent',
          placeOfSupply: vendor.state || 'Maharashtra',
          vendorGstin: vendor.gstin || '27AABCV1020K1Z9',
          upiId: vendor.upiId || 'vendor@okaxis',
          accountNo: vendor.accountNo || '999988887777',
          ifscCode: vendor.ifscCode || 'UTIB0000194',
          items: bid.items.map(i => ({ ...i, hsnCode: i.hsnCode || '84713010' }))
        };
        invs.unshift(newInv);
        setStorageItem('vb_invoices', invs);
        rfq.invoiceId = invId;

        api.feed.add('approval', `Executive approved RFQ ${rfqId}. Created PO ${poId}. Remarks: "${remarks || 'None'}"`);
        api.notifications.add('po', `Purchase order ${poId} dispatched to ${bid.vendorName}.`);
      } else {
        rfq.status = 'Rejected';
        rfq.timelineStep = 1; // back to quotes
        if (bid) bid.status = 'Submitted';
        setStorageItem('vb_quotations', bids);

        api.feed.add('approval', `Executive rejected RFQ ${rfqId}. Remarks: "${remarks || 'No remarks added'}"`);
        api.notifications.add('rfq', `RFQ ${rfqId} has been rejected. Resubmission required.`);
      }

      setStorageItem('vb_rfqs', list);
      return true;
    }
  },

  // PURCHASE ORDERS
  purchaseOrders: {
    getAll: async () => {
      await sleep(DELAY);
      return getStorageItem('vb_purchase_orders', []);
    },
    getById: async (id) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_purchase_orders', []);
      return list.find(po => po.id === id) || null;
    }
  },

  // INVOICES
  invoices: {
    getAll: async () => {
      await sleep(DELAY);
      return getStorageItem('vb_invoices', []);
    },
    pay: async (id) => {
      await sleep(DELAY);
      const list = getStorageItem('vb_invoices', []);
      const index = list.findIndex(inv => inv.id === id);
      if (index === -1) throw new Error('Invoice not found');
      
      list[index].status = 'Paid';
      setStorageItem('vb_invoices', list);
      
      // Update RFQ status
      const rfqs = getStorageItem('vb_rfqs', []);
      const rfqIndex = rfqs.findIndex(r => r.invoiceId === id);
      if (rfqIndex !== -1) {
        rfqs[rfqIndex].status = 'Invoice Settled';
        rfqs[rfqIndex].timelineStep = 4;
        setStorageItem('vb_rfqs', rfqs);
      }

      api.feed.add('invoice', `Paid invoice ${list[index].invoiceNumber} for ₹${list[index].totalCost.toLocaleString('en-IN')}`);
      return list[index];
    }
  },

  // FEED
  feed: {
    getAll: async () => {
      return getStorageItem('vb_activity_feed', []);
    },
    add: (type, description) => {
      const list = getStorageItem('vb_activity_feed', []);
      list.unshift({
        id: `act-${Date.now()}`,
        type,
        user: 'Current User',
        description,
        time: 'Just now'
      });
      setStorageItem('vb_activity_feed', list.slice(0, 30)); // limit 30
    }
  },

  // NOTIFICATIONS
  notifications: {
    getAll: async () => {
      return getStorageItem('vb_notifications', []);
    },
    add: (type, message) => {
      const list = getStorageItem('vb_notifications', []);
      list.unshift({
        id: `not-${Date.now()}`,
        type,
        message,
        read: false,
        time: 'Just now'
      });
      setStorageItem('vb_notifications', list);
    },
    markAllAsRead: async () => {
      const list = getStorageItem('vb_notifications', []);
      list.forEach(n => n.read = true);
      setStorageItem('vb_notifications', list);
      return list;
    }
  }
};
