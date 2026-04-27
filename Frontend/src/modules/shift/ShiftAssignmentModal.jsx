import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  X, 
  Loader2, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const ShiftAssignmentModal = ({ shift, trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/employees?limit=1000');
      setEmployees(res?.data || res || []);
    } catch (e) {
      toast.error('Failed to load personnel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const handleAllot = async () => {
    if (selectedIds.length === 0) return toast.error('Select at least one employee');
    try {
      setLoading(true);
      await apiFetch('/shift/bulk-assign', {
        method: 'POST',
        body: JSON.stringify({
          shiftId: shift.id,
          employeeIds: selectedIds
        })
      });
      toast.success('Shift assigned successfully');

      setOpen(false);
      setSelectedIds([]);
    } catch (error) {
      toast.error(error.message || 'Allotment failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filtered = employees.filter(e => 
    (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white">
        <DialogHeader className="p-8 bg-blue-600 text-white">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                 <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Assign Shift to Staff</DialogTitle>
                <DialogDescription className="text-blue-100/70 text-xs font-bold uppercase tracking-widest italic">Selected Shift: {shift.shiftName}</DialogDescription>
              </div>
           </div>
        </DialogHeader>

        <div className="p-6 border-b bg-slate-50 flex items-center gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Employee Name or ID..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-none bg-white rounded-xl text-xs font-bold"
              />
           </div>
           <Badge className="bg-blue-600 rounded-lg px-3 py-1 font-black text-[10px]">{selectedIds.length} Selected</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
           {loading ? (
             <div className="h-full flex items-center justify-center italic font-bold text-slate-300">Loading Employees...</div>

           ) : filtered.length === 0 ? (
             <div className="h-full flex items-center justify-center italic font-bold text-slate-300">No Employees Found.</div>
           ) : (
             filtered.map(e => (
               <div 
                 key={e.id} 
                 onClick={() => toggleSelect(e.id)}
                 className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${selectedIds.includes(e.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}
               >
                  <div className="flex items-center gap-4">
                     <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs transition-colors ${selectedIds.includes(e.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {selectedIds.includes(e.id) ? <CheckCircle2 className="h-5 w-5" /> : e.firstName[0]}
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900">{e.firstName} {e.lastName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{e.employeeCode} • {e.designation?.name || 'Associate'}</p>
                     </div>
                  </div>
                  {e.shiftId === shift.id && !selectedIds.includes(e.id) && (
                    <Badge variant="outline" className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 border-emerald-100">Assigned</Badge>
                  )}
               </div>
             ))
           )}
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-4">
           <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
           <Button onClick={handleAllot} disabled={loading || selectedIds.length === 0} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-200">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Assign Shift to ${selectedIds.length} Employees`}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftAssignmentModal;
