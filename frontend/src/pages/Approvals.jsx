import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Approvals = () => {
  const { rfqs, quotations, vendors, processApproval, loading, addToast, formatIndianCurrency } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Local state for approval remarks per RFQ ID
  const [remarks, setRemarks] = useState('');
  const [selectedRfqId, setSelectedRfqId] = useState('');

  // Filter RFQs that are in "Pending Approval" status
  const pendingRfqs = rfqs.filter(r => r.status === 'Pending Approval');

  // Update selection on query param change or default to first pending RFQ
  useEffect(() => {
    const rfqId = searchParams.get('rfqId');
    if (rfqId) {
      setSelectedRfqId(rfqId);
    } else if (pendingRfqs.length > 0) {
      setSelectedRfqId(pendingRfqs[0].id);
    }
  }, [searchParams, rfqs]);

  const handleRfqChange = (e) => {
    const rfqId = e.target.value;
    setSelectedRfqId(rfqId);
    setSearchParams({ rfqId });
  };

  const activeRfq = pendingRfqs.find(r => r.id === selectedRfqId);
  const selectedQuote = activeRfq ? quotations.find(q => q.id === activeRfq.selectedBidId) : null;
  const vendorObj = selectedQuote ? vendors.find(v => v.id === selectedQuote.vendorId) : null;

  const handleAction = async (actionType) => {
    if (!activeRfq) return;
    
    if (actionType === 'reject' && !remarks.trim()) {
      addToast('Please provide a reason in the remarks field for rejection.', 'warning');
      return;
    }
    
    await processApproval(activeRfq.id, actionType, remarks);
    setRemarks('');
    setSelectedRfqId('');
    addToast(`RFQ ${activeRfq.id} ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`, 'success');
  };

  return (
    <div className="space-y-6 text-xs text-slate-700 dark:text-neutral-300">
      
      {/* Header and Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
            Approval Workflow
          </h1>
          {activeRfq && selectedQuote ? (
            <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
              RFQ: {activeRfq.title} - Vendor: {selectedQuote.vendorName} - {formatIndianCurrency(selectedQuote.totalCost)}
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
              Select a pending RFQ authorization request
            </p>
          )}
        </div>

        {/* Pending approvals selector */}
        {pendingRfqs.length > 0 && (
          <div className="flex items-center gap-2 select-none">
            <select
              value={selectedRfqId}
              onChange={handleRfqChange}
              className="px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-neutral-300 font-semibold"
            >
              <option value="">-- Choose Approval Request --</option>
              {pendingRfqs.map(r => (
                <option key={r.id} value={r.id}>{r.id} - {r.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {pendingRfqs.length === 0 || !activeRfq ? (
        // Empty State
        <div className="border border-slate-200 dark:border-neutral-800 p-12 text-center rounded-2xl bg-white dark:bg-neutral-900/40">
          <p className="text-slate-405 dark:text-neutral-500">
            Your approvals inbox is empty. No pending workflow signatures at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          
          {/* Step Indicator Layout */}
          <div className="flex flex-col items-center justify-center py-4 select-none">
            <div className="flex items-center w-full max-w-xl relative px-4">
              
              {/* Connector line */}
              <div className="absolute left-8 right-8 top-4 h-0.5 bg-slate-200 dark:bg-neutral-800 z-0" />
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center z-10 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-slate-500 font-bold text-sm">
                  1
                </div>
                <span className="text-[10px] text-slate-450 dark:text-neutral-500 mt-2 font-medium">Submitted</span>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center z-10 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-slate-500 font-bold text-sm">
                  2
                </div>
                <span className="text-[10px] text-slate-455 dark:text-neutral-500 mt-2 font-medium">L1 Review</span>
              </div>

              {/* Step 3: Active approval circle */}
              <div className="flex flex-col items-center text-center z-10 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-brand-500 bg-brand-50/70 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-bold text-sm">
                  3
                </div>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 font-semibold">L2 approval</span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center z-10 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-slate-500 font-bold text-sm">
                  4
                </div>
                <span className="text-[10px] text-slate-450 dark:text-neutral-500 mt-2 font-medium">Generate PO</span>
              </div>

            </div>
          </div>

          {/* Form details in two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Chain & Remarks */}
            <div className="space-y-6">
              
              {/* Approval Chain Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  APPROVAL CHAIN
                </h3>
                
                <div className="space-y-4">
                  {/* Item 1: L1 Approved */}
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-neutral-100">Rahul Mehta (Procurement head)</p>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-550 font-medium">Approved on may 20, 10:32 Am</p>
                    </div>
                  </div>

                  {/* Item 2: L2 Awaiting */}
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full border border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 flex items-center justify-center text-xs shrink-0">
                      🕒
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-neutral-100">Priya Shah (finance manager)</p>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-550 font-semibold">Awaiting</p>
                      <p className="text-[9px] text-slate-500 dark:text-neutral-500 font-medium">Assigned may 21</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Remarks input */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  Approval Remarks
                </h3>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your comments or conditions...."
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 dark:text-neutral-100 resize-none"
                />
              </div>

            </div>

            {/* Right Column: Quotations Summary & Sign Actions */}
            <div className="space-y-6">
              
              {/* Quotation Summary Box */}
              {selectedQuote && (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                    QUOTATIONS SUMMARY
                  </h3>

                  <div className="border border-slate-200 dark:border-neutral-800 rounded-xl p-5 bg-white dark:bg-neutral-900/50 shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-500 dark:text-neutral-450">Vendor:</span>
                      <span className="font-bold text-slate-800 dark:text-neutral-205">{selectedQuote.vendorName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-neutral-850 pt-2.5">
                      <span className="font-semibold text-slate-500 dark:text-neutral-450">Total:</span>
                      <span className="font-bold text-slate-850 dark:text-neutral-100">{selectedQuote.totalCost.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-neutral-850 pt-2.5">
                      <span className="font-semibold text-slate-500 dark:text-neutral-450">Delivery:</span>
                      <span className="font-bold text-slate-850 dark:text-neutral-100">{selectedQuote.deliveryTimeDays} days</span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-neutral-850 pt-2.5">
                      <span className="font-semibold text-slate-500 dark:text-neutral-450">Rating:</span>
                      <span className="font-bold text-slate-850 dark:text-neutral-100">
                        {vendorObj ? `${vendorObj.rating.toFixed(1)}/5` : '4.5/5'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-4 select-none">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction('approve')}
                  className="flex-1 py-2.5 text-xs font-semibold bg-transparent border border-slate-350 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600 transition-all cursor-pointer text-center"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction('reject')}
                  className="flex-1 py-2.5 text-xs font-semibold bg-transparent border border-slate-350 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600 transition-all cursor-pointer text-center"
                >
                  Reject
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Approvals;
