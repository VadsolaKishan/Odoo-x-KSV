import React from 'react';
import { Check } from 'lucide-react';

export const StepForm = ({ currentStep = 1, steps = [] }) => {
  return (
    <div className="w-full py-5 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-t-2xl px-6">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          let bubbleClass = 'bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-neutral-500 border border-transparent';
          if (isCompleted) {
            bubbleClass = 'bg-brand-600 text-white border border-brand-700 shadow-sm shadow-brand-500/20';
          } else if (isActive) {
            bubbleClass = 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 border-2 border-brand-500 ring-4 ring-brand-500/10 shadow-sm';
          }

          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2.5">
                {/* Step Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${bubbleClass}`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                {/* Step Label */}
                <span className={`hidden sm:inline text-xs font-semibold select-none transition-colors ${
                  isActive
                    ? 'text-slate-800 dark:text-neutral-200'
                    : isCompleted
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 dark:text-neutral-500'
                }`}>
                  {step}
                </span>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-3 bg-slate-150 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepForm;
