import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  FileText, 
  Wallet, 
  Settings, 
  Briefcase,
  Clock,
  UserMinus,
  Layers,
  BarChart3,
  ShieldAlert,
  Cpu,
  ChevronDown,
  Building2,
  Calendar,
  MessageSquare,
  Package,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * Modern Sidebar with Multi-Level Dropdowns
 * Following the LegatoHRMS style requested by the user.
 */
const Sidebar = () => {
  const { isSuperAdmin, canAccessHRModules } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', isVisible: true },
    { 
      label: 'Employees', 
      icon: Users, 
      isVisible: canAccessHRModules,
      children: [
        { label: 'Employee List', path: '/admin/employees', icon: Users },
        { label: 'Departments', path: '/admin/departments', icon: Layers },
        { label: 'Designations', path: '/admin/designations', icon: ShieldCheck },
      ]
    },
    { 
      label: 'Projects', 
      icon: Briefcase, 
      isVisible: true,
      children: [
        { label: 'All Projects', path: '/admin/projects', icon: Briefcase },
        { label: 'Manage Shifts', path: '/admin/shifts', icon: Clock },
      ]
    },
    { label: 'Calendar', icon: Calendar, path: '/admin/calendar', isVisible: true },
    { label: 'Companies', icon: Building2, path: '/admin/companies', isVisible: isSuperAdmin },
    { 
      label: 'Payroll', 
      icon: Wallet, 
      isVisible: true,
      children: [
        { label: 'Payroll History', path: '/admin/payroll', icon: FileText },
        { label: 'Statutory Reports', path: '/admin/reports', icon: BarChart3 },
      ]
    },
    { label: 'Leave Mgmt', icon: FileText, path: '/admin/leave', isVisible: canAccessHRModules },
    { label: 'Documents', icon: ShieldCheck, path: '/admin/documents', isVisible: true },
    { label: 'Assets', icon: Package, path: '/admin/assets', isVisible: true },
    { label: 'Chats', icon: MessageSquare, path: '/admin/chats', isVisible: true },
    { 
      label: 'Administration', 
      icon: Settings, 
      isVisible: true,
      children: [
        { label: 'Subscriptions', path: '/admin/subscriptions', icon: Layers, isVisible: isSuperAdmin },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const renderMenuItem = (item) => {
    if (!item.isVisible) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label];
    const isActive = location.pathname.startsWith(item.path) || (hasChildren && item.children.some(child => location.pathname === child.path));

    if (hasChildren) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.label)}
            className={cn(
              "w-full group flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-300",
              isActive ? "bg-primary/5 text-primary" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="font-bold">{item.label}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
          </button>
          
          {isOpen && (
            <div className="ml-4 pl-4 border-l-2 border-slate-100 space-y-1 animate-in slide-in-from-top-2 duration-300">
              {item.children.map(child => (
                (!child.isVisible || child.isVisible) && (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    {child.label}
                  </NavLink>
                )
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => cn(
          "group flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-300",
          isActive 
            ? "bg-primary text-white shadow-lg shadow-primary/20" 
            : "text-slate-600 hover:bg-slate-50"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
          <span className="font-bold">{item.label}</span>
        </div>
      </NavLink>
    );
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 overflow-hidden shadow-sm transition-all duration-300">
      <div className="h-16 flex items-center gap-3 px-6 shrink-0 border-b border-border">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic shadow-md shadow-primary/20">X</div>
        <div className="flex flex-col">
           <span className="text-sm font-black tracking-tighter text-foreground">XTown HRMS</span>
           <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Enterprise Suite</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {menuItems.map(renderMenuItem)}
      </nav>

      <div className="p-4 border-t border-border space-y-3 bg-muted/20">
         <div className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-sm border border-border group cursor-pointer hover:border-primary transition-all">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-muted-foreground uppercase leading-tight">Support</span>
               <span className="text-xs font-bold leading-tight text-foreground">Help Center</span>
            </div>
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;
