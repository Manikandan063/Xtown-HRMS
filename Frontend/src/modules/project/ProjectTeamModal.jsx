import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  X, 
  Loader2, 
  Briefcase,
  Shield,
  Activity
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const ProjectTeamModal = ({ project, trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [role, setRole] = useState('Member');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, employeesRes] = await Promise.all([
        apiFetch(`/project/${project.id}/members`),
        apiFetch('/employees?limit=1000')
      ]);
      setMembers(membersRes?.data || []);
      setEmployees(employeesRes?.data || employeesRes || []);
    } catch (e) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const handleAssign = async () => {
    if (!selectedEmployee) return toast.error('Choose an employee first');
    try {
      setLoading(true);
      await apiFetch('/project/assign', {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.id,
          employeeId: selectedEmployee,
          role
        })
      });
      toast.success('Member added to team');
      setSelectedEmployee('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Could not add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (employeeId) => {
    if (!window.confirm('Remove this person from the team?')) return;
    try {
       setLoading(true);
       await apiFetch(`/project/${project.id}/members/${employeeId}`, {
          method: 'DELETE'
       });
       toast.success('Member removed from team');
       fetchData();
    } catch (e) {
       toast.error('Could not remove member');
    } finally {
       setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(e => 
    !members.some(m => m.id === e.id) && 
    (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px] h-[70vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white">
        <DialogHeader className="p-8 bg-slate-50/50 border-b">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                 <Users className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Team Members</DialogTitle>
                <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic opacity-70">Project: {project.projectName}</DialogDescription>
              </div>
           </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-8 space-y-6">
           {/* Assignment Section */}
           <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 italic">Add New Member</h4>
              <div className="flex gap-3">
                 <div className="flex-1">
                    <select 
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full h-11 bg-white border-none rounded-xl px-4 text-xs font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                       <option value="">Choose Employee...</option>
                       {filteredEmployees.map(e => (
                         <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
                       ))}
                    </select>
                 </div>
                 <Input 
                   placeholder="Role (Ex: Manager)" 
                   value={role}
                   onChange={e => setRole(e.target.value)}
                   className="w-32 h-11 border-none bg-white rounded-xl text-xs font-bold ring-1 ring-slate-200"
                 />
                 <Button onClick={handleAssign} disabled={loading} className="h-11 rounded-xl px-6 bg-slate-900 font-black uppercase text-[10px] tracking-widest text-white shadow-lg shadow-slate-200">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                 </Button>
              </div>
           </div>

           {/* Active Members List */}
           <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-2">Active Team</h4>
              {members.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground italic font-medium opacity-30 text-sm">No members assigned to this project.</div>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] uppercase text-slate-500 overflow-hidden">
                           {m.profileImage ? <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080'}${m.profileImage}`} alt="" className="w-full h-full object-cover" /> : (m.firstName ? m.firstName[0] : 'U')}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900 tracking-tight">{m.firstName} {m.lastName}</p>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{m.employeeCode}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-lg border-indigo-100 bg-indigo-50/50 text-indigo-600 font-black text-[9px] px-3 py-1 italic uppercase">{m.EmployeeProject?.role || 'Member'}</Badge>
                        <Button 
                          onClick={() => handleRemove(m.id)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 transition-all"
                        >
                           <X className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTeamModal;

