import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Navbar from './Navbar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex bg-background min-h-screen relative">
      <AdminSidebar forcedVisible={isMenuOpen} />
      
      {/* Mobile Overlay Toggle */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMenuOpen(false)} />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center lg:block border-b border-border bg-background">
           <Button variant="ghost" size="icon" className="lg:hidden ml-4" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-6 w-6" />
           </Button>
           <Navbar />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-muted/10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
