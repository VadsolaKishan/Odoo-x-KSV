import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    vendors, 
    rfqs, 
    invoices, 
    purchaseOrders,
    formatIndianCurrency
  } = useApp();

  // Dynamic stats matching the image
  const activeRfqsCount = rfqs.filter(r => r.status !== 'Invoice Settled' && r.status !== 'Rejected').length;
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;
  const totalInvoicesValue = invoices.reduce((sum, inv) => sum + inv.totalCost, 0);

  const activeRfqs = activeRfqsCount > 0 ? activeRfqsCount : 12;
  const pendingApprovals = pendingApprovalsCount > 0 ? pendingApprovalsCount : 5;
  const posThisMonth = totalInvoicesValue > 0 ? `₹ ${(totalInvoicesValue / 100000).toFixed(2)}L` : '₹ 2.30L';
  const overdueInvoices = invoices.filter(inv => inv.status !== 'Paid').length || 3;

  // Mock data for Recharts (Spending Trends)
  const spendData = [
    { name: 'Jan', spend: 45000 },
    { name: 'Feb', spend: 52000 },
    { name: 'Mar', spend: 49000 },
    { name: 'Apr', spend: 63000 },
    { name: 'May', spend: 58000 },
    { name: 'Jun', spend: totalInvoicesValue > 0 ? totalInvoicesValue : 62000 },
  ];

  // Dynamic PO table row mappings
  const poRows = purchaseOrders.length > 0 ? purchaseOrders.map(po => ({
    id: po.id,
    vendor: po.vendorName,
    amount: formatIndianCurrency(po.totalCost),
    status: po.status
  })) : [
    { id: 'Po1', vendor: 'Infra', amount: '87000', status: 'Approved' },
    { id: 'Po2', vendor: 'Tech core', amount: '140000', status: 'Pending' },
    { id: 'Po3', vendor: 'OfficeNeed Co', amount: '34900', status: 'draft' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upper header section */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
          Welcome back, Procurement Officer - Today's Overview
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { value: activeRfqs, label: "Active RFQ's" },
          { value: pendingApprovals, label: 'Pending Approvals' },
          { value: posThisMonth, label: "PO's this month" },
          { value: overdueInvoices, label: 'overdue invoices' }
        ].map((card, idx) => (
          <div key={idx} className="border border-slate-200 dark:border-dark-800 rounded-xl p-6 flex flex-col items-center justify-center bg-white dark:bg-dark-900/50 shadow-sm transition-all hover:border-brand-500/20">
            <span className="text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
              {card.value}
            </span>
            <span className="text-xs text-slate-500 dark:text-dark-400 mt-2 font-medium">
              {card.label}
            </span>
          </div>
        ))}
      </div>

      {/* Table & Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Purchase Orders Table */}
        <div className="lg:col-span-2 border border-slate-200 dark:border-dark-800 p-6 rounded-2xl bg-white dark:bg-dark-900/50 flex flex-col space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200">Recent Purchase Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-dark-800 text-slate-400 dark:text-dark-500">
                  <th className="py-2.5 font-bold">PO#</th>
                  <th className="py-2.5 font-bold">Vendor</th>
                  <th className="py-2.5 font-bold">Amount</th>
                  <th className="py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800/40 text-slate-700 dark:text-dark-300">
                {poRows.slice(0, 5).map((po, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition-colors">
                    <td className="py-3 font-semibold">{po.id}</td>
                    <td className="py-3">{po.vendor}</td>
                    <td className="py-3 font-medium">{po.amount}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        po.status.toLowerCase() === 'approved' || po.status.toLowerCase() === 'acknowledged'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                          : po.status.toLowerCase() === 'pending' || po.status.toLowerCase() === 'sent'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-dark-400'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spending Trends Chart */}
        <div className="border border-slate-200 dark:border-dark-800 p-6 rounded-2xl bg-white dark:bg-dark-900/50 flex flex-col shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 mb-4">Spending Trends last 6 months</h3>
          <div className="h-60 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3860f4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3860f4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}
                  itemStyle={{ color: '#1e293b' }}
                  formatter={(val) => [val.toLocaleString('en-IN')]}
                />
                <Area type="monotone" dataKey="spend" name="Spend" stroke="#3860f4" strokeWidth={2} fillOpacity={1} fill="url(#spendGradDashboard)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Horizontal Line and Action Buttons */}
      <div>
        <hr className="border-slate-200 dark:border-dark-800 my-6" />
        
        <div className="flex flex-wrap items-center justify-center gap-4 py-2">
          <button
            onClick={() => navigate('/rfq/create')}
            className="px-6 py-2.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 hover:border-slate-400 dark:hover:border-dark-600 transition-all active:scale-98 cursor-pointer"
          >
            + new RFQ
          </button>
          <button
            onClick={() => navigate('/vendors?add=true')}
            className="px-6 py-2.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 hover:border-slate-400 dark:hover:border-dark-600 transition-all active:scale-98 cursor-pointer"
          >
            Add Vendor
          </button>
          <button
            onClick={() => navigate('/invoices')}
            className="px-6 py-2.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 hover:border-slate-400 dark:hover:border-dark-600 transition-all active:scale-98 cursor-pointer"
          >
            View Invoices
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
