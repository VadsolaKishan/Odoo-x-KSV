import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { FileText, Clock, TrendingUp, AlertCircle, Plus, Users, Eye } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    vendors,
    rfqs,
    invoices,
    purchaseOrders,
    formatIndianCurrency
  } = useApp();

  const activeRfqsCount = rfqs.filter(r => r.status !== 'Invoice Settled' && r.status !== 'Rejected').length;
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;
  const totalInvoicesValue = invoices.reduce((sum, inv) => sum + inv.totalCost, 0);

  const activeRfqs = activeRfqsCount > 0 ? activeRfqsCount : 12;
  const pendingApprovals = pendingApprovalsCount > 0 ? pendingApprovalsCount : 5;
  const posThisMonth = totalInvoicesValue > 0 ? `₹ ${(totalInvoicesValue / 100000).toFixed(2)}L` : '₹ 2.30L';
  const overdueInvoices = invoices.filter(inv => inv.status !== 'Paid').length || 3;

  const spendData = [
    { name: 'Jan', spend: 45000 },
    { name: 'Feb', spend: 52000 },
    { name: 'Mar', spend: 49000 },
    { name: 'Apr', spend: 63000 },
    { name: 'May', spend: 58000 },
    { name: 'Jun', spend: totalInvoicesValue > 0 ? totalInvoicesValue : 62000 },
  ];

  const poRows = purchaseOrders.length > 0 ? purchaseOrders.map(po => ({
    id: po.id,
    vendor: po.vendorName,
    amount: formatIndianCurrency(po.totalCost),
    status: po.status
  })) : [
    { id: 'Po1', vendor: 'Infra Supplies', amount: '₹87,000', status: 'Approved' },
    { id: 'Po2', vendor: 'Tech Core Ltd', amount: '₹1,40,000', status: 'Pending' },
    { id: 'Po3', vendor: 'OfficeNeed Co', amount: '₹34,900', status: 'Sent' }
  ];

  const kpiCards = [
    {
      value: activeRfqs,
      label: "Active RFQ's",
      icon: FileText,
      iconBg: 'bg-brand-50 dark:bg-brand-950/20',
      iconColor: 'text-brand-600 dark:text-brand-400',
      trend: '+2 this week',
      trendPositive: true,
    },
    {
      value: pendingApprovals,
      label: 'Pending Approvals',
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      trend: 'Needs attention',
      trendPositive: false,
    },
    {
      value: posThisMonth,
      label: "PO's This Month",
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 'On target',
      trendPositive: true,
    },
    {
      value: overdueInvoices,
      label: 'Overdue Invoices',
      icon: AlertCircle,
      iconBg: 'bg-rose-50 dark:bg-rose-950/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      trend: 'Review needed',
      trendPositive: false,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium mt-1">
            Welcome back — here's your procurement overview
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => navigate('/rfq/create')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-3.5 h-3.5" /> New RFQ
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl p-5 flex flex-col shadow-premium-sm hover-glow-card cursor-default"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <Icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  card.trendPositive
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                }`}>
                  {card.trend}
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
                  {card.value}
                </span>
                <p className="text-xs text-slate-500 dark:text-neutral-500 font-medium mt-1">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table & Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Purchase Orders Table */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl shadow-premium-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-950/10">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Recent Purchase Orders</h3>
            <button
              onClick={() => navigate('/purchase-orders')}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-neutral-800/60 text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 font-bold">
                  <th className="px-6 py-3.5">PO #</th>
                  <th className="px-6 py-3.5">Vendor</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40 text-slate-700 dark:text-neutral-300">
                {poRows.slice(0, 5).map((po, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-neutral-850/20 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-800 dark:text-neutral-200 text-[11px]">{po.id}</td>
                    <td className="px-6 py-3.5 font-medium">{po.vendor}</td>
                    <td className="px-6 py-3.5 font-semibold">{po.amount}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={po.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spending Trends Chart */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl shadow-premium-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-950/10">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Spending Trends</h3>
            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">Last 6 months overview</p>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3860f4" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#3860f4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.97)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 4px 16px -4px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ color: '#1e293b' }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spend']}
                />
                <Area type="monotone" dataKey="spend" name="Spend" stroke="#3860f4" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGradDashboard)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="border-t border-slate-200 dark:border-neutral-800 pt-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/rfq/create')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 hover:text-slate-900 dark:hover:text-neutral-100 hover-glow-button transition-all shadow-premium-sm"
          >
            <Plus className="w-3.5 h-3.5 text-brand-500" /> New RFQ
          </button>
          <button
            onClick={() => navigate('/vendors?add=true')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 hover:text-slate-900 dark:hover:text-neutral-100 hover-glow-button transition-all shadow-premium-sm"
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" /> Add Vendor
          </button>
          <button
            onClick={() => navigate('/invoices')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 hover:text-slate-900 dark:hover:text-neutral-100 hover-glow-button transition-all shadow-premium-sm"
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" /> View Invoices
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
