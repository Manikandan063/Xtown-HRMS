import React, { useState, useEffect } from 'react';
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
import { Plus, Loader2, Clock, Edit3 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const ShiftModal = ({ onSuccess, shift = null, trigger = null }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!shift;
  
  const [formData, setFormData] = useState({
    shiftName: '',
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 15
  });

  useEffect(() => {
    if (open && shift) {
      setFormData({
        shiftName: shift.shiftName || '',
        startTime: shift.startTime || '09:00',
        endTime: shift.endTime || '18:00',
        graceMinutes: shift.graceMinutes || 15
      });
    } else if (open && !shift) {
      setFormData({ shiftName: '', startTime: '09:00', endTime: '18:00', graceMinutes: 15 });
    }
  }, [open, shift]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = isEdit ? `/shift/${shift.id}` : '/shift/create';
      const method = isEdit ? 'PUT' : 'POST';

      await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      toast.success(isEdit ? 'Shift updated successfully' : 'Shift created successfully');

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} shift`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-11 px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-black uppercase text-[11px] tracking-widest bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            Add New Shift
          </Button>

        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-3xl border-none shadow-2xl bg-white">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
             <Clock className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Shift Details' : 'Work Shift Settings'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium italic">
            Set the working hours and late allowance for this shift.
          </DialogDescription>

        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Shift Name</label>

            <Input 
              placeholder="Ex: General Day Shift" 
              required 
              value={formData.shiftName}
              onChange={(e) => setFormData({...formData, shiftName: e.target.value})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Entry Time (Morning)</label>

              <Input 
                type="time"
                required 
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Exit Time (Evening)</label>

              <Input 
                type="time"
                required 
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Allowed Late Minutes</label>

            <Input 
              type="number"
              required 
              value={formData.graceMinutes}
              onChange={(e) => setFormData({...formData, graceMinutes: parseInt(e.target.value)})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
            <Button type="submit" disabled={loading} className="px-8 flex-1 rounded-xl shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 font-black uppercase text-[11px] tracking-widest">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? 'Save Changes' : 'Create Shift')}

            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftModal;
