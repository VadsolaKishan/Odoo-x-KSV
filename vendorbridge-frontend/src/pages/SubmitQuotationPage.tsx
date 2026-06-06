import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Check, 
  Save, 
  Send,
  Loader2,
  FileText
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../lib/axios';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

interface RFQLineItem {
  id: string;
  rfq_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  estimated_unit_price: number | null;
}

interface AssignedVendor {
  id: string;
  name: string;
  category: string;
  gst_number: string;
  contact_email: string;
  created_by: string;
  status: string;
  rating: string;
}

interface RFQDetail {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  description: string;
  deadline: string;
  status: string;
  line_items: RFQLineItem[];
  assigned_vendors: AssignedVendor[];
}

interface QuotationLineInput {
  rfq_line_item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number | string;
  delivery_days: number | string;
}

export default function SubmitQuotationPage() {
  const { id: rfqId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // API State
  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [loadingRFQ, setLoadingRFQ] = useState(true);
  const [myVendors, setMyVendors] = useState<AssignedVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<AssignedVendor | null>(null);

  // Form State
  const [lineItems, setLineItems] = useState<QuotationLineInput[]>([]);
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [paymentTerms, setPaymentTerms] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [quotationStatus, setQuotationStatus] = useState<string>('new'); // new, draft, submitted, selected, rejected

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch RFQ Details
  useEffect(() => {
    async function loadRFQ() {
      if (!rfqId) return;
      setLoadingRFQ(true);
      try {
        const res = await api.get(`/rfqs/${rfqId}`);
        if (res.data && res.data.success) {
          const rfqData: RFQDetail = res.data.data;
          setRfq(rfqData);

          // Find which assigned vendors the current user represents
          let matched: AssignedVendor[] = [];
          if (user?.role === 'admin' || user?.role === 'procurement_officer' || user?.role === 'manager') {
            // Admin/Procurement/Manager can act on behalf of any assigned vendor (for preview/testing)
            matched = rfqData.assigned_vendors || [];
          } else {
            // Vendors filter by owner ID or contact email
            matched = (rfqData.assigned_vendors || []).filter(
              v => v.created_by === user?.id || v.contact_email === user?.email
            );
          }
          setMyVendors(matched);

          if (matched.length > 0) {
            setSelectedVendor(matched[0]);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch RFQ details', err);
        toast.error('Failed to load RFQ. It might not exist or you might lack permissions.');
      } finally {
        setLoadingRFQ(false);
      }
    }
    loadRFQ();
  }, [rfqId, user]);

  // Fetch existing quotation when active vendor changes
  useEffect(() => {
    async function loadQuotation() {
      if (!rfqId || !selectedVendor) return;
      
      // Initialize form items from RFQ lines in case no draft exists
      const initialLines = (rfq?.line_items || []).map(item => ({
        rfq_line_item_id: item.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: '',
        delivery_days: ''
      }));

      try {
        // Fetch quotations for this RFQ (backend will filter by user role to return only ours)
        const res = await api.get(`/quotations?rfq_id=${rfqId}`);
        if (res.data && res.data.success && res.data.data.length > 0) {
          // Find if there is a quotation matching this selected vendor
          const existing = res.data.data.find((q: any) => q.vendor_id === selectedVendor.id);
          if (existing) {
            setQuotationId(existing.id);
            setQuotationStatus(existing.status);
            setGstPercentage(parseFloat(existing.gst_percentage) || 18);
            setPaymentTerms(existing.payment_terms || '');
            setNotes(existing.notes || '');

            // Map line items
            const mappedLines = (rfq?.line_items || []).map(rfqItem => {
              const matchedLine = (existing.line_items || []).find((l: any) => l.rfq_line_item_id === rfqItem.id);
              return {
                rfq_line_item_id: rfqItem.id,
                item_name: rfqItem.item_name,
                quantity: rfqItem.quantity,
                unit: rfqItem.unit,
                unit_price: matchedLine ? parseFloat(matchedLine.unit_price) : '',
                delivery_days: matchedLine && matchedLine.delivery_days !== null ? matchedLine.delivery_days : ''
              };
            });
            setLineItems(mappedLines);
            return;
          }
        }

        // Reset to default if no existing quotation is found
        setQuotationId(null);
        setQuotationStatus('new');
        setGstPercentage(18);
        setPaymentTerms('');
        setNotes('');
        setLineItems(initialLines);
      } catch (err) {
        console.error('Failed to load existing quotation', err);
        // Fallback to fresh inputs
        setQuotationId(null);
        setQuotationStatus('new');
        setLineItems(initialLines);
      }
    }
    loadQuotation();
  }, [selectedVendor, rfq, rfqId]);

  // Handle unit price change
  const handlePriceChange = (index: number, val: string) => {
    const updated = [...lineItems];
    updated[index].unit_price = val === '' ? '' : Math.max(0, parseFloat(val) || 0);
    setLineItems(updated);
  };

  // Handle delivery days change
  const handleDeliveryChange = (index: number, val: string) => {
    const updated = [...lineItems];
    updated[index].delivery_days = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setLineItems(updated);
  };

  // Real-time Math helper
  const calculateTotals = () => {
    let subtotal = 0;
    const itemsWithTotals = lineItems.map(item => {
      const price = parseFloat(item.unit_price as string) || 0;
      const total = item.quantity * price;
      subtotal += total;
      return { ...item, total };
    });

    const gstAmount = subtotal * (gstPercentage / 100);
    const grandTotal = subtotal + gstAmount;

    return {
      subtotal,
      gstAmount,
      grandTotal,
      itemsWithTotals
    };
  };

  const { subtotal, gstAmount, grandTotal, itemsWithTotals } = calculateTotals();

  // Save Quotation (POST /api/quotations)
  const saveQuotation = async (silent: boolean = false): Promise<string | null> => {
    if (!selectedVendor || !rfqId) {
      toast.error('No vendor selected');
      return null;
    }

    // Validate prices
    const invalidLines = lineItems.some(item => item.unit_price === '' || parseFloat(item.unit_price as string) <= 0);
    if (invalidLines) {
      toast.error('Please input valid unit prices for all line items');
      return null;
    }

    if (!silent) setIsSaving(true);

    try {
      // Find maximum delivery days across items or take overall
      const maxDelivery = lineItems.reduce((max, item) => {
        const val = parseInt(item.delivery_days as string, 10) || 0;
        return val > max ? val : max;
      }, 0);

      const payload = {
        rfq_id: rfqId,
        vendor_id: selectedVendor.id,
        gst_percentage: gstPercentage,
        delivery_days: maxDelivery || null,
        payment_terms: paymentTerms || null,
        notes: notes || null,
        line_items: lineItems.map(item => ({
          rfq_line_item_id: item.rfq_line_item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: parseFloat(item.unit_price as string),
          delivery_days: parseInt(item.delivery_days as string, 10) || null
        }))
      };

      const res = await api.post('/quotations', payload);
      if (res.data && res.data.success) {
        const savedQ = res.data.data;
        setQuotationId(savedQ.id);
        setQuotationStatus(savedQ.status);
        if (!silent) toast.success('Quotation draft saved successfully!');
        return savedQ.id;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save quotation draft');
    } finally {
      if (!silent) setIsSaving(false);
    }
    return null;
  };

  // Submit Quotation (Save Draft + Submit Patch)
  const submitQuotation = async () => {
    if (!rfqId) return;
    setIsSubmitting(true);
    try {
      // Step 1: Save it as draft first
      const savedId = await saveQuotation(true);
      if (!savedId) {
        setIsSubmitting(false);
        return;
      }

      // Step 2: Submit it
      const res = await api.patch(`/quotations/${savedId}/submit`);
      if (res.data && res.data.success) {
        setQuotationStatus('submitted');
        toast.success('Quotation submitted successfully!');
        navigate('/quotations');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatting currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // If quotation status is submitted, selected, or rejected, disable editing
  const isReadOnly = ['submitted', 'selected', 'rejected'].includes(quotationStatus);

  // Status indicators for existing quotations
  const getStatusBadge = () => {
    if (quotationStatus === 'new') return null;
    let classes = 'bg-gray-500/10 text-gray-400 border-white/5';
    if (quotationStatus === 'submitted') {
      classes = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    } else if (quotationStatus === 'selected') {
      classes = 'bg-emerald-500/10 text-brand-green border-brand-green/20';
    } else if (quotationStatus === 'rejected') {
      classes = 'bg-red-500/10 text-red-400 border-red-500/20';
    } else if (quotationStatus === 'draft') {
      classes = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${classes}`}>
        {quotationStatus}
      </span>
    );
  };

  return (
    <MainLayout>
      {/* Title & Back Navigation */}
      <div className="mb-8">
        <Link 
          to="/rfqs" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-green transition-colors uppercase tracking-wider mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to RFQ's List
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Submit Quotations</h1>
            <p className="text-text-secondary text-sm mt-1">Submit your quotation proposal in response to this RFQ</p>
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      </div>

      {loadingRFQ ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
          <p className="text-sm text-text-secondary">Loading RFQ specifications...</p>
        </div>
      ) : !rfq ? (
        <div className="glass-card rounded-xl border border-red-500/20 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">RFQ Not Found</h2>
          <p className="text-sm text-text-secondary mb-6">The RFQ details could not be loaded or you are not authorized to access it.</p>
          <Link to="/rfqs" className="bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-lg text-sm font-semibold inline-block transition-colors">
            Back to RFQ's List
          </Link>
        </div>
      ) : myVendors.length === 0 ? (
        <div className="glass-card rounded-xl border border-amber-500/20 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Access Restrained</h2>
          <p className="text-sm text-text-secondary max-w-lg mx-auto mb-6">
            You are not currently invited/assigned to this RFQ. Only assigned vendor profiles can respond to this RFQ.
          </p>
          <div className="text-xs text-text-secondary bg-white/[0.02] border border-white/5 rounded-lg p-4 max-w-md mx-auto text-left space-y-1">
            <span className="font-semibold block text-white mb-1">Invited Vendors:</span>
            {rfq.assigned_vendors.length === 0 ? (
              <span className="italic">No vendors invited yet.</span>
            ) : (
              rfq.assigned_vendors.map((v, i) => (
                <div key={v.id} className="flex justify-between font-mono">
                  <span>{i+1}. {v.name}</span>
                  <span className="text-[10px] text-text-secondary">{v.gst_number}</span>
                </div>
              ))
            )}
          </div>
          <Link to="/rfqs" className="bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-lg text-sm font-semibold inline-block transition-colors mt-6">
            Back to RFQ's List
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* RFQ Summary Card */}
          <div className="glass-card rounded-xl border border-white/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-brand-green" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">RFQ Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <span className="text-xs text-text-secondary uppercase font-semibold block">RFQ Code & Title</span>
                  <span className="text-base font-bold text-white">{rfq.rfq_number}: {rfq.title}</span>
                </div>
                <div>
                  <span className="text-xs text-text-secondary uppercase font-semibold block">Description</span>
                  <p className="text-sm text-text-secondary leading-relaxed">{rfq.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="space-y-3 border-t md:border-t-0 md:border-l border-subtle pt-3 md:pt-0 md:pl-6">
                <div>
                  <span className="text-xs text-text-secondary uppercase font-semibold block">Category</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-text-primary uppercase inline-block mt-0.5">
                    {rfq.category}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-text-secondary uppercase font-semibold block">Submission Deadline</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 mt-0.5">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(rfq.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Selector Tabs (Only if multiple matched vendors) */}
          {myVendors.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Submit as Vendor Profile:</span>
              <div className="flex flex-wrap gap-2">
                {myVendors.map(vendor => {
                  const isCurrent = selectedVendor?.id === vendor.id;
                  return (
                    <button
                      key={vendor.id}
                      onClick={() => !isSaving && !isSubmitting && setSelectedVendor(vendor)}
                      disabled={isSaving || isSubmitting}
                      className={`px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                        isCurrent
                          ? 'bg-brand-green/10 text-brand-green border-brand-green shadow-glow'
                          : 'bg-white/5 border-white/5 text-text-secondary hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      {vendor.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Vendor Profile Header Card */}
          <div className="glass-card rounded-xl border border-white/5 p-4 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-text-secondary">
                <Building2 className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedVendor?.name}</h4>
                <p className="text-xs text-text-secondary">GSTIN: {selectedVendor?.gst_number} | Phone: {selectedVendor?.contact_phone}</p>
              </div>
            </div>
            {isReadOnly && (
              <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Quotation is submitted and cannot be edited.</span>
              </div>
            )}
          </div>

          {/* Quotation Details Table */}
          <div className="glass-card rounded-xl border border-white/5 p-6">
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-subtle text-text-secondary text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Item Specification</th>
                    <th className="py-3 px-4 font-semibold text-center w-24">Quantity</th>
                    <th className="py-3 px-4 font-semibold text-right w-44">Unit Price (INR)</th>
                    <th className="py-3 px-4 font-semibold text-right w-40">Total</th>
                    <th className="py-3 px-4 font-semibold text-center w-36">Delivery (days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle/50">
                  {itemsWithTotals.map((item, idx) => (
                    <tr key={item.rfq_line_item_id} className="hover:bg-white/[0.01] transition-colors text-sm text-text-primary">
                      <td className="py-4 px-4 font-medium text-white">
                        {item.item_name}
                      </td>
                      <td className="py-4 px-4 text-center font-mono">
                        {item.quantity} <span className="text-[10px] text-text-secondary uppercase">{item.unit}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="relative flex justify-end">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                          <input
                            type="number"
                            min={0.01}
                            step={0.01}
                            placeholder="0.00"
                            disabled={isReadOnly || isSaving || isSubmitting}
                            value={item.unit_price}
                            onChange={(e) => handlePriceChange(idx, e.target.value)}
                            className="input-field py-1.5 pl-8 text-right font-mono text-sm max-w-[140px]"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-semibold text-white">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <input
                            type="number"
                            min={1}
                            placeholder="days"
                            disabled={isReadOnly || isSaving || isSubmitting}
                            value={item.delivery_days}
                            onChange={(e) => handleDeliveryChange(idx, e.target.value)}
                            className="input-field py-1.5 text-center font-mono text-sm max-w-[80px]"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & GST/Terms form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-subtle pt-6">
              
              {/* Left Column: Notes & Terms Inputs */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                      Tax / GST %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={isReadOnly || isSaving || isSubmitting}
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="input-field w-full font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 30 days net"
                      disabled={isReadOnly || isSaving || isSubmitting}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="input-field w-full text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                    Notes & Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional terms, shipping details, or clarifications..."
                    disabled={isReadOnly || isSaving || isSubmitting}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-field w-full text-sm resize-none pt-2.5"
                  />
                </div>
              </div>

              {/* Right Column: Pricing Recalculation Summary */}
              <div className="lg:col-span-5 bg-black/20 border border-white/5 rounded-xl p-6 h-fit space-y-4 font-semibold">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-subtle">
                  Summary Recalculation
                </h4>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-mono text-white font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-text-secondary">
                    <span>GST ({gstPercentage}%)</span>
                    <span className="font-mono text-white font-medium">{formatCurrency(gstAmount)}</span>
                  </div>

                  <div className="border-t border-subtle/50 my-2 pt-3 flex justify-between items-baseline">
                    <span className="text-base text-white">Grand Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-brand-green font-mono shadow-glow select-all">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Form Actions (Only show editable actions if not read-only) */}
            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-6 mt-6 border-t border-subtle">
              {!isReadOnly ? (
                <>
                  <button
                    type="button"
                    onClick={submitQuotation}
                    disabled={isSaving || isSubmitting || lineItems.length === 0}
                    className="h-11 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-glow hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Quotation
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => saveQuotation(false)}
                    disabled={isSaving || isSubmitting || lineItems.length === 0}
                    className="h-11 px-6 bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Draft
                      </>
                    )}
                  </button>
                </>
              ) : (
                <Link
                  to="/rfqs"
                  className="h-11 px-6 bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                >
                  Return to RFQ's List
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </MainLayout>
  );
}
