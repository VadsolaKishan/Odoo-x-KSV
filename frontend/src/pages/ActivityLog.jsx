import React, { useState } from 'react';
import { ClipboardList, Search, Download, ShieldCheck, User, RefreshCw, FileText, CreditCard, Layers, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActivityLog = () => {
  const { activityFeed, loading } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Icon mapping based on log event type
  const getLogIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'vendor':
        return <User className="w-4 h-4 text-orange-500" />;
      case 'rfq':
        return <ArrowUpRight className="w-4 h-4 text-brand-500" />;
      case 'po':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'invoice':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'approval':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      default:
        return <ClipboardList className="w-4 h-4 text-slate-500" />;
    }
  };

  // Color theme mapping for the log type badges
  const getBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'vendor':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-450';
      case 'rfq':
        return 'bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400';
      case 'po':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      case 'invoice':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'approval':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-dark-300';
    }
  };

  // Filter logs by type and search query
  const filteredFeed = activityFeed.filter(log => {
    const matchesFilter = selectedFilter === 'all' || log.type?.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch = log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
            Activity & Logs
          </h1>
          <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
            Procurement audit trail. Real-time logging of vendor records, RFQ requests, purchase orders, approvals, and settlements.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activityFeed, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `audit_trail_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-850 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 select-none bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl p-1 shrink-0">
          {['all', 'vendor', 'rfq', 'po', 'invoice', 'approval'].map((filterVal) => (
            <button
              key={filterVal}
              onClick={() => setSelectedFilter(filterVal)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${
                selectedFilter === filterVal
                  ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-dark-100 shadow-sm'
                  : 'text-slate-550 hover:text-slate-800 dark:text-dark-400 dark:hover:text-dark-200'
              }`}
            >
              {filterVal === 'all' ? 'All Activity' : filterVal}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by description or user..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 dark:text-dark-250 font-semibold shadow-sm"
          />
        </div>
      </div>

      {/* Timeline Logs Container */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-2xl shadow-premium dark:shadow-dark-premium overflow-hidden p-6">
        
        {loading ? (
          // Skeleton Loading
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex gap-4 items-start py-3 border-b border-slate-100 dark:border-dark-800/80">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-850" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-dark-850 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-dark-850 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFeed.length === 0 ? (
          // Empty State
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-full bg-slate-50 dark:bg-dark-950 text-slate-400">
                <Layers className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-slate-550 dark:text-dark-400">
                No logs found matching selection.
              </p>
            </div>
          </div>
        ) : (
          // Logs Timeline
          <div className="relative border-l-2 border-slate-150 dark:border-dark-800 pl-6 space-y-6">
            {filteredFeed.map((log) => (
              <div 
                key={log.id} 
                className="relative group animate-fade-in text-xs leading-normal"
              >
                {/* Timeline dot icon container */}
                <span className="absolute -left-[35px] top-1 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-dark-900 border-2 border-slate-150 dark:border-dark-800 shadow-sm group-hover:border-brand-500 transition-colors">
                  {getLogIcon(log.type)}
                </span>

                {/* Log Event Box */}
                <div className="p-4 rounded-xl border border-slate-150 dark:border-dark-800 hover:border-slate-200 dark:hover:border-dark-750 bg-slate-50/20 dark:bg-dark-950/10 hover:bg-slate-50/50 dark:hover:bg-dark-950/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* User & Action description */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 dark:text-dark-100">{log.user}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${getBadgeClass(log.type)}`}>
                          {log.type}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-600 dark:text-dark-300">{log.description}</p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[10px] text-slate-400 dark:text-dark-500 font-bold shrink-0">
                      {log.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ActivityLog;
