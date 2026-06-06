import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  FileText,
  Building2,
  Package,
  Receipt,
  CheckCircle2,
  Clock,
  ExternalLink,
  Hash,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface PurchaseOrder {
  id: string;
  po_number: string;
  subtotal: string;
  grand_total: string;
  status: 'generated' | 'sent' | 'acknowledged' | 'completed' | 'cancelled';
  po_date: string;
  created_at: string;
  vendor_name: string;
  rfq_title: string;
}

interface PODetail {
  id: string;
  po_number: string;
  rfq_id: string;
  quotation_id: string;
  vendor_id: string;
  bill_to_name: string;
  bill_to_address: string;
  bill_to_gstin: string;
  subtotal: string;
  cgst_percentage: string;
  cgst_amount: string;
  sgst_percentage: string;
  sgst_amount: string;
  grand_total: string;
  status: string;
  po_date: string;
  created_at: string;
  rfq_number: string;
  rfq_title: string;
  vendor: {
    id: string;
    name: string;
    category: string;
    gst_number: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    address: string;
  };
  line_items: Array<{
    id: string;
    item_name: string;
    quantity: number;
    unit: string;
    unit_price: string;
    total_price: string;
  }>;
  invoice: {
    id: string;
    invoice_number: string;
    status: string;
    grand_total: string;
    due_date: string;
  } | null;
}

const STATUS_STYLES: Record<string, string> = {
  generated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  sent: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  acknowledged: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const INVOICE_STATUS_STYLES: Record<string, string> = {
  pending_payment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
};



const formatCurrency = (val: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val));

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLES[status] || 'bg-white/5 text-white border-white/10'}`}>
    {status.replace('_', ' ')}
  </span>
);

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [, setIsError] = useState(false);

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [poDetail, setPODetail] = useState<PODetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch PO list
  useEffect(() => {
    async function loadPOs() {
      setLoading(true);
      setIsError(false);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const res = await api.get(`/purchase-orders?${params.toString()}`);
        if (res.data && res.data.success) {
          setPOs(res.data.data || []);
          setTotal(res.data.meta?.total || 0);
        }
      } catch (err) {
        console.error('Failed to load purchase orders', err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
    loadPOs();
  }, [statusFilter, page]);

  // Fetch PO detail when selected
  useEffect(() => {
    async function loadDetail() {
      if (!selectedPO) { setPODetail(null); return; }
      setLoadingDetail(true);
      try {
        const res = await api.get(`/purchase-orders/${selectedPO.id}`);
        if (res.data && res.data.success) {
          setPODetail(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load PO detail', err);
        toast.error('Failed to load purchase order details');
        setSelectedPO(null);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadDetail();
  }, [selectedPO]);

  const displayPOs = pos.filter(p =>
    !searchQuery ||
    p.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.rfq_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit) || 1;

  const summaryStats = [
    { label: 'Total POs', value: total, icon: FileText, color: 'text-blue-400' },
    { label: 'Generated', value: displayPOs.filter(p => p.status === 'generated').length, icon: Package, color: 'text-indigo-400' },
    { label: 'Acknowledged', value: displayPOs.filter(p => p.status === 'acknowledged').length, icon: Clock, color: 'text-amber-400' },
    { label: 'Completed', value: displayPOs.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Purchase Orders</h1>
          <p className="text-text-secondary text-sm mt-1">Track and manage all generated purchase orders</p>
        </div>
      </div>

      {/* Stats cards */}
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
          placeholder="Search by PO number, vendor name, or RFQ title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-12"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-subtle mb-6">
        {[
          { label: 'All', val: 'all' },
          { label: 'Generated', val: 'generated' },
          { label: 'Acknowledged', val: 'acknowledged' },
          { label: 'Completed', val: 'completed' },
          { label: 'Cancelled', val: 'cancelled' },
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
          <p className="text-text-secondary text-sm">Loading purchase orders...</p>
        </div>
      ) : displayPOs.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/5 p-16 text-center max-w-md mx-auto">
          <Package className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h2 className="text-base font-bold text-white mb-1">No purchase orders found</h2>
          <p className="text-xs text-text-secondary">
            Purchase orders are generated automatically after a quotation is fully approved.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-subtle text-text-secondary text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">PO Number</th>
                  <th className="py-4 px-6 font-semibold">RFQ Title</th>
                  <th className="py-4 px-6 font-semibold">Vendor</th>
                  <th className="py-4 px-6 font-semibold">PO Date</th>
                  <th className="py-4 px-6 text-right font-semibold">Grand Total</th>
                  <th className="py-4 px-6 text-center font-semibold">Status</th>
                  <th className="py-4 px-6 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/30">
                {displayPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-surface-elevated/50 transition-colors duration-150 text-sm">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-brand-green">
                      {po.po_number}
                    </td>
                    <td className="py-4 px-6 text-white font-semibold max-w-xs truncate">
                      {po.rfq_title}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-brand-green" />
                        </div>
                        <span className="text-text-primary text-sm">{po.vendor_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-secondary text-xs">
                      {formatDate(po.po_date)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-white">
                      {formatCurrency(po.grand_total)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedPO(po)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-black/20 border border-subtle px-6 py-4 rounded-xl mb-6">
          <span className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </span>
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${selectedPO ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSelectedPO(null)}
      >
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-surface-card border-l border-subtle shadow-card z-50 flex flex-col transform transition-transform duration-300 ease-out ${selectedPO ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedPO && (
            <>
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-subtle p-6 pb-4 flex-shrink-0">
                <div>
                  <span className="text-[10px] font-semibold text-brand-green uppercase tracking-wider bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded font-mono">
                    {selectedPO.po_number}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2 leading-tight">{selectedPO.rfq_title}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={selectedPO.status} />
                    <span className="text-xs text-text-secondary">{formatDate(selectedPO.po_date)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPO(null)}
                  className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-white/5 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
                    <p className="text-sm text-text-secondary">Loading PO details...</p>
                  </div>
                ) : poDetail ? (
                  <>
                    {/* Financials Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider mb-1">Subtotal</p>
                        <p className="text-base font-bold text-white font-mono">{formatCurrency(poDetail.subtotal)}</p>
                      </div>
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider mb-1">GST (CGST+SGST)</p>
                        <p className="text-base font-bold text-white font-mono">
                          {formatCurrency(parseFloat(poDetail.cgst_amount) + parseFloat(poDetail.sgst_amount))}
                        </p>
                      </div>
                      <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-brand-green uppercase font-semibold tracking-wider mb-1">Grand Total</p>
                        <p className="text-base font-bold text-brand-green font-mono">{formatCurrency(poDetail.grand_total)}</p>
                      </div>
                    </div>

                    {/* Vendor Details */}
                    <div>
                      <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Vendor Details
                      </h4>
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Name</span>
                          <span className="text-white font-semibold">{poDetail.vendor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Category</span>
                          <span className="text-white">{poDetail.vendor.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">GSTIN</span>
                          <span className="text-white font-mono text-xs">{poDetail.vendor.gst_number || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Contact</span>
                          <span className="text-white">{poDetail.vendor.contact_name || '—'}</span>
                        </div>
                        {poDetail.vendor.contact_email && (
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Email</span>
                            <span className="text-brand-green text-xs">{poDetail.vendor.contact_email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bill To */}
                    <div>
                      <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Hash className="w-4 h-4" /> Bill To
                      </h4>
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-sm space-y-1.5">
                        <p className="text-white font-semibold">{poDetail.bill_to_name}</p>
                        <p className="text-text-secondary text-xs leading-relaxed">{poDetail.bill_to_address}</p>
                        <p className="text-text-secondary text-xs font-mono">GSTIN: {poDetail.bill_to_gstin}</p>
                      </div>
                    </div>

                    {/* Line Items */}
                    {poDetail.line_items && poDetail.line_items.length > 0 && (
                      <div>
                        <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" /> Line Items ({poDetail.line_items.length})
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
                              {poDetail.line_items.map((item) => (
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

                    {/* Associated Invoice */}
                    {poDetail.invoice && (
                      <div>
                        <h4 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Receipt className="w-4 h-4" /> Associated Invoice
                        </h4>
                        <div
                          onClick={() => { setSelectedPO(null); navigate(`/invoices/${poDetail.invoice!.id}`); }}
                          className="bg-black/20 border border-white/10 hover:border-brand-green/30 rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all group"
                        >
                          <div className="space-y-1">
                            <p className="text-white font-semibold font-mono text-sm">{poDetail.invoice.invoice_number}</p>
                            <p className="text-xs text-text-secondary">Due: {formatDate(poDetail.invoice.due_date)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${INVOICE_STATUS_STYLES[poDetail.invoice.status] || 'bg-white/5 text-white border-white/10'}`}>
                              {poDetail.invoice.status.replace('_', ' ')}
                            </span>
                            <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-brand-green transition-colors" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-subtle p-6 flex-shrink-0">
                <button
                  onClick={() => setSelectedPO(null)}
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
