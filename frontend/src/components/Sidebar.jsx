import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  FilePlus,
  FileText,
  CheckSquare,
  ShoppingBag,
  Receipt,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { to: '/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/vendors',         label: 'Vendors',          icon: Users           },
  { to: '/rfq/create',      label: "RFQ's",            icon: FilePlus        },
  { to: '/quotations',      label: 'Quotations',       icon: FileText        },
  { to: '/approvals',       label: 'Approvals',        icon: CheckSquare     },
  { to: '/purchase-orders', label: 'Purchase Orders',  icon: ShoppingBag     },
  { to: '/invoices',        label: 'Invoices',         icon: Receipt         },
  { to: '/reports',         label: 'Reports',          icon: BarChart3       },
  { to: '/activity',        label: 'Activity',         icon: Activity        },
];

export const Sidebar = ({ isOpen, toggleMobileSidebar, isCollapsed = false, setIsCollapsed }) => {
  const { currentUser, rfqs } = useApp();
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 lg:top-16 bottom-0 left-0 z-40 flex flex-col
          bg-white dark:bg-neutral-900
          border-r border-slate-200/80 dark:border-neutral-800/60
          shadow-premium-sm
          transition-all duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-16 w-64' : 'w-64'}`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200/80 dark:border-neutral-800/60 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/30">
              <span className="text-white font-bold text-xs font-display">VB</span>
            </div>
            <span className="font-display font-bold text-base text-slate-800 dark:text-neutral-100 tracking-tight">
              VendorBridge
            </span>
          </Link>
          <button
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-xl text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isCollapsed ? 'px-2 py-5' : 'px-3 py-5'} space-y-1 overflow-y-auto`}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const badge = item.label === 'Approvals' ? pendingApprovalsCount : 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => { if (isOpen) toggleMobileSidebar(); }}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 group rounded-xl
                  ${isCollapsed ? 'justify-center w-full px-0 py-2.5' : 'justify-between px-3 py-2.5'}
                  text-sm font-semibold
                  ${isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800/70 hover:text-slate-900 dark:hover:text-neutral-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isCollapsed ? (
                      <div className="relative flex items-center justify-center w-8 h-8">
                        <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-neutral-400 group-hover:text-slate-700 dark:group-hover:text-neutral-200'}`} />
                        {badge > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-neutral-900" />
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-500 dark:text-neutral-500 group-hover:text-slate-700 dark:group-hover:text-neutral-300'}`} />
                          <span>{item.label}</span>
                        </div>
                        {badge > 0 && (
                          <span className={`flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full min-w-[20px] ${isActive ? 'bg-white/20 text-white' : 'bg-brand-500 text-white shadow-sm'}`}>
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Toggle Footer */}
        <div className="hidden lg:block p-3 border-t border-slate-200/80 dark:border-neutral-800/60 bg-slate-50/50 dark:bg-neutral-950/10">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full py-2.5 px-3 rounded-xl text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 transition-all select-none cursor-pointer text-xs font-semibold"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center justify-center gap-2 w-full">
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
