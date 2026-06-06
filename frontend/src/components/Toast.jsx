import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastProvider = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800';
        let textColor = 'text-slate-800 dark:text-dark-100';
        let Icon = Info;
        let iconColor = 'text-brand-500';

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50';
          textColor = 'text-emerald-800 dark:text-emerald-300';
          Icon = CheckCircle;
          iconColor = 'text-emerald-600 dark:text-emerald-400';
        } else if (toast.type === 'danger') {
          bgColor = 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50';
          textColor = 'text-red-800 dark:text-red-300';
          Icon = AlertCircle;
          iconColor = 'text-red-600 dark:text-red-400';
        } else if (toast.type === 'warning') {
          bgColor = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50';
          textColor = 'text-amber-800 dark:text-amber-300';
          Icon = AlertCircle;
          iconColor = 'text-amber-600 dark:text-amber-400';
        } else if (toast.type === 'info') {
          bgColor = 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50';
          textColor = 'text-blue-800 dark:text-blue-300';
          Icon = Info;
          iconColor = 'text-blue-600 dark:text-blue-400';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start p-4 rounded-xl border shadow-lg pointer-events-auto animate-slide-in ${bgColor}`}
            role="alert"
          >
            <Icon className={`w-5 h-5 mr-3 shrink-0 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:text-dark-500 dark:hover:text-dark-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
