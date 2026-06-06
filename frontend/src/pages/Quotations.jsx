import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Quotations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { rfqs, quotations, selectQuoteForRfq, addToast, formatIndianCurrency } = useApp();

  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' or 'submit'

  // Submit Quotation states
  const [quotePrices, setQuotePrices] = useState({});
  const [quoteDeliveries, setQuoteDeliveries] = useState({});
  const [gstRate, setGstRate] = useState(18);
  const [terms, setTerms] = useState('Payment terms: 20 days net...');

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

  // Set default submit quote state values when selected RFQ changes
  const activeRfq = rfqs.find(r => r.id === selectedRfqId);
  const activeQuotes = quotations.filter(q => q.rfqId === selectedRfqId);

  useEffect(() => {
    if (activeRfq) {
      const initialPrices = {};
      const initialDeliveries = {};
      activeRfq.items.forEach((item, idx) => {
        initialPrices[idx] = idx === 0 ? 3500 : 8200;
        initialDeliveries[idx] = idx === 0 ? 7 : 14;
      });
      setQuotePrices(initialPrices);
      setQuoteDeliveries(initialDeliveries);
    }
  }, [selectedRfqId]);

  const handleRfqChange = (e) => {
    const rfqId = e.target.value;
    setSelectedRfqId(rfqId);
    setSearchParams({ rfqId });
  };

  // Find lowest price quote ID
  let lowestPriceQuoteId = null;
  if (activeQuotes.length > 0) {
    const sortedByPrice = [...activeQuotes].sort((a, b) => a.totalCost - b.totalCost);
    lowestPriceQuoteId = sortedByPrice[0].id;
  }

  // Handle select action
  const handleSelectBid = async (bidId) => {
    if (activeRfq) {
      await selectQuoteForRfq(activeRfq.id, bidId);
      navigate(`/rfq/${activeRfq.id}`);
    }
  };

  // Handle Submit Quote action
  const handleSubmitQuote = () => {
    addToast('Quotation submitted successfully!', 'success');
    setActiveTab('comparison');
  };

  // Calculations for Submit Quotation Form
  const subtotal = activeRfq
    ? activeRfq.items.reduce((sum, item, idx) => sum + item.quantity * (quotePrices[idx] || 0), 0)
    : 169500;
  const gstAmount = subtotal * (gstRate / 100);
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="space-y-6 text-xs text-slate-700 dark:text-dark-300">
      
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-800 pb-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
            Quotations
          </h1>
          <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
            Submit and compare quotation bids side-by-side
          </p>
        </div>

        {/* Tab Controls and RFQ selector */}
        <div className="flex flex-wrap items-center gap-3 select-none">
          <div className="flex rounded-lg border border-slate-200 dark:border-dark-800 p-0.5 bg-slate-50 dark:bg-dark-950">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-white dark:bg-dark-900 text-slate-900 dark:text-dark-100 shadow-sm'
                  : 'text-slate-500 dark:text-dark-400'
              }`}
            >
              Comparison Table
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-white dark:bg-dark-900 text-slate-900 dark:text-dark-100 shadow-sm'
                  : 'text-slate-500 dark:text-dark-400'
              }`}
            >
              Submit Quotation
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRfqId}
              onChange={handleRfqChange}
              className="px-3 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-dark-300 font-semibold"
            >
              <option value="">-- Select RFQ --</option>
              {rfqs.map(r => (
                <option key={r.id} value={r.id}>{r.id} - {r.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {(!selectedRfqId) ? (
        <div className="border border-slate-200 dark:border-dark-800 p-12 text-center rounded-2xl bg-white dark:bg-dark-900/40">
          <p className="text-slate-400 dark:text-dark-500">
            Please choose an RFQ from the dropdown list to proceed.
          </p>
        </div>
      ) : activeTab === 'submit' ? (
        
        /* ---------------- SUBMIT QUOTATION VIEW (SCREEN 6) ---------------- */
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-dark-100">Submit Quotations</h2>
            <p className="text-xs text-slate-450 dark:text-dark-500">
              RFQ: {activeRfq?.title || 'office furniture procurement q2'} - deadline {activeRfq?.deadline || '15 June 2025'}
            </p>
          </div>

          {/* RFQ Summary Box */}
          <div className="border border-slate-200 dark:border-dark-800 rounded-xl p-4 bg-white dark:bg-dark-900/50 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-500 uppercase tracking-wider mb-1">RFQ Summary</p>
            <p className="font-semibold text-slate-700 dark:text-dark-300">
              {activeRfq?.items.map(it => `${it.name} * ${it.quantity}`).join(', ') || 'Ergonomic chair * 25, standing desk * 10'} - category {activeRfq?.title.toLowerCase().includes('furniture') ? 'furniture' : 'hardware'}
            </p>
          </div>

          {/* Quotation Form Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-500 dark:text-dark-400">Your Quotation</h3>
            
            <div className="border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden bg-white dark:bg-dark-900/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-400 dark:text-dark-500">
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3 w-24 text-center">Qty</th>
                    <th className="px-6 py-3 w-36 text-center">Unit price</th>
                    <th className="px-6 py-3 w-36 text-center">Total</th>
                    <th className="px-6 py-3 w-36 text-center">Delivery (days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-750 dark:text-dark-300">
                  {activeRfq?.items.map((item, idx) => {
                    const price = quotePrices[idx] || 0;
                    const totalCost = item.quantity * price;
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-3 font-semibold">
                          {item.name || (idx === 0 ? 'Ergonomic chair' : 'Tech Core LTD')}
                        </td>
                        <td className="px-6 py-3 w-24 text-center font-bold">{item.quantity}</td>
                        <td className="px-6 py-2 w-36">
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => handleItemChange(idx, 'price', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 text-center bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg focus:outline-none focus:border-brand-500 text-slate-800 dark:text-dark-100"
                          />
                        </td>
                        <td className="px-6 py-3 w-36 text-center font-semibold">
                          {totalCost.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-2 w-36">
                          <input
                            type="number"
                            value={quoteDeliveries[idx] || 7}
                            onChange={(e) => handleItemChange(idx, 'delivery', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 text-center bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg focus:outline-none focus:border-brand-500 text-slate-800 dark:text-dark-100"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-dark-800 my-4" />

          {/* Form details and Totals block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Tax and Note inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400 mb-1.5">tax / GST %</label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(parseInt(e.target.value) || 0)}
                  className="w-48 px-3 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 dark:text-dark-100 font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400 mb-1.5">Note / terms</label>
                <textarea
                  rows={4}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 dark:text-dark-100 resize-none"
                  placeholder="e.g. Payment terms: 20 days net..."
                />
              </div>
            </div>

            {/* Totals Summary */}
            <div className="border border-slate-200 dark:border-dark-800 rounded-xl p-6 bg-white dark:bg-dark-900/50 shadow-sm flex flex-col justify-between max-w-md ml-auto w-full space-y-4">
              <div className="flex justify-between items-center py-1.5">
                <span className="font-semibold text-slate-500 dark:text-dark-450">Subtotal</span>
                <span className="font-semibold text-slate-850 dark:text-dark-100">{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between items-center py-1.5 border-t border-slate-100 dark:border-dark-850">
                <span className="font-semibold text-slate-500 dark:text-dark-450">GST ({gstRate}%)</span>
                <span className="font-semibold text-slate-850 dark:text-dark-100">{gstAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-t-2 border-slate-200 dark:border-dark-800">
                <span className="font-bold text-slate-700 dark:text-dark-200 text-sm">Grand total</span>
                <span className="font-bold text-slate-900 dark:text-dark-50 text-base">{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Action Buttons Stack */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-dark-800">
            <button
              onClick={handleSubmitQuote}
              className="px-6 py-2.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-800 dark:text-dark-200 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 hover:border-slate-400 dark:hover:border-dark-600 transition-all cursor-pointer"
            >
              Submit Quotation
            </button>
            <button
              onClick={() => {
                addToast('Draft saved successfully!', 'success');
                navigate('/dashboard');
              }}
              className="px-6 py-2.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-850 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 hover:border-slate-400 dark:hover:border-dark-600 transition-all cursor-pointer"
            >
              Save Draft
            </button>
          </div>

        </div>
      ) : (
        
        /* ---------------- COMPARISON MATRIX VIEW (SCREEN 7) ---------------- */
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-dark-100">Quotation Comparison</h2>
            <p className="text-xs text-slate-450 dark:text-dark-500">
              RFQ: {activeRfq?.title || 'office furniture procurement q2'} - {activeQuotes.length} quotations received
            </p>
          </div>

          {activeQuotes.length === 0 ? (
            <div className="border border-slate-200 dark:border-dark-800 p-12 text-center rounded-2xl bg-white dark:bg-dark-900/40">
              <p className="text-slate-400 dark:text-dark-500">No quotation bids have been submitted for this RFQ yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Matrix Table */}
              <div className="border border-slate-200 dark:border-dark-800 rounded-2xl overflow-hidden bg-white dark:bg-dark-900/50 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-500 dark:text-dark-400 text-xs">
                        <th className="px-6 py-4 text-left font-bold w-1/4">Criteria</th>
                        {activeQuotes.map(q => {
                          const isLowest = q.id === lowestPriceQuoteId;
                          return (
                            <th 
                              key={q.id} 
                              className={`px-6 py-4 font-bold border-l border-slate-200 dark:border-dark-800 ${
                                isLowest ? 'bg-emerald-600/90 text-white' : 'text-slate-800 dark:text-dark-200'
                              }`}
                            >
                              {q.vendorName} {isLowest && '(Lowest)'}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-dark-800 text-slate-700 dark:text-dark-300">
                      
                      {/* Grand Total */}
                      <tr className="font-semibold">
                        <td className="px-6 py-4 text-left font-bold text-slate-800 dark:text-dark-100">Grand Total</td>
                        {activeQuotes.map(q => {
                          const isLowest = q.id === lowestPriceQuoteId;
                          return (
                            <td 
                              key={q.id} 
                              className={`px-6 py-4 border-l border-slate-200 dark:border-dark-800 font-bold ${
                                isLowest ? 'bg-emerald-600/90 text-white' : ''
                              }`}
                            >
                              {q.totalCost.toLocaleString('en-IN')}
                            </td>
                          );
                        })}
                      </tr>

                      {/* GST */}
                      <tr>
                        <td className="px-6 py-4 text-left font-bold text-slate-650">GST %</td>
                        {activeQuotes.map(q => {
                          const isLowest = q.id === lowestPriceQuoteId;
                          return (
                            <td 
                              key={q.id} 
                              className={`px-6 py-4 border-l border-slate-200 dark:border-dark-800 font-medium ${
                                isLowest ? 'bg-emerald-600/90 text-white/95' : ''
                              }`}
                            >
                              18
                            </td>
                          );
                        })}
                      </tr>

                      {/* Delivery SLA */}
                      <tr>
                        <td className="px-6 py-4 text-left font-bold text-slate-650">Delivery (days)</td>
                        {activeQuotes.map(q => {
                          const isLowest = q.id === lowestPriceQuoteId;
                          return (
                            <td 
                              key={q.id} 
                              className={`px-6 py-4 border-l border-slate-200 dark:border-dark-800 font-medium ${
                                isLowest ? 'bg-emerald-600/90 text-white/95' : ''
                              }`}
                            >
                              {q.deliveryTimeDays}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Rating */}
                      <tr>
                        <td className="px-6 py-4 text-left font-bold text-slate-655">Vendor rating</td>
                        {activeQuotes.map(q => {
                          const isLowest = q.id === lowestPriceQuoteId;
                          // mock dynamic vendor rating if V-xxx records, otherwise fallback to 4.5/5
                          const rating = q.vendorId === 'V-001' ? '4.9/5' : q.vendorId === 'V-002' ? '4.6/5' : q.vendorId === 'V-003' ? '4.2/5' : '4.5/5';
                          return (
                            <td 
                              key={q.id} 
                              className={`px-6 py-4 border-l border-slate-200 dark:border-dark-800 font-semibold ${
                                isLowest ? 'bg-emerald-600/90 text-white/95' : ''
                              }`}
                            >
                              {rating}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Payment Terms */}
                      <tr>
                        <td className="px-6 py-4 text-left font-bold text-slate-650">Payment terms</td>
                        {activeQuotes.map(q => {
                          const isLowest = q.id === lowestPriceQuoteId;
                          const paymentTerms = q.remarks.toLowerCase().includes('3-year') || q.vendorId === 'V-001' || q.vendorId === 'V-002' ? '30 days' : '15 days';
                          return (
                            <td 
                              key={q.id} 
                              className={`px-6 py-4 border-l border-slate-200 dark:border-dark-800 ${
                                isLowest ? 'bg-emerald-600/90 text-white/95' : ''
                              }`}
                            >
                              {paymentTerms}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Action Select buttons */}
                      <tr className="bg-slate-50/50 dark:bg-dark-950/20">
                        <td className="px-6 py-4 text-left font-bold text-slate-750 dark:text-dark-250">Action</td>
                        {activeQuotes.map(q => {
                          const isLowest = q.id === lowestPriceQuoteId;
                          return (
                            <td 
                              key={q.id} 
                              className={`px-6 py-4 border-l border-slate-200 dark:border-dark-800 ${
                                isLowest ? 'bg-emerald-600/90' : ''
                              }`}
                            >
                              {isLowest ? (
                                <button
                                  onClick={() => handleSelectBid(q.id)}
                                  className="w-full py-2 bg-white text-emerald-700 rounded-xl font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer border border-white"
                                >
                                  Select & Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSelectBid(q.id)}
                                  className="w-full py-2 bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-350 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 active:scale-95 transition-all cursor-pointer"
                                >
                                  Select
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note / Caption below */}
              <div className="py-2 text-[10px] font-semibold text-rose-500 dark:text-rose-400">
                Green = lowest price, selecting vendor initiates the approval workflow.
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );

  // Price/Delivery Input Handler inside table cell
  function handleItemChange(index, field, value) {
    if (field === 'price') {
      setQuotePrices((prev) => ({ ...prev, [index]: value }));
    } else if (field === 'delivery') {
      setQuoteDeliveries((prev) => ({ ...prev, [index]: value }));
    }
  }
};

export default Quotations;
