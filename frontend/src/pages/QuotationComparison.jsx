import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { Star, Trophy, Zap, CheckCircle2, FileText } from 'lucide-react';

export const QuotationComparison = () => {
  const navigate = useNavigate();
  const { rfqs, quotations, vendors, selectQuoteForRfq, loading, addToast } = useApp();

  // Only RFQs with multiple quotations
  const rfqsWithQuotes = rfqs.filter(r =>
    quotations.filter(q => q.rfqId === r.id).length > 0
  );

  const [selectedRfqId, setSelectedRfqId] = useState(rfqsWithQuotes[0]?.id || '');

  const selectedRfq = rfqs.find(r => r.id === selectedRfqId);
  const rfqQuotes = quotations.filter(q => q.rfqId === selectedRfqId);

  const lowestPrice = rfqQuotes.length ? Math.min(...rfqQuotes.map(q => q.totalCost || 0)) : 0;
  const fastestDelivery = rfqQuotes.length ? Math.min(...rfqQuotes.map(q => q.deliveryDays || 999)) : 0;

  const getScore = (q) => {
    const priceScore = lowestPrice / (q.totalCost || 1);
    const deliveryScore = fastestDelivery / (q.deliveryDays || 1);
    const rating = q.rating || 4;
    return ((priceScore + deliveryScore + rating / 5) / 3 * 100).toFixed(0);
  };

  const recommended = rfqQuotes.length
    ? rfqQuotes.reduce((best, q) => getScore(q) > getScore(best) ? q : best, rfqQuotes[0])
    : null;

  const handleSelectBid = async (quote) => {
    if (!selectedRfq) return;
    if (selectedRfq.status === 'Approved (Pending PO)' || selectedRfq.status === 'PO Generated') {
      addToast('A bid is already approved for this RFQ.', 'warning');
      return;
    }
    await selectQuoteForRfq(selectedRfqId, quote.id);
    addToast(`${quote.vendorName}'s bid selected — sent to Manager for approval!`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">Quotation Comparison</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium mt-1">
            Compare vendor bids side-by-side and select the best one for approval.
          </p>
        </div>
      </div>

      {/* RFQ Selector */}
      <div className="flex items-center gap-3">
        <select
          value={selectedRfqId}
          onChange={e => setSelectedRfqId(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-neutral-200 transition-all font-semibold min-w-[320px]"
        >
          <option value="">-- Select an RFQ --</option>
          {rfqsWithQuotes.map(r => (
            <option key={r.id} value={r.id}>{r.id} — {r.title} ({quotations.filter(q => q.rfqId === r.id).length} bids)</option>
          ))}
        </select>
        {selectedRfq && <StatusBadge status={selectedRfq.status} />}
      </div>

      {!selectedRfq ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-premium-sm">
          <FileText className="w-10 h-10 text-slate-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-neutral-500">Select an RFQ to compare quotations</p>
        </div>
      ) : rfqQuotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-premium-sm">
          <p className="text-sm font-semibold text-slate-500 dark:text-neutral-500">No quotations received yet for this RFQ</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400">
              <Trophy className="w-3.5 h-3.5" /> Lowest Price
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 text-sky-700 dark:text-sky-400">
              <Zap className="w-3.5 h-3.5" /> Fastest Delivery
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/40 text-brand-700 dark:text-brand-400">
              <Star className="w-3.5 h-3.5" /> Recommended
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {rfqQuotes.map(quote => {
              const isLowest = quote.totalCost === lowestPrice;
              const isFastest = quote.deliveryDays === fastestDelivery;
              const isRec = recommended?.id === quote.id;
              const isSelected = selectedRfq.selectedBidId === quote.id;
              const score = getScore(quote);

              return (
                <div key={quote.id} className={`relative bg-white dark:bg-neutral-900 rounded-2xl border shadow-premium-sm flex flex-col overflow-hidden transition-all hover:shadow-md ${
                  isRec
                    ? 'border-brand-400 dark:border-brand-600 ring-2 ring-brand-500/20'
                    : 'border-slate-200/80 dark:border-neutral-800/60'
                }`}>
                  {/* Rec banner */}
                  {isRec && (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-[10px] font-black tracking-wide">
                      <Star className="w-3.5 h-3.5" /> RECOMMENDED
                    </div>
                  )}

                  <div className="p-5 flex-1 space-y-4">
                    {/* Vendor Name */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-800 dark:text-neutral-200">{quote.vendorName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium">{quote.rfqId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium">Score</p>
                        <p className="text-sm font-black text-brand-600 dark:text-brand-400">{score}%</p>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-2.5">
                      {/* Price */}
                      <div className={`flex items-center justify-between p-3 rounded-xl ${isLowest ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30' : 'bg-slate-50 dark:bg-neutral-950/30 border border-slate-100 dark:border-neutral-800'}`}>
                        <div className="flex items-center gap-1.5">
                          {isLowest && <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">Total Price</span>
                        </div>
                        <span className={`text-sm font-black ${isLowest ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-neutral-200'}`}>
                          ₹{quote.totalCost?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>

                      {/* Delivery */}
                      <div className={`flex items-center justify-between p-3 rounded-xl ${isFastest ? 'bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30' : 'bg-slate-50 dark:bg-neutral-950/30 border border-slate-100 dark:border-neutral-800'}`}>
                        <div className="flex items-center gap-1.5">
                          {isFastest && <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">Delivery</span>
                        </div>
                        <span className={`text-sm font-black ${isFastest ? 'text-sky-700 dark:text-sky-400' : 'text-slate-800 dark:text-neutral-200'}`}>
                          {quote.deliveryDays || '—'} days
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-950/30 border border-slate-100 dark:border-neutral-800">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{quote.rating || '4.0'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {quote.notes && (
                      <p className="text-[10px] text-slate-500 dark:text-neutral-500 font-medium border-t border-slate-100 dark:border-neutral-800 pt-3 line-clamp-2">
                        {quote.notes}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="px-5 pb-5">
                    {isSelected ? (
                      <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Selected for Approval
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectBid(quote)}
                        disabled={loading || !!selectedRfq.selectedBidId}
                        className="w-full py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Select This Bid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default QuotationComparison;
