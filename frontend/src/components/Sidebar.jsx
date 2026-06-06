import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  X, ChevronLeft, ChevronRight,
  LayoutDashboard, Users, FilePlus, FileText, CheckSquare,
  ShoppingBag, Receipt, BarChart3, Activity, Shield,
  UserCog, ScrollText, Clock, GitCompare, Store,
  Package, ClipboardList, History, UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── Role-specific nav definitions ───────────────────
const NAV_BY_ROLE = {
  admin: [
    { to: '/dashboard',       label: 'Dashboard',        icon: LayoutDashboard },
    { to: '/vendors',         label: 'Vendor Management', icon: Users           },
    { to: '/admin/vendors',   label: 'Pending Vendors',   icon: Clock,  badge: 'pending' },
    { to: '/rfq/create',      label: 'All RFQs',          icon: FilePlus        },
    { to: '/quotations',      label: 'Quotations',        icon: FileText        },
    { to: '/comparison',      label: 'Quote Comparison',  icon: GitCompare      },
    { to: '/purchase-orders', label: 'Purchase Orders',   icon: ShoppingBag     },
    { to: '/invoices',        label: 'Invoices',          icon: Receipt         },
    { to: '/reports',         label: 'Analytics',         icon: BarChart3       },
    { to: '/admin/users',     label: 'User Management',   icon: UserCog         },
    { to: '/admin/logs',      label: 'System Logs',       icon: ScrollText      },
    { to: '/activity',        label: 'Activity Feed',     icon: Activity        },
  ],
  officer: [
    { to: '/dashboard',       label: 'Dashboard',         icon: LayoutDashboard },
    { to: '/rfq/create',      label: 'Create RFQ',        icon: FilePlus        },
    { to: '/quotations',      label: 'Quotations',        icon: FileText        },
    { to: '/comparison',      label: 'Quote Comparison',  icon: GitCompare      },
    { to: '/purchase-orders', label: 'Purchase Orders',   icon: ShoppingBag     },
    { to: '/vendors',         label: 'Vendors',           icon: Users           },
    { to: '/reports',         label: 'Reports',           icon: BarChart3       },
    { to: '/activity',        label: 'Activity',          icon: Activity        },
  ],
  manager: [
    { to: '/dashboard',       label: 'Dashboard',         icon: LayoutDashboard },
    { to: '/approvals',       label: 'Approvals',         icon: CheckSquare, badge: 'approvals' },
    { to: '/rfq/create',      label: 'All RFQs',          icon: FilePlus        },
    { to: '/quotations',      label: 'Quotations',        icon: FileText        },
    { to: '/purchase-orders', label: 'Purchase Orders',   icon: ShoppingBag     },
    { to: '/activity',        label: 'Approval History',  icon: History         },
  ],
  vendor: [
    { to: '/vendor/dashboard',  label: 'My Dashboard',    icon: LayoutDashboard },
    { to: '/vendor/rfqs',       label: 'My RFQs',         icon: ClipboardList   },
    { to: '/vendor/quotations', label: 'Submit Quotation', icon: FileText       },
    { to: '/purchase-orders',   label: 'My Orders',        icon: Package        },
    { to: '/vendor/profile',    label: 'My Profile',       icon: UserCheck      },
  ],
};

const ROLE_META = {
  admin:   { label: 'Admin',    color: 'bg-brand-600',   border: 'border-brand-200 dark:border-brand-900/50',   text: 'text-brand-700 dark:text-brand-400' },
  officer: { label: 'Officer',  color: 'bg-sky-600',     border: 'border-sky-200 dark:border-sky-900/50',       text: 'text-sky-700 dark:text-sky-400'     },
  manager: { label: 'Manager',  color: 'bg-emerald-600', border: 'border-emerald-200 dark:border-emerald-900/50',text: 'text-emerald-700 dark:text-emerald-400' },
  vendor:  { label: 'Vendor',   color: 'bg-amber-600',   border: 'border-amber-200 dark:border-amber-900/50',   text: 'text-amber-700 dark:text-amber-400' },
};

export const Sidebar = ({ isOpen, toggleMobileSidebar, isCollapsed = false, setIsCollapsed }) => {
  const { currentUser, rfqs, pendingVendors } = useApp();

  if (!currentUser) return null;

  const role = currentUser.role || 'officer';
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.officer;
  const meta = ROLE_META[role] || ROLE_META.officer;

  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;
  const pendingVendorCount    = pendingVendors?.length || 0;

  const getBadge = (badgeKey) => {
    if (badgeKey === 'approvals') return pendingApprovalsCount;
    if (badgeKey === 'pending')   return pendingVendorCount;
    return 0;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div onClick={toggleMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity" />
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">VB</span>
            </div>
            <span className="font-display font-bold text-base text-slate-800 dark:text-neutral-100 tracking-tight">VendorBridge</span>
          </Link>
          <button onClick={toggleMobileSidebar}
            className="p-1.5 rounded-xl text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge (non-collapsed only) */}
        {!isCollapsed && (
          <div className={`mx-3 mt-4 mb-1 px-3 py-2 rounded-xl border ${meta.border} flex items-center gap-2.5`}>
            <div className={`w-6 h-6 rounded-lg ${meta.color} flex items-center justify-center shrink-0`}>
              <Shield className="w-3 h-3 text-white" />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-wider ${meta.text}`}>{meta.label}</p>
              <p className="text-[9px] text-slate-400 dark:text-neutral-500 font-medium truncate">{currentUser.name}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 ${isCollapsed ? 'px-2 py-4' : 'px-3 py-3'} space-y-0.5 overflow-y-auto`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const badgeCount = item.badge ? getBadge(item.badge) : 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/rfq/create' || item.to === '/dashboard' || item.to === '/vendor/dashboard'}
                onClick={() => { if (isOpen) toggleMobileSidebar(); }}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center transition-all duration-150 group rounded-xl
                  ${isCollapsed ? 'justify-center w-full px-0 py-2.5' : 'justify-between px-3 py-2.5'}
                  text-xs font-semibold
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
                        <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-neutral-400'}`} />
                        {badgeCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-neutral-900" />
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-500 dark:text-neutral-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {badgeCount > 0 && (
                          <span className={`flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black rounded-full min-w-[18px] ${isActive ? 'bg-white/20 text-white' : 'bg-brand-500 text-white'}`}>
                            {badgeCount}
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

        {/* Collapse Toggle */}
        <div className="hidden lg:block p-3 border-t border-slate-200/80 dark:border-neutral-800/60 bg-slate-50/50 dark:bg-neutral-950/10">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full py-2 px-3 rounded-xl text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 transition-all text-xs font-semibold select-none cursor-pointer"
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
