import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, ShieldCheck, PieChart as PieIcon, Award } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';

export const Reports = () => {
  const { vendors, invoices, purchaseOrders, formatIndianCurrency } = useApp();

  // Metrics computations
  const totalSpend = invoices.reduce((sum, inv) => sum + inv.totalCost, 0);
  const totalOrders = purchaseOrders.length;
  
  // Average rating of active vendors
  const avgRating = vendors.length > 0
    ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(2)
    : '0.00';

  // Cost Savings calculation (Mock 15% average discount relative to list price)
  const savingsEstimate = totalSpend > 0 ? totalSpend * 0.15 : 124000;

  // Monthly Spending trends dataset
  const spendTrendsData = [
    { name: 'Jan', IT: 240000, Office: 40000, Manufacturing: 120000 },
    { name: 'Feb', IT: 280000, Office: 45000, Manufacturing: 150000 },
    { name: 'Mar', IT: 260000, Office: 38000, Manufacturing: 130000 },
    { name: 'Apr', IT: 350000, Office: 62000, Manufacturing: 180000 },
    { name: 'May', IT: 320000, Office: 51000, Manufacturing: 160000 },
    { name: 'Jun', IT: totalSpend > 0 ? totalSpend * 0.6 : 380000, Office: 55000, Manufacturing: 175000 },
  ];

  // Category Distribution Pie Chart dataset
  const categoryData = [
    { name: 'Software & IT', value: totalSpend > 0 ? totalSpend * 0.6 : 600000 },
    { name: 'Electronics', value: 250000 },
    { name: 'Manufacturing', value: 180000 },
    { name: 'Office Supplies', value: 120000 },
  ];

  // Chart theme colors
  const COLORS = ['#3860f4', '#10b981', '#f59e0b', '#8b5cf6'];

  // Vendor Performance ratings dataset
  const vendorPerformanceData = vendors.map(v => ({
    name: v.name.length > 12 ? v.name.substring(0, 12) + '...' : v.name,
    rating: v.rating,
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
          Reports & Analytics <span className="text-slate-400 dark:text-dark-500 font-medium text-lg">(रिपोर्ट)</span>
        </h1>
        <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
          Deeper insights into procurement overheads, supplier performance, and fiscal audits.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Total Audited Spend"
          value={formatIndianCurrency(totalSpend)}
          trend="+8.2% YTD"
          trendType="neutral"
          icon={DollarSign}
        />
        <Card
          title="Calculated Savings"
          value={formatIndianCurrency(savingsEstimate)}
          trend="15.0% cost avoidance"
          trendType="positive"
          icon={TrendingUp}
        />
        <Card
          title="Avg Supplier Rating"
          value={`${avgRating} / 5.0`}
          trend="Top Tier Partner grade"
          trendType="positive"
          icon={Award}
        />
        <Card
          title="Released PO Contracts"
          value={totalOrders}
          trend={`${totalOrders} generated POs`}
          trendType="neutral"
          icon={Clock}
        />
      </div>

      {/* Graphs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stacked Area: Spending breakdown by Category */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 mb-4">Categorical Monthly Spending</h3>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                  formatter={(val) => [formatIndianCurrency(val)]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" fontSize={11} />
                <Area type="monotone" dataKey="IT" name="Software & IT" stackId="1" stroke="#3860f4" fill="#3860f4" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Office" name="Office Supplies" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Manufacturing" name="Manufacturing" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie: Distribution Share */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 mb-4">Total Spending Distribution</h3>
          <div className="h-72 w-full flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [formatIndianCurrency(val), 'Total Share']}
                />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row: Vendor Ratings performance breakdown */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200">Bidders Scorecard Audits</h3>
        
        <div className="h-64 w-full">
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
              <Bar dataKey="rating" name="SLA Rating (1-5)" fill="#3860f4" radius={[6, 6, 0, 0]}>
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
  );
};

export default Reports;
