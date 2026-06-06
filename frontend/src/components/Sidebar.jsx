import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({ isOpen, toggleMobileSidebar, isCollapsed = false, setIsCollapsed }) => {
  const { currentUser, rfqs } = useApp();

  // Calculate pending approvals count
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', short: 'DB' },
    { to: '/vendors', label: 'Vendors', short: 'VD' },
    { to: '/rfq/create', label: "RFQ's", short: 'RF' },
    { to: '/quotations', label: 'Quotations', short: 'QT' },
    { to: '/approvals', label: 'Approvals', badge: pendingApprovalsCount, short: 'AP' },
    { to: '/purchase-orders', label: 'Purchase orders', short: 'PO' },
    { to: '/invoices', label: 'Invoices', short: 'IV' },
    { to: '/reports', label: 'Reports', short: 'RP' },
    { to: '/activity', label: 'Activity', short: 'AC' },
  ];

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity" 
        />
      )}

      {/* Sidebar container - starts below top header (top-16) on desktop */}
      <aside
        className={`fixed top-0 lg:top-16 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 transition-all duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-16 w-64' : 'w-64'}`}
      >
        {/* Brand Header - visible on mobile only */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-dark-800 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold text-lg shadow-md shadow-brand-500/20">
              VB
            </div>
            <span className="font-display font-bold text-lg text-slate-800 dark:text-dark-100 tracking-tight">
              VendorBridge
            </span>
          </Link>
          <button 
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-lg text-slate-500 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className={`flex-1 ${isCollapsed ? 'px-2 py-6' : 'px-4 py-6'} space-y-1.5 overflow-y-auto`}>
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (isOpen) toggleMobileSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 group ${
                    isCollapsed 
                      ? 'justify-center py-2.5 px-0 w-full' 
                      : 'justify-between px-4 py-2.5'
                  } text-sm font-semibold rounded-xl ${
                    isActive
                      ? 'bg-brand-50/70 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border border-brand-500/10'
                      : 'text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-800/60 hover:text-slate-900 dark:hover:text-dark-200'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                {isCollapsed ? (
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-dark-800 transition-colors">
                    <span className="text-xs font-bold tracking-tight text-slate-650 dark:text-dark-300 font-display">
                      {item.short}
                    </span>
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-dark-900" />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 dark:text-dark-500 font-bold shrink-0 w-4 text-center">-</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-500 text-white shadow-sm shadow-brand-500/10">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle Footer Button */}
        <div className="hidden lg:block p-3 border-t border-slate-200 dark:border-dark-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-dark-400 dark:hover:text-dark-200 bg-slate-50 dark:bg-dark-850 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-800 transition-all select-none cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-bold w-full">
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">Collapse Panel</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
