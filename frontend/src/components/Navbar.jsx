import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, Settings, LogOut, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({ toggleMobileSidebar }) => {
  const { currentUser, logoutUser, notifications, markAllNotificationsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
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

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-dark-800/80">
      
      {/* Left side: Hamburger button + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search Bar */}
        <div className="relative hidden sm:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-dark-500" />
          <input
            type="text"
            placeholder="Search vendors, RFQs, invoices..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 dark:text-dark-200"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        
        {/* Search icon for mobile */}
        <button className="p-2 text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl sm:hidden">
          <Search className="w-4.5 h-4.5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden animate-fade-scale">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-950/40">
                <span className="text-xs font-semibold text-slate-800 dark:text-dark-200">Notifications</span>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-[10px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-800">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-dark-500">
                    No new alerts
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 text-xs hover:bg-slate-50 dark:hover:bg-dark-800/40 transition-colors ${
                        !notif.read ? 'bg-brand-50/20 dark:bg-brand-950/10 font-medium' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="capitalize px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-dark-400">
                          {notif.type}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-dark-500">{notif.time}</span>
                      </div>
                      <p className="text-slate-700 dark:text-dark-300 leading-normal">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center font-semibold text-brand-700 dark:text-brand-300 text-xs">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden animate-fade-scale">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-dark-200">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-dark-500 truncate">{currentUser.email}</p>
              </div>
              <div className="p-1 space-y-0.5">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-850 rounded-lg text-left">
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-850 rounded-lg text-left">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={logoutUser}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-danger-600 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/20 rounded-lg text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
