import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Plus, 
  Search, 
  MoreVertical, 
  Layers,
  Loader2,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

import SubscriptionRequestModal from './SubscriptionRequestModal';
import SubscriptionRequestsList from './SubscriptionRequestsList';
import ActiveSubscriptionsList from './ActiveSubscriptionsList';
import PageLoader from '@/components/ui/PageLoader';
import { cn } from '@/lib/utils';

const SubscriptionList = () => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [subInfo, setSubInfo] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const [statusData, plansData] = await Promise.all([
        isSuperAdmin ? Promise.resolve(null) : apiFetch('/subscription/status'),
        apiFetch('/subscription/plans')
      ]);
      
      setSubInfo(statusData?.data || statusData);
      setPlans(plansData?.data || plansData || []);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (loading) {
     return <PageLoader message="Loading Subscription Details..." />;
  }

  // --- SuperAdmin View ---
  if (isSuperAdmin) {
    return (
      <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Subscriptions</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-80 pl-1 border-l-2 border-slate-200 dark:border-slate-800">Manage company plans and requests.</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
             <Button 
                onClick={() => setActiveTab('requests')}
                variant="ghost" 
                className={`h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  activeTab === 'requests' ? "bg-white dark:bg-slate-900 shadow-xl text-blue-600" : "text-slate-400 hover:text-slate-600"
                }`}
             >
                <Clock className="h-4 w-4 mr-2" /> Pending Requests
             </Button>
             <Button 
                onClick={() => setActiveTab('active')}
                variant="ghost" 
                className={`h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                   activeTab === 'active' ? "bg-white dark:bg-slate-900 shadow-xl text-emerald-600" : "text-slate-400 hover:text-slate-600"
                }`}
             >
                <ShieldCheck className="h-4 w-4 mr-2" /> Active Plans
             </Button>
          </div>
        </div>

        <div className="transition-all duration-500">
           {activeTab === 'requests' ? <SubscriptionRequestsList /> : <ActiveSubscriptionsList />}
        </div>
      </div>
    );
  }

  // --- Admin/Client View ---
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Your Subscription Plan</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest opacity-80 flex items-center gap-2">
             <ShieldCheck className="h-4 w-4 text-primary" /> Current Status: 
             <Badge className="bg-primary/10 text-primary border-none font-black italic shadow-none px-3 py-1 ml-1">{subInfo?.plan || 'BASIC'}</Badge>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => {
          const isActive = (subInfo?.plan || 'BASIC').toUpperCase() === p.name.toUpperCase();
          return (
            <Card key={p.id} className={`border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md group hover:-translate-y-2 transition-all duration-500 ${isActive && 'ring-4 ring-primary/20 scale-105 shadow-primary/10'}`}>
              <CardHeader className="text-center pt-12 pb-8 space-y-3">
                  <div className={`h-20 w-20 mx-auto rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-500 shadow-inner ${isActive && 'bg-primary text-white shadow-primary/20'}`}>
                    {p.name.includes('ENTERPRISE') ? <ShieldCheck className="h-10 w-10" /> : p.name.includes('PREMIUM') ? <Zap className="h-10 w-10" /> : <Layers className="h-10 w-10" />}
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-2xl font-black italic tracking-widest uppercase">{p.name}</h4>
                     <p className="text-4xl font-black text-slate-900 dark:text-white">₹{parseFloat(p.price).toLocaleString('en-IN')}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ Per Month</p>
                  </div>
              </CardHeader>
              <CardContent className="space-y-10 px-12 pb-14">
                  <div className="space-y-4">
                    {(p.features || ['Module Access', 'Standard Support']).map((feat, i) => (
                        <div key={i} className="flex gap-4 text-xs font-bold text-slate-500 items-start group-hover:text-slate-900 dark:group-hover:text-white transition-all">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                    ))}
                  </div>
                  
                  {isActive ? (
                    <div className="flex flex-col items-center gap-4">
                       <Button disabled className="w-full h-14 rounded-2xl font-black tracking-widest uppercase text-xs bg-slate-100 text-slate-400 shadow-none border-none">
                          Current Subscription
                       </Button>
                       <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-[0.2em]">{subInfo?.remainingSlots !== undefined ? `${subInfo.remainingSlots} slots remaining` : 'Active Standing'}</p>
                    </div>
                  ) : (
                    <SubscriptionRequestModal 
                      plan={p}
                      onSuccess={fetchStatus}
                      trigger={
                        <Button className="w-full h-14 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl shadow-primary/20 bg-primary hover:bg-blue-600 group-hover:scale-105 active:scale-95 transition-all">
                           Activate {p.name} Plan
                        </Button>
                      }
                    />
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionList;
