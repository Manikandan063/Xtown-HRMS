import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Wallet, 
  CalendarCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  PieChart as PieIcon,
  BarChart3 as BarIcon,
  Building2,
  Zap,
  Clock,
  IndianRupee,
  Layers,
  ShieldCheck,
  MessageCircle,
  Briefcase,
  IdCard,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { apiFetch } from '@/services/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PageLoader from '@/components/ui/PageLoader';
import SelfieAttendanceModal from '../attendance/SelfieAttendanceModal';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = ({ title }) => {
  const { isSuperAdmin, isAdmin, isEmployee, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [supportMessages, setSupportMessages] = useState([]);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const format12H = (timeString) => {
    if (!timeString) return '--:--';
    const [h, m] = timeString.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiFetch('/dashboard/summary');
      setData(result?.data || result);
    } catch (error) {
      toast.error('Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await apiFetch('/companies');
      setCompanies(res.data || []);
    } catch (e) {
      console.error('Failed to fetch companies');
    }
  }, []);

  const fetchSupportMessages = useCallback(async () => {
    try {
      const res = await apiFetch('/support/forwarded');
      if (res.status === 'success') setSupportMessages(res.data);
    } catch (e) {
      console.error('Failed to fetch support messages');
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    if (isSuperAdmin) {
      fetchCompanies();
      fetchSupportMessages();
    }
  }, [fetchSummary, isSuperAdmin, fetchCompanies, fetchSupportMessages]);

  const handleReply = async (receiverId) => {
    const text = replyText[receiverId];
    if (!text?.trim()) return;
    try {
      toast.loading('Sending reply...', { id: 'reply' });
      await apiFetch('/support/reply', {
        method: 'POST',
        body: { receiverId, message: text }
      });
      toast.success('Reply sent!', { id: 'reply' });
      setReplyText(prev => ({ ...prev, [receiverId]: '' }));
      fetchSupportMessages();
    } catch (e) {
      toast.error('Failed to send reply');
    }
  };

  if (loading) {
    return <PageLoader message="Synchronizing High-Level Analytics..." />;
  }

  if (!data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <PieIcon className="h-12 w-12 text-slate-300" />
        <p className="text-muted-foreground font-bold italic">No dashboard data available.</p>
        <Button onClick={fetchSummary} variant="ghost" className="text-primary font-bold">Retry Sync</Button>
      </div>
    );
  }

  const handleViewPayslip = async (payrollId) => {
    try {
      toast.loading('Opening payslip...', { id: 'payslip' });
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api'}/payroll/payslip/${payrollId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch payslip');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.success('Ready!', { id: 'payslip' });
    } catch (error) {
      toast.error('Failed to view payslip');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-foreground">
            {title || (isSuperAdmin ? 'Super Admin Dashboard' : (isEmployee ? `Welcome, ${data.personalData?.firstName || user?.name}` : 'Manager Dashboard'))}
          </h1>
          <p className="text-muted-foreground font-medium italic opacity-70">
            {isEmployee ? 'Your personal work hub and career overview.' : 'Manage your companies and sub-admins from here.'}
          </p>
        </div>
        
        <div className="bg-card text-foreground rounded-[2rem] px-6 py-3 shadow-2xl flex flex-col items-end border border-border transition-all duration-500">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
              Live System Time
           </div>
           <div className="text-2xl font-black tracking-tighter tabular-nums text-foreground">
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
           </div>
           <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest leading-tight italic">
              {time.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
           </p>
        </div>
      </div>

      {isEmployee ? (
        <div className="space-y-8 animate-in fade-in duration-700">
          {/* Attendance Punch Card (Dark Theme) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 p-10 rounded-[2.5rem] text-white overflow-hidden relative group shadow-2xl">
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                 <Clock className="h-40 w-40" />
              </div>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Current Shift Protocol</span>
                 </div>
                 <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">Attendance Node</h3>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm italic">Synchronize your identity with the geofenced biometric node.</p>
                 <div className="pt-4">
                    <SelfieAttendanceModal onSuccess={fetchSummary} />
                 </div>
              </div>
              <div className="flex items-center justify-end relative z-10">
                 <div className="text-right p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Standard Reference</p>
                    <p className="text-2xl font-black italic tracking-tighter text-white">
                       {data.personalData?.Shift?.startTime ? format12H(data.personalData.Shift.startTime) : '09:30 AM'} — {data.personalData?.Shift?.endTime ? format12H(data.personalData.Shift.endTime) : '06:30 PM'}
                    </p>
                    <Badge variant="outline" className="mt-2 border-emerald-500/30 text-emerald-400 text-[9px] uppercase font-black">Biometric Sync Enabled</Badge>
                 </div>
              </div>
          </div>

          {/* Mid Section: Leave Balances & Quick Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="md:col-span-2 border-none shadow-xl rounded-2xl bg-card/60 backdrop-blur-md overflow-hidden ring-1 ring-border">
               <CardHeader className="flex flex-row items-center gap-3 border-b border-border px-6 py-5">
                 <CalendarCheck className="h-5 w-5 text-emerald-500" />
                 <CardTitle className="text-lg font-bold">Leave Balances <span className="text-[10px] font-black uppercase text-muted-foreground/40 ml-2">Current Allocation</span></CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {(data.leaveBalances || []).slice(0, 4).map((lb, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase">{lb.leaveType?.leaveName || 'Leave'}</p>
                        <p className="text-2xl font-black tabular-nums">
                          {Number(lb.balance) - Number(lb.used)} <span className="text-muted-foreground/40 font-bold text-sm">Days Left</span>
                        </p>
                     </div>
                   ))}
                   {(!data.leaveBalances && !data.leaveBalance) && (
                     <p className="col-span-4 text-center py-6 text-muted-foreground italic text-sm">No leave records initialized.</p>
                   )}
                 </div>
               </CardContent>
             </Card>

             <Card className="border-none shadow-xl rounded-[2rem] bg-indigo-600 text-white p-8 relative overflow-hidden">
                <TrendingUp className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10 rotate-12" />
                <div className="relative z-10 space-y-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Designation</p>
                     <h3 className="text-2xl font-black tracking-tight leading-none italic">
                       {typeof data.personalData?.designation === 'object' 
                         ? data.personalData?.designation?.name 
                         : (data.personalData?.designation || 'Specialist')}
                     </h3>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Employee ID</p>
                        <p className="text-xl font-black tracking-tighter">{data.personalData?.employeeCode || 'N/A'}</p>
                     </div>
                     <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Layers className="h-5 w-5 opacity-40" />
                     </div>
                  </div>
                </div>
             </Card>
          </div>

          {/* Recent Payroll */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card overflow-hidden ring-1 ring-border">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-10 py-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-xl font-black italic tracking-tighter uppercase leading-none text-foreground">Recent Payslips</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Verified Payment History</p>
                </div>
              </div>
              <Button onClick={() => navigate('/employee/payroll')} variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 border-none">
                      <TableHead className="pl-10 h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Billing Month</TableHead>
                      <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Net Payable</TableHead>
                      <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right pr-10 h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.recentPayrolls || []).map((pay) => (
                      <TableRow key={pay.id} className="hover:bg-muted/20 transition-colors border-border">
                        <TableCell className="pl-10 py-6 font-black text-foreground">
                           <div className="flex flex-col">
                              <span>{pay.month} {pay.year}</span>
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">Verified Archive</span>
                           </div>
                        </TableCell>
                        <TableCell className="font-black text-blue-600 text-lg">₹{pay.netSalary.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                             <span className="font-black text-[10px] uppercase tracking-widest text-emerald-600">PAID</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-10">
                          <div className="flex items-center justify-end gap-3">
                             <Button size="sm" onClick={() => handleViewPayslip(pay.id)} variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest">View</Button>
                             <Button size="sm" onClick={() => handleViewPayslip(pay.id)} className="rounded-xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20">Download</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data.recentPayrolls || data.recentPayrolls.length === 0) && (
                      <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic font-medium">No operational payroll history detected.</TableCell></TableRow>
                    )}
                  </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Admin / SuperAdmin Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(isSuperAdmin ? [
              { label: 'Total Companies', value: data.totalCompanies || '0', icon: Building2, color: 'bg-blue-500/10 text-blue-600' },
              { label: 'Active Subscriptions', value: data.activeSubscriptions || '0', icon: Zap, color: 'bg-emerald-500/10 text-emerald-600' },
              { label: 'Expired / Inactive', value: data.expiredSubscriptions || '0', icon: Clock, color: 'bg-rose-500/10 text-rose-600' },
              { label: 'Total Net Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-indigo-500/10 text-indigo-600' }
            ] : [
              { label: 'Total Employees', value: data.totalEmployees || '0', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
              { label: 'Presence Today', value: data.presentToday || '0', icon: CalendarCheck, color: 'bg-emerald-500/10 text-emerald-600' },
              { label: 'On Leave', value: data.onLeaveToday || '0', icon: Wallet, color: 'bg-rose-500/10 text-rose-600' },
              { label: 'Monthly Payout', value: `₹${(data.payrollThisMonth || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-indigo-500/10 text-indigo-600' }
            ]).map((stat, i) => (
              <Card key={i} className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-card/70 backdrop-blur-xl ring-1 ring-border">
                <CardContent className="p-6">
                  <div className={`p-3 rounded-2xl ${stat.color} w-fit mb-4`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isSuperAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <Card className="border-none shadow-xl rounded-3xl bg-card/60 backdrop-blur-md ring-1 ring-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg font-bold">Employee Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.employeeDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {(data.employeeDistribution || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${100 - (index * 15)}%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-3xl bg-card/60 backdrop-blur-md ring-1 ring-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg font-bold">Attendance Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.attendanceTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {isSuperAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-card/60 backdrop-blur-md overflow-hidden ring-1 ring-border">
                 <CardHeader className="p-8 border-b border-border">
                    <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-foreground">Support Inquiries</CardTitle>
                 </CardHeader>
                 <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                    <Table>
                       <TableBody>
                          {supportMessages.length > 0 ? supportMessages.map((msg, i) => (
                             <TableRow key={i} className="border-border hover:bg-muted/20 transition-colors">
                                <TableCell className="pl-8 py-6">
                                   <div className="flex flex-col">
                                      <span className="font-black text-foreground italic">{msg.sender?.name || 'Admin'}</span>
                                      <span className="text-[10px] text-muted-foreground font-bold uppercase">{msg.sender?.email}</span>
                                      <p className="mt-3 text-xs font-medium text-muted-foreground bg-muted/30 p-4 rounded-2xl border border-border/50">{msg.message}</p>
                                      <div className="flex items-center gap-3 mt-4">
                                         <Input 
                                            placeholder="Type reply..."
                                            value={replyText[msg.senderId] || ''}
                                            onChange={e => setReplyText(prev => ({ ...prev, [msg.senderId]: e.target.value }))}
                                            className="h-10 rounded-xl bg-muted border-none text-[11px] font-bold"
                                         />
                                         <Button size="sm" onClick={() => handleReply(msg.senderId)} className="h-10 px-6 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest">Reply</Button>
                                      </div>
                                   </div>
                                </TableCell>
                             </TableRow>
                          )) : (
                             <TableRow><TableCell className="text-center py-20 font-black uppercase text-muted-foreground">No pending inquiries</TableCell></TableRow>
                          )}
                       </TableBody>
                    </Table>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[2.5rem] bg-card text-foreground overflow-hidden ring-1 ring-border h-fit">
                 <CardHeader className="p-8 border-b border-border">
                    <CardTitle className="text-lg font-black italic tracking-tighter uppercase text-primary">Company List</CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <Table>
                       <TableBody>
                          {companies.slice(0, 8).map((comp, i) => (
                             <TableRow key={i} className="border-border hover:bg-muted/20 transition-colors">
                                <TableCell className="font-bold text-xs py-5 pl-8 italic">{comp.companyName}</TableCell>
                                <TableCell>
                                   <Badge variant={comp.isActive ? "success" : "destructive"} className="text-[8px]">{comp.isActive ? 'Active' : 'Inactive'}</Badge>
                                </TableCell>
                                <TableCell className="text-right pr-8 font-black text-primary text-xs">{comp.subscriptionPlan || 'BASIC'}</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
