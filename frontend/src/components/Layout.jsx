import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { QuickAction } from './QuickAction';
import { ToastProvider } from './Toast';

export const Layout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 transition-colors duration-300 grid-lines flex flex-col">
      {/* Top Header */}
      <Navbar toggleMobileSidebar={toggleMobileSidebar} />
      
      <div className="flex flex-1 relative">
        {/* Sidebar Panel */}
        <Sidebar 
          isOpen={mobileSidebarOpen} 
          toggleMobileSidebar={toggleMobileSidebar} 
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        
        {/* Center Main panel */}
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:pl-16' : 'lg:pl-64'} p-4 sm:p-6 lg:p-8`}>
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Overlays */}
      <QuickAction />
      <ToastProvider />
    </div>
  );
};
export default Layout;
