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
import { Plus, Loader2, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const AddDesignationModal = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    departmentId: ''
  });

  const fetchDepartments = async () => {
    try {
      const res = await apiFetch('/departments');
      setDepartments(res?.data || res || []);
    } catch (e) {
      console.error('Failed to load departments');
    }
  };

  useEffect(() => {
    if (open) fetchDepartments();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId) {
       return toast.error("Please select a department");
    }
    try {
      setLoading(true);
      await apiFetch('/designations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Designation created successfully');
      setOpen(false);
      setFormData({ name: '', departmentId: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to create designation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-black uppercase text-[11px] tracking-widest bg-slate-900 hover:bg-slate-800">
          <Plus className="h-5 w-5" />
          Create New Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
             <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">Personnel Role Definition</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium italic">
            Assign a new professional title to the enterprise hierarchy.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-1">Parent Department</label>
            <select 
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
              className="w-full h-12 bg-slate-50 border-slate-100 rounded-2xl px-4 text-sm font-bold outline-none ring-primary/20 focus:ring-2 appearance-none"
            >
              <option value="">Select organizational node...</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-1">Designation Title</label>
            <Input 
              placeholder="Ex: Senior Software Engineer" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
            <Button type="submit" disabled={loading} className="px-8 rounded-xl shadow-lg shadow-amber-200 bg-slate-900 hover:bg-slate-800 font-black uppercase text-[11px] tracking-widest">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Authorize Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDesignationModal;
