import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2, Save, X, Layers, Users, IndianRupee, Clock } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const PlanModal = ({ open, setOpen, plan, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    maxEmployees: '',
    durationDays: '',
    isActive: true,
    features: []
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price,
        maxEmployees: plan.maxEmployees,
        durationDays: plan.durationDays || 30,
        isActive: plan.isActive,
        features: plan.features || []
      });
    } else {
      setFormData({
        name: '',
        price: '',
        maxEmployees: '',
        durationDays: '30',
        isActive: true,
        features: ['attendance', 'leave']
      });
    }
  }, [plan, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const method = plan ? 'PUT' : 'POST';
      const url = plan ? `/subscription/plans/${plan.id}` : '/subscription/plans';
      
      await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      toast.success(plan ? 'Tier architecture updated.' : 'New tier deployed successfully.');
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
           <Zap className="absolute -bottom-8 -right-8 h-40 w-40 opacity-10 rotate-12" />
           <DialogHeader>
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                 <Layers className="h-8 w-8 text-blue-400" /> {plan ? 'Modify Tier' : 'Deploy New Tier'}
              </DialogTitle>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] pl-1">Subscription Architecture Protocol</p>
           </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Identifier</Label>
              <div className="relative group">
                 <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                 <Input 
                   required
                   placeholder="Ex: PREMIUM" 
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                   className="h-14 rounded-2xl pl-12 bg-slate-50 border-none font-black italic tracking-widest text-lg"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price per Month</Label>
              <div className="relative group">
                 <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                 <Input 
                   type="number"
                   required
                   placeholder="0.00" 
                   value={formData.price}
                   onChange={(e) => setFormData({...formData, price: e.target.value})}
                   className="h-14 rounded-2xl pl-12 bg-slate-50 border-none font-black text-lg"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Employee Capacity</Label>
              <div className="relative group">
                 <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                 <Input 
                   type="number"
                   required
                   placeholder="50" 
                   value={formData.maxEmployees}
                   onChange={(e) => setFormData({...formData, maxEmployees: e.target.value})}
                   className="h-14 rounded-2xl pl-12 bg-slate-50 border-none font-black text-lg"
                 />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Validity (Days)</Label>
              <div className="relative group">
                 <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                 <Input 
                   type="number"
                   required
                   placeholder="Ex: 28 for Basic, 60 for Premium" 
                   value={formData.durationDays}
                   onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                   className="h-14 rounded-2xl pl-12 bg-slate-50 border-none font-black"
                 />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-slate-50 gap-3">
             <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest">
                Abort
             </Button>
             <Button type="submit" disabled={loading} className="h-12 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20 gap-2">
               {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Blueprint</>}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanModal;
