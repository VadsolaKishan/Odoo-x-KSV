import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Mail, 
  Check, 
  AlertCircle,
  FileText,
  Loader2,
  Building2,
  DollarSign
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../lib/axios';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

interface BillToInfo {
  name: string;
  address: string;
  gstin: string;
}

interface VendorInfo {
  name: string;
  contact_name: string | null;
  contact_phone: string;
  contact_email: string | null;
  address: string;
  gstin: string;
}

interface LineItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: string;
  total_price: string;
  delivery_days: number | null;
}

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  po_id: string;
  vendor_id: string;
  vendor_address: string;
  vendor_gstin: string;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  cgst_amount: string;
  sgst_amount: string;
  grand_total: string;
  status: 'pending_payment' | 'paid' | 'overdue' | 'cancelled';
  paid_at: string | null;
  po_number: string;
  po_date: string;
  bill_to: BillToInfo;
  vendor: VendorInfo;
  line_items: LineItem[];
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Check authorization role to Mark as Paid
  const canMarkAsPaid = user?.role === 'admin' || user?.role === 'manager';

  // Fetch Invoice Details
  useEffect(() => {
    async function loadInvoice() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/invoices/${id}`);
        if (res.data && res.data.success) {
          setInvoice(res.data.data);
        }
      } catch (err: any) {
        console.error('Failed to load invoice details', err);
        toast.error('Failed to load invoice details. It might not exist or you lack permission.');
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [id]);

  // Handle Mark as Paid
  const handleMarkPaid = async () => {
    if (!id || !canMarkAsPaid) return;
    setIsMarkingPaid(true);
    try {
      const res = await api.patch(`/invoices/${id}/mark-paid`);
      if (res.data && res.data.success) {
        toast.success('Invoice marked as paid successfully!');
        // Update local status
        setInvoice(prev => prev ? { ...prev, status: 'paid', paid_at: new Date().toISOString() } : null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update invoice status');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Handle Email Invoice
  const handleEmailInvoice = async () => {
    if (!id) return;
    setIsSendingEmail(true);
    try {
      const res = await api.post(`/invoices/${id}/send-email`);
      if (res.data && res.data.success) {
        toast.success('Invoice emailed to vendor successfully!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send invoice email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Launch browser printing
  const handlePrint = () => {
    window.print();
  };

  // Formatting currency helper
  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Number(val));
  };

  // Formatting date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <MainLayout>
      {/* CSS Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          aside, nav, header, button, a, .no-print {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .print-card {
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            color: #000000 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-text-primary {
            color: #111111 !important;
          }
          .print-text-secondary {
            color: #444444 !important;
          }
          .print-text-light {
            color: #666666 !important;
          }
          .print-border {
            border-color: #cccccc !important;
          }
          .print-badge-pending {
            background-color: #fef3c7 !important;
            color: #d97706 !important;
            border-color: #fcd34d !important;
          }
          .print-badge-paid {
            background-color: #d1fae5 !important;
            color: #059669 !important;
            border-color: #6ee7b7 !important;
          }
        }
      `}</style>

      {/* Back link & Actions Header */}
      <div className="mb-8 no-print">
        <Link 
          to="/invoices" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-green transition-colors uppercase tracking-wider mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices List
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Purchase Order & Invoice</h1>
            <p className="text-text-secondary text-sm mt-1">Review the automatically generated purchase order and invoice documents</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 no-print">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
          <p className="text-sm text-text-secondary">Retrieving document records...</p>
        </div>
      ) : !invoice ? (
        <div className="glass-card rounded-xl border border-red-500/20 p-8 text-center max-w-2xl mx-auto no-print">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Invoice Not Found</h2>
          <p className="text-sm text-text-secondary mb-6">The requested invoice details could not be found or you lack permission to view this billing.</p>
          <Link to="/invoices" className="bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-lg text-sm font-semibold inline-block transition-colors">
            Back to Invoices List
          </Link>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          
          {/* Action buttons bar */}
          <div className="flex flex-wrap gap-3 no-print">
            <button
              onClick={handlePrint}
              className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 rounded-lg flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-text-secondary" /> Print Invoice
            </button>
            
            <button
              onClick={handlePrint}
              className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 rounded-lg flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-text-secondary" /> Download PDF
            </button>

            <button
              onClick={handleEmailInvoice}
              disabled={isSendingEmail}
              className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 rounded-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isSendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 text-text-secondary" />
              )}
              Email Invoice
            </button>

            {invoice.status !== 'paid' && canMarkAsPaid && (
              <button
                onClick={handleMarkPaid}
                disabled={isMarkingPaid}
                className="h-10 px-5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-glow transition-all ml-auto disabled:opacity-50"
              >
                {isMarkingPaid ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Mark as Paid
              </button>
            )}
          </div>

          {/* PO & INVOICE DOCUMENT CARD */}
          <div className="glass-card rounded-xl border border-white/5 p-8 sm:p-12 print-card bg-surface-card text-text-primary shadow-card relative overflow-hidden">
            
            {/* watermark decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green/[0.02] rounded-full blur-3xl pointer-events-none"></div>

            {/* Document Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-white/10 print-border">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-brand-green">Procurement ERP Bill</span>
                <h2 className="text-2xl font-black text-white print-text-primary mt-1">{invoice.invoice_number}</h2>
                <p className="text-xs text-text-secondary print-text-secondary mt-1">Generated Automatically via PO workflow</p>
              </div>
              <div className="text-left sm:text-right text-xs space-y-1.5 print-text-secondary">
                <div>
                  <span className="text-text-secondary print-text-light font-medium">Related PO: </span>
                  <span className="font-mono text-white print-text-primary font-semibold">{invoice.po_number}</span>
                </div>
                <div>
                  <span className="text-text-secondary print-text-light font-medium">PO Date: </span>
                  <span className="text-white print-text-primary font-semibold">{formatDate(invoice.po_date)}</span>
                </div>
                <div>
                  <span className="text-text-secondary print-text-light font-medium">Invoice Date: </span>
                  <span className="text-white print-text-primary font-semibold">{formatDate(invoice.invoice_date)}</span>
                </div>
                <div>
                  <span className="text-text-secondary print-text-light font-medium">Due Date: </span>
                  <span className="text-white print-text-primary font-semibold text-amber-400">{formatDate(invoice.due_date)}</span>
                </div>
              </div>
            </div>

            {/* Two-Column Grid: Bill To vs Vendor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-white/10 print-border text-xs leading-relaxed">
              
              {/* Bill To */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-white print-text-primary uppercase tracking-wider pb-1 border-b border-white/5 print-border">
                  Bill To:
                </h3>
                <div className="space-y-1 print-text-secondary">
                  <p className="font-bold text-white print-text-primary text-sm">{invoice.bill_to.name}</p>
                  <p className="text-text-secondary print-text-secondary">{invoice.bill_to.address}</p>
                  <p className="font-semibold text-white print-text-primary mt-1.5">GSTIN: <span className="font-mono">{invoice.bill_to.gstin}</span></p>
                </div>
              </div>

              {/* Vendor */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-white print-text-primary uppercase tracking-wider pb-1 border-b border-white/5 print-border">
                  Vendor / Contractor:
                </h3>
                <div className="space-y-1 print-text-secondary">
                  <p className="font-bold text-white print-text-primary text-sm">{invoice.vendor.name}</p>
                  <p className="text-text-secondary print-text-secondary">{invoice.vendor.address}</p>
                  {invoice.vendor.contact_name && <p className="text-text-secondary print-text-light">Attn: {invoice.vendor.contact_name}</p>}
                  <p className="text-text-secondary print-text-light">Phone: {invoice.vendor.contact_phone}</p>
                  {invoice.vendor.contact_email && <p className="text-text-secondary print-text-light">Email: {invoice.vendor.contact_email}</p>}
                  <p className="font-semibold text-white print-text-primary mt-1.5">GSTIN: <span className="font-mono">{invoice.vendor.gstin}</span></p>
                </div>
              </div>

            </div>

            {/* Line items table */}
            <div className="py-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs print-text-primary">
                  <thead>
                    <tr className="border-b border-white/10 print-border text-text-secondary print-text-light uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-bold">Item & Description</th>
                      <th className="py-2.5 px-3 font-bold text-center w-24">Quantity</th>
                      <th className="py-2.5 px-3 font-bold text-right w-32">Unit Price</th>
                      <th className="py-2.5 px-3 font-bold text-right w-36">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05] print-divide">
                    {invoice.line_items.map(item => (
                      <tr key={item.id} className="text-text-primary print-text-primary">
                        <td className="py-3 px-3 font-semibold text-white print-text-primary">
                          {item.item_name}
                          {item.delivery_days && (
                            <span className="block text-[10px] text-text-secondary print-text-light font-normal mt-0.5">
                              Est. Delivery: {item.delivery_days} days
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium">
                          {item.quantity} <span className="text-[9px] text-text-secondary print-text-light uppercase">{item.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-white print-text-primary">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculation summary block */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-6 border-t border-white/10 print-border text-xs">
              
              {/* Left Column notes */}
              <div className="sm:col-span-7 space-y-2 print-text-secondary text-text-secondary">
                <span className="font-bold text-white print-text-primary uppercase tracking-wider block text-[10px]">Document terms:</span>
                <p className="italic leading-relaxed">
                  "This invoice is generated directly from the final approved quotation for {invoice.po_number}. Standard Net 30 payment terms apply from the invoice date. Please process payments to the vendor's bank account linked to GSTIN {invoice.vendor.gstin}."
                </p>
                {invoice.paid_at && (
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10 w-fit mt-3">
                    Receipt Settled: {formatDate(invoice.paid_at)}
                  </div>
                )}
              </div>

              {/* Right Column totals calculation */}
              <div className="sm:col-span-5 space-y-2 font-semibold">
                <div className="flex justify-between items-center text-text-secondary print-text-light">
                  <span>Subtotal</span>
                  <span className="font-mono text-white print-text-primary">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary print-text-light">
                  <span>CGST (9%)</span>
                  <span className="font-mono text-white print-text-primary">{formatCurrency(invoice.cgst_amount)}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary print-text-light">
                  <span>SGST (9%)</span>
                  <span className="font-mono text-white print-text-primary">{formatCurrency(invoice.sgst_amount)}</span>
                </div>

                <div className="border-t border-white/10 print-border my-2 pt-3 flex justify-between items-baseline">
                  <span className="text-sm text-white print-text-primary">Grand Total</span>
                  <span className="text-xl font-black text-brand-green print-text-primary font-mono">
                    {formatCurrency(invoice.grand_total)}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Status Banner */}
            <div className="mt-8 border-t border-white/10 print-border pt-6">
              {invoice.status === 'paid' ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-brand-green print-badge-paid">
                  <Check className="w-5 h-5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-xs">Payment Received</span>
                    <span className="text-[10px] opacity-80 font-medium">This bill is marked as PAID and has been fully processed by the finance registry.</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 print-badge-pending">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-xs">Payment Pending</span>
                    <span className="text-[10px] opacity-80 font-medium">This bill is waiting to be settled. Due date: {formatDate(invoice.due_date)}.</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </MainLayout>
  );
}
