import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  CheckSquare, 
  ShoppingBag, 
  CreditCard, 
  BarChart3, 
  Activity, 
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import ThemeToggle from '../ui/ThemeToggle';
import Logo from '../ui/Logo';
import toast from 'react-hot-toast';

type NavItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[]; // which roles can see this item
};

const ALL_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  { label: 'Vendors', path: '/vendors', icon: Building2, roles: ['admin', 'procurement_officer'] },
  { label: "RFQ's", path: '/rfqs', icon: ClipboardList, roles: ['admin', 'procurement_officer', 'vendor'] },
  { label: 'Quotations', path: '/quotations', icon: FileText, roles: ['admin', 'procurement_officer', 'vendor'] },
  { label: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['admin', 'manager'] },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag, roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  { label: 'Invoices', path: '/invoices', icon: CreditCard, roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { label: 'Activity', path: '/activity', icon: Activity, roles: ['admin'] },
];

// Role label colours for the badge
const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'status-success border' },
  procurement_officer: { label: 'Officer', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20' },
  manager: { label: 'Manager', color: 'status-warning border' },
  vendor: { label: 'Vendor', color: 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20' },
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Filter nav items by role
  const navItems = ALL_NAV_ITEMS.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user) return '?';
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const roleBadge = user?.role ? ROLE_BADGE[user.role] : null;

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-surface-card border-r border-subtle flex flex-col z-30">
      {/* Top Brand Logo */}
      <div className="h-20 flex items-center px-6 border-b border-subtle">
        <Logo size="md" linkTo="/dashboard" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-brand-green/10 text-brand-green border-l-2 border-brand-green shadow-[inset_4px_0_12px_rgba(16,185,129,0.05)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-brand-green' : 'text-text-secondary group-hover:text-text-primary'
              }`} />
              <span>{item.label}</span>
              
              {/* Hover indicator */}
              {!isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-green/0 group-hover:bg-brand-green/40 shadow-glow transition-all duration-200"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Info */}
      <div className="p-4 border-t border-subtle bg-surface-elevated/30">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-brand-green-glow flex items-center justify-center border border-brand-green/20 text-brand-green text-sm font-semibold shadow-glow shrink-0">
            {getUserInitials()}
          </div>
          
          {/* User info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-text-primary truncate">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
            </h4>
            {roleBadge && (
              <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            )}
          </div>

          {/* Theme Toggle & Logout */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              title="Log Out"
              id="sidebar-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
