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
import { Plus, Loader2, Building2, Edit3 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const DepartmentModal = ({ onSuccess, department = null, trigger = null }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(!!department);
  const [employees, setEmployees] = useState([]);
  const isEdit = !!department;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    headId: ''
  });

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch('/employees');
      setEmployees(res?.data || res || []);
    } catch (e) {
      console.error('Failed to load employees');
    }
  };

  useEffect(() => {
    if (open) {
      fetchEmployees();
      if (department) {
        setFormData({
          name: department.name || '',
          code: department.code || '',
          headId: department.headId || ''
        });
        setViewMode(true);
      } else {
        setFormData({ name: '', code: '', headId: '' });
        setViewMode(false);
      }
    }
  }, [open, department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = isEdit ? `/departments/${department.id}` : '/departments';
      const method = isEdit ? 'PUT' : 'POST';

      // Sanitize data
      const payload = {
        ...formData,
        headId: formData.headId === "" ? null : formData.headId
      };

      await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      toast.success(isEdit ? 'Department updated successfully' : 'Department created successfully');
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} department`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-11 px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-black uppercase text-[11px] tracking-widest bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-5 w-5" />
            New Department
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-3xl border-none shadow-2xl">
        <DialogHeader className="flex flex-row justify-between items-start">
          <div className="space-y-1">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
               <Building2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {viewMode ? 'Department Details' : isEdit ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm font-medium italic">
              {viewMode ? 'Viewing department details.' : 'Enter the details for the new department.'}
            </DialogDescription>
          </div>
          {isEdit && viewMode && (
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewMode(false)}
                className="rounded-full flex gap-2 font-bold text-[10px] uppercase tracking-widest h-8 border-emerald-600/20 text-emerald-600 hover:bg-emerald-50"
            >
                <Edit3 className="h-3.5 w-3.5" /> Edit Dept
            </Button>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Department Name</label>
            <Input 
              placeholder="Ex: Engineering" 
              required 
              disabled={viewMode}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Dept Code</label>
            <Input 
              placeholder="Ex: ENG-01" 
              required 
              disabled={viewMode}
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-mono font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Head of Department</label>
            <select 
              disabled={viewMode}
              value={formData.headId}
              onChange={(e) => setFormData({...formData, headId: e.target.value})}
              className="w-full h-12 bg-slate-50 border-slate-100 rounded-2xl px-4 text-sm font-bold outline-none ring-primary/20 focus:ring-2 appearance-none disabled:opacity-50"
            >
              <option value="">Not Assigned</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
            {!viewMode && (
                <Button type="submit" disabled={loading} className="px-8 rounded-xl shadow-lg shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[11px] tracking-widest min-w-[140px]">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? 'Save Changes' : 'Add Department')}
                </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentModal;
