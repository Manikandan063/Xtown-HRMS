import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Loader2, CreditCard } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const SubscriptionRequestModal = ({ plan, trigger, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    planName: plan.plan.toUpperCase(),
    paymentReference: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFetch('/subscription/request', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Upgrade request submitted for verification.');
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500 fill-amber-500" /> Upgrade to {plan.plan}
          </DialogTitle>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-80 pt-1">Initiating license activation sequence.</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
             <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Selected Plan</span>
                <span className="text-slate-900">{plan.plan}</span>
             </div>
             <div className="flex justify-between items-center text-lg font-black tracking-tighter text-blue-600">
                <span>Total Due</span>
                <span>{plan.price}</span>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Payment Reference (UPI/Trans ID)</label>
              <Input 
                placeholder="Ex: T21092301239" 
                required 
                value={formData.paymentReference}
                onChange={(e) => setFormData({...formData, paymentReference: e.target.value})}
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-mono font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Additional Notes</label>
              <Textarea 
                placeholder="Any specific requirements or payment details..." 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="rounded-2xl bg-slate-50 border-slate-100 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50 gap-3">
             <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest">Abort</Button>
             <Button type="submit" disabled={loading} className="px-8 h-12 rounded-2xl shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 font-black uppercase text-[11px] tracking-widest gap-2">
               {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" /> Confirm & Request Upgrade</>}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionRequestModal;
