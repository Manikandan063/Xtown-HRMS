import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilePlus, Loader2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const ApplyLeaveModal = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const fetchLeaveTypes = async () => {
    try {
      const data = await apiFetch('/leave/type');
      const types = data?.data || data || [];
      setLeaveTypes(types);
      if (types.length > 0) setFormData(prev => ({ ...prev, leaveTypeId: String(types[0].id) }));
    } catch (e) {
      console.error('Failed to load leave types');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFetch('/leave/request', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Leave application submitted successfully');
      setOpen(false);
      setFormData({ leaveTypeId: leaveTypes[0]?.id ? String(leaveTypes[0].id) : '', fromDate: '', toDate: '', reason: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) fetchLeaveTypes();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 rounded-xl h-11 px-6 shadow-md shadow-primary/20 font-bold">
          <FilePlus className="h-5 w-5" /> Apply for Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Request Leave</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium">
            Please provide the duration and reason for your leave.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Leave Category</label>
            <div className="relative">
              <select
                name="leaveTypeId"
                value={String(formData.leaveTypeId)}
                onChange={handleChange}
                className="w-full h-12 bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-5 text-sm font-bold outline-none ring-primary/10 focus:ring-2 appearance-none cursor-pointer pr-10"
              >
                {leaveTypes
                  .filter(type => type.leaveName !== 'Earned Leave')
                  .map(type => (
                    <option key={type.id} value={String(type.id)}>{type.leaveName}</option>
                  ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">From Date</label>
              <Input 
                name="fromDate" 
                type="date"
                required 
                value={formData.fromDate}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">To Date</label>
              <Input 
                name="toDate" 
                type="date"
                required 
                value={formData.toDate}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
          </div>

          {(formData.fromDate && formData.toDate) && (
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-between border border-blue-100/50 dark:border-blue-900/20">
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Calendar Span</span>
               <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-blue-900 dark:text-blue-200 tracking-tighter italic">
                     {Math.max(0, Math.floor((new Date(formData.toDate) - new Date(formData.fromDate)) / (1000 * 60 * 60 * 24)) + 1)}
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Days</span>
               </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Reason for Leave</label>
            <Input 
              name="reason" 
              placeholder="Ex: Medical appointment, Family vacation" 
              required 
              value={formData.reason}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="px-8 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-blue-600 min-w-[140px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyLeaveModal;
