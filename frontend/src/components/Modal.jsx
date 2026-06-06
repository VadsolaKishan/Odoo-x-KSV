import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
      />
      
      {/* Content Box */}
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl shadow-xl dark:shadow-dark-premium overflow-hidden animate-fade-scale z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-800">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-dark-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 dark:text-dark-500 hover:bg-slate-50 dark:hover:bg-dark-850 hover:text-slate-600 dark:hover:text-dark-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
