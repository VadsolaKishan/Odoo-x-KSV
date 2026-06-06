import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Building2,
  Package,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  AlertCircle,
  TrendingUp,
  IndianRupee,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAuthStore } from '../store/auth.store';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface Quotation {
  id: string;
  rfq_id: string;
  vendor_id: string;
  status: 'draft' | 'submitted' | 'selected' | 'rejected' | 'approved';
  subtotal: string;
  gst_percentage: string;
  gst_amount: string;
  grand_total: string;
  delivery_days: number | null;
  payment_terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vendor_name?: string;
  rfq_title?: string;
  rfq_number?: string;
}

interface QuotationDetail extends Quotation {
  vendor: {
    id: string;
    name: string;
    rating: string;
    category: string;
    contact_email?: string;
  };
  line_items: Array<{
    id: string;
    item_name: string;
    quantity: number;
    unit: string;
    unit_price: string;
    gst_rate: string;
    total_price: string;
  }>;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  selected: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  draft: Clock,
  submitted: Send,
  selected: CheckCircle2,
  rejected: XCircle,
  approved: CheckCircle2,
};

const mockQuotations: Quotation[] = [
  { id: 'q1', rfq_id: 'rfq1', vendor_id: 'v1', status: 'submitted', subtotal: '145000', gst_percentage: '18', gst_amount: '26100', grand_total: '171100', delivery_days: 14, payment_terms: 'Net 30', notes: 'Bulk discount applied', created_at: '2026-06-02T09:00:00Z', updated_at: '2026-06-02T10:00:00Z', vendor_name: 'TechMart Solutions', rfq_title: 'Office Furniture Procurement Q2', rfq_number: 'RFQ-2026-0001' },
  { id: 'q2', rfq_id: 'rfq1', vendor_id: 'v2', status: 'draft', subtotal: '138000', gst_percentage: '18', gst_amount: '24840', grand_total: '162840', delivery_days: 21, payment_terms: 'Net 15', notes: null, created_at: '2026-06-03T11:00:00Z', updated_at: '2026-06-03T11:00:00Z', vendor_name: 'Apex Supplies Ltd', rfq_title: 'Office Furniture Procurement Q2', rfq_number: 'RFQ-2026-0001' },
  { id: 'q3', rfq_id: 'rfq2', vendor_id: 'v3', status: 'selected', subtotal: '238500', gst_percentage: '18', gst_amount: '42930', grand_total: '281430', delivery_days: 7, payment_terms: 'Net 45', notes: 'Premium support included', created_at: '2026-06-04T14:00:00Z', updated_at: '2026-06-04T16:00:00Z', vendor_name: 'GlobalTech Inc', rfq_title: 'Developer Laptops Upgrade', rfq_number: 'RFQ-2026-0002' },
  { id: 'q4', rfq_id: 'rfq3', vendor_id: 'v1', status: 'rejected', subtotal: '52000', gst_percentage: '18', gst_amount: '9360', grand_total: '61360', delivery_days: 30, payment_terms: 'Net 30', notes: null, created_at: '2026-06-01T08:00:00Z', updated_at: '2026-06-05T09:00:00Z', vendor_name: 'TechMart Solutions', rfq_title: 'Warehouse Logistics Service', rfq_number: 'RFQ-2026-0003' },
];

const formatCurrency = (val: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val));

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const StatusBadge = ({ status }: { status: string }) => {
  const Icon = STATUS_ICONS[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLES[status] || 'bg-white/5 text-white border-white/10'}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default function QuotationsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [selectedQ, setSelectedQ] = useState<Quotation | null>(null);
  const [qDetail, setQDetail] = useState<QuotationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isVendor = user?.role === 'vendor';
  const canManage = user?.role === 'admin' || user?.role === 'procurement_officer';

  // Fetch quotations list
  useEffect(() => {
    async function loadQuotations() {
      setLoading(true);
      setIsError(false);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const res = await api.get(`/quotations?${params.toString()}`);
        if (res.data && res.data.success) {
          setQuotations(res.data.data || []);
          setTotal(res.data.meta?.total || res.data.data?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load quotations', err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
    loadQuotations();
  }, [statusFilter, page]);

  // Fetch quotation detail
  useEffect(() => {
    async function loadDetail() {
      if (!selectedQ) { setQDetail(null); return; }
      setLoadingDetail(true);
      try {
        const res = await api.get(`/quotations/${selectedQ.id}`);
        if (res.data && res.data.success) {
          setQDetail(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load quotation detail', err);
        toast.error('Failed to load quotation details');
        setSelectedQ(null);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadDetail();
  }, [selectedQ]);

  const displayQuotations = isError || (!loading && quotations.length === 0)
    ? mockQuotations.filter(q => {
        const matchSearch = !searchQuery ||
          (q.rfq_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (q.rfq_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (q.vendor_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'all' || q.status === statusFilter;
        return matchSearch && matchStatus;
      })
    : quotations.filter(q =>
        !searchQuery ||
        (q.rfq_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.rfq_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.vendor_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

  const totalCount = isError ? displayQuotations.length : total;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const summaryStats = [
    { label: 'Total Quotations', value: totalCount, icon: FileText, color: 'text-blue-400' },
    { label: 'Draft', value: displayQuotations.filter(q => q.status === 'draft').length, icon: Clock, color: 'text-amber-400' },
    { label: 'Submitted', value: displayQuotations.filter(q => q.status === 'submitted').length, icon: Send, color: 'text-blue-400' },
    { label: 'Selected', value: displayQuotations.filter(q => q.status === 'selected' || q.status === 'approved').length, icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Quotations</h1>
          <p className="text-text-secondary text-sm mt-1">
            {isVendor ? 'Manage your submitted proposals and quotation drafts' : 'Review and compare vendor quotation submissions'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl border border-white/5 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white leading-none">{stat.value}</p>
              <p className="text-[11px] text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search by RFQ number, RFQ title, or vendor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-12"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-subtle mb-6">
        {[
          { label: 'All', val: 'all' },
          { label: 'Draft', val: 'draft' },
          { label: 'Submitted', val: 'submitted' },
          { label: 'Selected', val: 'selected' },
          { label: 'Approved', val: 'approved' },
          { label: 'Rejected', val: 'rejected' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => { setStatusFilter(tab.val); setPage(1); }}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              statusFilter === tab.val
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Loading quotations...</p>
        </div>
      ) : displayQuotations.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/5 p-16 text-center max-w-md mx-auto">
          <FileText className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h2 className="text-base font-bold text-white mb-1">No quotations found</h2>
          <p className="text-xs text-text-secondary">
            {isVendor
              ? 'You have not submitted any quotations yet. Browse published RFQs to respond.'
              : 'No quotations match your current filter.'}
          </p>
          {isVendor && (
            <button
              onClick={() => navigate('/rfqs')}
              className="mt-4 inline-flex items-center gap-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            >
              <FileText className="w-4 h-4" /> Browse RFQs
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-subtle text-text-secondary text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">RFQ</th>
                  <th className="py-4 px-6 font-semibold">Vendor</th>
                  <th className="py-4 px-6 text-center font-semibold">Delivery</th>
                  <th className="py-4 px-6 text-right font-semibold">Subtotal</th>
                  <th className="py-4 px-6 text-right font-semibold">Grand Total</th>
                  <th className="py-4 px-6 text-center font-semibold">Status</th>
                  <th className="py-4 px-6 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/30">
                {displayQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-surface-elevated/50 transition-colors duration-150 text-sm">
                    <td className="py-4 px-6">
                      <p className="text-white font-semibold leading-tight truncate max-w-[200px]">{q.rfq_title || '—'}</p>
                      <p className="text-[11px] text-text-secondary font-mono mt-0.5">{q.rfq_number || '—'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-brand-green" />
                        </div>
                        <span className="text-text-primary text-sm">{q.vendor_name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-text-secondary text-xs font-mono">
                      {q.delivery_days ? `${q.delivery_days}d` : '—'}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm text-text-primary">
                      {formatCurrency(q.subtotal)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-white">
                      {formatCurrency(q.grand_total)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedQ(q)}
                          className="inline-flex items-center gap-1.5 border border-brand-green/30 hover:border-brand-green hover:bg-brand-green/10 text-brand-green px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                        >
                          <Eye className="w-3.5 h-3.5" /> VIEW
                        </button>
                        {q.status === 'submitted' && canManage && (
                          <button
                            onClick={() => navigate(`/approvals?quotation_id=${q.id}`)}
                            className="inline-flex items-center gap-1.5 border border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVE
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-black/20 border border-subtle px-6 py-4 rounded-xl mb-6">
          <span className="text-xs text-text-secondary">Page {page} of {totalPages}</span>
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
        </div>
      )}

      {/* Detail Slide-in Drawer */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${selectedQ ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSelectedQ(null)}
      >
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-xl bg-surface-card border-l border-subtle shadow-card z-50 flex flex-col transform transition-transform duration-300 ease-out ${selectedQ ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedQ && (
            <>
              {/* Header */}
              <div className="flex justify-between items-start border-b border-subtle p-6 pb-4 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                      {selectedQ.rfq_number}
                    </span>
                    <StatusBadge status={selectedQ.status} />
                  </div>
                  <h2 className="text-lg font-bold text-white leading-tight">{selectedQ.rfq_title || 'Quotation Detail'}</h2>
                  <p className="text-xs text-text-secondary mt-1">Vendor: <span className="text-white font-semibold">{selectedQ.vendor_name}</span></p>
                </div>
                <button onClick={() => setSelectedQ(null)} className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-white/5 flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {loadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
                    <p className="text-sm text-text-secondary">Loading details...</p>
                  </div>
                ) : qDetail ? (
                  <>
                    {/* Pricing Summary */}
                    <div>
                      <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-3">Pricing Breakdown</h4>
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Subtotal</span>
                          <span className="text-white">{formatCurrency(qDetail.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">GST ({parseFloat(qDetail.gst_percentage).toFixed(0)}%)</span>
                          <span className="text-white">{formatCurrency(qDetail.gst_amount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                          <span className="text-white">Grand Total</span>
                          <span className="text-brand-green text-base">{formatCurrency(qDetail.grand_total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/20 border border-white/5 rounded-xl p-3.5">
                        <p className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider mb-1">Delivery</p>
                        <p className="text-sm font-bold text-white">{qDetail.delivery_days ? `${qDetail.delivery_days} days` : 'Not specified'}</p>
                      </div>
                      <div className="bg-black/20 border border-white/5 rounded-xl p-3.5">
                        <p className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider mb-1">Payment Terms</p>
                        <p className="text-sm font-bold text-white">{qDetail.payment_terms || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Vendor */}
                    <div>
                      <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Vendor
                      </h4>
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Name</span>
                          <span className="text-white font-semibold">{qDetail.vendor?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Rating</span>
                          <span className="text-white">{parseFloat(qDetail.vendor?.rating || '0').toFixed(1)} / 5 ★</span>
                        </div>
                        {qDetail.vendor?.contact_email && (
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Email</span>
                            <span className="text-brand-green text-xs">{qDetail.vendor.contact_email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Line items */}
                    {qDetail.line_items && qDetail.line_items.length > 0 && (
                      <div>
                        <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" /> Line Items ({qDetail.line_items.length})
                        </h4>
                        <div className="rounded-xl border border-white/5 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-surface-elevated text-text-secondary uppercase tracking-wider border-b border-subtle">
                                <th className="py-2.5 px-4 text-left font-semibold">Item</th>
                                <th className="py-2.5 px-4 text-center font-semibold">Qty</th>
                                <th className="py-2.5 px-4 text-right font-semibold">Unit Price</th>
                                <th className="py-2.5 px-4 text-right font-semibold">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-subtle/30">
                              {qDetail.line_items.map((item) => (
                                <tr key={item.id} className="text-text-primary">
                                  <td className="py-2.5 px-4 font-semibold text-white">{item.item_name}</td>
                                  <td className="py-2.5 px-4 text-center font-mono">{item.quantity} {item.unit}</td>
                                  <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(item.unit_price)}</td>
                                  <td className="py-2.5 px-4 text-right font-mono font-bold text-white">{formatCurrency(item.total_price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {qDetail.notes && (
                      <div>
                        <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">Notes</h4>
                        <p className="text-sm text-text-primary italic bg-black/20 border border-white/5 rounded-xl p-4 leading-relaxed">
                          "{qDetail.notes}"
                        </p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Footer */}
              <div className="border-t border-subtle p-6 flex-shrink-0 space-y-3">
                {selectedQ.status === 'submitted' && canManage && (
                  <button
                    onClick={() => { setSelectedQ(null); navigate(`/approvals?quotation_id=${selectedQ.id}`); }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-200"
                  >
                    <CheckCircle2 className="w-4 h-4" /> REVIEW APPROVAL WORKFLOW
                  </button>
                )}
                {selectedQ.status !== 'draft' && canManage && (
                  <button
                    onClick={() => { setSelectedQ(null); navigate(`/rfqs/${selectedQ.rfq_id}/compare`); }}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                  >
                    <TrendingUp className="w-4 h-4" /> COMPARE QUOTATIONS FOR RFQ
                  </button>
                )}
                <button
                  onClick={() => setSelectedQ(null)}
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
