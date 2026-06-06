import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { Clock, FileText, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const VendorRfqList = () => {
  const navigate = useNavigate();
  const { currentUser, rfqs, quotations } = useApp();

  const vendorId = currentUser?.vendorId;
  const myRfqs = rfqs.filter(r => r.assignedVendors?.includes(vendorId));
  const submittedRfqIds = quotations.filter(q => q.vendorId === vendorId).map(q => q.rfqId);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const daysLeft = (deadline) => {
    const d = new Date(deadline?.split('/').reverse().join('-'));
    const today = new Date();
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  };

  const filtered = myRfqs.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.id?.toLowerCase().includes(search.toLowerCase());
    const submitted = submittedRfqIds.includes(r.id);
    if (filter === 'pending') return matchSearch && !submitted;
    if (filter === 'submitted') return matchSearch && submitted;
    return matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">My RFQs</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium mt-1">
          RFQs assigned to your vendor account — submit quotations before the deadline.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search RFQs..."
          className="px-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 w-full sm:w-72 transition-all"
        />
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-neutral-800/60 rounded-xl">
          {[{ v: 'all', l: 'All' }, { v: 'pending', l: 'Pending' }, { v: 'submitted', l: 'Submitted' }].map(opt => (
            <button key={opt.v} onClick={() => setFilter(opt.v)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${filter === opt.v ? 'bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 shadow-sm' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300'}`}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-premium-sm">
          <FileText className="w-10 h-10 text-slate-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-neutral-500">No RFQs found</p>
          <p className="text-xs text-slate-400 dark:text-neutral-600 mt-1 font-medium">Check back later or ask the procurement officer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(rfq => {
            const submitted = submittedRfqIds.includes(rfq.id);
            const days = daysLeft(rfq.deadline);
            const urgent = days < 3 && days >= 0;
            return (
              <div key={rfq.id} className={`bg-white dark:bg-neutral-900 border rounded-2xl shadow-premium-sm overflow-hidden transition-all hover:shadow-md ${urgent && !submitted ? 'border-amber-300 dark:border-amber-800/50' : 'border-slate-200/80 dark:border-neutral-800/60'}`}>
                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-neutral-500">{rfq.id}</span>
                      {rfq.priority === 'High' && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-900/40">HIGH PRIORITY</span>}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">{rfq.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-neutral-500 font-medium">
                      <span>Qty: <strong className="text-slate-700 dark:text-neutral-300">{rfq.quantity}</strong></span>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className={urgent && !submitted ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                          Deadline: {rfq.deadline} {days > 0 ? `(${days}d left)` : '(passed)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    {submitted ? (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Submitted</span>
                      </div>
                    ) : (
                      <>
                        {urgent && (
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-bold">Urgent</span>
                          </div>
                        )}
                        <button
                          onClick={() => navigate('/vendor/quotations')}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:-translate-y-0.5">
                          Submit Quotation <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {rfq.description && (
                  <div className="px-6 pb-4">
                    <p className="text-[11px] text-slate-500 dark:text-neutral-500 font-medium line-clamp-2">{rfq.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorRfqList;
