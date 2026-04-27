import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  MoreVertical,
  Minus,
  Maximize2,
  ChevronLeft,
  AlertCircle,
  Clock,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import TicketChatSession from './TicketChatSession';

/**
 * SupportChat - Premium WhatsApp-style Mini Chat Popup
 * Enhanced with Ticket Escalation & Real-Time Support
 */
const SupportChat = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showEscalateBtn, setShowEscalateBtn] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  
  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    issueTitle: '',
    issueDescription: '',
    category: 'UI',
    priority: 'Medium'
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      fetchMyTickets();
      const interval = setInterval(() => {
        if (!activeTicket) fetchMessages();
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [isOpen, activeTicket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isEscalating]);

  const fetchMessages = async () => {
    try {
      const res = await apiFetch('/support/my-messages');
      if (res.status === 'success') {
        setMessages(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch messages');
    }
  };

  const fetchMyTickets = async () => {
    try {
      const res = await apiFetch('/support/my-tickets');
      if (res.status === 'success') {
        setTickets(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch tickets');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/support/send', {
        method: 'POST',
        body: { message: currentInput }
      });

      if (res.status === 'success') {
        setMessages(prev => [...prev, res.data.userMessage, res.data.botResponse]);
        if (res.data.showEscalate) {
          setShowEscalateBtn(true);
        }
      }
    } catch (e) {
      toast.error('Failed to send message');
      setInput(currentInput);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/support/escalate', {
        method: 'POST',
        body: ticketForm
      });

      if (res.status === 'success') {
        toast.success("Issue escalated to SuperAdmin!");
        setIsEscalating(false);
        setShowEscalateBtn(false);
        fetchMyTickets();
        
        // Brief delay for user to see the success state if needed, then set active
        setTimeout(() => {
          setActiveTicket(res.data);
        }, 300);
      }
    } catch (e) {
      toast.error(e.message || "Escalation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-8 right-8 z-[100] transition-all duration-500 ease-in-out flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10",
        isMinimized ? "h-16 w-64 rounded-2xl" : "h-[550px] w-[400px] rounded-[2.5rem] bg-background/80 backdrop-blur-3xl border border-border"
      )}
    >
      {/* HEADER */}
      <div className={cn(
        "bg-primary p-5 flex items-center justify-between text-white shrink-0",
        isMinimized ? "h-full" : "h-24"
      )}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
             {activeTicket ? <Ticket className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">
              {activeTicket ? `Ticket: ${activeTicket.ticketId}` : "Help Desk"}
            </span>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter italic">
              {activeTicket ? `Status: ${activeTicket.status}` : "Online Support"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTicket && (
            <button onClick={() => setActiveTicket(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Back to ChatBot">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {activeTicket ? (
            <div className="flex-1 overflow-hidden flex flex-col">
               <TicketChatSession ticket={activeTicket} />
            </div>
          ) : isEscalating ? (
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-slate-50/50 dark:bg-slate-900/20">
              <form onSubmit={handleEscalate} className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="p-6 bg-card rounded-3xl border-2 border-primary/20 shadow-xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Escalate Issue
                  </h4>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Issue Title (e.g. Payroll Error)" 
                      value={ticketForm.issueTitle}
                      onChange={e => setTicketForm({...ticketForm, issueTitle: e.target.value})}
                      className="bg-muted/50 border-none rounded-xl text-xs font-bold"
                      required
                    />
                    <textarea 
                      placeholder="Detailed Description..."
                      value={ticketForm.issueDescription}
                      onChange={e => setTicketForm({...ticketForm, issueDescription: e.target.value})}
                      className="w-full min-h-[100px] p-4 rounded-xl bg-muted/50 border-none text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select 
                        value={ticketForm.category}
                        onChange={e => setTicketForm({...ticketForm, category: e.target.value})}
                        className="bg-muted/50 border-none rounded-xl text-[10px] font-black uppercase p-3"
                      >
                        <option value="UI">UI Issues</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                      </select>
                      <select 
                        value={ticketForm.priority}
                        onChange={e => setTicketForm({...ticketForm, priority: e.target.value})}
                        className="bg-muted/50 border-none rounded-xl text-[10px] font-black uppercase p-3"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => setIsEscalating(false)} variant="ghost" className="flex-1 rounded-xl text-[10px] font-black uppercase">Cancel</Button>
                    <Button type="submit" disabled={loading} className="flex-1 rounded-xl text-[10px] font-black uppercase bg-primary text-white">Create Ticket</Button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* MESSAGES AREA */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/20 scrollbar-hide"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                     <Bot className="h-12 w-12 text-primary" />
                     <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px]">
                       Ask me anything about the HRMS system. I'm here to help!
                     </p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div 
                    key={msg.id || i}
                    className={cn(
                      "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.type === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm border",
                      msg.type === 'user' 
                        ? "bg-primary text-white border-primary/10 rounded-tr-none" 
                        : "bg-card text-foreground border-border rounded-tl-none"
                    )}>
                       <p className="text-xs font-bold leading-relaxed">{msg.message}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                       {msg.type === 'bot' && <Bot className="h-3 w-3 text-primary" />}
                       <span className="text-[8px] font-black uppercase tracking-tighter opacity-30 italic">
                         {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                ))}
                {showEscalateBtn && (
                  <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-3xl border border-primary/10 animate-in fade-in zoom-in">
                    <p className="text-[9px] font-bold text-center opacity-60 uppercase mb-2">Bot could not resolve this?</p>
                    <Button 
                      onClick={() => setIsEscalating(true)}
                      className="w-full h-10 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                    >
                      Escalate to SuperAdmin
                    </Button>
                  </div>
                )}
                {loading && (
                  <div className="flex items-center gap-2 mr-auto px-1 animate-pulse">
                    <Bot className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Thinking...</span>
                  </div>
                )}
              </div>

              {/* INPUT AREA */}
              <form onSubmit={handleSend} className="p-5 bg-card border-t border-border flex items-center gap-3">
                 <div className="relative flex-1">
                    <Input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type your question..."
                      className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/20 text-xs font-bold pl-5 pr-12"
                    />
                    <button 
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                 </div>
              </form>
            </>
          )}

          {/* MY TICKETS FOOTER */}
          {!isMinimized && tickets.length > 0 && !activeTicket && !isEscalating && (
            <div className="px-6 py-4 border-t border-border bg-muted/20">
               <span className="text-[9px] font-black uppercase opacity-40 mb-2 block">Your Open Tickets</span>
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {tickets.map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => setActiveTicket(t)}
                      className="px-4 py-2 bg-card border border-border rounded-xl whitespace-nowrap text-[9px] font-bold hover:border-primary transition-colors"
                    >
                      #{t.ticketId} - <span className="text-primary uppercase">{t.status}</span>
                    </button>
                  ))}
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SupportChat;
