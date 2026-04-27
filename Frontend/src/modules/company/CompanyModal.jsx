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
import { Plus, Loader2, Building2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const CompanyModal = ({ onSuccess, company = null, open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(!!company);
  const isEdit = !!company;

  const [plans, setPlans] = useState([]);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    domain: '',
    registrationNumber: '',
    currentPlanId: ''
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const result = await apiFetch('/subscription/plans');
        setPlans(result?.data || result || []);
      } catch (error) {
        console.error('Failed to fetch plans');
      }
    };

    if (open) {
      fetchPlans();
      if (company) {
        setFormData({
          companyName: company.companyName || company.name || '',
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || '',
          domain: company.domain || '',
          registrationNumber: company.registrationNumber || '',
          currentPlanId: company.currentPlanId || ''
        });
        setIsReadOnly(true);
      } else {
        setFormData({ companyName: '', email: '', phone: '', address: '', domain: '', registrationNumber: '', currentPlanId: '' });
        setIsReadOnly(false);
      }
    }
  }, [open, company]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    try {
      setLoading(true);
      const url = isEdit ? `/companies/${company.id}` : '/companies';
      const method = isEdit ? 'PUT' : 'POST';
      
      await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      
      toast.success(isEdit ? 'Company details updated' : 'Company added successfully');
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Building2 className="h-32 w-32" />
        </div>
        
        <DialogHeader className="relative z-10 px-8 pt-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                {isEdit ? (isReadOnly ? 'Company Details' : 'Edit Company') : 'Add New Company'}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                System ID: {company?.id?.slice(0, 8) || 'NEW'}
              </DialogDescription>
            </div>
            {isEdit && isReadOnly && (
              <Button 
                onClick={() => setIsReadOnly(false)}
                variant="outline" 
                className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest border-blue-100 text-blue-600 hover:bg-blue-50 transition-all hover:scale-105"
              >
                Edit Details
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Company Name</label>
              <Input 
                name="companyName" 
                disabled={isReadOnly}
                required 
                value={formData.companyName}
                onChange={handleChange}
                className="h-12 rounded-2xl bg-slate-50 border-none focus:ring-0 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Domain / Website</label>
                <Input 
                  name="domain" 
                  disabled={isReadOnly}
                  value={formData.domain}
                  onChange={handleChange}
                  placeholder="e.g. xtown.com"
                  className="h-12 rounded-2xl bg-slate-50 border-none font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Subscription Plan</label>
                <select
                  name="currentPlanId"
                  disabled={isReadOnly}
                  value={formData.currentPlanId}
                  onChange={handleChange}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-4 text-xs font-black uppercase tracking-widest text-slate-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Plan Type</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name} — ₹{plan.price}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Reg. Identity / GST</label>
               <Input 
                 name="registrationNumber" 
                 disabled={isReadOnly}
                 value={formData.registrationNumber}
                 onChange={handleChange}
                 className="h-12 rounded-2xl bg-slate-50 border-none font-mono text-sm"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Contact Email</label>
                <Input 
                  name="email" 
                  disabled={isReadOnly}
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 rounded-2xl bg-slate-50 border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Phone Number</label>
                <Input 
                  name="phone" 
                  disabled={isReadOnly}
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-12 rounded-2xl bg-slate-50 border-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Company Address</label>
              <Input 
                name="address" 
                disabled={isReadOnly}
                value={formData.address}
                onChange={handleChange}
                className="h-12 rounded-2xl bg-slate-50 border-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-slate-50 gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400">Close</Button>
            {!isReadOnly && (
              <Button 
                type="submit" 
                disabled={loading} 
                className="px-10 h-12 rounded-2xl shadow-xl shadow-blue-500/30 bg-blue-600 hover:bg-blue-700 min-w-[180px] font-black uppercase text-[11px] tracking-widest"
              >
                 {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? 'Save Changes' : 'Create Company')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyModal;
