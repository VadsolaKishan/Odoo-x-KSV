import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScrollText, Filter } from 'lucide-react';

const TYPE_COLORS = {
  rfq:      { dot: 'bg-brand-500',   badge: 'bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400', label: 'RFQ' },
  approval: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400', label: 'Approval' },
  vendor:   { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400', label: 'Vendor' },
  invoice:  { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400', label: 'Invoice' },
  po:       { dot: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400', label: 'PO' },
};

const EXTRA_LOGS = [
  { id: 'sys-1', type: 'rfq',      user: 'System',        description: 'Auto-seed: Mock data initialized for demo session', time: '06/06/2026, 06:00 AM' },
  { id: 'sys-2', type: 'vendor',   user: 'System',        description: 'Vendor portal activated for 4 demo vendor accounts', time: '06/06/2026, 06:01 AM' },
  { id: 'sys-3', type: 'approval', user: 'System',        description: 'Approval workflow engine initialized', time: '06/06/2026, 06:02 AM' },
  { id: 'sys-4', type: 'rfq',      user: 'Sarah Jenkins', description: 'Created RFQ RFQ-2026-001 — GPU Servers for Data Center', time: '06/06/2026, 08:15 AM' },
  { id: 'sys-5', type: 'vendor',   user: 'Admin',         description: 'Vendor Tata Digital Solutions assigned to GPU Servers RFQ', time: '06/06/2026, 08:20 AM' },
  { id: 'sys-6', type: 'rfq',      user: 'Tata Digital',  description: 'Quotation submitted for RFQ-2026-001 — ₹2,40,000', time: '06/06/2026, 09:05 AM' },
  { id: 'sys-7', type: 'approval', user: 'Sarah Jenkins', description: 'Bid selected for RFQ-2026-001 — sent to manager approval', time: '06/06/2026, 10:30 AM' },
  { id: 'sys-8', type: 'approval', user: 'Priya Shah',    description: 'RFQ-2026-001 approved — PO generated', time: '06/06/2026, 11:00 AM' },
  { id: 'sys-9', type: 'po',       user: 'System',        description: 'Purchase Order PO-2026-001 auto-generated for ₹2,40,000', time: '06/06/2026, 11:01 AM' },
  { id: 'sys-10', type: 'invoice', user: 'System',        description: 'Invoice INV-2026-001 generated and sent to vendor', time: '06/06/2026, 11:02 AM' },
];

export const SystemLogs = () => {
  const { activityFeed } = useApp();
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch]         = useState('');

  const allLogs = [...EXTRA_LOGS, ...activityFeed.map(a => ({
    id: a.id,
    type: a.type,
    user: a.user,
    description: a.description,
    time: a.time,
  }))];

  const filtered = allLogs.filter(log => {
    const matchType = typeFilter === 'all' || log.type === typeFilter;
    const matchSearch = log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">System Logs</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium mt-1">
          Complete audit trail of all platform events and user actions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 w-64 transition-all" />
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-neutral-800/60 rounded-xl">
          {['all', 'rfq', 'approval', 'vendor', 'po', 'invoice'].map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-xl transition-all capitalize ${typeFilter === type ? 'bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 shadow-sm' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300'}`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl shadow-premium-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-950/10 flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Audit Log</h3>
          <span className="ml-auto text-[10px] font-semibold text-slate-400 dark:text-neutral-600">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-neutral-800 text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 font-bold">
                <th className="px-6 py-3 text-left">Time</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-xs font-medium">No matching logs found</td></tr>
              ) : filtered.map(log => {
                const meta = TYPE_COLORS[log.type] || TYPE_COLORS.rfq;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-850/20 transition-colors">
                    <td className="px-6 py-3 text-slate-500 dark:text-neutral-500 font-mono text-[10px] whitespace-nowrap">{log.time}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-700 dark:text-neutral-300 whitespace-nowrap">{log.user}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-neutral-400 font-medium max-w-xs">{log.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
