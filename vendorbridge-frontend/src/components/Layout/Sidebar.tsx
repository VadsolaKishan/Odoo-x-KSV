import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  CheckSquare, 
  ShoppingBag, 
  CreditCard, 
  BarChart3, 
  Activity, 
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Vendors', path: '/vendors', icon: Users },
    { label: "RFQ's", path: '/rfqs', icon: ClipboardList },
    { label: 'Quotations', path: '/quotations', icon: FileText },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare },
    { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag },
    { label: 'Invoices', path: '/invoices', icon: CreditCard },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Activity', path: '/activity', icon: Activity },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return '';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getUserInitials = () => {
    if (!user) return '?';
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-surface-card border-r border-subtle flex flex-col z-30">
      {/* Top Brand Logo */}
      <div className="h-20 flex items-center px-6 border-b border-subtle">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center border border-brand-green/30 group-hover:border-brand-green/70 group-hover:shadow-glow transition-all duration-300">
            <div className="w-3.5 h-3.5 rounded-full bg-brand-green animate-pulse"></div>
          </div>
          <span className="font-semibold text-lg tracking-wider text-white group-hover:text-brand-green transition-colors duration-200">
            VendorBridge
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

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
              
              {/* Subtle hover indicator light */}
              {!isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-green/0 group-hover:bg-brand-green/40 shadow-glow transition-all duration-200"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Info / Profile section */}
      <div className="p-4 border-t border-subtle bg-black/20">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div className="w-10 h-10 rounded-full bg-brand-green-glow flex items-center justify-center border border-brand-green/20 text-brand-green text-sm font-semibold shadow-glow">
            {getUserInitials()}
          </div>
          
          {/* User names and role */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-text-primary truncate">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
            </h4>
            <p className="text-xs text-text-secondary truncate mt-0.5 capitalize">
              {user ? getRoleLabel(user.role) : 'Visitor'}
            </p>
          </div>

          {/* Logout Button */}
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
    </aside>
  );
}
