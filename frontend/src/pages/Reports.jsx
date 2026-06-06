import React from 'react';
import { useApp } from '../context/AppContext';

export const Reports = () => {
  const { invoices } = useApp();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
            Reports & analytics
          </h1>
          <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
            Procurement Insights- may 2025
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-xs font-bold bg-transparent border border-slate-350 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg hover:border-slate-400 dark:hover:border-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all select-none">
            May 2025
          </button>
          <button 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ totalSpend: "12.4L", activeVendors: 28, poFulfillment: "94%", overdueInvoices: 3 }, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `procurement_insights_may_2025.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-4 py-2 text-xs font-bold bg-transparent border border-slate-350 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg hover:border-slate-400 dark:hover:border-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all select-none"
          >
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="border border-slate-250 dark:border-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-transparent">
          <span className="text-3xl font-display font-extrabold text-blue-600 dark:text-blue-400">12.4 L</span>
          <span className="text-xs font-semibold text-blue-500/95 dark:text-blue-400/90 mt-2 uppercase tracking-wider">total spend</span>
        </div>
        
        {/* Active Vendors */}
        <div className="border border-slate-250 dark:border-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-transparent">
          <span className="text-3xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">28</span>
          <span className="text-xs font-semibold text-emerald-500/95 dark:text-emerald-400/90 mt-2 uppercase tracking-wider">Active vendors</span>
        </div>
        
        {/* PO Fulfillment */}
        <div className="border border-slate-250 dark:border-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-transparent">
          <span className="text-3xl font-display font-extrabold text-amber-600 dark:text-amber-500">94%</span>
          <span className="text-xs font-semibold text-amber-500/95 dark:text-amber-500/90 mt-2 uppercase tracking-wider">PO Fulfillment</span>
        </div>
        
        {/* Overdue Invoices */}
        <div className="border border-slate-250 dark:border-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-transparent">
          <span className="text-3xl font-display font-extrabold text-rose-600 dark:text-rose-400">3</span>
          <span className="text-xs font-semibold text-rose-500/95 dark:text-rose-400/90 mt-2 uppercase tracking-wider">overdue invoices</span>
        </div>
      </div>

      {/* Main Charts & Breakdown Container */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-850 rounded-2xl shadow-premium dark:shadow-neutral-premium p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Spend by Category */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xs font-bold text-slate-550 dark:text-neutral-400 uppercase tracking-wider">
              SPEND BY CATEGORY
            </h3>
            
            <div className="space-y-5">
              {/* IT Hardware */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-neutral-200">
                  <span>IT Hardware</span>
                  <span>₹4.8L</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              {/* Furniture */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-neutral-200">
                  <span>Furniture</span>
                  <span>₹3.2L</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>

              {/* Stationery */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-neutral-200">
                  <span>Stationery</span>
                  <span>₹2.1L</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#ebd8ac] dark:bg-[#d0bd92] h-full rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>

              {/* Logistics */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-neutral-200">
                  <span>Logistics</span>
                  <span>₹2.3L</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '36%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Top Vendors & Monthly Trend */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Vendors widget */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-550 dark:text-neutral-400 uppercase tracking-wider">
                TOP VENDORS BY SPEND
              </h3>
              
              <div className="overflow-hidden border border-slate-150 dark:border-neutral-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-neutral-850 text-slate-500 dark:text-neutral-400 font-bold border-b border-slate-150 dark:border-neutral-800">
                    <tr>
                      <th className="px-4 py-2.5">Vendor</th>
                      <th className="px-4 py-2.5 text-right">Spend (₹)</th>
                      <th className="px-4 py-2.5 text-right">POs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-neutral-800 text-slate-700 dark:text-neutral-250 font-semibold">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-neutral-850/30">
                      <td className="px-4 py-3">TechCore Ltd</td>
                      <td className="px-4 py-3 text-right">4,20,000</td>
                      <td className="px-4 py-3 text-right">6</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-neutral-850/30">
                      <td className="px-4 py-3">Infra Supplies</td>
                      <td className="px-4 py-3 text-right">3,10,000</td>
                      <td className="px-4 py-3 text-right">4</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-neutral-850/30">
                      <td className="px-4 py-3">FastLog</td>
                      <td className="px-4 py-3 text-right">1,90,000</td>
                      <td className="px-4 py-3 text-right">3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Trend widget */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-550 dark:text-neutral-400 uppercase tracking-wider">
                MONTHLY TREND
              </h3>
              
              <div className="border border-slate-150 dark:border-neutral-800 rounded-xl p-4">
                <div className="flex items-end justify-between h-32 px-4 pt-4">
                  {/* Dec */}
                  <div className="flex flex-col items-center gap-2 w-8">
                    <div className="w-5 bg-blue-200 dark:bg-blue-900/40 rounded-t-sm" style={{ height: '30%' }}></div>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold">Dec</span>
                  </div>
                  {/* Jan */}
                  <div className="flex flex-col items-center gap-2 w-8">
                    <div className="w-5 bg-blue-200 dark:bg-blue-900/40 rounded-t-sm" style={{ height: '50%' }}></div>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold">Jan</span>
                  </div>
                  {/* Feb */}
                  <div className="flex flex-col items-center gap-2 w-8">
                    <div className="w-5 bg-blue-200 dark:bg-blue-900/40 rounded-t-sm" style={{ height: '40%' }}></div>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold">Feb</span>
                  </div>
                  {/* Mar */}
                  <div className="flex flex-col items-center gap-2 w-8">
                    <div className="w-5 bg-blue-200 dark:bg-blue-900/40 rounded-t-sm" style={{ height: '70%' }}></div>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold">Mar</span>
                  </div>
                  {/* Apr */}
                  <div className="flex flex-col items-center gap-2 w-8">
                    <div className="w-5 bg-blue-200 dark:bg-blue-900/40 rounded-t-sm" style={{ height: '60%' }}></div>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold">Apr</span>
                  </div>
                  {/* May */}
                  <div className="flex flex-col items-center gap-2 w-8">
                    <div className="w-5 bg-blue-600 dark:bg-blue-500 rounded-t-sm" style={{ height: '85%' }}></div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">May</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Reports;
