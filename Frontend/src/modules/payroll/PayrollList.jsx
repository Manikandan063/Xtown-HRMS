import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, 
  TrendingUp, 
  IndianRupee, 
  CreditCard,
  Loader2,
  Eye,
  Printer,
  BadgeCheck
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';

const PayrollList = () => {
  const { canEdit, canAccessHRModules, user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const isEmployee = !canAccessHRModules;
      
      if (isEmployee) {
        const [payrollRes, summaryRes] = await Promise.all([
          apiFetch(`/payroll/employee/${user.employeeId}?page=${page}&limit=${limit}`),
          apiFetch('/payroll/summary')
        ]);
        setPayrolls(payrollRes?.data || []);
        setTotalPages(Math.ceil((payrollRes?.total || 0) / limit) || 1);
        setSummary(summaryRes?.data || summaryRes);
      } else {
        const [payrollRes, summaryRes] = await Promise.all([
          apiFetch(`/payroll/company?page=${page}&limit=${limit}`),
          apiFetch('/payroll/summary')
        ]);
        setPayrolls(payrollRes?.data || []);
        setTotalPages(Math.ceil((payrollRes?.total || 0) / limit) || 1);
        setSummary(summaryRes?.data || summaryRes);
      }
    } catch (error) {
      console.error('Payroll fetch error:', error);
      toast.error(error.message || 'Failed to sync financial data');
    } finally {
      setLoading(false);
    }
  }, [canAccessHRModules, user.employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, page]);

  const handleDownloadPayslip = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api'}/payroll/payslip/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to generate payslip');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  const [viewingPayroll, setViewingPayroll] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    payrollId: null,
    newStatus: null,
    employeeName: ''
  });

  const handleProcessPayroll = async () => {
    try {
      setProcessing(true);
      const res = await apiFetch('/payroll/create', { 
        method: 'POST',
        body: JSON.stringify({ month: new Date().toISOString().slice(0, 7) }) 
      });
      toast.success(res?.message || 'Current month payroll processed');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Payroll processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = (pay) => {
    const newStatus = pay.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
    setConfirmModal({
      isOpen: true,
      payrollId: pay.id,
      newStatus: newStatus,
      employeeName: `${pay.Employee?.firstName} ${pay.Employee?.lastName}`
    });
  };

  const confirmToggleStatus = async () => {
    try {
      const { payrollId, newStatus } = confirmModal;
      await apiFetch(`/payroll/status/${payrollId}`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      toast.success(`Payment status updated to ${newStatus === 'PAID' ? 'Paid' : 'Not paid'}`);
      setConfirmModal({ ...confirmModal, isOpen: false });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Accessing Financial Vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Compensation Hub</h1>
          <p className="text-muted-foreground font-medium italic opacity-80">Oversee monthly salary deployments and financial audit trails.</p>
        </div>
        
        {canEdit && (
          <Button 
            type="button"
            onClick={(e) => { e.stopPropagation(); handleProcessPayroll(); }}
            disabled={processing}
            className="h-14 px-10 rounded-[1.2rem] shadow-2xl shadow-primary/30 font-black uppercase text-[11px] tracking-widest bg-primary hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 gap-3 border-none"
          >
             {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
             Initiate Batch Processing
          </Button>
        )}
      </div>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl p-6 rounded-3xl bg-gradient-to-br from-white to-blue-50/50 dark:from-card dark:to-blue-950/10 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex flex-col gap-4">
             <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
               <IndianRupee className="h-8 w-8" />
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                 {!canAccessHRModules ? 'Annual Gross Earnings' : 'Monthly Expenditure'}
               </span>
               <h2 className="text-4xl font-black tracking-tighter text-blue-600">
                 ₹{(!canAccessHRModules ? (summary?.totalEarnings || 0) : (summary?.totalNetSalary || 0)).toLocaleString('en-IN')}
               </h2>
             </div>
          </div>
        </Card>
        
        <Card className="border-none shadow-xl p-6 rounded-3xl bg-gradient-to-br from-white to-purple-50/50 dark:from-card dark:to-purple-950/10 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex flex-col gap-4">
             <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
               <TrendingUp className="h-8 w-8" />
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                 {!canAccessHRModules ? 'Latest Net Payout' : 'Workforce Reached'}
               </span>
               <h2 className="text-4xl font-black tracking-tighter text-purple-600">
                 {!canAccessHRModules ? `₹${(summary?.latestSalary || 0).toLocaleString('en-IN')}` : (summary?.employeesPaid || 0)}
               </h2>
             </div>
          </div>
        </Card>
        
        <Card className="border-none shadow-xl p-6 rounded-3xl bg-gradient-to-br from-white to-green-50/50 dark:from-card dark:to-green-950/10 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex flex-col gap-4">
             <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
               <BadgeCheck className="h-8 w-8" />
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                 {!canAccessHRModules ? 'Annual Deductions' : 'Pending Compliance'}
               </span>
               <h2 className="text-4xl font-black tracking-tighter text-green-600">
                 {!canAccessHRModules ? `₹${(summary?.totalDeductions || 0).toLocaleString('en-IN')}` : (summary?.pendingPayrolls || 0)}
               </h2>
             </div>
          </div>
        </Card>
      </div>



      {/* Salary Audit Table */}
      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/50 dark:bg-card/50 backdrop-blur-xl">
        <CardHeader className="bg-muted/10 border-b border-muted/20 px-8 py-6">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3 italic">
             Salary Audit Trails <Badge variant="secondary" className="rounded-md h-6 px-2 font-black uppercase tracking-tighter shadow-sm bg-blue-100/50 text-blue-600">Verified</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/50 dark:bg-muted/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-bold text-foreground py-6 pl-8 uppercase text-[10px] tracking-widest">Period</TableHead>
                <TableHead className="font-bold text-foreground py-6 uppercase text-[10px] tracking-widest">Employee</TableHead>
                <TableHead className="font-bold text-foreground py-6 uppercase text-[10px] tracking-widest text-right">Net Amount</TableHead>
                <TableHead className="font-bold text-foreground text-center py-6 uppercase text-[10px] tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-foreground text-right py-6 pr-8 uppercase text-[10px] tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium">
                    No payout records generated for current selection.
                  </TableCell>
                </TableRow>
              ) : (
                payrolls.map((pay) => (
                  <TableRow key={pay?.id} className="hover:bg-blue-50/30 dark:hover:bg-muted/10 border-b border-muted/10 transition-all group">
                    <TableCell className="font-black py-6 pl-8 text-sm">{pay?.month}</TableCell>
                    <TableCell className="font-bold text-muted-foreground py-6">
                      <div className="flex flex-col">
                        <span>{pay?.Employee?.firstName} {pay?.Employee?.lastName}</span>
                        <span className="text-[10px] italic font-normal">{pay?.Employee?.employeeCode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-blue-600 py-6 text-right text-lg">₹{(pay?.netSalary || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-center py-6">
                      <Badge 
                        onClick={() => canEdit && handleToggleStatus(pay)}
                        className={`rounded-xl px-4 py-1 border-none font-bold shadow-none ${
                        canEdit ? 'cursor-pointer hover:scale-105 transition-transform' : ''
                      } ${
                        pay?.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                      }`}>
                         {pay?.paymentStatus === 'PAID' ? 'Paid' : 'Not paid'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right py-6 pr-8">
                       <div className="flex justify-end gap-2">
                         <Button 
                           onClick={() => setViewingPayroll(pay)}
                           size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:bg-blue-50/50 hover:text-blue-500 rounded-full transition-all"
                         >
                            <Eye className="h-5 w-5" />
                         </Button>
                         <Button 
                           onClick={() => handleDownloadPayslip(pay.id)}
                           size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                         >
                            <Printer className="h-5 w-5" />
                         </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
          className="bg-transparent border-t border-muted/20"
        />
      </Card>

      {/* VIEW MODAL */}
       <Dialog open={!!viewingPayroll} onOpenChange={() => setViewingPayroll(null)}>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-slate-900 p-8 text-white relative">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                       <Wallet className="h-8 w-8" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Salary Breakdown</h2>
                       <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Audit Trail: {viewingPayroll?.month}</p>
                    </div>
                 </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Employee</p>
                        <p className="text-sm font-bold truncate">{viewingPayroll?.Employee?.firstName} {viewingPayroll?.Employee?.lastName}</p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Code</p>
                        <p className="text-sm font-bold">{viewingPayroll?.Employee?.employeeCode}</p>
                     </div>
                  </div>
              </div>

              <div className="p-8 space-y-6 bg-white">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
                       <Badge className={`rounded-xl px-4 py-1 border-none font-bold shadow-none ${
                        viewingPayroll?.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                      }`}>
                         {viewingPayroll?.paymentStatus === 'PAID' ? 'Paid' : 'Not paid'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Salary</span>
                       <span className="font-black text-slate-700">₹{viewingPayroll?.basicSalary?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allowances</span>
                       <span className="font-black text-emerald-600">+ ₹{viewingPayroll?.allowances?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overtime Pay</span>
                       <span className="font-black text-emerald-600">+ ₹{viewingPayroll?.overtimePay?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deductions</span>
                       <span className="font-black text-rose-500">- ₹{viewingPayroll?.deductions?.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-100 flex justify-between items-center">
                    <span className="text-sm font-black text-blue-900 uppercase italic tracking-tighter">Gross Disbursement</span>
                    <span className="text-2xl font-black text-blue-600 italic tracking-tighter">₹{viewingPayroll?.netSalary?.toLocaleString()}</span>
                 </div>

                 <div className="flex gap-3">
                    <Button onClick={() => setViewingPayroll(null)} variant="ghost" className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px]">Close View</Button>
                    <Button onClick={() => handleDownloadPayslip(viewingPayroll.id)} className="flex-1 h-12 rounded-xl bg-primary hover:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest">
                       <Printer className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                 </div>
              </div>
          </DialogContent>
       </Dialog>

        {/* CONFIRMATION DIALOG */}
        <Dialog open={confirmModal.isOpen} onOpenChange={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
           <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
               <div className="flex flex-col items-center text-center space-y-6">
                  <div className={`h-20 w-20 rounded-3xl flex items-center justify-center animate-bounce duration-[2000ms] ${
                    confirmModal.newStatus === 'PAID' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                  }`}>
                     {confirmModal.newStatus === 'PAID' ? <CreditCard className="h-10 w-10" /> : <Wallet className="h-10 w-10" />}
                  </div>
                  
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                        Verify Transaction
                     </h3>
                     <p className="text-sm text-muted-foreground font-medium px-4">
                        Are you sure you want to mark this payment <span className={`font-bold ${confirmModal.newStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>{confirmModal.newStatus === 'PAID' ? 'Paid' : 'Not paid'}</span>?
                     </p>
                  </div>

                  <div className="flex flex-col w-full gap-3 pt-4">
                     <Button 
                        onClick={confirmToggleStatus}
                        className={`h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl border-none ${
                          confirmModal.newStatus === 'PAID' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                     >
                        Confirm Update
                     </Button>
                     <Button 
                        onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                        variant="ghost" 
                        className="h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-muted-foreground"
                     >
                        Keep as {confirmModal.newStatus === 'PAID' ? 'Not paid' : 'Paid'}
                     </Button>
                  </div>
               </div>
           </DialogContent>
        </Dialog>
    </div>
  );
};

export default PayrollList;
