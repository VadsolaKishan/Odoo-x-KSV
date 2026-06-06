import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Loader2, FileText } from 'lucide-react';

export const VendorQuotationSubmit = () => {
  const { currentUser, rfqs, quotations, submitQuotation, loading, addToast } = useApp();

  const vendorId = currentUser?.vendorId;
  const assignedRfqs = rfqs.filter(r =>
    r.assignedVendors?.includes(vendorId) &&
    ['RFQ Created', 'Sent', 'Quotes Gathered'].includes(r.status)
  );
  const submittedRfqIds = quotations.filter(q => q.vendorId === vendorId).map(q => q.rfqId);
  const pendingRfqs = assignedRfqs.filter(r => !submittedRfqIds.includes(r.id));

  const [selectedRfqId, setSelectedRfqId] = useState(pendingRfqs[0]?.id || '');
  const [unitPrice, setUnitPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedRfq = rfqs.find(r => r.id === selectedRfqId);

  const totalCost = selectedRfq && unitPrice
    ? parseFloat(unitPrice) * (parseFloat(selectedRfq.quantity) || 1)
    : 0;

  const validate = () => {
    const errs = {};
    if (!selectedRfqId) errs.rfq = 'Select an RFQ';
    if (!unitPrice || isNaN(unitPrice) || parseFloat(unitPrice) <= 0) errs.unitPrice = 'Enter a valid unit price';
    if (!deliveryDays || isNaN(deliveryDays) || parseInt(deliveryDays) <= 0) errs.deliveryDays = 'Enter delivery time in days';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const success = await submitQuotation(selectedRfqId, vendorId, {
      unitPrice: parseFloat(unitPrice),
      totalCost,
      deliveryDays: parseInt(deliveryDays),
      notes,
      terms,
      vendorName: currentUser?.name,
      rating: 4.2,
    });
    if (success) {
      setSubmitted(true);
      setUnitPrice('');
      setDeliveryDays('');
      setNotes('');
      setTerms('');
    }
  };

  const FieldError = ({ field }) => errors[field]
    ? <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-1">{errors[field]}</p>
    : null;

  const inputCls = (field) => `w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 ${
    errors[field]
      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 focus:ring-brand-500/20 focus:border-brand-500'
  }`;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto pt-12 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-2">Quotation Submitted!</h2>
          <p className="text-sm text-slate-600 dark:text-neutral-400 font-medium">
            Your quotation has been submitted to the procurement team. You'll be notified once it's reviewed.
          </p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 transition-all"
        >
          Submit Another Quotation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">Submit Quotation</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium mt-1">
          Select an RFQ and submit your competitive quotation.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl shadow-premium-sm p-6">

          {pendingRfqs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500 dark:text-neutral-500">All RFQs submitted!</p>
              <p className="text-xs text-slate-400 dark:text-neutral-600 mt-1 font-medium">No pending RFQs to quote on right now.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* RFQ Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Select RFQ *</label>
                <select
                  value={selectedRfqId}
                  onChange={e => { setSelectedRfqId(e.target.value); setErrors(p => ({...p, rfq:''})); }}
                  className={inputCls('rfq')}
                >
                  <option value="">-- Select an RFQ --</option>
                  {pendingRfqs.map(r => (
                    <option key={r.id} value={r.id}>{r.id} — {r.title}</option>
                  ))}
                </select>
                <FieldError field="rfq" />
              </div>

              {/* RFQ Preview */}
              {selectedRfq && (
                <div className="bg-slate-50 dark:bg-neutral-950/40 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-neutral-300">{selectedRfq.title}</p>
                  <div className="grid grid-cols-3 gap-3 text-[11px]">
                    <div><span className="text-slate-400 dark:text-neutral-500">Quantity</span><br /><strong className="text-slate-700 dark:text-neutral-300">{selectedRfq.quantity}</strong></div>
                    <div><span className="text-slate-400 dark:text-neutral-500">Deadline</span><br /><strong className="text-slate-700 dark:text-neutral-300">{selectedRfq.deadline}</strong></div>
                    <div><span className="text-slate-400 dark:text-neutral-500">Priority</span><br /><strong className="text-slate-700 dark:text-neutral-300">{selectedRfq.priority || 'Normal'}</strong></div>
                  </div>
                  {selectedRfq.description && (
                    <p className="text-[11px] text-slate-500 dark:text-neutral-500 font-medium border-t border-slate-200 dark:border-neutral-800 pt-2">{selectedRfq.description}</p>
                  )}
                </div>
              )}

              {/* Price & Delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Unit Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 text-sm font-bold">₹</span>
                    <input type="number" min="1" step="0.01" value={unitPrice}
                      onChange={e => { setUnitPrice(e.target.value); setErrors(p => ({...p, unitPrice:''})); }}
                      placeholder="0.00"
                      className={`${inputCls('unitPrice')} pl-8`} />
                  </div>
                  <FieldError field="unitPrice" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Delivery Time (days) *</label>
                  <input type="number" min="1" value={deliveryDays}
                    onChange={e => { setDeliveryDays(e.target.value); setErrors(p => ({...p, deliveryDays:''})); }}
                    placeholder="e.g. 14"
                    className={inputCls('deliveryDays')} />
                  <FieldError field="deliveryDays" />
                </div>
              </div>

              {/* Total Preview */}
              {totalCost > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/40 rounded-xl">
                  <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">Estimated Total</span>
                  <span className="text-lg font-display font-black text-brand-700 dark:text-brand-400">
                    ₹{totalCost.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Notes & Terms */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Product specifications, warranty details, shipping info..."
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none text-slate-800 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Terms & Conditions</label>
                <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2}
                  placeholder="Payment terms, cancellation policy..."
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none text-slate-800 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Quotation'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorQuotationSubmit;
