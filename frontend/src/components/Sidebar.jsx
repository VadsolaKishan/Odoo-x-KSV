import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  GitCompare,
  FileText,
  CreditCard,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({ isOpen, toggleMobileSidebar }) => {
  const { theme, toggleTheme, currentUser, logoutUser, rfqs } = useApp();

  // Calculate pending approvals count
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', sublabel: 'डैशबोर्ड', icon: LayoutDashboard },
    { to: '/vendors', label: 'Vendors Directory', sublabel: 'विक्रेता', icon: Users },
    { to: '/approvals', label: 'Approvals Inbox', sublabel: 'स्वीकृति', icon: FileCheck, badge: pendingApprovalsCount },
    { to: '/quotations', label: 'Compare Quotes', sublabel: 'तुलना', icon: GitCompare },
    { to: '/purchase-orders', label: 'Purchase Orders', sublabel: 'क्रय आदेश', icon: FileText },
    { to: '/invoices', label: 'Invoices', sublabel: 'इनवॉइस', icon: CreditCard },
    { to: '/reports', label: 'Reports & Analytics', sublabel: 'रिपोर्ट', icon: BarChart3 },
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

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-dark-800">
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
            className="p-1.5 rounded-lg text-slate-500 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (isOpen) toggleMobileSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-800/60 hover:text-slate-900 dark:hover:text-dark-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110" />
                  <div className="flex flex-col text-left">
                    <span>{item.label}</span>
                    <span className="text-[9px] font-normal text-slate-400 dark:text-dark-500 -mt-0.5">{item.sublabel}</span>
                  </div>
                </div>
                {item.badge > 0 && (
                  <span className="flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-500 text-white shadow-sm shadow-brand-500/10">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-dark-800 space-y-2">
          {/* User profile card */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-dark-950/50 border border-slate-100 dark:border-dark-900">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-semibold text-sm">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-dark-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-dark-500 truncate capitalize">{currentUser.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={logoutUser}
              title="Logout"
              className="flex items-center justify-center p-2 text-danger-600 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/20 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
