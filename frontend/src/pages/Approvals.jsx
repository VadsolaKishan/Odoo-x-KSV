import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, X, ShieldAlert, ClipboardList, RefreshCw, FileCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const Approvals = () => {
  const { rfqs, quotations, processApproval, loading, addToast, formatIndianCurrency } = useApp();
  const navigate = useNavigate();

  // Local state for approval remarks per RFQ ID
  const [remarksState, setRemarksState] = useState({});

  // Filter RFQs that are in "Pending Approval" status
  const pendingRfqs = rfqs.filter(r => r.status === 'Pending Approval');

  const handleRemarkChange = (rfqId, val) => {
    setRemarksState(prev => ({
      ...prev,
      [rfqId]: val
    }));
  };

  const handleAction = async (rfqId, actionType) => {
    const remarkText = remarksState[rfqId] || '';
    if (actionType === 'reject' && !remarkText.trim()) {
      addToast('Please provide a reason in the remarks field for rejection.', 'warning');
      return;
    }
    
    await processApproval(rfqId, actionType, remarkText);
    
    // Clear remark input state
    setRemarksState(prev => {
      const copy = { ...prev };
      delete copy[rfqId];
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
          Approvals Inbox
        </h1>
        <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
          Executive authorization center. Approve selected quotations or reject with instructions.
        </p>
      </div>

      {pendingRfqs.length === 0 ? (
        // Empty State
        <div className="glass-panel p-12 text-center rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-dark-950 text-slate-400">
              <FileCheck className="w-8 h-8" />
            </div>
            <p className="text-xs font-semibold text-slate-550 dark:text-dark-400">
              Your inbox is clean. There are no pending approvals.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingRfqs.map((rfq) => {
            // Find selected quotation
            const selectedQuote = quotations.find(q => q.id === rfq.selectedBidId);
            const remarkText = remarksState[rfq.id] || '';

            return (
              <div 
                key={rfq.id} 
                className="glass-panel p-6 rounded-2xl flex flex-col lg:flex-row gap-6 border-l-4 border-l-brand-500 animate-fade-in text-xs leading-normal"
              >
                
                {/* Details side */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/rfq/${rfq.id}`}
                        className="text-sm font-bold text-slate-800 dark:text-dark-100 hover:text-brand-650 hover:underline"
                      >
                        {rfq.title}
                      </Link>
                      <StatusBadge status={rfq.status} />
                    </div>
                    <p className="text-[10px] text-slate-450 dark:text-dark-500 font-semibold mt-0.5">
                      RFQ CODE: {rfq.id} • Created on {rfq.createdAt}
                    </p>
                  </div>

                  {/* Quote highlights summary */}
                  {selectedQuote && (
                    <div className="p-4 rounded-xl border border-slate-150 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-dark-500 uppercase">Selected Vendor</span>
                        <p className="font-bold text-slate-850 dark:text-dark-250 mt-0.5">{selectedQuote.vendorName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-dark-500 uppercase">Agreement Cost</span>
                        <p className="font-bold text-slate-850 dark:text-dark-250 mt-0.5 text-sm">{formatIndianCurrency(selectedQuote.totalCost)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-dark-500 uppercase">Est. Delivery</span>
                        <p className="font-bold text-slate-850 dark:text-dark-250 mt-0.5">{selectedQuote.deliveryTimeDays} Business Days</p>
                      </div>
                    </div>
                  )}

                  {/* Items spec */}
                  <div className="space-y-2">
                    <p className="font-bold text-slate-800 dark:text-dark-250">Items Catalogued</p>
                    <div className="rounded-xl border border-slate-150 dark:border-dark-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-dark-950/40 text-[9px] font-bold text-slate-400 dark:text-dark-500 border-b border-slate-150 dark:border-dark-800 uppercase">
                            <th className="px-4 py-2">Item Name</th>
                            <th className="px-4 py-2 w-24 text-right">Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 dark:divide-dark-800 text-slate-700 dark:text-dark-300">
                          {rfq.items.map((it, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 font-semibold">{it.name}</td>
                              <td className="px-4 py-2 text-right font-bold">{it.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Actions side */}
                <div className="w-full lg:w-80 flex flex-col gap-3 justify-between border-t lg:border-t-0 lg:border-l border-slate-150 dark:border-dark-800 pt-4 lg:pt-0 lg:pl-6">
                  
                  {/* Evaluation Remarks */}
                  <div className="space-y-1.5 flex-1">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Evaluation Remarks
                    </label>
                    <textarea
                      value={remarkText}
                      onChange={(e) => handleRemarkChange(rfq.id, e.target.value)}
                      placeholder="Add validation details or rejection instructions..."
                      className="w-full h-28 p-3 text-xs bg-slate-50 dark:bg-dark-950/50 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 dark:text-dark-250 resize-none font-semibold"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 shrink-0 select-none">
                    <button
                      onClick={() => handleAction(rfq.id, 'reject')}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450 font-bold rounded-lg border border-rose-200/50 dark:border-rose-900/30 transition-all text-xs"
                    >
                      <X className="w-4 h-4" /> Reject Bid
                    </button>
                    <button
                      onClick={() => handleAction(rfq.id, 'approve')}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all text-xs"
                    >
                      <Check className="w-4 h-4" /> Approve & Sign
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Approvals;
