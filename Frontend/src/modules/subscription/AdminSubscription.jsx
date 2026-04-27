import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Zap, 
  RefreshCw, 
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Smartphone,
  Banknote as Bank
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const AdminSubscription = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [requesting, setRequesting] = useState(null);
  const [payRef, setPayRef] = useState('');
  const [history, setHistory] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      // Fetch summary (Critical)
      const summaryRes = await apiFetch('/dashboard/summary');
      setData(summaryRes?.data || summaryRes);

      // Fetch history (Non-critical)
      try {
        const historyRes = await apiFetch('/subscription/my-requests');
        setHistory(historyRes?.data || historyRes || []);
      } catch (historyErr) {
        console.warn("Could not fetch subscription history:", historyErr.message);
      }
    } catch (err) {
      console.error("Dashboard sync failed:", err.message);
      toast.error("Failed to sync primary subscription status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleAutomatedPayment = async (method) => {
    try {
      setLoading(true);
      setShowPaymentModal(false);
      
      const res = await apiFetch('/subscription/pay-and-activate', {
        method: 'POST',
        body: { planName: selectedPlan, method }
      });
      
      toast.success("Payment Received! License activated and receipt sent to mail.");
      fetchSubscription();
    } catch (err) {
      toast.error(err.message || "Payment Logic Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpgrade = async (plan) => {
    if (!payRef || payRef.length < 5) {
      return toast.error("Please provide a valid Payment Reference (min 5 chars).");
    }
    try {
      setRequesting(plan);
      await apiFetch('/subscription/request', {
        method: 'POST',
        body: { 
          planName: plan, 
          paymentReference: payRef,
          notes: `Upgrade request from Admin portal for ${plan} plan.` 
        }
      });
      toast.success(`Upgrade request for ${plan} sent to system owner.`);
      setPayRef('');
    } catch (err) {
      toast.error(err.message || "Request failed.");
    } finally {
      setRequesting(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">Verifying License Node...</p>
      </div>
    );
  }

  const sub = data?.companySubscription;
  const daysLeft = sub?.planExpiryDate ? Math.ceil((new Date(sub.planExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Integrated Payment Gateway Simulation */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
              <div className="p-10 bg-slate-900 text-white space-y-2">
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter">Secure Checkout</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest opacity-70">Complete activation for {selectedPlan} Tier</p>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleAutomatedPayment('gpay')}
                      className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-slate-100 hover:border-primary hover:bg-slate-50 transition-all group"
                    >
                       <Smartphone className="h-10 w-10 text-slate-400 group-hover:text-primary mb-3" />
                       <span className="font-black uppercase text-[10px] tracking-widest">Google Pay</span>
                    </button>
                    <button 
                      onClick={() => handleAutomatedPayment('bank')}
                      className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-slate-100 hover:border-primary hover:bg-slate-50 transition-all group"
                    >
                       <Bank className="h-10 w-10 text-slate-400 group-hover:text-primary mb-3" />
                       <span className="font-black uppercase text-[10px] tracking-widest">Bank Direct</span>
                    </button>
                 </div>
                 <Button 
                   variant="ghost" 
                   onClick={() => setShowPaymentModal(false)}
                   className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-red-500"
                 >
                    Abort Transaction
                 </Button>
              </div>
           </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">License & Subscription</h1>
          <p className="text-muted-foreground font-medium italic opacity-80">Manage your enterprise entitlement and service levels.</p>
        </div>
      </div>

      {/* Primary Plan Card */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white relative">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Zap className="h-64 w-64" />
         </div>
         <div className="p-10 relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="h-32 w-32 rounded-[2rem] bg-white/10 flex items-center justify-center text-primary-foreground shadow-inner">
               <ShieldCheck className="h-16 w-16" />
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
               <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Active Entitlement</span>
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{sub?.subscriptionPlan || 'BASIC'} PLAN</h2>
               </div>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                     <Calendar className="h-6 w-6 text-primary" />
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Expiration Date</span>
                        <span className="text-lg font-black text-white uppercase tracking-tighter">
                           {sub?.planExpiryDate ? new Date(sub.planExpiryDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'Pending Activation'}
                        </span>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 border-l border-white/10 pl-8">
                     <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Vault Status</span>
                        <span className="text-lg font-black text-white uppercase tracking-tighter">{sub?.isActive ? 'Secured' : 'Standby'}</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
               <Button 
                onClick={() => { setSelectedPlan(sub?.subscriptionPlan || 'BASIC'); setShowPaymentModal(true); }}
                className="h-14 px-10 rounded-2xl bg-primary hover:bg-white hover:text-primary transition-all font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20"
               >
                  Renew Membership
               </Button>
            </div>
         </div>
      </Card>

      {/* Payment Instructions / Flow Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-emerald-50 dark:bg-emerald-950/10 border-2 border-emerald-100 dark:border-white/5 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <CreditCard className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-100">Step 1: Offline Payment</h3>
                  <p className="text-xs text-emerald-800/60 dark:text-emerald-200/40 font-medium italic">Make a direct transfer to nuestro institutional account.</p>
               </div>
            </div>
            
            <div className="space-y-4 pt-2">
               <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-emerald-200/30">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Bank Details</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">ICICI BANK - XTOWN TECHNOLOGIES</p>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400">A/C: 002105001234 | IFSC: ICIC0000021</p>
               </div>
               <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-emerald-200/30 flex items-center justify-between">
                  <div>
                     <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">UPI ID</span>
                     <p className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-1">xtown@icici</p>
                  </div>
                  <div className="h-12 w-12 bg-white rounded-lg p-1">
                     {/* Placeholder for QR Code */}
                     <div className="h-full w-full bg-slate-100 rounded flex items-center justify-center">
                        <Zap className="h-6 w-6 text-slate-300" />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between gap-6 ring-2 ring-primary/10">
            <div className="space-y-1">
               <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  Step 2: Verification <span className="text-[10px] text-red-500 lowercase font-medium tracking-normal">(Mandatory)</span>
               </h3>
               <p className="text-xs text-muted-foreground font-medium italic">Copy and paste your Transaction ID / Ref No. from your bank app.</p>
            </div>
            <div className="space-y-4">
               <input 
                  type="text" 
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Paste Transaction ID (Ex: TRX-9988776655)"
                  className="w-full h-14 px-6 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all shadow-sm"
               />
               <p className="text-[10px] text-slate-400 font-bold italic text-center uppercase tracking-widest">
                  SuperAdmin will verify and activate your license within 24 hours.
               </p>
            </div>
         </div>
      </div>

      {/* Plan Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { name: 'BASIC', price: 'FREE', color: 'bg-slate-100', text: 'text-slate-600', icon: Clock },
           { name: 'PREMIUM', price: '₹4,999/mo', color: 'bg-blue-600', text: 'text-white', icon: Zap, popular: true },
           { name: 'ENTERPRISE', price: 'Custom', color: 'bg-emerald-600', text: 'text-white', icon: ShieldCheck },
         ].map((plan) => (
           <Card key={plan.name} className={`border-none shadow-xl rounded-[2.5rem] overflow-hidden ${plan.name === sub?.subscriptionPlan ? 'ring-4 ring-primary ring-offset-4 ring-offset-slate-50' : ''}`}>
              <div className={`p-8 ${plan.color} ${plan.text} space-y-6`}>
                 <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                       <plan.icon className="h-6 w-6" />
                    </div>
                    {plan.popular && <Badge className="bg-white text-blue-600 font-black text-[9px]">MOST POPULAR</Badge>}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">{plan.name}</h3>
                    <p className="text-3xl font-black mt-2">{plan.price}</p>
                 </div>
              </div>
              <div className="p-8 bg-white dark:bg-slate-900 space-y-6">
                 <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-xs font-bold text-muted-foreground italic">
                       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                       {plan.name === 'BASIC' ? 'Up to 25 Employees' : plan.name === 'PREMIUM' ? 'Up to 350 Employees' : 'Unlimited Scale'}
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-muted-foreground italic">
                       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                       Financial Audit Trails
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-muted-foreground italic">
                       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                       Cloud Identity Vault
                    </li>
                 </ul>
                  <Button 
                    disabled={plan.name === sub?.subscriptionPlan}
                    onClick={() => { setSelectedPlan(plan.name); setShowPaymentModal(true); }}
                    className={`w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg ${
                     plan.name === sub?.subscriptionPlan 
                     ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                     : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all'
                    }`}
                  >
                     {plan.name === sub?.subscriptionPlan ? 'CURRENTLY ACTIVE' : 'UPGRADE REQUEST'}
                  </Button>
              </div>
           </Card>
         ))}
      </div>

      {/* Request History */}
      {history.length > 0 && (
         <div className="space-y-6">
            <h3 className="text-xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Request Queue</h3>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ref ID</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {history.map((req) => (
                        <tr key={req.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                           <td className="px-8 py-6 text-xs font-black uppercase italic text-slate-900 dark:text-white">{req.planName}</td>
                           <td className="px-8 py-6 text-xs font-mono font-bold text-blue-600">{req.paymentReference}</td>
                           <td className="px-8 py-6 text-right">
                              <Badge className={`px-4 py-1 rounded-lg font-black text-[10px] uppercase italic border-none ${
                                 req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 
                                 req.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 
                                 'bg-amber-100 text-amber-600'
                              }`}>
                                 {req.status}
                              </Badge>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      <div className="bg-blue-50/50 dark:bg-blue-950/10 border-2 border-dashed border-blue-200 p-8 rounded-[2.5rem] flex items-start gap-6">
         <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <AlertCircle className="h-6 w-6" />
         </div>
         <div className="space-y-2">
            <h4 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">System Notice</h4>
            <p className="text-sm text-blue-800/60 dark:text-blue-200/40 font-medium leading-relaxed italic">
               Subscription upgrades are processed within 24 hours of request verification. For volume licensing or customized enterprise modules, please contact the system proprietor directly at support@xtown.com.
            </p>
         </div>
      </div>
    </div>
  );
};

export default AdminSubscription;
