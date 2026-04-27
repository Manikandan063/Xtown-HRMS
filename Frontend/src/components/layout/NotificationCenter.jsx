import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Trash2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch("/notification/me");
      const list = data?.data || data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch (e) {
      // Background notifications failure is silent to avoid console spam
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10s for "Fast approval"
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/notification/${id}/read`, { method: "PATCH" });
      fetchNotifications();
    } catch (e) {}
  };

    const handleAction = async (notif) => {
    markAsRead(notif.id);
    if (notif.type === "LEAVE_REQUEST") {
      if (notif.referenceId) {
        try {
          await apiFetch(`/leave/request/${notif.referenceId}/view`, { method: "PATCH" });
        } catch (e) {}
      }
      navigate("/admin/leave");
    } else if (notif.type === "LEAVE_STATUS_UPDATE") {
      navigate("/employee/leave");
    } else if (notif.type === "RESIGNATION") {
      navigate("/admin/resignation");
    } else if (notif.type === "RESIGNATION_UPDATE" || notif.type === "RESIGNATION_CANCELLED") {
      navigate("/employee/resignation");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative group transition-all hover:bg-primary/5 hover:scale-105">
          <Bell className={cn("h-5 w-5 text-slate-500 group-hover:text-primary transition-all", unreadCount > 0 && "animate-bell-ring text-primary")} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5 shadow-sm">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border-2 border-white"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-[2rem] shadow-2xl border border-border bg-card overflow-hidden mt-2">
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-widest italic leading-none">Notifications</span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 italic">{unreadCount} New Alerts</span>
          </div>
          <Bell className="h-6 w-6 text-white" />
        </div>
        
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.filter(n => !n.isRead).length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground/30">
               <CheckCircle2 className="h-10 w-10 opacity-20 mb-3" />
               <span className="text-[10px] font-black uppercase tracking-widest italic">All caught up!</span>
            </div>
          ) : (
            notifications
              .filter(n => !n.isRead)
              .map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleAction(n)}
                  className="p-5 flex gap-4 cursor-pointer hover:bg-muted/50 transition-all border-b border-border last:border-none bg-primary/5"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                    {n.type === 'LEAVE_REQUEST' ? <Clock className="h-5 w-5" /> : 
                     n.type.startsWith('RESIGNATION') ? <Trash2 className="h-5 w-5" /> : 
                     <Bell className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black text-foreground uppercase truncate mb-1">{n.title}</span>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed mb-2 line-clamp-2">{n.message}</p>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Quick Action →</span>
                  </div>
                </div>
              ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 bg-muted/30 border-t border-border">
             <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all">
                Clear Intelligence Log
             </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
