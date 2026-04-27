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
import { Plus, Loader2, Clock } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const AddShiftModal = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shiftName: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 15
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFetch('/shift/create', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Shift protocol established');
      setOpen(false);
      setFormData({ shiftName: '', startTime: '09:00', endTime: '18:00', gracePeriod: 15 });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to create shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-black uppercase text-[11px] tracking-widest bg-blue-600 hover:bg-blue-700">
          <Plus className="h-5 w-5" />
          Define New Shift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
             <Clock className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">Temporal Shift Policy</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium italic">
            Configure working hours and rotational window parameters.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Policy Identity (Shift Name)</label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Clock In Threshold</label>
              <Input 
                type="time"
                required 
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Clock Out Threshold</label>
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
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Grace Allotment (Minutes)</label>
            <Input 
              type="number"
              required 
              value={formData.gracePeriod}
              onChange={(e) => setFormData({...formData, gracePeriod: parseInt(e.target.value)})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
            <Button type="submit" disabled={loading} className="px-8 rounded-xl shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 font-black uppercase text-[11px] tracking-widest">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Instantiate Policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddShiftModal;
