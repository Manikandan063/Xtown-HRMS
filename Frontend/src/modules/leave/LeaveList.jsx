import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  FilePlus, 
  CheckCircle, 
  XSquare, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  User,
  Search,
  Filter,
  ChevronDown,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import ApplyLeaveModal from './ApplyLeaveModal';
import ManageLeaveTypesModal from './ManageLeaveTypesModal';
import LeaveTracker from './LeaveTracker';
import { Pagination } from '@/components/ui/pagination';
import PageLoader from '@/components/ui/PageLoader';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';


const LeaveList = () => {
  const { isAdmin, isHR, isSuperAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTracker, setExpandedTracker] = useState(null);
  
  // Pagination & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [balances, setBalances] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Debounce Search Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const canApprove = isAdmin || isHR || isSuperAdmin;

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const url = `/leave/request?page=${page}&limit=${limit}&search=${debouncedSearch}&status=${statusFilter}`;
      const data = await apiFetch(url);
      setRequests(data?.data || []);
      setTotalPages(Math.ceil((data?.total || 0) / limit) || 1);
      if (data?.counts) {
        setCounts(data.counts);
      }
      if (data?.balances) {
        setBalances(data.balances);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  const location = useLocation();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, location.key]);

  // Reset to first page when filtering
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);


  const handleStatusUpdate = async (id, status) => {
    try {
      await apiFetch(`/leave/request/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchRequests(); 
    } catch (error) {
      toast.error(error.message || 'Status update failed');
    }
  };

  if (loading && page === 1 && !searchQuery && statusFilter === 'ALL') {
    return <PageLoader message="Accessing Leave Pipeline..." />;
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">
            {canApprove ? 'Approval Pipeline' : 'My Absence Logs'}
          </h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-70 italic">
            {canApprove ? 'Review and approve workforce absence requests.' : 'Track your personal leave applications and balances.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
           {canApprove && <ManageLeaveTypesModal onUpdate={fetchRequests} />}
           <ApplyLeaveModal onSuccess={fetchRequests} />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-card/50 backdrop-blur-md p-4 rounded-[2rem] border border-border shadow-sm flex flex-col md:flex-row gap-4 ring-1 ring-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
          <Input 
            placeholder={canApprove ? "Search by employee name or code..." : "Search in my requests..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 border-none bg-muted/30 rounded-2xl font-bold placeholder:text-muted-foreground/30 focus-visible:ring-primary/20 transition-all" 
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-12 px-8 rounded-2xl bg-muted/30 hover:bg-muted text-muted-foreground font-black uppercase text-[10px] tracking-widest flex items-center gap-4 border-none shadow-none transition-all">
               <Filter className="h-4 w-4 opacity-50" />
               {statusFilter === 'ALL' ? 'All Status' : statusFilter}
               <ChevronDown className="h-4 w-4 opacity-20" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2 rounded-2xl shadow-2xl border-none bg-card/95 backdrop-blur-xl ring-1 ring-border">
             {['ALL', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <DropdownMenuItem 
                   key={status}
                   onClick={() => setStatusFilter(status)}
                   className="flex justify-between items-center py-3 px-4 rounded-xl cursor-pointer font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
                >
                   {status === 'ALL' ? 'All Applications' : status}
                   {statusFilter === status && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
             ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-foreground/80">
               <Clock className="h-6 w-6 text-orange-500" /> 
               {statusFilter === 'ALL' ? 'Applications' : `${statusFilter} Only`}
            </h2>
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none font-black text-[10px] px-5 py-1.5 rounded-full uppercase tracking-widest">
                {counts.pending} Pending in queue
            </Badge>
          </div>
          
          <div className="grid gap-6">
            {loading && page === 1 ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Retrieving logs...</p>
               </div>
            ) : requests.length === 0 ? (
              <Card className="border-dashed border-2 bg-muted/20 p-24 text-center rounded-[3rem] flex flex-col items-center gap-6 border-muted/50">
                 <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/20">
                    <FilePlus className="h-10 w-10" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-muted-foreground font-black uppercase text-[11px] tracking-[0.2em] italic">No leave applications found.</p>
                    <p className="text-muted-foreground/40 text-[9px] font-bold uppercase tracking-widest">Try adjusting your filters or search query.</p>
                 </div>
              </Card>
            ) : (
              /* UNIFIED TABLE VIEW FOR ADMIN & EMPLOYEE */
              <Card className="border-none shadow-sm overflow-hidden bg-card rounded-[2.5rem] ring-1 ring-border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border/50 h-16 hover:bg-transparent">
                      {canApprove && <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/60 pl-8">Employee</TableHead>}
                      <TableHead className={`font-black uppercase text-[10px] tracking-widest text-muted-foreground/60 ${!canApprove ? 'pl-8' : ''}`}>Leave Type</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Duration</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">Status</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground/60 text-right pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <React.Fragment key={req?.id}>
                        <TableRow className="border-border/40 h-20 group hover:bg-muted/30 transition-colors">
                          {canApprove && (
                            <TableCell className="pl-8">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                  <User className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-sm uppercase italic tracking-tighter">{req?.Employee?.firstName} {req?.Employee?.lastName}</span>
                                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{req?.Employee?.employeeCode}</span>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className={!canApprove ? 'pl-8' : ''}>
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest w-fit">
                                {req?.LeaveType?.leaveName || 'OFFICIAL'}
                              </Badge>
                              {!canApprove && <span className="text-[9px] font-bold text-muted-foreground/40 uppercase italic truncate max-w-[150px]">{req?.reason || 'No reason'}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black uppercase text-foreground italic">
                                  {req?.fromDate && new Date(req.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} → {req?.toDate && new Date(req.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                               </span>
                               <span className="text-[9px] font-bold text-muted-foreground/50 uppercase">{req?.totalDays} Days Requested</span>
                            </div>
                          </TableCell>
                          <TableCell>
                             <Badge 
                              className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-none border-none ${
                                req?.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 
                                req?.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600' : 
                                'bg-amber-400/10 text-amber-600'
                              }`}
                            >
                              {req?.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            {canApprove && req?.status === 'Pending' ? (
                              <div className="flex justify-end gap-2">
                                 <Button 
                                   onClick={() => handleStatusUpdate(req.id, 'Approved')}
                                   variant="ghost" className="h-10 w-10 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                 >
                                   <CheckCircle className="h-5 w-5" />
                                 </Button>
                                 <Button 
                                   onClick={() => handleStatusUpdate(req.id, 'Rejected')}
                                   variant="ghost" className="h-10 w-10 text-rose-600 bg-rose-500/5 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                                 >
                                   <XSquare className="h-5 w-5" />
                                 </Button>
                              </div>
                            ) : !canApprove ? (
                              <Button
                                variant="ghost"
                                onClick={() => setExpandedTracker(expandedTracker === req.id ? null : req.id)}
                                className={`h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${expandedTracker === req.id ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                              >
                                {expandedTracker === req.id ? 'Close Logs' : 'Track Status'}
                              </Button>
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground/30 uppercase italic">Processed</span>
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {/* Tracker Row for Employees */}
                        {!canApprove && expandedTracker === req.id && (
                          <TableRow className="bg-muted/10 border-none">
                            <TableCell colSpan={4} className="p-8">
                               <div className="animate-in slide-in-from-top-4 duration-500">
                                  <LeaveTracker 
                                    status={req.status}
                                    createdAt={req.createdAt}
                                    viewedAt={req.viewedAt}
                                    approvedAt={req.approvedAt}
                                  />
                               </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
                
                {/* TABLE FOOTER PAGINATION */}
                <div className="p-4 bg-muted/20 border-t border-border/50">
                   <Pagination 
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      loading={loading}
                      className="rounded-2xl border-none bg-transparent px-2"
                   />
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 mb-4 text-foreground/80">
             <AlertCircle className="h-6 w-6 text-blue-500" /> Leave Overview
          </h2>
          <Card className="border-none shadow-2xl rounded-[3rem] bg-card p-10 space-y-10 text-foreground ring-1 ring-border">
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-border/50 pb-6">
                <div className="space-y-1">
                   <span className="font-black text-muted-foreground text-[10px] uppercase tracking-[0.2em]">Pending</span>
                   <p className="text-[8px] font-bold text-muted-foreground/40 uppercase">Waiting Approval</p>
                </div>
                <span className="text-3xl font-black italic text-orange-400">{counts.pending}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-6">
                <div className="space-y-1">
                   <span className="font-black text-muted-foreground text-[10px] uppercase tracking-[0.2em]">Approved</span>
                   <p className="text-[8px] font-bold text-muted-foreground/40 uppercase">Total Confirmed</p>
                </div>
                <span className="text-3xl font-black italic text-emerald-400">{counts.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <span className="font-black text-muted-foreground text-[10px] uppercase tracking-[0.2em]">Rejected</span>
                   <p className="text-[8px] font-bold text-muted-foreground/40 uppercase">Total Declined</p>
                </div>
                <span className="text-3xl font-black italic text-rose-400">{counts.rejected}</span>
              </div>
            </div>
            
            <div className="pt-6 text-center">
               <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] leading-relaxed italic">System synchronizes logs in real-time.</p>
            </div>
          </Card>

          {/* New Balances Section */}
          {!canApprove && balances.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-700">
               <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 mb-4 text-foreground/80">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" /> My Quota
               </h2>
               <div className="grid grid-cols-1 gap-4">
                  {balances.map((lb, i) => (
                    <Card key={i} className="border-none shadow-lg rounded-[2rem] bg-card p-6 ring-1 ring-border group hover:bg-emerald-500/5 transition-all">
                       <div className="flex justify-between items-center">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{lb.leaveType?.leaveName}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-2xl font-black italic text-foreground">{Number(lb.balance) - Number(lb.used)}</span>
                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">Days Left</span>
                             </div>
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/30 group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all">
                             <Clock className="h-5 w-5" />
                          </div>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveList;

