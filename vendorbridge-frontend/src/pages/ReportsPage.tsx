import { useState, useEffect } from 'react';
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
import { 
  Download, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertCircle,
  Calendar,
  Trophy,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../lib/axios';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import toast from 'react-hot-toast';

interface ReportSummary {
  total_spend: number;
  active_vendors: number;
  po_fulfillment_rate: number;
  overdue_invoices: number;
  month: string;
}

interface SpendTrend {
  month: string;
  amount: number;
}

interface VendorPerf {
  id: string;
  name: string;
  rating: number;
  po_count: number;
  total_spend: number;
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  // API State
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [spendData, setSpendData] = useState<SpendTrend[]>([]);
  const [vendorPerf, setVendorPerf] = useState<VendorPerf[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Check authorization role (Summary is restricted to admin/manager on backend)
  const isAuthorized = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'procurement_officer';

  // Load Reports Data
  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        // 1. Fetch Summary (only if authorized)
        if (isAuthorized) {
          const summaryRes = await api.get('/reports/summary');
          if (summaryRes.data && summaryRes.data.success) {
            setSummary(summaryRes.data.data);
            setSelectedMonth(summaryRes.data.data.month);
          }
        } else {
          setSummary(null);
          setSelectedMonth('');
        }

        // 2. Fetch Monthly Spend
        const spendRes = await api.get('/reports/monthly-spend');
        if (spendRes.data && spendRes.data.success) {
          setSpendData(spendRes.data.data || []);
        }

        // 3. Fetch Vendor Performance
        const perfRes = await api.get('/reports/vendor-performance');
        if (perfRes.data && perfRes.data.success) {
          setVendorPerf(perfRes.data.data || []);
        }
      } catch (err: any) {
        console.error('Failed to load reports analytics data', err);
        toast.error('Failed to load analytics details.');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [isAuthorized]);

  // Export CSV Helper
  const handleExportCSV = () => {
    if (vendorPerf.length === 0) {
      toast.error('No vendor performance data available to export');
      return;
    }
    
    // Map data for export
    const exportData = vendorPerf.map((v, index) => ({
      Rank: index + 1,
      Name: v.name,
      POs: v.po_count,
      TotalSpend: v.total_spend,
      Rating: v.rating.toFixed(2)
    }));

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `vendor_performance_report_${new Date().toISOString().split('T')[0]}.csv`; 
    a.click();
    toast.success('Report exported successfully!');
  };

  // Format Lakhs (₹1.2L = 120000)
  const formatLakhs = (val: number) => {
    return `₹${(val / 100000).toFixed(1)}L`;
  };

  // Format Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Static options for month select dropdown
  const monthOptions = [
    'June 2026', 'May 2026', 'April 2026', 'March 2026', 'February 2026', 'January 2026'
  ];

  return (
    <MainLayout>
      
      {/* Top Header section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Reports & Analytics</h1>
          {summary && (
            <p className="text-text-secondary text-sm mt-1">Procurement Insights — {selectedMonth}</p>
          )}
        </div>

        {/* Date Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field py-2 pl-10 pr-8 text-xs font-semibold select-custom bg-black/40 border border-white/10 text-white rounded-lg"
            >
              {monthOptions.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={loading || vendorPerf.length === 0}
            className="h-10 px-4 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-glow hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {!isAuthorized && (
        <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>You are logged in as a Vendor. Billing summary and ledger stats are restricted to Procurement Officers and Managers.</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
          <p className="text-sm text-text-secondary">Generating analytical summaries...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* STATS ROW (4 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summary && (
              <>
                {/* Spend Card */}
                <div className="glass-card rounded-xl p-6 border-l-4 border-l-brand-green hover:-translate-y-0.5 hover:shadow-card transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl font-black text-white tracking-tight">
                        {formatLakhs(summary.total_spend)}
                      </span>
                      <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                        Total Spend
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green border border-brand-green/20">
                      <ShoppingCart className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>

                {/* Active Vendors Card */}
                <div className="glass-card rounded-xl p-6 border-l-4 border-l-blue-500 hover:-translate-y-0.5 hover:shadow-card transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl font-black text-white tracking-tight">
                        {summary.active_vendors}
                      </span>
                      <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                        Active Vendors Count
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>

                {/* Fulfillment Rate Card */}
                <div className="glass-card rounded-xl p-6 border-l-4 border-l-purple-500 hover:-translate-y-0.5 hover:shadow-card transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl font-black text-white tracking-tight">
                        {summary.po_fulfillment_rate}%
                      </span>
                      <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                        PO Fulfillment Rate
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <TrendingUp className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>

                {/* Overdue Invoices Card */}
                <div className="glass-card rounded-xl p-6 border-l-4 border-l-red-500 hover:-translate-y-0.5 hover:shadow-card transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl font-black text-white tracking-tight">
                        {summary.overdue_invoices}
                      </span>
                      <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                        Overdue Invoices Count
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                      <AlertCircle className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* MAIN SECTION: Chart + Vendor Performance side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Monthly Spend Bar Chart */}
            <div className="lg:col-span-7 glass-card rounded-xl border border-white/5 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-brand-green" /> Monthly Spend Trend
                </h3>
                
                {spendData.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-20">No monthly spend records found.</p>
                ) : (
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#94a3b8" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }} 
                          tickFormatter={(val) => `${(val / 100000).toFixed(1)}L`} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: theme === 'dark' ? '#111917' : '#ffffff', 
                            border: '1px solid rgba(16, 185, 129, 0.2)', 
                            borderRadius: 8,
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
                          formatter={(val) => [formatCurrency(Number(val)), 'Total Spend']}
                        />
                        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]}>
                          {spendData.map((_entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill="#10b981" 
                              className="cursor-pointer transition-colors duration-200"
                              onMouseEnter={(e: any) => { if (e.target) e.target.style.fill = '#059669'; }}
                              onMouseLeave={(e: any) => { if (e.target) e.target.style.fill = '#10b981'; }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 Vendor Performance Table */}
            <div className="lg:col-span-5 glass-card rounded-xl border border-white/5 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-brand-green animate-bounce" /> Vendor Performance
                </h3>

                {vendorPerf.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-20">No vendor performance data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-subtle text-text-secondary uppercase tracking-wider">
                          <th className="py-2 pb-3 font-semibold text-center w-12">Rank</th>
                          <th className="py-2 pb-3 font-semibold pl-2">Vendor</th>
                          <th className="py-2 pb-3 font-semibold text-center w-14">PO's</th>
                          <th className="py-2 pb-3 font-semibold text-right w-24">Total Spend</th>
                          <th className="py-2 pb-3 font-semibold text-center w-16">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-subtle/50">
                        {vendorPerf.map((vendor, idx) => (
                          <tr key={vendor.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 text-center font-bold font-mono text-white">
                              {idx === 0 ? (
                                <span className="inline-flex items-center justify-center text-sm" title="Top Vendor">
                                  🥇
                                </span>
                              ) : (
                                idx + 1
                              )}
                            </td>
                            <td className="py-3 pl-2 font-semibold text-white truncate max-w-[120px]">
                              {vendor.name}
                            </td>
                            <td className="py-3 text-center font-mono text-text-secondary">
                              {vendor.po_count}
                            </td>
                            <td className="py-3 text-right font-mono font-bold text-white">
                              {formatCurrency(vendor.total_spend)}
                            </td>
                            <td className="py-3 text-center font-semibold text-amber-500 font-mono">
                              {vendor.rating.toFixed(1)}★
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </MainLayout>
  );
}
