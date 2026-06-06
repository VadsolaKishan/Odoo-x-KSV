import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckSquare, 
  CreditCard, 
  Building2, 
  FileSpreadsheet, 
  ShoppingBag, 
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Clock
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface ActivityLog {
  id: string;
  event_type: 'rfq' | 'approval' | 'invoice' | 'vendor' | 'quotation' | 'po';
  action: string;
  description: string;
  performed_by_name: string | null;
  created_at: string;
  resource_type: string | null;
  resource_id: string | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

export default function ActivityPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20 });
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch Activity Logs
  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await api.get(`/activity-logs`, {
          params: {
            event_type: activeTab,
            page: meta.page,
            limit: meta.limit
          }
        });
        if (res.data && res.data.success) {
          setLogs(res.data.data || []);
          setMeta(res.data.meta || { total: 0, page: 1, limit: 20 });
        }
      } catch (err) {
        console.error('Failed to load activity logs', err);
        toast.error('Failed to load activity logs.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [activeTab, meta.page, meta.limit]);

  // Tab definitions
  const tabs = [
    { value: 'all', label: 'All Activities' },
    { value: 'rfq', label: "RFQ's" },
    { value: 'approval', label: 'Approvals' },
    { value: 'invoice', label: 'Invoices' },
    { value: 'vendor', label: 'Vendors' },
    { value: 'quotation', label: 'Quotations' },
    { value: 'po', label: 'Purchase Orders' }
  ];

  // Helper: map event type to color classes
  const getEventStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rfq':
        return {
          dotBg: 'bg-blue-500',
          dotBorder: 'border-blue-500/20',
          textColor: 'text-blue-400',
          icon: FileText
        };
      case 'approval':
        return {
          dotBg: 'bg-amber-500',
          dotBorder: 'border-amber-500/20',
          textColor: 'text-amber-400',
          icon: CheckSquare
        };
      case 'invoice':
        return {
          dotBg: 'bg-emerald-500',
          dotBorder: 'border-emerald-500/20',
          textColor: 'text-emerald-400',
          icon: CreditCard
        };
      case 'vendor':
        return {
          dotBg: 'bg-purple-500',
          dotBorder: 'border-purple-500/20',
          textColor: 'text-purple-400',
          icon: Building2
        };
      case 'quotation':
        return {
          dotBg: 'bg-cyan-500',
          dotBorder: 'border-cyan-500/20',
          textColor: 'text-cyan-400',
          icon: FileSpreadsheet
        };
      case 'po':
        return {
          dotBg: 'bg-orange-500',
          dotBorder: 'border-orange-500/20',
          textColor: 'text-orange-400',
          icon: ShoppingBag
        };
      default:
        return {
          dotBg: 'bg-gray-500',
          dotBorder: 'border-white/5',
          textColor: 'text-gray-400',
          icon: Clock
        };
    }
  };

  // Helper: date formatter
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    setMeta(prev => ({ ...prev, page: newPage }));
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Activity & Logs</h1>
        <p className="text-text-secondary text-sm mt-1">Procurement audit trail</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-subtle gap-2 overflow-x-auto mb-8 no-scrollbar scroll-smooth">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setMeta(prev => ({ ...prev, page: 1 }));
            }}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.value
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-text-secondary hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
          <p className="text-sm text-text-secondary">Loading audit records...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/5 p-12 text-center max-w-xl mx-auto">
          <Clock className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h2 className="text-base font-bold text-white mb-1">No activities found</h2>
          <p className="text-xs text-text-secondary">No activity logs recorded under this category filter.</p>
        </div>
      ) : (
        <div className="space-y-8 max-w-3xl">
          
          {/* Timeline List */}
          <div className="relative pl-8 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
            {logs.map(log => {
              const style = getEventStyle(log.event_type);
              const EventIcon = style.icon;

              return (
                <div key={log.id} className="relative group">
                  
                  {/* Timeline Dot */}
                  <div className={`absolute -left-8 top-1.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all group-hover:scale-105 ${style.dotBorder} bg-surface-card text-xs ${style.textColor}`}>
                    <EventIcon className="w-4 h-4" />
                  </div>

                  {/* Log Card */}
                  <div className="glass-card rounded-xl border border-white/5 p-5 bg-white/[0.005] hover:bg-white/[0.015] hover:border-white/10 hover:shadow-card transition-all duration-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:items-center">
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                        {log.action}
                      </h4>
                      <span className="text-[10px] text-text-secondary font-mono">
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                      {log.description}
                    </p>

                    {log.performed_by_name && (
                      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-text-secondary font-semibold">
                        <User className="w-3.5 h-3.5 text-text-secondary" />
                        <span>Performed by: <span className="text-white font-medium">{log.performed_by_name}</span></span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Simple Pagination */}
          {meta.total > meta.limit && (
            <div className="flex items-center justify-between pt-4 border-t border-subtle">
              <span className="text-xs text-text-secondary">
                Showing {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} activity logs
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page * meta.limit >= meta.total}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Static Amber Warnings Box */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block text-white">Compliance & Integrity Registry</span>
              <span>Audit logs must be immutable. These transaction ledger records are write-once; no update or delete operations can be performed on logged entries.</span>
            </div>
          </div>

        </div>
      )}
    </MainLayout>
  );
}
