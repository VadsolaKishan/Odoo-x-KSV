import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Briefcase, Users, FileText, ArrowRight, GitCompare, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Timeline } from '../components/Timeline';
import { StatusBadge } from '../components/StatusBadge';

export const RfqDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rfqs, vendors, quotations, selectQuoteForRfq, formatIndianCurrency } = useApp();

  // Find current RFQ details
  const rfq = rfqs.find((r) => r.id === id);
  if (!rfq) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl">
        <p className="text-sm text-slate-500">RFQ details for "{id}" not found.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg text-xs">
          Return Dashboard
        </button>
      </div>
    );
  }

  // Filter quotes submitted for this RFQ
  const rfqQuotes = quotations.filter((q) => q.rfqId === rfq.id);

  // Map invited vendors
  const invitedVendors = rfq.assignedVendors.map((vId) => vendors.find((v) => v.id === vId)).filter(Boolean);

  const selectedQuote = rfqQuotes.find((q) => q.status === 'Selected' || q.id === rfq.selectedBidId);

  return (
    <div className="space-y-6">
      {/* Back to dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
              {rfq.title}
            </h1>
            <StatusBadge status={rfq.status} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-semibold mt-1">
            RFQ CODE: {rfq.id} • Created on {rfq.createdAt}
          </p>
        </div>

        {/* Compare action button if quotes exist */}
        {rfqQuotes.length > 0 && (
          <button
            onClick={() => navigate(`/quotations?rfqId=${rfq.id}`)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/10 font-bold text-xs active:scale-98 transition-all"
          >
            <GitCompare className="w-4.5 h-4.5" />
            <span>Compare Quotes Side-by-Side</span>
          </button>
        )}
      </div>

      {/* Procurement Process Tracker */}
      <div className="glass-panel p-4 rounded-2xl bg-white dark:bg-neutral-900">
        <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider px-2">
          Procurement Pipeline Progress
        </h3>
        <Timeline currentStep={rfq.timelineStep} />
      </div>

      {/* Description & Items Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Specifications and catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-brand-500" />
              <span>Statement of Requirements</span>
            </h3>
            <p className="text-xs text-slate-650 dark:text-neutral-350 leading-relaxed font-medium">
              {rfq.description}
            </p>

            <div className="pt-2">
              <p className="text-xs font-bold text-slate-800 dark:text-neutral-200 mb-2.5">Catalog Items List</p>
              <div className="rounded-xl border border-slate-150 dark:border-neutral-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-neutral-950/40 text-[10px] font-bold text-slate-400 dark:text-neutral-550 border-b border-slate-150 dark:border-neutral-800 uppercase select-none">
                      <th className="px-4 py-3">Description Name</th>
                      <th className="px-4 py-3 w-32 text-right">Quantity Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-neutral-800 text-slate-700 dark:text-neutral-300">
                    {rfq.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/30 dark:hover:bg-neutral-850/10">
                        <td className="px-4 py-3 font-semibold">{item.name}</td>
                        <td className="px-4 py-3 text-right font-bold">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quotes Listing */}
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-brand-500" />
              <span>Submitted Bids ({rfqQuotes.length})</span>
            </h3>

            {rfqQuotes.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-neutral-500 text-center py-6">
                Waiting for supplier quotations to be submitted.
              </p>
            ) : (
              <div className="divide-y divide-slate-150 dark:divide-neutral-800/60">
                {rfqQuotes.map((quote) => {
                  const isChosen = selectedQuote?.id === quote.id;
                  return (
                    <div key={quote.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">{quote.vendorName}</span>
                          {isChosen && (
                            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-[9px] font-bold text-emerald-600 dark:text-emerald-450 border border-emerald-100/30">
                              <ShieldCheck className="w-3 h-3" /> Selected Quote
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500">
                          Total Bid: <span className="font-bold text-slate-700 dark:text-neutral-300">{formatIndianCurrency(quote.totalCost)}</span> • Delivery: <span className="font-bold text-slate-700 dark:text-neutral-300">{quote.deliveryTimeDays} days</span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-neutral-400 italic">"{quote.remarks}"</p>
                      </div>
                      
                      {/* Direct Selection Actions if Quotes phase */}
                      {rfq.status === 'Quotes Gathered' && (
                        <button
                          onClick={() => selectQuoteForRfq(rfq.id, quote.id)}
                          className="px-3 py-1.5 text-[10px] font-bold bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-800 rounded-lg hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-450 shadow-sm active:scale-95 transition-all whitespace-nowrap"
                        >
                          Select Quote
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Invited Vendors list */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-brand-500" />
              <span>Participating Vendors ({invitedVendors.length})</span>
            </h3>

            <div className="space-y-3">
              {invitedVendors.map((vendor) => (
                <div key={vendor.id} className="p-3 border border-slate-150 dark:border-neutral-800 rounded-xl flex items-center justify-between">
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">{vendor.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">{vendor.email}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-neutral-450 shrink-0">
                    ★ {vendor.rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick info sheet */}
          <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-neutral-900 space-y-3 text-xs leading-normal">
            <h4 className="font-bold text-slate-800 dark:text-neutral-200">Bidding Milestones</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-450">Bidding Opens:</span>
                <span className="font-medium text-slate-700 dark:text-neutral-300">{rfq.createdAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-450">Closing Date:</span>
                <span className="font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-danger-550" /> {rfq.deadline}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-neutral-800 pt-2">
                <span className="text-slate-450">PO Link Code:</span>
                <span className="font-bold text-slate-800 dark:text-neutral-200">
                  {rfq.poId ? (
                    <Link to="/purchase-orders" className="text-brand-600 hover:underline">{rfq.poId}</Link>
                  ) : (
                    'Not generated yet'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-450">Invoice Ref:</span>
                <span className="font-bold text-slate-800 dark:text-neutral-200">
                  {rfq.invoiceId ? (
                    <Link to="/invoices" className="text-brand-600 hover:underline">{rfq.invoiceId}</Link>
                  ) : (
                    'Not generated yet'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RfqDetails;
