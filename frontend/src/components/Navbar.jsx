import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, Settings, LogOut, Check, Sun, Moon, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({ toggleMobileSidebar }) => {
  const { currentUser, logoutUser, notifications, markAllNotificationsRead, theme, toggleTheme } = useApp();
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
      
      {/* Left side: Hamburger button + Brand Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-lg text-slate-800 dark:text-dark-100 tracking-tight">
          VendorBridge
        </span>
      </div>

      {/* Right side actions: Profile circle only */}
      <div className="flex items-center gap-4">
        
        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors animate-pulse"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center font-semibold text-brand-700 dark:text-brand-300 text-xs border border-brand-500/20 shadow-sm">
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
                <button 
                  onClick={() => {
                    toggleTheme();
                    setShowProfileMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-850 rounded-lg text-left font-medium"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark Theme</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light Theme</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset all data to the default mock dataset?")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-850 rounded-lg text-left font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reset Demo Data</span>
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
