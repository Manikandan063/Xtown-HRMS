import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * Main App Layout Wrapper
 * Combines Sidebar and Navbar into a unified structure for the dashboard
 */
const Layout = () => {
  return (
    <div className="flex bg-background min-h-screen text-foreground">
      {/* Permanent Sidebar (Left) */}
      <Sidebar />

      {/* Main Content Area (Right) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header / Navbar */}
        <Navbar />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC]/50 dark:bg-[#111827]/30 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
