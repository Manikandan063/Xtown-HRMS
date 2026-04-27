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
import { Plus, Loader2, Building2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const AddDepartmentModal = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFetch('/departments', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Department created successfully');
      setOpen(false);
      setFormData({ name: '', code: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-black uppercase text-[11px] tracking-widest bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-5 w-5" />
          New Department
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
             <Building2 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">Organization Node Entry</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium italic">
            Define a new functional unit within the enterprise architecture.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Department Name</label>
            <Input 
              placeholder="Ex: Engineering" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Identity Code</label>
            <Input 
              placeholder="Ex: ENG-01" 
              required 
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-mono font-bold"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
            <Button type="submit" disabled={loading} className="px-8 rounded-xl shadow-lg shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[11px] tracking-widest">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Registration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepartmentModal;
