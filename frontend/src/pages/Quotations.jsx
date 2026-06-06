import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GitCompare, Check, IndianRupee, Clock, ShieldCheck, HelpCircle, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Quotations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { rfqs, quotations, selectQuoteForRfq, addToast, formatIndianCurrency } = useApp();

  const [selectedRfqId, setSelectedRfqId] = useState('');

  // Update selection on query param change
  useEffect(() => {
    const rfqId = searchParams.get('rfqId');
    if (rfqId) {
      setSelectedRfqId(rfqId);
    } else if (rfqs.length > 0) {
      // Default to the first RFQ containing quotes
      const firstWithQuotes = rfqs.find(r => quotations.some(q => q.rfqId === r.id));
      if (firstWithQuotes) {
        setSelectedRfqId(firstWithQuotes.id);
      }
    }
  }, [searchParams, rfqs, quotations]);

  const handleRfqChange = (e) => {
    const rfqId = e.target.value;
    setSelectedRfqId(rfqId);
    setSearchParams({ rfqId });
  };

  // Filter quotes and get items for this RFQ
  const activeRfq = rfqs.find(r => r.id === selectedRfqId);
  const activeQuotes = quotations.filter(q => q.rfqId === selectedRfqId);

  // Compute Highlights
  let lowestPriceQuoteId = null;
  let fastestDeliveryQuoteId = null;
  let bestDealQuoteId = null;

  if (activeQuotes.length > 0) {
    // 1. Lowest Price
    const sortedByPrice = [...activeQuotes].sort((a, b) => a.totalCost - b.totalCost);
    lowestPriceQuoteId = sortedByPrice[0].id;

    // 2. Fastest Delivery
    const sortedBySpeed = [...activeQuotes].sort((a, b) => a.deliveryTimeDays - b.deliveryTimeDays);
    fastestDeliveryQuoteId = sortedBySpeed[0].id;

    // 3. Best Deal Score: Cost (70% weight) + Speed (30% weight)
    // We normalize price and delivery speed relative to the max in the list
    const maxCost = Math.max(...activeQuotes.map(q => q.totalCost));
    const maxDelivery = Math.max(...activeQuotes.map(q => q.deliveryTimeDays));

    const scoredQuotes = activeQuotes.map(q => {
      const priceScore = q.totalCost / (maxCost || 1); // lower is better (lower cost ratio)
      const speedScore = q.deliveryTimeDays / (maxDelivery || 1); // lower is better (fewer days ratio)
      const totalScore = 0.7 * priceScore + 0.3 * speedScore;
      return { id: q.id, score: totalScore };
    });

    // Sort by lowest score (best deal)
    scoredQuotes.sort((a, b) => a.score - b.score);
    bestDealQuoteId = scoredQuotes[0].id;
  }

  // Handle select action
  const handleSelectBid = async (bidId) => {
    if (activeRfq) {
      await selectQuoteForRfq(activeRfq.id, bidId);
      navigate(`/rfq/${activeRfq.id}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
            Quotation Comparison Matrix
          </h1>
          <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
            Side-by-side evaluation sheet. Review pricing structures, SLA delivery promises, and pick vendor deals.
          </p>
        </div>

        {/* RFQ Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase shrink-0">Select RFQ:</label>
          <select
            value={selectedRfqId}
            onChange={handleRfqChange}
            className="px-3 py-2 text-xs bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-dark-300 font-semibold shadow-sm"
          >
            <option value="">-- Choose RFQ --</option>
            {rfqs.map(r => (
              <option key={r.id} value={r.id}>{r.id} - {r.title}</option>
            ))}
          </select>
        </div>
      </div>

      {(!selectedRfqId || activeQuotes.length === 0) ? (
        // Empty State
        <div className="glass-panel p-12 text-center rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-dark-950 text-slate-400">
              <GitCompare className="w-8 h-8" />
            </div>
            <p className="text-xs font-semibold text-slate-555 dark:text-dark-400">
              No quotations available. Please create an RFQ and invite vendors to generate bids.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Legend Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Lowest Price Banner */}
            <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/10">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-800 dark:text-emerald-450 uppercase text-[9px] tracking-wider">Lowest Price Highlight</p>
                <p className="text-slate-600 dark:text-dark-300 mt-0.5">
                  Cheapest bid: <span className="font-bold text-emerald-600 dark:text-emerald-450">
                    {activeQuotes.find(q => q.id === lowestPriceQuoteId)?.vendorName}
                  </span>
                </p>
              </div>
            </div>

            {/* Fastest Delivery Banner */}
            <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/10">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-blue-800 dark:text-blue-450 uppercase text-[9px] tracking-wider">Fastest Delivery Highlight</p>
                <p className="text-slate-600 dark:text-dark-300 mt-0.5">
                  Quickest SLA: <span className="font-bold text-blue-600 dark:text-blue-450 text-xs">
                    {activeQuotes.find(q => q.id === fastestDeliveryQuoteId)?.vendorName} ({activeQuotes.find(q => q.id === fastestDeliveryQuoteId)?.deliveryTimeDays} days)
                  </span>
                </p>
              </div>
            </div>

            {/* Best Value Deal Banner */}
            <div className="p-4 rounded-2xl border border-brand-100 dark:border-brand-900/30 bg-brand-50/20 dark:bg-brand-950/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/10">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-brand-850 dark:text-brand-400 uppercase text-[9px] tracking-wider">Smart Deal Suggestion</p>
                <p className="text-slate-600 dark:text-dark-300 mt-0.5 font-medium">
                  Best trade-off: <span className="font-bold text-brand-655 dark:text-brand-450">
                    {activeQuotes.find(q => q.id === bestDealQuoteId)?.vendorName}
                  </span>
                </p>
              </div>
            </div>

          </div>

          {/* Comparison Matrix Table */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-2xl shadow-premium dark:shadow-dark-premium overflow-hidden text-xs leading-normal">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark-950 border-b border-slate-200 dark:border-dark-800">
                    <th className="px-6 py-4 font-bold text-slate-500 dark:text-dark-400 text-left uppercase text-[9px]">Item Requirements</th>
                    {activeQuotes.map(q => {
                      const isBestDeal = q.id === bestDealQuoteId;
                      return (
                        <th key={q.id} className="px-6 py-4 text-center border-l border-slate-150 dark:border-dark-800 min-w-[200px]">
                          <div className="space-y-1.5 py-1">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-dark-100">{q.vendorName}</span>
                              {isBestDeal && (
                                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-brand-500 text-white font-extrabold text-[9px] uppercase shadow-md shadow-brand-500/20">
                                  Best Deal
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-dark-500">{q.id}</p>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-dark-800/80">
                  {/* Item Rows */}
                  {activeRfq.items.map((rfqItem, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-dark-850/10 text-slate-750 dark:text-dark-300">
                      <td className="px-6 py-4 font-semibold">
                        <p>{rfqItem.name}</p>
                        <p className="text-[10px] text-slate-450 font-medium">Quantity: {rfqItem.quantity}</p>
                      </td>
                      {activeQuotes.map(q => {
                        const itemBid = q.items.find(i => i.name === rfqItem.name);
                        return (
                          <td key={q.id} className="px-6 py-4 text-center border-l border-slate-150 dark:border-dark-800">
                            {itemBid ? (
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800 dark:text-dark-200">{formatIndianCurrency(itemBid.unitPrice)} / unit</p>
                                <p className="text-[10px] text-slate-400 dark:text-dark-500">Subtotal: {formatIndianCurrency(itemBid.total)}</p>
                              </div>
                            ) : (
                              <span className="text-slate-350 dark:text-dark-600 font-medium">Not Quoted</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Summary Rows: Delivery SLA */}
                  <tr className="bg-slate-50/20 dark:bg-dark-950/25">
                    <td className="px-6 py-4 font-bold text-slate-750 dark:text-dark-200">Delivery Lead Time</td>
                    {activeQuotes.map(q => {
                      const isFastest = q.id === fastestDeliveryQuoteId;
                      return (
                        <td 
                          key={q.id} 
                          className={`px-6 py-4 text-center border-l border-slate-150 dark:border-dark-800 ${
                            isFastest ? 'bg-blue-50/30 dark:bg-blue-950/10 text-blue-600 dark:text-blue-450 font-bold' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isFastest && <Clock className="w-3.5 h-3.5" />}
                            <span>{q.deliveryTimeDays} Business Days</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Summary Rows: Total Bid Price */}
                  <tr className="bg-slate-50/40 dark:bg-dark-950/45 font-bold">
                    <td className="px-6 py-4 text-slate-800 dark:text-dark-100">Total Bidded Cost</td>
                    {activeQuotes.map(q => {
                      const isCheapest = q.id === lowestPriceQuoteId;
                      return (
                        <td 
                          key={q.id} 
                          className={`px-6 py-4 text-center border-l border-slate-150 dark:border-dark-800 text-sm ${
                            isCheapest ? 'bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-450 font-bold' : 'text-slate-800 dark:text-dark-200'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 text-base">
                            {isCheapest && <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />}
                            <span>{formatIndianCurrency(q.totalCost)}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Remarks row */}
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-750 dark:text-dark-200">Quote Remarks</td>
                    {activeQuotes.map(q => (
                      <td key={q.id} className="px-6 py-4 text-center border-l border-slate-150 dark:border-dark-800 text-slate-500 dark:text-dark-450 italic">
                        "{q.remarks}"
                      </td>
                    ))}
                  </tr>

                  {/* Action row (only visible in quotes phase) */}
                  {activeRfq.status === 'Quotes Gathered' && (
                    <tr className="bg-slate-50/35 dark:bg-dark-950/15">
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-dark-300">Procurement Decision</td>
                      {activeQuotes.map(q => {
                        const isBest = q.id === bestDealQuoteId;
                        return (
                          <td key={q.id} className="px-6 py-4 text-center border-l border-slate-150 dark:border-dark-800">
                            <button
                              onClick={() => handleSelectBid(q.id)}
                              className={`px-4 py-2 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm ${
                                isBest 
                                  ? 'bg-brand-600 hover:bg-brand-500 text-white hover:shadow-brand-500/20' 
                                  : 'bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-750 dark:text-dark-300 hover:bg-slate-50 dark:hover:bg-dark-850'
                              }`}
                            >
                              Select {isBest ? 'Best Deal' : 'Quote'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Quotations;
