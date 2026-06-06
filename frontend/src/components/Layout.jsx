import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { QuickAction } from './QuickAction';
import { ToastProvider } from './Toast';

export const Layout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-300 grid-lines">
      {/* Sidebar Panel */}
      <Sidebar isOpen={mobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      {/* Content Side panel */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Navbar toggleMobileSidebar={toggleMobileSidebar} />
        
        {/* Center Main panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
