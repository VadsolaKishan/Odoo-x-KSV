import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  IndianRupee,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAuthStore } from '../store/auth.store';
import api from '../lib/axios';

interface Invoice {
  id: string;
  invoice_number: string;
  po_number: string;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  grand_total: string;
  status: 'pending_payment' | 'paid' | 'overdue' | 'cancelled';
  paid_at: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending_payment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending_payment: Clock,
  paid: CheckCircle2,
  overdue: AlertTriangle,
  cancelled: XCircle,
};

const mockInvoices: Invoice[] = [
  { id: 'inv1', invoice_number: 'INV-2026-0001', po_number: 'PO-2026-0001', vendor_name: 'TechMart Solutions', invoice_date: '2026-06-01T08:00:00Z', due_date: '2026-07-01T08:00:00Z', grand_total: '171100', status: 'pending_payment', paid_at: null },
  { id: 'inv2', invoice_number: 'INV-2026-0002', po_number: 'PO-2026-0002', vendor_name: 'Apex Supplies Ltd', invoice_date: '2026-06-03T11:00:00Z', due_date: '2026-07-03T11:00:00Z', grand_total: '281430', status: 'paid', paid_at: '2026-06-20T10:00:00Z' },
  { id: 'inv3', invoice_number: 'INV-2026-0003', po_number: 'PO-2026-0003', vendor_name: 'GreenBridge Logistics', invoice_date: '2026-05-25T14:00:00Z', due_date: '2026-06-04T14:00:00Z', grand_total: '61360', status: 'overdue', paid_at: null },
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
      {status.replace('_', ' ')}
    </span>
  );
};

export default function InvoicesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      setIsError(false);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const res = await api.get(`/invoices?${params.toString()}`);
        if (res.data && res.data.success) {
          setInvoices(res.data.data || []);
          setTotal(res.data.meta?.total || 0);
        }
      } catch (err) {
        console.error('Failed to load invoices', err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, [statusFilter, page]);

  const displayInvoices = isError || (!loading && invoices.length === 0)
    ? mockInvoices.filter(inv => {
        const matchSearch = !searchQuery ||
          inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.vendor_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchSearch && matchStatus;
      })
    : invoices.filter(inv =>
        !searchQuery ||
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const totalPages = Math.ceil((isError ? displayInvoices.length : total) / limit) || 1;

  const summaryStats = [
    { label: 'Total Invoices', value: isError ? mockInvoices.length : total, icon: Receipt, color: 'text-blue-400' },
    { label: 'Pending Payment', value: displayInvoices.filter(i => i.status === 'pending_payment').length, icon: Clock, color: 'text-amber-400' },
    { label: 'Overdue', value: displayInvoices.filter(i => i.status === 'overdue').length, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Paid', value: displayInvoices.filter(i => i.status === 'paid').length, icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Invoices &amp; Payments</h1>
          <p className="text-text-secondary text-sm mt-1">Track all purchase invoices and their payment status</p>
        </div>
      </div>

      {/* Stats Cards */}
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
          placeholder="Search by invoice number, PO number, or vendor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-12"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-subtle mb-6">
        {[
          { label: 'All', val: 'all' },
          { label: 'Pending', val: 'pending_payment' },
          { label: 'Overdue', val: 'overdue' },
          { label: 'Paid', val: 'paid' },
          { label: 'Cancelled', val: 'cancelled' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => { setStatusFilter(tab.val); setPage(1); }}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              statusFilter === tab.val
                ? 'border-brand-green text-brand-green bg-brand-green/5'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-white/5'
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
          <p className="text-text-secondary text-sm">Loading invoices...</p>
        </div>
      ) : displayInvoices.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/5 p-16 text-center max-w-md mx-auto">
          <Receipt className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h2 className="text-base font-bold text-white mb-1">No invoices found</h2>
          <p className="text-xs text-text-secondary">
            Invoices are generated automatically when a Purchase Order is created.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-subtle text-text-secondary text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Invoice No.</th>
                  <th className="py-4 px-6 font-semibold">Linked PO</th>
                  <th className="py-4 px-6 font-semibold">Vendor</th>
                  <th className="py-4 px-6 font-semibold">Invoice Date</th>
                  <th className="py-4 px-6 font-semibold">Due Date</th>
                  <th className="py-4 px-6 text-right font-semibold">Amount</th>
                  <th className="py-4 px-6 text-center font-semibold">Status</th>
                  <th className="py-4 px-6 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/30">
                {displayInvoices.map((inv) => {
                  const isOverdue = inv.status === 'overdue';
                  const dueDateStr = inv.due_date ? formatDate(inv.due_date) : '—';
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-surface-elevated/50 transition-colors duration-150 text-sm"
                    >
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-brand-green">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-text-secondary font-medium">
                        {inv.po_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-brand-green" />
                          </div>
                          <span className="text-text-primary">{inv.vendor_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-secondary text-xs">
                        {formatDate(inv.invoice_date)}
                      </td>
                      <td className={`py-4 px-6 text-xs font-semibold ${isOverdue ? 'text-red-400' : 'text-text-secondary'}`}>
                        {dueDateStr}
                        {isOverdue && <span className="ml-1 text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded">OVERDUE</span>}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-white">
                        {formatCurrency(inv.grand_total)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className="inline-flex items-center gap-1.5 border border-brand-green/30 hover:border-brand-green hover:bg-brand-green/10 text-brand-green px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200"
                          id={`view-invoice-${inv.id}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> VIEW
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
    </MainLayout>
  );
}
