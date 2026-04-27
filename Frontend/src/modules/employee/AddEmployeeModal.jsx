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
import { Plus, Loader2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const AddEmployeeModal = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    officialEmail: '',
    employeeCode: '',
    personalEmail: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFetch('/employees', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Employee onboarded successfully');
      setOpen(false);
      setFormData({ firstName: '', lastName: '', officialEmail: '', employeeCode: '', personalEmail: '', phone: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to onboard employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 shadow-lg shadow-primary/20 flex gap-2 font-semibold">
          <Plus className="h-5 w-5" />
          Onboard Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Onboard New Talent</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium italic">
            Enter the basic details to initialize the employee profile.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
              <Input 
                name="firstName" 
                placeholder="Ex: John" 
                required 
                value={formData.firstName}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
              <Input 
                name="lastName" 
                placeholder="Ex: Doe" 
                required 
                value={formData.lastName}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Official Email</label>
            <Input 
              name="officialEmail" 
              type="email" 
              placeholder="john.doe@company.com" 
              required 
              value={formData.officialEmail}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Emp Code</label>
              <Input 
                name="employeeCode" 
                placeholder="EMP001" 
                required 
                value={formData.employeeCode}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone</label>
              <Input 
                name="phone" 
                placeholder="+1 234 567 890" 
                value={formData.phone}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="px-8 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-blue-600 min-w-[140px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Onboarding'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
