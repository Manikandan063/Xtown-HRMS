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
import { Plus, Loader2, ShieldCheck, Edit3 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const DesignationModal = ({ onSuccess, designation = null, trigger = null }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(!!designation);
  const isEdit = !!designation;
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
    if (open) {
      fetchDepartments();
      if (designation) {
        setFormData({
          name: designation.name || '',
          departmentId: designation.departmentId || ''
        });
        setViewMode(true);
      } else {
        setFormData({ name: '', departmentId: '' });
        setViewMode(false);
      }
    }
  }, [open, designation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId) {
       return toast.error("Please select a department");
    }
    try {
      setLoading(true);
      const url = isEdit ? `/designations/${designation.id}` : '/designations';
      const method = isEdit ? 'PUT' : 'POST';

      await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      toast.success(isEdit ? 'Designation updated successfully' : 'Designation created successfully');
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} designation`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-11 px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-black uppercase text-[11px] tracking-widest bg-slate-900 hover:bg-slate-800 transition-all">
            <Plus className="h-5 w-5" />
            Add New Designation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-3xl border-none shadow-2xl">
        <DialogHeader className="flex flex-row justify-between items-start">
          <div className="space-y-1">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
               <ShieldCheck className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {viewMode ? 'Designation Details' : isEdit ? 'Edit Designation' : 'Add New Designation'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm font-medium italic">
              {viewMode ? 'Viewing designation details.' : 'Enter the details for the new designation.'}
            </DialogDescription>
          </div>
          {isEdit && viewMode && (
             <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewMode(false)}
                className="rounded-full flex gap-2 font-bold text-[10px] uppercase tracking-widest h-8 border-amber-600/20 text-amber-600 hover:bg-amber-50"
             >
                <Edit3 className="h-3.5 w-3.5" /> Edit Role
             </Button>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-1">Parent Department</label>
            <select 
              required
              disabled={viewMode}
              value={formData.departmentId}
              onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
              className="w-full h-12 bg-slate-50 border-slate-100 rounded-2xl px-4 text-sm font-bold outline-none ring-primary/20 focus:ring-2 appearance-none disabled:opacity-50"
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
              disabled={viewMode}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
            {!viewMode && (
              <Button type="submit" disabled={loading} className="px-8 rounded-xl shadow-lg shadow-amber-200 bg-slate-900 hover:bg-slate-800 font-black uppercase text-[11px] tracking-widest min-w-[140px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? 'Save Changes' : 'Add Designation')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignationModal;
