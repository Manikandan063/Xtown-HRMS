import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Layers,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

const ActiveSubscriptionsList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/companies');
      // Only keep companies with a currentPlanId or an active subscription
      setCompanies(data?.data || data || []);
    } catch (error) {
      toast.error('Failed to sync global license state');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { label: 'Infinite', color: 'bg-slate-100 text-slate-500' };
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Expired', color: 'bg-rose-500/10 text-rose-600' };
    if (diffDays <= 30) return { label: 'Expiring Soon', color: 'bg-amber-500/10 text-amber-600' };
    return { label: 'Active', color: 'bg-emerald-500/10 text-emerald-600' };
  };

  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const paginatedCompanies = companies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
     return <PageLoader message="Loading Active Subscriptions..." />;
  }

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white/80 backdrop-blur-xl overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-8">
         <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <CardTitle className="text-xl font-black uppercase italic tracking-widest">Active Subscriptions</CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-black py-6 pl-8 uppercase text-[10px] tracking-widest">Company Name</TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] tracking-widest">Current Plan</TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] tracking-widest">Start Date</TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] tracking-widest">Expiry Date</TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] tracking-widest text-right pr-8">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCompanies.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-300 italic font-bold">No active subscriptions found.</TableCell>
              </TableRow>
            ) : (
              paginatedCompanies.map((comp) => {
                const status = getExpiryStatus(comp.planExpiryDate);
                return (
                  <TableRow key={comp.id} className="hover:bg-blue-50/30 transition-all group">
                    <TableCell className="py-7 pl-8">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             {comp.companyName?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-black text-slate-900 tracking-tighter text-sm uppercase italic">{comp.companyName}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{comp.domain || 'LOCAL_TENANT'}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-7">
                       <Badge className="bg-slate-900 text-white border-none font-black text-[9px] px-3 py-1 italic tracking-widest">
                          {comp.subscriptionPlan || 'BASIC'}
                       </Badge>
                    </TableCell>
                    <TableCell className="py-7 font-bold text-[10px] text-slate-600">
                       <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-blue-500 opacity-50" />
                          {formatDate(comp.planStartDate)}
                       </div>
                    </TableCell>
                    <TableCell className="py-7 font-bold text-[10px] text-slate-600">
                       <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-rose-500 opacity-50" />
                          {formatDate(comp.planExpiryDate)}
                       </div>
                    </TableCell>
                    <TableCell className="py-7 text-right pr-8">
                       <Badge className={cn("border-none font-black text-[9px] px-3 py-1.5 uppercase tracking-widest shadow-none", status.color)}>
                          {status.label === 'Expiring Soon' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {status.label}
                       </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, companies.length)}</span> of <span className="text-slate-900">{companies.length}</span>
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
    </Card>
  );
};

export default ActiveSubscriptionsList;
