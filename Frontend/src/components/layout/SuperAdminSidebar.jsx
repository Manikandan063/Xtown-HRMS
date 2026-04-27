import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Layers, 
  Settings,
  ChevronRight,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Cpu,
  Globe,
  Eye,
  Zap,
  Clock,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SuperAdminSidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    Companies: true,
    Subscriptions: true
  });

  const [openTicketCount, setOpenTicketCount] = useState(0);

  useEffect(() => {
    fetchOpenTickets();
    const interval = setInterval(fetchOpenTickets, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOpenTickets = async () => {
    try {
      const res = await apiFetch('/support/superadmin-tickets');
      if (res.status === 'success') {
        const count = res.data.filter(t => t.status === 'Open').length;
        setOpenTicketCount(count);
      }
    } catch (e) {
      console.error('Failed to fetch ticket count');
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/superadmin/dashboard', isVisible: true },
    { 
      label: 'Companies', 
      icon: Building2, 
      isVisible: true,
      children: [
        { label: 'All Companies', path: '/superadmin/companies', icon: Eye },
        { label: 'All Admins', path: '/superadmin/admins', icon: Eye },
      ]
    },
    { 
      label: 'Subscriptions', 
      icon: Layers, 
      isVisible: true,
      children: [
        { label: 'Plans', path: '/superadmin/plans', icon: Zap },
        { label: 'Requests', path: '/superadmin/subscriptions', icon: Clock },
      ]
    },
    { 
      label: 'Support', 
      icon: MessageCircle, 
      path: '/superadmin/support', 
      isVisible: true,
      badge: openTicketCount > 0 ? openTicketCount : null
    },
    { label: 'Settings', icon: Settings, path: '/superadmin/settings', isVisible: true },
  ];

  const renderMenuItem = (item) => {
    if (!item.isVisible) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label];
    const isActive = (item.path && location.pathname.startsWith(item.path)) || (hasChildren && item.children.some(child => location.pathname === child.path));

    if (hasChildren) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleMenu(item.label)}
            className={cn(
              "w-full group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
              isActive ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-5 w-5", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white")} />
              <span className="font-bold">{item.label}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
          </button>
          
          {isOpen && (
            <div className="ml-4 pl-4 border-l border-slate-700 space-y-1 animate-in slide-in-from-top-2 duration-300">
              {item.children.map(child => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    isActive 
                      ? "bg-blue-600/10 text-blue-400" 
                      : "text-slate-500 hover:text-white hover:bg-slate-800"
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
          "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative",
          isActive 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        )}
      >
        <item.icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
        <span className="font-bold flex-1">{item.label}</span>
        {item.badge && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black animate-pulse shadow-lg shadow-red-500/20">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-2xl transition-all duration-300">
      <div className="p-6 border-b border-slate-800 bg-slate-950/20">
        <h1 className="text-xl font-black tracking-tighter text-blue-400">XTown <span className="text-white italic">SUPER</span></h1>
        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1 opacity-80">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map(renderMenuItem)}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <NavLink 
          to="/superadmin/profile"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl border transition-all ${
            isActive ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-[10px] uppercase shadow-inner italic border border-white/10">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">Super Admin</p>
            <p className="text-xs font-black truncate text-white uppercase tracking-tighter">{user?.name || 'Authorized'}</p>
          </div>
          <ChevronRight className="h-3 w-3 text-slate-500" />
        </NavLink>
        <Button 
          variant="ghost" 
          onClick={logout}
          className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-400/10 gap-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </Button>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
