import React from 'react';
import { Check } from 'lucide-react';

export const StepForm = ({ currentStep = 1, steps = [] }) => {
  return (
    <div className="w-full py-4 border-b border-slate-100 dark:border-dark-800 bg-white dark:bg-dark-900 rounded-t-2xl px-6">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          let bubbleColor = 'bg-slate-100 text-slate-400 dark:bg-dark-800 dark:text-dark-500';
          if (isCompleted) {
            bubbleColor = 'bg-brand-500 text-white';
          } else if (isActive) {
            bubbleColor = 'bg-white dark:bg-dark-900 text-brand-600 dark:text-brand-400 border-2 border-brand-500 ring-4 ring-brand-500/10';
          }

          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2">
                {/* Step Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${bubbleColor}`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                {/* Step Label (Hidden on small screens) */}
                <span className={`hidden sm:inline text-xs font-semibold select-none ${
                  isActive ? 'text-slate-800 dark:text-dark-200' : 'text-slate-400 dark:text-dark-500'
                }`}>
                  {step}
                </span>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-slate-150 dark:bg-dark-800">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-300"
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
