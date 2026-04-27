import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, ArrowLeft, UserPlus } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const AddEmployeePage = () => {
  const navigate = useNavigate();
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
      navigate('/admin/employees');
    } catch (error) {
      toast.error(error.message || 'Failed to onboard employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 px-2">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full hover:bg-white shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Add New Employee</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-60">Create a new employee profile.</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl p-2">
        <CardHeader className="p-8 pb-4">
           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <UserPlus className="h-7 w-7" />
           </div>
           <CardTitle className="text-xl font-bold tracking-tight">Employee Details</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">First Name</label>
                <Input 
                  name="firstName" 
                  placeholder="Ex: John" 
                  required 
                  value={formData.firstName}
                  onChange={handleChange}
                  className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-primary font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Last Name</label>
                <Input 
                  name="lastName" 
                  placeholder="Ex: Doe" 
                  required 
                  value={formData.lastName}
                  onChange={handleChange}
                  className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-primary font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Official Corporate Email</label>
              <Input 
                name="officialEmail" 
                type="email" 
                placeholder="john.doe@xtown.in" 
                required 
                value={formData.officialEmail}
                onChange={handleChange}
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-primary font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Employee ID</label>
                <Input 
                  name="employeeCode" 
                  placeholder="XT-001" 
                  required 
                  value={formData.employeeCode}
                  onChange={handleChange}
                  className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-primary font-mono font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Communication Channel</label>
                <Input 
                  name="phone" 
                  placeholder="+91 98765 43210" 
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-primary font-bold"
                />
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => navigate('/admin/employees')}
                className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400"
              >
                Cancel Process
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 h-12 rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-blue-600 font-black uppercase text-[11px] tracking-widest"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEmployeePage;
