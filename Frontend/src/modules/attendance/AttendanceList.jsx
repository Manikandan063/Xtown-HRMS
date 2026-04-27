import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Trash2,
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  FileDown,
  Download,
  Users,
  Search,
  Filter,
  User
} from 'lucide-react';
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import ManualAttendanceModal from './ManualAttendanceModal';
import SelfieAttendanceModal from './SelfieAttendanceModal';
import CheckpointList from './Checkpoints/CheckpointList';
import { Pagination } from '@/components/ui/pagination';
import PageLoader from '@/components/ui/PageLoader';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AttendanceList = () => {
  const { canEdit } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState('ledger'); // 'ledger' or 'checkpoints'
  
  const [company, setCompany] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const [reportData, companyData] = await Promise.all([
        apiFetch(`/attendance/report?page=${page}&limit=${limit}&search=${searchQuery}&status=${status}&startDate=${startDate}&endDate=${endDate}`),
        apiFetch('/companies')
      ]);
      setLogs(reportData?.data || []);
      setTotalPages(Math.ceil((reportData?.total || 0) / limit) || 1);
      
      const comp = Array.isArray(companyData) ? companyData[0] : companyData?.data?.[0];
      setCompany(comp);
    } catch (error) {
      toast.error(error.message || 'Failed to sync attendance system');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, status, startDate, endDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Reset to first page when searching
  useEffect(() => {
    setPage(1);
  }, [searchQuery, status, startDate, endDate]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const syncBiometrics = async () => {
    const ip = window.prompt("Enter Biometric Terminal IP Address:", "192.168.1.201");
    if (!ip) return;
    
    try {
      toast.loading('Engaging biometric synchronization sequence...', { id: 'sync' });
      await apiFetch('/attendance/sync-zk', {
        method: 'POST',
        body: JSON.stringify({ ip, port: 4370 })
      });
      toast.success('Synchronization complete!', { id: 'sync' });
      fetchAttendance();
    } catch (error) {
      toast.error(error.message || 'Synchronization failed.', { id: 'sync' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you certain you wish to purge this attendance node? This action cannot be reversed.")) return;
    try {
      await apiFetch(`/attendance/${id}`, { method: 'DELETE' });
      toast.success("Record purged from ledger.");
      fetchAttendance();
    } catch (error) {
      toast.error(error.message || "Purge operation failed.");
    }
  };



  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return 'bg-emerald-500/10 text-emerald-600';
      case 'HALF_DAY': return 'bg-amber-500/10 text-amber-600';
      case 'ABSENT': return 'bg-rose-500/10 text-rose-600';
      case 'LEAVE':
      case 'ON_LEAVE': return 'bg-blue-500/10 text-blue-600';
      case 'HOLIDAY': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredLogs = logs; // Search now handled by backend

  if (loading) {
    return <PageLoader message="Decrypting Attendance Ledger..." />;
  }

  return (
    <TooltipProvider>
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Employee Attendance</h1>
          <div className="flex items-center gap-4">
              <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-70 italic flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Month: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
            {company && (
              <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 font-black text-[10px] uppercase tracking-tighter px-4 py-1 flex gap-2 italic">
                <Clock className="h-3 w-3" /> Shift Hours: {formatTime(company.workingStartTime)} - {formatTime(company.workingEndTime)}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-11 px-6 border-border shadow-sm font-black uppercase text-[10px] tracking-widest gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          {canEdit && (
            <>
              <Button onClick={syncBiometrics} className="rounded-2xl h-11 px-6 shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 font-black uppercase text-[10px] tracking-widest gap-2">
                <FileDown className="h-4 w-4" /> Sync Device
              </Button>

              <ManualAttendanceModal onSuccess={fetchAttendance} />
            </>
          )}
          <SelfieAttendanceModal onSuccess={fetchAttendance} />
        </div>
      </div>

      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-2xl w-fit border border-border">
        <Button 
          variant={view === 'ledger' ? 'default' : 'ghost'} 
          onClick={() => setView('ledger')}
          className="rounded-xl h-9 px-6 font-black uppercase text-[10px] tracking-widest"
        >
          Attendance
        </Button>
        {canEdit && (
          <Button 
            variant={view === 'checkpoints' ? 'default' : 'ghost'} 
            onClick={() => setView('checkpoints')}
            className="rounded-xl h-9 px-6 font-black uppercase text-[10px] tracking-widest gap-2"
          >
            <MapPin className="h-3 w-3" /> Checkpoints
          </Button>
        )}
      </div>

      {view === 'checkpoints' ? (
        <CheckpointList />
      ) : (
        <>
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search employee..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-11 h-12 border-none bg-muted rounded-2xl font-bold italic"
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "ghost"} 
            onClick={() => setShowFilters(!showFilters)}
            className={cn("h-12 px-6 rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest", showFilters ? "" : "bg-muted text-foreground")}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Filters"}
          </Button>
          {(status !== 'ALL' || startDate || endDate || searchQuery) && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery('');
                setStatus('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
            >
              Reset
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-6 rounded-[2rem] border border-border animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 rounded-2xl border-none bg-card shadow-sm font-bold">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-card">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="HALF_DAY">Half Day</SelectItem>
                  <SelectItem value="LEAVE">On Leave</SelectItem>
                  <SelectItem value="HOLIDAY">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">From Date</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="h-12 rounded-2xl border-none bg-card shadow-sm font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">To Date</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="h-12 rounded-2xl border-none bg-card shadow-sm font-bold"
              />
            </div>
          </div>
        )}
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/70 backdrop-blur-xl ring-1 ring-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black py-8 pl-10 uppercase text-[10px] tracking-widest text-muted-foreground">Date</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-widest text-muted-foreground">Employee</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-widest text-muted-foreground text-center">In / Out Time</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-widest text-muted-foreground text-center">Status</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-widest text-muted-foreground text-center">Method</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-widest text-muted-foreground text-right">Total Hours</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-widest text-muted-foreground text-right pr-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-32">
                     <div className="flex flex-col items-center gap-4 opacity-20">
                        <Users className="h-16 w-16" />
                        <p className="font-black uppercase tracking-widest text-xs italic">No attendance records found.</p>
                     </div>
                  </TableCell>
                </TableRow>
              ) : (
                 filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-primary/5 border-b border-border transition-all group">
                    <TableCell className="py-8 pl-10 font-bold text-[11px] text-muted-foreground">
                       {new Date(log.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="py-8">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-black text-xs text-foreground border border-border uppercase overflow-hidden">
                             {log.Employee?.profileImage ? (
                                <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080'}${log.Employee.profileImage}`} alt="" className="w-full h-full object-cover" />
                             ) : (
                                log.Employee?.firstName?.charAt(0)
                             )}
                          </div>
                          <div>
                             <h4 className="font-black text-foreground tracking-tighter">{log.Employee?.firstName} {log.Employee?.lastName}</h4>
                             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{log.Employee?.employeeCode}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-8 text-center">
                       <div className="flex items-center justify-center gap-3 font-mono text-xs font-bold">
                          <span className="bg-emerald-500/10 px-3 py-1.5 rounded-xl text-emerald-600 border border-emerald-500/20">{log.firstIn ? new Date(log.firstIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                          <span className="text-border font-light">•</span>
                          <span className="bg-muted px-3 py-1.5 rounded-xl border border-border">{log.lastOut ? new Date(log.lastOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center py-8">
                       <Badge className={`${getStatusColor(log.status)} border-none font-black text-[9px] px-4 py-1.5 uppercase tracking-widest shadow-none rounded-xl`}>
                          {log.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center py-8">
                       <div className="flex items-center justify-center gap-2">
                          {log.AttendanceLogs?.some(al => al.method === 'Selfie') && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-primary/20 text-primary">
                                  <ImageIcon className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[400px] rounded-[2rem] bg-card border-none p-4">
                                <DialogHeader>
                                  <DialogTitle className="text-sm font-black uppercase tracking-widest italic">Selfie Verification</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {log.AttendanceLogs?.filter(al => al.method === 'Selfie').map(al => (
                                    <div key={al.id} className="space-y-2">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Live Selfie</p>
                                          <div className="aspect-square rounded-2xl overflow-hidden border border-border">
                                            <img 
                                              src={al.imageUrl?.startsWith('data:') ? al.imageUrl : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace('127.0.0.1', window.location.hostname)}${al.imageUrl}`} 
                                              className="w-full h-full object-cover scale-x-[-1]" 
                                              alt="Selfie"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full w-full bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broken Selfie</div>';
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 ml-1">Profile Master</p>
                                          <div className="aspect-square rounded-2xl overflow-hidden border border-emerald-500/20 bg-muted flex items-center justify-center">
                                            {log.Employee?.profileImage ? (
                                              <img 
                                                src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace('127.0.0.1', window.location.hostname)}${log.Employee.profileImage}`} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.style.display = 'none';
                                                  e.target.parentElement.innerHTML = log.Employee?.firstName?.charAt(0) || 'U';
                                                }}
                                              />
                                            ) : (
                                              <User className="h-8 w-8 text-muted-foreground/30" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between px-2">
                                        <Badge variant="outline" className="text-[10px] font-black uppercase italic tracking-tighter rounded-lg border-primary/10">
                                          Punch Marker
                                        </Badge>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          <span className="text-[10px] font-bold">{al.latitude.toFixed(4)}, {al.longitude.toFixed(4)}</span>
                                        </div>
                                      </div>
                                      {al.approvalStatus === 'PENDING' && canEdit && (
                                        <div className="flex gap-2 pt-2">
                                          <Button 
                                            size="sm" 
                                            className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-black text-[9px] uppercase tracking-widest"
                                            onClick={async () => {
                                              try {
                                                await apiFetch(`/attendance/logs/${al.id}/approval`, {
                                                  method: 'PUT',
                                                  body: JSON.stringify({ status: 'APPROVED' })
                                                });
                                                toast.success("Attendance approved.");
                                                fetchAttendance();
                                              } catch (err) {
                                                toast.error(err.message);
                                              }
                                            }}
                                          >
                                            Approve
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="flex-1 h-8 rounded-lg border-rose-500/20 text-rose-600 font-black text-[9px] uppercase tracking-widest hover:bg-rose-500/5"
                                            onClick={async () => {
                                              try {
                                                await apiFetch(`/attendance/logs/${al.id}/approval`, {
                                                  method: 'PUT',
                                                  body: JSON.stringify({ status: 'REJECTED' })
                                                });
                                                toast.success("Attendance rejected.");
                                                fetchAttendance();
                                              } catch (err) {
                                                toast.error(err.message);
                                              }
                                            }}
                                          >
                                            Reject
                                          </Button>
                                        </div>
                                      )}
                                      {al.approvalStatus !== 'PENDING' && (
                                        <div className="pt-2">
                                           <Badge className={cn(
                                             "w-full justify-center rounded-lg text-[9px] font-black uppercase tracking-widest py-1",
                                             al.approvalStatus === 'APPROVED' || al.approvalStatus === 'AUTO' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                           )}>
                                              {al.approvalStatus}
                                           </Badge>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {log.AttendanceLogs?.some(al => al.method === 'Selfie') ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center",
                                    log.AttendanceLogs?.every(al => al.locationStatus === 'VALID') 
                                      ? "bg-emerald-500/10 text-emerald-600" 
                                      : "bg-amber-500/10 text-amber-600"
                                  )}>
                                    {log.AttendanceLogs?.every(al => al.locationStatus === 'VALID') 
                                      ? <CheckCircle2 className="h-4 w-4" /> 
                                      : <AlertCircle className="h-4 w-4" />}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card border border-border shadow-2xl p-3 rounded-xl">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                    {log.AttendanceLogs?.every(al => al.locationStatus === 'VALID') 
                                      ? "Geo-Verified" 
                                      : "Flagged: Outside Zone"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge variant="ghost" className="text-[9px] font-bold uppercase opacity-30 tracking-tighter">Biometric</Badge>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="text-right py-8">
                       <div className="flex flex-col items-end">
                          <span className="font-black text-foreground text-sm">{log.totalHours?.toFixed(1) || '0.0'} hrs</span>
                          {log.overtimeHours > 0 && <span className="text-[9px] font-black text-emerald-500 uppercase">+{log.overtimeHours.toFixed(1)} OT</span>}
                       </div>
                    </TableCell>
                    <TableCell className="text-right py-8 pr-10">
                       <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <>
                              <ManualAttendanceModal 
                                editMode={true} 
                                initialLog={log} 
                                onSuccess={fetchAttendance} 
                                trigger={
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleDelete(log.id)}
                                className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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
        />
      </Card>
      </>
      )}
    </div>
    </TooltipProvider>
  );
};

export default AttendanceList;
