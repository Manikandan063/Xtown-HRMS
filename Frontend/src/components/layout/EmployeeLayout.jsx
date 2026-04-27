import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import Navbar from './Navbar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const EmployeeLayout = () => {
  const { user, updateUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const syncSession = async () => {
      try {
        const res = await apiFetch('/auth/me');
        if (res.success && res.data) {
          // Update local storage and context if data changed (e.g. canResign toggled)
          updateUser(res.data);
        }
      } catch (error) {
        console.error("Session sync failed:", error.message);
      }
    };

    syncSession();
  }, []); // Run on mount

  return (
    <div className="flex bg-background min-h-screen relative font-sans">
      <EmployeeSidebar forcedVisible={isMenuOpen} />
      
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

export default EmployeeLayout;
