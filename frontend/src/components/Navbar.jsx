import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Menu, User, Settings, LogOut, Sun, Moon,
  RotateCcw, Check, BellOff, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({ toggleMobileSidebar }) => {
  const { currentUser, logoutUser, notifications, markAllNotificationsRead, theme, toggleTheme } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);
  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  if (!currentUser) return null;

  const notifTypeIcon = (type) => {
    switch (type) {
      case 'approval': return '✅';
      case 'rfq': return '📋';
      case 'vendor': return '🏢';
      case 'po': return '📦';
      case 'invoice': return '🧾';
      default: return '🔔';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-neutral-800/70 shadow-premium-sm">

      {/* Left: Hamburger + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-800 dark:hover:text-neutral-200 transition-all lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/30">
            <span className="text-white font-bold text-xs font-display">VB</span>
          </div>
          <span className="font-display font-bold text-lg text-slate-800 dark:text-neutral-100 tracking-tight">
            VendorBridge
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
          className="p-2 rounded-xl text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-700 dark:hover:text-neutral-200 transition-all"
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-700 dark:hover:text-neutral-200 transition-all"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 border-2 border-white dark:border-neutral-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-fade-scale">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/20">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wide">Notifications</h3>
                  {unreadNotifications.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-full">
                      {unreadNotifications.length}
                    </span>
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={() => {
                      markAllNotificationsRead();
                      setShowNotifications(false);
                    }}
                    className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-neutral-800/50">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-neutral-500 gap-2">
                    <BellOff className="w-5 h-5" />
                    <span className="text-xs font-medium">No notifications</span>
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-850/30 ${
                        !n.read ? 'bg-brand-50/30 dark:bg-brand-950/10' : ''
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{notifTypeIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug ${!n.read ? 'font-semibold text-slate-800 dark:text-neutral-200' : 'font-medium text-slate-600 dark:text-neutral-400'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-neutral-600 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {n.time}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-brand-500/25 ring-2 ring-transparent group-hover:ring-brand-500/20 transition-all">
              {initials}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-fade-scale">
              {/* User Info */}
              <div className="px-4 py-3.5 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-neutral-500 truncate">{currentUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-850 hover:text-slate-800 dark:hover:text-neutral-200 rounded-xl text-left font-medium transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowProfileMenu(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-850 hover:text-slate-800 dark:hover:text-neutral-200 rounded-xl text-left font-medium transition-colors"
                >
                  {theme === 'light' ? (
                    <><Moon className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" /><span>Dark Mode</span></>
                  ) : (
                    <><Sun className="w-3.5 h-3.5 text-amber-500" /><span>Light Mode</span></>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Reset all data to default demo dataset?")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-850 hover:text-slate-800 dark:hover:text-neutral-200 rounded-xl text-left font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reset Demo Data</span>
                </button>
                <div className="mx-1 my-1 border-t border-slate-100 dark:border-neutral-800" />
                <button
                  onClick={logoutUser}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-danger-600 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/20 rounded-xl text-left font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
