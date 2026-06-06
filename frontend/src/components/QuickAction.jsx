import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, ClipboardPlus, CheckSquare, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickAction = ({ onAddVendorClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { currentUser } = useApp();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const handleAction = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const actionItems = [
    {
      label: 'New RFQ',
      icon: ClipboardPlus,
      color: 'bg-brand-500 hover:bg-brand-600 text-white',
      onClick: () => handleAction('/rfq/create')
    },
    {
      label: 'Add Vendor',
      icon: UserPlus,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      onClick: () => {
        if (onAddVendorClick) {
          onAddVendorClick();
        } else {
          // If on a different page, go to vendors directory
          handleAction('/vendors?add=true');
        }
        setIsOpen(false);
      }
    },
    {
      label: 'Approvals',
      icon: CheckSquare,
      color: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      onClick: () => handleAction('/approvals')
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40" ref={containerRef}>
      {/* Expanded list of actions */}
      {isOpen && (
        <div className="flex flex-col items-end gap-3 mb-4 animate-fade-in">
          {actionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3 group">
                <span className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-850 rounded-lg shadow-sm text-slate-700 dark:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none">
                  {item.label}
                </span>
                <button
                  onClick={item.onClick}
                  className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-200 scale-90 hover:scale-105 active:scale-95 ${item.color}`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Actions"
        className={`flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-xl hover:shadow-brand-500/20 transition-all duration-300 ${
          isOpen ? 'rotate-45 from-danger-600 to-danger-500 hover:shadow-danger-500/20' : 'hover:scale-105'
        }`}
      >
        {isOpen ? (
          <Plus className="w-7 h-7" />
        ) : (
          <div className="relative">
            <Plus className="w-7 h-7" />
            <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-brand-200 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
};
