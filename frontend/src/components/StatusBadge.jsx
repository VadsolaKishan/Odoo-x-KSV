import React from 'react';

export const StatusBadge = ({ status }) => {
  const cleanStatus = status?.toLowerCase() || '';

  // Class definitions
  let colors = 'bg-slate-100 text-slate-700 dark:bg-dark-800 dark:text-dark-300';

  if (
    cleanStatus === 'active' || 
    cleanStatus === 'paid' || 
    cleanStatus === 'approved' || 
    cleanStatus === 'invoice settled' ||
    cleanStatus === 'selected'
  ) {
    colors = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
  } else if (
    cleanStatus === 'pending' || 
    cleanStatus === 'pending approval' ||
    cleanStatus === 'approved (pending po)' ||
    cleanStatus === 'quotes gathered' ||
    cleanStatus === 'sent' ||
    cleanStatus === 'acknowledged' ||
    cleanStatus === 'rfq created' ||
    cleanStatus === 'po generated'
  ) {
    colors = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
  } else if (
    cleanStatus === 'inactive' || 
    cleanStatus === 'rejected' || 
    cleanStatus === 'overdue'
  ) {
    colors = 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none capitalize ${colors}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
