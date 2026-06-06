import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, Clock, Building2, Mail, Phone, Hash, Loader2 } from 'lucide-react';

export const PendingVendors = () => {
  const { pendingVendors, approvePendingVendor, rejectPendingVendor, loading } = useApp();
  const [actionId, setActionId] = useState(null);

  const handleApprove = async (id) => {
    setActionId(id);
    await approvePendingVendor(id);
    setActionId(null);
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this vendor registration?')) return;
    setActionId(id);
    await rejectPendingVendor(id);
    setActionId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">Pending Vendors</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium mt-1">
          Review and approve vendor registration requests.
        </p>
      </div>

      {/* Count */}
      {pendingVendors.length > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          {pendingVendors.length} registration{pendingVendors.length !== 1 ? 's' : ''} awaiting review
        </div>
      )}

      {/* Empty State */}
      {pendingVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-premium-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-neutral-400">All caught up!</p>
          <p className="text-xs text-slate-400 dark:text-neutral-600 font-medium mt-1">No pending vendor registrations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingVendors.map(pv => (
            <div key={pv.id} className="bg-white dark:bg-neutral-900 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl shadow-premium-sm overflow-hidden">
              {/* Header stripe */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50/60 dark:bg-amber-950/10 border-b border-amber-100 dark:border-amber-900/20">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending Review</span>
                <span className="ml-auto font-mono text-[10px] text-amber-600/60 dark:text-amber-500/40">{pv.id}</span>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Info */}
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-neutral-200 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        {pv.companyName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-500 font-medium mt-0.5 ml-6">Contact: {pv.contactName}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-neutral-400 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{pv.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-neutral-400 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{pv.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-neutral-400 font-medium">
                        <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{pv.gstin}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 rounded-full border border-slate-200 dark:border-neutral-700">
                        {pv.category}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-600 font-medium">
                        Registered: {pv.registeredAt}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {actionId === pv.id ? (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-500 text-xs font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReject(pv.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(pv.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingVendors;
