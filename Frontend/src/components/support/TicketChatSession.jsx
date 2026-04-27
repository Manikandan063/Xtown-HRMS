import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Bot, User, ShieldCheck, Paperclip, FileText, Download, X as CloseIcon, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TicketChatSession = ({ ticket, hideHeader = false, onTypingChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSuperAdminOnline, setIsSuperAdminOnline] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userRating, setUserRating] = useState(ticket.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState(ticket.ratingFeedback || '');
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(!!ticket.rating);
  
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize Socket Connection
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', {
      query: { userId: user.id }
    });
    socketRef.current = socket;

    socket.emit("join_ticket", ticket.id);

    socket.on("initial_online_users", (onlineIds) => {
       if (ticket.assignedTo && onlineIds.includes(ticket.assignedTo)) {
         setIsSuperAdminOnline(true);
       }
    });

    socket.on("new_message", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTypingUser(null); // Stop typing when message arrives
    });

    socket.on("user_status_change", ({ userId, status }) => {
       if (ticket.assignedTo === userId) {
         setIsSuperAdminOnline(status === 'online');
       }
    });

    socket.on("user_typing", ({ userId: senderUserId, userName }) => {
       // Convert to string to ensure comparison works
       if (String(senderUserId) !== String(user.id)) {
         setTypingUser(userName || 'Someone');
         if (onTypingChange) onTypingChange(userName || 'Someone');
       }
    });

    socket.on("user_stop_typing", ({ userId: senderUserId }) => {
       if (String(senderUserId) !== String(user.id)) {
         setTypingUser(null);
         if (onTypingChange) onTypingChange(null);
       }
    });

    // Fetch History
    fetchHistory();

    return () => {
      // Don't disconnect the whole socket, just leave the room
      if (socketRef.current) {
        socketRef.current.emit("leave_ticket", ticket.id);
      }
    };
  }, [ticket.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch(`/support/ticket/${ticket.id}/messages`);
      if (res.status === 'success') {
        setMessages(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch history');
    }
  };

  const handleRatingSubmit = async () => {
    if (userRating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      const res = await apiFetch(`/support/ticket/${ticket.id}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating: userRating, feedback: ratingFeedback })
      });

      if (res.status === 'success') {
        setIsRatingSubmitted(true);
        toast.success("Thank you for your feedback!");
      }
    } catch (e) {
      toast.error("Failed to submit rating");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 10MB Limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/support/upload-attachment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await res.json();

      if (data.status === 'success') {
        // Send message with attachment
        const receiverId = user.role === 'super_admin' ? ticket.userId : ticket.assignedTo;
        socketRef.current.emit("send_message", {
          ticketId: ticket.id,
          senderId: user.id,
          receiverId: receiverId,
          message: `Shared a ${data.data.type}: ${data.data.originalName}`,
          attachmentUrl: data.data.url,
          attachmentType: data.data.type
        });
        toast.success("File uploaded and shared");
      }
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Emit typing event
    if (socketRef.current) {
      socketRef.current.emit("typing", {
        ticketId: ticket.id,
        userId: user.id,
        userName: user.name
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Set new timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("stop_typing", {
          ticketId: ticket.id,
          userId: user.id
        });
      }, 3000);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Determine receiverId
    const receiverId = user.role === 'super_admin' ? ticket.userId : ticket.assignedTo;

    socketRef.current.emit("send_message", {
      ticketId: ticket.id,
      senderId: user.id,
      receiverId: receiverId,
      message: input
    });

    // Stop typing immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit("stop_typing", {
      ticketId: ticket.id,
      userId: user.id
    });

    setInput('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* TICKET SUMMARY HEADER */}
      {!hideHeader && (
        <div className="bg-primary/5 p-4 border-b border-border space-y-2">
           <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">#{ticket.ticketId} - {ticket.category}</span>
              <div className="flex items-center gap-2">
                {typingUser ? (
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">
                    ✍️ {typingUser} is typing...
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    {isSuperAdminOnline ? "🟢 Online" : "⚪ Offline"}
                  </span>
                )}
              </div>
           </div>
           <h4 className="text-xs font-black italic">{ticket.issueTitle}</h4>
           <div className="flex gap-2">
              <span className={cn(
                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                ticket.priority === 'High' ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
              )}>
                {ticket.priority} Priority
              </span>
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {ticket.status}
              </span>
           </div>
           <p className="text-[10px] font-medium opacity-60 line-clamp-1 italic">"{ticket.issueDescription}"</p>
        </div>
      )}
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-50/30 dark:bg-slate-900/10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
             <Bot className="h-8 w-8 mb-2" />
             <p className="text-[9px] font-black uppercase tracking-widest">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div 
            key={msg.id || i}
            className={cn(
              "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
              msg.senderId === user.id ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-3 rounded-2xl shadow-sm border space-y-2",
              msg.senderId === user.id 
                ? "bg-primary text-white border-primary/10 rounded-tr-none" 
                : "bg-card text-foreground border-border rounded-tl-none"
            )}>
               {msg.attachmentUrl && (
                 <div className="mb-2">
                    {msg.attachmentType === 'image' ? (
                      <img 
                        src={msg.attachmentUrl} 
                        alt="Attachment" 
                        className="rounded-xl max-w-full h-auto border border-white/10 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.attachmentUrl, '_blank')}
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-black/10 rounded-xl border border-white/5 group">
                         <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-bold truncate">Attachment</p>
                            <a 
                              href={msg.attachmentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[9px] underline opacity-70 hover:opacity-100 flex items-center gap-1"
                            >
                               <Download className="h-2.5 w-2.5" /> Download
                            </a>
                         </div>
                      </div>
                    )}
                 </div>
               )}
               {msg.message && <p className="text-xs font-bold leading-relaxed">{msg.message}</p>}
            </div>
            <span className="text-[7px] font-black uppercase tracking-tighter opacity-30 mt-1 px-1">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {/* RATING SECTION FOR USER */}
        {ticket.status === 'Resolved' && user.role !== 'super_admin' && (
          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4 animate-in zoom-in-95 duration-300">
             <div className="text-center space-y-1">
                <h5 className="text-sm font-black uppercase tracking-widest text-primary">Conversation Resolved</h5>
                <p className="text-[10px] font-medium opacity-60 italic">Please rate your experience with our support team</p>
             </div>

             <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled={isRatingSubmitted}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => !isRatingSubmitted && setHoverRating(star)}
                    onMouseLeave={() => !isRatingSubmitted && setHoverRating(0)}
                    className="p-1 transition-all duration-200 hover:scale-125"
                  >
                    <Star 
                      className={cn(
                        "h-8 w-8 fill-transparent stroke-primary transition-all duration-300",
                        (hoverRating || userRating) >= star && "fill-primary stroke-primary scale-110",
                        isRatingSubmitted && "opacity-50"
                      )} 
                    />
                  </button>
                ))}
             </div>

             {!isRatingSubmitted ? (
               <div className="space-y-3">
                  <textarea 
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    placeholder="Optional: How can we improve?"
                    className="w-full bg-white/50 dark:bg-black/20 border border-primary/10 rounded-2xl p-3 text-[11px] font-bold focus:ring-1 ring-primary outline-none min-h-[60px]"
                  />
                  <button 
                    onClick={handleRatingSubmit}
                    className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] py-3 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Submit Feedback
                  </button>
               </div>
             ) : (
               <div className="text-center py-2 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Feedback Submitted! Thank you.</p>
               </div>
             )}
          </div>
        )}

        {(typingUser || isUploading) && (
          <div className="flex items-center gap-2 mr-auto mb-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 animate-in fade-in slide-in-from-left-2">
            <div className="flex gap-1">
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-duration:0.8s]" />
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-primary italic">
              {isUploading ? "Uploading file..." : "typing..."}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-border bg-card flex items-center gap-2">
         <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
         />
         <button 
           type="button"
           onClick={() => fileInputRef.current?.click()}
           disabled={isUploading}
           className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors disabled:opacity-50"
         >
           <Paperclip className="h-4 w-4" />
         </button>
         <Input 
           value={input}
           onChange={handleInputChange}
           placeholder="Type your message..."
           className="h-10 rounded-xl bg-muted/50 border-none text-xs font-bold focus-visible:ring-primary/20"
         />
         <button 
           type="submit"
           disabled={!input.trim() || isUploading}
           className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
         >
           <Send className="h-4 w-4" />
         </button>
      </form>
    </div>
  );
};


export default TicketChatSession;
