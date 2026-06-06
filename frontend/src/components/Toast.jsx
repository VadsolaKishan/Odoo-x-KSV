import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastProvider = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let containerClass = 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-100';
        let Icon = Info;
        let iconClass = 'text-brand-500';

        if (toast.type === 'success') {
          containerClass = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200';
          Icon = CheckCircle2;
          iconClass = 'text-emerald-600 dark:text-emerald-400';
        } else if (toast.type === 'danger') {
          containerClass = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200';
          Icon = XCircle;
          iconClass = 'text-rose-600 dark:text-rose-400';
        } else if (toast.type === 'warning') {
          containerClass = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200';
          Icon = AlertTriangle;
          iconClass = 'text-amber-600 dark:text-amber-400';
        } else if (toast.type === 'info') {
          containerClass = 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/50 text-sky-900 dark:text-sky-200';
          Icon = Info;
          iconClass = 'text-sky-600 dark:text-sky-400';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-premium-md pointer-events-auto animate-slide-in ${containerClass}`}
            role="alert"
          >
            <Icon className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 text-xs font-semibold leading-relaxed pr-1">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
