import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileCheck, 
  ClipboardList, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  UserPlus, 
  ChevronRight, 
  RefreshCw,
  ShoppingBag,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    vendors, 
    rfqs, 
    invoices, 
    activityFeed, 
    addToast,
    formatIndianCurrency
  } = useApp();

  // Stats values
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;
  const activeRfqsCount = rfqs.filter(r => r.status !== 'Invoice Settled' && r.status !== 'Rejected').length;
  const totalVendorsCount = vendors.length;
  const totalInvoicesValue = invoices.reduce((sum, inv) => sum + inv.totalCost, 0);

  // Mock data for Recharts (Spending Trends)
  const spendData = [
    { name: 'Jan', spend: 45000, savings: 5000 },
    { name: 'Feb', spend: 52000, savings: 8000 },
    { name: 'Mar', spend: 49000, savings: 6000 },
    { name: 'Apr', spend: 63000, savings: 12000 },
    { name: 'May', spend: 58000, savings: 9500 },
    { name: 'Jun', spend: totalInvoicesValue > 0 ? totalInvoicesValue : 62000, savings: 14000 },
  ];

  // Vendor Performance mock chart data
  const vendorPerformanceData = vendors.map(v => ({
    name: v.name.split(' ')[0], // first word for space
    rating: v.rating,
  })).slice(0, 5);

  // One-click Reorder Action
  const handleReorder = (rfqId) => {
    addToast(`Reordering RFQ details fetched! Redirecting to setup...`, 'info');
    navigate(`/rfq/create?reorderId=${rfqId}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
            Procurement Central
          </h1>
          <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
            Real-time analytics and management operations dashboard.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/vendors?add=true')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-all active:scale-98 shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-slate-500 dark:text-dark-400" />
            <span>Add Vendor</span>
          </button>
          <button
            onClick={() => navigate('/rfq/create')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/10 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create RFQ</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Pending Approvals"
          value={pendingApprovalsCount}
          trend={pendingApprovalsCount > 0 ? `${pendingApprovalsCount} action required` : 'Clear'}
          trendType={pendingApprovalsCount > 0 ? 'negative' : 'positive'}
          icon={FileCheck}
          onClick={() => navigate('/approvals')}
        />
        <Card
          title="Active RFQs"
          value={activeRfqsCount}
          trend="+2 this week"
          trendType="positive"
          icon={ClipboardList}
          onClick={() => navigate('/dashboard')}
        />
        <Card
          title="Total Vendors"
          value={totalVendorsCount}
          trend="98% Active rate"
          trendType="positive"
          icon={Users}
          onClick={() => navigate('/vendors')}
        />
        <Card
          title="Total Spending"
          value={formatIndianCurrency(totalInvoicesValue)}
          trend="+15.3% MoM"
          trendType="neutral"
          icon={CreditCard}
          onClick={() => navigate('/invoices')}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Spending Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200">Spending & Savings Trends</h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" /> High efficiency
            </span>
          </div>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3860f4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3860f4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#1e293b' }}
                  formatter={(val) => [formatIndianCurrency(val)]}
                />
                <Area type="monotone" dataKey="spend" name="Spend" stroke="#3860f4" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGrad)" />
                <Area type="monotone" dataKey="savings" name="Savings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor rating performance bar chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 mb-4">Vendor Ratings Performance</h3>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="rating" name="Rating (1-5)" fill="#5b84ff" radius={[8, 8, 0, 0]}>
                  {vendorPerformanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.rating >= 4.5 ? '#10b981' : entry.rating >= 4.0 ? '#3860f4' : '#f59e0b'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: Previous RFQs & Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent RFQs + One Click Reorder List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-brand-500" />
              <span>Active RFQs Tracker</span>
            </h3>
            <button 
              onClick={() => navigate('/rfq/create')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
            >
              Setup new <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-150 dark:divide-dark-800/60 overflow-hidden">
            {rfqs.slice(0, 3).map((rfq) => (
              <div key={rfq.id} className="py-3.5 flex items-center justify-between gap-4 group">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      onClick={() => navigate(`/rfq/${rfq.id}`)}
                      className="text-xs font-bold text-slate-800 dark:text-dark-200 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors truncate"
                    >
                      {rfq.title}
                    </span>
                    <StatusBadge status={rfq.status} />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-dark-500">
                    ID: {rfq.id} • Deadline: {rfq.deadline} • {rfq.items.length} items catalogued
                  </p>
                </div>
                
                {/* One Click Reorder Button */}
                <button
                  onClick={() => handleReorder(rfq.id)}
                  title="Copy items and create new RFQ"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-dark-800 text-slate-600 dark:text-dark-450 rounded-lg bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-850 hover:text-slate-800 dark:hover:text-dark-200 shadow-sm transition-all whitespace-nowrap active:scale-95"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reorder</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-brand-500" />
            <span>Activity Feed</span>
          </h3>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-2">
            {activityFeed.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-dark-500 text-center py-6">No recent actions.</p>
            ) : (
              activityFeed.slice(0, 5).map((act) => (
                <div key={act.id} className="flex gap-3 text-xs leading-normal">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-dark-300 font-medium">{act.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-dark-500">
                      <span className="font-semibold">{act.user}</span>
                      <span>•</span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
