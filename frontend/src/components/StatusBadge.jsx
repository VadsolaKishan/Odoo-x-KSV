import React from 'react';

export const StatusBadge = ({ status }) => {
  const cleanStatus = status?.toLowerCase() || '';

  // Dot color + badge colors
  let classes = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-neutral-800/80 dark:text-neutral-400 dark:border-neutral-700';
  let dotClass = 'bg-slate-400 dark:bg-neutral-500';

  if (
    cleanStatus === 'active' ||
    cleanStatus === 'paid' ||
    cleanStatus === 'selected' ||
    cleanStatus === 'invoice settled'
  ) {
    classes = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/40';
    dotClass = 'bg-emerald-500 dark:bg-emerald-400';
  } else if (cleanStatus === 'approved') {
    classes = 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/25 dark:text-brand-400 dark:border-brand-900/40';
    dotClass = 'bg-brand-500 dark:bg-brand-400';
  } else if (
    cleanStatus === 'quotes gathered' ||
    cleanStatus === 'approved (pending po)' ||
    cleanStatus === 'po generated'
  ) {
    classes = 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/25 dark:text-sky-400 dark:border-sky-900/40';
    dotClass = 'bg-sky-500 dark:bg-sky-400';
  } else if (
    cleanStatus === 'pending' ||
    cleanStatus === 'pending approval' ||
    cleanStatus === 'sent' ||
    cleanStatus === 'acknowledged' ||
    cleanStatus === 'rfq created' ||
    cleanStatus === 'submitted'
  ) {
    classes = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/25 dark:text-amber-400 dark:border-amber-900/40';
    dotClass = 'bg-amber-500 dark:bg-amber-400';
  } else if (
    cleanStatus === 'inactive' ||
    cleanStatus === 'rejected' ||
    cleanStatus === 'overdue' ||
    cleanStatus === 'blocked'
  ) {
    classes = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/25 dark:text-rose-400 dark:border-rose-900/40';
    dotClass = 'bg-rose-500 dark:bg-rose-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border select-none capitalize tracking-wide ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
