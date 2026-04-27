import React, { useState, useEffect, useCallback } from 'react';
import { 
  Zap, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  Users, 
  CheckCircle2, 
  IndianRupee,
  Layers,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import PlanModal from './PlanModal';

const SubscriptionPlansList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/subscription/plans');
      setPlans(data?.data || data || []);
    } catch (error) {
      toast.error('Integration failure: Could not reach Plan node.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to decommission this plan tier?')) return;
    try {
      await apiFetch(`/subscription/plans/${id}`, { method: 'DELETE' });
      toast.success('Plan decommissioned successfully.');
      fetchPlans();
    } catch (error) {
      toast.error(error.message || 'Decommissioning failed.');
    }
  };

  const filteredPlans = plans.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return <PageLoader message="Fetching Subscription Blueprints..." />;
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Tier Catalog</h1>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-80 border-l-2 border-slate-200 pl-3">Design and deploy subscription architectures.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <Input 
                placeholder="Find tier..." 
                className="pl-12 h-12 rounded-2xl border-none bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <Button 
             onClick={() => { setSelectedPlan(null); setOpenModal(true); }}
             className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-2xl shadow-slate-900/20"
           >
              <Plus className="h-4 w-4" /> New Plan
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
         <CardContent className="p-0">
            <Table>
               <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                     <TableHead className="py-6 pl-10 font-black uppercase text-[10px] tracking-widest">Tier Blueprint</TableHead>
                     <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest">Pricing (INR)</TableHead>
                     <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-center">Validity</TableHead>
                     <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest">Employee Cap</TableHead>
                     <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                     <TableHead className="py-6 pr-10 text-right font-black uppercase text-[10px] tracking-widest">Control</TableHead>
                  </TableRow>
               </TableHeader>
                <TableBody>
                  {paginatedPlans.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={6} className="text-center py-24 text-slate-300 italic font-bold">No plan blueprints found in registry.</TableCell>
                    </TableRow>
                  ) : (
                    paginatedPlans.map((plan) => (
                      <TableRow key={plan.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all group">
                        <TableCell className="py-8 pl-10">
                           <div className="flex items-center gap-5">
                              <div className="h-12 w-12 rounded-2xl bg-blue-600/5 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                                 <Layers className="h-6 w-6" />
                              </div>
                              <div className="space-y-1">
                                 <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tighter italic uppercase">{plan.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.features?.length || 0} Modules enabled</p>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="py-8">
                           <div className="flex items-center gap-1 font-black text-slate-900 dark:text-white text-lg">
                              <IndianRupee className="h-4 w-4 opacity-30" /> {parseFloat(plan.price).toLocaleString('en-IN')}
                              <span className="text-[9px] text-slate-400 ml-1 uppercase">/ Monthly</span>
                           </div>
                        </TableCell>
                        <TableCell className="py-8 text-center">
                           <div className="flex flex-col items-center">
                              <span className="font-black text-slate-900 dark:text-white text-lg italic tracking-tighter">{plan.durationDays || 30}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Days</span>
                           </div>
                        </TableCell>
                        <TableCell className="py-8">
                           <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span className="font-black text-slate-700 dark:text-slate-300">{plan.maxEmployees.toLocaleString()}</span>
                           </div>
                        </TableCell>
                        <TableCell className="py-8 text-center">
                           <Badge className={plan.isActive ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-slate-100 text-slate-400 border-none'}>
                              {plan.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                           </Badge>
                        </TableCell>
                        <TableCell className="py-8 pr-10 text-right">
                           <div className="flex justify-end gap-2">
                              <Button 
                                onClick={() => { setSelectedPlan(plan); setOpenModal(true); }}
                                variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl text-blue-600 hover:bg-blue-50"
                              >
                                 <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(plan.id)}
                                variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl text-rose-600 hover:bg-rose-50"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
               </TableBody>
            </Table>
         </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 pb-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredPlans.length)}</span> of <span className="text-slate-900">{filteredPlans.length}</span> nodes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="h-10 rounded-xl border-slate-200 bg-white shadow-lg shadow-slate-200/50 font-black uppercase text-[10px] tracking-widest gap-2 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="h-10 rounded-xl border-slate-200 bg-white shadow-lg shadow-slate-200/50 font-black uppercase text-[10px] tracking-widest gap-2 disabled:opacity-30"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <PlanModal 
        open={openModal}
        setOpen={setOpenModal}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />
    </div>
  );
};

export default SubscriptionPlansList;
