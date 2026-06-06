import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { ClipboardList, FileText, Package, Clock, ChevronRight, AlertTriangle } from 'lucide-react';

export const VendorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, rfqs, quotations, purchaseOrders } = useApp();

  const vendorId = currentUser?.vendorId;

  // RFQs assigned to this vendor
  const myRfqs = rfqs.filter(r => r.assignedVendors?.includes(vendorId));
  const myQuotations = quotations.filter(q => q.vendorId === vendorId);
  const myOrders = purchaseOrders.filter(po => po.vendorId === vendorId);
  const submittedRfqIds = myQuotations.map(q => q.rfqId);
  const pendingRfqs = myRfqs.filter(r => !submittedRfqIds.includes(r.id));

  // Deadline countdown helper
  const daysLeft = (deadline) => {
    const d = new Date(deadline?.split('/').reverse().join('-'));
    const today = new Date();
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const kpiCards = [
    { label: 'Received RFQs',        value: myRfqs.length,       icon: ClipboardList, color: 'text-brand-600',   bg: 'bg-brand-50 dark:bg-brand-950/20' },
    { label: 'Submitted Quotes',      value: myQuotations.length, icon: FileText,      color: 'text-sky-600',     bg: 'bg-sky-50 dark:bg-sky-950/20'     },
    { label: 'My Purchase Orders',    value: myOrders.length,     icon: Package,       color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Pending Submissions',   value: pendingRfqs.length,  icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/20' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold mb-2">
          🏢 Vendor Portal
        </div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
          Welcome, {currentUser?.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium mt-1">
          Your vendor portal — RFQs, quotations, and purchase orders in one place.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl p-5 shadow-premium-sm hover-glow-card">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100">{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-500 font-medium mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Assigned RFQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open RFQs */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl shadow-premium-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-950/10">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Assigned RFQs</h3>
            <button onClick={() => navigate('/vendor/rfqs')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-neutral-800/40">
            {myRfqs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-neutral-500">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No RFQs assigned yet</p>
              </div>
            ) : myRfqs.slice(0, 5).map(rfq => {
              const submitted = submittedRfqIds.includes(rfq.id);
              const days = daysLeft(rfq.deadline);
              return (
                <div key={rfq.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 dark:hover:bg-neutral-850/20 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">{rfq.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className={`text-[10px] font-medium ${days < 3 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-neutral-500'}`}>
                        {days > 0 ? `${days} days left` : 'Deadline passed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {submitted ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                        Submitted
                      </span>
                    ) : (
                      <button onClick={() => navigate('/vendor/quotations')}
                        className="px-3 py-1.5 text-[10px] font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-colors shadow-sm shadow-brand-500/20">
                        Submit Quote
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Quotations */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl shadow-premium-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-950/10">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">My Quotations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-neutral-800 text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 font-bold">
                  <th className="px-6 py-3 text-left">RFQ</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40">
                {myQuotations.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-xs">No quotations submitted yet</td></tr>
                ) : myQuotations.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-850/20 transition-colors">
                    <td className="px-6 py-3 font-mono font-bold text-slate-700 dark:text-neutral-300 text-[11px]">{q.rfqId}</td>
                    <td className="px-6 py-3 font-semibold text-slate-800 dark:text-neutral-200">₹{q.totalCost?.toLocaleString('en-IN') || 0}</td>
                    <td className="px-6 py-3"><StatusBadge status={q.selected ? 'Selected' : 'Submitted'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
