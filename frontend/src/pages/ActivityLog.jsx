import React, { useState } from 'react';
import { Search, Download, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActivityLog = () => {
  const { activityFeed, loading } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Icon mapping based on log event type/details
  const getLogIcon = (log) => {
    const desc = log.description?.toLowerCase() || '';
    const type = log.type?.toLowerCase() || '';
    
    if (type === 'vendor') {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-rose-400 bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 font-semibold text-sm select-none">
          👤
        </span>
      );
    }

    if (desc.includes('selected') || desc.includes('approved') || desc.includes('paid') || desc.includes('success')) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400 font-semibold text-sm select-none">
          ✓
        </span>
      );
    }
    
    if (desc.includes('pending') || desc.includes('awaiting') || type === 'approval') {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-blue-400 bg-blue-50 text-blue-500 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400 font-semibold text-sm select-none">
          🕒
        </span>
      );
    }
    
    if (type === 'rfq' || type === 'po' || type === 'invoice') {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-400 bg-slate-50 text-slate-600 dark:bg-slate-900 dark:border-neutral-800 dark:text-neutral-300 font-semibold text-sm select-none">
          📄
        </span>
      );
    }
    
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-400 bg-slate-50 text-slate-500 dark:bg-slate-900 dark:border-neutral-800 dark:text-neutral-300 font-semibold text-sm select-none">
        📄
      </span>
    );
  };

  // Filter logs by type and search query
  const filteredFeed = activityFeed.filter(log => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'rfq' && (log.type?.toLowerCase() === 'rfq' || log.type?.toLowerCase() === 'po')) ||
      log.type?.toLowerCase() === selectedFilter.toLowerCase();
      
    const matchesSearch = log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterButtons = [
    { id: 'all', label: 'All' },
    { id: 'rfq', label: 'RFQ' },
    { id: 'approval', label: 'Approvals' },
    { id: 'invoice', label: 'Invoices' },
    { id: 'vendor', label: 'Vendors' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
            Activity & Logs
          </h1>
          <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
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
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-850 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          {filterButtons.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                selectedFilter === f.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'border-slate-300 dark:border-neutral-700 text-slate-650 dark:text-neutral-450 hover:border-slate-400 dark:hover:border-neutral-300 bg-transparent'
              }`}
            >
              {f.label}
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
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 dark:text-neutral-250 font-semibold shadow-sm"
          />
        </div>
      </div>

      {/* Timeline Logs Container */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-850 rounded-2xl shadow-premium dark:shadow-neutral-premium overflow-hidden p-6">
        
        {loading ? (
          // Skeleton Loading
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex gap-4 items-start py-3 border-b border-slate-100 dark:border-neutral-800/80">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-850" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-neutral-850 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-neutral-850 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFeed.length === 0 ? (
          // Empty State
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-full bg-slate-50 dark:bg-neutral-950 text-slate-400">
                <Layers className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-slate-550 dark:text-neutral-400">
                No logs found matching selection.
              </p>
            </div>
          </div>
        ) : (
          // Logs List (Clean Horizontal Dividers, No timeline line, No box borders)
          <div className="divide-y divide-slate-150 dark:divide-neutral-800/80">
            {filteredFeed.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-4 py-4 animate-fade-in text-xs"
              >
                {/* Status circle container */}
                <div className="shrink-0 mt-0.5">
                  {getLogIcon(log)}
                </div>

                {/* Log Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 dark:text-neutral-250 leading-relaxed text-sm">
                    {log.description}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold mt-1 uppercase tracking-wider">
                    {log.time}
                  </p>
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
