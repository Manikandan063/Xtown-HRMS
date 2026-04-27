import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
  User,
  Building,
  X,
  Star
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import TicketChatSession from '@/components/support/TicketChatSession';
import { cn } from '@/lib/utils';

const SupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  // Reset typing when ticket changes
  useEffect(() => {
    setTypingUser(null);
  }, [selectedTicket?.id]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/support/superadmin-tickets');
      if (res.status === 'success') {
        setTickets(res.data);
      }
    } catch (e) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ticketId, status) => {
    try {
      const res = await apiFetch(`/support/ticket/${ticketId}/status`, {
        method: 'PATCH',
        body: { status }
      });
      if (res.status === 'success') {
        toast.success(`Ticket marked as ${status}`);
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status });
        }
      }
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.ticketId.toLowerCase().includes(search.toLowerCase()) || 
                          t.issueTitle.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      {/* TICKET LIST */}
      <div className="w-1/3 flex flex-col bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
               <Ticket className="h-4 w-4" />
               Support Queue
             </h2>
             <Badge className="bg-primary/10 text-primary border-none text-[10px] px-3">{tickets.length} Total</Badge>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search Ticket ID or Title..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-muted/50 border-none text-xs font-bold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           {loading ? (
             <div className="flex flex-col gap-3 p-4 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted/50 rounded-2xl w-full" />)}
             </div>
           ) : filteredTickets.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
                <Ticket className="h-12 w-12" />
                <p className="text-[10px] font-black uppercase tracking-widest">No tickets found</p>
             </div>
           ) : (
             filteredTickets.map(ticket => (
               <div 
                 key={ticket.id}
                 onClick={() => setSelectedTicket(ticket)}
                 className={cn(
                   "p-4 rounded-3xl border-2 transition-all cursor-pointer group relative overflow-hidden",
                   selectedTicket?.id === ticket.id 
                    ? "bg-primary/5 border-primary/20 ring-4 ring-primary/5" 
                    : "bg-muted/20 border-transparent hover:border-muted/50"
                 )}
               >
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-black uppercase text-primary tracking-widest">#{ticket.ticketId}</span>
                   <Badge variant={ticket.priority === 'High' ? 'destructive' : 'outline'} className="text-[8px] px-2 py-0">
                     {ticket.priority}
                   </Badge>
                 </div>
                 <h3 className="text-xs font-bold mb-1 line-clamp-1">{ticket.issueTitle}</h3>
                 <p className="text-[10px] font-black uppercase text-primary/60 mb-3 tracking-tighter">{ticket.companyInfo?.companyName}</p>
                 <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-tighter opacity-40 italic">
                    <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {ticket.user?.name}</span>
                    <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                 </div>
                 {selectedTicket?.id === ticket.id && (
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-1 opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight className="h-4 w-4 text-primary" />
                   </div>
                 )}
               </div>
             ))
           )}
        </div>
      </div>

      {/* TICKET DETAILS & CHAT */}
      <div className="flex-1 bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-2xl flex flex-col">
         {selectedTicket ? (
           <>
             {/* DETAIL HEADER */}
             <div className="p-8 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between mb-6">
                   <div className="space-y-1">
                      <h1 className="text-xl font-black italic tracking-tight">{selectedTicket.issueTitle}</h1>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                         <span className="flex items-center gap-1.5 text-primary"><Ticket className="h-3 w-3" /> {selectedTicket.ticketId}</span>
                         <span className="flex items-center gap-1.5"><Building className="h-3 w-3" /> {selectedTicket.category}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <select 
                        value={selectedTicket.status}
                        onChange={(e) => updateStatus(selectedTicket.id, e.target.value)}
                        className="bg-muted px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-primary/20 border-none cursor-pointer"
                      >
                         <option value="Open">Open</option>
                         <option value="In Progress">In Progress</option>
                         <option value="Resolved">Resolved</option>
                      </select>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="rounded-full h-10 w-10">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                 </div>

                 {typingUser && (
                   <div className="mb-4 flex items-center gap-2 animate-pulse">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">
                        ✍️ {typingUser} is typing...
                      </span>
                   </div>
                 )}

                 {/* RATING DISPLAY FOR SUPERADMIN */}
                 {selectedTicket.status === 'Resolved' && selectedTicket.rating && (
                   <div className="mb-6 p-4 bg-yellow-500/5 rounded-3xl border border-yellow-500/20 flex flex-col items-center gap-2 animate-in zoom-in-95 duration-500">
                      <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400">Customer Rating</p>
                      <div className="flex gap-1">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <Star 
                             key={star} 
                             className={cn(
                               "h-5 w-5",
                               star <= selectedTicket.rating ? "fill-yellow-500 stroke-yellow-500" : "fill-transparent stroke-muted-foreground opacity-30"
                             )} 
                           />
                         ))}
                      </div>
                      {selectedTicket.ratingFeedback && (
                        <p className="text-xs font-bold italic opacity-70 text-center px-4 mt-1 border-t border-yellow-500/10 pt-2 w-full">
                          "{selectedTicket.ratingFeedback}"
                        </p>
                      )}
                   </div>
                 )}

                 <div className="grid grid-cols-3 gap-6">
                    <div className="p-4 bg-muted/30 rounded-3xl border border-white/5">
                       <span className="block text-[8px] font-black uppercase opacity-40 mb-1">Company Details</span>
                       <p className="text-[11px] font-bold text-primary">{selectedTicket.companyInfo?.companyName}</p>
                       <div className="flex items-center gap-1 mt-1 opacity-60">
                          <Building className="h-2.5 w-2.5" />
                          <span className="text-[9px] font-medium">Business Account</span>
                       </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-3xl border border-white/5">
                       <span className="block text-[8px] font-black uppercase opacity-40 mb-1">HR / Admin Name</span>
                       <p className="text-[11px] font-bold">{selectedTicket.user?.name}</p>
                       <p className="text-[9px] font-medium opacity-60">{selectedTicket.user?.email}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-3xl border border-white/5">
                       <span className="block text-[8px] font-black uppercase opacity-40 mb-1">Issue Overview</span>
                       <p className="text-[11px] font-bold leading-relaxed line-clamp-2 italic">"{selectedTicket.issueTitle}"</p>
                    </div>
                 </div>
             </div>

             {/* CHAT SESSION */}
             <div className="flex-1 min-h-0">
                <TicketChatSession 
                  ticket={selectedTicket} 
                  hideHeader={true} 
                  onTypingChange={(userName) => setTypingUser(userName)}
                />
             </div>
           </>
         ) : (
           <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/10 animate-pulse">
                 <ShieldCheck className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-lg font-black uppercase tracking-widest italic">SuperAdmin Support Center</h2>
                 <p className="text-xs font-bold text-muted-foreground px-24 leading-relaxed opacity-60">
                   Select a ticket from the queue to start real-time assistance. 
                   Ensure you update the status once the issue is resolved.
                 </p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default SupportManagement;
