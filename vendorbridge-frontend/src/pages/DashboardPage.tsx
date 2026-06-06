import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import api from '../lib/axios';
import { 
  FileText, 
  Clock, 
  ShoppingCart, 
  AlertCircle, 
  Plus, 
  Building2, 
  Receipt,
  ArrowRight,
  TrendingUp,
  ClipboardList,
  CheckSquare,
  Star,
  ShieldCheck,
  ShieldAlert,
  Building
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  // Profile Query (to get latest vendor details if user is vendor)
  const { data: profileRes, isLoading: loadingProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
    enabled: !!user,
    gcTime: 0,
    staleTime: 0
  });

  const vendorProfile = profileRes?.data?.vendor;

  // Queries
  const { data: summaryRes, isLoading: loadingSummary, error: summaryError } = useQuery({
    queryKey: ['dashboardSummary', user?.id],
    queryFn: async () => {
      const res = await api.get('/reports/summary');
      return res.data;
    },
    enabled: !!user && user.role !== 'vendor',
    gcTime: 0,
    staleTime: 0
  });

  const { data: spendRes, isLoading: loadingSpend, error: spendError } = useQuery({
    queryKey: ['dashboardSpend', user?.id],
    queryFn: async () => {
      const res = await api.get('/reports/monthly-spend');
      return res.data;
    },
    enabled: !!user && user.role !== 'vendor',
    gcTime: 0,
    staleTime: 0
  });

  const { data: posRes, isLoading: loadingPos, error: posError } = useQuery({
    queryKey: ['dashboardPOs', user?.id],
    queryFn: async () => {
      const res = await api.get('/purchase-orders?limit=5');
      return res.data;
    },
    enabled: !!user,
    gcTime: 0,
    staleTime: 0
  });

  // Formatting helpers
  const formatLakhs = (val: number) => {
    // 1 Lakh = 100,000. E.g. 230000 -> ₹2.3L
    return `₹${(val / 100000).toFixed(1)}L`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Status badges formatter
  const getStatusBadge = (status: string) => {
    const norm = status.toLowerCase();
    let borderClass = 'bg-white/5 text-white border-white/10';
    
    if (norm === 'generated') {
      borderClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    } else if (norm === 'sent') {
      borderClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    } else if (norm === 'acknowledged') {
      borderClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (norm === 'completed' || norm === 'approved') {
      borderClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (norm === 'cancelled' || norm === 'rejected') {
      borderClass = 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    
    const displayText = norm === 'completed' ? 'Completed' : norm === 'approved' ? 'Approved' : status.replace('_', ' ');

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${borderClass}`}>
        {displayText}
      </span>
    );
  };

  // Fallback data mapping
  const summary = summaryRes?.data || {
    total_spend: 0,
    active_vendors: 0,
    po_fulfillment_rate: 0,
    overdue_invoices: 0,
    active_rfqs: 0,
    pending_approvals: 0,
    month: ''
  };

  // Make sure we have numbers or fallback values
  const activeRFQsCount = summary.active_rfqs ?? 0;
  const pendingApprovalsCount = summary.pending_approvals ?? 0;
  const overdueInvoicesCount = summary.overdue_invoices ?? 0;
  const totalSpendFormatted = formatLakhs(summary.total_spend ?? 0);

  const spendData = spendRes?.data && spendRes.data.length > 0 
    ? spendRes.data.map((item: any) => ({
        ...item,
        // Ensure values are numbers
        amount: Number(item.amount)
      }))
    : [];

  const purchaseOrders = posRes?.data || [];

  return (
    <MainLayout>
      
      {/* Welcome Title */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome back, {user ? `${user.first_name}` : 'User'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {user?.role === 'vendor'
              ? 'View your active RFQs, submit competitive quotations, and track purchase orders.'
              : 'Here is a summary of your procurement pipelines today.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider text-text-secondary">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse"></div>
          LIVE ENVIRONMENT
        </div>
      </div>

      {/* Vendor Profile Status & Rating Section */}
      {user?.role === 'vendor' && (
        loadingProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-xl border border-white/5 h-24 w-full"></div>
            ))}
          </div>
        ) : vendorProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Status Card */}
            <div className="glass-card rounded-xl p-6 border border-white/5 flex items-center justify-between">
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Profile Verification
                </span>
                <div className="flex items-center gap-3 pt-1">
                  {vendorProfile.status === 'active' && (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Active / Verified</span>
                        <span className="text-[10px] text-emerald-400 font-medium">Eligible to submit bids</span>
                      </div>
                    </>
                  )}
                  {vendorProfile.status === 'pending' && (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 animate-pulse">
                        <Clock className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Pending Verification</span>
                        <span className="text-[10px] text-amber-500 font-medium">Under review by officer/admin</span>
                      </div>
                    </>
                  )}
                  {vendorProfile.status === 'blocked' && (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                        <ShieldAlert className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-red-400 block">Suspended / Blocked</span>
                        <span className="text-[10px] text-red-400/80 font-medium">Bidding restricted</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Card */}
            <div className="glass-card rounded-xl p-6 border border-white/5 flex items-center justify-between">
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Your Performance Rating
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-3xl font-extrabold text-white">
                    {Number(vendorProfile.rating || 0).toFixed(2)}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const val = Number(vendorProfile.rating || 0);
                        return (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(val)
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-white/10'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-text-secondary mt-0.5">Calculated average rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="glass-card rounded-xl p-6 border border-white/5 flex items-center justify-between">
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Company Registration
                </span>
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shrink-0">
                    <Building className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">{vendorProfile.name}</span>
                    <span className="text-[10px] text-text-secondary block">GSTIN: <span className="font-semibold text-white/80">{vendorProfile.gst_number}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-xl p-6 border border-amber-500/20 text-center mb-8">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Please complete your vendor profile setup.</p>
          </div>
        )
      )}

      {/* Stats Cards (4 cards, grid-cols-4) */}
      {user?.role !== 'vendor' && (
        loadingSummary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-xl border border-white/5 p-6 h-28 w-full"></div>
            ))}
          </div>
        ) : summaryError ? (
          <div className="glass-card rounded-xl p-6 border border-red-500/20 text-center mb-8">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Error loading summary metrics. Showing cached fallback registers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Card 1: Active RFQs */}
            <div 
              onClick={() => navigate('/rfqs')}
              className="glass-card rounded-xl p-6 flex items-center justify-between border-l-4 border-l-blue-500 hover:border-l-blue-400 hover:shadow-card hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
            >
              <div>
                <span className="text-2xl font-bold text-text-primary tracking-tight">{activeRFQsCount}</span>
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mt-1">
                  Active RFQ's
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-sm shadow-blue-500/10">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Pending Approvals */}
            <div 
              onClick={() => navigate('/approvals')}
              className="glass-card rounded-xl p-6 flex items-center justify-between border-l-4 border-l-amber-500 hover:border-l-amber-400 hover:shadow-card hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
            >
              <div>
                <span className="text-2xl font-bold text-text-primary tracking-tight">{pendingApprovalsCount}</span>
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mt-1">
                  Pending Approvals
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shadow-sm shadow-amber-500/10">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: POs This Month */}
            <div 
              onClick={() => navigate('/purchase-orders')}
              className="glass-card rounded-xl p-6 flex items-center justify-between border-l-4 border-l-brand-green hover:border-l-brand-green-dark hover:shadow-card hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
            >
              <div>
                <span className="text-2xl font-bold text-text-primary tracking-tight">{totalSpendFormatted}</span>
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mt-1">
                  PO's this month
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20 text-brand-green shadow-glow">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Overdue Invoices */}
            <div 
              onClick={() => navigate('/invoices')}
              className="glass-card rounded-xl p-6 flex items-center justify-between border-l-4 border-l-red-500 hover:border-l-red-400 hover:shadow-card hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
            >
              <div>
                <span className="text-2xl font-bold text-text-primary tracking-tight">{overdueInvoicesCount}</span>
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mt-1">
                  overdue invoices
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 shadow-sm shadow-red-500/10">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

          </div>
        )
      )}

      {/* Main Grid: Purchase Orders Table + Spending Trends Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left Side: Recent Purchase Orders Table */}
        <div className={`${user?.role === 'vendor' ? 'lg:col-span-12' : 'lg:col-span-7'} glass-card rounded-xl p-6 flex flex-col justify-between border border-white/5`}>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-green" /> Recent Purchase Orders
              </h2>
              <span className="text-xs text-text-secondary">Last 5 generated</span>
            </div>

            {loadingPos ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-white/5 rounded-lg w-full animate-pulse"></div>
                ))}
              </div>
            ) : posError ? (
              <p className="text-xs text-text-secondary py-4 text-center">Failed to load purchase orders.</p>
            ) : purchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <ShoppingCart className="w-8 h-8 text-white/10" />
                <p className="text-sm text-text-secondary">No purchase orders yet</p>
                <p className="text-xs text-white/30">Purchase orders will appear here once generated</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-subtle text-text-secondary text-xs uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">PO#</th>
                      <th className="py-3 px-4 font-semibold">Vendor</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/50">
                    {purchaseOrders.map((po: any) => (
                      <tr 
                        key={po.id} 
                        className="hover:bg-brand-green/[0.03] text-sm text-text-primary transition-colors cursor-pointer group"
                        onClick={() => navigate(`/purchase-orders`)}
                      >
                        <td className="py-3.5 px-4 font-semibold text-text-primary group-hover:text-brand-green transition-colors">
                          {po.po_number}
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary">
                          {po.vendor_name}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium">
                          {formatCurrency(Number(po.grand_total))}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(po.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-subtle mt-4 text-right">
            <Link to="/purchase-orders" className="text-xs font-semibold text-brand-green hover:underline inline-flex items-center gap-1">
              View All Purchase Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Spending Trends Bar Chart */}
        {user?.role !== 'vendor' && (
          <div className="lg:col-span-5 glass-card rounded-xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-green" /> Spending Trend
              </h2>
              <span className="text-xs text-text-secondary">Amount in Lakhs (₹)</span>
            </div>

            {loadingSpend ? (
              <div className="animate-pulse bg-white/5 rounded-xl h-72 w-full"></div>
            ) : spendError ? (
              <p className="text-xs text-text-secondary py-4 text-center">Failed to load monthly spend analytics.</p>
            ) : spendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 gap-2">
                <TrendingUp className="w-8 h-8 text-white/10" />
                <p className="text-sm text-text-secondary">No spend data available yet</p>
                <p className="text-xs text-white/30">Data will appear once invoices are created</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height={288}>
                  <BarChart data={spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke={theme === 'dark' ? '#e2e8f0' : '#475569'} 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke={theme === 'dark' ? '#e2e8f0' : '#475569'} 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: theme === 'dark' ? '#111917' : '#ffffff', 
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }} 
                      itemStyle={{
                        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        fontSize: '12px'
                      }}
                      labelStyle={{
                        color: theme === 'dark' ? '#94a3b8' : '#475569',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}
                      formatter={(v: any) => [formatCurrency(Number(v)), 'Monthly Spend']}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {spendData.map((_entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill="#10b981" 
                          className="transition-colors duration-200 cursor-pointer"
                          style={{ outline: 'none' }}
                          onMouseEnter={(e: any) => {
                            if (e.target) e.target.style.fill = '#059669';
                          }}
                          onMouseLeave={(e: any) => {
                            if (e.target) e.target.style.fill = '#10b981';
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Quick Action Buttons (bottom) */}
      <div className="glass-card rounded-xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          {user?.role === 'vendor' ? (
            <>
              {/* Action 1: View RFQs */}
              <button
                onClick={() => navigate('/rfqs')}
                className="flex items-center gap-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/30 px-5 py-3 rounded-lg text-sm font-semibold shadow-glow hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-200"
              >
                <ClipboardList className="w-4.5 h-4.5" /> View RFQ's
              </button>

              {/* Action 2: View Quotations */}
              <button
                onClick={() => navigate('/quotations')}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                <FileText className="w-4.5 h-4.5 text-text-secondary" /> Submit Quotations
              </button>

              {/* Action 3: View Invoices */}
              <button
                onClick={() => navigate('/invoices')}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                <Receipt className="w-4.5 h-4.5 text-text-secondary" /> view Invoices
              </button>
            </>
          ) : (
            <>
              {/* Action 1: Create RFQ */}
              {(user?.role === 'admin' || user?.role === 'procurement_officer') && (
                <button
                  onClick={() => navigate('/rfqs/new')}
                  className="flex items-center gap-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/30 px-5 py-3 rounded-lg text-sm font-semibold shadow-glow hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-200"
                >
                  <Plus className="w-4.5 h-4.5" /> + new RFQ
                </button>
              )}

              {/* Action 2: Add Vendor */}
              {(user?.role === 'admin' || user?.role === 'procurement_officer') && (
                <button
                  onClick={() => navigate('/vendors?openAddModal=true')}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  <Building2 className="w-4.5 h-4.5 text-text-secondary" /> Add Vendor
                </button>
              )}

              {/* Action 3: Manage Approvals */}
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={() => navigate('/approvals')}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  <CheckSquare className="w-4.5 h-4.5 text-text-secondary" /> Manage Approvals
                </button>
              )}

              {/* Action 4: View Invoices */}
              <button
                onClick={() => navigate('/invoices')}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                <Receipt className="w-4.5 h-4.5 text-text-secondary" /> view Invoices
              </button>
            </>
          )}
        </div>
      </div>

    </MainLayout>
  );
}
