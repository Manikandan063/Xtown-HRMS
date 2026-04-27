import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  LogOut, 
  Moon, 
  Sun, 
  Monitor, 
  User, 
  Bell 
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

/**
 * Top Navbar component for the HRMS Dashboard
 * Displays current user info, notification alert, and theme controls
 */
const Navbar = () => {
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const roleLabel = isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin HR' : 'Employee';

  return (
    <nav className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-sm bg-card/80">
      {/* Search or Page Title could go here */}
      <div className="flex items-center gap-2">
         <div className="h-6 w-1 bg-primary rounded-full shadow-sm shadow-primary/40" />
         <h2 className="text-xl font-extrabold tracking-tight uppercase text-foreground">
            {user?.companyName || 'XTOWN'}
         </h2>
      </div>


      <div className="flex items-center gap-4">
        {/* Toggle Theme Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {theme === 'light' && <Sun className="h-5 w-5" />}
              {theme === 'dark' && <Moon className="h-5 w-5" />}
              {theme === 'system' && <Monitor className="h-5 w-5" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationCenter />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 rounded-2xl pl-1 pr-4 h-11 border border-transparent hover:border-border hover:bg-muted/50 transition-all">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-xs font-black uppercase tracking-tighter text-foreground truncate max-w-[120px]">{user?.name || user?.full_name || 'Authorized'}</span>
                <span className="text-[9px] text-primary font-black uppercase tracking-widest">{roleLabel}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border border-border bg-card">
            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl font-bold text-muted-foreground hover:text-primary cursor-pointer transition-all" asChild>
              <a href={isSuperAdmin ? "/superadmin/profile" : isAdmin ? "/admin/profile" : "/employee/profile"}>
                <User className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest font-black">View Identity</span>
              </a>
            </DropdownMenuItem>
            <div className="h-px bg-border my-1" />
            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest font-black">Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
