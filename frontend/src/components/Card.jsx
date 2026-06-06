import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Card = ({ title, value, trend, trendType = 'neutral', icon: Icon, description, onClick }) => {
  const isPositive = trendType === 'positive';
  const isNegative = trendType === 'negative';

  return (
    <div 
      onClick={onClick}
      className={`glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-neutral-800/80 shadow-premium-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover-glow-card' : 'hover:shadow-premium-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-neutral-100 tracking-tight">
          {value}
        </h3>
        
        {(trend || description) && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend && (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-xs font-bold ${
                isPositive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                  : isNegative 
                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' 
                    : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'
              }`}>
                {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
                {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
                {trend}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
