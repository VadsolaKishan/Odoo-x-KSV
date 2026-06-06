import React from 'react';
import { Check, ClipboardList, MessageSquare, ShieldAlert, ShoppingCart, Receipt } from 'lucide-react';

export const Timeline = ({ currentStep = 0 }) => {
  // steps layout
  const steps = [
    { label: 'RFQ Created', icon: ClipboardList },
    { label: 'Quotes Gathered', icon: MessageSquare },
    { label: 'Approval Status', icon: ShieldAlert },
    { label: 'PO Sent', icon: ShoppingCart },
    { label: 'Invoice Paid', icon: Receipt },
  ];

  return (
    <div className="w-full py-4 px-2 sm:px-6">
      <div className="relative flex items-center justify-between">
        
        {/* Connection lines background */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-neutral-800 -z-10" />
        
        {/* Active connection line overlay */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 transition-all duration-500 -z-10"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps mapping */}
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          let borderStyle = 'border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-400 dark:text-neutral-500';
          if (isCompleted) {
            borderStyle = 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20';
          } else if (isActive) {
            borderStyle = 'border-brand-500 bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 ring-4 ring-brand-500/10 scale-110';
          }

          return (
            <div key={idx} className="flex flex-col items-center flex-1 text-center">
              
              {/* Bubble circle */}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${borderStyle}`}>
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>

              {/* Step label text */}
              <span className={`mt-2 text-[10px] sm:text-xs font-semibold select-none transition-colors duration-300 ${
                isActive 
                  ? 'text-brand-600 dark:text-brand-400 font-bold' 
                  : isCompleted 
                    ? 'text-slate-800 dark:text-neutral-200' 
                    : 'text-slate-400 dark:text-neutral-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
