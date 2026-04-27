import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Check, 
  X, 
  Loader2, 
  ArrowUpCircle,
  Hash,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const SubscriptionRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/subscription/requests');
      setRequests(data?.data || data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    try {
      toast.loading('Activating subscription...', { id: 'approve' });
      await apiFetch(`/subscription/approve/${id}`, { method: 'POST' });
      toast.success('Subscription activated successfully!', { id: 'approve' });
      fetchRequests();
    } catch (error) {
      toast.error(error.message || 'Approval failed', { id: 'approve' });
    }
  };

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
     return <PageLoader message="Loading Subscription Requests..." />;
  }

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-8">
         <div className="flex items-center gap-3">
            <ArrowUpCircle className="h-6 w-6 text-blue-400" />
            <CardTitle className="text-xl font-black uppercase italic tracking-widest">Subscription Requests</CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="font-black py-6 pl-8 uppercase text-[10px] tracking-widest">Company Name</TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] tracking-widest">Requested Plan</TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] tracking-widest">Reference ID</TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] tracking-widest text-center">Status</TableHead>
              <TableHead className="font-black py-6 uppercase text-[10px] tracking-widest text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-slate-300 italic font-bold">No pending subscription requests found.</TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((req) => (
                <TableRow key={req.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all group">
                  <TableCell className="py-6 pl-8">
                     <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-slate-400" />
                        <div className="flex flex-col">
                           <span className="font-black text-slate-900 dark:text-white tracking-tight">{req.company?.companyName}</span>
                           <span className="text-[10px] font-bold text-slate-400">{req.company?.email}</span>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="py-6">
                     <Badge className="bg-blue-600 text-white border-none font-black text-[9px] px-3 py-1 italic tracking-widest">
                        {req.planName}
                     </Badge>
                  </TableCell>
                  <TableCell className="py-6 font-mono text-[11px] font-bold text-slate-500">
                     <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 opacity-30" /> {req.paymentReference || 'N/A'}
                     </div>
                  </TableCell>
                  <TableCell className="py-6 text-center">
                     <Badge variant="outline" className={req.status === 'PENDING' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50'}>
                        {req.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="py-6 text-right pr-8">
                     {req.status === 'PENDING' && (
                       <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(req.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 rounded-xl h-9 px-4 font-black uppercase text-[9px] tracking-widest flex gap-2"
                          >
                             <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50 rounded-xl h-9 w-9 p-0 flex items-center justify-center">
                             <X className="h-4 w-4" />
                          </Button>
                       </div>
                     )}
                     {req.status === 'APPROVED' && (
                       <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center justify-end gap-1.5 mr-4">
                          <CheckCircle2 className="h-4 w-4" /> Activated
                       </span>
                     )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, requests.length)}</span> of <span className="text-slate-900 dark:text-white">{requests.length}</span>
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

export default SubscriptionRequestsList;
