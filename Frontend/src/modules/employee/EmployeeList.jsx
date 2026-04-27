import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Edit2, Trash2, MoreVertical, Eye, Loader2, UserMinus, UserPlus, Filter, ChevronDown, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import EmployeeModal from './EmployeeModal';
import { Pagination } from '@/components/ui/pagination';
import PageLoader from '@/components/ui/PageLoader';

const EmployeeList = () => {
  const { canEdit } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('registry');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        apiFetch(`/employees?page=${page}&limit=${limit}&search=${searchQuery}&departmentId=${selectedDept}`),
        apiFetch('/departments')
      ]);
      
      setEmployees(empRes.data || []);
      setTotalPages(Math.ceil((empRes.total || 0) / limit) || 1);
      
      const deptData = deptRes.data || deptRes || [];
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, selectedDept]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page when filtering
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDept]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this employee? This will restrict their access.')) return;
    try {
      await apiFetch(`/employees/${id}`, { method: 'DELETE' });
      toast.success('Employee deactivated successfully');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to deactivate employee');
    }
  };

  const handleToggleResignation = async (id) => {
    try {
      await apiFetch(`/employees/${id}/toggle-resignation`, { method: 'PATCH' });
      toast.success('Resignation access updated');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update resignation access');
    }
  };

  const filteredEmployees = employees;


  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Employee Management</h1>
          <p className="text-muted-foreground font-medium italic opacity-70 text-sm">Manage your company's employees and their profiles.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-muted/80 backdrop-blur-md rounded-2xl w-fit border border-border shadow-inner">
         <Button 
            variant="ghost" 
            onClick={() => setActiveTab('registry')}
            className={cn("h-10 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all", activeTab === 'registry' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-primary")}
         >
            Employee List
         </Button>
         <Button 
            variant="ghost" 
            onClick={() => setActiveTab('onboard')}
            className={cn("h-10 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all", activeTab === 'onboard' ? "bg-card text-emerald-600 shadow-sm" : "text-muted-foreground hover:text-emerald-600")}
         >
            Add New Employee
         </Button>
      </div>

      {activeTab === 'registry' ? (
        <>
          <div className="bg-white/60 backdrop-blur-md p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              <Input 
                placeholder="Search by name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 border-none bg-slate-100/50 rounded-xl font-bold" 
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-11 px-6 rounded-xl bg-slate-100/50 hover:bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest flex items-center gap-3 border-none shadow-none">
                   <Filter className="h-4 w-4" />
                   {selectedDept === 'ALL' ? 'All Departments' : departments.find(d => d.id === selectedDept)?.name || 'Filtered'}
                   <ChevronDown className="h-4 w-4 opacity-30" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl">
                 <DropdownMenuItem 
                    onClick={() => setSelectedDept('ALL')}
                    className="flex justify-between items-center py-2.5 px-3 rounded-xl cursor-pointer font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:text-primary transition-all"
                 >
                    All Departments
                    {selectedDept === 'ALL' && <Check className="h-3 w-3" />}
                 </DropdownMenuItem>
                 <div className="h-px bg-slate-100 my-1 mx-2" />
                 {departments.map((dept) => (
                    <DropdownMenuItem 
                      key={dept.id}
                      onClick={() => setSelectedDept(dept.id)}
                      className="flex justify-between items-center py-2.5 px-3 rounded-xl cursor-pointer font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:text-primary transition-all"
                    >
                      <div className="flex flex-col">
                        <span>{dept.name}</span>
                        <span className="text-[8px] opacity-40">{dept.code}</span>
                      </div>
                      {selectedDept === dept.id && <Check className="h-3 w-3" />}
                    </DropdownMenuItem>
                 ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-white/70 dark:bg-card/70 backdrop-blur-md rounded-2xl">
            <CardHeader className="border-b px-6 py-5 bg-muted/10">
              <CardTitle className="text-xl font-bold tracking-tight">All Employees</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <PageLoader message="Synchronizing Personnel Registry..." />
              ) : (
                <Table>
                  <TableHeader className="bg-muted/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-bold text-foreground pl-6">Employee ID</TableHead>
                      <TableHead className="font-bold text-foreground">Employee Details</TableHead>
                      <TableHead className="font-bold text-foreground">Department</TableHead>
                      <TableHead className="font-bold text-foreground">Status</TableHead>
                      <TableHead className="font-bold text-foreground text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-semibold uppercase tracking-tighter opacity-50">
                          No matching records in the system.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <TableRow key={emp?.id} className="group hover:bg-muted/30 transition-colors border-muted/10">
                          <TableCell className="font-black text-primary text-[10px] tracking-widest uppercase pl-6">
                            {emp?.employeeCode}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <EmployeeModal 
                                  employee={emp} 
                                  onSuccess={fetchData}
                                  mode="view"
                                  trigger={
                                    <div className="flex flex-col cursor-pointer group/name">
                                      <span className="font-bold text-sm group-hover/name:text-primary transition-all underline-offset-4 group-hover/name:underline decoration-primary/30 decoration-2">{emp?.firstName} {emp?.lastName}</span>
                                      <span className="text-[10px] text-primary/70 font-bold uppercase tracking-tight">{emp?.designation?.name || 'Associate'}</span>
                                      <span className="text-[9px] text-muted-foreground italic">{emp?.officialEmail}</span>
                                    </div>
                                  }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs font-bold uppercase tracking-tighter">
                             <div className="flex flex-col">
                               <span className="text-primary text-[9px] font-black">{emp?.department?.code || 'DEPT'}</span>
                               <span>{emp?.department?.name || 'Operations'}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Badge 
                                className={`rounded-full px-3 py-0.5 border-none font-black text-[9px] uppercase tracking-widest ${
                                  emp?.status === 'ACTIVE' 
                                    ? 'bg-emerald-500/10 text-emerald-600' 
                                    : 'bg-rose-500/10 text-rose-600'
                                }`}
                              >
                                {emp?.status || 'ACTIVE'}
                              </Badge>
                              {emp?.canResign && (
                                <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5" title="Resignation Access Enabled">
                                  <UserMinus className="h-2.5 w-2.5 mr-1" /> Can Resign
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white shadow-sm border border-transparent hover:border-muted/50">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-2xl p-2 border-none backdrop-blur-xl bg-white/90">
                                <EmployeeModal 
                                    employee={emp} 
                                    onSuccess={fetchData}
                                    mode="view"
                                    trigger={
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex gap-3 py-3 rounded-xl focus:bg-primary/5 cursor-pointer font-bold text-xs uppercase transition-all">
                                            <Eye className="h-4 w-4 text-primary" /> View Details
                                        </DropdownMenuItem>
                                    }
                                />
                                  {canEdit && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => handleToggleResignation(emp.id)}
                                        className={cn("flex gap-3 py-3 rounded-xl focus:bg-amber-50 cursor-pointer font-bold text-xs uppercase", emp.canResign ? "text-amber-600" : "text-slate-600")}
                                      >
                                        {emp.canResign ? <UserPlus className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                                        {emp.canResign ? "Disable Resignation" : "Enable Resignation"}
                                      </DropdownMenuItem>

                                      <DropdownMenuItem 
                                        onClick={() => handleDelete(emp.id)}
                                        className="flex gap-3 py-3 rounded-xl focus:bg-red-50 text-red-600 cursor-pointer font-bold text-xs uppercase"
                                      >
                                        <UserMinus className="h-4 w-4" /> Deactivate Account
                                      </DropdownMenuItem>
                                    </>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              loading={loading}
            />
          </Card>
        </>
      ) : (
        <Card className="border-none shadow-sm rounded-3xl p-12 bg-card flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-500 ring-1 ring-border">
           <div className="h-24 w-24 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-inner mb-2 border border-indigo-500/10">
              <UserPlus className="h-10 w-10" />
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Add New Employee</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto italic font-medium">Ready to add a new employee to the company? Enter their details below.</p>
           </div>
           {canEdit && <EmployeeModal onSuccess={() => { fetchData(); setActiveTab('registry'); }} />}
        </Card>
      )}
    </div>
  );
};

export default EmployeeList;
