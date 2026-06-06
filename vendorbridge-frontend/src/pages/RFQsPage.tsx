import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuthStore } from '../store/auth.store';
import api from '../lib/axios';
import { 
  Search, 
  Plus, 
  X, 
  Calendar, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Eye, 
  Send,
  Trash2,
  BarChart
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RFQ {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  description: string;
  deadline: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  created_by: string;
  created_at: string;
  updated_at: string;
  creator_name: string;
  line_items_count: number;
  vendor_count: number;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: RFQ['status'] }) => {
  const colors = {
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    published: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    closed: 'bg-red-500/10 text-red-400 border-red-500/20',
    awarded: 'bg-emerald-500/10 text-brand-green border-brand-green/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${colors[status] || 'bg-gray-500/10 text-gray-400 border-white/5'}`}>
      {status}
    </span>
  );
};


export default function RFQsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read vendorId filter from URL (set by Vendor page's "View Associated RFQs")
  const vendorIdFilter = searchParams.get('vendorId') || '';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'draft', 'published', 'closed', 'awarded'
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected RFQ state for detail modal/drawer
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [rfqDetailData, setRfqDetailData] = useState<any>(null);

  // Debounced search logic (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Query RFQ List
  const { data: rfqsData, isLoading } = useQuery({
    queryKey: ['rfqsList', statusFilter, searchTerm, page, vendorIdFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (vendorIdFilter) params.append('vendor_id', vendorIdFilter);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await api.get(`/rfqs?${params.toString()}`);
      return res.data;
    }
  });

  // Fetch RFQ Detail when selected
  useEffect(() => {
    async function fetchDetail() {
      if (!selectedRFQ) {
        setRfqDetailData(null);
        return;
      }
      setLoadingDetail(true);
      try {
        const res = await api.get(`/rfqs/${selectedRFQ.id}`);
        if (res.data && res.data.success) {
          setRfqDetailData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load RFQ detail', err);
        toast.error('Failed to load RFQ details');
      } finally {
        setLoadingDetail(false);
      }
    }
    fetchDetail();
  }, [selectedRFQ]);

  // Permissions helper
  const canCreate = user?.role === 'admin' || user?.role === 'procurement_officer';
  const isVendor = user?.role === 'vendor';

  // Mutations
  const publishRFQMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/rfqs/${id}/status`, { status: 'published' });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfqsList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast.success('RFQ published to vendors successfully!');
      
      // Update selected RFQ status
      if (selectedRFQ && selectedRFQ.id === data.data.id) {
        setSelectedRFQ(prev => prev ? { ...prev, status: 'published' } : null);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish RFQ');
    }
  });

  const deleteRFQMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/rfqs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqsList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast.success('RFQ deleted successfully');
      setSelectedRFQ(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete RFQ');
    }
  });

  // Data Merging
  const rfqs: RFQ[] = rfqsData?.data || [];

  const totalRFQs = rfqsData?.meta?.total || 0;
  const totalPages = Math.ceil(totalRFQs / limit) || 1;

  // Count helper for tabs
  const getStatusCount = (status: string) => {
    // Return live count if backend summary has it, or calculate from the local subset
    if (status === 'all') return totalRFQs;
    // Since we page on backend, if we want exact count per tab, we count from loaded list, or if backend returned counts
    return rfqs.filter((r: RFQ) => r.status === status).length;
  };

  return (
    <MainLayout>
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Request For Quotations</h1>
          <p className="text-text-secondary text-sm mt-1">Manage RFQ specifications, vendor invitations, and submissions</p>
        </div>

        {canCreate && (
          <button
            onClick={() => navigate('/rfqs/new')}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-glow hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200 transform active:scale-95"
            id="create-rfq-btn"
          >
            <Plus className="w-4.5 h-4.5" /> + New RFQ
          </button>
        )}
      </div>

      {/* Vendor filter banner */}
      {vendorIdFilter && (
        <div className="flex items-center justify-between bg-brand-green/10 border border-brand-green/25 rounded-xl px-5 py-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-brand-green flex-shrink-0" />
            <span className="text-sm text-brand-green font-semibold">
              Showing RFQs assigned to a specific vendor
            </span>
          </div>
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete('vendorId');
              setSearchParams(next, { replace: true });
            }}
            className="flex items-center gap-1.5 text-xs text-brand-green hover:text-white border border-brand-green/30 hover:border-white/20 bg-brand-green/10 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
          >
            <X className="w-3.5 h-3.5" /> Clear Filter
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search RFQs by code, title, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-12"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-subtle mb-6">
        {[
          { label: 'All', val: 'all' },
          { label: 'Draft', val: 'draft' },
          { label: 'Published', val: 'published' },
          { label: 'Closed', val: 'closed' },
          { label: 'Awarded', val: 'awarded' }
        ].map((tab) => {
          const count = getStatusCount(tab.val);
          return (
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
              <span>
                {tab.label} {count > 0 && `(${count})`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main RFQ Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Querying RFQ pipelines...</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-subtle text-text-secondary text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">RFQ Code</th>
                  <th className="py-4 px-6 font-semibold">RFQ Title</th>
                  <th className="py-4 px-6 font-semibold">Category</th>
                  <th className="py-4 px-6 font-semibold">Creator</th>
                  <th className="py-4 px-6 text-center font-semibold">Lines</th>
                  {!isVendor && <th className="py-4 px-6 text-center font-semibold">Invited Vendors</th>}
                  <th className="py-4 px-6 font-semibold">Deadline</th>
                  <th className="py-4 px-6 text-center font-semibold">Status</th>
                  <th className="py-4 px-6 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/30">
                {rfqs.map((rfq: RFQ) => (
                  <tr 
                    key={rfq.id} 
                    className="hover:bg-surface-elevated/50 text-sm text-text-primary transition-colors duration-150"
                  >
                    <td className="py-4 px-6 font-semibold text-white font-mono text-xs">
                      {rfq.rfq_number}
                    </td>
                    <td className="py-4 px-6 font-semibold text-white max-w-xs truncate">
                      {rfq.title}
                    </td>
                    <td className="py-4 px-6 text-text-secondary text-xs font-semibold">
                      <span className="bg-white/5 px-2 py-1 rounded text-text-secondary uppercase">
                        {rfq.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      {rfq.creator_name || 'System'}
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-xs font-semibold text-text-secondary">
                      {rfq.line_items_count}
                    </td>
                    {!isVendor && (
                      <td className="py-4 px-6 text-center font-mono text-xs font-semibold text-text-secondary">
                        {rfq.vendor_count}
                      </td>
                    )}
                    <td className={`py-4 px-6 text-xs font-semibold ${
                      new Date(rfq.deadline).getTime() < Date.now() && rfq.status !== 'awarded' && rfq.status !== 'closed'
                        ? 'text-red-400'
                        : 'text-text-secondary'
                    }`}>
                      {new Date(rfq.deadline).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={rfq.status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        {isVendor ? (
                          <button
                            onClick={() => navigate(`/rfqs/${rfq.id}`)}
                            className="inline-flex items-center gap-1.5 border border-brand-green/30 hover:border-brand-green hover:bg-brand-green/10 text-brand-green px-3 py-1 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                          >
                            <Send className="w-3.5 h-3.5" /> RESPOND
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedRFQ(rfq)}
                            className="inline-flex items-center gap-1.5 border border-brand-green/30 hover:border-brand-green hover:bg-brand-green/10 text-brand-green px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                          >
                            <Eye className="w-3.5 h-3.5" /> VIEW
                          </button>
                        )}
                      </div>
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
          Showing {totalRFQs === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, totalRFQs)} of {totalRFQs} RFQs
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

      {/* RFQ Detail Slide-in Drawer from Right */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          selectedRFQ ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSelectedRFQ(null)}
      >
        <div 
          className={`fixed top-0 right-0 h-full w-full max-w-xl bg-surface-card border-l border-subtle shadow-card z-50 flex flex-col justify-between transform transition-transform duration-300 ease-out p-6 ${
            selectedRFQ ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedRFQ && (
            <>
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-subtle pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-semibold text-brand-green uppercase tracking-wider bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded">
                    {selectedRFQ.category}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2.5 leading-tight">{selectedRFQ.title}</h2>
                  <p className="text-xs text-text-secondary mt-1 font-mono">{selectedRFQ.rfq_number}</p>
                </div>
                <button 
                  onClick={() => setSelectedRFQ(null)}
                  className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-sm">
                
                {/* Status & Deadline Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 border border-white/5 rounded-xl">
                  <div>
                    <span className="text-xs text-text-secondary block mb-1">Status</span>
                    <StatusBadge status={selectedRFQ.status} />
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block mb-1">Submission Deadline</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Calendar className="w-4 h-4 text-brand-green" />
                      <span>{new Date(selectedRFQ.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedRFQ.description && (
                  <div>
                    <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-1.5">Description</h4>
                    <p className="text-text-secondary leading-relaxed bg-white/[0.01] border border-white/5 p-3.5 rounded-lg">
                      {selectedRFQ.description}
                    </p>
                  </div>
                )}

                {/* Detailed details dynamically fetched */}
                {loadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-brand-green animate-spin mb-3" />
                    <p className="text-xs text-text-secondary">Loading detailed line items...</p>
                  </div>
                ) : rfqDetailData ? (
                  <>
                    {/* Line items list */}
                    <div>
                      <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2.5">
                        Line Items ({rfqDetailData.line_items?.length || 0})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {rfqDetailData.line_items?.map((item: any) => (
                          <div 
                            key={item.id} 
                            className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                          >
                            <span className="font-semibold text-white text-xs">{item.item_name}</span>
                            <span className="font-mono text-xs font-medium bg-white/5 px-2 py-0.5 rounded text-text-secondary">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Vendors list */}
                    {!isVendor && (
                      <div>
                        <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2.5">
                          Assigned Vendors ({rfqDetailData.assigned_vendors?.length || 0})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {rfqDetailData.assigned_vendors?.map((vendor: any) => (
                            <div 
                              key={vendor.id}
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                            >
                              <Building2 className="w-3.5 h-3.5 text-brand-green" />
                              <span>{vendor.name}</span>
                            </div>
                          ))}
                          {(!rfqDetailData.assigned_vendors || rfqDetailData.assigned_vendors.length === 0) && (
                            <span className="text-xs text-text-secondary italic">No vendors assigned to this RFQ yet.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-subtle pt-6 mt-4 space-y-3">
                {selectedRFQ.status === 'draft' && canCreate && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to publish this RFQ to all assigned vendors?')) {
                        publishRFQMutation.mutate(selectedRFQ.id);
                      }
                    }}
                    disabled={publishRFQMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold tracking-wider shadow-glow hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200 disabled:opacity-50"
                  >
                    {publishRFQMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />} 
                    PUBLISH TO ASSIGNED VENDORS
                  </button>
                )}

                {/* Compare Quotations button (If published, closed, or awarded) */}
                {selectedRFQ.status !== 'draft' && canCreate && (
                  <button
                    onClick={() => {
                      setSelectedRFQ(null);
                      navigate(`/rfqs/${selectedRFQ.id}/compare`);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                  >
                    <BarChart className="w-4 h-4" /> COMPARE VENDOR QUOTATIONS
                  </button>
                )}

                {/* Delete button (If draft) */}
                {selectedRFQ.status === 'draft' && canCreate && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${selectedRFQ.rfq_number}?`)) {
                        deleteRFQMutation.mutate(selectedRFQ.id);
                      }
                    }}
                    disabled={deleteRFQMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 border border-red-500/10 hover:bg-red-500/10 text-red-400 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DELETE RFQ DRAFT
                  </button>
                )}

                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                >
                  Close Detail Panel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </MainLayout>
  );
}
