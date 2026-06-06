import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Building, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

export const Vendors = () => {
  const { vendors, loading, addVendor, updateVendor, deleteVendor } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null); // null = Add, object = Edit
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Software & IT',
    status: 'Active',
    rating: '5.0',
    state: 'Maharashtra',
    city: '',
    pincode: '',
    phone: '',
    website: '',
    gstin: '',
    pan: '',
    businessType: 'Pvt Ltd',
    upiId: '',
    accountNo: '',
    ifscCode: ''
  });
  const [errors, setErrors] = useState({});

  // Auto-trigger Add Modal from query param (?add=true)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('add') === 'true') {
      handleOpenAddModal();
      navigate('/vendors', { replace: true });
    }
  }, [location, navigate]);

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      email: '',
      category: 'Software & IT',
      status: 'Active',
      rating: '5.0',
      state: 'Maharashtra',
      city: '',
      pincode: '',
      phone: '',
      website: '',
      gstin: '',
      pan: '',
      businessType: 'Pvt Ltd',
      upiId: '',
      accountNo: '',
      ifscCode: ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      category: vendor.category,
      status: vendor.status,
      rating: vendor.rating.toString(),
      state: vendor.state || 'Maharashtra',
      city: vendor.city || '',
      pincode: vendor.pincode || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      gstin: vendor.gstin || '',
      pan: vendor.pan || '',
      businessType: vendor.businessType || 'Pvt Ltd',
      upiId: vendor.upiId || '',
      accountNo: vendor.accountNo || '',
      ifscCode: vendor.ifscCode || ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenDeleteConfirm = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteConfirmOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Company name is required.';
    
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email.';
    }
    
    if (formData.rating) {
      const rateVal = parseFloat(formData.rating);
      if (isNaN(rateVal) || rateVal < 0 || rateVal > 5) {
        errs.rating = 'Rating must be between 0.0 and 5.0.';
      }
    }

    // GSTIN Validation: 15 Alphanumeric (Indian GSTIN format: e.g. 27AAAAA0000A1Z5)
    if (formData.gstin) {
      const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/i;
      if (!gstinRegex.test(formData.gstin.trim())) {
        errs.gstin = 'Invalid GSTIN format (Format: 22AAAAA0000A1Z5).';
      }
    }

    // PAN Validation: 10 characters (e.g. ABCDE1234F)
    if (formData.pan) {
      const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/i;
      if (!panRegex.test(formData.pan.trim())) {
        errs.pan = 'Invalid PAN format (Format: ABCDE1234F).';
      }
    }

    // Pincode Validation: 6 digits
    if (formData.pincode) {
      const pinRegex = /^\d{6}$/;
      if (!pinRegex.test(formData.pincode.trim())) {
        errs.pincode = 'Pincode must be exactly 6 digits.';
      }
    }

    // IFSC Code Validation: 11 characters (e.g. SBIN0000302)
    if (formData.ifscCode) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!ifscRegex.test(formData.ifscCode.trim())) {
        errs.ifscCode = 'Invalid IFSC code format (e.g. SBIN0000302).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Convert keys to uppercase before saving
    const formattedData = {
      ...formData,
      gstin: formData.gstin.toUpperCase().trim(),
      pan: formData.pan.toUpperCase().trim(),
      ifscCode: formData.ifscCode.toUpperCase().trim(),
      location: `${formData.city}, ${formData.state}`
    };

    if (editingVendor) {
      await updateVendor(editingVendor.id, formattedData);
    } else {
      await addVendor(formattedData);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (vendorToDelete) {
      await deleteVendor(vendorToDelete.id);
      setDeleteConfirmOpen(false);
      setVendorToDelete(null);
    }
  };

  // Filter vendors database
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.gstin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = selectedStatus 
      ? (selectedStatus === 'Blocked' 
          ? (v.status === 'Blocked' || v.status === 'Inactive') 
          : v.status === selectedStatus)
      : true;
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = vendors.filter(v => v.status === 'Active').length;
  const pendingCount = vendors.filter(v => v.status === 'Pending').length;
  const blockedCount = vendors.filter(v => v.status === 'Blocked' || v.status === 'Inactive').length;
  const allCount = vendors.length;

  const headers = [
    {
      label: 'Vendor Name',
      key: 'name',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-800 dark:text-dark-100">{row.name}</span>
          <span className="text-[10px] text-slate-400 dark:text-dark-500 font-medium">ID: {row.id}</span>
        </div>
      )
    },
    {
      label: 'Category',
      key: 'category',
      render: (row) => (
        <span className="capitalize">{row.category}</span>
      )
    },
    {
      label: 'GST no.',
      key: 'gstin',
      render: (row) => (
        <span className="font-mono text-slate-600 dark:text-dark-350">{row.gstin || '-'}</span>
      )
    },
    {
      label: 'contact no.',
      key: 'phone',
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.phone || '-'}</span>
          <span className="text-[10px] text-slate-450 dark:text-dark-500">{row.email}</span>
        </div>
      )
    },
    {
      label: 'Status',
      key: 'status',
      render: (row) => {
        const displayStatus = row.status === 'Inactive' ? 'Blocked' : row.status;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
            displayStatus === 'Active'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
              : displayStatus === 'Pending'
                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
          }`}>
            {displayStatus}
          </span>
        );
      }
    },
    {
      label: 'Action',
      key: 'actions',
      render: (row) => (
        <button
          onClick={() => handleOpenEditModal(row)}
          className="px-3 py-1 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-800 transition-all active:scale-95 cursor-pointer"
        >
          View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
            Vendors
          </h1>
          <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
            Manage supplier profiles and registrations
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-all font-semibold text-xs active:scale-98 cursor-pointer"
        >
          + Add Vendor
        </button>
      </div>

      {/* Search panel */}
      <div className="border border-slate-200 dark:border-dark-800 rounded-xl p-3 bg-white dark:bg-dark-900/50 shadow-sm">
        <input
          type="text"
          placeholder="Search bar ...... search by name, gst number, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-xs bg-transparent focus:outline-none text-slate-700 dark:text-dark-200"
        />
      </div>

      {/* Filter chips / tabs */}
      <div className="flex flex-wrap items-center gap-2 select-none">
        {[
          { key: '', label: `All (${allCount})` },
          { key: 'Active', label: `active (${activeCount})` },
          { key: 'Pending', label: `Pending (${pendingCount})` },
          { key: 'Blocked', label: `Blocked (${blockedCount})` }
        ].map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-100 dark:bg-dark-800 text-slate-900 dark:text-dark-100 border-slate-400 dark:border-dark-600'
                  : 'bg-transparent text-slate-500 dark:text-dark-400 border-slate-200 dark:border-dark-800 hover:border-slate-350 dark:hover:border-dark-750'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Vendors Table */}
      <Table
        headers={headers}
        data={filteredVendors}
        loading={loading}
        emptyMessage="No vendors found matching selection."
      />

      {/* Add / Edit CRUD Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Profile' : 'Register New Vendor Partner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs leading-normal">
          
          <div className="border-b border-slate-100 dark:border-dark-800 pb-2 flex items-center gap-1.5 font-bold text-slate-750 dark:text-dark-250">
            <Building className="w-4 h-4 text-brand-500" />
            <span>Company Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Company Name"
              id="v_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Tata Digital Solutions"
              required
            />

            <FormInput
              label="Corporate Email"
              id="v_email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="sales@tatadigital.com"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <FormInput
                label="Business Type"
                id="v_businessType"
                type="select"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                options={['MSME', 'Pvt Ltd', 'LLP', 'Sole Proprietor']}
              />
            </div>
            <div className="col-span-1">
              <FormInput
                label="Category"
                id="v_category"
                type="select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={['Software & IT', 'Electronics', 'Logistics', 'Office Supplies', 'Manufacturing', 'Construction']}
              />
            </div>
            <div className="col-span-1">
              <FormInput
                label="Rating (0-5)"
                id="v_rating"
                type="text"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                error={errors.rating}
                placeholder="4.9"
              />
            </div>
          </div>

          {/* GSTIN / PAN Validation inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-dark-950/20 p-3 rounded-xl border border-slate-150 dark:border-dark-850">
            <FormInput
              label="GSTIN (GST Number)"
              id="v_gstin"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              error={errors.gstin}
              placeholder="29AAAAA1111A1Z1"
              maxLength="15"
            />
            <FormInput
              label="PAN Number"
              id="v_pan"
              value={formData.pan}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
              error={errors.pan}
              placeholder="AAAAA1111A"
              maxLength="10"
            />
          </div>

          <div className="border-b border-slate-100 dark:border-dark-800 pb-2 pt-2 flex items-center gap-1.5 font-bold text-slate-750 dark:text-dark-250">
            <MapPin className="w-4 h-4 text-brand-500" />
            <span>Address Details</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <FormInput
                label="State"
                id="v_state"
                type="select"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                options={INDIAN_STATES}
              />
            </div>
            <div className="col-span-1">
              <FormInput
                label="City"
                id="v_city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bengaluru"
              />
            </div>
            <div className="col-span-1">
              <FormInput
                label="Pincode"
                id="v_pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                error={errors.pincode}
                placeholder="560001"
                maxLength="6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Direct Telephone"
              id="v_phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 80 5550 1928"
            />
            <FormInput
              label="Website Domain"
              id="v_website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://tatadigital.com"
            />
          </div>

          <div className="border-b border-slate-100 dark:border-dark-800 pb-2 pt-2 flex items-center gap-1.5 font-bold text-slate-750 dark:text-dark-250">
            <CreditCard className="w-4 h-4 text-brand-500" />
            <span>Payment & Banking Details</span>
          </div>

          <FormInput
            label="UPI ID"
            id="v_upiId"
            value={formData.upiId}
            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
            placeholder="companyname@okaxis"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Bank Account Number"
              id="v_accountNo"
              value={formData.accountNo}
              onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
              placeholder="302010998811"
            />
            <FormInput
              label="IFSC Code"
              id="v_ifscCode"
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
              error={errors.ifscCode}
              placeholder="UTIB0000194"
              maxLength="11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="System Status"
              id="v_status"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={['Active', 'Inactive']}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-800 select-none">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-dark-800 dark:hover:bg-dark-850 text-slate-700 dark:text-dark-300 rounded-lg transition-colors border border-slate-150 dark:border-dark-750"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-md transition-all active:scale-98"
            >
              {editingVendor ? 'Save Changes' : 'Register Vendor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Vendor Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-dark-300 leading-normal">
            Are you sure you want to remove <span className="font-bold text-slate-800 dark:text-dark-100">"{vendorToDelete?.name}"</span>? 
            This action deletes their credentials, ratings, and log history. It cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-800">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-dark-800 dark:hover:bg-dark-850 text-slate-700 dark:text-dark-300 rounded-lg transition-colors border border-slate-150 dark:border-dark-750"
            >
              Keep Vendor
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold bg-danger-600 hover:bg-danger-500 text-white rounded-lg shadow-md transition-all active:scale-98"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Vendors;
