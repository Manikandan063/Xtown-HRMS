import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserMinus,
  CalendarCheck, 
  FileText, 
  Wallet, 
  BarChart3, 
  Settings,
  Monitor,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Layers,
  ShieldCheck,
  Briefcase,
  Clock,
  Printer,
  History,
  Cpu,
  Zap,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AdminSidebar = ({ forcedVisible = false }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    Employees: true, // Default open for admin
    Projects: false,
    Payroll: false
  });

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Employees', icon: Users, children: [
        { label: 'All Employees', path: '/admin/employees', icon: Users },
        { label: 'Departments', path: '/admin/departments', icon: Layers },
        { label: 'Designations', path: '/admin/designations', icon: ShieldCheck },
      ]
    },
    { label: 'Project Activity', icon: BarChart3, path: '/admin/projects/dashboard' },
    { label: 'Manage Projects', icon: Briefcase, path: '/admin/projects' },
    { label: 'Work Shifts', icon: Clock, path: '/admin/shifts' },
    { label: 'Holiday Calendar', icon: CalendarIcon, path: '/admin/holidays' },
    { label: 'Attendance', icon: CalendarCheck, path: '/admin/attendance' },
    { label: 'Leave Mgmt', icon: FileText, path: '/admin/leave' },
    { label: 'Payroll', icon: Wallet, path: '/admin/payroll' },
    { label: 'Offboarding', icon: UserMinus, path: '/admin/resignation' },
    { label: 'Asset Management', icon: Monitor, path: '/admin/assets' },
    { label: 'Hardware', icon: Cpu, path: '/admin/devices' },
    { label: 'Subscription', icon: Zap, path: '/admin/subscription' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label];
    const isActive = location.pathname.startsWith(item.path) || (hasChildren && item.children.some(child => location.pathname === child.path));

    if (hasChildren) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.label)}
            className={cn(
              "w-full group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
              isActive ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary")} />
              <span className="font-bold">{item.label}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
          </button>
          
          {isOpen && (
            <div className="ml-4 pl-4 border-l border-border space-y-1 animate-in slide-in-from-top-2 duration-300">
              {item.children.map(child => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  )}
                >
                  <child.icon className="h-4 w-4" />
                  {child.label}
                </NavLink>
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
          "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
          isActive 
            ? "bg-primary text-white shadow-lg shadow-primary/20" 
            : "text-muted-foreground hover:bg-muted hover:text-primary"
        )}
      >
        <item.icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
        <span className="font-bold">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <aside className={cn(
      "w-64 bg-card border-r border-border flex-col h-screen sticky top-0 shadow-sm transition-all duration-300 z-50",
      !forcedVisible ? "hidden lg:flex" : "flex fixed inset-y-0 left-0 shadow-2xl"
    )}>
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-black tracking-tighter text-primary uppercase">XTOWN <span className="text-foreground italic">HRMS</span></h1>
        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 opacity-70">Admin Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map(renderMenuItem)}
      </nav>

      <div className="p-4 border-t border-border space-y-3 bg-muted/20">
        <NavLink 
          to="/admin/profile"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl border transition-all",
            isActive ? "bg-primary border-primary shadow-lg shadow-primary/20 text-white" : "bg-card border-border hover:border-primary"
          )}
        >
          {({ isActive }) => (
            <>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-black text-[10px] uppercase shadow-inner italic text-white border border-white/10">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", isActive ? "text-primary-foreground/70" : "text-primary")}>Admin HR / MD</p>
                <p className={cn("text-xs font-black truncate uppercase tracking-tighter", isActive ? "text-white" : "text-foreground")}>{user?.name || 'Administrator'}</p>
              </div>
              <ChevronRight className={cn("h-3 w-3", isActive ? "text-white" : "text-muted-foreground")} />
            </>
          )}
        </NavLink>
        <Button 
          variant="ghost" 
          onClick={logout}
          className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10 gap-3 px-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out Portal
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
