import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuthStore } from '../store/auth.store';
import api from '../lib/axios';
import { 
  Search, 
  Plus, 
  X, 
  Building2, 
  Star, 
  Check, 
  Ban, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Eye, 
  FileSpreadsheet, 
  Edit2, 
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Vendor {
  id: string;
  name: string;
  category: string;
  gst_number: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  status: 'active' | 'pending' | 'blocked';
  rating: number;
  created_at: string;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: 'active' | 'pending' | 'blocked' }) => {
  const colors = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${colors[status] || 'bg-gray-500/10 text-gray-400 border-white/5'}`}>
      {status}
    </span>
  );
};



export default function VendorsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'pending', 'blocked'
  const [page, setPage] = useState(1);
  const limit = 10;

  // Add Vendor Modal state
  const [isModalOpen, setIsModalOpen] = useState(() => {
    return searchParams.get('openAddModal') === 'true';
  });

  // Debounced search logic (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Clear query parameters after opening modal to avoid reopening on reload
  useEffect(() => {
    if (searchParams.get('openAddModal') === 'true') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openAddModal');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Vendor Detail Drawer state
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    gst_number: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    address: ''
  });

  // Add Vendor Form state
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'IT',
    gst_number: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    address: ''
  });

  // Queries
  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['vendorsList', statusFilter, searchTerm, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await api.get(`/vendors?${params.toString()}`);
      return res.data;
    }
  });

  // Permissions helper
  const canModify = user?.role === 'admin' || user?.role === 'procurement_officer';
  const canDelete = user?.role === 'admin';

  // Mutations
  const createVendorMutation = useMutation({
    mutationFn: async (payload: typeof newVendor) => {
      const res = await api.post('/vendors', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorsList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast.success('Vendor onboarded successfully');
      setIsModalOpen(false);
      setNewVendor({
        name: '',
        category: 'IT',
        gst_number: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        address: ''
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to onboard vendor');
    }
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof editForm }) => {
      const res = await api.put(`/vendors/${id}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendorsList'] });
      toast.success('Vendor profile updated');
      setSelectedVendor(data.data || null);
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update vendor');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'blocked' }) => {
      const res = await api.put(`/vendors/${id}`, { status });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorsList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast.success(`Vendor status updated to ${variables.status}`);
      if (selectedVendor && selectedVendor.id === data.data.id) {
        setSelectedVendor(data.data);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update vendor status');
    }
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/vendors/${id}`);
      return res.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['vendorsList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast.success('Vendor deleted (marked blocked)');
      if (selectedVendor && selectedVendor.id === id) {
        setSelectedVendor(null);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete vendor');
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.gst_number || !newVendor.contact_phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    createVendorMutation.mutate(newVendor);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    updateVendorMutation.mutate({ id: selectedVendor.id, payload: editForm });
  };

  const startEditing = () => {
    if (!selectedVendor) return;
    setEditForm({
      name: selectedVendor.name,
      category: selectedVendor.category,
      gst_number: selectedVendor.gst_number,
      contact_name: selectedVendor.contact_name || '',
      contact_phone: selectedVendor.contact_phone,
      contact_email: selectedVendor.contact_email || '',
      address: selectedVendor.address || ''
    });
    setIsEditing(true);
  };

  // Toggle vendor status (Active <-> Blocked)
  const handleToggleStatus = () => {
    if (!selectedVendor) return;
    const nextStatus = selectedVendor.status === 'active' ? 'blocked' : 'active';
    updateStatusMutation.mutate({ id: selectedVendor.id, status: nextStatus });
  };

  const categories = ['IT', 'Furniture', 'Logistics', 'Raw Materials', 'Office Supplies', 'Services'];

  // Live API data only — no fallback mock data
  const vendors: Vendor[] = vendorsData?.data || [];
  const totalVendors = vendorsData?.meta?.total || 0;
  const totalPages = Math.ceil(totalVendors / limit) || 1;
  const statusCounts = vendorsData?.statusCounts || { all: 0, active: 0, pending: 0, blocked: 0 };

  return (
    <MainLayout>
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Vendors</h1>
          <p className="text-text-secondary text-sm mt-1">Manage supplier profiles and registrations</p>
        </div>

        {canModify && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-glow hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200 transform active:scale-95"
            id="add-vendor-btn"
          >
            <Plus className="w-4.5 h-4.5" /> Add Vendor
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search bar .....search by name, gst, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-12"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-subtle mb-6">
        {[
          { label: 'All', val: 'all', count: statusCounts.all },
          { label: 'Active', val: 'active', count: statusCounts.active },
          { label: 'Pending', val: 'pending', count: statusCounts.pending },
          { label: 'Blocked', val: 'blocked', count: statusCounts.blocked }
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => {
              setStatusFilter(tab.val);
              setPage(1);
            }}
            className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition-all relative ${
              statusFilter === tab.val
                ? 'border-brand-green text-brand-green bg-brand-green/5'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <span className="capitalize">
              {tab.label} ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Main Vendors Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Querying supplier registers...</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-subtle text-text-secondary text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Vendor Name</th>
                  <th className="py-4 px-6 font-semibold">Category</th>
                  <th className="py-4 px-6 font-semibold">GST no.</th>
                  <th className="py-4 px-6 font-semibold">Contact no.</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/30">
                {vendors.map((vendor: Vendor) => (
                  <tr 
                    key={vendor.id} 
                    className="hover:bg-surface-elevated/50 text-sm text-text-primary transition-colors duration-150"
                  >
                    <td className="py-4 px-6 font-semibold text-white">
                      {vendor.name}
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      {vendor.category}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-text-secondary">
                      {vendor.gst_number}
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      {vendor.contact_phone}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={vendor.status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setIsEditing(false);
                        }}
                        className="inline-flex items-center gap-1.5 border border-brand-green/30 hover:border-brand-green hover:bg-brand-green/10 text-brand-green px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                      >
                        <Eye className="w-3.5 h-3.5" /> VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination control */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-black/20 border border-subtle px-6 py-4 rounded-xl gap-4">
        <span className="text-xs text-text-secondary">
          Showing {totalVendors === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, totalVendors)} of {totalVendors} vendors
        </span>
        
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 bg-white/5 border border-subtle text-text-primary rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 bg-white/5 border border-subtle text-text-primary rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl border border-brand-green/20 shadow-glow relative overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-subtle">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-green" /> Add Vendor Profile
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tech Core LTD"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category *</label>
                  <select
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="input-field w-full"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22AAAAA1111A1Z1"
                    value={newVendor.gst_number}
                    onChange={(e) => setNewVendor({ ...newVendor, gst_number: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contact Liaison Name</label>
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={newVendor.contact_name}
                    onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Phone number"
                    value={newVendor.contact_phone}
                    onChange={(e) => setNewVendor({ ...newVendor, contact_phone: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contact Email</label>
                  <input
                    type="email"
                    placeholder="email@supplier.com"
                    value={newVendor.contact_email}
                    onChange={(e) => setNewVendor({ ...newVendor, contact_email: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Physical Address</label>
                  <textarea
                    placeholder="Enter full address..."
                    value={newVendor.address}
                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                    rows={2}
                    className="input-field w-full pt-3 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-subtle mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-text-secondary bg-white/5 hover:bg-white/10 rounded-lg border border-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVendorMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-glow"
                >
                  {createVendorMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Detail Slide-in Drawer from Right */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          selectedVendor ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSelectedVendor(null)}
      >
        <div 
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-card border-l border-subtle shadow-card z-50 flex flex-col justify-between transform transition-transform duration-300 ease-out p-6 ${
            selectedVendor ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedVendor && (
            <>
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-subtle pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-semibold text-brand-green uppercase tracking-wider bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded">
                    {selectedVendor.category}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2.5 leading-tight">{selectedVendor.name}</h2>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(selectedVendor.rating || 0) 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-text-secondary/35'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-text-secondary font-medium">({selectedVendor.rating || '0.0'})</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVendor(null)}
                  className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                
                {isEditing ? (
                  /* Form edit mode inside Drawer */
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary font-semibold uppercase">Vendor Name</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field w-full text-sm" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary font-semibold uppercase">Category</label>
                      <select 
                        className="input-field w-full text-sm" 
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary font-semibold uppercase">GST no.</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field w-full text-sm" 
                        value={editForm.gst_number}
                        onChange={(e) => setEditForm({ ...editForm, gst_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary font-semibold uppercase">Contact Liaison</label>
                      <input 
                        type="text" 
                        className="input-field w-full text-sm" 
                        value={editForm.contact_name}
                        onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary font-semibold uppercase">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        className="input-field w-full text-sm" 
                        value={editForm.contact_phone}
                        onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary font-semibold uppercase">Contact Email</label>
                      <input 
                        type="email" 
                        className="input-field w-full text-sm" 
                        value={editForm.contact_email}
                        onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary font-semibold uppercase">Physical Address</label>
                      <textarea 
                        className="input-field w-full text-sm pt-2 resize-none" 
                        rows={2}
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-3">
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="px-3.5 py-1.5 bg-white/5 border border-subtle text-text-secondary rounded text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={updateVendorMutation.isPending}
                        className="inline-flex items-center gap-1 bg-brand-green hover:bg-brand-green-dark text-white px-3.5 py-1.5 rounded text-xs font-semibold"
                      >
                        {updateVendorMutation.isPending ? <Loader2 className="w-3 animate-spin" /> : <Save className="w-3.5 h-3.5" />} SAVE
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Read only detailed view mode inside Drawer */
                  <div className="space-y-5 text-sm">
                    {/* Status Display */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-bold text-text-secondary uppercase">Supplier Status</span>
                      <StatusBadge status={selectedVendor.status} />
                    </div>

                    {/* Metadata Items */}
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-3 py-1 border-b border-subtle/30">
                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">GSTIN</span>
                        <span className="col-span-2 text-white font-mono font-medium">{selectedVendor.gst_number}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1 border-b border-subtle/30">
                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Contact</span>
                        <span className="col-span-2 text-white">{selectedVendor.contact_name || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1 border-b border-subtle/30">
                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Phone</span>
                        <span className="col-span-2 text-white">{selectedVendor.contact_phone}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1 border-b border-subtle/30">
                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Email</span>
                        <span className="col-span-2 text-white truncate">{selectedVendor.contact_email || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1 border-b border-subtle/30">
                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Address</span>
                        <span className="col-span-2 text-white leading-normal">{selectedVendor.address || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1 border-b border-subtle/30">
                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Created On</span>
                        <span className="col-span-2 text-white">
                          {new Date(selectedVendor.created_at || Date.now()).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Action Bar */}
              {!isEditing && (
                <div className="border-t border-subtle pt-6 mt-6 space-y-3">
                  
                  {/* Status Toggle & Edit Buttons */}
                  {canModify && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={startEditing}
                        className="flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-text-secondary" /> EDIT PROFILE
                      </button>
                      <button
                        onClick={handleToggleStatus}
                        disabled={updateStatusMutation.isPending}
                        className={`flex items-center justify-center gap-2 border py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-colors ${
                          selectedVendor.status === 'active' 
                            ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400' 
                            : 'border-brand-green/30 bg-brand-green/5 hover:bg-brand-green/10 text-brand-green'
                        }`}
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : selectedVendor.status === 'active' ? (
                          <>
                            <Ban className="w-3.5 h-3.5" /> BLOCK SUPPLIER
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" /> VERIFY SUPPLIER
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Secondary Operations */}
                  <button
                    onClick={() => {
                      setSelectedVendor(null);
                      navigate(`/rfqs?vendorId=${selectedVendor.id}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> VIEW ASSOCIATED RFQS
                  </button>

                  {/* Delete Button */}
                  {canDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${selectedVendor.name}?`)) {
                          deleteVendorMutation.mutate(selectedVendor.id);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 border border-red-500/10 hover:bg-red-500/10 text-red-400 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> SOFT DELETE SUPPLIER
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </MainLayout>
  );
}
